export const MOONFALL_USER_ID = 'local-user';

export const MOONFALL_CATEGORIES = [
  '世界观',
  '地点区域',
  '势力组织',
  '人物角色',
  '等级体系',
  '功法能力',
  '道具装备',
  '怪物敌人',
  '科技系统',
  '社会职业',
  '剧情线索',
  '待定/冲突',
] as const;

export const MOONFALL_STATUSES = [
  '待确认',
  '已整理',
  '待完善',
  '有冲突',
  '废案',
  '未分类',
  '未生成向量',
] as const;

export const MOONFALL_IMPORT_SCOPES = [
  '世界观',
  '地点区域',
  '势力组织',
  '人物角色',
  '等级体系',
  '功法能力',
  '道具装备',
  '怪物敌人',
  '科技系统',
  '社会职业',
  '剧情线索',
] as const;

export type MoonfallCategory = (typeof MOONFALL_CATEGORIES)[number];
export type MoonfallStatus = (typeof MOONFALL_STATUSES)[number];
export type MoonfallImportance = '核心' | '重要' | '普通' | '素材' | '废案';
export type MoonfallSourceType = 'manual' | 'txt' | 'doc' | 'docx' | 'markdown' | 'other';
export type MoonfallPurpose = 'writing' | 'rewrite' | 'worldbuilding' | 'style_transfer' | 'qa' | 'debug';
export type MoonfallVectorStatus = '未生成向量' | '已生成向量' | '生成失败';
export const MOONFALL_VECTOR_DIMENSION = 1536;

export interface MoonfallProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoonfallSource {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  sourceType: MoonfallSourceType;
  author?: string;
  description?: string;
  originalFilename?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MoonfallSourceChunk {
  id: string;
  projectId: string;
  sourceId: string;
  chunkIndex: number;
  chapterTitle: string;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MoonfallRelation {
  id: string;
  projectId: string;
  fromSettingId: string;
  toSettingId: string;
  relationType:
    | 'related_to'
    | 'belongs_to'
    | 'enemy_of'
    | 'located_in'
    | 'derived_from'
    | 'conflicts_with'
    | 'appears_in'
    | 'uses'
    | 'created_by';
  description: string;
  createdAt: string;
}

export interface MoonfallChangeLog {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface MoonfallSettingItem {
  id: string;
  projectId: string;
  userId: string;
  sourceId?: string;
  sourceChunkId?: string;
  title: string;
  category: MoonfallCategory;
  subcategory: string;
  tags: string[];
  keywords: string[];
  summary: string;
  originalText: string;
  organizedText: string;
  status: MoonfallStatus;
  confidence: number;
  allowRag: boolean;
  isVerified: boolean;
  isFavorite: boolean;
  isLocked: boolean;
  importance: MoonfallImportance;
  ragWeight: number;
  canonicalName: string;
  aliases: string[];
  evidenceText: string;
  evidenceLocation: string;
  worldline: string;
  relatedItems: string[];
  metadata: Record<string, unknown>;
  vectorStatus: MoonfallVectorStatus;
  embeddingModel?: string;
  embeddingDimension?: number;
  embeddingText?: string;
  embeddingVector?: number[];
  embeddingCreatedAt?: string;
  createdAt: string;
  updatedAt: string;
  changeLogs: MoonfallChangeLog[];
}

export interface MoonfallRetrievalLog {
  id: string;
  projectId: string;
  userId: string;
  query: string;
  retrievedSettingIds: string[];
  retrievedChunkIds: string[];
  purpose: MoonfallPurpose;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MoonfallReviewItem {
  id: string;
  selected: boolean;
  sourceId?: string;
  sourceChunkId?: string;
  title: string;
  category: MoonfallCategory;
  subcategory: string;
  tags: string[];
  keywords: string[];
  summary: string;
  originalText: string;
  organizedText: string;
  relatedItems: string[];
  status: MoonfallStatus;
  confidence: number;
  parseError?: string;
}

export interface MoonfallImportLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  chunkId?: string;
  createdAt: string;
}

export interface MoonfallImportTask {
  id: string;
  projectId: string;
  sourceId?: string;
  title: string;
  fileName?: string;
  status: 'idle' | 'running' | 'paused' | 'finished' | 'failed' | 'canceled';
  step: string;
  totalChunks: number;
  processedChunks: number;
  failedChunkIds: string[];
  logs: MoonfallImportLog[];
  createdAt: string;
  updatedAt: string;
}

export interface MoonfallConfig {
  aiModelId: string;
  embeddingModelId: string;
  embeddingBaseUrl: string;
  embeddingApiKey: string;
  embeddingModel: string;
  embeddingDimension: number;
  retrievalLimit: number;
  similarityThreshold: number;
  autoRag: boolean;
  ragTemplate: '续写模式' | '战斗模式' | '世界观解释模式' | '人物塑造模式' | '设定校验模式' | '文风模仿模式';
}

export interface MoonfallState {
  projects: MoonfallProject[];
  activeProjectId: string;
  sources: MoonfallSource[];
  sourceChunks: MoonfallSourceChunk[];
  settings: MoonfallSettingItem[];
  relations: MoonfallRelation[];
  retrievalLogs: MoonfallRetrievalLog[];
  importTasks: MoonfallImportTask[];
  config: MoonfallConfig;
}

export interface RetrievedMoonfallSetting {
  item: MoonfallSettingItem;
  distance: number;
  score: number;
  reason: string;
}

export interface MoonfallRagBundle {
  results: RetrievedMoonfallSetting[];
  contextText: string;
  log: MoonfallRetrievalLog;
}
