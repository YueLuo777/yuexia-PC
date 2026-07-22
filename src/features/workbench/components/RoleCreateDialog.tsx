import { WorkbenchModal } from './WorkbenchModal';

type RoleCreateDialogProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function RoleCreateDialog({ draft, onDraftChange, onClose, onConfirm }: RoleCreateDialogProps) {
  return (
    <WorkbenchModal
      title="新建角色"
      isOpen
      onClose={onClose}
      widthClass="w-[420px]"
      heightClass="h-auto"
      storageId="role_create"
      zIndexClass="z-[280]"
      contentClassName="p-5"
    >
        <label htmlFor="workbench-role-create-name" className="mt-7 block text-sm font-bold text-slate-700">
          角色名字
        </label>
        <input
          id="workbench-role-create-name"
          autoFocus
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
            if (event.key === 'Enter' && !isImeComposing) onConfirm();
          }}
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-800 outline-none transition focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
          placeholder="例如：萧炎"
        />

        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg px-4 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!draft.trim()}
            className="h-10 rounded-lg bg-[#08AACE] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0798b8] disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            确认创建
          </button>
        </div>
    </WorkbenchModal>
  );
}
