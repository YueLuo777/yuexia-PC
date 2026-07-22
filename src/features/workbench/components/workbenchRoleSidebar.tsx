import { Folder, FolderOpen, Search } from 'lucide-react';
import type {
  DragEvent as ReactDragEvent,
  MouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { DEFAULT_WORKBENCH_ROLE_TYPES, isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import type { LibraryEntryDragState } from './workbenchLibraryDrag';
import { parseRoleContent } from './workbenchRoleContent';
import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS,
} from './workbenchLibraryPanelConstants';

type RoleGroup = {
  type: string;
  label?: string;
  entries: WorkbenchLibraryEntry[];
};

type WorkbenchRoleSidebarProps = {
  roleTab: string;
  roleSearch: string;
  groupedRoles: RoleGroup[];
  expandedRoleTypes: Set<string>;
  libraryDropTarget: { tab: string; type: string } | null;
  draggingLibraryEntry: LibraryEntryDragState;
  selectedEntryId?: string;
  libraryPointerSuppressClickRef: MutableRefObject<boolean>;
  getPreviewedLibraryGroupEntries: (
    entries: WorkbenchLibraryEntry[],
    tab: string,
    type: string,
  ) => WorkbenchLibraryEntry[];
  setExpandedRoleTypes: (value: SetStateAction<Set<string>>) => void;
  setRoleSearch: (value: string) => void;
  setSelectedId: (id: string) => void;
  openCategoryMenu: (event: MouseEvent<HTMLButtonElement>, kind: 'role', type: string) => void;
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
  shouldShowRolePinAction: (type: string) => boolean;
  toggleRolePinned: (entry: WorkbenchLibraryEntry) => void;
  openSettingCreateDialog: (mode: 'category' | 'setting') => void;
};

export function WorkbenchRoleSidebar({
  roleTab,
  roleSearch,
  groupedRoles,
  expandedRoleTypes,
  libraryDropTarget,
  draggingLibraryEntry,
  selectedEntryId,
  libraryPointerSuppressClickRef,
  getPreviewedLibraryGroupEntries,
  setExpandedRoleTypes,
  setRoleSearch,
  setSelectedId,
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
  shouldShowRolePinAction,
  toggleRolePinned,
  openSettingCreateDialog,
}: WorkbenchRoleSidebarProps) {
  const groupByType = new Map(groupedRoles.map((group) => [group.type, group]));
  const neutralType = String.fromCharCode(20013, 31435, 35282, 33394);
  const usedTypes = new Set<string>();
  const makeGroup = (label: string, types: string[], fallbackType: string): RoleGroup => {
    const matched = types.map((type) => groupByType.get(type)).filter(Boolean) as RoleGroup[];
    types.forEach((type) => usedTypes.add(type));
    return { type: matched[0]?.type ?? fallbackType, label, entries: matched.flatMap((group) => group.entries) };
  };
  const defaults = DEFAULT_WORKBENCH_ROLE_TYPES;
  const displayGroups = [
    makeGroup(String.fromCharCode(30007, 22899, 20027), defaults.slice(0, 2), defaults[0]),
    makeGroup(String.fromCharCode(26680, 24515, 37197, 35282), [defaults[2], defaults[4]], defaults[2]),
    makeGroup(String.fromCharCode(27491, 27966, 35282, 33394), [defaults[3]], defaults[3]),
    makeGroup(String.fromCharCode(21453, 27966, 35282, 33394), [defaults[5]], defaults[5]),
    makeGroup(String.fromCharCode(20013, 31435, 35282, 33394), [neutralType], neutralType),
    makeGroup(String.fromCharCode(40857, 22871, 35282, 33394), [defaults[6]], defaults[6]),
    ...groupedRoles.filter((group) => !usedTypes.has(group.type)),
  ];

  return (
    <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2">
      <label className="mx-1 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          aria-label="搜索人物"
          value={roleSearch}
          onChange={(event) => setRoleSearch(event.target.value)}
          placeholder="搜索人物..."
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {displayGroups.map((group) => {
          const expanded = expandedRoleTypes.has(group.type);
          const isDropTarget = libraryDropTarget?.tab === roleTab && libraryDropTarget.type === group.type;
          const previewEntries = getPreviewedLibraryGroupEntries(group.entries, roleTab, group.type);
          const GroupFolderIcon = expanded ? FolderOpen : Folder;
          return (
            <div
              key={group.type}
              data-library-group-tab={roleTab}
              data-library-group-type={group.type}
              onDragOver={(event) =>
                handleLibraryCategoryDragOver(event, roleTab, group.type, group.entries.length === 0)
              }
              onDragLeave={handleLibraryCategoryDragLeave}
              onDrop={(event) => handleLibraryCategoryDrop(event, roleTab, group.type)}
              className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
            >
              <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
                <button
                  onContextMenu={(event) => openCategoryMenu(event, 'role', group.type)}
                  onClick={() => {
                    setExpandedRoleTypes((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.type)) next.delete(group.type);
                      else next.add(group.type);
                      return next;
                    });
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={expanded}
                >
                  <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                  <span className="min-w-0 flex-1 truncate leading-none">{group.label ?? group.type}</span>
                  <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{previewEntries.length}</span>
                </button>
              </div>
              {expanded && (
                <div className="editor-scrollbar mt-1 max-h-[464px] space-y-1 overflow-y-auto pr-1">
                  {previewEntries.map((entry, previewIndex) => {
                    const showPinAction = shouldShowRolePinAction(group.type);
                    return (
                      <div
                        key={entry.id}
                        data-library-entry-id={entry.id}
                        data-library-entry-tab={roleTab}
                        data-library-entry-type={group.type}
                        data-library-entry-preview-index={previewIndex}
                        onDragStart={(event) => handleLibraryEntryDragStart(event, entry, group.type)}
                        onDragOver={(event) => handleLibraryEntryDragOver(event, entry, group.type, previewIndex)}
                        onDrop={(event) => handleLibraryEntryDrop(event, entry, group.type, previewIndex)}
                        onDragEnd={handleLibraryEntryDragEnd}
                        onPointerDown={(event) => beginLibraryEntryPointerDrag(event, entry, group.type)}
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
                          setSelectedId(entry.id);
                        }}
                        className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} flex items-center gap-2 ${
                          selectedEntryId === entry.id
                            ? 'border-transparent xy-selected-mint-bg text-gray-900'
                            : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                        } ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-0 truncate">{entry.title}</span>
                          <span
                            aria-label={`${parseRoleContent(entry.content).lifeStatus}状态`}
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              parseRoleContent(entry.content).lifeStatus === '死亡'
                                ? 'bg-red-500'
                                : 'bg-emerald-500'
                            }`}
                            title={parseRoleContent(entry.content).lifeStatus}
                          />
                        </span>
                        {isMaleProtagonistRoleType(parseRoleContent(entry.content).type) ? (
                          <span className="shrink-0 rounded-md bg-[#E7F8FD] px-1.5 py-0.5 text-xs font-black text-[#08AACE]">
                            男主
                          </span>
                        ) : null}
                        {showPinAction && (
                          <button
                            type="button"
                            draggable={false}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleRolePinned(entry);
                            }}
                            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                              entry.pinnedAt
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-brand-light hover:text-brand'
                            }`}
                            title={entry.pinnedAt ? '鍙栨秷缃《' : '缃《'}
                          >
                            {entry.pinnedAt ? '鍙栨秷' : '缃《'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid h-11 shrink-0 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <span className="flex items-center justify-center border-r border-slate-200 bg-[#DFF7FC] text-sm font-black text-[#08AACE]">
          新建
        </span>
        <button
          type="button"
          onClick={() => openSettingCreateDialog('category')}
          className="border-r border-slate-200 text-sm font-black text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
        >
          分组
        </button>
        <button
          type="button"
          onClick={() => openSettingCreateDialog('setting')}
          className="text-sm font-black text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
        >
          人物
        </button>
      </div>
    </aside>
  );
}
