import { Pin } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { WordCountText } from '@/shared/ui/WordCountText';
import {
  ASSOCIATION_READER_GRID_CLASS,
  ASSOCIATION_READER_MODAL_HEIGHT_CLASS,
  ASSOCIATION_READER_MODAL_WIDTH_CLASS,
  AssociationReaderItemRow,
} from './AssociationReaderItemRow';
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
  onSelect: (id: string | null) => void;
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
  const [previewId, setPreviewId] = useState(selectedId ?? entries[0]?.id ?? '');
  useEffect(() => {
    if (!isOpen) return;
    setPreviewId((current) =>
      entries.some((entry) => entry.id === current) ? current : (selectedId ?? entries[0]?.id ?? ''),
    );
  }, [entries, isOpen, selectedId]);
  if (!isOpen) return null;
  const previewEntry = entries.find((entry) => entry.id === previewId) ?? null;
  const linkedEntry = entries.find((entry) => entry.id === selectedId) ?? null;
  const previewContent = previewEntry ? parseSettingContent(previewEntry.content) : null;
  const previewText = getBrainstormEntryBody(previewEntry);

  return (
    <WorkbenchModal
      title="关联脑洞"
      subtitle="每个脑洞都是可独立成书的候选项目；左侧切换预览，右侧确认关联。"
      isOpen={isOpen}
      onClose={onClose}
      widthClass={ASSOCIATION_READER_MODAL_WIDTH_CLASS}
      heightClass={ASSOCIATION_READER_MODAL_HEIGHT_CLASS}
      storageId="brainstorm_reader"
    >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
          <span className="flex h-9 items-center rounded-xl border border-[#9BEFFC] bg-[#EAF9FD] px-3 text-sm font-black text-[#08AACE]">
            脑洞
          </span>
          <span className="ml-auto text-xs font-black text-slate-400">单选 · 点击资料预览，点击右侧方框关联</span>
        </div>
        <div className={`${ASSOCIATION_READER_GRID_CLASS} bg-white`}>
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
                const contentText = parseSettingContent(entry.content).body || entry.content || '';
                const active = previewId === entry.id;
                return (
                  <AssociationReaderItemRow
                    key={entry.id}
                    title={entry.title}
                    selected={active}
                    checked={selectedId === entry.id}
                    meta={<WordCountText value={countTextWords(contentText)} compact />}
                    onPreview={() => setPreviewId(entry.id)}
                    onToggle={() => onSelect(selectedId === entry.id ? null : entry.id)}
                  />
                );
              })}
            </div>
          </aside>
          <main className="min-h-0 p-5">
            {previewEntry ? (
              <article className="flex h-full min-h-0 flex-col">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-black text-[#08AACE]">
                      <Pin className="h-4 w-4" />
                      {previewContent?.type || BRAINSTORM_TYPE}
                      <span className="text-slate-300">·</span>
                      <WordCountText value={countTextWords(previewText)} compact />
                      <span className="text-slate-300">·</span>
                      {previewEntry.updatedAt}
                    </div>
                    <h4 className="mt-2 truncate text-2xl font-black text-gray-900">{previewEntry.title}</h4>
                  </div>
                  <span className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${selectedId === previewEntry.id ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]' : 'border border-slate-200 bg-slate-50 text-slate-400'}`}>
                    {selectedId === previewEntry.id ? '已勾选' : '未勾选'}
                  </span>
                </div>
                <div className="editor-scrollbar min-h-[360px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-2xl border-2 border-slate-900 bg-white p-5 text-sm font-bold leading-8 text-slate-600">
                  {previewText || '暂无内容'}
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
            {linkedEntry
              ? `已选 1 项 · ${linkedEntry.title} · ${countTextWords(getBrainstormEntryBody(linkedEntry))} 字`
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
              disabled={!linkedEntry}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              关联脑洞
            </button>
          </div>
        </div>
    </WorkbenchModal>
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
