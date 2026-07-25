import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { applyFormat, getStoredFormatSettings, saveSnapshot } from '@/features/workbench/components/EditorToolModals';
import type { Chapter, RecycledChapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { countWords, ensureOneSelected } from '@/features/workbench/model/workbenchRules';
import {
  flushWorkbenchWrites,
  scheduleWorkbenchJsonWrite,
} from '@/features/workbench/model/workbenchPersistenceQueue';
import { recordWritingWords } from '@/shared/stats/writingStats';
import {
  NOVELS_KEY,
  VOLUMES_KEY,
  RECYCLED_CHAPTERS_KEY,
  SORT_KEY,
  writeJson,
  uid,
  getChapterContentKey,
  readChapterContent,
  writeChapterContent,
  formatDate,
  addDays,
  toChineseNumber,
  createDefaultVolumes,
} from '../model/workbenchDataSupport';

type SelectedChapter = { volumeId: number; volumeName: string; chapter: Chapter } | null;

export function useWorkbenchChapterActions(args: {
  novels: WorkbenchNovel[];
  currentNovel: WorkbenchNovel | null;
  currentNovelId: number | null;
  volumes: Volume[];
  volumesMap: Record<number, Volume[]>;
  recycledMap: Record<number, RecycledChapter[]>;
  recycledChapters: RecycledChapter[];
  selectedChapter: SelectedChapter;
  setNovels: Dispatch<SetStateAction<WorkbenchNovel[]>>;
  setVolumesMap: Dispatch<SetStateAction<Record<number, Volume[]>>>;
  setRecycledMap: Dispatch<SetStateAction<Record<number, RecycledChapter[]>>>;
  setSortAsc: Dispatch<SetStateAction<boolean>>;
  setEditorContent: Dispatch<SetStateAction<string>>;
  setLastSavedAt: Dispatch<SetStateAction<string | null>>;
}) {
  const {
    novels,
    currentNovel,
    currentNovelId,
    volumes,
    volumesMap,
    recycledMap,
    recycledChapters,
    selectedChapter,
    setNovels,
    setVolumesMap,
    setRecycledMap,
    setSortAsc,
    setEditorContent,
    setLastSavedAt,
  } = args;
  const persistVolumes = useCallback(
    (updater: (prev: Volume[]) => Volume[]) => {
      if (!currentNovelId) return;
      setVolumesMap((prevMap) => {
        const current = prevMap[currentNovelId] ?? createDefaultVolumes(currentNovel?.type ?? 'novel');
        const nextVolumes = ensureOneSelected(updater(current));
        const nextMap = { ...prevMap, [currentNovelId]: nextVolumes };
        writeJson(VOLUMES_KEY, nextMap);
        return nextMap;
      });
    },
    [currentNovel?.type, currentNovelId, setVolumesMap],
  );

  const persistRecycled = useCallback(
    (updater: (prev: RecycledChapter[]) => RecycledChapter[]) => {
      if (!currentNovelId) return;
      setRecycledMap((prevMap) => {
        const next = { ...prevMap, [currentNovelId]: updater(prevMap[currentNovelId] ?? []) };
        writeJson(RECYCLED_CHAPTERS_KEY, next);
        return next;
      });
    },
    [currentNovelId, setRecycledMap],
  );

  const updateNovelWordCount = useCallback(
    (nextVolumes: Volume[]) => {
      if (!currentNovelId) return;
      const wordCount = nextVolumes.reduce(
        (sum, volume) => sum + volume.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.wordCount, 0),
        0,
      );
      const nextNovels = novels.map((novel) =>
        novel.id === currentNovelId ? { ...novel, wordCount, lastModifiedAt: formatDate() } : novel,
      );
      setNovels(nextNovels);
      writeJson(NOVELS_KEY, nextNovels);
    },
    [currentNovelId, novels, setNovels],
  );

  const renameNovel = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!currentNovelId || !trimmed) return;
      const nextNovels = novels.map((novel) =>
        novel.id === currentNovelId ? { ...novel, title: trimmed, lastModifiedAt: formatDate() } : novel,
      );
      setNovels(nextNovels);
      writeJson(NOVELS_KEY, nextNovels);
    },
    [currentNovelId, novels, setNovels],
  );

  const formatChapterOnSelect = useCallback(
    (chapterId: number) => {
      if (!currentNovelId) return null;
      const original = readChapterContent(currentNovelId, chapterId);
      const formatted = applyFormat(original, getStoredFormatSettings());
      if (formatted === original) return null;

      saveSnapshot(chapterId, original);
      writeChapterContent(currentNovelId, chapterId, formatted);
      return {
        content: formatted,
        wordCount: countWords(formatted),
      };
    },
    [currentNovelId],
  );

  const selectChapter = useCallback(
    (volumeId: number, chapterId: number) => {
      if (flushWorkbenchWrites().failedKeys.length > 0) return;
      const formatted = formatChapterOnSelect(chapterId);
      persistVolumes((prev) =>
        prev.map((volume) => ({
          ...volume,
          chapters: volume.chapters.map((chapter) => ({
            ...chapter,
            isSelected: volume.id === volumeId && chapter.id === chapterId,
            wordCount: formatted && chapter.id === chapterId ? formatted.wordCount : chapter.wordCount,
          })),
        })),
      );
      if (formatted && selectedChapter?.chapter.id === chapterId) {
        setEditorContent(formatted.content);
        setLastSavedAt(
          new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        );
      }
    },
    [formatChapterOnSelect, persistVolumes, selectedChapter?.chapter.id, setEditorContent, setLastSavedAt],
  );

  const toggleVolume = useCallback(
    (volumeId: number) => {
      persistVolumes((prev) =>
        prev.map((volume) => (volume.id === volumeId ? { ...volume, isExpanded: !volume.isExpanded } : volume)),
      );
    },
    [persistVolumes],
  );

  const toggleSort = useCallback(() => {
    setSortAsc((prev) => {
      const next = !prev;
      localStorage.setItem(SORT_KEY, String(next));
      return next;
    });
  }, [setSortAsc]);

  const addVolume = useCallback(() => {
    persistVolumes((prev) => {
      const nonOutlineCount = prev.filter((volume) => volume.name !== '集纲').length;
      return [
        ...prev,
        {
          id: uid(),
          name: `第${toChineseNumber(nonOutlineCount + 1)}卷`,
          isExpanded: true,
          chapters: [],
        },
      ];
    });
  }, [persistVolumes]);

  const deleteVolume = useCallback(
    (volumeId: number) => {
      persistVolumes((prev) => prev.filter((volume) => volume.id !== volumeId));
    },
    [persistVolumes],
  );

  const addChapter = useCallback(
    (volumeId: number) => {
      persistVolumes((prev) => {
        const targetVolume = prev.find((volume) => volume.id === volumeId);
        if (!targetVolume) return prev;

        const isOutline = targetVolume.name === '集纲';
        let serialNumber = 1;
        let title = '';

        if (isOutline) {
          const usedNumbers = new Set(targetVolume.chapters.map((chapter) => chapter.serialNumber));
          while (usedNumbers.has(serialNumber)) serialNumber += 1;
          title = `集纲${serialNumber}`;
        } else {
          const usedNumbers = new Set(
            prev
              .filter((volume) => volume.name !== '集纲')
              .flatMap((volume) => volume.chapters.map((chapter) => chapter.serialNumber)),
          );
          while (usedNumbers.has(serialNumber)) serialNumber += 1;
        }

        const newChapter: Chapter = {
          id: uid(),
          title,
          serialNumber,
          wordCount: 0,
          isSelected: true,
          isPublished: false,
        };

        return prev.map((volume) => ({
          ...volume,
          chapters:
            volume.id === volumeId
              ? [...volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })), newChapter]
              : volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })),
        }));
      });
    },
    [persistVolumes],
  );

  const renameChapter = useCallback(
    (chapterId: number, title: string) => {
      persistVolumes((prev) =>
        prev.map((volume) => ({
          ...volume,
          chapters: volume.chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, title } : chapter)),
        })),
      );
    },
    [persistVolumes],
  );

  const updateChapterSerialNumber = useCallback(
    (chapterId: number, serialNumber: number) => {
      persistVolumes((prev) =>
        prev.map((volume) => ({
          ...volume,
          chapters: volume.chapters.map((chapter) =>
            chapter.id === chapterId ? { ...chapter, serialNumber: Math.max(1, serialNumber) } : chapter,
          ),
        })),
      );
    },
    [persistVolumes],
  );

  const setChapterPublished = useCallback(
    (chapterId: number, isPublished: boolean) => {
      persistVolumes((prev) =>
        prev.map((volume) => ({
          ...volume,
          chapters: volume.chapters.map((chapter) =>
            chapter.id === chapterId ? { ...chapter, isPublished } : chapter,
          ),
        })),
      );
    },
    [persistVolumes],
  );

  const deleteChapter = useCallback(
    (volumeId: number, chapterId: number) => {
      if (!currentNovelId) return;
      const volume = volumes.find((item) => item.id === volumeId);
      const chapter = volume?.chapters.find((item) => item.id === chapterId);
      if (!volume || !chapter) return;

      const now = new Date();
      const deleted: RecycledChapter = {
        ...chapter,
        volumeId,
        volumeName: volume.name,
        deletedAt: formatDate(now),
        expireAt: formatDate(addDays(now, 30)),
        content: readChapterContent(currentNovelId, chapterId),
      };
      const nextVolumes = ensureOneSelected(
        volumes.map((item) =>
          item.id === volumeId
            ? { ...item, chapters: item.chapters.filter((candidate) => candidate.id !== chapterId) }
            : item,
        ),
      );
      const nextRecycledMap = {
        ...recycledMap,
        [currentNovelId]: [deleted, ...(recycledMap[currentNovelId] ?? [])],
      };
      const nextVolumesMap = { ...volumesMap, [currentNovelId]: nextVolumes };

      writeJson(RECYCLED_CHAPTERS_KEY, nextRecycledMap);
      try {
        writeJson(VOLUMES_KEY, nextVolumesMap);
      } catch (error) {
        try {
          writeJson(RECYCLED_CHAPTERS_KEY, recycledMap);
        } catch {
          // Preserve the original failure; duplicate recycle data is safer than lost chapter content.
        }
        throw error;
      }
      localStorage.removeItem(getChapterContentKey(currentNovelId, chapterId));
      setRecycledMap(nextRecycledMap);
      setVolumesMap(nextVolumesMap);
    },
    [currentNovelId, recycledMap, setRecycledMap, setVolumesMap, volumes, volumesMap],
  );

  const restoreChapter = useCallback(
    (chapterId: number) => {
      if (!currentNovelId) return;
      const target = recycledChapters.find((chapter) => chapter.id === chapterId);
      if (!target) return;

      persistRecycled((prev) => prev.filter((chapter) => chapter.id !== chapterId));
      persistVolumes((prev) => {
        const hasOriginalVolume = prev.some((volume) => volume.id === target.volumeId);
        const fallbackVolumeId = prev[0]?.id;
        const targetVolumeId = hasOriginalVolume ? target.volumeId : fallbackVolumeId;
        if (!targetVolumeId) return prev;

        const restored: Chapter = {
          id: target.id,
          title: target.title,
          serialNumber: target.serialNumber,
          wordCount: target.wordCount,
          isSelected: true,
          isPublished: target.isPublished,
        };
        writeChapterContent(currentNovelId, target.id, target.content);

        return prev.map((volume) => ({
          ...volume,
          chapters:
            volume.id === targetVolumeId
              ? [...volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })), restored].sort(
                  (a, b) => a.serialNumber - b.serialNumber,
                )
              : volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })),
        }));
      });
    },
    [currentNovelId, persistRecycled, persistVolumes, recycledChapters],
  );

  const permanentDeleteChapter = useCallback(
    (chapterId: number) => {
      persistRecycled((prev) => prev.filter((chapter) => chapter.id !== chapterId));
    },
    [persistRecycled],
  );

  const updateChapterContents = useCallback(
    (updates: Record<number, string>) => {
      if (!currentNovelId) return;
      const ids = new Set(Object.keys(updates).map(Number));
      if (ids.size === 0) return;

      Object.entries(updates).forEach(([chapterId, content]) => {
        writeChapterContent(currentNovelId, Number(chapterId), content);
      });

      const nextVolumes = volumes.map((volume) => ({
        ...volume,
        chapters: volume.chapters.map((chapter) => {
          if (!ids.has(chapter.id)) return chapter;
          const wordCount = countWords(updates[chapter.id]);
          recordWritingWords(wordCount - chapter.wordCount);
          return { ...chapter, wordCount };
        }),
      }));
      const nextMap = { ...volumesMap, [currentNovelId]: nextVolumes };
      setVolumesMap(nextMap);
      writeJson(VOLUMES_KEY, nextMap);
      updateNovelWordCount(nextVolumes);
      if (selectedChapter && ids.has(selectedChapter.chapter.id)) {
        setEditorContent(updates[selectedChapter.chapter.id]);
      }
      setLastSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    },
    [
      currentNovelId,
      selectedChapter,
      setEditorContent,
      setLastSavedAt,
      setVolumesMap,
      updateNovelWordCount,
      volumes,
      volumesMap,
    ],
  );

  const updateNovelChapterContent = useCallback(
    (novelId: number, chapterId: number, content: string) => {
      writeChapterContent(novelId, chapterId, content);
      const wordCount = countWords(content);
      const targetVolumes = volumesMap[novelId] ?? [];
      const nextVolumes = targetVolumes.map((volume) => ({
        ...volume,
        chapters: volume.chapters.map((chapter) => {
          if (chapter.id !== chapterId) return chapter;
          recordWritingWords(wordCount - chapter.wordCount);
          return { ...chapter, wordCount };
        }),
      }));
      const nextMap = { ...volumesMap, [novelId]: nextVolumes };
      setVolumesMap(nextMap);
      scheduleWorkbenchJsonWrite(VOLUMES_KEY, nextMap);

      const nextNovels = novels.map((novel) => {
        if (novel.id !== novelId) return novel;
        return {
          ...novel,
          wordCount: nextVolumes.reduce(
            (sum, volume) => sum + volume.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.wordCount, 0),
            0,
          ),
          lastModifiedAt: formatDate(),
        };
      });
      setNovels(nextNovels);
      scheduleWorkbenchJsonWrite(NOVELS_KEY, nextNovels);
      if (currentNovelId === novelId && selectedChapter?.chapter.id === chapterId) {
        setEditorContent(content);
        setLastSavedAt(
          new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        );
      }
    },
    [
      currentNovelId,
      novels,
      selectedChapter?.chapter.id,
      setEditorContent,
      setLastSavedAt,
      setNovels,
      setVolumesMap,
      volumesMap,
    ],
  );

  return {
    selectChapter,
    toggleVolume,
    toggleSort,
    addVolume,
    deleteVolume,
    addChapter,
    renameNovel,
    renameChapter,
    updateChapterSerialNumber,
    setChapterPublished,
    deleteChapter,
    restoreChapter,
    permanentDeleteChapter,
    updateChapterContents,
    updateNovelChapterContent,
  };
}
