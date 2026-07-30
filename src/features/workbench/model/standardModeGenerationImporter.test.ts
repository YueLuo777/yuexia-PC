import { beforeEach, describe, expect, it } from 'vitest';

import { parseSettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import { replaceProfessionalSettingEntriesFromTemplate } from './standardModeDefaultSettingAdapter';
import { importStandardSettingGenerationOutput } from './standardModeGenerationImporter';
import { getStandardSettingGenerationSteps } from './standardModeSettingGenerationFlow';
import { readStandardSettingGenerationTargets } from './standardModeSettingGenerationTargets';
import { createStandardSettingTemplateState, writeStandardSettingTemplateState } from './standardModeSettingModel';
import { buildDefaultTemplateGenerationBlueprint } from './standardModeTemplateGenerationModel';
import { createSmartTemplateStructure } from './standardModeSmartSettingTemplateFactory';
import {
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from './workbenchLibraryStorage';

const novelId = 'generation-importer-test';
const storageKey = `xinyuexia_workbench_settings_${novelId}`;
const structure = createSmartTemplateStructure('importer', [
  ['道具资源', [['功法技能', [['功法档案', ['功法名称', '核心效果']]]]]],
]);

function setup() {
  const generationBlueprint = buildDefaultTemplateGenerationBlueprint(structure);
  const state = createStandardSettingTemplateState({
    templateId: 'custom-importer',
    templateName: '导入测试模板',
    structure,
    generationBlueprint,
  });
  writeStandardSettingTemplateState(novelId, state);
  replaceProfessionalSettingEntriesFromTemplate(storageKey, structure, generationBlueprint);
  const step = getStandardSettingGenerationSteps(storageKey)[0];
  return { step, targets: readStandardSettingGenerationTargets(storageKey, step) };
}

function validOutput(firstName = '太虚经', secondName = '焚天诀') {
  const entry = structure[0].groups[0].entries[0];
  const fields = entry.sections.flatMap((section) => section.fields);
  return `[[SETTING_ENTRY:${entry.id}]]
[[ITEM]]
[[TITLE]]${firstName}
[[FIELD:${fields[0].id}]]${firstName}
[[FIELD:${fields[1].id}]]炼化虚空灵气
[[END_ITEM]]
[[ITEM]]
[[TITLE]]${secondName}
[[FIELD:${fields[0].id}]]${secondName}
[[FIELD:${fields[1].id}]]凝聚焚天真火
[[END_ITEM]]
[[END_SETTING_ENTRY]]`;
}

describe('standard mode generation importer', () => {
  beforeEach(() => localStorage.clear());

  it('replaces an empty collection placeholder with multiple generated instances', () => {
    const { step, targets } = setup();
    const result = importStandardSettingGenerationOutput({
      settingsStorageKey: storageKey,
      output: validOutput(),
      stepId: step.id,
      targets,
    });
    const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
    const imported = entries.filter((entry) => entry.standardTemplateEntryId === targets[0].templateEntryId);

    expect(result.ok).toBe(true);
    expect(imported.map((entry) => entry.title)).toEqual(['太虚经', '焚天诀']);
    expect(imported.every((entry) => entry.standardTemplateGenerated)).toBe(true);
    expect(imported.every((entry) => entry.standardTemplateCollection)).toBe(true);
    expect(parseSettingContent(imported[0].content).body).toContain('炼化虚空灵气');
  });

  it('preserves manual instances and only replaces previously generated instances', () => {
    const { step, targets } = setup();
    importStandardSettingGenerationOutput({
      settingsStorageKey: storageKey,
      output: validOutput(),
      stepId: step.id,
      targets,
    });
    const generated = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
    const generatedTemplateEntry = generated.find((entry) => entry.standardTemplateGenerated)!;
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, [{
      ...generatedTemplateEntry,
      id: 'manual-kungfu',
      title: '用户自建功法',
      standardTemplateGenerated: false,
    }, ...generated]);

    const result = importStandardSettingGenerationOutput({
      settingsStorageKey: storageKey,
      output: validOutput('星河诀', '镇岳功'),
      stepId: step.id,
      targets: readStandardSettingGenerationTargets(storageKey, step),
    });
    const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
    const imported = entries.filter((entry) => entry.standardTemplateEntryId === targets[0].templateEntryId);

    expect(result.ok).toBe(true);
    expect(imported.map((entry) => entry.title)).toEqual(['用户自建功法', '星河诀', '镇岳功']);
  });

  it('does not write any partial result when protocol validation fails', () => {
    const { step, targets } = setup();
    const before = localStorage.getItem(storageKey);
    const result = importStandardSettingGenerationOutput({
      settingsStorageKey: storageKey,
      output: '不符合协议的内容',
      stepId: step.id,
      targets,
    });

    expect(result.ok).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe(before);
  });
});
