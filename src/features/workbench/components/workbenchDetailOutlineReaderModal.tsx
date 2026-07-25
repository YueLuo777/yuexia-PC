import { Folder, FolderOpen } from 'lucide-react';

import { WordCountText } from '@/shared/ui/WordCountText';
import {
  ASSOCIATION_READER_MODAL_HEIGHT_CLASS,
  ASSOCIATION_READER_MODAL_WIDTH_CLASS,
  AssociationReaderItemRow,
} from './AssociationReaderItemRow';
import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from './workbenchLibraryPanelConstants';
import { WorkbenchModal } from './WorkbenchModal';

export type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines';

export type DetailOutlineReaderItem = {
  id: string;
  title: string;
  group: string;
  content: string;
};

export type DetailOutlineReaderGroup = {
  group: string;
  items: DetailOutlineReaderItem[];
};

type DetailOutlineReaderModalProps = {
  isDetailOutlineReaderOpen: boolean;
  isDetailOutlineTab: boolean;
  detailOutlineReaderTab: DetailOutlineReaderTab;
  activeDetailOutlineReaderItems: DetailOutlineReaderItem[];
  detailOutlineReaderNavGroups: DetailOutlineReaderGroup[];
  collapsedDetailOutlineReaderGroups: Record<string, boolean>;
  draftDetailOutlineReaderSettingIds: Set<string>;
  draftDetailOutlineReaderRoleIds: Set<string>;
  draftDetailOutlineReaderOutlineIds: Set<string>;
  activeDetailOutlineReaderPreviewItem: DetailOutlineReaderItem | null;
  isActiveDetailOutlineReaderPreviewChecked: boolean;
  draftDetailOutlineReaderItems: DetailOutlineReaderItem[];
  draftDetailOutlineReaderWordCount: number;
  detailOutlineReaderSettingItems: DetailOutlineReaderItem[];
  detailOutlineReaderRoleItems: DetailOutlineReaderItem[];
  setIsDetailOutlineReaderOpen: (isOpen: boolean) => void;
  setDetailOutlineReaderTab: (tab: DetailOutlineReaderTab) => void;
  setDetailOutlineReaderPreviewId: (id: string) => void;
  selectAllActiveDetailOutlineReaderItems: () => void;
  toggleDetailOutlineReaderGroup: (group: string) => void;
  toggleActiveDetailOutlineReaderGroupSelection: (items: DetailOutlineReaderItem[]) => void;
  toggleDraftDetailOutlineReaderSetting: (id: string) => void;
  toggleDraftDetailOutlineReaderRole: (id: string) => void;
  toggleDraftDetailOutlineReaderOutline: (id: string) => void;
  clearDraftDetailOutlineReader: () => void;
  confirmDetailOutlineReader: () => void;
};

export function DetailOutlineReaderModal({
  isDetailOutlineReaderOpen,
  isDetailOutlineTab,
  detailOutlineReaderTab,
  activeDetailOutlineReaderItems,
  detailOutlineReaderNavGroups,
  collapsedDetailOutlineReaderGroups,
  draftDetailOutlineReaderSettingIds,
  draftDetailOutlineReaderRoleIds,
  draftDetailOutlineReaderOutlineIds,
  activeDetailOutlineReaderPreviewItem,
  isActiveDetailOutlineReaderPreviewChecked,
  draftDetailOutlineReaderItems,
  draftDetailOutlineReaderWordCount,
  detailOutlineReaderSettingItems,
  detailOutlineReaderRoleItems,
  setIsDetailOutlineReaderOpen,
  setDetailOutlineReaderTab,
  setDetailOutlineReaderPreviewId,
  selectAllActiveDetailOutlineReaderItems,
  toggleDetailOutlineReaderGroup,
  toggleActiveDetailOutlineReaderGroupSelection,
  toggleDraftDetailOutlineReaderSetting,
  toggleDraftDetailOutlineReaderRole,
  toggleDraftDetailOutlineReaderOutline,
  clearDraftDetailOutlineReader,
  confirmDetailOutlineReader,
}: DetailOutlineReaderModalProps) {
  if (!isDetailOutlineReaderOpen || !isDetailOutlineTab) return null;

  return (
    <WorkbenchModal
      title="关联资料"
      subtitle="勾选后会作为本次生成章纲的参考资料。"
      isOpen={isDetailOutlineReaderOpen && isDetailOutlineTab}
      onClose={() => setIsDetailOutlineReaderOpen(false)}
      widthClass={ASSOCIATION_READER_MODAL_WIDTH_CLASS}
      heightClass={ASSOCIATION_READER_MODAL_HEIGHT_CLASS}
      storageId="detail_outline_reader"
      panelClassName="adjustment-crisp text-slate-900"
    >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
          {(
            [
              ['outlines', '章纲'],
              ['settings', '设定'],
              ['roles', '角色'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setDetailOutlineReaderTab(tab);
                setDetailOutlineReaderPreviewId('');
              }}
              className={`h-9 rounded-xl border px-3 text-sm font-black transition-colors ${
                detailOutlineReaderTab === tab
                  ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={selectAllActiveDetailOutlineReaderItems}
            disabled={activeDetailOutlineReaderItems.length === 0}
            className="ml-auto h-9 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            关联所有
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_280px] bg-white">
          <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">
            <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
              {detailOutlineReaderNavGroups.length === 0 ? (
                <div className="rounded-xl bg-white px-3 py-4 text-xs font-bold leading-5 text-slate-400">
                  {detailOutlineReaderTab === 'settings'
                    ? '暂无设定分组'
                    : detailOutlineReaderTab === 'roles'
                      ? '暂无角色分组'
                      : '当前章节前面暂无可读章纲'}
                </div>
              ) : (
                detailOutlineReaderNavGroups.map((group) => {
                  const collapsed =
                    collapsedDetailOutlineReaderGroups[`${detailOutlineReaderTab}:${group.group}`] ?? false;
                  const GroupFolderIcon = collapsed ? Folder : FolderOpen;
                  return (
                    <div key={group.group} className="rounded-md">
                      <button
                        type="button"
                        onClick={() => toggleDetailOutlineReaderGroup(group.group)}
                        className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                        aria-expanded={!collapsed}
                      >
                        <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                        <span className="min-w-0 flex-1 truncate leading-none">{group.group}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleActiveDetailOutlineReaderGroupSelection(group.items);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              event.preventDefault();
                              event.stopPropagation();
                              toggleActiveDetailOutlineReaderGroupSelection(group.items);
                            }}
                            className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                          >
                            全选
                          </span>
                          <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.items.length}</span>
                        </span>
                      </button>
                      {!collapsed && (
                        <div className="mt-1 space-y-1 bg-white">
                          {group.items.map((item) => {
                                const checked =
                                  detailOutlineReaderTab === 'settings'
                                    ? draftDetailOutlineReaderSettingIds.has(item.id)
                                    : detailOutlineReaderTab === 'roles'
                                      ? draftDetailOutlineReaderRoleIds.has(item.id)
                                      : draftDetailOutlineReaderOutlineIds.has(item.id);
                            return (
                              <AssociationReaderItemRow
                                key={item.id}
                                title={item.title}
                                selected={activeDetailOutlineReaderPreviewItem?.id === item.id}
                                checked={checked}
                                onPreview={() => setDetailOutlineReaderPreviewId(item.id)}
                                onToggle={() => {
                                  if (detailOutlineReaderTab === 'settings')
                                    toggleDraftDetailOutlineReaderSetting(item.id);
                                  else if (detailOutlineReaderTab === 'roles')
                                    toggleDraftDetailOutlineReaderRole(item.id);
                                  else toggleDraftDetailOutlineReaderOutline(item.id);
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
          <main className="editor-scrollbar min-h-0 overflow-y-auto p-6">
            {activeDetailOutlineReaderPreviewItem ? (
              <article className="flex min-h-full flex-col text-gray-600">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#08AACE]">
                      {detailOutlineReaderTab === 'settings'
                        ? '设定'
                        : detailOutlineReaderTab === 'roles'
                          ? '角色'
                          : '章纲'}{' '}
                      / {activeDetailOutlineReaderPreviewItem.group}
                    </div>
                    <h4 className="mt-1 truncate text-2xl font-black text-slate-900">
                      {activeDetailOutlineReaderPreviewItem.title}
                    </h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${
                      isActiveDetailOutlineReaderPreviewChecked
                        ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {isActiveDetailOutlineReaderPreviewChecked ? '已勾选' : '未勾选'}
                  </span>
                </div>
                <div className="min-h-[360px] flex-1 whitespace-pre-wrap break-words rounded-2xl border-2 border-slate-900 bg-white p-5 text-sm font-bold leading-8 text-slate-600">
                  {activeDetailOutlineReaderPreviewItem.content || '暂无内容'}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                {detailOutlineReaderTab === 'settings'
                  ? '暂无可关联设定'
                  : detailOutlineReaderTab === 'roles'
                    ? '暂无可关联角色'
                    : '暂无可关联章纲'}
              </div>
            )}
          </main>
          <aside className="editor-scrollbar min-h-0 overflow-y-auto border-l border-gray-100 bg-cyan-50 p-4">
            <div className="mb-3 text-sm font-black text-[#08AACE]">本次将读取</div>
            <div className="space-y-2">
              {draftDetailOutlineReaderItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-cyan-200 bg-white p-4 text-center text-xs font-bold leading-5 text-slate-400">
                  还没有选择关联资料
                </div>
              ) : (
                draftDetailOutlineReaderItems.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setDetailOutlineReaderTab(
                        detailOutlineReaderSettingItems.some((item) => item.id === entry.id)
                          ? 'settings'
                          : detailOutlineReaderRoleItems.some((item) => item.id === entry.id)
                            ? 'roles'
                            : 'outlines',
                      );
                      setDetailOutlineReaderPreviewId(entry.id);
                    }}
                    className="w-full rounded-xl bg-white px-3 py-2 text-left shadow-sm transition-colors hover:bg-[#F8FEFF]"
                  >
                    <div className="truncate text-sm font-black text-slate-800">{entry.title}</div>
                    <div className="mt-1 truncate text-xs font-bold text-slate-400">{entry.group}</div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            将读取 {draftDetailOutlineReaderItems.length} 项，共{' '}
            <WordCountText value={draftDetailOutlineReaderWordCount} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={clearDraftDetailOutlineReader}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => setIsDetailOutlineReaderOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmDetailOutlineReader}
              className="rounded-xl bg-[#08AACE] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0798b8]"
            >
              确认读取
            </button>
          </div>
        </div>
    </WorkbenchModal>
  );
}
