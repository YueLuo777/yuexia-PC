import { describe, expect, it } from 'vitest';

import {
  countUnpolishedChapters,
  getChapterContentFingerprint,
  isChapterContentPolished,
  markChapterContentPolished,
} from './chapterPolishStatus';
import type { Volume } from './workbenchTypes';

describe('chapter polish status', () => {
  it('binds polished state to the current chapter content fingerprint', () => {
    const storageKey = `chapter-polish-status-test-${Date.now()}`;

    expect(getChapterContentFingerprint('原文')).not.toBe(getChapterContentFingerprint('改后正文'));
    expect(isChapterContentPolished(storageKey, 1, '原文')).toBe(false);

    markChapterContentPolished(storageKey, 1, '原文');

    expect(isChapterContentPolished(storageKey, 1, '原文')).toBe(true);
    expect(isChapterContentPolished(storageKey, 1, '原文被重新修改')).toBe(false);
  });

  it('counts every chapter whose current content has not been polished', () => {
    const storageKey = `chapter-polish-count-test-${Date.now()}`;
    const volumes: Volume[] = [
      {
        id: 1,
        name: '第一卷',
        isExpanded: true,
        chapters: [
          { id: 1, title: '一', serialNumber: 1, wordCount: 2, isSelected: false },
          { id: 2, title: '二', serialNumber: 2, wordCount: 2, isSelected: false },
        ],
      },
    ];
    const contentById: Record<number, string> = { 1: '第一章', 2: '第二章' };

    markChapterContentPolished(storageKey, 1, contentById[1]);

    expect(countUnpolishedChapters(storageKey, volumes, (chapterId) => contentById[chapterId])).toBe(1);
    contentById[1] = '第一章修改后';
    expect(countUnpolishedChapters(storageKey, volumes, (chapterId) => contentById[chapterId])).toBe(2);
  });
});
