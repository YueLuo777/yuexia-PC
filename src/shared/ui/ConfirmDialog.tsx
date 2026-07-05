import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ActionButton } from '@/shared/ui/ActionButton';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
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
  showCancel = true,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const draggable = useDraggableModal(`confirm_${title}`);
  useTopModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const iconClass =
    confirmVariant === 'primary'
      ? 'bg-brand/10 text-brand'
      : confirmVariant === 'warning'
        ? 'bg-amber-50 text-amber-500'
        : 'bg-red-50 text-red-500';

  const confirmButtonVariant = confirmVariant === 'primary' ? 'primary' : 'danger';

  const Icon = confirmVariant === 'danger' ? Trash2 : AlertTriangle;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
      style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      onClick={onClose}
    >
      <div
        className="modal-sharp relative w-[460px] max-w-[92vw] rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        data-draggable-managed="true"
        style={{ ...draggable.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex cursor-default items-start justify-between px-7 py-6"
          {...draggable.dragHandleProps}
          style={{ ...draggable.dragHandleProps.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        >
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[28px] font-bold leading-none text-slate-900">{title}</h3>
              <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-600">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-no-modal-drag="true"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 px-7 pb-7">
          {showCancel ? (
            <ActionButton onClick={onClose} variant="secondary">
              {cancelText}
            </ActionButton>
          ) : null}
          <ActionButton onClick={onConfirm} variant={confirmButtonVariant}>
            {confirmText}
          </ActionButton>
        </div>
        <ModalResizeHandles draggable={draggable} />
      </div>
    </div>,
    document.body,
  );
}
