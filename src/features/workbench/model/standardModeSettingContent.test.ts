import { beforeEach, describe, expect, it } from 'vitest';

import {
  readDefaultStandardSettingEntries,
  replaceProfessionalSettingEntriesFromTemplate,
  writeDefaultStandardSettingField,
} from './standardModeDefaultSettingAdapter';
import { hasStandardModeSettingContent } from './standardModeSettingContent';
import { SMART_TEMPLATE_PRESETS, cloneSmartTemplateStructure } from './standardModeSmartSettingFlowModel';

const storageKey = 'xinyuexia_workbench_settings_content-test';
const light = SMART_TEMPLATE_PRESETS.find((item) => item.id === 'male-fantasy-xianxia-light')!;

describe('standard mode setting content detection', () => {
  beforeEach(() => localStorage.clear());

  it('does not treat an empty template skeleton as filled setting content', () => {
    const structure = cloneSmartTemplateStructure(light.structure);
    replaceProfessionalSettingEntriesFromTemplate(storageKey, structure);

    expect(hasStandardModeSettingContent(storageKey, {
      version: 2,
      mode: 'template',
      templateId: light.id,
      templateName: light.title,
      structure,
    })).toBe(false);
  });

  it('detects actual values from the template or normalized setting entries', () => {
    const structure = cloneSmartTemplateStructure(light.structure);
    replaceProfessionalSettingEntriesFromTemplate(storageKey, structure);
    const firstEntry = readDefaultStandardSettingEntries(storageKey)
      .find((entry) => entry.sections.some((section) => section.fields.length > 0))!;
    const firstField = firstEntry.sections.flatMap((section) => section.fields)[0];
    writeDefaultStandardSettingField(
      storageKey,
      firstEntry.id,
      firstField.key,
      firstField.title,
      '已填写设定',
    );
    expect(hasStandardModeSettingContent(storageKey, null)).toBe(true);

    localStorage.clear();
    structure[0].groups[0].entries[0].sections[0].fields[0].value = '模板内容';
    expect(hasStandardModeSettingContent(storageKey, {
      version: 2,
      mode: 'template',
      templateId: light.id,
      templateName: light.title,
      structure,
    })).toBe(true);
  });
});
