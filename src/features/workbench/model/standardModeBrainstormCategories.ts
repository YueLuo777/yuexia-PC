import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';

export type StandardBrainstormCategory = {
  id: string;
  name: string;
  isExpanded: boolean;
};

export const BRAINSTORM_UNCATEGORIZED_ID = 'brainstorm-category-uncategorized';
export const BRAINSTORM_CATEGORY_STORAGE_KEY = 'xinyuexia_global_brainstorm_categories_v1';
export const BRAINSTORM_CATEGORIES_UPDATED_EVENT = 'xinyuexia_brainstorm_categories_updated';

export const BRAINSTORM_UNCATEGORIZED_CATEGORY: StandardBrainstormCategory = {
  id: BRAINSTORM_UNCATEGORIZED_ID,
  name: '未分类',
  isExpanded: true,
};

function normalizeStoredCategory(value: unknown): StandardBrainstormCategory | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<StandardBrainstormCategory>;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name || id === BRAINSTORM_UNCATEGORIZED_ID) return null;
  return { id, name, isExpanded: raw.isExpanded !== false };
}

export function normalizeBrainstormCategories(value: unknown): StandardBrainstormCategory[] {
  const reservedValue = Array.isArray(value)
    ? value.find(
        (category) =>
          category &&
          typeof category === 'object' &&
          (category as Partial<StandardBrainstormCategory>).id === BRAINSTORM_UNCATEGORIZED_ID,
      ) as Partial<StandardBrainstormCategory> | undefined
    : undefined;
  const uncategorized = {
    ...BRAINSTORM_UNCATEGORIZED_CATEGORY,
    isExpanded: reservedValue?.isExpanded !== false,
  };
  const stored = Array.isArray(value)
    ? value.map(normalizeStoredCategory).filter((category): category is StandardBrainstormCategory => Boolean(category))
    : [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>([BRAINSTORM_UNCATEGORIZED_CATEGORY.name]);
  const categories = stored.filter((category): category is StandardBrainstormCategory => {
    if (seenIds.has(category.id) || seenNames.has(category.name)) return false;
    seenIds.add(category.id);
    seenNames.add(category.name);
    return true;
  });
  return [uncategorized, ...categories];
}

export function readBrainstormCategories() {
  if (typeof localStorage === 'undefined') return [BRAINSTORM_UNCATEGORIZED_CATEGORY];
  try {
    return normalizeBrainstormCategories(JSON.parse(localStorage.getItem(BRAINSTORM_CATEGORY_STORAGE_KEY) ?? '[]'));
  } catch {
    return [BRAINSTORM_UNCATEGORIZED_CATEGORY];
  }
}

export function writeBrainstormCategories(categories: StandardBrainstormCategory[]) {
  const normalized = normalizeBrainstormCategories(categories);
  localStorage.setItem(BRAINSTORM_CATEGORY_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(BRAINSTORM_CATEGORIES_UPDATED_EVENT));
  return normalized;
}

export function createBrainstormCategory(name: string): StandardBrainstormCategory {
  return {
    id: `brainstorm-category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    isExpanded: true,
  };
}

export function getBrainstormEntryCategoryId(
  entry: WorkbenchLibraryEntry,
  categories: StandardBrainstormCategory[],
) {
  const categoryId = entry.brainstormCategoryId?.trim();
  return categoryId && categories.some((category) => category.id === categoryId)
    ? categoryId
    : BRAINSTORM_UNCATEGORIZED_ID;
}
