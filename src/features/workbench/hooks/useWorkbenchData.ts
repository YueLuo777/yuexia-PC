import { useCallback, useEffect, useMemo, useState } from 'react';

import { applyFormat, getStoredFormatSettings, saveSnapshot } from '@/features/workbench/components/EditorToolModals';
import type { Chapter, RecycledChapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { countWords, ensureOneSelected, getSelectedChapter } from '@/features/workbench/model/workbenchRules';
import { emitWorkspaceNovelSelected, WORKSPACE_NOVEL_SELECTED_EVENT, type WorkspaceNovelSelectedDetail } from '@/shared/events/workspaceEvents';
import { recordWritingWords } from '@/shared/stats/writingStats';

const NOVELS_KEY = 'xinyuexia_novels_v1';
const CURRENT_ID_KEY = 'xinyuexia_current_novel_id';
const VOLUMES_KEY = 'xinyuexia_volumes_v1';
const RECYCLED_CHAPTERS_KEY = 'xinyuexia_recycled_chapters_v1';
const SORT_KEY = 'xinyuexia_workbench_sort_asc';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getChapterContentKey(novelId: number, chapterId: number) {
  return `xinyuexia_novel_${novelId}_chapter_${chapterId}`;
}

export function readChapterContent(novelId: number, chapterId: number) {
  return localStorage.getItem(getChapterContentKey(novelId, chapterId)) ?? '';
}

function writeChapterContent(novelId: number, chapterId: number, content: string) {
  localStorage.setItem(getChapterContentKey(novelId, chapterId), content);
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('zh-CN');
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toChineseNumber(value: number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value <= 10) return value === 10 ? '十' : digits[value];
  if (value < 20) return `十${digits[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones === 0 ? `${digits[tens]}十` : `${digits[tens]}十${digits[ones]}`;
}

function normalizeVolumeNames(volumesMap: Record<number, Volume[]>) {
  let changed = false;
  const next = Object.fromEntries(
    Object.entries(volumesMap).map(([novelId, volumes]) => [
      novelId,
      volumes.map((volume, index) => {
        if (volume.name === '集纲') return volume;
        if (/^第.+卷$/.test(volume.name)) return volume;
        if (/^第\d+卷$/.test(volume.name)) {
          const number = Number(volume.name.replace(/\D/g, ''));
          changed = true;
          return { ...volume, name: `第${toChineseNumber(number)}卷` };
        }
        if (index === 0 && volume.chapters.some((chapter) => chapter.title.startsWith('集纲'))) {
          changed = true;
          return { ...volume, name: '集纲' };
        }
        return volume;
      }),
    ]),
  ) as Record<number, Volume[]>;

  if (changed) writeJson(VOLUMES_KEY, next);
  return next;
}

function createDefaultVolumes(type: WorkbenchNovel['type'] = 'novel'): Volume[] {
  const chapterId = uid();
  if (type === 'script') {
    return [
      {
        id: uid(),
        name: '集纲',
        isExpanded: true,
        chapters: [
          {
            id: chapterId,
            title: '集纲1',
            serialNumber: 1,
            wordCount: 0,
            isSelected: true,
            isPublished: false,
          },
        ],
      },
      { id: uid(), name: '第一卷', isExpanded: true, chapters: [] },
      { id: uid(), name: '第二卷', isExpanded: true, chapters: [] },
      { id: uid(), name: '第三卷', isExpanded: true, chapters: [] },
    ];
  }

  return [
    {
      id: uid(),
      name: '第一卷',
      isExpanded: true,
      chapters: [
        {
          id: chapterId,
          title: '',
          serialNumber: 1,
          wordCount: 0,
          isSelected: true,
          isPublished: false,
        },
      ],
    },
  ];
}

export function useWorkbenchData() {
  const [novels, setNovels] = useState<WorkbenchNovel[]>(() => readJson<WorkbenchNovel[]>(NOVELS_KEY, []));
  const [currentNovelId, setCurrentNovelIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem(CURRENT_ID_KEY);
    return raw ? Number(raw) : null;
  });
  const [volumesMap, setVolumesMap] = useState<Record<number, Volume[]>>(() => normalizeVolumeNames(readJson(VOLUMES_KEY, {})));
  const [recycledMap, setRecycledMap] = useState<Record<number, RecycledChapter[]>>(() => readJson(RECYCLED_CHAPTERS_KEY, {}));
  const [sortAsc, setSortAsc] = useState(() => localStorage.getItem(SORT_KEY) !== 'false');
  const [editorContent, setEditorContent] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const currentNovel = useMemo(() => {
    if (!currentNovelId) return null;
    return novels.find((novel) => novel.id === currentNovelId) ?? null;
  }, [currentNovelId, novels]);

  const volumes = useMemo(() => {
    if (!currentNovelId) return [];
    return volumesMap[currentNovelId] ?? [];
  }, [currentNovelId, volumesMap]);

  const recycledChapters = useMemo(() => {
    if (!currentNovelId) return [];
    return recycledMap[currentNovelId] ?? [];
  }, [currentNovelId, recycledMap]);

  const selectedChapter = useMemo(() => getSelectedChapter(volumes), [volumes]);

  const setCurrentNovel = useCallback((novelId: number | null) => {
    setCurrentNovelIdState(novelId);
    if (novelId === null) {
      localStorage.removeItem(CURRENT_ID_KEY);
      emitWorkspaceNovelSelected(null);
      return;
    }
    localStorage.setItem(CURRENT_ID_KEY, String(novelId));
    emitWorkspaceNovelSelected(novelId);
  }, []);

  useEffect(() => {
    setNovels(readJson<WorkbenchNovel[]>(NOVELS_KEY, []));
    const raw = localStorage.getItem(CURRENT_ID_KEY);
    setCurrentNovelIdState(raw ? Number(raw) : null);
  }, []);

  useEffect(() => {
    const handleSelected = (event: Event) => {
      const detail = (event as CustomEvent<WorkspaceNovelSelectedDetail>).detail;
      setNovels(readJson<WorkbenchNovel[]>(NOVELS_KEY, []));
      setVolumesMap(normalizeVolumeNames(readJson(VOLUMES_KEY, {})));
      setCurrentNovelIdState(detail?.novelId ?? null);
    };

    window.addEventListener(WORKSPACE_NOVEL_SELECTED_EVENT, handleSelected);
    return () => window.removeEventListener(WORKSPACE_NOVEL_SELECTED_EVENT, handleSelected);
  }, []);

  useEffect(() => {
    if (!currentNovelId) return;
    if (volumesMap[currentNovelId]?.length) return;
    setVolumesMap((prev) => {
      const next = { ...prev, [currentNovelId]: createDefaultVolumes(currentNovel?.type ?? 'novel') };
      writeJson(VOLUMES_KEY, next);
      return next;
    });
  }, [currentNovel?.type, currentNovelId, volumesMap]);

  useEffect(() => {
    if (!currentNovelId || !selectedChapter) {
      setEditorContent('');
      return;
    }
    setEditorContent(readChapterContent(currentNovelId, selectedChapter.chapter.id));
  }, [currentNovelId, selectedChapter?.chapter.id]);

  const persistVolumes = useCallback((updater: (prev: Volume[]) => Volume[]) => {
    if (!currentNovelId) return;
    setVolumesMap((prevMap) => {
      const current = prevMap[currentNovelId] ?? createDefaultVolumes(currentNovel?.type ?? 'novel');
      const nextVolumes = ensureOneSelected(updater(current));
      const nextMap = { ...prevMap, [currentNovelId]: nextVolumes };
      writeJson(VOLUMES_KEY, nextMap);
      return nextMap;
    });
  }, [currentNovel?.type, currentNovelId]);

  const persistRecycled = useCallback((updater: (prev: RecycledChapter[]) => RecycledChapter[]) => {
    if (!currentNovelId) return;
    setRecycledMap((prevMap) => {
      const next = { ...prevMap, [currentNovelId]: updater(prevMap[currentNovelId] ?? []) };
      writeJson(RECYCLED_CHAPTERS_KEY, next);
      return next;
    });
  }, [currentNovelId]);

  const updateNovelWordCount = useCallback((nextVolumes: Volume[]) => {
    if (!currentNovelId) return;
    const wordCount = nextVolumes.reduce(
      (sum, volume) => sum + volume.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.wordCount, 0),
      0,
    );
    const nextNovels = novels.map((novel) => (novel.id === currentNovelId ? { ...novel, wordCount, lastModifiedAt: formatDate() } : novel));
    setNovels(nextNovels);
    writeJson(NOVELS_KEY, nextNovels);
  }, [currentNovelId, novels]);

  const renameNovel = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!currentNovelId || !trimmed) return;
    const nextNovels = novels.map((novel) => (
      novel.id === currentNovelId
        ? { ...novel, title: trimmed, lastModifiedAt: formatDate() }
        : novel
    ));
    setNovels(nextNovels);
    writeJson(NOVELS_KEY, nextNovels);
  }, [currentNovelId, novels]);

  const formatChapterOnSelect = useCallback((chapterId: number) => {
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
  }, [currentNovelId]);

  const selectChapter = useCallback((volumeId: number, chapterId: number) => {
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
      setLastSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [formatChapterOnSelect, persistVolumes, selectedChapter?.chapter.id]);

  const toggleVolume = useCallback((volumeId: number) => {
    persistVolumes((prev) => prev.map((volume) => (volume.id === volumeId ? { ...volume, isExpanded: !volume.isExpanded } : volume)));
  }, [persistVolumes]);

  const toggleSort = useCallback(() => {
    setSortAsc((prev) => {
      const next = !prev;
      localStorage.setItem(SORT_KEY, String(next));
      return next;
    });
  }, []);

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

  const deleteVolume = useCallback((volumeId: number) => {
    persistVolumes((prev) => prev.filter((volume) => volume.id !== volumeId));
  }, [persistVolumes]);

  const addChapter = useCallback((volumeId: number) => {
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
          prev.filter((volume) => volume.name !== '集纲').flatMap((volume) => volume.chapters.map((chapter) => chapter.serialNumber)),
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
        chapters: volume.id === volumeId
          ? [...volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })), newChapter]
          : volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })),
      }));
    });
  }, [persistVolumes]);

  const renameChapter = useCallback((chapterId: number, title: string) => {
    persistVolumes((prev) =>
      prev.map((volume) => ({
        ...volume,
        chapters: volume.chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, title } : chapter)),
      })),
    );
  }, [persistVolumes]);

  const updateChapterSerialNumber = useCallback((chapterId: number, serialNumber: number) => {
    persistVolumes((prev) =>
      prev.map((volume) => ({
        ...volume,
        chapters: volume.chapters.map((chapter) => (
          chapter.id === chapterId ? { ...chapter, serialNumber: Math.max(1, serialNumber) } : chapter
        )),
      })),
    );
  }, [persistVolumes]);

  const setChapterPublished = useCallback((chapterId: number, isPublished: boolean) => {
    persistVolumes((prev) =>
      prev.map((volume) => ({
        ...volume,
        chapters: volume.chapters.map((chapter) => (
          chapter.id === chapterId ? { ...chapter, isPublished } : chapter
        )),
      })),
    );
  }, [persistVolumes]);

  const deleteChapter = useCallback((volumeId: number, chapterId: number) => {
    if (!currentNovelId) return;
    let deleted: RecycledChapter | null = null;
    persistVolumes((prev) => {
      const volume = prev.find((item) => item.id === volumeId);
      const chapter = volume?.chapters.find((item) => item.id === chapterId);
      if (!volume || !chapter) return prev;

      const now = new Date();
      deleted = {
        ...chapter,
        volumeId,
        volumeName: volume.name,
        deletedAt: formatDate(now),
        expireAt: formatDate(addDays(now, 30)),
        content: readChapterContent(currentNovelId, chapterId),
      };

      return prev.map((item) => (item.id === volumeId ? { ...item, chapters: item.chapters.filter((candidate) => candidate.id !== chapterId) } : item));
    });

    if (deleted) {
      persistRecycled((prev) => [deleted as RecycledChapter, ...prev]);
      localStorage.removeItem(getChapterContentKey(currentNovelId, chapterId));
    }
  }, [currentNovelId, persistRecycled, persistVolumes]);

  const restoreChapter = useCallback((chapterId: number) => {
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
        chapters: volume.id === targetVolumeId
          ? [...volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })), restored].sort((a, b) => a.serialNumber - b.serialNumber)
          : volume.chapters.map((chapter) => ({ ...chapter, isSelected: false })),
      }));
    });
  }, [currentNovelId, persistRecycled, persistVolumes, recycledChapters]);

  const permanentDeleteChapter = useCallback((chapterId: number) => {
    persistRecycled((prev) => prev.filter((chapter) => chapter.id !== chapterId));
  }, [persistRecycled]);

  const saveContent = useCallback((content: string) => {
    setEditorContent(content);
    if (!currentNovelId || !selectedChapter) return;
    writeChapterContent(currentNovelId, selectedChapter.chapter.id, content);
    const wordCount = countWords(content);
    recordWritingWords(wordCount - selectedChapter.chapter.wordCount);
    const nextVolumes = volumes.map((volume) => ({
      ...volume,
      chapters: volume.chapters.map((chapter) => (chapter.id === selectedChapter.chapter.id ? { ...chapter, wordCount } : chapter)),
    }));
    const nextMap = { ...volumesMap, [currentNovelId]: nextVolumes };
    setVolumesMap(nextMap);
    writeJson(VOLUMES_KEY, nextMap);
    updateNovelWordCount(nextVolumes);
    setLastSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [currentNovelId, selectedChapter, updateNovelWordCount, volumes, volumesMap]);

  const updateChapterContents = useCallback((updates: Record<number, string>) => {
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
  }, [currentNovelId, selectedChapter, updateNovelWordCount, volumes, volumesMap]);

  const updateNovelChapterContent = useCallback((novelId: number, chapterId: number, content: string) => {
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
    writeJson(VOLUMES_KEY, nextMap);

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
    writeJson(NOVELS_KEY, nextNovels);
    if (currentNovelId === novelId && selectedChapter?.chapter.id === chapterId) {
      setEditorContent(content);
      setLastSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [currentNovelId, novels, selectedChapter?.chapter.id, volumesMap]);

  return {
    novels,
    currentNovel,
    currentNovelId,
    volumesMap,
    volumes,
    recycledChapters,
    selectedChapter,
    editorContent,
    sortAsc,
    lastSavedAt,
    setCurrentNovel,
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
    saveContent,
    updateChapterContents,
    updateNovelChapterContent,
    getChapterWordCount: (chapterId: number) => {
      const chapter = volumes.flatMap((volume) => volume.chapters).find((item) => item.id === chapterId);
      return chapter?.wordCount ?? 0;
    },
  };
}
