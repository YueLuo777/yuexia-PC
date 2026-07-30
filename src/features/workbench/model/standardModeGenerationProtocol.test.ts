import { describe, expect, it } from 'vitest';

import { parseStandardSettingGenerationOutput } from './standardModeGenerationProtocol';
import type { StandardSettingGenerationTarget } from './standardModeSettingGenerationTargets';

const target: StandardSettingGenerationTarget = {
  id: 'entry-kungfu',
  templateEntryId: 'entry-kungfu',
  existingEntryIds: ['entry-kungfu'],
  title: '功法档案',
  domainId: 'setting:item',
  domainTitle: '道具资源',
  groupTitle: '功法技能',
  sourceKind: 'setting',
  fields: [
    { id: 'field-name', title: '功法名称' },
    { id: 'field-effect', title: '核心效果' },
  ],
  fieldTitles: ['功法名称', '核心效果'],
  rule: {
    entryId: 'entry-kungfu',
    mode: 'collection',
    required: true,
    titleFieldId: 'field-name',
    minCount: 1,
    recommendedCount: 2,
    maxCount: 3,
    stageId: 'items',
    dependencyEntryIds: [],
    promptGuidance: '',
  },
};

describe('standard mode generation output protocol', () => {
  it('parses multiple items by stable entry and field ids', () => {
    const result = parseStandardSettingGenerationOutput(`[[SETTING_ENTRY:entry-kungfu]]
[[ITEM]]
[[TITLE]]太虚经
[[FIELD:field-name]]太虚经
[[FIELD:field-effect]]炼化虚空灵气
[[END_ITEM]]
[[ITEM]]
[[TITLE]]焚天诀
[[FIELD:field-name]]焚天诀
[[FIELD:field-effect]]凝聚焚天真火
[[END_ITEM]]
[[END_SETTING_ENTRY]]`, [target]);

    expect(result).toEqual({
      ok: true,
      entries: [{
        templateEntryId: 'entry-kungfu',
        items: [
          { title: '太虚经', fields: { 'field-name': '太虚经', 'field-effect': '炼化虚空灵气' } },
          { title: '焚天诀', fields: { 'field-name': '焚天诀', 'field-effect': '凝聚焚天真火' } },
        ],
      }],
    });
  });

  it('rejects unknown ids, missing fields, count overflow, and title mismatch', () => {
    expect(parseStandardSettingGenerationOutput(`[[SETTING_ENTRY:unknown]]
[[ITEM]]
[[TITLE]]测试
[[FIELD:field-name]]测试
[[END_ITEM]]
[[END_SETTING_ENTRY]]`, [target])).toMatchObject({ ok: false });

    expect(parseStandardSettingGenerationOutput(`[[SETTING_ENTRY:entry-kungfu]]
[[ITEM]]
[[TITLE]]太虚经
[[FIELD:field-name]]太虚经
[[END_ITEM]]
[[END_SETTING_ENTRY]]`, [target])).toMatchObject({ ok: false });

    expect(parseStandardSettingGenerationOutput(`[[SETTING_ENTRY:entry-kungfu]]
[[ITEM]]
[[TITLE]]太虚经
[[FIELD:field-name]]另一个名字
[[FIELD:field-effect]]效果
[[END_ITEM]]
[[END_SETTING_ENTRY]]`, [target])).toMatchObject({ ok: false });
  });
});
