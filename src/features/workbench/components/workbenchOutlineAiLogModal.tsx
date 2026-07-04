import { AiRequestLogGroups } from '@/shared/ui/AiRequestLogGroups';
import { WordCountText } from '@/shared/ui/WordCountText';

import { LibraryAiLogShell } from './workbenchLibraryAiLogShell';
import { buildLibraryLogGroups, type LibraryAiRequestLog } from './workbenchLibraryRequestLog';

type OutlineAiLogModalProps = {
  activeTab: string;
  requestLog: LibraryAiRequestLog;
  isDetailOutlineTab: boolean;
  plotPointStandalone: boolean;
  shouldShowOutlineBodyContext: boolean;
  outlineUserLogTitle: string;
  onClose: () => void;
};

export function OutlineAiLogModal({
  activeTab,
  requestLog,
  isDetailOutlineTab,
  plotPointStandalone,
  shouldShowOutlineBodyContext,
  outlineUserLogTitle,
  onClose,
}: OutlineAiLogModalProps) {
  return (
    <LibraryAiLogShell
      id={`workbench_library_ai_log_${activeTab}`}
      subtitle="当前预览：点击发送后会按这里的内容发给 AI"
      onClose={onClose}
    >
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
          <div className="space-y-3">
            <div className="rounded-xl bg-white p-3">
              <div className="text-xs text-slate-400">链路</div>
              <div className="mt-1 font-bold text-slate-800">{requestLog.tab}</div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="text-xs text-slate-400">模型</div>
              <div className="mt-1 font-bold text-slate-800">{requestLog.modelName}</div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="text-xs text-slate-400">提示词</div>
              <div className="mt-1 font-bold text-slate-800">{requestLog.promptName}</div>
            </div>
            {shouldShowOutlineBodyContext && requestLog.contextText?.trim() && (
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs text-slate-400">关联正文</div>
                <div className="mt-1 font-bold text-brand">{requestLog.contextTitle}</div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  <WordCountText value={requestLog.contextWordCount ?? 0} />
                </div>
              </div>
            )}
            {isDetailOutlineTab && requestLog.readerContextText?.trim() && (
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs text-slate-400">关联资料</div>
                <div className="mt-1 font-bold text-brand">{requestLog.readerContextTitle}</div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  <WordCountText value={requestLog.readerContextWordCount ?? 0} />
                </div>
              </div>
            )}
            {requestLog.visibleUserText.trim() && (
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs text-slate-400">{outlineUserLogTitle}</div>
                <div className="mt-1 break-words font-bold text-slate-800">{requestLog.visibleUserText}</div>
              </div>
            )}
          </div>
        </aside>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
          <AiRequestLogGroups
            groups={buildLibraryLogGroups(requestLog, {
              includeContext: shouldShowOutlineBodyContext,
              includeReaderContext: isDetailOutlineTab,
              readerTitle: '关联资料',
              readerEmptyText: '未关联章纲、设定或角色',
              userTitle: outlineUserLogTitle,
              expandReaderContextContent: plotPointStandalone,
              expandAllContent: plotPointStandalone,
            })}
            fillSingleGroup
          />
        </div>
      </div>
    </LibraryAiLogShell>
  );
}
