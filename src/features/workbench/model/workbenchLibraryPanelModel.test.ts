import { describe, expect, it } from 'vitest';

import {
  OTHER_SETTING_LINK_TABS,
  countTextWords,
  filterOtherSettingLinkGroups,
  flattenOtherSettingLinkEntries,
  isMaleProtagonistRoleTypeChangeLocked,
  resolveOtherSettingLinkDraftEntries,
  resolveOtherSettingLinkEntry,
} from './workbenchLibraryPanelModel';

describe('workbenchLibraryPanelModel', () => {
  it('counts visible text without whitespace', () => {
    expect(countTextWords('第一段\n  第二段')).toBe(6);
    expect(countTextWords('')).toBe(0);
  });

  it('keeps a male protagonist inside protagonist-compatible role types', () => {
    expect(isMaleProtagonistRoleTypeChangeLocked('男主', '反派')).toBe(true);
    expect(isMaleProtagonistRoleTypeChangeLocked('男主', '男主角')).toBe(false);
    expect(isMaleProtagonistRoleTypeChangeLocked('配角', '反派')).toBe(false);
  });

  it('provides the stable other-setting link tab order', () => {
    expect(OTHER_SETTING_LINK_TABS.map((tab) => tab.id)).toEqual([
      'work',
      'roles',
      'factions',
      'items',
      'monsters',
      'foreshadow',
    ]);
  });

  it('filters, resolves and orders other-setting link entries without mutating groups', () => {
    const entries = [
      {
        id: 'a',
        entryId: '1',
        source: 'setting' as const,
        tabId: 'work' as const,
        tabTitle: '作品设定',
        groupName: '世界',
        title: '王城',
        type: '地点',
        text: '北方王城',
        wordCount: 4,
      },
      {
        id: 'b',
        entryId: '2',
        source: 'setting' as const,
        tabId: 'work' as const,
        tabTitle: '作品设定',
        groupName: '规则',
        title: '魔法',
        type: '体系',
        text: '元素魔法',
        wordCount: 4,
      },
    ];
    const tabs = [{ id: 'work' as const, title: '作品设定', groups: [{ name: '全部', entries }] }];
    const visibleGroups = filterOtherSettingLinkGroups(tabs[0], '王城');

    expect(flattenOtherSettingLinkEntries(tabs)).toEqual(entries);
    expect(visibleGroups[0].entries.map((entry) => entry.id)).toEqual(['a']);
    expect(tabs[0].groups[0].entries).toHaveLength(2);
    expect(resolveOtherSettingLinkEntry(entries, visibleGroups, 'missing')?.id).toBe('a');
    expect(resolveOtherSettingLinkDraftEntries(entries, new Set(['b', 'a'])).map((entry) => entry.id)).toEqual([
      'b',
      'a',
    ]);
  });
});
