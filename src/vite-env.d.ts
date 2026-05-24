/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PINAI_API_KEY?: string;
  readonly VITE_PINAI_BASE_URL?: string;
  readonly VITE_PINAI_MODEL_ID?: string;
  readonly VITE_PINAI_MODEL_NAME?: string;
}

interface ModelRequestInput {
  endpoint: string;
  headers: Record<string, string>;
  body: string;
}

interface ModelRequestResult {
  ok: boolean;
  status: number;
  text: string;
}

interface DatabaseSettings {
  engine: 'postgresql-pgvector';
  dataDir: string;
  postgresDataDir: string;
  backupsDir: string;
  exportsDir: string;
  vectorsDir: string;
  databaseName: string;
  host: string;
  port: number;
  status: 'not_initialized' | 'initialized';
  updatedAt?: string;
}

interface DatabaseDirectoryStatus {
  dataDir: string;
  exists: boolean;
  settingsFileExists: boolean;
  schemaFileExists: boolean;
  psqlAvailable: boolean;
  subdirectories: {
    postgresData: boolean;
    backups: boolean;
    exports: boolean;
    vectors: boolean;
    records: boolean;
  };
}

interface DatabaseActionResult {
  ok: boolean;
  settings: DatabaseSettings;
  status: DatabaseDirectoryStatus;
  message?: string;
}

type DatabaseCollectionName = 'plotLibrary' | 'plotRecycle' | 'materials';

interface DatabaseCollectionResult<T = unknown> {
  ok: boolean;
  exists: boolean;
  data: T[];
  message?: string;
}

interface AppIconResult {
  ok: boolean;
  isCustom?: boolean;
  projectIconDir?: string;
  acceptedFileNames?: string[];
  selectedProjectIconFileName?: string;
  projectIcons?: Array<{
    fileName: string;
    filePath: string;
    dataUrl: string;
    isSelected?: boolean;
  }>;
  iconPath?: string;
  dataUrl?: string;
  canceled?: boolean;
  message?: string;
}

interface Window {
  xinyuexiaModel?: {
    request(input: ModelRequestInput): Promise<ModelRequestResult>;
  };
  xinyuexiaAppIcon?: {
    read(): Promise<AppIconResult>;
    select(): Promise<AppIconResult>;
    useProjectIcon(fileName: string): Promise<AppIconResult>;
    reset(): Promise<AppIconResult>;
  };
  xinyuexiaDatabase?: {
    ensureDefaultDir(): Promise<DatabaseActionResult>;
    selectDirectory(): Promise<string | null>;
    readSettings(): Promise<DatabaseActionResult>;
    saveSettings(settings: DatabaseSettings): Promise<DatabaseActionResult>;
    getStatus(dataDir?: string): Promise<DatabaseDirectoryStatus>;
    readCollection<T = unknown>(collection: DatabaseCollectionName, dataDir?: string): Promise<DatabaseCollectionResult<T>>;
    writeCollection<T = unknown>(collection: DatabaseCollectionName, items: T[], dataDir?: string): Promise<DatabaseCollectionResult<T>>;
  };
}
