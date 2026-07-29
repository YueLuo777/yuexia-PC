import { describe, expect, it } from 'vitest';

import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  canCreateWorkbenchRoleInType,
  isDefaultWorkbenchRoleType,
  normalizeWorkbenchRoleLifeStatus,
  normalizeWorkbenchRoleType,
  shouldShowRolePinAction,
} from './workbenchRoleTypes';

describe('workbenchRoleTypes', () => {
  it('uses the approved default character groups without uncategorized', () => {
    expect(DEFAULT_WORKBENCH_ROLE_TYPES).toEqual([
      '男主角',
      '女主角',
      '重要正派角色',
      '正派配角',
      '重要反派角色',
      '反派配角',
      '龙套角色',
    ]);
    expect(DEFAULT_WORKBENCH_ROLE_TYPES).not.toContain('未分类');
  });

  it('treats all approved character groups as undeletable default groups', () => {
    ['女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色'].forEach((type) =>
      expect(isDefaultWorkbenchRoleType(type)).toBe(true),
    );

    expect(isDefaultWorkbenchRoleType('临时角色')).toBe(false);
  });

  it('splits the old combined protagonist category into male and female protagonist categories', () => {
    expect(DEFAULT_WORKBENCH_ROLE_TYPES).toContain('男主角');
    expect(DEFAULT_WORKBENCH_ROLE_TYPES).toContain('女主角');
    expect(DEFAULT_WORKBENCH_ROLE_TYPES).not.toContain('男女主');
  });

  it('moves existing roles from the old combined category into male protagonist', () => {
    expect(normalizeWorkbenchRoleType('男女主')).toBe('男主角');
    expect(normalizeWorkbenchRoleType('男主')).toBe('男主角');
    expect(normalizeWorkbenchRoleType('女主')).toBe('女主角');
    expect(normalizeWorkbenchRoleType('重要配角')).toBe('重要正派角色');
    expect(normalizeWorkbenchRoleType('反派')).toBe('重要反派角色');
    expect(normalizeWorkbenchRoleType('其他角色')).toBe('龙套角色');
    expect(normalizeWorkbenchRoleType('未分类')).toBe('龙套角色');
    expect(normalizeWorkbenchRoleType('')).toBe('龙套角色');
  });

  it('prevents creating another role in male protagonist when one already exists', () => {
    expect(canCreateWorkbenchRoleInType(['男主角'], '男主角')).toBe(false);
    expect(canCreateWorkbenchRoleInType(['男主角'], '女主角')).toBe(true);
  });

  it('keeps male protagonist roles alive regardless of the requested life status', () => {
    expect(normalizeWorkbenchRoleLifeStatus('男主角', '死亡')).toBe('存活');
    expect(normalizeWorkbenchRoleLifeStatus('男女主', '死亡')).toBe('存活');
    expect(normalizeWorkbenchRoleLifeStatus('女主角', '死亡')).toBe('死亡');
  });

  it('hides the pin action for male protagonist roles because that category is single-entry', () => {
    expect(shouldShowRolePinAction('男主角')).toBe(false);
    expect(shouldShowRolePinAction('男女主')).toBe(false);
    expect(shouldShowRolePinAction('女主角')).toBe(true);
    expect(shouldShowRolePinAction('正派配角')).toBe(true);
  });

});
