import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
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

function getOutlineAiLogFillGroupWeights(options: {
  hasReaderContext: boolean;
  hasContext: boolean;
  hasUser: boolean;
}): Record<string, number> {
  const hasReference = options.hasReaderContext || options.hasContext;
  if (hasReference) {
    return {
      prompt: 1,
      ...(options.hasReaderContext ? { 'reader-context': 1 } : {}),
      ...(options.hasContext ? { context: 1 } : {}),
      ...(options.hasUser ? { user: 1 } : {}),
    };
  }
  if (options.hasUser) return { prompt: 2, user: 1 };
  return { prompt: 1 };
}

export function OutlineAiLogModal({
  activeTab,
  requestLog,
  isDetailOutlineTab,
  plotPointStandalone,
  shouldShowOutlineBodyContext,
  outlineUserLogTitle,
  onClose,
}: OutlineAiLogModalProps) {
  const fillGroupWeights = getOutlineAiLogFillGroupWeights({
    hasReaderContext: Boolean(requestLog.readerContextText?.trim()),
    hasContext: Boolean(shouldShowOutlineBodyContext && requestLog.contextText?.trim()),
    hasUser: Boolean(requestLog.userContent.trim()),
  });

  return (
    <LibraryAiLogShell
      id={`workbench_library_ai_log_${activeTab}`}
      subtitle="当前预览：点击发送后会按这里的内容发给 AI"
      onClose={onClose}
    >
      <AiRequestLogModalLayout
        metaItems={[
          { id: 'chain', label: '链路', value: requestLog.tab },
          { id: 'model', label: '模型', value: requestLog.modelName },
          { id: 'prompt', label: '提示词', value: requestLog.promptName },
          {
            id: 'context',
            label: '关联正文',
            value: (
              <>
                <div>{requestLog.contextTitle}</div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  <WordCountText value={requestLog.contextWordCount ?? 0} />
                </div>
              </>
            ),
            valueClassName: 'text-brand',
            hidden: !shouldShowOutlineBodyContext || !requestLog.contextText?.trim(),
          },
          {
            id: 'reader-context',
            label: '关联资料',
            value: (
              <>
                <div>{requestLog.readerContextTitle}</div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  <WordCountText value={requestLog.readerContextWordCount ?? 0} />
                </div>
              </>
            ),
            valueClassName: 'text-brand',
            hidden: !isDetailOutlineTab || !requestLog.readerContextText?.trim(),
          },
          {
            id: 'user',
            label: outlineUserLogTitle,
            value: requestLog.visibleUserText,
            hidden: !requestLog.visibleUserText.trim(),
          },
        ]}
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
        fillGroupWeights={fillGroupWeights}
        storageKey={`workbench_library_ai_log_${activeTab}_groups`}
      />
    </LibraryAiLogShell>
  );
}
