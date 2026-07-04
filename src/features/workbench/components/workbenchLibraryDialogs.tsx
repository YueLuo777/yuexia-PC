import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type PromptDisableMenu = {
  tab: string;
  disabled: boolean;
  x: number;
  y: number;
} | null;

type SettingCreateDialogMode = 'category' | 'setting' | null;

type SettingCreateDialogProps = {
  mode: SettingCreateDialogMode;
  draft: string;
  itemLabel: string;
  typeOptions: string[];
  typeValue: string;
  onDraftChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function SettingCreateDialog({
  mode,
  draft,
  itemLabel,
  typeOptions,
  typeValue,
  onDraftChange,
  onTypeChange,
  onClose,
  onConfirm,
}: SettingCreateDialogProps) {
  if (!mode) return null;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="modal-sharp flex w-[min(460px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {mode === 'category' ? '新建分组' : `新建${itemLabel}`}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {mode === 'category' ? '输入分组名称，确认后会显示在左侧分组里。' : `选择所属分组，确认后会创建新的${itemLabel}。`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className={`xy-floating-field xy-floating-outline-fixed ${draft.trim() ? 'xy-has-value' : ''}`}>
            <input
              autoFocus
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
                if (event.key === 'Enter' && !isImeComposing) onConfirm();
              }}
              placeholder={mode === 'category' ? '输入分组名字' : `输入${itemLabel}名字`}
            />
            <label>{mode === 'category' ? '分组名字' : `${itemLabel}名字`}</label>
          </div>
          {mode === 'setting' && (
            <label className="mt-4 block text-sm font-black text-slate-700">
              <span className="mb-2 block text-xs text-slate-400">所属分组</span>
              <select
                value={typeValue}
                onChange={(event) => onTypeChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:ring-2 focus:ring-[#08AACE]/15"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!draft.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type CategoryRenameDialogProps = {
  isOpen: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryRenameDialog({
  isOpen,
  draft,
  onDraftChange,
  onClose,
  onConfirm,
}: CategoryRenameDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="modal-sharp flex w-[min(420px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">重命名分组</h3>
            <p className="mt-1 text-xs text-gray-400">默认分组不会进入这里，自建分组改名后，分组下内容会一起移动。</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className={`xy-floating-field xy-floating-outline-fixed ${draft.trim() ? 'xy-has-value' : ''}`}>
            <input
              autoFocus
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
                if (event.key === 'Enter' && !isImeComposing) onConfirm();
              }}
              placeholder="输入新的分组名字"
            />
            <label>分组名字</label>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!draft.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type EntryRenameDialogProps = {
  isOpen: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function EntryRenameDialog({
  isOpen,
  draft,
  onDraftChange,
  onClose,
  onConfirm,
}: EntryRenameDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-950/35 p-5"
      data-titlebar-no-drag="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="w-[min(420px,92vw)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        data-no-modal-drag="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900">重命名</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          data-no-modal-drag="true"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onConfirm();
            if (event.key === 'Escape') onClose();
          }}
          autoFocus
          className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!draft.trim()}
            className="h-10 rounded-xl bg-[#08AACE] text-sm font-black text-white transition-colors hover:bg-[#078fb0] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            保存
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

type PromptDisableContextMenuProps = {
  menu: PromptDisableMenu;
  onToggle: (tab: string, disabled: boolean) => void;
  onClose: () => void;
};

export function PromptDisableContextMenu({ menu, onToggle, onClose }: PromptDisableContextMenuProps) {
  if (!menu) return null;

  return createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[76px] max-w-[140px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        onClick={() => {
          onToggle(menu.tab, menu.disabled);
          onClose();
        }}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
      >
        {menu.disabled ? '启用' : '禁用'}
      </button>
    </div>,
    document.body,
  );
}
