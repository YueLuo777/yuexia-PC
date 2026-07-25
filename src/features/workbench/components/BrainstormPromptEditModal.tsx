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

type BrainstormPromptDraft = { name: string; description: string; content: string };
type BrainstormPromptEditModalProps = {
  isOpen: boolean;
  isCreating: boolean;
  draft: BrainstormPromptDraft;
  onDraftChange: (patch: Partial<BrainstormPromptDraft>) => void;
  onClose: () => void;
  onSave: () => void;
};

export function BrainstormPromptEditModal({
  isOpen,
  isCreating,
  draft,
  onDraftChange,
  onClose,
  onSave,
}: BrainstormPromptEditModalProps) {
  if (!isOpen) return null;

  return (
    <WorkbenchModal
      title={isCreating ? '创建提示词' : '编辑提示词'}
      subtitle="只会保存到“脑洞”分类下。"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[960px]"
      heightClass="h-[min(620px,78vh)]"
      titleClassName="text-lg"
      storageId="brainstorm_prompt_editor_centered_v3"
      zIndexClass="z-[290]"
      defaultGeometry={{ x: 0, y: 0, width: 960, height: 620 }}
    >
        <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <label className="flex items-center gap-3 text-base font-bold text-slate-700">
            <span className="w-14 shrink-0">名称</span>
            <input
              value={draft.name}
              onChange={(event) => onDraftChange({ name: event.target.value })}
              placeholder="名称"
              className="h-10 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
            />
          </label>
          <label className="flex items-start gap-3 text-base font-bold text-slate-700">
            <span className="w-14 shrink-0 pt-2">说明</span>
            <textarea
              value={draft.description}
              onChange={(event) => onDraftChange({ description: event.target.value })}
              className="editor-scrollbar h-16 min-w-0 flex-1 resize-none rounded-[10px] border border-slate-200 bg-white p-3 text-base font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
              placeholder="说明"
            />
          </label>
          <div className="xy-prompt-meta-field xy-prompt-content-field relative flex min-h-[160px] flex-1 flex-col bg-white">
            <span aria-hidden="true" className="xy-border-embedded-transparent-backplate xy-workbench-name-field-caption">
              提示词内容
            </span>
            <textarea
              aria-label="提示词内容"
              value={draft.content}
              onChange={(event) => onDraftChange({ content: event.target.value })}
              className="editor-scrollbar min-h-[160px] w-full flex-1 resize-none border-0 bg-transparent px-6 pb-4 pt-6 text-base font-medium leading-7 text-slate-900 outline-none"
            />
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-base font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={!draft.name.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-base font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            保存
          </button>
        </div>
    </WorkbenchModal>
  );
}

type BrainstormGenerateConfirmModalProps = {
  draft: BrainstormQuestionDraft | null;
  isLoading: boolean;
  isScrolling: boolean;
  onScroll: () => void;
  onClose: () => void;
  onConfirm: () => void;
};
