import { FolderOpen, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import { WorkbenchNameField } from './WorkbenchNameField';
import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS,
} from './workbenchLibraryPanelConstants';

type WorkbenchSimpleLibraryViewProps = {
  scaleStyle?: CSSProperties;
  topTabs: ReactNode;
  overlays: ReactNode;
  activeTab: string;
  emptyText: string;
  entries: WorkbenchLibraryEntry[];
  selectedEntry: WorkbenchLibraryEntry | null;
  sidebarWidth?: number;
  onAddEntry: () => void;
  onSelectEntry: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<WorkbenchLibraryEntry>) => void;
  onDeleteEntry: (id: string) => void;
};

export function WorkbenchSimpleLibraryView({
  scaleStyle,
  topTabs,
  overlays,
  activeTab,
  emptyText,
  entries,
  selectedEntry,
  sidebarWidth = 280,
  onAddEntry,
  onSelectEntry,
  onUpdateEntry,
  onDeleteEntry,
}: WorkbenchSimpleLibraryViewProps) {
  const [search, setSearch] = useState('');
  const visibleEntries = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return entries;
    return entries.filter((entry) => entry.title.toLocaleLowerCase().includes(keyword));
  }, [entries, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {topTabs}
      {overlays}
      <div
        className="grid min-h-0 flex-1 overflow-hidden bg-white"
        style={{ gridTemplateColumns: `${sidebarWidth}px minmax(0,1fr)` }}
      >
        <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2">
          <label className="mx-1 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              aria-label={`搜索${activeTab}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`搜索${activeTab}...`}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="editor-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto">
            <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
              <FolderOpen className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
              <span className="min-w-0 flex-1 truncate leading-none">{activeTab}</span>
              <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{visibleEntries.length}</span>
            </div>
            <div className="mt-1 space-y-1 pl-2">
              {visibleEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs font-bold leading-5 text-slate-400">
                  {search.trim() ? `没有匹配的${activeTab}` : emptyText}
                </div>
              ) : (
                visibleEntries.map((entry) => (
                  <div key={entry.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry.id)}
                      className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} pr-11 ${
                        selectedEntry?.id === entry.id
                          ? 'border-transparent xy-selected-mint-bg text-gray-900'
                          : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className="block truncate">{entry.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label={`删除${entry.title}`}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 grid h-11 shrink-0 grid-cols-[1fr_2fr] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <span className="flex items-center justify-center border-r border-slate-200 bg-[#DFF7FC] text-sm font-black text-[#08AACE]">
              新建
            </span>
            <button
              type="button"
              onClick={onAddEntry}
              className="text-sm font-black text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
            >
              {activeTab}
            </button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col bg-white p-5">
          {selectedEntry ? (
            <>
              <div className="shrink-0">
                <WorkbenchNameField
                  label={`${activeTab}名称`}
                  value={selectedEntry.title}
                  onValueChange={(title) => onUpdateEntry(selectedEntry.id, { title })}
                  placeholder={`填写${activeTab}名称`}
                />
              </div>
              <div className="relative mt-5 min-h-0 flex-1 rounded-[22px] border-2 border-slate-950 bg-white p-5">
                <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 text-base font-black leading-6 text-slate-950">
                  {activeTab}内容
                </span>
                <textarea
                  value={selectedEntry.content}
                  onChange={(event) => onUpdateEntry(selectedEntry.id, { content: event.target.value })}
                  placeholder={`填写${activeTab}内容...`}
                  className="editor-scrollbar h-full w-full resize-none bg-transparent text-sm leading-7 text-gray-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm font-bold text-gray-400">
              点击左侧“新建 {activeTab}”开始创建
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
