import { describe, expect, it } from 'vitest';

import {
  buildWorkProfileOptimizationUserContent,
  parseWorkProfileOptimizationCandidates,
} from './standardModeWorkProfileOptimization';

describe('standardModeWorkProfileOptimization', () => {
  it('builds a complete request from the current work details and user preferences', () => {
    const content = buildWorkProfileOptimizationUserContent({
      target: 'both',
      count: 3,
      style: '悬念钩子',
      referenceTitles: '参考作品甲',
      requirements: '突出系统反差',
      currentTitle: '旧书名',
      currentSynopsis: '旧简介',
      channel: '男频',
      category: '玄幻',
      targetWordCount: 1_000_000,
    });

    expect(content).toContain('候选数量：3个');
    expect(content).toContain('作品频道：男频');
    expect(content).toContain('预计篇幅：100万字');
    expect(content).toContain('参考书名：参考作品甲');
    expect(content).toContain('用户要求：突出系统反差');
  });

  it('parses fenced JSON, removes book-title brackets and enforces field limits', () => {
    const [candidate] = parseWorkProfileOptimizationCandidates(
      '```json\n{"candidates":[{"title":"《二十一字以上的超长作品名称必须被自动截断处理》","synopsis":"新简介"}]}\n```',
      'both',
      1,
    );

    expect(candidate.title).not.toContain('《');
    expect(candidate.title.length).toBeLessThanOrEqual(20);
    expect(candidate.synopsis).toBe('新简介');
  });

  it('rejects invalid output instead of writing raw AI text into work details', () => {
    expect(() => parseWorkProfileOptimizationCandidates('不是JSON', 'both', 5))
      .toThrow('AI返回格式不正确');
  });
});
