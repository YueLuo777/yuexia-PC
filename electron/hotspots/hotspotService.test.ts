import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  createHotspotService,
  normalizeDailyHotItems,
} = require('./hotspotService.cjs') as typeof import('./hotspotService.cjs');

describe('hotspotService', () => {
  it('normalizes DailyHotApi response items into ranked hotspot rows', () => {
    expect(normalizeDailyHotItems('baidu', {
      code: 200,
      data: [
        { title: '热点 A', hot: '100万', url: 'https://example.test/a' },
        { name: '热点 B', desc: '说明', mobileUrl: 'https://example.test/b' },
      ],
    }, '2026-07-06T10:00:00.000Z')).toEqual([
      {
        id: 'baidu-1-热点 A',
        source: 'baidu',
        sourceName: '百度',
        rank: 1,
        title: '热点 A',
        heat: '100万',
        url: 'https://example.test/a',
        capturedAt: '2026-07-06T10:00:00.000Z',
      },
      {
        id: 'baidu-2-热点 B',
        source: 'baidu',
        sourceName: '百度',
        rank: 2,
        title: '热点 B',
        heat: '说明',
        url: 'https://example.test/b',
        capturedAt: '2026-07-06T10:00:00.000Z',
      },
    ]);
  });

  it('returns cached items when a source fetch fails', async () => {
    const service = createHotspotService({
      now: () => '2026-07-06T10:00:00.000Z',
      readCache: async () => ({
        capturedAt: '2026-07-06T09:00:00.000Z',
        items: [{
          id: 'baidu-1-cache',
          source: 'baidu',
          sourceName: '百度',
          rank: 1,
          title: '缓存热点',
          capturedAt: '2026-07-06T09:00:00.000Z',
        }],
      }),
      writeCache: async () => undefined,
      fetchJson: async () => {
        throw new Error('network down');
      },
    });

    const result = await service.fetchAll({ sources: ['baidu'], limit: 50, force: true });

    expect(result.ok).toBe(false);
    expect(result.staleItems).toHaveLength(1);
    expect(result.errors.baidu).toBe('network down');
  });

  it('uses the embedded local DailyHotApi base URL by default', async () => {
    const requestedUrls: string[] = [];
    const service = createHotspotService({
      now: () => '2026-07-06T10:00:00.000Z',
      readCache: async () => null,
      writeCache: async () => undefined,
      fetchJson: async (url: string) => {
        requestedUrls.push(url);
        return { code: 200, data: [{ title: '本地热点' }] };
      },
    });

    await service.fetchAll({ sources: ['baidu'], limit: 50, force: true });

    expect(requestedUrls).toEqual(['http://127.0.0.1:36688/baidu']);
  });
});
