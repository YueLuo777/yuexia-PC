import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';

export type LibraryManagementModalState =
  | { type: 'models' }
  | { type: 'prompts'; category: string }
  | null;

export function LibraryManagementModal({
  modal,
  onClose,
}: {
  modal: Exclude<LibraryManagementModalState, null>;
  onClose: () => void;
}) {
  const draggable = useDraggableModal(`workbench_library_${modal.type}_${modal.type === 'prompts' ? modal.category : 'models'}`);
  useTopModalEscape(true, onClose);

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/30 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        style={draggable.style}
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1200px,94vw)] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-12 shrink-0 cursor-move items-center justify-between border-b border-slate-100 px-5"
        >
          <h2 className="text-base font-bold text-slate-900">{modal.type === 'models' ? '模型管理' : '提示词管理'}</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          {modal.type === 'models' ? <ModelManagePage /> : <PromptsPage initialCategory={modal.category} />}
        </div>
      </section>
    </div>,
    document.body,
  );
}
