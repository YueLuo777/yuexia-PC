import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from './workbenchRoleTypes';
import type { Volume } from './workbenchTypes';
import type { OtherSettingLinkEntry, OtherSettingLinkTab } from '../components/workbenchOtherSettingReaderModal';

export interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
  getChapterContent?: (chapterId: number) => string;
  outlineStorageKey?: string;
  scale?: number;
  defaultActiveTab?: string;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  openPlotPointSignal?: number;
  plotPointStandalone?: boolean;
  onOpenDetailOutlineFromPlotChain?: () => void;
  toolbarPortalId?: string;
}

export type PendingCategoryRename = {
  kind: 'role' | 'setting';
  type: string;
} | null;

export type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';
export type ClearSettingsMeta = { label: string; count: number; description: string };

export type PendingEntryDelete = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;
export type PendingEntryRename = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;

export const OTHER_SETTING_LINK_TABS = [
  { id: 'work', title: '作品设定' },
  { id: 'roles', title: '人物设定' },
  { id: 'factions', title: '势力设定' },
  { id: 'items', title: '道具资源' },
  { id: 'monsters', title: '怪物图鉴' },
  { id: 'foreshadow', title: '伏笔线索' },
] as const;

export type SettingLinkSource = 'current' | 'other' | 'brainstorm' | null;

export function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {
  return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);
}

export function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

export function flattenOtherSettingLinkEntries(tabs: OtherSettingLinkTab[]) {
  return tabs.flatMap((tab) => tab.groups.flatMap((group) => group.entries));
}

export function filterOtherSettingLinkGroups(tab: OtherSettingLinkTab | undefined, query: string) {
  const keyword = query.trim();
  return (tab?.groups ?? [])
    .map((group) => ({
      ...group,
      entries: group.entries.filter(
        (entry) => !keyword || `${entry.title} ${entry.type} ${entry.groupName} ${entry.text}`.includes(keyword),
      ),
    }))
    .filter((group) => group.entries.length > 0);
}

export function resolveOtherSettingLinkEntry(
  entries: OtherSettingLinkEntry[],
  visibleGroups: OtherSettingLinkTab['groups'],
  previewId: string | null,
) {
  return (
    entries.find((entry) => entry.id === previewId) ??
    visibleGroups.flatMap((group) => group.entries)[0] ??
    entries[0] ??
    null
  );
}

export function resolveOtherSettingLinkDraftEntries(entries: OtherSettingLinkEntry[], draftIds: Set<string>) {
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  return Array.from(draftIds)
    .map((id) => entryMap.get(id))
    .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
}
