import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import {
  BODY_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  readPromptSnapshot,
} from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import { createAiThinkingPlaceholder } from '@/features/workbench/model/workbenchAiThinkingProtocol';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';
import { WorkbenchAiRequestLogModal } from './WorkbenchAiRequestLogModal';
import { WorkbenchAiConversationView } from './WorkbenchAiConversationView';
import { WorkbenchAiConfigPanel } from './WorkbenchAiConfigPanel';

import {
  type WorkbenchAITool,
  type WorkbenchLinkedContextSource,
  type WorkbenchLinkedContextItem,
  FLOATING_AI_TEXTAREA_MIN_HEIGHT,
  FLOATING_AI_TEXTAREA_MAX_HEIGHT,
  MAX_AI_SESSIONS,
  resizeFloatingAiTextarea,
  type AiSession,
  type AiMessage,
  type WorkbenchAiRequestLog,
  type WorkbenchAIPanelProps,
  readConfig,
  getDefaultInstruction,
  getTextWordCount,
  formatAiThinkingResponse,
  stripAiThinkingBlock,
  getBackgroundTaskDisplayOutput,
  renderAiChatContent,
  buildBodyLinkedContextPayload,
  getLinkedContextSourceLabel,
  buildAiRequestLog,
  getBodyAiLogFillGroupWeights,
  createDefaultSession,
  normalizeSessions,
  readStoredAiState,
} from '@/features/workbench/components/workbenchAiPanelSupport';
import { renderWorkbenchAIPanelView } from './WorkbenchAIPanelView';

export type {
  WorkbenchAITool,
  WorkbenchLinkedContextItem,
  WorkbenchLinkedContextSource,
} from '@/features/workbench/components/workbenchAiPanelSupport';

export function WorkbenchAIPanel({
  standardMode = false,
  activeTool,
  workId,
  selectedChapterContent,
  linkedContextItems = [],
  chapterContextLabel = '本章',
  onClose,
  onReplaceContent,
  onUndoReplace,
  canUndoReplace = false,
  onOpenModelManage,
  onOpenAgentManage,
  onOpenContextLibrary,
  onClearLinkedContext,
  openLogSignal = 0,
  onRegisterHeaderLog,
}: WorkbenchAIPanelProps) {
  const storageKey = `xinyuexia_workbench_ai_sessions_${workId}`;
  const initialAiState = useMemo(() => readStoredAiState(storageKey), [storageKey]);
  const [sessions, setSessions] = useState<AiSession[]>(() => initialAiState.sessions);
  const [activeSessionId, setActiveSessionId] = useState(() => initialAiState.activeSessionId);
  const [models, setModels] = useState<ModelItem[]>(() => readConfig().models);
  const [prompts, setPrompts] = useState<PromptItem[]>(() => readConfig().prompts);
  const [selectedModelId, setSelectedModelId] = usePersistentState<string>('xinyuexia_workbench_ai_left_model', '');
  const [selectedPromptId, setSelectedPromptId] = usePersistentState<string>('xinyuexia_workbench_ai_left_prompt', '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [outputFontSize, setOutputFontSize] = useState(20);
  const [headerToolPortalTarget, setHeaderToolPortalTarget] = useState<HTMLElement | null>(null);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [isRequestLogOpen, setIsRequestLogOpen] = useState(false);
  const [isSessionLimitConfirmOpen, setIsSessionLimitConfirmOpen] = useState(false);
  const [lastRequestLog, setLastRequestLog] = useState<WorkbenchAiRequestLog | null>(null);
  const nextSessionIdRef = useRef(initialAiState.nextSessionId);
  const nextMessageIdRef = useRef(initialAiState.nextMessageId);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const skipNextSaveRef = useRef(true);
  const inputTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const input = activeSession?.input ?? '';
  const output = activeSession?.output ?? '';
  const enabledModels = useMemo(() => models.filter((model) => model.enabled), [models]);
  const chatPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === BODY_PROMPT_CATEGORY),
    [prompts],
  );
  const selectedModel = enabledModels.find((model) => model.id === selectedModelId) ?? enabledModels[0] ?? null;
  const selectedPrompt = chatPrompts.find((prompt) => prompt.id === selectedPromptId) ?? null;
  const outputWordCount = output.replace(/\s/g, '').length;
  const linkedChapterWordCount = selectedChapterContent.replace(/\s/g, '').length;
  const hasLinkedChapter = Boolean(activeSession?.linkChapter);
  const activeLinkedContextItems = hasLinkedChapter ? [] : linkedContextItems;
  const linkedContextWordCount = activeLinkedContextItems.reduce(
    (sum, item) => sum + getTextWordCount(item.content),
    0,
  );
  const hasLinkedContext = activeLinkedContextItems.length > 0;
  const activeLinkWordCount = hasLinkedContext ? linkedContextWordCount : hasLinkedChapter ? linkedChapterWordCount : 0;
  const shouldShowActiveLinkStats = hasLinkedContext || hasLinkedChapter;
  const previewLinkedContextPayload = buildBodyLinkedContextPayload(activeLinkedContextItems);
  const previewUseChapter =
    !previewLinkedContextPayload && Boolean(activeSession?.linkChapter && selectedChapterContent.trim());
  const previewContextText =
    previewLinkedContextPayload ||
    (previewUseChapter ? wrapAiRequestTag('前文正文', selectedChapterContent, { 标题: chapterContextLabel }) : '');
  const previewUserTextForAi = wrapAiRequestTag('写作要求', input.trim());
  const canSendMessage = Boolean(input.trim() || previewContextText.trim());
  const previewRequestLog = buildAiRequestLog({
    createdAt: '当前预览',
    modelName: selectedModel?.name ?? '未选择模型',
    promptName: selectedPrompt?.name ?? '默认提示词',
    systemPrompt: selectedPrompt?.content ?? getDefaultInstruction(activeTool),
    userContent: previewUserTextForAi,
    visibleUserContent: input.trim(),
    contextTitle: previewLinkedContextPayload ? '关联资料' : previewContextText ? `${chapterContextLabel}内容` : '',
    contextText: previewContextText,
    linkedItems: previewLinkedContextPayload ? activeLinkedContextItems : [],
    linkChapter: Boolean(activeSession?.linkChapter),
  });
  const visibleRequestLog = previewRequestLog ?? lastRequestLog;
  const loadingText = `正在生成${'.'.repeat(loadingDotCount)}`;

  useEffect(() => {
    if (openLogSignal === lastOpenLogSignalRef.current) return;
    lastOpenLogSignalRef.current = openLogSignal;
    setIsRequestLogOpen(true);
  }, [openLogSignal]);

  useEffect(() => {
    if (!onRegisterHeaderLog) return;
    onRegisterHeaderLog(() => setIsRequestLogOpen(true));
    return () => onRegisterHeaderLog(null);
  }, [onRegisterHeaderLog]);

  useEffect(() => {
    const updateTarget = () => setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'));
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, []);

  const updateSession = (sessionId: number, patch: Partial<Omit<AiSession, 'id'>>) => {
    setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, ...patch } : session)));
  };

  const updateActiveSession = (patch: Partial<Omit<AiSession, 'id'>>) => {
    if (!activeSession) return;
    updateSession(activeSession.id, patch);
  };

  const stopSessionBackgroundTask = (session: AiSession | null | undefined) => {
    if (!session?.backgroundTaskId) return;
    stopBackgroundAiTask(session.backgroundTaskId);
  };

  const toggleChapterContext = () => {
    const nextLinkChapter = !activeSession?.linkChapter;
    if (nextLinkChapter && linkedContextItems.length > 0) {
      onClearLinkedContext?.();
    }
    updateActiveSession({
      linkChapter: nextLinkChapter,
      hasSentChapterContext: false,
    });
  };

  const openLinkedContextLibrary = () => {
    if (hasLinkedContext) {
      clearLinkedContext();
      return;
    }
    if (hasLinkedChapter) {
      updateActiveSession({
        linkChapter: false,
        hasSentChapterContext: false,
      });
    }
    onOpenContextLibrary?.();
    if (!onOpenContextLibrary) flashStatus('关联资料稍后配置');
  };

  const clearLinkedContext = () => {
    onClearLinkedContext?.();
    updateActiveSession({
      linkChapter: false,
      hasSentChapterContext: false,
    });
  };

  useEffect(() => {
    const updateConfig = () => {
      const next = readConfig();
      setModels(next.models);
      setPrompts(next.prompts);
    };
    window.addEventListener(APP_EVENTS.modelsUpdated, updateConfig);
    window.addEventListener(APP_EVENTS.promptsUpdated, updateConfig);
    return () => {
      window.removeEventListener(APP_EVENTS.modelsUpdated, updateConfig);
      window.removeEventListener(APP_EVENTS.promptsUpdated, updateConfig);
    };
  }, []);

  useEffect(() => {
    const next = readStoredAiState(storageKey);
    skipNextSaveRef.current = true;
    setSessions(next.sessions);
    setActiveSessionId(next.activeSessionId);
    nextSessionIdRef.current = next.nextSessionId;
    nextMessageIdRef.current = next.nextMessageId;
    setIsLoading(false);
  }, [storageKey]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        sessions,
        activeSessionId,
        nextSessionId: nextSessionIdRef.current,
        nextMessageId: nextMessageIdRef.current,
      }),
    );
  }, [activeSessionId, sessions, storageKey]);

  useEffect(() => {
    if (!selectedModelId && enabledModels[0]) {
      setSelectedModelId(enabledModels[0].id);
    }
  }, [enabledModels, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    if (chatPrompts.length === 0) {
      if (selectedPromptId) setSelectedPromptId('');
      return;
    }
    if (!chatPrompts.some((prompt) => prompt.id === selectedPromptId)) {
      setSelectedPromptId(chatPrompts[0].id);
    }
  }, [chatPrompts, selectedPromptId, setSelectedPromptId]);

  useEffect(() => {
    const syncBackgroundTasks = () => {
      setSessions((prev) => {
        let changed = false;
        const next = prev.map((session) => {
          if (!session.backgroundTaskId) return session;
          const task = getBackgroundAiTask(session.backgroundTaskId);
          if (!task || task.meta?.target !== 'workbenchAiPanel' || task.meta.storageKey !== storageKey) return session;
          const assistantMessageId = Number.isFinite(task.meta?.assistantMessageId)
            ? Number(task.meta?.assistantMessageId)
            : session.backgroundAssistantMessageId;
          const nextOutput = getBackgroundTaskDisplayOutput(task);
          const nextMessages =
            typeof assistantMessageId === 'number'
              ? session.messages.map((message) =>
                  message.id === assistantMessageId ? { ...message, content: nextOutput } : message,
                )
              : session.messages;
          const outputChanged = session.output !== nextOutput;
          const messageChanged = nextMessages.some(
            (message, index) => message.content !== session.messages[index]?.content,
          );
          const assistantChanged = session.backgroundAssistantMessageId !== assistantMessageId;
          if (!outputChanged && !messageChanged && !assistantChanged) return session;
          changed = true;
          return {
            ...session,
            output: nextOutput,
            messages: nextMessages,
            backgroundAssistantMessageId: assistantMessageId,
          };
        });
        return changed ? next : prev;
      });

      const activeTask = activeSession?.backgroundTaskId ? getBackgroundAiTask(activeSession.backgroundTaskId) : null;
      setIsLoading(activeTask?.status === 'running');
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [activeSession?.backgroundTaskId, activeSessionId, storageKey]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingDotCount(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    resizeFloatingAiTextarea(inputTextareaRef.current);
  }, [input]);

  const flashStatus = (text: string) => {
    setStatusText(text);
    window.setTimeout(() => setStatusText(''), 1600);
  };

  const sendMessage = async (configModel = selectedModel, configPrompt = selectedPrompt) => {
    if (!activeSession) return;
    const sessionId = activeSession.id;
    const text = input.trim();
    const activeRequestLinkedContextItems = activeSession.linkChapter ? [] : linkedContextItems;
    const linkedContextPayload = buildBodyLinkedContextPayload(activeRequestLinkedContextItems);
    const shouldAttachChapter = !linkedContextPayload && activeSession.linkChapter && selectedChapterContent.trim();
    const contextPayload =
      linkedContextPayload ||
      (shouldAttachChapter ? wrapAiRequestTag('前文正文', selectedChapterContent, { 标题: chapterContextLabel }) : '');
    const hasSendableContext = Boolean(contextPayload.trim());
    if (isLoading || (!text && !hasSendableContext)) return;
    const effectiveContextPayload = contextPayload;
    const contextTitle = linkedContextPayload ? '关联资料' : contextPayload ? `${chapterContextLabel}内容` : '';
    const promptText = configPrompt?.content ?? getDefaultInstruction(activeTool);
    const userTextForAi = text ? wrapAiRequestTag('写作要求', text) : '';
    const requestLog = buildAiRequestLog({
      createdAt: new Date().toLocaleString('zh-CN'),
      modelName: configModel?.name ?? '未选择模型',
      promptName: configPrompt?.name ?? '默认提示词',
      systemPrompt: promptText,
      userContent: userTextForAi,
      visibleUserContent: text,
      contextTitle,
      contextText: effectiveContextPayload,
      linkedItems: linkedContextPayload ? activeRequestLinkedContextItems : [],
      linkChapter: Boolean(activeSession.linkChapter),
    });
    setLastRequestLog(requestLog);
    const userMessage: AiMessage = {
      id: nextMessageIdRef.current++,
      role: 'user',
      content: text || `使用${contextTitle || '关联内容'}生成正文`,
    };
    const pendingOutput = createAiThinkingPlaceholder(0);
    const assistantMessage: AiMessage = { id: nextMessageIdRef.current++, role: 'assistant', content: pendingOutput };
    const nextMessages = [...activeSession.messages, userMessage, assistantMessage];
    updateSession(sessionId, {
      input: '',
      messages: nextMessages,
      output: pendingOutput,
      hasSentChapterContext: activeSession.hasSentChapterContext || Boolean(shouldAttachChapter),
    });

    if (!configModel) {
      const errorText = '尚未配置可用模型。请先到模型管理中新增模型。';
      updateSession(sessionId, {
        output: errorText,
        messages: nextMessages.map((message) =>
          message.id === assistantMessage.id ? { ...message, content: errorText } : message,
        ),
      });
      return;
    }

    const task = startBackgroundAiTask({
      kind: 'chapterDraft',
      title: '作品编辑器 AI',
      input: userTextForAi,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'workbenchAiPanel',
        storageKey,
        sessionId,
        assistantMessageId: assistantMessage.id,
      },
      runner: async ({ signal, emit }) => {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          content = await callModelStream({
            model: configModel,
            prompt: promptText,
            userContent: userTextForAi,
            chapterContext: effectiveContextPayload,
            signal,
            recordType: 'stream',
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
            onChunk: (chunk) => {
              content += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
          });
          if (reasoningContent.trim()) {
            content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
          }
          return content;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const errorText = error instanceof Error ? `【错误】${error.message}` : '【错误】模型请求失败。';
            emit(errorText, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    updateSession(sessionId, {
      backgroundTaskId: task.id,
      backgroundAssistantMessageId: assistantMessage.id,
    });
    setIsLoading(true);
  };

  const addSession = () => {
    if (sessions.length >= MAX_AI_SESSIONS) {
      setIsSessionLimitConfirmOpen(true);
      return;
    }
    const nextId = nextSessionIdRef.current;
    nextSessionIdRef.current += 1;
    setSessions((prev) => [
      ...prev,
      {
        id: nextId,
        input: '',
        output: '',
        messages: [],
        linkChapter: false,
        hasSentChapterContext: false,
      },
    ]);
    setActiveSessionId(nextId);
  };

  const deleteSession = (sessionId: number) => {
    const deletingSession = sessions.find((session) => session.id === sessionId);
    stopSessionBackgroundTask(deletingSession);
    if (sessions.length <= 1) {
      onClearLinkedContext?.();
      const nextId = nextSessionIdRef.current;
      nextSessionIdRef.current += 1;
      setSessions([
        {
          id: nextId,
          input: '',
          output: '',
          messages: [],
          linkChapter: false,
          hasSentChapterContext: false,
        },
      ]);
      setActiveSessionId(nextId);
      setLastRequestLog(null);
      setIsLoading(false);
      return;
    }
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(
          next[Math.max(0, prev.findIndex((session) => session.id === sessionId) - 1)]?.id ?? next[0].id,
        );
      }
      return next;
    });
  };

  const resetSessions = () => {
    sessions.forEach(stopSessionBackgroundTask);
    onClearLinkedContext?.();
    const fresh = createDefaultSession(nextSessionIdRef.current);
    nextSessionIdRef.current += 1;
    nextMessageIdRef.current = 1;
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setLastRequestLog(null);
    setIsLoading(false);
  };

  const stopMessage = () => {
    stopSessionBackgroundTask(activeSession);
    setIsLoading(false);
    flashStatus('已停止输出');
  };

  const copyOutput = async () => {
    const cleanOutput = stripAiThinkingBlock(output);
    if (!cleanOutput.trim()) return;
    try {
      await navigator.clipboard.writeText(cleanOutput);
      flashStatus('已复制输出内容');
    } catch {
      flashStatus('复制失败');
    }
  };

  const outputFontSizeTool = (
    <FontSizeStepper
      value={outputFontSize}
      min={14}
      max={32}
      onChange={setOutputFontSize}
      ariaLabel="AI 输出字号"
      className="shrink-0"
    />
  );

  return renderWorkbenchAIPanelView({
    AiInlineInput,
    ConfirmDialog,
    MAX_AI_SESSIONS,
    WordCountText,
    WorkbenchAiConfigPanel,
    WorkbenchAiConversationView,
    WorkbenchAiRequestLogModal,
    standardMode,
    activeLinkWordCount,
    activeSession,
    activeSessionId,
    addSession,
    canSendMessage,
    canUndoReplace,
    chapterContextLabel,
    chatPrompts,
    copyOutput,
    createPortal,
    deleteSession,
    enabledModels,
    flashStatus,
    hasLinkedChapter,
    hasLinkedContext,
    headerToolPortalTarget,
    input,
    inputTextareaRef,
    isLoading,
    isRequestLogOpen,
    isSessionLimitConfirmOpen,
    loadingText,
    onClose,
    onOpenAgentManage,
    onOpenModelManage,
    onReplaceContent,
    onUndoReplace,
    openLinkedContextLibrary,
    output,
    outputFontSize,
    outputFontSizeTool,
    outputWordCount,
    resetSessions,
    resizeFloatingAiTextarea,
    selectedModel,
    selectedModelId,
    selectedPrompt,
    selectedPromptId,
    sendMessage,
    sessions,
    setActiveSessionId,
    setIsLoading,
    setIsRequestLogOpen,
    setIsSessionLimitConfirmOpen,
    setSelectedModelId,
    setSelectedPromptId,
    shouldShowActiveLinkStats,
    statusText,
    stopMessage,
    stopSessionBackgroundTask,
    stripAiThinkingBlock,
    toggleChapterContext,
    updateActiveSession,
    visibleRequestLog,
  });
}
