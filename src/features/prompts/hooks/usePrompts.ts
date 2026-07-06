import { useEffect, useMemo, useState } from 'react';

import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';
const PROMPT_RECYCLE_KEY = 'xinyuexia_prompt_recycle_v1';
const PROMPT_CATEGORIES_KEY = 'xinyuexia_prompt_categories_v1';
const UNCATEGORIZED = '未分类';
export const AUDIT_PROMPT_CATEGORY = '审核';
export const DEFAULT_AUDIT_PROMPT_SUBCATEGORY = '结构审核';
export const AUDIT_PROMPT_SUBCATEGORIES = ['结构审核', '文本审核'] as const;
export const COMMENT_PROMPT_CATEGORY = '综合点评';
export const STATUS_PROMPT_CATEGORY = '更新状态';
export const SUMMARY_PROMPT_CATEGORY = '生成梗概';
export const HOTSPOT_ANALYSIS_PROMPT_CATEGORY = '热点分析';
const PROMPT_CATEGORY_ALIASES: Record<string, string> = {
  大纲: '设定',
  细纲: '章纲',
  章节细纲: '章纲',
  剧情链: '章纲',
  点评: COMMENT_PROMPT_CATEGORY,
  更新: STATUS_PROMPT_CATEGORY,
  状态: STATUS_PROMPT_CATEGORY,
  摘要: SUMMARY_PROMPT_CATEGORY,
  章节摘要: SUMMARY_PROMPT_CATEGORY,
  卷摘要: SUMMARY_PROMPT_CATEGORY,
  概要: SUMMARY_PROMPT_CATEGORY,
  章节概要: SUMMARY_PROMPT_CATEGORY,
  卷概要: SUMMARY_PROMPT_CATEGORY,
  梗概: SUMMARY_PROMPT_CATEGORY,
};
export const DEFAULT_PROMPT_CATEGORIES = ['脑洞', '设定', '章纲', '正文', '审核', COMMENT_PROMPT_CATEGORY, '润色', STATUS_PROMPT_CATEGORY, SUMMARY_PROMPT_CATEGORY, HOTSPOT_ANALYSIS_PROMPT_CATEGORY, UNCATEGORIZED];

export function normalizePromptCategoryName(category: string) {
  const trimmed = category.trim() || UNCATEGORIZED;
  return PROMPT_CATEGORY_ALIASES[trimmed] ?? trimmed;
}

export function isDefaultPromptCategory(category: string) {
  return DEFAULT_PROMPT_CATEGORIES.includes(normalizePromptCategoryName(category));
}

export function normalizePromptSubcategory(category: string, subCategory?: string) {
  if (normalizePromptCategoryName(category) !== AUDIT_PROMPT_CATEGORY) return undefined;
  const trimmed = subCategory?.trim() ?? '';
  return AUDIT_PROMPT_SUBCATEGORIES.includes(trimmed as typeof AUDIT_PROMPT_SUBCATEGORIES[number])
    ? trimmed
    : DEFAULT_AUDIT_PROMPT_SUBCATEGORY;
}

const PROMPTS_UPDATED_EVENT = APP_EVENTS.promptsUpdated;

const promptsStorage = createJsonStorage<PromptItem[]>(PROMPTS_KEY, [], {
  normalize: (value) => Array.isArray(value)
    ? (value as PromptItem[]).map((prompt) => ({
        ...prompt,
        category: normalizePromptCategoryName(prompt.category ?? UNCATEGORIZED),
        subCategory: normalizePromptSubcategory(prompt.category ?? UNCATEGORIZED, prompt.subCategory),
      }))
    : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptRecycleStorage = createJsonStorage<PromptItem[]>(PROMPT_RECYCLE_KEY, [], {
  normalize: (value) => Array.isArray(value)
    ? (value as PromptItem[]).map((prompt) => ({
        ...prompt,
        category: normalizePromptCategoryName(prompt.category ?? UNCATEGORIZED),
        subCategory: normalizePromptSubcategory(prompt.category ?? UNCATEGORIZED, prompt.subCategory),
      }))
    : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
function orderCategories(value: string[]) {
  const seen = new Set<string>();
  const cleaned = value
    .map((item) => normalizePromptCategoryName(item))
    .filter((item) => item.length > 0 && item !== '全部');
  const custom = cleaned.filter((item) => !DEFAULT_PROMPT_CATEGORIES.includes(item));
  return [...DEFAULT_PROMPT_CATEGORIES.slice(0, -1), ...custom, UNCATEGORIZED].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

const promptCategoriesStorage = createJsonStorage<string[]>(PROMPT_CATEGORIES_KEY, DEFAULT_PROMPT_CATEGORIES, {
  normalize: (value) => orderCategories(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : DEFAULT_PROMPT_CATEGORIES),
  eventName: PROMPTS_UPDATED_EVENT,
});

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

function createId() {
  return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(category: string) {
  return normalizePromptCategoryName(category);
}

export function readPromptSnapshot() {
  return {
    prompts: promptsStorage.read(),
    recycleBin: promptRecycleStorage.read(),
    categories: promptCategoriesStorage.read(),
  };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptItem[]>(() => promptsStorage.read());
  const [recycleBin, setRecycleBin] = useState<PromptItem[]>(() => promptRecycleStorage.read());
  const [categories, setCategories] = useState<string[]>(() => promptCategoriesStorage.read());

  useEffect(() => {
    const syncPromptState = () => {
      setPrompts(promptsStorage.read());
      setRecycleBin(promptRecycleStorage.read());
      setCategories(promptCategoriesStorage.read());
    };
    const syncPromptStorage = (event: StorageEvent) => {
      if (
        event.key
        && ![PROMPTS_KEY, PROMPT_RECYCLE_KEY, PROMPT_CATEGORIES_KEY].includes(event.key)
      ) {
        return;
      }
      syncPromptState();
    };

    window.addEventListener(PROMPTS_UPDATED_EVENT, syncPromptState);
    window.addEventListener('storage', syncPromptStorage);
    return () => {
      window.removeEventListener(PROMPTS_UPDATED_EVENT, syncPromptState);
      window.removeEventListener('storage', syncPromptStorage);
    };
  }, []);

  const categoryStats = useMemo(
    () =>
      categories.map((category) => ({
        category,
        count: prompts.filter((prompt) => prompt.category === category).length,
      })),
    [categories, prompts],
  );

  const persistPrompts = (next: PromptItem[]) => {
    setPrompts(next);
    promptsStorage.write(next);
  };

  const persistRecycle = (next: PromptItem[]) => {
    setRecycleBin(next);
    promptRecycleStorage.write(next);
  };

  const persistCategories = (next: string[]) => {
    const ordered = orderCategories(next);
    setCategories(ordered);
    promptCategoriesStorage.write(ordered);
  };

  const addPrompt = (input: NewPromptInput) => {
    const category = normalizeCategory(input.category);
    const item: PromptItem = {
      id: createId(),
      name: input.name.trim(),
      description: input.description.trim(),
      content: input.content.trim(),
      category,
      subCategory: normalizePromptSubcategory(category, input.subCategory),
      promptType: input.promptType ?? 'novel',
      usageCount: 0,
      isFavorite: false,
      isLocked: false,
      createdAt: nowText(),
      updatedAt: nowText(),
    };
    persistPrompts([item, ...prompts]);
  };

  const updatePrompt = (id: string, updates: Partial<NewPromptInput>) => {
    persistPrompts(
      prompts.map((prompt) => {
        if (prompt.id !== id) return prompt;
        const category = normalizeCategory(updates.category ?? prompt.category);
        return {
          ...prompt,
          ...updates,
          category,
          subCategory: normalizePromptSubcategory(category, updates.subCategory ?? prompt.subCategory),
          updatedAt: nowText(),
        };
      }),
    );
  };

  const deletePrompt = (id: string) => {
    const target = prompts.find((prompt) => prompt.id === id);
    if (!target || target.isLocked) return;
    persistPrompts(prompts.filter((prompt) => prompt.id !== id));
    persistRecycle([{ ...target, deletedAt: new Date().toISOString() }, ...recycleBin]);
  };

  const restorePrompt = (id: string) => {
    const target = recycleBin.find((prompt) => prompt.id === id);
    if (!target) return;
    const { deletedAt: _deletedAt, ...restored } = target;
    persistRecycle(recycleBin.filter((prompt) => prompt.id !== id));
    persistPrompts([{ ...restored, updatedAt: nowText() }, ...prompts]);
  };

  const permanentDelete = (id: string) => {
    persistRecycle(recycleBin.filter((prompt) => prompt.id !== id));
  };

  const togglePin = (id: string) => {
    persistPrompts(prompts.map((prompt) => (
      prompt.id === id
        ? {
            ...prompt,
            isFavorite: !prompt.isFavorite,
            pinnedAt: prompt.isFavorite ? undefined : new Date().toISOString(),
          }
        : prompt
    )));
  };

  const toggleLock = (id: string) => {
    persistPrompts(prompts.map((prompt) => (prompt.id === id ? { ...prompt, isLocked: !prompt.isLocked } : prompt)));
  };

  const usePrompt = (id: string) => {
    persistPrompts(prompts.map((prompt) => (
      prompt.id === id ? { ...prompt, usageCount: (prompt.usageCount ?? 0) + 1, updatedAt: nowText() } : prompt
    )));
  };

  const addCategory = (category: string) => {
    const trimmed = normalizeCategory(category);
    if (categories.includes(trimmed)) return;
    persistCategories([...categories.filter((item) => item !== UNCATEGORIZED), trimmed, UNCATEGORIZED]);
  };

  const removeCategory = (category: string) => {
    if (isDefaultPromptCategory(category)) return;
    persistCategories(categories.filter((item) => item !== category));
    persistPrompts(prompts.map((prompt) => (
      prompt.category === category ? { ...prompt, category: UNCATEGORIZED, updatedAt: nowText() } : prompt
    )));
  };

  return {
    prompts,
    recycleBin,
    categories,
    categoryStats,
    addPrompt,
    updatePrompt,
    deletePrompt,
    restorePrompt,
    permanentDelete,
    togglePin,
    toggleLock,
    usePrompt,
    addCategory,
    removeCategory,
  };
}
