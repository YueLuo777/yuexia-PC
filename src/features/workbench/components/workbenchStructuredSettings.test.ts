import { describe, expect, it } from 'vitest';

import {
  parseSectionedSettingBody,
  parseStructuredSettingFields,
  resolveStructuredSettingDraftFields,
  stringifyStructuredSettingFields,
  createStructuredSettingFieldDraft,
  type StructuredSettingFieldSet,
} from './workbenchStructuredSettings';
import { parseRoleBaseSettingFields } from './workbenchRoleContent';

const testFieldSet: StructuredSettingFieldSet = {
  id: 'test-field-set',
  entryType: '作品设定',
  entryTitle: '测试设定',
  gridColumnsClassName: 'grid-cols-1',
  fields: [
    { key: 'appearance', title: '外貌', placeholder: '' },
    { key: 'aliasName', title: '称号/外号/别称', placeholder: '' },
    { key: 'corePersonality', title: '核心性格', placeholder: '' },
  ],
};

describe('parseSectionedSettingBody', () => {
  it('parses bracket fields when content starts on the same line as the title', () => {
    const sections = parseSectionedSettingBody(
      ['【外貌】：黑衣少年', '【称号/外号/别称】：发', '【核心性格】：果断'].join('\n'),
    );

    expect(sections).toEqual({
      外貌: '黑衣少年',
      '称号/外号/别称': '发',
      核心性格: '果断',
    });
  });

  it('keeps structured fields editable after a parse and stringify roundtrip', () => {
    const source = ['【外貌】：黑衣少年', '【称号/外号/别称】：发', '【核心性格】：果断'].join('\n');

    const fields = parseStructuredSettingFields(source, testFieldSet);
    const nextFields = { ...fields, aliasName: `${fields.aliasName}色` };
    const serialized = stringifyStructuredSettingFields(nextFields, testFieldSet);

    expect(parseStructuredSettingFields(serialized, testFieldSet)).toEqual({
      appearance: '黑衣少年',
      aliasName: '发色',
      corePersonality: '果断',
    });
  });

  it('still parses the generated multiline format used by the editor', () => {
    const fields = parseStructuredSettingFields(
      ['【外貌】：', '黑衣少年', '', '【称号/外号/别称】：', '发', '', '【核心性格】：', '果断'].join('\n'),
      testFieldSet,
    );

    expect(fields).toEqual({
      appearance: '黑衣少年',
      aliasName: '发',
      corePersonality: '果断',
    });
  });

  it('parses role base settings without moving labels into the next input', () => {
    const fields = parseRoleBaseSettingFields(
      [
        '【外貌】：黑衣少年',
        '【称号/外号/别称】：发',
        '【核心性格】：果断',
        '【人物背景】：宗门遗孤',
        '【金手指/能力】：吞噬系统',
      ].join('\n'),
    );

    expect(fields).toEqual({
      appearance: '黑衣少年',
      aliasName: '发',
      corePersonality: '果断',
      background: '宗门遗孤',
      abilityRules: '吞噬系统',
    });
  });

  it('treats orphan bracket labels from old saved data as empty section headers', () => {
    const fields = parseRoleBaseSettingFields(
      ['【外貌】', '【称号/外号/别称】', '【核心性格】：', '【人物背景】：', '【金手指/能力】：'].join('\n'),
    );

    expect(fields).toEqual({
      appearance: '',
      aliasName: '',
      corePersonality: '',
      background: '',
      abilityRules: '',
    });
  });

  it('does not treat inline bracket text in content as a new section', () => {
    const fields = parseStructuredSettingFields(
      ['【外貌】：', '黑衣少年，常被称为【吞噬者】。', '【称号/外号/别称】：吞噬者', '【核心性格】：果断'].join('\n'),
      testFieldSet,
    );

    expect(fields).toEqual({
      appearance: '黑衣少年，常被称为【吞噬者】。',
      aliasName: '吞噬者',
      corePersonality: '果断',
    });
  });

  it('keeps structured setting drafts editable after smart import parsing', () => {
    const importedBody = ['【外貌】：黑衣少年', '【称号/外号/别称】：吞噬者', '【核心性格】：果断'].join('\n');
    const parsedFields = parseStructuredSettingFields(importedBody, testFieldSet);
    const nextFields = { ...parsedFields, appearance: `${parsedFields.appearance}，目光冷静。` };
    const nextBody = stringifyStructuredSettingFields(nextFields, testFieldSet);
    const draft = createStructuredSettingFieldDraft('setting-1', testFieldSet.id, nextBody, nextFields);

    expect(resolveStructuredSettingDraftFields(draft, 'setting-1', testFieldSet.id, nextBody, parsedFields)).toEqual({
      appearance: '黑衣少年，目光冷静。',
      aliasName: '吞噬者',
      corePersonality: '果断',
    });
  });

  it('ignores stale structured setting drafts when smart import replaces the body', () => {
    const oldBody = ['【外貌】：黑衣少年', '【称号/外号/别称】：吞噬者', '【核心性格】：果断'].join('\n');
    const oldFields = parseStructuredSettingFields(oldBody, testFieldSet);
    const draft = createStructuredSettingFieldDraft('setting-1', testFieldSet.id, oldBody, {
      ...oldFields,
      appearance: '旧草稿',
    });
    const importedBody = ['【外貌】：白衣少女', '【称号/外号/别称】：剑主', '【核心性格】：冷静'].join('\n');
    const importedFields = parseStructuredSettingFields(importedBody, testFieldSet);

    expect(
      resolveStructuredSettingDraftFields(draft, 'setting-1', testFieldSet.id, importedBody, importedFields),
    ).toEqual({
      appearance: '白衣少女',
      aliasName: '剑主',
      corePersonality: '冷静',
    });
  });
});
