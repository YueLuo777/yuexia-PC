import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { WordCountText } from '@/shared/ui/WordCountText';

export type AiRequestLogGroup = {
  id: string;
  title: string;
  meta?: string;
  content?: string;
  emptyText?: string;
  tone?: 'default' | 'cyan' | 'amber';
  contentClassName?: string;
};

function getToneClass(tone: AiRequestLogGroup['tone']) {
  if (tone === 'cyan') return 'border-[#bdeef7] bg-[#EAF9FD] text-[#078fb0]';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function renderMeta(meta: string) {
  const wordCountMatch = meta.match(/^([\d,]+)\s*字$/);
  if (!wordCountMatch) return meta;
  return <WordCountText value={wordCountMatch[1]} />;
}

export function AiRequestLogGroups({
  groups,
  defaultCollapsed = true,
}: {
  groups: AiRequestLogGroup[];
  defaultCollapsed?: boolean;
}) {
  const visibleGroups = groups.filter((group) => group.content?.trim());
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(defaultCollapsed ? visibleGroups.map((group) => group.id) : []),
  );

  const toggleGroup = (id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => {
        const collapsed = collapsedIds.has(group.id);
        const content = group.content?.trim() ?? '';
        return (
          <section key={group.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                {collapsed ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                <span className="truncate text-sm font-black text-slate-950">{group.title}</span>
                {group.meta && (
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-black ${getToneClass(group.tone)}`}>
                    {renderMeta(group.meta)}
                  </span>
                )}
              </span>
            </button>
            {!collapsed && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-3">
                <div className={`ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-700 ${group.contentClassName ?? 'max-h-[360px] overflow-y-auto'}`}>
                  {content}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
