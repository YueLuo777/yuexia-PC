import type { ModelItem } from '@/features/models/model/modelTypes';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { WorkbenchModal } from './WorkbenchModal';
import { countCompactWords } from './chapterEditorPresentation';
import { getReviewLogFillGroupWeights, getReviewLogSection } from '../model/chapterReviewLog';

export function ChapterReviewLogModal({
  isOpen,
  activeReviewModeTitle,
  reviewRequestLog,
  activeReviewModel,
  activeReviewPrompt,
  chapter,
  onClose,
}: {
  isOpen: boolean;
  activeReviewModeTitle: string;
  reviewRequestLog: string;
  activeReviewModel: ModelItem | null;
  activeReviewPrompt: PromptItem | null;
  chapter: Chapter | null;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const outline = getReviewLogSection(reviewRequestLog, '关联章纲');
  const user = getReviewLogSection(reviewRequestLog, '其他要求');
  return (
    <WorkbenchModal
      title="输出日志"
      isOpen
      onClose={onClose}
      storageId="chapter_editor_review_request_log"
      widthClass="w-[min(1120px,94vw)]"
      heightClass="h-[min(820px,88vh)]"
      closeOnBackdrop={false}
    >
      <AiRequestLogModalLayout
        metaItems={[
          { id: 'chain', label: '链路', value: `作品编辑器 ${activeReviewModeTitle}` },
          { id: 'model', label: '模型', value: activeReviewModel?.name ?? '未选择模型' },
          { id: 'prompt', label: '提示词', value: activeReviewPrompt?.name ?? '默认提示词' },
          {
            id: 'chapter',
            label: '当前章节',
            value: chapter ? `第${chapter.serialNumber}章` : '未选择章节',
            hidden: !chapter,
          },
          {
            id: 'outline',
            label: '关联章纲',
            value: `${countCompactWords(outline)} 字`,
            valueClassName: 'text-brand',
            hidden: !outline.trim(),
          },
          { id: 'user', label: '其他要求', value: user, hidden: !user.trim() },
        ]}
        groups={
          reviewRequestLog
            ? [
                {
                  id: 'prompt',
                  title: '提示词',
                  meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '系统提示词'))} 字`,
                  content: getReviewLogSection(reviewRequestLog, '系统提示词'),
                },
                {
                  id: 'outline',
                  title: '关联章纲',
                  meta: `${countCompactWords(outline)} 字`,
                  content: outline,
                  tone: 'cyan' as const,
                },
                {
                  id: 'original',
                  title: '原文',
                  meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '原文'))} 字`,
                  content: getReviewLogSection(reviewRequestLog, '原文'),
                  tone: 'cyan' as const,
                },
                ...(user.trim()
                  ? [
                      {
                        id: 'user',
                        title: '其他要求',
                        meta: `${countCompactWords(user)} 字`,
                        content: user,
                        tone: 'amber' as const,
                      },
                    ]
                  : []),
              ]
            : []
        }
        fillSingleGroup
        fillGroupWeights={getReviewLogFillGroupWeights({ hasOutline: !!outline.trim(), hasUser: !!user.trim() })}
        storageKey="chapter_editor_review_request_log_groups"
        emptyText={`还没有发送${activeReviewModeTitle}请求。`}
      />
    </WorkbenchModal>
  );
}
