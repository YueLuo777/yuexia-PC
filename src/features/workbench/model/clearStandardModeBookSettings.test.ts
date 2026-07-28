import { beforeEach, describe, expect, it } from 'vitest';

import { BRAINSTORM_TAB, ROLE_TAB, SETTING_TAB } from '@/features/workbench/components/workbenchLibraryTabs';
import { parseRoleContent, stringifyRoleContent } from '@/features/workbench/components/workbenchRoleContent';
import { parseSettingContent, stringifySettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
} from '@/features/workbench/model/workbenchLibraryStorage';

import { clearStandardModeBookSettings, getNovelIdFromSettingsStorageKey } from './clearStandardModeBookSettings';
import { getStandardSettingGenerationStorageKey } from './standardModeSettingGenerationFlow';
import {
  getStandardSettingTemplateStorageKey,
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from './standardModeSettingModel';

const storageKey = 'xinyuexia_workbench_settings_novel-a';
const entry = (id: string, tab: string, content = id) => ({ id, tab, title: id, content, updatedAt: 'now' });

describe('clearStandardModeBookSettings', () => {
  beforeEach(() => localStorage.clear());

  it('clears only filled setting content while preserving the template, structure, links, and other books', () => {
    writeWorkbenchLibraryEntries(storageKey, [
      entry('setting-a', SETTING_TAB, stringifySettingContent({
        type: '世界背景',
        body: '已有设定内容',
        structuredFieldSetId: 'world-background',
        lockedDefaultEntryId: 'setting-a',
        statusHistory: [{
          id: 'history-a',
          fieldKey: 'background',
          fieldLabel: '世界背景',
          kind: '内容纠错',
          before: '旧内容',
          after: '新内容',
          chapter: 1,
          confirmedAt: 'now',
        }],
        pendingStatusUpdates: [],
        fieldUpdatePolicies: {},
      })),
      entry('role-a', ROLE_TAB, stringifyRoleContent({
        type: '男主角',
        lifeStatus: '死亡',
        baseSetting: '人物基础设定',
        relationship: '人物关系',
        stateSettings: { currentSituation: '受伤' } as ReturnType<typeof parseRoleContent>['stateSettings'],
        stateUpdateChapters: {},
        personality: '性格',
        background: '背景',
        status: '状态',
        history: [],
      })),
      entry('brainstorm-a', BRAINSTORM_TAB),
    ]);
    writeWorkbenchLibraryEntries('xinyuexia_workbench_settings_novel-b', [entry('setting-b', SETTING_TAB)]);
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing-template',
      templateName: '当前模板',
      structure: [{
        id: 'work',
        title: '作品设定',
        enabled: true,
        groups: [{
          id: 'world',
          title: '世界观',
          enabled: true,
          entries: [{
            id: 'setting-a',
            title: '世界背景',
            enabled: true,
            sections: [{
              id: 'section-a',
              title: '背景',
              enabled: true,
              fields: [{ id: 'field-a', title: '时代背景', enabled: true, value: '旧内容' }],
            }],
          }],
        }],
      }],
    });
    localStorage.setItem(getStandardSettingGenerationStorageKey(storageKey), '{"version":1}');
    localStorage.setItem(
      'xinyuexia_standard_brainstorm_link_novel-a',
      '{"id":"brainstorm-a","title":"脑洞","content":"脑洞内容"}',
    );

    expect(clearStandardModeBookSettings(storageKey)).toBe(true);

    const clearedEntries = readWorkbenchLibraryEntries(storageKey);
    expect(clearedEntries.map((item) => [item.id, item.title, item.tab])).toEqual([
      ['setting-a', 'setting-a', SETTING_TAB],
      ['role-a', 'role-a', ROLE_TAB],
    ]);
    expect(parseSettingContent(clearedEntries[0].content)).toMatchObject({
      type: '世界背景',
      body: '',
      structuredFieldSetId: 'world-background',
      lockedDefaultEntryId: 'setting-a',
      statusHistory: [],
    });
    expect(parseRoleContent(clearedEntries[1].content)).toMatchObject({
      type: '男主角',
      lifeStatus: '存活',
      baseSetting: '',
      relationship: '',
      personality: '',
      background: '',
      status: '',
      history: [],
    });
    expect(Object.values(parseRoleContent(clearedEntries[1].content).stateSettings).every((value) => value === ''))
      .toBe(true);
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).map((item) => item.id))
      .toEqual(['brainstorm-a']);
    expect(readWorkbenchLibraryEntries('xinyuexia_workbench_settings_novel-b').map((item) => item.id))
      .toEqual(['setting-b']);
    const savedTemplate = readStandardSettingTemplateState('novel-a');
    expect(savedTemplate?.templateId).toBe('existing-template');
    expect(savedTemplate?.structure[0].groups[0].entries[0].title).toBe('世界背景');
    expect(savedTemplate?.structure[0].groups[0].entries[0].sections[0].fields[0].value).toBe('');
    expect(localStorage.getItem(getStandardSettingTemplateStorageKey('novel-a'))).not.toBeNull();
    expect(localStorage.getItem(getStandardSettingGenerationStorageKey(storageKey))).toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_brainstorm_link_novel-a')).toContain('brainstorm-a');
  });

  it('rejects storage keys that do not belong to a standard-mode book', () => {
    expect(getNovelIdFromSettingsStorageKey('other-key')).toBe('');
    expect(clearStandardModeBookSettings('other-key')).toBe(false);
  });
});
