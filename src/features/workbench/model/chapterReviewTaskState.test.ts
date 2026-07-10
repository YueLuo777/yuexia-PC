import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearAllReviewModeResults,
  getReviewBackgroundTaskStorageKey,
  isReviewBackgroundTaskForChapter,
  writeReviewBackgroundTaskId,
  type ReviewModeState,
} from './chapterReviewTaskState';

describe('chapterReviewTaskState', () => {
  beforeEach(() => localStorage.clear());

  it('stores task ids independently by chapter and mode', () => {
    writeReviewBackgroundTaskId('settings-1', 10, 'audit', 'task-a');
    writeReviewBackgroundTaskId('settings-1', 11, 'polish', 'task-b');

    expect(JSON.parse(localStorage.getItem(getReviewBackgroundTaskStorageKey('settings-1')) ?? '{}')).toEqual({
      10: { audit: 'task-a' },
      11: { polish: 'task-b' },
    });
  });

  it('validates the complete review task scope', () => {
    const task = {
      id: 'task-a',
      kind: 'review' as const,
      title: '审核',
      status: 'running' as const,
      input: '',
      output: '',
      createdAt: '',
      updatedAt: '',
      meta: { target: 'chapterReview', settingsStorageKey: 'settings-1', chapterId: 10, mode: 'audit' },
    };

    expect(isReviewBackgroundTaskForChapter(task, 'settings-1', 10, 'audit')).toBe(true);
    expect(isReviewBackgroundTaskForChapter(task, 'settings-1', 11, 'audit')).toBe(false);
    expect(isReviewBackgroundTaskForChapter(task, 'settings-1', 10, 'polish')).toBe(false);
  });

  it('clears displayed results while preserving per-mode input', () => {
    const state: ReviewModeState = {
      input: '保留要求',
      output: '旧结果',
      revisedDraft: '旧草稿',
      requestLog: '旧日志',
      backgroundTaskId: 'task-a',
    };
    const cleared = clearAllReviewModeResults({ audit: state, comment: state, polish: state });

    expect(cleared.audit).toEqual({
      input: '保留要求',
      output: '',
      revisedDraft: '',
      requestLog: '',
      backgroundTaskId: undefined,
    });
  });
});
