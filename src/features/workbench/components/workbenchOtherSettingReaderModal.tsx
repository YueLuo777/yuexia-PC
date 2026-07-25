import { Folder, Search } from 'lucide-react';

import {
  ASSOCIATION_READER_GRID_CLASS,
  ASSOCIATION_READER_MODAL_HEIGHT_CLASS,
  ASSOCIATION_READER_MODAL_WIDTH_CLASS,
  AssociationReaderItemRow,
} from './AssociationReaderItemRow';
import { WorkbenchModal } from './WorkbenchModal';

export type OtherSettingLinkTabId =
  | 'work'
  | 'roles'
  | 'locations'
  | 'factions'
  | 'items'
  | 'foreshadow'
  | 'monsters';
export type OtherSettingLinkEntry = {
  id: string;
  entryId: string;
  source: 'setting' | 'role';
  tabId: OtherSettingLinkTabId;
  tabTitle: string;
  groupName: string;
  title: string;
  type: string;
  text: string;
  wordCount: number;
};
export type OtherSettingLinkGroup = {
  name: string;
  entries: OtherSettingLinkEntry[];
};
export type OtherSettingLinkTab = {
  id: OtherSettingLinkTabId;
  title: string;
  groups: OtherSettingLinkGroup[];
};

type OtherSettingReaderModalProps = {
  isOpen: boolean;
  tabs: OtherSettingLinkTab[];
  selectedTab?: OtherSettingLinkTab;
  visibleGroups: OtherSettingLinkGroup[];
  selectedEntry: OtherSettingLinkEntry | null;
  draftIds: Set<string>;
  draftEntries: OtherSettingLinkEntry[];
  draftWordCount: number;
  query: string;
  onClose: () => void;
  onSelectTab: (tab: OtherSettingLinkTab) => void;
  onSelectAllCurrentTab: () => void;
  onQueryChange: (value: string) => void;
  onToggleGroupSelection: (entries: OtherSettingLinkEntry[]) => void;
  onToggleEntry: (entryId: string) => void;
  onPreviewEntry: (entryId: string) => void;
  onClearDraft: () => void;
  onConfirm: () => void;
};

export function OtherSettingReaderModal({
  isOpen,
  tabs,
  selectedTab,
  visibleGroups,
  selectedEntry,
  draftIds,
  draftEntries,
  draftWordCount,
  query,
  onClose,
  onSelectTab,
  onSelectAllCurrentTab,
  onQueryChange,
  onToggleGroupSelection,
  onToggleEntry,
  onPreviewEntry,
  onClearDraft,
  onConfirm,
}: OtherSettingReaderModalProps) {
  if (!isOpen) return null;

  return (
    <WorkbenchModal
      title="关联其他设定"
      subtitle="读取设定页面下所有设定条目，勾选后作为本次 AI 请求的参考上下文。"
      isOpen={isOpen}
      onClose={onClose}
      widthClass={ASSOCIATION_READER_MODAL_WIDTH_CLASS}
      heightClass={ASSOCIATION_READER_MODAL_HEIGHT_CLASS}
      storageId="other_setting_reader"
    >

        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`h-9 rounded-xl border px-3 text-sm font-black transition-colors ${
                selectedTab?.id === tab.id
                  ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
              }`}
            >
              {tab.title}
            </button>
          ))}
          <button
            type="button"
            onClick={onSelectAllCurrentTab}
            disabled={!selectedTab?.groups.some((group) => group.entries.length > 0)}
            className="ml-auto h-9 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            关联所有
          </button>
          <label className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="搜索设定条目"
              className="h-9 w-full rounded-xl border border-gray-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
            />
          </label>
        </div>

        <div className={ASSOCIATION_READER_GRID_CLASS}>
          <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">
            {visibleGroups.length === 0 ? (
              <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm font-bold text-gray-400">
                暂无匹配设定
              </div>
            ) : (
              visibleGroups.map((group) => (
                <section key={group.name} className="mb-3">
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-2 text-sm font-black text-slate-800">
                    <Folder className="h-4 w-4 text-[#08AACE]" />
                    <span className="min-w-0 flex-1 truncate">{group.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleGroupSelection(group.entries)}
                      className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                    >
                      全选
                    </button>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                      {group.entries.length}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {group.entries.map((entry) => {
                      const selected = selectedEntry?.id === entry.id;
                      const linked = draftIds.has(entry.id);
                      return (
                        <AssociationReaderItemRow
                          key={entry.id}
                          title={entry.title}
                          selected={selected}
                          checked={linked}
                          meta={`${entry.wordCount}字`}
                          onPreview={() => onPreviewEntry(entry.id)}
                          onToggle={() => onToggleEntry(entry.id)}
                        />
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </aside>

          <main className="editor-scrollbar min-h-0 overflow-y-auto p-6">
            {selectedEntry ? (
              <article className="flex min-h-full flex-col">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-2xl font-black text-gray-900">{selectedEntry.title}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${
                      draftIds.has(selectedEntry.id)
                        ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {draftIds.has(selectedEntry.id) ? '已勾选' : '未勾选'}
                  </span>
                </div>
                <div className="min-h-[360px] flex-1 whitespace-pre-wrap rounded-2xl border-2 border-slate-900 bg-white p-5 text-sm font-bold leading-8 text-slate-600">
                  {selectedEntry.text || '暂无内容'}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                请选择左侧设定后查看完整内容
              </div>
            )}
          </main>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            已选 {draftEntries.length} 项 · 共 {draftWordCount} 字
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClearDraft}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              清空
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-[#08AACE] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0796B8]"
            >
              确认关联
            </button>
          </div>
        </div>
    </WorkbenchModal>
  );
}
