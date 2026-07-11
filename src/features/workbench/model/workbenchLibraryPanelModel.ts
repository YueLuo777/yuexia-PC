import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from './workbenchRoleTypes';
import type { Volume } from './workbenchTypes';

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
