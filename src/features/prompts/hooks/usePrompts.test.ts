import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  AUDIT_PROMPT_CATEGORY,
  AUDIT_PROMPT_SUBCATEGORIES,
  BODY_PROMPT_CATEGORY,
  COMMENT_PROMPT_CATEGORY,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  STATUS_PROMPT_CATEGORY,
  SUMMARY_PROMPT_CATEGORY,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
  normalizePromptRecord,
  normalizePromptSubcategory,
  removeRetiredScriptPromptData,
} from './usePrompts';

const readUsePromptsSource = () => readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'usePrompts.ts'), 'utf8');

describe('usePrompts categories', () => {
  it('uses setting and chapter-outline prompt categories without plot chain', () => {
    expect(DEFAULT_PROMPT_CATEGORIES).toEqual([
      '脑洞',
      '设定',
      '章纲',
      BODY_PROMPT_CATEGORY,
      AUDIT_PROMPT_CATEGORY,
      COMMENT_PROMPT_CATEGORY,
      '润色',
      STATUS_PROMPT_CATEGORY,
      SUMMARY_PROMPT_CATEGORY,
      '未分类',
    ]);
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf(BODY_PROMPT_CATEGORY)).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf(AUDIT_PROMPT_CATEGORY),
    );
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf(AUDIT_PROMPT_CATEGORY)).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf(COMMENT_PROMPT_CATEGORY),
    );
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('剧情审核');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('文本审核');
    expect(DEFAULT_PROMPT_CATEGORIES).toContainSource('润色');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('题材迭代');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('大纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('细纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('剧情链');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContainSource('更新');
    expect(isDefaultPromptCategory('设定')).toBe(true);
    expect(isDefaultPromptCategory('章纲')).toBe(true);
    expect(normalizePromptCategoryName('题材迭代')).toBe('未分类');
    expect(normalizePromptCategoryName('热点分析')).toBe('未分类');
    expect(isDefaultPromptCategory('更新状态')).toBe(true);
    expect(normalizePromptCategoryName('大纲')).toBe('设定');
    expect(normalizePromptCategoryName('细纲')).toBe('章纲');
    expect(normalizePromptCategoryName('剧情链')).toBe('章纲');
    expect(normalizePromptCategoryName('综合点评')).toBe('点评');
    expect(normalizePromptCategoryName('更新状态')).toBe('状态');
    expect(normalizePromptCategoryName('生成梗概')).toBe('梗概');
    expect(normalizePromptCategoryName('更新')).toBe('状态');
  });

  it('keeps audit prompt subcategories normalized under audit only', () => {
    expect(AUDIT_PROMPT_SUBCATEGORIES).toEqual(['剧情审核', '文本审核']);
    expect(DEFAULT_AUDIT_PROMPT_SUBCATEGORY).toBe('剧情审核');
    expect(normalizePromptSubcategory('审核', '文本审核')).toBe('文本审核');
    expect(normalizePromptSubcategory('审核', '结构审核')).toBe('剧情审核');
    expect(normalizePromptSubcategory('审核', '')).toBe('剧情审核');
    expect(normalizePromptSubcategory('剧情审核')).toBe('剧情审核');
    expect(normalizePromptSubcategory('文本审核')).toBe('文本审核');
    expect(normalizePromptSubcategory('点评', '文本审核')).toBeUndefined();
  });
  it('migrates legacy audit records into one visible category', () => {
    const legacy = {
      id: 'legacy-audit',
      name: 'old',
      description: '',
      content: 'content',
      category: '审核',
      subCategory: '文本审核',
      promptType: 'novel' as const,
      usageCount: 0,
      isFavorite: false,
      isLocked: false,
      createdAt: '',
      updatedAt: '',
    };
    expect(normalizePromptRecord(legacy)).toMatchObject({
      category: '审核',
      content: '',
      textAuditContent: 'content',
      textAuditEnabled: true,
      subCategory: undefined,
    });
    expect(normalizePromptRecord({ ...legacy, subCategory: undefined })).toMatchObject({
      category: '审核',
      content: 'content',
      textAuditContent: '',
      textAuditEnabled: false,
      subCategory: undefined,
    });
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
