import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { StandardSettingEntryDescriptor } from '@/features/workbench/model/standardModeSettingModel';

type StandardModeSettingSidebarProps = {
  entries: StandardSettingEntryDescriptor[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  footerActions?: ReactNode;
};

type SidebarGroup = {
  id: string;
  title: string;
  custom: boolean;
  entries: StandardSettingEntryDescriptor[];
};

type SidebarDomain = {
  id: string;
  title: string;
  groups: SidebarGroup[];
};

function buildSidebarDomains(entries: StandardSettingEntryDescriptor[]) {
  const domains = new Map<string, SidebarDomain>();
  entries.forEach((entry) => {
    const domain = domains.get(entry.domainId) ?? {
      id: entry.domainId,
      title: entry.domainTitle,
      groups: [],
    };
    let group = domain.groups.find((item) => item.id === entry.groupId);
    if (!group) {
      group = {
        id: entry.groupId,
        title: entry.groupTitle,
        custom: entry.sourceKind === 'custom',
        entries: [],
      };
      domain.groups.push(group);
    }
    group.entries.push(entry);
    domains.set(entry.domainId, domain);
  });
  return [...domains.values()];
}

export function StandardModeSettingSidebar({
  entries,
  selectedEntryId,
  onSelectEntry,
  footerActions,
}: StandardModeSettingSidebarProps) {
  const [query, setQuery] = useState('');
  const domains = useMemo(() => buildSidebarDomains(entries), [entries]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(() => new Set(domains.map((item) => item.id)));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() =>
    new Set(domains.flatMap((domain) => domain.groups.map((group) => group.id))),
  );

  useEffect(() => {
    setExpandedDomains((current) => new Set([...current, ...domains.map((item) => item.id)]));
    setExpandedGroups((current) => new Set([...current, ...domains.flatMap((domain) => domain.groups.map((group) => group.id))]));
  }, [domains]);

  const normalizedQuery = query.trim().toLocaleLowerCase();

  return (
    <aside className="flex min-h-0 w-[280px] shrink-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-1 py-2">
      <nav aria-label="设定目录" className="mb-3 xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-gutter:stable]">
        {domains.map((domain) => {
          const domainEntries = domain.groups.flatMap((group) => group.entries);
          const domainMatches = domain.title.toLocaleLowerCase().includes(normalizedQuery);
          const filteredGroups = domain.groups
            .map((group) => ({
              ...group,
              entries:
                normalizedQuery && !domainMatches && !group.title.toLocaleLowerCase().includes(normalizedQuery)
                  ? group.entries.filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery))
                  : group.entries,
            }))
            .filter((group) => !normalizedQuery || domainMatches || group.title.toLocaleLowerCase().includes(normalizedQuery) || group.entries.length > 0);
          if (normalizedQuery && !domainMatches && filteredGroups.length === 0) return null;
          const domainOpen = Boolean(normalizedQuery) || expandedDomains.has(domain.id);
          return (
            <section key={domain.id} className="relative pb-1" data-standard-setting-domain={domain.id}>
              <div className="sticky top-0 z-30 bg-[#F7F9FB] pb-1">
                <button
                  type="button"
                  aria-expanded={domainOpen}
                  onClick={() =>
                    setExpandedDomains((current) => {
                      const next = new Set(current);
                      if (next.has(domain.id)) next.delete(domain.id);
                      else next.add(domain.id);
                      return next;
                    })
                  }
                  className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#AEE7F1] bg-[#CDEFF6] px-2 text-left text-sm font-black text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-[#BFEAF3]"
                >
                  {domainOpen ? <ChevronDown className="h-4 w-4 text-[#08AACE]" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <span className="min-w-0 flex-1 truncate">{domain.title}</span>
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-400">{domainEntries.length}</span>
                </button>
              </div>
              {domainOpen ? (
                <div className="relative space-y-1 pl-3 before:absolute before:bottom-3 before:left-1 before:top-0 before:w-px before:bg-[#7DCDDC] before:content-['']">
                  {filteredGroups.map((group) => {
                    const groupOpen = Boolean(normalizedQuery) || expandedGroups.has(group.id);
                    const showGroupRow = !group.custom;
                    return (
                      <div key={group.id} className="relative">
                        {showGroupRow ? (
                          <div className="sticky top-10 z-20 bg-[#F7F9FB] py-1">
                            <button
                              type="button"
                              aria-expanded={groupOpen}
                              onClick={() =>
                                setExpandedGroups((current) => {
                                  const next = new Set(current);
                                  if (next.has(group.id)) next.delete(group.id);
                                  else next.add(group.id);
                                  return next;
                                })
                              }
                              className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#B7EAF3] bg-[#DDF5FA] px-2 text-left text-xs font-black text-[#155E75] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-[#D2F0F7]"
                            >
                              {groupOpen ? <ChevronDown className="h-3.5 w-3.5 text-[#08AACE]" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                              <span className="min-w-0 flex-1 truncate">{group.title}</span>
                              <span className="text-[10px] text-slate-400">{group.entries.length}</span>
                            </button>
                          </div>
                        ) : null}
                        {groupOpen || !showGroupRow ? (
                          <div className={`relative space-y-px ${showGroupRow ? 'pl-3' : ''}`}>
                            {group.entries.map((entry) => {
                              const selected = entry.id === selectedEntryId;
                              return (
                                <button
                                  key={entry.id}
                                  type="button"
                                  aria-current={selected ? 'page' : undefined}
                                  onClick={() => onSelectEntry(entry.id)}
                                  className={`relative flex min-h-9 w-full items-center rounded-md border px-3 py-2 text-left text-xs font-bold ${
                                    selected
                                      ? 'border-2 border-[#2A9FB9] bg-white text-slate-700'
                                      : 'border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white'
                                  }`}
                                >
                                  <span className="min-w-0 truncate">{entry.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
        {domains.length > 0 ? (
          <div
            aria-hidden="true"
            data-setting-tree-end-spacer="true"
            className="h-[var(--workbench-setting-tree-end-spacer-height)] shrink-0"
          />
        ) : null}
      </nav>
      <label className="mx-1 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          aria-label="搜索设定"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索设定..."
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>
      {footerActions}
    </aside>
  );
}
