import { Folder, FolderOpen, Trash2 } from 'lucide-react';
import type {
  CSSProperties,
  DragEvent as ReactDragEvent,
  MouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from 'react';

import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  resequenceBrainstormEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { WordCountText } from '@/shared/ui/WordCountText';
import { DEFAULT_WORKBENCH_ROLE_TYPES, isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import type { LibraryEntryDragState } from './workbenchLibraryDrag';
import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS,
} from './workbenchLibraryPanelConstants';
import { SETTING_TAB, UNCATEGORIZED_TYPE } from './workbenchLibraryTabs';
import { parseRoleContent } from './workbenchRoleContent';

type LibraryGroup = {
  type: string;
  displayType?: string;
  entries: WorkbenchLibraryEntry[];
};

type WorkbenchLibrarySidebarProps = {
  activeTab: string;
  effectiveLibraryTab: string;
  activeIsSettingLike: boolean;
  activeIsBrainstorm: boolean;
  isOutlineCharacterScope: boolean;
  activeSettingSidebarScrollKey: string | null;
  groupedSettingEntries: LibraryGroup[];
  currentEntries: WorkbenchLibraryEntry[];
  expandedRoleTypes: Set<string>;
  expandedSettingTypes: Set<string>;
  libraryDropTarget: { tab: string; type: string } | null;
  draggingLibraryEntry: LibraryEntryDragState;
  currentSelectedEntryId?: string | null;
  brainstormRecycleCount: number;
  libraryPointerSuppressClickRef: MutableRefObject<boolean>;
  style?: CSSProperties;
  getPreviewedLibraryGroupEntries: (
    entries: WorkbenchLibraryEntry[],
    tab: string,
    type: string,
  ) => WorkbenchLibraryEntry[];
  getEntryWordCount: (entry: WorkbenchLibraryEntry) => number;
  getEntryType: (entry: WorkbenchLibraryEntry, fallbackType: string) => string;
  handleSettingSidebarScroll: (key: string) => void;
  setExpandedRoleTypes: (value: SetStateAction<Set<string>>) => void;
  setExpandedSettingTypes: (value: SetStateAction<Set<string>>) => void;
  setSelectedIdForTab: (tab: string, id: string) => void;
  openCategoryMenu: (event: MouseEvent<HTMLButtonElement>, kind: 'role' | 'setting', type: string) => void;
  openEntryMenu: (event: MouseEvent<HTMLElement>, entry: WorkbenchLibraryEntry) => void;
  handleLibraryCategoryDragOver: (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
    shouldPreviewGroupEnd?: boolean,
  ) => void;
  handleLibraryCategoryDragLeave: (event: ReactDragEvent<HTMLElement>) => void;
  handleLibraryCategoryDrop: (event: ReactDragEvent<HTMLElement>, tab: string, type: string) => void;
  handleLibraryEntryDragStart: (event: ReactDragEvent<HTMLElement>, entry: WorkbenchLibraryEntry, type: string) => void;
  handleLibraryEntryDragOver: (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
    previewIndex?: number,
  ) => void;
  handleLibraryEntryDrop: (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
    previewIndex?: number,
  ) => void;
  handleLibraryEntryDragEnd: () => void;
  beginLibraryEntryPointerDrag: (
    event: ReactPointerEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => void;
  updateLibraryEntryPointerPreview: (event: ReactPointerEvent<HTMLElement>) => void;
  finishLibraryEntryPointerDrag: (event: ReactPointerEvent<HTMLElement>) => void;
  openSettingCreateDialog: (mode: 'category' | 'setting') => void;
  setIsBrainstormRecycleOpen: (isOpen: boolean) => void;
};

export function WorkbenchLibrarySidebar({
  activeTab,
  effectiveLibraryTab,
  activeIsSettingLike,
  activeIsBrainstorm,
  isOutlineCharacterScope,
  activeSettingSidebarScrollKey,
  groupedSettingEntries,
  currentEntries,
  expandedRoleTypes,
  expandedSettingTypes,
  libraryDropTarget,
  draggingLibraryEntry,
  currentSelectedEntryId,
  brainstormRecycleCount,
  libraryPointerSuppressClickRef,
  style,
  getPreviewedLibraryGroupEntries,
  getEntryWordCount,
  getEntryType,
  handleSettingSidebarScroll,
  setExpandedRoleTypes,
  setExpandedSettingTypes,
  setSelectedIdForTab,
  openCategoryMenu,
  openEntryMenu,
  handleLibraryCategoryDragOver,
  handleLibraryCategoryDragLeave,
  handleLibraryCategoryDrop,
  handleLibraryEntryDragStart,
  handleLibraryEntryDragOver,
  handleLibraryEntryDrop,
  handleLibraryEntryDragEnd,
  beginLibraryEntryPointerDrag,
  updateLibraryEntryPointerPreview,
  finishLibraryEntryPointerDrag,
  openSettingCreateDialog,
  setIsBrainstormRecycleOpen,
}: WorkbenchLibrarySidebarProps) {
  const groups = activeIsSettingLike
    ? isOutlineCharacterScope
      ? (() => {
          const groupByType = new Map(groupedSettingEntries.map((group) => [group.type, group]));
          const neutralType = String.fromCharCode(20013, 31435, 35282, 33394);
          const usedTypes = new Set<string>();
          const makeGroup = (label: string, types: string[], fallbackType: string) => {
            const matched = types.map((type) => groupByType.get(type)).filter(Boolean) as LibraryGroup[];
            types.forEach((type) => usedTypes.add(type));
            return {
              type: matched[0]?.type ?? fallbackType,
              displayType: label,
              entries: matched.flatMap((group) => group.entries),
            };
          };
          const defaults = DEFAULT_WORKBENCH_ROLE_TYPES;
          const nextGroups = [
            makeGroup(String.fromCharCode(30007, 22899, 20027), defaults.slice(0, 2), defaults[0]),
            makeGroup(String.fromCharCode(26680, 24515, 37197, 35282), [defaults[2], defaults[4]], defaults[2]),
            makeGroup(String.fromCharCode(27491, 27966, 35282, 33394), [defaults[3]], defaults[3]),
            makeGroup(String.fromCharCode(21453, 27966, 35282, 33394), [defaults[5]], defaults[5]),
            makeGroup(String.fromCharCode(20013, 31435, 35282, 33394), [neutralType], neutralType),
            makeGroup(String.fromCharCode(40857, 22871, 35282, 33394), [defaults[6]], defaults[6]),
          ];
          groupedSettingEntries.forEach((group) => {
            if (!usedTypes.has(group.type)) {
              nextGroups.push({ ...group, displayType: group.displayType ?? group.type });
            }
          });
          return nextGroups;
        })()
      : groupedSettingEntries
    : [{ type: UNCATEGORIZED_TYPE, entries: currentEntries }];

  return (
    <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2" style={style}>
      <div
        className={`${activeIsBrainstorm ? 'mt-0' : 'mt-2'} xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto space-y-1 ${
          activeSettingSidebarScrollKey === 'setting-sidebar' ? 'scrollbar-active' : ''
        }`}
        onScroll={() => handleSettingSidebarScroll('setting-sidebar')}
      >
        {groups.map((group) => {
          const expanded = isOutlineCharacterScope
            ? expandedRoleTypes.has(group.type)
            : expandedSettingTypes.has(group.type);
          const isDropTarget = libraryDropTarget?.tab === effectiveLibraryTab && libraryDropTarget.type === group.type;
          const previewEntries = getPreviewedLibraryGroupEntries(group.entries, effectiveLibraryTab, group.type);
          const GroupFolderIcon = expanded ? FolderOpen : Folder;
          return (
            <div
              key={group.type}
              data-library-group-tab={effectiveLibraryTab}
              data-library-group-type={group.type}
              onDragOver={(event) =>
                handleLibraryCategoryDragOver(event, effectiveLibraryTab, group.type, group.entries.length === 0)
              }
              onDragLeave={handleLibraryCategoryDragLeave}
              onDrop={(event) => handleLibraryCategoryDrop(event, effectiveLibraryTab, group.type)}
              className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
            >
              <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
                <button
                  onContextMenu={(event) => {
                    if (activeIsSettingLike && !activeIsBrainstorm)
                      openCategoryMenu(event, isOutlineCharacterScope ? 'role' : 'setting', group.type);
                  }}
                  onClick={() => {
                    setExpandedSettingTypes((prev) => {
                      if (isOutlineCharacterScope) return prev;
                      const next = new Set(prev);
                      if (next.has(group.type)) next.delete(group.type);
                      else next.add(group.type);
                      return next;
                    });
                    if (isOutlineCharacterScope) {
                      setExpandedRoleTypes((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.type)) next.delete(group.type);
                        else next.add(group.type);
                        return next;
                      });
                    }
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={expanded}
                >
                  <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                  <span className="min-w-0 flex-1 truncate leading-none">{group.displayType ?? group.type}</span>
                  <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{previewEntries.length}</span>
                </button>
              </div>
              {expanded && (
                <div className="mt-0.5 space-y-0.5">
                  {previewEntries.length === 0 ? (
                    <div className={WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS}>
                      {isOutlineCharacterScope
                        ? '暂无角色'
                        : activeTab === SETTING_TAB
                          ? '暂无设定'
                          : `该分类下暂无${activeTab}`}
                    </div>
                  ) : (
                    previewEntries.map((entry, previewIndex) => {
                      const entryWordCount = getEntryWordCount(entry);
                      const entryType = getEntryType(entry, group.type);
                      return (
                        <button
                          key={entry.id}
                          data-library-entry-id={entry.id}
                          data-library-entry-tab={effectiveLibraryTab}
                          data-library-entry-type={entryType}
                          data-library-entry-preview-index={previewIndex}
                          onDragStart={(event) => handleLibraryEntryDragStart(event, entry, entryType)}
                          onDragOver={(event) => handleLibraryEntryDragOver(event, entry, entryType, previewIndex)}
                          onDrop={(event) => handleLibraryEntryDrop(event, entry, entryType, previewIndex)}
                          onDragEnd={handleLibraryEntryDragEnd}
                          onPointerDown={(event) => beginLibraryEntryPointerDrag(event, entry, entryType)}
                          onPointerMove={updateLibraryEntryPointerPreview}
                          onPointerUp={finishLibraryEntryPointerDrag}
                          onPointerCancel={finishLibraryEntryPointerDrag}
                          onContextMenu={(event) => openEntryMenu(event, entry)}
                          onClick={(event) => {
                            if (libraryPointerSuppressClickRef.current) {
                              event.preventDefault();
                              event.stopPropagation();
                              return;
                            }
                            setSelectedIdForTab(effectiveLibraryTab, entry.id);
                          }}
                          className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} ${
                            currentSelectedEntryId === entry.id
                              ? 'border-transparent xy-selected-mint-bg text-gray-900'
                              : activeIsBrainstorm
                                ? 'border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                                : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                          } ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                        >
                          <div className="flex w-full items-center gap-2">
                            {activeIsBrainstorm && (
                              <span className="-ml-1 shrink-0 text-sm font-black text-[#08AACE]">
                                {entry.brainstormSerialNumber ?? previewIndex + 1}
                              </span>
                            )}
                            <span
                              className={`min-w-0 truncate text-sm font-black text-gray-700 ${
                                activeIsBrainstorm ? '' : 'pl-3'
                              }`}
                            >
                              {entry.title}
                            </span>
                            {isOutlineCharacterScope && isMaleProtagonistRoleType(parseRoleContent(entry.content).type) ? (
                              <span className="shrink-0 rounded-md bg-[#E7F8FD] px-1.5 py-0.5 text-xs font-black text-[#08AACE]">
                                男主
                              </span>
                            ) : null}
                            <span className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]">
                              <WordCountText value={entryWordCount} compact />
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!activeIsBrainstorm && (
        <div className="mt-3 shrink-0 space-y-2">
          <div className="grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div
              className="flex min-w-0 items-center justify-center whitespace-nowrap border-r border-slate-200 bg-[#DFF7FC] px-2 text-sm font-black text-[#08AACE]"
              aria-disabled="true"
            >
              新建
            </div>
            <button
              type="button"
              onClick={() => openSettingCreateDialog('category')}
              className="min-w-0 whitespace-nowrap border-r border-slate-200 bg-white px-2 text-sm font-black text-slate-700 transition-colors hover:bg-[#EAF9FD] hover:text-[#08AACE]"
            >
              分组
            </button>
            <button
              type="button"
              onClick={() => openSettingCreateDialog('setting')}
              className="min-w-0 whitespace-nowrap bg-white px-2 text-sm font-black text-slate-700 transition-colors hover:bg-[#EAF9FD] hover:text-[#08AACE]"
            >
              {isOutlineCharacterScope ? '角色' : '设定'}
            </button>
          </div>
        </div>
      )}
      {activeIsBrainstorm && (
        <div className="shrink-0 space-y-2 border-t border-gray-100 bg-gray-50 pt-3">
          <button
            type="button"
            disabled={currentEntries.length === 0}
            onClick={() => {
              const brainstormEntries = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY);
              writeWorkbenchLibraryEntries(
                GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
                resequenceBrainstormEntries(brainstormEntries),
              );
            }}
            className="h-10 w-full rounded-xl border border-cyan-200 bg-white px-3 text-sm font-black text-[#08AACE] shadow-sm transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            脑洞排序
          </button>
          <button
            type="button"
            onClick={() => setIsBrainstormRecycleOpen(true)}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-left shadow-sm transition-colors hover:border-red-200 hover:bg-red-100"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-red-500">
                <Trash2 className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-black text-slate-800">脑洞回收站</span>
            </span>
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-red-400">
              {brainstormRecycleCount}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
