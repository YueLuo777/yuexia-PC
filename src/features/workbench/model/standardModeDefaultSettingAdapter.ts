import {
  getDefaultWorkSettingStarterVersionStorageKey,
  getHiddenRoleTypesStorageKey,
  getHiddenSettingTypesStorageKey,
  getRoleTaxonomyDefaultsVersionStorageKey,
  getRoleTypesStorageKey,
  getSettingTaxonomyDefaultsVersionStorageKey,
  DEFAULT_ROLE_TYPES,
  ROLE_TAXONOMY_DEFAULTS_VERSION,
  SETTING_TAXONOMY_DEFAULTS_VERSION,
  getSettingTypeDomainsStorageKey,
  getSettingTypesStorageKey,
  readNormalizedEntriesWithVisibleDefaults,
} from '@/features/workbench/components/workbenchLibraryDataState';
import { ROLE_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';
import {
  normalizeImportedSettingBody,
  normalizeImportedSettingKey,
} from '@/features/workbench/components/workbenchSmartImport';
import {
  getPromptRoleFieldSections,
  getPromptRoleStateKey,
  parsePromptRoleFields,
  stringifyPromptRoleBaseFields,
} from '@/features/workbench/components/workbenchPromptRoleFields';
import {
  createEmptyRoleStateSettings,
  getRoleBaseSetting,
  getRoleStateSettings,
  parseRoleContent,
  stringifyRoleContent,
} from '@/features/workbench/components/workbenchRoleContent';
import {
  getSettingImportFormatFieldSet,
  getStructuredSettingFieldSet,
  parseSectionedSettingBody,
  parseSettingContent,
  parseStructuredSettingFields,
  stringifySettingContent,
  stringifyStructuredSettingFields,
} from '@/features/workbench/components/workbenchStructuredSettings';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  DEFAULT_SETTING_TYPES,
  DEFAULT_SETTING_TYPE_DOMAINS,
  DEFAULT_WORK_SETTING_STARTER_VERSION,
  DEFAULT_WORK_SETTING_TYPES,
  SETTING_WORKSPACE_DOMAIN_GROUPS,
} from '@/features/workbench/model/workbenchSettingTaxonomy';

import type { StandardSettingEntryDescriptor, StandardSettingSectionDescriptor } from './standardModeSettingModel';
import type { TemplateGenerationBlueprint } from './standardModeTemplateGenerationModel';
import type { TemplateEntryNode, TemplateStructure } from './standardModeTemplateModel';

const DOMAIN_TITLES: Record<string, string> = {
  work: '作品设定',
  'setting:plot': '剧情规划',
  character: '人物设定',
  'setting:location': '地点地图',
  'setting:faction': '势力设定',
  'setting:item': '道具资源',
  'setting:foreshadow': '伏笔线索',
  'setting:monster': '怪物图鉴',
};
const DOMAIN_ORDER = [
  'work',
  'setting:plot',
  'character',
  'setting:location',
  'setting:faction',
  'setting:item',
  'setting:foreshadow',
  'setting:monster',
];

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

const TEMPLATE_WORKSPACE_DOMAINS: Record<string, string> = {
  作品设定: 'work',
  剧情规划: 'setting:plot',
  地点地图: 'setting:location',
  势力设定: 'setting:faction',
  道具资源: 'setting:item',
  伏笔线索: 'setting:foreshadow',
  怪物图鉴: 'setting:monster',
};

function getTemplateWorkspaceDomain(domainTitle: string) {
  return TEMPLATE_WORKSPACE_DOMAINS[domainTitle] ?? 'work';
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

function buildSettingDescriptor(
  entry: WorkbenchLibraryEntry,
  storedTypeDomains: Record<string, string>,
): StandardSettingEntryDescriptor {
  const setting = parseSettingContent(entry.content);
  const fieldSet = getStructuredSettingFieldSet(entry, setting);
  const storedDomain = storedTypeDomains[setting.type];
  const domainId = storedDomain && DOMAIN_TITLES[storedDomain] ? storedDomain : getSettingDomain(setting.type);
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
  const storedTypeDomains = readStoredTypeDomains(storageKey);
  const entries = readNormalizedEntriesWithVisibleDefaults(storageKey, [ROLE_TAB, SETTING_TAB]);
  return entries
    .filter((entry) => entry.tab === ROLE_TAB || entry.tab === SETTING_TAB)
    .map((entry) => (entry.tab === ROLE_TAB
      ? buildRoleDescriptor(entry)
      : buildSettingDescriptor(entry, storedTypeDomains)))
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

function getEnabledTemplateFields(structure: TemplateStructure) {
  return structure
    .filter((domain) => domain.enabled)
    .flatMap((domain) =>
      domain.groups
        .filter((group) => group.enabled)
        .flatMap((group) =>
          group.entries
            .filter((entry) => entry.enabled)
            .map((entry) => ({
              domain,
              group,
              entry,
              fields: entry.sections
                .filter((section) => section.enabled)
                .flatMap((section) => section.fields.filter((field) => field.enabled)),
            })),
        ),
    );
}

function createRoleEntryFromTemplate(
  item: ReturnType<typeof getEnabledTemplateFields>[number],
  generationBlueprint?: TemplateGenerationBlueprint,
): WorkbenchLibraryEntry {
  const roleType = item.entry.title.trim() || '未分类';
  const stateSettings = createEmptyRoleStateSettings();
  let relationship = '';
  const baseFields: string[] = [];

  item.fields.forEach((field) => {
    const value = field.value?.trim() ?? '';
    const stateKey = getPromptRoleStateKey(field.title);
    if (stateKey) {
      stateSettings[stateKey] = value;
    } else if (field.title === '人物关系') {
      relationship = value;
    } else {
      baseFields.push(`【${field.title}】：\n${value}`);
    }
  });

  return {
    ...createWorkbenchLibraryEntry(ROLE_TAB, item.entry.title.trim() || roleType),
    id: item.entry.id,
    standardTemplateEntryId: item.entry.id,
    standardTemplatePlaceholder: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
    standardTemplateCollection: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
    content: stringifyRoleContent({
      type: roleType,
      lifeStatus: '存活',
      baseSetting: baseFields.join('\n\n'),
      relationship,
      stateSettings,
      stateUpdateChapters: {},
      personality: '',
      background: '',
      status: '',
      history: [],
    }),
  };
}

function createSettingEntryFromTemplate(
  item: ReturnType<typeof getEnabledTemplateFields>[number],
  generationBlueprint?: TemplateGenerationBlueprint,
): WorkbenchLibraryEntry {
  const settingType = item.group.title.trim() || '未分类';
  const title = item.entry.title.trim() || '新建设定';
  const fieldSet = getMatchingTemplateFieldSet(item);
  const templateFieldLayout = fieldSet ? undefined : buildTemplateFieldLayout(item.entry);
  const body = item.fields.map((field) => `【${field.title}】：\n${field.value?.trim() ?? ''}`).join('\n\n');

  return {
    ...createWorkbenchLibraryEntry(SETTING_TAB, title),
    id: item.entry.id,
    standardTemplateEntryId: item.entry.id,
    standardTemplatePlaceholder: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
    standardTemplateCollection: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
    content: stringifySettingContent({
      type: settingType,
      body,
      templateFieldLayout,
      ...(fieldSet ? { structuredFieldSetId: fieldSet.id } : {}),
    }),
  };
}

function getMatchingTemplateFieldSet(item: ReturnType<typeof getEnabledTemplateFields>[number]) {
  const settingType = item.group.title.trim() || '未分类';
  const title = item.entry.title.trim() || '新建设定';
  const fieldSet = getSettingImportFormatFieldSet(settingType, title);
  const templateFieldTitles = item.fields.map((field) => field.title);
  const fieldSetMatches = Boolean(
    fieldSet &&
    fieldSet.fields.length === templateFieldTitles.length &&
    fieldSet.fields.every((field, index) => field.title === templateFieldTitles[index]),
  );
  return fieldSetMatches ? fieldSet : null;
}

function buildTemplateFieldLayout(entry: TemplateEntryNode) {
  return {
    id: `template-layout:${entry.id}`,
    sections: entry.sections
      .filter((section) => section.enabled)
      .map((section) => ({
        title: section.title,
        fields: section.fields
          .filter((field) => field.enabled)
          .map((field) => ({
            key: field.id,
            title: field.title,
            placeholder: field.placeholder || `填写${field.title}`,
            control: field.control,
            maxLength: field.maxLength,
            fieldClassName: field.fieldClassName,
            displaySize: field.displaySize,
          })),
      }))
      .filter((section) => section.fields.length > 0),
  };
}

export function replaceProfessionalSettingEntriesFromTemplate(
  storageKey: string,
  structure: TemplateStructure,
  generationBlueprint?: TemplateGenerationBlueprint,
) {
  resetStandardModeSettingEntries(storageKey);
  const enabledItems = getEnabledTemplateFields(structure);
  const roleItems = enabledItems.filter((item) => item.domain.title === '人物设定');
  const settingItems = enabledItems.filter((item) => item.domain.title !== '人物设定');
  const roleTypes = Array.from(new Set(roleItems.map((item) => item.entry.title.trim()).filter(Boolean)));
  const settingTypes = Array.from(new Set(settingItems.map((item) => item.group.title.trim()).filter(Boolean)));
  const customSettingTypeDomains = Object.fromEntries(
    settingItems
      .filter((item) => item.group.title.trim())
      .map((item) => [item.group.title.trim(), getTemplateWorkspaceDomain(item.domain.title)]),
  );

  localStorage.setItem(
    getRoleTypesStorageKey(storageKey),
    JSON.stringify(roleTypes.filter((type) => !DEFAULT_ROLE_TYPES.includes(type))),
  );
  localStorage.setItem(
    getHiddenRoleTypesStorageKey(storageKey),
    JSON.stringify(DEFAULT_ROLE_TYPES.filter((type) => !roleTypes.includes(type))),
  );
  localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
  localStorage.setItem(
    getSettingTypesStorageKey(storageKey),
    JSON.stringify(settingTypes.filter((type) => !DEFAULT_SETTING_TYPES.includes(type))),
  );
  localStorage.setItem(
    getHiddenSettingTypesStorageKey(storageKey),
    JSON.stringify(DEFAULT_SETTING_TYPES.filter((type) => !settingTypes.includes(type))),
  );
  localStorage.setItem(
    getSettingTypeDomainsStorageKey(storageKey),
    JSON.stringify({ ...DEFAULT_SETTING_TYPE_DOMAINS, ...customSettingTypeDomains }),
  );
  localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
  localStorage.setItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey), DEFAULT_WORK_SETTING_STARTER_VERSION);

  const preservedEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).filter((entry) => {
    const tab = normalizeTabName(entry.tab);
    return tab !== ROLE_TAB && tab !== SETTING_TAB;
  });
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, [
    ...roleItems.map((item) => createRoleEntryFromTemplate(item, generationBlueprint)),
    ...settingItems.map((item) => createSettingEntryFromTemplate(item, generationBlueprint)),
    ...preservedEntries,
  ]);
}

function getProfessionalEntryFieldValues(entry: WorkbenchLibraryEntry, roleEntry: boolean) {
  if (!roleEntry) return parseSectionedSettingBody(parseSettingContent(entry.content).body);
  const role = parseRoleContent(entry.content);
  const values = parseSectionedSettingBody(getRoleBaseSetting(role));
  const stateSettings = getRoleStateSettings(role);
  Object.entries(stateSettings).forEach(([key, value]) => {
    const field = getPromptRoleFieldSections(role.type)
      .flatMap((section) => section.fields)
      .find((item) => getPromptRoleStateKey(item.label) === key);
    if (field) values[field.label] = value;
  });
  if (role.relationship.trim()) values['人物关系'] = role.relationship;
  return values;
}

export function mergeProfessionalSettingValuesIntoTemplate(
  storageKey: string,
  structure: TemplateStructure,
): TemplateStructure {
  const entriesById = new Map(
    readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).map((entry) => [entry.id, entry]),
  );
  return structure.map((domain) => ({
    ...domain,
    groups: domain.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => {
        const professionalEntry = entriesById.get(entry.id);
        if (!professionalEntry) return entry;
        const values = getProfessionalEntryFieldValues(
          professionalEntry,
          normalizeTabName(professionalEntry.tab) === ROLE_TAB,
        );
        return {
          ...entry,
          sections: entry.sections.map((section) => ({
            ...section,
            fields: section.fields.map((field) => ({
              ...field,
              value: values[field.title]?.trim() ? values[field.title] : (field.value ?? ''),
            })),
          })),
        };
      }),
    })),
  }));
}

function appendUnmappedSections(body: string, existingBody: string, targetTitles: Set<string>) {
  const extras = Object.entries(parseSectionedSettingBody(existingBody))
    .filter(([title]) => !targetTitles.has(title))
    .map(([title, value]) => `【${title}】：\n${value}`);
  return [body.trim(), ...extras].filter(Boolean).join('\n\n');
}

function mergeSettingEntryForUpgrade(
  existing: WorkbenchLibraryEntry,
  item: ReturnType<typeof getEnabledTemplateFields>[number],
) {
  const generatedSetting = parseSettingContent(createSettingEntryFromTemplate(item).content);
  const existingSetting = parseSettingContent(existing.content);
  const targetTitles = new Set(item.fields.map((field) => field.title));
  return {
    ...existing,
    content: stringifySettingContent({
      ...existingSetting,
      type: item.group.title.trim() || existingSetting.type,
      body: appendUnmappedSections(generatedSetting.body, existingSetting.body, targetTitles),
      structuredFieldSetId: generatedSetting.structuredFieldSetId,
      templateFieldLayout: generatedSetting.templateFieldLayout,
    }),
    updatedAt: new Date().toLocaleString('zh-CN'),
  };
}

export function syncProfessionalSettingFieldLayoutsFromTemplate(
  storageKey: string,
  structure: TemplateStructure,
  generationBlueprint?: TemplateGenerationBlueprint,
) {
  const currentTypeDomains = readStoredTypeDomains(storageKey);
  const templateTypeDomains = Object.fromEntries(
    getEnabledTemplateFields(structure)
      .filter((item) => item.domain.title !== '人物设定' && item.group.title.trim())
      .map((item) => [item.group.title.trim(), getTemplateWorkspaceDomain(item.domain.title)]),
  );
  const nextTypeDomains = { ...currentTypeDomains, ...templateTypeDomains };
  const typeDomainsChanged = JSON.stringify(currentTypeDomains) !== JSON.stringify(nextTypeDomains);
  if (typeDomainsChanged) {
    localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextTypeDomains));
  }
  const layoutsByEntryId = new Map(
    getEnabledTemplateFields(structure)
      .filter((item) => item.domain.title !== '人物设定')
      .filter((item) => !getMatchingTemplateFieldSet(item))
      .map((item) => [item.entry.id, buildTemplateFieldLayout(item.entry)] as const),
  );
  const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
  let changed = false;
  const nextEntries = entries.map((entry) => {
    const templateEntryId = entry.standardTemplateEntryId ?? entry.id;
    const rule = generationBlueprint?.entryRules[templateEntryId];
    const metadataChanged = Boolean(rule) && (
      entry.standardTemplateEntryId !== templateEntryId
      || entry.standardTemplateCollection !== (rule?.mode === 'collection')
    );
    const layout = layoutsByEntryId.get(templateEntryId);
    const setting = normalizeTabName(entry.tab) === SETTING_TAB ? parseSettingContent(entry.content) : null;
    const layoutChanged = Boolean(layout && setting)
      && JSON.stringify(setting?.templateFieldLayout) !== JSON.stringify(layout);
    if (!metadataChanged && !layoutChanged) return entry;
    changed = true;
    return {
      ...entry,
      ...(rule ? {
        standardTemplateEntryId: templateEntryId,
        standardTemplateCollection: rule.mode === 'collection',
        standardTemplatePlaceholder: entry.standardTemplateGenerated
          ? false
          : entry.standardTemplatePlaceholder ?? rule.mode === 'collection',
      } : {}),
      ...(layout && setting
        ? { content: stringifySettingContent({ ...setting, templateFieldLayout: layout }) }
        : {}),
    };
  });
  if (changed) writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, nextEntries);
  return changed || typeDomainsChanged;
}

function mergeRoleEntryForUpgrade(
  existing: WorkbenchLibraryEntry,
  item: ReturnType<typeof getEnabledTemplateFields>[number],
) {
  const generatedRole = parseRoleContent(createRoleEntryFromTemplate(item).content);
  const existingRole = parseRoleContent(existing.content);
  const targetTitles = new Set(item.fields.map((field) => field.title));
  const existingStateSettings = getRoleStateSettings(existingRole);
  const generatedStateSettings = getRoleStateSettings(generatedRole);
  const mergedStateSettings = createEmptyRoleStateSettings();
  (Object.keys(mergedStateSettings) as Array<keyof typeof mergedStateSettings>).forEach((key) => {
    mergedStateSettings[key] = generatedStateSettings[key]?.trim()
      ? generatedStateSettings[key]
      : existingStateSettings[key];
  });
  return {
    ...existing,
    content: stringifyRoleContent({
      ...existingRole,
      baseSetting: appendUnmappedSections(
        getRoleBaseSetting(generatedRole),
        getRoleBaseSetting(existingRole),
        targetTitles,
      ),
      relationship: generatedRole.relationship || existingRole.relationship,
      stateSettings: mergedStateSettings,
    }),
    updatedAt: new Date().toLocaleString('zh-CN'),
  };
}

function readStoredTypeDomains(storageKey: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(getSettingTypeDomainsStorageKey(storageKey)) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

export function upgradeProfessionalSettingEntriesFromTemplate(
  storageKey: string,
  structure: TemplateStructure,
  generationBlueprint?: TemplateGenerationBlueprint,
) {
  const enabledItems = getEnabledTemplateFields(structure);
  const roleItems = enabledItems.filter((item) => item.domain.title === '人物设定');
  const settingItems = enabledItems.filter((item) => item.domain.title !== '人物设定');
  const existingEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
  const existingById = new Map(existingEntries.map((entry) => [entry.id, entry]));
  const targetIds = new Set(enabledItems.map((item) => item.entry.id));
  const existingRoleTypes = existingEntries
    .filter((entry) => normalizeTabName(entry.tab) === ROLE_TAB)
    .map((entry) => parseRoleContent(entry.content).type.trim())
    .filter(Boolean);
  const existingSettingTypes = existingEntries
    .filter((entry) => normalizeTabName(entry.tab) === SETTING_TAB)
    .map((entry) => parseSettingContent(entry.content).type.trim())
    .filter(Boolean);
  const roleTypes = Array.from(new Set([
    ...existingRoleTypes,
    ...roleItems.map((item) => item.entry.title.trim()).filter(Boolean),
  ]));
  const settingTypes = Array.from(new Set([
    ...existingSettingTypes,
    ...settingItems.map((item) => item.group.title.trim()).filter(Boolean),
  ]));
  const customSettingTypeDomains = Object.fromEntries(
    settingItems
      .filter((item) => item.group.title.trim())
      .map((item) => [item.group.title.trim(), getTemplateWorkspaceDomain(item.domain.title)]),
  );

  localStorage.setItem(
    getRoleTypesStorageKey(storageKey),
    JSON.stringify(roleTypes.filter((type) => !DEFAULT_ROLE_TYPES.includes(type))),
  );
  localStorage.setItem(
    getHiddenRoleTypesStorageKey(storageKey),
    JSON.stringify(DEFAULT_ROLE_TYPES.filter((type) => !roleTypes.includes(type))),
  );
  localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
  localStorage.setItem(
    getSettingTypesStorageKey(storageKey),
    JSON.stringify(settingTypes.filter((type) => !DEFAULT_SETTING_TYPES.includes(type))),
  );
  localStorage.setItem(
    getHiddenSettingTypesStorageKey(storageKey),
    JSON.stringify(DEFAULT_SETTING_TYPES.filter((type) => !settingTypes.includes(type))),
  );
  localStorage.setItem(
    getSettingTypeDomainsStorageKey(storageKey),
    JSON.stringify({ ...DEFAULT_SETTING_TYPE_DOMAINS, ...readStoredTypeDomains(storageKey), ...customSettingTypeDomains }),
  );
  localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
  localStorage.setItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey), DEFAULT_WORK_SETTING_STARTER_VERSION);

  const upgradedTemplateEntries = [
    ...roleItems.map((item) => {
      const existing = existingById.get(item.entry.id);
      return existing
        ? {
            ...mergeRoleEntryForUpgrade(existing, item),
            standardTemplateEntryId: item.entry.id,
            standardTemplateCollection: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
          }
        : createRoleEntryFromTemplate(item, generationBlueprint);
    }),
    ...settingItems.map((item) => {
      const existing = existingById.get(item.entry.id);
      return existing
        ? {
            ...mergeSettingEntryForUpgrade(existing, item),
            standardTemplateEntryId: item.entry.id,
            standardTemplateCollection: generationBlueprint?.entryRules[item.entry.id]?.mode === 'collection',
          }
        : createSettingEntryFromTemplate(item, generationBlueprint);
    }),
  ];
  const preservedEntries = existingEntries.filter((entry) => !targetIds.has(entry.id));
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, [
    ...upgradedTemplateEntries,
    ...preservedEntries,
  ]);
}

export function hasStandardModeSettingEntries(storageKey: string) {
  return readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).some((entry) => {
    const tab = normalizeTabName(entry.tab);
    return tab === ROLE_TAB || tab === SETTING_TAB;
  });
}

export function repairStandardModeGeneratedSettingEntries(storageKey: string) {
  const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey);
  const settingGroups = new Map<string, WorkbenchLibraryEntry[]>();

  entries.forEach((entry) => {
    if (normalizeTabName(entry.tab) !== SETTING_TAB) return;
    const setting = parseSettingContent(entry.content);
    const cleanTitle = normalizeImportedSettingKey(entry.title);
    const key = `${normalizeImportedSettingKey(setting.type)}::${cleanTitle}`;
    settingGroups.set(key, [...(settingGroups.get(key) ?? []), entry]);
  });

  let changed = false;
  const repairedByWinnerId = new Map<string, WorkbenchLibraryEntry>();
  const droppedIds = new Set<string>();
  Array.from(settingGroups.values()).forEach((group) => {
    const winner =
      group.find((entry) => Boolean(parseSettingContent(entry.content).lockedDefaultEntryId)) ??
      group.find((entry) => entry.title.trim() === normalizeImportedSettingKey(entry.title)) ??
      group[0];
    const winnerSetting = parseSettingContent(winner.content);
    const winnerBody = normalizeImportedSettingBody(winnerSetting.body, winner.title);
    const duplicateContentSource = group
      .filter((entry) => entry.id !== winner.id)
      .map((entry) => ({ entry, setting: parseSettingContent(entry.content) }))
      .map(({ entry, setting }) => ({
        entry,
        setting,
        body: normalizeImportedSettingBody(setting.body, entry.title),
      }))
      .find(({ body }) => body.trim());
    const cleanTitle = normalizeImportedSettingKey(winner.title);
    const body = winnerBody.trim() ? winnerBody : (duplicateContentSource?.body ?? '');
    const content = stringifySettingContent({ ...winnerSetting, body });
    if (group.length > 1 || cleanTitle !== winner.title || content !== winner.content) changed = true;
    repairedByWinnerId.set(winner.id, { ...winner, title: cleanTitle, content });
    group.forEach((entry) => {
      if (entry.id !== winner.id) droppedIds.add(entry.id);
    });
  });

  if (!changed) return false;
  const repairedEntries = entries.flatMap((entry) => {
    if (droppedIds.has(entry.id)) return [];
    return [repairedByWinnerId.get(entry.id) ?? entry];
  });
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, repairedEntries);
  return true;
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
