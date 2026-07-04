import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';

export function LibraryAiLogShell({
  id,
  subtitle,
  onClose,
  children,
}: {
  id: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const draggable = useDraggableModal(id);
  useTopModalEscape(true, onClose);

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[285] flex items-center justify-center bg-black/35 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        style={draggable.style}
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1120px,94vw)] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-14 shrink-0 cursor-move items-center justify-between border-b border-slate-100 px-5"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">输出日志</h2>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          </div>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            关闭
          </button>
        </header>
        {children}
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('top')} className="absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('bottom')} className="absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('left')} className="absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('right')} className="absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.resizeHandleProps} className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize">
          <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
        </div>
      </section>
    </div>,
    document.body,
  );
}
