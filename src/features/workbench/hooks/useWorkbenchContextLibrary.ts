import type { Dispatch, SetStateAction } from 'react';

import type { WorkbenchLinkedContextItem } from '@/features/workbench/components/workbenchAiPanelSupport';
import type { ContextChapterPair, ContextLibraryTab } from '@/features/workbench/components/workbenchPageSupport';
import {
  clearWorkbenchLinkedContextItems,
  writeWorkbenchLinkedContextItems,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  getContextItemsWordCount,
  getContextWordCount,
  getPreferredChapterNarrativeItem,
  hasContextContent,
  keepExclusiveChapterNarrativeItems,
  mergeContextItems,
} from '@/features/workbench/model/workbenchContextModel';

type WorkbenchContextLibraryInput = {
  contextChapterRows: ContextChapterPair[];
  contextSelectionTouched: boolean;
  currentNovelId: number | null;
  draftContextIds: Set<string>;
  linkedContextItems: WorkbenchLinkedContextItem[];
  outlineContextItems: WorkbenchLinkedContextItem[];
  roleContextItems: WorkbenchLinkedContextItem[];
  selectedChapterSerialNumber: number;
  setContextLibraryTab: Dispatch<SetStateAction<ContextLibraryTab>>;
  setContextSelectionTouched: Dispatch<SetStateAction<boolean>>;
  setDraftContextIds: Dispatch<SetStateAction<Set<string>>>;
  setIsContextLibraryOpen: Dispatch<SetStateAction<boolean>>;
  setLinkedContextItems: Dispatch<SetStateAction<WorkbenchLinkedContextItem[]>>;
  settingContextItems: WorkbenchLinkedContextItem[];
  statusContextItems: WorkbenchLinkedContextItem[];
  summaryContextItems: WorkbenchLinkedContextItem[];
};

export function buildWorkbenchContextLibrary({
  contextChapterRows,
  contextSelectionTouched,
  currentNovelId,
  draftContextIds,
  linkedContextItems,
  outlineContextItems,
  roleContextItems,
  selectedChapterSerialNumber,
  setContextLibraryTab,
  setContextSelectionTouched,
  setDraftContextIds,
  setIsContextLibraryOpen,
  setLinkedContextItems,
  settingContextItems,
  statusContextItems,
  summaryContextItems,
}: WorkbenchContextLibraryInput) {
  const chapterRowContextItems = contextChapterRows.flatMap((row) =>
    [row.chapterItem, row.outlineItem, row.summaryItem].filter((item): item is WorkbenchLinkedContextItem =>
      Boolean(item),
    ),
  );
  const allContextItems = [
    ...chapterRowContextItems,
    ...outlineContextItems,
    ...summaryContextItems,
    ...settingContextItems,
    ...roleContextItems,
    ...statusContextItems,
  ];
  const contextItemById = new Map(allContextItems.map((item) => [item.id, item]));
  const requiredContextItems = contextChapterRows
    .filter((row) => row.isCurrent)
    .map((row) => row.outlineItem)
    .filter(hasContextContent);
  const requiredContextIds = new Set(requiredContextItems.map((item) => item.id));
  const previousContextRow =
    contextChapterRows.find((row) => !row.isCurrent && row.serialNumber < selectedChapterSerialNumber) ?? null;
  const defaultOptionalContextItems = [
    previousContextRow ? getPreferredChapterNarrativeItem(previousContextRow) : null,
  ].filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
  const rawOptionalLinkedContextItems = contextSelectionTouched
    ? linkedContextItems.filter((item) => !requiredContextIds.has(item.id))
    : defaultOptionalContextItems;
  const optionalLinkedContextItems = keepExclusiveChapterNarrativeItems(
    contextChapterRows,
    rawOptionalLinkedContextItems,
  );
  const shouldAttachRequiredContext = !contextSelectionTouched || linkedContextItems.length > 0;
  const effectiveRequiredContextItems = shouldAttachRequiredContext ? requiredContextItems : [];
  const effectiveLinkedContextItems = mergeContextItems([
    ...effectiveRequiredContextItems,
    ...optionalLinkedContextItems,
  ]);
  const selectedDraftContextItems = Array.from(draftContextIds)
    .map((id) => contextItemById.get(id))
    .filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
  const draftContextWordCount = selectedDraftContextItems.reduce(
    (sum, item) => sum + getContextWordCount(item.content),
    0,
  );
  const draftChapterWordCount = getContextItemsWordCount(selectedDraftContextItems, 'chapter');
  const draftOutlineWordCount = getContextItemsWordCount(selectedDraftContextItems, 'outline');
  const draftSummaryWordCount = getContextItemsWordCount(selectedDraftContextItems, 'summary');
  const canConfirmContextLibrary =
    draftContextWordCount > 0 && selectedDraftContextItems.every(hasContextContent);
  const contextLibraryConfirmTitle = canConfirmContextLibrary
    ? '确认关联资料'
    : '请选择至少一项有内容的资料';
  const updateLinkedContextItems = (items: WorkbenchLinkedContextItem[]) => {
    setLinkedContextItems(items);
    if (!currentNovelId) return;
    if (items.length > 0) {
      writeWorkbenchLinkedContextItems(currentNovelId, items);
    } else {
      clearWorkbenchLinkedContextItems(currentNovelId);
    }
  };
  const openContextLibrary = () => {
    setDraftContextIds(new Set(effectiveLinkedContextItems.map((item) => item.id)));
    setContextLibraryTab('outlineChapter');
    setIsContextLibraryOpen(true);
  };
  const toggleDraftContext = (id: string) => {
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const pickDraftContextItem = (item: WorkbenchLinkedContextItem, siblingId?: string | null) => {
    if (requiredContextIds.has(item.id)) return;
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (siblingId) next.delete(siblingId);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };
  const toggleChapterContextRow = (row: ContextChapterPair) => {
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (row.isCurrent) {
        if (hasContextContent(row.outlineItem)) next.add(row.outlineItem.id);
        return next;
      }
      const rowIds = [row.chapterItem.id, row.summaryItem?.id].filter((id): id is string =>
        Boolean(id && !requiredContextIds.has(id)),
      );
      const selected = rowIds.length > 0 && rowIds.some((id) => next.has(id));
      rowIds.forEach((id) => {
        if (selected) next.delete(id);
      });
      if (!selected) {
        const preferred = getPreferredChapterNarrativeItem(row);
        if (preferred) next.add(preferred.id);
      }
      return next;
    });
  };
  const pickChapterContextItem = (row: ContextChapterPair, item: WorkbenchLinkedContextItem) => {
    if (!hasContextContent(item)) return;
    if (row.isCurrent && item.id !== row.outlineItem.id) return;
    if (item.id === row.outlineItem.id) return;
    if (item.id === row.chapterItem.id || item.id === row.summaryItem?.id) {
      setDraftContextIds((current) => {
        const next = new Set(current);
        next.delete(row.chapterItem.id);
        if (row.summaryItem) next.delete(row.summaryItem.id);
        next.add(item.id);
        return next;
      });
      return;
    }
    pickDraftContextItem(item);
  };
  const selectRecentChapterContexts = (count: number) => {
    const rows = contextChapterRows.filter((row) => !row.isCurrent).slice(0, count);
    setDraftContextIds((current) => {
      const next = new Set(current);
      rows.forEach((row) => {
        next.delete(row.chapterItem.id);
        if (row.summaryItem) next.delete(row.summaryItem.id);
        const preferred = getPreferredChapterNarrativeItem(row);
        if (preferred) next.add(preferred.id);
      });
      return next;
    });
  };
  const confirmContextLibrary = () => {
    if (!canConfirmContextLibrary) return;
    const selectedItems = Array.from(draftContextIds)
      .map((id) => contextItemById.get(id))
      .filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
    const optionalSelectedItems = keepExclusiveChapterNarrativeItems(
      contextChapterRows,
      selectedItems.filter((item) => !requiredContextIds.has(item.id)),
    );
    const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);
    setContextSelectionTouched(true);
    updateLinkedContextItems(confirmedSelectedItems);
    setDraftContextIds(new Set(confirmedSelectedItems.map((item) => item.id)));
    setIsContextLibraryOpen(false);
  };
  return {
    allContextItems,
    canConfirmContextLibrary,
    chapterRowContextItems,
    confirmContextLibrary,
    contextItemById,
    contextLibraryConfirmTitle,
    defaultOptionalContextItems,
    draftChapterWordCount,
    draftContextWordCount,
    draftOutlineWordCount,
    draftSummaryWordCount,
    effectiveLinkedContextItems,
    effectiveRequiredContextItems,
    openContextLibrary,
    optionalLinkedContextItems,
    pickChapterContextItem,
    pickDraftContextItem,
    previousContextRow,
    rawOptionalLinkedContextItems,
    requiredContextIds,
    requiredContextItems,
    selectRecentChapterContexts,
    selectedDraftContextItems,
    shouldAttachRequiredContext,
    toggleChapterContextRow,
    toggleDraftContext,
    updateLinkedContextItems,
  };
}
