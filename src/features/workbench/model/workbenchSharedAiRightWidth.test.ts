import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const sharedWidthPath = resolve(process.cwd(), 'src/features/workbench/model/workbenchSharedAiRightWidth.ts');
const workbenchPagePath = resolve(process.cwd(), 'src/features/workbench/pages/WorkbenchPage.tsx');
const libraryStoragePath = resolve(process.cwd(), 'src/features/workbench/components/workbenchLibraryStorageState.ts');
const libraryConstantsPath = resolve(process.cwd(), 'src/features/workbench/components/workbenchLibraryPanelConstants.ts');
const chapterEditorPath = resolve(process.cwd(), 'src/features/workbench/components/ChapterEditor.tsx');

describe('shared workbench AI right width', () => {
  it('uses one shared width key with a 380px minimum across writing, library, review and status pages', async () => {
    const [sharedWidthSource, workbenchPageSource, libraryStorageSource, libraryConstantsSource, chapterEditorSource] = await Promise.all([
      readFile(sharedWidthPath, 'utf8'),
      readFile(workbenchPagePath, 'utf8'),
      readFile(libraryStoragePath, 'utf8'),
      readFile(libraryConstantsPath, 'utf8'),
      readFile(chapterEditorPath, 'utf8'),
    ]);

    expect(sharedWidthSource).toContain("WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_ai_panel_width'");
    expect(sharedWidthSource).toContain("WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT = 'xinyuexia:workbench-shared-ai-right-width'");
    expect(sharedWidthSource).toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT = 430');
    expect(sharedWidthSource).toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN = 380');
    expect(sharedWidthSource).toContain("window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT");
    expect(workbenchPageSource).toContain('readSharedWorkbenchAiRightWidth');
    expect(workbenchPageSource).toContain('writeSharedWorkbenchAiRightWidth(aiPanelWidth)');
    expect(workbenchPageSource).toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(workbenchPageSource).toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN');
    expect(libraryStorageSource).toContain('readSharedWorkbenchAiRightWidth');
    expect(libraryStorageSource).toContain('writeSharedWorkbenchAiRightWidth(value)');
    await expect(readFile(resolve(process.cwd(), 'src/features/workbench/components/WorkbenchLibraryPanel.tsx'), 'utf8')).resolves.toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(libraryConstantsSource).toContain('export const SETTING_LIBRARY_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;');
    expect(libraryConstantsSource).toContain('export const OUTLINE_ACTION_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;');
    expect(chapterEditorSource).toContain('readSharedWorkbenchAiRightWidth');
    expect(chapterEditorSource).toContain('WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT');
    expect(chapterEditorSource).toContain('onCommit?: (value: number) => void;');
    expect(chapterEditorSource).toContain('onCommit?.(finalWidth)');
    expect(chapterEditorSource).toContain('onCommit: (value) => writeSharedWorkbenchAiRightWidth(value)');
    expect(chapterEditorSource).not.toContain('writeSharedWorkbenchAiRightWidth(statusPageRightWidth)');
    expect(chapterEditorSource).not.toContain('writeSharedWorkbenchAiRightWidth(reviewPageRightWidth)');
    expect(chapterEditorSource).toContain('const REVIEW_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;');
    expect(chapterEditorSource).toContain('const STATUS_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;');
    expect(chapterEditorSource).not.toContain("const REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_right_width';");
    expect(chapterEditorSource).not.toContain("const STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_right_width';");
  });
});
