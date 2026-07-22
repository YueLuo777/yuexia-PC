import type { StructuredSettingFieldDefinition, StructuredSettingFieldSet } from './workbenchStructuredSettings';

export type CompactStructuredFieldLayout = 'short' | 'medium' | 'half' | 'full';

const SHORT_FIELD_KEYS = new Set([
  'foreshadowCode',
  'firstSeenChapter',
  'recoveredChapter',
  'valueLevel',
  'availableStatus',
  'remainingUses',
  'exposureLevel',
]);

const MEDIUM_FIELD_KEYS = new Set([
  'storyType',
  'abilitySource',
  'entryCondition',
  'currentMastery',
  'breakthroughState',
  'damageSeal',
  'cooldownCost',
  'currentOwnership',
  'activationProgress',
]);

const FULL_FIELD_KEYS = new Set([
  'oneSentenceSummary',
  'hiddenTruth',
  'mapOverview',
  'geographyRules',
  'historyBackground',
  'foreshadowContent',
  'coreConflict',
  'foreshadowing',
  'mainlineRelation',
  'description',
  'functionEffect',
  'ownershipChange',
  'overallPlanning',
  'phasePace',
  'volumeOverview',
  'volumeCoreEvent',
  'volumeClimax',
  'nextVolumeHook',
  'payoffFormula',
]);

export function getCompactStructuredFieldLayout(
  field: StructuredSettingFieldDefinition,
): CompactStructuredFieldLayout {
  if (SHORT_FIELD_KEYS.has(field.key)) return 'short';
  if (MEDIUM_FIELD_KEYS.has(field.key)) return 'medium';
  if (FULL_FIELD_KEYS.has(field.key)) return 'full';
  return 'half';
}

export function getCompactStructuredTitleWidth(fieldSet: StructuredSettingFieldSet) {
  if (fieldSet.id.startsWith('foreshadow-')) return 'w-[320px]';
  if (fieldSet.id === 'monster-list') return 'w-[260px]';
  if (fieldSet.id.startsWith('item-')) return 'w-[240px]';
  if (fieldSet.id.startsWith('faction-')) return 'w-[220px]';
  return 'w-[260px]';
}

export function getCompactStructuredVisibleFieldKeys(
  fieldSet: StructuredSettingFieldSet,
  activeGroupTitle?: string,
) {
  const headerKeys = new Set(fieldSet.headerFieldKeys ?? []);
  if (!fieldSet.groups) return fieldSet.fields.map((field) => field.key).filter((key) => !headerKeys.has(key));
  return fieldSet.groups.find((group) => group.title === activeGroupTitle)?.fieldKeys ?? fieldSet.groups[0]?.fieldKeys ?? [];
}
