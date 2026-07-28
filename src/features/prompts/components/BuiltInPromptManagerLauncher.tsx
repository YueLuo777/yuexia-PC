import { lazy, Suspense, useState } from 'react';

import { BUILT_IN_PROMPT_CATEGORY } from '@/features/prompts/hooks/usePrompts';
import { WorkbenchModal } from '@/features/workbench/components/WorkbenchModal';
import {
  PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS,
  WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS,
} from '@/features/workbench/components/workbenchManagementModalSize';

const LazyPromptsPage = lazy(() =>
  import('@/features/prompts/pages/PromptsPage').then((module) => ({ default: module.PromptsPage })),
);

export function BuiltInPromptManagerLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 shrink-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-[#63C6D9] hover:text-[#078FAB]"
      >
        提示词
      </button>
      {open ? (
        <WorkbenchModal
          title="内置提示词管理"
          isOpen
          onClose={() => setOpen(false)}
          widthClass={`${WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS} ${PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS}`}
          heightClass=""
          storageId="builtin_prompt_management"
        >
          <div className="min-h-0 flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                  正在加载提示词管理…
                </div>
              }
            >
              <LazyPromptsPage initialCategory={BUILT_IN_PROMPT_CATEGORY} />
            </Suspense>
          </div>
        </WorkbenchModal>
      ) : null}
    </>
  );
}
