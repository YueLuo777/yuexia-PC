import {
  DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS,
  getDefaultWorkSettingEntryId,
  SETTING_TAXONOMY_LEGACY_ENTRY_MAP,
} from '@/features/workbench/model/workbenchSettingTaxonomy';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import { ROLE_TAB, SETTING_TAB } from './workbenchLibraryTabs';
import {
  getRoleBaseSetting,
  parseRoleBaseSettingFields,
  parseRoleContent,
  stringifyRoleBaseSettingFields,
  stringifyRoleContent,
} from './workbenchRoleContent';
import {
  getSettingImportFormatFieldSet,
  parseSectionedSettingBody,
  parseSettingContent,
  stringifySettingContent,
} from './workbenchStructuredSettings';

const LEGACY_CHEAT_ENTRY_ID = '核心设定::主角金手指/优势';

function inferLegacySettingTarget(type: string, title: string) {
  const exact = SETTING_TAXONOMY_LEGACY_ENTRY_MAP[`${type}::${title}`];
  if (exact) return exact;
  if (type === '世界地图') {
    if (/秘境|遗迹/.test(title)) return { type: '秘境遗迹', title };
    if (/禁地|危险|禁区|灾区/.test(title)) return { type: '危险区域', title };
    return { type: '其他地点', title };
  }
  if (type === '怪物列表') return { type: '常见怪物', title };
  return { type, title };
}

function mergeLegacyCheatIntoMaleRole(entries: WorkbenchLibraryEntry[], cheatEntry: WorkbenchLibraryEntry) {
  const sections = parseSectionedSettingBody(parseSettingContent(cheatEntry.content).body);
  const legacyText = [
    ['能力来源', sections['能力来源']],
    ['核心功能', sections['核心功能']],
    ['升级方式', sections['升级方式']],
    ['使用限制', sections['使用限制']],
    ['隐藏真相', sections['隐藏真相']],
  ]
    .filter((item): item is [string, string] => Boolean(item[1]?.trim()))
    .map(([label, value]) => `${label}：${value.trim()}`)
    .join('\n');
  if (!legacyText) return entries;
  const maleIndex = entries.findIndex(
    (entry) => entry.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(entry.content).type),
  );
  if (maleIndex < 0) return entries;
  const maleEntry = entries[maleIndex];
  const role = parseRoleContent(maleEntry.content);
  const fields = parseRoleBaseSettingFields(getRoleBaseSetting(role));
  const abilityRules = [fields.abilityRules.trim(), legacyText]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join('\n\n');
  const baseSetting = stringifyRoleBaseSettingFields({ ...fields, abilityRules });
  const next = [...entries];
  next[maleIndex] = {
    ...maleEntry,
    content: stringifyRoleContent({ ...role, baseSetting, background: baseSetting, personality: '' }),
    updatedAt: new Date().toISOString(),
  };
  return next;
}

export function migratePromptBasedSettingTaxonomy(entries: WorkbenchLibraryEntry[]) {
  const legacyCheatEntry = entries.find((entry) => {
    if (entry.tab !== SETTING_TAB) return false;
    const setting = parseSettingContent(entry.content);
    return (
      setting.lockedDefaultEntryId === LEGACY_CHEAT_ENTRY_ID ||
      (setting.type === '核心设定' && entry.title.trim() === '主角金手指/优势')
    );
  });
  let nextEntries = legacyCheatEntry ? mergeLegacyCheatIntoMaleRole(entries, legacyCheatEntry) : entries;
  let changed = nextEntries !== entries;
  const migratedEntries = nextEntries.flatMap((entry) => {
    if (entry.tab !== SETTING_TAB) return [entry];
    const setting = parseSettingContent(entry.content);
    const legacyId = setting.lockedDefaultEntryId || getDefaultWorkSettingEntryId(setting.type, entry.title);
    if (legacyId === LEGACY_CHEAT_ENTRY_ID) {
      changed = true;
      return [];
    }
    const lockedTarget = SETTING_TAXONOMY_LEGACY_ENTRY_MAP[legacyId];
    const target = lockedTarget ?? inferLegacySettingTarget(setting.type, entry.title.trim());
    const fieldSet = getSettingImportFormatFieldSet(target.type, target.title);
    const nextDefaultId = getDefaultWorkSettingEntryId(target.type, target.title);
    const lockedDefaultEntryId = setting.lockedDefaultEntryId && DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(nextDefaultId)
      ? nextDefaultId
      : undefined;
    const content = stringifySettingContent({
      ...setting,
      type: target.type,
      structuredFieldSetId: fieldSet?.id ?? setting.structuredFieldSetId,
      lockedDefaultEntryId,
    });
    if (target.type === setting.type && target.title === entry.title && content === entry.content) return [entry];
    changed = true;
    return [{ ...entry, title: target.title, content }];
  });
  return changed ? migratedEntries : entries;
}
