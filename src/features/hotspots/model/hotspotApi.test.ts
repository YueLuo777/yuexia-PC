import { describe, expect, it } from 'vitest';

import {
  HOTSPOT_SOURCE_LABELS,
  HOTSPOT_SOURCES,
  normalizeHotspotFetchResult,
} from '@/features/hotspots/model/hotspotApi';

describe('hotspot API normalization', () => {
  it('keeps the first 50 normalized items for supported DailyHotApi sources', () => {
    const result = normalizeHotspotFetchResult({
      ok: true,
      capturedAt: '2026-07-06T10:00:00.000Z',
      sources: {
        baidu: Array.from({ length: 55 }, (_, index) => ({
          rank: index + 1,
          title: `百度热点 ${index + 1}`,
          heat: `${index + 1}万`,
          url: `https://example.test/${index + 1}`,
        })),
      },
    });

    expect(result.items).toHaveLength(50);
    expect(result.items[0]).toMatchObject({
      id: 'baidu-1-百度热点 1',
      source: 'baidu',
      sourceName: HOTSPOT_SOURCE_LABELS.baidu,
      rank: 1,
      title: '百度热点 1',
      heat: '1万',
    });
    expect(result.sourceStates.baidu).toMatchObject({ ok: true, count: 50 });
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
});
