import { describe, expect, it } from 'vitest';

import {
  OTHER_SETTING_LINK_TABS,
  countTextWords,
  isMaleProtagonistRoleTypeChangeLocked,
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
});
