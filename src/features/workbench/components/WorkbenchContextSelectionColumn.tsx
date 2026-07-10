import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import type {
  WorkbenchLinkedContextItem,
  WorkbenchLinkedContextSource,
} from '@/features/workbench/components/WorkbenchAIPanel';
import { WordCountText } from '@/shared/ui/WordCountText';

export interface WorkbenchContextColumn {
  source: WorkbenchLinkedContextSource;
  title: string;
  subtitle: string;
  items: WorkbenchLinkedContextItem[];
}

function getContextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

type WorkbenchContextSelectionColumnProps = {
  column: WorkbenchContextColumn;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function WorkbenchContextSelectionColumn({
  column,
  selectedIds,
  onToggle,
}: WorkbenchContextSelectionColumnProps) {
  const [previewItemId, setPreviewItemId] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const groupedItems = new Map<string, WorkbenchLinkedContextItem[]>();
  column.items.forEach((item) => {
    const group = item.group || '未分类';
    groupedItems.set(group, [...(groupedItems.get(group) ?? []), item]);
  });
  const previewItem = column.items.find((item) => item.id === previewItemId) ?? null;
  const navGroups = Array.from(groupedItems.entries()).map(([group, items]) => ({ group, items }));

  const toggleGroupCollapsed = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleItemsSelection = (items: WorkbenchLinkedContextItem[]) => {
    const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
    items.forEach((item) => {
      if (allSelected || !selectedIds.has(item.id)) onToggle(item.id);
    });
  };

  useEffect(() => {
    if (column.items.length === 0) {
      if (previewItemId) setPreviewItemId('');
      return;
    }
    if (previewItemId && !column.items.some((item) => item.id === previewItemId)) {
      setPreviewItemId('');
    }
  }, [column.items, previewItemId]);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden bg-white">
      <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <div className="min-w-0 truncate text-[15px] font-black text-slate-400">{column.title}</div>
          <button
            type="button"
            onClick={() => toggleItemsSelection(column.items)}
            disabled={column.items.length === 0}
            className="h-8 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            关联所有
          </button>
        </div>
        <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
          {column.items.length === 0 ? (
            <div className="rounded-xl bg-white px-3 py-4 text-xs font-bold leading-5 text-slate-400">
              暂无可关联内容
            </div>
          ) : (
            navGroups.map(({ group, items }) => {
              const collapsed = collapsedGroups[group] ?? false;
              return (
                <div key={`${column.source}:${group}`} className="rounded-xl border border-[#cceef6] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapsed(group)}
                    className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#E6F7FB] px-2 text-left text-[15px] font-black text-slate-700 hover:bg-[#d7f1f8]"
                  >
                    <span className="min-w-0 truncate">{group}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] text-slate-400">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleItemsSelection(items);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          event.stopPropagation();
                          toggleItemsSelection(items);
                        }}
                        className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                      >
                        全选
                      </span>
                      {items.length}
                      {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="mt-1 space-y-1 bg-white">
                      {items.map((item) => {
                        const checked = selectedIds.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPreviewItemId(item.id)}
                            className={
                              'flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-[15px] font-black ' +
                              (checked
                                ? 'xy-selected-content-bg text-gray-900'
                                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800')
                            }
                          >
                            <span
                              role="checkbox"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewItemId(item.id);
                                onToggle(item.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                event.stopPropagation();
                                setPreviewItemId(item.id);
                                onToggle(item.id);
                              }}
                              className={
                                'grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ' +
                                (checked
                                  ? 'border-[#08AACE] bg-[#08AACE] text-white'
                                  : 'border-slate-300 bg-white text-transparent')
                              }
                            >
                              ✓
                            </span>
                            <span className="min-w-0 truncate">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
      <div className="min-h-0 p-3">
        {previewItem ? (
          <article
            className={
              'flex h-full min-h-0 flex-col rounded-2xl border px-5 py-4 ' +
              (selectedIds.has(previewItem.id)
                ? 'border-[#08AACE] xy-selected-content-bg text-slate-900'
                : 'border-gray-100 bg-gray-50 text-gray-600')
            }
          >
            <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(previewItem.id)}
                    className={
                      'grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-black ' +
                      (selectedIds.has(previewItem.id)
                        ? 'border-[#08AACE] bg-[#08AACE] text-white'
                        : 'border-slate-300 bg-white text-transparent')
                    }
                  >
                    ✓
                  </button>
                  <h4 className="truncate text-lg font-black text-slate-900">{previewItem.title}</h4>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#08AACE]">
                    {previewItem.group}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-black text-[#08AACE]">
                <WordCountText value={getContextWordCount(previewItem.content)} />
              </span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words pr-2 text-sm font-semibold leading-7 text-slate-600">
              {previewItem.content || '暂无内容'}
            </div>
          </article>
        ) : (
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gray-50 text-sm font-bold text-slate-300">
            暂无预览内容
          </div>
        )}
      </div>
    </section>
  );
}
