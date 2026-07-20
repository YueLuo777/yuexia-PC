import { Lock, Pin, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { WordCountText } from '@/shared/ui/WordCountText';
import { BRAINSTORM_QUESTION_FIELDS, type BrainstormQuestionDraft } from './workbenchBrainstormState';
import { getBrainstormEntryBody } from './workbenchLibraryAiText';
import { BRAINSTORM_TYPE } from './workbenchLibraryTabs';
import { parseSettingContent } from './workbenchStructuredSettings';

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

export function BrainstormReaderModal({
  isOpen,
  entries,
  selectedId,
  onSelect,
  onClose,
  onConfirm,
}: BrainstormReaderModalProps) {
  if (!isOpen) return null;

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null;
  const selectedContent = selectedEntry ? parseSettingContent(selectedEntry.content) : null;
  const selectedText = getBrainstormEntryBody(selectedEntry);

  return createPortal(
    <div className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35" onClick={onClose}>
      <div
        className="modal-sharp flex h-[78vh] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">关联脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">每个脑洞都是可独立成书的候选项目；左侧切换预览，右侧确认关联。</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] bg-white">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-900">候选书单</h4>
              <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1 text-xs font-black text-[#08AACE]">
                {entries.length}
              </span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {entries.length === 0 && (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  暂无脑洞
                </div>
              )}
              {entries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const contentText = parsed.body || entry.content || '';
                const active = selectedId === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => onSelect(entry.id)}
                    className={`w-full rounded-xl border p-3 text-left transition hover:bg-white ${
                      active
                        ? 'border-[#08AACE] bg-white shadow-sm ring-1 ring-[#08AACE]/20'
                        : 'border-transparent bg-white/70 text-gray-600 hover:border-[#08AACE]/30'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-black text-gray-900">{entry.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-black text-slate-400">
                          <span className="rounded-md bg-[#EAF9FD] px-2 py-0.5 text-[#08AACE]">
                            {parsed.type || BRAINSTORM_TYPE}
                          </span>
                          <span>
                            <WordCountText value={countTextWords(contentText)} compact />
                          </span>
                        </div>
                      </div>
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${
                          active
                            ? 'border-[#08AACE] bg-[#08AACE] text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <div className="line-clamp-3 text-xs font-semibold leading-5 text-slate-500">
                      {contentText || '暂无内容'}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
          <main className="min-h-0 p-5">
            {selectedEntry ? (
              <article className="flex h-full min-h-0 flex-col rounded-2xl border border-[#08AACE]/30 bg-[#F8FDFF] p-5">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-black text-[#08AACE]">
                      <Pin className="h-4 w-4" />
                      {selectedContent?.type || BRAINSTORM_TYPE}
                      <span className="text-slate-300">·</span>
                      <WordCountText value={countTextWords(selectedText)} compact />
                      <span className="text-slate-300">·</span>
                      {selectedEntry.updatedAt}
                    </div>
                    <h4 className="mt-2 truncate text-2xl font-black text-gray-900">{selectedEntry.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="h-9 shrink-0 rounded-xl bg-[#08AACE] px-4 text-sm font-black text-white shadow-sm hover:bg-[#0798b8]"
                  >
                    关联此项
                  </button>
                </div>
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm font-semibold leading-7 text-slate-600">
                  {selectedText || '暂无内容'}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                请选择左侧脑洞后查看完整项目
              </div>
            )}
          </main>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            {selectedEntry
              ? `将关联：${selectedEntry.title} · ${countTextWords(selectedText)} 字`
              : '请选择一个脑洞项目后关联'}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedEntry}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              关联脑洞
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
