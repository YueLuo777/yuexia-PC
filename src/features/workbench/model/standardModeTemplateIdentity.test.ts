import { describe, expect, it } from 'vitest';

import { SMART_TEMPLATE_PRESETS, cloneSmartTemplateStructure } from './standardModeSmartSettingFlowModel';
import { getCurrentSettingTemplateName, hasSameTemplateDefinition } from './standardModeTemplateIdentity';

const light = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia-light')!;

describe('standard mode template identity', () => {
  it('uses the canonical built-in name when only setting values changed', () => {
    const structure = cloneSmartTemplateStructure(light.structure);
    structure[0].groups[0].entries[0].sections[0].fields[0].value = '已填写内容';

    expect(hasSameTemplateDefinition(structure, light.structure)).toBe(true);
    expect(getCurrentSettingTemplateName({
      version: 2,
      mode: 'template',
      templateId: light.id,
      templateName: '错误的历史名称',
      structure,
    })).toBe('玄幻仙侠（轻量版）');
  });

  it('labels saved or structurally edited templates as custom', () => {
    const editedStructure = cloneSmartTemplateStructure(light.structure);
    editedStructure[0].groups[0].entries[0].sections[0].fields.pop();

    expect(getCurrentSettingTemplateName({
      version: 2,
      mode: 'template',
      templateId: light.id,
      templateName: light.title,
      structure: editedStructure,
    })).toBe('自定义');
    expect(getCurrentSettingTemplateName({
      version: 2,
      mode: 'template',
      templateId: 'setting-template-1',
      templateName: '我的模板',
      structure: light.structure,
    })).toBe('自定义');
  });
});
