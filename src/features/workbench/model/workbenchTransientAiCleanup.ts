import { clearBackgroundAiTaskHistory } from '@/shared/ai/backgroundAiTasks';

const TAB_CONFIG_SUFFIX = '_tab_configs_v1';
const WORKBENCH_AI_SESSION_PREFIX = 'xinyuexia_workbench_ai_sessions_';
const REVIEW_BACKGROUND_TASK_SUFFIXES = ['_review_background_tasks_v1', '_review_background_tasks_v2'];
export const KEEP_WORKBENCH_AI_OUTPUTS_KEY = 'xinyuexia_keep_workbench_ai_outputs_v1';
export const KEEP_WORKBENCH_AI_OUTPUTS_UPDATED_EVENT = 'xinyuexia_keep_workbench_ai_outputs_updated';
export const WORKBENCH_TRANSIENT_AI_CLEARED_EVENT = 'xinyuexia_workbench_transient_ai_cleared';

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
  clearBackgroundAiTaskHistory();
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
    (key): key is string => Boolean(key),
  );
  keys.forEach((key) => {
    if (key.endsWith(TAB_CONFIG_SUFFIX)) clearTabConfigStorage(key);
    if (key.startsWith(WORKBENCH_AI_SESSION_PREFIX)) clearWorkbenchAiSessionStorage(key);
    if (REVIEW_BACKGROUND_TASK_SUFFIXES.some((suffix) => key.endsWith(suffix))) localStorage.removeItem(key);
  });
  window.dispatchEvent(new CustomEvent(WORKBENCH_TRANSIENT_AI_CLEARED_EVENT));
}

export function readKeepWorkbenchAiOutputs() {
  try {
    return localStorage.getItem(KEEP_WORKBENCH_AI_OUTPUTS_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeKeepWorkbenchAiOutputs(value: boolean) {
  try {
    localStorage.setItem(KEEP_WORKBENCH_AI_OUTPUTS_KEY, value ? '1' : '0');
  } catch {
    // Keep settings usable when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(KEEP_WORKBENCH_AI_OUTPUTS_UPDATED_EVENT, { detail: { value } }));
  return value;
}

export function cleanupWorkbenchTransientAiDraftsOnClose() {
  if (!readKeepWorkbenchAiOutputs()) clearWorkbenchTransientAiDrafts();
}

export function resetWorkbenchTransientAiDraftsForNewAppSession() {
  cleanupWorkbenchTransientAiDraftsOnClose();
}

export function bindWorkbenchTransientAiCleanup() {
  if (typeof window === 'undefined') return () => undefined;
  const cleanup = () => cleanupWorkbenchTransientAiDraftsOnClose();
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
  return () => {
    window.removeEventListener('beforeunload', cleanup);
    window.removeEventListener('pagehide', cleanup);
  };
}
