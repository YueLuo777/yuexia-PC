import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import type { ClearSettingsMeta, PendingEntryDelete } from '@/features/workbench/model/workbenchLibraryPanelModel';

type EntryDeleteConfirmDialogProps = {
  pendingEntry: PendingEntryDelete;
  roleTab: string;
  brainstormTab: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function EntryDeleteConfirmDialog({
  pendingEntry,
  roleTab,
  brainstormTab,
  onClose,
  onConfirm,
}: EntryDeleteConfirmDialogProps) {
  const pendingDeleteLabel = pendingEntry?.tab === roleTab ? '角色' : pendingEntry?.tab;
  const description =
    pendingEntry?.tab === brainstormTab
      ? `确定要删除脑洞「${pendingEntry?.title ?? ''}」吗？\n删除后会进入脑洞回收站，可以恢复。`
      : `确定要删除${pendingDeleteLabel ?? '内容'}「${pendingEntry?.title ?? ''}」吗？\n删除后无法恢复。`;

  return (
    <ConfirmDialog
      isOpen={Boolean(pendingEntry)}
      title="确认删除"
      description={description}
      confirmText="删除"
      cancelText="取消"
      confirmVariant="danger"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

type ClearSettingsConfirmDialogProps = {
  isOpen: boolean;
  step: number;
  meta: ClearSettingsMeta;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClearSettingsConfirmDialog({
  isOpen,
  step,
  meta,
  onClose,
  onConfirm,
}: ClearSettingsConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={step === 1 ? `确认清空${meta.label}` : `再次确认清空${meta.label}`}
      description={
        step === 1
          ? `${meta.description}\n\n这是第一次确认，点击确认后还需要再确认一次。`
          : `最后确认：即将清空${meta.label}，这个操作会立即生效。请确认不是误点。`
      }
      confirmText={step === 1 ? '确认，继续' : `确认清空${meta.label}`}
      cancelText="再看看"
      confirmVariant="danger"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
