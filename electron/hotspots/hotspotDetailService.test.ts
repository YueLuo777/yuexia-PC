import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { createHotspotDetailService, extractHotspotDetailFromHtml } =
  require('./hotspotDetailService.cjs') as typeof import('./hotspotDetailService.cjs');

describe('hotspotDetailService', () => {
  it('extracts title, description, keywords, and readable body text from html', () => {
    const detail = extractHotspotDetailFromHtml(
      `
      <html>
        <head>
          <title>页面标题</title>
          <meta name="description" content="这是一段热点摘要">
          <meta name="keywords" content="小说,热点,改编">
          <script>window.noise = true</script>
        </head>
        <body>
          <article>
            <h1>正文标题</h1>
            <p>第一段正文内容。</p>
            <p>第二段正文内容。</p>
          </article>
        </body>
      </html>
    `,
      'https://example.test/news',
    );

    expect(detail.ok).toBe(true);
    expect(detail.title).toBe('页面标题');
    expect(detail.description).toBe('这是一段热点摘要');
    expect(detail.keywords).toEqual(['小说', '热点', '改编']);
    expect(detail.textSnippet).toContain('第一段正文内容');
    expect(detail.textSnippet).not.toContain('window.noise');
  });

  it('fetches and caches hotspot detail pages', async () => {
    let fetchCount = 0;
    const service = createHotspotDetailService({
      lookupImpl: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => {
        fetchCount += 1;
        return {
          ok: true,
          status: 200,
          url: 'https://example.test/final',
          headers: { get: () => 'text/html; charset=utf-8' },
          text: async () => '<title>热点详情</title><meta name="description" content="详情摘要"><body>详情正文</body>',
        };
      },
    });

    const first = await service.fetchDetail({ url: 'https://example.test/news' });
    const second = await service.fetchDetail({ url: 'https://example.test/news' });

    expect(first.ok).toBe(true);
    expect(first.finalUrl).toBe('https://example.test/final');
    expect(first.description).toBe('详情摘要');
    expect(second.fromCache).toBe(true);
    expect(fetchCount).toBe(1);
  });

  it('blocks direct and DNS-resolved private network targets', async () => {
    let fetchCount = 0;
    const service = createHotspotDetailService({
      lookupImpl: async () => [{ address: '192.168.1.20', family: 4 }],
      fetchImpl: async () => {
        fetchCount += 1;
        return { ok: true };
      },
    });

    const direct = await service.fetchDetail({ url: 'http://127.0.0.1/admin' });
    const resolved = await service.fetchDetail({ url: 'https://internal.example.test/admin' });

    expect(direct).toMatchObject({ ok: false, error: '热点链接不能访问本机或内网地址' });
    expect(resolved).toMatchObject({ ok: false, error: '热点链接不能访问本机或内网地址' });
    expect(fetchCount).toBe(0);
  });

  it('validates every redirect before following it', async () => {
    let fetchCount = 0;
    const service = createHotspotDetailService({
      lookupImpl: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => {
        fetchCount += 1;
        return {
          ok: false,
          status: 302,
          url: 'https://example.test/start',
          headers: { get: (name: string) => (name === 'location' ? 'http://127.0.0.1/private' : '') },
        };
      },
    });

    const detail = await service.fetchDetail({ url: 'https://example.test/start' });

    expect(detail).toMatchObject({ ok: false, error: '热点链接不能访问本机或内网地址' });
    expect(fetchCount).toBe(1);
  });

  it('returns a fallback result when the hotspot has no usable link', async () => {
    const service = createHotspotDetailService();
    const detail = await service.fetchDetail({ url: '' });

    expect(detail.ok).toBe(false);
    expect(detail.error).toBe('无可用热点链接');
  });
});
