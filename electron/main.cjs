const { app, BrowserWindow, dialog, ipcMain, nativeImage, shell, screen } = require('electron');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
let PgClient = null;
try {
  ({ Client: PgClient } = require('pg'));
} catch {
  PgClient = null;
}
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
const DEFAULT_EMBEDDED_POSTGRES_PORT = 55432;
const POSTGRES_VECTOR_DIMENSION = 1536;
const EMBEDDED_POSTGRES_DIR_NAME = 'postgres';
const DATABASE_SETTINGS_FILE_NAME = 'xinyuexia-db-config.json';
const DATABASE_SCHEMA_FILE_NAME = 'xinyuexia-schema.sql';
const DATABASE_DATA_DIR_NAME = 'data';
const DATABASE_COLLECTION_FILES = {
  plotLibrary: 'plot-library.json',
  plotRecycle: 'plot-library-recycle.json',
  materials: 'materials.json',
  moonfallSettings: 'moonfall-settings.json',
};
const CUSTOM_APP_ICON_FILE_NAME = 'custom-app-icon.png';
const CUSTOM_APP_ICON_SOURCE_FILE_NAME = 'custom-app-icon-source.json';
const DEFAULT_APP_ICON_FILE_NAME = 'default-app-icon.png';
const PROJECT_APP_ICON_DIR = path.join(path.resolve(__dirname, '..'), 'ruanjianfengmian');
const PROJECT_APP_ICON_FILE_NAMES = ['fengmian.png', 'fengmian.jpg', 'fengmian.jpeg', 'fengmian.webp', 'fengmian.ico'];
const PROJECT_APP_ICON_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico']);
let embeddedPostgresProcess = null;
let embeddedPostgresSettingsDir = DEFAULT_DATABASE_DIR;
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

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  title TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'manual',
  author TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  original_filename TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_chunks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chapter_title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  source_chunk_id TEXT REFERENCES source_chunks(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  canonical_name TEXT NOT NULL DEFAULT '',
  aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL DEFAULT '未分类',
  subcategory TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  summary TEXT NOT NULL DEFAULT '',
  original_text TEXT NOT NULL DEFAULT '',
  organized_text TEXT NOT NULL DEFAULT '',
  evidence_text TEXT NOT NULL DEFAULT '',
  evidence_location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '待确认',
  confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.65,
  allow_rag BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  importance TEXT NOT NULL DEFAULT '普通',
  rag_weight NUMERIC(6, 3) NOT NULL DEFAULT 1,
  worldline TEXT NOT NULL DEFAULT '主线',
  version TEXT NOT NULL DEFAULT '',
  related_items TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_embeddings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  embedding_model TEXT NOT NULL DEFAULT '',
  embedding vector(1536),
  embedding_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_relations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_setting_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  to_setting_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related_to',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retrieval_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  query TEXT NOT NULL DEFAULT '',
  retrieved_setting_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  retrieved_chunk_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  purpose TEXT NOT NULL DEFAULT 'writing',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_chapter_bindings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_id TEXT REFERENCES works(id) ON DELETE CASCADE,
  chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL DEFAULT 'writing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_change_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
CREATE INDEX IF NOT EXISTS idx_sources_project ON sources(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_chunks_source ON source_chunks(source_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_setting_items_project_category ON setting_items(project_id, category);
CREATE INDEX IF NOT EXISTS idx_setting_items_project_status ON setting_items(project_id, status);
CREATE INDEX IF NOT EXISTS idx_setting_items_tags ON setting_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_setting_items_keywords ON setting_items USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_setting_items_rag ON setting_items(project_id, allow_rag, is_verified, importance);
CREATE INDEX IF NOT EXISTS idx_setting_embeddings_project ON setting_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_setting_relations_from ON setting_relations(project_id, from_setting_id);
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_project ON retrieval_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at DESC);
`;

let mainWindow = null;
let titlebarDragSession = null;

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

function executableName(name) {
  return process.platform === 'win32' ? `${name}.exe` : name;
}

function getRuntimeBinary(root, name) {
  return path.join(root, 'bin', executableName(name));
}

function hasNonAsciiPathSegment(value) {
  return /[^\x00-\x7F]/.test(String(value || ''));
}

function getEmbeddedPostgresRuntimeSignature(root) {
  const files = [
    getRuntimeBinary(root, 'postgres'),
    getRuntimeBinary(root, 'initdb'),
    getRuntimeBinary(root, 'pg_ctl'),
    getRuntimeBinary(root, 'psql'),
    path.join(root, 'lib', 'vector.dll'),
    path.join(root, 'share', 'extension', 'vector.control'),
  ];
  return files.map((filePath) => {
    try {
      const stat = fs.statSync(filePath);
      return `${path.relative(root, filePath)}:${stat.size}:${Math.round(stat.mtimeMs)}`;
    } catch {
      return `${path.relative(root, filePath)}:missing`;
    }
  }).join('|');
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function stageEmbeddedPostgresRuntimeIfNeeded(sourceRoot) {
  if (process.platform !== 'win32' || !hasNonAsciiPathSegment(sourceRoot)) return sourceRoot;

  const userDataDir = app.getPath('userData');
  const stageRoot = path.join(userDataDir, 'embedded-postgres-runtime');
  const markerFile = path.join(stageRoot, '.yuexia-runtime-source.json');
  const sourceSignature = getEmbeddedPostgresRuntimeSignature(sourceRoot);
  const marker = readJsonFile(markerFile);
  const stageReady = [
    getRuntimeBinary(stageRoot, 'postgres'),
    getRuntimeBinary(stageRoot, 'initdb'),
    getRuntimeBinary(stageRoot, 'pg_ctl'),
    getRuntimeBinary(stageRoot, 'psql'),
    path.join(stageRoot, 'lib', 'vector.dll'),
    path.join(stageRoot, 'share', 'extension', 'vector.control'),
  ].every((filePath) => fs.existsSync(filePath));

  if (stageReady && marker?.sourceRoot === sourceRoot && marker?.signature === sourceSignature) {
    return stageRoot;
  }

  const resolvedStageRoot = path.resolve(stageRoot);
  const resolvedUserDataDir = path.resolve(userDataDir);
  if (!resolvedStageRoot.startsWith(resolvedUserDataDir + path.sep)) {
    throw new Error(`Refusing to stage PostgreSQL runtime outside user data: ${stageRoot}`);
  }

  fs.rmSync(stageRoot, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(stageRoot), { recursive: true });
  fs.cpSync(sourceRoot, stageRoot, { recursive: true });
  fs.writeFileSync(markerFile, JSON.stringify({
    sourceRoot,
    signature: sourceSignature,
    stagedAt: new Date().toISOString(),
  }, null, 2), 'utf8');
  return stageRoot;
}

function getEmbeddedPostgresCandidates() {
  const projectRoot = path.resolve(__dirname, '..');
  return [
    process.env.XINYUEXIA_POSTGRES_DIR,
    path.join(projectRoot, 'runtime', EMBEDDED_POSTGRES_DIR_NAME),
    path.join(projectRoot, EMBEDDED_POSTGRES_DIR_NAME),
    app.isPackaged ? path.join(process.resourcesPath, EMBEDDED_POSTGRES_DIR_NAME) : null,
    app.isPackaged ? path.join(path.dirname(app.getPath('exe')), EMBEDDED_POSTGRES_DIR_NAME) : null,
  ].filter((item) => typeof item === 'string' && item.trim());
}

function getEmbeddedPostgresRuntime() {
  const candidates = getEmbeddedPostgresCandidates();
  for (const root of candidates) {
    const runtimeRoot = stageEmbeddedPostgresRuntimeIfNeeded(root);
    const runtime = {
      root: runtimeRoot,
      sourceRoot: root,
      binDir: path.join(runtimeRoot, 'bin'),
      postgres: getRuntimeBinary(runtimeRoot, 'postgres'),
      initdb: getRuntimeBinary(runtimeRoot, 'initdb'),
      pgCtl: getRuntimeBinary(runtimeRoot, 'pg_ctl'),
      psql: getRuntimeBinary(runtimeRoot, 'psql'),
    };
    const available = [runtime.postgres, runtime.initdb, runtime.pgCtl, runtime.psql].every((file) => fs.existsSync(file));
    if (available) return { ...runtime, available: true };
  }
  return {
    root: candidates[0] || '',
    binDir: candidates[0] ? path.join(candidates[0], 'bin') : '',
    available: false,
    missing: ['postgres', 'initdb', 'pg_ctl', 'psql'].map(executableName),
  };
}

function getPostgresToolEnv(runtime) {
  return {
    ...process.env,
    LANG: 'C',
    LC_ALL: 'C',
    PATH: `${runtime.binDir}${path.delimiter}${process.env.PATH || ''}`,
  };
}

function runPostgresTool(runtime, toolPath, args, options = {}) {
  const result = spawnSync(toolPath, args, {
    cwd: runtime.root,
    encoding: 'utf8',
    env: getPostgresToolEnv(runtime),
    windowsHide: true,
    timeout: options.timeout ?? 15000,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    message: `${result.stdout || ''}${result.stderr || ''}`.trim(),
  };
}

function getPostgresDataDir(settings) {
  return settings.postgresDataDir || path.join(settings.dataDir, 'postgres-data');
}

function isPostgresDataDirInitialized(dataDir) {
  return fs.existsSync(path.join(dataDir, 'PG_VERSION'));
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findEmbeddedPostgresPort(preferredPort) {
  const preferred = Number(preferredPort);
  const candidates = [];
  if (Number.isFinite(preferred) && preferred > 0 && preferred !== 5432) candidates.push(preferred);
  for (let port = DEFAULT_EMBEDDED_POSTGRES_PORT; port < DEFAULT_EMBEDDED_POSTGRES_PORT + 80; port += 1) {
    if (!candidates.includes(port)) candidates.push(port);
  }
  if (Number.isFinite(preferred) && preferred > 0 && !candidates.includes(preferred)) candidates.push(preferred);
  for (const port of candidates) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error('No available local port for embedded PostgreSQL.');
}

function quotePgIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
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
    psqlAvailable: isPsqlAvailable() || getEmbeddedPostgresRuntime().available,
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

function getPostgresConnectionConfig(settings) {
  const connectionString = process.env.XINYUEXIA_DATABASE_URL || process.env.DATABASE_URL;
  if (connectionString) {
    return {
      connectionString,
      connectionTimeoutMillis: 2500,
    };
  }
  return {
    host: settings.host,
    port: settings.port,
    database: settings.databaseName,
    user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || undefined,
    connectionTimeoutMillis: 2500,
  };
}

function hasExternalDatabaseUrl() {
  return Boolean(process.env.XINYUEXIA_DATABASE_URL || process.env.DATABASE_URL);
}

function getLocalPostgresConnectionConfig(settings, databaseName = settings.databaseName) {
  return {
    host: settings.host || '127.0.0.1',
    port: settings.port,
    database: databaseName,
    user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || undefined,
    connectionTimeoutMillis: 1000,
  };
}

async function waitForPostgresReady(settings, databaseName = 'postgres', timeoutMs = 15000) {
  if (!PgClient) return { ok: false, message: 'PostgreSQL driver is not installed.' };
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    const client = new PgClient(getLocalPostgresConnectionConfig(settings, databaseName));
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      return { ok: true };
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        // Ignore close errors while waiting for startup.
      }
      await wait(400);
    }
  }
  return {
    ok: false,
    message: lastError instanceof Error ? lastError.message : 'PostgreSQL did not become ready in time.',
  };
}

async function ensureEmbeddedPostgresDatabase(settings) {
  if (!PgClient) return { ok: false, message: 'PostgreSQL driver is not installed.' };
  const databaseName = settings.databaseName || 'yuexia';
  const adminClient = new PgClient(getLocalPostgresConnectionConfig(settings, 'postgres'));
  try {
    await adminClient.connect();
    const existing = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (existing.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${quotePgIdentifier(databaseName)}`);
    }
  } finally {
    try {
      await adminClient.end();
    } catch {
      // Ignore close errors.
    }
  }

  const appClient = new PgClient(getLocalPostgresConnectionConfig(settings, databaseName));
  try {
    await appClient.connect();
    await appClient.query(DATABASE_SCHEMA_SQL);
    return { ok: true, message: 'Embedded PostgreSQL schema is ready.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Failed to initialize embedded PostgreSQL schema.',
    };
  } finally {
    try {
      await appClient.end();
    } catch {
      // Ignore close errors.
    }
  }
}

function getEmbeddedPostgresStatus(dataDir = DEFAULT_DATABASE_DIR) {
  const settings = readDatabaseSettingsFromDisk(dataDir);
  const runtime = getEmbeddedPostgresRuntime();
  const postgresDataDir = getPostgresDataDir(settings);
  const initialized = isPostgresDataDirInitialized(postgresDataDir);
  let running = false;
  let statusMessage = '';
  if (runtime.available && initialized) {
    const status = runPostgresTool(runtime, runtime.pgCtl, ['status', '-D', postgresDataDir], { timeout: 3500 });
    running = status.ok;
    statusMessage = status.message;
  }
  return {
    ok: true,
    runtimeAvailable: runtime.available,
    runtimePath: runtime.root,
    binDir: runtime.binDir,
    missing: runtime.missing || [],
    dataDir: postgresDataDir,
    initialized,
    running,
    managedByApp: Boolean(embeddedPostgresProcess && !embeddedPostgresProcess.killed),
    host: settings.host,
    port: settings.port,
    databaseName: settings.databaseName,
    message: runtime.available
      ? (statusMessage || 'Embedded PostgreSQL runtime is available.')
      : `Place portable PostgreSQL files in ${runtime.root || 'runtime/postgres'}.`,
  };
}

async function initializeEmbeddedPostgres(dataDir = DEFAULT_DATABASE_DIR) {
  const runtime = getEmbeddedPostgresRuntime();
  let settings = readDatabaseSettingsFromDisk(dataDir);
  settings = writeDatabaseFiles({
    ...settings,
    host: '127.0.0.1',
    port: settings.port === 5432 ? DEFAULT_EMBEDDED_POSTGRES_PORT : settings.port,
  });

  if (!runtime.available) {
    return {
      ok: false,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      embedded: getEmbeddedPostgresStatus(settings.dataDir),
      message: `未找到内置 PostgreSQL。请把便携版 PostgreSQL 放到 ${runtime.root || 'runtime/postgres'}。`,
    };
  }

  const postgresDataDir = getPostgresDataDir(settings);
  if (!isPostgresDataDirInitialized(postgresDataDir)) {
    fs.mkdirSync(postgresDataDir, { recursive: true });
    const init = runPostgresTool(
      runtime,
      runtime.initdb,
      ['-D', postgresDataDir, '-U', 'postgres', '-A', 'trust', '-E', 'UTF8', '--locale=C'],
      { timeout: 60000 },
    );
    if (!init.ok) {
      return {
        ok: false,
        settings,
        status: getDatabaseDirectoryStatus(settings.dataDir),
        embedded: getEmbeddedPostgresStatus(settings.dataDir),
        message: init.message || '初始化内置 PostgreSQL 数据目录失败。',
      };
    }
  }

  return {
    ok: true,
    settings,
    status: getDatabaseDirectoryStatus(settings.dataDir),
    embedded: getEmbeddedPostgresStatus(settings.dataDir),
    message: '内置 PostgreSQL 数据目录已准备。',
  };
}

async function startEmbeddedPostgres(dataDir = DEFAULT_DATABASE_DIR) {
  if (hasExternalDatabaseUrl()) {
    const settings = readDatabaseSettingsFromDisk(dataDir);
    return {
      ok: false,
      settings,
      status: getDatabaseDirectoryStatus(settings.dataDir),
      embedded: getEmbeddedPostgresStatus(settings.dataDir),
      message: '当前配置了外部 DATABASE_URL，已跳过内置 PostgreSQL 启动。',
    };
  }

  const init = await initializeEmbeddedPostgres(dataDir);
  if (!init.ok) return init;
  const runtime = getEmbeddedPostgresRuntime();
  let settings = init.settings;
  embeddedPostgresSettingsDir = settings.dataDir;
  const postgresDataDir = getPostgresDataDir(settings);

  const currentStatus = getEmbeddedPostgresStatus(settings.dataDir);
  if (!currentStatus.running) {
    const port = await findEmbeddedPostgresPort(settings.port);
    settings = writeDatabaseFiles({ ...settings, host: '127.0.0.1', port });

    embeddedPostgresProcess = spawn(
      runtime.postgres,
      ['-D', postgresDataDir, '-h', '127.0.0.1', '-p', String(port)],
      {
        cwd: runtime.root,
        env: getPostgresToolEnv(runtime),
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    embeddedPostgresProcess.once('exit', () => {
      embeddedPostgresProcess = null;
    });

    const ready = await waitForPostgresReady(settings, 'postgres', 18000);
    if (!ready.ok) {
      if (embeddedPostgresProcess && !embeddedPostgresProcess.killed) embeddedPostgresProcess.kill();
      return {
        ok: false,
        settings,
        status: getDatabaseDirectoryStatus(settings.dataDir),
        embedded: getEmbeddedPostgresStatus(settings.dataDir),
        message: ready.message || '内置 PostgreSQL 启动超时。',
      };
    }
  }

  const schema = await ensureEmbeddedPostgresDatabase(settings);
  return {
    ok: schema.ok,
    settings,
    status: getDatabaseDirectoryStatus(settings.dataDir),
    embedded: getEmbeddedPostgresStatus(settings.dataDir),
    message: schema.ok ? '内置 PostgreSQL 已启动，数据库结构已准备。' : schema.message,
  };
}

async function stopEmbeddedPostgres(dataDir = DEFAULT_DATABASE_DIR) {
  const settings = readDatabaseSettingsFromDisk(dataDir);
  const runtime = getEmbeddedPostgresRuntime();
  const postgresDataDir = getPostgresDataDir(settings);
  let ok = true;
  let message = '内置 PostgreSQL 已停止。';

  if (runtime.available && isPostgresDataDirInitialized(postgresDataDir)) {
    const stopped = runPostgresTool(runtime, runtime.pgCtl, ['stop', '-D', postgresDataDir, '-m', 'fast', '-w'], { timeout: 20000 });
    ok = stopped.ok || stopped.message.includes('no server running');
    message = ok ? message : (stopped.message || '停止内置 PostgreSQL 失败。');
  }
  if (embeddedPostgresProcess && !embeddedPostgresProcess.killed) {
    embeddedPostgresProcess.kill();
    embeddedPostgresProcess = null;
  }

  return {
    ok,
    settings,
    status: getDatabaseDirectoryStatus(settings.dataDir),
    embedded: getEmbeddedPostgresStatus(settings.dataDir),
    message,
  };
}

async function withPostgresClient(dataDir, action) {
  if (!PgClient) {
    return { ok: false, exists: false, data: [], message: 'PostgreSQL driver is not installed.' };
  }
  let settings = readDatabaseSettingsFromDisk(dataDir);
  let client = new PgClient(getPostgresConnectionConfig(settings));
  try {
    await client.connect();
    await client.query(DATABASE_SCHEMA_SQL);
    return await action(client, settings);
  } catch (error) {
    if (!hasExternalDatabaseUrl() && getEmbeddedPostgresRuntime().available) {
      try {
        await client.end();
      } catch {
        // Ignore close errors before retrying with embedded PostgreSQL.
      }
      const started = await startEmbeddedPostgres(dataDir);
      if (started.ok) {
        settings = readDatabaseSettingsFromDisk(dataDir);
        client = new PgClient(getPostgresConnectionConfig(settings));
        try {
          await client.connect();
          await client.query(DATABASE_SCHEMA_SQL);
          return await action(client, settings);
        } catch (retryError) {
          return {
            ok: false,
            exists: false,
            data: [],
            message: retryError instanceof Error ? retryError.message : 'PostgreSQL operation failed after embedded startup.',
          };
        }
      }
    }
    return {
      ok: false,
      exists: false,
      data: [],
      message: error instanceof Error ? error.message : 'PostgreSQL operation failed.',
    };
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore close errors after a failed connection.
    }
  }
}

function textArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function parsePostgresArray(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  return value
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((item) => item.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
}

function parsePostgresVector(value) {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (typeof value !== 'string') return [];
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);
}

function createRuntimeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function tokenSet(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .split(/[\s,，、。！？；;:："'“”‘’（）()【】\[\]<>《》\n\r]+/)
      .filter((item) => item.length >= 2),
  );
}

function dotProduct(left, right) {
  const length = Math.min(left.length, right.length);
  let total = 0;
  for (let index = 0; index < length; index += 1) total += left[index] * right[index];
  return total;
}

function vectorNorm(vector) {
  return Math.sqrt(dotProduct(vector, vector)) || 1;
}

function hashTextEmbedding(text, dimension = POSTGRES_VECTOR_DIMENSION) {
  const vector = Array.from({ length: dimension }, () => 0);
  Array.from(tokenSet(text)).forEach((token) => {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const slot = Math.abs(hash) % dimension;
    vector[slot] += hash % 2 === 0 ? 1 : -1;
  });
  const length = vectorNorm(vector);
  return vector.map((value) => Number((value / length).toFixed(6)));
}

function keywordScore(query, row) {
  const words = tokenSet(query);
  if (words.size === 0) return 0;
  const haystack = [
    row.title,
    row.canonical_name,
    parsePostgresArray(row.aliases).join(' '),
    parsePostgresArray(row.tags).join(' '),
    parsePostgresArray(row.keywords).join(' '),
    row.summary,
    row.organized_text,
    row.original_text,
  ].join(' ').toLowerCase();
  let score = 0;
  words.forEach((word) => {
    if (haystack.includes(word)) score += 1;
  });
  return score / words.size;
}

function importanceBoost(importance) {
  if (importance === '核心') return 1.4;
  if (importance === '重要') return 1.2;
  if (importance === '素材') return 0.85;
  if (importance === '废案') return 0.2;
  return 1;
}

function buildRetrievedSetting(row, distance, reason, query) {
  const keyword = keywordScore(query, row);
  const similarity = Math.max(0, 1 - Number(distance || 0));
  const priority = importanceBoost(String(row.importance || '普通')) * Math.max(0.2, Number(row.rag_weight) || 1);
  const score = ((similarity * 0.58) + (keyword * 0.42)) * priority + (row.is_favorite ? 0.08 : 0);
  return {
    item: {
      id: String(row.id),
      projectId: String(row.project_id),
      userId: String(row.user_id || 'local-user'),
      sourceId: row.source_id ? String(row.source_id) : undefined,
      sourceChunkId: row.source_chunk_id ? String(row.source_chunk_id) : undefined,
      title: String(row.title || ''),
      canonicalName: String(row.canonical_name || row.title || ''),
      aliases: parsePostgresArray(row.aliases),
      category: String(row.category || '未分类'),
      subcategory: String(row.subcategory || ''),
      tags: parsePostgresArray(row.tags),
      keywords: parsePostgresArray(row.keywords),
      summary: String(row.summary || ''),
      originalText: String(row.original_text || ''),
      organizedText: String(row.organized_text || ''),
      evidenceText: String(row.evidence_text || ''),
      evidenceLocation: String(row.evidence_location || ''),
      status: String(row.status || '待确认'),
      confidence: Number(row.confidence) || 0.65,
      allowRag: Boolean(row.allow_rag),
      isVerified: Boolean(row.is_verified),
      isFavorite: Boolean(row.is_favorite),
      isLocked: Boolean(row.is_locked),
      importance: String(row.importance || '普通'),
      ragWeight: Number(row.rag_weight) || 1,
      worldline: String(row.worldline || '主线'),
      relatedItems: parsePostgresArray(row.related_items),
      metadata: plainObject(row.metadata),
      vectorStatus: '已生成向量',
      embeddingModel: String(row.embedding_model || ''),
      embeddingText: String(row.embedding_text || ''),
      embeddingCreatedAt: row.embedding_created_at?.toISOString?.() ?? (row.embedding_created_at ? String(row.embedding_created_at) : undefined),
      createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
      updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at || ''),
      changeLogs: [],
    },
    distance: Number(Number(distance || 0).toFixed(4)),
    score: Number(score.toFixed(4)),
    reason,
  };
}

function buildMoonfallRagContext(results) {
  if (!Array.isArray(results) || results.length === 0) return '';
  const grouped = new Map();
  results.forEach((result) => {
    const category = result.item.category || '未分类';
    const list = grouped.get(category) ?? [];
    list.push(result);
    grouped.set(category, list);
  });
  return [
    '以下是本次写作必须参考的设定资料，请严格遵守，不要违背：',
    ...Array.from(grouped.entries()).flatMap(([category, items]) => [
      '',
      `【${category}】`,
      ...items.map((result, index) => {
        const content = result.item.organizedText || result.item.summary || result.item.originalText;
        return `${index + 1}. 标题：${result.item.title}\n内容：${content}`;
      }),
    ]),
    '',
    '请基于以上设定继续写作。',
  ].join('\n');
}

function normalizeRagInput(input) {
  const value = input && typeof input === 'object' ? input : {};
  return {
    projectId: String(value.projectId || '').trim(),
    userId: String(value.userId || 'local-user').trim(),
    query: String(value.query || '').trim(),
    categories: textArray(value.categories),
    tags: textArray(value.tags),
    limit: Math.max(1, Math.min(50, Number(value.limit) || 10)),
    purpose: String(value.purpose || 'writing'),
    includeUnverified: Boolean(value.includeUnverified),
    similarityThreshold: Number.isFinite(Number(value.similarityThreshold)) ? Number(value.similarityThreshold) : 0,
  };
}

function buildMoonfallWhereClause(input, startIndex = 2) {
  const clauses = [
    `si.project_id = $${startIndex}`,
    `($${startIndex + 1}::text = '' OR si.user_id = $${startIndex + 1})`,
    `si.status <> '废案'`,
    `si.importance <> '废案'`,
  ];
  const params = [input.projectId, input.userId];
  let index = startIndex + 2;
  if (!input.includeUnverified) {
    clauses.push('si.allow_rag = true');
    clauses.push('si.is_verified = true');
  }
  if (input.categories.length > 0) {
    clauses.push(`si.category = ANY($${index}::text[])`);
    params.push(input.categories);
    index += 1;
  }
  if (input.tags.length > 0) {
    clauses.push(`si.tags && $${index}::text[]`);
    params.push(input.tags);
    index += 1;
  }
  return { clause: clauses.join(' AND '), params, nextIndex: index };
}

async function retrieveMoonfallRagFromPostgres(inputValue, dataDir = DEFAULT_DATABASE_DIR) {
  const input = normalizeRagInput(inputValue);
  if (!input.projectId || !input.query) {
    return { ok: false, exists: false, data: [], message: 'Missing projectId or query.' };
  }

  return withPostgresClient(dataDir, async (client) => {
    const queryVector = `[${hashTextEmbedding(input.query, POSTGRES_VECTOR_DIMENSION).join(',')}]`;
    const where = buildMoonfallWhereClause(input, 2);
    const vectorLimitIndex = where.nextIndex;
    const vectorLimit = Math.max(input.limit * 4, input.limit);
    const vectorResult = await client.query(
      `SELECT
         si.*,
         se.embedding_model,
         se.embedding_text,
         se.created_at AS embedding_created_at,
         se.embedding <=> $1::vector AS distance
       FROM setting_embeddings se
       JOIN setting_items si ON si.id = se.setting_item_id
       WHERE ${where.clause}
       AND se.embedding IS NOT NULL
       ORDER BY se.embedding <=> $1::vector
       LIMIT $${vectorLimitIndex}`,
      [queryVector, ...where.params, vectorLimit],
    );

    const keywordWords = Array.from(tokenSet(input.query)).slice(0, 10);
    const keywordRows = [];
    if (keywordWords.length > 0) {
      const keywordWhere = buildMoonfallWhereClause(input, 1);
      const patternIndex = keywordWhere.nextIndex;
      const limitIndex = patternIndex + 1;
      const keywordResult = await client.query(
        `SELECT
           si.*,
           se.embedding_model,
           se.embedding_text,
           se.created_at AS embedding_created_at,
           0.75::double precision AS distance
         FROM setting_items si
         LEFT JOIN setting_embeddings se ON si.id = se.setting_item_id
         WHERE ${keywordWhere.clause}
         AND concat_ws(' ', si.title, si.canonical_name, si.summary, si.organized_text, si.original_text) ILIKE ANY($${patternIndex}::text[])
         ORDER BY si.updated_at DESC
         LIMIT $${limitIndex}`,
        [...keywordWhere.params, keywordWords.map((word) => `%${word}%`), vectorLimit],
      );
      keywordRows.push(...keywordResult.rows);
    }

    const merged = new Map();
    vectorResult.rows.forEach((row) => {
      merged.set(String(row.id), buildRetrievedSetting(row, row.distance, 'pgvector 语义检索', input.query));
    });
    keywordRows.forEach((row) => {
      const id = String(row.id);
      const existing = merged.get(id);
      const next = buildRetrievedSetting(row, row.distance, existing ? 'pgvector+关键词混合检索' : '关键词检索', input.query);
      if (!existing || next.score > existing.score) merged.set(id, next);
    });

    const results = Array.from(merged.values())
      .filter((result) => input.similarityThreshold <= 0 || 1 - result.distance >= input.similarityThreshold || result.reason.includes('关键词'))
      .sort((left, right) => right.score - left.score)
      .slice(0, input.limit);
    const log = {
      id: createRuntimeId('retrieval'),
      projectId: input.projectId,
      userId: input.userId || 'local-user',
      query: input.query,
      retrievedSettingIds: results.map((result) => result.item.id),
      retrievedChunkIds: results.map((result) => result.item.sourceChunkId).filter(Boolean),
      purpose: input.purpose,
      metadata: { engine: 'postgresql-pgvector', scores: results.map((result) => ({ id: result.item.id, score: result.score, distance: result.distance, reason: result.reason })) },
      createdAt: new Date().toISOString(),
    };

    await client.query(
      `INSERT INTO retrieval_logs (id, project_id, user_id, query, retrieved_setting_ids, retrieved_chunk_ids, purpose, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        log.id,
        log.projectId,
        log.userId,
        log.query,
        log.retrievedSettingIds,
        log.retrievedChunkIds,
        log.purpose,
        log.metadata,
        dateValue(log.createdAt),
      ],
    );

    return {
      ok: true,
      exists: true,
      data: [{
        results,
        contextText: buildMoonfallRagContext(results),
        log,
      }],
      message: 'Moonfall settings retrieved with PostgreSQL pgvector.',
    };
  });
}

async function writeMoonfallStateToPostgres(stateInput, dataDir = DEFAULT_DATABASE_DIR) {
  const state = stateInput && typeof stateInput === 'object' ? stateInput : null;
  if (!state || !Array.isArray(state.projects)) {
    return { ok: false, exists: false, data: [], message: 'Invalid moonfall state.' };
  }

  return withPostgresClient(dataDir, async (client) => {
    await client.query('BEGIN');
    try {
      for (const project of state.projects ?? []) {
        await client.query(
          `INSERT INTO projects (id, user_id, name, description, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             user_id = EXCLUDED.user_id,
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             metadata = EXCLUDED.metadata,
             updated_at = EXCLUDED.updated_at
           WHERE projects.updated_at <= EXCLUDED.updated_at`,
          [
            String(project.id),
            String(project.userId || 'local-user'),
            String(project.name || ''),
            String(project.description || ''),
            plainObject(project.metadata),
            dateValue(project.createdAt),
            dateValue(project.updatedAt),
          ],
        );
      }

      for (const source of state.sources ?? []) {
        await client.query(
          `INSERT INTO sources (id, project_id, user_id, title, source_type, author, description, original_filename, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             project_id = EXCLUDED.project_id,
             user_id = EXCLUDED.user_id,
             title = EXCLUDED.title,
             source_type = EXCLUDED.source_type,
             author = EXCLUDED.author,
             description = EXCLUDED.description,
             original_filename = EXCLUDED.original_filename,
             metadata = EXCLUDED.metadata,
             updated_at = EXCLUDED.updated_at
           WHERE sources.updated_at <= EXCLUDED.updated_at`,
          [
            String(source.id),
            String(source.projectId),
            String(source.userId || 'local-user'),
            String(source.title || ''),
            String(source.sourceType || 'manual'),
            String(source.author || ''),
            String(source.description || ''),
            source.originalFilename ? String(source.originalFilename) : null,
            plainObject(source.metadata),
            dateValue(source.createdAt),
            dateValue(source.updatedAt),
          ],
        );
      }

      for (const chunk of state.sourceChunks ?? []) {
        await client.query(
          `INSERT INTO source_chunks (id, project_id, source_id, chunk_index, chapter_title, content, token_count, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            String(chunk.id),
            String(chunk.projectId),
            String(chunk.sourceId),
            Number(chunk.chunkIndex) || 0,
            String(chunk.chapterTitle || ''),
            String(chunk.content || ''),
            Number(chunk.tokenCount) || 0,
            plainObject(chunk.metadata),
            dateValue(chunk.createdAt),
          ],
        );
      }

      for (const item of state.settings ?? []) {
        await client.query(
          `INSERT INTO setting_items (
            id, project_id, user_id, source_id, source_chunk_id, title, canonical_name, aliases,
            category, subcategory, tags, keywords, summary, original_text, organized_text,
            evidence_text, evidence_location, status, confidence, allow_rag, is_verified,
            is_favorite, is_locked, importance, rag_weight, worldline, version, related_items,
            metadata, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25, $26, $27, $28,
            $29, $30, $31
          )
          ON CONFLICT (id) DO UPDATE SET
            project_id = EXCLUDED.project_id,
            user_id = EXCLUDED.user_id,
            source_id = EXCLUDED.source_id,
            source_chunk_id = EXCLUDED.source_chunk_id,
            title = EXCLUDED.title,
            canonical_name = EXCLUDED.canonical_name,
            aliases = EXCLUDED.aliases,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            tags = EXCLUDED.tags,
            keywords = EXCLUDED.keywords,
            summary = EXCLUDED.summary,
            original_text = EXCLUDED.original_text,
            organized_text = EXCLUDED.organized_text,
            evidence_text = EXCLUDED.evidence_text,
            evidence_location = EXCLUDED.evidence_location,
            status = EXCLUDED.status,
            confidence = EXCLUDED.confidence,
            allow_rag = EXCLUDED.allow_rag,
            is_verified = EXCLUDED.is_verified,
            is_favorite = EXCLUDED.is_favorite,
            is_locked = EXCLUDED.is_locked,
            importance = EXCLUDED.importance,
            rag_weight = EXCLUDED.rag_weight,
            worldline = EXCLUDED.worldline,
            version = EXCLUDED.version,
            related_items = EXCLUDED.related_items,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
          WHERE setting_items.updated_at <= EXCLUDED.updated_at`,
          [
            String(item.id),
            String(item.projectId),
            String(item.userId || 'local-user'),
            item.sourceId ? String(item.sourceId) : null,
            item.sourceChunkId ? String(item.sourceChunkId) : null,
            String(item.title || ''),
            String(item.canonicalName || item.title || ''),
            textArray(item.aliases),
            String(item.category || '未分类'),
            String(item.subcategory || ''),
            textArray(item.tags),
            textArray(item.keywords),
            String(item.summary || ''),
            String(item.originalText || ''),
            String(item.organizedText || ''),
            String(item.evidenceText || item.originalText || ''),
            String(item.evidenceLocation || ''),
            String(item.status || '待确认'),
            Number(item.confidence) || 0.65,
            Boolean(item.allowRag),
            Boolean(item.isVerified),
            Boolean(item.isFavorite),
            Boolean(item.isLocked),
            String(item.importance || '普通'),
            Number(item.ragWeight) || 1,
            String(item.worldline || '主线'),
            String(item.version || ''),
            textArray(item.relatedItems),
            plainObject(item.metadata),
            dateValue(item.createdAt),
            dateValue(item.updatedAt),
          ],
        );

        if (Array.isArray(item.embeddingVector) && item.embeddingVector.length === POSTGRES_VECTOR_DIMENSION) {
          const vector = `[${item.embeddingVector.join(',')}]`;
          await client.query(
            `INSERT INTO setting_embeddings (id, project_id, setting_item_id, embedding_model, embedding, embedding_text, created_at)
             VALUES ($1, $2, $3, $4, $5::vector, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               project_id = EXCLUDED.project_id,
               setting_item_id = EXCLUDED.setting_item_id,
               embedding_model = CASE
                 WHEN EXCLUDED.embedding_model <> '' THEN EXCLUDED.embedding_model
                 ELSE setting_embeddings.embedding_model
               END,
               embedding = COALESCE(EXCLUDED.embedding, setting_embeddings.embedding),
               embedding_text = CASE
                 WHEN EXCLUDED.embedding_text <> '' THEN EXCLUDED.embedding_text
                 ELSE setting_embeddings.embedding_text
               END,
               created_at = EXCLUDED.created_at
             WHERE setting_embeddings.created_at <= EXCLUDED.created_at`,
            [
              `${item.id}-embedding`,
              String(item.projectId),
              String(item.id),
              String(item.embeddingModel || ''),
              vector,
              String(item.embeddingText || ''),
              dateValue(item.embeddingCreatedAt || item.updatedAt || item.createdAt),
            ],
          );
        }

        for (const log of item.changeLogs ?? []) {
          await client.query(
            `INSERT INTO setting_change_logs (id, project_id, setting_item_id, action, detail, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [
              String(log.id),
              String(item.projectId),
              String(item.id),
              String(log.action || ''),
              String(log.detail || ''),
              dateValue(log.createdAt),
            ],
          );
        }
      }

      for (const relation of state.relations ?? []) {
        await client.query(
          `INSERT INTO setting_relations (id, project_id, from_setting_id, to_setting_id, relation_type, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             project_id = EXCLUDED.project_id,
             from_setting_id = EXCLUDED.from_setting_id,
             to_setting_id = EXCLUDED.to_setting_id,
             relation_type = EXCLUDED.relation_type,
             description = EXCLUDED.description,
             created_at = EXCLUDED.created_at
           WHERE setting_relations.created_at <= EXCLUDED.created_at`,
          [
            String(relation.id),
            String(relation.projectId),
            String(relation.fromSettingId),
            String(relation.toSettingId),
            String(relation.relationType || 'related_to'),
            String(relation.description || ''),
            dateValue(relation.createdAt),
          ],
        );
      }

      for (const log of state.retrievalLogs ?? []) {
        await client.query(
          `INSERT INTO retrieval_logs (id, project_id, user_id, query, retrieved_setting_ids, retrieved_chunk_ids, purpose, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            String(log.id),
            String(log.projectId),
            String(log.userId || 'local-user'),
            String(log.query || ''),
            textArray(log.retrievedSettingIds),
            textArray(log.retrievedChunkIds),
            String(log.purpose || 'writing'),
            plainObject(log.metadata),
            dateValue(log.createdAt),
          ],
        );
      }

      await client.query(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [
          'moonfall_settings_state_meta',
          {
            activeProjectId: state.activeProjectId,
            config: state.config ?? {},
            importTasks: Array.isArray(state.importTasks) ? state.importTasks : [],
          },
        ],
      );

      await client.query('COMMIT');
      return { ok: true, exists: true, data: [state], message: 'Moonfall settings incrementally synced to PostgreSQL.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function readMoonfallStateFromPostgres(dataDir = DEFAULT_DATABASE_DIR) {
  return withPostgresClient(dataDir, async (client) => {
    const projects = (await client.query(
      `SELECT id, user_id, name, description, metadata, created_at, updated_at
       FROM projects
       ORDER BY created_at ASC`,
    )).rows;
    if (projects.length === 0) return { ok: true, exists: false, data: [] };

    const projectIds = projects.map((project) => String(project.id));
    const [
      sourcesResult,
      chunksResult,
      settingsResult,
      embeddingsResult,
      relationsResult,
      retrievalLogsResult,
      changeLogsResult,
      metaResult,
    ] = await Promise.all([
      client.query('SELECT * FROM sources WHERE project_id = ANY($1::text[]) ORDER BY created_at DESC', [projectIds]),
      client.query('SELECT * FROM source_chunks WHERE project_id = ANY($1::text[]) ORDER BY source_id ASC, chunk_index ASC', [projectIds]),
      client.query('SELECT * FROM setting_items WHERE project_id = ANY($1::text[]) ORDER BY updated_at DESC', [projectIds]),
      client.query('SELECT * FROM setting_embeddings WHERE project_id = ANY($1::text[]) ORDER BY created_at DESC', [projectIds]),
      client.query('SELECT * FROM setting_relations WHERE project_id = ANY($1::text[]) ORDER BY created_at DESC', [projectIds]),
      client.query('SELECT * FROM retrieval_logs WHERE project_id = ANY($1::text[]) ORDER BY created_at DESC LIMIT 300', [projectIds]),
      client.query('SELECT * FROM setting_change_logs WHERE project_id = ANY($1::text[]) ORDER BY created_at DESC', [projectIds]),
      client.query('SELECT value FROM app_settings WHERE key = $1', ['moonfall_settings_state_meta']),
    ]);

    const embeddingsBySetting = new Map();
    embeddingsResult.rows.forEach((row) => {
      if (!embeddingsBySetting.has(row.setting_item_id)) embeddingsBySetting.set(row.setting_item_id, row);
    });
    const changeLogsBySetting = new Map();
    changeLogsResult.rows.forEach((row) => {
      const list = changeLogsBySetting.get(row.setting_item_id) ?? [];
      list.push({
        id: String(row.id),
        action: String(row.action || ''),
        detail: String(row.detail || ''),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
      });
      changeLogsBySetting.set(row.setting_item_id, list);
    });

    const meta = plainObject(metaResult.rows[0]?.value);
    const state = {
      projects: projects.map((row) => ({
        id: String(row.id),
        userId: String(row.user_id || 'local-user'),
        name: String(row.name || ''),
        description: String(row.description || ''),
        metadata: plainObject(row.metadata),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
        updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at || ''),
      })),
      activeProjectId: String(meta.activeProjectId || projects[0].id),
      sources: sourcesResult.rows.map((row) => ({
        id: String(row.id),
        projectId: String(row.project_id),
        userId: String(row.user_id || 'local-user'),
        title: String(row.title || ''),
        sourceType: String(row.source_type || 'manual'),
        author: String(row.author || ''),
        description: String(row.description || ''),
        originalFilename: row.original_filename ? String(row.original_filename) : undefined,
        metadata: plainObject(row.metadata),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
        updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at || ''),
      })),
      sourceChunks: chunksResult.rows.map((row) => ({
        id: String(row.id),
        projectId: String(row.project_id),
        sourceId: String(row.source_id),
        chunkIndex: Number(row.chunk_index) || 0,
        chapterTitle: String(row.chapter_title || ''),
        content: String(row.content || ''),
        tokenCount: Number(row.token_count) || 0,
        metadata: plainObject(row.metadata),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
      })),
      settings: settingsResult.rows.map((row) => {
        const embedding = embeddingsBySetting.get(row.id);
        const embeddingVector = embedding?.embedding ? parsePostgresVector(embedding.embedding) : undefined;
        return {
          id: String(row.id),
          projectId: String(row.project_id),
          userId: String(row.user_id || 'local-user'),
          sourceId: row.source_id ? String(row.source_id) : undefined,
          sourceChunkId: row.source_chunk_id ? String(row.source_chunk_id) : undefined,
          title: String(row.title || ''),
          canonicalName: String(row.canonical_name || row.title || ''),
          aliases: parsePostgresArray(row.aliases),
          category: String(row.category || '未分类'),
          subcategory: String(row.subcategory || ''),
          tags: parsePostgresArray(row.tags),
          keywords: parsePostgresArray(row.keywords),
          summary: String(row.summary || ''),
          originalText: String(row.original_text || ''),
          organizedText: String(row.organized_text || ''),
          evidenceText: String(row.evidence_text || ''),
          evidenceLocation: String(row.evidence_location || ''),
          status: String(row.status || '待确认'),
          confidence: Number(row.confidence) || 0.65,
          allowRag: Boolean(row.allow_rag),
          isVerified: Boolean(row.is_verified),
          isFavorite: Boolean(row.is_favorite),
          isLocked: Boolean(row.is_locked),
          importance: String(row.importance || '普通'),
          ragWeight: Number(row.rag_weight) || 1,
          worldline: String(row.worldline || '主线'),
          version: String(row.version || ''),
          relatedItems: parsePostgresArray(row.related_items),
          metadata: plainObject(row.metadata),
          vectorStatus: embeddingVector?.length === POSTGRES_VECTOR_DIMENSION ? '已生成向量' : '未生成向量',
          embeddingModel: embedding ? String(embedding.embedding_model || '') : undefined,
          embeddingText: embedding ? String(embedding.embedding_text || '') : undefined,
          embeddingVector,
          embeddingCreatedAt: embedding?.created_at?.toISOString?.() ?? (embedding?.created_at ? String(embedding.created_at) : undefined),
          createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
          updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at || ''),
          changeLogs: changeLogsBySetting.get(row.id) ?? [],
        };
      }),
      relations: relationsResult.rows.map((row) => ({
        id: String(row.id),
        projectId: String(row.project_id),
        fromSettingId: String(row.from_setting_id),
        toSettingId: String(row.to_setting_id),
        relationType: String(row.relation_type || 'related_to'),
        description: String(row.description || ''),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
      })),
      retrievalLogs: retrievalLogsResult.rows.map((row) => ({
        id: String(row.id),
        projectId: String(row.project_id),
        userId: String(row.user_id || 'local-user'),
        query: String(row.query || ''),
        retrievedSettingIds: parsePostgresArray(row.retrieved_setting_ids),
        retrievedChunkIds: parsePostgresArray(row.retrieved_chunk_ids),
        purpose: String(row.purpose || 'writing'),
        metadata: plainObject(row.metadata),
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at || ''),
      })),
      importTasks: Array.isArray(meta.importTasks) ? meta.importTasks : [],
      config: plainObject(meta.config),
    };

    return { ok: true, exists: true, data: [state], message: 'Moonfall settings loaded from PostgreSQL.' };
  });
}

function resolveStartUrl() {
  if (process.env.XINYUEXIA_URL) {
    return process.env.XINYUEXIA_URL;
  }
  const startHash = process.env.XINYUEXIA_START_HASH || '#/dashboard';
  if (process.env.XINYUEXIA_LOAD_DIST === '1' || app.isPackaged) {
    return new URL(startHash, pathToFileURL(DIST_ENTRY).href).href;
  }
  return new URL(startHash, DEV_URL).href;
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

function getDefaultAppIconPath() {
  return path.join(app.getPath('userData'), DEFAULT_APP_ICON_FILE_NAME);
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

function getRoundedRectCoverage(x, y, width, height, radius) {
  const samples = 3;
  let covered = 0;
  for (let sy = 0; sy < samples; sy += 1) {
    for (let sx = 0; sx < samples; sx += 1) {
      const cx = x + (sx + 0.5) / samples;
      const cy = y + (sy + 0.5) / samples;
      const innerX = Math.max(radius, Math.min(cx, width - radius));
      const innerY = Math.max(radius, Math.min(cy, height - radius));
      const dx = cx - innerX;
      const dy = cy - innerY;
      if (dx * dx + dy * dy <= radius * radius) covered += 1;
    }
  }
  return covered / (samples * samples);
}

function roundAppIconImage(sourceImage) {
  if (!sourceImage || sourceImage.isEmpty()) return sourceImage;
  const image = sourceImage.resize({ width: 256, height: 256, quality: 'best' });
  const size = image.getSize();
  if (!size.width || !size.height) return image;
  const bitmap = image.toBitmap();
  const radius = Math.round(Math.min(size.width, size.height) * 0.22);

  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      const offset = (y * size.width + x) * 4;
      bitmap[offset + 3] = Math.round(bitmap[offset + 3] * getRoundedRectCoverage(x, y, size.width, size.height, radius));
    }
  }

  return nativeImage.createFromBitmap(bitmap, size);
}

function saveIconImage(targetPath, sourceImage) {
  if (!sourceImage || sourceImage.isEmpty()) {
    return { ok: false, message: '无法读取这个图片，请换一张 PNG、JPG、WEBP 或 ICO。' };
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const roundedIcon = roundAppIconImage(sourceImage);
  fs.writeFileSync(targetPath, roundedIcon.toPNG());
  return { ok: true };
}

function saveCustomAppIconFromPath(sourcePath, sourceFileName = '') {
  const sourceImage = nativeImage.createFromPath(sourcePath);
  const saved = saveIconImage(getCustomAppIconPath(), sourceImage);
  if (!saved.ok) return saved;
  if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
  else clearSelectedProjectIconFileName();
  return { ok: true };
}

function saveCustomAppIconFromDataUrl(dataUrl, sourceFileName = '') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return { ok: false, message: '没有读取到可用的首页图标。' };
  }
  const sourceImage = nativeImage.createFromDataURL(dataUrl);
  const saved = saveIconImage(getCustomAppIconPath(), sourceImage);
  if (!saved.ok) return saved;
  if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
  else clearSelectedProjectIconFileName();
  return { ok: true };
}

function saveCurrentIconAsDefault() {
  const sourceImage = nativeImage.createFromPath(getCurrentAppIconPath());
  return saveIconImage(getDefaultAppIconPath(), sourceImage);
}

function getCurrentAppIconPath() {
  const customIcon = getCustomAppIconPath();
  const defaultIcon = getDefaultAppIconPath();
  const projectIcon = getProjectAppIconPath();
  if (fs.existsSync(customIcon)) return customIcon;
  if (fs.existsSync(defaultIcon)) return defaultIcon;
  if (projectIcon) return projectIcon;
  return APP_ICON;
}

function readCurrentAppIcon() {
  const iconPath = getCurrentAppIconPath();
  const image = nativeImage.createFromPath(iconPath);
  const selectedProjectIconFileName = readSelectedProjectIconFileName();
  const defaultIconPath = getDefaultAppIconPath();
  return {
    ok: !image.isEmpty(),
    isCustom: iconPath !== APP_ICON && iconPath !== defaultIconPath,
    isDefaultOverride: iconPath === defaultIconPath,
    projectIconDir: PROJECT_APP_ICON_DIR,
    acceptedFileNames: PROJECT_APP_ICON_FILE_NAMES,
    selectedProjectIconFileName,
    projectIcons: readProjectAppIcons(),
    defaultIconPath,
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

function getCombinedWorkArea() {
  const displays = screen.getAllDisplays();
  if (!displays.length) return screen.getPrimaryDisplay().workArea;
  return displays.reduce((area, display) => {
    const workArea = display.workArea;
    const left = Math.min(area.x, workArea.x);
    const top = Math.min(area.y, workArea.y);
    const right = Math.max(area.x + area.width, workArea.x + workArea.width);
    const bottom = Math.max(area.y + area.height, workArea.y + workArea.height);
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }, displays[0].workArea);
}

function getWorkAreaNearPoint(x, y) {
  try {
    return screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) }).workArea;
  } catch {
    return screen.getPrimaryDisplay().workArea;
  }
}

function clampWindowDragX(x, width) {
  const workArea = getCombinedWorkArea();
  const visibleWidth = Math.min(120, Math.max(40, Math.round(width * 0.15)));
  return clamp(x, workArea.x - width + visibleWidth, workArea.x + workArea.width - visibleWidth);
}

function clampWindowDragY(y, height) {
  const workArea = getCombinedWorkArea();
  const visibleTitlebarHeight = 48;
  const maxY = workArea.y + workArea.height - visibleTitlebarHeight;
  if (height >= workArea.height) return clamp(y, workArea.y, maxY);
  return clamp(y, workArea.y, maxY);
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
    dragSessionId: typeof input.dragSessionId === 'string' ? input.dragSessionId : '',
  };
}

function waitForWindowUnmaximize(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed() || !targetWindow.isMaximized()) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      targetWindow.off('unmaximize', finish);
      resolve();
    };
    const timer = setTimeout(finish, 80);
    targetWindow.once('unmaximize', finish);
    targetWindow.unmaximize();
  });
}

async function beginTitlebarDrag(input) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isFullScreen()) return null;
  const drag = normalizeTitlebarDragInput(input);
  if (!drag) return null;

  const wasMaximized = mainWindow.isMaximized();
  const bounds = mainWindow.getBounds();
  const dragSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (!wasMaximized) {
    titlebarDragSession = {
      id: dragSessionId,
      width: bounds.width,
      height: bounds.height,
      startedAt: Date.now(),
    };
    return {
      dragSessionId,
      isMaximized: false,
      dragOffsetX: drag.screenX - bounds.x,
      dragOffsetY: drag.screenY - bounds.y,
    };
  }

  const workArea = getWorkAreaNearPoint(drag.screenX, drag.screenY);
  const normalBounds = mainWindow.getNormalBounds();
  const restoreWidth = Math.max(
    MIN_WINDOW_WIDTH,
    Math.min(normalBounds.width || DEFAULT_WINDOW_BOUNDS.width, Math.round(workArea.width * 0.85)),
  );
  const restoreHeight = Math.max(
    MIN_WINDOW_HEIGHT,
    Math.min(normalBounds.height || DEFAULT_WINDOW_BOUNDS.height, Math.round(workArea.height * 0.85)),
  );
  const widthRatio =
    Number.isFinite(drag.clientX) && Number.isFinite(drag.windowWidth) && drag.windowWidth > 0
      ? clamp(drag.clientX / drag.windowWidth, 0.08, 0.92)
      : 0.5;
  const titlebarOffsetY = Number.isFinite(drag.clientY) ? clamp(drag.clientY, 0, 56) : 16;
  const dragOffsetX = Math.round(restoreWidth * widthRatio);
  const dragOffsetY = Math.round(titlebarOffsetY);
  const x = clampWindowDragX(drag.screenX - dragOffsetX, restoreWidth);
  const y = clampWindowDragY(drag.screenY - dragOffsetY, restoreHeight);

  await waitForWindowUnmaximize(mainWindow);
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  if (mainWindow.isMaximized()) {
    await waitForWindowUnmaximize(mainWindow);
    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMaximized()) return null;
  }
  mainWindow.setBounds({ x, y, width: restoreWidth, height: restoreHeight }, false);
  titlebarDragSession = {
    id: dragSessionId,
    width: restoreWidth,
    height: restoreHeight,
    startedAt: Date.now(),
  };
  return {
    dragSessionId,
    isMaximized: false,
    dragOffsetX: drag.screenX - x,
    dragOffsetY: drag.screenY - y,
  };
}

function moveTitlebarDrag(input) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isFullScreen()) return false;
  const drag = normalizeTitlebarDragInput(input);
  if (!drag || !Number.isFinite(drag.dragOffsetX) || !Number.isFinite(drag.dragOffsetY)) return false;

  const bounds = mainWindow.getBounds();
  const activeSession = titlebarDragSession
    && (!drag.dragSessionId || titlebarDragSession.id === drag.dragSessionId)
    && Date.now() - titlebarDragSession.startedAt < 30000
      ? titlebarDragSession
      : null;
  const width = activeSession?.width ?? bounds.width;
  const height = activeSession?.height ?? bounds.height;
  const x = clampWindowDragX(Math.round(drag.screenX - drag.dragOffsetX), width);
  const y = clampWindowDragY(Math.round(drag.screenY - drag.dragOffsetY), height);
  mainWindow.setBounds({ x, y, width, height }, false);
  return true;
}

function endTitlebarDrag(input) {
  const drag = normalizeTitlebarDragInput(input);
  if (!drag?.dragSessionId || titlebarDragSession?.id === drag.dragSessionId) {
    titlebarDragSession = null;
  }
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
ipcMain.handle('window:end-titlebar-drag', (_event, input) => endTitlebarDrag(input));

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

ipcMain.handle('app-icon:use-data-url', async (_event, dataUrl, sourceFileName = 'home-icon.png') => {
  try {
    const saved = saveCustomAppIconFromDataUrl(dataUrl, sourceFileName);
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '软件图标已切换为首页图标。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '切换首页图标失败。',
    };
  }
});

ipcMain.handle('app-icon:make-default', async () => {
  try {
    const saved = saveCurrentIconAsDefault();
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '已将当前图标设为默认图标。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '设置默认图标失败。',
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

  const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 60000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      text: error instanceof Error && error.name === 'AbortError'
        ? `Model request timed out after ${timeoutMs}ms.`
        : error instanceof Error ? error.message : 'Model request failed.',
    };
  } finally {
    clearTimeout(timeout);
  }
});

const modelStreamControllers = new Map();

function extractModelStreamParts(payload) {
  const choices = Array.isArray(payload?.choices) ? payload.choices : [];
  const openAiText = choices
    .map((choice) => choice?.delta?.content ?? choice?.message?.content ?? choice?.text ?? '')
    .join('');
  const openAiReasoning = choices
    .map((choice) => (
      choice?.delta?.reasoning_content
      ?? choice?.delta?.reasoning
      ?? choice?.delta?.reasoning_text
      ?? choice?.delta?.thinking
      ?? ''
    ))
    .join('');
  if (openAiText || openAiReasoning) {
    return { content: openAiText, reasoning: openAiReasoning };
  }

  if (payload?.type === 'content_block_delta' && typeof payload?.delta?.text === 'string') {
    return { content: payload.delta.text, reasoning: '' };
  }
  if (
    payload?.type === 'content_block_delta'
    && (payload?.delta?.type === 'thinking_delta' || typeof payload?.delta?.thinking === 'string')
  ) {
    return { content: '', reasoning: payload.delta.thinking ?? '' };
  }
  if (payload?.type === 'message_delta' && typeof payload?.delta?.text === 'string') {
    return { content: payload.delta.text, reasoning: '' };
  }
  if (typeof payload?.reasoning_content === 'string') return { content: '', reasoning: payload.reasoning_content };
  if (typeof payload?.reasoning === 'string') return { content: '', reasoning: payload.reasoning };
  if (typeof payload?.completion === 'string') return { content: payload.completion, reasoning: '' };
  if (typeof payload?.content === 'string') return { content: payload.content, reasoning: '' };
  return { content: '', reasoning: '' };
}

function consumeModelStreamBuffer(buffer, sendChunk) {
  const lines = buffer.split(/\r?\n/);
  const rest = lines.pop() ?? '';
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) continue;
    const dataLine = line.slice(5).trim();
    if (!dataLine || dataLine === '[DONE]') continue;
    try {
      const parts = extractModelStreamParts(JSON.parse(dataLine));
      if (parts.reasoning) sendChunk(parts.reasoning, 'reasoning');
      if (parts.content) sendChunk(parts.content, 'content');
    } catch {
      // Ignore malformed event fragments and keep reading the stream.
    }
  }
  return rest;
}

ipcMain.handle('model:stream', async (event, input) => {
  const request = normalizeModelRequestInput(input);
  if (!request.ok) {
    return { ok: false, status: 400, text: request.message };
  }

  const requestId = typeof input?.requestId === 'string' && input.requestId ? input.requestId : `model-stream-${Date.now()}`;
  const channel = `model:stream:${requestId}`;
  const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 180000;
  const controller = new AbortController();
  modelStreamControllers.set(requestId, controller);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let fullText = '';

  const sendChunk = (text, chunkType = 'content') => {
    if (chunkType === 'content') fullText += text;
    event.sender.send(channel, { type: 'chunk', chunkType, text });
  };

  try {
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      return {
        ok: response.ok,
        status: response.status,
        text: await response.text(),
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = consumeModelStreamBuffer(buffer, sendChunk);
    }
    buffer += decoder.decode();
    consumeModelStreamBuffer(`${buffer}\n`, sendChunk);

    return {
      ok: true,
      status: response.status,
      text: fullText,
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      text: error instanceof Error && error.name === 'AbortError'
        ? `Model request timed out after ${timeoutMs}ms.`
        : error instanceof Error ? error.message : 'Model stream request failed.',
    };
  } finally {
    clearTimeout(timeout);
    modelStreamControllers.delete(requestId);
  }
});

ipcMain.handle('model:cancel-stream', async (_event, requestId) => {
  const controller = modelStreamControllers.get(requestId);
  if (!controller) return false;
  controller.abort();
  modelStreamControllers.delete(requestId);
  return true;
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

ipcMain.handle('database:get-embedded-postgres-status', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return getEmbeddedPostgresStatus(dir);
});

ipcMain.handle('database:initialize-embedded-postgres', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return initializeEmbeddedPostgres(dir);
});

ipcMain.handle('database:start-embedded-postgres', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return startEmbeddedPostgres(dir);
});

ipcMain.handle('database:stop-embedded-postgres', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return stopEmbeddedPostgres(dir);
});

ipcMain.handle('database:read-collection', async (_event, collection, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return readDatabaseCollection(collection, dir);
});

ipcMain.handle('database:write-collection', async (_event, collection, items, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return writeDatabaseCollection(collection, items, dir);
});

ipcMain.handle('database:read-moonfall-postgres', async (_event, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return readMoonfallStateFromPostgres(dir);
});

ipcMain.handle('database:write-moonfall-postgres', async (_event, state, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return writeMoonfallStateToPostgres(state, dir);
});

ipcMain.handle('database:retrieve-moonfall-rag', async (_event, input, dataDir) => {
  const dir = typeof dataDir === 'string' && dataDir.trim() ? dataDir : DEFAULT_DATABASE_DIR;
  return retrieveMoonfallRagFromPostgres(input, dir);
});

app.on('before-quit', () => {
  saveWindowState(mainWindow);
  if (embeddedPostgresProcess) {
    void stopEmbeddedPostgres(embeddedPostgresSettingsDir);
  }
});

app.on('second-instance', () => {
  focusMainWindow();
});

app.whenReady().then(() => {
  createWindow();
  if (getEmbeddedPostgresRuntime().available && !hasExternalDatabaseUrl()) {
    void startEmbeddedPostgres(DEFAULT_DATABASE_DIR);
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else focusMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
