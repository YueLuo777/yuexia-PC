import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';

export type WorkbenchAITool = 'ai';

interface WorkbenchAIPanelProps {
  activeTool: WorkbenchAITool;
  selectedChapterContent: string;
  onClose: () => void;
  onReplaceContent: (content: string) => void;
}

function readConfig() {
  return {
    models: readModelSnapshot(),
    prompts: readPromptSnapshot().prompts,
  };
}

function getToolName(_tool: WorkbenchAITool) {
  return 'AI';
}

function getDefaultInstruction(_tool: WorkbenchAITool) {
  return '请根据我的要求处理当前章节正文。';
}

export function WorkbenchAIPanel({
  activeTool,
  selectedChapterContent,
  onClose,
  onReplaceContent,
}: WorkbenchAIPanelProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [models, setModels] = useState<ModelItem[]>(() => readConfig().models);
  const [prompts, setPrompts] = useState<PromptItem[]>(() => readConfig().prompts);
  const [selectedModelId, setSelectedModelId] = usePersistentState<string>('xinyuexia_workbench_ai_model', '');
  const [selectedPromptId, setSelectedPromptId] = usePersistentState<string>('xinyuexia_workbench_ai_prompt', '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [outputFontSize, setOutputFontSize] = useState(20);
  const [splitPercent, setSplitPercent] = usePersistentState<number>('xinyuexia_workbench_ai_split_percent', 54);
  const contentRef = useRef<HTMLDivElement>(null);

  const enabledModels = useMemo(() => models.filter((model) => model.enabled), [models]);
  const selectedModel = enabledModels.find((model) => model.id === selectedModelId) ?? enabledModels[0] ?? null;
  const selectedPrompt = prompts.find((prompt) => prompt.id === selectedPromptId) ?? null;
  const toolName = getToolName(activeTool);
  const outputWordCount = output.replace(/\s/g, '').length;

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
    if (!selectedModelId && enabledModels[0]) {
      setSelectedModelId(enabledModels[0].id);
    }
  }, [enabledModels, selectedModelId, setSelectedModelId]);

  const flashStatus = (text: string) => {
    setStatusText(text);
    window.setTimeout(() => setStatusText(''), 1600);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!selectedModel) {
      setOutput('尚未配置可用模型。请先到“模型管理”中新增并启用模型。');
      return;
    }

    setIsLoading(true);
    setOutput((prev) => prev || '正在生成...');
    try {
      const content = await callModel({
        model: selectedModel,
        prompt: selectedPrompt?.content ?? getDefaultInstruction(activeTool),
        userContent: text,
        chapterContext: selectedChapterContent.trim(),
      });
      setOutput(content);
    } catch (error) {
      setOutput(error instanceof Error ? `【错误】${error.message}` : '【错误】模型请求失败。');
    } finally {
      setIsLoading(false);
    }
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

  const startSplitResize = (event: ReactMouseEvent) => {
    event.preventDefault();
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;

    const handleMove = (moveEvent: MouseEvent) => {
      const next = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(35, Math.min(70, Math.round(next))));
    };

    const handleUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <aside className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-gray-100 px-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{toolName}智能体</span>
          {statusText && <span className="text-[11px] text-brand">{statusText}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="收起"
          >
            收起
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="grid min-h-0 flex-1 overflow-hidden p-3"
        style={{ gridTemplateColumns: `${splitPercent}% 8px minmax(0, 1fr)` }}
      >
        <section className="flex min-w-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 rounded-xl border border-gray-200 bg-gray-50">
            <textarea
              value={output}
              onChange={(event) => setOutput(event.target.value)}
              placeholder="暂无输出内容..."
              className="editor-scrollbar h-full w-full resize-none rounded-xl border-0 bg-transparent p-4 leading-8 text-gray-700 outline-none"
              style={{ fontSize: outputFontSize }}
            />
          </div>
          <div className="mt-3 flex shrink-0 items-center justify-between gap-3 text-sm text-gray-400">
            <span>替换后可按 Ctrl+Z 撤回上一次替换</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOutputFontSize((prev) => Math.max(14, prev - 1))}
                className="h-8 w-8 rounded-lg bg-brand text-lg font-bold text-white hover:bg-brand-dark"
              >
                -
              </button>
              <span className="min-w-8 text-center text-base font-bold text-gray-700">{outputFontSize}</span>
              <button
                onClick={() => setOutputFontSize((prev) => Math.min(32, prev + 1))}
                className="h-8 w-8 rounded-lg bg-brand text-lg font-bold text-white hover:bg-brand-dark"
              >
                +
              </button>
            </div>
            <span className="text-xl font-bold text-brand">{outputWordCount}字</span>
          </div>
          <div className="mt-3 grid shrink-0 grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (!output.trim()) return;
                onReplaceContent(output);
                flashStatus('已替换正文');
              }}
              disabled={!output.trim()}
              className="rounded-lg bg-brand px-3 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              替换正文
            </button>
            <button
              onClick={() => setOutput('')}
              disabled={!output.trim()}
              className="rounded-lg bg-blue-800 px-3 py-3 text-base font-bold text-white hover:bg-blue-900 disabled:bg-blue-900/45 disabled:text-white/45"
            >
              重置输出
            </button>
            <button
              onClick={copyOutput}
              disabled={!output.trim()}
              className="rounded-lg bg-brand px-3 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              复制
            </button>
            <button
              onClick={() => setOutput('')}
              className="col-start-3 rounded-lg bg-red-600 px-3 py-3 text-base font-bold text-white hover:bg-red-700"
            >
              清空
            </button>
          </div>
          <div className="mt-3 shrink-0">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="请输入你的要求..."
              className="h-10 w-full resize-none rounded-full border border-gray-200 px-4 py-2 text-sm leading-5 outline-none focus:border-brand"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={isLoading || !input.trim()}
              className="mt-3 w-full rounded-lg bg-brand px-3 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              {isLoading ? '生成中...' : '发送'}
            </button>
          </div>
        </section>

        <div
          onMouseDown={startSplitResize}
          className="group flex cursor-ew-resize items-center justify-center"
          title="拖拽调整左右区域宽度"
        >
          <div className="h-full w-[3px] rounded-full bg-gray-200 transition-colors group-hover:bg-brand" />
        </div>

        <section className="flex min-w-0 flex-col overflow-hidden">
          <div className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="grid grid-cols-[42px_minmax(0,1fr)_48px] items-center gap-2">
              <span className="text-base text-gray-500">模型</span>
              <div className="relative">
                <select
                  value={selectedModel?.id ?? ''}
                  onChange={(event) => setSelectedModelId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-base font-semibold text-gray-700 outline-none focus:border-brand"
                >
                  {enabledModels.length === 0 ? (
                    <option value="">无可用模型</option>
                  ) : (
                    enabledModels.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <span className={`text-base ${selectedModel ? 'text-emerald-500' : 'text-red-500'}`}>
                {selectedModel ? '正常' : '失败'}
              </span>

              <span className="text-base text-gray-500">提示词</span>
              <div className="relative">
                <select
                  value={selectedPrompt?.id ?? ''}
                  onChange={(event) => setSelectedPromptId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-base font-semibold text-gray-700 outline-none focus:border-brand"
                >
                  <option value="">默认提示词</option>
                  {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3">
            <button className="h-7 w-7 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">+</button>
            <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-bold text-brand">1</span>
          </div>
          <div className="mt-3 min-h-0 flex-1 rounded-xl border border-gray-200 bg-gray-50" />
          <div className="mt-3 shrink-0">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="请输入你的要求..."
              className="h-10 w-full resize-none rounded-full border border-gray-200 px-4 py-2 text-sm leading-5 outline-none focus:border-brand"
            />
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <button
                onClick={() => void sendMessage()}
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-brand px-3 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
              >
                {isLoading ? '生成中' : '发送'}
              </button>
              <button
                onClick={() => setIsLoading(false)}
                disabled={!isLoading}
                className="rounded-lg border border-gray-200 px-3 py-3 text-base font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
              >
                停止
              </button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
