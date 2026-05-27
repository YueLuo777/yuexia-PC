import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import { readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { APP_EVENTS } from '@/shared/events/appEvents';

type TestStatus = 'idle' | 'running' | 'success' | 'failed' | 'aborted';
type ChainId = 'brainstorm' | 'brainstormOutline' | 'outline' | 'detailOutline' | 'summary' | 'extract' | 'continue' | 'review' | 'update' | 'title';

interface ChainConfig {
  id: ChainId;
  group: string;
  title: string;
  promptCategory: string;
  description: string;
  defaultInput: string;
  contextLabel: string;
  readContext: () => string;
}

function nowTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function parseSettingBody(content: string) {
  try {
    const parsed = JSON.parse(content) as { type?: string; body?: string };
    return [parsed.type, parsed.body].filter(Boolean).join('：');
  } catch {
    return content;
  }
}

function parseSettingRaw(content: string) {
  try {
    return JSON.parse(content) as { type?: string; body?: string };
  } catch {
    return { body: content };
  }
}

function parseAiChatTurns(content: string) {
  const turns: Array<{ role: 'user' | 'ai'; content: string }> = [];
  const markerPattern = /\[\[(USER|AI)\]\]\n/g;
  const matches = [...content.matchAll(markerPattern)];
  if (matches.length === 0) {
    if (content.trim()) turns.push({ role: 'ai', content: content.trim() });
    return turns;
  }
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? content.length : content.length;
    const text = content.slice(start, end).trim();
    if (!text) return;
    turns.push({ role: match[1] === 'USER' ? 'user' : 'ai', content: text });
  });
  return turns;
}

function stripThinking(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

function getLatestUsefulAiText(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns].reverse().find((turn) => turn.role === 'ai' && turn.content.trim());
  if (latestAi) return stripThinking(latestAi.content);
  return stripThinking(content);
}

function getBrainstormEntryBody(entry: WorkbenchLibraryEntry) {
  const parsed = parseSettingRaw(entry.content);
  return getLatestUsefulAiText(parsed.body || entry.content);
}

function readLocalStorageJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function readStoredLibraryEntries() {
  const matched: WorkbenchLibraryEntry[] = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index) ?? '';
      if (!key.startsWith('xinyuexia_workbench_settings_') && !key.startsWith('xinyuexia_workbench_outline_')) continue;
      matched.push(...readLocalStorageJson<WorkbenchLibraryEntry[]>(key, []));
    }
  } catch {
    return [];
  }
  return matched.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

function readLibraryEntriesByTab(tabs: string[], limit = 8) {
  return readStoredLibraryEntries()
    .filter((entry) => tabs.includes(entry.tab))
    .slice(0, limit)
    .map((entry) => {
      const body = entry.tab === '脑洞' ? getBrainstormEntryBody(entry) : parseSettingBody(entry.content);
      return `【${entry.tab}】${entry.title}\n${body.slice(0, 800)}`;
    })
    .join('\n\n');
}

function readLatestBrainstormForOutlineTest() {
  const entry = readStoredLibraryEntries().find((item) => item.tab === '脑洞');
  if (!entry) return '';
  return getBrainstormEntryBody(entry);
}

function readChapterDraftContext() {
  try {
    const candidates: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index) ?? '';
      if (!key.startsWith('xinyuexia_workbench_') && !key.startsWith('xinyuexia_novel_')) continue;
      const value = localStorage.getItem(key) ?? '';
      if (value.length > 80 && /[一-龥]/.test(value)) candidates.push(value.slice(0, 1200));
      if (candidates.length >= 3) break;
    }
    return candidates[0] ?? '';
  } catch {
    return '';
  }
}

function buildChainConfigs(): ChainConfig[] {
  return [
    {
      id: 'brainstorm',
      group: '作品设定',
      title: '脑洞生成',
      promptCategory: '脑洞',
      description: '读取脑洞分类提示词，把用户输入交给 AI 生成脑洞。',
      defaultInput: '写一个修仙小说脑洞，要求开局钩子强，主角能力危险但好用。',
      contextLabel: '已读取脑洞库内容',
      readContext: () => readLibraryEntriesByTab(['脑洞'], 5),
    },
    {
      id: 'brainstormOutline',
      group: '作品设定',
      title: '脑洞关联到大纲',
      promptCategory: '设定',
      description: '模拟真实大纲生成：读取设定提示词、关联最新脑洞，并展示最终发给 AI 的隐藏 userContent。',
      defaultInput: '请根据关联脑洞扩写成可导入设定的 Markdown，一级标题用 # 分类，二级标题用 ## 设定名。',
      contextLabel: '已读取最新关联脑洞',
      readContext: () => readLatestBrainstormForOutlineTest(),
    },
    {
      id: 'outline',
      group: '作品设定',
      title: '大纲设定',
      promptCategory: '设定',
      description: '读取脑洞、角色和已有大纲，让 AI 整理成可放入分类的大纲设定。',
      defaultInput: '请根据这些脑洞整理出小说主线、核心设定、等级体系和伏笔。',
      contextLabel: '已读取脑洞/角色/大纲',
      readContext: () => readLibraryEntriesByTab(['脑洞', '角色', '大纲'], 10),
    },
    {
      id: 'detailOutline',
      group: '作品设定',
      title: '生成细纲',
      promptCategory: '细纲',
      description: '读取大纲、角色和章节概要，测试细纲生成链路。',
      defaultInput: '请为下一章生成一份可直接写正文的细纲，包含场景、冲突、转折和结尾钩子。',
      contextLabel: '已读取大纲/角色/概要',
      readContext: () => readLibraryEntriesByTab(['大纲', '角色', '章节概要', '概要'], 10),
    },
    {
      id: 'summary',
      group: '作品设定',
      title: '章节概要',
      promptCategory: '概要',
      description: '读取章节正文或现有概要，测试章节概要生成链路。',
      defaultInput: '请把当前章节整理成 200 字以内概要，并保留关键伏笔。',
      contextLabel: '已读取章节/概要',
      readContext: () => readChapterDraftContext() || readLibraryEntriesByTab(['章节概要', '卷概要', '概要'], 10),
    },
    {
      id: 'extract',
      group: '提炼剧情',
      title: '提炼剧情',
      promptCategory: '提炼剧情',
      description: '模拟上传文本后的剧情提炼请求，检查提炼提示词和模型请求。',
      defaultInput: '请从下面文本提炼剧情点：主角夜入阴阳阙，发现月光落地成灰，师姐留下的香炉突然裂开。',
      contextLabel: '提炼文本',
      readContext: () => '这里模拟 txt/doc 导入后的章节文本。正式提炼页会读取用户上传的文件，并按批次发送给 AI。',
    },
    {
      id: 'continue',
      group: '写作助手',
      title: '正文续写',
      promptCategory: '正文',
      description: '读取当前章节和作品设定，测试续写链路。',
      defaultInput: '请承接当前内容继续写 800 字，保持风格，并让冲突继续升级。',
      contextLabel: '已读取章节/作品设定',
      readContext: () => [readChapterDraftContext(), readLibraryEntriesByTab(['角色', '大纲', '细纲'], 8)].filter(Boolean).join('\n\n'),
    },
    {
      id: 'review',
      group: '写作助手',
      title: '审核点评',
      promptCategory: '审核',
      description: '读取当前章节，测试审核、问题定位和修改建议链路。',
      defaultInput: '请审核这段正文，指出节奏、逻辑、人物动机和爽点问题。',
      contextLabel: '已读取章节正文',
      readContext: () => readChapterDraftContext(),
    },
    {
      id: 'update',
      group: '写作助手',
      title: '更新状态',
      promptCategory: '更新',
      description: '读取角色/设定和新章节，测试写完章节后的状态更新链路。',
      defaultInput: '请根据新章节，更新角色状态、关系变化、伏笔推进和新增设定。',
      contextLabel: '已读取角色/设定/章节',
      readContext: () => [readLibraryEntriesByTab(['角色', '大纲'], 8), readChapterDraftContext()].filter(Boolean).join('\n\n'),
    },
    {
      id: 'title',
      group: '写作助手',
      title: '标题优化',
      promptCategory: '正文',
      description: '读取章节内容，测试章节标题优化链路。',
      defaultInput: '请给当前章节生成 10 个更有悬念、更适合网文的章节标题。',
      contextLabel: '已读取章节正文',
      readContext: () => readChapterDraftContext(),
    },
  ];
}

function readConfig() {
  return {
    models: readModelSnapshot().filter((model) => model.enabled),
    prompts: readPromptSnapshot().prompts,
  };
}

export function BrainstormAiChainTestPage() {
  const navigate = useNavigate();
  const chains = useMemo(buildChainConfigs, []);
  const initialConfig = useMemo(readConfig, []);
  const [models, setModels] = useState<ModelItem[]>(initialConfig.models);
  const [prompts, setPrompts] = useState<PromptItem[]>(initialConfig.prompts);
  const [activeChainId, setActiveChainId] = useState<ChainId>('brainstorm');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['作品设定', '写作助手', '提炼剧情']));
  const [selectedModelId, setSelectedModelId] = useState(initialConfig.models[0]?.id ?? '');
  const [selectedPromptIdByChain, setSelectedPromptIdByChain] = useState<Record<string, string>>({});
  const [inputByChain, setInputByChain] = useState<Record<string, string>>(() => (
    Object.fromEntries(chains.map((chain) => [chain.id, chain.defaultInput]))
  ));
  const [context, setContext] = useState('点击“重新读取”后，会读取这个链路需要的上下文。也可以直接在这里粘贴测试内容。');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<TestStatus>('idle');
  const [logs, setLogs] = useState<string[]>(['等待测试。']);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedMs, setFinishedMs] = useState<number | null>(null);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [requestPreview, setRequestPreview] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);

  const activeChain = chains.find((chain) => chain.id === activeChainId) ?? chains[0];
  const selectedModel = models.find((model) => model.id === selectedModelId) ?? models[0] ?? null;
  const promptOptions = prompts.filter((prompt) => prompt.category === activeChain.promptCategory);
  const selectedPromptId = selectedPromptIdByChain[activeChain.id] ?? promptOptions[0]?.id ?? '';
  const selectedPrompt = promptOptions.find((prompt) => prompt.id === selectedPromptId) ?? promptOptions[0] ?? null;
  const input = inputByChain[activeChain.id] ?? activeChain.defaultInput;
  const isRunning = status === 'running';
  const elapsedMs = startedAt ? Math.round(performance.now() - startedAt) : finishedMs;

  const pushLog = (message: string) => {
    setLogs((prev) => [`${nowTime()} ${message}`, ...prev].slice(0, 120));
  };

  const refreshContext = () => {
    try {
      const next = activeChain.readContext();
      setContext(next || '没有读取到现有数据。你也可以直接在这里手动粘贴测试上下文。');
      pushLog(`已刷新上下文：${activeChain.contextLabel}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setContext(`读取上下文失败：${message}`);
      pushLog(`读取上下文失败：${message}`);
    }
  };

  useEffect(() => {
    const updateConfig = () => {
      const next = readConfig();
      setModels(next.models);
      setPrompts(next.prompts);
      setSelectedModelId((current) => next.models.some((model) => model.id === current) ? current : next.models[0]?.id ?? '');
    };
    window.addEventListener(APP_EVENTS.modelsUpdated, updateConfig);
    window.addEventListener(APP_EVENTS.promptsUpdated, updateConfig);
    return () => {
      window.removeEventListener(APP_EVENTS.modelsUpdated, updateConfig);
      window.removeEventListener(APP_EVENTS.promptsUpdated, updateConfig);
    };
  }, []);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    setContext('点击“重新读取”后，会读取这个链路需要的上下文。也可以直接在这里粘贴测试内容。');
    setOutput('');
    setStatus('idle');
    setFinishedMs(null);
    setRequestPreview('');
  }, [activeChainId]);

  useEffect(() => {
    if (!isRunning) {
      setLoadingDotCount(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const setChainPromptId = (id: string) => {
    setSelectedPromptIdByChain((prev) => ({ ...prev, [activeChain.id]: id }));
  };

  const setChainInput = (value: string) => {
    setInputByChain((prev) => ({ ...prev, [activeChain.id]: value }));
  };

  const runTest = async () => {
    if (isRunning) return;
    setOutput('');
    setFinishedMs(null);
    setStatus('running');
    const start = performance.now();
    setStartedAt(start);

    if (!selectedModel) {
      setStartedAt(null);
      setStatus('failed');
      setOutput('【错误】没有读取到模型。请先到模型管理里新增模型，并确保模型可用。');
      pushLog('失败：没有读取到模型。');
      return;
    }
    if (!selectedPrompt) {
      setStartedAt(null);
      setStatus('failed');
      setOutput(`【错误】没有读取到“${activeChain.promptCategory}”分类下的提示词。请先到提示词管理里创建对应提示词。`);
      pushLog(`失败：没有读取到“${activeChain.promptCategory}”提示词。`);
      return;
    }
    if (!input.trim() && activeChain.id !== 'brainstormOutline') {
      setStartedAt(null);
      setStatus('failed');
      setOutput('【错误】请输入测试内容。');
      pushLog('失败：请输入测试内容。');
      return;
    }

    const controller = new AbortController();
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    abortRef.current = controller;
    const contextText = context.trim();
    const promptContent = selectedPrompt.content.trim();
    const isBrainstormOutlineChain = activeChain.id === 'brainstormOutline';
    const userContent = isBrainstormOutlineChain
      ? [
          promptContent,
          contextText,
          ['【用户要求】', input.trim() || '（无额外要求）'].join('\n'),
        ].filter(Boolean).join('\n\n')
      : contextText
        ? `【测试上下文】\n${contextText}\n\n【用户指令】\n${input.trim()}`
        : input.trim();
    const modelPrompt = isBrainstormOutlineChain
      ? ''
      : promptContent;

    setRequestPreview([
      `请求编号：${requestSeq}`,
      `测试链路：${activeChain.title}`,
      `模型：${selectedModel.name}`,
      `模型 ID：${selectedModel.model || selectedModel.id}`,
      `Base URL：${selectedModel.baseUrl || '未填写'}`,
      `提示词分类：${activeChain.promptCategory}`,
      `提示词：${selectedPrompt.name}`,
      '',
      '【发送给 AI 的 system prompt】',
      modelPrompt || '空提示词',
      '',
      '【发送给 AI 的用户内容】',
      userContent,
    ].join('\n'));
    pushLog(`#${requestSeq} 开始测试：${activeChain.title}`);
    pushLog(`模型：${selectedModel.name}`);
    pushLog(`提示词：${selectedPrompt.name}`);

    const timeoutMs = 180000;
    const timeoutId = window.setTimeout(() => {
      controller.abort();
      pushLog(`#${requestSeq} 已触发 180 秒超时保护。`);
    }, timeoutMs);

    try {
      let streamedContent = '';
      const content = await callModelStream({
        model: selectedModel,
        prompt: modelPrompt,
        userContent,
        recordType: 'generate',
        signal: controller.signal,
        timeoutMs,
        onChunk: (chunk) => {
          streamedContent += chunk;
          setOutput(streamedContent);
        },
      });
      if (requestSeqRef.current !== requestSeq) return;
      const usedMs = Math.round(performance.now() - start);
      setOutput(content);
      setStatus('success');
      setFinishedMs(usedMs);
      pushLog(`#${requestSeq} 成功：收到 ${countWords(content)} 字，耗时 ${usedMs}ms。`);
    } catch (error) {
      if (requestSeqRef.current !== requestSeq) return;
      const usedMs = Math.round(performance.now() - start);
      const aborted = controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError');
      setStatus(aborted ? 'aborted' : 'failed');
      setFinishedMs(usedMs);
      const message = error instanceof Error ? error.message : String(error);
      setOutput(`【${aborted ? '已中止' : '错误'}】${message}`);
      pushLog(`#${requestSeq} ${aborted ? '已中止' : '失败'}：${message}`);
    } finally {
      window.clearTimeout(timeoutId);
      if (abortRef.current === controller) abortRef.current = null;
      if (requestSeqRef.current === requestSeq) setStartedAt(null);
    }
  };

  const stopTest = () => {
    if (!abortRef.current) return;
    abortRef.current.abort();
    pushLog('用户点击暂停，正在中止当前请求。');
  };

  const clearTestDialog = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setStartedAt(null);
    setFinishedMs(null);
    setOutput('');
    setRequestPreview('');
    setChainInput('');
    pushLog(`已清空：${activeChain.title}`);
  };

  const statusText = {
    idle: '未开始',
    running: `正在生成${'.'.repeat(loadingDotCount)}`,
    success: '成功',
    failed: '失败',
    aborted: '已中止',
  }[status];

  const groupedChains = chains.reduce<Record<string, ChainConfig[]>>((acc, chain) => {
    acc[chain.group] = [...(acc[chain.group] ?? []), chain];
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI 生成链路测试中心</h1>
          <p className="mt-0.5 text-xs text-slate-400">左侧选择链路，右侧按真实功能读取模型、提示词和上下文后发送测试。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/test-collection')} className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
            返回测试
          </button>
          <button onClick={() => navigate('/workbench')} className="h-9 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark">
            打开作品编辑器
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-100 bg-white p-4">
          {Object.entries(groupedChains).map(([group, items]) => {
            const expanded = expandedGroups.has(group);
            return (
              <section key={group} className="mb-4">
                <button
                  onClick={() => toggleGroup(group)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <span>{group}</span>
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expanded && (
                  <div className="mt-1 space-y-1 pl-2">
                    {items.map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => setActiveChainId(chain.id)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${
                          chain.id === activeChain.id ? 'bg-brand-light text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {chain.title}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </aside>

        <section className="grid min-h-0 grid-cols-[360px_minmax(0,1fr)_360px] gap-4 overflow-hidden p-5">
          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{activeChain.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{activeChain.description}</p>
            <label className="mt-4 text-sm font-bold text-slate-600">
              模型
              <select value={selectedModel?.id ?? ''} onChange={(event) => setSelectedModelId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand">
                {models.length === 0 ? <option value="">暂无可用模型</option> : models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </label>
            <label className="mt-4 text-sm font-bold text-slate-600">
              {activeChain.promptCategory}提示词
              <select value={selectedPrompt?.id ?? ''} onChange={(event) => setChainPromptId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand">
                {promptOptions.length === 0 ? <option value="">暂无{activeChain.promptCategory}提示词</option> : promptOptions.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.name}</option>)}
              </select>
            </label>
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">{activeChain.contextLabel}</span>
                <button onClick={refreshContext} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  重新读取
                </button>
              </div>
              <textarea value={context} onChange={(event) => setContext(event.target.value)} className="editor-scrollbar min-h-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none focus:border-brand" />
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">测试输入与输出</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                status === 'success' ? 'bg-emerald-50 text-emerald-600'
                  : status === 'failed' || status === 'aborted' ? 'bg-red-50 text-red-600'
                    : status === 'running' ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-500'
              }`}
              >
                {statusText}
              </span>
            </div>
            <textarea readOnly value={output || (isRunning ? statusText : '这里会显示 AI 输出。')} className="editor-scrollbar min-h-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 outline-none selection:bg-brand-light selection:text-brand" />
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400">耗时</p>
                <p className="mt-1 font-bold text-slate-800">{elapsedMs ?? 0}ms</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400">输出字数</p>
                <p className="mt-1 font-bold text-slate-800">{countWords(output)}字</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400">超时保护</p>
                <p className="mt-1 font-bold text-slate-800">60秒</p>
              </div>
            </div>
            <label className="mt-4 flex h-[170px] shrink-0 flex-col text-sm font-bold text-slate-600">
              用户输入
              <textarea value={input} onChange={(event) => setChainInput(event.target.value)} className="editor-scrollbar mt-2 min-h-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal leading-7 text-slate-700 outline-none focus:border-brand" />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <button onClick={() => void runTest()} disabled={isRunning} className="h-11 rounded-xl bg-brand text-sm font-bold text-white hover:bg-brand-dark disabled:bg-slate-300">
                发送测试
              </button>
              <button onClick={stopTest} disabled={!isRunning} className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:text-slate-300">
                暂停
              </button>
              <button onClick={clearTestDialog} disabled={!input.trim() && !output.trim() && !requestPreview.trim() && !isRunning} className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:text-slate-300">
                清空
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">诊断日志</h2>
            <details className="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600">
              <summary className="cursor-pointer font-bold text-slate-800">查看本次发送内容</summary>
              <pre className="editor-scrollbar mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 leading-5">
                {requestPreview || '尚未发送。'}
              </pre>
            </details>
            <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
              {logs.map((log, index) => (
                <div key={`${log}-${index}`} className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                  {log}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
              如果某条链路失败，先看“本次发送内容”：模型、提示词、上下文都在这里。401 一般是 API Key；没有提示词则去提示词管理创建对应分类。
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
