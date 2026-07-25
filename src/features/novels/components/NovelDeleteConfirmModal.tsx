import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="确认删除"
      description={`${title}\n删除后将进入回收站，30 天内可恢复；到期后自动删除。`}
      confirmText="移入回收站"
      confirmVariant="warning"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
