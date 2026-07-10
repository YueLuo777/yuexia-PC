import { Plus, Trash2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

type WorkbenchSimpleLibraryViewProps = {
  scaleStyle?: CSSProperties;
  topTabs: ReactNode;
  overlays: ReactNode;
  activeTab: string;
  emptyText: string;
  entries: WorkbenchLibraryEntry[];
  selectedEntry: WorkbenchLibraryEntry | null;
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
  onAddEntry,
  onSelectEntry,
  onUpdateEntry,
  onDeleteEntry,
}: WorkbenchSimpleLibraryViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {topTabs}
      {overlays}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] overflow-hidden bg-white">
        <aside className="flex min-h-0 flex-col border-r border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-bold text-gray-700">{activeTab}</span>
            <button onClick={onAddEntry} className="rounded-md p-1 text-brand hover:bg-brand-light" title="新增">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {entries.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs leading-5 text-gray-400">{emptyText}</p>
            ) : (
              <div className="space-y-1">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onSelectEntry(entry.id)}
                    className={`group w-full rounded-lg border px-2 py-2 text-left font-black transition-colors ${
                      selectedEntry?.id === entry.id
                        ? 'border-transparent xy-selected-mint-bg'
                        : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="truncate text-xs font-black text-gray-800">{entry.title}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{entry.updatedAt}</span>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteEntry(entry.id);
                        }}
                        className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col p-4">
          {selectedEntry ? (
            <>
              <input
                value={selectedEntry.title}
                onChange={(event) => onUpdateEntry(selectedEntry.id, { title: event.target.value })}
                className="mb-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
              />
              <textarea
                value={selectedEntry.content}
                onChange={(event) => onUpdateEntry(selectedEntry.id, { content: event.target.value })}
                placeholder={`填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              点击左侧加号新增内容
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
