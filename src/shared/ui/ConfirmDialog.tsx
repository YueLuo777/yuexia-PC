import { AlertTriangle, Trash2 } from 'lucide-react';

import { ActionButton, type ActionButtonVariant } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  cancelVariant?: ActionButtonVariant;
  destructiveActionSecondary?: boolean;
  confirmFirst?: boolean;
  initialFocus?: 'confirm' | 'cancel' | 'none';
  showCancel?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'danger',
  cancelVariant = 'secondary',
  destructiveActionSecondary = false,
  confirmFirst = false,
  initialFocus = 'none',
  showCancel = true,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const iconClass =
    confirmVariant === 'primary'
      ? 'bg-brand/10 text-brand'
      : confirmVariant === 'warning'
        ? 'bg-amber-50 text-amber-500'
        : 'bg-red-50 text-red-500';

  const confirmButtonVariant = destructiveActionSecondary
    ? 'dangerOutline'
    : confirmVariant === 'primary'
      ? 'primary'
      : 'danger';

  const Icon = confirmVariant === 'danger' ? Trash2 : AlertTriangle;
  const cancelAction = showCancel ? (
    <ActionButton key="cancel" autoFocus={initialFocus === 'cancel'} onClick={onClose} variant={cancelVariant}>
      {cancelText}
    </ActionButton>
  ) : null;
  const confirmAction = (
    <ActionButton
      key="confirm"
      autoFocus={initialFocus === 'confirm'}
      onClick={onConfirm}
      variant={confirmButtonVariant}
    >
      {confirmText}
    </ActionButton>
  );

  return (
    <AppModalShell
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[460px]"
      heightClass="h-auto"
      storageId={`confirm_${title}`}
      zIndexClass="z-[300]"
      contentClassName="flex min-h-0 flex-col"
      centerOnOpen
    >
      <div className="flex items-start gap-4 px-6 py-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="whitespace-pre-wrap pt-0.5 text-sm font-medium leading-7 text-slate-600">{description}</p>
      </div>
      <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        {confirmFirst ? confirmAction : cancelAction}
        {confirmFirst ? cancelAction : confirmAction}
      </footer>
    </AppModalShell>
  );
}
