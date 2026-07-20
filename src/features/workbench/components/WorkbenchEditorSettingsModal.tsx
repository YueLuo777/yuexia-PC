import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';
import { WorkbenchReplaceBodyWarningSetting } from './WorkbenchReplaceBodyWarningSetting';

type WorkbenchEditorSettingsModalProps = {
  publishConfirm: boolean;
  onChangePublishConfirm: (checked: boolean) => void;
  onClose: () => void;
};

export function WorkbenchEditorSettingsModal({
  publishConfirm,
  onChangePublishConfirm,
  onClose,
}: WorkbenchEditorSettingsModalProps) {
  const draggable = useDraggableModal('workbench_editor_settings');
  useTopModalEscape(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        className="relative w-[520px] max-w-[94vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-12 cursor-move items-center justify-between border-b border-gray-100 px-5"
        >
          <h2 className="text-base font-bold text-gray-900">作品编辑器设定</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            关闭
          </button>
        </header>

        <div className="space-y-3 p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand/60">
            <input
              type="checkbox"
              checked={publishConfirm}
              onChange={(event) => onChangePublishConfirm(event.target.checked)}
              className="mt-1 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-base font-bold text-gray-900">发布确认</span>
              <span className="mt-1 block text-sm leading-6 text-gray-500">
                勾选后，点击发布章节时，会先弹出确认窗口，避免误点发布。
              </span>
            </span>
          </label>
          <WorkbenchReplaceBodyWarningSetting />
          <WorkbenchNavigationWidthToggle />
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>
  );
}
