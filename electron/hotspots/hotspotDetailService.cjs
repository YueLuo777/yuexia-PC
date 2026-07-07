const DEFAULT_TIMEOUT_MS = 12000;
const MAX_HTML_LENGTH = 800000;
const MAX_TEXT_LENGTH = 3200;

function asText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function decodeHtmlEntities(value) {
  return asText(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => {
      const point = Number(code);
      return Number.isFinite(point) ? String.fromCodePoint(point) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => {
      const point = Number.parseInt(code, 16);
      return Number.isFinite(point) ? String.fromCodePoint(point) : '';
    });
}

function normalizeSpace(value) {
  return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLength) {
  const text = asText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function readTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? normalizeSpace(match[1]) : '';
}

function readMetaContent(html, names) {
  for (const name of names) {
    const propertyPattern = new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*content=["']([^"']*)["'][^>]*>`, 'i');
    const contentPattern = new RegExp(`<meta\\b(?=[^>]*content=["']([^"']*)["'])[^>]*(?:name|property)=["']${name}["'][^>]*>`, 'i');
    const match = html.match(propertyPattern) || html.match(contentPattern);
    if (match?.[1]) return normalizeSpace(match[1]);
  }
  return '';
}

function stripHtmlToText(html) {
  return normalizeSpace(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function extractHotspotDetailFromHtml(html, url) {
  const limitedHtml = asText(html).slice(0, MAX_HTML_LENGTH);
  const title = readMetaContent(limitedHtml, ['og:title', 'twitter:title']) || readTagContent(limitedHtml, 'title');
  const description = readMetaContent(limitedHtml, ['description', 'og:description', 'twitter:description']);
  const keywordText = readMetaContent(limitedHtml, ['keywords', 'news_keywords']);
  const keywords = keywordText
    .split(/[,，、;；\s]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 12);
  const bodyText = stripHtmlToText(limitedHtml);

  return {
    ok: Boolean(title || description || bodyText),
    url,
    title: truncate(title, 180) || undefined,
    description: truncate(description, 600) || undefined,
    keywords,
    textSnippet: truncate(bodyText, MAX_TEXT_LENGTH) || undefined,
  };
}

function createHotspotDetailService(options = {}) {
  const cache = new Map();
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  async function fetchDetail(input = {}) {
    const url = asText(input.url || input.item?.url);
    if (!/^https?:\/\//i.test(url)) {
      return { ok: false, url, error: '无可用热点链接' };
    }
    if (cache.has(url)) return { ...cache.get(url), fromCache: true };
    if (typeof fetchImpl !== 'function') {
      return { ok: false, url, error: '当前环境不支持网页抓取' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) YuexiaHotspotBot/1.0',
        },
      });
      if (!response?.ok) {
        return { ok: false, url, finalUrl: response?.url || url, error: `HTTP ${response?.status || '失败'}` };
      }

      const contentType = String(response.headers?.get?.('content-type') || '');
      if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
        return { ok: false, url, finalUrl: response.url || url, error: `不支持的页面类型：${contentType}` };
      }

      const html = await response.text();
      const detail = {
        ...extractHotspotDetailFromHtml(html, url),
        finalUrl: response.url || url,
      };
      cache.set(url, detail);
      return detail;
    } catch (error) {
      const message = error?.name === 'AbortError' ? '热点详情抓取超时' : error?.message || '热点详情抓取失败';
      return { ok: false, url, error: message };
    } finally {
      clearTimeout(timer);
    }
  }

  return { fetchDetail };
}

module.exports = {
  createHotspotDetailService,
  extractHotspotDetailFromHtml,
};
