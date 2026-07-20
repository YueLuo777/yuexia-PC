import { Folder, FolderOpen } from 'lucide-react';

import { isChapterContentPolished } from '@/features/workbench/model/chapterPolishStatus';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import {
  ChapterNumberButton,
  CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE,
} from '@/shared/ui/ChapterNumberButton';

import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from './chapterEditorLayout';

type ReviewDirectoryGroup = {
  id: number;
  name: string;
  chapters: Chapter[];
};

interface ChapterReviewDirectoryProps {
  chapterDirectoryGroups: ReviewDirectoryGroup[];
  expandedReviewVolumeIds: Set<number>;
  toggleReviewDirectoryVolume: (volumeId: number) => void;
  activeReviewChapter: Chapter | null;
  reviewMode: ReviewMode;
  settingsStorageKey: string;
  getChapterContent: (chapterId: number) => string;
  selectReviewChapter: (chapterId: number) => void;
}

export function ChapterReviewDirectory({
  chapterDirectoryGroups,
  expandedReviewVolumeIds,
  toggleReviewDirectoryVolume,
  activeReviewChapter,
  reviewMode,
  settingsStorageKey,
  getChapterContent,
  selectReviewChapter,
}: ChapterReviewDirectoryProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        {chapterDirectoryGroups.map((group) => {
          const expanded = expandedReviewVolumeIds.has(group.id);
          const GroupFolderIcon = expanded ? FolderOpen : Folder;
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleReviewDirectoryVolume(group.id)}
                className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                aria-expanded={expanded}
              >
                <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                <span className="min-w-0 flex-1 truncate leading-none">{group.name}</span>
                <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>
              </button>
              {expanded && (
                <div
                  className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                  style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}
                >
                  {group.chapters.map((item) => {
                    const selected = activeReviewChapter?.id === item.id;
                    const polished =
                      reviewMode === 'polish'
                        ? isChapterContentPolished(settingsStorageKey, item.id, getChapterContent(item.id))
                        : false;
                    return (
                      <ChapterNumberButton
                        key={item.id}
                        onClick={() => selectReviewChapter(item.id)}
                        title={`第${item.serialNumber}章 ${item.title || '未命名章节'} · ${item.wordCount}字${reviewMode === 'polish' ? ` · ${polished ? '已润色' : '未润色'}` : ''}`}
                        selected={selected}
                        state="empty"
                        showAlertDot={reviewMode === 'polish' && !polished}
                      >
                        {item.serialNumber}
                      </ChapterNumberButton>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
