import { createPortal } from 'react-dom';

export type LibraryCategoryMenu = {
  kind: 'role' | 'setting';
  type: string;
  x: number;
  y: number;
} | null;

export type LibraryEntryMenu = {
  entryId: string;
  title: string;
  tab: string;
  roleType?: string;
  pinnedAt?: number;
  x: number;
  y: number;
} | null;

type LibraryCategoryContextMenuProps = {
  menu: LibraryCategoryMenu;
  canDelete: boolean;
  canRename: boolean;
  clearEntryLabel: string;
  clearEntryDisabled: boolean;
  clearCategoryLabel: string;
  clearCategoryDisabled: boolean;
  onCreateEntry: () => void;
  onCreateGroup: () => void;
  onRenameGroup: () => void;
  onClearEntries: () => void;
  onClearCategories: () => void;
  onDeleteGroup: () => void;
};

export function LibraryCategoryContextMenu({
  menu,
  canDelete,
  canRename,
  clearEntryLabel,
  clearEntryDisabled,
  clearCategoryLabel,
  clearCategoryDisabled,
  onCreateEntry,
  onCreateGroup,
  onRenameGroup,
  onClearEntries,
  onClearCategories,
  onDeleteGroup,
}: LibraryCategoryContextMenuProps) {
  if (!menu) return null;

  return createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[136px] max-w-[220px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        onClick={onCreateEntry}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-[#08AACE] hover:bg-[#EAF9FD]"
      >
        新建{menu.kind === 'role' ? '角色' : '设定'}
      </button>
      <button
        type="button"
        onClick={onCreateGroup}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
      >
        新建分组
      </button>
      <button
        type="button"
        onClick={onRenameGroup}
        disabled={!canRename}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        重命名分组
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        type="button"
        onClick={onClearEntries}
        disabled={clearEntryDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        清空{clearEntryLabel}
      </button>
      <button
        type="button"
        onClick={onClearCategories}
        disabled={clearCategoryDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        清空{clearCategoryLabel}
      </button>
      {canDelete ? (
        <>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={onDeleteGroup}
            className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
          >
            删除分组
          </button>
        </>
      ) : null}
    </div>,
    document.body,
  );
}

type LibraryEntryContextMenuProps = {
  menu: LibraryEntryMenu;
  showPinAction: boolean;
  createDisabled: boolean;
  copyDisabled: boolean;
  renameDisabled: boolean;
  deleteDisabled: boolean;
  moveDisabled: boolean;
  moveOpen: boolean;
  moveOptions: string[];
  entryKindLabel: string;
  onTogglePin: () => void;
  onCreate: () => void;
  onCopy: () => void;
  onRename: () => void;
  onDelete: () => void;
  onToggleMoveOpen: () => void;
  onMoveToType: (type: string) => void;
};

export function LibraryEntryContextMenu({
  menu,
  showPinAction,
  createDisabled,
  copyDisabled,
  renameDisabled,
  deleteDisabled,
  moveDisabled,
  moveOpen,
  moveOptions,
  entryKindLabel,
  onTogglePin,
  onCreate,
  onCopy,
  onRename,
  onDelete,
  onToggleMoveOpen,
  onMoveToType,
}: LibraryEntryContextMenuProps) {
  if (!menu) return null;

  return createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[96px] max-w-[180px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: menu.x, top: menu.y }}
    >
      {showPinAction && (
        <button
          onClick={onTogglePin}
          className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-brand hover:bg-brand-light"
        >
          {menu.pinnedAt ? '取消置顶' : '置顶'}
        </button>
      )}
      <button
        onClick={onCreate}
        disabled={createDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        新建{entryKindLabel}
      </button>
      <button
        onClick={onCopy}
        disabled={copyDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        复制
      </button>
      <button
        onClick={onRename}
        disabled={renameDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        重命名
      </button>
      {moveOptions.length > 0 && (
        <>
          <button
            type="button"
            onClick={onToggleMoveOpen}
            disabled={moveDisabled}
            className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            移动到分组
          </button>
          {moveOpen && !moveDisabled && (
            <div className="my-1 max-h-44 overflow-y-auto border-y border-gray-100 py-1">
              {moveOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onMoveToType(type)}
                  className="w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-xs font-black text-slate-500 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <button
        onClick={onDelete}
        disabled={deleteDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        删除
      </button>
    </div>,
    document.body,
  );
}
