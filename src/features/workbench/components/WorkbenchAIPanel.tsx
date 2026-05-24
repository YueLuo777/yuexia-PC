import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';

export type WorkbenchAITool = 'ai';

interface AiSession {
  id: number;
  input: string;
  output: string;
  messages: AiMessage[];
  linkChapter: boolean;
  hasSentChapterContext: boolean;
}

interface AiMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface WorkbenchAIPanelProps {
  activeTool: WorkbenchAITool;
  workId: number | string;
  selectedChapterContent: string;
  onClose?: () => void;
  onReplaceContent: (content: string) => void;
  onUndoReplace?: () => void;
  canUndoReplace?: boolean;
  onOpenModelManage?: () => void;
  onOpenAgentManage?: () => void;
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
              .filter((message): message is AiMessage => Boolean(message && typeof message === 'object' && 'content' in message))
              .map((message, messageIndex) => ({
                id: Number.isFinite(message.id) ? Number(message.id) : messageIndex + 1,
                role: message.role === 'user' ? 'user' : 'assistant',
                content: typeof message.content === 'string' ? message.content : '',
              }))
          : [],
        linkChapter: Boolean(session.linkChapter),
        hasSentChapterContext: Boolean(session.hasSentChapterContext),
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
  onClose,
  onReplaceContent,
  onUndoReplace,
  canUndoReplace = false,
  onOpenModelManage,
  onOpenAgentManage,
}: WorkbenchAIPanelProps) {
  const storageKey = `xinyuexia_workbench_ai_sessions_${workId}`;
  const initialAiState = useMemo(() => readStoredAiState(storageKey), [storageKey]);
  const [sessions, setSessions] = useState<AiSession[]>(() => initialAiState.sessions);
  const [activeSessionId, setActiveSessionId] = useState(() => initialAiState.activeSessionId);
  const [deleteSessionMenu, setDeleteSessionMenu] = useState<{ sessionId: number; x: number; y: number } | null>(null);
  const [models, setModels] = useState<ModelItem[]>(() => readConfig().models);
  const [prompts, setPrompts] = useState<PromptItem[]>(() => readConfig().prompts);
  const [selectedModelId, setSelectedModelId] = usePersistentState<string>('xinyuexia_workbench_ai_left_model', '');
  const [selectedPromptId, setSelectedPromptId] = usePersistentState<string>('xinyuexia_workbench_ai_left_prompt', '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [outputFontSize, setOutputFontSize] = useState(20);
  const nextSessionIdRef = useRef(initialAiState.nextSessionId);
  const nextMessageIdRef = useRef(initialAiState.nextMessageId);
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipNextSaveRef = useRef(true);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const input = activeSession?.input ?? '';
  const output = activeSession?.output ?? '';
  const enabledModels = useMemo(() => models.filter((model) => model.enabled), [models]);
  const selectedModel = enabledModels.find((model) => model.id === selectedModelId) ?? enabledModels[0] ?? null;
  const selectedPrompt = prompts.find((prompt) => prompt.id === selectedPromptId) ?? null;
  const outputWordCount = output.replace(/\s/g, '').length;
  const linkedChapterWordCount = selectedChapterContent.replace(/\s/g, '').length;

  const updateSession = (sessionId: number, patch: Partial<Omit<AiSession, 'id'>>) => {
    setSessions((prev) => prev.map((session) => (
      session.id === sessionId ? { ...session, ...patch } : session
    )));
  };

  const updateActiveSession = (patch: Partial<Omit<AiSession, 'id'>>) => {
    if (!activeSession) return;
    updateSession(activeSession.id, patch);
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
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setDeleteSessionMenu(null);
  }, [storageKey]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify({
      sessions,
      activeSessionId,
      nextSessionId: nextSessionIdRef.current,
      nextMessageId: nextMessageIdRef.current,
    }));
  }, [activeSessionId, sessions, storageKey]);

  useEffect(() => {
    if (!selectedModelId && enabledModels[0]) {
      setSelectedModelId(enabledModels[0].id);
    }
  }, [enabledModels, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    if (prompts.length === 0) {
      if (selectedPromptId) setSelectedPromptId('');
      return;
    }
    if (!prompts.some((prompt) => prompt.id === selectedPromptId)) {
      setSelectedPromptId(prompts[0].id);
    }
  }, [prompts, selectedPromptId, setSelectedPromptId]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    const closeDeleteMenu = () => setDeleteSessionMenu(null);
    window.addEventListener('click', closeDeleteMenu);
    return () => window.removeEventListener('click', closeDeleteMenu);
  }, []);

  const flashStatus = (text: string) => {
    setStatusText(text);
    window.setTimeout(() => setStatusText(''), 1600);
  };

  const sendMessage = async (configModel = selectedModel, configPrompt = selectedPrompt) => {
    if (!activeSession) return;
    const sessionId = activeSession.id;
    const text = input.trim();
    if (!text || isLoading) return;
    const shouldAttachChapter = activeSession.linkChapter && !activeSession.hasSentChapterContext && selectedChapterContent.trim();
    const userMessage: AiMessage = { id: nextMessageIdRef.current++, role: 'user', content: text };
    const assistantMessage: AiMessage = { id: nextMessageIdRef.current++, role: 'assistant', content: '正在生成...' };
    const nextMessages = [...activeSession.messages, userMessage, assistantMessage];
    updateSession(sessionId, {
      input: '',
      messages: nextMessages,
      output: '正在生成...',
      hasSentChapterContext: activeSession.hasSentChapterContext || Boolean(shouldAttachChapter),
    });

    if (!configModel) {
      const errorText = '尚未配置可用模型。请先到“模型管理”中新增并启用模型。';
      updateSession(sessionId, {
        output: errorText,
        messages: nextMessages.map((message) => (
          message.id === assistantMessage.id ? { ...message, content: errorText } : message
        )),
      });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    try {
      const content = await callModel({
        model: configModel,
        prompt: configPrompt?.content ?? getDefaultInstruction(activeTool),
        userContent: text,
        chapterContext: shouldAttachChapter ? selectedChapterContent.trim() : '',
        signal: controller.signal,
      });
      updateSession(sessionId, {
        output: content,
        messages: nextMessages.map((message) => (
          message.id === assistantMessage.id ? { ...message, content } : message
        )),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        flashStatus('已停止输出');
      } else {
        const errorText = error instanceof Error ? `【错误】${error.message}` : '【错误】模型请求失败。';
        updateSession(sessionId, {
          output: errorText,
          messages: nextMessages.map((message) => (
            message.id === assistantMessage.id ? { ...message, content: errorText } : message
          )),
        });
      }
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const addSession = () => {
    if (sessions.length >= 10) {
      flashStatus('最多10个会话');
      return;
    }
    const nextId = nextSessionIdRef.current;
    nextSessionIdRef.current += 1;
    setSessions((prev) => [...prev, {
      id: nextId,
      input: '',
      output: '',
      messages: [],
      linkChapter: false,
      hasSentChapterContext: false,
    }]);
    setActiveSessionId(nextId);
    setDeleteSessionMenu(null);
  };

  const deleteSession = (sessionId: number) => {
    if (sessions.length <= 1) {
      flashStatus('至少保留1个会话');
      setDeleteSessionMenu(null);
      return;
    }
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(next[Math.max(0, prev.findIndex((session) => session.id === sessionId) - 1)]?.id ?? next[0].id);
      }
      return next;
    });
    setDeleteSessionMenu(null);
  };

  const stopMessage = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const copyOutput = async () => {
    if (!output.trim()) return;
    try {
      await navigator.clipboard.writeText(output);
      flashStatus('已复制输出内容');
    } catch {
      flashStatus('复制失败');
    }
  };

  const renderConfigPanel = (
    model: ModelItem | null,
    modelId: string,
    onModelChange: (value: string) => void,
    prompt: PromptItem | null,
    promptId: string,
    onPromptChange: (value: string) => void,
  ) => (
    <>
      <div className="shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
        <div className="grid grid-cols-[70px_160px_56px] items-center gap-1.5">
          <span className="flex items-center gap-1 whitespace-nowrap text-sm text-gray-500">
            模型
            {model ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
          </span>
          <div className="relative min-w-0">
            <select
              value={model?.id ?? modelId}
              onChange={(event) => onModelChange(event.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white px-2.5 pr-7 text-sm font-semibold text-gray-700 outline-none focus:border-brand"
            >
              {enabledModels.length === 0 ? (
                <option value="" className="h-[55px] py-4 text-sm leading-[55px]">无可用模型</option>
              ) : (
                enabledModels.map((item) => (
                  <option key={item.id} value={item.id} className="h-[55px] py-4 text-sm leading-[55px]">{item.name}</option>
                ))
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>
          {onOpenModelManage ? (
            <button
              onClick={onOpenModelManage}
              className="h-9 shrink-0 rounded-lg bg-brand px-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              管理
            </button>
          ) : <span />}

          <span className="whitespace-nowrap text-sm text-gray-500">提示词</span>
          <div className="relative min-w-0">
            <select
              value={prompt?.id ?? prompts[0]?.id ?? promptId}
              onChange={(event) => onPromptChange(event.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white px-2.5 pr-7 text-sm font-semibold text-gray-700 outline-none focus:border-brand"
            >
              {prompts.length === 0 ? (
                <option value="" className="h-9 py-2 text-sm leading-9">无可用提示词</option>
              ) : (
                prompts.map((item) => (
                  <option key={item.id} value={item.id} className="h-9 py-2 text-sm leading-9">{item.name}</option>
                ))
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>
          {onOpenAgentManage ? (
            <button
              onClick={onOpenAgentManage}
              className="h-9 shrink-0 rounded-lg bg-brand px-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              管理
            </button>
          ) : <span />}
        </div>
      </div>
      <div className="mt-2 flex h-9 shrink-0 items-center gap-1.5 overflow-x-auto rounded-full border border-gray-200 bg-gray-50 px-2.5">
        <button
          onClick={addSession}
          disabled={sessions.length >= 10}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand disabled:text-gray-300"
          title="新建会话"
        >
          <span className="-mt-px block text-[20px] font-bold leading-none">+</span>
        </button>
        {sessions.map((session, index) => (
          <div key={session.id} className="relative shrink-0">
            <button
              onClick={() => {
                setActiveSessionId(session.id);
                setDeleteSessionMenu(null);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDeleteSessionMenu({ sessionId: session.id, x: event.clientX, y: event.clientY });
              }}
              className={`flex h-7 min-w-7 items-center justify-center rounded-lg border px-2 text-sm font-bold leading-none transition-colors ${
                session.id === activeSessionId
                  ? 'border-brand/30 bg-brand/10 text-brand'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-brand hover:text-brand'
              }`}
            >
              {index + 1}
            </button>
          </div>
        ))}
      </div>
      {deleteSessionMenu && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteSession(deleteSessionMenu.sessionId);
          }}
          className="fixed z-[300] rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-red-600"
          style={{ left: deleteSessionMenu.x, top: deleteSessionMenu.y }}
        >
          删除
        </button>
      )}
    </>
  );

  return (
    <aside className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-gray-100 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-bold text-gray-900">AI对话</span>
          {statusText && <span className="text-[11px] text-brand">{statusText}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => window.dispatchEvent(new Event('open_chapter_associate'))}
            className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-brand-dark"
          >
            关联章节
          </button>
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

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden p-2.5">
        {renderConfigPanel(
          selectedModel,
          selectedModelId,
          setSelectedModelId,
          selectedPrompt,
          selectedPromptId,
          setSelectedPromptId,
        )}
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
          {activeSession?.messages.length ? (
            <div className="flex flex-col gap-3">
              {activeSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 leading-7 shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-brand text-white'
                        : 'rounded-bl-md border border-gray-200 bg-white text-gray-700'
                    }`}
                    style={{ fontSize: outputFontSize }}
                  >
                    {message.content}
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
        <div className="mt-2 flex shrink-0 items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => updateActiveSession({
                linkChapter: !activeSession?.linkChapter,
                hasSentChapterContext: false,
              })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors ${
                activeSession?.linkChapter
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand'
              }`}
            >
              {activeSession?.linkChapter ? '已关联本章' : '关联本章'}
            </button>
            {activeSession?.linkChapter && (
              <span className="shrink-0 text-sm font-bold text-brand">
                关联字数：{linkedChapterWordCount}字
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="shrink-0 text-base font-bold text-brand">{outputWordCount}字</span>
            <button
              onClick={() => setOutputFontSize((prev) => Math.max(14, prev - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[26px] font-bold leading-none text-white hover:bg-brand-dark"
            >
              -
            </button>
            <span className="min-w-8 text-center text-base font-bold text-gray-700">{outputFontSize}</span>
            <button
              onClick={() => setOutputFontSize((prev) => Math.min(32, prev + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[26px] font-bold leading-none text-white hover:bg-brand-dark"
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-2 shrink-0">
          <textarea
            value={input}
            onChange={(event) => updateActiveSession({ input: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="请输入你的要求..."
            className="h-9 w-full resize-none rounded-full border border-gray-200 px-3.5 py-1.5 text-sm leading-5 outline-none focus:border-brand"
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (!output.trim()) return;
                onReplaceContent(output);
                flashStatus('已替换正文');
              }}
              disabled={!output.trim()}
              className="rounded-lg bg-brand px-2 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              替换正文
            </button>
            <button
              onClick={onUndoReplace}
              disabled={!canUndoReplace}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              撤回替换
            </button>
            <button
              onClick={copyOutput}
              disabled={!output.trim()}
              className="rounded-lg bg-brand px-2 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              复制
            </button>
          </div>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_64px_64px] gap-2">
            <button
              onClick={() => void sendMessage()}
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              {isLoading ? '生成中...' : '发送'}
            </button>
            <button
              onClick={stopMessage}
              disabled={!isLoading}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              停止
            </button>
            <button
              onClick={() => updateActiveSession({ output: '', messages: [] })}
              className="rounded-lg bg-red-600 px-2 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              清空
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
