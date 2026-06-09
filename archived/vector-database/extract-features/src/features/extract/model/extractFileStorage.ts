export interface StoredExtractFile {
  id: string;
  name: string;
  content: string;
  selected: boolean;
}

const DB_NAME = 'xinyuexia-extract-files-db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadExtractFiles() {
  const db = await openDb();
  const files = await new Promise<StoredExtractFile[]>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const files = (request.result as StoredExtractFile[]).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      resolve(files);
    };
    request.onerror = () => reject(request.error);
  });
  if (files.length > 0) return files;
  try {
    const raw = localStorage.getItem('xinyuexia_extract_files_v1') ?? localStorage.getItem('extract_files_cache');
    const migrated = raw ? JSON.parse(raw) as StoredExtractFile[] : [];
    if (Array.isArray(migrated) && migrated.length > 0) {
      await saveExtractFiles(migrated);
      return migrated;
    }
  } catch {
    // ignore legacy cache migration failures
  }
  return files;
}

export async function saveExtractFiles(files: StoredExtractFile[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    files.forEach((file) => {
      store.put(file);
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
