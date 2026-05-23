const MIGRATION_KEY = 'xinyuexia_legacy_migrated_v2';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hasKey(key: string) {
  return localStorage.getItem(key) !== null;
}

function mergeById<T extends { id: string | number }>(current: T[], legacy: T[]) {
  const ids = new Set(current.map((item) => String(item.id)));
  return [...current, ...legacy.filter((item) => !ids.has(String(item.id)))];
}

function migrateNovels() {
  const legacyNovels = readJson<Array<Record<string, JsonValue>>>('novels_data_v1', []);
  if (legacyNovels.length === 0) return;

  const currentNovels = readJson<Array<Record<string, JsonValue>>>('xinyuexia_novels_v1', []);
  const novels = legacyNovels.map((novel) => ({
    id: Number(novel.id),
    title: String(novel.title ?? '未命名作品'),
    type: novel.type === 'script' ? 'script' : 'novel',
    category: String(novel.category ?? '未分类'),
    wordCount: Number(novel.wordCount ?? 0),
    createdAt: String(novel.createdAt ?? new Date().toLocaleDateString('zh-CN')),
    lastModifiedAt: String(novel.lastModifiedAt ?? novel.createdAt ?? new Date().toLocaleDateString('zh-CN')),
    synopsis: typeof novel.synopsis === 'string' ? novel.synopsis : undefined,
    cover: typeof novel.cover === 'string' ? novel.cover : undefined,
  }));
  writeJson('xinyuexia_novels_v1', mergeById(currentNovels as typeof novels, novels));

  const legacyRecycle = readJson<Array<Record<string, JsonValue>>>('recycle_bin_v1', []);
  if (legacyRecycle.length > 0) {
    const currentRecycle = readJson<Array<Record<string, JsonValue>>>('xinyuexia_recycled_novels_v1', []);
    const recycled = legacyRecycle.map((novel) => ({
      id: Number(novel.id),
      title: String(novel.title ?? '未命名作品'),
      type: novel.type === 'script' ? 'script' : 'novel',
      category: String(novel.category ?? '未分类'),
      wordCount: Number(novel.wordCount ?? 0),
      createdAt: String(novel.createdAt ?? new Date().toLocaleDateString('zh-CN')),
      lastModifiedAt: String(novel.lastModifiedAt ?? novel.createdAt ?? new Date().toLocaleDateString('zh-CN')),
      synopsis: typeof novel.synopsis === 'string' ? novel.synopsis : undefined,
      cover: typeof novel.cover === 'string' ? novel.cover : undefined,
      deletedAt: String(novel.deletedAt ?? new Date().toLocaleDateString('zh-CN')),
      expireAt: String(novel.expireAt ?? new Date().toLocaleDateString('zh-CN')),
    }));
    writeJson('xinyuexia_recycled_novels_v1', mergeById(currentRecycle as typeof recycled, recycled));
  }

  const oldVolumes = readJson<Record<string, Array<Record<string, JsonValue>>>>('volumes_map_v2', {});
  if (Object.keys(oldVolumes).length > 0) {
    const currentVolumes = readJson<Record<string, unknown>>('xinyuexia_volumes_v1', {});
    writeJson('xinyuexia_volumes_v1', { ...oldVolumes, ...currentVolumes });
    for (const [novelId, volumes] of Object.entries(oldVolumes)) {
      for (const volume of volumes) {
        const chapters = Array.isArray(volume.chapters) ? volume.chapters as Array<Record<string, JsonValue>> : [];
        for (const chapter of chapters) {
          const chapterId = Number(chapter.id);
          const legacyKey = `novel_${novelId}_chapter_${chapterId}`;
          const nextKey = `xinyuexia_novel_${novelId}_chapter_${chapterId}`;
          if (!hasKey(nextKey)) {
            const content = localStorage.getItem(legacyKey) ?? (typeof chapter.content === 'string' ? chapter.content : '');
            if (content) localStorage.setItem(nextKey, content);
          }
        }
      }
    }
  }

  const categories = Array.from(new Set(['未分类', ...novels.map((novel) => novel.category).filter(Boolean)]));
  const currentCategories = readJson<string[]>('xinyuexia_categories_v1', []);
  writeJson('xinyuexia_categories_v1', Array.from(new Set([...currentCategories, ...categories])));

  const currentNovelId = localStorage.getItem('current_novel_id_v1');
  if (currentNovelId && !hasKey('xinyuexia_current_novel_id')) {
    localStorage.setItem('xinyuexia_current_novel_id', currentNovelId);
  }
}

function migrateModels() {
  if (hasKey('xinyuexia_api_settings_v1')) return;
  const legacy = readJson<{ models?: Array<Record<string, JsonValue>> }>('api_settings_v2', { models: [] });
  const models = (legacy.models ?? []).map((model) => ({
    ...model,
    connectionStatus: model.connectionStatus === 'connected' ? 'success' : model.connectionStatus ?? 'unknown',
  }));
  if (models.length > 0) writeJson('xinyuexia_api_settings_v1', { models });
}

function migrateMaterials() {
  const legacy = readJson<Array<Record<string, JsonValue>>>('materials_data_v1', []);
  if (legacy.length === 0) return;
  const current = readJson<Array<Record<string, JsonValue>>>('xinyuexia_materials_v1', []);
  const items = legacy.map((item) => ({
    id: `legacy-material-${item.id}`,
    novelId: Number(item.novelId ?? 0),
    novelTitle: String(item.novelTitle ?? ''),
    type: item.type === 'script' ? 'script' : 'novel',
    title: String(item.title ?? '未命名资料'),
    content: String(item.content ?? ''),
    chapterName: typeof item.chapterName === 'string' ? item.chapterName : undefined,
    chapterSerial: typeof item.chapterSerial === 'number' ? item.chapterSerial : undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    rating: typeof item.rating === 'number' ? item.rating : undefined,
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date().toISOString()),
  }));
  writeJson('xinyuexia_materials_v1', mergeById(current as typeof items, items));
}

function migratePrompts() {
  const legacyPrompts = readJson<Array<Record<string, JsonValue>>>('prompt_personal', []);
  const legacyRecycle = readJson<Array<Record<string, JsonValue>>>('prompt_recycle', []);
  const favorites = new Set(readJson<string[]>('prompt_favorites', []));
  const currentPrompts = readJson<Array<Record<string, JsonValue>>>('xinyuexia_prompts_v1', []);
  const currentRecycle = readJson<Array<Record<string, JsonValue>>>('xinyuexia_prompt_recycle_v1', []);

  const normalize = (item: Record<string, JsonValue>, recycled = false) => ({
    id: String(item.id ?? `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(item.name ?? '未命名提示词'),
    description: String(item.description ?? ''),
    content: String(item.content ?? ''),
    category: String(item.category ?? '未分类'),
    promptType: 'novel',
    usageCount: Number(item.usageCount ?? 0),
    isFavorite: Boolean(item.isFavorite) || favorites.has(String(item.id)),
    isLocked: Boolean(item.isLocked),
    createdAt: String(item.createdAt ?? new Date().toLocaleString('zh-CN')),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date().toLocaleString('zh-CN')),
    deletedAt: recycled ? String(item.deletedAt ?? new Date().toISOString()) : undefined,
  });

  if (legacyPrompts.length > 0) writeJson('xinyuexia_prompts_v1', mergeById(currentPrompts as ReturnType<typeof normalize>[], legacyPrompts.map((item) => normalize(item))));
  if (legacyRecycle.length > 0) writeJson('xinyuexia_prompt_recycle_v1', mergeById(currentRecycle as ReturnType<typeof normalize>[], legacyRecycle.map((item) => normalize(item, true))));

  const legacyCategories = readJson<string[]>('prompt_categories', []);
  if (legacyCategories.length > 0) {
    const currentCategories = readJson<string[]>('xinyuexia_prompt_categories_v1', []);
    writeJson('xinyuexia_prompt_categories_v1', Array.from(new Set([...currentCategories, ...legacyCategories, '未分类'])));
  }
}

function migratePlotLibrary() {
  const legacy = readJson<Array<Record<string, JsonValue>>>('plot_library_v1', []);
  if (legacy.length === 0) return;
  const current = readJson<Array<Record<string, JsonValue>>>('xinyuexia_plot_library_v1', []);
  const items = legacy.map((item) => ({
    id: String(item.id ?? `legacy-plot-${Date.now()}`),
    title: String(item.title ?? '剧情点'),
    chapter: String(item.chapter ?? ''),
    novelTitle: String(item.sourceFile ?? item.novelTitle ?? '旧版剧情库'),
    content: String(item.content ?? ''),
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    wordCount: Number(item.wordCount ?? String(item.content ?? '').replace(/\s+/g, '').length),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date().toISOString()),
  }));
  writeJson('xinyuexia_plot_library_v1', mergeById(current as typeof items, items));
}

function migrateExtract() {
  if (!hasKey('xinyuexia_extract_modules_v1') && hasKey('extract_modules_v2')) {
    const modules = readJson<unknown>('extract_modules_v2', null);
    if (modules) writeJson('xinyuexia_extract_modules_v1', modules);
  }
  if (!hasKey('xinyuexia_extract_history_v1') && hasKey('extract_history_v1')) {
    const history = readJson<unknown>('extract_history_v1', []);
    writeJson('xinyuexia_extract_history_v1', history);
  }
  if (!hasKey('xinyuexia_extract_files_v1') && hasKey('extract_files_cache')) {
    const files = readJson<unknown>('extract_files_cache', []);
    writeJson('xinyuexia_extract_files_v1', files);
  }
}

export function runLegacyMigration() {
  if (localStorage.getItem(MIGRATION_KEY) === '1') return;
  try {
    migrateNovels();
    migrateModels();
    migrateMaterials();
    migratePrompts();
    migratePlotLibrary();
    migrateExtract();
    localStorage.setItem(MIGRATION_KEY, '1');
  } catch (error) {
    console.warn('旧版数据迁移失败：', error);
  }
}
