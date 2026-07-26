import {
  getDefaultWorkSettingStarterVersionStorageKey,
  getHiddenRoleTypesStorageKey,
  getHiddenSettingTypesStorageKey,
  getRoleTaxonomyDefaultsVersionStorageKey,
  getRoleTypesStorageKey,
  getSettingTaxonomyDefaultsVersionStorageKey,
  getSettingTypeDomainsStorageKey,
  getSettingTypesStorageKey,
  readNormalizedEntriesWithVisibleDefaults,
} from '@/features/workbench/components/workbenchLibraryDataState';
import { ROLE_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';
import {
  getPromptRoleFieldSections,
  getPromptRoleStateKey,
  parsePromptRoleFields,
  stringifyPromptRoleBaseFields,
} from '@/features/workbench/components/workbenchPromptRoleFields';
import {
  getRoleStateSettings,
  parseRoleContent,
  stringifyRoleContent,
} from '@/features/workbench/components/workbenchRoleContent';
import {
  getStructuredSettingFieldSet,
  parseSettingContent,
  parseStructuredSettingFields,
  stringifySettingContent,
  stringifyStructuredSettingFields,
} from '@/features/workbench/components/workbenchStructuredSettings';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  DEFAULT_WORK_SETTING_TYPES,
  SETTING_WORKSPACE_DOMAIN_GROUPS,
} from '@/features/workbench/model/workbenchSettingTaxonomy';

import type {
  StandardSettingEntryDescriptor,
  StandardSettingSectionDescriptor,
} from './standardModeSettingModel';

const DOMAIN_TITLES: Record<string, string> = {
  work: '作品设定',
  character: '人物设定',
  'setting:location': '地点地图',
  'setting:faction': '势力设定',
  'setting:item': '道具资源',
  'setting:foreshadow': '伏笔线索',
  'setting:monster': '怪物图鉴',
};
const DOMAIN_ORDER = ['work', 'character', 'setting:location', 'setting:faction', 'setting:item', 'setting:foreshadow', 'setting:monster'];

const SETTING_DOMAIN_BY_TYPE = new Map(
  Object.entries(SETTING_WORKSPACE_DOMAIN_GROUPS).flatMap(([domainId, groups]) =>
    groups.map((group) => [group, domainId] as const),
  ),
);

function getRoleGroup(type: string) {
  if (type === '男主角' || type === '女主角') return '男女主';
  if (type.includes('反派')) return '反派';
  if (type === '龙套角色') return '其他角色';
  return '重要配角';
}

function getSettingDomain(type: string) {
  if (DEFAULT_WORK_SETTING_TYPES.includes(type)) return 'work';
  return SETTING_DOMAIN_BY_TYPE.get(type) ?? 'work';
}

function buildRoleDescriptor(entry: WorkbenchLibraryEntry): StandardSettingEntryDescriptor {
  const role = parseRoleContent(entry.content);
  const values = parsePromptRoleFields(role);
  const groupTitle = getRoleGroup(role.type);
  return {
    id: entry.id,
    title: entry.title,
    domainId: 'character',
    domainTitle: DOMAIN_TITLES.character,
    groupId: `character:${groupTitle}`,
    groupTitle,
    sourceKind: 'role',
    sourceEntry: entry,
    sections: getPromptRoleFieldSections(role.type).map((section, index) => ({
      id: `${entry.id}:role:${index}`,
      title: section.title,
      fields: section.fields.map((field) => ({
        key: field.key,
        title: field.label,
        placeholder: field.placeholder,
        wide: field.wide,
        value: values[field.key] ?? '',
      })),
    })),
  };
}

function buildSettingDescriptor(entry: WorkbenchLibraryEntry): StandardSettingEntryDescriptor {
  const setting = parseSettingContent(entry.content);
  const fieldSet = getStructuredSettingFieldSet(entry, setting);
  const domainId = getSettingDomain(setting.type);
  const groups = fieldSet?.groups ?? [
    {
      title: entry.title,
      description: '',
      fieldKeys: fieldSet?.fields.map((field) => field.key) ?? ['body'],
    },
  ];
  const values = fieldSet ? parseStructuredSettingFields(setting.body, fieldSet) : { body: setting.body };
  const sections: StandardSettingSectionDescriptor[] = groups.map((group, index) => ({
    id: `${entry.id}:setting:${index}`,
    title: group.title,
    fields: group.fieldKeys.map((key) => {
      const definition = fieldSet?.fields.find((field) => field.key === key);
      return {
        key,
        title: definition?.title ?? '设定内容',
        placeholder: definition?.placeholder ?? '填写设定内容',
        wide: definition?.fieldClassName?.includes('col-span-2') || definition?.displaySize === 'expanded',
        displaySize: definition?.displaySize,
        control: definition?.control,
        maxLength: definition?.maxLength,
        fieldClassName: definition?.fieldClassName,
        value: values[key] ?? '',
      };
    }),
  }));
  return {
    id: entry.id,
    title: entry.title,
    domainId,
    domainTitle: DOMAIN_TITLES[domainId] ?? '作品设定',
    groupId: `${domainId}:${setting.type}`,
    groupTitle: setting.type,
    sourceKind: 'setting',
    sourceEntry: entry,
    sections,
  };
}

export function readDefaultStandardSettingEntries(storageKey: string) {
  const entries = readNormalizedEntriesWithVisibleDefaults(storageKey, [ROLE_TAB, SETTING_TAB]);
  return entries
    .filter((entry) => entry.tab === ROLE_TAB || entry.tab === SETTING_TAB)
    .map((entry) => (entry.tab === ROLE_TAB ? buildRoleDescriptor(entry) : buildSettingDescriptor(entry)))
    .sort((left, right) => DOMAIN_ORDER.indexOf(left.domainId) - DOMAIN_ORDER.indexOf(right.domainId));
}

export function resetStandardModeSettingEntries(storageKey: string) {
  const preservedEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).filter((entry) => {
    const tab = normalizeTabName(entry.tab);
    return tab !== ROLE_TAB && tab !== SETTING_TAB;
  });
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, preservedEntries);
  [
    getDefaultWorkSettingStarterVersionStorageKey(storageKey),
    getRoleTypesStorageKey(storageKey),
    getHiddenRoleTypesStorageKey(storageKey),
    getRoleTaxonomyDefaultsVersionStorageKey(storageKey),
    getSettingTypesStorageKey(storageKey),
    getSettingTypeDomainsStorageKey(storageKey),
    getHiddenSettingTypesStorageKey(storageKey),
    getSettingTaxonomyDefaultsVersionStorageKey(storageKey),
  ].forEach((key) => localStorage.removeItem(key));
}

export function hasStandardModeSettingEntries(storageKey: string) {
  return readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).some((entry) => {
    const tab = normalizeTabName(entry.tab);
    return tab === ROLE_TAB || tab === SETTING_TAB;
  });
}

function updateRoleField(entry: WorkbenchLibraryEntry, fieldKey: string, fieldTitle: string, value: string) {
  const role = parseRoleContent(entry.content);
  const fields = { ...parsePromptRoleFields(role), [fieldKey]: value };
  const stateKey = getPromptRoleStateKey(fieldTitle);
  const nextRole = { ...role };
  if (stateKey) {
    nextRole.stateSettings = { ...getRoleStateSettings(role), [stateKey]: value };
  } else if (fieldTitle === '人物关系') {
    nextRole.relationship = value;
  } else {
    nextRole.baseSetting = stringifyPromptRoleBaseFields(role.type, fields);
  }
  return { ...entry, content: stringifyRoleContent(nextRole), updatedAt: new Date().toLocaleString('zh-CN') };
}

function updateSettingField(entry: WorkbenchLibraryEntry, fieldKey: string, value: string) {
  const setting = parseSettingContent(entry.content);
  const fieldSet = getStructuredSettingFieldSet(entry, setting);
  const body = fieldSet
    ? stringifyStructuredSettingFields(
        { ...parseStructuredSettingFields(setting.body, fieldSet), [fieldKey]: value },
        fieldSet,
      )
    : value;
  return {
    ...entry,
    content: stringifySettingContent({ ...setting, body }),
    updatedAt: new Date().toLocaleString('zh-CN'),
  };
}

export function writeDefaultStandardSettingField(
  storageKey: string,
  entryId: string,
  fieldKey: string,
  fieldTitle: string,
  value: string,
) {
  const entries = readNormalizedEntriesWithVisibleDefaults(storageKey, [ROLE_TAB, SETTING_TAB]);
  const nextEntries = entries.map((entry) => {
    if (entry.id !== entryId) return entry;
    return entry.tab === ROLE_TAB
      ? updateRoleField(entry, fieldKey, fieldTitle, value)
      : updateSettingField(entry, fieldKey, value);
  });
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, nextEntries);
}
