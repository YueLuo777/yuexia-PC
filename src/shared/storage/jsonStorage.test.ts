import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createJsonStorage } from './jsonStorage';

describe('createJsonStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the fallback when stored JSON is broken', () => {
    localStorage.setItem('broken', '{bad json');

    const storage = createJsonStorage<number[]>('broken', []);

    expect(storage.read()).toEqual([]);
  });

  it('normalizes parsed values before exposing them', () => {
    localStorage.setItem('items', JSON.stringify([{ id: 1 }, { name: 'bad' }]));

    const storage = createJsonStorage('items', [] as Array<{ id: number }>, {
      normalize: (value) =>
        Array.isArray(value) ? value.filter((item): item is { id: number } => typeof item?.id === 'number') : [],
    });

    expect(storage.read()).toEqual([{ id: 1 }]);
  });

  it('dispatches an optional event after writing', () => {
    const listener = vi.fn();
    window.addEventListener('xinyuexia:test-storage-updated', listener);

    const storage = createJsonStorage('items', [] as string[], {
      eventName: 'xinyuexia:test-storage-updated',
    });

    storage.write(['a']);

    expect(JSON.parse(localStorage.getItem('items') ?? 'null')).toEqual(['a']);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
