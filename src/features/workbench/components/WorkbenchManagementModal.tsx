import { lazy, Suspense } from 'react';

import {
  PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS,
  WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS,
} from './workbenchManagementModalSize';
import { WorkbenchModal } from './WorkbenchModal';

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
  const title = type === 'models' ? '模型管理' : '提示词管理';

  return (
    <WorkbenchModal
      title={title}
      isOpen
      onClose={onClose}
      widthClass={`${WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS} ${type === 'agents' ? PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS : ''}`}
      heightClass=""
      storageId={`workbench_management_${type}`}
    >
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
    </WorkbenchModal>
  );
}
