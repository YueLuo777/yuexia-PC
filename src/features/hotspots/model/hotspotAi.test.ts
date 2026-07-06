import { describe, expect, it } from 'vitest';

import {
  buildHotspotCombinationPrompt,
  buildHotspotSuitabilityPrompt,
  createHotspotBrainstormEntry,
} from '@/features/hotspots/model/hotspotAi';
import type { HotspotItem } from '@/features/hotspots/model/hotspotTypes';

const baiduItem: HotspotItem = {
  id: 'baidu-1',
  source: 'baidu',
  sourceName: '百度',
  rank: 1,
  title: '年轻人反向消费成趋势',
  heat: '500万',
  url: 'https://example.test/a',
  capturedAt: '2026-07-06T10:00:00.000Z',
};

const douyinItem: HotspotItem = {
  id: 'douyin-2',
  source: 'douyin',
  sourceName: '抖音',
  rank: 2,
  title: '普通人突然爆红后辞职',
  heat: '300万',
  url: 'https://example.test/b',
  capturedAt: '2026-07-06T10:00:00.000Z',
};

describe('hotspot AI prompts', () => {
  it('builds a single-hotspot prompt that scores fiction suitability without copying real events', () => {
    const prompt = buildHotspotSuitabilityPrompt(baiduItem);

    expect(prompt).toContain('小说适合度');
    expect(prompt).toContain('年轻人反向消费成趋势');
    expect(prompt).toContain('不要复述新闻');
    expect(prompt).toContain('不要影射真实人物');
    expect(prompt).toContain('0-100');
  });

  it('builds a multi-hotspot prompt for combining selected trends into a new fiction premise', () => {
    const prompt = buildHotspotCombinationPrompt([baiduItem, douyinItem]);

    expect(prompt).toContain('组合成一个新的小说题材');
    expect(prompt).toContain('百度 #1 年轻人反向消费成趋势');
    expect(prompt).toContain('抖音 #2 普通人突然爆红后辞职');
    expect(prompt).toContain('长篇网文');
  });

  it('formats AI output as a global brainstorm library entry', () => {
    const entry = createHotspotBrainstormEntry('热点小说方案', '适合度：88');

    expect(entry.tab).toBe('脑洞');
    expect(entry.title).toBe('热点小说方案');
    expect(entry.content).toContain('适合度：88');
  });
});
