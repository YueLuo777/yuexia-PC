import { useEffect, useMemo, useState } from 'react';

import {
  buildReviewTextDiff,
  extractReviewModificationNotes,
  type ReviewTextDiffSegment,
} from '@/features/workbench/model/chapterReviewText';

type ContextRange = 1 | 2 | 'all';
type ReviewDecision = 'pending' | 'accepted' | 'rejected' | 'edited';

interface ReviewParagraphItem {
  index: number;
  original: string;
  revised: string;
  changed: boolean;
  category: string;
  note: string;
  originalDiff: ReviewTextDiffSegment[];
  revisedDiff: ReviewTextDiffSegment[];
}

type DisplayGroup =
  | { kind: 'changed'; items: [ReviewParagraphItem] }
  | { kind: 'unchanged'; items: ReviewParagraphItem[] };

interface ChapterTextAuditContinuousReviewProps {
  chapterKey: number | string;
  originalParagraphs: string[];
  revisedParagraphs: string[];
  reviewAiOutput: string;
  fontSize: number;
  onApply: (content: string) => void;
}

function groupReviewParagraphs(items: ReviewParagraphItem[]) {
  return items.reduce<DisplayGroup[]>((groups, item) => {
    if (item.changed) {
      groups.push({ kind: 'changed', items: [item] });
      return groups;
    }
    const previous = groups[groups.length - 1];
    if (previous?.kind === 'unchanged') previous.items.push(item);
    else groups.push({ kind: 'unchanged', items: [item] });
    return groups;
  }, []);
}

function DiffText({ segments, original }: { segments: ReviewTextDiffSegment[]; original?: boolean }) {
  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.text}`}
          className={
            segment.changed
              ? original
                ? 'rounded bg-red-50 px-0.5 text-red-400 line-through decoration-1'
                : 'font-black text-red-500'
              : undefined
          }
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

function ParagraphMeta({ index, category }: { index: number; category: string }) {
  return (
    <span className="float-left mr-3 inline-flex w-[76px] flex-col items-center text-center text-xs font-black leading-none">
      <span className="inline-flex h-7 items-center justify-center text-slate-500">第 {index + 1} 段</span>
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-slate-500">{category}</span>
    </span>
  );
}

export function ChapterTextAuditContinuousReview({
  chapterKey,
  originalParagraphs,
  revisedParagraphs,
  reviewAiOutput,
  fontSize,
  onApply,
}: ChapterTextAuditContinuousReviewProps) {
  const items = useMemo(() => {
    const notes = new Map(extractReviewModificationNotes(reviewAiOutput).map((item) => [item.paragraphIndex, item]));
    return originalParagraphs.map((original, index): ReviewParagraphItem => {
      const revised = revisedParagraphs[index] ?? '';
      const diff = buildReviewTextDiff(original, revised);
      const reason = notes.get(index);
      return {
        index,
        original,
        revised,
        changed: diff.hasChanges,
        category: reason?.category ?? '表达优化',
        note: reason?.note ?? 'AI修改了本段表达，请结合上下文确认。',
        originalDiff: diff.original,
        revisedDiff: diff.revised,
      };
    });
  }, [originalParagraphs, revisedParagraphs, reviewAiOutput]);
  const changedIndexes = useMemo(() => items.filter((item) => item.changed).map((item) => item.index), [items]);
  const [activeChangePosition, setActiveChangePosition] = useState(0);
  const [contextRange, setContextRange] = useState<ContextRange>(1);
  const [decisions, setDecisions] = useState<Record<number, ReviewDecision>>({});
  const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveChangePosition(Math.floor(changedIndexes.length / 2));
    setContextRange(1);
    setDecisions({});
    setEditedTexts({});
    setEditingIndex(null);
  }, [chapterKey, originalParagraphs, revisedParagraphs, changedIndexes.length]);

  const activeParagraphIndex = changedIndexes[activeChangePosition] ?? 0;
  const visibleItems = items.filter(
    (item) => contextRange === 'all' || Math.abs(item.index - activeParagraphIndex) <= contextRange,
  );
  const displayGroups = groupReviewParagraphs(visibleItems);
  const acceptedCount = changedIndexes.filter((index) =>
    ['accepted', 'edited'].includes(decisions[index] ?? ''),
  ).length;
  const moveChange = (direction: -1 | 1) => {
    setActiveChangePosition((current) => Math.max(0, Math.min(changedIndexes.length - 1, current + direction)));
    setEditingIndex(null);
  };
  const decide = (index: number, decision: Exclude<ReviewDecision, 'edited'>) => {
    setDecisions((current) => ({ ...current, [index]: decision }));
    setEditingIndex(null);
  };
  const reopen = (index: number) => {
    setDecisions((current) => ({ ...current, [index]: 'pending' }));
    setEditingIndex(null);
    const nextPosition = changedIndexes.indexOf(index);
    if (nextPosition >= 0) setActiveChangePosition(nextPosition);
  };
  const confirmEdited = (index: number, fallback: string) => {
    setEditedTexts((current) => ({ ...current, [index]: current[index] ?? fallback }));
    setDecisions((current) => ({ ...current, [index]: 'edited' }));
    setEditingIndex(null);
  };
  const applyAcceptedChanges = () => {
    const finalText = items
      .map((item) => {
        const decision = decisions[item.index] ?? 'pending';
        if (decision === 'accepted') return item.revised;
        if (decision === 'edited') return editedTexts[item.index] ?? item.revised;
        return item.original;
      })
      .join('\n');
    onApply(finalText);
  };

  if (changedIndexes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-300">
        AI审核后正文与原文一致，没有需要逐段确认的修改。
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white" data-testid="formal-text-audit-continuous-review">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeChangePosition === 0}
            onClick={() => moveChange(-1)}
            className="h-7 rounded-md border border-slate-200 px-3 text-xs font-black text-slate-500 disabled:opacity-40"
          >
            上一处
          </button>
          <span className="min-w-10 text-center text-xs font-black text-slate-400">
            {activeChangePosition + 1} / {changedIndexes.length}
          </span>
          <button
            type="button"
            disabled={activeChangePosition >= changedIndexes.length - 1}
            onClick={() => moveChange(1)}
            className="h-7 rounded-md border border-slate-200 px-3 text-xs font-black text-slate-500 disabled:opacity-40"
          >
            下一处
          </button>
        </div>
        <div className="flex h-7 items-center rounded-md border border-slate-200 bg-white p-0.5">
          {(
            [
              [1, '前后1段'],
              [2, '前后2段'],
              ['all', '完整章节'],
            ] as const
          ).map(([range, label]) => (
            <button
              key={String(range)}
              type="button"
              onClick={() => setContextRange(range)}
              className={`h-6 rounded px-2.5 text-[11px] font-black ${contextRange === range ? 'bg-[#EAF9FD] text-[#078fb0]' : 'text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-slate-50 px-3 py-2">
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-black shadow-sm">
          <div className="border-r border-slate-100 px-4 py-2 text-slate-500">原文</div>
          <div className="px-4 py-2 text-[#078fb0]">审核后</div>
        </div>
      </div>
      <div className="scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-slate-50/40">
        {displayGroups.map((group) => {
          if (group.kind === 'unchanged') {
            return (
              <div
                key={`unchanged-${group.items[0].index}-${group.items[group.items.length - 1].index}`}
                className="grid grid-cols-2 border-b border-slate-100 bg-white"
              >
                <div className="space-y-3 border-r border-slate-100 px-4 py-3 text-slate-600">
                  {group.items.map((item) => (
                    <p
                      key={item.index}
                      className="whitespace-pre-wrap break-words font-bold leading-7"
                      style={{ fontSize }}
                    >
                      {item.original}
                    </p>
                  ))}
                </div>
                <div className="space-y-3 px-4 py-3 text-slate-600">
                  {group.items.map((item) => (
                    <p
                      key={item.index}
                      className="whitespace-pre-wrap break-words font-bold leading-7"
                      style={{ fontSize }}
                    >
                      {item.revised}
                    </p>
                  ))}
                </div>
              </div>
            );
          }

          const item = group.items[0];
          const decision = decisions[item.index] ?? 'pending';
          if (decision !== 'pending') {
            const resolvedText =
              decision === 'rejected'
                ? item.original
                : decision === 'edited'
                  ? (editedTexts[item.index] ?? item.revised)
                  : item.revised;
            const resolvedLabel =
              decision === 'rejected' ? '已保留原文' : decision === 'edited' ? '已修改采用' : '已接受';
            return (
              <div
                key={item.index}
                data-resolution-state={decision}
                className="mx-3 my-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 text-slate-700">
                  <p className="min-w-0 whitespace-pre-wrap break-words font-bold leading-7" style={{ fontSize }}>
                    <ParagraphMeta index={item.index} category={item.category} />
                    {resolvedText}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-black text-slate-500">
                      {resolvedLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => reopen(item.index)}
                      className="h-8 rounded-lg border border-cyan-200 bg-white px-3 text-xs font-black text-[#078fb0]"
                    >
                      重新修改
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const editing = editingIndex === item.index;
          return (
            <div
              key={item.index}
              className={`mx-3 my-3 overflow-hidden rounded-xl border bg-white shadow-sm ${item.index === activeParagraphIndex ? 'border-cyan-300' : 'border-slate-200'}`}
              onClick={() => setActiveChangePosition(changedIndexes.indexOf(item.index))}
            >
              <div className="grid grid-cols-2 bg-white">
                <div className="border-r border-slate-100 px-4 py-2 text-slate-700">
                  <p className="whitespace-pre-wrap break-words font-bold leading-7" style={{ fontSize }}>
                    <ParagraphMeta index={item.index} category={item.category} />
                    <DiffText segments={item.originalDiff} original />
                  </p>
                </div>
                <div className="px-4 py-2 text-slate-700">
                  {editing ? (
                    <textarea
                      autoFocus
                      value={editedTexts[item.index] ?? item.revised}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        setEditedTexts((current) => ({ ...current, [item.index]: event.target.value }))
                      }
                      className="min-h-20 w-full resize-y rounded-lg border border-violet-200 p-2 font-bold leading-7 outline-none"
                      style={{ fontSize }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap break-words font-bold leading-7" style={{ fontSize }}>
                      <DiffText segments={item.revisedDiff} />
                    </p>
                  )}
                </div>
              </div>
              <div className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-amber-100 bg-amber-50/70 px-3 py-1">
                <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold leading-3.5 text-slate-700">
                  <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
                    修改原因
                  </span>
                  <span className="min-w-0">{item.note}</span>
                </p>
                {editing ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingIndex(null);
                      }}
                      className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-500"
                    >
                      取消修改
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        confirmEdited(item.index, item.revised);
                      }}
                      className="h-7 rounded-md bg-violet-600 px-2 text-[11px] font-black text-white"
                    >
                      确认采用
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        decide(item.index, 'rejected');
                      }}
                      className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-500"
                    >
                      保留原文
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditedTexts((current) => ({
                          ...current,
                          [item.index]: current[item.index] ?? item.revised,
                        }));
                        setEditingIndex(item.index);
                      }}
                      className="h-7 rounded-md border border-violet-200 bg-violet-50 px-2 text-[11px] font-black text-violet-700"
                    >
                      修改后采用
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        decide(item.index, 'accepted');
                      }}
                      className="h-7 rounded-md bg-[#08AACE] px-2 text-[11px] font-black text-white"
                    >
                      接受修改
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-4 py-2">
        <span className="text-xs font-bold text-slate-400">AI始终读取完整章节；上下文按钮只调整当前显示范围。</span>
        <button
          type="button"
          disabled={acceptedCount === 0}
          onClick={applyAcceptedChanges}
          className="h-8 rounded-lg bg-slate-950 px-4 text-xs font-black text-white disabled:bg-slate-300"
        >
          应用已接受修改（{acceptedCount}）
        </button>
      </div>
    </div>
  );
}
