import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import {
  buildMoonfallRagBundle,
  readMoonfallState,
  writeMoonfallState,
} from '@/features/moonfall-settings/model/moonfallSettingStore';
import {
  BODY_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  readPromptSnapshot,
} from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
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
import { applyFormat, getStoredFormatSettings } from './EditorToolModals';
import { WorkbenchModal } from './WorkbenchModal';

export type WorkbenchAITool = 'ai';
export type WorkbenchLinkedContextSource = 'setting' | 'role' | 'outline' | 'summary' | 'chapter';

export interface WorkbenchLinkedContextItem {
  id: string;
  source: WorkbenchLinkedContextSource;
  group: string;
  title: string;
  content: string;
}

const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 162;
const MAX_AI_SESSIONS = 8;
function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.min(
    FLOATING_AI_TEXTAREA_MAX_HEIGHT,
    Math.max(FLOATING_AI_TEXTAREA_MIN_HEIGHT, textarea.scrollHeight),
  );
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > FLOATING_AI_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
}

interface AiSession {
  id: number;
  input: string;
  output: string;
  messages: AiMessage[];
  linkChapter: boolean;
  hasSentChapterContext: boolean;
  backgroundTaskId?: string;
  backgroundAssistantMessageId?: number;
}

interface AiMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface WorkbenchAiRequestLog {
  createdAt: string;
  modelName: string;
  promptName: string;
  systemPrompt: string;
  userContent: string;
  visibleUserContent: string;
  contextTitle: string;
  contextText: string;
  linkedItems: WorkbenchLinkedContextItem[];
  linkChapter: boolean;
  contextWordCount: number;
}

interface WorkbenchAIPanelProps {
  activeTool: WorkbenchAITool;
  workId: number | string;
  selectedChapterContent: string;
  linkedContextItems?: WorkbenchLinkedContextItem[];
  chapterContextLabel?: string;
  onClose?: () => void;
  onReplaceContent: (content: string) => void;
  onUndoReplace?: () => void;
  canUndoReplace?: boolean;
  onOpenModelManage?: () => void;
  onOpenAgentManage?: () => void;
  onOpenContextLibrary?: () => void;
  onClearLinkedContext?: () => void;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
}

function readConfig() {
  return {
    models: readModelSnapshot(),
    prompts: readPromptSnapshot().prompts,
  };
}

function getDefaultInstruction(_tool: WorkbenchAITool) {
  return '请根据我的要求处理当前章节正文。';
}

function getTextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body,
  ].join('\n');
}

function stripAiThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

function getBackgroundTaskDisplayOutput(task: BackgroundAiTask, stoppedText = '【已停止】本次生成已停止。') {
  if (task.status === 'aborted' && !stripAiThinkingBlock(task.output).trim()) return stoppedText;
  if (task.status === 'failed' && task.error && !stripAiThinkingBlock(task.output).trim())
    return `【错误】${task.error}`;
  return task.output;
}

function renderAiChatContent(content: string) {
  const thinkingMatch = content.match(
    /^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/,
  );
  if (thinkingMatch) {
    const seconds = thinkingMatch[1] ?? '0';
    const done = thinkingMatch[2] === 'done';
    const reasoning = thinkingMatch[3]?.trim() ?? '';
    const answer = thinkingMatch[4]?.trimStart() ?? '';
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] p-3 text-xs leading-6 text-slate-600">
          <div className="mb-1 flex items-center justify-between font-black text-[#078fb0]">
            <span>{done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`}</span>
          </div>
          {reasoning && <div className="max-h-36 overflow-y-auto whitespace-pre-wrap break-words">{reasoning}</div>}
        </div>
        {answer && <div className="whitespace-pre-wrap break-words">{answer}</div>}
      </div>
    );
  }
  return content;
}

function buildBodyLinkedContextPayload(items: WorkbenchLinkedContextItem[]) {
  const formatItems = (source: WorkbenchLinkedContextSource, fallbackTitle: string) =>
    items
      .filter((item) => item.source === source && item.content.trim())
      .map((item, index) => {
        const itemTitle = item.title.trim() || `${fallbackTitle}${index + 1}`;
        const prefix = item.group ? `${itemTitle}（${item.group}）` : itemTitle;
        return `### ${prefix}\n${item.content.trim()}`;
      })
      .join('\n\n');
  const linkedSettingText = joinAiRequestSections([formatItems('setting', '设定'), formatItems('role', '角色')]);
  return joinAiRequestSections([
    wrapAiRequestTag('本章章纲', formatItems('outline', '章纲')),
    wrapAiRequestTag('前文梗概', formatItems('summary', '梗概')),
    wrapAiRequestTag('关联设定', linkedSettingText),
    wrapAiRequestTag('前文正文', formatItems('chapter', '正文')),
  ]);
}

function getLinkedContextSourceLabel(source: WorkbenchLinkedContextSource) {
  if (source === 'setting') return '设定';
  if (source === 'role') return '角色';
  if (source === 'outline') return '章纲';
  if (source === 'summary') return '梗概';
  return '正文';
}

function buildAiRequestLog({
  createdAt,
  modelName,
  promptName,
  systemPrompt,
  userContent,
  contextTitle,
  contextText,
  linkedItems,
  linkChapter,
  visibleUserContent,
}: Omit<WorkbenchAiRequestLog, 'contextWordCount'>): WorkbenchAiRequestLog {
  return {
    createdAt,
    modelName,
    promptName,
    systemPrompt,
    userContent,
    visibleUserContent,
    contextTitle,
    contextText,
    linkedItems,
    linkChapter,
    contextWordCount: getTextWordCount(contextText),
  };
}

function getBodyAiLogFillGroupWeights(log: WorkbenchAiRequestLog): Record<string, number> {
  const hasContext = Boolean(log.contextText.trim());
  const hasUser = Boolean(log.visibleUserContent.trim());
  if (hasContext && hasUser) return { prompt: 1, context: 2, user: 1 };
  if (hasContext) return { prompt: 1, context: 2 };
  if (hasUser) return { prompt: 2, user: 1 };
  return { prompt: 1 };
}

async function buildAutoRagContext(userInput: string, chapterContext: string) {
  const state = readMoonfallState();
  if (!state.config.autoRag) return '';
  const activeProject = state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
  if (!activeProject) return '';
  const query = [userInput, chapterContext.slice(-4000)].filter(Boolean).join('\n\n');
  if (!query.trim()) return '';

  const bundle = buildMoonfallRagBundle(state, {
    projectId: activeProject.id,
    userId: activeProject.userId,
    query,
    limit: state.config.retrievalLimit,
    purpose: 'writing',
    similarityThreshold: state.config.similarityThreshold,
  });
  if (bundle.results.length === 0) return '';
  writeMoonfallState({
    ...state,
    retrievalLogs: [bundle.log, ...state.retrievalLogs].slice(0, 200),
  });
  return bundle.contextText;
}

function createDefaultSession(id = 1): AiSession {
  return {
    id,
    input: '',
    output: '',
    messages: [],
    linkChapter: false,
    hasSentChapterContext: false,
  };
}

function normalizeSessions(value: unknown): AiSession[] {
  if (!Array.isArray(value)) return [createDefaultSession()];
  const sessions = value
    .map((item, index): AiSession | null => {
      if (!item || typeof item !== 'object') return null;
      const session = item as Partial<AiSession>;
      const id = Number.isFinite(session.id) ? Number(session.id) : index + 1;
      return {
        id,
        input: typeof session.input === 'string' ? session.input : '',
        output: typeof session.output === 'string' ? session.output : '',
        messages: Array.isArray(session.messages)
          ? session.messages
              .filter((message): message is AiMessage =>
                Boolean(message && typeof message === 'object' && 'content' in message),
              )
              .map((message, messageIndex) => ({
                id: Number.isFinite(message.id) ? Number(message.id) : messageIndex + 1,
                role: message.role === 'user' ? 'user' : 'assistant',
                content: typeof message.content === 'string' ? message.content : '',
              }))
          : [],
        linkChapter: Boolean(session.linkChapter),
        hasSentChapterContext: Boolean(session.hasSentChapterContext),
        backgroundTaskId: typeof session.backgroundTaskId === 'string' ? session.backgroundTaskId : undefined,
        backgroundAssistantMessageId: Number.isFinite(session.backgroundAssistantMessageId)
          ? Number(session.backgroundAssistantMessageId)
          : undefined,
      };
    })
    .filter((session): session is AiSession => Boolean(session));
  return sessions.length > 0 ? sessions : [createDefaultSession()];
}

function readStoredAiState(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {
        sessions: [createDefaultSession()],
        activeSessionId: 1,
        nextSessionId: 2,
        nextMessageId: 1,
      };
    }
    const parsed = JSON.parse(raw) as {
      sessions?: unknown;
      activeSessionId?: number;
      nextSessionId?: number;
      nextMessageId?: number;
    };
    const sessions = normalizeSessions(parsed.sessions);
    const activeSessionId = sessions.some((session) => session.id === parsed.activeSessionId)
      ? Number(parsed.activeSessionId)
      : sessions[0].id;
    return {
      sessions,
      activeSessionId,
      nextSessionId: Number.isFinite(parsed.nextSessionId)
        ? Math.max(Number(parsed.nextSessionId), Math.max(...sessions.map((session) => session.id)) + 1)
        : Math.max(...sessions.map((session) => session.id)) + 1,
      nextMessageId: Number.isFinite(parsed.nextMessageId)
        ? Number(parsed.nextMessageId)
        : Math.max(0, ...sessions.flatMap((session) => session.messages.map((message) => message.id))) + 1,
    };
  } catch {
    return {
      sessions: [createDefaultSession()],
      activeSessionId: 1,
      nextSessionId: 2,
      nextMessageId: 1,
    };
  }
}

export function WorkbenchAIPanel({
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
    const assistantMessage: AiMessage = { id: nextMessageIdRef.current++, role: 'assistant', content: '正在生成...' };
    const nextMessages = [...activeSession.messages, userMessage, assistantMessage];
    updateSession(sessionId, {
      input: '',
      messages: nextMessages,
      output: '正在思考...',
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
      initialOutput: '正在思考...',
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

  const renderModelStatus = (currentModel: ModelItem | null) => {
    if (!currentModel || currentModel.connectionStatus === 'failed') {
      return <X className="h-3.5 w-3.5 text-red-500" />;
    }
    if (currentModel.connectionStatus === 'connected') {
      const latency = typeof currentModel.connectionLatencyMs === 'number' ? currentModel.connectionLatencyMs : null;
      return (
        <span className="text-xs font-bold tabular-nums text-emerald-600">
          {latency === null ? '--ms' : `${latency}ms`}
        </span>
      );
    }
    return null;
  };

  const renderSessionControls = () => (
    <div className="xy-floating-edge-tool xy-floating-chat-session-tool">
      <div className="flex h-7 max-w-full items-center overflow-visible">
        <div className="xy-floating-session-buttons scrollbar-hidden flex min-w-0 items-center overflow-x-auto">
          <button
            type="button"
            onClick={addSession}
            disabled={false}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand disabled:text-gray-300"
            title="新建会话"
          >
            <span className="-mt-px block text-[17px] font-bold leading-none">+</span>
          </button>
          {sessions.map((session, index) => (
            <div key={session.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSessionId(session.id);
                }}
                className={`flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-xs font-bold leading-none transition-colors ${
                  session.id === activeSessionId
                    ? 'border-brand/30 bg-[#EAF9FD] text-brand'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-brand hover:text-brand'
                }`}
              >
                {index + 1}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSessionActions = () => (
    <div className="xy-floating-edge-tool xy-floating-chat-action-tool">
      <div className="flex h-7 max-w-full items-center gap-1 overflow-hidden bg-white">
        <div className="flex h-6 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => deleteSession(activeSessionId)}
            className="px-2 text-[11px] font-bold text-red-500 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-white"
          >
            删除
          </button>
          <button
            type="button"
            onClick={resetSessions}
            className="border-l border-gray-200 px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfigPanel = (
    model: ModelItem | null,
    modelId: string,
    onModelChange: (value: string) => void,
    prompt: PromptItem | null,
    promptId: string,
    onPromptChange: (value: string) => void,
  ) => (
    <>
      <div className="w-full shrink-0 overflow-visible">
        <div className="max-w-full">
          <CombinedAiConfigSelect
            className="w-full"
            modelValue={model?.id ?? modelId}
            promptValue={prompt?.id ?? chatPrompts[0]?.id ?? promptId}
            modelOptions={
              enabledModels.length === 0
                ? [{ value: '', label: '无可用模型', disabled: true }]
                : enabledModels.map((option) => ({ value: option.id, label: option.name }))
            }
            promptOptions={
              chatPrompts.length === 0
                ? [{ value: '', label: '无可用提示词', disabled: true }]
                : chatPrompts.map((option) => ({ value: option.id, label: option.name }))
            }
            onModelChange={onModelChange}
            onPromptChange={onPromptChange}
            onModelManage={() => onOpenModelManage?.()}
            onPromptManage={() => onOpenAgentManage?.()}
          />
          {renderModelStatus(model) ? (
            <div className="mt-1 flex h-4 justify-end text-xs font-bold">{renderModelStatus(model)}</div>
          ) : null}
        </div>
      </div>
    </>
  );

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

  return (
    <aside className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-gray-50">
      {headerToolPortalTarget ? createPortal(outputFontSizeTool, headerToolPortalTarget) : null}
      {statusText || onClose ? (
        <div className="flex min-h-10 shrink-0 items-center justify-end gap-3 border-b border-gray-100 px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {statusText && <span className="min-w-0 truncate text-[11px] text-brand">{statusText}</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="收起"
              >
                收起
              </button>
            )}
          </div>
        </div>
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2">
        {renderConfigPanel(
          selectedModel,
          selectedModelId,
          setSelectedModelId,
          selectedPrompt,
          selectedPromptId,
          setSelectedPromptId,
        )}
        <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count xy-floating-chat-shell mt-5 min-h-0 flex-1">
          <div className="xy-floating-rich-preview xy-floating-chat-history editor-scrollbar h-full overflow-y-auto">
            {activeSession?.messages.length ? (
              <div className="flex flex-col gap-3">
                {activeSession.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 leading-7 shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-brand text-white'
                          : 'rounded-bl-md border border-gray-200 bg-white text-gray-700'
                      }`}
                      style={{ fontSize: outputFontSize }}
                    >
                      {isLoading && message.role === 'assistant' && message.content === '正在生成...'
                        ? loadingText
                        : renderAiChatContent(message.content)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-start text-gray-400" style={{ fontSize: outputFontSize }}>
                暂无对话内容...
              </div>
            )}
          </div>
          {renderSessionControls()}
          {renderSessionActions()}
          <span className="xy-floating-count">
            <WordCountText value={outputWordCount} compact />
          </span>
        </div>
        <div className="mt-2 flex shrink-0 items-start justify-between gap-2 text-xs text-gray-400">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 flex-nowrap items-center gap-2">
              <div className="flex h-9 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9] bg-white shadow-sm">
                <div className="flex w-14 items-center justify-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
                  关联
                </div>
                <button
                  type="button"
                  onClick={toggleChapterContext}
                  className={`w-24 px-2 text-sm font-bold transition-colors ${
                    hasLinkedChapter
                      ? 'bg-[#08B3D9] text-white'
                      : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
                  }`}
                >
                  {hasLinkedChapter ? `已关联${chapterContextLabel}` : chapterContextLabel}
                </button>
                <button
                  type="button"
                  onClick={openLinkedContextLibrary}
                  className={`w-28 border-l border-[#08B3D9]/30 px-2 text-sm font-bold transition-colors ${
                    hasLinkedContext
                      ? 'bg-[#08B3D9] text-white'
                      : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
                  }`}
                >
                  {hasLinkedContext ? '已关联资料' : '资料'}
                </button>
              </div>
              {shouldShowActiveLinkStats && (
                <span className="min-w-0 shrink text-sm font-bold text-slate-400">
                  关联 <WordCountText value={activeLinkWordCount} compact />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 shrink-0">
          <AiInlineInput
            ref={inputTextareaRef}
            value={input}
            onChange={(event) => {
              updateActiveSession({ input: event.target.value });
              resizeFloatingAiTextarea(event.currentTarget);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            onSend={() => void sendMessage()}
            onStop={stopMessage}
            sendDisabled={isLoading || !canSendMessage}
            stopDisabled={!isLoading}
            placeholder="请输入你的要求..."
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => {
                  if (!output.trim()) return;
                  onReplaceContent(applyFormat(stripAiThinkingBlock(output), getStoredFormatSettings()));
                  flashStatus('已智能排版并替换正文');
                }}
                disabled={!output.trim()}
                className="min-w-0 flex-1 bg-brand px-2 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
              >
                替换正文
              </button>
              <button
                onClick={() => {
                  onUndoReplace?.();
                  flashStatus('已撤回替换');
                }}
                disabled={!canUndoReplace}
                title="撤回上一次替换正文，恢复所选章节替换前的内容"
                className="min-w-0 flex-1 border-l border-gray-200 bg-white px-2 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
              >
                撤回替换
              </button>
            </div>
            <div className="flex min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={copyOutput}
                disabled={!output.trim()}
                className="min-w-0 flex-1 bg-brand px-2 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
              >
                复制内容
              </button>
              <button
                onClick={() => {
                  stopSessionBackgroundTask(activeSession);
                  updateActiveSession({
                    output: '',
                    messages: [],
                    backgroundTaskId: undefined,
                    backgroundAssistantMessageId: undefined,
                  });
                  setIsLoading(false);
                }}
                className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-2 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                清空内容
              </button>
            </div>
          </div>
        </div>
      </section>
      {isRequestLogOpen && (
        <WorkbenchModal
          title="输出日志"
          isOpen={isRequestLogOpen}
          onClose={() => setIsRequestLogOpen(false)}
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
                value:
                  visibleRequestLog.linkedItems.length > 0
                    ? `关联资料 · ${visibleRequestLog.linkedItems.length}项`
                    : `${chapterContextLabel}内容`,
                valueClassName: 'text-brand',
                hidden: !visibleRequestLog.contextText.trim(),
              },
              {
                id: 'context-words',
                label: '资料字数',
                value: <WordCountText value={visibleRequestLog.contextWordCount} />,
                hidden: !visibleRequestLog.contextText.trim(),
              },
              {
                id: 'user',
                label: '用户可见输入',
                value: visibleRequestLog.visibleUserContent,
                hidden: !visibleRequestLog.visibleUserContent.trim(),
              },
            ]}
            groups={[
              {
                id: 'prompt',
                title: '提示词',
                meta: `${getTextWordCount(visibleRequestLog.systemPrompt)} 字`,
                content: visibleRequestLog.systemPrompt,
              },
              {
                id: 'context',
                title: '资料',
                meta: `${visibleRequestLog.contextWordCount} 字`,
                content: visibleRequestLog.contextText,
                tone: 'cyan',
              },
              {
                id: 'user',
                title: '用户要求',
                meta: `${getTextWordCount(visibleRequestLog.userContent)} 字`,
                content: visibleRequestLog.visibleUserContent.trim() ? visibleRequestLog.userContent : '',
                tone: 'amber',
              },
            ]}
            fillSingleGroup
            fillGroupWeights={getBodyAiLogFillGroupWeights(visibleRequestLog)}
            storageKey="workbench_ai_request_log_groups"
          />
        </WorkbenchModal>
      )}
      <ConfirmDialog
        isOpen={isSessionLimitConfirmOpen}
        title="会话已达上限"
        description={`最多保留 ${MAX_AI_SESSIONS} 个会话。是否清空当前会话并新开一个空白会话？`}
        cancelText="取消"
        confirmText="清空"
        confirmVariant="warning"
        onClose={() => setIsSessionLimitConfirmOpen(false)}
        onConfirm={() => {
          setIsSessionLimitConfirmOpen(false);
          resetSessions();
        }}
      />
    </aside>
  );
}
