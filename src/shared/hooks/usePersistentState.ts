import { useEffect, useState } from 'react';

import { readJsonValue, writeJsonValue } from '@/shared/storage/jsonStorage';

export function usePersistentState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => readJsonValue(key, fallback));

  useEffect(() => {
    try {
      writeJsonValue(key, value);
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
