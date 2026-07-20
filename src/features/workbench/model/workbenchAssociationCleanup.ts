export const ASSOCIATED_CHAPTERS_KEY = 'xinyuexia_associated_chapters';
export const CHAPTER_ASSOCIATE_UPDATED_EVENT = 'chapter_associate_updated';
export const WORKBENCH_ASSOCIATION_SESSION_RESET_KEY = 'xinyuexia_association_session_reset_v1';
const WORKBENCH_LINKED_CONTEXT_KEY_PREFIX = 'xinyuexia_workbench_linked_context_';
const WORKBENCH_AI_SESSIONS_KEY_PREFIX = 'xinyuexia_workbench_ai_sessions_';
const WORKBENCH_TAB_CONFIG_KEY_PREFIX = 'xinyuexia_workbench_';
const WORKBENCH_TAB_CONFIG_KEY_SUFFIX = '_tab_configs_v1';
const SCRIPT_EDITOR_LINKED_NOVEL_KEY_PREFIX = 'xinyuexia_script_editor_linked_novel_v2_';
const WORKBENCH_ASSOCIATION_RUNTIME_ID = `runtime-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const SCRIPT_EDITOR_LINKED_NOVEL_KEYS = [
  'xinyuexia_script_editor_linked_novel',
  'sev2_linked_novel',
  'script_editor_linked_novel',
];
const TAB_CONFIG_ASSOCIATION_DEFAULTS: Record<string, unknown> = {
  associationSessionId: null,
  loadedBrainstormId: null,
  loadedBrainstormTitle: '',
  loadedBrainstormText: '',
  linkedOtherSettingIds: [],
  settingLinkSource: null,
  detailOutlineReaderSessionId: null,
  detailOutlineReaderTouched: false,
  detailOutlineReaderSettingIds: [],
  detailOutlineReaderRoleIds: [],
  detailOutlineReaderOutlineIds: [],
};

export type StoredWorkbenchLinkedContextItem = {
  id: string;
  source: 'setting' | 'role' | 'outline' | 'summary' | 'chapter';
  group: string;
  title: string;
  content: string;
};

type StoredWorkbenchLinkedContextEnvelope = {
  associationSessionId?: unknown;
  items?: unknown;
};

export function getWorkbenchAssociationRuntimeId() {
  return WORKBENCH_ASSOCIATION_RUNTIME_ID;
}

export function isWorkbenchAssociationRuntimeCurrent(value: unknown) {
  return typeof value === 'string' && value === WORKBENCH_ASSOCIATION_RUNTIME_ID;
}

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
    const session = item as {
      contextTitle?: unknown;
      contextText?: unknown;
      linkedItems?: unknown;
      linkChapter?: unknown;
      hasSentChapterContext?: unknown;
    };
    const hasLinkedItems = Array.isArray(session.linkedItems) && session.linkedItems.length > 0;
    if (
      !session.contextTitle &&
      !session.contextText &&
      !hasLinkedItems &&
      !session.linkChapter &&
      !session.hasSentChapterContext
    )
      return item;
    changed = true;
    return {
      ...item,
      contextTitle: '',
      contextText: '',
      linkedItems: [],
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
  clearWorkbenchTabConfigAssociationsByStorageKey(`${storageKey}${WORKBENCH_TAB_CONFIG_KEY_SUFFIX}`);
}

function clearWorkbenchTabConfigAssociationsByStorageKey(tabConfigStorageKey: string) {
  const stored = safeReadJson<Record<string, Record<string, unknown>>>(tabConfigStorageKey);
  if (!stored || typeof stored !== 'object') return;

  let changed = false;
  const next = Object.fromEntries(
    Object.entries(stored).map(([tab, config]) => {
      if (!config || typeof config !== 'object') return [tab, config];
      const associationKeys = Object.keys(TAB_CONFIG_ASSOCIATION_DEFAULTS).filter((key) =>
        Object.prototype.hasOwnProperty.call(config, key),
      );
      if (associationKeys.length === 0) return [tab, config];
      changed = true;
      return [
        tab,
        Object.keys(TAB_CONFIG_ASSOCIATION_DEFAULTS).reduce<Record<string, unknown>>(
          (nextConfig, key) => ({
            ...nextConfig,
            [key]: TAB_CONFIG_ASSOCIATION_DEFAULTS[key],
          }),
          { ...config },
        ),
      ];
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
  const stored = safeReadJson<unknown>(getWorkbenchLinkedContextStorageKey(workId));
  if (!stored || Array.isArray(stored) || typeof stored !== 'object') return [];
  const envelope = stored as StoredWorkbenchLinkedContextEnvelope;
  if (!isWorkbenchAssociationRuntimeCurrent(envelope.associationSessionId)) return [];
  return normalizeLinkedContextItems(envelope.items);
}

export function writeWorkbenchLinkedContextItems(workId: number | string, items: StoredWorkbenchLinkedContextItem[]) {
  safeWriteJson(getWorkbenchLinkedContextStorageKey(workId), {
    associationSessionId: getWorkbenchAssociationRuntimeId(),
    items: normalizeLinkedContextItems(items),
  });
}

export function clearWorkbenchLinkedContextItems(workId: number | string) {
  try {
    localStorage.removeItem(getWorkbenchLinkedContextStorageKey(workId));
  } catch {
    // Ignore storage failures.
  }
}

function getLocalStorageKeys() {
  const keys: string[] = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key) keys.push(key);
    }
  } catch {
    // Ignore storage failures.
  }
  return keys;
}

export function clearAllWorkbenchAssociations() {
  clearAssociatedChapters();

  getLocalStorageKeys().forEach((key) => {
    if (key.startsWith(SCRIPT_EDITOR_LINKED_NOVEL_KEY_PREFIX)) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
      return;
    }

    if (key.startsWith(WORKBENCH_LINKED_CONTEXT_KEY_PREFIX)) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
      return;
    }

    if (key.startsWith(WORKBENCH_AI_SESSIONS_KEY_PREFIX)) {
      clearWorkbenchAiSessionLinksByStorageKey(key);
      return;
    }

    if (key.startsWith(WORKBENCH_TAB_CONFIG_KEY_PREFIX) && key.endsWith(WORKBENCH_TAB_CONFIG_KEY_SUFFIX)) {
      clearWorkbenchTabConfigAssociationsByStorageKey(key);
    }
  });

  SCRIPT_EDITOR_LINKED_NOVEL_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  });
}

export function resetWorkbenchAssociationsForNewAppSession() {
  try {
    clearAllWorkbenchAssociations();
    sessionStorage.setItem(WORKBENCH_ASSOCIATION_SESSION_RESET_KEY, '1');
  } catch {
    clearAllWorkbenchAssociations();
  }
}

export function bindWorkbenchAssociationCloseCleanup() {
  const cleanup = () => clearAllWorkbenchAssociations();
  const cleanupWhenHidden = () => {
    if (document.visibilityState === 'hidden') cleanup();
  };
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('beforeunload', cleanup);
  document.addEventListener('visibilitychange', cleanupWhenHidden);
  return () => {
    window.removeEventListener('pagehide', cleanup);
    window.removeEventListener('beforeunload', cleanup);
    document.removeEventListener('visibilitychange', cleanupWhenHidden);
  };
}
