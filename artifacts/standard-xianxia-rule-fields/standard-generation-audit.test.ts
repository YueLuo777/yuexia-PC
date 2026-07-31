import { beforeEach, describe, expect, it } from 'vitest';

import {
  readDefaultStandardSettingEntries,
  replaceProfessionalSettingEntriesFromTemplate,
} from '../../src/features/workbench/model/standardModeDefaultSettingAdapter';
import { hasStandardModeSettingContent } from '../../src/features/workbench/model/standardModeSettingContent';
import { writeStandardSettingTemplateState } from '../../src/features/workbench/model/standardModeSettingModel';
import {
  getStandardSettingGenerationSteps,
} from '../../src/features/workbench/model/standardModeSettingGenerationFlow';
import { readStandardSettingGenerationTargets } from '../../src/features/workbench/model/standardModeSettingGenerationTargets';
import { MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE } from '../../src/features/workbench/model/standardModeXianxiaSettingTemplates';
import {
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '../../src/features/workbench/model/workbenchLibraryStorage';

const novelId = 'standard-generation-audit';
const storageKey = `xinyuexia_workbench_settings_${novelId}`;

function initializeStandardTemplate() {
  replaceProfessionalSettingEntriesFromTemplate(storageKey, MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE);
  writeStandardSettingTemplateState(novelId, {
    version: 2,
    mode: 'template',
    templateId: 'male-fantasy-xianxia',
    templateName: '玄幻仙侠（标准版）',
    structure: MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
  });
}

describe('standard xianxia generation compatibility audit', () => {
  beforeEach(() => localStorage.clear());

  it('keeps every template field separately addressable and assigns every entry once', () => {
    initializeStandardTemplate();
    const descriptorFields = new Map(readDefaultStandardSettingEntries(storageKey).map((entry) => [
      entry.id,
      entry.sections.flatMap((section) => section.fields.map((field) => field.title)),
    ]));
    const templateEntries = MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE
      .flatMap((domain) => domain.groups.flatMap((group) => group.entries));
    const nonRoleTemplateEntries = MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE
      .filter((domain) => domain.title !== '人物设定')
      .flatMap((domain) => domain.groups.flatMap((group) => group.entries));
    nonRoleTemplateEntries.forEach((entry) => {
      expect(descriptorFields.get(entry.id)).toEqual(
        entry.sections.flatMap((section) => section.fields.map((field) => field.title)),
      );
    });
    const targets = getStandardSettingGenerationSteps(storageKey)
      .flatMap((step) => readStandardSettingGenerationTargets(storageKey, step));
    expect(targets).toHaveLength(templateEntries.length);
    expect(new Set(targets.map((target) => target.id)).size).toBe(templateEntries.length);
  });

  it('preserves the field layout and detects content after one-click-style import', () => {
    initializeStandardTemplate();
    const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
    const worldRules = entries.find((entry) => entry.title === '世界规则')!;
    const parsed = JSON.parse(worldRules.content);
    parsed.body = parsed.body.replace('【生死规则】：\n', '【生死规则】：\n一键生成的生死规则');
    worldRules.content = JSON.stringify(parsed);
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, entries);

    const template = JSON.parse(localStorage.getItem(`xinyuexia_standard_setting_template_${novelId}`) ?? 'null');
    expect(hasStandardModeSettingContent(storageKey, template)).toBe(true);
    const migratedWorldRules = readDefaultStandardSettingEntries(storageKey).find((entry) => entry.title === '世界规则')!;
    expect(migratedWorldRules.sections.flatMap((section) => section.fields).map((field) => field.title)).toEqual([
      '生死规则', '寿命规则', '灵魂规则', '天劫规则', '气运规则',
    ]);
    expect(migratedWorldRules.sections.flatMap((section) => section.fields)[0].value).toBe('一键生成的生死规则');
  });
});
