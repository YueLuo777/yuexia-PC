export const DEFAULT_DATABASE_DIR = 'shujuku';

export type DatabaseEngine = 'postgresql-pgvector';
export type DatabaseStatus = 'not_initialized' | 'initialized';

export interface DatabaseSettings {
  engine: DatabaseEngine;
  dataDir: string;
  postgresDataDir: string;
  backupsDir: string;
  exportsDir: string;
  vectorsDir: string;
  databaseName: string;
  host: string;
  port: number;
  status: DatabaseStatus;
  updatedAt?: string;
}

export interface DatabaseDirectoryStatus {
  dataDir: string;
  exists: boolean;
  settingsFileExists: boolean;
  schemaFileExists: boolean;
  psqlAvailable: boolean;
  subdirectories: Record<'postgresData' | 'backups' | 'exports' | 'vectors' | 'records', boolean>;
}

export interface DatabaseActionResult {
  ok: boolean;
  settings: DatabaseSettings;
  status: DatabaseDirectoryStatus;
  message?: string;
}

export const DEFAULT_DATABASE_SETTINGS: DatabaseSettings = {
  engine: 'postgresql-pgvector',
  dataDir: DEFAULT_DATABASE_DIR,
  postgresDataDir: `${DEFAULT_DATABASE_DIR}\\postgres-data`,
  backupsDir: `${DEFAULT_DATABASE_DIR}\\backups`,
  exportsDir: `${DEFAULT_DATABASE_DIR}\\exports`,
  vectorsDir: `${DEFAULT_DATABASE_DIR}\\vectors`,
  databaseName: 'yuexia',
  host: '127.0.0.1',
  port: 5432,
  status: 'not_initialized',
};

const FALLBACK_SETTINGS_KEY = 'xinyuexia_database_settings_v1';

function withDerivedDirs(settings: DatabaseSettings): DatabaseSettings {
  return {
    ...settings,
    postgresDataDir: `${settings.dataDir}\\postgres-data`,
    backupsDir: `${settings.dataDir}\\backups`,
    exportsDir: `${settings.dataDir}\\exports`,
    vectorsDir: `${settings.dataDir}\\vectors`,
  };
}

export function normalizeDatabaseSettings(input?: Partial<DatabaseSettings> | null): DatabaseSettings {
  const merged = {
    ...DEFAULT_DATABASE_SETTINGS,
    ...(input ?? {}),
  };
  return withDerivedDirs({
    ...merged,
    engine: 'postgresql-pgvector',
    port: Number.isFinite(Number(merged.port)) ? Number(merged.port) : DEFAULT_DATABASE_SETTINGS.port,
    status: merged.status === 'initialized' ? 'initialized' : 'not_initialized',
  });
}

export function readFallbackDatabaseSettings(): DatabaseSettings {
  try {
    const raw = localStorage.getItem(FALLBACK_SETTINGS_KEY);
    if (!raw) return DEFAULT_DATABASE_SETTINGS;
    return normalizeDatabaseSettings(JSON.parse(raw) as Partial<DatabaseSettings>);
  } catch {
    return DEFAULT_DATABASE_SETTINGS;
  }
}

export function saveFallbackDatabaseSettings(settings: DatabaseSettings): DatabaseSettings {
  const next = normalizeDatabaseSettings({ ...settings, updatedAt: new Date().toISOString() });
  localStorage.setItem(FALLBACK_SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function makeFallbackDirectoryStatus(settings = readFallbackDatabaseSettings()): DatabaseDirectoryStatus {
  const isInitialized = settings.status === 'initialized';
  return {
    dataDir: settings.dataDir,
    exists: isInitialized,
    settingsFileExists: isInitialized,
    schemaFileExists: isInitialized,
    psqlAvailable: false,
    subdirectories: {
      postgresData: isInitialized,
      backups: isInitialized,
      exports: isInitialized,
      vectors: isInitialized,
      records: isInitialized,
    },
  };
}
