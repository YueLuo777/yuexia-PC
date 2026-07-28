import { resetStandardModeSettingEntries } from './standardModeDefaultSettingAdapter';
import { clearStandardModeBrainstormLinkFromSettingsKey } from './standardModeBrainstormLink';
import { clearStandardSettingGenerationState } from './standardModeSettingGenerationFlow';
import { clearStandardSettingTemplateState } from './standardModeSettingModel';

const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

export function getNovelIdFromSettingsStorageKey(settingsStorageKey: string) {
  return settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
}

export function clearStandardModeBookSettings(settingsStorageKey: string) {
  const novelId = getNovelIdFromSettingsStorageKey(settingsStorageKey);
  if (!novelId) return false;
  resetStandardModeSettingEntries(settingsStorageKey);
  clearStandardSettingTemplateState(novelId);
  clearStandardSettingGenerationState(settingsStorageKey);
  clearStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey);
  return true;
}
