import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import {
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import {
  isStatusTargetEntry,
} from '@/features/workbench/components/chapterEditorPresentation';
import {
  getExistingWorkbenchEntryStatus,
  upsertWorkbenchEntryStatus,
} from '@/features/workbench/components/workbenchEntryStatusRecord';

type ChapterDirectoryGroup = {
  id: number;
  name: string;
  chapters: Chapter[];
};

interface UseChapterStatusOptions {
  chapter: Chapter | null;
  content: string;
  getChapterContent: (chapterId: number) => string;
  sortedChapters: Chapter[];
  chapterDirectoryGroups: ChapterDirectoryGroup[];
  settingsStorageKey: string;
  embeddedStatus: boolean;
  setIsStatusUpdateOpen: Dispatch<SetStateAction<boolean>>;
  onToast: (text: string) => void;
}

export function useChapterStatus({
  chapter,
  content,
  getChapterContent,
  sortedChapters,
  chapterDirectoryGroups,
  settingsStorageKey,
  embeddedStatus,
  setIsStatusUpdateOpen,
  onToast,
}: UseChapterStatusOptions) {
  const [statusChapterId, setStatusChapterId] = useState<number | null>(() => chapter?.id ?? null);
  const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());
  const [statusEntries, setStatusEntries] = useState<WorkbenchLibraryEntry[]>([]);
  const [statusTargetIds, setStatusTargetIds] = useState<Set<string>>(() => new Set());
  const [statusDraft, setStatusDraft] = useState('');

  useEffect(() => {
    setExpandedStatusVolumeIds((current) => {
      const next = new Set(current);
      chapterDirectoryGroups.forEach((group) => next.add(group.id));
      return next;
    });
  }, [chapterDirectoryGroups]);

  useEffect(() => {
    if (chapter?.id !== undefined) setStatusChapterId(chapter.id);
  }, [chapter?.id]);

  const toggleStatusDirectoryVolume = (volumeId: number) => {
    setExpandedStatusVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };

  const activeStatusChapter =
    sortedChapters.find((item) => item.id === statusChapterId) ?? chapter ?? sortedChapters[0] ?? null;
  const statusPreviewChapters = activeStatusChapter
    ? sortedChapters.filter((item) => item.serialNumber <= activeStatusChapter.serialNumber)
    : [];
  const statusPreviewText = statusPreviewChapters
    .map((item) => {
      const body = item.id === chapter?.id ? content : getChapterContent(item.id);
      return `第${item.serialNumber}章 ${item.title || '未命名章节'}\n${body || '暂无正文'}`;
    })
    .join('\n\n');
  const statusPreviewWordCount = statusPreviewText.replace(/\s/g, '').length;
  const statusTargetEntries = useMemo(() => statusEntries.filter(isStatusTargetEntry), [statusEntries]);
  const selectedStatusTargets = statusTargetEntries.filter((entry) => statusTargetIds.has(entry.id));
  const statusUpdateSourceEntries = selectedStatusTargets.length > 0 ? selectedStatusTargets : statusTargetEntries;
  const statusUpdatedChapterIds = useMemo(
    () =>
      new Set(
        sortedChapters
          .filter((item) =>
            statusUpdateSourceEntries.some((entry) => getExistingWorkbenchEntryStatus(entry.content, item.serialNumber)),
          )
          .map((item) => item.id),
      ),
    [sortedChapters, statusUpdateSourceEntries],
  );

  const openStatusUpdate = useCallback(() => {
    const entries = readWorkbenchLibraryEntries(settingsStorageKey);
    const targets = entries.filter(isStatusTargetEntry);
    const firstTarget = targets[0] ?? null;
    const nextChapter = chapter ?? sortedChapters[0] ?? null;
    setStatusEntries(entries);
    setStatusTargetIds(firstTarget ? new Set([firstTarget.id]) : new Set());
    setStatusDraft(
      firstTarget && nextChapter ? getExistingWorkbenchEntryStatus(firstTarget.content, nextChapter.serialNumber) : '',
    );
    setStatusChapterId(nextChapter?.id ?? null);
    setIsStatusUpdateOpen(true);
  }, [chapter, setIsStatusUpdateOpen, settingsStorageKey, sortedChapters]);

  useEffect(() => {
    if (embeddedStatus) openStatusUpdate();
  }, [embeddedStatus, openStatusUpdate]);

  const toggleStatusTarget = (entry: WorkbenchLibraryEntry) => {
    setStatusTargetIds((current) => {
      const next = new Set(current);
      if (next.has(entry.id)) next.delete(entry.id);
      else next.add(entry.id);
      if (next.size === 1) {
        const selectedId = Array.from(next)[0];
        const selected = statusTargetEntries.find((item) => item.id === selectedId);
        if (selected && activeStatusChapter) {
          setStatusDraft(getExistingWorkbenchEntryStatus(selected.content, activeStatusChapter.serialNumber));
        }
      }
      return next;
    });
  };

  const selectStatusChapter = (nextChapterId: number) => {
    const nextChapter = sortedChapters.find((item) => item.id === nextChapterId) ?? null;
    setStatusChapterId(nextChapterId);
    if (statusTargetIds.size === 1 && nextChapter) {
      const selected = statusTargetEntries.find((item) => statusTargetIds.has(item.id));
      setStatusDraft(selected ? getExistingWorkbenchEntryStatus(selected.content, nextChapter.serialNumber) : '');
    }
  };

  const saveStatusUpdate = () => {
    if (!activeStatusChapter || statusTargetIds.size === 0 || !statusDraft.trim()) return;
    const nextEntries = statusEntries.map((entry) =>
      statusTargetIds.has(entry.id)
        ? {
            ...entry,
            content: upsertWorkbenchEntryStatus(entry.content, activeStatusChapter, statusDraft),
            updatedAt: new Date().toLocaleString('zh-CN'),
          }
        : entry,
    );
    setStatusEntries(nextEntries);
    writeWorkbenchLibraryEntries(settingsStorageKey, nextEntries);
    if (!embeddedStatus) setIsStatusUpdateOpen(false);
    onToast(`已更新 ${statusTargetIds.size} 个状态到第${activeStatusChapter.serialNumber}章`);
  };

  return {
    expandedStatusVolumeIds,
    toggleStatusDirectoryVolume,
    activeStatusChapter,
    statusPreviewChapters,
    statusPreviewText,
    statusPreviewWordCount,
    statusTargetEntries,
    selectedStatusTargets,
    statusTargetIds,
    toggleStatusTarget,
    statusDraft,
    setStatusDraft,
    statusUpdatedChapterIds,
    selectStatusChapter,
    saveStatusUpdate,
    openStatusUpdate,
  };
}
