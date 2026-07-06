import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import { HOTSPOT_ANALYSIS_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { HOTSPOT_ANALYSIS_SYSTEM_PROMPT, buildHotspotSuitabilityPrompt, saveHotspotBrainstorm } from '@/features/hotspots/model/hotspotAi';
import { HOTSPOT_SOURCE_LABELS, HOTSPOT_SOURCES, fetchHotspots } from '@/features/hotspots/model/hotspotApi';
import type { HotspotFetchResult, HotspotItem, HotspotSourceId } from '@/features/hotspots/model/hotspotTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

const HOTSPOT_MODEL_ID_STORAGE_KEY = 'xinyuexia_hotspot_model_id';
const HOTSPOT_PROMPT_ID_STORAGE_KEY = 'xinyuexia_hotspot_prompt_id';
const HOTSPOT_PROMPT_CATEGORY = HOTSPOT_ANALYSIS_PROMPT_CATEGORY;

function formatCapturedTime(value: string) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return value;
  return time.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function createEmptyResult(): HotspotFetchResult {
  return {
    ok: false,
    capturedAt: new Date().toISOString(),
    items: [],
    sourceStates: Object.fromEntries(HOTSPOT_SOURCES.map((source) => [
      source,
      { ok: false, count: 0, message: '等待刷新' },
    ])) as HotspotFetchResult['sourceStates'],
    stale: false,
  };
}

function SourceRadar({
  activeSource,
  onChange,
  result,
}: {
  activeSource: HotspotSourceId | 'all';
  onChange: (source: HotspotSourceId | 'all') => void;
  result: HotspotFetchResult;
}) {
  return (
    <div className="grid shrink-0 grid-cols-[1.15fr_repeat(5,minmax(112px,1fr))] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`rounded-md border px-4 py-3 text-left transition-colors ${
          activeSource === 'all'
            ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/40'
        }`}
      >
        <div className="text-xs font-bold text-slate-400">全部平台</div>
        <div className="mt-1 text-2xl font-black text-slate-900">{result.items.length}</div>
        <div className="mt-1 truncate text-xs text-slate-400">
          {result.items.length > 0 ? `更新于 ${formatCapturedTime(result.capturedAt)}` : '打开后自动抓取'}
        </div>
      </button>
      {HOTSPOT_SOURCES.map((source) => {
        const state = result.sourceStates[source];
        return (
          <button
            key={source}
            type="button"
            onClick={() => onChange(source)}
            className={`rounded-md border px-4 py-3 text-left transition-colors ${
              activeSource === source
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/40'
            }`}
            title={state.message}
          >
            <div className="text-xs font-bold text-slate-400">{HOTSPOT_SOURCE_LABELS[source]}</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{state.count}</div>
            <div className={state.ok ? 'mt-1 truncate text-xs text-cyan-600' : 'mt-1 truncate text-xs text-slate-400'}>
              {state.ok ? '已抓取' : state.message}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function HotspotRow({
  item,
  active,
  onOpen,
  onAnalyze,
  disabled,
}: {
  item: HotspotItem;
  active: boolean;
  onOpen: () => void;
  onAnalyze: () => void;
  disabled: boolean;
}) {
  return (
    <div className={`grid min-h-[62px] grid-cols-[34px_minmax(0,1fr)_82px] items-center gap-2 border-b border-slate-100 px-3 py-2 transition-colors ${
      active ? 'bg-cyan-50/80' : 'bg-white hover:bg-slate-50'
    }`}
    >
      <button type="button" onClick={onOpen} className="text-left text-sm font-black text-slate-400">#{item.rank}</button>
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <div className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{item.title}</div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <span>{item.sourceName}</span>
          {item.heat && <span className="truncate">{item.heat}</span>}
        </div>
      </button>
      <button
        type="button"
        onClick={onAnalyze}
        disabled={disabled}
        className="h-8 rounded-lg border border-cyan-100 bg-cyan-50 px-2 text-xs font-black text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
      >
        开始分析
      </button>
    </div>
  );
}

function readHotspotModelId() {
  try {
    return localStorage.getItem(HOTSPOT_MODEL_ID_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function HotspotPage() {
  const navigate = useNavigate();
  const { models } = useModels();
  const { prompts } = usePrompts();
  const [result, setResult] = useState<HotspotFetchResult>(createEmptyResult);
  const [activeSource, setActiveSource] = useState<HotspotSourceId | 'all'>('all');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [hotspotModelId, setHotspotModelId] = useState(readHotspotModelId);
  const [hotspotPromptId, setHotspotPromptId] = useState(() => {
    try {
      return localStorage.getItem(HOTSPOT_PROMPT_ID_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [analysis, setAnalysis] = useState('');
  const [analysisTitle, setAnalysisTitle] = useState('热点小说评估');
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');

  const filteredItems = useMemo(() => (
    activeSource === 'all' ? result.items : result.items.filter((item) => item.source === activeSource)
  ), [activeSource, result.items]);
  const activeItem = useMemo(() => result.items.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null, [activeItemId, filteredItems, result.items]);
  const hotspotModel = useMemo(() => models.find((model) => model.id === hotspotModelId) ?? models[0] ?? null, [hotspotModelId, models]);
  const hotspotPrompts = useMemo(() => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === HOTSPOT_PROMPT_CATEGORY), [prompts]);
  const activeHotspotPromptId = useMemo(() => (
    hotspotPrompts.some((prompt) => prompt.id === hotspotPromptId) ? hotspotPromptId : hotspotPrompts[0]?.id ?? ''
  ), [hotspotPromptId, hotspotPrompts]);
  const activeHotspotPrompt = useMemo(() => hotspotPrompts.find((prompt) => prompt.id === activeHotspotPromptId) ?? null, [activeHotspotPromptId, hotspotPrompts]);

  const setHotspotModelIdWithStorage = useCallback((nextModelId: string) => {
    setHotspotModelId(nextModelId);
    if (nextModelId) localStorage.setItem(HOTSPOT_MODEL_ID_STORAGE_KEY, nextModelId);
    else localStorage.removeItem(HOTSPOT_MODEL_ID_STORAGE_KEY);
  }, []);

  const setHotspotPromptIdWithStorage = useCallback((nextPromptId: string) => {
    setHotspotPromptId(nextPromptId);
    if (nextPromptId) localStorage.setItem(HOTSPOT_PROMPT_ID_STORAGE_KEY, nextPromptId);
    else localStorage.removeItem(HOTSPOT_PROMPT_ID_STORAGE_KEY);
  }, []);

  const refresh = useCallback(async (force = false) => {
    setIsFetching(true);
    setStatus('');
    try {
      const next = await fetchHotspots(force);
      setResult(next);
      setActiveItemId((current) => current ?? next.items[0]?.id ?? null);
      setStatus(next.stale ? '抓取失败，已显示上次缓存。' : `已更新 ${next.items.length} 条热点。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '热点刷新失败');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  useEffect(() => {
    if (models.length === 0) {
      if (hotspotModelId) setHotspotModelIdWithStorage('');
      return;
    }
    if (!hotspotModelId || !models.some((model) => model.id === hotspotModelId)) {
      setHotspotModelIdWithStorage(models[0].id);
    }
  }, [hotspotModelId, models, setHotspotModelIdWithStorage]);

  const runSingleAnalysis = async (item: HotspotItem) => {
    if (!hotspotModel) {
      setStatus('请先在热点灵感的模型框里选择可用模型，或到模型管理里新增模型。');
      return;
    }
    setActiveItemId(item.id);
    setAnalysisTitle(`热点评估：${item.title}`);
    setIsAnalyzing(true);
    setStatus('');
    try {
      const content = await callModel({
        model: hotspotModel,
        prompt: activeHotspotPrompt?.content.trim() || HOTSPOT_ANALYSIS_SYSTEM_PROMPT,
        userContent: buildHotspotSuitabilityPrompt(item),
        recordType: 'generate',
        timeoutMs: 120000,
      });
      setAnalysis(content);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = () => {
    if (!analysis.trim()) {
      setStatus('没有可保存的分析结果。');
      return false;
    }
    saveHotspotBrainstorm(analysisTitle, analysis.trim());
    setStatus('已保存到脑洞库。');
    return true;
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
        <div className="min-w-0">
          <div className="text-lg font-bold">热点灵感</div>
          <div className="mt-0.5 text-xs text-slate-400">DailyHotApi：百度、抖音、微博、知乎、B站</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="xy-capsule-group overflow-hidden">
            <button
              type="button"
              onClick={() => void refresh(true)}
              disabled={isFetching}
              className="xy-capsule-button"
            >
              {isFetching ? '刷新中' : '刷新'}
            </button>
          </div>
        </div>
      </header>
      <SourceRadar activeSource={activeSource} onChange={setActiveSource} result={result} />
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)] gap-4 overflow-hidden p-4">
        <section className="min-h-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3 text-xs font-semibold text-slate-400">
            <span>{activeSource === 'all' ? '全部平台' : HOTSPOT_SOURCE_LABELS[activeSource]}：{filteredItems.length} 条</span>
            <span>{activeItem ? '点击标题只选中' : '选择热点'}</span>
          </div>
            <div className="h-[calc(100%-40px)] overflow-auto">
              {filteredItems.map((item) => (
                <HotspotRow
                  key={item.id}
                  item={item}
                  active={activeItem?.id === item.id}
                  onOpen={() => setActiveItemId(item.id)}
                  onAnalyze={() => void runSingleAnalysis(item)}
                  disabled={isAnalyzing}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-slate-400">
                  {status || '暂无热点，点击刷新重试。'}
                </div>
              )}
            </div>
        </section>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
              <div className="min-w-0">
                <div className="truncate text-base font-black text-slate-900">AI 小说适合度</div>
                <div className="mt-0.5 truncate text-xs text-slate-400">{analysisTitle}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CombinedAiConfigSelect
                  className="w-[390px]"
                  modelValue={hotspotModel?.id ?? ''}
                  promptValue={activeHotspotPromptId}
                  modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  promptOptions={hotspotPrompts.length === 0 ? [{ value: '', label: '无可用提示词', disabled: true }] : hotspotPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  onModelChange={setHotspotModelIdWithStorage}
                  onPromptChange={setHotspotPromptIdWithStorage}
                  onModelManage={() => navigate('/model-manage')}
                  onPromptManage={() => navigate('/prompts')}
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-5">
              {isAnalyzing ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm font-semibold text-cyan-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在分析热点
                </div>
              ) : analysis ? (
                <pre className="min-h-full whitespace-pre-wrap rounded-md border border-slate-100 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">{analysis}</pre>
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="max-w-lg rounded-md border border-slate-100 bg-white p-8 text-center shadow-sm">
                    <Sparkles className="mx-auto h-8 w-8 text-cyan-500" />
                    <div className="mt-4 text-base font-black text-slate-900">选择一个热点开始评估</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">AI 会判断小说适合度、题材方向、核心冲突、改写风险和具体改编方式。这里保留更大的阅读空间，方便直接看分析结果。</div>
                    {activeItem && (
                      <div className="mt-6 flex justify-center">
                        <ActionButton size="sm" onClick={() => void runSingleAnalysis(activeItem)} disabled={isAnalyzing}>开始分析</ActionButton>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-t border-slate-100 bg-white px-4">
              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                {status && (
                  <>
                    {status.includes('已') ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />}
                    <span className="truncate">{status}</span>
                  </>
                )}
              </div>
              <div className="xy-capsule-group shrink-0 overflow-hidden">
                <button
                  type="button"
                  onClick={saveAnalysis}
                  disabled={!analysis.trim()}
                  className="xy-capsule-button"
                >
                  保存到脑洞库
                </button>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
}
