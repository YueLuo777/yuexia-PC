import { describe, expect, it } from 'vitest';

import type { WorkbenchLinkedContextItem } from '../components/WorkbenchAIPanel';
import type { WorkbenchContextChapterPair } from '../components/WorkbenchContextChapterSummaryList';
import {
  getPreferredChapterNarrativeItem,
  keepExclusiveChapterNarrativeItems,
  mergeContextItems,
  normalizeContextSource,
  parseContextRoleContent,
  parseContextSettingContent,
} from './workbenchContextModel';

const item = (
  id: string,
  source: WorkbenchLinkedContextItem['source'],
  content: string,
): WorkbenchLinkedContextItem => ({
  id,
  source,
  title: id,
  group: '测试',
  content,
});

describe('workbench context model', () => {
  it('normalizes setting role outline and summary source names', () => {
    expect(normalizeContextSource('人物角色库')).toBe('role');
    expect(normalizeContextSource('章节细纲')).toBe('outline');
    expect(normalizeContextSource('章节梗概')).toBe('summary');
    expect(normalizeContextSource('作品设定')).toBe('setting');
  });

  it('prefers chapter text when present and falls back to summary when chapter text is empty', () => {
    const chapterItem = item('chapter', 'chapter', '正文');
    const summaryItem = item('summary', 'summary', '梗概');
    const row = {
      volumeId: 1,
      volumeName: '第一卷',
      chapterId: 1,
      serialNumber: 1,
      title: '第一章',
      isCurrent: false,
      chapterItem,
      outlineItem: item('outline', 'outline', '章纲'),
      summaryItem,
    } satisfies WorkbenchContextChapterPair;

    expect(getPreferredChapterNarrativeItem(row)?.id).toBe('chapter');
    expect(keepExclusiveChapterNarrativeItems([row], [chapterItem, summaryItem]).map((entry) => entry.id)).toEqual([
      'chapter',
    ]);

    const emptyChapterRow = { ...row, chapterItem: item('chapter-empty', 'chapter', '') };
    expect(getPreferredChapterNarrativeItem(emptyChapterRow)?.id).toBe('summary');
  });

  it('deduplicates linked items while preserving the original order', () => {
    const first = item('same', 'setting', '一');
    expect(mergeContextItems([first, { ...first, content: '二' }])).toEqual([first]);
  });

  it('keeps legacy role and setting content readable', () => {
    expect(parseContextSettingContent('{"type":"主线剧情","body":"规划"}')).toEqual({
      type: '剧情规划',
      body: '规划',
    });
    expect(parseContextRoleContent('{"type":"男主角","personality":"果断","background":"山村出身"}')).toEqual({
      type: '男主角',
      body: '基础设定：人物设定：果断\n\n山村出身',
    });
  });
});
