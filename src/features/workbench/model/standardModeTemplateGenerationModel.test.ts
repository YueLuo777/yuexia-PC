import { describe, expect, it } from 'vitest';

import { getSmartTemplatePackage, SMART_TEMPLATE_PRESETS } from './standardModeSmartSettingFlowModel';
import {
  buildDefaultTemplateGenerationBlueprint,
  validateTemplateGenerationBlueprint,
} from './standardModeTemplateGenerationModel';
import { createSmartTemplateStructure } from './standardModeSmartSettingTemplateFactory';

describe('standard mode template generation model', () => {
  it.each([
    ['male-fantasy-xianxia-light', ['核心设定', '主角与金手指', '故事与首卷', '地点与势力', '功法与伏笔']],
    ['male-fantasy-xianxia', ['世界规则与力量', '主角阵容与金手指', '全书剧情与节奏', '地图势力与关系', '功法资源与伏笔']],
    ['male-fantasy-xianxia-full', ['完整世界体系', '完整人物与金手指', '完整剧情规划', '完整地图与势力', '资源伏笔与怪物']],
  ])('binds %s to its saved generation plan', (templateId, expectedNames) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === templateId)!;
    const templatePackage = getSmartTemplatePackage(preset);

    expect(templatePackage.generationBlueprint.stages.map((stage) => stage.name)).toEqual(expectedNames);
    expect(validateTemplateGenerationBlueprint(
      templatePackage.structure,
      templatePackage.generationBlueprint,
    ).valid).toBe(true);
  });

  it('stores repeatability as an internal collection rule without changing the visible title', () => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia-light')!;
    const templatePackage = getSmartTemplatePackage(preset);
    const entry = templatePackage.structure
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .find((item) => item.title === '功法档案')!;
    const rule = templatePackage.generationBlueprint.entryRules[entry.id];

    expect(entry.title).not.toContain('可重复');
    expect(rule).toMatchObject({ mode: 'collection', minCount: 1, recommendedCount: 2 });
    expect(rule.titleFieldId).toBeTruthy();
  });

  it('rejects empty stages and dependency cycles before a template can be saved', () => {
    const structure = createSmartTemplateStructure('validation', [
      ['作品设定', [['核心设定', [
        ['作品定位', ['小说类型']],
        ['世界背景', ['世界名称']],
      ]]]],
    ]);
    const blueprint = buildDefaultTemplateGenerationBlueprint(structure);
    const entryIds = Object.keys(blueprint.entryRules);
    blueprint.stages.push({
      id: 'stage:empty',
      name: '空步骤',
      order: 1,
      description: '',
      promptName: '作品设定生成',
      promptGuidance: '',
    });
    blueprint.entryRules[entryIds[0]].dependencyEntryIds = [entryIds[1]];
    blueprint.entryRules[entryIds[1]].dependencyEntryIds = [entryIds[0]];

    const validation = validateTemplateGenerationBlueprint(structure, blueprint);
    expect(validation.valid).toBe(false);
    expect(validation.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['empty-stage', 'dependency-cycle']),
    );
  });
});
