import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

import {
  cancelScheduledWorkbenchJsonWrite,
  flushWorkbenchWrites,
  retryWorkbenchWrites,
  scheduleWorkbenchPersistenceTask,
} from '@/features/workbench/model/workbenchPersistenceQueue';
import type { WorkbenchSaveStatus } from '@/features/workbench/model/workbenchSaveStatus';
import type { Chapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { countWords } from '@/features/workbench/model/workbenchRules';
import { recordWritingWords } from '@/shared/stats/writingStats';
import { writeJsonValue } from '@/shared/storage/jsonStorage';

import { NOVELS_KEY, VOLUMES_KEY, formatDate, getChapterContentKey } from '../model/workbenchDataSupport';

const ACTIVE_CHAPTER_SAVE_TASK_KEY = 'workbench:active-chapter-save';

type SelectedChapter = { volumeId: number; volumeName: string; chapter: Chapter } | null;

interface ChapterSaveCommit {
  nextNovels: WorkbenchNovel[];
  nextVolumesMap: Record<number, Volume[]>;
  savedAt: string;
  wordDelta: number;
}

export function useWorkbenchChapterContentPersistence(args: {
  novels: WorkbenchNovel[];
  currentNovelId: number | null;
  volumesMap: Record<number, Volume[]>;
  selectedChapter: SelectedChapter;
  setNovels: Dispatch<SetStateAction<WorkbenchNovel[]>>;
  setVolumesMap: Dispatch<SetStateAction<Record<number, Volume[]>>>;
  setEditorContent: Dispatch<SetStateAction<string>>;
  setLastSavedAt: Dispatch<SetStateAction<string | null>>;
  setSaveStatus: Dispatch<SetStateAction<WorkbenchSaveStatus>>;
}) {
  const {
    novels,
    currentNovelId,
    volumesMap,
    selectedChapter,
    setNovels,
    setVolumesMap,
    setEditorContent,
    setLastSavedAt,
    setSaveStatus,
  } = args;
  const novelsRef = useRef(novels);
  const volumesMapRef = useRef(volumesMap);
  const saveRevisionRef = useRef(0);
  novelsRef.current = novels;
  volumesMapRef.current = volumesMap;

  const saveContent = useCallback(
    (content: string) => {
      setEditorContent(content);
      if (currentNovelId === null || !selectedChapter) return;

      const novelId = currentNovelId;
      const chapterId = selectedChapter.chapter.id;
      const revision = ++saveRevisionRef.current;
      setSaveStatus('saving');

      scheduleWorkbenchPersistenceTask<ChapterSaveCommit>(
        ACTIVE_CHAPTER_SAVE_TASK_KEY,
        () => {
          const currentVolumesMap = volumesMapRef.current;
          const currentNovels = novelsRef.current;
          const currentVolumes = currentVolumesMap[novelId] ?? [];
          const wordCount = countWords(content);
          let previousWordCount = wordCount;
          const nextVolumes = currentVolumes.map((volume) => ({
            ...volume,
            chapters: volume.chapters.map((chapter) => {
              if (chapter.id !== chapterId) return chapter;
              previousWordCount = chapter.wordCount;
              return { ...chapter, wordCount };
            }),
          }));
          const nextVolumesMap = { ...currentVolumesMap, [novelId]: nextVolumes };
          const wordCountTotal = nextVolumes.reduce(
            (sum, volume) => sum + volume.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.wordCount, 0),
            0,
          );
          const nextNovels = currentNovels.map((novel) =>
            novel.id === novelId ? { ...novel, wordCount: wordCountTotal, lastModifiedAt: formatDate() } : novel,
          );

          cancelScheduledWorkbenchJsonWrite(VOLUMES_KEY);
          cancelScheduledWorkbenchJsonWrite(NOVELS_KEY);
          localStorage.setItem(getChapterContentKey(novelId, chapterId), content);
          writeJsonValue(VOLUMES_KEY, nextVolumesMap);
          writeJsonValue(NOVELS_KEY, nextNovels);

          return {
            nextNovels,
            nextVolumesMap,
            savedAt: new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            wordDelta: wordCount - previousWordCount,
          };
        },
        {
          onSuccess: (commit) => {
            novelsRef.current = commit.nextNovels;
            volumesMapRef.current = commit.nextVolumesMap;
            setNovels(commit.nextNovels);
            setVolumesMap(commit.nextVolumesMap);
            recordWritingWords(commit.wordDelta);
            if (saveRevisionRef.current !== revision) return;
            setLastSavedAt(commit.savedAt);
            setSaveStatus('saved');
          },
          onError: () => {
            if (saveRevisionRef.current === revision) setSaveStatus('error');
          },
        },
      );
    },
    [currentNovelId, selectedChapter, setEditorContent, setLastSavedAt, setNovels, setSaveStatus, setVolumesMap],
  );

  const flushPendingSave = useCallback(() => flushWorkbenchWrites().failedKeys.length === 0, []);
  const retryPendingSave = useCallback(() => {
    setSaveStatus('saving');
    retryWorkbenchWrites();
  }, [setSaveStatus]);

  return { saveContent, flushPendingSave, retryPendingSave };
}
