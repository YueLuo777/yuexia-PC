import { Folder, FolderOpen } from 'lucide-react';
import type {
  CSSProperties,
  DragEvent as ReactDragEvent,
  MouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import type { WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec } from './workbenchFieldSizeSettings';
import type { LibraryEntryDragState } from './workbenchLibraryDrag';
import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from './workbenchLibraryPanelConstants';

type RoleGroup = {
  type: string;
  entries: WorkbenchLibraryEntry[];
};

type WorkbenchRoleSidebarProps = {
  roleTab: string;
  roleSearch: string;
  roleTypeDraft: string;
  roleNameDraft: string;
  groupedRoles: RoleGroup[];
  expandedRoleTypes: Set<string>;
  libraryDropTarget: { tab: string; type: string } | null;
  draggingLibraryEntry: LibraryEntryDragState;
  selectedEntryId?: string;
  fieldSizeSpecs: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>;
  libraryPointerSuppressClickRef: MutableRefObject<boolean>;
  getFieldSizeStyle: (key: WorkbenchFieldSizeKey) => CSSProperties;
  getPreviewedLibraryGroupEntries: (
    entries: WorkbenchLibraryEntry[],
    tab: string,
    type: string,
  ) => WorkbenchLibraryEntry[];
  setExpandedRoleTypes: (value: SetStateAction<Set<string>>) => void;
  setRoleSearch: (value: string) => void;
  setRoleTypeDraft: (value: string) => void;
  setRoleNameDraft: (value: string) => void;
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
  handleLibraryEntryDragStart: (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => void;
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
  addRoleType: () => void;
  addRole: (type: string) => void;
  getDefaultRoleCreateType: () => string;
};

export function WorkbenchRoleSidebar({
  roleTab,
  roleSearch,
  roleTypeDraft,
  roleNameDraft,
  groupedRoles,
  expandedRoleTypes,
  libraryDropTarget,
  draggingLibraryEntry,
  selectedEntryId,
  fieldSizeSpecs,
  libraryPointerSuppressClickRef,
  getFieldSizeStyle,
  getPreviewedLibraryGroupEntries,
  setExpandedRoleTypes,
  setRoleSearch,
  setRoleTypeDraft,
  setRoleNameDraft,
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
  addRoleType,
  addRole,
  getDefaultRoleCreateType,
}: WorkbenchRoleSidebarProps) {
  return (
    <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-4 pb-3 pt-2">
      <div className="flex shrink-0 gap-2">
        <div
          className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleSearch.trim() ? 'xy-has-value' : ''}`}
          style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
        >
          <input
            value={roleSearch}
            onChange={(event) => setRoleSearch(event.target.value)}
            placeholder="鎼滅储瑙掕壊..."
          />
          <label>鎼滅储瑙掕壊</label>
        </div>
        <button className="h-11 min-w-[64px] shrink-0 whitespace-nowrap rounded-2xl bg-brand px-4 text-sm font-bold text-white">鎼滅储</button>
      </div>

      <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {groupedRoles.map((group) => {
          const expanded = expandedRoleTypes.has(group.type);
          const isDropTarget = libraryDropTarget?.tab === roleTab && libraryDropTarget.type === group.type;
          const previewEntries = getPreviewedLibraryGroupEntries(group.entries, roleTab, group.type);
          const GroupFolderIcon = expanded ? FolderOpen : Folder;
          return (
            <div
              key={group.type}
              data-library-group-tab={roleTab}
              data-library-group-type={group.type}
              onDragOver={(event) => handleLibraryCategoryDragOver(event, roleTab, group.type, group.entries.length === 0)}
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
                  <span className="min-w-0 flex-1 truncate leading-none">{group.type}</span>
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
                        className={`flex w-full cursor-default select-none items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm font-black transition-[background-color,border-color,box-shadow,opacity,transform] duration-150 ${
                          selectedEntryId === entry.id
                            ? 'border-transparent xy-selected-mint-bg text-gray-900'
                            : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                        } ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                      >
                        <span className="min-w-0 flex-1 truncate">{entry.title}</span>
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

      <div className="mt-3 flex shrink-0 flex-col gap-2">
        <div className="flex gap-2">
          <div
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleTypeDraft.trim() ? 'xy-has-value' : ''}`}
            style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
          >
            <input
              value={roleTypeDraft}
              onChange={(event) => setRoleTypeDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addRoleType();
              }}
              placeholder="鍒嗙被鍚嶅瓧"
            />
            <label>鍒嗙被鍚嶅瓧</label>
          </div>
          <button
            onClick={addRoleType}
            className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            鏂板缓鍒嗙被
          </button>
        </div>
        <div className="flex gap-2">
          <div
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleNameDraft.trim() ? 'xy-has-value' : ''}`}
            style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
          >
            <input
              value={roleNameDraft}
              onChange={(event) => setRoleNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addRole(getDefaultRoleCreateType());
              }}
              placeholder="瑙掕壊鍚嶅瓧"
            />
            <label>瑙掕壊鍚嶅瓧</label>
          </div>
          <button onClick={() => addRole(getDefaultRoleCreateType())} className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark">
            鏂板缓瑙掕壊
          </button>
        </div>
      </div>
    </aside>
  );
}
