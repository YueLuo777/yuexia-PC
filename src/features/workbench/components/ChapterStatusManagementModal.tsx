import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { STATUS_PROMPT_CATEGORY } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';

import { REVIEW_MANAGEMENT_MODAL_SIZE_CLASS } from './chapterEditorLayout';
import type { ChapterReviewManagementMode } from './ChapterReviewManagementModal';
import { PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS } from './workbenchManagementModalSize';
import { WorkbenchModal } from './WorkbenchModal';

interface ChapterStatusManagementModalProps {
  mode: ChapterReviewManagementMode;
  onClose: () => void;
}

export function ChapterStatusManagementModal({ mode, onClose }: ChapterStatusManagementModalProps) {
  if (!mode) return null;

  return (
    <WorkbenchModal
      title={mode === 'prompts' ? `${STATUS_PROMPT_CATEGORY}提示词管理` : '模型管理'}
      isOpen={mode !== null}
      onClose={onClose}
      widthClass={`${REVIEW_MANAGEMENT_MODAL_SIZE_CLASS} ${mode === 'prompts' ? PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS : ''}`}
      heightClass=""
      storageId={`chapter_status_management_${mode}`}
      zIndexClass="z-[320]"
    >
        <div className="min-h-0 flex-1 overflow-hidden">
          {mode === 'models' ? (
            <ModelManagePage embedded onClose={onClose} />
          ) : (
            <PromptsPage initialCategory={STATUS_PROMPT_CATEGORY} />
          )}
        </div>
    </WorkbenchModal>
  );
}
