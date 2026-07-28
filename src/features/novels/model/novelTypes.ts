export type WorkType = 'novel' | 'script';
export type NovelChannel = 'male' | 'female';
export type NovelCreationStatus = 'planning' | 'serializing' | 'completed';

export interface Novel {
  id: number;
  title: string;
  type: WorkType;
  category: string;
  channel?: NovelChannel;
  wordCount: number;
  createdAt: string;
  lastModifiedAt: string;
  synopsis?: string;
  cover?: string;
  creationStatus?: NovelCreationStatus;
  targetWordCount?: number;
}

export interface RecycledNovel extends Novel {
  deletedAt: string;
  expireAt: string;
}

export interface NewNovelInput {
  title: string;
  type: WorkType;
  category: string;
  channel?: NovelChannel;
  synopsis?: string;
  cover?: string;
  creationStatus?: NovelCreationStatus;
  targetWordCount?: number;
}
