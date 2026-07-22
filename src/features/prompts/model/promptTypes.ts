export interface PromptItem {
  id: string;
  name: string;
  description: string;
  content: string;
  textAuditContent?: string;
  textAuditEnabled?: boolean;
  category: string;
  subCategory?: string;
  promptType: 'novel' | 'default';
  usageCount: number;
  isFavorite: boolean;
  pinnedAt?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NewPromptInput {
  name: string;
  description: string;
  content: string;
  textAuditContent?: string;
  textAuditEnabled?: boolean;
  category: string;
  subCategory?: string;
  promptType?: 'novel' | 'default';
}
