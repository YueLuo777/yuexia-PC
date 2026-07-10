const TAB_CONFIG_SUFFIX = '_tab_configs_v1';
const WORKBENCH_AI_SESSION_PREFIX = 'xinyuexia_workbench_ai_sessions_';
const TRANSIENT_CLEANUP_SESSION_KEY = 'xinyuexia_transient_ai_cleanup_bound_v1';

type JsonObject = Record<string, unknown>;

function readJsonObject(key: string): JsonObject | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as JsonObject) : null;
  } catch {
    return null;
  }
}

function writeJsonObject(key: string, value: JsonObject) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures during app shutdown.
  }
}

function clearLibraryAiSession(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return {
    ...(value as JsonObject),
    input: '',
    output: '',
    result: '',
    backgroundAiTaskId: undefined,
    previewTitles: [],
    previewDrafts: [],
    previewSelectedIndexes: undefined,
    previewCount: undefined,
  };
}

function clearTabConfig(config: unknown) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return config;
  const item = config as JsonObject;
  return {
    ...item,
    aiInput: '',
    aiOutput: '',
    aiResult: '',
    libraryAiTaskId: undefined,
    outlineAiInput: '',
    outlineAiTaskId: undefined,
    aiSessions: Array.isArray(item.aiSessions) ? item.aiSessions.map(clearLibraryAiSession) : item.aiSessions,
  };
}

function clearWorkbenchAiSession(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return {
    ...(value as JsonObject),
    input: '',
    output: '',
    messages: [],
    backgroundTaskId: undefined,
    backgroundAssistantMessageId: undefined,
  };
}

function clearTabConfigStorage(key: string) {
  const stored = readJsonObject(key);
  if (!stored) return;
  writeJsonObject(
    key,
    Object.fromEntries(Object.entries(stored).map(([tab, config]) => [tab, clearTabConfig(config)])),
  );
}

function clearWorkbenchAiSessionStorage(key: string) {
  const stored = readJsonObject(key);
  if (!stored || !Array.isArray(stored.sessions)) return;
  writeJsonObject(key, {
    ...stored,
    sessions: stored.sessions.map(clearWorkbenchAiSession),
  });
}

export function clearWorkbenchTransientAiDrafts() {
  if (typeof localStorage === 'undefined') return;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (key.endsWith(TAB_CONFIG_SUFFIX)) clearTabConfigStorage(key);
    if (key.startsWith(WORKBENCH_AI_SESSION_PREFIX)) clearWorkbenchAiSessionStorage(key);
  }
}

export function bindWorkbenchTransientAiCleanup() {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
  if (sessionStorage.getItem(TRANSIENT_CLEANUP_SESSION_KEY) === '1') return;
  sessionStorage.setItem(TRANSIENT_CLEANUP_SESSION_KEY, '1');

  const cleanup = () => clearWorkbenchTransientAiDrafts();
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
}
