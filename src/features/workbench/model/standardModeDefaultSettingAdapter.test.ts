import { beforeEach, describe, expect, it } from 'vitest';

import {
  readDefaultStandardSettingEntries,
  repairStandardModeGeneratedSettingEntries,
  replaceProfessionalSettingEntriesFromTemplate,
  resetStandardModeSettingEntries,
  writeDefaultStandardSettingField,
} from './standardModeDefaultSettingAdapter';
import { buildDefaultTemplateStructure } from './standardModeTemplateModel';

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
    expect(
      rebuilt
        .flatMap((item) => item.sections)
        .flatMap((section) => section.fields)
        .every((item) => item.value === ''),
    ).toBe(true);
  });

  it('materializes a selected standard template into the professional setting library', () => {
    const storageKey = 'xinyuexia_workbench_settings_novel-template';
    const structure = buildDefaultTemplateStructure();
    const novelType = structure
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((field) => field.title === '小说类型');
    expect(novelType).toBeDefined();
    novelType!.value = '东方玄幻';

    replaceProfessionalSettingEntriesFromTemplate(storageKey, structure);

    const entries = readDefaultStandardSettingEntries(storageKey);
    const positioning = entries.find((entry) => entry.title === '作品定位');
    expect(positioning).toBeDefined();
    expect(
      positioning?.sections.flatMap((section) => section.fields).find((field) => field.title === '小说类型')?.value,
    ).toBe('东方玄幻');
    expect(entries.some((entry) => entry.title === '男主角')).toBe(true);
  });

  it('repairs leaked JSON and merges decorative duplicate titles into the locked template entry', () => {
    const storageKey = 'xinyuexia_workbench_settings_novel-repair';
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: 'role', tab: '角色', title: '男主角', content: '{}', updatedAt: '2026/7/27' },
        {
          id: 'duplicate',
          tab: '大纲',
          title: '【作品定位】',
          content: JSON.stringify({
            type: '核心设定',
            body: '【作品定位】\n{"type":"核心设定","body":"只保留成品设定","structuredFieldSetId":"internal"}',
          }),
          updatedAt: '2026/7/27',
        },
        {
          id: 'canonical',
          tab: '大纲',
          title: '作品定位',
          content: JSON.stringify({
            type: '核心设定',
            body: '',
            structuredFieldSetId: 'prompt-work-positioning',
            lockedDefaultEntryId: '核心设定::作品定位',
          }),
          updatedAt: '2026/7/27',
        },
      ]),
    );

    expect(repairStandardModeGeneratedSettingEntries(storageKey)).toBe(true);

    const repaired = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      id: string;
      title: string;
      content: string;
    }>;
    expect(repaired.map((entry) => entry.id)).toEqual(['role', 'canonical']);
    expect(repaired[1].title).toBe('作品定位');
    expect(JSON.parse(repaired[1].content)).toMatchObject({
      body: '只保留成品设定',
      structuredFieldSetId: 'prompt-work-positioning',
      lockedDefaultEntryId: '核心设定::作品定位',
    });
  });

  it('keeps populated canonical content when removing a populated decorative duplicate', () => {
    const storageKey = 'xinyuexia_workbench_settings_novel-repair-populated';
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'duplicate',
          tab: '大纲',
          title: '【作品定位】',
          content: JSON.stringify({ type: '核心设定', body: '不应覆盖正式内容' }),
          updatedAt: '2026/7/27',
        },
        {
          id: 'canonical',
          tab: '大纲',
          title: '作品定位',
          content: JSON.stringify({
            type: '核心设定',
            body: '小说类型：玄幻\n作品卖点：吞噬万物持续进化',
            structuredFieldSetId: 'prompt-work-positioning',
            lockedDefaultEntryId: '核心设定::作品定位',
          }),
          updatedAt: '2026/7/27',
        },
      ]),
    );

    expect(repairStandardModeGeneratedSettingEntries(storageKey)).toBe(true);

    const repaired = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      id: string;
      title: string;
      content: string;
    }>;
    expect(repaired).toHaveLength(1);
    expect(repaired[0].id).toBe('canonical');
    expect(JSON.parse(repaired[0].content)).toMatchObject({
      body: '小说类型：玄幻\n作品卖点：吞噬万物持续进化',
      structuredFieldSetId: 'prompt-work-positioning',
      lockedDefaultEntryId: '核心设定::作品定位',
    });
  });
});
