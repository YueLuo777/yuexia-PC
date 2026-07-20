import { describe, expect, it } from 'vitest';

import windowBounds from './windowBounds.cjs';

const { fitCenteredWindowSizeToWorkArea, fitWindowBoundsToWorkArea } = windowBounds;

describe('window startup bounds', () => {
  const workArea = { x: 0, y: 0, width: 2560, height: 1400 };

  it('restores a remembered size exactly when it fits the display', () => {
    expect(fitWindowBoundsToWorkArea({ x: 120, y: 80, width: 2064, height: 1120 }, workArea)).toEqual({
      x: 120,
      y: 80,
      width: 2064,
      height: 1120,
    });
  });

  it('only shrinks a remembered size when it exceeds the available work area', () => {
    expect(fitWindowBoundsToWorkArea({ x: -300, y: -200, width: 3000, height: 1800 }, workArea)).toEqual({
      x: 0,
      y: 0,
      width: 2560,
      height: 1400,
    });
  });

  it('keeps an unpositioned default size without adding a fake position', () => {
    expect(fitWindowBoundsToWorkArea({ width: 1366, height: 768 }, workArea)).toEqual({ width: 1366, height: 768 });
  });

  it('centers a selected preset inside the current display work area', () => {
    expect(fitCenteredWindowSizeToWorkArea({ width: 1600, height: 900 }, workArea)).toEqual({
      x: 480,
      y: 250,
      width: 1600,
      height: 900,
    });
  });
});
