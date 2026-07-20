import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

export function ModalShell({
  title,
  icon,
  children,
  onClose,
  widthClass = 'w-[520px]',
  closeOnBackdrop = true,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
  closeOnBackdrop?: boolean;
}) {
  const draggable = useDraggableModal(`editor_tool_${title}`);
  useTopModalEscape(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-black/40"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`relative ${widthClass} max-h-[88vh] max-w-[94vw] overflow-hidden rounded-xl bg-white shadow-2xl`}
        data-draggable-managed="true"
        style={draggable.style}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex cursor-move items-center justify-between border-b border-gray-100 px-5 py-3"
          {...draggable.dragHandleProps}
        >
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
          </div>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        <ModalResizeHandles draggable={draggable} />
      </div>
    </div>
  );
}
