import { lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';

import { WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS } from './workbenchManagementModalSize';

export type WorkbenchManagementModalKey = 'models' | 'agents';

const LazyModelManagePage = lazy(() =>
  import('@/features/models/pages/ModelManagePage').then((module) => ({ default: module.ModelManagePage })),
);
const LazyPromptsPage = lazy(() =>
  import('@/features/prompts/pages/PromptsPage').then((module) => ({ default: module.PromptsPage })),
);

type WorkbenchManagementModalProps = {
  type: WorkbenchManagementModalKey;
  onClose: () => void;
};

export function WorkbenchManagementModal({ type, onClose }: WorkbenchManagementModalProps) {
  useTopModalEscape(true, onClose);
  const title = type === 'models' ? '模型管理' : '提示词管理';

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-8 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-global-modal-static="true"
        className={`relative flex ${WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]`}
      >
        {type === 'agents' ? (
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="关闭"
            >
              关闭
            </button>
          </header>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                正在加载管理页面…
              </div>
            }
          >
            {type === 'models' ? <LazyModelManagePage embedded onClose={onClose} /> : <LazyPromptsPage />}
          </Suspense>
        </div>
      </section>
    </div>,
    document.body,
  );
}
