import type { StandardBrainstormVersion } from './standardModeBrainstormModel';

const STANDARD_BRAINSTORM_LINK_STORAGE_PREFIX = 'xinyuexia_standard_brainstorm_link_';
const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

export type StandardModeBrainstormLink = Pick<StandardBrainstormVersion, 'id' | 'title' | 'content'> & {
  sourceEntryId?: string;
};

export function writeStandardModeBrainstormLink(novelId: string, brainstorm: StandardBrainstormVersion) {
  if (!novelId) return;
  localStorage.setItem(`${STANDARD_BRAINSTORM_LINK_STORAGE_PREFIX}${novelId}`, JSON.stringify(brainstorm));
}

export function clearStandardModeBrainstormLink(novelId: string) {
  if (!novelId) return;
  localStorage.removeItem(`${STANDARD_BRAINSTORM_LINK_STORAGE_PREFIX}${novelId}`);
}

export function readStandardModeBrainstormLink(novelId: string): StandardModeBrainstormLink | null {
  if (!novelId) return null;
  try {
    const parsed = JSON.parse(
      localStorage.getItem(`${STANDARD_BRAINSTORM_LINK_STORAGE_PREFIX}${novelId}`) ?? 'null',
    ) as Partial<StandardModeBrainstormLink> | null;
    if (!parsed || typeof parsed.content !== 'string') return null;
    return {
      id: typeof parsed.id === 'string' ? parsed.id : '',
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : '未命名',
      content: parsed.content.trim(),
      ...(typeof parsed.sourceEntryId === 'string' ? { sourceEntryId: parsed.sourceEntryId } : null),
    };
  } catch {
    return null;
  }
}

export function readStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey: string) {
  if (!settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)) return null;
  return readStandardModeBrainstormLink(settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length));
}

export function writeStandardModeBrainstormLinkFromSettingsKey(
  settingsStorageKey: string,
  brainstorm: StandardBrainstormVersion,
) {
  if (!settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)) return;
  writeStandardModeBrainstormLink(settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length), brainstorm);
}

export function clearStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey: string) {
  if (!settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)) return;
  clearStandardModeBrainstormLink(settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length));
}
