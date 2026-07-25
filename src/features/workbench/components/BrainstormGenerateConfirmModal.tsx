import { Lock, Pin } from 'lucide-react';

import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { WordCountText } from '@/shared/ui/WordCountText';
import { BRAINSTORM_QUESTION_FIELDS, type BrainstormQuestionDraft } from './workbenchBrainstormState';
import { getBrainstormEntryBody } from './workbenchLibraryAiText';
import { BRAINSTORM_TYPE } from './workbenchLibraryTabs';
import { parseSettingContent } from './workbenchStructuredSettings';
import { WorkbenchModal } from './WorkbenchModal';

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

type BrainstormReaderModalProps = {
  isOpen: boolean;
  entries: WorkbenchLibraryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

type BrainstormGenerateConfirmModalProps = {
  draft: BrainstormQuestionDraft | null;
  isLoading: boolean;
  isScrolling: boolean;
  onScroll: () => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function BrainstormGenerateConfirmModal({
  draft,
  isLoading,
  isScrolling,
  onScroll,
  onClose,
  onConfirm,
}: BrainstormGenerateConfirmModalProps) {
  if (!draft) return null;

  return (
    <WorkbenchModal
      title="确认生成脑洞"
      subtitle="确认后会把这些内容发送给当前模型，并在左侧输出区显示结果。"
      isOpen={draft !== null}
      onClose={onClose}
      widthClass="w-[720px]"
      heightClass="h-[min(680px,86vh)]"
      storageId="brainstorm_generate_confirm"
      zIndexClass="z-[280]"
    >
        <div
          onScroll={onScroll}
          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5 ${
            isScrolling ? 'scrollbar-active' : ''
          }`}
        >
          <div className="space-y-3">
            {BRAINSTORM_QUESTION_FIELDS.filter((field) => draft[field.key].trim()).map((field) => (
              <section key={field.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-900">{field.label}</div>
                <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                  {draft[field.key].trim()}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认生成
          </button>
        </div>
    </WorkbenchModal>
  );
}
