const fs = require('node:fs/promises');
const path = require('node:path');

const PUBLIC_BASE_URL = 'https://api-hot.imsyy.top';
const LOCAL_DAILYHOT_PORT = 36688;
const LOCAL_BASE_URL = `http://127.0.0.1:${LOCAL_DAILYHOT_PORT}`;
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_FETCH_LIMIT = 100;
const SOURCE_LABELS = {
  baidu: '百度',
  douyin: '抖音',
  weibo: '微博',
  zhihu: '知乎',
  bilibili: 'B站',
};
const DEFAULT_SOURCES = Object.keys(SOURCE_LABELS);

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function text(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeDailyHotItems(source, payload, capturedAt, limit = 50) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows
    .map((row, index) => {
      if (!isRecord(row)) return null;
      const title = text(row.title ?? row.name ?? row.word ?? row.keyword);
      if (!title) return null;
      const rank = Number(row.rank ?? row.index ?? index + 1);
      const heat = text(row.heat ?? row.hot ?? row.desc ?? row.value) || undefined;
      const url = text(row.url ?? row.mobileUrl ?? row.link) || undefined;
      const category = text(row.category ?? payload?.subtitle ?? row.type) || undefined;
      const normalizedRank = Number.isFinite(rank) ? rank : index + 1;
      return {
        id: `${source}-${normalizedRank}-${title}`,
        source,
        sourceName: SOURCE_LABELS[source] || source,
        rank: normalizedRank,
        title,
        heat,
        url,
        category,
        capturedAt,
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

function createCacheStore(cacheFile) {
  return {
    async read() {
      try {
        const raw = await fs.readFile(cacheFile, 'utf8');
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    async write(value) {
      await fs.mkdir(path.dirname(cacheFile), { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(value, null, 2), 'utf8');
    },
  };
}

let localServerPromise = null;

async function ensureLocalDailyHotServer() {
  if (!localServerPromise) {
    localServerPromise = import('dailyhot-api')
      .then(async (module) => {
        const serveHotApi = module.default;
        if (typeof serveHotApi === 'function') {
          serveHotApi(LOCAL_DAILYHOT_PORT);
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      })
      .catch(() => undefined);
  }
  return localServerPromise;
}

async function defaultFetchJson(url, options = {}) {
  if (options.ensureLocal) await ensureLocalDailyHotServer();
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'xinyuexia-hotspot/1.0',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function createHotspotService(options = {}) {
  const shouldUseEmbeddedServer = !options.baseUrl && !process.env.XINYUEXIA_DAILYHOT_BASE_URL;
  const baseUrl = (options.baseUrl || process.env.XINYUEXIA_DAILYHOT_BASE_URL || LOCAL_BASE_URL).replace(/\/+$/, '');
  const cacheTtlMs = Number(options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS);
  const now = options.now || (() => new Date().toISOString());
  const fetchJson = options.fetchJson || ((url) => defaultFetchJson(url, { ensureLocal: shouldUseEmbeddedServer }));
  const cacheStore = options.readCache && options.writeCache
    ? { read: options.readCache, write: options.writeCache }
    : createCacheStore(options.cacheFile || path.join(process.cwd(), 'runtime', 'hotspots', 'dailyhot-cache.json'));

  async function fetchAll(input = {}) {
    const sources = Array.isArray(input.sources) && input.sources.length > 0 ? input.sources : DEFAULT_SOURCES;
    const limit = Number.isFinite(Number(input.limit)) ? Math.max(1, Math.min(MAX_FETCH_LIMIT, Number(input.limit))) : 50;
    const force = Boolean(input.force);
    const cached = await cacheStore.read();
    const capturedAt = now();
    const cacheAge = cached?.capturedAt ? Date.parse(capturedAt) - Date.parse(cached.capturedAt) : Number.POSITIVE_INFINITY;
    if (!force && cached?.items?.length && cacheAge >= 0 && cacheAge < cacheTtlMs) {
      return {
        ok: true,
        capturedAt: cached.capturedAt,
        sources: groupItemsBySource(cached.items, sources),
        staleItems: cached.items,
        errors: {},
        fromCache: true,
      };
    }

    const sourceEntries = await Promise.all(sources.map(async (source) => {
      try {
        const payload = await fetchJson(`${baseUrl}/${source}`);
        return [source, normalizeDailyHotItems(source, payload, capturedAt, limit), null];
      } catch (error) {
        return [source, [], error instanceof Error ? error.message : 'fetch failed'];
      }
    }));

    const sourceMap = {};
    const errors = {};
    for (const [source, items, error] of sourceEntries) {
      sourceMap[source] = items;
      if (error) errors[source] = error;
    }
    const items = Object.values(sourceMap).flat();
    if (items.length > 0) {
      await cacheStore.write({ capturedAt, items });
    }

    return {
      ok: items.length > 0 && Object.keys(errors).length === 0,
      capturedAt,
      sources: sourceMap,
      staleItems: cached?.items ?? [],
      errors,
      fromCache: false,
    };
  }

  return { fetchAll };
}

function groupItemsBySource(items, sources) {
  const sourceMap = {};
  for (const source of sources) sourceMap[source] = [];
  for (const item of items) {
    if (!sourceMap[item.source]) sourceMap[item.source] = [];
    sourceMap[item.source].push(item);
  }
  return sourceMap;
}

module.exports = {
  createHotspotService,
  LOCAL_BASE_URL,
  PUBLIC_BASE_URL,
  normalizeDailyHotItems,
};
