export const SCRIPT_LINKED_NOVEL_KEY_PREFIX = 'xinyuexia_script_editor_linked_novel_v2_';

const LEGACY_LINKED_KEYS = ['xinyuexia_script_editor_linked_novel', 'sev2_linked_novel', 'script_editor_linked_novel'];

export function getScriptLinkedNovelStorageKey(scriptId: number) {
  return `${SCRIPT_LINKED_NOVEL_KEY_PREFIX}${scriptId}`;
}

function clearLegacyLinkedNovelStorage() {
  LEGACY_LINKED_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function readScriptLinkedNovelId(scriptId: number | null) {
  if (scriptId === null) return null;
  try {
    const scopedValue = Number(localStorage.getItem(getScriptLinkedNovelStorageKey(scriptId)));
    if (Number.isFinite(scopedValue) && scopedValue > 0) return scopedValue;

    for (const key of LEGACY_LINKED_KEYS) {
      const value = Number(localStorage.getItem(key));
      if (!Number.isFinite(value) || value <= 0) continue;
      localStorage.setItem(getScriptLinkedNovelStorageKey(scriptId), String(value));
      clearLegacyLinkedNovelStorage();
      return value;
    }
  } catch {
    // Storage is optional in restricted browser contexts.
  }
  return null;
}

export function writeScriptLinkedNovelId(scriptId: number | null, novelId: number | null) {
  if (scriptId === null) return;
  const storageKey = getScriptLinkedNovelStorageKey(scriptId);
  if (novelId === null) localStorage.removeItem(storageKey);
  else localStorage.setItem(storageKey, String(novelId));
  clearLegacyLinkedNovelStorage();
}
