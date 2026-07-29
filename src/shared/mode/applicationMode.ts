import { useSyncExternalStore } from 'react';

export type ApplicationMode = 'professional' | 'standard';

export const APPLICATION_MODE_STORAGE_KEY = 'xinyuexia_application_mode_v1';
export const APPLICATION_MODE_UPDATED_EVENT = 'xinyuexia_application_mode_updated';

function normalizeApplicationMode(value: string | null): ApplicationMode {
  return value === 'standard' ? 'standard' : 'professional';
}

export function readApplicationMode(): ApplicationMode {
  if (typeof window === 'undefined') return 'professional';
  return normalizeApplicationMode(window.localStorage.getItem(APPLICATION_MODE_STORAGE_KEY));
}

export function writeApplicationMode(mode: ApplicationMode) {
  window.localStorage.setItem(APPLICATION_MODE_STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(APPLICATION_MODE_UPDATED_EVENT, { detail: { mode } }));
}

function subscribeApplicationMode(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === APPLICATION_MODE_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(APPLICATION_MODE_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(APPLICATION_MODE_UPDATED_EVENT, listener);
  };
}

export function useApplicationMode(): ApplicationMode {
  return useSyncExternalStore(subscribeApplicationMode, readApplicationMode, () => 'professional');
}
