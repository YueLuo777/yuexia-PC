import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';

import { PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS } from './workbenchManagementModalSize';
import { WorkbenchModal } from './WorkbenchModal';

export type ChapterReviewManagementMode = 'models' | 'prompts' | null;

interface ChapterReviewManagementModalProps {
  mode: ChapterReviewManagementMode;
  reviewManagementModalSizeClass: string;
  modeTitle: string;
  promptCategory: string;
  onClose: () => void;
}

export function ChapterReviewManagementModal({
  mode,
  reviewManagementModalSizeClass,
  modeTitle,
  promptCategory,
  onClose,
}: ChapterReviewManagementModalProps) {
  if (!mode) return null;
  return (
    <WorkbenchModal
      title={mode === 'prompts' ? `${modeTitle}提示词管理` : '模型管理'}
      isOpen={mode !== null}
      onClose={onClose}
      widthClass={`${reviewManagementModalSizeClass} ${mode === 'prompts' ? PROMPT_MANAGEMENT_MODAL_WIDTH_CLASS : ''}`}
      heightClass=""
      storageId={`chapter_review_management_${mode}`}
      zIndexClass="z-[320]"
    >
        <div className="min-h-0 flex-1 overflow-hidden">
          {mode === 'models' ? (
            <ModelManagePage embedded onClose={() => onClose()} />
          ) : (
            <PromptsPage initialCategory={promptCategory} />
          )}
        </div>
    </WorkbenchModal>
  );
}
