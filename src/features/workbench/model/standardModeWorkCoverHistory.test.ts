import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readStandardModeWorkCoverHistory,
  rememberPreviousStandardModeWorkCover,
} from './standardModeWorkCoverHistory';

describe('standardModeWorkCoverHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(1000);
  });

  it('stores only a replaced saved cover in the current book history', () => {
    expect(rememberPreviousStandardModeWorkCover(7, undefined, 'new-cover')).toEqual([]);
    expect(rememberPreviousStandardModeWorkCover(7, 'old-cover', 'new-cover')).toEqual([
      { src: 'old-cover', savedAt: 1000 },
    ]);
    expect(readStandardModeWorkCoverHistory(7)).toEqual([{ src: 'old-cover', savedAt: 1000 }]);
    expect(readStandardModeWorkCoverHistory(8)).toEqual([]);
  });

  it('deduplicates covers and does not treat the unchanged cover as history', () => {
    rememberPreviousStandardModeWorkCover(7, 'cover-a', 'cover-b');
    rememberPreviousStandardModeWorkCover(7, 'cover-b', 'cover-a');
    const history = rememberPreviousStandardModeWorkCover(7, 'cover-a', 'cover-c');

    expect(history.map((item) => item.src)).toEqual(['cover-a', 'cover-b']);
    expect(rememberPreviousStandardModeWorkCover(7, 'cover-c', 'cover-c', history)).toEqual(history);
  });
});
