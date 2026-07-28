import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';
import {
  BRAINSTORM_CATEGORY_STORAGE_KEY,
  BRAINSTORM_UNCATEGORIZED_ID,
  createBrainstormCategory,
  getBrainstormEntryCategoryId,
  normalizeBrainstormCategories,
  readBrainstormCategories,
  writeBrainstormCategories,
} from './standardModeBrainstormCategories';

describe('standardModeBrainstormCategories', () => {
  beforeEach(() => localStorage.clear());

  it('always keeps the reserved uncategorized group first', () => {
    expect(normalizeBrainstormCategories([])).toEqual([
      { id: BRAINSTORM_UNCATEGORIZED_ID, name: '未分类', isExpanded: true },
    ]);
  });

  it('persists custom categories without duplicating reserved or repeated names', () => {
    const category = { ...createBrainstormCategory('玄幻脑洞'), id: 'fantasy' };
    const normalized = writeBrainstormCategories([
      { id: BRAINSTORM_UNCATEGORIZED_ID, name: '未分类', isExpanded: false },
      category,
      { id: 'duplicate', name: '玄幻脑洞', isExpanded: true },
    ]);

    expect(normalized.map((item) => item.name)).toEqual(['未分类', '玄幻脑洞']);
    expect(JSON.parse(localStorage.getItem(BRAINSTORM_CATEGORY_STORAGE_KEY) ?? '[]')).toEqual([
      { id: BRAINSTORM_UNCATEGORIZED_ID, name: '未分类', isExpanded: false },
      category,
    ]);
    expect(readBrainstormCategories()).toEqual(normalized);
  });

  it('places legacy and orphaned entries in uncategorized', () => {
    const base = {
      id: 'brainstorm-1',
      tab: '脑洞',
      title: '测试脑洞',
      content: '',
      updatedAt: '',
    } satisfies WorkbenchLibraryEntry;
    const categories = [
      { id: BRAINSTORM_UNCATEGORIZED_ID, name: '未分类', isExpanded: true },
      { id: 'fantasy', name: '玄幻脑洞', isExpanded: true },
    ];

    expect(getBrainstormEntryCategoryId(base, categories)).toBe(BRAINSTORM_UNCATEGORIZED_ID);
    expect(getBrainstormEntryCategoryId({ ...base, brainstormCategoryId: 'missing' }, categories)).toBe(
      BRAINSTORM_UNCATEGORIZED_ID,
    );
    expect(getBrainstormEntryCategoryId({ ...base, brainstormCategoryId: 'fantasy' }, categories)).toBe('fantasy');
  });

  it('recovers from damaged storage data', () => {
    localStorage.setItem(BRAINSTORM_CATEGORY_STORAGE_KEY, '{broken');
    expect(readBrainstormCategories()[0]?.name).toBe('未分类');
    vi.restoreAllMocks();
  });
});
