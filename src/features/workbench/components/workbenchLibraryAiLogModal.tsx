import { Folder } from 'lucide-react';

import { AiRequestLogContent, AiRequestLogGroups, type AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
import type {
  SettingImportFormatEntry,
  SettingImportFormatPreviewScope,
  SettingImportFormatTab,
  SettingImportFormatTabId,
} from './workbenchStructuredSettings';
import { SETTING_IMPORT_FORMAT_PREVIEW_SCOPES } from './workbenchStructuredSettings';
import type { LibraryAiRequestLog } from './workbenchLibraryRequestLog';
import { LibraryAiLogShell } from './workbenchLibraryAiLogShell';
import { SettingImportFormatPreviewText } from './workbenchSettingImportFormatPreview';
import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';

export const LIBRARY_AI_LOG_VIEW_TABS = ['输出日志', '格式'] as const;
export type LibraryAiLogViewTab = (typeof LIBRARY_AI_LOG_VIEW_TABS)[number];

type LibraryAiLogModalProps = {
  id: string;
  activeViewTab: LibraryAiLogViewTab;
  formatTabs: SettingImportFormatTab[];
  activeFormatTab?: SettingImportFormatTab;
  selectedFormatEntry: SettingImportFormatEntry | null;
  settingImportFormatPreview: string;
  settingImportFormatPreviewScope: SettingImportFormatPreviewScope;
  visibleAiRequestLog: LibraryAiRequestLog | null;
  visibleAiRequestLogGroups: AiRequestLogGroup[];
  visibleAiRequestLogPlainPreview: string;
  showLibraryAiLogTitles: boolean;
  userTextTitle: string;
  onClose: () => void;
  onViewTabChange: (tab: LibraryAiLogViewTab) => void;
  onFormatTabChange: (tabId: SettingImportFormatTabId) => void;
  onFormatEntryChange: (entryId: string) => void;
  onFormatPreviewScopeChange: (scope: SettingImportFormatPreviewScope) => void;
  onShowLibraryAiLogTitlesChange: (value: boolean) => void;
};

export function LibraryAiLogModal({
  id,
  activeViewTab,
  formatTabs,
  activeFormatTab,
  selectedFormatEntry,
  settingImportFormatPreview,
  settingImportFormatPreviewScope,
  visibleAiRequestLog,
  visibleAiRequestLogGroups,
  visibleAiRequestLogPlainPreview,
  showLibraryAiLogTitles,
  userTextTitle,
  onClose,
  onViewTabChange,
  onFormatTabChange,
  onFormatEntryChange,
  onFormatPreviewScopeChange,
  onShowLibraryAiLogTitlesChange,
}: LibraryAiLogModalProps) {
  return (
    <LibraryAiLogShell
      id={id}
      subtitle={activeViewTab === '格式' ? '查看智能导入能识别的标签、分组、条目和子设定格式' : '当前预览：点击发送后会按这里的内容发给 AI'}
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4">
            {activeViewTab === '格式' && (
              <>
                {formatTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onFormatTabChange(tab.id)}
                    className={`h-9 min-w-[104px] shrink-0 rounded-lg px-4 text-sm font-black transition-colors ${
                      activeFormatTab?.id === tab.id
                        ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                        : 'border border-gray-200 bg-white text-slate-600 hover:border-cyan-100 hover:bg-[#F8FEFF] hover:text-[#08AACE]'
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </>
            )}
          </div>
          <SettingSegmentedTabs
            tabs={LIBRARY_AI_LOG_VIEW_TABS}
            activeTab={activeViewTab}
            onChange={onViewTabChange}
          />
        </div>
        {activeViewTab === '输出日志' ? (
          visibleAiRequestLog ? (
            <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
              <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
                <div className="space-y-3">
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">链路</div>
                    <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.tab}生成</div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">模型</div>
                    <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.modelName}</div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">提示词</div>
                    <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.promptName}</div>
                  </div>
                  {visibleAiRequestLog.visibleUserText.trim() && (
                    <div className="rounded-xl bg-white p-3">
                      <div className="text-xs text-slate-400">{userTextTitle}</div>
                      <div className="mt-1 break-words font-bold text-slate-800">{visibleAiRequestLog.visibleUserText}</div>
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={showLibraryAiLogTitles}
                      onChange={(event) => onShowLibraryAiLogTitlesChange(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                    />
                    <span>显示标题内容</span>
                  </label>
                </div>
              </aside>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
                {showLibraryAiLogTitles ? (
                  <AiRequestLogGroups groups={visibleAiRequestLogGroups} fillSingleGroup />
                ) : (
                  <div className="ai-request-log-text min-h-0 flex-1 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                    {visibleAiRequestLogPlainPreview ? <AiRequestLogContent content={visibleAiRequestLogPlainPreview} /> : '暂无可预览内容'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
              暂无输出日志
            </div>
          )
        ) : selectedFormatEntry ? (
          <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
            <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {activeFormatTab?.groups.map((group) => (
                  <section key={group.name}>
                    <div className="flex h-9 items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#EAF9FD] px-2 text-sm font-black text-slate-900">
                      <Folder className="h-4 w-4 text-[#08AACE]" />
                      <span className="min-w-0 flex-1 truncate">{group.name}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.entries.length}</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {group.entries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onFormatEntryChange(entry.id)}
                          className={`flex min-h-[34px] w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-black transition-colors ${
                            selectedFormatEntry.id === entry.id
                              ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                              : 'bg-white text-slate-700 hover:bg-[#F8FEFF]'
                          }`}
                        >
                          <span className="min-w-0 truncate">{entry.title}</span>
                          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-[#08AACE]">{entry.fields.length}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </aside>
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-5">
              <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#08AACE]">
                    <span>{selectedFormatEntry.tabTitle}</span>
                    <span>/</span>
                    <span>{selectedFormatEntry.groupName}</span>
                  </div>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedFormatEntry.title}</h3>
                </div>
                <span className="rounded-xl border border-cyan-200 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#08AACE]">格式预览</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-900 bg-white p-4">
                <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">可复制格式</div>
                  <div className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {SETTING_IMPORT_FORMAT_PREVIEW_SCOPES.map((scope, index) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => onFormatPreviewScopeChange(scope)}
                        className={`min-w-[76px] px-3 text-xs font-black transition-colors ${index === 0 ? '' : 'border-l border-gray-200'} ${
                          settingImportFormatPreviewScope === scope
                            ? 'bg-[#EAF9FD] text-[#08AACE]'
                            : 'bg-white text-slate-500 hover:bg-[#F8FEFF] hover:text-[#08AACE]'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
                <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-[#FBFCFE] p-4 text-sm font-semibold leading-7 text-slate-800">
                  <SettingImportFormatPreviewText content={settingImportFormatPreview} />
                </pre>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
            暂无格式内容
          </div>
        )}
      </div>
    </LibraryAiLogShell>
  );
}
