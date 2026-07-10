export type ModelProvider = 'openai-compatible' | 'anthropic';

export interface ModelItem {
  id: string;
  instanceId?: string;
  name: string;
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  hasApiKey?: boolean;
  model: string;
  provider?: ModelProvider;
  locked?: boolean;
  connectionStatus?: 'unknown' | 'connected' | 'failed' | 'testing';
  connectionLatencyMs?: number;
  temperature?: number;
}

export interface NewModelInput {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  provider?: ModelProvider;
  temperature?: number;
}
