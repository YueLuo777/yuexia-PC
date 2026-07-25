import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetWorkbenchPersistenceQueueForTests } from '@/features/workbench/model/workbenchPersistenceQueue';
import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

import { getChapterContentKey } from '../model/workbenchDataSupport';
import { useWorkbenchChapterContentPersistence } from './useWorkbenchChapterContentPersistence';

const novels: WorkbenchNovel[] = [{ id: 1, title: 'Novel', type: 'novel', wordCount: 2 }];
const volumesMap: Record<number, Volume[]> = {
  1: [
    {
      id: 11,
      name: 'Volume',
      isExpanded: true,
      chapters: [{ id: 101, title: 'Chapter', serialNumber: 1, wordCount: 2, isSelected: true }],
    },
  ],
};
const selectedChapter = { volumeId: 11, volumeName: 'Volume', chapter: volumesMap[1][0].chapters[0] };

function setup() {
  const setters = {
    setNovels: vi.fn(),
    setVolumesMap: vi.fn(),
    setEditorContent: vi.fn(),
    setLastSavedAt: vi.fn(),
    setSaveStatus: vi.fn(),
  };
  const hook = renderHook(() =>
    useWorkbenchChapterContentPersistence({
      novels,
      currentNovelId: 1,
      volumesMap,
      selectedChapter,
      ...setters,
    }),
  );
  return { ...hook, setters };
}

describe('useWorkbenchChapterContentPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    resetWorkbenchPersistenceQueueForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('keeps typing immediate in React while persisting only the latest content after the debounce', () => {
    const { result, setters } = setup();
    const contentKey = getChapterContentKey(1, 101);

    act(() => {
      result.current.saveContent('first');
      result.current.saveContent('latest content');
    });

    expect(setters.setEditorContent).toHaveBeenLastCalledWith('latest content');
    expect(setters.setSaveStatus).toHaveBeenLastCalledWith('saving');
    expect(localStorage.getItem(contentKey)).toBeNull();

    act(() => vi.advanceTimersByTime(350));

    expect(localStorage.getItem(contentKey)).toBe('latest content');
    expect(setters.setVolumesMap).toHaveBeenCalledOnce();
    expect(setters.setNovels).toHaveBeenCalledOnce();
    expect(setters.setSaveStatus).toHaveBeenLastCalledWith('saved');
  });

  it('flushes immediately for an explicit save or chapter switch', () => {
    const { result } = setup();
    const contentKey = getChapterContentKey(1, 101);

    act(() => result.current.saveContent('flush now'));
    let succeeded = false;
    act(() => {
      succeeded = result.current.flushPendingSave();
    });

    expect(succeeded).toBe(true);
    expect(localStorage.getItem(contentKey)).toBe('flush now');
  });

  it('shows a failure and can retry the retained content', () => {
    const { result, setters } = setup();
    const contentKey = getChapterContentKey(1, 101);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    act(() => result.current.saveContent('recover me'));
    act(() => vi.advanceTimersByTime(350));
    expect(setters.setSaveStatus).toHaveBeenLastCalledWith('error');

    setItem.mockRestore();
    act(() => result.current.retryPendingSave());

    expect(localStorage.getItem(contentKey)).toBe('recover me');
    expect(setters.setSaveStatus).toHaveBeenLastCalledWith('saved');
  });
});
