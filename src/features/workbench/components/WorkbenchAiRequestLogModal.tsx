import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { WordCountText } from '@/shared/ui/WordCountText';
import { WorkbenchModal } from './WorkbenchModal';
import { getBodyAiLogFillGroupWeights, getTextWordCount, type WorkbenchAiRequestLog } from './workbenchAiPanelSupport';

export function WorkbenchAiRequestLogModal({
  isOpen,
  log,
  chapterContextLabel,
  onClose,
}: {
  isOpen: boolean;
  log: WorkbenchAiRequestLog;
  chapterContextLabel: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const visibleRequestLog = log;
  return (
    <WorkbenchModal
      title="输出日志"
      isOpen
      onClose={onClose}
      storageId="workbench_ai_request_log"
      widthClass="w-[min(1120px,94vw)]"
      heightClass="h-[min(820px,88vh)]"
      closeOnBackdrop={false}
    >
      <AiRequestLogModalLayout
        metaItems={[
          { id: 'chain', label: '链路', value: '作品编辑器 AI' },
          { id: 'model', label: '模型', value: visibleRequestLog.modelName },
          { id: 'prompt', label: '提示词', value: visibleRequestLog.promptName },
          {
            id: 'context-source',
            label: '资料来源',
            value: log.linkedItems.length > 0 ? `关联资料 · ${log.linkedItems.length}项` : `${chapterContextLabel}内容`,
            valueClassName: 'text-brand',
            hidden: !log.contextText.trim(),
          },
          {
            id: 'context-words',
            label: '资料字数',
            value: <WordCountText value={log.contextWordCount} />,
            hidden: !log.contextText.trim(),
          },
          { id: 'user', label: '用户可见输入', value: log.visibleUserContent, hidden: !log.visibleUserContent.trim() },
        ]}
        groups={[
          {
            id: 'prompt',
            title: '提示词',
            meta: `${getTextWordCount(log.systemPrompt)} 字`,
            content: log.systemPrompt,
          },
          { id: 'context', title: '资料', meta: `${log.contextWordCount} 字`, content: log.contextText, tone: 'cyan' },
          {
            id: 'user',
            title: '用户要求',
            meta: `${getTextWordCount(log.userContent)} 字`,
            content: visibleRequestLog.visibleUserContent.trim() ? visibleRequestLog.userContent : '',
            tone: 'amber',
          },
        ]}
        fillSingleGroup
        fillGroupWeights={getBodyAiLogFillGroupWeights(log)}
        storageKey="workbench_ai_request_log_groups"
      />
    </WorkbenchModal>
  );
}
