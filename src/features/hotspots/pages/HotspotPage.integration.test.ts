import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('hotspot page integration', () => {
  it('retires the hotspot page from app routes and default navigation', () => {
    const app = readSource('src/app/App.tsx');
    const nav = readSource('src/shared/navigation/navConfig.ts');

    expect(app).not.toContainSource('HotspotPage');
    expect(app).not.toContainSource('path="/hotspots"');
    expect(nav).not.toContainSource("to: '/hotspots'");
    expect(nav).toContainSource("'/hotspots'");
    expect(nav).toContainSource('REMOVED_ROUTES');
  });

  it('exposes hotspot fetching through the Electron preload bridge', () => {
    const preload = readSource('electron/preload.cjs');
    const main = readSource('electron/main.cjs');

    expect(preload).toContainSource("contextBridge.exposeInMainWorld('xinyuexiaHotspots'");
    expect(preload).toContainSource("ipcRenderer.invoke('hotspots:fetch-all'");
    expect(preload).toContainSource("ipcRenderer.invoke('hotspots:fetch-detail'");
    expect(main).toContainSource("registerTrustedIpcHandler('hotspots:fetch-all'");
    expect(main).toContainSource("registerTrustedIpcHandler('hotspots:fetch-detail'");
    expect(main).toContainSource('createHotspotService');
    expect(main).toContainSource('createHotspotDetailService');
  });

  it('shows the fetch status inside the empty hotspot list instead of hiding it at the bottom', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('暂无分数达到 ${minDisplayScore} 的热点');
    expect(page).toContainSource('filteredItems.length === 0');
  });

  it('uses the radar layout with one third hotspot list and two thirds AI suitability panel', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('SourceRadar');
    expect(page).toContainSource('grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)]');
    expect(page).toContainSource('AI 小说适合度');
    expect(page).not.toContainSource('<SourceFilter');
  });

  it('uses a dedicated hotspot model selector instead of the global active model', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('HOTSPOT_MODEL_ID_STORAGE_KEY');
    expect(page).toContainSource('HOTSPOT_PROMPT_ID_STORAGE_KEY');
    expect(page).toContainSource('HOTSPOT_ANALYSIS_FONT_SIZE_STORAGE_KEY');
    expect(page).toContainSource('HOTSPOT_ANALYSIS_PROMPT_CATEGORY');
    expect(page).toContainSource('const HOTSPOT_PROMPT_CATEGORY = HOTSPOT_ANALYSIS_PROMPT_CATEGORY;');
    expect(page).toContainSource('normalizePromptCategoryName(prompt.category) === HOTSPOT_PROMPT_CATEGORY');
    expect(page).toContainSource('navigate(`/prompts?category=${encodeURIComponent(HOTSPOT_PROMPT_CATEGORY)}`)');
    expect(page).toContainSource('CombinedAiConfigSelect');
    expect(page).toContainSource('usePrompts');
    expect(page).toContainSource('w-[312px]');
    expect(page).toContainSource('FontSizeStepper');
    expect(page).toContainSource('ariaLabel="热点分析结果字号"');
    expect(page).toContainSource('const hotspotModel =');
    expect(page).toContainSource('model: hotspotModel');
    expect(page).toContainSource('callModelStream');
    expect(page).toContainSource("recordType: 'stream'");
    expect(page).toContainSource('onReasoning: (chunk) =>');
    expect(page).toContainSource('setAnalysisReasoning(reasoningContent)');
    expect(page).toContainSource('<HotspotAnalysisOutput');
    expect(page).toContainSource('fontSettings={analysisFontSettings}');
    expect(page).toContainSource('prompt: activeHotspotPrompt?.content.trim() || HOTSPOT_ANALYSIS_SYSTEM_PROMPT');
    expect(page).not.toContainSource('model: activeModel');
    expect(page).not.toContainSource('callModel({');
  });

  it('places refresh and hotspot AI selectors in the page header', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');
    const pageHeader = page.slice(page.indexOf('<header'), page.indexOf('</header>'));
    const aiPanelHeaderStart = page.indexOf('truncate text-base font-black text-slate-900">AI 小说适合度');
    const aiPanelHeaderEnd = page.indexOf('<div ref={analysisScrollRef}', aiPanelHeaderStart);
    const aiPanelHeader = page.slice(aiPanelHeaderStart, aiPanelHeaderEnd);

    expect(pageHeader).toContainSource('设置');
    expect(pageHeader).toContainSource("{isFetching ? '刷新中' : '刷新'}");
    expect(pageHeader.indexOf('设置')).toBeLessThan(pageHeader.indexOf("{isFetching ? '刷新中' : '刷新'}"));
    expect(pageHeader).toContainSource('<CombinedAiConfigSelect');
    expect(pageHeader.indexOf("{isFetching ? '刷新中' : '刷新'}")).toBeLessThan(
      pageHeader.indexOf('<CombinedAiConfigSelect'),
    );
    expect(aiPanelHeader).toContainSource('FontSizeStepper');
    expect(aiPanelHeader).not.toContainSource('<CombinedAiConfigSelect');
  });

  it('applies local hotspot filtering rules before AI analysis', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');
    const rules = readSource('src/features/hotspots/model/hotspotRules.ts');

    expect(page).toContainSource(
      "import { HOTSPOT_RULE_BASE_SCORE, HOTSPOT_RULE_GROUPS, evaluateHotspotByRules, rankHotspotsByRuleEvaluation } from '@/features/hotspots/model/hotspotRules';",
    );
    expect(page).toContainSource('rankHotspotsByRuleEvaluation(activeSource ===');
    expect(page).toContainSource('evaluation={evaluateHotspotByRules(item)}');
    expect(page).toContainSource('evaluation.levelLabel');
    expect(page).toContainSource('HotspotSettingsModal');
    expect(page).toContainSource('setIsSettingsOpen(true)');
    expect(page).toContainSource('<HotspotSettingsModal');
    expect(page).toContainSource('HOTSPOT_MIN_DISPLAY_SCORE_STORAGE_KEY');
    expect(page).toContainSource('const [minDisplayScore, setMinDisplayScore] = useState(readHotspotMinDisplayScore);');
    expect(page).toContainSource('const [draftMinDisplayScore, setDraftMinDisplayScore] = useState(minDisplayScore);');
    expect(page).toContainSource('setDraftMinDisplayScore(minDisplayScore);');
    expect(page).toContainSource('const closeWithApply = () => {');
    expect(page).toContainSource('onApplyMinDisplayScore(draftMinDisplayScore);');
    expect(page).toContainSource('const applyMinDisplayScoreWithStorage = useCallback((nextScore: number) => {');
    expect(page).toContainSource('localStorage.setItem(HOTSPOT_MIN_DISPLAY_SCORE_STORAGE_KEY, String(score));');
    expect(page).toContainSource('HOTSPOT_DISPLAY_LIMIT');
    expect(page).toContainSource('.filter((item) => evaluateHotspotByRules(item).score >= minDisplayScore)');
    expect(page).toContainSource('.slice(0, HOTSPOT_DISPLAY_LIMIT)');
    expect(page).toContainSource('条高分 /');
    expect(page).toContainSource('ariaLabel="热点筛选最低分"');
    expect(page).toContainSource('minDisplayScore={minDisplayScore}');
    expect(page).toContainSource('onApplyMinDisplayScore={applyMinDisplayScoreWithStorage}');
    expect(page).not.toContainSource('}, [minDisplayScore]);');
    expect(rules).toContainSource('HOTSPOT_RULE_GROUPS');
    expect(rules).toContainSource('强情绪/强反转');
    expect(rules).toContainSource('真实刑案/伤亡高风险');
    expect(rules).toContainSource('政治/外交/军事敏感');
  });

  it('adds an external jump button before hotspot analysis', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');
    const rowSource = page.slice(page.indexOf('function HotspotRow'), page.indexOf('function readHotspotModelId'));

    expect(page).toContainSource('getHotspotExternalUrl');
    expect(page).toContainSource('grid-cols-[34px_minmax(0,1fr)_58px_82px]');
    expect(page).toContainSource('onOpenExternal: () => void;');
    expect(page).toContainSource(
      "onOpenExternal={() => window.open(getHotspotExternalUrl(item), '_blank', 'noopener,noreferrer')}",
    );
    expect(rowSource).toContainSource('跳转');
    expect(rowSource.indexOf('跳转')).toBeLessThan(rowSource.indexOf('开始分析'));
  });

  it('fetches hotspot page details before sending the item to AI analysis', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource(
      "import { fetchHotspotDetail, hasHotspotDetailContent } from '@/features/hotspots/model/hotspotDetail';",
    );
    expect(page).toContainSource("setStatus('正在抓取热点详情...')");
    expect(page).toContainSource('const detail = await fetchHotspotDetail(item).catch');
    expect(page).toContainSource('hasHotspotDetailContent(detail)');
    expect(page).toContainSource(
      "setStatus(hasDetail ? '已获取热点详情，正在交给 AI 分析。' : '未获取到热点详情，仅基于标题分析。')",
    );
    expect(page).toContainSource('userContent: buildHotspotSuitabilityPrompt(item, detail)');
  });

  it('uses editor-style font settings for hotspot analysis output', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource(
      "import { getEditorTextLineHeight, getStoredFontSettings, type FontSettings } from '@/features/workbench/components/EditorToolModals';",
    );
    expect(page).toContainSource(
      'const [analysisFontSize, setAnalysisFontSize] = useState(readHotspotAnalysisFontSize);',
    );
    expect(page).toContainSource('const analysisFontSettings = useMemo(() => ({');
    expect(page).toContainSource('fontSize: analysisFontSize');
    expect(page).toContainSource('const setAnalysisFontSizeWithStorage = useCallback((nextFontSize: number) => {');
    expect(page).toContainSource('localStorage.setItem(HOTSPOT_ANALYSIS_FONT_SIZE_STORAGE_KEY, String(fontSize));');
    expect(page).toContainSource('lineHeight: getEditorTextLineHeight(fontSettings)');
    expect(page).toContainSource('<pre className="whitespace-pre-wrap break-words" style={analysisTextStyle}>');
  });

  it('lets hotspot settings control whether the analysis panel auto-scrolls while streaming output', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('HOTSPOT_ANALYSIS_AUTO_SCROLL_STORAGE_KEY');
    expect(page).toContainSource(
      'const [autoScrollAnalysis, setAutoScrollAnalysis] = useState(readHotspotAnalysisAutoScroll);',
    );
    expect(page).toContainSource(
      'const [draftAutoScrollAnalysis, setDraftAutoScrollAnalysis] = useState(autoScrollAnalysis);',
    );
    expect(page).toContainSource('onApplyAutoScrollAnalysis(draftAutoScrollAnalysis);');
    expect(page).toContainSource('localStorage.setItem(HOTSPOT_ANALYSIS_AUTO_SCROLL_STORAGE_KEY, String(nextValue));');
    expect(page).toContainSource('输出滚动');
    expect(page).toContainSource('跟随输出滚动');
    expect(page).toContainSource('不跟随输出');
    expect(page).toContainSource('const analysisScrollRef = useRef<HTMLDivElement | null>(null);');
    expect(page).toContainSource('if (!isAnalyzing) return;');
    expect(page).toContainSource('if (!autoScrollAnalysis) return;');
    expect(page).toContainSource('const scrollContainer = analysisScrollRef.current;');
    expect(page).toContainSource('window.requestAnimationFrame(() => {');
    expect(page).toContainSource('scrollContainer.scrollTop = scrollContainer.scrollHeight;');
    expect(page).toContainSource('}, [analysis, analysisReasoning, autoScrollAnalysis, isAnalyzing]);');
    expect(page).toContainSource('ref={analysisScrollRef}');
  });

  it('collapses completed reasoning to preserve analysis reading space', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('const [isReasoningOpen, setIsReasoningOpen] = useState(isAnalyzing);');
    expect(page).toContainSource('const showReasoningBody = isAnalyzing || isReasoningOpen;');
    expect(page).toContainSource('setIsReasoningOpen(isAnalyzing);');
    expect(page).toContainSource('if (!isAnalyzing) setIsReasoningOpen((current) => !current);');
    expect(page).toContainSource('disabled={isAnalyzing}');
    expect(page).toContainSource("{isReasoningOpen ? '收起' : '展开'}");
    expect(page).toContainSource('{showReasoningBody && (');
  });

  it('uses a text save button for saving hotspot analysis to the brainstorm library', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('保存到脑洞库');
    expect(page).toContainSource('className="xy-capsule-button"');
    expect(page).toContainSource('items-center justify-between gap-4 border-t border-slate-100 bg-white px-4');
    expect(page).not.toContainSource('IconButton label="保存到脑洞库"');
    expect(page).not.toContainSource('<Save className=');
  });

  it('keeps hotspot actions focused on refresh, save, and centered current-hotspot analysis', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource("{isFetching ? '刷新中' : '刷新'}");
    expect(page).toContainSource('mt-6 flex justify-center');
    expect(page).toContainSource('开始分析');
    expect(page).not.toContainSource('组合题材');
    expect(page).not.toContainSource('sendToWorkbench');
    expect(page).not.toContainSource('IconButton label="送入工作台"');
    expect(page).not.toContainSource('<Send className=');
    expect(page).not.toContainSource('buildHotspotCombinationPrompt');
  });

  it('requires explicit start analysis actions instead of auto-analyzing on hotspot selection', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContainSource('grid-cols-[34px_minmax(0,1fr)_58px_82px]');
    expect(page).toContainSource('onOpen={() => setActiveItemId(item.id)}');
    expect(page).toContainSource('onAnalyze={() => void runSingleAnalysis(item)}');
    expect(page).toContainSource('点击标题只选中');
    expect(page).not.toContainSource('type="checkbox"');
    expect(page).not.toContainSource('selectedIds');
    expect(page).not.toContainSource('toggleSelected');
    expect(page).not.toContainSource('分析当前热点');
  });
});
