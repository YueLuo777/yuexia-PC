import { writeJsonValue } from '@/shared/storage/jsonStorage';

const WORKBENCH_PERSIST_INTERVAL_MS = 350;

const pendingWrites = new Map<string, unknown>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let beforeUnloadBound = false;

function clearPersistTimer() {
  if (persistTimer === null) return;
  clearTimeout(persistTimer);
  persistTimer = null;
}

export function flushWorkbenchJsonWrites() {
  clearPersistTimer();
  const entries = [...pendingWrites.entries()];
  pendingWrites.clear();
  entries.forEach(([key, value]) => writeJsonValue(key, value));
}

function bindBeforeUnloadFlush() {
  if (beforeUnloadBound || typeof window === 'undefined') return;
  beforeUnloadBound = true;
  window.addEventListener('beforeunload', flushWorkbenchJsonWrites);
}

export function scheduleWorkbenchJsonWrite(key: string, value: unknown) {
  pendingWrites.set(key, value);
  bindBeforeUnloadFlush();
  if (persistTimer !== null) return;
  persistTimer = setTimeout(flushWorkbenchJsonWrites, WORKBENCH_PERSIST_INTERVAL_MS);
}

export function cancelScheduledWorkbenchJsonWrite(key: string) {
  pendingWrites.delete(key);
  if (pendingWrites.size === 0) clearPersistTimer();
}

export function resetWorkbenchPersistenceQueueForTests() {
  clearPersistTimer();
  pendingWrites.clear();
}
