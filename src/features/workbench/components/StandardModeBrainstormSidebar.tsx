import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getBrainstormEntryBody } from '@/features/workbench/components/workbenchLibraryAiText';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';

interface StandardModeBrainstormSidebarProps {
  entries: WorkbenchLibraryEntry[];
  selectedEntryId: string | null;
  onSelect: (entry: WorkbenchLibraryEntry) => void;
}

export function StandardModeBrainstormSidebar({
  entries,
  selectedEntryId,
  onSelect,
}: StandardModeBrainstormSidebarProps) {
  const [query, setQuery] = useState('');
  const visibleEntries = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return entries;
    return entries.filter((entry) => `${entry.title} ${getBrainstormEntryBody(entry)}`.includes(keyword));
  }, [entries, query]);

  return (
    <aside className="flex min-h-0 flex-col border-r border-[#dce1e8] bg-[#f8fafc] p-3">
      <label className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#dce1e8] bg-white px-3 text-[#8a95a2] focus-within:border-[#8fd8e7]">
        <Search className="h-4 w-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索脑洞"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1f2933] outline-none placeholder:text-[#9aa3af]"
        />
      </label>

      <div className="mt-3 flex h-10 shrink-0 items-center justify-between rounded-md border border-[#bde7ef] bg-[#CDEFF6] px-3">
        <span className="text-sm font-bold text-[#1f2933]">脑洞库</span>
        <span className="text-xs font-bold text-[#078FAB]">{entries.length}</span>
      </div>

      <div className="editor-scrollbar mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {visibleEntries.map((entry, index) => {
          const selected = entry.id === selectedEntryId;
          const wordCount = countTextWords(getBrainstormEntryBody(entry));
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry)}
              aria-current={selected ? 'page' : undefined}
              className={`grid h-11 w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2.5 text-left transition-colors ${
                selected
                  ? 'border-[#08AACE] bg-white text-[#1f2933] shadow-[0_0_0_1px_rgba(8,170,206,0.16)]'
                  : 'border-transparent bg-transparent text-[#657180] hover:border-[#bde7ef] hover:bg-white'
              }`}
            >
              <span className="text-center text-xs font-bold text-[#08AACE]">
                {entry.brainstormSerialNumber ?? index + 1}
              </span>
              <span className="truncate text-sm font-semibold" title={entry.title}>
                {entry.title}
              </span>
              <span className="whitespace-nowrap text-xs font-semibold text-[#08AACE]">{wordCount}字</span>
            </button>
          );
        })}
        {visibleEntries.length === 0 && (
          <div className="grid h-32 place-items-center text-sm font-medium text-[#9aa3af]">
            {entries.length === 0 ? '脑洞库为空' : '没有匹配的脑洞'}
          </div>
        )}
      </div>
    </aside>
  );
}
