import { FormDialog } from '@/shared/ui/FormDialog';

type RoleCreateDialogProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function RoleCreateDialog({ draft, onDraftChange, onClose, onConfirm }: RoleCreateDialogProps) {
  return (
    <FormDialog
      title="新建角色"
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      label="角色名字"
      value={draft}
      onValueChange={onDraftChange}
      inputId="workbench-role-create-name"
      placeholder="例如：萧炎"
      confirmLabel="确认创建"
      widthClass="w-[420px]"
      storageId="role_create"
      zIndexClass="z-[280]"
    />
  );
}
