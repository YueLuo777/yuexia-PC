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

type BrainstormRecycleModalProps = {
  isOpen: boolean;
  entries: WorkbenchLibraryEntry[];
  isClearConfirmOpen: boolean;
  onClose: () => void;
  onRequestClear: () => void;
  onCancelClear: () => void;
  onConfirmClear: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
};

export function BrainstormRecycleModal({
  isOpen,
  entries,
  isClearConfirmOpen,
  onClose,
  onRequestClear,
  onCancelClear,
  onConfirmClear,
  onRestore,
  onPermanentDelete,
}: BrainstormRecycleModalProps) {
  return (
    <>
      <WorkbenchModal
        title="脑洞回收站"
        subtitle={`${entries.length} 个已删除脑洞，可以恢复或永久删除。`}
        isOpen={isOpen}
        onClose={onClose}
        widthClass="w-[760px]"
        heightClass="h-[min(720px,86vh)]"
        storageId="brainstorm_recycle"
        headerExtra={
          <button
            type="button"
            onClick={onRequestClear}
            disabled={entries.length === 0}
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
          >
            清空回收站
          </button>
        }
      >
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
                {entries.length === 0 ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm font-bold text-gray-400">
                    暂无删除的脑洞
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {entries.map((entry) => {
                      const parsed = parseSettingContent(entry.content);
                      const body = parsed.body || entry.content;
                      const entryWordCount = countTextWords(body);
                      return (
                        <article
                          key={entry.id}
                          className="flex min-h-[170px] flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate text-base font-bold text-gray-900">{entry.title}</h4>
                              <div className="mt-1 text-xs font-bold">
                                <WordCountText value={entryWordCount} compact />
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-400">
                              {parsed.type || BRAINSTORM_TYPE}
                            </span>
                          </div>
                          <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap text-xs leading-5 text-gray-500">
                            {body || '暂无内容'}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => onRestore(entry.id)}
                              className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                            >
                              恢复
                            </button>
                            <button
                              type="button"
                              onClick={() => onPermanentDelete(entry.id)}
                              className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                            >
                              永久删除
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
      </WorkbenchModal>
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="清空脑洞回收站"
        description={`确定要清空 ${entries.length} 个已删除脑洞吗？\n清空后无法恢复。`}
        confirmText="清空回收站"
        cancelText="再看看"
        confirmVariant="danger"
        onClose={onCancelClear}
        onConfirm={onConfirmClear}
      />
    </>
  );
}

type BrainstormPromptManagerModalProps = {
  isOpen: boolean;
  prompts: PromptItem[];
  onClose: () => void;
  onCreate: () => void;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (prompt: PromptItem) => void;
  onTogglePin: (id: string) => void;
};
