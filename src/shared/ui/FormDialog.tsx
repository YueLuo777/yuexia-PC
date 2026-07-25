import type { ReactNode } from 'react';

import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

type FormDialogProps = {
  isOpen: boolean;
  title: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  inputId: string;
  subtitle?: ReactNode;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  storageId?: string;
  widthClass?: string;
  zIndexClass?: string;
  autoFocus?: boolean;
  confirmDisabled?: boolean;
};

export function FormDialog({
  isOpen,
  title,
  label,
  value,
  onValueChange,
  onClose,
  onConfirm,
  inputId,
  subtitle,
  placeholder,
  confirmLabel = '确定',
  cancelLabel = '取消',
  storageId,
  widthClass = 'w-[420px]',
  zIndexClass,
  autoFocus = true,
  confirmDisabled = !value.trim(),
}: FormDialogProps) {
  const confirm = () => {
    if (confirmDisabled) return;
    onConfirm();
  };

  return (
    <AppModalShell
      title={title}
      subtitle={subtitle}
      isOpen={isOpen}
      onClose={onClose}
      widthClass={widthClass}
      heightClass="h-auto"
      storageId={storageId}
      zIndexClass={zIndexClass}
      contentClassName="flex min-h-0 flex-col"
    >
      <div className="px-6 py-5">
        <label className="block text-sm font-bold text-slate-700" htmlFor={inputId}>
          {label}
        </label>
        <input
          id={inputId}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
            if (event.key === 'Enter' && !isImeComposing) confirm();
          }}
          placeholder={placeholder}
          className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
        />
      </div>
      <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <ActionButton onClick={onClose} variant="secondary">
          {cancelLabel}
        </ActionButton>
        <ActionButton onClick={confirm} disabled={confirmDisabled}>
          {confirmLabel}
        </ActionButton>
      </footer>
    </AppModalShell>
  );
}
