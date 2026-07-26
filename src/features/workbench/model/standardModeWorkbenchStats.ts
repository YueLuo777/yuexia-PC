import { isDetailOutlineLikeTab } from '@/features/workbench/components/workbenchLibraryTabs';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { Volume } from '@/features/workbench/model/workbenchTypes';
import type { BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';

interface StandardModeWorkbenchStatsInput {
  novelWordCount: number;
  volumes: Volume[];
  outlineEntries: WorkbenchLibraryEntry[];
  reviewTasks: BackgroundAiTask[];
  settingsStorageKey: string;
  readChapterContent: (chapterId: number) => string;
}

export interface StandardModeWorkbenchStats {
  wordCount: number;
  outlineCount: number;
  draftCount: number;
  reviewedChapterCount: number;
}

export function buildStandardModeWorkbenchStats({
  novelWordCount,
  volumes,
  outlineEntries,
  reviewTasks,
  settingsStorageKey,
  readChapterContent,
}: StandardModeWorkbenchStatsInput): StandardModeWorkbenchStats {
  const chapters = volumes.flatMap((volume) => volume.chapters);
  const reviewedChapterIds = new Set(
    reviewTasks
      .filter(
        (task) =>
          task.status === 'success' &&
          task.output.trim().length > 0 &&
          task.meta?.target === 'chapterReview' &&
          task.meta?.mode === 'audit' &&
          task.meta?.settingsStorageKey === settingsStorageKey,
      )
      .map((task) => Number(task.meta?.chapterId))
      .filter((chapterId) => Number.isFinite(chapterId) && chapters.some((chapter) => chapter.id === chapterId)),
  );

  return {
    wordCount: Math.max(0, novelWordCount),
    outlineCount: outlineEntries.filter(
      (entry) => !entry.deletedAt && isDetailOutlineLikeTab(entry.tab) && entry.content.trim().length > 0,
    ).length,
    draftCount: chapters.filter((chapter) => readChapterContent(chapter.id).trim().length > 0).length,
    reviewedChapterCount: reviewedChapterIds.size,
  };
}
