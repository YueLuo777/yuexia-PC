import { usePersistentState } from '@/shared/hooks/usePersistentState';

export function useUiPreference<T>(key: string, fallback: T | (() => T)) {
  return usePersistentState(key, fallback);
}
