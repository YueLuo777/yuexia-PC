import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

import { useModels } from '@/features/models/hooks/useModels';
import { callModelStream } from '@/features/models/services/callModel';
import { HOTSPOT_ANALYSIS_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { HOTSPOT_ANALYSIS_SYSTEM_PROMPT, buildHotspotSuitabilityPrompt, saveHotspotBrainstorm } from '@/features/hotspots/model/hotspotAi';
import {
  HOTSPOT_DISPLAY_LIMIT,
  HOTSPOT_MIN_DISPLAY_SCORE,
  HOTSPOT_SOURCE_LABELS,
  HOTSPOT_SOURCES,
  fetchHotspots,
  getHotspotExternalUrl,
} from '@/features/hotspots/model/hotspotApi';
import { HOTSPOT_RULE_BASE_SCORE, HOTSPOT_RULE_GROUPS, evaluateHotspotByRules, rankHotspotsByRuleEvaluation } from '@/features/hotspots/model/hotspotRules';
import type { HotspotFetchResult, HotspotItem, HotspotSourceId } from '@/features/hotspots/model/hotspotTypes';
import { getEditorTextLineHeight, getStoredFontSettings, type FontSettings } from '@/features/workbench/components/EditorToolModals';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

const HOTSPOT_MODEL_ID_STORAGE_KEY = 'xinyuexia_hotspot_model_id';
const HOTSPOT_PROMPT_ID_STORAGE_KEY = 'xinyuexia_hotspot_prompt_id';
const HOTSPOT_ANALYSIS_FONT_SIZE_STORAGE_KEY = 'xinyuexia_hotspot_analysis_font_size';
const HOTSPOT_PROMPT_CATEGORY = HOTSPOT_ANALYSIS_PROMPT_CATEGORY;
const HOTSPOT_ANALYSIS_MIN_FONT_SIZE = 12;
const HOTSPOT_ANALYSIS_MAX_FONT_SIZE = 30;

function clampHotspotAnalysisFontSize(value: number) {
  if (!Number.isFinite(value)) {
    const fallback = getStoredFontSettings().fontSize;
    return Math.min(HOTSPOT_ANALYSIS_MAX_FONT_SIZE, Math.max(HOTSPOT_ANALYSIS_MIN_FONT_SIZE, Math.round(fallback)));
  }
  return Math.min(HOTSPOT_ANALYSIS_MAX_FONT_SIZE, Math.max(HOTSPOT_ANALYSIS_MIN_FONT_SIZE, Math.round(value)));
}

function readHotspotAnalysisFontSize() {
  try {
    const stored = localStorage.getItem(HOTSPOT_ANALYSIS_FONT_SIZE_STORAGE_KEY);
    return stored === null ? clampHotspotAnalysisFontSize(getStoredFontSettings().fontSize) : clampHotspotAnalysisFontSize(Number(stored));
  } catch {
    return clampHotspotAnalysisFontSize(getStoredFontSettings().fontSize);
  }
}

function HotspotAnalysisOutput({
  analysis,
  reasoning,
  thinkingSeconds,
  isAnalyzing,
  fontSettings,
}: {
  analysis: string;
  reasoning: string;
  thinkingSeconds: number;
  isAnalyzing: boolean;
  fontSettings: FontSettings;
}) {
  const hasReasoning = reasoning.trim().length > 0;
  const hasAnalysis = analysis.trim().length > 0;
  const [isReasoningOpen, setIsReasoningOpen] = useState(isAnalyzing);
  const showReasoningBody = isAnalyzing || isReasoningOpen;
  const analysisTextStyle: CSSProperties = {
    color: fontSettings.fontColor,
    fontFamily: fontSettings.fontFamily,
    fontSize: `${fontSettings.fontSize}px`,
    lineHeight: getEditorTextLineHeight(fontSettings),
  };

  useEffect(() => {
    setIsReasoningOpen(isAnalyzing);
  }, [isAnalyzing]);

  return (
    <div className="min-h-full rounded-md border border-slate-100 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">
      {(isAnalyzing || hasReasoning) && (
        <div className="mb-4 rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] p-3 text-xs leading-6 text-slate-600">
          <button
            type="button"
            onClick={() => {
              if (!isAnalyzing) setIsReasoningOpen((current) => !current);
            }}
            disabled={isAnalyzing}
            className="flex w-full items-center justify-between gap-3 text-left font-black text-[#078fb0] disabled:cursor-default"
          >
            <span className="flex min-w-0 items-center gap-2">
              {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{isAnalyzing ? `正在思考（${Math.max(1, thinkingSeconds)} 秒）` : `已思考（用时 ${Math.max(1, thinkingSeconds)} 秒）`}</span>
            </span>
            {!isAnalyzing && hasReasoning && (
              <span className="shrink-0 text-[11px] font-semibold text-[#078fb0]/70">{isReasoningOpen ? '收起' : '展开'}</span>
            )}
          </button>
          {showReasoningBody && (
            hasReasoning ? (
              <div className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap break-words">
                {reasoning}
              </div>
            ) : (
              <div className="mt-2 text-slate-400">等待模型返回思考过程...</div>
            )
          )}
        </div>
      )}

      {hasAnalysis ? (
        <pre className="whitespace-pre-wrap break-words" style={analysisTextStyle}>{analysis}</pre>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm font-semibold text-cyan-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          AI 正在分析热点
        </div>
      )}
    </div>
  );
}

function HotspotRulePreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const bonusRules = HOTSPOT_RULE_GROUPS.filter((group) => group.polarity === 'bonus');
  const penaltyRules = HOTSPOT_RULE_GROUPS.filter((group) => group.polarity === 'penalty');
  const riskRules = HOTSPOT_RULE_GROUPS.filter((group) => group.polarity === 'risk');
  const renderRuleGroup = (title: string, rules: typeof HOTSPOT_RULE_GROUPS, accentClass: string) => (
    <section>
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <div className="mt-2 space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-800">{rule.name}</div>
              <div className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${accentClass}`}>{rule.score > 0 ? `+${rule.score}` : rule.score}</div>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{rule.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rule.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">{keyword}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <AppModalShell
      title="热点筛选规则"
      subtitle={`基础分 ${HOTSPOT_RULE_BASE_SCORE}，规则命中后自动加减分，不消耗 token`}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[760px]"
      heightClass="h-[76vh] max-h-[86vh]"
      storageId="hotspot_rule_preview_modal"
      contentClassName="min-h-0 flex-1 overflow-auto bg-slate-50 p-5"
    >
      <div className="space-y-5">
        <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-slate-600">
          规则会先给热点打适配分并排序：高适配优先显示，低适配和高风险会被标注。AI 只在你点击“开始分析”后才消耗 token。
        </div>
        {renderRuleGroup('加分规则：优先保留小说化潜力', bonusRules, 'bg-emerald-50 text-emerald-700')}
        {renderRuleGroup('扣分规则：降低直接改编优先级', penaltyRules, 'bg-amber-50 text-amber-700')}
        {renderRuleGroup('高风险规则：尽量只借情绪，不直接改写', riskRules, 'bg-rose-50 text-rose-700')}
      </div>
    </AppModalShell>
  );
}

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
  const getDisplayCount = (items: HotspotItem[]) => (
    rankHotspotsByRuleEvaluation(items)
      .filter((item) => evaluateHotspotByRules(item).score >= HOTSPOT_MIN_DISPLAY_SCORE)
      .slice(0, HOTSPOT_DISPLAY_LIMIT)
      .length
  );
  const allDisplayCount = getDisplayCount(result.items);
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
        <div className="mt-1 text-2xl font-black text-slate-900">{allDisplayCount}</div>
        <div className="mt-1 truncate text-xs text-slate-400">
          {result.items.length > 0 ? `${result.items.length} 条候选` : '打开后自动抓取'}
        </div>
      </button>
      {HOTSPOT_SOURCES.map((source) => {
        const state = result.sourceStates[source];
        const sourceItems = result.items.filter((item) => item.source === source);
        const displayCount = getDisplayCount(sourceItems);
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
            <div className="mt-1 text-2xl font-black text-slate-900">{displayCount}</div>
            <div className={state.ok ? 'mt-1 truncate text-xs text-cyan-600' : 'mt-1 truncate text-xs text-slate-400'}>
              {state.ok ? `${state.count} 条候选` : state.message}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function HotspotRow({
  item,
  evaluation,
  active,
  onOpen,
  onAnalyze,
  onOpenExternal,
  disabled,
}: {
  item: HotspotItem;
  evaluation: ReturnType<typeof evaluateHotspotByRules>;
  active: boolean;
  onOpen: () => void;
  onAnalyze: () => void;
  onOpenExternal: () => void;
  disabled: boolean;
}) {
  return (
    <div className={`grid min-h-[62px] grid-cols-[34px_minmax(0,1fr)_58px_82px] items-center gap-2 border-b border-slate-100 px-3 py-2 transition-colors ${
      active ? 'bg-cyan-50/80' : 'bg-white hover:bg-slate-50'
    }`}
    >
      <button type="button" onClick={onOpen} className="text-left text-sm font-black text-slate-400">#{item.rank}</button>
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <div className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{item.title}</div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <span>{item.sourceName}</span>
          {item.heat && <span className="truncate">{item.heat}</span>}
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
            evaluation.level === 'high'
              ? 'bg-emerald-50 text-emerald-600'
              : evaluation.level === 'medium'
                ? 'bg-cyan-50 text-cyan-600'
                : evaluation.level === 'risk'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-400'
          }`}
          >
            {evaluation.levelLabel} {evaluation.score}
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenExternal}
        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
      >
        跳转
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
  const [analysisReasoning, setAnalysisReasoning] = useState('');
  const [analysisThinkingSeconds, setAnalysisThinkingSeconds] = useState(0);
  const [analysisTitle, setAnalysisTitle] = useState('热点小说评估');
  const [analysisFontSize, setAnalysisFontSize] = useState(readHotspotAnalysisFontSize);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRulePreviewOpen, setIsRulePreviewOpen] = useState(false);
  const [status, setStatus] = useState('');
  const analysisScrollRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => (
    rankHotspotsByRuleEvaluation(activeSource === 'all' ? result.items : result.items.filter((item) => item.source === activeSource))
      .filter((item) => evaluateHotspotByRules(item).score >= HOTSPOT_MIN_DISPLAY_SCORE)
      .slice(0, HOTSPOT_DISPLAY_LIMIT)
  ), [activeSource, result.items]);
  const candidateItems = useMemo(() => (
    activeSource === 'all' ? result.items : result.items.filter((item) => item.source === activeSource)
  ), [activeSource, result.items]);
  const activeItem = useMemo(() => result.items.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null, [activeItemId, filteredItems, result.items]);
  const hotspotModel = useMemo(() => models.find((model) => model.id === hotspotModelId) ?? models[0] ?? null, [hotspotModelId, models]);
  const hotspotPrompts = useMemo(() => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === HOTSPOT_PROMPT_CATEGORY), [prompts]);
  const activeHotspotPromptId = useMemo(() => (
    hotspotPrompts.some((prompt) => prompt.id === hotspotPromptId) ? hotspotPromptId : hotspotPrompts[0]?.id ?? ''
  ), [hotspotPromptId, hotspotPrompts]);
  const activeHotspotPrompt = useMemo(() => hotspotPrompts.find((prompt) => prompt.id === activeHotspotPromptId) ?? null, [activeHotspotPromptId, hotspotPrompts]);

  const analysisFontSettings = useMemo(() => ({
    ...getStoredFontSettings(),
    fontSize: analysisFontSize,
  }), [analysisFontSize]);

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

  const setAnalysisFontSizeWithStorage = useCallback((nextFontSize: number) => {
    const fontSize = clampHotspotAnalysisFontSize(nextFontSize);
    setAnalysisFontSize(fontSize);
    localStorage.setItem(HOTSPOT_ANALYSIS_FONT_SIZE_STORAGE_KEY, String(fontSize));
  }, []);

  const refresh = useCallback(async (force = false) => {
    setIsFetching(true);
    setStatus('');
    try {
      const next = await fetchHotspots(force);
      setResult(next);
      setActiveItemId((current) => current ?? next.items[0]?.id ?? null);
      const visibleCount = rankHotspotsByRuleEvaluation(next.items)
        .filter((item) => evaluateHotspotByRules(item).score >= HOTSPOT_MIN_DISPLAY_SCORE)
        .slice(0, HOTSPOT_DISPLAY_LIMIT)
        .length;
      setStatus(next.stale ? '抓取失败，已显示上次缓存。' : `已抓取 ${next.items.length} 条候选，筛出 ${visibleCount} 条高分热点。`);
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

  useEffect(() => {
    if (!isAnalyzing) return;
    const scrollContainer = analysisScrollRef.current;
    if (!scrollContainer) return;

    const frame = window.requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [analysis, analysisReasoning, isAnalyzing]);

  const runSingleAnalysis = async (item: HotspotItem) => {
    if (!hotspotModel) {
      setStatus('请先在热点分析的模型框里选择可用模型，或到模型管理里新增模型。');
      return;
    }
    setActiveItemId(item.id);
    setAnalysisTitle(`热点评估：${item.title}`);
    setAnalysis('');
    setAnalysisReasoning('');
    setAnalysisThinkingSeconds(0);
    setIsAnalyzing(true);
    setStatus('');
    const startedAt = performance.now();
    const thinkingTimer = window.setInterval(() => {
      setAnalysisThinkingSeconds(Math.max(1, Math.round((performance.now() - startedAt) / 1000)));
    }, 500);
    try {
      let streamedContent = '';
      let reasoningContent = '';
      const content = await callModelStream({
        model: hotspotModel,
        prompt: activeHotspotPrompt?.content.trim() || HOTSPOT_ANALYSIS_SYSTEM_PROMPT,
        userContent: buildHotspotSuitabilityPrompt(item),
        recordType: 'stream',
        timeoutMs: 120000,
        onChunk: (chunk) => {
          streamedContent += chunk;
          setAnalysis(streamedContent);
        },
        onReasoning: (chunk) => {
          reasoningContent += chunk;
          setAnalysisReasoning(reasoningContent);
        },
      });
      setAnalysis(content);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI分析失败');
    } finally {
      window.clearInterval(thinkingTimer);
      setAnalysisThinkingSeconds(Math.max(1, Math.round((performance.now() - startedAt) / 1000)));
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
          <div className="text-lg font-bold">热点分析</div>
          <div className="mt-0.5 text-xs text-slate-400">DailyHotApi：百度、抖音、微博、知乎、B站</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="xy-capsule-group overflow-hidden">
            <button
              type="button"
              onClick={() => setIsRulePreviewOpen(true)}
              className="xy-capsule-button"
            >
              筛选规则
            </button>
          </div>
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
          <CombinedAiConfigSelect
            className="w-[312px]"
            modelValue={hotspotModel?.id ?? ''}
            promptValue={activeHotspotPromptId}
            modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
            promptOptions={hotspotPrompts.length === 0 ? [{ value: '', label: '无可用提示词', disabled: true }] : hotspotPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
            onModelChange={setHotspotModelIdWithStorage}
            onPromptChange={setHotspotPromptIdWithStorage}
            onModelManage={() => navigate('/model-manage')}
            onPromptManage={() => navigate(`/prompts?category=${encodeURIComponent(HOTSPOT_PROMPT_CATEGORY)}`)}
          />
        </div>
      </header>
      <SourceRadar activeSource={activeSource} onChange={setActiveSource} result={result} />
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)] gap-4 overflow-hidden p-4">
        <section className="min-h-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3 text-xs font-semibold text-slate-400">
            <span>{activeSource === 'all' ? '全部平台' : HOTSPOT_SOURCE_LABELS[activeSource]}：{filteredItems.length} 条高分 / {candidateItems.length} 条候选</span>
            <span>{activeItem ? '点击标题只选中' : '选择热点'}</span>
          </div>
            <div className="h-[calc(100%-40px)] overflow-auto">
              {filteredItems.map((item) => (
                <HotspotRow
                  key={item.id}
                  item={item}
                  evaluation={evaluateHotspotByRules(item)}
                  active={activeItem?.id === item.id}
                  onOpen={() => setActiveItemId(item.id)}
                  onAnalyze={() => void runSingleAnalysis(item)}
                  onOpenExternal={() => window.open(getHotspotExternalUrl(item), '_blank', 'noopener,noreferrer')}
                  disabled={isAnalyzing}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-slate-400">
                  {status || `暂无分数高于 ${HOTSPOT_MIN_DISPLAY_SCORE - 1} 的热点，可点击刷新重试。`}
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
                <FontSizeStepper
                  value={analysisFontSize}
                  min={HOTSPOT_ANALYSIS_MIN_FONT_SIZE}
                  max={HOTSPOT_ANALYSIS_MAX_FONT_SIZE}
                  onChange={setAnalysisFontSizeWithStorage}
                  ariaLabel="热点分析结果字号"
                />
              </div>
            </div>
            <div ref={analysisScrollRef} className="min-h-0 flex-1 overflow-auto bg-slate-50 p-5">
              {isAnalyzing || analysis || analysisReasoning ? (
                <HotspotAnalysisOutput
                  analysis={analysis}
                  reasoning={analysisReasoning}
                  thinkingSeconds={analysisThinkingSeconds}
                  isAnalyzing={isAnalyzing}
                  fontSettings={analysisFontSettings}
                />
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
      <HotspotRulePreviewModal isOpen={isRulePreviewOpen} onClose={() => setIsRulePreviewOpen(false)} />
    </div>
  );
}
