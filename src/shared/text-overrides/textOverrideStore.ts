export const TEXT_OVERRIDES_KEY = 'xinyuexia_text_overrides_v1';
export const TEXT_OVERRIDE_UPDATED_EVENT = 'xinyuexia_text_override_updated';
export const TEXT_EDIT_MODE_EVENT = 'xinyuexia_text_edit_mode';

export interface TextOverrideItem {
  id: string;
  original: string;
  replacement: string;
  path: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TextOverrideUpdatedDetail = {
  changed?: {
    original: string;
    replacement: string;
    previousReplacement?: string;
  };
};

export function normalizeTextValue(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function createTextOverrideId(original: string) {
  return `text_${hashText(normalizeTextValue(original))}`;
}

export function readTextOverrides(): TextOverrideItem[] {
  try {
    const raw = localStorage.getItem(TEXT_OVERRIDES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Partial<TextOverrideItem> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : createTextOverrideId(String(item.original ?? '')),
        original: String(item.original ?? ''),
        replacement: String(item.replacement ?? ''),
        path: typeof item.path === 'string' ? item.path : '',
        enabled: item.enabled !== false,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toLocaleString('zh-CN'),
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toLocaleString('zh-CN'),
      }))
      .filter((item) => item.original.trim());
  } catch {
    return [];
  }
}

export function saveTextOverrides(items: TextOverrideItem[], detail?: TextOverrideUpdatedDetail) {
  localStorage.setItem(TEXT_OVERRIDES_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(TEXT_OVERRIDE_UPDATED_EVENT, { detail }));
}

export function upsertTextOverride(
  original: string,
  replacement: string,
  path = window.location.hash || window.location.pathname,
) {
  const normalizedOriginal = normalizeTextValue(original);
  const now = new Date().toLocaleString('zh-CN');
  const id = createTextOverrideId(normalizedOriginal);
  const items = readTextOverrides();
  const previous = items.find((item) => item.id === id);
  const exists = items.some((item) => item.id === id);
  const next = exists
    ? items.map((item) =>
        item.id === id
          ? { ...item, original: normalizedOriginal, replacement, path, enabled: true, updatedAt: now }
          : item,
      )
    : [
        {
          id,
          original: normalizedOriginal,
          replacement,
          path,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        },
        ...items,
      ];
  saveTextOverrides(next, {
    changed: {
      original: normalizedOriginal,
      replacement,
      previousReplacement: previous?.replacement,
    },
  });
  return next.find((item) => item.id === id)!;
}

export function removeTextOverride(id: string) {
  saveTextOverrides(readTextOverrides().filter((item) => item.id !== id));
}

export function setTextOverrideEnabled(id: string, enabled: boolean) {
  saveTextOverrides(
    readTextOverrides().map((item) =>
      item.id === id ? { ...item, enabled, updatedAt: new Date().toLocaleString('zh-CN') } : item,
    ),
  );
}

export function findTextOverrideByVisibleText(text: string) {
  const normalized = normalizeTextValue(text);
  return readTextOverrides().find(
    (item) => normalizeTextValue(item.original) === normalized || normalizeTextValue(item.replacement) === normalized,
  );
}

export function setTextEditMode(enabled: boolean) {
  localStorage.setItem(TEXT_EDIT_MODE_EVENT, enabled ? '1' : '0');
  window.dispatchEvent(new CustomEvent(TEXT_EDIT_MODE_EVENT, { detail: { enabled } }));
}

export function readTextEditMode() {
  return localStorage.getItem(TEXT_EDIT_MODE_EVENT) === '1';
}
