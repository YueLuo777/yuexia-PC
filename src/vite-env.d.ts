/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_EMBEDDED_BROWSER?: string;
  readonly VITE_INCLUDE_INTERNAL_ROUTES?: string;
}

interface ModelRequestInput {
  endpoint: string;
  headers: Record<string, string>;
  body: string;
  timeoutMs?: number;
  modelSecretId?: string;
  provider?: 'openai-compatible' | 'anthropic';
}

interface ModelSecretStatusResult {
  ok: boolean;
  encryptionAvailable: boolean;
  secrets: Record<string, boolean>;
  message?: string;
}

interface ModelSecretResult {
  ok: boolean;
  apiKey?: string;
  hasSecret?: boolean;
  message?: string;
}

interface ModelRequestResult {
  ok: boolean;
  status: number;
  text: string;
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

interface CosConfigInput {
  bucket: string;
  region: string;
  secretId: string;
  secretKey: string;
}

interface CosPutObjectInput {
  config: CosConfigInput;
  key: string;
  body: string;
  contentType?: string;
}

interface CosGetObjectInput {
  config: CosConfigInput;
  key: string;
}

interface CosObjectResult {
  ok: boolean;
  status: number;
  text?: string;
  key?: string;
  message?: string;
}

interface HotspotBridgeFetchInput {
  sources?: Array<'baidu' | 'douyin' | 'weibo' | 'zhihu' | 'bilibili'>;
  limit?: number;
  force?: boolean;
}

interface HotspotBridgeItem {
  id: string;
  source: 'baidu' | 'douyin' | 'weibo' | 'zhihu' | 'bilibili';
  sourceName: string;
  rank: number;
  title: string;
  heat?: string;
  url?: string;
  category?: string;
  capturedAt: string;
}

interface HotspotBridgeFetchResult {
  ok: boolean;
  capturedAt: string;
  sources: Partial<Record<'baidu' | 'douyin' | 'weibo' | 'zhihu' | 'bilibili', unknown[]>>;
  staleItems?: HotspotBridgeItem[];
  errors?: Partial<Record<'baidu' | 'douyin' | 'weibo' | 'zhihu' | 'bilibili', string>>;
}

interface HotspotDetailResult {
  ok: boolean;
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  textSnippet?: string;
  error?: string;
  fromCache?: boolean;
}

interface WindowSettingsResult {
  rememberSize: boolean;
  defaultBounds: {
    width: number;
    height: number;
  };
  currentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface Window {
  xinyuexiaWindow?: {
    minimize(): Promise<void>;
    maximizeToggle(): Promise<boolean>;
    close(): Promise<void>;
    isMaximized(): Promise<boolean>;
    reload(): Promise<void>;
    readSettings(): Promise<WindowSettingsResult>;
    updateSettings(settings: { rememberSize?: boolean }): Promise<WindowSettingsResult>;
    resetBounds(): Promise<WindowSettingsResult>;
    onMaximizedChange(callback: (isMaximized: boolean) => void): () => void;
  };
  xinyuexiaModel?: {
    request(input: ModelRequestInput): Promise<ModelRequestResult>;
    stream(
      input: ModelRequestInput & { requestId?: string },
      onChunk: (payload: string | { type: 'content' | 'reasoning'; text: string }) => void,
    ): Promise<ModelRequestResult>;
    cancelStream(requestId: string): Promise<boolean>;
  };
  xinyuexiaModelSecrets?: {
    status(): Promise<ModelSecretStatusResult>;
    get(secretId: string): Promise<ModelSecretResult>;
    set(secretId: string, apiKey: string): Promise<ModelSecretResult>;
    remove(secretId: string): Promise<ModelSecretResult>;
  };
  xinyuexiaAppIcon?: {
    read(): Promise<AppIconResult>;
    select(): Promise<AppIconResult>;
    useProjectIcon(fileName: string): Promise<AppIconResult>;
    useDataUrl(dataUrl: string, sourceFileName?: string): Promise<AppIconResult>;
    makeDefault(): Promise<AppIconResult>;
    reset(): Promise<AppIconResult>;
  };
  xinyuexiaCos?: {
    putObject(input: CosPutObjectInput): Promise<CosObjectResult>;
    getObject(input: CosGetObjectInput): Promise<CosObjectResult>;
  };
  xinyuexiaHotspots?: {
    fetchAll(input?: HotspotBridgeFetchInput): Promise<HotspotBridgeFetchResult>;
    fetchDetail(input?: { item?: HotspotBridgeItem; url?: string }): Promise<HotspotDetailResult>;
  };
}
