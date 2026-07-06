import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('ChapterEditor review AI output clear button', () => {
  it('clears the active review output and disconnects persisted background tasks', () => {
    const source = readSource('src/features/workbench/components/ChapterEditor.tsx');

    expect(source).toContain('const clearReviewAiOutput = () => {');
    expect(source).toContain('if (taskId) stopBackgroundAiTask(taskId);');
    expect(source).toContain('writeReviewBackgroundTaskId(settingsStorageKey, reviewMode, undefined);');
    expect(source).toContain('output: \'\'');
    expect(source).toContain('revisedDraft: \'\'');
    expect(source).toContain('requestLog: \'\'');
    expect(source).toContain('backgroundTaskId: undefined');
    expect(source).toContain('onClick={clearReviewAiOutput}');
    expect(source).not.toContain('onClick={() => setReviewAiOutput(\'\')}');
  });
});
