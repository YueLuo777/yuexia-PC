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
  timeoutMs?: number;
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

interface EmbeddedPostgresStatus {
  ok: boolean;
  runtimeAvailable: boolean;
  runtimePath: string;
  binDir: string;
  missing: string[];
  dataDir: string;
  initialized: boolean;
  running: boolean;
  managedByApp: boolean;
  host: string;
  port: number;
  databaseName: string;
  message?: string;
}

interface EmbeddedPostgresActionResult extends DatabaseActionResult {
  embedded: EmbeddedPostgresStatus;
}

type DatabaseCollectionName = 'plotLibrary' | 'plotRecycle' | 'materials' | 'moonfallSettings';

interface DatabaseCollectionResult<T = unknown> {
  ok: boolean;
  exists: boolean;
  data: T[];
  message?: string;
}

interface MoonfallRagRequestInput {
  projectId: string;
  userId?: string;
  query: string;
  categories?: string[];
  tags?: string[];
  limit?: number;
  purpose?: string;
  includeUnverified?: boolean;
  similarityThreshold?: number;
}

interface AppIconResult {
  ok: boolean;
  isCustom?: boolean;
  projectIconDir?: string;
  acceptedFileNames?: string[];
  selectedProjectIconFileName?: string;
  isDefaultOverride?: boolean;
  defaultIconPath?: string;
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
  xinyuexiaLaunch?: {
    disableAdjustmentMode: boolean;
  };
  xinyuexiaModel?: {
    request(input: ModelRequestInput): Promise<ModelRequestResult>;
    stream(
      input: ModelRequestInput & { requestId?: string },
      onChunk: (payload: string | { type: 'content' | 'reasoning'; text: string }) => void,
    ): Promise<ModelRequestResult>;
    cancelStream(requestId: string): Promise<boolean>;
  };
  xinyuexiaAppIcon?: {
    read(): Promise<AppIconResult>;
    select(): Promise<AppIconResult>;
    useProjectIcon(fileName: string): Promise<AppIconResult>;
    useDataUrl(dataUrl: string, sourceFileName?: string): Promise<AppIconResult>;
    makeDefault(): Promise<AppIconResult>;
    reset(): Promise<AppIconResult>;
  };
  xinyuexiaDatabase?: {
    ensureDefaultDir(): Promise<DatabaseActionResult>;
    selectDirectory(): Promise<string | null>;
    readSettings(): Promise<DatabaseActionResult>;
    saveSettings(settings: DatabaseSettings): Promise<DatabaseActionResult>;
    getStatus(dataDir?: string): Promise<DatabaseDirectoryStatus>;
    getEmbeddedPostgresStatus(dataDir?: string): Promise<EmbeddedPostgresStatus>;
    initializeEmbeddedPostgres(dataDir?: string): Promise<EmbeddedPostgresActionResult>;
    startEmbeddedPostgres(dataDir?: string): Promise<EmbeddedPostgresActionResult>;
    stopEmbeddedPostgres(dataDir?: string): Promise<EmbeddedPostgresActionResult>;
    readCollection<T = unknown>(collection: DatabaseCollectionName, dataDir?: string): Promise<DatabaseCollectionResult<T>>;
    writeCollection<T = unknown>(collection: DatabaseCollectionName, items: T[], dataDir?: string): Promise<DatabaseCollectionResult<T>>;
    readMoonfallPostgres<T = unknown>(dataDir?: string): Promise<DatabaseCollectionResult<T>>;
    writeMoonfallPostgres<T = unknown>(state: T, dataDir?: string): Promise<DatabaseCollectionResult<T>>;
    retrieveMoonfallRag<T = unknown>(input: MoonfallRagRequestInput, dataDir?: string): Promise<DatabaseCollectionResult<T>>;
  };
}
