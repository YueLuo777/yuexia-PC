export type CatalogMark = 'rare';

export const CATALOG_NAV_COLLAPSED_STORAGE_KEY = 'xinyuexia_software_ui_catalog_nav_collapsed_v1';
export const CATALOG_CONTENT_COLLAPSED_STORAGE_KEY = 'xinyuexia_software_ui_catalog_content_collapsed_v1';

const CATALOG_MARKS_STORAGE_KEY = 'xinyuexia_software_ui_catalog_marks_v1';
const CATALOG_COLLECTION_STORAGE_KEY = 'xinyuexia_software_ui_catalog_collection_v1';
export const DEFAULT_CATALOG_COLLECTION_IDS = ['UI-140', 'UI-141', 'UI-142', 'UI-143'];

export function readCatalogMarks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CATALOG_MARKS_STORAGE_KEY) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, CatalogMark>>(
      (acc, [key, value]) => {
        if (value === 'rare') acc[key] = value;
        return acc;
      },
      {},
    );
  } catch {
    return {};
  }
}

export function writeCatalogMarks(value: Record<string, CatalogMark>) {
  localStorage.setItem(CATALOG_MARKS_STORAGE_KEY, JSON.stringify(value));
}

export function readCatalogCollection() {
  const defaults = DEFAULT_CATALOG_COLLECTION_IDS.reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
  try {
    const parsed = JSON.parse(localStorage.getItem(CATALOG_COLLECTION_STORAGE_KEY) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return defaults;
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>(
      (acc, [key, value]) => {
        if (typeof value === 'boolean') acc[key] = value;
        return acc;
      },
      { ...defaults },
    );
  } catch {
    return defaults;
  }
}

export function writeCatalogCollection(value: Record<string, boolean>) {
  localStorage.setItem(CATALOG_COLLECTION_STORAGE_KEY, JSON.stringify(value));
}

export function readCollapsedRecord(storageKey: string, fallback: Record<string, boolean> = {}) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return fallback;
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>(
      (acc, [key, value]) => {
        if (typeof value === 'boolean') acc[key] = value;
        return acc;
      },
      { ...fallback },
    );
  } catch {
    return fallback;
  }
}

export function writeCollapsedRecord(storageKey: string, value: Record<string, boolean>) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}
