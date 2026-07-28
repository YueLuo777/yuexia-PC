import { isDetailOutlineLikeTab, normalizeTabName, SETTING_TAB } from '@/features/workbench/components/workbenchLibraryTabs';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_BRAINSTORM_TAB,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Volume } from '@/features/workbench/model/workbenchTypes';
import type { BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import type { StandardSettingTemplateState } from './standardModeSettingModel';
import { summarizeTemplate } from './standardModeTemplateModel';

interface StandardModeWorkbenchStatsInput {
  novelWordCount: number;
  volumes: Volume[];
  outlineEntries: WorkbenchLibraryEntry[];
  reviewTasks: BackgroundAiTask[];
  settingsStorageKey: string;
  settingTemplateState?: StandardSettingTemplateState | null;
  readChapterContent: (chapterId: number) => string;
}

export interface StandardModeWorkbenchStats {
  wordCount: number;
  outlineCount: number;
  draftCount: number;
  reviewedChapterCount: number;
  brainstormCount: number;
  settingTotalCount: number;
  settingCompletedCount: number;
}

export function buildStandardModeWorkbenchStats({
  novelWordCount,
  volumes,
  outlineEntries,
  reviewTasks,
  settingsStorageKey,
  settingTemplateState,
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
  const brainstormCount = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)
    .filter((entry) => entry.tab === WORKBENCH_BRAINSTORM_TAB && !entry.deletedAt).length;
  const settingEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey)
    .filter((entry) => normalizeTabName(entry.tab) === SETTING_TAB && !entry.deletedAt);
  const settingSummary = settingTemplateState ? summarizeTemplate(settingTemplateState.structure) : null;
  const settingTotalCount = settingSummary?.fieldCount ?? settingEntries.length;
  const settingCompletedCount = settingTemplateState
    ? settingTemplateState.structure
      .filter((domain) => domain.enabled)
      .flatMap((domain) => domain.groups.filter((group) => group.enabled))
      .flatMap((group) => group.entries.filter((entry) => entry.enabled))
      .flatMap((entry) => entry.sections.filter((section) => section.enabled))
      .flatMap((section) => section.fields.filter((field) => field.enabled && Boolean(field.value?.trim()))).length
    : settingEntries.filter((entry) => entry.content.trim().length > 0).length;

  return {
    wordCount: Math.max(0, novelWordCount),
    outlineCount: outlineEntries.filter(
      (entry) => !entry.deletedAt && isDetailOutlineLikeTab(entry.tab) && entry.content.trim().length > 0,
    ).length,
    draftCount: chapters.filter((chapter) => readChapterContent(chapter.id).trim().length > 0).length,
    reviewedChapterCount: reviewedChapterIds.size,
    brainstormCount,
    settingTotalCount,
    settingCompletedCount,
  };
}
