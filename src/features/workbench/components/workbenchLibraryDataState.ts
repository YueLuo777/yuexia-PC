import { getBackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleType,
} from '@/features/workbench/model/workbenchRoleTypes';
import {
  DEFAULT_SETTING_TYPES,
  DEFAULT_WORK_SETTING_STARTER_ENTRIES,
  DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS,
  DEFAULT_WORK_SETTING_STARTER_VERSION,
  getDefaultWorkSettingEntryId,
} from '@/features/workbench/model/workbenchSettingTaxonomy';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type {
  PlotPointChainSlot,
  PlotPointLengthMode,
  PlotPointSourceMode,
  WorkbenchPlotPointCandidate,
} from '@/features/workbench/model/workbenchPlotChain';

import { getActiveBrainstormAiSessionId, normalizeBrainstormAiSessions } from './workbenchBrainstormState';
import { getTabConfigsStorageKey } from './workbenchLibraryStorageState';
import { BRAINSTORM_TAB, ROLE_TAB, SETTING_TAB, normalizeTabName } from './workbenchLibraryTabs';
import { createEmptyRoleStateSettings, parseRoleContent, stringifyRoleContent } from './workbenchRoleContent';
import {
  getStructuredSettingFieldSetByDefaultTitle,
  normalizeSettingType,
  parseSettingContent,
  stringifySettingContent,
} from './workbenchStructuredSettings';

export const DEFAULT_ROLE_TYPES = DEFAULT_WORKBENCH_ROLE_TYPES;
export const DEFAULT_MALE_PROTAGONIST_ROLE_TYPE = '男主角';
export const DEFAULT_MALE_PROTAGONIST_ROLE_TITLE = '男主角';

export type LibraryTabConfig = {
  selectedId?: string | null;
  typeDraft?: string;
  titleDraft?: string;
  createKind?: 'category' | 'setting';
  roleTypeDraft?: string;
  roleNameDraft?: string;
  aiInput?: string;
  aiOutput?: string;
  aiResult?: string;
  libraryAiTaskId?: string;
  aiSessions?: unknown[];
  activeAiSessionId?: string;
  outlineAiInput?: string;
  outlineAiTaskId?: string;
  detailOutlineReaderTouched?: boolean;
  detailOutlineReaderSettingIds?: string[];
  detailOutlineReaderRoleIds?: string[];
  detailOutlineReaderOutlineIds?: string[];
  detailOutlineReaderPlotChainIds?: string[];
  plotPointPromptId?: string;
  detailOutlinePromptId?: string;
  outlineSummaryPromptId?: string;
  selectedOutlineChapterId?: number | null;
  plotPointSourceMode?: PlotPointSourceMode;
  plotPointGenerateCount?: number;
  plotPointLength?: PlotPointLengthMode;
  plotPointOpeningElements?: string[];
  plotPointPreviewDraft?: string;
  plotPointAiTaskId?: string;
  plotPointGeneratedCandidateText?: string;
  plotPointPreviewCleared?: boolean;
  plotPointSelectedCandidates?: WorkbenchPlotPointCandidate[];
  plotPointChainSelections?: Partial<Record<PlotPointChainSlot, string[]>>;
  plotPointChainWrittenSelections?: Partial<Record<PlotPointChainSlot, string[]>>;
  plotPointChainNames?: Partial<Record<PlotPointChainSlot, string>>;
  plotPointActiveChainSlot?: PlotPointChainSlot;
  modelId?: string;
  promptId?: string;
  promptDisabled?: boolean;
  brainstormGenre?: string;
  brainstormBackground?: string;
  brainstormIdea?: string;
  brainstormCheat?: string;
  brainstormCount?: string;
  brainstormRequirement?: string;
  brainstormPreviewFontSize?: number;
  brainstormOutputFontSize?: number;
  brainstormStreamEnabled?: boolean;
  associationSessionId?: string | null;
  loadedBrainstormId?: string | null;
  loadedBrainstormTitle?: string;
  loadedBrainstormText?: string;
  linkedOtherSettingIds?: string[];
  settingLinkSource?: 'current' | 'other' | 'brainstorm' | null;
  detailOutlineReaderSessionId?: string | null;
  smartImportLocked?: boolean;
  settingPreviewFontSize?: number;
  roleTextFontSize?: number;
  detailOutlineFontSize?: number;
};

export type LibraryFontTarget = 'brainstormPreview' | 'brainstormOutput' | 'settingPreview' | 'detailOutline';

export function clearStoredBrainstormAiSessionPreviews(storageKey: string) {
  const currentConfigs = readTabConfigs(storageKey);
  const currentConfig = currentConfigs[BRAINSTORM_TAB] ?? {};
  const currentSessions = normalizeBrainstormAiSessions(currentConfig.aiSessions, currentConfig);
  const activeId = getActiveBrainstormAiSessionId(currentConfig.activeAiSessionId, currentSessions);
  const nextSessions = currentSessions.map((session) =>
    session.id === activeId
      ? (() => {
          const task = session.backgroundAiTaskId ? getBackgroundAiTask(session.backgroundAiTaskId) : null;
          const keepBackgroundOutput = Boolean(task && (task.status === 'running' || task.status === 'success'));
          return {
            ...session,
            input: '',
            output: keepBackgroundOutput ? session.output : '',
            result: keepBackgroundOutput ? session.result : '',
            backgroundAiTaskId: keepBackgroundOutput ? session.backgroundAiTaskId : undefined,
            previewCount: keepBackgroundOutput ? session.previewCount : undefined,
            previewTitles: [],
            previewDrafts: [],
            previewSelectedIndexes: undefined,
          };
        })()
      : session,
  );
  localStorage.setItem(
    getTabConfigsStorageKey(storageKey),
    JSON.stringify({
      ...currentConfigs,
      [BRAINSTORM_TAB]: {
        ...currentConfig,
        aiSessions: nextSessions,
        activeAiSessionId: activeId,
        aiInput: '',
        aiOutput: '',
        aiResult: '',
      },
    }),
  );
}

export type LibraryTabConfigs = Record<string, LibraryTabConfig>;

export function readTabConfigs(storageKey: string): LibraryTabConfigs {
  try {
    const raw = localStorage.getItem(getTabConfigsStorageKey(storageKey));
    const parsed = raw ? (JSON.parse(raw) as LibraryTabConfigs) : {};
    if (parsed && typeof parsed === 'object' && !parsed[SETTING_TAB] && parsed['设定']) {
      parsed[SETTING_TAB] = parsed['设定'];
    }
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function getRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_role_types`;
}

export function readCustomRoleTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getRoleTypesStorageKey(storageKey));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.from(
      new Set(
        parsed
          .filter((item) => typeof item === 'string' && item.trim())
          .map((item) => normalizeWorkbenchRoleType(item)),
      ),
    );
  } catch {
    return [];
  }
}

export function getHiddenRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_role_types`;
}

export const ROLE_TAXONOMY_DEFAULTS_VERSION = '2026-06-24-role-groups-v3';
export const SETTING_TAXONOMY_DEFAULTS_VERSION = '2026-06-18-setting-tabs-groups-v3';

export function getRoleTaxonomyDefaultsVersionStorageKey(storageKey: string) {
  return `${storageKey}_role_taxonomy_defaults_version`;
}

export function getSettingTaxonomyDefaultsVersionStorageKey(storageKey: string) {
  return `${storageKey}_setting_taxonomy_defaults_version`;
}

export function getSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_setting_types`;
}

export function getSettingTypeDomainsStorageKey(storageKey: string) {
  return `${storageKey}_setting_type_domains`;
}

export function readCustomSettingTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getSettingTypesStorageKey(storageKey));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

export function readCustomSettingTypeDomains(storageKey: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(getSettingTypeDomainsStorageKey(storageKey));
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return Object.entries(parsed).reduce<Record<string, string>>((acc, [type, domain]) => {
      if (type.trim() && typeof domain === 'string' && domain.trim()) acc[type] = domain;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function getHiddenSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_setting_types`;
}

export function readStringList(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

export function normalizeLinkedOtherSettingIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)),
  );
}

export function readHiddenRoleTypes(storageKey: string) {
  const hidden = readStringList(getHiddenRoleTypesStorageKey(storageKey)).map((item) =>
    normalizeWorkbenchRoleType(item),
  );
  if (localStorage.getItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey)) === ROLE_TAXONOMY_DEFAULTS_VERSION) {
    return Array.from(new Set(hidden));
  }
  const next = Array.from(new Set(hidden.filter((type) => !DEFAULT_ROLE_TYPES.includes(type))));
  localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify(next));
  localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
  return next;
}

export function readHiddenSettingTypes(storageKey: string) {
  const hidden = readStringList(getHiddenSettingTypesStorageKey(storageKey)).map((item) => normalizeSettingType(item));
  if (
    localStorage.getItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey)) === SETTING_TAXONOMY_DEFAULTS_VERSION
  ) {
    return Array.from(new Set(hidden));
  }
  const next = Array.from(new Set(hidden.filter((type) => !DEFAULT_SETTING_TYPES.includes(type))));
  localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(next));
  localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
  return next;
}

export function normalizeEntries(entries: WorkbenchLibraryEntry[]) {
  return entries.map((entry) => ({ ...entry, tab: normalizeTabName(entry.tab) }));
}

export function hasLibraryAiDialogContent(aiInput = '', aiOutput = '', aiResult = '') {
  return Boolean(aiInput.trim() || aiOutput.trim() || aiResult.trim());
}

export function readNormalizedEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(storageKey));
}

export function readNormalizedEntriesWithGlobalBrainstorm(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey));
}

export function getDefaultWorkSettingStarterVersionStorageKey(storageKey: string) {
  return `${storageKey}_work_setting_starter_version`;
}

export function createDefaultWorkSettingStarterEntry(item: (typeof DEFAULT_WORK_SETTING_STARTER_ENTRIES)[number]) {
  const structuredFieldSet = getStructuredSettingFieldSetByDefaultTitle(item.type, item.title);
  return {
    ...createWorkbenchLibraryEntry(SETTING_TAB, item.title),
    content: stringifySettingContent({
      type: item.type,
      body: '',
      lockedDefaultEntryId: getDefaultWorkSettingEntryId(item.type, item.title),
      ...(structuredFieldSet ? { structuredFieldSetId: structuredFieldSet.id } : {}),
    }),
  };
}

export function isObsoleteAutoCreatedDefaultEntry(entry: WorkbenchLibraryEntry) {
  if (entry.tab !== SETTING_TAB || isLockedDefaultSettingEntry(entry)) return false;
  const setting = parseSettingContent(entry.content);
  const normalizedType = normalizeSettingType(setting.type);
  return (
    !setting.body.trim() && entry.title.trim() === normalizedType && DEFAULT_SETTING_TYPES.includes(normalizedType)
  );
}

export function isObsoleteDefaultInstructionEntry(entry: WorkbenchLibraryEntry) {
  if (entry.tab !== SETTING_TAB || isLockedDefaultSettingEntry(entry)) return false;
  const setting = parseSettingContent(entry.content);
  return setting.body.trim().startsWith('填写说明：');
}

export function removeObsoleteDefaultSettingEntries(entries: WorkbenchLibraryEntry[]) {
  let changed = false;
  const nextEntries = entries.filter((entry) => {
    const shouldRemove = isObsoleteAutoCreatedDefaultEntry(entry) || isObsoleteDefaultInstructionEntry(entry);
    if (shouldRemove) changed = true;
    return !shouldRemove;
  });
  return changed ? nextEntries : entries;
}

export function withDefaultWorkSettingStarterEntries(entries: WorkbenchLibraryEntry[], storageKey: string) {
  const cleanedEntries = removeObsoleteDefaultSettingEntries(entries);
  if (
    localStorage.getItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey)) ===
    DEFAULT_WORK_SETTING_STARTER_VERSION
  ) {
    return cleanedEntries;
  }
  const existingKeys = new Set(
    cleanedEntries
      .filter((entry) => entry.tab === SETTING_TAB)
      .map((entry) => {
        const setting = parseSettingContent(entry.content);
        return `${setting.type}::${entry.title.trim()}`;
      }),
  );
  const missingEntries = DEFAULT_WORK_SETTING_STARTER_ENTRIES.filter(
    (item) => !existingKeys.has(`${item.type}::${item.title}`),
  ).map(createDefaultWorkSettingStarterEntry);
  localStorage.setItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey), DEFAULT_WORK_SETTING_STARTER_VERSION);
  return missingEntries.length > 0 ? [...missingEntries, ...cleanedEntries] : cleanedEntries;
}

export function createDefaultMaleProtagonistRoleEntry() {
  return {
    ...createWorkbenchLibraryEntry(ROLE_TAB, DEFAULT_MALE_PROTAGONIST_ROLE_TITLE),
    content: stringifyRoleContent({
      type: DEFAULT_MALE_PROTAGONIST_ROLE_TYPE,
      lifeStatus: '存活',
      baseSetting: '',
      relationship: '',
      stateSettings: createEmptyRoleStateSettings(),
      stateUpdateChapters: {},
      personality: '',
      background: '',
      status: '',
      history: [],
    }),
  };
}

export function hasMaleProtagonistRoleEntry(entries: WorkbenchLibraryEntry[]) {
  return entries.some(
    (entry) => entry.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(entry.content).type),
  );
}

export function withDefaultMaleProtagonistRoleEntry(entries: WorkbenchLibraryEntry[]) {
  if (hasMaleProtagonistRoleEntry(entries)) return entries;
  return [createDefaultMaleProtagonistRoleEntry(), ...entries];
}

export function readNormalizedEntriesWithVisibleDefaults(storageKey: string, tabs: string[]) {
  const entries = readNormalizedEntriesWithGlobalBrainstorm(storageKey);
  const withSettingDefaults = tabs.includes(SETTING_TAB)
    ? withDefaultWorkSettingStarterEntries(entries, storageKey)
    : entries;
  const nextEntries = tabs.includes(ROLE_TAB)
    ? withDefaultMaleProtagonistRoleEntry(withSettingDefaults)
    : withSettingDefaults;
  if (nextEntries !== entries) {
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, nextEntries);
  }
  return nextEntries;
}

export function getBrainstormRecycleStorageKey(storageKey: string) {
  void storageKey;
  return `${GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY}_brainstorm_recycle_v1`;
}

export function readBrainstormRecycleEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey))).filter(
    (entry) => entry.tab === BRAINSTORM_TAB,
  );
}

export function writeBrainstormRecycleEntries(storageKey: string, entries: WorkbenchLibraryEntry[]) {
  writeWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey), entries);
}

export function isLockedDefaultSettingEntry(entry: WorkbenchLibraryEntry) {
  if (entry.tab !== SETTING_TAB) return false;
  const setting = parseSettingContent(entry.content);
  const defaultEntryId = getDefaultWorkSettingEntryId(setting.type, entry.title);
  return Boolean(
    (setting.lockedDefaultEntryId && DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(setting.lockedDefaultEntryId)) ||
    DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(defaultEntryId),
  );
}
