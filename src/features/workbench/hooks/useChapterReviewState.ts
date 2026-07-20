import { useCallback, useEffect, useState } from 'react';

import { stopBackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import {
  clearAllReviewModeResults,
  createReviewModeState,
  writeReviewBackgroundTaskId,
  type ReviewMode,
  type ReviewModeState,
} from '@/features/workbench/model/chapterReviewTaskState';

interface UseChapterReviewStateOptions {
  initialMode: ReviewMode;
  activeChapterId: number | null;
  settingsStorageKey: string;
}

export function useChapterReviewState({
  initialMode,
  activeChapterId,
  settingsStorageKey,
}: UseChapterReviewStateOptions) {
  const [reviewChapterId, setReviewChapterId] = useState<number | null>(() => activeChapterId);
  const [reviewMode, setReviewMode] = useState<ReviewMode>(initialMode);
  const [reviewModeStates, setReviewModeStates] = useState<Record<ReviewMode, ReviewModeState>>(() => ({
    audit: createReviewModeState(),
    comment: createReviewModeState(),
    polish: createReviewModeState(),
  }));
  const [isReviewAiLoading, setIsReviewAiLoading] = useState(false);
  const [isReviewLogOpen, setIsReviewLogOpen] = useState(false);

  useEffect(() => {
    if (activeChapterId !== null) {
      setReviewChapterId(activeChapterId);
      setReviewModeStates(clearAllReviewModeResults);
    }
  }, [activeChapterId]);

  const activeReviewState = reviewModeStates[reviewMode];

  const updateReviewModeState = useCallback(
    (mode: ReviewMode, updater: (state: ReviewModeState) => ReviewModeState) => {
      setReviewModeStates((prev) => ({
        ...prev,
        [mode]: updater(prev[mode]),
      }));
    },
    [],
  );

  const updateActiveReviewState = useCallback(
    (updater: (state: ReviewModeState) => ReviewModeState) => {
      updateReviewModeState(reviewMode, updater);
    },
    [reviewMode, updateReviewModeState],
  );

  const setReviewAiInput = useCallback(
    (value: string | ((current: string) => string)) => {
      updateActiveReviewState((state) => ({
        ...state,
        input: typeof value === 'function' ? value(state.input) : value,
      }));
    },
    [updateActiveReviewState],
  );

  const setReviewAiOutput = useCallback(
    (value: string | ((current: string) => string)) => {
      updateActiveReviewState((state) => ({
        ...state,
        output: typeof value === 'function' ? value(state.output) : value,
      }));
    },
    [updateActiveReviewState],
  );

  const setReviewRevisedDraft = useCallback(
    (value: string | ((current: string) => string)) => {
      updateActiveReviewState((state) => ({
        ...state,
        revisedDraft: typeof value === 'function' ? value(state.revisedDraft) : value,
      }));
    },
    [updateActiveReviewState],
  );

  const clearReviewAiOutput = () => {
    const taskId = reviewModeStates[reviewMode]?.backgroundTaskId;
    if (taskId) stopBackgroundAiTask(taskId);
    writeReviewBackgroundTaskId(settingsStorageKey, reviewChapterId ?? activeChapterId, reviewMode, undefined);
    updateActiveReviewState((state) => ({
      ...state,
      output: '',
      revisedDraft: '',
      requestLog: '',
      backgroundTaskId: undefined,
    }));
    setIsReviewAiLoading(false);
  };

  const activateReviewMode = useCallback((mode: ReviewMode) => {
    setReviewMode(mode);
    setIsReviewLogOpen(false);
  }, []);

  const selectReviewChapter = useCallback((nextChapterId: number) => {
    setReviewChapterId(nextChapterId);
    setIsReviewLogOpen(false);
    setReviewModeStates(clearAllReviewModeResults);
  }, []);

  return {
    activeReviewState,
    reviewChapterId,
    reviewMode,
    setReviewMode,
    reviewModeStates,
    setReviewModeStates,
    updateReviewModeState,
    isReviewAiLoading,
    setIsReviewAiLoading,
    isReviewLogOpen,
    setIsReviewLogOpen,
    reviewAiInput: activeReviewState.input,
    reviewAiOutput: activeReviewState.output,
    reviewRevisedDraft: activeReviewState.revisedDraft,
    reviewRequestLog: activeReviewState.requestLog,
    setReviewAiInput,
    setReviewAiOutput,
    setReviewRevisedDraft,
    clearReviewAiOutput,
    activateReviewMode,
    selectReviewChapter,
  };
}
