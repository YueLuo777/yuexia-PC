import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { writeWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';

import { useWorkbenchLibrarySnapshots } from './useWorkbenchLibrarySnapshots';

describe('useWorkbenchLibrarySnapshots', () => {
  beforeEach(() => localStorage.clear());

  it('refreshes settings and outlines after library writes', () => {
    const { result } = renderHook(() => useWorkbenchLibrarySnapshots('settings-1', 'outline-1'));
    expect(result.current.settingsEntries).toEqual([]);

    act(() => {
      writeWorkbenchLibraryEntries('settings-1', [
        {
          id: 'setting-a',
          tab: '设定',
          title: '世界观',
          content: '世界观内容',
          updatedAt: '2026-07-10',
        },
      ]);
      writeWorkbenchLibraryEntries('outline-1', [
        {
          id: 'outline-a',
          tab: '细纲',
          title: '第1章',
          content: '章纲内容',
          updatedAt: '2026-07-10',
        },
      ]);
    });

    expect(result.current.settingsEntries).toEqual([expect.objectContaining({ id: 'setting-a' })]);
    expect(result.current.outlineEntries).toEqual([expect.objectContaining({ id: 'outline-a' })]);
  });
});
