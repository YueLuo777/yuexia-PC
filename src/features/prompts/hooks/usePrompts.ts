import { useMemo, useState } from 'react';

import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';
const PROMPT_RECYCLE_KEY = 'xinyuexia_prompt_recycle_v1';
const PROMPT_CATEGORIES_KEY = 'xinyuexia_prompt_categories_v1';
const UNCATEGORIZED = '未分类';
const DEFAULT_CATEGORIES = ['脑洞', '大纲', '细纲', '正文', '审核', '润色', '更新', '概要', '提炼', UNCATEGORIZED];

export function isDefaultPromptCategory(category: string) {
  return DEFAULT_CATEGORIES.includes(category);
}

const PROMPTS_UPDATED_EVENT = APP_EVENTS.promptsUpdated;
const promptsStorage = createJsonStorage<PromptItem[]>(PROMPTS_KEY, [], {
  normalize: (value) => Array.isArray(value) ? (value as PromptItem[]) : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptRecycleStorage = createJsonStorage<PromptItem[]>(PROMPT_RECYCLE_KEY, [], {
  normalize: (value) => Array.isArray(value) ? (value as PromptItem[]) : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
function orderCategories(value: string[]) {
  const seen = new Set<string>();
  const cleaned = value
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== '全部');
  const custom = cleaned.filter((item) => !DEFAULT_CATEGORIES.includes(item));
  return [...DEFAULT_CATEGORIES.slice(0, -1), ...custom, UNCATEGORIZED].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

const promptCategoriesStorage = createJsonStorage<string[]>(PROMPT_CATEGORIES_KEY, DEFAULT_CATEGORIES, {
  normalize: (value) => orderCategories(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : DEFAULT_CATEGORIES),
});

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

function createId() {
  return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(category: string) {
  return category.trim() || UNCATEGORIZED;
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
    const item: PromptItem = {
      id: createId(),
      name: input.name.trim(),
      description: input.description.trim(),
      content: input.content.trim(),
      category: normalizeCategory(input.category),
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
      prompts.map((prompt) =>
        prompt.id === id
          ? {
              ...prompt,
              ...updates,
              category: normalizeCategory(updates.category ?? prompt.category),
              updatedAt: nowText(),
            }
          : prompt,
      ),
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
