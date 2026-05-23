export interface PromptItem {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  promptType: 'novel' | 'script' | 'default';
  usageCount: number;
  isFavorite: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NewPromptInput {
  name: string;
  description: string;
  content: string;
  category: string;
  promptType?: 'novel' | 'script' | 'default';
}
