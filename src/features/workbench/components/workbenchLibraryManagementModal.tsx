import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import {
  PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS,
  WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS,
} from './workbenchManagementModalSize';
import { WorkbenchModal } from './WorkbenchModal';

export type LibraryManagementModalState = { type: 'models' } | { type: 'prompts'; category: string } | null;

export function LibraryManagementModal({
  modal,
  onClose,
}: {
  modal: Exclude<LibraryManagementModalState, null>;
  onClose: () => void;
}) {
  return (
    <WorkbenchModal
      title={modal.type === 'prompts' ? '提示词管理' : '模型管理'}
      isOpen
      onClose={onClose}
      widthClass={`${WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS} ${modal.type === 'prompts' ? PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS : 'max-w-[80vw]'}`}
      heightClass=""
      storageId={`library_management_${modal.type}`}
      zIndexClass="z-[280]"
    >
        <div className="min-h-0 flex-1 overflow-hidden">
          {modal.type === 'models' ? (
            <ModelManagePage embedded onClose={onClose} />
          ) : (
            <PromptsPage initialCategory={modal.category} />
          )}
        </div>
    </WorkbenchModal>
  );
}
