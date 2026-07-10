import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { WorkbenchLinkedContextItem } from './WorkbenchAIPanel';
import { WordCountText } from '@/shared/ui/WordCountText';

export interface WorkbenchContextChapterPair {
  volumeId: number;
  volumeName: string;
  chapterId: number;
  serialNumber: number;
  title: string;
  isCurrent: boolean;
  chapterItem: WorkbenchLinkedContextItem;
  outlineItem: WorkbenchLinkedContextItem;
  summaryItem: WorkbenchLinkedContextItem | null;
}

function getContextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

function ContextSourceWordStatus({ label, value }: { label: string; value: number }) {
  if (value <= 0) return <span className="font-black text-red-500">无{label}</span>;
  return (
    <>
      <span className="shrink-0">{label}</span>
      <WordCountText value={value} compact />
    </>
  );
}

function ContextSourceRowWordStatus({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  if (value <= 0) return <span className="shrink-0 text-xs font-black text-red-500">无{label}</span>;
  return (
    <>
      <span className="shrink-0">{label}</span>
      <span
        className={[
          'w-[6ch] shrink-0 text-right text-xs font-black tabular-nums',
          muted ? 'text-slate-300' : 'text-brand',
        ].join(' ')}
      >
        {value}
      </span>
      <span className={['shrink-0 text-xs font-black', muted ? 'text-slate-300' : 'text-slate-500'].join(' ')}>字</span>
    </>
  );
}

function ContextSelectionDot({
  checked,
  disabled = false,
  locked = false,
}: {
  checked: boolean;
  disabled?: boolean;
  locked?: boolean;
}) {
  return (
    <span
      className={[
        'grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 bg-white',
        locked ? 'border-slate-300' : checked ? 'border-[#3B82F6]' : disabled ? 'border-slate-200' : 'border-slate-300',
      ].join(' ')}
    >
      {checked && <span className={['h-2 w-2 rounded-full', locked ? 'bg-slate-400' : 'bg-[#3B82F6]'].join(' ')} />}
    </span>
  );
}

type WorkbenchContextChapterSummaryListProps = {
  rows: WorkbenchContextChapterPair[];
  selectedIds: Set<string>;
  lockedIds: Set<string>;
  searchText: string;
  onSearchChange: (value: string) => void;
  onToggleChapter: (row: WorkbenchContextChapterPair) => void;
  onPickItem: (row: WorkbenchContextChapterPair, item: WorkbenchLinkedContextItem) => void;
  onSelectRecent: (count: number) => void;
  onClear: () => void;
};

export function WorkbenchContextChapterSummaryList({
  rows,
  selectedIds,
  lockedIds,
  searchText,
  onSearchChange,
  onToggleChapter,
  onPickItem,
  onSelectRecent,
  onClear,
}: WorkbenchContextChapterSummaryListProps) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter((row) =>
        `${row.serialNumber} ${row.title} ${row.volumeName} ${row.chapterItem.content} ${row.summaryItem?.content ?? ''}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : rows;
  const [collapsedVolumeIds, setCollapsedVolumeIds] = useState<Set<number>>(() => new Set());
  const volumeGroups = Array.from(
    filteredRows.reduce((groups, row) => {
      const current = groups.get(row.volumeId) ?? {
        volumeId: row.volumeId,
        volumeName: row.volumeName,
        rows: [] as WorkbenchContextChapterPair[],
      };
      current.rows.push(row);
      groups.set(row.volumeId, current);
      return groups;
    }, new Map<number, { volumeId: number; volumeName: string; rows: WorkbenchContextChapterPair[] }>()),
  ).map(([, group]) => group);

  const toggleVolumeCollapsed = (volumeId: number) => {
    setCollapsedVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 gap-2">
        <input
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="搜索章节标题..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#08AACE]"
        />
        <button
          type="button"
          onClick={onClear}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          清空
        </button>
      </div>
      <div className="mt-4 flex shrink-0 flex-wrap gap-2">
        {[3, 5, 10].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onSelectRecent(count)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]"
          >
            最近 {count} 章
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelectRecent(10)}
          className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]"
        >
          增选 10 章
        </button>
      </div>
      <div className="editor-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
        {filteredRows.length === 0 ? (
          <div className="flex h-full min-h-[260px] items-center justify-center text-sm font-bold text-slate-300">
            没有匹配到章节
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {volumeGroups.map((group) => {
              const collapsed = collapsedVolumeIds.has(group.volumeId);
              const selectedCount = group.rows.filter(
                (row) =>
                  selectedIds.has(row.chapterItem.id) ||
                  selectedIds.has(row.outlineItem.id) ||
                  Boolean(row.summaryItem && selectedIds.has(row.summaryItem.id)),
              ).length;
              const totalChapterWords = group.rows.reduce(
                (sum, row) => sum + getContextWordCount(row.chapterItem.content),
                0,
              );
              const totalOutlineWords = group.rows.reduce(
                (sum, row) => sum + getContextWordCount(row.outlineItem.content),
                0,
              );
              const totalSummaryWords = group.rows.reduce(
                (sum, row) => sum + (row.summaryItem ? getContextWordCount(row.summaryItem.content) : 0),
                0,
              );
              return (
                <section key={group.volumeId} className="bg-white">
                  <button
                    type="button"
                    onClick={() => toggleVolumeCollapsed(group.volumeId)}
                    className="flex h-11 w-full items-center justify-between gap-3 bg-[#E6F7FB] px-4 pr-10 text-left transition-colors hover:bg-[#d7f1f8]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {collapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-900" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-900" />
                      )}
                      <span className="truncate text-sm font-black text-slate-800">{group.volumeName}</span>
                      {selectedCount > 0 && (
                        <span className="rounded-full bg-[#EAF9FD] px-2 py-0.5 text-[11px] font-black text-[#078fb0]">
                          已选 {selectedCount}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-900">
                      <span>{group.rows.length} 章</span>
                      <span>·</span>
                      <ContextSourceWordStatus label="正文" value={totalChapterWords} />
                      <span>·</span>
                      <ContextSourceWordStatus label="梗概" value={totalSummaryWords} />
                      <span>·</span>
                      <ContextSourceWordStatus label="章纲" value={totalOutlineWords} />
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="divide-y divide-slate-50">
                      {group.rows.map((row) => {
                        const selectedChapter = selectedIds.has(row.chapterItem.id);
                        const selectedOutline = selectedIds.has(row.outlineItem.id);
                        const selectedSummary = row.summaryItem ? selectedIds.has(row.summaryItem.id) : false;
                        const checked = selectedChapter || selectedOutline || selectedSummary;
                        const chapterWordCount = getContextWordCount(row.chapterItem.content);
                        const outlineWordCount = getContextWordCount(row.outlineItem.content);
                        const summaryWordCount = row.summaryItem ? getContextWordCount(row.summaryItem.content) : 0;
                        const rowSelectable = !row.isCurrent;
                        const canPickChapter = rowSelectable && chapterWordCount > 0;
                        const canPickSummary = Boolean(row.summaryItem) && !row.isCurrent && summaryWordCount > 0;
                        const outlineLocked = lockedIds.has(row.outlineItem.id);
                        return (
                          <div
                            key={row.chapterId}
                            role="button"
                            tabIndex={0}
                            onClick={() => onToggleChapter(row)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onToggleChapter(row);
                              }
                            }}
                            className={[
                              'grid cursor-pointer grid-cols-[36px_minmax(0,1fr)_96px_auto] items-center gap-3 py-3 pl-4 pr-10 text-sm transition-colors hover:bg-sky-50/60',
                              checked ? 'bg-sky-50/45' : 'bg-white',
                            ].join(' ')}
                          >
                            <button
                              type="button"
                              disabled={!rowSelectable}
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleChapter(row);
                              }}
                              className="grid h-5 w-5 place-items-center disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={checked ? '取消关联章节资料' : '关联章节资料'}
                            >
                              <ContextSelectionDot checked={checked} disabled={!rowSelectable} />
                            </button>
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2 text-base font-black text-slate-900">
                                第{row.serialNumber}章 {row.title || '未命名章节'}
                                {row.isCurrent && (
                                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
                                    当前
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="truncate text-center text-xs font-bold text-slate-400">
                              {row.volumeName}
                            </div>
                            <div
                              className="flex items-center justify-end whitespace-nowrap text-sm font-bold"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <label
                                className={[
                                  'inline-flex h-8 shrink-0 items-center gap-1.5',
                                  canPickChapter
                                    ? 'cursor-pointer text-slate-700'
                                    : 'cursor-not-allowed text-slate-300',
                                ].join(' ')}
                              >
                                <input
                                  type="radio"
                                  disabled={!canPickChapter}
                                  checked={selectedChapter}
                                  onChange={() => onPickItem(row, row.chapterItem)}
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedChapter} disabled={!canPickChapter} />
                                <ContextSourceRowWordStatus
                                  label="正文"
                                  value={chapterWordCount}
                                  muted={!canPickChapter}
                                />
                              </label>
                              <label
                                className={[
                                  'ml-3 inline-flex h-8 shrink-0 items-center gap-1.5 border-l border-slate-200 pl-3',
                                  canPickSummary
                                    ? 'cursor-pointer text-slate-700'
                                    : 'cursor-not-allowed text-slate-300',
                                ].join(' ')}
                              >
                                <input
                                  type="radio"
                                  disabled={!canPickSummary}
                                  checked={selectedSummary}
                                  onChange={() => row.summaryItem && onPickItem(row, row.summaryItem)}
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedSummary} disabled={!canPickSummary} />
                                <ContextSourceRowWordStatus
                                  label="梗概"
                                  value={summaryWordCount}
                                  muted={!canPickSummary}
                                />
                              </label>
                              <label className="ml-3 inline-flex h-8 shrink-0 cursor-not-allowed items-center gap-1.5 border-l border-slate-200 pl-3 text-slate-300">
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={selectedOutline}
                                  readOnly
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedOutline} disabled locked={outlineLocked} />
                                <ContextSourceRowWordStatus
                                  label={`第${row.serialNumber}章章纲`}
                                  value={outlineWordCount}
                                  muted={!outlineLocked}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
