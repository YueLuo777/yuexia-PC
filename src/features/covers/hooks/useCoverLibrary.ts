import { useCallback, useEffect, useState } from 'react';

import type { CoverLibraryItem, NewCoverLibraryItem } from '@/features/covers/model/coverTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const COVER_LIBRARY_KEY = 'xinyuexia_cover_library_v1';
const COVER_LIBRARY_UPDATED_EVENT = APP_EVENTS.coversUpdated;
const coverLibraryStorage = createJsonStorage<CoverLibraryItem[]>(COVER_LIBRARY_KEY, [], {
  normalize: (value) => (Array.isArray(value) ? (value as CoverLibraryItem[]) : []),
  eventName: COVER_LIBRARY_UPDATED_EVENT,
});

export function readCoverLibrary() {
  return coverLibraryStorage.read();
}

function writeCoverLibrary(items: CoverLibraryItem[]) {
  coverLibraryStorage.write(items);
}

export function addCoverLibraryItem(input: NewCoverLibraryItem) {
  const item: CoverLibraryItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toLocaleString('zh-CN'),
    ...input,
  };
  writeCoverLibrary([item, ...readCoverLibrary()]);
  return item;
}

export function useCoverLibrary() {
  const [items, setItems] = useState<CoverLibraryItem[]>(readCoverLibrary);

  useEffect(() => {
    const sync = () => setItems(readCoverLibrary());
    window.addEventListener(COVER_LIBRARY_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COVER_LIBRARY_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addItem = useCallback((input: NewCoverLibraryItem) => addCoverLibraryItem(input), []);

  const deleteItem = useCallback((id: string) => {
    const next = readCoverLibrary().filter((item) => item.id !== id);
    writeCoverLibrary(next);
  }, []);

  return { items, addItem, deleteItem };
}
