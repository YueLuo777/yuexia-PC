const dns = require('node:dns').promises;
const net = require('node:net');

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_HTML_LENGTH = 800000;
const MAX_TEXT_LENGTH = 3200;
const MAX_URL_LENGTH = 2048;
const MAX_REDIRECTS = 5;

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

function isPrivateIpv4Address(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [first, second, third] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && (third === 0 || third === 2)) ||
    (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
    (first === 203 && second === 0 && third === 113)
  );
}

function isPrivateNetworkAddress(address) {
  const normalized = asText(address)
    .toLowerCase()
    .replace(/^\[|\]$/g, '');
  const ipVersion = net.isIP(normalized);
  if (ipVersion === 4) return isPrivateIpv4Address(normalized);
  if (ipVersion !== 6) return true;
  if (normalized.startsWith('::ffff:')) return isPrivateIpv4Address(normalized.slice('::ffff:'.length));
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:')
  );
}

async function validatePublicHotspotUrl(value, lookupImpl = dns.lookup) {
  const raw = asText(value);
  if (!raw || raw.length > MAX_URL_LENGTH) return { ok: false, error: '热点链接无效' };
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: '热点链接无效' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
    return { ok: false, error: '热点链接只允许公开的 HTTP 或 HTTPS 地址' };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { ok: false, error: '热点链接不能访问本机或内网地址' };
  }

  const ipVersion = net.isIP(hostname);
  if (ipVersion && isPrivateNetworkAddress(hostname)) {
    return { ok: false, error: '热点链接不能访问本机或内网地址' };
  }
  if (!ipVersion) {
    let addresses;
    try {
      const result = await lookupImpl(hostname, { all: true, verbatim: true });
      addresses = Array.isArray(result) ? result : [result];
    } catch {
      return { ok: false, error: '热点链接域名无法解析' };
    }
    if (addresses.length === 0 || addresses.some((item) => !item?.address || isPrivateNetworkAddress(item.address))) {
      return { ok: false, error: '热点链接不能访问本机或内网地址' };
    }
  }
  return { ok: true, url: parsed.toString() };
}

function readTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? normalizeSpace(match[1]) : '';
}

function readMetaContent(html, names) {
  for (const name of names) {
    const propertyPattern = new RegExp(
      `<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*content=["']([^"']*)["'][^>]*>`,
      'i',
    );
    const contentPattern = new RegExp(
      `<meta\\b(?=[^>]*content=["']([^"']*)["'])[^>]*(?:name|property)=["']${name}["'][^>]*>`,
      'i',
    );
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
  const lookupImpl = options.lookupImpl || dns.lookup;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  async function fetchDetail(input = {}) {
    const url = asText(input.url || input.item?.url);
    if (!url) {
      return { ok: false, url, error: '无可用热点链接' };
    }
    if (typeof fetchImpl !== 'function') {
      return { ok: false, url, error: '当前环境不支持网页抓取' };
    }

    const initialValidation = await validatePublicHotspotUrl(url, lookupImpl);
    if (!initialValidation.ok) return { ok: false, url, error: initialValidation.error };
    if (cache.has(initialValidation.url)) return { ...cache.get(initialValidation.url), fromCache: true };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let currentUrl = initialValidation.url;
      let response;
      for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
        response = await fetchImpl(currentUrl, {
          signal: controller.signal,
          redirect: 'manual',
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) YuexiaHotspotBot/1.0',
          },
        });
        const status = Number(response?.status) || 0;
        if (status < 300 || status >= 400) break;
        if (redirectCount === MAX_REDIRECTS) {
          return { ok: false, url, finalUrl: currentUrl, error: '热点详情跳转次数过多' };
        }
        const location = response.headers?.get?.('location');
        if (!location) return { ok: false, url, finalUrl: currentUrl, error: '热点详情跳转地址无效' };
        const redirectedUrl = new URL(location, currentUrl).toString();
        const redirectValidation = await validatePublicHotspotUrl(redirectedUrl, lookupImpl);
        if (!redirectValidation.ok) return { ok: false, url, finalUrl: currentUrl, error: redirectValidation.error };
        currentUrl = redirectValidation.url;
      }
      if (!response?.ok) {
        return { ok: false, url, finalUrl: response?.url || url, error: `HTTP ${response?.status || '失败'}` };
      }

      const responseUrl = response.url || currentUrl;
      const responseUrlValidation = await validatePublicHotspotUrl(responseUrl, lookupImpl);
      if (!responseUrlValidation.ok)
        return { ok: false, url, finalUrl: currentUrl, error: responseUrlValidation.error };

      const contentType = String(response.headers?.get?.('content-type') || '');
      if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
        return { ok: false, url, finalUrl: response.url || url, error: `不支持的页面类型：${contentType}` };
      }

      const html = await response.text();
      const detail = {
        ...extractHotspotDetailFromHtml(html, url),
        finalUrl: responseUrlValidation.url,
      };
      cache.set(initialValidation.url, detail);
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
  isPrivateNetworkAddress,
  validatePublicHotspotUrl,
};
