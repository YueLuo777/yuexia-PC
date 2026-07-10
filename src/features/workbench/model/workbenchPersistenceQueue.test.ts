import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cancelScheduledWorkbenchJsonWrite,
  flushWorkbenchJsonWrites,
  resetWorkbenchPersistenceQueueForTests,
  scheduleWorkbenchJsonWrite,
} from './workbenchPersistenceQueue';

describe('workbenchPersistenceQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    resetWorkbenchPersistenceQueueForTests();
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
});
