export type LibraryEntryDragState = {
  entryId: string;
  tab: string;
  type: string;
} | null;

export type LibraryEntryDropPreviewState = {
  entryId: string;
  tab: string;
  type: string;
  mode: 'target-position' | 'group-end';
  targetEntryId?: string;
} | null;

export type LibraryEntryPointerDragState = {
  entryId: string;
  tab: string;
  type: string;
  pointerId: number;
  element: HTMLElement;
  startX: number;
  startY: number;
  active: boolean;
  armed: boolean;
  activationTimer: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
  cleanup: () => void;
} | null;

export const LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE = 14;
export const LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;
export const LIBRARY_ENTRY_POINTER_DRAG_RETARGET_DISTANCE = 28;
export const LIBRARY_ENTRY_POINTER_DRAG_RETURN_DISTANCE = 28;

export function hasLibraryEntryPointerRetargetedTooSoon(
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance =
    targetKey === `entry:${pointerDrag.entryId}`
      ? LIBRARY_ENTRY_POINTER_DRAG_RETURN_DISTANCE
      : LIBRARY_ENTRY_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

export function rememberLibraryEntryPointerPreviewTarget(
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}

export function isLibraryPointerPastGroupEntries(
  hoverGroup: HTMLElement,
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  clientY: number,
) {
  const visibleEntries = Array.from(hoverGroup.querySelectorAll<HTMLElement>('[data-library-entry-id]')).filter(
    (element) =>
      element.dataset.libraryEntryTab === pointerDrag.tab && element.dataset.libraryEntryId !== pointerDrag.entryId,
  );
  if (visibleEntries.length === 0) return true;
  const lastEntryRect = visibleEntries[visibleEntries.length - 1].getBoundingClientRect();
  return clientY > lastEntryRect.bottom;
}
