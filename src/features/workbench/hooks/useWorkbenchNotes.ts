import { useEffect, useMemo, useState } from 'react';
import {
  GLOBAL_NOTES_KEY,
  GLOBAL_NOTES_LIST_KEY,
  WORK_NOTES_KEY_PREFIX,
  WORK_NOTES_LIST_KEY_PREFIX,
  createMemoItem,
  formatMemoTime,
  readMemoItems,
  type MemoItem,
  type MemoScope,
} from '../components/workbenchPageSupport';

export function useWorkbenchNotes(currentNovelId: number | null) {
  const [globalNotes, setGlobalNotes] = useState<MemoItem[]>(() =>
    readMemoItems(GLOBAL_NOTES_LIST_KEY, GLOBAL_NOTES_KEY, 'global'),
  );
  const [workNotes, setWorkNotes] = useState<MemoItem[]>([]);
  const [workNotesNovelId, setWorkNotesNovelId] = useState<number | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<{ scope: MemoScope; id: string } | null>(null);
  const [collapsedMemoSections, setCollapsedMemoSections] = useState<Record<MemoScope, boolean>>({
    global: false,
    work: false,
  });
  useEffect(() => {
    localStorage.setItem(GLOBAL_NOTES_LIST_KEY, JSON.stringify(globalNotes));
  }, [globalNotes]);
  useEffect(() => {
    if (!currentNovelId) return;
    setWorkNotes(
      readMemoItems(
        `${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`,
        `${WORK_NOTES_KEY_PREFIX}${currentNovelId}`,
        'work',
      ),
    );
    setWorkNotesNovelId(currentNovelId);
  }, [currentNovelId]);
  useEffect(() => {
    if (currentNovelId && workNotesNovelId === currentNovelId)
      localStorage.setItem(`${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`, JSON.stringify(workNotes));
  }, [currentNovelId, workNotes, workNotesNovelId]);
  useEffect(() => {
    const exists =
      selectedMemo?.scope === 'global'
        ? globalNotes.some((n) => n.id === selectedMemo.id)
        : workNotes.some((n) => n.id === selectedMemo?.id);
    if (exists) return;
    setSelectedMemo(
      globalNotes[0]
        ? { scope: 'global', id: globalNotes[0].id }
        : workNotes[0]
          ? { scope: 'work', id: workNotes[0].id }
          : null,
    );
  }, [globalNotes, selectedMemo, workNotes]);
  const activeMemo = useMemo(
    () =>
      selectedMemo?.scope === 'global'
        ? (globalNotes.find((n) => n.id === selectedMemo.id) ?? null)
        : (workNotes.find((n) => n.id === selectedMemo?.id) ?? null),
    [globalNotes, selectedMemo, workNotes],
  );
  const selectMemo = (scope: MemoScope, id: string) => setSelectedMemo({ scope, id });
  const addMemo = (scope: MemoScope) => {
    const list = scope === 'global' ? globalNotes : workNotes,
      next = createMemoItem(scope, list.length + 1);
    if (scope === 'global') setGlobalNotes((v) => [next, ...v]);
    else setWorkNotes((v) => [next, ...v]);
    setSelectedMemo({ scope, id: next.id });
    setCollapsedMemoSections((v) => ({ ...v, [scope]: false }));
  };
  const updateMemo = (updates: Partial<Pick<MemoItem, 'title' | 'content'>>) => {
    if (!selectedMemo) return;
    const patch = { ...updates, updatedAt: formatMemoTime() },
      update = (items: MemoItem[]) => items.map((item) => (item.id === selectedMemo.id ? { ...item, ...patch } : item));
    if (selectedMemo.scope === 'global') setGlobalNotes(update);
    else setWorkNotes(update);
  };
  const toggleMemoSection = (scope: MemoScope) => setCollapsedMemoSections((v) => ({ ...v, [scope]: !v[scope] }));
  return {
    globalNotes,
    workNotes,
    selectedMemo,
    collapsedMemoSections,
    activeMemo,
    selectMemo,
    addMemo,
    updateMemo,
    toggleMemoSection,
  };
}
