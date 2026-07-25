import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useApplyTextAuditContent } from './useApplyTextAuditContent';

describe('useApplyTextAuditContent', () => {
  it('saves accepted text and returns the review page to its initial state', () => {
    const events: string[] = [];
    const onUpdateChapterContent = vi.fn(() => events.push('update'));
    const clearReviewAiOutput = vi.fn(() => events.push('clear'));
    const onToast = vi.fn(() => events.push('toast'));
    const { result } = renderHook(() =>
      useApplyTextAuditContent({
        activeReviewChapter: {
          id: 7,
          title: '未命名章节',
          serialNumber: 2,
          wordCount: 10,
          isSelected: true,
        },
        onUpdateChapterContent,
        clearReviewAiOutput,
        onToast,
      }),
    );

    act(() => result.current('应用后的正文'));

    expect(onUpdateChapterContent).toHaveBeenCalledWith(7, '应用后的正文');
    expect(clearReviewAiOutput).toHaveBeenCalledTimes(1);
    expect(onToast).toHaveBeenCalledWith('已将确认后的修改应用到第2章正文');
    expect(events).toEqual(['update', 'clear', 'toast']);
  });
});
