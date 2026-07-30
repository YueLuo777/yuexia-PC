import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  getSmartTemplatePackage,
} from './standardModeSmartSettingFlowModel';
import {
  mergeProfessionalSettingValuesIntoTemplate,
  upgradeProfessionalSettingEntriesFromTemplate,
} from './standardModeDefaultSettingAdapter';
import {
  readStandardSettingTemplateState,
  createStandardSettingTemplateState,
  writeStandardSettingTemplateState,
  type StandardSettingTemplateState,
} from './standardModeSettingModel';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
  TemplateSectionNode,
  TemplateStructure,
} from './standardModeTemplateModel';

const XIANXIA_UPGRADE_TARGETS: Record<string, readonly string[]> = {
  'male-fantasy-xianxia-light': ['male-fantasy-xianxia', 'male-fantasy-xianxia-full'],
  'male-fantasy-xianxia': ['male-fantasy-xianxia-full'],
};

export type StandardTemplateUpgradeOption = {
  id: string;
  name: string;
  description: string;
  structure: TemplateStructure;
  addedFieldCount: number;
  targetFieldCount: number;
};

function mergeNodes<T extends { id: string }>(
  current: readonly T[],
  target: readonly T[],
  mergeMatched: (currentNode: T, targetNode: T) => T,
) {
  const currentById = new Map(current.map((node) => [node.id, node]));
  const targetIds = new Set(target.map((node) => node.id));
  return [
    ...target.map((targetNode) => {
      const currentNode = currentById.get(targetNode.id);
      return currentNode ? mergeMatched(currentNode, targetNode) : targetNode;
    }),
    ...current.filter((currentNode) => !targetIds.has(currentNode.id)),
  ];
}

function mergeFields(current: TemplateFieldNode[], target: TemplateFieldNode[]) {
  return mergeNodes(current, target, (currentField, targetField) => ({
    ...targetField,
    ...currentField,
    value: currentField.value ?? targetField.value ?? '',
  }));
}

function mergeSections(current: TemplateSectionNode[], target: TemplateSectionNode[]) {
  return mergeNodes(current, target, (currentSection, targetSection) => ({
    ...targetSection,
    ...currentSection,
    fields: mergeFields(currentSection.fields, targetSection.fields),
  }));
}

function mergeEntries(current: TemplateEntryNode[], target: TemplateEntryNode[]) {
  return mergeNodes(current, target, (currentEntry, targetEntry) => ({
    ...targetEntry,
    ...currentEntry,
    sections: mergeSections(currentEntry.sections, targetEntry.sections),
  }));
}

function mergeGroups(current: TemplateGroupNode[], target: TemplateGroupNode[]) {
  return mergeNodes(current, target, (currentGroup, targetGroup) => ({
    ...targetGroup,
    ...currentGroup,
    entries: mergeEntries(currentGroup.entries, targetGroup.entries),
  }));
}

function mergeDomains(current: TemplateDomainNode[], target: TemplateDomainNode[]) {
  return mergeNodes(current, target, (currentDomain, targetDomain) => ({
    ...targetDomain,
    ...currentDomain,
    groups: mergeGroups(currentDomain.groups, targetDomain.groups),
  }));
}

export function mergeTemplateStructuresForUpgrade(
  current: TemplateStructure,
  target: TemplateStructure,
): TemplateStructure {
  return mergeDomains(current, cloneSmartTemplateStructure(target));
}

export function countTemplateFields(structure: TemplateStructure) {
  return structure.reduce(
    (domainTotal, domain) => domainTotal + domain.groups.reduce(
      (groupTotal, group) => groupTotal + group.entries.reduce(
        (entryTotal, entry) => entryTotal + entry.sections.reduce(
          (sectionTotal, section) => sectionTotal + section.fields.length,
          0,
        ),
        0,
      ),
      0,
    ),
    0,
  );
}

function getTemplateFieldIds(structure: TemplateStructure) {
  return new Set(structure.flatMap((domain) => domain.groups.flatMap((group) =>
    group.entries.flatMap((entry) => entry.sections.flatMap((section) =>
      section.fields.map((field) => field.id),
    )),
  )));
}

export function getStandardTemplateUpgradeOptions(
  currentTemplateId: string,
  currentStructure: TemplateStructure,
): StandardTemplateUpgradeOption[] {
  const currentFieldIds = getTemplateFieldIds(currentStructure);
  return (XIANXIA_UPGRADE_TARGETS[currentTemplateId] ?? []).flatMap((targetId) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === targetId);
    if (!preset) return [];
    const targetFieldIds = getTemplateFieldIds(preset.structure);
    const addedFieldCount = Array.from(targetFieldIds).filter((id) => !currentFieldIds.has(id)).length;
    return [{
      id: preset.id,
      name: preset.title,
      description: preset.description,
      structure: cloneSmartTemplateStructure(preset.structure),
      addedFieldCount,
      targetFieldCount: targetFieldIds.size,
    }];
  });
}

export function upgradeStandardModeBookTemplate(
  novelId: string,
  settingsStorageKey: string,
  target: Pick<StandardTemplateUpgradeOption, 'id' | 'name' | 'structure'>,
): StandardSettingTemplateState | null {
  const current = readStandardSettingTemplateState(novelId);
  if (!current) return null;
  const allowedTarget = getStandardTemplateUpgradeOptions(current.templateId, current.structure)
    .some((option) => option.id === target.id);
  if (!allowedTarget) return null;
  const currentWithProfessionalValues = mergeProfessionalSettingValuesIntoTemplate(
    settingsStorageKey,
    current.structure,
  );
  const targetPreset = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === target.id);
  if (!targetPreset) return null;
  const targetPackage = getSmartTemplatePackage(targetPreset);
  const structure = mergeTemplateStructuresForUpgrade(currentWithProfessionalValues, target.structure);
  const next: StandardSettingTemplateState = createStandardSettingTemplateState({
    templateId: target.id,
    templateName: target.name,
    templateRevision: targetPackage.revision,
    structure,
    generationBlueprint: targetPackage.generationBlueprint,
    promptProfile: {
      ...targetPackage.promptProfile,
      globalGuidance: current.promptProfile.globalGuidance,
      forbiddenGuidance: current.promptProfile.forbiddenGuidance,
      stageGuidance: {
        ...targetPackage.promptProfile.stageGuidance,
        ...current.promptProfile.stageGuidance,
      },
      entryGuidance: {
        ...targetPackage.promptProfile.entryGuidance,
        ...current.promptProfile.entryGuidance,
      },
    },
  });
  upgradeProfessionalSettingEntriesFromTemplate(settingsStorageKey, next.structure, next.generationBlueprint);
  writeStandardSettingTemplateState(novelId, next);
  return next;
}
