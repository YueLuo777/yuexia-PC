import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { STATUS_PROMPT_CATEGORY } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';

import { REVIEW_MANAGEMENT_MODAL_SIZE_CLASS } from './chapterEditorLayout';
import type { ChapterReviewManagementMode } from './ChapterReviewManagementModal';

interface ChapterStatusManagementModalProps {
  mode: ChapterReviewManagementMode;
  onClose: () => void;
}

export function ChapterStatusManagementModal({ mode, onClose }: ChapterStatusManagementModalProps) {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/35 px-6 py-6" onClick={onClose}>
      <section
        data-global-modal-static="true"
        className={`flex ${REVIEW_MANAGEMENT_MODAL_SIZE_CLASS} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {mode === 'prompts' ? (
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            <h2 className="text-sm font-bold text-slate-900">{`${STATUS_PROMPT_CATEGORY}提示词管理`}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              关闭
            </button>
          </header>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">
          {mode === 'models' ? (
            <ModelManagePage embedded onClose={onClose} />
          ) : (
            <PromptsPage initialCategory={STATUS_PROMPT_CATEGORY} />
          )}
        </div>
      </section>
    </div>
  );
}
