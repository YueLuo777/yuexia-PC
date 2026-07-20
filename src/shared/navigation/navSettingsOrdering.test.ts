import { describe, expect, it } from 'vitest';

import {
  NAV_POINTER_DRAG_ACTIVATION_DELAY_MS,
  NAV_POINTER_DRAG_ACTIVATION_DISTANCE,
  NAV_POINTER_DRAG_RETARGET_DISTANCE,
  NAV_POINTER_DRAG_RETURN_DISTANCE,
  hasNavPointerRetargetedTooSoon,
  rememberNavPointerPreviewTarget,
  reorderNavigationItems,
} from './navSettingsOrdering';

describe('navigation pointer ordering', () => {
  it('moves a row once to the selected stable target', () => {
    expect(reorderNavigationItems(['A', 'B', 'C', 'D'], 0, 2)).toEqual(['B', 'C', 'A', 'D']);
    expect(reorderNavigationItems(['A', 'B', 'C', 'D'], 3, 1)).toEqual(['A', 'D', 'B', 'C']);
  });

  it('ignores invalid or unchanged drop targets', () => {
    const items = ['A', 'B'];

    expect(reorderNavigationItems(items, 0, 0)).toBe(items);
    expect(reorderNavigationItems(items, -1, 1)).toBe(items);
    expect(reorderNavigationItems(items, 0, 4)).toBe(items);
  });

  it('requires deliberate movement before switching preview targets', () => {
    const pointerDrag = {
      sourceIndex: 1,
      lastPreviewX: 100,
      lastPreviewY: 100,
      lastPreviewTargetKey: 'nav:2' as string | null,
    };

    expect(NAV_POINTER_DRAG_ACTIVATION_DISTANCE).toBeGreaterThanOrEqual(20);
    expect(NAV_POINTER_DRAG_ACTIVATION_DELAY_MS).toBeGreaterThanOrEqual(200);
    expect(NAV_POINTER_DRAG_RETARGET_DISTANCE).toBeGreaterThanOrEqual(40);
    expect(NAV_POINTER_DRAG_RETURN_DISTANCE).toBeGreaterThan(NAV_POINTER_DRAG_RETARGET_DISTANCE);
    expect(hasNavPointerRetargetedTooSoon(pointerDrag, 'nav:3', 120, 100)).toBe(true);
    expect(hasNavPointerRetargetedTooSoon(pointerDrag, 'nav:3', 145, 100)).toBe(false);

    rememberNavPointerPreviewTarget(pointerDrag, 'nav:3', 145, 100);
    expect(pointerDrag.lastPreviewTargetKey).toBe('nav:3');
    expect(pointerDrag.lastPreviewX).toBe(145);
  });
});
