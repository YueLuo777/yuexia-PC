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
    const migrated = readStandardSettingTemplateState('novel-a');
    expect(migrated?.structure[0].title).toBe('人物设定');
    expect(migrated).toMatchObject({ version: 3, templateRevision: 1, contractVersion: 'setting-generation-v2' });
    expect(migrated?.generationBlueprint.entryRules.hero).toBeTruthy();
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

  it('keeps the standard protagonist as an expanded version of the lightweight protagonist', () => {
    const xianxia = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia');
    const protagonist = buildTemplateSettingEntries(xianxia!.structure).find((entry) => entry.title === '主角档案');
    const fieldTitles = protagonist?.sections.flatMap((section) => section.fields.map((field) => field.title));

    expect(fieldTitles).toEqual(expect.arrayContaining([
      '人物姓名', '身份定位', '人物出身', '当前目标', '核心动机', '行为底线', '当前境界', '人物成长路线',
    ]));
    expect(fieldTitles).toEqual(expect.arrayContaining([
      '年龄', '外貌特征', '最大优点', '最大缺点', '隐藏秘密', '战斗技能',
    ]));
  });
});
