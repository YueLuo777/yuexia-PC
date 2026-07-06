import type {
  HotspotFetchResult,
  HotspotItem,
  HotspotSourceId,
  HotspotSourceState,
  RawHotspotFetchResult,
} from '@/features/hotspots/model/hotspotTypes';

export const HOTSPOT_SOURCES: HotspotSourceId[] = ['baidu', 'douyin', 'weibo', 'zhihu', 'bilibili'];

export const HOTSPOT_SOURCE_LABELS: Record<HotspotSourceId, string> = {
  baidu: '百度',
  douyin: '抖音',
  weibo: '微博',
  zhihu: '知乎',
  bilibili: 'B站',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asText(value: unknown) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeItem(source: HotspotSourceId, value: unknown, index: number, capturedAt: string): HotspotItem | null {
  if (!isRecord(value)) return null;
  const title = asText(value.title ?? value.name ?? value.word ?? value.keyword);
  if (!title) return null;
  const rank = Number(value.rank ?? value.index ?? index + 1);
  const heat = asText(value.heat ?? value.hot ?? value.desc ?? value.value) || undefined;
  const url = asText(value.url ?? value.mobileUrl ?? value.link) || undefined;
  const category = asText(value.category ?? value.subtitle ?? value.type) || undefined;

  return {
    id: `${source}-${Number.isFinite(rank) ? rank : index + 1}-${title}`,
    source,
    sourceName: HOTSPOT_SOURCE_LABELS[source],
    rank: Number.isFinite(rank) ? rank : index + 1,
    title,
    heat,
    url,
    category,
    capturedAt,
  };
}

function normalizeSourceItems(source: HotspotSourceId, values: unknown[] | undefined, capturedAt: string) {
  return (values ?? [])
    .map((value, index) => normalizeItem(source, value, index, capturedAt))
    .filter((item): item is HotspotItem => Boolean(item))
    .slice(0, 50);
}

export function normalizeHotspotFetchResult(raw: RawHotspotFetchResult): HotspotFetchResult {
  const sourceStates = {} as Record<HotspotSourceId, HotspotSourceState>;
  const freshItems: HotspotItem[] = [];

  for (const source of HOTSPOT_SOURCES) {
    const sourceItems = normalizeSourceItems(source, raw.sources[source], raw.capturedAt);
    if (sourceItems.length > 0) {
      freshItems.push(...sourceItems);
      sourceStates[source] = { ok: true, count: sourceItems.length };
      continue;
    }
    const message = raw.errors?.[source];
    sourceStates[source] = {
      ok: false,
      count: 0,
      message: message || '暂无数据',
    };
  }

  const items = freshItems.length > 0 ? freshItems : raw.staleItems ?? [];
  return {
    ok: raw.ok,
    capturedAt: raw.capturedAt,
    items,
    sourceStates,
    stale: freshItems.length === 0 && (raw.staleItems?.length ?? 0) > 0,
  };
}

export async function fetchHotspots(force = false): Promise<HotspotFetchResult> {
  const raw = await window.xinyuexiaHotspots?.fetchAll({
    sources: HOTSPOT_SOURCES,
    limit: 50,
    force,
  });
  if (!raw) {
    return normalizeHotspotFetchResult({
      ok: false,
      capturedAt: new Date().toISOString(),
      sources: {},
      errors: Object.fromEntries(HOTSPOT_SOURCES.map((source) => [source, '当前环境没有热点采集服务'])) as Partial<Record<HotspotSourceId, string>>,
    });
  }
  return normalizeHotspotFetchResult(raw);
}
