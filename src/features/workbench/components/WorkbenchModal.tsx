import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';

interface WorkbenchModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}

export function WorkbenchModal({ title, isOpen, onClose, children, widthClass = 'w-[720px]' }: WorkbenchModalProps) {
  const draggable = useDraggableModal(`workbench_${title}`);
  useTopModalEscape(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id === 'close_floating') onClose();
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => {
      window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`flex h-[78vh] max-h-[86vh] ${widthClass} max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl`}
        data-draggable-managed="true"
        style={draggable.style}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex shrink-0 cursor-move items-center justify-between gap-4 border-b border-gray-100 px-5 py-3"
          {...draggable.dragHandleProps}
        >
          <h2 className="shrink-0 text-base font-bold text-gray-900">{title}</h2>
          <div id="workbench-modal-header-extra" className="min-w-0 flex-1" />
          <button
            onClick={onClose}
            data-no-modal-drag="true"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
