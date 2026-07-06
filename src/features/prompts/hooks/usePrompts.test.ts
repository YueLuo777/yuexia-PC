import { describe, expect, it } from 'vitest';

import {
  AUDIT_PROMPT_SUBCATEGORIES,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  HOTSPOT_ANALYSIS_PROMPT_CATEGORY,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
  normalizePromptSubcategory,
} from './usePrompts';

describe('usePrompts categories', () => {
  it('uses setting and chapter-outline prompt categories without plot chain', () => {
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('设定');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('章纲');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain(HOTSPOT_ANALYSIS_PROMPT_CATEGORY);
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('综合点评');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('润色');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('更新状态');
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('生成梗概');
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf('生成梗概')).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf(HOTSPOT_ANALYSIS_PROMPT_CATEGORY),
    );
    expect(DEFAULT_PROMPT_CATEGORIES.indexOf(HOTSPOT_ANALYSIS_PROMPT_CATEGORY)).toBeLessThan(
      DEFAULT_PROMPT_CATEGORIES.indexOf('未分类'),
    );
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('大纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('细纲');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('剧情链');
    expect(DEFAULT_PROMPT_CATEGORIES).not.toContain('更新');
    expect(isDefaultPromptCategory('设定')).toBe(true);
    expect(isDefaultPromptCategory('章纲')).toBe(true);
    expect(isDefaultPromptCategory('热点分析')).toBe(true);
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
    expect(AUDIT_PROMPT_SUBCATEGORIES).toEqual(['结构审核', '文本审核']);
    expect(DEFAULT_AUDIT_PROMPT_SUBCATEGORY).toBe('结构审核');
    expect(normalizePromptSubcategory('审核', '文本审核')).toBe('文本审核');
    expect(normalizePromptSubcategory('审核', '')).toBe('结构审核');
    expect(normalizePromptSubcategory('综合点评', '文本审核')).toBeUndefined();
  });
});
