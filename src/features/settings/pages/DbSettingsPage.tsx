import { Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { useRef, useState } from 'react';

const BACKUP_MANIFEST_FILE = 'manifest.json';
const BACKUP_LOCAL_STORAGE_FILE = 'local-storage.json';
const MAX_BACKUP_FILE_BYTES = 64 * 1024 * 1024;
const MAX_RESTORABLE_TEXT_LENGTH = 32 * 1024 * 1024;

type MigrationBackup = {
  version?: number;
  localStorage?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

const RESTORABLE_STORAGE_KEY_PREFIXES = [
  'xinyuexia_',
  'workbench_',
  'materials:',
  'current_',
  'concept_',
  'novel_',
  'script_editor_',
  'sev2_',
];
const RESTORABLE_STORAGE_KEYS = new Set([
  'materials',
  'materials_data_v1',
  'concept_library_ai_request_log_groups',
]);
const BLOCKED_STORAGE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const SECRET_VALUE_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+[A-Za-z0-9._-]{12,})\b/g;

function isSensitiveFieldName(name: string) {
  const normalized = name.replace(/[-_\s]/g, '').toLowerCase();
  return (
    normalized.includes('secret') ||
    normalized.includes('token') ||
    normalized.includes('password') ||
    normalized.includes('authorization') ||
    normalized === 'apikey' ||
    normalized === 'xapikey' ||
    normalized === 'privatekey' ||
    normalized === 'accesskey' ||
    normalized === 'accesskeyid' ||
    normalized === 'accesskeysecret'
  );
}

function redactSensitiveJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactSensitiveJsonValue(item));
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? value.replace(SECRET_VALUE_PATTERN, '') : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, isSensitiveFieldName(key) ? '' : redactSensitiveJsonValue(item)]),
  );
}

function sanitizeStoredValue(key: string, value: unknown) {
  const text = String(value ?? '');
  if (isSensitiveFieldName(key)) return '';

  try {
    return JSON.stringify(redactSensitiveJsonValue(JSON.parse(text)));
  } catch {
    return text.replace(SECRET_VALUE_PATTERN, '');
  }
}

export function isRestorableLocalStorageKey(key: string) {
  if (!key || BLOCKED_STORAGE_KEYS.has(key)) return false;
  return RESTORABLE_STORAGE_KEYS.has(key) || RESTORABLE_STORAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function filterRestorableLocalStorageData(data: Record<string, unknown>) {
  const next: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!isRestorableLocalStorageKey(key)) return;
    next[key] = String(value ?? '');
  });
  return next;
}

function assertRestorableDataSize(data: Record<string, string>) {
  const totalLength = Object.entries(data).reduce((total, [key, value]) => total + key.length + value.length, 0);
  if (totalLength > MAX_RESTORABLE_TEXT_LENGTH) {
    throw new Error('备份内容超过本地存储可安全恢复的大小，请拆分作品或清理大型图片后重试。');
  }
}

export function sanitizeLocalStorageBackup(data: Record<string, unknown>) {
  const next: Record<string, string> = {};
  Object.entries(filterRestorableLocalStorageData(data)).forEach(([key, value]) => {
    next[key] = sanitizeStoredValue(key, value);
  });
  return next;
}

export function replaceRestorableLocalStorageData(data: Record<string, unknown>) {
  const next = filterRestorableLocalStorageData(data);
  assertRestorableDataSize(next);
  const previous = filterRestorableLocalStorageData(readAllLocalStorage());
  const replace = (snapshot: Record<string, string>) => {
    Object.keys(readAllLocalStorage()).forEach((key) => {
      if (isRestorableLocalStorageKey(key)) localStorage.removeItem(key);
    });
    Object.entries(snapshot).forEach(([key, value]) => localStorage.setItem(key, value));
  };

  try {
    replace(next);
  } catch (error) {
    try {
      replace(previous);
    } catch (rollbackError) {
      throw new Error(
        `导入失败且自动回滚未完成：${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`,
        { cause: rollbackError },
      );
    }
    throw new Error(`导入失败，已恢复导入前的数据：${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
  return next;
}

function readAllLocalStorage() {
  const data: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    data[key] = localStorage.getItem(key) ?? '';
  }
  return data;
}

export function DbSettingsPage() {
  const [notice, setNotice] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMigrationBackup = async () => {
    setIsBusy(true);
    try {
      const zip = new JSZip();
      const exportedAt = new Date().toISOString();
      const localStorageBackup = sanitizeLocalStorageBackup(readAllLocalStorage());
      zip.file(
        BACKUP_MANIFEST_FILE,
        JSON.stringify(
          {
            version: 4,
            exportedAt,
            app: '月下写作',
            note: '这个全局迁移包用于把一台电脑上的作品、提示词、页面设置和本地资料恢复到另一台电脑；出于安全原因，API Key、Secret、Token、Password 等密钥字段会被清空。',
            includes: {
              localStorage: true,
              localStorageKeys: Object.keys(localStorageBackup).length,
            },
          },
          null,
          2,
        ),
      );
      zip.file(BACKUP_LOCAL_STORAGE_FILE, JSON.stringify(localStorageBackup, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `yuexia-global-backup-${exportedAt.slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice('全局数据迁移包已导出。把这个 zip 带到另一台电脑，在同一页面导入即可。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导出全局迁移包失败。');
    } finally {
      setIsBusy(false);
    }
  };

  const importMigrationBackup = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_BACKUP_FILE_BYTES) {
      setNotice('备份文件超过 64MB，已拒绝导入。请确认文件来源或拆分数据后重试。');
      return;
    }
    if (!window.confirm('导入后会先清除当前电脑里本软件的数据，再恢复备份内容。确认继续？')) return;
    setIsBusy(true);
    try {
      const isZip = file.name.toLowerCase().endsWith('.zip');
      let backup: MigrationBackup;

      if (isZip) {
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const localStorageText = await zip.file(BACKUP_LOCAL_STORAGE_FILE)?.async('string');
        if (!localStorageText) throw new Error('备份包里没有全局数据文件。');
        if (localStorageText.length > MAX_RESTORABLE_TEXT_LENGTH) throw new Error('备份解压后的数据体积过大。');
        backup = {
          version: 4,
          localStorage: JSON.parse(localStorageText) as Record<string, unknown>,
        };
      } else {
        backup = JSON.parse(await file.text()) as MigrationBackup;
      }

      const localStorageData = backup.localStorage ?? backup.data ?? backup;
      if (!localStorageData || typeof localStorageData !== 'object') {
        throw new Error('备份文件格式不正确。');
      }

      const restored = replaceRestorableLocalStorageData(localStorageData);
      setNotice(`全局数据已导入 ${Object.keys(restored).length} 项。刷新页面后会使用恢复后的资料。`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导入全局迁移包失败。');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6">
        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/zip,.zip,application/json,.json"
            className="hidden"
            onChange={(event) => {
              void importMigrationBackup(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <button
            onClick={exportMigrationBackup}
            disabled={isBusy}
            className="h-10 rounded-[10px] bg-[#08AACE] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0798B8] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            导出全局备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="h-10 rounded-[10px] bg-[#08AACE] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0798B8] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            导入全局备份
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-sm font-bold text-gray-900">迁移范围</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">导出内容</p>
              <p className="mt-2 text-sm text-gray-800">小说、剧本、章节、提示词、资料库、模型列表和页面配置</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">导入方式</p>
              <p className="mt-2 text-sm text-gray-800">先清除当前电脑的软件本地数据，再恢复备份，确保两边状态一致</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">安全边界</p>
              <p className="mt-2 text-sm text-gray-800">API Key、Secret、Token、Password 等密钥字段会被清空</p>
            </div>
          </div>
          {notice && (
            <div className="mt-4 rounded-lg border border-brand/20 bg-brand-light px-3 py-2 text-sm text-brand-dark">
              {notice}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-red-100 bg-white p-5">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-bold text-gray-900">清空本软件本地数据</div>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                这会清除当前浏览器缓存里属于本软件的数据。操作前请先导出全局备份。
              </p>
              <button
                onClick={() => {
                  if (!window.confirm('确认清空本软件本地数据？清空后需要导入备份才能恢复。')) return;
                  Object.keys(readAllLocalStorage()).forEach((key) => {
                    if (isRestorableLocalStorageKey(key)) localStorage.removeItem(key);
                  });
                  setNotice('本软件本地数据已清空。刷新页面后生效。');
                }}
                disabled={isBusy}
                className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                清空本软件数据
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DbSettingsPage;
