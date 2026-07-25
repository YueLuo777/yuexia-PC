import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';
import { WorkbenchReplaceBodyWarningSetting } from './WorkbenchReplaceBodyWarningSetting';
import { WorkbenchModal } from './WorkbenchModal';

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
  return (
    <WorkbenchModal
      title="作品编辑器设定"
      isOpen
      onClose={onClose}
      widthClass="w-[520px]"
      heightClass="h-auto"
      storageId="workbench_editor_settings"
    >
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
    </WorkbenchModal>
  );
}
