import { getBackgroundAiTask, type BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';

export type ReviewMode = 'audit' | 'comment' | 'polish';

export type ReviewModeState = {
  input: string;
  output: string;
  revisedDraft: string;
  requestLog: string;
  backgroundTaskId?: string;
};

export const REVIEW_MODE_TITLES: Record<ReviewMode, string> = {
  audit: '剧情审核',
  comment: '综合点评',
  polish: '文笔润色',
};

type ReviewBackgroundTaskIdsByChapter = Record<string, Partial<Record<ReviewMode, string>>>;

export function createReviewModeState(): ReviewModeState {
  return {
    input: '',
    output: '',
    revisedDraft: '',
    requestLog: '',
  };
}

function clearReviewModeResult(state: ReviewModeState): ReviewModeState {
  return {
    ...state,
    output: '',
    revisedDraft: '',
    requestLog: '',
    backgroundTaskId: undefined,
  };
}

export function clearAllReviewModeResults(states: Record<ReviewMode, ReviewModeState>) {
  return {
    audit: clearReviewModeResult(states.audit),
    comment: clearReviewModeResult(states.comment),
    polish: clearReviewModeResult(states.polish),
  };
}

export function getReviewBackgroundTaskStorageKey(settingsStorageKey: string) {
  return `${settingsStorageKey}_review_background_tasks_v2`;
}

function readReviewBackgroundTaskIds(settingsStorageKey: string, chapterId: number | null) {
  if (chapterId === null) return {} as Partial<Record<ReviewMode, string>>;
  try {
    const parsed = JSON.parse(
      localStorage.getItem(getReviewBackgroundTaskStorageKey(settingsStorageKey)) ?? '{}',
    ) as ReviewBackgroundTaskIdsByChapter;
    const chapterTaskIds = parsed[String(chapterId)] ?? {};
    return {
      audit: typeof chapterTaskIds.audit === 'string' ? chapterTaskIds.audit : undefined,
      comment: typeof chapterTaskIds.comment === 'string' ? chapterTaskIds.comment : undefined,
      polish: typeof chapterTaskIds.polish === 'string' ? chapterTaskIds.polish : undefined,
    };
  } catch {
    return {};
  }
}

export function writeReviewBackgroundTaskId(
  settingsStorageKey: string,
  chapterId: number | null,
  mode: ReviewMode,
  taskId?: string,
) {
  if (chapterId === null) return;
  const storageKey = getReviewBackgroundTaskStorageKey(settingsStorageKey);
  let current: ReviewBackgroundTaskIdsByChapter = {};
  try {
    current = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as ReviewBackgroundTaskIdsByChapter;
  } catch {
    current = {};
  }
  const chapterTaskIds = { ...(current[String(chapterId)] ?? {}), [mode]: taskId };
  if (!taskId) delete chapterTaskIds[mode];
  const next = { ...current, [String(chapterId)]: chapterTaskIds };
  if (Object.keys(chapterTaskIds).length === 0) delete next[String(chapterId)];
  localStorage.setItem(storageKey, JSON.stringify(next));
}

export function isReviewBackgroundTaskForChapter(
  task: BackgroundAiTask | null,
  settingsStorageKey: string,
  chapterId: number | null,
  mode?: ReviewMode,
): task is BackgroundAiTask {
  return Boolean(
    task &&
    chapterId !== null &&
    task.meta?.target === 'chapterReview' &&
    task.meta.settingsStorageKey === settingsStorageKey &&
    Number(task.meta.chapterId) === chapterId &&
    (!mode || task.meta.mode === mode),
  );
}

function getRestorableReviewBackgroundTaskId(
  settingsStorageKey: string,
  chapterId: number | null,
  mode: ReviewMode,
  taskId?: string,
) {
  if (!taskId) return undefined;
  const task = getBackgroundAiTask(taskId);
  if (!isReviewBackgroundTaskForChapter(task, settingsStorageKey, chapterId, mode)) return undefined;
  return task.id;
}

export function readRestorableReviewBackgroundTaskIds(settingsStorageKey: string, chapterId: number | null) {
  const storedTaskIds = readReviewBackgroundTaskIds(settingsStorageKey, chapterId);
  const restorableTaskIds: Partial<Record<ReviewMode, string>> = {};
  (Object.keys(REVIEW_MODE_TITLES) as ReviewMode[]).forEach((mode) => {
    const taskId = getRestorableReviewBackgroundTaskId(settingsStorageKey, chapterId, mode, storedTaskIds[mode]);
    if (taskId) restorableTaskIds[mode] = taskId;
    else if (storedTaskIds[mode]) writeReviewBackgroundTaskId(settingsStorageKey, chapterId, mode, undefined);
  });
  return restorableTaskIds;
}
