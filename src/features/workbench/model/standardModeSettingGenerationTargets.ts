import { readDefaultStandardSettingEntries } from './standardModeDefaultSettingAdapter';
import { readStandardSettingTemplateState } from './standardModeSettingModel';
import type { StandardSettingGenerationStep } from './standardModeSettingGenerationFlow';
import type { TemplateEntryGenerationRule } from './standardModeTemplateGenerationModel';

export type StandardSettingGenerationTargetField = {
  id: string;
  title: string;
};

export type StandardSettingGenerationTarget = {
  id: string;
  templateEntryId?: string;
  existingEntryIds?: string[];
  title: string;
  domainId: string;
  domainTitle: string;
  groupTitle: string;
  sourceKind: 'setting' | 'role' | 'custom';
  fields?: StandardSettingGenerationTargetField[];
  fieldTitles: string[];
  rule?: TemplateEntryGenerationRule;
};

const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

function getNovelId(settingsStorageKey: string) {
  return settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
}

function belongsToLegacyStep(
  entry: ReturnType<typeof readDefaultStandardSettingEntries>[number],
  stepId: string,
) {
  if (stepId === 'main-characters') return entry.sourceKind === 'role' || entry.domainId === 'character';
  if (stepId === 'plot-planning') return entry.domainId === 'setting:plot' || /剧情|主线|分卷|爽点/.test(`${entry.groupTitle}${entry.title}`);
  if (stepId === 'places-and-factions') return entry.domainId === 'setting:location' || entry.domainId === 'setting:faction';
  if (stepId === 'world-foundation') return entry.domainId === 'work' && !/剧情|主线|分卷|爽点/.test(`${entry.groupTitle}${entry.title}`);
  if (stepId === 'creation-supplements') {
    return !['work', 'character', 'setting:plot', 'setting:location', 'setting:faction'].includes(entry.domainId);
  }
  return false;
}

function readLegacyTargets(settingsStorageKey: string, step: StandardSettingGenerationStep) {
  return readDefaultStandardSettingEntries(settingsStorageKey)
    .filter((entry) => belongsToLegacyStep(entry, step.id))
    .map((entry): StandardSettingGenerationTarget => {
      const fields = entry.sections.flatMap((section) => section.fields.map((field) => ({
        id: field.key,
        title: field.title,
      })));
      return {
        id: entry.id,
        templateEntryId: entry.id,
        existingEntryIds: [entry.id],
        title: entry.title,
        domainId: entry.domainId,
        domainTitle: entry.domainTitle,
        groupTitle: entry.groupTitle,
        sourceKind: entry.sourceKind,
        fields,
        fieldTitles: fields.map((field) => field.title),
        rule: {
          entryId: entry.id,
          mode: 'single',
          required: true,
          minCount: 1,
          recommendedCount: 1,
          maxCount: 1,
          stageId: step.id,
          dependencyEntryIds: [],
          promptGuidance: '',
        },
      };
    });
}

export function usesTemplateSettingGenerationProtocol(settingsStorageKey: string) {
  return Boolean(readStandardSettingTemplateState(getNovelId(settingsStorageKey)));
}

export function readStandardSettingGenerationTargets(
  settingsStorageKey: string,
  step: StandardSettingGenerationStep,
) {
  const templateState = readStandardSettingTemplateState(getNovelId(settingsStorageKey));
  if (!templateState) return readLegacyTargets(settingsStorageKey, step);
  const descriptors = readDefaultStandardSettingEntries(settingsStorageKey);
  const descriptorIdsByTemplateEntryId = new Map<string, string[]>();
  descriptors.forEach((descriptor) => {
    const templateEntryId = descriptor.sourceEntry?.standardTemplateEntryId ?? descriptor.id;
    descriptorIdsByTemplateEntryId.set(templateEntryId, [
      ...(descriptorIdsByTemplateEntryId.get(templateEntryId) ?? []),
      descriptor.id,
    ]);
  });

  const targets: StandardSettingGenerationTarget[] = [];
  templateState.structure.filter((domain) => domain.enabled).forEach((domain) => {
    domain.groups.filter((group) => group.enabled).forEach((group) => {
      group.entries.filter((entry) => entry.enabled).forEach((entry) => {
        const rule = templateState.generationBlueprint.entryRules[entry.id];
        if (!rule || rule.stageId !== step.id) return;
        const fields = entry.sections
          .filter((section) => section.enabled)
          .flatMap((section) => section.fields
            .filter((field) => field.enabled)
            .map((field) => ({ id: field.id, title: field.title })));
        targets.push({
          id: entry.id,
          templateEntryId: entry.id,
          existingEntryIds: descriptorIdsByTemplateEntryId.get(entry.id) ?? [],
          title: entry.title,
          domainId: domain.id,
          domainTitle: domain.title,
          groupTitle: group.title,
          sourceKind: domain.title === '人物设定' ? 'role' : 'setting',
          fields,
          fieldTitles: fields.map((field) => field.title),
          rule,
        });
      });
    });
  });
  const byId = new Map(targets.map((target) => [target.templateEntryId ?? target.id, target]));
  const ordered: StandardSettingGenerationTarget[] = [];
  const visited = new Set<string>();
  const append = (target: StandardSettingGenerationTarget) => {
    const id = target.templateEntryId ?? target.id;
    if (visited.has(id)) return;
    visited.add(id);
    target.rule?.dependencyEntryIds.forEach((dependencyId) => {
      const dependency = byId.get(dependencyId);
      if (dependency) append(dependency);
    });
    ordered.push(target);
  };
  targets.forEach(append);
  return ordered;
}

export function formatStandardSettingGenerationTargets(targets: StandardSettingGenerationTarget[]) {
  return targets.map((target, index) => [
    `${index + 1}. 设定类型：${target.title}`,
    `所属分组：${target.groupTitle}`,
    target.rule?.mode === 'collection'
      ? `生成数量：推荐 ${target.rule.recommendedCount} 项，允许 ${target.rule.minCount}-${target.rule.maxCount} 项`
      : '生成数量：固定 1 项',
    `必须填写字段：${target.fieldTitles.join('、') || '设定内容'}`,
  ].join('\n')).join('\n\n');
}

function buildItemProtocol(target: StandardSettingGenerationTarget) {
  const fields = target.fields ?? target.fieldTitles.map((title, index) => ({
    id: `legacy-field-${index + 1}`,
    title,
  }));
  return [
    '[[ITEM]]',
    `[[TITLE]]${target.rule?.titleFieldId ? '填写真实名称' : target.title}`,
    ...fields.map((field) => `[[FIELD:${field.id}]]填写“${field.title}”的完整内容`),
    '[[END_ITEM]]',
  ].join('\n');
}

export function buildStandardSettingGenerationOutputTemplate(targets: StandardSettingGenerationTarget[]) {
  return targets.map((target) => [
    `[[SETTING_ENTRY:${target.templateEntryId ?? target.id}]]`,
    buildItemProtocol(target),
    ...(target.rule?.mode === 'collection' && target.rule.recommendedCount > 1
      ? [`（请按相同格式继续输出到共 ${target.rule.recommendedCount} 个 [[ITEM]]）`]
      : []),
    '[[END_SETTING_ENTRY]]',
  ].join('\n')).join('\n\n');
}
