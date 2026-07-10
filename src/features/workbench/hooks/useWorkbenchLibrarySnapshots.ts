import { useEffect, useState } from 'react';

import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';

export interface WorkbenchLibrarySnapshots {
  settingsEntries: WorkbenchLibraryEntry[];
  outlineEntries: WorkbenchLibraryEntry[];
}

export function readWorkbenchLibrarySnapshots(
  settingsStorageKey: string,
  outlineStorageKey: string,
): WorkbenchLibrarySnapshots {
  if (!settingsStorageKey || !outlineStorageKey) {
    return { settingsEntries: [], outlineEntries: [] };
  }
  return {
    settingsEntries: readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey),
    outlineEntries: readWorkbenchLibraryEntries(outlineStorageKey),
  };
}

export function shouldSyncWorkbenchLibrarySnapshot(
  eventKey: string | null | undefined,
  settingsStorageKey: string,
  outlineStorageKey: string,
) {
  if (!eventKey) return true;
  return (
    eventKey === settingsStorageKey ||
    eventKey === outlineStorageKey ||
    eventKey === GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY
  );
}

export function useWorkbenchLibrarySnapshots(settingsStorageKey: string, outlineStorageKey: string) {
  const [snapshots, setSnapshots] = useState<WorkbenchLibrarySnapshots>(() =>
    readWorkbenchLibrarySnapshots(settingsStorageKey, outlineStorageKey),
  );

  useEffect(() => {
    const syncSnapshots = () => {
      setSnapshots(readWorkbenchLibrarySnapshots(settingsStorageKey, outlineStorageKey));
    };
    syncSnapshots();
    if (!settingsStorageKey || !outlineStorageKey) return undefined;

    const handleLibraryUpdated = (event: Event) => {
      const storageKey = event instanceof CustomEvent ? event.detail?.storageKey : null;
      if (!shouldSyncWorkbenchLibrarySnapshot(storageKey, settingsStorageKey, outlineStorageKey)) return;
      syncSnapshots();
    };
    const handleStorage = (event: StorageEvent) => {
      if (!shouldSyncWorkbenchLibrarySnapshot(event.key, settingsStorageKey, outlineStorageKey)) return;
      syncSnapshots();
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, handleLibraryUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, handleLibraryUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [outlineStorageKey, settingsStorageKey]);

  return snapshots;
}
