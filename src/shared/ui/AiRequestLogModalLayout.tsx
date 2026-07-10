import type { ReactNode } from 'react';

import { AiRequestLogContent, AiRequestLogGroups, type AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';

export type AiRequestLogMetaItem = {
  id: string;
  label: string;
  value: ReactNode;
  hidden?: boolean;
  valueClassName?: string;
};

interface AiRequestLogModalLayoutProps {
  metaItems: AiRequestLogMetaItem[];
  groups: AiRequestLogGroup[];
  fillSingleGroup?: boolean;
  fillGroupWeights?: Record<string, number>;
  storageKey?: string;
  emptyText?: ReactNode;
  showGroupedContent?: boolean;
  plainPreview?: string;
  asideExtra?: ReactNode;
}

export function AiRequestLogModalLayout({
  metaItems,
  groups,
  fillSingleGroup = true,
  fillGroupWeights,
  storageKey,
  emptyText = '暂无输出日志',
  showGroupedContent = true,
  plainPreview = '',
  asideExtra,
}: AiRequestLogModalLayoutProps) {
  const visibleMetaItems = metaItems.filter((item) => !item.hidden);
  const hasGroupContent = groups.some((group) => group.content?.trim());

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden">
      <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
        <div className="space-y-3">
          {visibleMetaItems.map((item) => (
            <div key={item.id} className="rounded-xl bg-white p-3">
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className={`mt-1 break-words font-bold ${item.valueClassName ?? 'text-slate-800'}`}>
                {item.value}
              </div>
            </div>
          ))}
          {asideExtra}
        </div>
      </aside>
      <div className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5">
        {showGroupedContent ? (
          hasGroupContent ? (
            <AiRequestLogGroups
              groups={groups}
              defaultCollapsed={false}
              fillSingleGroup={fillSingleGroup}
              fillGroupWeights={fillGroupWeights}
              storageKey={storageKey}
            />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
              {emptyText}
            </div>
          )
        ) : (
          <div className="ai-request-log-text min-h-0 flex-1 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
            {plainPreview.trim() ? <AiRequestLogContent content={plainPreview} /> : emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
