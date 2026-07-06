export type HotspotSourceId = 'baidu' | 'douyin' | 'weibo' | 'zhihu' | 'bilibili';

export interface HotspotItem {
  id: string;
  source: HotspotSourceId;
  sourceName: string;
  rank: number;
  title: string;
  heat?: string;
  url?: string;
  category?: string;
  capturedAt: string;
}

export interface HotspotSourceState {
  ok: boolean;
  count: number;
  message?: string;
}

export interface RawHotspotFetchResult {
  ok: boolean;
  capturedAt: string;
  sources: Partial<Record<HotspotSourceId, unknown[]>>;
  staleItems?: HotspotItem[];
  errors?: Partial<Record<HotspotSourceId, string>>;
}

export interface HotspotFetchResult {
  ok: boolean;
  capturedAt: string;
  items: HotspotItem[];
  sourceStates: Record<HotspotSourceId, HotspotSourceState>;
  stale: boolean;
}

export interface HotspotDetailResult {
  ok: boolean;
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  textSnippet?: string;
  error?: string;
  fromCache?: boolean;
}
