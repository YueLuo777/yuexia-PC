export interface JsonStorageOptions<T> {
  normalize?: (value: unknown) => T;
  eventName?: string;
}

function resolveFallback<T>(fallback: T | (() => T)): T {
  return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
}

export function readJsonValue<T>(key: string, fallback: T | (() => T), normalize?: (value: unknown) => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return resolveFallback(fallback);
    const parsed: unknown = JSON.parse(raw);
    return normalize ? normalize(parsed) : (parsed as T);
  } catch {
    return resolveFallback(fallback);
  }
}

export function writeJsonValue<T>(key: string, value: T, eventName?: string) {
  localStorage.setItem(key, JSON.stringify(value));
  if (eventName) window.dispatchEvent(new CustomEvent(eventName));
}

export function createJsonStorage<T>(key: string, fallback: T | (() => T), options: JsonStorageOptions<T> = {}) {
  return {
    read: () => readJsonValue(key, fallback, options.normalize),
    write: (value: T) => writeJsonValue(key, value, options.eventName),
    remove: () => localStorage.removeItem(key),
  };
}
