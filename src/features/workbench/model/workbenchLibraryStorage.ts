export interface WorkbenchLibraryEntry {
  id: string;
  tab: string;
  title: string;
  type?: string;
  content: string;
  updatedAt: string;
  pinnedAt?: number;
  deletedAt?: string;
  brainstormSerialNumber?: number;
}

export const WORKBENCH_LIBRARY_UPDATED_EVENT = 'xinyuexia_workbench_library_updated';
export const WORKBENCH_BRAINSTORM_TAB = '脑洞';
export const GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY = 'xinyuexia_global_brainstorm_library_v1';

function isValidBrainstormSerialNumber(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export function ensureBrainstormSerialNumbers(entries: WorkbenchLibraryEntry[]) {
  const usedSerialNumbers = new Set(
    entries
      .filter((entry) => isBrainstormEntry(entry) && isValidBrainstormSerialNumber(entry.brainstormSerialNumber))
      .map((entry) => entry.brainstormSerialNumber as number),
  );
  let nextSerialNumber = usedSerialNumbers.size > 0 ? Math.max(...usedSerialNumbers) + 1 : 1;

  return entries.map((entry) => {
    if (!isBrainstormEntry(entry) || isValidBrainstormSerialNumber(entry.brainstormSerialNumber)) return entry;
    while (usedSerialNumbers.has(nextSerialNumber)) nextSerialNumber += 1;
    const normalizedEntry = { ...entry, brainstormSerialNumber: nextSerialNumber };
    usedSerialNumbers.add(nextSerialNumber);
    nextSerialNumber += 1;
    return normalizedEntry;
  });
}

export function resequenceBrainstormEntries(entries: WorkbenchLibraryEntry[]) {
  let nextSerialNumber = 1;
  return entries.map((entry) =>
    isBrainstormEntry(entry) ? { ...entry, brainstormSerialNumber: nextSerialNumber++ } : entry,
  );
}

export function readWorkbenchLibraryEntries(storageKey: string): WorkbenchLibraryEntry[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as WorkbenchLibraryEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeWorkbenchLibraryEntries(storageKey: string, entries: WorkbenchLibraryEntry[]) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(WORKBENCH_LIBRARY_UPDATED_EVENT, { detail: { storageKey } }));
}

function isBrainstormEntry(entry: WorkbenchLibraryEntry) {
  return entry.tab === WORKBENCH_BRAINSTORM_TAB;
}

function mergeEntriesById(primary: WorkbenchLibraryEntry[], fallback: WorkbenchLibraryEntry[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export function readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey: string): WorkbenchLibraryEntry[] {
  const localEntries = readWorkbenchLibraryEntries(storageKey);
  const globalBrainstormEntries = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).filter(
    isBrainstormEntry,
  );
  const localBrainstormEntries = localEntries.filter(isBrainstormEntry);
  const localNonBrainstormEntries = localEntries.filter((entry) => !isBrainstormEntry(entry));

  if (storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY && localBrainstormEntries.length > 0) {
    const nextGlobalBrainstormEntries = mergeEntriesById(localBrainstormEntries, globalBrainstormEntries);
    writeWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, nextGlobalBrainstormEntries);
    writeWorkbenchLibraryEntries(storageKey, localNonBrainstormEntries);
    return [...localNonBrainstormEntries, ...nextGlobalBrainstormEntries];
  }

  if (storageKey === GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) {
    return globalBrainstormEntries;
  }

  return [...localNonBrainstormEntries, ...globalBrainstormEntries];
}

export function writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey: string, entries: WorkbenchLibraryEntry[]) {
  const brainstormEntries = entries.filter(isBrainstormEntry);
  const localEntries = entries.filter((entry) => !isBrainstormEntry(entry));

  if (storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) {
    writeWorkbenchLibraryEntries(storageKey, localEntries);
  }
  writeWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, brainstormEntries);
}

export function createWorkbenchLibraryEntry(tab: string, title: string, content = ''): WorkbenchLibraryEntry {
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tab,
    title,
    content,
    updatedAt: new Date().toLocaleString('zh-CN'),
  };
}
