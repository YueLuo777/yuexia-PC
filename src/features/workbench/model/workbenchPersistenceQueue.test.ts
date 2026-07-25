import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cancelScheduledWorkbenchJsonWrite,
  flushWorkbenchJsonWrites,
  resetWorkbenchPersistenceQueueForTests,
  retryWorkbenchWrites,
  scheduleWorkbenchJsonWrite,
  scheduleWorkbenchTextWrite,
} from './workbenchPersistenceQueue';

describe('workbenchPersistenceQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    resetWorkbenchPersistenceQueueForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('coalesces frequent metadata writes and persists the latest snapshot', () => {
    scheduleWorkbenchJsonWrite('volumes', { revision: 1 });
    scheduleWorkbenchJsonWrite('volumes', { revision: 2 });
    scheduleWorkbenchJsonWrite('novels', [{ id: 1, wordCount: 20 }]);

    expect(localStorage.getItem('volumes')).toBeNull();
    vi.advanceTimersByTime(350);

    expect(JSON.parse(localStorage.getItem('volumes') ?? '{}')).toEqual({ revision: 2 });
    expect(JSON.parse(localStorage.getItem('novels') ?? '[]')).toEqual([{ id: 1, wordCount: 20 }]);
  });

  it('can cancel a stale queued write before an immediate structural write', () => {
    scheduleWorkbenchJsonWrite('volumes', { revision: 1 });
    cancelScheduledWorkbenchJsonWrite('volumes');
    localStorage.setItem('volumes', JSON.stringify({ revision: 2 }));
    flushWorkbenchJsonWrites();

    expect(JSON.parse(localStorage.getItem('volumes') ?? '{}')).toEqual({ revision: 2 });
  });

  it('debounces text writes and only persists the latest content for a chapter', () => {
    const firstSuccess = vi.fn();
    const latestSuccess = vi.fn();

    scheduleWorkbenchTextWrite('chapter-1', 'first', { onSuccess: firstSuccess });
    scheduleWorkbenchTextWrite('chapter-1', 'latest', { onSuccess: latestSuccess });

    expect(localStorage.getItem('chapter-1')).toBeNull();
    vi.advanceTimersByTime(350);

    expect(localStorage.getItem('chapter-1')).toBe('latest');
    expect(firstSuccess).not.toHaveBeenCalled();
    expect(latestSuccess).toHaveBeenCalledOnce();
  });

  it('keeps a failed write queued and reports success after retry', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    scheduleWorkbenchTextWrite('chapter-1', 'recoverable', { onSuccess, onError });
    vi.advanceTimersByTime(350);

    expect(onError).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(localStorage.getItem('chapter-1')).toBeNull();

    setItem.mockRestore();
    const retryResult = retryWorkbenchWrites();

    expect(retryResult.failedKeys).toEqual([]);
    expect(retryResult.succeededKeys).toEqual(['chapter-1']);
    expect(localStorage.getItem('chapter-1')).toBe('recoverable');
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
