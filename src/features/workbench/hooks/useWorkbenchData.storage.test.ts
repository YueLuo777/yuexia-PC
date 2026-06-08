import { describe, expect, it } from 'vitest';

import {
  normalizeWorkbenchNovels,
  normalizeWorkbenchRecycledMap,
  normalizeWorkbenchVolumeMap,
} from './useWorkbenchData';

describe('useWorkbenchData storage normalization', () => {
  it('drops invalid novels and fills missing optional fields safely', () => {
    expect(normalizeWorkbenchNovels(null)).toEqual([]);
    expect(normalizeWorkbenchNovels([
      { id: 7, title: '主书', type: 'script', wordCount: 1200 },
      { title: 123, type: 'bad' },
      'broken',
    ])).toEqual([
      { id: 7, title: '主书', type: 'script', wordCount: 1200 },
      { id: 2, title: '作品2', type: 'novel' },
    ]);
  });

  it('normalizes volume maps from mixed stored data', () => {
    expect(normalizeWorkbenchVolumeMap({
      10: [
        {
          id: '20',
          name: '第一卷',
          isExpanded: false,
          chapters: [
            { id: '30', title: '开端', serialNumber: '2', wordCount: '100', isSelected: true, isPublished: true },
            { bad: true },
          ],
        },
      ],
      bad: [{ id: 1 }],
      11: 'broken',
    })).toEqual({
      10: [
        {
          id: 20,
          name: '第一卷',
          isExpanded: false,
          chapters: [
            { id: 30, title: '开端', serialNumber: 2, wordCount: 100, isSelected: true, isPublished: true },
            expect.objectContaining({ title: '', serialNumber: 2, wordCount: 0, isSelected: false }),
          ],
        },
      ],
      11: [],
    });
  });

  it('normalizes recycled chapter maps without trusting stored shapes', () => {
    expect(normalizeWorkbenchRecycledMap({
      3: [
        {
          id: 9,
          title: '旧章',
          serialNumber: 1,
          wordCount: 500,
          volumeId: '2',
          volumeName: '第一卷',
          deletedAt: '2026-06-08',
          expireAt: '2026-07-08',
          content: '正文',
        },
      ],
      4: null,
    })).toEqual({
      3: [
        {
          id: 9,
          title: '旧章',
          serialNumber: 1,
          wordCount: 500,
          isSelected: false,
          volumeId: 2,
          volumeName: '第一卷',
          deletedAt: '2026-06-08',
          expireAt: '2026-07-08',
          content: '正文',
        },
      ],
      4: [],
    });
  });
});
