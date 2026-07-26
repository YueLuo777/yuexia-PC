import { beforeEach, describe, expect, it } from 'vitest';

import type { TemplateStructure } from './standardModeTemplateModel';
import { SMART_TEMPLATE_PRESETS } from './standardModeSmartSettingFlowModel';
import {
  buildTemplateSettingEntries,
  findEmptyStandardSettingFields,
  getStandardSettingTemplateStorageKey,
  readStandardSettingTemplateState,
  updateTemplateSettingField,
  writeStandardSettingTemplateState,
} from './standardModeSettingModel';

const structure: TemplateStructure = [{
  id: 'characters',
  title: '人物设定',
  enabled: true,
  groups: [{
    id: 'leads',
    title: '男女主',
    enabled: true,
    entries: [{
      id: 'hero',
      title: '男主角',
      enabled: true,
      sections: [{
        id: 'profile',
        title: '基础档案',
        enabled: true,
        fields: [
          { id: 'name', title: '人物姓名', enabled: true, value: '林刻' },
          { id: 'goal', title: '当前目标', enabled: true, value: '' },
        ],
      }],
    }],
  }],
}];

describe('standard mode setting model', () => {
  beforeEach(() => localStorage.clear());

  it('stores an independent template structure for every novel', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'xianxia',
      templateName: '玄幻仙侠',
      structure,
    });
    expect(getStandardSettingTemplateStorageKey('novel-a')).not.toBe(getStandardSettingTemplateStorageKey('novel-b'));
    expect(readStandardSettingTemplateState('novel-a')?.structure[0].title).toBe('人物设定');
    expect(readStandardSettingTemplateState('novel-b')).toBeNull();
  });

  it('keeps internal categories and reports exact empty-field jump targets', () => {
    const entries = buildTemplateSettingEntries(structure);
    expect(entries[0].sections[0].title).toBe('基础档案');
    expect(findEmptyStandardSettingFields(entries)).toEqual([{
      entryId: 'hero',
      fieldKey: 'goal',
      path: '人物设定 / 男女主 / 男主角',
      fieldTitle: '当前目标',
    }]);
  });

  it('updates a field inside its saved internal category', () => {
    const next = updateTemplateSettingField(structure, 'hero', 'goal', '踏入仙门');
    expect(buildTemplateSettingEntries(next)[0].sections[0].fields[1].value).toBe('踏入仙门');
  });

  it('keeps the requested male protagonist category order in the xianxia template', () => {
    const xianxia = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia');
    const protagonist = buildTemplateSettingEntries(xianxia!.structure).find((entry) => entry.title === '男主角');

    expect(protagonist?.sections.map((section) => section.title)).toEqual([
      '基础档案',
      '动机与行为规则',
      '金手指',
      '实力与手段',
      '当前状态',
      '关系',
    ]);
    expect(protagonist?.sections.find((section) => section.title === '基础档案')?.fields.map((field) => field.title))
      .toEqual(expect.arrayContaining(['人物背景', '当前目标']));
    expect(protagonist?.sections.find((section) => section.title === '金手指')?.fields.map((field) => field.title))
      .toEqual([
        '金手指来源',
        '金手指当前功能',
        '金手指升级方式',
        '金手指限制与代价',
        '金手指当前解锁状态',
      ]);
  });
});
