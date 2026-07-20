import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkbenchChapterActions } from './useWorkbenchChapterActions';

import { applyFormat, getStoredFormatSettings, saveSnapshot } from '@/features/workbench/components/EditorToolModals';
import type { Chapter, RecycledChapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { countWords, ensureOneSelected, getSelectedChapter } from '@/features/workbench/model/workbenchRules';
import {
  cancelScheduledWorkbenchJsonWrite,
  scheduleWorkbenchJsonWrite,
} from '@/features/workbench/model/workbenchPersistenceQueue';
import {
  emitWorkspaceNovelSelected,
  WORKSPACE_NOVEL_SELECTED_EVENT,
  type WorkspaceNovelSelectedDetail,
} from '@/shared/events/workspaceEvents';
import { recordWritingWords } from '@/shared/stats/writingStats';
import { readJsonValue, writeJsonValue } from '@/shared/storage/jsonStorage';

export {
  getChapterContentKey,
  readChapterContent,
  toChineseNumber,
  normalizeWorkbenchNovels,
  normalizeWorkbenchVolumeMap,
  normalizeWorkbenchRecycledMap,
} from '../model/workbenchDataSupport';
import {
  NOVELS_KEY,
  CURRENT_ID_KEY,
  VOLUMES_KEY,
  RECYCLED_CHAPTERS_KEY,
  SORT_KEY,
  readJson,
  writeJson,
  uid,
  getChapterContentKey,
  readChapterContent,
  writeChapterContent,
  formatDate,
  addDays,
  toChineseNumber,
  normalizeNumber,
  normalizeString,
  normalizeWorkbenchNovels,
  normalizeChapter,
  normalizeVolume,
  normalizeWorkbenchVolumeMap,
  normalizeRecycledChapter,
  normalizeWorkbenchRecycledMap,
  normalizeVolumeNames,
  createDefaultVolumes,
} from '../model/workbenchDataSupport';

export function useWorkbenchData() {
  const [novels, setNovels] = useState<WorkbenchNovel[]>(() =>
    readJson<WorkbenchNovel[]>(NOVELS_KEY, [], normalizeWorkbenchNovels),
  );
  const [currentNovelId, setCurrentNovelIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem(CURRENT_ID_KEY);
    return raw ? Number(raw) : null;
  });
  const [volumesMap, setVolumesMap] = useState<Record<number, Volume[]>>(() =>
    normalizeVolumeNames(readJson(VOLUMES_KEY, {}, normalizeWorkbenchVolumeMap)),
  );
  const [recycledMap, setRecycledMap] = useState<Record<number, RecycledChapter[]>>(() =>
    readJson(RECYCLED_CHAPTERS_KEY, {}, normalizeWorkbenchRecycledMap),
  );
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
  const selectedChapterId = selectedChapter?.chapter.id ?? null;

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
    setNovels(readJson<WorkbenchNovel[]>(NOVELS_KEY, [], normalizeWorkbenchNovels));
    const raw = localStorage.getItem(CURRENT_ID_KEY);
    setCurrentNovelIdState(raw ? Number(raw) : null);
  }, []);

  useEffect(() => {
    const handleSelected = (event: Event) => {
      const detail = (event as CustomEvent<WorkspaceNovelSelectedDetail>).detail;
      setNovels(readJson<WorkbenchNovel[]>(NOVELS_KEY, [], normalizeWorkbenchNovels));
      setVolumesMap(normalizeVolumeNames(readJson(VOLUMES_KEY, {}, normalizeWorkbenchVolumeMap)));
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
    if (!currentNovelId || selectedChapterId === null) {
      setEditorContent('');
      return;
    }
    setEditorContent(readChapterContent(currentNovelId, selectedChapterId));
  }, [currentNovelId, selectedChapterId]);

  const actions = useWorkbenchChapterActions({
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
  });

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
    selectChapter: actions.selectChapter,
    toggleVolume: actions.toggleVolume,
    toggleSort: actions.toggleSort,
    addVolume: actions.addVolume,
    deleteVolume: actions.deleteVolume,
    addChapter: actions.addChapter,
    renameNovel: actions.renameNovel,
    renameChapter: actions.renameChapter,
    updateChapterSerialNumber: actions.updateChapterSerialNumber,
    setChapterPublished: actions.setChapterPublished,
    deleteChapter: actions.deleteChapter,
    restoreChapter: actions.restoreChapter,
    permanentDeleteChapter: actions.permanentDeleteChapter,
    saveContent: actions.saveContent,
    updateChapterContents: actions.updateChapterContents,
    updateNovelChapterContent: actions.updateNovelChapterContent,
    getChapterWordCount: (chapterId: number) => {
      const chapter = volumes.flatMap((volume) => volume.chapters).find((item) => item.id === chapterId);
      return chapter?.wordCount ?? 0;
    },
  };
}
