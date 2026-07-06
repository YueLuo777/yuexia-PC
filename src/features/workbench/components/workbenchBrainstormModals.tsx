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
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
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
              <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1 text-xs font-black text-[#08AACE]">{entries.length}</span>
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
                          <span className="rounded-md bg-[#EAF9FD] px-2 py-0.5 text-[#08AACE]">{parsed.type || BRAINSTORM_TYPE}</span>
                          <span><WordCountText value={countTextWords(contentText)} compact /></span>
                        </div>
                      </div>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${
                        active ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
                      }`}>
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
                    <h4 className="mt-2 truncate text-2xl font-black text-gray-900">
                      {selectedEntry.title}
                    </h4>
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
      {isOpen && createPortal(
        <div
          className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
          onClick={onClose}
        >
          <div
            className="modal-sharp flex h-[min(720px,86vh)] w-[min(760px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gray-900">脑洞回收站</h3>
                <p className="mt-1 text-xs font-medium text-gray-400">{entries.length} 个已删除脑洞，可以恢复或永久删除。</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onRequestClear}
                  disabled={entries.length === 0}
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                >
                  清空回收站
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  title="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
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
                      <article key={entry.id} className="flex min-h-[170px] flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-base font-bold text-gray-900">{entry.title}</h4>
                            <div className="mt-1 text-xs font-bold"><WordCountText value={entryWordCount} compact /></div>
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-400">
                            {parsed.type || BRAINSTORM_TYPE}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap text-xs leading-5 text-gray-500">{body || '暂无内容'}</p>
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
          </div>
        </div>,
        document.body,
      )}
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

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="modal-sharp flex h-[70vh] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">提示词管理</h3>
            <p className="mt-1 text-xs text-gray-400">仅显示“脑洞”分类下的提示词。</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          <div className="flex flex-wrap gap-4">
            {prompts.length === 0 && (
              <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                暂无提示词
              </div>
            )}
            {prompts.map((prompt) => (
              <article key={prompt.id} className="flex h-[247px] w-[255px] flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h4>
                      <span className="rounded-xl border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-500">脑洞</span>
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
                  <span>约 <WordCountText value={(prompt.description || '').length} /></span>
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
      </div>
    </div>,
    document.body,
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

export function BrainstormPromptEditModal({
  isOpen,
  isCreating,
  draft,
  onDraftChange,
  onClose,
  onSave,
}: BrainstormPromptEditModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="modal-sharp flex h-[min(820px,92vh)] w-[min(960px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isCreating ? '创建提示词' : '编辑提示词'}</h3>
            <p className="mt-1 text-xs text-gray-400">只会保存到“脑洞”分类下。</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className={`xy-floating-field xy-floating-compact ${draft.name.trim() ? 'xy-has-value' : ''}`}>
            <input
              value={draft.name}
              onChange={(event) => onDraftChange({ name: event.target.value })}
              placeholder="名称"
            />
            <label>名称</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact ${draft.description.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={draft.description}
              onChange={(event) => onDraftChange({ description: event.target.value })}
              className="editor-scrollbar h-24"
              placeholder="说明"
            />
            <label>说明</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact xy-floating-fill flex min-h-[260px] flex-1 flex-col ${draft.content.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={draft.content}
              onChange={(event) => onDraftChange({ content: event.target.value })}
              className="editor-scrollbar min-h-[260px] flex-1"
              placeholder="提示词内容"
            />
            <label>提示词内容</label>
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
            onClick={onSave}
            disabled={!draft.name.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body,
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

export function BrainstormGenerateConfirmModal({
  draft,
  isLoading,
  isScrolling,
  onScroll,
  onClose,
  onConfirm,
}: BrainstormGenerateConfirmModalProps) {
  if (!draft) return null;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="modal-sharp flex h-[min(680px,86vh)] w-[min(720px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">确认生成脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">确认后会把这些内容发送给当前模型，并在左侧输出区显示结果。</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
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
      </div>
    </div>,
    document.body,
  );
}
