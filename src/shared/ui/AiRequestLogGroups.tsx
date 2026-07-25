import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState, type CSSProperties } from 'react';

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

function isSoftwareLogMarkerLine(line: string) {
  const trimmed = line.trim();
  return /^<\/?[\u4e00-\u9fa5A-Za-z][^>]*>$/.test(trimmed) || /^【[^】]+】$/.test(trimmed);
}

function getGroupStorageKey(group: Pick<AiRequestLogGroup, 'id' | 'title'>) {
  return `${group.id}:${group.title}`;
}

export function AiRequestLogContent({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, index) => {
        const marker = isSoftwareLogMarkerLine(line);
        return (
          <Fragment key={`${index}-${line}`}>
            {index > 0 ? '\n' : null}
            {marker ? <span className="font-black text-red-500">{line}</span> : line}
          </Fragment>
        );
      })}
    </>
  );
}

export function AiRequestLogGroups({
  groups,
  defaultCollapsed = false,
  fillSingleGroup = false,
  fillGroupId,
  fillLastGroup = false,
  fillGroupWeights,
}: {
  groups: AiRequestLogGroup[];
  defaultCollapsed?: boolean;
  fillSingleGroup?: boolean;
  fillGroupId?: string;
  fillLastGroup?: boolean;
  fillGroupWeights?: Record<string, number>;
  /** Kept for backward compatibility; log section folding is no longer persisted. */
  storageKey?: string;
}) {
  const visibleGroups = useMemo(() => groups.filter((group) => group.content?.trim()), [groups]);
  const visibleGroupKeys = useMemo(() => visibleGroups.map(getGroupStorageKey), [visibleGroups]);
  const visibleGroupKeysSignature = visibleGroupKeys.join('\u0000');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(defaultCollapsed ? visibleGroupKeys : []),
  );

  useEffect(() => {
    setCollapsedIds(new Set(defaultCollapsed ? visibleGroupKeys : []));
  }, [defaultCollapsed, visibleGroupKeys, visibleGroupKeysSignature]);

  const toggleGroup = (key: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const shouldFillSingleGroup = fillSingleGroup && visibleGroups.length === 1;
  const fillLastGroupIndex = fillLastGroup ? visibleGroups.length - 1 : -1;
  const hasFillGroupWeights = Boolean(fillGroupWeights && Object.keys(fillGroupWeights).length > 0);
  const shouldUseFillLayout = shouldFillSingleGroup || Boolean(fillGroupId) || fillLastGroup || hasFillGroupWeights;

  return (
    <div className={shouldUseFillLayout ? 'flex h-full min-h-0 flex-col gap-3' : 'space-y-3'}>
      {visibleGroups.map((group, groupIndex) => {
        const groupKey = getGroupStorageKey(group);
        const collapsed = collapsedIds.has(groupKey);
        const content = group.content?.trim() ?? '';
        const fillGroupWeight = fillGroupWeights?.[group.id];
        const shouldFillWeightedGroup = typeof fillGroupWeight === 'number' && fillGroupWeight > 0 && !collapsed;
        const shouldFillGroup =
          (shouldFillSingleGroup && !collapsed) ||
          (fillGroupId === group.id && !collapsed) ||
          (fillLastGroupIndex === groupIndex && !collapsed) ||
          shouldFillWeightedGroup;
        const fillGroupStyle: CSSProperties | undefined = shouldFillWeightedGroup
          ? { flexGrow: fillGroupWeight, flexBasis: 0, minHeight: 0 }
          : undefined;
        return (
          <section
            key={group.id}
            style={fillGroupStyle}
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${shouldFillGroup ? 'flex min-h-0 flex-1 flex-col' : ''}`}
          >
            <button
              type="button"
              onClick={() => toggleGroup(groupKey)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <span className="truncate text-sm font-black text-slate-950">{group.title}</span>
                {group.meta && (
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-black ${getToneClass(group.tone)}`}
                  >
                    {renderMeta(group.meta)}
                  </span>
                )}
              </span>
            </button>
            {!collapsed && (
              <div
                className={`border-t border-slate-100 bg-slate-50/60 p-3 ${shouldFillGroup ? 'flex min-h-0 flex-1 flex-col' : ''}`}
              >
                <div
                  className={`ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 ${group.contentClassName ?? (shouldFillGroup ? 'min-h-0 flex-1 overflow-y-auto' : 'max-h-[360px] overflow-y-auto')}`}
                >
                  <AiRequestLogContent content={content} />
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
