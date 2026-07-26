import { beforeEach, describe, expect, it } from 'vitest';

import type { Novel } from './novelTypes';
import { formatNovelCardStatValue, readStandardModeNovelCardStats } from './standardModeNovelCardStats';

const novel: Novel = {
  id: 7,
  title: '九重天劫',
  type: 'novel',
  category: '玄幻',
  wordCount: 3868,
  createdAt: '2026/07/01',
  lastModifiedAt: '2026/07/27',
};

describe('readStandardModeNovelCardStats', () => {
  beforeEach(() => localStorage.clear());

  it('reads real outline, chapter, and word counts for one novel', () => {
    localStorage.setItem(
      'xinyuexia_volumes_v1',
      JSON.stringify({
        7: [
          { id: 1, chapters: [{ id: 11 }, { id: 12 }] },
          { id: 2, chapters: [{ id: 13 }] },
        ],
      }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_outline_7',
      JSON.stringify([
        { id: '1', tab: '细纲', title: '第1章 章纲', content: '有内容', updatedAt: '' },
        { id: '2', tab: '章纲', title: '第2章 章纲', content: '', updatedAt: '' },
        { id: '3', tab: '章节细纲', title: '第3章 章纲', content: '已删除', updatedAt: '', deletedAt: 'now' },
      ]),
    );

    expect(readStandardModeNovelCardStats(novel)).toEqual({
      outlineCount: 1,
      chapterCount: 3,
      wordCount: 3868,
    });
  });

  it('keeps large card values readable without cutting off digits', () => {
    expect(formatNovelCardStatValue(3868)).toBe('3,868');
    expect(formatNovelCardStatValue(128600)).toBe('12.86万');
    expect(formatNovelCardStatValue(1286000)).toBe('128.6万');
  });
});
