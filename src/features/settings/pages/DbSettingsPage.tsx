import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCode2,
} from 'lucide-react';
import JSZip from 'jszip';
import { useEffect, useMemo, useRef, useState } from 'react';

import { readMaterialSnapshot } from '@/features/materials/hooks/useMaterials';
import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import { readPlotLibrarySnapshot } from '@/features/plot-library/hooks/usePlotLibrary';
import { readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import {
  DEFAULT_DATABASE_SETTINGS,
  makeFallbackDirectoryStatus,
  normalizeDatabaseSettings,
  readFallbackDatabaseSettings,
  saveFallbackDatabaseSettings,
  type DatabaseDirectoryStatus,
  type DatabaseSettings,
} from '@/features/settings/model/databaseSettings';

const dirLabels: Array<[keyof DatabaseDirectoryStatus['subdirectories'], string]> = [
  ['postgresData', 'postgres-data'],
  ['backups', 'backups'],
  ['exports', 'exports'],
  ['vectors', 'vectors'],
  ['records', 'data'],
];

const backupCollections: DatabaseCollectionName[] = ['plotLibrary', 'plotRecycle', 'materials', 'moonfallSettings'];
const BACKUP_MANIFEST_FILE = 'manifest.json';
const BACKUP_LOCAL_STORAGE_FILE = 'local-storage.json';
const BACKUP_COLLECTIONS_FILE = 'collections.json';
const BACKUP_MOONFALL_POSTGRES_FILE = 'postgres/moonfall-settings.json';

type MigrationBackup = {
  version?: number;
  exportedAt?: string;
  localStorage?: Record<string, string>;
  collections?: Partial<Record<DatabaseCollectionName, unknown[]>>;
  moonfallPostgres?: unknown;
  data?: Record<string, string>;
};

function statusTone(ok: boolean) {
  return ok
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700';
}

function MiniStatus({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs ${statusTone(ok)}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
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

function isMissingIpcHandler(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('No handler registered') || message.includes('Error invoking remote method');
}

export function DbSettingsPage() {
  const { novels } = useNovelLibrary();
  const [notice, setNotice] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [settings, setSettings] = useState<DatabaseSettings>(() => readFallbackDatabaseSettings());
  const [directoryStatus, setDirectoryStatus] = useState<DatabaseDirectoryStatus>(() =>
    makeFallbackDirectoryStatus(readFallbackDatabaseSettings()),
  );
  const [embeddedStatus, setEmbeddedStatus] = useState<EmbeddedPostgresStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(
    () => ({
      novels: novels.length,
      materials: readMaterialSnapshot().length,
      prompts: readPromptSnapshot().prompts.length,
      plots: readPlotLibrarySnapshot().items.length,
    }),
    [novels.length],
  );
  const defaultDirLabel = settings.dataDir || DEFAULT_DATABASE_SETTINGS.dataDir;

  useEffect(() => {
    let mounted = true;
    const readSettings = async () => {
      if (!window.xinyuexiaDatabase) {
        const fallback = readFallbackDatabaseSettings();
        if (!mounted) return;
        setSettings(fallback);
        setDirectoryStatus(makeFallbackDirectoryStatus(fallback));
        return;
      }

      const result = await window.xinyuexiaDatabase.readSettings();
      if (!mounted) return;
      const next = normalizeDatabaseSettings(result.settings);
      setSettings(next);
      setDirectoryStatus(result.status);
      if (window.xinyuexiaDatabase.getEmbeddedPostgresStatus) {
        try {
          const embedded = await window.xinyuexiaDatabase.getEmbeddedPostgresStatus(next.dataDir);
          if (!mounted) return;
          setEmbeddedStatus(embedded);
        } catch (error) {
          if (!mounted) return;
          setEmbeddedStatus(null);
          if (isMissingIpcHandler(error)) {
            setNotice('内置数据库管理接口尚未载入，请完整退出软件后重新打开。');
          }
        }
      }
    };
    void readSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshStatus = async (target = settings.dataDir) => {
    if (!window.xinyuexiaDatabase) {
      const fallback = readFallbackDatabaseSettings();
      setSettings(fallback);
      setDirectoryStatus(makeFallbackDirectoryStatus(fallback));
      setNotice('当前是浏览器预览环境，只能保存配置，不能直接创建项目内 shujuku 目录。');
      return;
    }
    const status = await window.xinyuexiaDatabase.getStatus(target);
    setDirectoryStatus(status);
    setNotice('数据库目录状态已刷新。');
  };

  const refreshEmbeddedStatus = async (target = settings.dataDir) => {
    if (!window.xinyuexiaDatabase?.getEmbeddedPostgresStatus) {
      setEmbeddedStatus(null);
      return null;
    }
    try {
      const embedded = await window.xinyuexiaDatabase.getEmbeddedPostgresStatus(target);
      setEmbeddedStatus(embedded);
      return embedded;
    } catch (error) {
      setEmbeddedStatus(null);
      setNotice(isMissingIpcHandler(error)
        ? '内置数据库管理接口尚未载入，请完整退出软件后重新打开。'
        : error instanceof Error ? error.message : '读取内置数据库程序状态失败。');
      return null;
    }
  };

  const refreshAllStatus = async () => {
    await refreshStatus();
    await refreshEmbeddedStatus();
  };

  const runEmbeddedPostgresAction = async (action: 'start' | 'stop') => {
    if (!window.xinyuexiaDatabase) {
      setNotice('桌面端才可以管理内置数据库程序。');
      return;
    }
    setIsBusy(true);
    try {
      const result = action === 'stop'
        ? await window.xinyuexiaDatabase.stopEmbeddedPostgres(settings.dataDir)
        : await window.xinyuexiaDatabase.startEmbeddedPostgres(settings.dataDir);
      setSettings(normalizeDatabaseSettings(result.settings));
      setDirectoryStatus(result.status);
      setEmbeddedStatus(result.embedded);
      setNotice(result.message ?? (result.ok ? '内置数据库程序已处理。' : '内置数据库程序处理失败。'));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '内置数据库程序处理失败。');
    } finally {
      setIsBusy(false);
    }
  };

  const saveSettings = async (nextInput: DatabaseSettings) => {
    const next = normalizeDatabaseSettings(nextInput);
    setIsBusy(true);
    try {
      if (!window.xinyuexiaDatabase) {
        const saved = saveFallbackDatabaseSettings(next);
        setSettings(saved);
        setDirectoryStatus(makeFallbackDirectoryStatus(saved));
        setNotice('配置已保存到浏览器本地预览环境。');
        return;
      }
      const result = await window.xinyuexiaDatabase.saveSettings(next);
      setSettings(normalizeDatabaseSettings(result.settings));
      setDirectoryStatus(result.status);
      setNotice(result.ok ? '数据库目录和配置已保存。' : result.message ?? '保存失败。');
    } finally {
      setIsBusy(false);
    }
  };

  const initializeDefaultDir = async () => {
    setIsBusy(true);
    try {
      if (!window.xinyuexiaDatabase) {
        const saved = saveFallbackDatabaseSettings({ ...DEFAULT_DATABASE_SETTINGS, status: 'initialized' });
        setSettings(saved);
        setDirectoryStatus(makeFallbackDirectoryStatus(saved));
        setNotice('浏览器预览环境已记录默认配置；桌面端会在项目目录下创建 shujuku。');
        return;
      }
      const result = await window.xinyuexiaDatabase.ensureDefaultDir();
      setSettings(normalizeDatabaseSettings(result.settings));
      setDirectoryStatus(result.status);
      setNotice(result.ok ? `已初始化 ${result.settings.dataDir}，并写入 pgvector 表结构文件。` : result.message ?? '初始化失败。');
    } finally {
      setIsBusy(false);
    }
  };

  const selectDirectory = async () => {
    if (!window.xinyuexiaDatabase) {
      setNotice('浏览器预览环境不能打开系统文件夹选择器。');
      return;
    }
    const selected = await window.xinyuexiaDatabase.selectDirectory();
    if (!selected) return;
    await saveSettings(normalizeDatabaseSettings({ ...settings, dataDir: selected }));
  };

  const exportMigrationBackup = async () => {
    setIsBusy(true);
    try {
      const zip = new JSZip();
      const collections: Partial<Record<DatabaseCollectionName, unknown[]>> = {};

      if (window.xinyuexiaDatabase?.readCollection) {
        for (const collection of backupCollections) {
          const result = await window.xinyuexiaDatabase.readCollection(collection);
          if (result.ok && result.exists) {
            collections[collection] = result.data;
          }
        }
      }

      let moonfallPostgres: unknown = null;
      if (window.xinyuexiaDatabase?.readMoonfallPostgres) {
        const result = await window.xinyuexiaDatabase.readMoonfallPostgres();
        if (result.ok && result.exists && result.data.length > 0) {
          moonfallPostgres = result.data[0];
        }
      }

      const exportedAt = new Date().toISOString();
      zip.file(BACKUP_MANIFEST_FILE, JSON.stringify({
        version: 2,
        exportedAt,
        app: '月下写作',
        note: '这个迁移包包含软件本地数据和可导出的资料快照，不包含 PostgreSQL 服务程序本身。',
        includes: {
          localStorage: true,
          collections: Object.keys(collections),
          moonfallPostgres: Boolean(moonfallPostgres),
        },
      }, null, 2));
      zip.file(BACKUP_LOCAL_STORAGE_FILE, JSON.stringify(readAllLocalStorage(), null, 2));
      zip.file(BACKUP_COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
      if (moonfallPostgres) {
        zip.file(BACKUP_MOONFALL_POSTGRES_FILE, JSON.stringify(moonfallPostgres, null, 2));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `yuexia-migration-backup-${exportedAt.slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice('迁移备份已导出。这个 zip 可以带到另一台电脑导入恢复。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导出迁移备份失败。');
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
        const collectionsText = await zip.file(BACKUP_COLLECTIONS_FILE)?.async('string');
        const moonfallText = await zip.file(BACKUP_MOONFALL_POSTGRES_FILE)?.async('string');
        backup = {
          version: 2,
          localStorage: JSON.parse(localStorageText) as Record<string, string>,
          collections: collectionsText ? JSON.parse(collectionsText) as Partial<Record<DatabaseCollectionName, unknown[]>> : {},
          moonfallPostgres: moonfallText ? JSON.parse(moonfallText) : undefined,
        };
      } else {
        backup = JSON.parse(await file.text()) as MigrationBackup;
      }

      const localStorageData = backup.localStorage ?? backup.data;
      if (!localStorageData || typeof localStorageData !== 'object') {
        throw new Error('备份文件格式不正确。');
      }

      Object.entries(localStorageData).forEach(([key, value]) => localStorage.setItem(key, String(value)));

      if (window.xinyuexiaDatabase?.writeCollection && backup.collections) {
        for (const collection of backupCollections) {
          const items = backup.collections[collection];
          if (Array.isArray(items)) {
            await window.xinyuexiaDatabase.writeCollection(collection, items);
          }
        }
      }

      if (window.xinyuexiaDatabase?.writeMoonfallPostgres && backup.moonfallPostgres) {
        await window.xinyuexiaDatabase.writeMoonfallPostgres(backup.moonfallPostgres);
      }

      await refreshStatus();
      setNotice('迁移备份已导入。刷新页面后，新电脑会继续使用这些资料。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导入迁移备份失败。');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">数据库设置</h1>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            默认保存到当前项目文件夹下的 shujuku。PostgreSQL 服务本身需要电脑上已安装，或连接云端数据库。
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
            className="flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            导出迁移包
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            导入迁移包
          </button>
          <button
            onClick={() => void refreshAllStatus()}
            disabled={isBusy}
            className="flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            刷新
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <section className="grid gap-5 xl:grid-cols-3">
          <div className="flex min-h-[520px] flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">本地数据目录</h2>
                  <p className="text-sm text-gray-400">保存软件资料、配置和数据库数据，不再和数据库程序混在一起。</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${directoryStatus.exists ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {directoryStatus.exists ? '目录已创建' : '未初始化'}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2 block">
                <span className="mb-1.5 block text-sm font-medium text-gray-500">数据库保存位置</span>
                <div className="flex gap-2">
                  <input
                    value={settings.dataDir}
                    onChange={(event) => setSettings(normalizeDatabaseSettings({ ...settings, dataDir: event.target.value }))}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-700"
                  />
                  <button
                    onClick={selectDirectory}
                    disabled={isBusy}
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    选择
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-500">数据库名</span>
                <input
                  value={settings.databaseName}
                  onChange={(event) => setSettings({ ...settings, databaseName: event.target.value })}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-700"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-500">端口</span>
                <input
                  value={settings.port}
                  type="number"
                  min={1}
                  max={65535}
                  onChange={(event) => setSettings({ ...settings, port: Number(event.target.value) })}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-700"
                />
              </label>

              <label className="md:col-span-2 block">
                <span className="mb-1.5 block text-sm font-medium text-gray-500">主机</span>
                <input
                  value={settings.host}
                  onChange={(event) => setSettings({ ...settings, host: event.target.value })}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-700"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <button
                onClick={initializeDefaultDir}
                disabled={isBusy}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-4 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                初始化默认目录
              </button>
              <button
                onClick={() => void saveSettings(settings)}
                disabled={isBusy}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-base font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                保存数据库配置
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">内置数据库程序</h3>
                  <p className="mt-1 text-xs text-gray-500">这里是随软件携带的 PostgreSQL 程序，打包后朋友不用单独安装。</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${embeddedStatus?.running ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {embeddedStatus?.running ? '运行中' : '未运行'}
                </span>
              </div>
              <div className="grid gap-2 text-xs text-gray-500">
                <div className="flex justify-between gap-3">
                  <span>运行文件</span>
                  <span className={embeddedStatus?.runtimeAvailable ? 'text-emerald-600' : 'text-amber-600'}>
                    {embeddedStatus?.runtimeAvailable ? '已找到' : '未找到'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>端口</span>
                  <span className="text-gray-700">{embeddedStatus?.port ?? settings.port}</span>
                </div>
                <div className="min-w-0">
                  <span>数据目录</span>
                  <div className="mt-1 truncate rounded-lg bg-white px-2 py-1 text-gray-600">
                    {embeddedStatus?.dataDir ?? settings.postgresDataDir}
                  </div>
                </div>
                <div className="min-w-0">
                  <span>运行目录</span>
                  <div className="mt-1 truncate rounded-lg bg-white px-2 py-1 text-gray-600">
                    {embeddedStatus?.runtimePath || 'runtime/postgres'}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <button
                  onClick={() => void runEmbeddedPostgresAction('start')}
                  disabled={isBusy}
                  className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  初始化并启动
                </button>
                <button
                  onClick={() => void runEmbeddedPostgresAction('start')}
                  disabled={isBusy}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  启动
                </button>
                <button
                  onClick={() => void runEmbeddedPostgresAction('stop')}
                  disabled={isBusy}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  停止
                </button>
              </div>
            </div>

            {notice && (
              <div className="mt-auto rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                {notice}
              </div>
            )}
          </div>

          <div className="flex min-h-[520px] flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileCode2 className="h-4 w-4 text-sky-500" />
                目录状态
              </div>
              <span className="text-xs text-gray-400">pgvector 表结构文件已准备</span>
            </div>

            <div className="grid gap-2">
              <MiniStatus ok={directoryStatus.exists} label={`根目录 ${defaultDirLabel}`} />
              <MiniStatus ok={directoryStatus.settingsFileExists} label="配置文件 xinyuexia-db-config.json" />
              <MiniStatus ok={directoryStatus.schemaFileExists} label="表结构 xinyuexia-schema.sql" />
              <MiniStatus ok={directoryStatus.psqlAvailable} label={directoryStatus.psqlAvailable ? '已检测到 psql' : '未检测到 psql 命令'} />
              {dirLabels.map(([key, label]) => (
                <MiniStatus key={key} ok={directoryStatus.subdirectories[key]} label={`子目录 ${label}`} />
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs leading-6 text-gray-500">
              打包软件会带上连接数据库的代码、pg 驱动和内置数据库程序。换电脑使用时，软件会在新电脑上初始化自己的本地数据目录。
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Database className="h-4 w-4 text-sky-500" />
              数据概览
            </div>
            <div className="grid flex-1 auto-rows-min grid-cols-2 content-start gap-3">
              {[
                ['作品', stats.novels],
                ['资料', stats.materials],
                ['提示词', stats.prompts],
                ['剧情点', stats.plots],
              ].map(([label, value]) => (
                <div key={label} className="flex min-h-[104px] flex-col justify-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-3 rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
            <div className="mb-2 flex items-center gap-2 font-medium text-gray-700">
              <Database className="h-4 w-4" />
              备份与迁移
            </div>
            <p>
              导出迁移包会生成 zip，包含软件本地缓存、JSON 数据集合，以及能读取到的月落设定库快照。导入迁移包会恢复这些资料；如果打包时已经带上内置数据库程序，新电脑不需要单独安装 PostgreSQL。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={exportMigrationBackup}
                disabled={isBusy}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                导出迁移包
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                导入迁移包
              </button>
              <button
                onClick={() => {
                  const ok = window.confirm('确定清空所有本地数据吗？建议先导出迁移包。');
                  if (!ok) return;
                  localStorage.clear();
                  setNotice('本地数据已清空，刷新页面后生效。');
                }}
                className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                清空本地数据
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
