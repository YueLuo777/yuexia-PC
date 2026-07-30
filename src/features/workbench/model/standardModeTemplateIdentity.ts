import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type { StandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import type { TemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';

export const CUSTOM_SETTING_TEMPLATE_ID = 'custom-template';
export const CUSTOM_SETTING_TEMPLATE_NAME = '自定义';

function templateDefinition(structure: TemplateStructure) {
  return JSON.stringify(structure, (key, value) => key === 'value' ? undefined : value);
}

export function hasSameTemplateDefinition(left: TemplateStructure, right: TemplateStructure) {
  return templateDefinition(left) === templateDefinition(right);
}

export function getCurrentSettingTemplateName(template: StandardSettingTemplateState | null) {
  if (!template) return CUSTOM_SETTING_TEMPLATE_NAME;
  const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === template.templateId);
  if (!preset || !hasSameTemplateDefinition(template.structure, preset.structure)) {
    return CUSTOM_SETTING_TEMPLATE_NAME;
  }
  return preset.title;
}
