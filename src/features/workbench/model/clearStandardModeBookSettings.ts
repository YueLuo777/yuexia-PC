import {
  createEmptyRoleStateSettings,
  parseRoleContent,
  stringifyRoleContent,
} from '@/features/workbench/components/workbenchRoleContent';
import {
  parseSettingContent,
  stringifySettingContent,
} from '@/features/workbench/components/workbenchStructuredSettings';
import { ROLE_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';
import {
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '@/features/workbench/model/workbenchLibraryStorage';

import { clearStandardSettingGenerationState } from './standardModeSettingGenerationFlow';
import {
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from './standardModeSettingModel';

const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

export function getNovelIdFromSettingsStorageKey(settingsStorageKey: string) {
  return settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
}

export function clearStandardModeBookSettings(settingsStorageKey: string) {
  const novelId = getNovelIdFromSettingsStorageKey(settingsStorageKey);
  if (!novelId) return false;

  const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey);
  const clearedEntries = entries.map((entry) => {
    const tab = normalizeTabName(entry.tab);
    if (tab === SETTING_TAB) {
      const setting = parseSettingContent(entry.content);
      return {
        ...entry,
        content: stringifySettingContent({
          ...setting,
          body: '',
          statusHistory: [],
          pendingStatusUpdates: [],
          fieldUpdatePolicies: {},
        }),
      };
    }
    if (tab === ROLE_TAB) {
      const role = parseRoleContent(entry.content);
      return {
        ...entry,
        content: stringifyRoleContent({
          ...role,
          lifeStatus: '存活',
          baseSetting: '',
          relationship: '',
          stateSettings: createEmptyRoleStateSettings(),
          stateUpdateChapters: {},
          personality: '',
          background: '',
          status: '',
          history: [],
          statusHistory: [],
          pendingStatusUpdates: [],
          fieldUpdatePolicies: {},
        }),
      };
    }
    return entry;
  });
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey, clearedEntries);

  const template = readStandardSettingTemplateState(novelId);
  if (template) {
    writeStandardSettingTemplateState(novelId, {
      ...template,
      structure: template.structure.map((domain) => ({
        ...domain,
        groups: domain.groups.map((group) => ({
          ...group,
          entries: group.entries.map((entry) => ({
            ...entry,
            sections: entry.sections.map((section) => ({
              ...section,
              fields: section.fields.map((field) => ({ ...field, value: '' })),
            })),
          })),
        })),
      })),
    });
  }

  clearStandardSettingGenerationState(settingsStorageKey);
  return true;
}
