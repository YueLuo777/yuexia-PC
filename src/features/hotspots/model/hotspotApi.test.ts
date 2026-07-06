import { describe, expect, it } from 'vitest';

import {
  HOTSPOT_FETCH_LIMIT,
  HOTSPOT_SOURCE_LABELS,
  HOTSPOT_SOURCES,
  fetchHotspots,
  getHotspotExternalUrl,
  normalizeHotspotFetchResult,
} from '@/features/hotspots/model/hotspotApi';

describe('hotspot API normalization', () => {
  it('keeps up to 100 candidates for supported DailyHotApi sources', () => {
    const result = normalizeHotspotFetchResult({
      ok: true,
      capturedAt: '2026-07-06T10:00:00.000Z',
      sources: {
        baidu: Array.from({ length: 120 }, (_, index) => ({
          rank: index + 1,
          title: `百度热点 ${index + 1}`,
          heat: `${index + 1}万`,
          url: `https://example.test/${index + 1}`,
        })),
      },
    });

    expect(result.items).toHaveLength(HOTSPOT_FETCH_LIMIT);
    expect(result.items[0]).toMatchObject({
      id: 'baidu-1-百度热点 1',
      source: 'baidu',
      sourceName: HOTSPOT_SOURCE_LABELS.baidu,
      rank: 1,
      title: '百度热点 1',
      heat: '1万',
    });
    expect(result.sourceStates.baidu).toMatchObject({ ok: true, count: HOTSPOT_FETCH_LIMIT });
  });

  it('creates failed source states while preserving stale cached items', () => {
    const result = normalizeHotspotFetchResult({
      ok: false,
      capturedAt: '2026-07-06T10:00:00.000Z',
      sources: {},
      staleItems: [{
        id: 'baidu-1-cache',
        source: 'baidu',
        sourceName: '百度',
        rank: 1,
        title: '缓存热点',
        capturedAt: '2026-07-05T10:00:00.000Z',
      }],
      errors: { douyin: 'request failed' },
    });

    expect(result.items).toHaveLength(1);
    expect(result.sourceStates.douyin).toMatchObject({
      ok: false,
      message: 'request failed',
    });
  });

  it('uses the first release sources requested for the feature', () => {
    expect(HOTSPOT_SOURCES).toEqual(['baidu', 'douyin', 'weibo', 'zhihu', 'bilibili']);
  });

  it('requests 100 candidates so rule filtering can still display 50 high-score items', async () => {
    let requestedLimit = 0;
    const previous = window.xinyuexiaHotspots;
    window.xinyuexiaHotspots = {
      fetchAll: async (input) => {
        requestedLimit = Number(input?.limit);
        return {
          ok: true,
          capturedAt: '2026-07-07T00:00:00.000Z',
          sources: {},
        };
      },
    };

    try {
      await fetchHotspots(true);
    } finally {
      window.xinyuexiaHotspots = previous;
    }

    expect(requestedLimit).toBe(HOTSPOT_FETCH_LIMIT);
  });

  it('opens direct hotspot links or falls back to platform search pages', () => {
    expect(getHotspotExternalUrl({
      id: 'baidu-1-link',
      source: 'baidu',
      sourceName: '百度',
      rank: 1,
      title: '热点标题',
      url: 'https://example.test/hot',
      capturedAt: '2026-07-07T00:00:00.000Z',
    })).toBe('https://example.test/hot');

    expect(getHotspotExternalUrl({
      id: 'baidu-2-search',
      source: 'baidu',
      sourceName: '百度',
      rank: 2,
      title: '这条热点是什么意思',
      capturedAt: '2026-07-07T00:00:00.000Z',
    })).toBe(`https://www.baidu.com/s?wd=${encodeURIComponent('这条热点是什么意思')}`);

    expect(getHotspotExternalUrl({
      id: 'weibo-3-search',
      source: 'weibo',
      sourceName: '微博',
      rank: 3,
      title: '微博热搜话题',
      capturedAt: '2026-07-07T00:00:00.000Z',
    })).toBe(`https://s.weibo.com/weibo?q=${encodeURIComponent('微博热搜话题')}`);
  });
});
