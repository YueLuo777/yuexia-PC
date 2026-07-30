import { beforeEach, describe, expect, it } from 'vitest';

import { STANDARD_SETTING_GENERATION_STEPS } from './standardModeSettingGenerationFlow';
import {
  buildStandardSettingGenerationOutputTemplate,
  readStandardSettingGenerationTargets,
} from './standardModeSettingGenerationTargets';
import { replaceProfessionalSettingEntriesFromTemplate } from './standardModeDefaultSettingAdapter';
import { writeStandardSettingTemplateState } from './standardModeSettingModel';
import { MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE } from './standardModeXianxiaSettingTemplates';

describe('standard mode setting generation targets', () => {
  beforeEach(() => localStorage.clear());

  it('targets the original world-foundation entries and emits their exact names and fields', () => {
    localStorage.setItem('xinyuexia_workbench_settings_target-test', JSON.stringify([
      { id: 'bad-group', tab: '大纲', title: '<基础设定>', content: JSON.stringify({ type: '基础设定', body: '错误分组' }), updatedAt: '' },
      { id: 'bad-world', tab: '大纲', title: '世界背景：世界名为九州', content: JSON.stringify({ type: '核心设定', body: '错误副本' }), updatedAt: '' },
    ]));
    const targets = readStandardSettingGenerationTargets(
      'xinyuexia_workbench_settings_target-test',
      STANDARD_SETTING_GENERATION_STEPS[0],
    );

    expect(targets.map((target) => target.title)).toEqual([
      '作品定位',
      '世界背景',
      '力量体系',
      '设定红线',
    ]);
    const template = buildStandardSettingGenerationOutputTemplate(targets);
    expect(template).toContain('<核心设定>');
    expect(template).toContain('*作品定位*：');
    expect(template).toContain('【小说类型】：填写该字段内容');
    expect(template).not.toContain('*基础设定*：');
    expect(targets.map((target) => target.id)).not.toEqual(expect.arrayContaining(['bad-group', 'bad-world']));
  });

  it('assigns every original template entry to one generation step only', () => {
    const targetGroups = STANDARD_SETTING_GENERATION_STEPS.map((step) =>
      readStandardSettingGenerationTargets('xinyuexia_workbench_settings_target-test', step),
    );
    const allIds = targetGroups.flat().map((target) => target.id);

    expect(allIds.length).toBeGreaterThan(0);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(targetGroups.every((targets) => targets.length > 0)).toBe(true);
  });

  it('assigns every lightweight template entry to one step and keeps all five steps writable', () => {
    const storageKey = 'xinyuexia_workbench_settings_light-target-test';
    replaceProfessionalSettingEntriesFromTemplate(storageKey, MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE);
    writeStandardSettingTemplateState('light-target-test', {
      version: 2,
      mode: 'template',
      templateId: 'male-fantasy-xianxia-light',
      templateName: '玄幻仙侠（轻量版）',
      structure: MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
    });

    const targetGroups = STANDARD_SETTING_GENERATION_STEPS.map((step) =>
      readStandardSettingGenerationTargets(storageKey, step),
    );
    const allIds = targetGroups.flat().map((target) => target.id);

    expect(targetGroups.every((targets) => targets.length > 0)).toBe(true);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(targetGroups[3].map((target) => target.title)).toEqual(
      expect.arrayContaining(['主角起始地点', '宗门势力（可重复）']),
    );
    expect(targetGroups[4].map((target) => target.title)).toEqual(
      expect.arrayContaining(['功法档案（可重复）', '长线伏笔（可重复）']),
    );
  });
});
