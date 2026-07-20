import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from './chapterEditorSource.testUtils';

describe('ChapterEditor review AI output clear button', () => {
  it('clears the active review output and disconnects persisted background tasks', () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource('const clearReviewAiOutput = () => {');
    expect(source).toContainSource('if (taskId) stopBackgroundAiTask(taskId);');
    expect(source).toContainSource(
      'writeReviewBackgroundTaskId(settingsStorageKey, reviewChapterId ?? activeChapterId, reviewMode, undefined);',
    );
    expect(source).toContainSource("output: ''");
    expect(source).toContainSource("revisedDraft: ''");
    expect(source).toContainSource("requestLog: ''");
    expect(source).toContainSource('backgroundTaskId: undefined');
    expect(source).toContainSource('onClick={clearReviewAiOutput}');
    expect(source).not.toContainSource("onClick={() => setReviewAiOutput('')}");
  });
});
