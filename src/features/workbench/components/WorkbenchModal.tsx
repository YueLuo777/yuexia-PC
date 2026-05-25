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
  heightClass?: string;
  titleClassName?: string;
  closeOnBackdrop?: boolean;
}

export function WorkbenchModal({
  title,
  isOpen,
  onClose,
  children,
  widthClass = 'w-[720px]',
  heightClass = 'h-[78vh] max-h-[86vh]',
  titleClassName = 'text-base',
  closeOnBackdrop = true,
}: WorkbenchModalProps) {
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
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`relative flex ${heightClass} ${widthClass} max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl`}
        data-draggable-managed="true"
        style={draggable.style}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="group flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-3"
          {...draggable.dragHandleProps}
        >
          <h2 className={`shrink-0 cursor-move font-bold text-gray-900 ${titleClassName}`}>{title}</h2>
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
        <div
          data-no-modal-drag="true"
          {...draggable.getResizeHandleProps('top')}
          className="absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize"
          title="拖动调整弹窗高度"
        />
        <div
          data-no-modal-drag="true"
          {...draggable.getResizeHandleProps('bottom')}
          className="absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize"
          title="拖动调整弹窗高度"
        />
        <div
          data-no-modal-drag="true"
          {...draggable.getResizeHandleProps('left')}
          className="absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize"
          title="拖动调整弹窗宽度"
        />
        <div
          data-no-modal-drag="true"
          {...draggable.getResizeHandleProps('right')}
          className="absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize"
          title="拖动调整弹窗宽度"
        />
        <div
          data-no-modal-drag="true"
          {...draggable.resizeHandleProps}
          className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize"
          title="拖动调整弹窗大小"
        >
          <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
