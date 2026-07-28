import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE,
  STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY,
  clampStandardBrainstormPreviewFontSize,
  readStandardBrainstormPreviewFontSize,
  writeStandardBrainstormPreviewFontSize,
} from './standardModeBrainstormPreferences';

describe('standardModeBrainstormPreferences', () => {
  beforeEach(() => localStorage.clear());

  it('uses the shared brainstorm preview font range', () => {
    expect(clampStandardBrainstormPreviewFontSize(1)).toBe(12);
    expect(clampStandardBrainstormPreviewFontSize(99)).toBe(28);
  });

  it('persists and restores the preview font size', () => {
    expect(readStandardBrainstormPreviewFontSize()).toBe(DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE);
    expect(writeStandardBrainstormPreviewFontSize(19)).toBe(19);
    expect(localStorage.getItem(STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY)).toBe('19');
    expect(readStandardBrainstormPreviewFontSize()).toBe(19);
  });
});
