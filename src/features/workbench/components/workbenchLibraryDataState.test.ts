import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  readWorkbenchLibraryEntries,
} from '@/features/workbench/model/workbenchLibraryStorage';

import { previewNormalizedEntriesWithVisibleDefaults } from './workbenchLibraryDataState';

describe('workbench library render-safe initialization', () => {
  beforeEach(() => localStorage.clear());

  it('previews visible defaults without writing or broadcasting during render initialization', () => {
    const listener = vi.fn();
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, listener);

    const entries = previewNormalizedEntriesWithVisibleDefaults('settings-1', ['角色', '大纲']);

    expect(entries.some((entry) => entry.tab === '角色' && entry.title === '男主角')).toBe(true);
    expect(entries.some((entry) => entry.tab === '大纲')).toBe(true);
    expect(readWorkbenchLibraryEntries('settings-1')).toEqual([]);
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, listener);
  });
});
