import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HISTORY_KEY, loadSnapshots, resetSnapshotIntervalCacheForTests, saveSnapshot } from './editorToolState';

describe('editor history snapshot interval cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-23T10:00:00+08:00'));
    localStorage.clear();
    resetSnapshotIntervalCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('does not reread the complete history during repeated edits inside five minutes', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');

    saveSnapshot(101, 'first version');
    saveSnapshot(101, 'second version');
    saveSnapshot(101, 'third version');

    expect(getItem.mock.calls.filter(([key]) => key === HISTORY_KEY)).toHaveLength(1);
    expect(loadSnapshots()['101']).toHaveLength(1);
  });

  it('creates another snapshot after the five-minute interval', () => {
    saveSnapshot(101, 'first version');
    vi.advanceTimersByTime(5 * 60 * 1000);
    saveSnapshot(101, 'later version');

    expect(loadSnapshots()['101'].map((snapshot) => snapshot.content)).toEqual(['first version', 'later version']);
  });
});
