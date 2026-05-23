import { Bot, Eraser, LoaderCircle, Send, Settings, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  modelName?: string;
  createdAt: string;
}

const CHAT_MODEL_KEY = 'xinyuexia_ai_chat_model_id';
const CHAT_PROMPT_KEY = 'xinyuexia_ai_chat_system_prompt';
const CHAT_MESSAGES_KEY = 'xinyuexia_ai_chat_messages';
const DEFAULT_SYSTEM_PROMPT = '你是月下写作里的 AI 对话助手。请用中文回答，表达清楚，必要时给出可执行的建议。';

function readEnabledModels() {
  return readModelSnapshot().filter((model) => model.enabled);
}

function createMessage(role: ChatRole, content: string, modelName?: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    modelName,
    createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function buildConversation(messages: ChatMessage[], input: string) {
  const history = messages
    .slice(-12)
    .map((message) => `${message.role === 'user' ? '用户' : 'AI'}：\n${message.content}`)
    .join('\n\n');

  return history
    ? `以下是此前对话：\n\n${history}\n\n请回复用户的新消息：\n${input}`
    : input;
}

export function AiChatPage() {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [models, setModels] = useState<ModelItem[]>(readEnabledModels);
  const [selectedModelId, setSelectedModelId] = usePersistentState(CHAT_MODEL_KEY, '');
  const [systemPrompt, setSystemPrompt] = usePersistentState(CHAT_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
  const [messages, setMessages] = usePersistentState<ChatMessage[]>(CHAT_MESSAGES_KEY, []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? models[0] ?? null,
    [models, selectedModelId],
  );

  useEffect(() => {
    const syncModels = () => setModels(readEnabledModels());
    window.addEventListener(APP_EVENTS.modelsUpdated, syncModels);
    return () => window.removeEventListener(APP_EVENTS.modelsUpdated, syncModels);
  }, []);

  useEffect(() => {
    if (!selectedModelId && models[0]) setSelectedModelId(models[0].id);
    if (selectedModelId && models.length > 0 && !models.some((model) => model.id === selectedModelId)) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = createMessage('user', text);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');

    if (!selectedModel) {
      setMessages([...nextMessages, createMessage('assistant', '尚未配置可用模型。请先到“模型管理”中新增并启用模型。')]);
      return;
    }

    setIsLoading(true);
    try {
      const content = await callModel({
        model: selectedModel,
        prompt: systemPrompt,
        userContent: buildConversation(messages, text),
        recordType: 'chat',
      });
      setMessages([...nextMessages, createMessage('assistant', content, selectedModel.name)]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        createMessage('assistant', error instanceof Error ? `【错误】${error.message}` : '【错误】模型请求失败。', selectedModel.name),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900">AI对话</h1>
          <p className="mt-1 text-xs text-slate-400">测试专区</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/model-manage')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" />
            模型管理
          </button>
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <Eraser className="h-4 w-4" />
            清空对话
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <main className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600">输入内容开始对话</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[920px] space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`max-w-[74%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-xl px-4 py-3 text-sm leading-7 shadow-sm ${
                          isUser
                            ? 'bg-brand text-white'
                            : 'border border-slate-100 bg-slate-50 text-slate-700'
                        }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        <div className={`mt-1 text-[11px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                          {message.modelName ? `${message.modelName} · ` : ''}{message.createdAt}
                        </div>
                      </div>
                      {isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <UserRound className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    </div>
                    AI 正在回复...
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <div className="mx-auto flex max-w-[920px] items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="输入消息，Enter 发送，Shift + Enter 换行"
                className="h-[92px] min-h-[92px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition-colors focus:border-brand focus:bg-white"
              />
              <button
                onClick={() => void sendMessage()}
                disabled={isLoading || !input.trim()}
                className="flex h-[44px] items-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:bg-slate-300"
              >
                <Send className="h-4 w-4" />
                发送
              </button>
            </div>
          </div>
        </main>

        <aside className="flex min-h-0 flex-col bg-slate-50 p-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">AI模型</label>
            <select
              value={selectedModel?.id ?? ''}
              onChange={(event) => setSelectedModelId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand"
            >
              {models.length === 0 ? (
                <option value="">无可用模型</option>
              ) : (
                models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))
              )}
            </select>
            <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              {selectedModel ? `当前模型ID：${selectedModel.model || selectedModel.id}` : '请先启用模型'}
            </div>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">系统提示词</label>
            <textarea
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              className="min-h-0 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-brand focus:bg-white"
            />
            <button
              onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
              className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              恢复默认
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
