import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { WordCountText } from '@/shared/ui/WordCountText';

const AI_REQUEST_LOG_COLLAPSED_KEY = 'xinyuexia_ai_request_log_collapsed_groups_v1';

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

function readCollapsedLogGroupKeys(storageKey: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as unknown;
    return Array.isArray(parsed)
      ? new Set(parsed.filter((item): item is string => typeof item === 'string'))
      : null;
  } catch {
    return null;
  }
}

function writeCollapsedLogGroupKeys(storageKey: string, keys: Set<string>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(keys)));
  } catch {
    // Log folding memory is only a convenience; the log should still render.
  }
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
  defaultCollapsed = true,
  storageKey = AI_REQUEST_LOG_COLLAPSED_KEY,
}: {
  groups: AiRequestLogGroup[];
  defaultCollapsed?: boolean;
  storageKey?: string;
}) {
  const visibleGroups = useMemo(
    () => groups.filter((group) => group.content?.trim()),
    [groups],
  );
  const visibleGroupKeys = useMemo(() => visibleGroups.map(getGroupStorageKey), [visibleGroups]);
  const visibleGroupKeysSignature = visibleGroupKeys.join('\u0000');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => {
      const storedKeys = readCollapsedLogGroupKeys(storageKey);
      if (storedKeys) {
        return new Set(visibleGroupKeys.filter((key) => storedKeys.has(key)));
      }
      return new Set(defaultCollapsed ? visibleGroupKeys : []);
    },
  );

  useEffect(() => {
    const storedKeys = readCollapsedLogGroupKeys(storageKey);
    if (!storedKeys) return;
    setCollapsedIds(new Set(visibleGroupKeys.filter((key) => storedKeys.has(key))));
  }, [storageKey, visibleGroupKeys, visibleGroupKeysSignature]);

  const toggleGroup = (key: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      writeCollapsedLogGroupKeys(storageKey, next);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => {
        const groupKey = getGroupStorageKey(group);
        const collapsed = collapsedIds.has(groupKey);
        const content = group.content?.trim() ?? '';
        return (
          <section key={group.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => toggleGroup(groupKey)}
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
