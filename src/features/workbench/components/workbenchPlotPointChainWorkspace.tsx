import type { ReactNode } from 'react';

import {
  getPlotPointScoreColorClass,
  prepareCollapsedPlotPointCard,
} from '@/features/workbench/model/workbenchPlotPointCard';
import {
  getWorkbenchPlotPointDecisionMetrics,
  getWorkbenchPlotPointDisplayText,
  getWorkbenchPlotPointFitClass,
  getWorkbenchPlotPointFitLabel,
  getWorkbenchPlotPointMetricClass,
  getWorkbenchPlotPointPreviewText,
  getWorkbenchPlotPointReview,
  type WorkbenchPlotPointCandidate,
} from '@/features/workbench/model/workbenchPlotChain';

type PlotPointChainWorkspaceProps = {
  filterMode: 'all' | 'unwritten' | 'written';
  selectedItems: WorkbenchPlotPointCandidate[];
  visibleSelectedItems: WorkbenchPlotPointCandidate[];
  writtenIds: ReadonlySet<string>;
  activeItemId: string | null;
  expandedPreviewIds: string[];
  visibleCandidates: WorkbenchPlotPointCandidate[];
  selectedIds: string[];
  hasChain: boolean;
  isFollowupStage: boolean;
  isLoading: boolean;
  leftResizeHandle: ReactNode;
  onFilterChange: (mode: 'all' | 'unwritten' | 'written') => void;
  onOpenDetailOutline: () => void;
  onSelectActiveItem: (id: string) => void;
  onTogglePreviewExpanded: (id: string) => void;
  onMarkWritten: (id: string) => void;
  onMoveToUnwritten: (id: string) => void;
  onToggleCandidate: (id: string) => void;
  onClearPreview: () => void;
  onRegenerate: () => void;
  onContinue: () => void;
};

export function PlotPointChainWorkspace({
  filterMode,
  selectedItems,
  visibleSelectedItems,
  writtenIds,
  activeItemId,
  expandedPreviewIds,
  visibleCandidates,
  selectedIds,
  hasChain,
  isFollowupStage,
  isLoading,
  leftResizeHandle,
  onFilterChange,
  onOpenDetailOutline,
  onSelectActiveItem,
  onTogglePreviewExpanded,
  onMarkWritten,
  onMoveToUnwritten,
  onToggleCandidate,
  onClearPreview,
  onRegenerate,
  onContinue,
}: PlotPointChainWorkspaceProps) {
  return (
    <>
      <aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-white">
        <div className="editor-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', '全部'],
                ['unwritten', '只看未写'],
                ['written', '只看已写'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onFilterChange(mode)}
                className={`h-10 w-20 whitespace-nowrap rounded-2xl border px-2 text-sm font-black ${
                  filterMode === mode
                    ? 'border-[#08AACE] bg-[#08AACE] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenDetailOutline}
              className="h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE] px-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0798b8]"
            >
              生成章纲
            </button>
          </div>
          {selectedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
              先在右侧关联资料，再选择剧情点来源和剧情点类型。选中的剧情点会加入当前剧情链。
            </div>
          ) : visibleSelectedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
              当前过滤条件下没有剧情点，切到“全部”可以查看已写内容。
            </div>
          ) : (
            <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-[#9DEBFA]">
              {visibleSelectedItems.map((item) => {
                const index = selectedItems.findIndex((selectedItem) => selectedItem.id === item.id);
                const written = writtenIds.has(item.id);
                const activeChainItem = activeItemId === item.id;
                const collapsedCard = prepareCollapsedPlotPointCard(item);
                const scoreText = item.score ?? collapsedCard.averageScore;
                const metrics = getWorkbenchPlotPointDecisionMetrics(item, scoreText, index > 0, index);
                const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                const reviewExpanded = expandedPreviewIds.includes(`chain-review:${item.id}`);
                const metricItems = [
                  ['内容', metrics.clarity],
                  ['潜力', metrics.potential],
                  ['衔接', metrics.fit],
                ] as const;
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl border bg-white p-4 shadow-sm ${activeChainItem ? 'border-[#08AACE] ring-2 ring-[#bdeef7]' : written ? 'border-slate-200' : 'border-[#bdeef7]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectActiveItem(item.id)}
                      className={`absolute -left-[26px] top-4 grid h-8 w-8 place-items-center rounded-full text-xs font-black shadow-sm ${
                        activeChainItem
                          ? 'bg-[#08AACE] text-white'
                          : written
                            ? 'bg-slate-100 text-slate-500 ring-2 ring-slate-200'
                            : 'bg-white text-[#08AACE] ring-2 ring-[#9DEBFA]'
                      }`}
                      title={`剧情点${index + 1} ${item.title}`}
                    >
                      {index + 1}
                    </button>
                    <div className="editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE] p-4 text-sm font-bold leading-7 text-slate-700">
                      {displayText}
                    </div>
                    <div className="mt-3 min-w-0">
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {metricItems.map(([label, value]) => (
                          <div
                            key={label}
                            className={`flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm ${getWorkbenchPlotPointMetricClass(value)}`}
                          >
                            <span className="text-xs font-black opacity-80">{label}</span>
                            <span className="text-sm font-black">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onTogglePreviewExpanded(`chain-review:${item.id}`)}
                          className="h-7 rounded-lg border border-[#bdeef7] bg-white px-3 text-xs font-black text-[#08AACE] transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD]"
                        >
                          {reviewExpanded ? '收起AI评价' : 'AI评价'}
                        </button>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => (written ? onMoveToUnwritten(item.id) : onMarkWritten(item.id))}
                            className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-black shadow-sm transition-colors ${
                              written
                                ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                                : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-white hover:text-emerald-800'
                            }`}
                          >
                            {written ? '移回未写' : '标为已写'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleCandidate(item.id)}
                            className="h-8 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-red-500 shadow-sm transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      {reviewExpanded && (
                        <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                          {getWorkbenchPlotPointReview(item, isFollowupStage)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {leftResizeHandle}

      <section className="min-w-0 flex min-h-0 flex-col bg-white">
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {visibleCandidates.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
              暂无剧情点预览
            </div>
          ) : (
            <div className="space-y-3">
              {visibleCandidates.map((item, index) => {
                const selected = selectedIds.includes(item.id);
                const expanded = expandedPreviewIds.includes(item.id);
                const collapsedCard = prepareCollapsedPlotPointCard(item);
                const averageScore = item.score ?? collapsedCard.averageScore;
                const metrics = getWorkbenchPlotPointDecisionMetrics(item, averageScore, hasChain, index);
                const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                const fitLabel = getWorkbenchPlotPointFitLabel(metrics.fit, hasChain);
                const metricItems = [
                  ['内容', metrics.clarity],
                  ['潜力', metrics.potential],
                  [hasChain ? '衔接' : '开端', metrics.fit],
                ] as const;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 shadow-sm transition-colors ${selected ? 'border-[#08AACE] bg-[#EAF9FD] ring-2 ring-[#bdeef7]' : 'border-slate-200 bg-white hover:border-[#bdeef7]'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="min-w-0 max-w-full truncate text-base font-black text-slate-950">
                            剧情点 {index + 1}
                          </span>
                          {averageScore && (
                            <span
                              className={`shrink-0 rounded-full bg-white px-2 py-1 text-xs font-black ${getPlotPointScoreColorClass(averageScore)}`}
                            >
                              {averageScore}分
                            </span>
                          )}
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${getWorkbenchPlotPointFitClass(metrics.fit)}`}
                          >
                            {fitLabel} {metrics.fit}
                          </span>
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]">
                            {item.source}
                          </span>
                        </div>
                        <p
                          className={`mt-2 text-[14.4px] font-bold leading-[24px] ${expanded ? '' : 'line-clamp-3'} ${selected ? 'text-slate-800' : 'text-slate-600'}`}
                        >
                          {displayText}
                        </p>
                        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                          {getWorkbenchPlotPointReview(item, isFollowupStage)}
                        </div>
                      </div>
                      <div className="flex w-[118px] shrink-0 flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onTogglePreviewExpanded(item.id)}
                            className="h-8 w-12 shrink-0 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]"
                          >
                            {expanded ? '收起' : '展开'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleCandidate(item.id)}
                            className={`h-8 w-14 shrink-0 rounded-lg text-xs font-black ${selected ? 'bg-slate-900 text-white' : 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'}`}
                          >
                            {selected ? '已选' : '选择'}
                          </button>
                        </div>
                        <div className="space-y-1">
                          {metricItems.map(([label, value]) => (
                            <div
                              key={label}
                              className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2 text-[11px] font-black"
                            >
                              <span className="text-slate-500">{label}</span>
                              <span className="text-slate-700">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">
          <button
            type="button"
            onClick={onClearPreview}
            className="h-9 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-500 hover:bg-red-50"
          >
            清空
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-[#08AACE] hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
          >
            重新生成
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={isLoading || !hasChain}
            className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            继续生成
          </button>
        </div>
      </section>
    </>
  );
}
