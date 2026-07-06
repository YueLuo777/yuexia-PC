import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, CheckCircle2, ChevronDown, Loader2, RefreshCw, Save, Send, Settings, Sparkles } from 'lucide-react';

import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import { buildHotspotCombinationPrompt, buildHotspotSuitabilityPrompt, saveHotspotBrainstorm } from '@/features/hotspots/model/hotspotAi';
import { HOTSPOT_SOURCE_LABELS, HOTSPOT_SOURCES, fetchHotspots } from '@/features/hotspots/model/hotspotApi';
import type { HotspotFetchResult, HotspotItem, HotspotSourceId } from '@/features/hotspots/model/hotspotTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { IconButton } from '@/shared/ui/IconButton';

type AnalysisMode = 'single' | 'combine';

const HOTSPOT_MODEL_ID_STORAGE_KEY = 'xinyuexia_hotspot_model_id';

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
  selected,
  onOpen,
  onToggle,
}: {
  item: HotspotItem;
  active: boolean;
  selected: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`grid min-h-[62px] grid-cols-[34px_minmax(0,1fr)_28px] items-center gap-2 border-b border-slate-100 px-3 py-2 transition-colors ${
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
      <input aria-label={`选择 ${item.title}`} type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-cyan-500" />
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

function HotspotModelSelect({
  value,
  models,
  onChange,
  onManage,
}: {
  value: string;
  models: Array<{ id: string; name: string }>;
  onChange: (value: string) => void;
  onManage: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const selectedModel = models.find((model) => model.id === value) ?? models[0] ?? null;
  const displayName = selectedModel?.name ?? '暂无可用模型';

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-[252px] shrink-0 pt-3">
      <button
        type="button"
        aria-label={`热点模型：${displayName}`}
        disabled={models.length === 0}
        onClick={() => setOpen((current) => !current)}
        className={`grid h-11 w-full grid-cols-[minmax(0,1fr)_26px] items-center rounded-xl border-2 border-[#08AACE] bg-white text-left shadow-[0_8px_18px_rgba(8,170,206,0.08)] transition-colors ${
          models.length === 0 ? 'cursor-not-allowed text-slate-300' : 'hover:bg-[#EAF9FD]'
        }`}
      >
        <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-900">{displayName}</span>
        <ChevronDown className={`h-4 w-4 text-[#08AACE] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <span className="xy-border-embedded-transparent-backplate absolute left-4 top-3 z-10 -translate-y-1/2 text-sm font-black leading-none text-[#08AACE]">
        模型
      </span>
      <button
        type="button"
        aria-label="模型管理"
        title="模型管理"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onManage();
        }}
        className="xy-border-embedded-transparent-backplate absolute right-9 top-3 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[#08AACE] hover:text-[#057F9B]"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>
      {open && models.length > 0 && (
        <div className="absolute left-0 top-[calc(100%-2px)] z-30 max-h-[240px] w-full overflow-y-auto rounded-b-xl border-2 border-t-0 border-[#08AACE] bg-white py-1 shadow-[0_18px_34px_rgba(8,170,206,0.14)]">
          {models.map((model) => {
            const selected = model.id === selectedModel?.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id);
                  setOpen(false);
                }}
                className={`flex h-9 w-full items-center justify-between gap-3 px-4 text-left text-sm transition-colors ${
                  selected
                    ? 'bg-[#EAF9FD] font-black text-slate-900'
                    : 'bg-white font-bold text-slate-800 hover:bg-sky-50 hover:text-[#08AACE]'
                }`}
              >
                <span className="min-w-0 truncate">{model.name}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-[#08AACE]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HotspotPage() {
  const navigate = useNavigate();
  const { models } = useModels();
  const [result, setResult] = useState<HotspotFetchResult>(createEmptyResult);
  const [activeSource, setActiveSource] = useState<HotspotSourceId | 'all'>('all');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [hotspotModelId, setHotspotModelId] = useState(readHotspotModelId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [analysisTitle, setAnalysisTitle] = useState('热点小说评估');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('single');
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');

  const filteredItems = useMemo(() => (
    activeSource === 'all' ? result.items : result.items.filter((item) => item.source === activeSource)
  ), [activeSource, result.items]);
  const activeItem = useMemo(() => result.items.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null, [activeItemId, filteredItems, result.items]);
  const selectedItems = useMemo(() => selectedIds.map((id) => result.items.find((item) => item.id === id)).filter((item): item is HotspotItem => Boolean(item)), [result.items, selectedIds]);
  const hotspotModel = useMemo(() => models.find((model) => model.id === hotspotModelId) ?? models[0] ?? null, [hotspotModelId, models]);

  const setHotspotModelIdWithStorage = useCallback((nextModelId: string) => {
    setHotspotModelId(nextModelId);
    if (nextModelId) localStorage.setItem(HOTSPOT_MODEL_ID_STORAGE_KEY, nextModelId);
    else localStorage.removeItem(HOTSPOT_MODEL_ID_STORAGE_KEY);
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
    setAnalysisMode('single');
    setAnalysisTitle(`热点评估：${item.title}`);
    setIsAnalyzing(true);
    setStatus('');
    try {
      const content = await callModel({
        model: hotspotModel,
        prompt: '你是专业网文策划编辑，擅长把热点转译成虚构小说题材。',
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

  const runCombination = async () => {
    if (!hotspotModel) {
      setStatus('请先在热点灵感的模型框里选择可用模型，或到模型管理里新增模型。');
      return;
    }
    if (selectedItems.length < 2) {
      setStatus('至少选择 2 条热点后再组合题材。');
      return;
    }
    setAnalysisMode('combine');
    setAnalysisTitle(`热点组合题材（${selectedItems.length}条）`);
    setIsAnalyzing(true);
    setStatus('');
    try {
      const content = await callModel({
        model: hotspotModel,
        prompt: '你是专业网文选题策划，输出可直接进入创作流程的虚构小说方案。',
        userContent: buildHotspotCombinationPrompt(selectedItems),
        recordType: 'generate',
        timeoutMs: 180000,
      });
      setAnalysis(content);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI组合失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelected = (item: HotspotItem) => {
    setSelectedIds((current) => (
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
    ));
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

  const sendToWorkbench = () => {
    if (saveAnalysis()) navigate('/workbench');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
        <div className="min-w-0">
          <div className="text-lg font-bold">热点灵感</div>
          <div className="mt-0.5 text-xs text-slate-400">DailyHotApi：百度、抖音、微博、知乎、B站</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton label="刷新热点" onClick={() => void refresh(true)} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </IconButton>
          <ActionButton size="sm" variant="secondary" onClick={runCombination} disabled={isAnalyzing || selectedItems.length < 2}>组合题材</ActionButton>
        </div>
      </header>
      <SourceRadar activeSource={activeSource} onChange={setActiveSource} result={result} />
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)] gap-4 overflow-hidden p-4">
        <section className="min-h-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3 text-xs font-semibold text-slate-400">
            <span>{activeSource === 'all' ? '全部平台' : HOTSPOT_SOURCE_LABELS[activeSource]}：{filteredItems.length} 条</span>
            <span>已选 {selectedItems.length}</span>
          </div>
            <div className="h-[calc(100%-40px)] overflow-auto">
              {filteredItems.map((item) => (
                <HotspotRow
                  key={item.id}
                  item={item}
                  active={activeItem?.id === item.id}
                  selected={selectedIds.includes(item.id)}
                  onOpen={() => void runSingleAnalysis(item)}
                  onToggle={() => toggleSelected(item)}
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
                <HotspotModelSelect
                  value={hotspotModel?.id ?? ''}
                  models={models}
                  onChange={setHotspotModelIdWithStorage}
                  onManage={() => navigate('/model-manage')}
                />
                <IconButton label="保存到脑洞库" onClick={saveAnalysis} disabled={!analysis.trim()}><Save className="h-4 w-4" /></IconButton>
                <IconButton label="送入工作台" onClick={sendToWorkbench} disabled={!analysis.trim()}><Send className="h-4 w-4" /></IconButton>
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
                    {activeItem && <ActionButton className="mt-4" size="sm" onClick={() => void runSingleAnalysis(activeItem)}>分析当前热点</ActionButton>}
                  </div>
                </div>
              )}
            </div>
            {status && (
              <div className="flex h-10 shrink-0 items-center gap-2 border-t border-slate-100 bg-white px-4 text-xs text-slate-500">
                {status.includes('已') ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span className="truncate">{status}</span>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}
