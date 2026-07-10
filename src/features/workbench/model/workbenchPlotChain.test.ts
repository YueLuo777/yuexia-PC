import { describe, expect, it } from 'vitest';

import {
  getWorkbenchPlotPointDecisionMetrics,
  getWorkbenchPlotPointMetricClass,
  normalizePlotPointChainNames,
  normalizePlotPointChainSelections,
  normalizePlotPointLengthMode,
  normalizePlotPointOpeningElements,
  plotLibraryItemToCandidate,
  type WorkbenchPlotPointCandidate,
} from './workbenchPlotChain';

const candidate: WorkbenchPlotPointCandidate = {
  id: 'ai:1',
  title: '强冲突',
  source: 'AI生成',
  originalGenre: 'AI生成',
  original: '原始剧情',
  adapted: '主角被当众逼迫做选择，只能立刻反击。',
  variable: '冲突变量',
  review: '冲突清晰',
};

describe('workbenchPlotChain', () => {
  it('normalizes stored chain names and selected point ids', () => {
    expect(normalizePlotPointChainNames({ 1: '主线', 2: '', 3: '支线' })).toEqual({
      1: '主线',
      2: '剧情链2',
      3: '支线',
    });
    expect(normalizePlotPointChainSelections({ 1: ['a', 3], 2: 'bad', 3: ['c'] })).toEqual({
      1: ['a'],
      2: [],
      3: ['c'],
    });
  });

  it('normalizes generation options to safe defaults', () => {
    expect(normalizePlotPointLengthMode('long')).toBe('long');
    expect(normalizePlotPointLengthMode('bad')).toBe('short');
    expect(normalizePlotPointOpeningElements(['强冲突', '强冲突', '坏选项'])).toEqual(['强冲突']);
  });

  it('calculates score tiers and decision metrics in one model module', () => {
    expect(getWorkbenchPlotPointMetricClass(92)).toContain('amber');
    expect(getWorkbenchPlotPointMetricClass(84)).toContain('purple');
    expect(getWorkbenchPlotPointMetricClass(75)).toContain('sky');
    expect(getWorkbenchPlotPointMetricClass(60)).toContain('emerald');

    expect(getWorkbenchPlotPointDecisionMetrics(candidate, '91分', true, 1)).toEqual({
      clarity: 95,
      potential: 95,
      fit: 94,
    });
  });

  it('converts plot library items into chain candidates', () => {
    expect(
      plotLibraryItemToCandidate({
        id: 'p1',
        title: '反击模板',
        chapter: '第1章',
        novelTitle: '测试小说',
        content: '主角抓住敌人破绽，当场反击。',
        tags: ['爽点'],
        rating: 90,
        wordCount: 15,
        createdAt: '2026-06-08',
        updatedAt: '2026-06-08',
      }),
    ).toMatchObject({
      id: 'library:p1',
      title: '反击模板',
      source: '剧情库',
      variable: '爽点',
      score: '90',
    });
  });
});
