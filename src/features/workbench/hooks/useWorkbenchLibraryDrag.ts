import { useRef, useState, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import {
  LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS,
  LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE,
  hasLibraryEntryPointerRetargetedTooSoon,
  isLibraryPointerPastGroupEntries,
  rememberLibraryEntryPointerPreviewTarget,
  type LibraryEntryDragState,
  type LibraryEntryDropPreviewState,
  type LibraryEntryPointerDragState,
} from '../components/workbenchLibraryDrag';

interface UseWorkbenchLibraryDragOptions {
  entries: WorkbenchLibraryEntry[];
  moveLibraryEntryToType: (entryId: string, tab: string, type: string) => void;
  moveLibraryEntryBefore: (entryId: string, targetEntryId: string, targetTab: string, targetType: string) => void;
  getLibraryEntryTargetIdAtPreviewIndex: (targetTab: string, targetType: string, previewIndex: number) => string | null;
}

export function useWorkbenchLibraryDrag({
  entries,
  moveLibraryEntryToType,
  moveLibraryEntryBefore,
  getLibraryEntryTargetIdAtPreviewIndex,
}: UseWorkbenchLibraryDragOptions) {
  const [draggingLibraryEntry, setDraggingLibraryEntry] = useState<LibraryEntryDragState>(null);
  const [libraryDropTarget, setLibraryDropTarget] = useState<{ tab: string; type: string } | null>(null);
  const [libraryEntryDropPreview, setLibraryEntryDropPreview] = useState<LibraryEntryDropPreviewState>(null);
  const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);
  const libraryDropHandledRef = useRef(false);
  const libraryEntryPointerDragRef = useRef<LibraryEntryPointerDragState>(null);
  const libraryPointerSuppressClickRef = useRef(false);

  const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState) => {
    libraryEntryDropPreviewRef.current = next;
    setLibraryEntryDropPreview(next);
  };
  const commitLibraryEntryDropPreview = (preview: LibraryEntryDropPreviewState) => {
    if (!preview) return;
    if (preview.mode === 'group-end') {
      moveLibraryEntryToType(preview.entryId, preview.tab, preview.type);
      return;
    }
    if (!preview.targetEntryId) return;
    const targetEntry = entries.find((entry) => entry.id === preview.targetEntryId);
    if (!targetEntry) return;
    moveLibraryEntryBefore(preview.entryId, preview.targetEntryId, targetEntry.tab, preview.type);
  };

  const handleLibraryEntryDragStart = (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    libraryDropHandledRef.current = false;
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry({ entryId: entry.id, tab: entry.tab, type });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', entry.id);
  };

  const finishLibraryEntryPointerDragById = (pointerId: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag || pointerDrag.pointerId !== pointerId) return;
    libraryEntryPointerDragRef.current = null;
    pointerDrag.cleanup();
    try {
      pointerDrag.element.releasePointerCapture(pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
    if (!pointerDrag.active) return;
    commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    window.setTimeout(() => {
      libraryPointerSuppressClickRef.current = false;
    }, 0);
  };

  const updateLibraryEntryPointerPreviewAt = (clientX: number, clientY: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag) return;
    const distance = Math.hypot(clientX - pointerDrag.startX, clientY - pointerDrag.startY);
    if (!pointerDrag.active && !pointerDrag.armed) return;
    if (!pointerDrag.active && distance < LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE) return;
    if (!pointerDrag.active) {
      pointerDrag.active = true;
      libraryPointerSuppressClickRef.current = true;
      libraryDropHandledRef.current = false;
      setDraggingLibraryEntry({ entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: pointerDrag.type });
    }

    const hoverElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const hoverEntry = hoverElement?.closest('[data-library-entry-id]') as HTMLElement | null;
    if (hoverEntry?.dataset.libraryEntryId && hoverEntry.dataset.libraryEntryTab === pointerDrag.tab) {
      const targetType = hoverEntry.dataset.libraryEntryType || pointerDrag.type;
      const previewIndex = Number(hoverEntry.dataset.libraryEntryPreviewIndex);
      const targetEntryId =
        getLibraryEntryTargetIdAtPreviewIndex(pointerDrag.tab, targetType, previewIndex) ??
        hoverEntry.dataset.libraryEntryId;
      const targetKey = `entry:${targetEntryId}`;
      if (
        targetEntryId === pointerDrag.entryId &&
        (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey)
      )
        return;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId &&
          current.tab === pointerDrag.tab &&
          current.type === targetType &&
          current.mode === 'target-position' &&
          current.targetEntryId === targetEntryId
          ? current
          : {
              entryId: pointerDrag.entryId,
              tab: pointerDrag.tab,
              type: targetType,
              mode: 'target-position',
              targetEntryId,
            },
      );
      return;
    }

    const hoverGroup = hoverElement?.closest('[data-library-group-type]') as HTMLElement | null;
    if (hoverGroup?.dataset.libraryGroupTab === pointerDrag.tab) {
      if (!isLibraryPointerPastGroupEntries(hoverGroup, pointerDrag, clientY)) return;
      const targetType = hoverGroup.dataset.libraryGroupType || pointerDrag.type;
      const targetKey = `group:${targetType}`;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryDropTarget((previous) =>
        previous?.tab === pointerDrag.tab && previous.type === targetType
          ? previous
          : { tab: pointerDrag.tab, type: targetType },
      );
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId &&
          current.tab === pointerDrag.tab &&
          current.type === targetType &&
          current.mode === 'group-end'
          ? current
          : { entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: targetType, mode: 'group-end' },
      );
    }
  };

  const beginLibraryEntryPointerDrag = (
    event: ReactPointerEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    const nestedButton = target.closest('button');
    if (nestedButton && nestedButton !== event.currentTarget) return;
    libraryEntryPointerDragRef.current?.cleanup();
    const dragElement = event.currentTarget;
    const pointerId = event.pointerId;
    const activationTimer = window.setTimeout(() => {
      const pointerDrag = libraryEntryPointerDragRef.current;
      if (pointerDrag?.pointerId === pointerId) pointerDrag.armed = true;
    }, LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS);
    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      updateLibraryEntryPointerPreviewAt(moveEvent.clientX, moveEvent.clientY);
      if (libraryEntryPointerDragRef.current?.active) moveEvent.preventDefault();
    };
    const handleWindowPointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      finishLibraryEntryPointerDragById(pointerId);
    };
    window.addEventListener('pointermove', handleWindowPointerMove, { capture: true });
    window.addEventListener('pointerup', handleWindowPointerEnd, { capture: true });
    window.addEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
    libraryEntryPointerDragRef.current = {
      entryId: entry.id,
      tab: entry.tab,
      type,
      pointerId,
      element: dragElement,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      armed: false,
      activationTimer,
      lastPreviewX: event.clientX,
      lastPreviewY: event.clientY,
      lastPreviewTargetKey: null,
      cleanup: () => {
        window.clearTimeout(activationTimer);
        window.removeEventListener('pointermove', handleWindowPointerMove, { capture: true });
        window.removeEventListener('pointerup', handleWindowPointerEnd, { capture: true });
        window.removeEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
      },
    };
    try {
      dragElement.setPointerCapture(pointerId);
    } catch {
      // The document listeners above provide the fallback.
    }
  };

  const updateLibraryEntryPointerPreview = (event: ReactPointerEvent<HTMLElement>) => {
    updateLibraryEntryPointerPreviewAt(event.clientX, event.clientY);
    if (libraryEntryPointerDragRef.current?.active) event.preventDefault();
  };
  const finishLibraryEntryPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    finishLibraryEntryPointerDragById(event.pointerId);
  };
  const handleLibraryCategoryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
    shouldPreviewGroupEnd = false,
  ) => {
    if (!draggingLibraryEntry || draggingLibraryEntry.tab !== tab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setLibraryDropTarget((current) => (current?.tab === tab && current.type === type ? current : { tab, type }));
    if (!shouldPreviewGroupEnd) return;
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId &&
        current.tab === tab &&
        current.type === type &&
        current.mode === 'group-end'
        ? current
        : { entryId: draggingLibraryEntry.entryId, tab, type, mode: 'group-end' },
    );
  };
  const handleLibraryCategoryDragLeave = (event: ReactDragEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };
  const handleLibraryCategoryDrop = (event: ReactDragEvent<HTMLElement>, tab: string, type: string) => {
    event.preventDefault();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== tab) return;
    moveLibraryEntryToType(entryId, tab, type);
  };
  const handleLibraryEntryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    if (!draggingLibraryEntry) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    if (draggingLibraryEntry.tab !== targetEntry.tab) return;
    const targetEntryId =
      typeof previewIndex === 'number'
        ? (getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id)
        : targetEntry.id;
    if (draggingLibraryEntry.entryId === targetEntryId && !libraryEntryDropPreviewRef.current) return;
    setLibraryDropTarget(null);
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId &&
        current.tab === targetEntry.tab &&
        current.type === targetType &&
        current.mode === 'target-position' &&
        current.targetEntryId === targetEntryId
        ? current
        : {
            entryId: draggingLibraryEntry.entryId,
            tab: targetEntry.tab,
            type: targetType,
            mode: 'target-position',
            targetEntryId,
          },
    );
  };
  const handleLibraryEntryDrop = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    const currentPreview = libraryEntryDropPreviewRef.current;
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== targetEntry.tab) return;
    if (currentPreview?.entryId === entryId) {
      commitLibraryEntryDropPreview(currentPreview);
      return;
    }
    const targetEntryId =
      typeof previewIndex === 'number'
        ? (getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id)
        : targetEntry.id;
    moveLibraryEntryBefore(entryId, targetEntryId, targetEntry.tab, targetType);
  };
  const handleLibraryEntryDragEnd = () => {
    if (!libraryDropHandledRef.current) commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    libraryDropHandledRef.current = false;
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };

  return {
    draggingLibraryEntry,
    libraryDropTarget,
    libraryEntryDropPreview,
    libraryPointerSuppressClickRef,
    handleLibraryEntryDragStart,
    beginLibraryEntryPointerDrag,
    updateLibraryEntryPointerPreview,
    finishLibraryEntryPointerDrag,
    handleLibraryCategoryDragOver,
    handleLibraryCategoryDragLeave,
    handleLibraryCategoryDrop,
    handleLibraryEntryDragOver,
    handleLibraryEntryDrop,
    handleLibraryEntryDragEnd,
  };
}
