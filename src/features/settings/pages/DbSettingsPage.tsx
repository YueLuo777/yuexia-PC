import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileCode2,
  FolderOpen,
  HardDrive,
  RefreshCw,
  Server,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { readIdeaSnapshot } from '@/features/ideas/hooks/useIdeaStorage';
import { readMaterialSnapshot } from '@/features/materials/hooks/useMaterials';
import { readModelSnapshot } from '@/features/models/hooks/useModels';
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

export function DbSettingsPage() {
  const { novels } = useNovelLibrary();
  const [notice, setNotice] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [settings, setSettings] = useState<DatabaseSettings>(() => readFallbackDatabaseSettings());
  const [directoryStatus, setDirectoryStatus] = useState<DatabaseDirectoryStatus>(() =>
    makeFallbackDirectoryStatus(readFallbackDatabaseSettings()),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(
    () => ({
      novels: novels.length,
      materials: readMaterialSnapshot().length,
      prompts: readPromptSnapshot().prompts.length,
      models: readModelSnapshot().length,
      ideas: readIdeaSnapshot().length,
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

  const handleRefresh = () => {
    void refreshStatus();
  };

  const exportBackup = () => {
    const data: Record<string, string> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      data[key] = localStorage.getItem(key) ?? '';
    }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xinyuexia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('本地数据备份已导出。');
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { data?: Record<string, string> };
      if (!parsed.data || typeof parsed.data !== 'object') throw new Error('备份文件格式不正确');
      Object.entries(parsed.data).forEach(([key, value]) => localStorage.setItem(key, String(value)));
      setNotice('备份已导入，刷新页面后生效。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导入失败。');
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Shield className="h-5 w-5 text-sky-500" />
            数据库设置
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">
            默认保存到当前项目文件夹下的 shujuku，先建立 PostgreSQL + pgvector 的本地目录和表结构。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              void importBackup(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <button
            onClick={exportBackup}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            导出备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            导入备份
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          {notice && (
            <div className="xl:col-span-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {notice}
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">本地数据库</h2>
                  <p className="text-xs text-gray-400">PostgreSQL + pgvector，适合剧情点和资料的向量搜索。</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${directoryStatus.exists ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {directoryStatus.exists ? '目录已创建' : '未初始化'}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2 block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">数据库保存位置</span>
                <div className="flex gap-2">
                  <input
                    value={settings.dataDir}
                    onChange={(event) => setSettings(normalizeDatabaseSettings({ ...settings, dataDir: event.target.value }))}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                  />
                  <button
                    onClick={selectDirectory}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FolderOpen className="h-4 w-4" />
                    选择
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">数据库名</span>
                <input
                  value={settings.databaseName}
                  onChange={(event) => setSettings({ ...settings, databaseName: event.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">端口</span>
                <input
                  value={settings.port}
                  type="number"
                  min={1}
                  max={65535}
                  onChange={(event) => setSettings({ ...settings, port: Number(event.target.value) })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                />
              </label>

              <label className="md:col-span-2 block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">主机</span>
                <input
                  value={settings.host}
                  onChange={(event) => setSettings({ ...settings, host: event.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <button
                onClick={initializeDefaultDir}
                disabled={isBusy}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                <HardDrive className="h-4 w-4" />
                初始化默认数据库目录
              </button>
              <button
                onClick={() => void saveSettings(settings)}
                disabled={isBusy}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Server className="h-4 w-4" />
                保存数据库配置
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileCode2 className="h-4 w-4 text-sky-500" />
                目录状态
              </div>
              <span className="text-xs text-gray-400">pgvector 表结构已准备</span>
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
              剧情库、剧情回收站和资料库会同步保存到 data 子目录；PostgreSQL + pgvector 表结构文件也会保留，方便后续接入向量搜索。
            </div>
          </div>

          <div className="xl:col-span-2 grid gap-4 md:grid-cols-4">
            {[
              ['作品', stats.novels],
              ['资料', stats.materials],
              ['提示词 / 模型 / 脑洞', stats.prompts + stats.models + stats.ideas],
              ['剧情点', stats.plots],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="xl:col-span-2 rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-400 shadow-sm">
            <div className="mb-2 flex items-center gap-2 font-medium text-gray-600">
              <Database className="h-4 w-4" />
              本地维护
            </div>
            <p>导入备份会覆盖同名本地数据。需要完全重置时，可以先导出备份，再清理浏览器/Electron 的本地存储。</p>
            <button
              onClick={() => {
                const ok = window.confirm('确定清空所有本地数据吗？建议先导出备份。');
                if (!ok) return;
                localStorage.clear();
                setNotice('本地数据已清空，刷新页面后生效。');
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空本地数据
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
