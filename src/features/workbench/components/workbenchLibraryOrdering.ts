import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { canCreateWorkbenchRoleInType } from '@/features/workbench/model/workbenchRoleTypes';
import { isMaleProtagonistRoleTypeChangeLocked } from '@/features/workbench/model/workbenchLibraryPanelModel';

import type { LibraryEntryDropPreviewState } from './workbenchLibraryDrag';
import {
  appendRoleHistory,
  createRoleHistoryVersion,
  parseRoleContent,
  stringifyRoleContent,
} from './workbenchRoleContent';
import { ROLE_TAB, isSettingLikeTab, normalizeTabName } from './workbenchLibraryTabs';
import { parseSettingContent, stringifySettingContent } from './workbenchStructuredSettings';

function isProtagonistGroupType(type: string) {
  return type === String.fromCharCode(30007, 20027, 35282) || type === String.fromCharCode(30007, 22899, 20027);
}

function prepareEntryForType(
  entries: WorkbenchLibraryEntry[],
  entry: WorkbenchLibraryEntry,
  targetTab: string,
  targetType: string,
  withHistory: boolean,
) {
  const normalizedTargetTab = normalizeTabName(targetTab);
  if (entry.tab !== normalizedTargetTab) return null;
  if (normalizedTargetTab === ROLE_TAB) {
    const role = parseRoleContent(entry.content);
    const preserveFemaleProtagonist =
      isProtagonistGroupType(targetType) && role.type === String.fromCharCode(22899, 20027, 35282);
    if (!preserveFemaleProtagonist && isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return null;
    if (
      !canCreateWorkbenchRoleInType(
        entries
          .filter((item) => item.id !== entry.id && item.tab === ROLE_TAB)
          .map((item) => parseRoleContent(item.content).type),
        preserveFemaleProtagonist ? role.type : targetType,
      )
    )
      return null;
    if (preserveFemaleProtagonist || role.type === targetType) return entry;
    return {
      ...entry,
      content: stringifyRoleContent({
        ...role,
        type: targetType,
        history: withHistory ? appendRoleHistory(role.history, createRoleHistoryVersion(entry, role)) : role.history,
      }),
      ...(withHistory ? { updatedAt: new Date().toLocaleString('zh-CN') } : {}),
    };
  }
  if (isSettingLikeTab(normalizedTargetTab)) {
    const setting = parseSettingContent(entry.content);
    return setting.type === targetType
      ? entry
      : {
          ...entry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          ...(withHistory ? { updatedAt: new Date().toLocaleString('zh-CN') } : {}),
        };
  }
  return entry;
}

export function moveLibraryEntryToTypeInList(
  entries: WorkbenchLibraryEntry[],
  entryId: string,
  targetTab: string,
  targetType: string,
) {
  const normalizedTargetTab = normalizeTabName(targetTab);
  const draggedEntry = entries.find((entry) => entry.id === entryId);
  if (!draggedEntry) return null;
  const nextDraggedEntry = prepareEntryForType(entries, draggedEntry, normalizedTargetTab, targetType, true);
  if (!nextDraggedEntry) return null;
  const nextEntries = entries.filter((entry) => entry.id !== entryId);
  const targetTypeLastIndex = nextEntries.reduce((lastIndex, entry, index) => {
    if (entry.tab !== normalizedTargetTab) return lastIndex;
    if (normalizedTargetTab === ROLE_TAB) {
      return isProtagonistGroupType(targetType)
        ? [String.fromCharCode(30007, 20027, 35282), String.fromCharCode(22899, 20027, 35282)].includes(
            parseRoleContent(entry.content).type,
          )
          ? index
          : lastIndex
        : parseRoleContent(entry.content).type === targetType
          ? index
          : lastIndex;
    }
    if (isSettingLikeTab(normalizedTargetTab)) {
      return parseSettingContent(entry.content).type === targetType ? index : lastIndex;
    }
    return lastIndex;
  }, -1);
  if (targetTypeLastIndex >= 0) nextEntries.splice(targetTypeLastIndex + 1, 0, nextDraggedEntry);
  else {
    const targetTabLastIndex = nextEntries.reduce(
      (lastIndex, entry, index) => (entry.tab === normalizedTargetTab ? index : lastIndex),
      -1,
    );
    nextEntries.splice(targetTabLastIndex + 1, 0, nextDraggedEntry);
  }
  return { entries: nextEntries, normalizedTargetTab };
}

export function moveLibraryEntryBeforeInList(
  entries: WorkbenchLibraryEntry[],
  entryId: string,
  targetEntryId: string,
  targetTab: string,
  targetType: string,
) {
  if (!entryId || entryId === targetEntryId) return null;
  const normalizedTargetTab = normalizeTabName(targetTab);
  const draggedEntry = entries.find((entry) => entry.id === entryId);
  const targetEntry = entries.find((entry) => entry.id === targetEntryId);
  if (!draggedEntry || !targetEntry || targetEntry.tab !== normalizedTargetTab) return null;
  const nextDraggedEntry = prepareEntryForType(entries, draggedEntry, normalizedTargetTab, targetType, true);
  if (!nextDraggedEntry) return null;
  const nextEntries = entries.filter((entry) => entry.id !== entryId);
  const targetIndex = entries.findIndex((entry) => entry.id === targetEntryId);
  if (targetIndex < 0) return null;
  nextEntries.splice(Math.min(targetIndex, nextEntries.length), 0, nextDraggedEntry);
  return { entries: nextEntries, normalizedTargetTab };
}

export function getLibraryEntriesForType(entries: WorkbenchLibraryEntry[], tab: string, type: string) {
  const normalizedTab = normalizeTabName(tab);
  return entries.filter((entry) => {
    if (entry.tab !== normalizedTab) return false;
    if (normalizedTab === ROLE_TAB) {
      const roleType = parseRoleContent(entry.content).type;
      return isProtagonistGroupType(type)
        ? [String.fromCharCode(30007, 20027, 35282), String.fromCharCode(22899, 20027, 35282)].includes(roleType)
        : roleType === type;
    }
    if (isSettingLikeTab(normalizedTab)) return parseSettingContent(entry.content).type === type;
    return false;
  });
}

export function getLibraryEntryTargetIdAtPreviewIndex(
  entries: WorkbenchLibraryEntry[],
  targetTab: string,
  targetType: string,
  previewIndex: number,
) {
  const groupEntries = getLibraryEntriesForType(entries, targetTab, targetType);
  if (!Number.isInteger(previewIndex) || groupEntries.length === 0) return null;
  return groupEntries[Math.max(0, Math.min(previewIndex, groupEntries.length - 1))]?.id ?? null;
}

export function getPreviewedLibraryGroupEntries(
  entries: WorkbenchLibraryEntry[],
  groupEntries: WorkbenchLibraryEntry[],
  tab: string,
  type: string,
  preview: LibraryEntryDropPreviewState,
) {
  if (!preview || preview.tab !== tab) return groupEntries;
  const draggedEntry = entries.find((entry) => entry.id === preview.entryId);
  if (!draggedEntry || draggedEntry.tab !== tab) return groupEntries;
  const groupWithoutDraggedEntry = groupEntries.filter((entry) => entry.id !== draggedEntry.id);
  if (preview.type !== type) {
    return groupWithoutDraggedEntry.length === groupEntries.length ? groupEntries : groupWithoutDraggedEntry;
  }
  const previewEntry = prepareEntryForType(entries, draggedEntry, tab, type, false);
  if (!previewEntry) return groupWithoutDraggedEntry;
  const nextEntries = [...groupWithoutDraggedEntry];
  if (preview.mode === 'target-position' && preview.targetEntryId) {
    const targetIndex = groupEntries.findIndex((entry) => entry.id === preview.targetEntryId);
    nextEntries.splice(
      targetIndex >= 0 ? Math.min(targetIndex, nextEntries.length) : nextEntries.length,
      0,
      previewEntry,
    );
  } else nextEntries.push(previewEntry);
  return nextEntries;
}
