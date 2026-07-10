import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('ChapterEditor review AI output clear button', () => {
  it('clears the active review output and disconnects persisted background tasks', () => {
    const source = readSource('src/features/workbench/components/ChapterEditor.tsx');

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
