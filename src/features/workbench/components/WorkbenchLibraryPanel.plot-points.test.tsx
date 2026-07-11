import { beforeEach, describe, expect, it } from 'vitest';
import {
  getWorkbenchPlotPointDisplayText,
  getWorkbenchPlotPointReview,
} from '@/features/workbench/model/workbenchPlotChain';
import { parseGeneratedPlotPointCandidates } from './WorkbenchLibraryPanel';
import {
  readWorkbenchLibraryPanelSource,
  readWorkbenchPlotChainSource,
  readWorkbenchPlotPointChainWorkspaceSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel plot-point flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps full plot point text when generated content contains a narrative colon', () => {
    const candidates = parseGeneratedPlotPointCandidates(
      [
        '1. 林刻猛地从课桌上惊醒，发现自己竟然回到了高考考场上，但周围一切又不太对劲——这不是三年前的高考，而是三年后他死去的那一刻！脑海深处突然响起机械声：“学霸修仙系统绑定成功，倒计时72小时，请宿主做好准备，三日后地球将迎来第一波灵气潮汐。”',
        'AI评价：这个开头直接建立主角处境和重生带来的震撼，同时立刻引入系统金手指和倒计时压力，制造紧迫感和悬念。',
      ].join('\n'),
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].adapted).toContainSource('林刻猛地从课桌上惊醒');
    expect(candidates[0].adapted).toContainSource('脑海深处突然响起机械声');
    expect(candidates[0].adapted).toContainSource('学霸修仙系统绑定成功');
    expect(candidates[0].review).toContainSource('这个开头直接建立主角处境');
  });

  it('moves inline plot point AI review text out of the timeline preview body', () => {
    const item = {
      id: 'ai:inline-review',
      title: '缴费窗口冲突',
      source: 'AI生成',
      originalGenre: 'AI生成',
      original: '',
      adapted:
        '林刻盯着那份合同沉默几秒，最终还是咬破指尖按了下去。\\nAI评价：医院到武馆的切入把妹妹这条软肋立得很稳，压力直接。',
      variable: '',
      score: '82',
    } as const;

    const displayText = getWorkbenchPlotPointDisplayText(item, item.adapted);
    const reviewText = getWorkbenchPlotPointReview(item, true);

    expect(displayText).toContainSource('林刻盯着那份合同沉默几秒');
    expect(displayText).not.toContainSource('AI评价');
    expect(displayText).not.toContainSource('医院到武馆');
    expect(reviewText).toContainSource('AI评价：医院到武馆的切入');
  });

  it('does not show an AI dialogue label in the plot point generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointAreaEnd = panelSource.indexOf('title={plotPointLinkedSettingSummary}');
    const plotPointAreaStart = panelSource.lastIndexOf(
      '<div className="relative flex min-h-0 flex-1 flex-col">',
      plotPointAreaEnd,
    );
    const plotPointAreaSource = panelSource.slice(plotPointAreaStart, plotPointAreaEnd);

    expect(plotPointAreaEnd).toBeGreaterThan(-1);
    expect(plotPointAreaStart).toBeGreaterThan(-1);
    expect(plotPointAreaEnd).toBeGreaterThan(plotPointAreaStart);
    expect(plotPointAreaSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value',
    );
    expect(plotPointAreaSource).not.toContainSource('AI对话框');
    expect(plotPointAreaSource).not.toContainSource('rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(plotPointAreaSource).not.toContainSource(
      'absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950',
    );
  });

  it('does not show the plot chain generation rules heading in the right panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointControlsStart = panelSource.indexOf(
      '<span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>',
    );
    const plotPointControlsEnd = panelSource.indexOf(
      '<div className="relative flex min-h-0 flex-1 flex-col">',
      plotPointControlsStart,
    );
    const plotPointControlsSource = panelSource.slice(plotPointControlsStart, plotPointControlsEnd);

    expect(plotPointControlsStart).toBeGreaterThan(-1);
    expect(plotPointControlsEnd).toBeGreaterThan(plotPointControlsStart);
    expect(plotPointControlsSource).toContainSource('剧情点类型：');
    expect(plotPointControlsSource).toContainSource('剧情点数量：');
    expect(plotPointControlsSource).not.toContainSource('生成规则</div>');
  });

  it('keeps plot point preview actions at the bottom without the preview title or status copy', async () => {
    const workspaceSource = await readWorkbenchPlotPointChainWorkspaceSource();
    const centerPanelStart = workspaceSource.indexOf('<section className="min-w-0 flex min-h-0 flex-col bg-white">');
    const centerPanelSource = workspaceSource.slice(centerPanelStart);
    const candidateListIndex = centerPanelSource.indexOf('visibleCandidates.length === 0');
    const actionRowIndex = centerPanelSource.indexOf(
      '<div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">',
    );

    expect(centerPanelStart).toBeGreaterThan(-1);
    expect(candidateListIndex).toBeGreaterThan(-1);
    expect(actionRowIndex).toBeGreaterThan(candidateListIndex);
    expect(centerPanelSource).not.toContainSource('<h2 className="text-sm font-black text-slate-950">剧情点预览</h2>');
    expect(centerPanelSource).not.toContainSource('等待手动刷新衔接剧情');
    expect(centerPanelSource).toContainSource('清空');
    expect(centerPanelSource).toContainSource('重新生成');
    expect(centerPanelSource).toContainSource('继续生成');
  });

  it('renders plot chain slots with the same collapsible tree structure as the chapter sidebar', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const gridTemplateStart = panelSource.indexOf(
      'gridTemplateColumns: `${plotPointLayoutTreeWidth}',
      plotPointStandaloneStart,
    );
    const navStart = panelSource.indexOf(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">',
    );
    const navEnd = panelSource.indexOf('</nav>', navStart);
    const navSource = panelSource.slice(navStart, navEnd);

    expect(gridTemplateStart).toBeGreaterThan(-1);
    expect(panelSource.slice(gridTemplateStart, gridTemplateStart + 240)).toContainSource(
      '${plotPointLayoutTreeWidth}px 0px ${plotPointLayoutLeftWidth}px 0px',
    );
    expect(navStart).toBeGreaterThan(-1);
    expect(navEnd).toBeGreaterThan(navStart);
    expect(panelSource).toContainSource(
      'const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() => readPlotPointLayoutTreeWidth(storageKey));',
    );
    expect(panelSource).toContainSource('plotPointTreeResizeHandle,');
    expect(panelSource).toContainSource('plotPointTreeResizeHandle: (');
    expect(panelSource).toContainSource('onPointerDown={startPlotPointTreeWidthResize}');
    expect(panelSource).toContainSource('title="拖拽调整剧情链目录宽度"');
    expect(panelSource).toContainSource('{plotPointTreeResizeHandle}');
    expect(panelSource).toContainSource(
      'const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() =>',
    );
    expect(panelSource).toContainSource('normalizePlotPointChainNames(activeTabConfig.plotPointChainNames)');
    expect(panelSource).not.toContainSource('aria-label="剧情链名称"');
    expect(panelSource).not.toContainSource('value={currentPlotPointChainName}');
    expect(panelSource).not.toContainSource('onChange={(event) => renamePlotPointChain(event.target.value)}');
    expect(panelSource).toContainSource(
      'const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<Record<PlotPointChainSlot, boolean>>({',
    );
    expect(panelSource).not.toContainSource(
      '<h2 className="whitespace-nowrap text-sm font-bold text-gray-900">剧情链</h2>',
    );
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(navSource).toContainSource('aria-label="当前主链未写序号导航"');
    expect(navSource).toContainSource('onContextMenu={(event) => {');
    expect(navSource).toContainSource('setPlotPointChainMenuSlot(plotPointActiveChainSlot)');
    expect(navSource).toContainSource(
      'setPlotPointChainRenameDraft(plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`)',
    );
    expect(navSource).toContainSource('aria-label="当前主链菜单"');
    expect(navSource).toContainSource('renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)');
    expect(navSource).toContainSource(
      'const originalIndex = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);',
    );
    expect(navSource).toContainSource('plotPointUnwrittenItems.map((item) => {');
    expect(navSource).toContainSource('aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContainSource("setPlotPointChainFilterMode('all')");
    expect(navSource).toContainSource('setActivePlotPointChainItemId(item.id)');
    expect(navSource).toContainSource('暂无未写剧情点');
    expect(navSource).toContainSource("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}");
    expect(navSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>',
    );
    expect(navSource).toContainSource('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(navSource).toContainSource(
      'PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (',
    );
    expect(navSource).toContainSource('onClick={() => setActivePlotPointChainSlot(slot)}');
    expect(navSource).toContainSource(
      'aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}',
    );
    expect(navSource).toContainSource('expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true');
    expect(navSource).not.toContainSource('{PLOT_POINT_CHAIN_SLOTS.length}条');
    expect(navSource).toContainSource('主链');
    expect(navSource).not.toContainSource(
      '{plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`}',
    );
    expect(navSource).toContainSource('{plotPointUnwrittenItems.length}未写');
    expect(navSource).toContainSource(
      'className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"',
    );
    expect(navSource).toContainSource(
      '<summary className="xy-plot-chain-summary flex cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-sm font-bold leading-5 text-white transition-colors hover:brightness-95">',
    );
    expect(navSource).toContainSource(
      '<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">',
    );
    expect(navSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{plotPointChainNames[slot] ?? `剧情链${slot}`}</span>',
    );
    expect(navSource).toContainSource(
      '<span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{(plotPointChainSelections[slot] ?? []).length}点</span>',
    );
    expect(navSource).toContainSource('xy-plot-chain-summary');
    expect(navSource).toContainSource('className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"');
    expect(navSource).toContainSource('className="mt-1 grid gap-2 px-1.5 py-1.5"');
    expect(navSource).toContainSource(
      'relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors',
    );
    expect(navSource).toContainSource('activePoint');
    expect(navSource).toContainSource("'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
    expect(navSource).toContainSource('title={`未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContainSource('{originalIndex + 1}');
    expect(navSource).not.toContainSource('className="ml-1 mt-0.5 space-y-0.5"');
    expect(navSource).not.toContainSource("activePoint ? 'text-orange-600' : 'text-gray-700'");
    expect(navSource).not.toContainSource('剧情点{originalIndex + 1}');
    expect(navSource).not.toContainSource('border-transparent hover:bg-gray-50');
    expect(navSource).not.toContainSource('ring-2 ring-[#bdeef7]');
    expect(navSource).not.toContainSource('border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-100');
    expect(navSource).not.toContainSource('border-[#08AACE] bg-[#08AACE] text-white');
    expect(navSource).not.toContainSource(
      'border-[#bdeef7] bg-white text-[#078fb0] hover:border-[#08AACE] hover:bg-[#F7FCFE]',
    );
    expect(navSource).not.toContainSource('text-orange-500');
    expect(navSource).not.toContainSource('剧情点{index + 1}');
    expect(navSource).not.toContainSource('PLOT_POINT_CHAIN_SLOTS.map((slot) => {');
    expect(panelSource).not.toContainSource('aria-label="剧情链导航"');
    expect(panelSource).not.toContainSource('mb-3 flex min-w-0 gap-2 overflow-x-auto');
    expect(panelSource).not.toContainSource(
      '<h2 className="text-sm font-black text-slate-950">剧情链{plotPointActiveChainSlot}</h2>',
    );
    expect(panelSource).toContainSource('选中的剧情点会加入当前剧情链。');
    expect(panelSource).not.toContainSource('选中的剧情点会加入当前数字剧情链。');
  });

  it('renders selected plot point cards as a full-content timeline preview area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotChainSource = await readWorkbenchPlotChainSource();
    const workspaceSource = await readWorkbenchPlotPointChainWorkspaceSource();
    const selectedListStart = workspaceSource.indexOf('relative space-y-4 pl-6 before:absolute');
    const selectedListEnd = workspaceSource.indexOf('{leftResizeHandle}', selectedListStart);
    const selectedListSource = workspaceSource.slice(selectedListStart, selectedListEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(selectedListEnd).toBeGreaterThan(selectedListStart);
    expect(panelSource).toContainSource(
      "const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');",
    );
    expect(panelSource).toContainSource(
      'const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];',
    );
    expect(panelSource).toContainSource(
      'const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));',
    );
    expect(panelSource).toContainSource("if (plotPointChainFilterMode === 'written') return written;");
    expect(panelSource).toContainSource("if (plotPointChainFilterMode === 'unwritten') return !written;");
    expect(panelSource).toContainSource('onMarkWritten={markPlotPointChainItemWritten}');
    expect(panelSource).toContainSource('onMoveToUnwritten={movePlotPointChainItemToUnwritten}');
    expect(panelSource).toContainSource("['all', '全部']");
    expect(panelSource).toContainSource("['unwritten', '只看未写']");
    expect(panelSource).toContainSource("['written', '只看已写']");
    expect(panelSource).toContainSource('className="flex flex-wrap items-center gap-2"');
    expect(panelSource).toContainSource('h-10 w-20 whitespace-nowrap rounded-2xl border px-2');
    expect(panelSource).toContainSource('h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE]');
    expect(panelSource).not.toContainSource('grid-cols-[repeat(auto-fit,minmax(128px,1fr))]');
    expect(panelSource).toContainSource('onOpenDetailOutline={openDetailOutlineFromPlotPoint}');
    expect(panelSource).not.toContainSource("['hideWritten', '已写隐藏']");
    expect(selectedListSource).toContainSource('visibleSelectedItems.map((item) => {');
    expect(selectedListSource).toContainSource('const written = writtenIds.has(item.id);');
    expect(selectedListSource).toContainSource("written ? '移回未写' : '标为已写'");
    expect(selectedListSource).toContainSource('删除');
    expect(selectedListSource).not.toContainSource('生成章纲');
    expect(panelSource).toContainSource('当前过滤条件下没有剧情点');
    expect(selectedListSource).toContainSource("['内容', metrics.clarity]");
    expect(selectedListSource).toContainSource("['潜力', metrics.potential]");
    expect(selectedListSource).toContainSource("['衔接', metrics.fit]");
    expect(selectedListSource).toContainSource(
      'const reviewExpanded = expandedPreviewIds.includes(`chain-review:${item.id}`);',
    );
    expect(selectedListSource).not.toContainSource('时间线预览 · 剧情点');
    expect(selectedListSource).not.toContainSource('item.title || `剧情点 ${index + 1}`');
    expect(selectedListSource).not.toContainSource('className="flex items-start justify-end gap-3"');
    expect(selectedListSource).toContainSource('className="mt-3 flex items-center justify-between gap-3"');
    expect(selectedListSource).toContainSource('className="flex shrink-0 flex-wrap items-center justify-end gap-2"');
    expect(selectedListSource).toContainSource('relative space-y-4 pl-6 before:absolute');
    expect(selectedListSource).toContainSource(
      'editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]',
    );
    expect(selectedListSource).not.toContainSource(
      'editor-scrollbar mt-3 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]',
    );
    expect(selectedListSource).toContainSource('{displayText}');
    expect(selectedListSource).not.toContainSource('aria-hidden="true"');
    expect(selectedListSource).not.toContainSource('>剧情点 {index + 1}</span>');
    expect(selectedListSource).not.toContainSource('line-clamp-6 text-sm font-bold leading-6 text-slate-700');
    expect(selectedListSource).toContainSource('mt-3 grid grid-cols-3 gap-2');
    expect(panelSource).toContainSource("from '@/features/workbench/model/workbenchPlotChain'");
    expect(plotChainSource).toContainSource('function getWorkbenchPlotPointMetricClass(score: number)');
    expect(plotChainSource).toContainSource("if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';");
    expect(plotChainSource).toContainSource(
      "if (score >= 80) return 'border-purple-200 bg-purple-50 text-purple-700';",
    );
    expect(plotChainSource).toContainSource("if (score >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';");
    expect(plotChainSource).toContainSource("return 'border-emerald-200 bg-emerald-50 text-emerald-700';");
    expect(selectedListSource).toContainSource('${getWorkbenchPlotPointMetricClass(value)}');
    expect(selectedListSource).toContainSource('onClick={() => onTogglePreviewExpanded(`chain-review:${item.id}`)}');
    const writtenActionIndex = selectedListSource.indexOf(': onMarkWritten(item.id)');
    expect(selectedListSource.indexOf('mt-3 grid grid-cols-3 gap-2')).toBeLessThan(
      selectedListSource.indexOf('onClick={() => onTogglePreviewExpanded(`chain-review:${item.id}`)}'),
    );
    expect(
      selectedListSource.indexOf('onClick={() => onTogglePreviewExpanded(`chain-review:${item.id}`)}'),
    ).toBeLessThan(writtenActionIndex);
    expect(selectedListSource).toContainSource("{reviewExpanded ? '收起AI评价' : 'AI评价'}");
    expect(selectedListSource).toContainSource('{reviewExpanded && (');
    expect(selectedListSource).toContainSource('getWorkbenchPlotPointReview(item, isFollowupStage)');
    expect(selectedListSource).not.toContainSource('w-[104px] shrink-0 space-y-1.5');
    expect(selectedListSource).not.toContainSource(
      'flex h-8 items-center justify-between rounded-xl bg-white px-3 shadow-sm',
    );
    expect(selectedListSource).toContainSource(
      'flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm',
    );
    expect(selectedListSource).toContainSource('text-xs font-black opacity-80');
    expect(selectedListSource).toContainSource('text-sm font-black');
    expect(selectedListSource).not.toContainSource('text-center shadow-sm');
    expect(selectedListSource).not.toContainSource('潜力 {metrics.potential}');
    expect(panelSource).toContainSource('title="拖拽调整剧情链左侧宽度"');
    expect(panelSource).toContainSource('widthClass="w-3"');
    expect(panelSource).toContainSource('h-full ${widthClass} -translate-x-1/2 shrink-0 cursor-ew-resize');
    expect(panelSource).toContainSource(
      'h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100',
    );
    expect(selectedListSource).not.toContainSource('transition-colors hover:bg-[#EAF9FD]');
  });

  it('keeps plot chain action buttons white instead of emerald tinted on the detail outline page', async () => {
    const workspaceSource = await readWorkbenchPlotPointChainWorkspaceSource();
    const writtenButtonAnchor = workspaceSource.indexOf(': onMarkWritten(item.id)');
    const writtenButtonStart = workspaceSource.lastIndexOf('<button', writtenButtonAnchor);
    const writtenButtonEnd = workspaceSource.indexOf('</button>', writtenButtonAnchor);
    const writtenButtonSource = workspaceSource.slice(writtenButtonStart, writtenButtonEnd);

    expect(writtenButtonAnchor).toBeGreaterThan(-1);
    expect(writtenButtonSource).toContainSource(
      "'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-white hover:text-emerald-800'",
    );
    expect(writtenButtonSource).not.toContainSource('bg-emerald-50');
    expect(writtenButtonSource).not.toContainSource('hover:bg-emerald-100');
  });

  it('hides raw reasoning text in the plot chain right output so it matches final candidates', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const renderFunctionStart = panelSource.indexOf(
      'function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {})',
    );
    const renderFunctionEnd = panelSource.indexOf('\n\nimport ', renderFunctionStart);
    const renderFunctionSource = panelSource.slice(renderFunctionStart, renderFunctionEnd);

    expect(renderFunctionStart).toBeGreaterThan(-1);
    expect(renderFunctionEnd).toBeGreaterThan(renderFunctionStart);
    expect(renderFunctionSource).toContainSource('options.hideReasoningBody ?');
    expect(renderFunctionSource).toContainSource('<span>{thinkingLabel}</span>');
    expect(renderFunctionSource).toContainSource('{reasoning && (');
    expect(panelSource).toContainSource(
      'renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })',
    );
  });

  it('removes the plot chain tree design scheme test page after applying scheme A', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('剧情链目录分组方案');
    expect(testCollectionSource).not.toContainSource('/plot-chain-tree-design-test');
    expect(testCollectionSource).not.toContainSource('PlotChainTreeDesignTestPage');
    expect(testCollectionSource).not.toContainSource('PlotChainTreeDesignA');
    expect(testCollectionSource).not.toContainSource('方案 A：目录树层级');
    expect(testCollectionSource).not.toContainSource('方案 D：紧凑深浅对比');
  });

  it('removes the plot chain left detail scheme test page after applying scheme E to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(testCollectionSource).not.toContainSource('PlotChainLeftDetailTestPage');
    expect(testCollectionSource).not.toContainSource('/plot-chain-left-detail-test');
    expect(testCollectionSource).not.toContainSource('剧情链左二调试方案');
    expect(panelSource).toContainSource('aria-label="当前主链未写序号导航"');
    expect(panelSource).toContainSource('aria-label="当前主链菜单"');
    expect(panelSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>',
    );
    expect(panelSource).toContainSource('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(panelSource).toContainSource('plotPointChainWrittenSelections');
    expect(panelSource).toContainSource('onMarkWritten={markPlotPointChainItemWritten}');
    expect(panelSource).toContainSource("['written', '只看已写']");
  });

  it('keeps detail outline reader plot chain plumbing out of the visible tabs', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines' | 'plotChain';",
    );
    expect(panelSource).toContainSource('detailOutlineReaderPlotChainIds?: string[];');
    expect(panelSource).toContainSource(
      'const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds]',
    );
    expect(panelSource).toContainSource(
      'const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])',
    );
    expect(panelSource).not.toContainSource("['plotChain', '剧情链']");
    expect(panelSource).toContainSource("detailOutlineReaderTab === 'plotChain'");
    expect(panelSource).toContainSource('toggleDraftDetailOutlineReaderPlotChain(item.id)');
    expect(panelSource).toContainSource('detailOutlineReaderPlotChainIds: nextPlotChainIds');
    expect(panelSource).toContainSource("wrapAiRequestTag('关联资料', innerContext)");
    expect(panelSource).toContainSource("wrapAiRequestTag('设定资料', settingText)");
    expect(panelSource).toContainSource("wrapAiRequestTag('角色资料', roleText)");
    expect(panelSource).toContainSource("wrapAiRequestTag('剧情链', plotChainText)");
    expect(panelSource).toContainSource("const DETAIL_OUTLINE_STATE_MARKER = '【本章状态变化预期】';");
    expect(panelSource).toContainSource('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(panelSource).toContainSource('mergeDetailOutlineStateExpectation(');
    expect(panelSource).toContainSource(
      '请根据关联的设定、前文章纲和剧情链生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}',
    );
    expect(panelSource).toContainSource(
      '<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>',
    );
  });
});
