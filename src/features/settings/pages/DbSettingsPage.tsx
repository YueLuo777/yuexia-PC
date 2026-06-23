import { ArchiveRestore, DatabaseBackup, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { useRef, useState } from 'react';

const BACKUP_MANIFEST_FILE = 'manifest.json';
const BACKUP_LOCAL_STORAGE_FILE = 'local-storage.json';

type MigrationBackup = {
  version?: number;
  localStorage?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

const RESTORABLE_STORAGE_KEY_PREFIXES = [
  'xinyuexia_',
  'workbench_',
  'plot_point_layout_',
  'materials:',
  'current_',
];
const RESTORABLE_STORAGE_KEYS = new Set([
  'materials',
  'materials_data_v1',
  'plot_library_v1',
]);
const BLOCKED_STORAGE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const SECRET_VALUE_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+[A-Za-z0-9._-]{12,})\b/g;

function isSensitiveFieldName(name: string) {
  const normalized = name.replace(/[-_\s]/g, '').toLowerCase();
  return (
    normalized.includes('secret')
    || normalized.includes('token')
    || normalized.includes('password')
    || normalized.includes('authorization')
    || normalized === 'apikey'
    || normalized === 'xapikey'
    || normalized === 'privatekey'
    || normalized === 'accesskey'
    || normalized === 'accesskeyid'
    || normalized === 'accesskeysecret'
  );
}

function redactSensitiveJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactSensitiveJsonValue(item));
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? value.replace(SECRET_VALUE_PATTERN, '') : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      isSensitiveFieldName(key) ? '' : redactSensitiveJsonValue(item),
    ]),
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

export function sanitizeLocalStorageBackup(data: Record<string, unknown>) {
  const next: Record<string, string> = {};
  Object.entries(filterRestorableLocalStorageData(data)).forEach(([key, value]) => {
    next[key] = sanitizeStoredValue(key, value);
  });
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
      zip.file(BACKUP_MANIFEST_FILE, JSON.stringify({
        version: 3,
        exportedAt,
        app: '月下写作',
        note: '这个迁移包只包含浏览器本地缓存数据，不包含已归档的旧数据库运行时。',
        includes: {
          localStorage: true,
        },
      }, null, 2));
      zip.file(BACKUP_LOCAL_STORAGE_FILE, JSON.stringify(sanitizeLocalStorageBackup(readAllLocalStorage()), null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `yuexia-local-backup-${exportedAt.slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice('本地数据备份已导出。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导出本地备份失败。');
    } finally {
      setIsBusy(false);
    }
  };

  const importMigrationBackup = async (file?: File) => {
    if (!file) return;
    setIsBusy(true);
    try {
      const isZip = file.name.toLowerCase().endsWith('.zip');
      let backup: MigrationBackup;

      if (isZip) {
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const localStorageText = await zip.file(BACKUP_LOCAL_STORAGE_FILE)?.async('string');
        if (!localStorageText) throw new Error('备份包里没有本地数据文件。');
        backup = {
          version: 3,
          localStorage: JSON.parse(localStorageText) as Record<string, unknown>,
        };
      } else {
        backup = JSON.parse(await file.text()) as MigrationBackup;
      }

      const localStorageData = backup.localStorage ?? backup.data;
      if (!localStorageData || typeof localStorageData !== 'object') {
        throw new Error('备份文件格式不正确。');
      }

      Object.entries(filterRestorableLocalStorageData(localStorageData)).forEach(([key, value]) => localStorage.setItem(key, value));
      setNotice('本地备份已导入。刷新页面后会使用恢复后的资料。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导入本地备份失败。');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">本地数据备份</h1>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            向量数据库已停用；这里仅用于导出和恢复当前软件的本地缓存数据。
          </p>
        </div>
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
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <DatabaseBackup className="h-4 w-4" />
            导出备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArchiveRestore className="h-4 w-4" />
            导入备份
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-sm font-bold text-gray-900">当前保存方式</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">存储位置</p>
              <p className="mt-2 text-sm text-gray-800">浏览器本地缓存 localStorage</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">备份内容</p>
              <p className="mt-2 text-sm text-gray-800">作品、素材、剧情、设定、模型与页面配置</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">向量数据库</p>
              <p className="mt-2 text-sm text-gray-800">已从当前运行路径剥离</p>
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
              <div className="text-sm font-bold text-gray-900">清空本地缓存</div>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                这会清除当前浏览器缓存里的所有软件数据。操作前请先导出备份。
              </p>
              <button
                onClick={() => {
                  if (!window.confirm('确认清空本地缓存？清空后需要导入备份才能恢复。')) return;
                  localStorage.clear();
                  setNotice('本地缓存已清空。刷新页面后生效。');
                }}
                disabled={isBusy}
                className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                清空本地缓存
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DbSettingsPage;
