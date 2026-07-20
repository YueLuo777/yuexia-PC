import { describe, expect, it } from 'vitest';

import { calculateAutoFitFontSize } from './AutoFitText';

describe('calculateAutoFitFontSize', () => {
  it('keeps the maximum size when the text already fits', () => {
    expect(calculateAutoFitFontSize(100, 80, 11, 18)).toBe(18);
  });

  it('shrinks text in proportion to its available width', () => {
    expect(calculateAutoFitFontSize(60, 90, 11, 18)).toBe(12);
  });

  it('respects the minimum readable size for extremely narrow cards', () => {
    expect(calculateAutoFitFontSize(20, 100, 11, 18)).toBe(11);
  });
});
