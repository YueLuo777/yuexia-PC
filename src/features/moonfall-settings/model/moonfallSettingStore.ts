import {
  MOONFALL_CATEGORIES,
  MOONFALL_VECTOR_DIMENSION,
  MOONFALL_USER_ID,
  type MoonfallCategory,
  type MoonfallConfig,
  type MoonfallImportance,
  type MoonfallImportLog,
  type MoonfallProject,
  type MoonfallPurpose,
  type MoonfallReviewItem,
  type MoonfallSettingItem,
  type MoonfallSource,
  type MoonfallSourceChunk,
  type MoonfallSourceType,
  type MoonfallState,
  type MoonfallStatus,
  type MoonfallRagBundle,
  type RetrievedMoonfallSetting,
} from '@/features/moonfall-settings/model/moonfallSettingTypes';

export const MOONFALL_STATE_KEY = 'xinyuexia_moonfall_setting_library_v1';
const DEFAULT_PROJECT_ID = 'moonfall-project-default';

const DEFAULT_CONFIG: MoonfallConfig = {
  aiModelId: '',
  embeddingModelId: '',
  embeddingBaseUrl: '',
  embeddingApiKey: '',
  embeddingModel: '',
  embeddingDimension: MOONFALL_VECTOR_DIMENSION,
  retrievalLimit: 10,
  similarityThreshold: 0.2,
  autoRag: false,
  ragTemplate: '续写模式',
};

const CATEGORY_ALIASES: Record<string, MoonfallCategory> = {
  世界观基础: '世界观',
  历史事件: '世界观',
  神明邪神: '世界观',
  风格文风: '世界观',
  国家与地理: '地点区域',
  势力组织: '势力组织',
  人物角色: '人物角色',
  修行体系: '等级体系',
  境界体系: '等级体系',
  功法法术: '功法能力',
  神通传承: '功法能力',
  道具法宝: '道具装备',
  怪物邪祟: '怪物敌人',
  系统金手指: '科技系统',
  职业体系: '社会职业',
  开局卖点: '剧情线索',
  书名标题: '剧情线索',
  待定设定: '待定/冲突',
  冲突设定: '待定/冲突',
  废案备选: '待定/冲突',
  未分类: '待定/冲突',
};

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

export function createMoonfallId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultProject(): MoonfallProject {
  const now = nowText();
  return {
    id: DEFAULT_PROJECT_ID,
    userId: MOONFALL_USER_ID,
    name: '月落设定库',
    description: '用于整理小说灵感、世界观和写作时 RAG 调用的设定知识库。',
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[、，,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeStatus(value: unknown): MoonfallStatus {
  const text = String(value ?? '').trim();
  if (['待确认', '已整理', '待完善', '有冲突', '废案', '未分类', '未生成向量'].includes(text)) return text as MoonfallStatus;
  if (text.includes('冲突')) return '有冲突';
  if (text.includes('废')) return '废案';
  if (text.includes('确认')) return '待确认';
  if (text.includes('完善')) return '待完善';
  if (text.includes('向量')) return '未生成向量';
  if (text.includes('分类')) return '未分类';
  return '已整理';
}

function normalizeImportance(value: unknown, category?: MoonfallCategory): MoonfallImportance {
  const text = String(value ?? '').trim();
  if (['核心', '重要', '普通', '素材', '废案'].includes(text)) return text as MoonfallImportance;
  if (text.includes('核')) return '核心';
  if (text.includes('重')) return '重要';
  if (text.includes('素材')) return '素材';
  if (text.includes('废') || category === '待定/冲突') return '素材';
  return category === '世界观' ? '重要' : '普通';
}

function normalizeVectorStatus(value: unknown) {
  const text = String(value ?? '').trim();
  if (text === '已生成向量' || text.includes('已生成')) return '已生成向量' as const;
  if (text === '生成失败' || text.includes('失败')) return '生成失败' as const;
  return '未生成向量' as const;
}

export function normalizeCategory(category: unknown): MoonfallCategory {
  const text = String(category ?? '').trim();
  if (MOONFALL_CATEGORIES.includes(text as MoonfallCategory)) return text as MoonfallCategory;
  return CATEGORY_ALIASES[text] ?? '待定/冲突';
}

function normalizeSetting(raw: unknown, activeProjectId: string): MoonfallSettingItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<MoonfallSettingItem> & Record<string, unknown>;
  const now = nowText();
  const category = normalizeCategory(item.category);
  const title = String(item.title ?? '').trim() || '未命名设定';
  const base: MoonfallSettingItem = {
    id: String(item.id ?? createMoonfallId('setting')),
    projectId: String(item.projectId ?? activeProjectId),
    userId: String(item.userId ?? MOONFALL_USER_ID),
    sourceId: typeof item.sourceId === 'string' ? item.sourceId : undefined,
    sourceChunkId: typeof item.sourceChunkId === 'string' ? item.sourceChunkId : undefined,
    title,
    category,
    subcategory: String(item.subcategory ?? '').trim(),
    tags: normalizeStringArray(item.tags),
    keywords: normalizeStringArray(item.keywords),
    summary: String(item.summary ?? '').trim(),
    originalText: String(item.originalText ?? '').trim(),
    organizedText: String(item.organizedText ?? '').trim(),
    status: normalizeStatus(item.status),
    confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.7)),
    allowRag: Boolean(item.allowRag),
    isVerified: Boolean(item.isVerified),
    isFavorite: Boolean(item.isFavorite),
    isLocked: Boolean(item.isLocked),
    importance: normalizeImportance(item.importance, category),
    ragWeight: Math.max(0.1, Number(item.ragWeight) || 1),
    canonicalName: String(item.canonicalName ?? title).trim(),
    aliases: normalizeStringArray(item.aliases),
    evidenceText: String(item.evidenceText ?? item.originalText ?? '').trim(),
    evidenceLocation: String(item.evidenceLocation ?? '').trim(),
    worldline: String(item.worldline ?? '主线').trim(),
    relatedItems: normalizeStringArray(item.relatedItems),
    metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata as Record<string, unknown> : {},
    vectorStatus: normalizeVectorStatus(item.vectorStatus),
    embeddingModel: typeof item.embeddingModel === 'string' ? item.embeddingModel : undefined,
    embeddingDimension: Number(item.embeddingDimension) || undefined,
    embeddingText: typeof item.embeddingText === 'string' ? item.embeddingText : undefined,
    embeddingVector: Array.isArray(item.embeddingVector) ? item.embeddingVector.map(Number).filter(Number.isFinite) : undefined,
    embeddingCreatedAt: typeof item.embeddingCreatedAt === 'string' ? item.embeddingCreatedAt : undefined,
    createdAt: String(item.createdAt ?? now),
    updatedAt: String(item.updatedAt ?? now),
    changeLogs: Array.isArray(item.changeLogs) ? item.changeLogs as MoonfallSettingItem['changeLogs'] : [],
  };
  if (!base.embeddingText) base.embeddingText = buildEmbeddingText(base);
  return base;
}

export function createDefaultMoonfallState(): MoonfallState {
  const project = createDefaultProject();
  return {
    projects: [project],
    activeProjectId: project.id,
    sources: [],
    sourceChunks: [],
    settings: [],
    relations: [],
    retrievalLogs: [],
    importTasks: [],
    config: DEFAULT_CONFIG,
  };
}

export function normalizeMoonfallState(value: unknown): MoonfallState {
  if (!value || typeof value !== 'object') return createDefaultMoonfallState();
  const parsed = value as Partial<MoonfallState>;
  const projects = Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : [createDefaultProject()];
  const activeProjectId = projects.some((project) => project.id === parsed.activeProjectId) ? String(parsed.activeProjectId) : projects[0].id;
  return {
    projects,
    activeProjectId,
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    sourceChunks: Array.isArray(parsed.sourceChunks) ? parsed.sourceChunks : [],
    settings: Array.isArray(parsed.settings) ? parsed.settings.map((item) => normalizeSetting(item, activeProjectId)).filter((item): item is MoonfallSettingItem => Boolean(item)) : [],
    relations: Array.isArray(parsed.relations) ? parsed.relations : [],
    retrievalLogs: Array.isArray(parsed.retrievalLogs) ? parsed.retrievalLogs : [],
    importTasks: Array.isArray(parsed.importTasks) ? parsed.importTasks : [],
    config: { ...DEFAULT_CONFIG, ...(parsed.config ?? {}) },
  };
}

export function readMoonfallState(): MoonfallState {
  try {
    const raw = localStorage.getItem(MOONFALL_STATE_KEY);
    if (!raw) throw new Error('empty');
    return normalizeMoonfallState(JSON.parse(raw));
  } catch {
    return createDefaultMoonfallState();
  }
}

export function writeMoonfallState(state: MoonfallState) {
  const next = normalizeMoonfallState(state);
  localStorage.setItem(MOONFALL_STATE_KEY, JSON.stringify(next));
}

export function createSource(input: { projectId: string; title: string; sourceType: MoonfallSourceType; originalFilename?: string; description?: string }): MoonfallSource {
  const now = nowText();
  return {
    id: createMoonfallId('source'),
    projectId: input.projectId,
    userId: MOONFALL_USER_ID,
    title: input.title.trim() || input.originalFilename || '未命名来源',
    sourceType: input.sourceType,
    originalFilename: input.originalFilename,
    description: input.description ?? '',
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

function isChapterHeading(line: string) {
  return /^\s*(第[一二三四五六七八九十百千万零\d]+[章节回卷]|Chapter\s*\d+|CHAPTER\s*\d+|\d+[.、]\s*)/.test(line.trim());
}

function splitByChapter(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const chapters: Array<{ title: string; content: string }> = [];
  let currentTitle = '正文';
  let buffer: string[] = [];
  lines.forEach((line) => {
    if (isChapterHeading(line) && buffer.join('\n').trim()) {
      chapters.push({ title: currentTitle, content: buffer.join('\n').trim() });
      currentTitle = line.trim().slice(0, 80);
      buffer = [];
      return;
    }
    if (isChapterHeading(line)) {
      currentTitle = line.trim().slice(0, 80);
      return;
    }
    buffer.push(line);
  });
  if (buffer.join('\n').trim()) chapters.push({ title: currentTitle, content: buffer.join('\n').trim() });
  return chapters.length > 0 ? chapters : [{ title: '正文', content: text.trim() }];
}

export function createChunks(projectId: string, sourceId: string, text: string, maxChars = 4200): MoonfallSourceChunk[] {
  const chunks: MoonfallSourceChunk[] = [];
  splitByChapter(text).forEach((chapter) => {
    const content = chapter.content.trim();
    for (let start = 0; start < content.length; start += maxChars) {
      const part = content.slice(start, start + maxChars).trim();
      if (!part) continue;
      chunks.push({
        id: createMoonfallId('chunk'),
        projectId,
        sourceId,
        chunkIndex: chunks.length,
        chapterTitle: chapter.title,
        content: part,
        tokenCount: Math.ceil(part.length / 1.8),
        metadata: { start, end: start + part.length },
        createdAt: nowText(),
      });
    }
  });
  return chunks;
}

export function buildEmbeddingText(item: Pick<MoonfallSettingItem, 'title' | 'category' | 'subcategory' | 'tags' | 'keywords' | 'summary' | 'organizedText' | 'relatedItems'>) {
  return [
    `标题：${item.title}`,
    `分类：${item.category}`,
    `子分类：${item.subcategory || ''}`,
    `标签：${item.tags.join('、')}`,
    `关键词：${item.keywords.join('、')}`,
    `梗概：${item.summary}`,
    `整理内容：${item.organizedText}`,
    `关联设定：${item.relatedItems.join('、')}`,
  ].join('\n');
}

export function createSettingFromReview(projectId: string, draft: MoonfallReviewItem): MoonfallSettingItem {
  const now = nowText();
  const category = normalizeCategory(draft.category);
  const status: MoonfallStatus = draft.status === '已整理' ? '待确认' : normalizeStatus(draft.status);
  const importance: MoonfallImportance = category === '世界观' ? '重要' : category === '待定/冲突' ? '素材' : '普通';
  const base: MoonfallSettingItem = {
    id: createMoonfallId('setting'),
    projectId,
    userId: MOONFALL_USER_ID,
    sourceId: draft.sourceId,
    sourceChunkId: draft.sourceChunkId,
    title: draft.title.trim() || '未命名设定',
    category,
    subcategory: draft.subcategory.trim(),
    tags: normalizeStringArray(draft.tags),
    keywords: normalizeStringArray(draft.keywords),
    summary: draft.summary.trim(),
    originalText: draft.originalText.trim(),
    organizedText: draft.organizedText.trim(),
    status,
    confidence: Math.max(0, Math.min(1, Number(draft.confidence) || 0.6)),
    allowRag: false,
    isVerified: false,
    isFavorite: false,
    isLocked: false,
    importance,
    ragWeight: 1,
    canonicalName: draft.title.trim(),
    aliases: [],
    evidenceText: draft.originalText.trim(),
    evidenceLocation: '',
    worldline: '主线',
    relatedItems: normalizeStringArray(draft.relatedItems),
    metadata: {},
    vectorStatus: '未生成向量',
    createdAt: now,
    updatedAt: now,
    changeLogs: [{ id: createMoonfallId('log'), action: 'AI提取', detail: '进入待确认审核状态', createdAt: now }],
  };
  return { ...base, embeddingText: buildEmbeddingText(base) };
}

export function createManualSetting(projectId: string): MoonfallSettingItem {
  const now = nowText();
  const base: MoonfallSettingItem = {
    id: createMoonfallId('setting'),
    projectId,
    userId: MOONFALL_USER_ID,
    title: '新建设定',
    category: '待定/冲突',
    subcategory: '',
    tags: [],
    keywords: [],
    summary: '',
    originalText: '',
    organizedText: '',
    status: '待确认',
    confidence: 1,
    allowRag: false,
    isVerified: false,
    isFavorite: false,
    isLocked: false,
    importance: '普通',
    ragWeight: 1,
    canonicalName: '新建设定',
    aliases: [],
    evidenceText: '',
    evidenceLocation: '',
    worldline: '主线',
    relatedItems: [],
    metadata: {},
    vectorStatus: '未生成向量',
    createdAt: now,
    updatedAt: now,
    changeLogs: [{ id: createMoonfallId('log'), action: '用户新建', detail: '手动创建资料卡', createdAt: now }],
  };
  return { ...base, embeddingText: buildEmbeddingText(base) };
}

export function normalizeAiReviewItems(value: unknown, sourceId?: string, sourceChunkId?: string): MoonfallReviewItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw, index) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const category = normalizeCategory(item.category);
    const rawCategory = String(item.category ?? '');
    const status: MoonfallStatus = category === '待定/冲突' && rawCategory.includes('冲突') ? '有冲突' : '已整理';
    return {
      id: createMoonfallId(`review-${index}`),
      selected: true,
      sourceId,
      sourceChunkId,
      title: String(item.title ?? `待命名设定${index + 1}`).trim(),
      category,
      subcategory: String(item.subcategory ?? '').trim(),
      tags: normalizeStringArray(item.tags),
      keywords: normalizeStringArray(item.keywords),
      summary: String(item.summary ?? '').trim(),
      originalText: String(item.originalText ?? item.original_text ?? '').trim(),
      organizedText: String(item.organizedText ?? item.organized_text ?? '').trim(),
      relatedItems: normalizeStringArray(item.relatedItems ?? item.related_items),
      status,
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.65)),
    };
  }).filter((item) => item.title || item.summary || item.organizedText);
}

export function parseAiJsonCards(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const candidates = [
    cleaned,
    cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1),
    cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1),
  ].filter((item) => item && item.length > 1);

  for (const candidate of candidates) {
    for (const repaired of [candidate, repairAiJsonCandidate(candidate)]) {
      try {
        const parsed = JSON.parse(repaired);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.items)) return parsed.items;
        if (Array.isArray(parsed.data)) return parsed.data;
        return [parsed];
      } catch {
        // Try the next extracted JSON fragment.
      }
    }
  }
  throw new Error('AI 返回内容不是合法 JSON');
}

function repairAiJsonCandidate(candidate: string) {
  return candidate
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, '"')
    .replace(/，/g, ',')
    .replace(/：/g, ':')
    .replace(/、\s*"/g, ',"')
    .replace(/,\s*([}\]])/g, '$1');
}

export function makeImportLog(level: MoonfallImportLog['level'], message: string, chunkId?: string): MoonfallImportLog {
  return { id: createMoonfallId('import-log'), level, message, chunkId, createdAt: nowText() };
}

function tokenSet(text: string) {
  return new Set(text.toLowerCase().split(/[\s,，、。！？；;:："'“”‘’（）()【】\[\]<>《》\n\r]+/).filter((item) => item.length >= 2));
}

function keywordScore(query: string, item: MoonfallSettingItem) {
  const q = tokenSet(query);
  if (q.size === 0) return 0;
  const haystack = [item.title, item.canonicalName, item.aliases.join(' '), item.tags.join(' '), item.keywords.join(' '), item.summary, item.organizedText].join(' ').toLowerCase();
  let score = 0;
  q.forEach((word) => {
    if (haystack.includes(word)) score += 1;
  });
  return score / q.size;
}

function dot(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let total = 0;
  for (let index = 0; index < length; index += 1) total += a[index] * b[index];
  return total;
}

function norm(a: number[]) {
  return Math.sqrt(dot(a, a)) || 1;
}

export function hashEmbedding(text: string, dimension = MOONFALL_VECTOR_DIMENSION) {
  const vector = Array.from({ length: dimension }, () => 0);
  const tokens = Array.from(tokenSet(text));
  tokens.forEach((token) => {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const slot = Math.abs(hash) % dimension;
    vector[slot] += hash % 2 === 0 ? 1 : -1;
  });
  const length = norm(vector);
  return vector.map((value) => Number((value / length).toFixed(6)));
}

function importanceBoost(importance: MoonfallSettingItem['importance']) {
  if (importance === '核心') return 1.4;
  if (importance === '重要') return 1.2;
  if (importance === '素材') return 0.85;
  if (importance === '废案') return 0.2;
  return 1;
}

export function retrieveRelevantMoonfallSettings(
  state: MoonfallState,
  input: { projectId: string; userId?: string; query: string; categories?: string[]; tags?: string[]; limit?: number; purpose?: MoonfallPurpose; includeUnverified?: boolean; similarityThreshold?: number },
) {
  const limit = input.limit ?? 10;
  const categorySet = new Set(input.categories?.filter(Boolean).map(normalizeCategory) ?? []);
  const tagSet = new Set(input.tags?.filter(Boolean) ?? []);
  const candidates = state.settings.filter((item) => {
    if (item.projectId !== input.projectId) return false;
    if (input.userId && item.userId !== input.userId) return false;
    if (!item.allowRag && !input.includeUnverified) return false;
    if (!item.isVerified && !input.includeUnverified) return false;
    if (item.status === '废案' || item.importance === '废案') return false;
    if (categorySet.size > 0 && !categorySet.has(item.category)) return false;
    if (tagSet.size > 0 && !item.tags.some((tag) => tagSet.has(tag))) return false;
    return true;
  });
  return candidates.map((item): RetrievedMoonfallSetting => {
    const vector = item.embeddingVector && item.embeddingVector.length > 0 ? item.embeddingVector : hashEmbedding(item.embeddingText || buildEmbeddingText(item));
    const queryVector = hashEmbedding(input.query, vector.length);
    const similarity = dot(queryVector, vector) / (norm(queryVector) * norm(vector));
    const keyword = keywordScore(input.query, item);
    const priority = importanceBoost(item.importance) * Math.max(0.2, item.ragWeight || 1);
    const score = ((similarity + 1) / 2 * 0.58 + keyword * 0.42) * priority + (item.isFavorite ? 0.08 : 0);
    return {
      item,
      distance: Number((1 - similarity).toFixed(4)),
      score: Number(score.toFixed(4)),
      reason: keyword > 0 ? '混合检索：语义+关键词' : '语义相似',
    };
  })
    .filter((result) => (
      typeof input.similarityThreshold === 'number'
        ? 1 - result.distance >= input.similarityThreshold
        : true
    ))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function createRetrievalLog(projectId: string, query: string, results: RetrievedMoonfallSetting[], purpose: MoonfallPurpose) {
  return {
    id: createMoonfallId('retrieval'),
    projectId,
    userId: MOONFALL_USER_ID,
    query,
    retrievedSettingIds: results.map((result) => result.item.id),
    retrievedChunkIds: results.map((result) => result.item.sourceChunkId).filter((id): id is string => Boolean(id)),
    purpose,
    metadata: { scores: results.map((result) => ({ id: result.item.id, score: result.score, distance: result.distance })) },
    createdAt: nowText(),
  };
}

export function buildMoonfallRagContext(results: RetrievedMoonfallSetting[]) {
  if (results.length === 0) return '';
  const grouped = new Map<MoonfallCategory, RetrievedMoonfallSetting[]>();
  results.forEach((result) => {
    const list = grouped.get(result.item.category) ?? [];
    list.push(result);
    grouped.set(result.item.category, list);
  });

  return [
    '以下是本次写作必须参考的设定资料，请严格遵守，不要违背：',
    ...Array.from(grouped.entries()).flatMap(([category, items]) => [
      '',
      `【${category}】`,
      ...items.map((result, index) => {
        const content = result.item.organizedText || result.item.summary || result.item.originalText;
        return `${index + 1}. 标题：${result.item.title}\n内容：${content}`;
      }),
    ]),
    '',
    '请基于以上设定继续写作。',
  ].join('\n');
}

export function buildMoonfallRagBundle(
  state: MoonfallState,
  input: { projectId: string; userId?: string; query: string; categories?: string[]; tags?: string[]; limit?: number; purpose?: MoonfallPurpose; includeUnverified?: boolean; similarityThreshold?: number },
): MoonfallRagBundle {
  const purpose = input.purpose ?? 'writing';
  const results = retrieveRelevantMoonfallSettings(state, { ...input, purpose });
  return {
    results,
    contextText: buildMoonfallRagContext(results),
    log: createRetrievalLog(input.projectId, input.query, results, purpose),
  };
}
