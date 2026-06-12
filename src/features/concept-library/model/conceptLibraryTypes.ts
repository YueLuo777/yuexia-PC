export type ConceptKind = 'inspiration' | 'genreConcept';

export type ConceptPlatform = '起点' | '番茄' | '通用';

export interface ConceptCloudConfig {
  bucket: string;
  region: string;
  secretId: string;
  secretKey: string;
  prefix: string;
}

export interface ConceptBaseItem {
  id: string;
  kind: ConceptKind;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  rawInput: string;
  status: 'organized' | 'pending';
  createdAt: string;
  updatedAt: string;
  cloudSyncedAt?: string;
}

export interface InspirationAssociation {
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
}

export interface InspirationConceptItem extends ConceptBaseItem {
  kind: 'inspiration';
  association?: InspirationAssociation;
}

export interface GenreConceptItem extends ConceptBaseItem {
  kind: 'genreConcept';
  platform: ConceptPlatform;
  genre: string;
  elements: string[];
  sellingPoints: string[];
  audience: string;
  conflict: string;
  worldbuilding: string;
  protagonist: string;
  openingHook: string;
}

export type ConceptLibraryItem = InspirationConceptItem | GenreConceptItem;

export interface ConceptAiResult {
  title?: string;
  category?: string;
  tags?: string[];
  summary?: string;
  content?: string;
  sellingPoints?: string[];
  audience?: string;
  conflict?: string;
  worldbuilding?: string;
  protagonist?: string;
  openingHook?: string;
  normal?: ConceptAiResult;
  association?: ConceptAiResult;
}

export interface ConceptCloudSnapshot {
  version: 1;
  exportedAt: string;
  items: ConceptLibraryItem[];
}
