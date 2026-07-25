import { writeJsonValue } from '@/shared/storage/jsonStorage';

const WORKBENCH_PERSIST_INTERVAL_MS = 350;

export interface WorkbenchWriteCallbacks<T = void> {
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

interface PendingWorkbenchWrite {
  run: () => unknown;
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  failed: boolean;
}

export interface WorkbenchFlushResult {
  succeededKeys: string[];
  failedKeys: string[];
}

const pendingWrites = new Map<string, PendingWorkbenchWrite>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let beforeUnloadBound = false;

function clearPersistTimer() {
  if (persistTimer === null) return;
  clearTimeout(persistTimer);
  persistTimer = null;
}

function runCallback(callback: (() => void) | undefined) {
  try {
    callback?.();
  } catch {
    // Persistence has already completed. A UI callback must not block the remaining writes.
  }
}

export function flushWorkbenchWrites(): WorkbenchFlushResult {
  clearPersistTimer();
  const entries = [...pendingWrites.entries()];
  const result: WorkbenchFlushResult = { succeededKeys: [], failedKeys: [] };

  entries.forEach(([key, entry]) => {
    if (pendingWrites.get(key) !== entry) return;
    try {
      const value = entry.run();
      if (pendingWrites.get(key) === entry) pendingWrites.delete(key);
      result.succeededKeys.push(key);
      runCallback(entry.onSuccess ? () => entry.onSuccess?.(value) : undefined);
    } catch (error) {
      entry.failed = true;
      result.failedKeys.push(key);
      runCallback(entry.onError ? () => entry.onError?.(error) : undefined);
    }
  });

  if ([...pendingWrites.values()].some((entry) => !entry.failed)) {
    persistTimer = setTimeout(flushWorkbenchWrites, WORKBENCH_PERSIST_INTERVAL_MS);
  }
  return result;
}

export const flushWorkbenchJsonWrites = flushWorkbenchWrites;

function bindBeforeUnloadFlush() {
  if (beforeUnloadBound || typeof window === 'undefined') return;
  beforeUnloadBound = true;
  window.addEventListener('beforeunload', flushWorkbenchWrites);
}

export function scheduleWorkbenchPersistenceTask<T>(
  key: string,
  run: () => T,
  callbacks: WorkbenchWriteCallbacks<T> = {},
) {
  pendingWrites.set(key, {
    run,
    onSuccess: callbacks.onSuccess as ((result: unknown) => void) | undefined,
    onError: callbacks.onError,
    failed: false,
  });
  bindBeforeUnloadFlush();
  if (persistTimer !== null) return;
  persistTimer = setTimeout(flushWorkbenchWrites, WORKBENCH_PERSIST_INTERVAL_MS);
}

export function scheduleWorkbenchJsonWrite<T>(key: string, value: T, callbacks: WorkbenchWriteCallbacks = {}) {
  scheduleWorkbenchPersistenceTask(key, () => writeJsonValue(key, value), callbacks);
}

export function scheduleWorkbenchTextWrite(key: string, value: string, callbacks: WorkbenchWriteCallbacks = {}) {
  scheduleWorkbenchPersistenceTask(key, () => localStorage.setItem(key, value), callbacks);
}

export function cancelScheduledWorkbenchWrite(key: string) {
  pendingWrites.delete(key);
  if (pendingWrites.size === 0) clearPersistTimer();
}

export const cancelScheduledWorkbenchJsonWrite = cancelScheduledWorkbenchWrite;

export function retryWorkbenchWrites() {
  pendingWrites.forEach((entry) => {
    entry.failed = false;
  });
  return flushWorkbenchWrites();
}

export function resetWorkbenchPersistenceQueueForTests() {
  clearPersistTimer();
  pendingWrites.clear();
}
