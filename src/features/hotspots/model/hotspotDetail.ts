import { getHotspotExternalUrl } from '@/features/hotspots/model/hotspotApi';
import type { HotspotDetailResult, HotspotItem } from '@/features/hotspots/model/hotspotTypes';

export function hasHotspotDetailContent(detail: HotspotDetailResult | null | undefined) {
  return Boolean(
    detail?.ok && (
      detail.title?.trim()
      || detail.description?.trim()
      || detail.textSnippet?.trim()
      || (detail.keywords?.length ?? 0) > 0
    ),
  );
}

export async function fetchHotspotDetail(item: HotspotItem): Promise<HotspotDetailResult> {
  const url = getHotspotExternalUrl(item);
  const detail = await window.xinyuexiaHotspots?.fetchDetail({ item, url });
  if (!detail) {
    return { ok: false, url, error: '当前环境没有热点详情采集服务' };
  }
  return detail;
}
