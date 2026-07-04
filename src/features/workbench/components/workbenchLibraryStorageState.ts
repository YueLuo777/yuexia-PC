import { DETAIL_OUTLINE_PUBLISHED_GROUP_NAME } from './workbenchDetailOutlineState';
import {
  BRAINSTORM_PREVIEW_MAX_WIDTH,
  BRAINSTORM_PREVIEW_MIN_WIDTH,
  BRAINSTORM_PREVIEW_WIDTH,
  OUTLINE_ACTION_RIGHT_MIN_WIDTH,
  OUTLINE_LEFT_MAX_DISPLAY_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_WIDTH,
  PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
  PLOT_POINT_LAYOUT_TREE_MIN_WIDTH,
  PLOT_POINT_LAYOUT_TREE_WIDTH,
  SETTING_LIBRARY_LEFT_MAX_WIDTH,
  SETTING_LIBRARY_LEFT_MIN_WIDTH,
  SETTING_LIBRARY_LEFT_WIDTH,
  SETTING_LIBRARY_RIGHT_MAX_WIDTH,
  SETTING_LIBRARY_RIGHT_MIN_WIDTH,
  SETTING_LIBRARY_RIGHT_WIDTH,
  SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH,
} from './workbenchLibraryPanelConstants';
import {
  DETAIL_OUTLINE_TAB,
  OUTLINE_LIBRARY_TAB,
  SETTING_TAB,
  UNCATEGORIZED_TYPE,
  normalizeTabName,
} from './workbenchLibraryTabs';

export function getTabConfigsStorageKey(storageKey: string) {
  return `${storageKey}_tab_configs_v1`;
}

export function getActiveTabStorageKey(storageKey: string) {
  return `${storageKey}_active_tab`;
}

export function readActiveTab(storageKey: string, tabs: string[], defaultActiveTab?: string) {
  const normalizedDefault = normalizeTabName(defaultActiveTab ?? '');
  if (tabs.includes(normalizedDefault)) return normalizedDefault;
  try {
    const stored = normalizeTabName(localStorage.getItem(getActiveTabStorageKey(storageKey)) ?? '');
    if (tabs.includes(stored)) return stored;
  } catch {
    // Ignore localStorage failures and fall back to the supplied default.
  }
  return tabs[0] ?? '';
}

export function getSettingLibraryWidthStorageKey(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview') {
  return `${storageKey}_${normalizeTabName(tab)}_${side}_width`;
}

export function getExpandedStringSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

export function readExpandedStringSet(storageKey: string, tab: string, name: string, fallback: string[] = [UNCATEGORIZED_TYPE]) {
  try {
    const raw = localStorage.getItem(getExpandedStringSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as string[] : fallback;
    const values = parsed.filter((item) => typeof item === 'string' && item.trim());
    return new Set(values.length > 0 ? values : fallback);
  } catch {
    return new Set(fallback);
  }
}

export function persistExpandedStringSet(storageKey: string, tab: string, name: string, values: Set<string>) {
  localStorage.setItem(getExpandedStringSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

export function getExpandedNumberSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

export function readExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    const raw = localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as number[] : [];
    return new Set(parsed.filter((item) => Number.isFinite(item)));
  } catch {
    return new Set<number>();
  }
}

export function hasStoredExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    return localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name)) !== null;
  } catch {
    return false;
  }
}

export function persistExpandedNumberSet(storageKey: string, tab: string, name: string, values: Set<number>) {
  localStorage.setItem(getExpandedNumberSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

export function getManualDetailOutlinePublishedStorageKey(storageKey: string) {
  return `${storageKey}_${DETAIL_OUTLINE_PUBLISHED_GROUP_NAME}_v1`;
}

export function readManualDetailOutlinePublishedChapterIds(storageKey: string) {
  try {
    const raw = localStorage.getItem(getManualDetailOutlinePublishedStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as number[] : [];
    return new Set(parsed.filter((item) => Number.isFinite(item)));
  } catch {
    return new Set<number>();
  }
}

export function persistManualDetailOutlinePublishedChapterIds(storageKey: string, values: Set<number>) {
  localStorage.setItem(getManualDetailOutlinePublishedStorageKey(storageKey), JSON.stringify([...values]));
}

export function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1) {
  if (typeof window === 'undefined') return SETTING_LIBRARY_LEFT_MAX_WIDTH;
  const normalizedScale = Number.isFinite(scaleValue) && scaleValue > 0 ? scaleValue : 1;
  const isOutlineActionTab = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB;
  const isSettingTab = tab === SETTING_TAB;
  const minWidth = isSettingTab ? SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH : SETTING_LIBRARY_LEFT_MIN_WIDTH;
  const viewportDivider = isSettingTab ? 2 : isOutlineActionTab ? 2.5 : 5;
  const viewportLimitWidth = Math.floor(window.innerWidth / normalizedScale / viewportDivider);
  const fixedMaxWidth = isSettingTab
    ? SETTING_LIBRARY_LEFT_MAX_WIDTH
    : isOutlineActionTab
      ? OUTLINE_LEFT_MAX_DISPLAY_WIDTH
      : SETTING_LIBRARY_LEFT_MAX_WIDTH;
  return Math.max(
    minWidth,
    Math.min(fixedMaxWidth, viewportLimitWidth),
  );
}

export function getDetailOutlineLeftMinWidth(scaleValue = 1) {
  if (typeof window === 'undefined') return SETTING_LIBRARY_LEFT_MIN_WIDTH;
  const normalizedScale = Number.isFinite(scaleValue) && scaleValue > 0 ? scaleValue : 1;
  const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);
  return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);
}

export function getSettingLibraryLeftMinWidth(tab: string, scaleValue = 1) {
  if (tab === SETTING_TAB) return SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH;
  return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
    ? getDetailOutlineLeftMinWidth(scaleValue)
    : SETTING_LIBRARY_LEFT_MIN_WIDTH;
}

export function clampSettingLibraryLeftWidth(value: number, tab: string, scaleValue = 1) {
  const minWidth = getSettingLibraryLeftMinWidth(tab, scaleValue);
  const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));
  return Math.min(maxWidth, Math.max(minWidth, value));
}

export function readSettingLibraryLeftWidth(storageKey: string, tab: string, scaleValue = 1) {
  const fallbackWidth = clampSettingLibraryLeftWidth(SETTING_LIBRARY_LEFT_WIDTH, tab, scaleValue);
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'left')) ?? SETTING_LIBRARY_LEFT_WIDTH);
    if (!Number.isFinite(value)) return fallbackWidth;
    return clampSettingLibraryLeftWidth(value, tab, scaleValue);
  } catch {
    return fallbackWidth;
  }
}

export function readSettingLibraryRightWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'right')) ?? SETTING_LIBRARY_RIGHT_WIDTH);
    const minWidth = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
      ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
      : SETTING_LIBRARY_RIGHT_MIN_WIDTH;
    if (!Number.isFinite(value)) return minWidth;
    return Math.min(SETTING_LIBRARY_RIGHT_MAX_WIDTH, Math.max(minWidth, value));
  } catch {
    return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
      ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
      : SETTING_LIBRARY_RIGHT_WIDTH;
  }
}

export function readBrainstormPreviewWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'brainstormPreview')) ?? BRAINSTORM_PREVIEW_WIDTH);
    if (!Number.isFinite(value)) return BRAINSTORM_PREVIEW_WIDTH;
    return Math.min(BRAINSTORM_PREVIEW_MAX_WIDTH, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, value));
  } catch {
    return BRAINSTORM_PREVIEW_WIDTH;
  }
}

export function persistSettingLibraryWidth(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview', value: number) {
  localStorage.setItem(getSettingLibraryWidthStorageKey(storageKey, tab, side), String(value));
}

export function getPlotPointLayoutWidthStorageKey(storageKey: string, side: 'tree' | 'left' | 'right') {
  return `${storageKey}_plot_point_layout_${side}_width_v1`;
}

export function readPlotPointLayoutTreeWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'tree')) ?? PLOT_POINT_LAYOUT_TREE_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_TREE_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_TREE_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_TREE_WIDTH;
  }
}

export function readPlotPointLayoutLeftWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'left')) ?? PLOT_POINT_LAYOUT_LEFT_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_LEFT_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_LEFT_WIDTH;
  }
}

export function readPlotPointLayoutRightWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'right')) ?? PLOT_POINT_LAYOUT_RIGHT_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_RIGHT_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_RIGHT_WIDTH;
  }
}

export function persistPlotPointLayoutWidth(storageKey: string, side: 'tree' | 'left' | 'right', value: number) {
  localStorage.setItem(getPlotPointLayoutWidthStorageKey(storageKey, side), String(value));
}
