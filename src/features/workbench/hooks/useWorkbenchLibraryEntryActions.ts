import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  createWorkbenchLibraryEntry,
  getDefaultWorkbenchLibraryEntryTitle,
  writeWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { DEFAULT_SETTING_TYPES } from '@/features/workbench/model/workbenchSettingTaxonomy';

import type { LibraryTabConfig } from '../components/workbenchLibraryDataState';
import {
  getSettingTypeDomainsStorageKey,
  getSettingTypesStorageKey,
  normalizeEntries,
  writeBrainstormRecycleEntries,
} from '../components/workbenchLibraryDataState';
import { buildWorkbenchRoleTypeOptions } from '../components/workbenchRoleTypeOptions';
import { parseRoleContent } from '../components/workbenchRoleContent';
import {
  BRAINSTORM_TAB,
  DEFAULT_SETTING_ENTRY_TYPE,
  ROLE_TAB,
  SETTING_TAB,
  isSettingLikeTab,
} from '../components/workbenchLibraryTabs';
import { parseSettingContent, stringifySettingContent } from '../components/workbenchStructuredSettings';
import { canCreateWorkbenchRoleInType } from '../model/workbenchRoleTypes';

type EntryActionsInput = {
  activeTab: string;
  customRoleTypes: string[];
  entries: WorkbenchLibraryEntry[];
  getSelectedSettingWorkspaceDomain: () => string | null | undefined;
  getSelectedSettingWorkspaceType: () => string | null | undefined;
  getSettingTypeWorkspaceDomain: (type: string) => string | null | undefined;
  hiddenRoleTypes: string[];
  outlineSettingScope: string;
  outlineStorageKey?: string;
  setBrainstormRecycleEntries: Dispatch<SetStateAction<WorkbenchLibraryEntry[]>>;
  setCustomSettingTypeDomains: Dispatch<SetStateAction<Record<string, string>>>;
  setCustomSettingTypes: Dispatch<SetStateAction<string[]>>;
  setEntries: Dispatch<SetStateAction<WorkbenchLibraryEntry[]>>;
  setExpandedSettingTypes: Dispatch<SetStateAction<Set<string>>>;
  setOutlineEntries: Dispatch<SetStateAction<WorkbenchLibraryEntry[]>>;
  setRememberedActiveTab: (tab: string) => void;
  setSelectedId: (id: string) => void;
  setSelectedIdForTab: (tab: string, id: string) => void;
  setSettingTypeDraft: Dispatch<SetStateAction<string>>;
  settingCreateTypeDraft: string;
  settingTitleDraft: string;
  settingTypeDraft: string;
  settingTypeOptionsRef: RefObject<string[]>;
  storageKey: string;
  tabConfigs: Record<string, LibraryTabConfig>;
  updateTabConfig: (tab: string, patch: Partial<LibraryTabConfig>) => void;
};

export function useWorkbenchLibraryEntryActions({
  activeTab,
  customRoleTypes,
  entries,
  getSelectedSettingWorkspaceDomain,
  getSelectedSettingWorkspaceType,
  getSettingTypeWorkspaceDomain,
  hiddenRoleTypes,
  outlineSettingScope,
  outlineStorageKey,
  setBrainstormRecycleEntries,
  setCustomSettingTypeDomains,
  setCustomSettingTypes,
  setEntries,
  setExpandedSettingTypes,
  setOutlineEntries,
  setRememberedActiveTab,
  setSelectedId,
  setSelectedIdForTab,
  setSettingTypeDraft,
  settingCreateTypeDraft,
  settingTitleDraft,
  settingTypeDraft,
  settingTypeOptionsRef,
  storageKey,
  tabConfigs,
  updateTabConfig,
}: EntryActionsInput) {
  const persist = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next);
    setEntries(normalized);
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, normalized);
  };
  const persistBrainstormRecycle = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next).filter((entry) => entry.tab === BRAINSTORM_TAB);
    setBrainstormRecycleEntries(normalized);
    writeBrainstormRecycleEntries(storageKey, normalized);
  };
  const persistOutline = (next: WorkbenchLibraryEntry[]) => {
    if (!outlineStorageKey) return persist(next);
    const normalized = normalizeEntries(next);
    setOutlineEntries(normalized);
    writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
  };
  const addEntry = () => {
    const entry = createWorkbenchLibraryEntry(activeTab, getDefaultWorkbenchLibraryEntryTitle(activeTab));
    persist([entry, ...entries]);
    setSelectedId(entry.id);
  };
  const addEntryToTab = (tab: string, title: string) => {
    const entry = createWorkbenchLibraryEntry(tab, title);
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
  };
  const addSettingTypeByName = (name: string) => {
    const type = name.trim();
    if (!type) return;
    const domain = getSelectedSettingWorkspaceDomain();
    setCustomSettingTypes((current) => {
      if (current.includes(type) || DEFAULT_SETTING_TYPES.includes(type)) return current;
      const next = [...current, type];
      localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    if (domain && getSettingTypeWorkspaceDomain(type) !== domain) {
      setCustomSettingTypeDomains((current) => {
        if (current[type] === domain) return current;
        const next = { ...current, [type]: domain };
        localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    }
    setExpandedSettingTypes((current) => new Set(current).add(type));
  };
  const addSettingType = () => {
    addSettingTypeByName(settingTypeDraft);
    setSettingTypeDraft('');
  };
  const getSettingCreateTypeOptions = () => {
    if (outlineSettingScope === 'character') {
      const existingRoleTypes = entries
        .filter((entry) => entry.tab === ROLE_TAB)
        .map((entry) => parseRoleContent(entry.content).type);
      return buildWorkbenchRoleTypeOptions({ entries, customRoleTypes, hiddenRoleTypes }).filter((type) =>
        canCreateWorkbenchRoleInType(existingRoleTypes, type),
      );
    }
    if (activeTab !== SETTING_TAB) return settingTypeOptionsRef.current;
    const domain = getSelectedSettingWorkspaceDomain();
    return settingTypeOptionsRef.current.filter((type) =>
      domain ? getSettingTypeWorkspaceDomain(type) === domain : !getSettingTypeWorkspaceDomain(type),
    );
  };
  const getValidSettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    return settingCreateTypeDraft && options.includes(settingCreateTypeDraft)
      ? settingCreateTypeDraft
      : (options[0] ?? DEFAULT_SETTING_ENTRY_TYPE);
  };
  const getSelectedEntrySettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    const selectedId = tabConfigs[activeTab]?.selectedId;
    const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) : null;
    if (!selectedEntry || !isSettingLikeTab(selectedEntry.tab)) return getValidSettingCreateType();
    const selectedType = parseSettingContent(selectedEntry.content).type;
    return options.includes(selectedType) ? selectedType : getValidSettingCreateType();
  };
  const addSetting = (tab = SETTING_TAB, titleDraft = settingTitleDraft, typeDraft?: string) => {
    const title =
      titleDraft.trim() ||
      getDefaultWorkbenchLibraryEntryTitle(tab);
    const selectedType = typeDraft ?? getSelectedSettingWorkspaceType();
    const entry = {
      ...createWorkbenchLibraryEntry(tab, title),
      content: stringifySettingContent({
        type: tab === SETTING_TAB ? (selectedType ?? DEFAULT_SETTING_ENTRY_TYPE) : DEFAULT_SETTING_ENTRY_TYPE,
        body: '',
      }),
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
    updateTabConfig(tab, { titleDraft: '' });
  };
  return {
    persist,
    persistBrainstormRecycle,
    persistOutline,
    addEntry,
    addEntryToTab,
    addSettingTypeByName,
    addSettingType,
    getSettingCreateTypeOptions,
    getValidSettingCreateType,
    getSelectedEntrySettingCreateType,
    addSetting,
  };
}
