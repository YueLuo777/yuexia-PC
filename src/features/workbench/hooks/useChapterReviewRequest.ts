import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import {
  createAiThinkingPlaceholder,
  createReviewLogSection,
  formatAiThinkingResponse,
} from '@/features/workbench/model/chapterReviewLog';
import { isAuditOutputPassed } from '@/features/workbench/model/chapterAuditResult';
import {
  buildNumberedTextAuditBody,
  buildTextAuditStagePrompt,
  formatAuditTextStage,
  getAuditTextStageState,
  readTextAuditCountdownSeconds,
  setAuditTextCountdownDecision,
  stripAuditTextStageMarkers,
  waitForAuditTextCountdown,
} from '@/features/workbench/model/chapterAuditWorkflow';
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
import { countCompactWords } from '../components/chapterEditorPresentation';

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

export function buildStructureAuditPrompt(plotPromptText: string) {
  return [
    plotPromptText.trim(),
    '本次请求只执行剧情审核，不得分析、生成或输出任何文本审核内容。',
    '必须严格使用下面的软件固定格式；不要新增、删除、改名审核项。',
    AUDIT_STRUCTURE_PROMPT_FORMAT,
  ].filter(Boolean).join('\n\n');
}

async function runReviewModelStage(options: {
  model: ModelItem;
  prompt: string;
  userContent: string;
  chapterContext: string;
  signal: AbortSignal;
  onOutput: (output: string) => void;
}) {
  let answer = '';
  let reasoningContent = '';
  const startedAt = Date.now();
  const getSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  const emitCurrent = (done: boolean) =>
    options.onOutput(formatAiThinkingResponse(answer, reasoningContent, getSeconds(), done));
  answer = await callModelStream({
    model: options.model,
    prompt: options.prompt,
    userContent: options.userContent,
    chapterContext: options.chapterContext,
    recordType: 'stream',
    signal: options.signal,
    onReasoning: (chunk) => {
      reasoningContent += chunk;
      emitCurrent(false);
    },
    onChunk: (chunk) => {
      answer += chunk;
      emitCurrent(false);
    },
  });
  return reasoningContent.trim() ? formatAiThinkingResponse(answer, reasoningContent, getSeconds(), true) : answer;
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
    const textAuditPromptText = activeReviewPrompt?.textAuditContent?.trim() ?? '';
    const isStructureAudit = reviewMode === 'audit';
    const requestedTextAuditEnabled =
      isStructureAudit && activeReviewPrompt?.textAuditEnabled !== false && Boolean(textAuditPromptText);
    const bodyTag =
      reviewMode === 'audit' ? '待剧情审核正文' : reviewMode === 'comment' ? '待点评正文' : '待文笔润色正文';
    const requirementTag =
      reviewMode === 'audit' ? '剧情审核要求' : reviewMode === 'comment' ? '点评要求' : '文笔润色要求';
    const auditPromptText = isStructureAudit ? buildStructureAuditPrompt(basePromptText) : '';
    const compareInstruction = !isStructureAudit
      ? [
          '如果你需要修改正文，请务必额外输出一个独立区块：',
          '【修改后全文】',
          '这里放完整修改后的正文，只放正文，不要夹杂点评说明。',
          '【修改说明】',
          '这里再说明具体修改原因。',
          reviewMode === 'polish' ? '文笔润色只能优化表达，不要改变剧情事件、人物行动、设定信息和章节结果。' : '',
          '这样用户可以在软件中按段落对比并逐段确认替换。',
        ]
          .filter(Boolean)
          .join('\n')
      : '';
    const promptText = auditPromptText || [basePromptText, compareInstruction].filter(Boolean).join('\n\n');
    const isTextAuditEnabled = requestedTextAuditEnabled;
    const userRequirementText = reviewAiInput.trim();
    const userText = userRequirementText ? wrapAiRequestTag(requirementTag, userRequirementText) : '';
    const chapterTitle = activeReviewChapter
      ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
      : '未选择章节';
    const detailOutlineText = activeReviewDetailOutline?.content?.trim() || '';
    const originalText = activeReviewContent.trimEnd();
    const chapterContext = joinAiRequestSections([
      detailOutlineText
        ? wrapAiRequestTag('关联章纲', detailOutlineText, { 标题: activeReviewDetailOutline?.title || '未命名章节' })
        : '',
      wrapAiRequestTag(bodyTag, originalText, { 标题: chapterTitle, 模式: modeTitle }, { preserveLeadingWhitespace: true }),
    ]);
    const requestLogMeta = [
      `模式：${modeTitle}`,
      reviewMode === 'audit' ? `文本审核：${isTextAuditEnabled ? '启用（剧情全部通过后执行）' : '禁用'}` : '',
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
    const textAuditPrompt = isTextAuditEnabled ? buildTextAuditStagePrompt(textAuditPromptText) : '';
    const textAuditContext = isTextAuditEnabled
      ? wrapAiRequestTag('带段落序号的待文本审核正文', buildNumberedTextAuditBody(originalText), {
          标题: chapterTitle,
          模式: '文本审核',
        }, { preserveLeadingWhitespace: true })
      : '';
    const textAuditRequestLog = isTextAuditEnabled
      ? [
          requestLog,
          '',
          '—— 第二阶段：文本审核 ——',
          createReviewLogSection('系统提示词', textAuditPrompt),
          createReviewLogSection('原文', textAuditContext),
        ].join('\n')
      : requestLog;
    return {
      promptText,
      userText,
      chapterContext,
      requestLog,
      isStructureAudit,
      isTextAuditEnabled,
      textAuditPrompt,
      textAuditContext,
      textAuditRequestLog,
    };
  };

  const beginTaskState = (mode: ReviewMode, taskId: string, output: string, requestLog: string) => {
    writeReviewBackgroundTaskId(settingsStorageKey, activeReviewChapter?.id ?? null, mode, taskId);
    setIsReviewAiLoading(true);
    updateReviewModeState(mode, (state) =>
      beginReviewModeRequest(state, { requestLog, output, backgroundTaskId: taskId }),
    );
  };

  const startTextAuditTask = (plotOutput: string) => {
    if (isReviewAiLoading || !activeReviewChapter || !activeReviewModel) return;
    const payload = buildReviewPayload();
    if (!payload.isTextAuditEnabled) return;
    const plotResult = stripAuditTextStageMarkers(plotOutput);
    const prefix = `${plotResult}\n\n${formatAuditTextStage({ status: 'running', seconds: 0 })}`;
    const task = startBackgroundAiTask({
      kind: 'review',
      title: `文本审核：${activeReviewChapter.title || `第${activeReviewChapter.serialNumber}章`}`,
      initialOutput: prefix,
      progressLabel: '正在文本审核',
      meta: {
        target: 'chapterReview', settingsStorageKey, mode: 'audit', chapterId: activeReviewChapter.id,
        requestLog: payload.textAuditRequestLog, auditStage: 'text',
      },
      runner: async ({ signal, emit }) => {
        try {
          const textOutput = await runReviewModelStage({
            model: activeReviewModel,
            prompt: payload.textAuditPrompt,
            userContent: '',
            chapterContext: payload.textAuditContext,
            signal,
            onOutput: (output) => emit(`${prefix}\n\n${output}`, { replace: true, progressLabel: '正在文本审核' }),
          });
          return `${plotResult}\n\n${formatAuditTextStage({ status: 'complete', seconds: 0 })}\n\n${textOutput}`;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`${plotResult}\n\n【文本审核错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    beginTaskState('audit', task.id, prefix, payload.textAuditRequestLog);
  };

  const sendReviewAiMessage = async () => {
    if (isReviewAiLoading) return;
    const requestMode = reviewMode;
    const setRequestReviewOutput = (output: string) =>
      updateReviewModeState(requestMode, (state) => ({ ...state, output }));
    if (!activeReviewChapter) {
      setRequestReviewOutput(`【错误】请先选择需要${REVIEW_MODE_TITLES[requestMode]}的章节。`);
      return;
    }
    if (!activeReviewModel) {
      setRequestReviewOutput('【错误】尚未配置可用模型，请先到模型管理中新增并启用模型。');
      return;
    }
    const payload = buildReviewPayload();
    const pendingOutput = createAiThinkingPlaceholder(0);
    const task = startBackgroundAiTask({
      kind: requestMode === 'polish' ? 'polish' : 'review',
      title: `${REVIEW_MODE_TITLES[requestMode]}：${activeReviewChapter.title || `第${activeReviewChapter.serialNumber}章`}`,
      input: payload.userText,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'chapterReview', settingsStorageKey, mode: requestMode, chapterId: activeReviewChapter.id,
        requestLog: payload.requestLog, auditStage: payload.isStructureAudit ? 'plot' : 'single',
      },
      runner: async ({ signal, emit, update, getTask }) => {
        try {
          const plotOutput = await runReviewModelStage({
            model: activeReviewModel,
            prompt: payload.promptText,
            userContent: payload.userText,
            chapterContext: payload.chapterContext,
            signal,
            onOutput: (output) => emit(output, { replace: true }),
          });
          if (!payload.isStructureAudit) return plotOutput;
          const cleanPlotOutput = stripAuditTextStageMarkers(plotOutput);
          if (!isAuditOutputPassed(cleanPlotOutput)) {
            return `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'blocked', seconds: 0 })}`;
          }
          if (!payload.isTextAuditEnabled) {
            return `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'disabled', seconds: 0 })}`;
          }

          const taskId = getTask()?.id;
          if (!taskId) return cleanPlotOutput;
          const decision = await waitForAuditTextCountdown({
            taskId,
            seconds: readTextAuditCountdownSeconds(),
            signal,
            onTick: (seconds) => emit(
              `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'countdown', seconds })}`,
              { replace: true, progressLabel: '等待文本审核' },
            ),
          });
          if (decision === 'cancel') {
            return `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'cancelled', seconds: 0 })}`;
          }

          const prefix = `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'running', seconds: 0 })}`;
          update({
            progressLabel: '正在文本审核',
            meta: { ...(getTask()?.meta ?? {}), requestLog: payload.textAuditRequestLog, auditStage: 'text' },
          });
          const textOutput = await runReviewModelStage({
            model: activeReviewModel,
            prompt: payload.textAuditPrompt,
            userContent: '',
            chapterContext: payload.textAuditContext,
            signal,
            onOutput: (output) => emit(`${prefix}\n\n${output}`, { replace: true, progressLabel: '正在文本审核' }),
          });
          return `${cleanPlotOutput}\n\n${formatAuditTextStage({ status: 'complete', seconds: 0 })}\n\n${textOutput}`;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    beginTaskState(requestMode, task.id, pendingOutput, payload.requestLog);
  };

  const startAuditTextReviewNow = () =>
    setAuditTextCountdownDecision(activeReviewState.backgroundTaskId, 'start');
  const cancelAuditTextReviewCountdown = () =>
    setAuditTextCountdownDecision(activeReviewState.backgroundTaskId, 'cancel');
  const runAuditTextReviewManually = () => startTextAuditTask(activeReviewState.output);

  const stopReviewAiMessage = () => {
    if (getAuditTextStageState(activeReviewState.output)?.status === 'countdown') {
      cancelAuditTextReviewCountdown();
      return;
    }
    if (activeReviewState.backgroundTaskId) stopBackgroundAiTask(activeReviewState.backgroundTaskId);
    setIsReviewAiLoading(false);
  };

  return {
    sendReviewAiMessage,
    stopReviewAiMessage,
    startAuditTextReviewNow,
    cancelAuditTextReviewCountdown,
    runAuditTextReviewManually,
  };
}
