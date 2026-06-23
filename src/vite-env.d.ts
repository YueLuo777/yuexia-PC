/// <reference types="vite/client" />

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

interface Window {
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
  xinyuexiaCos?: {
    putObject(input: CosPutObjectInput): Promise<CosObjectResult>;
    getObject(input: CosGetObjectInput): Promise<CosObjectResult>;
  };
}
