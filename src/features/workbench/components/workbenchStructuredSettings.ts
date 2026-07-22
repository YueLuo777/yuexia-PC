export * from './workbenchStructuredSettingDefinitions';
import {
  STRUCTURED_SETTING_UNCATEGORIZED_TYPE,
  DEFAULT_MALE_PROTAGONIST_ROLE_TITLE,
  SETTING_IMPORT_FORMAT_TAB_IDS,
  SettingImportFormatTabId,
  SETTING_IMPORT_FORMAT_PREVIEW_SCOPES,
  type SettingImportFormatPreviewScope,
  type SettingImportFormatField,
  SettingImportFormatEntry,
  type SettingImportFormatGroup,
  type SettingImportFormatTab,
  type BuildSettingImportFormatTabsOptions,
  type SettingContent,
  type StructuredSettingFieldDefinition,
  type StructuredSettingFieldGroup,
  type StructuredSettingFieldSet,
  type StructuredSettingFieldDraft,
  STRUCTURED_SETTING_TABS,
  type StructuredSettingTab,
  MONSTER_BESTIARY_FIELDS,
  FORESHADOW_SETTING_FIELDS,
  STRUCTURED_SETTING_FIELD_SETS,
} from './workbenchStructuredSettingDefinitions';
import {
  BASIC_SETTING_ENTRY_TITLE,
  BASIC_SETTING_ENTRY_TYPE,
  DEFAULT_WORK_SETTING_STARTER_ENTRIES,
} from '@/features/workbench/model/workbenchSettingTaxonomy';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { ROLE_BASE_SETTING_FIELD_DEFINITIONS, ROLE_STATE_FIELD_DEFINITIONS } from './workbenchRoleSettingFields';
import {
  normalizePendingSettingFieldUpdates,
  normalizeSettingFieldHistory,
  normalizeSettingFieldPolicies,
} from '@/features/workbench/model/workbenchSettingStatus';
export function normalizeSettingType(value: string | undefined) {
  return value?.trim() || STRUCTURED_SETTING_UNCATEGORIZED_TYPE;
}

export function parseSettingContent(content: string): SettingContent {
  try {
    const parsed = JSON.parse(content) as Partial<SettingContent>;
    return {
      type: normalizeSettingType(parsed.type),
      body: parsed.body || '',
      structuredFieldSetId: typeof parsed.structuredFieldSetId === 'string' ? parsed.structuredFieldSetId : undefined,
      lockedDefaultEntryId: typeof parsed.lockedDefaultEntryId === 'string' ? parsed.lockedDefaultEntryId : undefined,
      statusHistory: normalizeSettingFieldHistory(parsed.statusHistory),
      pendingStatusUpdates: normalizePendingSettingFieldUpdates(parsed.pendingStatusUpdates),
      fieldUpdatePolicies: normalizeSettingFieldPolicies(parsed.fieldUpdatePolicies),
    };
  } catch {
    return {
      type: '未分类',
      body: content || '',
      statusHistory: [],
      pendingStatusUpdates: [],
      fieldUpdatePolicies: {},
    };
  }
}

export function stringifySettingContent(value: SettingContent) {
  return JSON.stringify({
    ...value,
    type: normalizeSettingType(value.type),
    structuredFieldSetId: value.structuredFieldSetId || undefined,
    lockedDefaultEntryId: value.lockedDefaultEntryId || undefined,
  });
}

export function resolveActiveSettingWorkspaceType(
  currentType: string | undefined,
  requestedType: unknown,
  selectedType: string | null,
  visibleTypes: string[],
) {
  if (currentType) return currentType;
  if (typeof requestedType === 'string' && visibleTypes.includes(requestedType)) return requestedType;
  return selectedType ?? visibleTypes[0] ?? null;
}

export function createEmptyStructuredSettingFields(fieldSet: StructuredSettingFieldSet) {
  return fieldSet.fields.reduce(
    (result, field) => {
      result[field.key] = '';
      return result;
    },
    {} as Record<string, string>,
  );
}

export function parseSectionedSettingBody(body: string) {
  const sections: Record<string, string> = {};
  const normalizedBody = body.replace(/\r\n/g, '\n');
  let currentTitle = '';
  let currentLines: string[] = [];
  const commitCurrentSection = () => {
    if (!currentTitle) return;
    sections[currentTitle] = currentLines.join('\n').trim();
  };

  normalizedBody.split('\n').forEach((line) => {
    const headerMatch = line.match(/^\s*【([^】\n]+)】\s*(?:[：:]\s*(.*))?$/);
    if (headerMatch) {
      commitCurrentSection();
      currentTitle = headerMatch[1].trim();
      currentLines = [headerMatch[2] ?? ''];
      return;
    }
    if (currentTitle) {
      currentLines.push(line);
    }
  });
  if (currentTitle) {
    commitCurrentSection();
  }
  return sections;
}

export function parseStructuredSettingFields(body: string, fieldSet: StructuredSettingFieldSet) {
  const sections = parseSectionedSettingBody(body);
  const fields = createEmptyStructuredSettingFields(fieldSet);
  fieldSet.fields.forEach((field) => {
    fields[field.key] = sections[field.title] ?? '';
  });
  return fields;
}

export function getStructuredSettingWordCountSource(entry: WorkbenchLibraryEntry, setting: SettingContent) {
  const fieldSet = getStructuredSettingFieldSet(entry, setting);
  if (!fieldSet) return setting.body;
  const fields = parseStructuredSettingFields(setting.body, fieldSet);
  return Object.values(fields).join('');
}

export function stringifyStructuredSettingFields(fields: Record<string, string>, fieldSet: StructuredSettingFieldSet) {
  return fieldSet.fields.map((field) => `【${field.title}】：\n${fields[field.key].trim()}`).join('\n\n');
}

export function resolveStructuredSettingDraftFields(
  draft: StructuredSettingFieldDraft,
  entryId: string,
  fieldSetId: string,
  body: string,
  parsedFields: Record<string, string>,
) {
  return draft && draft.entryId === entryId && draft.fieldSetId === fieldSetId && draft.body === body
    ? draft.fields
    : parsedFields;
}

export function createStructuredSettingFieldDraft(
  entryId: string,
  fieldSetId: string,
  body: string,
  fields: Record<string, string>,
): StructuredSettingFieldDraft {
  return {
    entryId,
    fieldSetId,
    body,
    fields,
  };
}

export function getStructuredSettingFieldSet(entry: WorkbenchLibraryEntry, setting: SettingContent | null) {
  if (setting?.structuredFieldSetId) {
    const fieldSet = STRUCTURED_SETTING_FIELD_SETS.find((item) => item.id === setting.structuredFieldSetId);
    if (fieldSet) return fieldSet;
  }
  const titleMatchedFieldSet = STRUCTURED_SETTING_FIELD_SETS.find(
    (fieldSet) => setting?.type === fieldSet.entryType && entry.title.trim() === fieldSet.entryTitle,
  );
  if (titleMatchedFieldSet) return titleMatchedFieldSet;
  const typeMatchedFieldSet = STRUCTURED_SETTING_FIELD_SETS.find(
    (fieldSet) => fieldSet.matchAllTitles && setting?.type === fieldSet.entryType,
  );
  if (typeMatchedFieldSet) return typeMatchedFieldSet;
  if (setting?.body.trim()) {
    const sections = parseSectionedSettingBody(setting.body);
    return (
      STRUCTURED_SETTING_FIELD_SETS.find(
        (fieldSet) =>
          setting.type === fieldSet.entryType && fieldSet.fields.some((field) => sections[field.title] !== undefined),
      ) ?? null
    );
  }
  return null;
}

export function getStructuredSettingFieldSetByDefaultTitle(type: string, title: string) {
  const normalizedType = normalizeSettingType(type);
  const normalizedTitle = title.trim();
  return (
    STRUCTURED_SETTING_FIELD_SETS.find(
      (fieldSet) =>
        normalizeSettingType(fieldSet.entryType) === normalizedType && fieldSet.entryTitle === normalizedTitle,
    ) ?? null
  );
}

export function getSettingImportFormatFieldSet(type: string, title: string) {
  const directFieldSet = getStructuredSettingFieldSetByDefaultTitle(type, title);
  if (directFieldSet) return directFieldSet;
  const normalizedType = normalizeSettingType(type);
  if (['正派势力', '反派势力', '中立势力', '其他势力'].includes(normalizedType)) {
    return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => fieldSet.id === 'faction-righteous-no-1') ?? null;
  }
  if (normalizedType === '世界地图' && title.trim() === '危险区域') {
    return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => fieldSet.id === 'faction-danger-zone') ?? null;
  }
  return (
    STRUCTURED_SETTING_FIELD_SETS.find(
      (fieldSet) => fieldSet.matchAllTitles && normalizeSettingType(fieldSet.entryType) === normalizedType,
    ) ?? null
  );
}

export function mapStructuredFieldsToImportFormat(
  fields: readonly StructuredSettingFieldDefinition[],
): SettingImportFormatField[] {
  return fields.map((field) => ({ title: field.title, placeholder: field.placeholder }));
}

export function getSettingImportFormatFields(type: string, title: string): SettingImportFormatField[] {
  const fieldSet = getSettingImportFormatFieldSet(type, title);
  if (fieldSet) return mapStructuredFieldsToImportFormat(fieldSet.fields);
  return [{ title: '内容', placeholder: '直接填写该设定条目的正文内容。' }];
}

export function getSettingImportFormatEntryTitles(type: string, currentSettingEntries: WorkbenchLibraryEntry[] = []) {
  const normalizedType = normalizeSettingType(type);
  if (normalizedType === '正派势力') return ['1号势力'];
  if (normalizedType === '反派势力') return ['反派势力'];
  if (normalizedType === '中立势力') return ['中立势力'];
  if (normalizedType === '其他势力') return ['其他势力'];
  if (normalizedType === '世界地图') return ['世界架构', '危险区域'];
  if (normalizedType === '怪物列表') return ['怪物图鉴'];
  const currentTitles = currentSettingEntries
    .filter((entry) => normalizeSettingType(parseSettingContent(entry.content).type) === normalizedType)
    .map((entry) => entry.title);
  const starterTitles = DEFAULT_WORK_SETTING_STARTER_ENTRIES.filter(
    (entry) => normalizeSettingType(entry.type) === normalizedType,
  ).map((entry) => entry.title);
  const structuredTitles = STRUCTURED_SETTING_FIELD_SETS.filter(
    (fieldSet) => normalizeSettingType(fieldSet.entryType) === normalizedType && !fieldSet.matchAllTitles,
  ).map((fieldSet) => fieldSet.entryTitle);
  const knownTitles = Array.from(new Set([...currentTitles, ...starterTitles, ...structuredTitles])).filter((title) =>
    title.trim(),
  );
  const visibleTitles = knownTitles.filter((title) => normalizeSettingType(title) !== normalizedType);
  return visibleTitles.length > 0 ? visibleTitles : [normalizedType];
}

export function createSettingImportFormatEntry(
  tabId: SettingImportFormatTabId,
  tabTitle: string,
  groupName: string,
  title: string,
): SettingImportFormatEntry {
  return {
    id: `${tabId}:${groupName}:${title}`,
    tabId,
    tabTitle,
    groupName,
    title,
    fields: getSettingImportFormatFields(groupName, title),
  };
}

export function buildSettingImportFormatTabs(options: BuildSettingImportFormatTabsOptions): SettingImportFormatTab[] {
  const { visibleSettingTypes, settingEntries, getSettingTypeWorkspaceDomain } = options;
  const workGroups = visibleSettingTypes
    .filter((type) => !getSettingTypeWorkspaceDomain(type))
    .map((groupName) => ({
      name: groupName,
      entries: getSettingImportFormatEntryTitles(groupName, settingEntries).map((title) =>
        createSettingImportFormatEntry('work', '作品设定', groupName, title),
      ),
    }));
  const roleFields: SettingImportFormatField[] = [
    { title: '人物姓名', placeholder: '角色姓名。' },
    { title: '身份定位', placeholder: '男主角、女主角、配角、反派等。' },
    ...ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => ({ title: field.title, placeholder: field.placeholder })),
    { title: '人物关系', placeholder: '与主角、阵营、亲友、敌人、师徒、利益对象的关系。' },
    ...ROLE_STATE_FIELD_DEFINITIONS.map((field) => ({ title: field.title, placeholder: `${field.level}的状态内容。` })),
  ];
  const domainTabs: SettingImportFormatTab[] = [
    {
      id: 'work',
      title: '作品设定',
      groups: workGroups,
    },
    {
      id: 'roles',
      title: '人物设定',
      groups: [
        {
          name: DEFAULT_MALE_PROTAGONIST_ROLE_TITLE,
          entries: [
            {
              id: 'roles:男主角:男主角设定',
              tabId: 'roles',
              tabTitle: '人物设定',
              groupName: DEFAULT_MALE_PROTAGONIST_ROLE_TITLE,
              title: '男主角设定',
              fields: roleFields,
              note: '人物设定会写入角色库；写入“身份定位：男主角”时，会优先匹配男主角角色。',
            },
          ],
        },
      ],
    },
    ...(
      [
        ['factions', '势力设定', 'setting:faction'],
        ['items', '道具资源', 'setting:item'],
        ['monsters', '怪物图鉴', 'setting:monster'],
        ['foreshadow', '伏笔线索', 'setting:foreshadow'],
      ] as const
    ).map(([tabId, tabTitle, domain]) => ({
      id: tabId,
      title: tabTitle,
      groups: visibleSettingTypes
        .filter((type) => getSettingTypeWorkspaceDomain(type) === domain)
        .map((groupName) => ({
          name: groupName,
          entries: getSettingImportFormatEntryTitles(groupName, settingEntries).map((title) =>
            createSettingImportFormatEntry(tabId, tabTitle, groupName, title),
          ),
        })),
    })),
  ];
  return domainTabs;
}

export const DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID = 'work';
export const DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID = '';

export function findSettingImportFormatEntry(entryId: string, tabs: SettingImportFormatTab[]) {
  return (
    tabs.flatMap((tab) => tab.groups.flatMap((group) => group.entries)).find((entry) => entry.id === entryId) ??
    tabs[0]?.groups[0]?.entries[0] ??
    null
  );
}

export function buildSettingImportFormatEntryBlock(entry: SettingImportFormatEntry) {
  const fieldLines = entry.fields.flatMap((field) => [
    `【${field.title}】：`,
    field.title === '身份定位' ? '男主角' : '内容',
  ]);
  return [`*${entry.title}*：`, ...fieldLines].join('\n').trimEnd();
}

export function buildSettingImportFormatPreview(entry: SettingImportFormatEntry) {
  const entryBlock = buildSettingImportFormatEntryBlock(entry);
  if (entry.tabTitle === '人物设定') {
    return ['<人物设定>', entryBlock, '</人物设定>'].join('\n').trimEnd();
  }
  return [`<${entry.tabTitle}>`, `<${entry.groupName}>`, entryBlock, `</${entry.groupName}>`, `</${entry.tabTitle}>`]
    .join('\n')
    .trimEnd();
}

export function buildSettingImportFormatGroupPreview(tab: SettingImportFormatTab, group: SettingImportFormatGroup) {
  const entryBlocks = group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry));
  if (tab.title === '人物设定') {
    return ['<人物设定>', ...entryBlocks, '</人物设定>'].join('\n').trimEnd();
  }
  return [`<${tab.title}>`, `<${group.name}>`, ...entryBlocks, `</${group.name}>`, `</${tab.title}>`]
    .join('\n')
    .trimEnd();
}

export function buildSettingImportFormatTabPreview(tab: SettingImportFormatTab) {
  if (tab.title === '人物设定') {
    const entryBlocks = tab.groups.flatMap((group) =>
      group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry)),
    );
    return ['<人物设定>', ...entryBlocks, '</人物设定>'].join('\n').trimEnd();
  }
  const groupBlocks = tab.groups.map((group) =>
    [`<${group.name}>`, ...group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry)), `</${group.name}>`]
      .join('\n')
      .trimEnd(),
  );
  return [`<${tab.title}>`, ...groupBlocks, `</${tab.title}>`].join('\n').trimEnd();
}

export function buildSettingImportFormatScopedPreview(
  scope: SettingImportFormatPreviewScope,
  tab: SettingImportFormatTab,
  group: SettingImportFormatGroup,
  entry: SettingImportFormatEntry,
) {
  if (scope === '标签') return buildSettingImportFormatTabPreview(tab);
  if (scope === '分组') return buildSettingImportFormatGroupPreview(tab, group);
  return buildSettingImportFormatPreview(entry);
}
