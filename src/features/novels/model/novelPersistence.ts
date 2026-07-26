import type { Volume } from '@/features/workbench/model/workbenchTypes';

export const NEXT_NOVEL_ID_KEY = 'xinyuexia_next_novel_id_v2';

const SCRIPT_LINK_STORAGE_PREFIX = 'xinyuexia_script_editor_linked_novel_v2_';
const LEGACY_SCRIPT_LINK_KEYS = [
  'xinyuexia_script_editor_linked_novel',
  'sev2_linked_novel',
  'script_editor_linked_novel',
];

function readStoredNextNovelId() {
  const value = Number(localStorage.getItem(NEXT_NOVEL_ID_KEY));
  return Number.isSafeInteger(value) && value > 0 ? value : 1;
}

export function reserveNextNovelId(items: Array<{ id: number }>) {
  const nextFromExistingItems =
    Math.max(0, ...items.map((item) => (Number.isSafeInteger(item.id) && item.id > 0 ? item.id : 0))) + 1;
  const reservedId = Math.max(readStoredNextNovelId(), nextFromExistingItems);
  localStorage.setItem(NEXT_NOVEL_ID_KEY, String(reservedId + 1));
  return reservedId;
}

function getLocalStorageKeys() {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key) keys.push(key);
  }
  return keys;
}

function removeScriptLinksToNovel(novelId: number) {
  getLocalStorageKeys().forEach((key) => {
    if (!key.startsWith(SCRIPT_LINK_STORAGE_PREFIX)) return;
    if (Number(localStorage.getItem(key)) === novelId) localStorage.removeItem(key);
  });
  LEGACY_SCRIPT_LINK_KEYS.forEach((key) => {
    if (Number(localStorage.getItem(key)) === novelId) localStorage.removeItem(key);
  });
}

export function removeNovelScopedStorage(novelId: number, volumes: Volume[]) {
  const settingsStorageKey = `xinyuexia_workbench_settings_${novelId}`;
  const outlineStorageKey = `xinyuexia_workbench_outline_${novelId}`;
  const exactKeys = new Set([
    settingsStorageKey,
    outlineStorageKey,
    `xinyuexia_workbench_ai_sessions_${novelId}`,
    `xinyuexia_workbench_linked_context_${novelId}`,
    `xinyuexia_workbench_notes_${novelId}`,
    `xinyuexia_workbench_notes_list_v1_${novelId}`,
    `xinyuexia_workbench_active_flow_page_${novelId}`,
    `xinyuexia_standard_setting_template_${novelId}`,
    `${SCRIPT_LINK_STORAGE_PREFIX}${novelId}`,
    `xinyuexia_chapter_polish_status_v1:${settingsStorageKey}`,
  ]);
  const scopedPrefixes = [`${settingsStorageKey}_`, `${outlineStorageKey}_`];

  getLocalStorageKeys().forEach((key) => {
    if (exactKeys.has(key) || scopedPrefixes.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  });
  volumes.forEach((volume) => {
    volume.chapters.forEach((chapter) => {
      localStorage.removeItem(`xinyuexia_novel_${novelId}_chapter_${chapter.id}`);
    });
  });
  removeScriptLinksToNovel(novelId);
}
