import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PromptItem } from '@/features/prompts/model/promptTypes';

import { useChapterReviewPrompts } from './useChapterReviewPrompts';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';

function createAuditPrompt(id: string, category: '剧情审核' | '文本审核'): PromptItem {
  return {
    id,
    name: `${category}提示词`,
    description: '',
    content: `${category}内容`,
    category,
    promptType: 'novel',
    usageCount: 0,
    isFavorite: false,
    isLocked: false,
    createdAt: '',
    updatedAt: '',
  };
}

describe('useChapterReviewPrompts audit category', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates split audit records into one category without adding audit-mode labels', () => {
    localStorage.setItem(
      PROMPTS_KEY,
      JSON.stringify([createAuditPrompt('plot', '剧情审核'), createAuditPrompt('text', '文本审核')]),
    );
    const clearReviewAiOutput = vi.fn();
    const { result } = renderHook(() => useChapterReviewPrompts({ reviewMode: 'audit', clearReviewAiOutput }));

    expect(result.current.activeReviewPromptOptions).toEqual([
      { value: 'plot', label: '剧情审核提示词' },
      { value: 'text', label: '文本审核提示词' },
    ]);
    expect(result.current.activeReviewPromptCategory).toBe('审核');

    act(() => result.current.handleActiveReviewPromptChange('text'));

    expect(result.current.activeReviewPromptId).toBe('text');
    expect(result.current.activeReviewPromptCategory).toBe('审核');
    expect(result.current.isAuditTextReview).toBe(false);
    expect(result.current.isAuditStructureReview).toBe(true);
    expect(clearReviewAiOutput).toHaveBeenCalledTimes(1);
  });

  it('switches the audit preview to text comparison after a combined result contains revised text', () => {
    localStorage.setItem(
      PROMPTS_KEY,
      JSON.stringify([
        {
          ...createAuditPrompt('combined', '剧情审核'),
          category: '审核',
          textAuditContent: '文本审核内容',
          textAuditEnabled: true,
        },
      ]),
    );
    const { result } = renderHook(() =>
      useChapterReviewPrompts({
        reviewMode: 'audit',
        clearReviewAiOutput: vi.fn(),
        reviewAiOutput: '【剧情审核结论】通过\n【修改后全文】\n修改后的正文',
      }),
    );

    expect(result.current.isAuditTextReview).toBe(true);
    expect(result.current.isAuditStructureReview).toBe(false);
  });
});
