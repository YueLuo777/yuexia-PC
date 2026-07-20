import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import {
  createAiThinkingPlaceholder,
  createReviewLogSection,
  formatAiThinkingResponse,
} from '@/features/workbench/model/chapterReviewLog';
import {
  beginReviewModeRequest,
  REVIEW_MODE_TITLES,
  writeReviewBackgroundTaskId,
  type ReviewMode,
  type ReviewModeState,
} from '@/features/workbench/model/chapterReviewTaskState';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { startBackgroundAiTask, stopBackgroundAiTask } from '@/shared/ai/backgroundAiTasks';

import {
  AUDIT_STRUCTURE_PROMPT_FORMAT,
  REVIEW_MODE_DEFAULT_INSTRUCTIONS,
} from '../components/chapterEditorReviewConfig';
import { countCompactWords, getAuditPromptSubcategory } from '../components/chapterEditorPresentation';

interface UseChapterReviewRequestOptions {
  reviewMode: ReviewMode;
  activeReviewState: ReviewModeState;
  updateReviewModeState: (mode: ReviewMode, updater: (state: ReviewModeState) => ReviewModeState) => void;
  isReviewAiLoading: boolean;
  setIsReviewAiLoading: (loading: boolean) => void;
  activeReviewChapter: Chapter | null;
  activeReviewModel: ModelItem | null;
  activeReviewPrompt: PromptItem | null;
  activeReviewDetailOutline: WorkbenchLibraryEntry | null;
  activeReviewContent: string;
  activeReviewWordCount: number;
  reviewAiInput: string;
  settingsStorageKey: string;
}

export function useChapterReviewRequest({
  reviewMode,
  activeReviewState,
  updateReviewModeState,
  isReviewAiLoading,
  setIsReviewAiLoading,
  activeReviewChapter,
  activeReviewModel,
  activeReviewPrompt,
  activeReviewDetailOutline,
  activeReviewContent,
  activeReviewWordCount,
  reviewAiInput,
  settingsStorageKey,
}: UseChapterReviewRequestOptions) {
  const buildReviewPayload = () => {
    const modeTitle = REVIEW_MODE_TITLES[reviewMode];
    const modeInstruction = REVIEW_MODE_DEFAULT_INSTRUCTIONS[reviewMode];
    const basePromptText = activeReviewPrompt?.content?.trim() || modeInstruction;
    const auditSubcategory = getAuditPromptSubcategory(activeReviewPrompt);
    const isTextAudit = reviewMode === 'audit' && auditSubcategory === '文本审核';
    const isStructureAudit = reviewMode === 'audit' && auditSubcategory === '剧情审核';
    const bodyTag =
      reviewMode === 'audit' ? '待剧情审核正文' : reviewMode === 'comment' ? '待点评正文' : '待文笔润色正文';
    const requirementTag =
      reviewMode === 'audit' ? '剧情审核要求' : reviewMode === 'comment' ? '点评要求' : '文笔润色要求';
    const compareInstruction = isStructureAudit
      ? [
          '这是剧情审核，不要输出修改后全文，不要润色文字，不要改写正文。',
          '必须严格使用下面的软件固定格式；不要新增、删除、改名审核项。',
          AUDIT_STRUCTURE_PROMPT_FORMAT,
        ].join('\n')
      : [
          '如果你需要修改正文，请务必额外输出一个独立区块：',
          '【修改后全文】',
          '这里放完整修改后的正文，只放正文，不要夹杂点评说明。',
          isTextAudit
            ? [
                '文本审核必须保持和原文相同的段落数量；每一段只能对应修改原文同序号段落，不要合并段落，不要拆分段落。',
                '如果认为某一整段应删除，请保留该段位置为空段，不要让后续段落前移；软件会在左右对照中显示“整段已删除”。',
                '软件会自动把审核后新增或改写的字句标成红色，请不要自行添加 HTML、Markdown 标记或颜色说明。',
              ].join('\n')
            : '',
          '【修改说明】',
          '这里再说明具体修改原因。',
          isTextAudit
            ? '每个被修改段落单独一行，格式为“第N段｜修改类型：修改原因”；修改类型使用“重复表达、表达优化、句式精简、文字修正”，未修改段落不要输出说明。'
            : '',
          reviewMode === 'polish' ? '文笔润色只能优化表达，不要改变剧情事件、人物行动、设定信息和章节结果。' : '',
          '这样用户可以在软件中按段落对比并逐段确认替换。',
        ]
          .filter(Boolean)
          .join('\n');
    const promptText = [basePromptText, compareInstruction].filter(Boolean).join('\n\n');
    const userRequirementText = reviewAiInput.trim();
    const userText = userRequirementText ? wrapAiRequestTag(requirementTag, userRequirementText) : '';
    const chapterTitle = activeReviewChapter
      ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
      : '未选择章节';
    const detailOutlineText = activeReviewDetailOutline?.content?.trim() || '';
    const originalText = activeReviewContent.trim();
    const chapterContext = joinAiRequestSections([
      detailOutlineText
        ? wrapAiRequestTag('关联章纲', detailOutlineText, { 标题: activeReviewDetailOutline?.title || '未命名章节' })
        : '',
      wrapAiRequestTag(bodyTag, originalText, { 标题: chapterTitle, 模式: modeTitle }),
    ]);
    const requestLogMeta = [
      `模式：${modeTitle}`,
      reviewMode === 'audit' ? `审核类型：${auditSubcategory}` : '',
      `模型：${activeReviewModel?.name ?? '未选择模型'}`,
      `提示词：${activeReviewPrompt?.name ?? '未选择提示词，使用内置默认提示词'}`,
      `章节：${chapterTitle}`,
      `正文：${activeReviewWordCount} 字`,
      detailOutlineText
        ? `关联章纲：${activeReviewDetailOutline?.title ?? '未命名章节'}（${countCompactWords(detailOutlineText)} 字）`
        : '',
    ].filter(Boolean);
    const requestLog = [
      ...requestLogMeta,
      '',
      createReviewLogSection('系统提示词', promptText),
      createReviewLogSection('关联章纲', detailOutlineText || '未读取到关联章纲'),
      createReviewLogSection('原文', originalText || '暂无正文'),
      ...(userText ? [createReviewLogSection('其他要求', userText)] : []),
      createReviewLogSection('发送上下文', chapterContext),
    ].join('\n');
    return { promptText, userText, chapterContext, requestLog, isStructureAudit };
  };

  const sendReviewAiMessage = async () => {
    if (isReviewAiLoading) return;
    const requestMode = reviewMode;
    const updateRequestReviewState = (updater: (state: ReviewModeState) => ReviewModeState) => {
      updateReviewModeState(requestMode, updater);
    };
    const setRequestReviewOutput = (value: string | ((current: string) => string)) => {
      updateRequestReviewState((state) => ({
        ...state,
        output: typeof value === 'function' ? value(state.output) : value,
      }));
    };
    if (!activeReviewChapter) {
      setRequestReviewOutput(`【错误】请先选择需要${REVIEW_MODE_TITLES[requestMode]}的章节。`);
      return;
    }
    if (!activeReviewModel) {
      setRequestReviewOutput('【错误】尚未配置可用模型，请先到模型管理中新增并启用模型。');
      return;
    }
    const { promptText, userText, chapterContext, requestLog, isStructureAudit } = buildReviewPayload();
    const pendingOutput = isStructureAudit ? createAiThinkingPlaceholder(0) : '正在思考...';
    const task = startBackgroundAiTask({
      kind: requestMode === 'polish' ? 'polish' : 'review',
      title: `${REVIEW_MODE_TITLES[requestMode]}：${activeReviewChapter.title || `第${activeReviewChapter.serialNumber}章`}`,
      input: userText,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'chapterReview',
        settingsStorageKey,
        mode: requestMode,
        chapterId: activeReviewChapter.id,
        requestLog,
      },
      runner: async ({ signal, emit }) => {
        let answer = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          answer = await callModelStream({
            model: activeReviewModel,
            prompt: promptText,
            userContent: userText,
            chapterContext,
            recordType: 'stream',
            signal,
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
            onChunk: (chunk) => {
              answer += chunk;
              emit(formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
          });
          return reasoningContent.trim()
            ? formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), true)
            : answer;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    writeReviewBackgroundTaskId(settingsStorageKey, activeReviewChapter.id, requestMode, task.id);
    setIsReviewAiLoading(true);
    updateRequestReviewState((state) =>
      beginReviewModeRequest(state, {
        requestLog,
        output: pendingOutput,
        backgroundTaskId: task.id,
      }),
    );
  };

  const stopReviewAiMessage = () => {
    if (activeReviewState.backgroundTaskId) stopBackgroundAiTask(activeReviewState.backgroundTaskId);
    setIsReviewAiLoading(false);
  };

  return { sendReviewAiMessage, stopReviewAiMessage };
}
