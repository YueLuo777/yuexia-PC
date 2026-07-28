import { describe, expect, it } from 'vitest';

import type { Volume } from '@/features/workbench/model/workbenchTypes';
import type { BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import { buildStandardModeWorkbenchStats } from './standardModeWorkbenchStats';

describe('buildStandardModeWorkbenchStats', () => {
  it('counts actual outlines, written chapters, and unique completed audits', () => {
    const volumes = [
      {
        id: 1,
        name: '第一卷',
        isExpanded: true,
        chapters: [
          { id: 11, title: '第一章', serialNumber: 1, wordCount: 1200, isSelected: true, isPublished: false },
          { id: 12, title: '第二章', serialNumber: 2, wordCount: 0, isSelected: false, isPublished: false },
        ],
      },
    ] as Volume[];
    const reviewTask = (id: string, chapterId: number): BackgroundAiTask => ({
      id,
      kind: 'review',
      title: '剧情审核',
      status: 'success',
      input: '',
      output: '审核通过',
      createdAt: '2026/07/26',
      updatedAt: '2026/07/26',
      meta: {
        target: 'chapterReview',
        mode: 'audit',
        chapterId,
        settingsStorageKey: 'settings-9',
      },
    });

    const stats = buildStandardModeWorkbenchStats({
      novelWordCount: 1200,
      volumes,
      outlineEntries: [
        { id: '1', tab: '细纲', title: '第1章 章纲', content: '章纲内容', updatedAt: '' },
        { id: '2', tab: '章节细纲', title: '第2章 章纲', content: '', updatedAt: '' },
        { id: '3', tab: '梗概', title: '第1章 梗概', content: '梗概内容', updatedAt: '' },
      ],
      reviewTasks: [reviewTask('a', 11), reviewTask('b', 11), reviewTask('c', 99)],
      settingsStorageKey: 'settings-9',
      settingTemplateState: null,
      readChapterContent: (chapterId) => (chapterId === 11 ? '正文内容' : ''),
    });

    expect(stats).toEqual({
      wordCount: 1200,
      outlineCount: 1,
      draftCount: 1,
      reviewedChapterCount: 1,
      brainstormCount: 0,
      settingTotalCount: 0,
      settingCompletedCount: 0,
    });
  });
});
