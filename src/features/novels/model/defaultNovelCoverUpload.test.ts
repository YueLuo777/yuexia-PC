import { describe, expect, it } from 'vitest';

import {
  calculateDefaultCoverCrop,
  DEFAULT_COVER_OUTPUT_HEIGHT,
  DEFAULT_COVER_OUTPUT_WIDTH,
  DEFAULT_COVER_UPLOAD_MAX_BYTES,
  DEFAULT_COVER_UPLOAD_MAX_EDGE,
} from '@/features/novels/model/defaultNovelCoverUpload';

describe('default novel cover upload', () => {
  it('publishes the upload and normalized output limits', () => {
    expect(DEFAULT_COVER_UPLOAD_MAX_BYTES).toBe(10 * 1024 * 1024);
    expect(DEFAULT_COVER_UPLOAD_MAX_EDGE).toBe(8192);
    expect(DEFAULT_COVER_OUTPUT_WIDTH).toBe(1200);
    expect(DEFAULT_COVER_OUTPUT_HEIGHT).toBe(1400);
  });

  it('center-crops wide and tall images to the 6:7 cover ratio', () => {
    expect(calculateDefaultCoverCrop(2400, 1400)).toEqual({ sx: 600, sy: 0, width: 1200, height: 1400 });
    expect(calculateDefaultCoverCrop(1200, 2400)).toEqual({ sx: 0, sy: 500, width: 1200, height: 1400 });
  });
});
