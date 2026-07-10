import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  normalizeWorkbenchNovels,
  normalizeWorkbenchRecycledMap,
  normalizeWorkbenchVolumeMap,
  useWorkbenchData,
} from './useWorkbenchData';

describe('useWorkbenchData storage normalization', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('drops invalid novels and fills missing optional fields safely', () => {
    expect(normalizeWorkbenchNovels(null)).toEqual([]);
    expect(
      normalizeWorkbenchNovels([
        { id: 7, title: '主书', type: 'script', wordCount: 1200 },
        { title: 123, type: 'bad' },
        'broken',
      ]),
    ).toEqual([
      { id: 7, title: '主书', type: 'script', wordCount: 1200 },
      { id: 2, title: '作品2', type: 'novel' },
    ]);
  });

  it('normalizes volume maps from mixed stored data', () => {
    expect(
      normalizeWorkbenchVolumeMap({
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
      }),
    ).toEqual({
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
    expect(
      normalizeWorkbenchRecycledMap({
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
      }),
    ).toEqual({
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

  it('moves a deleted chapter to recycle storage before removing its content', () => {
    localStorage.setItem(
      'xinyuexia_novels_v1',
      JSON.stringify([{ id: 1, title: '测试作品', type: 'novel', wordCount: 4 }]),
    );
    localStorage.setItem('xinyuexia_current_novel_id', '1');
    localStorage.setItem(
      'xinyuexia_volumes_v1',
      JSON.stringify({
        1: [
          {
            id: 11,
            name: '第一卷',
            isExpanded: true,
            chapters: [
              {
                id: 101,
                title: '第一章',
                serialNumber: 1,
                wordCount: 4,
                isSelected: true,
                isPublished: false,
              },
            ],
          },
        ],
      }),
    );
    localStorage.setItem('xinyuexia_novel_1_chapter_101', '正文内容');

    const { result } = renderHook(() => useWorkbenchData());
    act(() => result.current.deleteChapter(11, 101));

    const recycledMap = JSON.parse(localStorage.getItem('xinyuexia_recycled_chapters_v1') ?? '{}');
    const volumesMap = JSON.parse(localStorage.getItem('xinyuexia_volumes_v1') ?? '{}');
    expect(recycledMap['1'][0]).toMatchObject({
      id: 101,
      volumeId: 11,
      volumeName: '第一卷',
      content: '正文内容',
    });
    expect(volumesMap['1'][0].chapters).toEqual([]);
    expect(localStorage.getItem('xinyuexia_novel_1_chapter_101')).toBeNull();
    expect(result.current.recycledChapters[0]).toMatchObject({ id: 101, content: '正文内容' });
  });
});
