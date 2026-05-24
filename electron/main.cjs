const { app, BrowserWindow, dialog, ipcMain, nativeImage, shell, screen } = require('electron');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const {
  normalizeCollectionName,
  normalizeItemsArray,
  normalizeModelRequestInput,
} = require('./ipcValidation.cjs');

const DEV_URL = process.env.XINYUEXIA_URL || 'http://127.0.0.1:18328/#/dashboard';
const DIST_ENTRY = path.join(__dirname, '..', 'dist', 'index.html');
const PRELOAD_ENTRY = path.join(__dirname, 'preload.cjs');
const APP_ICON = path.join(__dirname, '..', 'build', 'app-icon.ico');
const APP_ID = 'com.yuexia.writer.desktop';
const APP_NAME = '月下写作';
const SHARED_STATE_DIR_NAME = 'xinyuexia-desktop';
const USER_DATA_NAME =
  process.env.XINYUEXIA_LOAD_DIST === '1' || app.isPackaged
    ? SHARED_STATE_DIR_NAME
    : 'xinyuexia-desktop-dev';
const DEFAULT_WINDOW_BOUNDS = {
  width: 1366,
  height: 768,
};
const MIN_WINDOW_WIDTH = 1100;
const MIN_WINDOW_HEIGHT = 680;
const DEFAULT_DATABASE_DIR = path.join(path.resolve(__dirname, '..'), 'shujuku');
const DATABASE_SETTINGS_FILE_NAME = 'xinyuexia-db-config.json';
const DATABASE_SCHEMA_FILE_NAME = 'xinyuexia-schema.sql';
const DATABASE_DATA_DIR_NAME = 'data';
const DATABASE_COLLECTION_FILES = {
  plotLibrary: 'plot-library.json',
  plotRecycle: 'plot-library-recycle.json',
  materials: 'materials.json',
};
const CUSTOM_APP_ICON_FILE_NAME = 'custom-app-icon.png';
const CUSTOM_APP_ICON_SOURCE_FILE_NAME = 'custom-app-icon-source.json';
const PROJECT_APP_ICON_DIR = path.join(path.resolve(__dirname, '..'), 'ruanjianfengmian');
const PROJECT_APP_ICON_FILE_NAMES = ['fengmian.png', 'fengmian.jpg', 'fengmian.jpeg', 'fengmian.webp', 'fengmian.ico'];
const PROJECT_APP_ICON_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico']);
const DATABASE_SCHEMA_SQL = `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'novel',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '未分类',
  synopsis TEXT NOT NULL DEFAULT '',
  cover_id TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volumes (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_expanded BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  volume_id TEXT REFERENCES volumes(id) ON DELETE SET NULL,
  serial_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plot_points (
  id TEXT PRIMARY KEY,
  source_work_id TEXT REFERENCES works(id) ON DELETE SET NULL,
  source_chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  score NUMERIC(4, 1),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL DEFAULT '设定库',
  work_id TEXT REFERENCES works(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS covers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'upload',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '正文',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  base_url TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  temperature NUMERIC(3, 2),
  top_p NUMERIC(3, 2),
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_records (
  id TEXT PRIMARY KEY,
  model_config_id TEXT REFERENCES model_configs(id) ON DELETE SET NULL,
  model_id TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_work_serial ON chapters(work_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_plot_points_tags ON plot_points USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plot_points_not_deleted ON plot_points(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_materials_collection ON materials(collection);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at DESC);
`;

let mainWindow = null;

app.setName(APP_NAME);
if (process.platform === 'win32') app.setAppUserModelId(APP_ID);
app.setPath('userData', path.join(app.getPath('appData'), USER_DATA_NAME));
app.setPath('sessionData', path.join(app.getPath('appData'), `${USER_DATA_NAME}-session`));

const SHARED_WINDOW_STATE_FILE = path.join(
  app.getPath('appData'),
  SHARED_STATE_DIR_NAME,
  'window-state.json',
);
const LEGACY_WINDOW_STATE_FILES = [
  path.join(app.getPath('userData'), 'window-state.json'),
  path.join(app.getPath('appData'), 'xinyuexia-desktop-dev', 'window-state.json'),
];

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeDatabaseSettings(input = {}) {
  const dataDir = String(input.dataDir || DEFAULT_DATABASE_DIR);
  const port = Number(input.port);
  return {
    engine: 'postgresql-pgvector',
    dataDir,
    postgresDataDir: path.join(dataDir, 'postgres-data'),
    backupsDir: path.join(dataDir, 'backups'),
    exportsDir: path.join(dataDir, 'exports'),
    vectorsDir: path.join(dataDir, 'vectors'),
    databaseName: String(input.databaseName || 'yuexia'),
    host: String(input.host || '127.0.0.1'),
    port: Number.isFinite(port) ? port : 5432,
    status: input.status === 'initialized' ? 'initialized' : 'not_initialized',
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : undefined,
  };
}

function getDatabaseSettingsFile(dataDir = DEFAULT_DATABASE_DIR) {
  return path.join(dataDir, DATABASE_SETTINGS_FILE_NAME);
}

function getDatabaseSchemaFile(dataDir = DEFAULT_DATABASE_DIR) {
  return path.join(dataDir, DATABASE_SCHEMA_FILE_NAME);
}

function getDatabaseDataDir(dataDir = DEFAULT_DATABASE_DIR) {
  return path.join(dataDir, DATABASE_DATA_DIR_NAME);
}

function getDatabaseCollectionFile(collection, dataDir = DEFAULT_DATABASE_DIR) {
  const safeCollection = normalizeCollectionName(collection);
  const fileName = safeCollection ? DATABASE_COLLECTION_FILES[safeCollection] : null;
  if (!fileName) return null;
  return path.join(getDatabaseDataDir(dataDir), fileName);
}

function isPsqlAvailable() {
  try {
    const result = spawnSync('psql', ['--version'], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 2500,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getDatabaseDirectoryStatus(dataDir = DEFAULT_DATABASE_DIR) {
  const postgresDataDir = path.join(dataDir, 'postgres-data');
  const backupsDir = path.join(dataDir, 'backups');
  const exportsDir = path.join(dataDir, 'exports');
  const vectorsDir = path.join(dataDir, 'vectors');
  const recordsDir = getDatabaseDataDir(dataDir);

  return {
    dataDir,
    exists: fs.existsSync(dataDir),
    settingsFileExists: fs.existsSync(getDatabaseSettingsFile(dataDir)),
    schemaFileExists: fs.existsSync(getDatabaseSchemaFile(dataDir)),
    psqlAvailable: isPsqlAvailable(),
    subdirectories: {
      postgresData: fs.existsSync(postgresDataDir),
      backups: fs.existsSync(backupsDir),
      exports: fs.existsSync(exportsDir),
      vectors: fs.existsSync(vectorsDir),
      records: fs.existsSync(recordsDir),
    },
  };
}

function writeDatabaseFiles(settingsInput = {}) {
  const settings = makeDatabaseSettings({
    ...settingsInput,
    status: 'initialized',
    updatedAt: new Date().toISOString(),
  });
  fs.mkdirSync(settings.dataDir, { recursive: true });
  fs.mkdirSync(settings.postgresDataDir, { recursive: true });
  fs.mkdirSync(settings.backupsDir, { recursive: true });
  fs.mkdirSync(settings.exportsDir, { recursive: true });
  fs.mkdirSync(settings.vectorsDir, { recursive: true });
  fs.mkdirSync(getDatabaseDataDir(settings.dataDir), { recursive: true });
  fs.writeFileSync(getDatabaseSchemaFile(settings.dataDir), DATABASE_SCHEMA_SQL, 'utf8');
  fs.writeFileSync(getDatabaseSettingsFile(settings.dataDir), JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}

function readDatabaseSettingsFromDisk(dataDir = DEFAULT_DATABASE_DIR) {
  const settingsFile = getDatabaseSettingsFile(dataDir);
  if (!fs.existsSync(settingsFile)) {
    return makeDatabaseSettings({ dataDir });
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    return makeDatabaseSettings(parsed);
  } catch {
    return makeDatabaseSettings({ dataDir });
  }
}

function readDatabaseCollection(collection, dataDir = DEFAULT_DATABASE_DIR) {
  const filePath = getDatabaseCollectionFile(collection, dataDir);
  if (!filePath) {
    return { ok: false, exists: false, data: [], message: 'Unknown database collection.' };
  }
  if (!fs.existsSync(filePath)) {
    return { ok: true, exists: false, data: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { ok: true, exists: true, data: Array.isArray(parsed) ? parsed : [] };
  } catch (error) {
    return {
      ok: false,
      exists: true,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to read database collection.',
    };
  }
}

function writeDatabaseCollection(collection, items, dataDir = DEFAULT_DATABASE_DIR) {
  const filePath = getDatabaseCollectionFile(collection, dataDir);
  if (!filePath) {
    return { ok: false, exists: false, data: [], message: 'Unknown database collection.' };
  }
  const data = normalizeItemsArray(items);
  try {
    writeDatabaseFiles(readDatabaseSettingsFromDisk(dataDir));
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { ok: true, exists: true, data };
  } catch (error) {
    return {
      ok: false,
      exists: fs.existsSync(filePath),
      data,
      message: error instanceof Error ? error.message : 'Failed to write database collection.',
    };
  }
}

function resolveStartUrl() {
  if (process.env.XINYUEXIA_LOAD_DIST === '1' || app.isPackaged) {
    return `${pathToFileURL(DIST_ENTRY).href}#/dashboard`;
  }
  return DEV_URL;
}

function parseWindowState(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const width = Number(parsed.width);
    const height = Number(parsed.height);
    const x = Number(parsed.x);
    const y = Number(parsed.y);

    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

    return {
      width: Math.max(MIN_WINDOW_WIDTH, Math.round(width)),
      height: Math.max(MIN_WINDOW_HEIGHT, Math.round(height)),
      x: Number.isFinite(x) ? Math.round(x) : undefined,
      y: Number.isFinite(y) ? Math.round(y) : undefined,
      isMaximized: parsed.isMaximized === true,
    };
  } catch {
    return null;
  }
}

function persistWindowState(state) {
  try {
    fs.mkdirSync(path.dirname(SHARED_WINDOW_STATE_FILE), { recursive: true });
    fs.writeFileSync(SHARED_WINDOW_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.warn('Failed to persist window state:', error);
  }
}

function readWindowState() {
  const candidates = [SHARED_WINDOW_STATE_FILE, ...LEGACY_WINDOW_STATE_FILES];
  for (const filePath of candidates) {
    const state = parseWindowState(filePath);
    if (!state) continue;
    if (filePath !== SHARED_WINDOW_STATE_FILE) {
      persistWindowState(state);
    }
    return state;
  }
  return null;
}

function isVisibleOnSomeDisplay(bounds) {
  if (typeof bounds?.x !== 'number' || typeof bounds?.y !== 'number') return true;

  return screen.getAllDisplays().some(({ workArea }) => {
    const horizontalOverlap =
      bounds.x < workArea.x + workArea.width && bounds.x + bounds.width > workArea.x;
    const verticalOverlap =
      bounds.y < workArea.y + workArea.height && bounds.y + bounds.height > workArea.y;
    return horizontalOverlap && verticalOverlap;
  });
}

function getCustomAppIconPath() {
  return path.join(app.getPath('userData'), CUSTOM_APP_ICON_FILE_NAME);
}

function getCustomAppIconSourcePath() {
  return path.join(app.getPath('userData'), CUSTOM_APP_ICON_SOURCE_FILE_NAME);
}

function readSelectedProjectIconFileName() {
  try {
    const sourcePath = getCustomAppIconSourcePath();
    if (!fs.existsSync(sourcePath)) return '';
    const parsed = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    return typeof parsed?.fileName === 'string' ? parsed.fileName : '';
  } catch {
    return '';
  }
}

function saveSelectedProjectIconFileName(fileName) {
  fs.mkdirSync(path.dirname(getCustomAppIconSourcePath()), { recursive: true });
  fs.writeFileSync(getCustomAppIconSourcePath(), JSON.stringify({ fileName }, null, 2), 'utf8');
}

function clearSelectedProjectIconFileName() {
  const sourcePath = getCustomAppIconSourcePath();
  if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
}

function getProjectAppIconPath() {
  return PROJECT_APP_ICON_FILE_NAMES
    .map((fileName) => path.join(PROJECT_APP_ICON_DIR, fileName))
    .find((filePath) => fs.existsSync(filePath)) ?? null;
}

function readProjectAppIcons() {
  if (!fs.existsSync(PROJECT_APP_ICON_DIR)) return [];
  const selectedFileName = readSelectedProjectIconFileName();
  return fs.readdirSync(PROJECT_APP_ICON_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && PROJECT_APP_ICON_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const filePath = path.join(PROJECT_APP_ICON_DIR, entry.name);
      const image = nativeImage.createFromPath(filePath);
      if (image.isEmpty()) return null;
      const previewImage = image.resize({ width: 128, height: 128, quality: 'best' });
      return {
        fileName: entry.name,
        filePath,
        dataUrl: previewImage.toDataURL(),
        isSelected: entry.name === selectedFileName,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN'));
}

function saveCustomAppIconFromPath(sourcePath, sourceFileName = '') {
  const sourceImage = nativeImage.createFromPath(sourcePath);
  if (sourceImage.isEmpty()) {
    return { ok: false, message: '无法读取这个图片，请换一张 PNG、JPG、WEBP 或 ICO。' };
  }

  const targetPath = getCustomAppIconPath();
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const squareIcon = sourceImage.resize({ width: 256, height: 256, quality: 'best' });
  fs.writeFileSync(targetPath, squareIcon.toPNG());
  if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
  else clearSelectedProjectIconFileName();
  return { ok: true };
}

function getCurrentAppIconPath() {
  const customIcon = getCustomAppIconPath();
  const projectIcon = getProjectAppIconPath();
  if (fs.existsSync(customIcon)) return customIcon;
  if (projectIcon) return projectIcon;
  return APP_ICON;
}

function readCurrentAppIcon() {
  const iconPath = getCurrentAppIconPath();
  const image = nativeImage.createFromPath(iconPath);
  const selectedProjectIconFileName = readSelectedProjectIconFileName();
  return {
    ok: !image.isEmpty(),
    isCustom: iconPath !== APP_ICON,
    projectIconDir: PROJECT_APP_ICON_DIR,
    acceptedFileNames: PROJECT_APP_ICON_FILE_NAMES,
    selectedProjectIconFileName,
    projectIcons: readProjectAppIcons(),
    iconPath,
    dataUrl: image.isEmpty() ? '' : image.toDataURL(),
  };
}

function applyWindowIcon(targetWindow = mainWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return readCurrentAppIcon();
  const icon = nativeImage.createFromPath(getCurrentAppIconPath());
  if (!icon.isEmpty()) targetWindow.setIcon(icon);
  return readCurrentAppIcon();
}

function getWindowOptions(savedState) {
  const bounds = {
    ...DEFAULT_WINDOW_BOUNDS,
    ...(savedState ?? {}),
  };

  if (!isVisibleOnSomeDisplay(bounds)) {
    delete bounds.x;
    delete bounds.y;
  }

  return {
    ...bounds,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: APP_NAME,
    icon: getCurrentAppIconPath(),
    backgroundColor: '#f9fafb',
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: PRELOAD_ENTRY,
      webviewTag: true,
    },
  };
}

function saveWindowState(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;

  const bounds = targetWindow.isMaximized()
    ? targetWindow.getNormalBounds()
    : targetWindow.getBounds();

  persistWindowState({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: targetWindow.isMaximized(),
  });
}

function notifyWindowMaximizedState(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  if (targetWindow.webContents.isDestroyed()) return;
  try {
    targetWindow.webContents.send('window:maximized-change', targetWindow.isMaximized());
  } catch (error) {
    console.warn('Failed to notify maximized state:', error);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampWindowDragX(x, width, workArea) {
  if (width >= workArea.width) return workArea.x;
  const visibleWidth = Math.min(120, Math.max(40, Math.round(width * 0.15)));
  return clamp(x, workArea.x - width + visibleWidth, workArea.x + workArea.width - visibleWidth);
}

function clampWindowDragY(y, workArea) {
  return Math.max(workArea.y, y);
}

function normalizeTitlebarDragInput(input) {
  if (!input || typeof input !== 'object') return null;
  const screenX = Number(input.screenX);
  const screenY = Number(input.screenY);
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  return {
    screenX: Math.round(screenX),
    screenY: Math.round(screenY),
    clientX: Number(input.clientX),
    clientY: Number(input.clientY),
    windowWidth: Number(input.windowWidth),
    dragOffsetX: Number(input.dragOffsetX),
    dragOffsetY: Number(input.dragOffsetY),
  };
}

function beginTitlebarDrag(input) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isFullScreen()) return null;
  const drag = normalizeTitlebarDragInput(input);
  if (!drag) return null;

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }

  const bounds = mainWindow.getBounds();
  const display = screen.getDisplayNearestPoint({ x: drag.screenX, y: drag.screenY });
  const widthRatio =
    Number.isFinite(drag.clientX) && Number.isFinite(drag.windowWidth) && drag.windowWidth > 0
      ? clamp(drag.clientX / drag.windowWidth, 0.08, 0.92)
      : 0.5;
  const titlebarOffsetY = Number.isFinite(drag.clientY) ? clamp(drag.clientY, 0, 56) : 16;
  const dragOffsetX = Math.round(bounds.width * widthRatio);
  const dragOffsetY = Math.round(titlebarOffsetY);
  const x = clampWindowDragX(drag.screenX - dragOffsetX, bounds.width, display.workArea);
  const y = clampWindowDragY(drag.screenY - dragOffsetY, display.workArea);

  mainWindow.setBounds({ x, y, width: bounds.width, height: bounds.height }, false);
  return {
    isMaximized: false,
    dragOffsetX: drag.screenX - x,
    dragOffsetY: drag.screenY - y,
  };
}

function moveTitlebarDrag(input) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMaximized() || mainWindow.isFullScreen()) return false;
  const drag = normalizeTitlebarDragInput(input);
  if (!drag || !Number.isFinite(drag.dragOffsetX) || !Number.isFinite(drag.dragOffsetY)) return false;

  const bounds = mainWindow.getBounds();
  const display = screen.getDisplayNearestPoint({ x: drag.screenX, y: drag.screenY });
  const x = clampWindowDragX(Math.round(drag.screenX - drag.dragOffsetX), bounds.width, display.workArea);
  const y = clampWindowDragY(Math.round(drag.screenY - drag.dragOffsetY), display.workArea);
  mainWindow.setPosition(x, y, false);
  return true;
}

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.show();
  mainWindow.focus();
  mainWindow.moveTop();
  setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.setAlwaysOnTop(false);
  }, 800);
}

async function loadStartUrl(targetWindow, retries = 10) {
  if (!targetWindow || targetWindow.isDestroyed()) return;

  const startUrl = resolveStartUrl();
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (!targetWindow || targetWindow.isDestroyed()) return;
    try {
      await targetWindow.loadURL(startUrl);
      return;
    } catch {
      if (!targetWindow || targetWindow.isDestroyed()) return;
      await wait(350);
    }
  }

  if (!targetWindow || targetWindow.isDestroyed()) return;
  await targetWindow
    .loadURL(
      'data:text/html;charset=utf-8,<html><body style="font-family:Segoe UI;padding:24px;"><h2>启动失败</h2><p>请确认开发服务器或 dist 文件已准备好。</p></body></html>',
    )
    .catch(() => {});
  if (!targetWindow.isDestroyed()) {
    targetWindow.show();
    targetWindow.focus();
  }
}

function attachWindowStateTracking(targetWindow) {
  const persist = () => saveWindowState(targetWindow);
  targetWindow.on('resize', persist);
  targetWindow.on('move', persist);
  targetWindow.on('maximize', () => {
    persist();
    notifyWindowMaximizedState(targetWindow);
  });
  targetWindow.on('unmaximize', () => {
    persist();
    notifyWindowMaximizedState(targetWindow);
  });
  targetWindow.on('close', persist);
}

function applySavedWindowState(targetWindow, savedState) {
  if (!savedState || !savedState.isMaximized) return;
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.maximize();
}

function attachRendererDiagnostics(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.warn('Renderer did-fail-load:', errorCode, errorDescription, validatedURL);
  });
  targetWindow.webContents.on('render-process-gone', (_event, details) => {
    console.warn('Renderer process gone:', details);
  });
  targetWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level < 2) return;
    console.warn(`Renderer console level=${level} ${sourceId}:${line} ${message}`);
  });
}

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    focusMainWindow();
    return mainWindow;
  }

  const savedState = readWindowState();
  mainWindow = new BrowserWindow(getWindowOptions(savedState));

  attachWindowStateTracking(mainWindow);
  attachRendererDiagnostics(mainWindow);
  applySavedWindowState(mainWindow, savedState);

  mainWindow.once('ready-to-show', () => {
    applySavedWindowState(mainWindow, savedState);
    focusMainWindow();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' && input.type === 'keyDown') {
      event.preventDefault();
      mainWindow?.webContents.reloadIgnoringCache();
    }
  });

  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.setTitle(APP_NAME);
  });

  void loadStartUrl(mainWindow);
  return mainWindow;
}

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize-toggle', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return mainWindow.isMaximized();
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
ipcMain.handle('window:reload', () => {
  mainWindow?.webContents.reloadIgnoringCache();
});
ipcMain.handle('window:begin-titlebar-drag', (_event, input) => beginTitlebarDrag(input));
ipcMain.handle('window:move-titlebar-drag', (_event, input) => moveTitlebarDrag(input));

ipcMain.handle('app-icon:read', async () => readCurrentAppIcon());

ipcMain.handle('app-icon:select', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, message: '窗口未就绪。' };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择软件图标图片',
    properties: ['openFile'],
    filters: [
      { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'webp', 'ico'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };

  try {
    const saved = saveCustomAppIconFromPath(result.filePaths[0]);
    if (!saved.ok) return saved;
    return { ...applyWindowIcon(mainWindow), ok: true, message: '图标已更新。' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '保存图标失败。',
    };
  }
});

ipcMain.handle('app-icon:use-project-icon', async (_event, fileName) => {
  if (typeof fileName !== 'string' || path.basename(fileName) !== fileName) {
    return { ...readCurrentAppIcon(), ok: false, message: '图标文件名无效。' };
  }
  if (!PROJECT_APP_ICON_EXTENSIONS.has(path.extname(fileName).toLowerCase())) {
    return { ...readCurrentAppIcon(), ok: false, message: '只能选择 PNG、JPG、WEBP 或 ICO 图片。' };
  }

  const sourcePath = path.join(PROJECT_APP_ICON_DIR, fileName);
  if (!fs.existsSync(sourcePath)) {
    return { ...readCurrentAppIcon(), ok: false, message: '没有找到这张图标图片。' };
  }

  try {
    const saved = saveCustomAppIconFromPath(sourcePath, fileName);
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '软件图标已切换。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '切换图标失败。',
    };
  }
});
ipcMain.handle('app-icon:reset', async () => {
  try {
    const customIcon = getCustomAppIconPath();
    if (fs.existsSync(customIcon)) fs.unlinkSync(customIcon);
    clearSelectedProjectIconFileName();
    return { ...applyWindowIcon(mainWindow), ok: true, message: '已恢复默认图标。' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '恢复默认图标失败。',
    };
  }
});

ipcMain.handle('model:request', async (_event, input) => {
  const request = normalizeModelRequestInput(input);
  if (!request.ok) {
    return { ok: false, status: 400, text: request.message };
  }

  try {
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      text: error instanceof Error ? error.message : 'Model request failed.',
    };
  }
});

ipcMain.handle('database:ensure-default-dir', async () => {
  try {
    const settings = writeDatabaseFiles(readDatabaseSettingsFromDisk(DEFAULT_DATABASE_DIR));
    return {
      ok: true,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      message: 'Database directory initialized.',
    };
  } catch (error) {
    const settings = makeDatabaseSettings();
    return {
      ok: false,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      message: error instanceof Error ? error.message : 'Failed to initialize database directory.',
    };
  }
});

ipcMain.handle('database:select-directory', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择月下数据库保存位置',
    defaultPath: DEFAULT_DATABASE_DIR,
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('database:read-settings', async () => {
  const settings = readDatabaseSettingsFromDisk(DEFAULT_DATABASE_DIR);
  return {
    ok: true,
    settings,
    status: getDatabaseDirectoryStatus(settings.dataDir),
  };
});

ipcMain.handle('database:save-settings', async (_event, input) => {
  try {
    const settings = writeDatabaseFiles(makeDatabaseSettings(input));
    return {
      ok: true,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      message: 'Database settings saved.',
    };
  } catch (error) {
    const settings = makeDatabaseSettings(input);
    return {
      ok: false,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      message: error instanceof Error ? error.message : 'Failed to save database settings.',
    };
  }
});

ipcMain.handle('database:get-status', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return getDatabaseDirectoryStatus(dir);
});

ipcMain.handle('database:read-collection', async (_event, collection, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return readDatabaseCollection(collection, dir);
});

ipcMain.handle('database:write-collection', async (_event, collection, items, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return writeDatabaseCollection(collection, items, dir);
});

app.on('before-quit', () => {
  saveWindowState(mainWindow);
});

app.on('second-instance', () => {
  focusMainWindow();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else focusMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
