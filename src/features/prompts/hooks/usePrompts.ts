import { useEffect, useMemo, useState } from 'react';

import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';
const PROMPT_RECYCLE_KEY = 'xinyuexia_prompt_recycle_v1';
const PROMPT_CATEGORIES_KEY = 'xinyuexia_prompt_categories_v1';
const UNCATEGORIZED = '未分类';
export const AUDIT_PROMPT_CATEGORY = '审核';
export const DEFAULT_AUDIT_PROMPT_SUBCATEGORY = '剧情审核';
export const AUDIT_PROMPT_SUBCATEGORIES = ['剧情审核', '文本审核'] as const;
// 仅用于读取旧版本数据；正式分类统一显示为“审核”。
export const PLOT_AUDIT_PROMPT_CATEGORY = '剧情审核';
export const TEXT_AUDIT_PROMPT_CATEGORY = '文本审核';
export const COMMENT_PROMPT_CATEGORY = '点评';
export const BODY_PROMPT_CATEGORY = '正文';
export const STATUS_PROMPT_CATEGORY = '状态';
export const SUMMARY_PROMPT_CATEGORY = '梗概';
const PROMPT_CATEGORY_ALIASES: Record<string, string> = {
  大纲: '设定',
  细纲: '章纲',
  章节细纲: '章纲',
  剧情链: '章纲',
  题材迭代: UNCATEGORIZED,
  热点分析: UNCATEGORIZED,
  综合点评: COMMENT_PROMPT_CATEGORY,
  点评: COMMENT_PROMPT_CATEGORY,
  更新状态: STATUS_PROMPT_CATEGORY,
  更新: STATUS_PROMPT_CATEGORY,
  状态: STATUS_PROMPT_CATEGORY,
  生成梗概: SUMMARY_PROMPT_CATEGORY,
  摘要: SUMMARY_PROMPT_CATEGORY,
  章节摘要: SUMMARY_PROMPT_CATEGORY,
  卷摘要: SUMMARY_PROMPT_CATEGORY,
  概要: SUMMARY_PROMPT_CATEGORY,
  章节概要: SUMMARY_PROMPT_CATEGORY,
  卷概要: SUMMARY_PROMPT_CATEGORY,
  梗概: SUMMARY_PROMPT_CATEGORY,
};

function removeRetiredScriptPromptRecords(storageKey: string) {
  if (typeof localStorage === 'undefined') return;
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(parsed)) return;
    const retained = parsed.filter(
      (item) => !item || typeof item !== 'object' || (item as { promptType?: unknown }).promptType !== 'script',
    );
    if (retained.length !== parsed.length) localStorage.setItem(storageKey, JSON.stringify(retained));
  } catch {
    // 损坏数据继续交给统一存储归一化处理。
  }
}

export function removeRetiredScriptPromptData() {
  removeRetiredScriptPromptRecords(PROMPTS_KEY);
  removeRetiredScriptPromptRecords(PROMPT_RECYCLE_KEY);
}

removeRetiredScriptPromptData();
export const DEFAULT_PROMPT_CATEGORIES = [
  '脑洞',
  '设定',
  '章纲',
  BODY_PROMPT_CATEGORY,
  AUDIT_PROMPT_CATEGORY,
  COMMENT_PROMPT_CATEGORY,
  '润色',
  STATUS_PROMPT_CATEGORY,
  SUMMARY_PROMPT_CATEGORY,
  UNCATEGORIZED,
];

export function normalizePromptCategoryName(category: string) {
  const trimmed = category.trim() || UNCATEGORIZED;
  return PROMPT_CATEGORY_ALIASES[trimmed] ?? trimmed;
}

export function isDefaultPromptCategory(category: string) {
  return DEFAULT_PROMPT_CATEGORIES.includes(normalizePromptCategoryName(category));
}

export function normalizePromptSubcategory(category: string, subCategory?: string) {
  const normalizedCategory = normalizePromptCategoryName(category);
  if (normalizedCategory === PLOT_AUDIT_PROMPT_CATEGORY) return PLOT_AUDIT_PROMPT_CATEGORY;
  if (normalizedCategory === TEXT_AUDIT_PROMPT_CATEGORY) return TEXT_AUDIT_PROMPT_CATEGORY;
  if (normalizedCategory !== AUDIT_PROMPT_CATEGORY) return undefined;
  const trimmed = subCategory?.trim() ?? '';
  const normalized = trimmed === '结构审核' ? DEFAULT_AUDIT_PROMPT_SUBCATEGORY : trimmed;
  return AUDIT_PROMPT_SUBCATEGORIES.includes(normalized as (typeof AUDIT_PROMPT_SUBCATEGORIES)[number])
    ? normalized
    : DEFAULT_AUDIT_PROMPT_SUBCATEGORY;
}

export function isAuditPromptCategory(category: string, subCategory?: string) {
  return normalizePromptSubcategory(category, subCategory) !== undefined;
}

export function normalizePromptRecord(prompt: PromptItem): PromptItem {
  const rawCategory = normalizePromptCategoryName(prompt.category ?? UNCATEGORIZED);
  const legacyAuditType = normalizePromptSubcategory(rawCategory, prompt.subCategory);
  if (legacyAuditType) {
    const isLegacyTextRecord =
      rawCategory === TEXT_AUDIT_PROMPT_CATEGORY ||
      (rawCategory === AUDIT_PROMPT_CATEGORY && prompt.subCategory === TEXT_AUDIT_PROMPT_CATEGORY);
    const textAuditContent = isLegacyTextRecord
      ? prompt.textAuditContent?.trim() || prompt.content
      : prompt.textAuditContent ?? '';
    return {
      ...prompt,
      content: isLegacyTextRecord ? '' : prompt.content,
      textAuditContent,
      textAuditEnabled: Boolean(textAuditContent.trim()) && prompt.textAuditEnabled !== false,
      category: AUDIT_PROMPT_CATEGORY,
      subCategory: undefined,
    };
  }
  return {
    ...prompt,
    category: rawCategory,
    subCategory: undefined,
    textAuditContent: undefined,
    textAuditEnabled: undefined,
  };
}

const PROMPTS_UPDATED_EVENT = APP_EVENTS.promptsUpdated;

const promptsStorage = createJsonStorage<PromptItem[]>(PROMPTS_KEY, [], {
  normalize: (value) =>
    Array.isArray(value)
      ? (value as PromptItem[]).map((prompt) =>
          normalizePromptRecord({
            ...prompt,
            promptType: prompt.promptType === 'default' ? 'default' : 'novel',
          }),
        )
      : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptRecycleStorage = createJsonStorage<PromptItem[]>(PROMPT_RECYCLE_KEY, [], {
  normalize: (value) =>
    Array.isArray(value)
      ? (value as PromptItem[]).map((prompt) =>
          normalizePromptRecord({
            ...prompt,
            promptType: prompt.promptType === 'default' ? 'default' : 'novel',
          }),
        )
      : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
function orderCategories(value: string[]) {
  const seen = new Set<string>();
  const cleaned = value
    .map((item) => {
      const normalized = normalizePromptCategoryName(item);
      return normalized === PLOT_AUDIT_PROMPT_CATEGORY || normalized === TEXT_AUDIT_PROMPT_CATEGORY
        ? AUDIT_PROMPT_CATEGORY
        : normalized;
    })
    .filter((item) => item.length > 0 && item !== '全部');
  const custom = cleaned.filter((item) => !DEFAULT_PROMPT_CATEGORIES.includes(item));
  return [...DEFAULT_PROMPT_CATEGORIES.slice(0, -1), ...custom, UNCATEGORIZED].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

const promptCategoriesStorage = createJsonStorage<string[]>(PROMPT_CATEGORIES_KEY, DEFAULT_PROMPT_CATEGORIES, {
  normalize: (value) =>
    orderCategories(
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : DEFAULT_PROMPT_CATEGORIES,
    ),
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
      if (event.key && ![PROMPTS_KEY, PROMPT_RECYCLE_KEY, PROMPT_CATEGORIES_KEY].includes(event.key)) {
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
    const normalized = normalizePromptRecord({
      ...input,
      category: normalizeCategory(input.category),
    } as PromptItem);
    const item: PromptItem = {
      id: createId(),
      name: input.name.trim(),
      description: input.description.trim(),
      content: normalized.content.trim(),
      textAuditContent: normalized.textAuditContent?.trim() || undefined,
      textAuditEnabled: normalized.category === AUDIT_PROMPT_CATEGORY ? normalized.textAuditEnabled : undefined,
      category: normalized.category,
      subCategory: undefined,
      promptType: input.promptType ?? 'novel',
      usageCount: 0,
      isFavorite: false,
      isLocked: false,
      createdAt: nowText(),
      updatedAt: nowText(),
    };
    persistPrompts([item, ...prompts]);
  };

  const addPrompts = (inputs: NewPromptInput[]) => {
    const items = inputs
      .map((input) => {
        const normalized = normalizePromptRecord({
          ...input,
          category: normalizeCategory(input.category),
        } as PromptItem);
        return {
          id: createId(),
          name: input.name.trim(),
          description: input.description.trim(),
          content: normalized.content.trim(),
          textAuditContent: normalized.textAuditContent?.trim() || undefined,
          textAuditEnabled: normalized.category === AUDIT_PROMPT_CATEGORY ? normalized.textAuditEnabled : undefined,
          category: normalized.category,
          subCategory: undefined,
          promptType: input.promptType ?? 'novel',
          usageCount: 0,
          isFavorite: false,
          isLocked: false,
          createdAt: nowText(),
          updatedAt: nowText(),
        } satisfies PromptItem;
      })
      .filter((item) => item.name && (item.content || item.textAuditContent));
    if (items.length === 0) return [];
    persistCategories([...categories, ...items.map((item) => item.category)]);
    persistPrompts([...items, ...prompts]);
    return items;
  };

  const updatePrompt = (id: string, updates: Partial<NewPromptInput>) => {
    persistPrompts(
      prompts.map((prompt) => {
        if (prompt.id !== id) return prompt;
        const normalized = normalizePromptRecord({
          ...prompt,
          ...updates,
          category: normalizeCategory(updates.category ?? prompt.category),
          subCategory: updates.subCategory ?? prompt.subCategory,
        });
        return {
          ...prompt,
          ...updates,
          content: normalized.content.trim(),
          textAuditContent: normalized.textAuditContent?.trim() || undefined,
          textAuditEnabled: normalized.category === AUDIT_PROMPT_CATEGORY ? normalized.textAuditEnabled : undefined,
          category: normalized.category,
          subCategory: undefined,
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
    persistPrompts(
      prompts.map((prompt) =>
        prompt.id === id
          ? {
              ...prompt,
              isFavorite: !prompt.isFavorite,
              pinnedAt: prompt.isFavorite ? undefined : new Date().toISOString(),
            }
          : prompt,
      ),
    );
  };

  const toggleLock = (id: string) => {
    persistPrompts(prompts.map((prompt) => (prompt.id === id ? { ...prompt, isLocked: !prompt.isLocked } : prompt)));
  };

  const usePrompt = (id: string) => {
    persistPrompts(
      prompts.map((prompt) =>
        prompt.id === id ? { ...prompt, usageCount: (prompt.usageCount ?? 0) + 1, updatedAt: nowText() } : prompt,
      ),
    );
  };

  const addCategory = (category: string) => {
    const trimmed = normalizeCategory(category);
    if (categories.includes(trimmed)) return;
    persistCategories([...categories.filter((item) => item !== UNCATEGORIZED), trimmed, UNCATEGORIZED]);
  };

  const removeCategory = (category: string) => {
    if (isDefaultPromptCategory(category)) return;
    persistCategories(categories.filter((item) => item !== category));
    persistPrompts(
      prompts.map((prompt) =>
        prompt.category === category ? { ...prompt, category: UNCATEGORIZED, updatedAt: nowText() } : prompt,
      ),
    );
  };

  return {
    prompts,
    recycleBin,
    categories,
    categoryStats,
    addPrompt,
    addPrompts,
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
