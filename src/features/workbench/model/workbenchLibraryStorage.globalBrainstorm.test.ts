import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from './workbenchLibraryStorage';

function entry(id: string, tab: string, title: string): WorkbenchLibraryEntry {
  return {
    id,
    tab,
    title,
    content: `${title}内容`,
    updatedAt: '2026-06-24',
  };
}

describe('workbench library global brainstorm storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shares brainstorm entries globally while keeping other setting entries per work', () => {
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm('work-a-settings', [
      entry('setting-a', '大纲', '作品A设定'),
      entry('brainstorm-1', '脑洞', '全局脑洞'),
    ]);
    localStorage.setItem('work-b-settings', JSON.stringify([entry('setting-b', '大纲', '作品B设定')]));

    expect(readWorkbenchLibraryEntries('work-a-settings')).toEqual([
      expect.objectContaining({ id: 'setting-a', tab: '大纲' }),
    ]);
    expect(readWorkbenchLibraryEntries('work-b-settings')).toEqual([
      expect.objectContaining({ id: 'setting-b', tab: '大纲' }),
    ]);
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toEqual([
      expect.objectContaining({ id: 'brainstorm-1', tab: '脑洞' }),
    ]);

    expect(readWorkbenchLibraryEntriesWithGlobalBrainstorm('work-b-settings')).toEqual([
      expect.objectContaining({ id: 'setting-b', tab: '大纲' }),
      expect.objectContaining({ id: 'brainstorm-1', tab: '脑洞' }),
    ]);
  });

  it('migrates old per-work brainstorm entries into the global brainstorm store', () => {
    localStorage.setItem('legacy-work-settings', JSON.stringify([
      entry('setting-1', '大纲', '旧作品设定'),
      entry('brainstorm-old', '脑洞', '旧脑洞'),
    ]));

    const merged = readWorkbenchLibraryEntriesWithGlobalBrainstorm('legacy-work-settings');

    expect(merged).toEqual([
      expect.objectContaining({ id: 'setting-1', tab: '大纲' }),
      expect.objectContaining({ id: 'brainstorm-old', tab: '脑洞' }),
    ]);
    expect(readWorkbenchLibraryEntries('legacy-work-settings')).toEqual([
      expect.objectContaining({ id: 'setting-1', tab: '大纲' }),
    ]);
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toEqual([
      expect.objectContaining({ id: 'brainstorm-old', tab: '脑洞' }),
    ]);
  });

  it('notifies both the current work storage and global brainstorm storage when saving mixed entries', () => {
    const listener = vi.fn();
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, listener);

    writeWorkbenchLibraryEntriesWithGlobalBrainstorm('work-settings', [
      entry('setting-1', '大纲', '作品设定'),
      entry('brainstorm-1', '脑洞', '通用脑洞'),
    ]);

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      detail: { storageKey: 'work-settings' },
    }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      detail: { storageKey: GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY },
    }));
  });
});
