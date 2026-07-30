import { beforeEach, describe, expect, it } from 'vitest';

import { getStandardSettingGenerationSteps } from './standardModeSettingGenerationFlow';
import {
  buildStandardSettingGenerationOutputTemplate,
  readStandardSettingGenerationTargets,
} from './standardModeSettingGenerationTargets';
import { replaceProfessionalSettingEntriesFromTemplate } from './standardModeDefaultSettingAdapter';
import { createStandardSettingTemplateState, writeStandardSettingTemplateState } from './standardModeSettingModel';
import { getSmartTemplatePackage, SMART_TEMPLATE_PRESETS } from './standardModeSmartSettingFlowModel';
import {
  MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
  MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
  MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
} from './standardModeXianxiaSettingTemplates';

describe('standard mode setting generation targets', () => {
  beforeEach(() => localStorage.clear());

  const countEnabledEntries = (structure: typeof MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE) => structure
    .filter((domain) => domain.enabled)
    .flatMap((domain) => domain.groups.filter((group) => group.enabled))
    .flatMap((group) => group.entries.filter((entry) => entry.enabled))
    .length;

  it('targets the original world-foundation entries and emits their exact names and fields', () => {
    const storageKey = 'xinyuexia_workbench_settings_target-test';
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia-light')!;
    const templatePackage = getSmartTemplatePackage(preset);
    replaceProfessionalSettingEntriesFromTemplate(storageKey, templatePackage.structure, templatePackage.generationBlueprint);
    writeStandardSettingTemplateState('target-test', createStandardSettingTemplateState({
      templateId: templatePackage.id,
      templateName: templatePackage.name,
      structure: templatePackage.structure,
      generationBlueprint: templatePackage.generationBlueprint,
      promptProfile: templatePackage.promptProfile,
    }));
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    localStorage.setItem(storageKey, JSON.stringify([...existing,
      { id: 'bad-group', tab: '大纲', title: '<基础设定>', content: JSON.stringify({ type: '基础设定', body: '错误分组' }), updatedAt: '' },
      { id: 'bad-world', tab: '大纲', title: '世界背景：世界名为九州', content: JSON.stringify({ type: '核心设定', body: '错误副本' }), updatedAt: '' },
    ]));
    const targets = readStandardSettingGenerationTargets(
      storageKey,
      getStandardSettingGenerationSteps(storageKey)[0],
    );

    expect(targets.map((target) => target.title)).toEqual(
      expect.arrayContaining(['作品定位', '世界背景', '力量体系', '设定红线']),
    );
    const template = buildStandardSettingGenerationOutputTemplate(targets);
    expect(template).toContain('[[SETTING_ENTRY:');
    expect(template).toContain('[[TITLE]]作品定位');
    expect(template).toContain('[[FIELD:');
    expect(template).not.toContain('bad-group');
    expect(targets.map((target) => target.id)).not.toEqual(expect.arrayContaining(['bad-group', 'bad-world']));
  });

  it('assigns every original template entry to one generation step only', () => {
    const storageKey = 'xinyuexia_workbench_settings_target-test';
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia')!;
    const templatePackage = getSmartTemplatePackage(preset);
    replaceProfessionalSettingEntriesFromTemplate(storageKey, templatePackage.structure, templatePackage.generationBlueprint);
    writeStandardSettingTemplateState('target-test', createStandardSettingTemplateState({
      templateId: templatePackage.id,
      templateName: templatePackage.name,
      structure: templatePackage.structure,
      generationBlueprint: templatePackage.generationBlueprint,
      promptProfile: templatePackage.promptProfile,
    }));
    const targetGroups = getStandardSettingGenerationSteps(storageKey).map((step) =>
      readStandardSettingGenerationTargets(storageKey, step),
    );
    const allIds = targetGroups.flat().map((target) => target.id);

    expect(allIds.length).toBeGreaterThan(0);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds).toHaveLength(countEnabledEntries(templatePackage.structure));
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

    const generationSteps = getStandardSettingGenerationSteps(storageKey);
    const targetGroups = generationSteps.map((step) =>
      readStandardSettingGenerationTargets(storageKey, step),
    );
    const allIds = targetGroups.flat().map((target) => target.id);

    expect(targetGroups.every((targets) => targets.length > 0)).toBe(true);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds).toHaveLength(countEnabledEntries(MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE));
    expect(targetGroups[3].map((target) => target.title)).toEqual(
      expect.arrayContaining(['主角起始地点', '关键地点档案', '宗门势力档案']),
    );
    expect(targetGroups[1].map((target) => target.title)).toEqual(
      expect.arrayContaining(['金手指核心', '主角成长线']),
    );
    expect(targetGroups[4].map((target) => target.title)).toEqual(
      expect.arrayContaining(['功法档案', '技能档案', '法宝装备', '长线伏笔', '妖兽档案']),
    );
  });

  it.each([
    ['male-fantasy-xianxia', '玄幻仙侠（标准版）', MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE],
    ['male-fantasy-xianxia-full', '玄幻仙侠（完整版）', MALE_FANTASY_XIANXIA_FULL_STRUCTURE],
  ])('binds every %s template entry to one writable ordered step', (templateId, templateName, structure) => {
    const novelId = `${templateId}-target-test`;
    const storageKey = `xinyuexia_workbench_settings_${novelId}`;
    replaceProfessionalSettingEntriesFromTemplate(storageKey, structure);
    writeStandardSettingTemplateState(novelId, {
      version: 2,
      mode: 'template',
      templateId,
      templateName,
      structure,
    });

    const generationSteps = getStandardSettingGenerationSteps(storageKey);
    const targetGroups = generationSteps.map((step) => readStandardSettingGenerationTargets(storageKey, step));
    const allIds = targetGroups.flat().map((target) => target.id);

    expect(generationSteps.map((step) => step.id)).toEqual([
      'world-foundation',
      'main-characters',
      'plot-planning',
      'places-and-factions',
      'creation-supplements',
    ]);
    expect(targetGroups.every((targets) => targets.length > 0)).toBe(true);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds).toHaveLength(countEnabledEntries(structure));
  });
});
