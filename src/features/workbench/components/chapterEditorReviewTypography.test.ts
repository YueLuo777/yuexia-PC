import { beforeEach, describe, expect, it } from 'vitest';

import {
  REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY,
  REVIEW_PREVIEW_TYPOGRAPHY_VERSION,
  REVIEW_PREVIEW_TYPOGRAPHY_VERSION_KEY,
  readReviewPreviewFontSize,
} from './chapterEditorLayout';

describe('review original typography migration', () => {
  beforeEach(() => localStorage.clear());

  it('upgrades the previous 14px default to the 18px body-adapted default once', () => {
    localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, '14');
    expect(readReviewPreviewFontSize()).toBe(18);
    expect(localStorage.getItem(REVIEW_PREVIEW_TYPOGRAPHY_VERSION_KEY)).toBe(REVIEW_PREVIEW_TYPOGRAPHY_VERSION);

    localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, '14');
    expect(readReviewPreviewFontSize()).toBe(14);
  });

  it('preserves a non-default user font size during migration', () => {
    localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, '20');
    expect(readReviewPreviewFontSize()).toBe(20);
  });
});
