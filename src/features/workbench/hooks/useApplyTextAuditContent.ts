import { useCallback } from 'react';

import type { Chapter } from '@/features/workbench/model/workbenchTypes';

export function useApplyTextAuditContent(options: {
  activeReviewChapter: Chapter | null;
  onUpdateChapterContent: (chapterId: number, content: string) => void;
  setReviewRevisedDraft: (content: string) => void;
  onToast: (message: string) => void;
}) {
  const { activeReviewChapter, onUpdateChapterContent, setReviewRevisedDraft, onToast } = options;
  return useCallback(
    (nextContent: string) => {
      if (!activeReviewChapter) return;
      onUpdateChapterContent(activeReviewChapter.id, nextContent);
      setReviewRevisedDraft(nextContent);
      onToast(`已将确认后的修改应用到第${activeReviewChapter.serialNumber}章正文`);
    },
    [activeReviewChapter, onToast, onUpdateChapterContent, setReviewRevisedDraft],
  );
}
