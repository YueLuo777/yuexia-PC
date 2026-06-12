import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  ConceptAiResult,
  ConceptCloudConfig,
  ConceptCloudSnapshot,
  ConceptKind,
  ConceptLibraryItem,
  ConceptPlatform,
  GenreConceptItem,
  InspirationAssociation,
  InspirationConceptItem,
} from '@/features/concept-library/model/conceptLibraryTypes';

export const CONCEPT_LIBRARY_KEY = 'xinyuexia_concept_library_v1';
export const CONCEPT_CLOUD_CONFIG_KEY = 'xinyuexia_concept_cloud_cos_config_v1';
export const CONCEPT_LIBRARY_UPDATED_EVENT = 'xinyuexia_concept_library_updated';
export const CONCEPT_CLOUD_OBJECT_KEY = 'concept-library/latest.json';

const DEFAULT_CLOUD_CONFIG: ConceptCloudConfig = {
  bucket: '',
  region: 'ap-guangzhou',
  secretId: '',
  secretKey: '',
  prefix: 'xinyuexia',
};

function createId(kind: ConceptKind) {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[,\s，、]+/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeConceptItem(value: unknown): ConceptLibraryItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<ConceptLibraryItem>;
  if (item.kind !== 'inspiration' && item.kind !== 'genreConcept') return null;
  const now = new Date().toISOString();
  const base = {
    id: asString(item.id, createId(item.kind)),
    kind: item.kind,
    title: asString(item.title, item.kind === 'inspiration' ? '未命名灵感' : '未命名题材'),
    category: asString(item.category, item.kind === 'inspiration' ? '灵感' : '题材'),
    tags: normalizeStringArray(item.tags),
    summary: asString(item.summary),
    content: asString(item.content),
    rawInput: asString(item.rawInput),
    status: item.status === 'organized' ? 'organized' as const : 'pending' as const,
    createdAt: asString(item.createdAt, now),
    updatedAt: asString(item.updatedAt, now),
    cloudSyncedAt: asString(item.cloudSyncedAt) || undefined,
  };
  if (item.kind === 'inspiration') {
    const inspirationItem = item as Partial<InspirationConceptItem>;
    const association = normalizeInspirationAssociation(inspirationItem.association);
    return {
      ...base,
      kind: 'inspiration',
      ...(association ? { association } : {}),
    } as InspirationConceptItem;
  }
  const genreItem = item as Partial<GenreConceptItem>;
  return {
    ...base,
    kind: 'genreConcept',
    platform: ['起点', '番茄', '通用'].includes(String(genreItem.platform)) ? genreItem.platform as ConceptPlatform : '通用',
    genre: asString(genreItem.genre, '玄幻'),
    elements: normalizeStringArray(genreItem.elements),
    sellingPoints: normalizeStringArray(genreItem.sellingPoints),
    audience: asString(genreItem.audience),
    conflict: asString(genreItem.conflict),
    worldbuilding: asString(genreItem.worldbuilding),
    protagonist: asString(genreItem.protagonist),
    openingHook: asString(genreItem.openingHook),
  };
}

function normalizeInspirationAssociation(value: unknown): InspirationAssociation | null {
  if (!value || typeof value !== 'object') return null;
  const association = value as Partial<InspirationAssociation>;
  const content = asString(association.content);
  if (!content) return null;
  return {
    title: asString(association.title, 'AI 联想'),
    category: asString(association.category, 'AI 联想'),
    tags: normalizeStringArray(association.tags),
    summary: asString(association.summary),
    content,
  };
}

function readItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONCEPT_LIBRARY_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.map(normalizeConceptItem).filter((item): item is ConceptLibraryItem => Boolean(item)) : [];
  } catch {
    return [];
  }
}

function writeItems(items: ConceptLibraryItem[]) {
  localStorage.setItem(CONCEPT_LIBRARY_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CONCEPT_LIBRARY_UPDATED_EVENT));
}

export function readConceptCloudConfig(): ConceptCloudConfig {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONCEPT_CLOUD_CONFIG_KEY) ?? '{}') as Partial<ConceptCloudConfig>;
    return {
      bucket: asString(parsed.bucket),
      region: asString(parsed.region, DEFAULT_CLOUD_CONFIG.region),
      secretId: asString(parsed.secretId),
      secretKey: asString(parsed.secretKey),
      prefix: asString(parsed.prefix, DEFAULT_CLOUD_CONFIG.prefix).replace(/^\/+|\/+$/g, ''),
    };
  } catch {
    return DEFAULT_CLOUD_CONFIG;
  }
}

export function writeConceptCloudConfig(config: ConceptCloudConfig) {
  const next: ConceptCloudConfig = {
    bucket: config.bucket.trim(),
    region: config.region.trim() || DEFAULT_CLOUD_CONFIG.region,
    secretId: config.secretId.trim(),
    secretKey: config.secretKey.trim(),
    prefix: config.prefix.trim().replace(/^\/+|\/+$/g, '') || DEFAULT_CLOUD_CONFIG.prefix,
  };
  localStorage.setItem(CONCEPT_CLOUD_CONFIG_KEY, JSON.stringify(next));
  return next;
}

export function getConceptCloudObjectKey(config: ConceptCloudConfig) {
  const prefix = config.prefix.trim().replace(/^\/+|\/+$/g, '');
  return prefix ? `${prefix}/${CONCEPT_CLOUD_OBJECT_KEY}` : CONCEPT_CLOUD_OBJECT_KEY;
}

export function createConceptSnapshot(items = readItems()): ConceptCloudSnapshot {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };
}

export function restoreConceptSnapshot(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('云端备份格式无效。');
  const rawItems = (snapshot as Partial<ConceptCloudSnapshot>).items;
  if (!Array.isArray(rawItems)) throw new Error('云端备份里没有构思库列表。');
  const items = rawItems.map(normalizeConceptItem).filter((item): item is ConceptLibraryItem => Boolean(item));
  writeItems(items);
  return items;
}

export function parseConceptAiJson(text: string): ConceptAiResult | null {
  const trimmed = text.trim();
  const candidates = [
    trimmed,
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? '',
    trimmed.match(/\{[\s\S]*\}/)?.[0] ?? '',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      return parsed && typeof parsed === 'object' ? parsed as ConceptAiResult : null;
    } catch {
      // Try the next likely JSON fragment.
    }
  }
  return null;
}

function createFallbackTitle(text: string, fallback: string) {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact ? compact.slice(0, 24) : fallback;
}

export function buildInspirationPrompt(mode: 'normal' | 'association' | 'both' = 'both') {
  if (mode === 'normal') {
    return [
      '你是作家的构思库整理助手。',
      '请把用户突然想到的灵感整理成稳定 JSON，不要输出 JSON 以外的内容。',
      '这是“正常整理版”，严禁添油加醋。',
      '只允许做：提炼标题、归类、提取标签、压缩梗概、整理原文格式。',
      '禁止新增任何原文没有的信息，包括但不限于：新人物、新背景、新世界观、新反转、新剧情走向、新动机、新冲突、新设定、新道具、新组织、新能力。',
      '如果原文信息很少，content 就保持简短；不要为了完整而扩写。',
      '字段：title, category, tags, summary, content。',
      'category 用短目录名，例如人物设定、剧情桥段、世界观、冲突、金句、道具、势力。',
      'tags 是字符串数组；summary 一句话；content 只整理用户原文中已经出现的内容。',
    ].join('\n');
  }
  return [
    '你是作家的构思库整理助手。',
    '请把用户突然想到的灵感整理成稳定 JSON，不要输出 JSON 以外的内容。',
    '输出两个版本：normal 和 association。',
    'normal 是正常整理版：只做归纳、命名、分段和轻微补全，不要新增人物、世界观、反转、设定或剧情走向。',
    'association 是 AI 联想版：可以基于原始灵感继续发散，补充可能的人物方向、冲突、桥段、画面或可写性。',
    'normal 和 association 都包含字段：title, category, tags, summary, content。',
    'category 用短目录名，例如人物设定、剧情桥段、世界观、冲突、金句、道具、势力。',
    'tags 是字符串数组；summary 一句话；content 写成可回看、可继续创作的整理稿。',
  ].join('\n');
}

export function buildGenreConceptPrompt(platform: ConceptPlatform, genre: string) {
  return [
    '你是网文题材策划助手。',
    '请根据用户输入整理题材构思，输出稳定 JSON，不要输出 JSON 以外的内容。',
    `目标平台：${platform}`,
    `基础类型：${genre}`,
    '字段：title, category, tags, summary, content, sellingPoints, audience, conflict, worldbuilding, protagonist, openingHook。',
    'sellingPoints 是字符串数组；category 用短目录名；content 写成完整题材方案。',
  ].join('\n');
}

export function createInspirationConcept(
  rawInput: string,
  result: ConceptAiResult | null,
  options: { includeAssociation?: boolean; useAssociationAsMain?: boolean } = {},
): InspirationConceptItem {
  const now = new Date().toISOString();
  const normal = options.useAssociationAsMain ? result?.association : result?.normal ?? result;
  const association = normalizeInspirationAssociation(result?.association);
  return {
    id: createId('inspiration'),
    kind: 'inspiration',
    title: asString(normal?.title, createFallbackTitle(rawInput, '未命名灵感')),
    category: asString(normal?.category, normal ? '灵感' : '待整理'),
    tags: normalizeStringArray(normal?.tags),
    summary: asString(normal?.summary),
    content: asString(normal?.content, rawInput.trim()),
    rawInput: rawInput.trim(),
    status: normal ? 'organized' : 'pending',
    createdAt: now,
    updatedAt: now,
    ...(options.includeAssociation !== false && !options.useAssociationAsMain && association ? { association } : {}),
  };
}

export function createGenreConcept(
  input: { platform: ConceptPlatform; genre: string; elements: string; rawInput: string },
  result: ConceptAiResult | null,
): GenreConceptItem {
  const now = new Date().toISOString();
  const elements = normalizeStringArray(input.elements);
  return {
    id: createId('genreConcept'),
    kind: 'genreConcept',
    title: asString(result?.title, createFallbackTitle(input.rawInput, '未命名题材')),
    category: asString(result?.category, result ? input.genre : '待整理'),
    tags: Array.from(new Set([input.platform, input.genre, ...elements, ...normalizeStringArray(result?.tags)])),
    summary: asString(result?.summary),
    content: asString(result?.content, input.rawInput.trim()),
    rawInput: input.rawInput.trim(),
    status: result ? 'organized' : 'pending',
    createdAt: now,
    updatedAt: now,
    platform: input.platform,
    genre: input.genre,
    elements,
    sellingPoints: normalizeStringArray(result?.sellingPoints),
    audience: asString(result?.audience),
    conflict: asString(result?.conflict),
    worldbuilding: asString(result?.worldbuilding),
    protagonist: asString(result?.protagonist),
    openingHook: asString(result?.openingHook),
  };
}

export function useConceptLibrary() {
  const [items, setItems] = useState<ConceptLibraryItem[]>(readItems);

  useEffect(() => {
    const sync = () => setItems(readItems());
    window.addEventListener(CONCEPT_LIBRARY_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONCEPT_LIBRARY_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = useCallback((next: ConceptLibraryItem[]) => {
    setItems(next);
    writeItems(next);
  }, []);

  const addItem = useCallback((item: ConceptLibraryItem) => {
    persist([item, ...readItems()]);
  }, [persist]);

  const updateItem = useCallback((id: string, updates: Partial<Pick<ConceptLibraryItem, 'title' | 'category' | 'summary' | 'content' | 'tags' | 'cloudSyncedAt'>>) => {
    persist(readItems().map((item) => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  }, [persist]);

  const deleteItem = useCallback((id: string) => {
    persist(readItems().filter((item) => item.id !== id));
  }, [persist]);

  const replaceAll = useCallback((next: ConceptLibraryItem[]) => {
    persist(next);
  }, [persist]);

  const stats = useMemo(() => ({
    total: items.length,
    inspirations: items.filter((item) => item.kind === 'inspiration').length,
    genreConcepts: items.filter((item) => item.kind === 'genreConcept').length,
    pending: items.filter((item) => item.status === 'pending').length,
  }), [items]);

  return {
    items,
    stats,
    addItem,
    updateItem,
    deleteItem,
    replaceAll,
  };
}
