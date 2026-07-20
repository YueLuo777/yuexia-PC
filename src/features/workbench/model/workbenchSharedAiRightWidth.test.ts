import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from '../components/chapterEditorSource.testUtils';

const sharedWidthPath = resolve(process.cwd(), 'src/features/workbench/model/workbenchSharedAiRightWidth.ts');
const workbenchPagePath = resolve(process.cwd(), 'src/features/workbench/pages/WorkbenchPage.tsx');
const workbenchLayoutWidthsPath = resolve(process.cwd(), 'src/features/workbench/hooks/useWorkbenchLayoutWidths.ts');
const libraryStoragePath = resolve(process.cwd(), 'src/features/workbench/components/workbenchLibraryStorageState.ts');
const libraryConstantsPath = resolve(
  process.cwd(),
  'src/features/workbench/components/workbenchLibraryPanelConstants.ts',
);

describe('shared workbench AI right width', () => {
  it('uses one shared width key with a 380px minimum across writing, library, review and status pages', async () => {
    const [sharedWidthSource, workbenchPageSource, libraryStorageSource, libraryConstantsSource, chapterEditorSource] =
      await Promise.all([
        readFile(sharedWidthPath, 'utf8'),
        Promise.all([readFile(workbenchPagePath, 'utf8'), readFile(workbenchLayoutWidthsPath, 'utf8')]).then((parts) =>
          parts.join('\n'),
        ),
        readFile(libraryStoragePath, 'utf8'),
        readFile(libraryConstantsPath, 'utf8'),
        Promise.resolve(readChapterEditorSource()),
      ]);

    expect(sharedWidthSource).toContainSource(
      "WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_ai_panel_width'",
    );
    expect(sharedWidthSource).toContainSource(
      "WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT = 'xinyuexia:workbench-shared-ai-right-width'",
    );
    expect(sharedWidthSource).toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT = 430');
    expect(sharedWidthSource).toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN = 380');
    expect(sharedWidthSource).toContainSource(
      'window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT',
    );
    expect(workbenchPageSource).toContainSource('readSharedWorkbenchAiRightWidth');
    expect(workbenchPageSource).toContainSource('writeSharedWorkbenchAiRightWidth(aiPanelWidth)');
    expect(workbenchPageSource).toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(workbenchPageSource).toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN');
    expect(libraryStorageSource).toContainSource('readSharedWorkbenchAiRightWidth');
    expect(libraryStorageSource).toContainSource('writeSharedWorkbenchAiRightWidth(value)');
    await expect(
      readFile(resolve(process.cwd(), 'src/features/workbench/components/WorkbenchLibraryPanel.tsx'), 'utf8'),
    ).resolves.toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(libraryConstantsSource).toContainSource(
      'export const SETTING_LIBRARY_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;',
    );
    expect(libraryConstantsSource).toContainSource(
      'export const OUTLINE_ACTION_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;',
    );
    expect(chapterEditorSource).toContainSource('readSharedWorkbenchAiRightWidth');
    expect(chapterEditorSource).toContainSource('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(chapterEditorSource).toContainSource('onCommit?: (value: number) => void;');
    expect(chapterEditorSource).toContainSource('onCommit?.(finalWidth)');
    expect(chapterEditorSource).toContainSource('onCommit: (value) => writeSharedWorkbenchAiRightWidth(value)');
    expect(chapterEditorSource).not.toContainSource('writeSharedWorkbenchAiRightWidth(statusPageRightWidth)');
    expect(chapterEditorSource).not.toContainSource('writeSharedWorkbenchAiRightWidth(reviewPageRightWidth)');
    expect(chapterEditorSource).toContainSource(
      'const REVIEW_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;',
    );
    expect(chapterEditorSource).toContainSource(
      'const STATUS_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;',
    );
    expect(chapterEditorSource).not.toContainSource(
      "const REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_right_width';",
    );
    expect(chapterEditorSource).not.toContainSource(
      "const STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_right_width';",
    );
  });
});
