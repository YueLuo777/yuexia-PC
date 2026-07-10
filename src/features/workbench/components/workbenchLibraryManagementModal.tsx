import { createPortal } from 'react-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import { WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS } from './workbenchManagementModalSize';

export type LibraryManagementModalState = { type: 'models' } | { type: 'prompts'; category: string } | null;

export function LibraryManagementModal({
  modal,
  onClose,
}: {
  modal: Exclude<LibraryManagementModalState, null>;
  onClose: () => void;
}) {
  useTopModalEscape(true, onClose);

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/30 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-global-modal-static="true"
        className={`modal-sharp relative flex ${WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS} max-w-[80vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]`}
      >
        {modal.type === 'prompts' ? (
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <h2 className="text-base font-bold text-slate-900">提示词管理</h2>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              关闭
            </button>
          </header>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">
          {modal.type === 'models' ? (
            <ModelManagePage embedded onClose={onClose} />
          ) : (
            <PromptsPage initialCategory={modal.category} />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
