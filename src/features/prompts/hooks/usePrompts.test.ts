import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROMPT_CATEGORIES,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
} from './usePrompts';

describe('usePrompts categories', () => {
  it('includes plot chain as a default novel prompt category', () => {
    expect(DEFAULT_PROMPT_CATEGORIES).toContain('剧情链');
    expect(isDefaultPromptCategory('剧情链')).toBe(true);
    expect(normalizePromptCategoryName('剧情链')).toBe('剧情链');
  });
});
