import { beforeEach, describe, expect, it } from 'vitest';

import {
  readDefaultStandardSettingEntries,
  resetStandardModeSettingEntries,
  writeDefaultStandardSettingField,
} from './standardModeDefaultSettingAdapter';

describe('standard mode default setting adapter', () => {
  beforeEach(() => localStorage.clear());

  it('reuses the professional default domains and generic starter entries', () => {
    const entries = readDefaultStandardSettingEntries('xinyuexia_workbench_settings_novel-a');

    expect([...new Set(entries.map((entry) => entry.domainTitle))]).toEqual([
      '作品设定',
      '人物设定',
      '地点地图',
      '势力设定',
      '道具资源',
      '伏笔线索',
      '怪物图鉴',
    ]);
    expect(entries.some((entry) => entry.title === '男主角')).toBe(true);
    expect(entries.some((entry) => entry.title === '作品定位')).toBe(true);
    expect(entries.some((entry) => entry.title === '青云城')).toBe(false);
  });

  it('writes a standard-mode field back to the shared professional setting storage', () => {
    const storageKey = 'xinyuexia_workbench_settings_novel-a';
    const entry = readDefaultStandardSettingEntries(storageKey).find((item) => item.title === '作品定位');
    const field = entry?.sections.flatMap((section) => section.fields).find((item) => item.title === '小说类型');
    expect(entry).toBeDefined();
    expect(field).toBeDefined();

    writeDefaultStandardSettingField(storageKey, entry!.id, field!.key, field!.title, '玄幻升级流');

    const updated = readDefaultStandardSettingEntries(storageKey).find((item) => item.id === entry!.id);
    expect(updated?.sections.flatMap((section) => section.fields).find((item) => item.key === field!.key)?.value).toBe(
      '玄幻升级流',
    );
  });

  it('rebuilds the professional default structure without carrying old field content', () => {
    const storageKey = 'xinyuexia_workbench_settings_novel-reset';
    const entry = readDefaultStandardSettingEntries(storageKey).find((item) => item.title === '作品定位');
    const field = entry?.sections.flatMap((section) => section.fields).find((item) => item.title === '小说类型');
    writeDefaultStandardSettingField(storageKey, entry!.id, field!.key, field!.title, '林刻的玄幻世界');

    resetStandardModeSettingEntries(storageKey);
    const rebuilt = readDefaultStandardSettingEntries(storageKey);

    expect(rebuilt.some((item) => item.title === '作品定位')).toBe(true);
    expect(rebuilt.some((item) => item.title === '男主角')).toBe(true);
    expect(rebuilt.flatMap((item) => item.sections).flatMap((section) => section.fields).every((item) => item.value === '')).toBe(true);
  });
});
