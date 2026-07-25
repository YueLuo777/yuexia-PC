export function reorderNavigationItems<T>(items: T[], dragSourceIndex: number | null, targetIndex: number | null) {
  if (
    dragSourceIndex === null ||
    targetIndex === null ||
    dragSourceIndex === targetIndex ||
    dragSourceIndex < 0 ||
    targetIndex < 0 ||
    dragSourceIndex >= items.length ||
    targetIndex >= items.length
  )
    return items;
  const next = [...items];
  const [moved] = next.splice(dragSourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

type NavPointerDragSnapshot = {
  sourceIndex: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
};

export const NAV_POINTER_DRAG_ACTIVATION_DISTANCE = 22;
export const NAV_POINTER_DRAG_ACTIVATION_DELAY_MS = 220;
export const NAV_POINTER_DRAG_RETARGET_DISTANCE = 40;
export const NAV_POINTER_DRAG_RETURN_DISTANCE = 56;

export function hasNavPointerRetargetedTooSoon(
  pointerDrag: NavPointerDragSnapshot,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance =
    targetKey === `nav:${pointerDrag.sourceIndex}`
      ? NAV_POINTER_DRAG_RETURN_DISTANCE
      : NAV_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

export function rememberNavPointerPreviewTarget(
  pointerDrag: NavPointerDragSnapshot,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}
