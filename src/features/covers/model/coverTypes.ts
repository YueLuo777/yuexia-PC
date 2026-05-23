import type { WorkType } from '@/features/novels/model/novelTypes';

export interface CoverLibraryItem {
  id: string;
  title: string;
  workType: WorkType;
  image: string;
  prompt?: string;
  modelName?: string;
  createdAt: string;
}

export interface NewCoverLibraryItem {
  title: string;
  workType: WorkType;
  image: string;
  prompt?: string;
  modelName?: string;
}
