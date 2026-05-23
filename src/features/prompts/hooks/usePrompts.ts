import { useMemo, useState } from 'react';

import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';
const PROMPT_RECYCLE_KEY = 'xinyuexia_prompt_recycle_v1';
const PROMPT_CATEGORIES_KEY = 'xinyuexia_prompt_categories_v1';
const DEFAULT_CATEGORIES = ['未分类', '提炼', '正文', '大纲', '细纲', '审核', '更新'];

const PROMPTS_UPDATED_EVENT = APP_EVENTS.promptsUpdated;
const promptsStorage = createJsonStorage<PromptItem[]>(PROMPTS_KEY, [], {
  normalize: (value) => Array.isArray(value) ? (value as PromptItem[]) : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptRecycleStorage = createJsonStorage<PromptItem[]>(PROMPT_RECYCLE_KEY, [], {
  normalize: (value) => Array.isArray(value) ? (value as PromptItem[]) : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptCategoriesStorage = createJsonStorage<string[]>(PROMPT_CATEGORIES_KEY, DEFAULT_CATEGORIES, {
  normalize: (value) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : DEFAULT_CATEGORIES,
});

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

function createId() {
  return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(category: string) {
  return category.trim() || '未分类';
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
    setCategories(next);
    promptCategoriesStorage.write(next);
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

  const toggleFavorite = (id: string) => {
    persistPrompts(prompts.map((prompt) => (prompt.id === id ? { ...prompt, isFavorite: !prompt.isFavorite } : prompt)));
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
    persistCategories([...categories, trimmed]);
  };

  const removeCategory = (category: string) => {
    if (category === '未分类') return;
    persistCategories(categories.filter((item) => item !== category));
    persistPrompts(prompts.map((prompt) => (
      prompt.category === category ? { ...prompt, category: '未分类', updatedAt: nowText() } : prompt
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
    toggleFavorite,
    toggleLock,
    usePrompt,
    addCategory,
    removeCategory,
  };
}
