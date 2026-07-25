import type { WorkbenchContextColumn } from './WorkbenchContextSelectionColumn';
import { WorkbenchContextSelectionColumn } from './WorkbenchContextSelectionColumn';
import type { WorkbenchContextChapterPair } from './WorkbenchContextChapterSummaryList';
import { WorkbenchContextChapterSummaryList } from './WorkbenchContextChapterSummaryList';
import type { WorkbenchLinkedContextItem } from './WorkbenchAIPanel';
import type { ContextLibraryTab } from './workbenchPageSupport';
import { WordCountText } from '@/shared/ui/WordCountText';
import { WorkbenchModal } from './WorkbenchModal';

function ContextMetric({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <span>{label}</span>
      {value <= 0 ? (
        <span className="font-black text-red-500">无</span>
      ) : (
        <WordCountText value={value} compact />
      )}
    </span>
  );
}
export function WorkbenchContextLibraryModal({
  open,
  tab,
  rows,
  columns,
  selectedIds,
  lockedIds,
  searchText,
  chapterWords,
  summaryWords,
  outlineWords,
  totalWords,
  canConfirm,
  confirmTitle,
  onClose,
  onTabChange,
  onSearchChange,
  onToggleChapter,
  onPickItem,
  onSelectRecent,
  onClear,
  onToggle,
  onConfirm,
}: {
  open: boolean;
  tab: ContextLibraryTab;
  rows: WorkbenchContextChapterPair[];
  columns: WorkbenchContextColumn[];
  selectedIds: Set<string>;
  lockedIds: Set<string>;
  searchText: string;
  chapterWords: number;
  summaryWords: number;
  outlineWords: number;
  totalWords: number;
  canConfirm: boolean;
  confirmTitle: string;
  onClose: () => void;
  onTabChange: (tab: ContextLibraryTab) => void;
  onSearchChange: (value: string) => void;
  onToggleChapter: (row: WorkbenchContextChapterPair) => void;
  onPickItem: (row: WorkbenchContextChapterPair, item: WorkbenchLinkedContextItem) => void;
  onSelectRecent: (count: number) => void;
  onClear: () => void;
  onToggle: (id: string) => void;
  onConfirm: () => void;
}) {
  const tabs: [ContextLibraryTab, string][] = [
    ['outlineChapter', '正文/梗概/章纲'],
    ['setting', '大纲设定'],
    ['role', '人物设定'],
    ['status', '状态'],
  ];
  return (
    <WorkbenchModal
      title="关联资料"
      isOpen={open}
      onClose={onClose}
      storageId="workbench_context_library_centered_v2"
      widthClass="w-[min(1296px,94vw)]"
      heightClass="h-[min(820px,88vh)] min-h-[520px]"
      headerExtra={
        <div
          data-no-modal-drag
          className="inline-flex shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-sm font-black"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`h-10 rounded-xl px-5 ${tab === id ? 'bg-[#08AACE] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col bg-white p-5">
        {tab === 'outlineChapter' ? (
          <WorkbenchContextChapterSummaryList
            rows={rows}
            selectedIds={selectedIds}
            lockedIds={lockedIds}
            searchText={searchText}
            onSearchChange={onSearchChange}
            onToggleChapter={onToggleChapter}
            onPickItem={onPickItem}
            onSelectRecent={onSelectRecent}
            onClear={onClear}
          />
        ) : (
          <main className="grid min-h-0 flex-1 grid-cols-1 gap-3">
            {columns.map((column) => (
              <WorkbenchContextSelectionColumn
                key={`${tab}:${column.source}`}
                column={column}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            ))}
          </main>
        )}
        <div
          data-testid="context-library-footer"
          className="mt-3 flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white py-3"
        >
          <div
            data-testid="context-library-summary"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-gray-500"
          >
            <ContextMetric label="正文" value={chapterWords} />
            <span aria-hidden className="h-4 w-px shrink-0 bg-slate-200" />
            <ContextMetric label="梗概" value={summaryWords} />
            <span aria-hidden className="h-4 w-px shrink-0 bg-slate-200" />
            <ContextMetric label="章纲" value={outlineWords} />
            <span aria-hidden className="h-4 w-px shrink-0 bg-slate-200" />
            <span className="inline-flex shrink-0 items-center gap-1 font-black text-slate-700">
              合计
              <WordCountText value={totalWords} compact />
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onClear}
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-500"
            >
              清空
            </button>
            <button
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600"
            >
              取消
            </button>
            <button
              disabled={!canConfirm}
              onClick={onConfirm}
              className={`h-10 rounded-xl px-6 text-sm font-black text-white ${canConfirm ? 'bg-[#08AACE]' : 'cursor-not-allowed bg-slate-300'}`}
              title={confirmTitle}
            >
              确认关联
            </button>
          </div>
        </div>
      </div>
    </WorkbenchModal>
  );
}
