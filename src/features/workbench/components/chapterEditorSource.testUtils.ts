import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const CHAPTER_EDITOR_SOURCE_FILES = [
  'src/features/workbench/components/ChapterEditor.tsx',
  'src/features/workbench/components/ChapterEditorView.tsx',
  'src/features/workbench/components/chapterEditorLayout.tsx',
  'src/features/workbench/components/chapterEditorReviewConfig.ts',
  'src/features/workbench/components/chapterEditorPresentation.tsx',
  'src/features/workbench/components/ChapterStatusPanel.tsx',
  'src/features/workbench/components/ChapterReviewDirectory.tsx',
  'src/features/workbench/components/ChapterReviewPreview.tsx',
  'src/features/workbench/components/ChapterTextAuditContinuousReview.tsx',
  'src/features/workbench/components/ChapterReviewAiPanel.tsx',
  'src/features/workbench/components/ChapterReviewManagementModal.tsx',
  'src/features/workbench/components/ChapterWritingSurface.tsx',
  'src/features/workbench/components/ChapterEditorModalHost.tsx',
  'src/features/workbench/components/ChapterStatusManagementModal.tsx',
  'src/features/workbench/components/ChapterReviewPanel.tsx',
  'src/features/workbench/components/ChapterEditorSettingsModal.tsx',
  'src/features/workbench/components/ChapterReviewLogModal.tsx',
  'src/features/workbench/model/chapterReviewLog.ts',
  'src/features/workbench/components/chapterEditorTypes.ts',
  'src/features/workbench/hooks/useChapterStatus.ts',
  'src/features/workbench/hooks/useChapterReviewState.ts',
  'src/features/workbench/hooks/useChapterReviewBackgroundTasks.ts',
  'src/features/workbench/hooks/useChapterReviewPrompts.ts',
  'src/features/workbench/hooks/useChapterReviewRequest.ts',
  'src/features/workbench/hooks/useChapterEditorInput.ts',
  'src/features/workbench/hooks/useChapterAssociations.ts',
  'src/features/workbench/hooks/useChapterEditorPanels.tsx',
  'src/features/workbench/hooks/useChapterEditorSettingsModal.ts',
  'src/features/workbench/hooks/useChapterReviewPresentation.ts',
  'src/features/workbench/hooks/useApplyTextAuditContent.ts',
] as const;

export function readChapterEditorSource() {
  return CHAPTER_EDITOR_SOURCE_FILES.map((file) => readFileSync(resolve(process.cwd(), file), 'utf8')).join('\n\n');
}
