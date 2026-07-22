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

type BrainstormPromptManagerModalProps = {
  isOpen: boolean;
  prompts: PromptItem[];
  onClose: () => void;
  onCreate: () => void;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (prompt: PromptItem) => void;
  onTogglePin: (id: string) => void;
};

export function BrainstormPromptManagerModal({
  isOpen,
  prompts,
  onClose,
  onCreate,
  onEdit,
  onDelete,
  onTogglePin,
}: BrainstormPromptManagerModalProps) {
  if (!isOpen) return null;

  return (
    <WorkbenchModal
      title="提示词管理"
      subtitle="仅显示“脑洞”分类下的提示词。"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[880px]"
      heightClass="h-[70vh]"
      storageId="brainstorm_prompt_manager"
    >
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          <div className="flex flex-wrap gap-4">
            {prompts.length === 0 && (
              <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                暂无提示词
              </div>
            )}
            {prompts.map((prompt) => (
              <article
                key={prompt.id}
                className="flex h-[247px] w-[255px] flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h4>
                      <span className="rounded-xl border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-500">
                        脑洞
                      </span>
                    </div>
                  </div>
                  <Lock className={`h-4 w-4 shrink-0 ${prompt.isLocked ? 'text-orange-400' : 'text-slate-300'}`} />
                </div>
                <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-50 p-3">
                  <div className="editor-scrollbar h-full overflow-y-auto whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-800">
                    {prompt.description || '暂无说明'}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    约 <WordCountText value={(prompt.description || '').length} />
                  </span>
                  <span>{prompt.updatedAt}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onTogglePin(prompt.id)}
                    className={`rounded-[14px] px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                      prompt.isFavorite ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand hover:bg-brand-dark'
                    }`}
                  >
                    {prompt.isFavorite ? '已置顶' : '置顶'}
                  </button>
                  <button
                    onClick={() => onEdit(prompt)}
                    disabled={prompt.isLocked}
                    className="rounded-[14px] bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(prompt)}
                    disabled={prompt.isLocked}
                    className="rounded-[14px] bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
            <button
              onClick={onCreate}
              className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-300 bg-white text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50/40"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-300 bg-sky-50/60 text-4xl leading-none">
                +
              </span>
              <span className="mt-6 text-base font-medium">创建提示词</span>
            </button>
          </div>
        </div>
    </WorkbenchModal>
  );
}

type BrainstormPromptDraft = {
  name: string;
  description: string;
  content: string;
};

type BrainstormPromptEditModalProps = {
  isOpen: boolean;
  isCreating: boolean;
  draft: BrainstormPromptDraft;
  onDraftChange: (patch: Partial<BrainstormPromptDraft>) => void;
  onClose: () => void;
  onSave: () => void;
};
