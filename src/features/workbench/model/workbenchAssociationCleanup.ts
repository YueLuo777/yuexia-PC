export const ASSOCIATED_CHAPTERS_KEY = 'xinyuexia_associated_chapters';
export const CHAPTER_ASSOCIATE_UPDATED_EVENT = 'chapter_associate_updated';
const WORKBENCH_LINKED_CONTEXT_KEY_PREFIX = 'xinyuexia_workbench_linked_context_';

export type StoredWorkbenchLinkedContextItem = {
  id: string;
  source: 'setting' | 'role' | 'outline' | 'summary' | 'chapter';
  group: string;
  title: string;
  content: string;
};

function safeReadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWriteJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

export function clearAssociatedChapters() {
  try {
    localStorage.removeItem(ASSOCIATED_CHAPTERS_KEY);
  } catch {
    // Ignore storage failures.
  }
  window.dispatchEvent(new CustomEvent(CHAPTER_ASSOCIATE_UPDATED_EVENT));
}

export function clearWorkbenchAiSessionLinksByStorageKey(storageKey: string) {
  const stored = safeReadJson<{
    sessions?: unknown;
    activeSessionId?: number;
    nextSessionId?: number;
    nextMessageId?: number;
  }>(storageKey);
  if (!stored || !Array.isArray(stored.sessions)) return;

  let changed = false;
  const sessions = stored.sessions.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const session = item as { linkChapter?: unknown; hasSentChapterContext?: unknown };
    if (!session.linkChapter && !session.hasSentChapterContext) return item;
    changed = true;
    return {
      ...item,
      linkChapter: false,
      hasSentChapterContext: false,
    };
  });

  if (!changed) return;
  safeWriteJson(storageKey, {
    ...stored,
    sessions,
  });
}

export function clearWorkbenchAiSessionLinks(workId: number | string) {
  clearWorkbenchAiSessionLinksByStorageKey(`xinyuexia_workbench_ai_sessions_${workId}`);
}

export function clearWorkbenchLinkedBrainstorm(storageKey: string) {
  const tabConfigStorageKey = `${storageKey}_tab_configs_v1`;
  const stored = safeReadJson<Record<string, Record<string, unknown>>>(tabConfigStorageKey);
  if (!stored || typeof stored !== 'object') return;

  let changed = false;
  const next = Object.fromEntries(
    Object.entries(stored).map(([tab, config]) => {
      if (!config || typeof config !== 'object') return [tab, config];
      const hasLinkedBrainstorm = (
        'loadedBrainstormId' in config
        || 'loadedBrainstormTitle' in config
        || 'loadedBrainstormText' in config
      );
      if (!hasLinkedBrainstorm) return [tab, config];
      changed = true;
      return [tab, {
        ...config,
        loadedBrainstormId: null,
        loadedBrainstormTitle: '',
        loadedBrainstormText: '',
      }];
    }),
  );

  if (!changed) return;
  safeWriteJson(tabConfigStorageKey, next);
}

export function getWorkbenchLinkedContextStorageKey(workId: number | string) {
  return `${WORKBENCH_LINKED_CONTEXT_KEY_PREFIX}${workId}`;
}

function isLinkedContextSource(value: unknown): value is StoredWorkbenchLinkedContextItem['source'] {
  return value === 'setting' || value === 'role' || value === 'outline' || value === 'summary' || value === 'chapter';
}

function normalizeLinkedContextItems(value: unknown): StoredWorkbenchLinkedContextItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<StoredWorkbenchLinkedContextItem> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      source: isLinkedContextSource(item.source) ? item.source : 'chapter',
      group: typeof item.group === 'string' ? item.group : '',
      title: typeof item.title === 'string' ? item.title : '',
      content: typeof item.content === 'string' ? item.content : '',
    }))
    .filter((item) => item.id.trim());
}

export function readWorkbenchLinkedContextItems(workId: number | string) {
  return normalizeLinkedContextItems(safeReadJson<unknown>(getWorkbenchLinkedContextStorageKey(workId)));
}

export function writeWorkbenchLinkedContextItems(workId: number | string, items: StoredWorkbenchLinkedContextItem[]) {
  safeWriteJson(getWorkbenchLinkedContextStorageKey(workId), normalizeLinkedContextItems(items));
}

export function clearWorkbenchLinkedContextItems(workId: number | string) {
  try {
    localStorage.removeItem(getWorkbenchLinkedContextStorageKey(workId));
  } catch {
    // Ignore storage failures.
  }
}
