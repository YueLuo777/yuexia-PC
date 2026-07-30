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

function getTemplateContext(settingsStorageKey: string) {
  const novelId = settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
  const templateState = readStandardSettingTemplateState(novelId);
  if (!templateState) return { templateId: '', entryIds: null };
  return {
    templateId: templateState.templateId,
    entryIds: new Set(templateState.structure
      .filter((domain) => domain.enabled)
      .flatMap((domain) => domain.groups.filter((group) => group.enabled))
      .flatMap((group) => group.entries.filter((entry) => entry.enabled))
      .map((entry) => entry.id)),
  };
}

function belongsToXianxiaStep(target: StandardSettingGenerationTarget, stepId: string) {
  const searchable = `${target.domainTitle} ${target.groupTitle} ${target.title}`;
  const isPlotPlanning = /(剧情规划|全书规划|故事主线|主角成长线|分卷|第一卷|冲突|爽点|悬念|节奏|情节)/.test(searchable);
  const isMainCharacter = target.domainId === 'character' || target.sourceKind === 'role';
  const isGoldFinger = /金手指/.test(searchable);
  const isPlacesAndFactions = !isPlotPlanning && (
    target.domainId === 'setting:location'
    || target.domainId === 'setting:faction'
    || /(地点|地图|区域|秘境|遗迹|势力|宗门|组织|阵营|王朝|家族)/.test(searchable)
  );
  const isWorldFoundation = !isPlotPlanning && !isGoldFinger && !isPlacesAndFactions && (
    /(核心设定|作品定位|核心脑洞|世界|力量体系|修炼资源|天赋|资质|社会|文明|经济|文化|规则|设定红线)/.test(searchable)
  );
  if (stepId === 'world-foundation') return isWorldFoundation;
  if (stepId === 'main-characters') return isMainCharacter || isGoldFinger || /主角成长线/.test(searchable);
  if (stepId === 'plot-planning') return isPlotPlanning && !/主角成长线/.test(searchable);
  if (stepId === 'places-and-factions') return isPlacesAndFactions;
  if (stepId === 'creation-supplements') {
    return !isWorldFoundation && !isMainCharacter && !isGoldFinger && !isPlotPlanning && !isPlacesAndFactions;
  }
  return false;
}

function belongsToStep(target: StandardSettingGenerationTarget, stepId: string, templateId: string) {
  if (['male-fantasy-xianxia-light', 'male-fantasy-xianxia', 'male-fantasy-xianxia-full'].includes(templateId)) {
    return belongsToXianxiaStep(target, stepId);
  }
  const searchable = `${target.groupTitle} ${target.title}`;
  const isPlotPlanning = /(剧情|主线|分卷|爽点|创作规划|情节)/.test(searchable);
  const isWorldFoundation = /(核心设定|基础设定|世界基础|作品定位|世界背景|力量体系|修炼体系|设定红线)/.test(searchable);
  const isPlacesAndFactions = !isPlotPlanning && (
    target.domainId === 'setting:location'
    || target.domainId === 'setting:faction'
    || /(地点|地图|区域|势力|宗门|组织|阵营)/.test(searchable)
  );
  if (stepId === 'world-foundation') return target.domainId === 'work' && isWorldFoundation;
  if (stepId === 'plot-planning') return target.domainId === 'work' && isPlotPlanning;
  if (stepId === 'main-characters') return target.domainId === 'character';
  if (stepId === 'places-and-factions') return isPlacesAndFactions;
  if (stepId === 'creation-supplements') {
    return (target.domainId === 'work' && !isWorldFoundation && !isPlotPlanning && !isPlacesAndFactions)
      || !['work', 'character', 'setting:location', 'setting:faction'].includes(target.domainId);
  }
  return false;
}

export function readStandardSettingGenerationTargets(
  settingsStorageKey: string,
  step: StandardSettingGenerationStep,
) {
  const templateContext = getTemplateContext(settingsStorageKey);
  return readDefaultStandardSettingEntries(settingsStorageKey)
    .filter((entry) => templateContext.entryIds
      ? templateContext.entryIds.has(entry.id)
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
    .filter((entry) => belongsToStep(entry, step.id, templateContext.templateId));
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
