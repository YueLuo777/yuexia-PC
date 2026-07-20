import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  AUDIT_PROMPT_SUBCATEGORIES,
  BODY_PROMPT_CATEGORY,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  GENRE_ITERATION_PROMPT_CATEGORY,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
  normalizePromptSubcategory,
  removeRetiredScriptPromptData,
} from './usePrompts';

const readUsePromptsSource = () => readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'usePrompts.ts'), 'utf8');

describe('usePrompts categories', () => {
  it('uses setting and chapter-outline prompt categories without plot chain', () => {
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('设定');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('章纲');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource(BODY_PROMPT_CATEGORY);
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource(GENRE_ITERATION_PROMPT_CATEGORY);
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('综合点评');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('润色');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('更新状态');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('生成梗概');
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf('生成梗概')).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf(GENRE_ITERATION_PROMPT_CATEGORY),
    );
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf(GENRE_ITERATION_PROMPT_CATEGORY)).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf('未分类'),
    );
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('大纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('细纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('剧情链');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('更新');
    expect(isDefaultPromptCategory('设定')).toBe(true);
    expect(isDefaultPromptCategory('章纲')).toBe(true);
    expect(isDefaultPromptCategory('题材迭代')).toBe(true);
    expect(normalizePromptCategoryName('热点分析')).toBe('题材迭代');
    expect(isDefaultPromptCategory('更新状态')).toBe(true);
    expect(normalizePromptCategoryName('大纲')).toBe('设定');
    expect(normalizePromptCategoryName('细纲')).toBe('章纲');
    expect(normalizePromptCategoryName('剧情链')).toBe('章纲');
    expect(normalizePromptCategoryName('点评')).toBe('综合点评');
    expect(normalizePromptCategoryName('更新')).toBe('更新状态');
    expect(normalizePromptCategoryName('状态')).toBe('更新状态');
    expect(normalizePromptCategoryName('梗概')).toBe('生成梗概');
  });

  it('keeps audit prompt subcategories normalized under audit only', () => {
    expect(AUDIT_PROMPT_SUBCATEGORIES).toEqual(['剧情审核', '文本审核']);
    expect(DEFAULT_AUDIT_PROMPT_SUBCATEGORY).toBe('剧情审核');
    expect(normalizePromptSubcategory('审核', '文本审核')).toBe('文本审核');
    expect(normalizePromptSubcategory('审核', '结构审核')).toBe('剧情审核');
    expect(normalizePromptSubcategory('审核', '')).toBe('剧情审核');
    expect(normalizePromptSubcategory('综合点评', '文本审核')).toBeUndefined();
  });
  it('supports batch prompt imports without repeatedly writing from stale prompt state', () => {
    const source = readUsePromptsSource();
    const addPromptsStart = source.indexOf('const addPrompts = (inputs: NewPromptInput[]) =>');
    const addPromptsEnd = source.indexOf('const updatePrompt =', addPromptsStart);
    const addPromptsSource = source.slice(addPromptsStart, addPromptsEnd);

    expect(addPromptsSource).toContainSource('persistPrompts([...items, ...prompts]);');
    expect(addPromptsSource).toContainSource(
      'persistCategories([...categories, ...items.map((item) => item.category)]);',
    );
    expect(addPromptsSource).toContainSource('return items;');
    expect(source).toContainSource('addPrompts,');
  });

  it('permanently removes retired script prompts from active and recycled storage', () => {
    const novelPrompt = { id: 'novel-1', promptType: 'novel' };
    const scriptPrompt = { id: 'script-1', promptType: 'script' };
    localStorage.setItem('xinyuexia_prompts_v1', JSON.stringify([novelPrompt, scriptPrompt]));
    localStorage.setItem('xinyuexia_prompt_recycle_v1', JSON.stringify([scriptPrompt]));

    removeRetiredScriptPromptData();

    expect(JSON.parse(localStorage.getItem('xinyuexia_prompts_v1') ?? '[]')).toEqual([novelPrompt]);
    expect(JSON.parse(localStorage.getItem('xinyuexia_prompt_recycle_v1') ?? '[]')).toEqual([]);
  });
});
