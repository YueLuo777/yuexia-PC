import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Save, Send, Sparkles } from 'lucide-react';

import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import { buildHotspotCombinationPrompt, buildHotspotSuitabilityPrompt, saveHotspotBrainstorm } from '@/features/hotspots/model/hotspotAi';
import { HOTSPOT_SOURCE_LABELS, HOTSPOT_SOURCES, fetchHotspots } from '@/features/hotspots/model/hotspotApi';
import type { HotspotFetchResult, HotspotItem, HotspotSourceId } from '@/features/hotspots/model/hotspotTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { IconButton } from '@/shared/ui/IconButton';

type AnalysisMode = 'single' | 'combine';

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

function SourceFilter({
  activeSource,
  onChange,
  result,
}: {
  activeSource: HotspotSourceId | 'all';
  onChange: (source: HotspotSourceId | 'all') => void;
  result: HotspotFetchResult;
}) {
  return (
    <aside className="flex w-[218px] shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="text-lg font-bold text-slate-900">热点灵感</div>
        <div className="mt-1 text-xs text-slate-400">
          {result.items.length > 0 ? `更新于 ${formatCapturedTime(result.capturedAt)}` : '打开后自动抓取'}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-auto p-3">
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors ${
            activeSource === 'all' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>全部平台</span>
          <span>{result.items.length}</span>
        </button>
        {HOTSPOT_SOURCES.map((source) => {
          const state = result.sourceStates[source];
          return (
            <button
              key={source}
              type="button"
              onClick={() => onChange(source)}
              className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors ${
                activeSource === source ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title={state.message}
            >
              <span>{HOTSPOT_SOURCE_LABELS[source]}</span>
              <span className={state.ok ? 'text-cyan-600' : 'text-slate-400'}>{state.count}</span>
            </button>
          );
        })}
      </div>
    </aside>
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
    <div className={`grid h-[58px] grid-cols-[42px_minmax(0,1fr)_96px_36px] items-center gap-2 border-b border-slate-100 px-3 transition-colors ${
      active ? 'bg-cyan-50/80' : 'bg-white hover:bg-slate-50'
    }`}
    >
      <button type="button" onClick={onOpen} className="text-left text-sm font-bold text-slate-500">#{item.rank}</button>
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <span>{item.sourceName}</span>
          {item.heat && <span className="truncate">{item.heat}</span>}
        </div>
      </button>
      <button type="button" onClick={onOpen} className="h-7 rounded-md bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-cyan-100 hover:text-cyan-700">
        AI评估
      </button>
      <input aria-label={`选择 ${item.title}`} type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-cyan-500" />
    </div>
  );
}

export function HotspotPage() {
  const navigate = useNavigate();
  const { activeModel } = useModels();
  const [result, setResult] = useState<HotspotFetchResult>(createEmptyResult);
  const [activeSource, setActiveSource] = useState<HotspotSourceId | 'all'>('all');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
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

  const runSingleAnalysis = async (item: HotspotItem) => {
    if (!activeModel) {
      setStatus('请先在模型管理里配置可用模型。');
      return;
    }
    setActiveItemId(item.id);
    setAnalysisMode('single');
    setAnalysisTitle(`热点评估：${item.title}`);
    setIsAnalyzing(true);
    setStatus('');
    try {
      const content = await callModel({
        model: activeModel,
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
    if (!activeModel) {
      setStatus('请先在模型管理里配置可用模型。');
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
        model: activeModel,
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
    <div className="flex h-full min-h-0 bg-slate-50 text-slate-900">
      <SourceFilter activeSource={activeSource} onChange={setActiveSource} result={result} />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
          <div className="min-w-0">
            <div className="text-base font-bold">全平台前 50 热点</div>
            <div className="mt-0.5 text-xs text-slate-400">DailyHotApi：百度、抖音、微博、知乎、B站</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="刷新热点" onClick={() => void refresh(true)} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </IconButton>
            <ActionButton size="sm" variant="secondary" onClick={runCombination} disabled={isAnalyzing || selectedItems.length < 2}>组合题材</ActionButton>
          </div>
        </header>
        <main className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.92fr)_minmax(420px,1.08fr)] overflow-hidden">
          <div className="min-h-0 border-r border-slate-100 bg-white">
            <div className="flex h-10 items-center justify-between border-b border-slate-100 px-3 text-xs font-semibold text-slate-400">
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
                <div className="flex h-full items-center justify-center text-sm text-slate-400">暂无热点，点击刷新重试。</div>
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-col bg-slate-50">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{analysisTitle}</div>
                <div className="mt-0.5 text-xs text-slate-400">{analysisMode === 'single' ? '点击热点后自动判断是否适合写小说' : '多条热点组合成新题材'}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IconButton label="保存到脑洞库" onClick={saveAnalysis} disabled={!analysis.trim()}><Save className="h-4 w-4" /></IconButton>
                <IconButton label="送入工作台" onClick={sendToWorkbench} disabled={!analysis.trim()}><Send className="h-4 w-4" /></IconButton>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {isAnalyzing ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm font-semibold text-cyan-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在分析热点
                </div>
              ) : analysis ? (
                <pre className="min-h-full whitespace-pre-wrap rounded-lg border border-slate-100 bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm">{analysis}</pre>
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="max-w-sm rounded-lg border border-slate-100 bg-white p-5 text-center shadow-sm">
                    <Sparkles className="mx-auto h-8 w-8 text-cyan-500" />
                    <div className="mt-3 text-sm font-bold text-slate-900">选择一个热点开始评估</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">AI 会判断小说适合度、题材方向、冲突、风险和改编方式。</div>
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
          </div>
        </main>
      </section>
    </div>
  );
}
