import { describe, expect, it } from 'vitest';

import {
  HOTSPOT_ANALYSIS_SYSTEM_PROMPT,
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
    expect(prompt).toContain('核心卖点');
    expect(prompt).toContain('金手指');
    expect(prompt).toContain('世界观');
  });

  it('adds fetched hotspot page details into the analysis prompt', () => {
    const prompt = buildHotspotSuitabilityPrompt(baiduItem, {
      ok: true,
      url: 'https://example.test/a',
      finalUrl: 'https://example.test/final',
      title: '网页里的完整标题',
      description: '网页摘要内容',
      keywords: ['情绪', '冲突'],
      textSnippet: '这里是网页正文片段，提供更多背景。',
    });

    expect(prompt).toContain('已获取热点链接内容');
    expect(prompt).toContain('网页里的完整标题');
    expect(prompt).toContain('网页摘要内容');
    expect(prompt).toContain('情绪、冲突');
    expect(prompt).toContain('这里是网页正文片段');
  });

  it('marks fallback analysis when detail fetching fails', () => {
    const prompt = buildHotspotSuitabilityPrompt(baiduItem, {
      ok: false,
      url: 'https://example.test/a',
      error: 'HTTP 403',
    });

    expect(prompt).toContain('未获取到热点详情');
    expect(prompt).toContain('仅基于标题推断');
    expect(prompt).toContain('HTTP 403');
  });

  it('provides a default hotspot analysis system prompt for adapting trends into web fiction genres', () => {
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('网络小说选题策划');
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('都市、玄幻、科幻、仙侠、灵异');
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('核心卖点');
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('金手指');
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('世界观');
    expect(HOTSPOT_ANALYSIS_SYSTEM_PROMPT).toContain('风险规避');
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
