import { beforeEach, describe, expect, it } from 'vitest';

import { BRAINSTORM_TAB, ROLE_TAB, SETTING_TAB } from '@/features/workbench/components/workbenchLibraryTabs';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
} from '@/features/workbench/model/workbenchLibraryStorage';

import { clearStandardModeBookSettings, getNovelIdFromSettingsStorageKey } from './clearStandardModeBookSettings';
import { getStandardSettingGenerationStorageKey } from './standardModeSettingGenerationFlow';
import { getStandardSettingTemplateStorageKey } from './standardModeSettingModel';

const storageKey = 'xinyuexia_workbench_settings_novel-a';
const entry = (id: string, tab: string) => ({ id, tab, title: id, content: id, updatedAt: 'now' });

describe('clearStandardModeBookSettings', () => {
  beforeEach(() => localStorage.clear());

  it('clears every setting domain for the current book while preserving brainstorms and other books', () => {
    writeWorkbenchLibraryEntries(storageKey, [
      entry('setting-a', SETTING_TAB),
      entry('role-a', ROLE_TAB),
      entry('brainstorm-a', BRAINSTORM_TAB),
    ]);
    writeWorkbenchLibraryEntries('xinyuexia_workbench_settings_novel-b', [entry('setting-b', SETTING_TAB)]);
    localStorage.setItem(getStandardSettingTemplateStorageKey('novel-a'), '{"version":2}');
    localStorage.setItem(getStandardSettingGenerationStorageKey(storageKey), '{"version":1}');
    localStorage.setItem('xinyuexia_standard_brainstorm_link_novel-a', '{"id":"brainstorm-a"}');

    expect(clearStandardModeBookSettings(storageKey)).toBe(true);

    expect(readWorkbenchLibraryEntries(storageKey)).toEqual([]);
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).map((item) => item.id))
      .toEqual(['brainstorm-a']);
    expect(readWorkbenchLibraryEntries('xinyuexia_workbench_settings_novel-b').map((item) => item.id))
      .toEqual(['setting-b']);
    expect(localStorage.getItem(getStandardSettingTemplateStorageKey('novel-a'))).toBeNull();
    expect(localStorage.getItem(getStandardSettingGenerationStorageKey(storageKey))).toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_brainstorm_link_novel-a')).toBeNull();
  });

  it('rejects storage keys that do not belong to a standard-mode book', () => {
    expect(getNovelIdFromSettingsStorageKey('other-key')).toBe('');
    expect(clearStandardModeBookSettings('other-key')).toBe(false);
  });
});
