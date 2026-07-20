import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { MemoItem, MemoScope } from './workbenchPageSupport';
import { WorkbenchModal } from './WorkbenchModal';

export function WorkbenchNotesModal({
  open,
  globalNotes,
  workNotes,
  selected,
  collapsed,
  activeMemo,
  onClose,
  onToggleSection,
  onAdd,
  onSelect,
  onUpdate,
}: {
  open: boolean;
  globalNotes: MemoItem[];
  workNotes: MemoItem[];
  selected: { scope: MemoScope; id: string } | null;
  collapsed: Record<MemoScope, boolean>;
  activeMemo: MemoItem | null;
  onClose: () => void;
  onToggleSection: (scope: MemoScope) => void;
  onAdd: (scope: MemoScope) => void;
  onSelect: (scope: MemoScope, id: string) => void;
  onUpdate: (patch: Partial<MemoItem>) => void;
}) {
  return (
    <WorkbenchModal
      title="备忘录"
      isOpen={open}
      onClose={onClose}
      storageId="workbench_notes"
      widthClass="w-[min(1180px,96vw)]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-[330px_minmax(0,1fr)] bg-white">
        <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          {[
            { scope: 'global' as const, title: '全局备忘录', items: globalNotes },
            { scope: 'work' as const, title: '作品备忘录', items: workNotes },
          ].map(({ scope, title, items }) => (
            <section
              key={scope}
              className="mb-4 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white"
            >
              <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-100 px-3">
                <button
                  onClick={() => onToggleSection(scope)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500"
                >
                  {collapsed[scope] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => onToggleSection(scope)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-bold text-gray-900"
                >
                  {title}
                </button>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                  {items.length}
                </span>
                <button
                  onClick={() => onAdd(scope)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 text-brand"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {!collapsed[scope] && (
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
                  {items.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-gray-400">暂无备忘录</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => {
                        const active = selected?.scope === scope && selected.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onSelect(scope, item.id)}
                            className={`w-full rounded-lg border px-3 py-2 text-left ${active ? 'border-brand bg-brand-light/70' : 'border-gray-100 bg-gray-50'}`}
                          >
                            <div className="truncate text-sm font-bold text-gray-800">{item.title}</div>
                            <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                              {item.content || '暂无内容'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </aside>
        <main className="flex min-h-0 flex-col p-5">
          {activeMemo ? (
            <>
              <div className="mb-4 flex shrink-0 items-center gap-3">
                <input
                  value={activeMemo.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base font-bold"
                />
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                  {selected?.scope === 'global' ? '全局' : '作品'}
                </span>
              </div>
              <textarea
                value={activeMemo.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={
                  selected?.scope === 'global' ? '全局备忘录会在整个软件中共通...' : '作品备忘录只属于当前作品...'
                }
                className="editor-scrollbar flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7"
              />
              <div className="mt-3 text-right text-xs text-gray-400">更新于 {activeMemo.updatedAt || '-'}</div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              请在左侧新建或选择备忘录
            </div>
          )}
        </main>
      </div>
    </WorkbenchModal>
  );
}
