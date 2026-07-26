import { useSyncExternalStore } from 'react';

import { areInternalRoutesEnabled } from '@/shared/featureFlags/internalRoutes';

const OWNER_TEST_MODE_STORAGE_KEY = 'xinyuexia_owner_test_mode_v1';
const OWNER_TEST_MODE_UPDATED_EVENT = 'xinyuexia_owner_test_mode_updated';

export function readOwnerTestMode() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(OWNER_TEST_MODE_STORAGE_KEY) === '1';
}

export function writeOwnerTestMode(enabled: boolean) {
  if (enabled) window.localStorage.setItem(OWNER_TEST_MODE_STORAGE_KEY, '1');
  else window.localStorage.removeItem(OWNER_TEST_MODE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(OWNER_TEST_MODE_UPDATED_EVENT, { detail: { enabled } }));
}

function subscribeOwnerTestMode(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === OWNER_TEST_MODE_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(OWNER_TEST_MODE_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(OWNER_TEST_MODE_UPDATED_EVENT, listener);
  };
}

export function useOwnerTestMode() {
  const storedEnabled = useSyncExternalStore(subscribeOwnerTestMode, readOwnerTestMode, () => false);
  return areInternalRoutesEnabled() && storedEnabled;
}
