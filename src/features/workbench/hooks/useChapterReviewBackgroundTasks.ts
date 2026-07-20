import { useEffect, type Dispatch, type SetStateAction } from 'react';

import { getBackgroundAiTask, subscribeBackgroundAiTasks } from '@/shared/ai/backgroundAiTasks';
import { extractReviewRevisedText } from '@/features/workbench/model/chapterReviewText';
import {
  REVIEW_MODE_TITLES,
  isReviewBackgroundTaskForChapter,
  readRestorableReviewBackgroundTaskIds,
  type ReviewMode,
  type ReviewModeState,
} from '@/features/workbench/model/chapterReviewTaskState';
import { getReviewBackgroundTaskOutput } from '@/features/workbench/components/chapterEditorPresentation';

interface UseChapterReviewBackgroundTasksOptions {
  activeReviewChapterId: number | null;
  reviewMode: ReviewMode;
  reviewModeStates: Record<ReviewMode, ReviewModeState>;
  setReviewModeStates: Dispatch<SetStateAction<Record<ReviewMode, ReviewModeState>>>;
  setIsReviewAiLoading: Dispatch<SetStateAction<boolean>>;
  settingsStorageKey: string;
}

export function useChapterReviewBackgroundTasks({
  activeReviewChapterId,
  reviewMode,
  reviewModeStates,
  setReviewModeStates,
  setIsReviewAiLoading,
  settingsStorageKey,
}: UseChapterReviewBackgroundTasksOptions) {
  useEffect(() => {
    const storedTaskIds = readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId);
    setReviewModeStates((prev) => ({
      audit: { ...prev.audit, backgroundTaskId: storedTaskIds.audit },
      comment: { ...prev.comment, backgroundTaskId: storedTaskIds.comment },
      polish: { ...prev.polish, backgroundTaskId: storedTaskIds.polish },
    }));
  }, [activeReviewChapterId, setReviewModeStates, settingsStorageKey]);

  useEffect(() => {
    const syncBackgroundTasks = () => {
      const storedTaskIds = readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId);
      setReviewModeStates((prev) => {
        let changed = false;
        const next = { ...prev };
        (Object.keys(REVIEW_MODE_TITLES) as ReviewMode[]).forEach((mode) => {
          const taskId = prev[mode].backgroundTaskId ?? storedTaskIds[mode];
          if (!taskId) return;
          const task = getBackgroundAiTask(taskId);
          if (!isReviewBackgroundTaskForChapter(task, settingsStorageKey, activeReviewChapterId, mode)) return;
          const nextOutput = getReviewBackgroundTaskOutput(task, mode);
          const nextRequestLog =
            typeof task.meta?.requestLog === 'string' ? task.meta.requestLog : prev[mode].requestLog;
          const nextState: ReviewModeState = {
            ...prev[mode],
            output: nextOutput,
            requestLog: nextRequestLog,
            backgroundTaskId: task.id,
          };
          if (task.status === 'success') {
            const revised = extractReviewRevisedText(nextOutput);
            if (revised && revised !== prev[mode].revisedDraft) {
              nextState.revisedDraft = revised;
            }
          }
          const stateChanged =
            nextState.output !== prev[mode].output ||
            nextState.requestLog !== prev[mode].requestLog ||
            nextState.backgroundTaskId !== prev[mode].backgroundTaskId ||
            nextState.revisedDraft !== prev[mode].revisedDraft;
          if (!stateChanged) return;
          changed = true;
          next[mode] = nextState;
        });
        return changed ? next : prev;
      });

      const activeTaskId =
        reviewModeStates[reviewMode]?.backgroundTaskId ??
        readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId)[reviewMode];
      const activeTask = activeTaskId ? getBackgroundAiTask(activeTaskId) : null;
      setIsReviewAiLoading(
        isReviewBackgroundTaskForChapter(activeTask, settingsStorageKey, activeReviewChapterId, reviewMode) &&
          activeTask?.status === 'running',
      );
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [
    activeReviewChapterId,
    reviewMode,
    reviewModeStates,
    setIsReviewAiLoading,
    setReviewModeStates,
    settingsStorageKey,
  ]);
}
