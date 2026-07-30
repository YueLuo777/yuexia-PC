import { describe, expect, it } from 'vitest';

import {
  MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
  MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
  MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
} from './standardModeXianxiaSettingTemplates';
import { cloneTemplateStructure } from './standardModeTemplateModel';
import {
  countTemplateFields,
  getStandardTemplateUpgradeOptions,
  mergeTemplateStructuresForUpgrade,
} from './standardModeTemplateUpgrade';

function findFieldValue(structure: ReturnType<typeof cloneTemplateStructure>, title: string) {
  return structure
    .flatMap((domain) => domain.groups)
    .flatMap((group) => group.entries)
    .flatMap((entry) => entry.sections)
    .flatMap((section) => section.fields)
    .find((field) => field.title === title)?.value;
}

describe('standard mode template upgrade', () => {
  it('offers both direct upgrade targets for lightweight and only full for standard', () => {
    expect(getStandardTemplateUpgradeOptions(
      'male-fantasy-xianxia-light',
      MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
    ).map((option) => [option.id, option.addedFieldCount, option.targetFieldCount])).toEqual([
      ['male-fantasy-xianxia', 198, 298],
      ['male-fantasy-xianxia-full', 548, 648],
    ]);
    expect(getStandardTemplateUpgradeOptions(
      'male-fantasy-xianxia',
      MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
    ).map((option) => [option.id, option.addedFieldCount, option.targetFieldCount])).toEqual([
      ['male-fantasy-xianxia-full', 350, 648],
    ]);
    expect(getStandardTemplateUpgradeOptions(
      'male-fantasy-xianxia-full',
      MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
    )).toEqual([]);
  });

  it('keeps shared values and user DIY nodes while adding target fields', () => {
    const current = cloneTemplateStructure(MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE);
    const novelType = current
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((field) => field.title === '小说类型');
    expect(novelType).toBeDefined();
    novelType!.value = '东方玄幻';
    current[0].groups[0].entries[0].sections[0].fields.push({
      id: 'user-extra-field',
      title: '用户自定义字段',
      enabled: true,
      value: '保留内容',
    });

    const upgraded = mergeTemplateStructuresForUpgrade(current, MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE);

    expect(countTemplateFields(upgraded)).toBe(299);
    expect(findFieldValue(upgraded, '小说类型')).toBe('东方玄幻');
    expect(findFieldValue(upgraded, '用户自定义字段')).toBe('保留内容');
    expect(upgraded.flatMap((domain) => domain.groups).flatMap((group) => group.entries)
      .some((entry) => entry.title === '世界层级与连接')).toBe(true);
  });
});
