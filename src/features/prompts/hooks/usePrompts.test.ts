import { describe, expect, it } from 'vitest';

import {
  AUDIT_PROMPT_SUBCATEGORIES,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
  normalizePromptSubcategory,
} from './usePrompts';

describe('usePrompts categories', () => {
  it('uses setting and chapter-outline prompt categories without plot chain', () => {
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('设定');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('章纲');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('点评');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('润色');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('状态');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('大纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('细纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('剧情链');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('更新');
    expect(isDefaultPromptCategory('设定')).toBe(true);
    expect(isDefaultPromptCategory('章纲')).toBe(true);
    expect(isDefaultPromptCategory('状态')).toBe(true);
    expect(normalizePromptCategoryName('大纲')).toBe('设定');
    expect(normalizePromptCategoryName('细纲')).toBe('章纲');
    expect(normalizePromptCategoryName('剧情链')).toBe('章纲');
    expect(normalizePromptCategoryName('更新')).toBe('状态');
  });

  it('keeps audit prompt subcategories normalized under audit only', () => {
    expect(AUDIT_PROMPT_SUBCATEGORIES).toEqual(['结构审核', '文本审核']);
    expect(DEFAULT_AUDIT_PROMPT_SUBCATEGORY).toBe('结构审核');
    expect(normalizePromptSubcategory('审核', '文本审核')).toBe('文本审核');
    expect(normalizePromptSubcategory('审核', '')).toBe('结构审核');
    expect(normalizePromptSubcategory('点评', '文本审核')).toBeUndefined();
  });
});
