import { readDefaultStandardSettingEntries } from './standardModeDefaultSettingAdapter';
import { readStandardSettingTemplateState } from './standardModeSettingModel';
import type { StandardSettingGenerationStep } from './standardModeSettingGenerationFlow';
import { normalizeImportedSettingKey } from '@/features/workbench/components/workbenchSmartImport';

export type StandardSettingGenerationTarget = {
  id: string;
  title: string;
  domainId: string;
  domainTitle: string;
  groupTitle: string;
  sourceKind: 'setting' | 'role' | 'custom';
  fieldTitles: string[];
};

const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

function getTemplateEntryIds(settingsStorageKey: string) {
  const novelId = settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
  const templateState = readStandardSettingTemplateState(novelId);
  if (!templateState) return null;
  return new Set(
    templateState.structure
      .filter((domain) => domain.enabled)
      .flatMap((domain) => domain.groups.filter((group) => group.enabled))
      .flatMap((group) => group.entries.filter((entry) => entry.enabled))
      .map((entry) => entry.id),
  );
}

function belongsToStep(target: StandardSettingGenerationTarget, stepId: string) {
  const searchable = `${target.groupTitle} ${target.title}`;
  const isPlotPlanning = /(剧情|主线|分卷|爽点|创作规划|情节)/.test(searchable);
  const isWorldFoundation = /(核心设定|基础设定|世界基础|作品定位|世界背景|力量体系|修炼体系|设定红线)/.test(searchable);
  if (stepId === 'world-foundation') return target.domainId === 'work' && isWorldFoundation;
  if (stepId === 'plot-planning') return target.domainId === 'work' && isPlotPlanning;
  if (stepId === 'main-characters') return target.domainId === 'character';
  if (stepId === 'places-and-factions') {
    return target.domainId === 'setting:location' || target.domainId === 'setting:faction';
  }
  if (stepId === 'creation-supplements') {
    return (target.domainId === 'work' && !isWorldFoundation && !isPlotPlanning)
      || !['work', 'character', 'setting:location', 'setting:faction'].includes(target.domainId);
  }
  return false;
}

export function readStandardSettingGenerationTargets(
  settingsStorageKey: string,
  step: StandardSettingGenerationStep,
) {
  const templateEntryIds = getTemplateEntryIds(settingsStorageKey);
  return readDefaultStandardSettingEntries(settingsStorageKey)
    .filter((entry) => templateEntryIds
      ? templateEntryIds.has(entry.id)
      : entry.sourceKind === 'role'
        || (entry.title === normalizeImportedSettingKey(entry.title) && !/[<>：:]/.test(entry.title)))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      domainId: entry.domainId,
      domainTitle: entry.domainTitle,
      groupTitle: entry.groupTitle,
      sourceKind: entry.sourceKind,
      fieldTitles: entry.sections.flatMap((section) => section.fields.map((field) => field.title)),
    }) satisfies StandardSettingGenerationTarget)
    .filter((entry) => belongsToStep(entry, step.id));
}

export function formatStandardSettingGenerationTargets(targets: StandardSettingGenerationTarget[]) {
  return targets.map((target, index) => [
    `${index + 1}. 设定名：${target.title}`,
    `所属分组：${target.sourceKind === 'role' ? target.domainTitle : target.groupTitle}`,
    `必须填写的原有字段：${target.fieldTitles.join('、') || '设定内容'}`,
  ].join('\n')).join('\n\n');
}

export function buildStandardSettingGenerationOutputTemplate(targets: StandardSettingGenerationTarget[]) {
  return targets.map((target) => {
    const group = target.sourceKind === 'role' ? target.domainTitle : target.groupTitle;
    const fields = target.fieldTitles.length > 0 ? target.fieldTitles : ['设定内容'];
    return [
      `<${group}>`,
      `*${target.title}*：`,
      ...fields.map((field) => `【${field}】：填写该字段内容`),
      `</${group}>`,
    ].join('\n');
  }).join('\n\n');
}
