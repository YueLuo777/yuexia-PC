import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { WorkbenchLibraryPanel, parseGeneratedPlotPointCandidates } from './WorkbenchLibraryPanel';

const readWorkbenchLibraryPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchLibraryPanel.tsx'), 'utf8');
};

const readSharedStylesSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/styles/index.css'), 'utf8');
};

const readCombinedAiConfigSelectSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CombinedAiConfigSelect.tsx'), 'utf8');
};

const readModelHookSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../models/hooks/useModels.ts'), 'utf8');
};

const readChapterEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterEditor.tsx'), 'utf8');
};

const readWorkbenchPlotChainSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../model/workbenchPlotChain.ts'), 'utf8');
};

const readTestCollectionSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/TestCollectionPage.tsx'), 'utf8');
};

const readBorderBackplateApplicationTestSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/BorderBackplateApplicationTestPage.tsx'), 'utf8');
};

describe('WorkbenchLibraryPanel embedded flow navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render the internal setting role brainstorm tabs and shows the requested brainstorm page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('这里显示选中的脑洞内容，也可以直接编辑。');
    expect(panelSource).toContain('defaultActiveTab');
    expect(panelSource).not.toContain("tabs={['设定', '角色', '脑洞']}");
  });
  it('places brainstorm output clear action on the top right and font tools in the header slot', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const actionToolStart = panelSource.indexOf('<div className="xy-floating-brainstorm-output-action-tool');
    const actionToolSource = panelSource.slice(actionToolStart, panelSource.indexOf('<label', actionToolStart));
    const brainstormPreviewStart = panelSource.indexOf('placeholder="这里显示选中的脑洞内容，也可以直接编辑。"');
    const brainstormPreviewEnd = panelSource.indexOf('</main>', brainstormPreviewStart);
    const brainstormPreviewSource = panelSource.slice(brainstormPreviewStart, brainstormPreviewEnd);
    const brainstormOutputStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const brainstormOutputEnd = panelSource.indexOf('className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"', brainstormOutputStart);
    const brainstormOutputSource = panelSource.slice(brainstormOutputStart, brainstormOutputEnd);

    expect(panelSource).toContain('xy-floating-brainstorm-output-action-tool');
    expect(actionToolSource).toContain('onClick={clearLibraryAiDialog}');
    expect(actionToolSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(actionToolSource).not.toContain('border-r border-slate-200');
    expect(actionToolSource).toContain('xy-floating-brainstorm-output-action-tool xy-border-embedded-transparent-backplate');
    expect(actionToolSource).toContain('className="text-base font-medium leading-5 text-red-500');
    expect(panelSource).toContain('const renderBrainstormFontSizeTool = () => {');
    expect(panelSource).toContain('if (activeTab !== BRAINSTORM_TAB) return null;');
    expect(panelSource).toContain('className="xy-header-stream-tool"');
    expect(panelSource).toContain('ariaLabel="脑洞输出字号"');
    expect(panelSource).toContain('ariaLabel="脑洞预览字号"');
    expect(panelSource).toContain('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(brainstormPreviewSource).not.toContain('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContain('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContain('xy-floating-border-stream-tool');
    expect(panelSource).toContain('className="xy-stream-toggle-text">流式输出</span>');
    expect(panelSource).toContain('className="xy-stream-toggle-track"');
    expect(panelSource).toContain('className="xy-stream-toggle-thumb"');
    expect(panelSource).toContain('updateActiveTabConfig({ brainstormStreamEnabled: event.target.checked })');
    expect(panelSource).not.toContain('xy-floating-brainstorm-output-font-tool');
    expect(panelSource).not.toContain('<span>流式输出</span>');
    expect(styleSource).toContain('.xy-floating-border-stream-tool {');
    expect(styleSource).toContain('.xy-header-stream-tool {');
    expect(styleSource).toContain('.xy-stream-toggle-text {');
    expect(styleSource).toContain('height: 1.76rem;');
    expect(styleSource).toContain('height: 2.25rem;');
    expect(styleSource).toContain('background: #ffffff;');
    expect(styleSource).toContain('width: 2.02rem;');
    expect(styleSource).toContain('.xy-stream-toggle-track {');
    expect(styleSource).toContain('background: #08AACE;');
  });
  it('uses transparent border backplates for combined model and prompt selector labels', async () => {
    const source = await readCombinedAiConfigSelectSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContain('xy-combined-ai-config-label xy-border-embedded-transparent-backplate');
    expect(source).toContain('xy-combined-ai-config-manage xy-border-embedded-transparent-backplate');
    expect(source).not.toContain('-translate-y-1/2 bg-white px-1.5 text-[11px]');
    expect(source).not.toContain('text-[11px] font-black leading-none text-[#08AACE]');
    expect(source).not.toContain('rounded-full bg-white text-[#08AACE]');
    expect(styleSource).toContain('.xy-combined-ai-config-label,');
    expect(styleSource).toContain('font-size: 13px;');
    expect(styleSource).toContain('min-width: 2.65rem;');
    expect(styleSource).toContain('background-image: none !important;');
    expect(styleSource).toContain('.xy-combined-ai-config-label::before,');
    expect(styleSource).toContain('display: none !important;');
    expect(styleSource).toContain('.xy-combined-ai-config-manage svg');
    expect(styleSource).toContain('drop-shadow(0 0 1px #ffffff)');
  });
  it('keeps full plot point text when generated content contains a narrative colon', () => {
    const candidates = parseGeneratedPlotPointCandidates([
      '1. 林刻猛地从课桌上惊醒，发现自己竟然回到了高考考场上，但周围一切又不太对劲——这不是三年前的高考，而是三年后他死去的那一刻！脑海深处突然响起机械声：“学霸修仙系统绑定成功，倒计时72小时，请宿主做好准备，三日后地球将迎来第一波灵气潮汐。”',
      'AI评价：这个开头直接建立主角处境和重生带来的震撼，同时立刻引入系统金手指和倒计时压力，制造紧迫感和悬念。',
    ].join('\n'));

    expect(candidates).toHaveLength(1);
    expect(candidates[0].adapted).toContain('林刻猛地从课桌上惊醒');
    expect(candidates[0].adapted).toContain('脑海深处突然响起机械声');
    expect(candidates[0].adapted).toContain('学霸修仙系统绑定成功');
    expect(candidates[0].review).toContain('这个开头直接建立主角处境');
  });
  it('places preview word counts on the top-left border beside frame titles', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-floating-field .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContain('left: var(--xy-floating-count-left, 6.2rem);');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count.xy-floating-count-top-left::before');
    expect(styleSource).toContain('left: -1.2rem;');
    expect(styleSource).toContain('top: 0;');
    expect(panelSource).toContain('xy-floating-count xy-floating-count-top-left');
    expect(panelSource).toContain('<label className={isDetailOutlineTab ? \'xy-floating-title-count xy-detail-outline-title-count\' : undefined}>');
    expect(panelSource).toContain('<label aria-hidden="true" className="opacity-0">脑洞预览</label>');
    expect(panelSource).toContain('aria-label="脑洞名称"');
    expect(panelSource).toContain('onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}');
    expect(panelSource).toContain('xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none');
    expect(panelSource).toContain('style={getFloatingTitleInputStyle(currentSelectedEntry.title, 3, 9)}');
    expect(panelSource).toContain('style={getFloatingTitleInputStyle(titleValue, 4, 12)}');
    expect(panelSource).toContain('<label className="xy-floating-title-count">设定预览 <span><WordCountText value={countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} /></span></label>');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label.xy-floating-title-count');
    expect(styleSource).toContain('gap: 0.32rem;');
    expect(styleSource).toContain('.xy-floating-title-count > span');
    expect(styleSource).toContain('width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('border: 0 !important;');
    expect(styleSource).toContain('border-radius: 0 !important;');
    expect(styleSource).toContain('background: transparent !important;');
    expect(styleSource).toContain('padding: 0 !important;');
    expect(panelSource).toContain("'--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`");
    expect(styleSource).toContain('height: 20px;');
    expect(styleSource).toContain('align-items: baseline;');
    expect(styleSource).toContain('font-size: 1rem;');
    expect(styleSource).toContain('font-weight: 500;');
    expect(styleSource).toContain('line-height: 20px;');
    expect(styleSource).toContain('display: block !important;');
    expect(styleSource).toContain('min-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('max-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('height: 20px !important;');
    expect(styleSource).toContain('min-height: 0 !important;');
    expect(styleSource).toContain('line-height: 20px !important;');
    expect(styleSource).toContain('top: 0 !important;');
    expect(styleSource).toContain('transform: translateY(-50%) !important;');
    const brainstormPreviewFieldRuleStart = styleSource.indexOf('.xy-floating-field.xy-brainstorm-preview-field textarea {');
    const brainstormPreviewFieldRule = styleSource.slice(
      brainstormPreviewFieldRuleStart,
      styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-rich-preview', brainstormPreviewFieldRuleStart),
    );
    expect(brainstormPreviewFieldRule).toContain('border-color: #111827;');
    expect(styleSource).toContain('margin-top: -0.375rem;');
    expect(styleSource).toContain('padding-top: 0.625rem;');
    const brainstormOutputTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-output-title-tool {');
    const brainstormOutputTitleToolRule = styleSource.slice(
      brainstormOutputTitleToolRuleStart,
      styleSource.indexOf('.xy-brainstorm-floating-title-tool .xy-floating-title-input', brainstormOutputTitleToolRuleStart),
    );
    expect(brainstormOutputTitleToolRule).not.toContain('translateY(calc(-50% - 1px))');
    const brainstormTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-floating-title-tool,');
    const brainstormTitleToolRule = styleSource.slice(
      brainstormTitleToolRuleStart,
      styleSource.indexOf('.xy-brainstorm-floating-title-tool::before', brainstormTitleToolRuleStart),
    );
    const inlineTitleToolRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const inlineTitleToolRule = styleSource.slice(
      inlineTitleToolRuleStart,
      styleSource.indexOf('.xy-floating-outline-clear-button *', inlineTitleToolRuleStart),
    );
    expect(brainstormTitleToolRule).toContain('background-image: linear-gradient(');
    expect(inlineTitleToolRule).toContain('background-color: transparent !important;');
    expect(inlineTitleToolRule).not.toContain('background: transparent !important;');
    expect(panelSource).toContain('const outlineDraftCountLeft = plotPointStandalone');
    expect(panelSource).not.toContain('章纲：<WordCountText value={countTextWords(outlineCardContent)} compact />');
  });
  it('does not render brainstorm session controls on the output frame', () => {
    const { container } = render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
      />,
    );

    const sessionTool = container.querySelector('.xy-floating-brainstorm-session-tool');

    expect(sessionTool).toBeFalsy();
    expect(screen.queryByTitle('鏂板缓鑴戞礊浼氳瘽')).not.toBeInTheDocument();
    expect(screen.queryByTitle('鑴戞礊浼氳瘽 1')).not.toBeInTheDocument();
  });

  it('does not keep brainstorm session rendering code in the output panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContain('const renderBrainstormAiSessionControls');
    expect(panelSource).not.toContain('renderBrainstormAiSessionControls()');
    expect(panelSource).not.toContain('addBrainstormAiSession');
    expect(panelSource).not.toContain('selectBrainstormAiSession');
  });

  it('uses a single clear button for brainstorm output actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-floating-brainstorm-output-action-tool {');
    expect(styleSource).toContain('right: 4.8rem;');
    expect(styleSource).toContain('max-width: 9.5rem;');
    expect(styleSource).toContain('height: 20px;');
    expect(styleSource).toContain('top: 0 !important;');
    expect(styleSource).toContain('transform: translateY(-50%) !important;');
    expect(styleSource).not.toContain('.xy-floating-edge-tool.xy-floating-brainstorm-session-tool');
    const actionToolStart = panelSource.indexOf('<div className="xy-floating-brainstorm-output-action-tool');
    const actionToolSource = panelSource.slice(actionToolStart, panelSource.indexOf('<label', actionToolStart));

    expect(actionToolSource).toContain('xy-floating-brainstorm-output-action-tool');
    expect(actionToolSource).toContain('清空');
    expect(actionToolSource).not.toContain('删除');
    expect(actionToolSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(actionToolSource).toContain('xy-floating-brainstorm-output-action-tool xy-border-embedded-transparent-backplate');
    expect(actionToolSource).toContain('flex max-w-full items-center overflow-hidden');
    expect(actionToolSource).not.toContain('rounded-lg border border-slate-200 bg-white shadow-sm');
    expect(panelSource).not.toContain('px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900');
  });
  it('removes white backplates from outline preview labels and edge text tools', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label');
    expect(styleSource).toContain('background-color: transparent;');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    expect(styleSource).toContain('.xy-floating-outline-clear-button,');
    expect(styleSource).toContain('.xy-floating-inline-title-tool');
    expect(styleSource).toContain('text-shadow: none;');
    expect(styleSource).toContain('-webkit-text-stroke: 3px #ffffff;');
    expect(styleSource).toContain('paint-order: stroke fill;');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate::before,');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label::before,');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count::before');
    expect(styleSource).toContain('height: 0.42em;');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate:not(.absolute)');
    expect(styleSource).toContain('background-image: linear-gradient(');
    expect(styleSource).toContain('transparent calc(50% - 0.24em)');
    expect(styleSource).toContain('#ffffff calc(50% + 0.24em)');
    expect(styleSource).toContain('background-size: 100% 100%');
    expect(panelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1');
    expect(styleSource).toContain('.xy-floating-outline-inner-clear-tool {');
    expect(styleSource).toContain('top: auto;');
    expect(styleSource).toContain('right: 1.55rem;');
    expect(styleSource).toContain('bottom: 0.75rem;');
    expect(styleSource).toContain('transform: none;');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0');
    expect(panelSource).not.toContain('absolute -top-2 right-4 bg-white px-1');
    expect(panelSource).not.toContain('absolute left-[104px] top-0 z-20 max-w-[calc(100%-232px)] -translate-y-1/2 bg-white px-1');
    expect(panelSource).not.toContain('block max-w-[220px] truncate bg-white px-1');
  });

  it('uses the tested white empty state for chapter outline directories and removes the temporary test page route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContain("border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]");
    expect(chapterEditorSource).toContain("border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]");
    expect(panelSource).not.toContain('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(chapterEditorSource).not.toContain('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(testCollectionSource).not.toContain('OutlineDirectoryStateTestPage');
    expect(testCollectionSource).not.toContain('/outline-directory-state-test');
  });

  it('matches audit comment and status chapter directories to the detail outline volume style without losing summary actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(chapterEditorSource).toContain('volumes?: Volume[]');
    expect(chapterEditorSource).toContain('const chapterDirectoryGroups = useMemo(() => {');
    expect(chapterEditorSource).toContain('chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber)');
    expect(chapterEditorSource).toContain("return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];");
    expect(chapterEditorSource).toContain('const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());');
    expect(chapterEditorSource).toContain('const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());');
    expect(chapterEditorSource).toContain('const toggleReviewDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContain('const toggleStatusDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContain('chapterDirectoryGroups.forEach((group) => next.add(group.id));');
    expect(chapterEditorSource).toContain('onClick={() => toggleReviewDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContain('onClick={() => toggleStatusDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContain("{reviewMode === 'audit' ? '审核目录' : '点评目录'}");
    expect(chapterEditorSource).not.toContain('<div className="mb-3 text-sm font-black text-slate-900">章节目录</div>');
    expect(chapterEditorSource).toContain('className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-[#08B3D9] px-2 py-2 text-white transition-colors hover:brightness-95"');
    expect(chapterEditorSource).toContain("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}");
    expect(chapterEditorSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-bold transition-colors');
    expect(chapterEditorSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors');
    expect(chapterEditorSource).toContain('statusUpdatedChapterIds.has(item.id)');
    expect(chapterEditorSource).toContain("'border-[#08B3D9] bg-[#08B3D9] text-white hover:border-[#067B96] hover:bg-[#067B96]'");
    expect(chapterEditorSource).not.toContain('<span className="text-sm font-black text-slate-900">章节位置</span>');
    expect(chapterEditorSource).not.toContain('<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#08B3D9]" />已更新</span>');
    expect(chapterEditorSource).not.toContain('<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-slate-200 bg-slate-50" />未更新</span>');
    expect(panelSource).toContain('卷概要');
    expect(panelSource).toContain('const enableVolumeSummary = !isDetailOutlineTab;');
    expect(panelSource).toContain('safeOutlineSelectionType === \'volume\' && selectedOutlineVolume?.id === volume.id');
    expect(panelSource).toContain('selectOutlineVolume(volume);');
  });

  it('keeps workbench model selects synchronized after model management changes', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const modelHookSource = await readModelHookSource();

    expect(panelSource).toContain("import { useModels } from '@/features/models/hooks/useModels';");
    expect(panelSource).toContain('const { models: modelSnapshot } = useModels();');
    expect(panelSource).toContain('const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);');
    expect(panelSource).not.toContain("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(panelSource).not.toContain('const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);');
    expect(chapterEditorSource).toContain("import { useModels } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).toContain('const { models: modelSnapshot } = useModels();');
    expect(chapterEditorSource).toContain('const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);');
    expect(chapterEditorSource).not.toContain("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).not.toContain('const reviewModels = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);');
    expect(modelHookSource).toContain('function syncEnvModel(models: ModelItem[], notify = true)');
    expect(modelHookSource).toContain('writeModels(next, { notify });');
    expect(modelHookSource).toContain('function writeModels(models: ModelItem[], options: { notify?: boolean } = {})');
    expect(modelHookSource).toContain('if (options.notify !== false) window.dispatchEvent(new CustomEvent(APP_EVENTS.modelsUpdated));');
    expect(modelHookSource).toContain('return syncEnvModel(models, false);');
    expect(modelHookSource).toContain('writeModels(models, { notify: false });');
  });

  it('keeps the brainstorm question panel fixed without scrollbar layout classes', async () => {
    const source = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContain('xy-brainstorm-question-panel');
    expect(source).toContain('xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2');
    expect(source).toContain('flex min-h-full flex-col gap-4 pt-2');
    expect(source).toContain('grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700');
    expect(source).not.toContain('xy-brainstorm-question-panel editor-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white p-3');
    expect(source).not.toContain('xy-brainstorm-count-options');
    expect(source).not.toContain('editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3');
    expect(source).not.toContain('flex h-[60px] items-center gap-2 px-4 pt-3');
    expect(styleSource).toContain('.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label::before');
    expect(styleSource).toContain('.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label,');
    expect(styleSource).toContain('font-size: 1rem;');
    expect(styleSource).toContain('font-weight: 500;');
    expect(styleSource).toContain('line-height: 20px;');
  });

  it('records the reusable shellless panel technique for brainstorm fields', async () => {
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-shellless-panel {');
    expect(styleSource).toContain('border: 0;');
    expect(styleSource).toContain('border-radius: 0;');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('box-shadow: none;');
  });

  it('records shellless techniques while official right panels avoid soft card wrappers', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-shellless-panel {');
    expect(styleSource).toContain('.xy-soft-shell-panel {');
    expect(panelSource).not.toContain('<div className="mt-3 shrink-0 text-sm font-bold leading-6 text-gray-600">');
    expect(chapterSource).toContain('mt-3 text-xs font-bold leading-5 text-slate-500');
    expect(panelSource).not.toContain('xy-soft-shell-panel mt-3 p-3');
    expect(chapterSource).not.toContain('xy-soft-shell-panel p-3 text-xs leading-5 text-slate-500');
  });

  it('removes AI dialogue labels from library generator output cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContain('AI对话框');
  });

  it('renders brainstorm count as a labeled segmented button group aligned to the input left edge', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const countButtonStart = panelSource.indexOf("{['1', '3', '5', '10'].map((value) => {");
    const generateButtonStart = panelSource.indexOf('onClick={openBrainstormGenerateConfirm}', countButtonStart);
    const countButtonSource = panelSource.slice(countButtonStart, generateButtonStart);

    expect(countButtonStart).toBeGreaterThan(-1);
    expect(generateButtonStart).toBeGreaterThan(countButtonStart);
    expect(panelSource).not.toContain('xy-brainstorm-count-field');
    expect(panelSource).not.toContain('xy-brainstorm-count-options');
    expect(panelSource).toContain('一次生成几个脑洞');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('<div className="flex min-w-0 flex-1 items-center gap-2">');
    expect(panelSource).toContain('flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white');
    expect(countButtonSource).toContain('setBrainstormQuestionField(\'brainstormCount\', active ? \'\' : value)');
    expect(countButtonSource).toContain('last:border-r-0');
    expect(countButtonSource).not.toContain("'2'");
    expect(countButtonSource).not.toContain('3个');
  });

  it('keeps brainstorm request headers out of visible generated output', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const buildStart = panelSource.indexOf('const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {');
    const buildEnd = panelSource.indexOf('const openBrainstormGenerateConfirm = () => {', buildStart);
    const buildSource = panelSource.slice(buildStart, buildEnd);
    const latestUsefulStart = panelSource.indexOf('function getLatestUsefulAiText(content: string)');
    const latestUsefulEnd = panelSource.indexOf('function getBrainstormEntryBody', latestUsefulStart);
    const latestUsefulSource = panelSource.slice(latestUsefulStart, latestUsefulEnd);

    expect(panelSource).toContain("const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION = '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';");
    expect(panelSource).toContain("const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';");
    expect(panelSource).toContain("const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';");
    expect(panelSource).toContain("const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';");
    expect(panelSource).toContain("const BRAINSTORM_GENERATE_RULE_TEXT = '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';");
    expect(panelSource).toContain('function stripBrainstormRequestHeader(content: string)');
    expect(panelSource).toContain('function isBrainstormEchoedRequest(content: string, requestText: string)');
    expect(panelSource).toContain('function getBrainstormOtherRequirementsBlock(requestText: string)');
    expect(panelSource).toContain('function getBrainstormDisplayContent(content: string, requestText: string)');
    expect(panelSource).toContain('const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();');
    expect(panelSource).toContain("? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\\n\\n')");
    expect(panelSource).toContain('const sendLibraryAiMessage = async (overrideText?: string, options: { visibleText?: string } = {}) => {');
    expect(panelSource).toContain('const visibleUserText = (options.visibleText ?? text).trim();');
    expect(panelSource).toContain('const visibleText = stripBrainstormRequestHeader(promptText);');
    expect(panelSource).toContain('void sendLibraryAiMessage(promptText, { visibleText });');
    expect(panelSource).toContain('const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());');
    expect(panelSource).toContain('if (activeTab === BRAINSTORM_TAB) setAiResult(brainstormStreamDisplay);');
    expect(panelSource).toContain('const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));');
    expect(panelSource).toContain('output === request || output === otherRequirements');
    expect(panelSource).toContain('? getBrainstormDisplayContent(content, requestText)');
    expect(panelSource).toContain('【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。');
    expect(panelSource).toContain('【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。');
    expect(panelSource).toContain('if (activeTab === BRAINSTORM_TAB) setAiResult(errorContent);');
    expect(latestUsefulSource).toContain("if (turns.length > 0) return '';");
    expect(buildSource).toContain('BRAINSTORM_GENERATE_TASK_TEXT');
    expect(buildSource).toContain('BRAINSTORM_GENERATE_RULE_TEXT');
    expect(buildSource).toContain('BRAINSTORM_OTHER_REQUIREMENTS_HEADER');
    expect(buildSource).not.toContain('BRAINSTORM_REQUEST_HEADER');
    expect(buildSource).not.toContain('【用户要求】');
    expect(panelSource).not.toContain("void sendLibraryAiMessage(promptText);");
  });

  it('can switch the library AI request log between titled sections and plain concatenated content', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('function buildRequestLogPlainPreview(groups: AiRequestLogGroup[])');
    expect(panelSource).toContain(".join('\\n\\n');");
    expect(panelSource).toContain('const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);');
    expect(panelSource).toContain('const visibleAiRequestLogGroups = visibleAiRequestLog');
    expect(panelSource).toContain("userTitle: activeIsBrainstorm ? '其他要求' : undefined");
    expect(panelSource).toContain('const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);');
    expect(panelSource).toContain('checked={showLibraryAiLogTitles}');
    expect(panelSource).toContain('onChange={(event) => setShowLibraryAiLogTitles(event.target.checked)}');
    expect(panelSource).toContain('<span>显示标题内容</span>');
    expect(panelSource).toContain('{showLibraryAiLogTitles ? (');
    expect(panelSource).toContain('<AiRequestLogGroups groups={visibleAiRequestLogGroups} />');
    expect(panelSource).toContain('{visibleAiRequestLogPlainPreview || \'暂无可预览内容\'}');
  });

  it('keeps brainstorm count buttons compact while the generate button stays on the right', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black');
    expect(panelSource).toContain('h-10 w-16 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white');
    expect(styleSource).not.toContain('.xy-brainstorm-count-field');
    expect(styleSource).not.toContain('.xy-brainstorm-count-options');
  });

  it('uses editable temporary brainstorm output previews driven by generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryClickStart = panelSource.indexOf('onClick={() => {');
    const entryClickEnd = panelSource.indexOf('onDoubleClick={() =>', entryClickStart);
    const entryClickSource = panelSource.slice(entryClickStart, entryClickEnd);

    expect(panelSource).toContain('previewTitles?: string[];');
    expect(panelSource).toContain('previewDrafts?: string[];');
    expect(panelSource).toContain('previewSelectedIndexes?: number[];');
    expect(panelSource).toContain('function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[])');
    expect(panelSource).toContain('function getBrainstormOutputCount(value: string)');
    expect(panelSource).toContain('return `脑洞输出框${index + 1}`;');
    expect(panelSource).not.toContain('return `新脑洞${index + 1}`;');
    expect(panelSource).toContain('const getNextBrainstormTitles = (count: number) => {');
    expect(panelSource).toContain('return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);');
    expect(panelSource).toContain('const nextTitles = getNextBrainstormTitles(previews.length);');
    expect(panelSource).toContain('const previews = getCurrentBrainstormOutputPreviews(true);');
    expect(panelSource).toContain('createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle())');
    expect(panelSource).not.toContain('createWorkbenchLibraryEntry(BRAINSTORM_TAB, preview.title || getNextBrainstormTitle())');
    expect(panelSource).toContain('function splitBrainstormGeneratedText(text: string, count: number)');
    expect(panelSource).toContain('const brainstormOutputPreviewCount = activeIsBrainstorm ? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount) : 1;');
    expect(panelSource).toContain('const brainstormOutputPreviews = Array.from({ length: brainstormOutputPreviewCount }, (_, index) => (');
    expect(panelSource).toContain('const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(');
    expect(panelSource).toContain('const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);');
    expect(panelSource).toContain('const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes');
    expect(panelSource).toContain('const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;');
    expect(panelSource).toContain('{brainstormOutputPreviews.map((previewValue, index) => {');
    expect(panelSource).toContain('role="checkbox"');
    expect(panelSource).toContain('aria-checked={outputChecked}');
    expect(panelSource).toContain('onClick={() => toggleBrainstormOutputPreviewSelected(index)}');
    expect(panelSource).toContain('aria-label={`脑洞输出名称 ${index + 1}`}');
    expect(panelSource).toContain('onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}');
    expect(panelSource).toContain('updateActiveBrainstormAiSession({ previewTitles: [], previewDrafts: [], previewSelectedIndexes: undefined });');
    expect(panelSource).toContain('disabled={!currentSelectedEntry || selectedBrainstormOutputCount !== 1}');
    expect(panelSource).toContain('disabled={selectedBrainstormOutputCount === 0}');
    expect(panelSource).toContain('clearStoredBrainstormAiSessionPreviews(storageKey);');
    expect(panelSource).not.toContain('currentSelectedEntry.title || \'未命名脑洞\'');
    expect(entryClickSource).not.toContain('setAiResult(getBrainstormEntryBody(entry));');
  });

  it('keeps the brainstorm output action area shellless under the bordered frame', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const outputAreaStart = panelSource.indexOf('ariaLabel="脑洞输出字号"');
    const actionAreaStart = panelSource.indexOf('<AiInlineInput', outputAreaStart);
    const actionAreaEnd = panelSource.indexOf('{settingLibraryMode ===', actionAreaStart);
    const actionAreaSource = panelSource.slice(actionAreaStart, actionAreaEnd);

    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(actionAreaStart).toBeGreaterThan(outputAreaStart);
    expect(actionAreaEnd).toBeGreaterThan(actionAreaStart);
    expect(panelSource).toContain('<div className="shrink-0 space-y-3">');
    expect(actionAreaSource).not.toContain('shrink-0 rounded-xl border border-gray-200 bg-white p-3');
    expect(actionAreaSource).not.toContain('mt-3 flex items-center justify-between gap-2');
    expect(actionAreaSource).not.toContain('xy-animated-checkbox');
  });

  it('uses short brainstorm genre and theme placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("placeholder: '如都市、玄幻'");
    expect(panelSource).toContain("placeholder: '如系统流'");
    expect(panelSource).not.toContain('如都市高武、玄幻、仙侠、科幻');
    expect(panelSource).not.toContain('如系统流、凡人流');
  });
  it('keeps brainstorm short-field labels in the border-floating style with enough top space', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).not.toContain('xy-brainstorm-short-field');
    expect(styleSource).not.toContain('.xy-floating-field.xy-brainstorm-short-field label');
    expect(panelSource).toContain('xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2');
    expect(panelSource).toContain('flex min-h-full flex-col gap-4 pt-2');
    expect(panelSource).toContain('height: `${Math.max(52, pairedRows * 20 + 32)}px`');
    expect(panelSource).toContain('minHeight: `${Math.max(180, questionRows * 20 + 52)}px`');
    expect(panelSource).toContain("height: '100%'");
    expect(styleSource).toContain('.xy-brainstorm-question-panel > div > div:last-child');
    expect(styleSource).toContain('flex: 1 1 180px;');
    expect(panelSource).not.toContain("Math.min(4, Math.max(1, rows))");
    expect(panelSource).not.toContain("overflowY: isLastField || questionRows >= 4 ? 'auto' : 'hidden'");
    expect(panelSource).not.toContain("flex min-h-[132px] flex-1 flex-col");
  });

  it('aligns brainstorm generator fields with the model prompt selector', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const brainstormPanelStart = panelSource.indexOf('<div className="flex max-w-full items-start gap-2">');
    const brainstormPanelEnd = panelSource.indexOf(') : (', panelSource.indexOf('xy-brainstorm-question-panel', brainstormPanelStart));
    const brainstormPanelSource = panelSource.slice(brainstormPanelStart, brainstormPanelEnd);

    expect(brainstormPanelStart).toBeGreaterThan(-1);
    expect(brainstormPanelEnd).toBeGreaterThan(brainstormPanelStart);
    expect(brainstormPanelSource).toContain("className={activeIsBrainstorm ? 'w-full' : undefined}");
    expect(brainstormPanelSource).toContain("width: '100%'");
    expect(brainstormPanelSource).toContain('<div className="flex max-w-full items-start gap-2">');
    expect(brainstormPanelSource).not.toContain('items-start justify-end gap-2');
    expect(brainstormPanelSource).toContain('<div key="brainstorm-genre-background-row" className="grid shrink-0 grid-cols-2 gap-4');
    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
  });

  it('allows the brainstorm preview and output splitter to drag in both directions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;');
    expect(panelSource).toContain('const deltaX = (moveEvent.clientX - startX) / eventScale;');
    expect(panelSource).toContain('Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX)');
    expect(panelSource).toContain('const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);');
    expect(panelSource).not.toContain('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 420;');
  });

  it('uses the writing page cursor for official horizontal resize splitters', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContain("document.body.style.cursor = 'ew-resize';");
    expect(panelSource).toContain('cursor-ew-resize touch-none items-stretch');
    expect(styleSource).not.toContain('cursor-col-resize');
    expect(panelSource).not.toContain("document.body.style.cursor = 'col-resize';");
    expect(panelSource).not.toContain('cursor-col-resize');
    expect(testCollectionSource).not.toContain('DragSplitterIconTestPage');
    expect(testCollectionSource).not.toContain('/drag-splitter-icon-test');
  });

  it('limits the outline left sidebar width to a fifth of the viewport', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 350;');
    expect(panelSource).toContain('function getDisplayScale()');
    expect(panelSource).toContain('window.devicePixelRatio');
    expect(panelSource).toContain('function getOutlineLeftMaxDisplayWidth(scaleValue = 1)');
    expect(panelSource).toContain('Math.floor(OUTLINE_LEFT_MAX_DISPLAY_WIDTH / normalizedScale / getDisplayScale())');
    expect(panelSource).toContain('function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1)');
    expect(panelSource).toContain('const OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH = 400;');
    expect(panelSource).toContain('function isOutlineLeftToolbarSafeTab(tab: string)');
    expect(panelSource).toContain('return tab === SETTING_TAB;');
    expect(panelSource).toContain('function getDetailOutlineLeftMinWidth(scaleValue = 1)');
    expect(panelSource).toContain('const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);');
    expect(panelSource).toContain('return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);');
    expect(panelSource).toContain('const maxWidth = getSettingLibraryLeftMaxWidth(tab, scaleValue);');
    expect(panelSource).toContain('if (maxWidth <= OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH) return SETTING_LIBRARY_LEFT_MIN_WIDTH;');
    expect(panelSource).toContain('return OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH;');
    expect(panelSource).toContain('return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB');
    expect(panelSource).toContain('const viewportFifthWidth = Math.floor(window.innerWidth / normalizedScale / 5);');
    expect(panelSource).toContain('return Math.max(');
    expect(panelSource).toContain('const fixedMaxWidth = tab === SETTING_TAB');
    expect(panelSource).toContain('Math.min(fixedMaxWidth, viewportFifthWidth)');
    expect(panelSource).toContain('const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale);');
    expect(panelSource).toContain('const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));');
    expect(panelSource).toContain('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
    expect(panelSource).toContain('const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale);');
    expect(panelSource).toContain('const outlineSidebarWidth = settingLibraryLeftWidth;');
    expect(panelSource).toContain("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}");
    expect(panelSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-bold');
    expect(panelSource).toContain('window.addEventListener(\'resize\', clampVisibleLeftWidth);');
    expect(panelSource).not.toContain('const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : SETTING_LIBRARY_LEFT_MAX_WIDTH;');
    expect(panelSource).not.toContain('const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);');
    expect(panelSource).not.toContain('const outlineSidebarWidth = Math.min(');
    expect(panelSource).not.toContain('OUTLINE_COLUMN_OPTIONS');
    expect(panelSource).not.toContain('loadOutlineColumns');
    expect(panelSource).not.toContain('每行显示');
  });

  it('uses a narrower scrollbar for the setting sidebar list', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain('xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto');
    expect(styleSource).toContain('.xy-setting-sidebar-scrollbar::-webkit-scrollbar');
    expect(styleSource).toContain('width: 5px;');
  });

  it('uses the body page format for the outline right-side output card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={activeOutlinePromptId');
    const outlineRightPanelStart = panelSource.lastIndexOf('<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">', outlineRightPanelAnchor);
    const outlineRightPanelEnd = panelSource.indexOf('</aside>', outlineRightPanelStart);
    const outlineRightPanelSource = panelSource.slice(outlineRightPanelStart, outlineRightPanelEnd);

    expect(outlineRightPanelAnchor).toBeGreaterThan(-1);
    expect(outlineRightPanelStart).toBeGreaterThan(-1);
    expect(outlineRightPanelEnd).toBeGreaterThan(outlineRightPanelStart);
    expect(outlineRightPanelSource).toContain('<div className="relative mt-5 min-h-[170px] flex-1">');
    expect(outlineRightPanelSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full');
    expect(outlineRightPanelSource).not.toContain('AI对话框');
    expect(outlineRightPanelSource).not.toContain('xy-soft-shell-panel');
    expect(outlineRightPanelSource).not.toContain('relative mt-6 flex min-h-[310px] flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(outlineRightPanelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1');
    expect(styleSource).toContain('.xy-floating-outline-inner-clear-tool {');
    expect(styleSource).toContain('bottom: 0.75rem;');
    expect(styleSource).toContain('transform: none;');
    expect(panelSource).toContain('const shouldShowOutlineDraftWordCount = plotPointStandalone;');
    expect(panelSource).not.toContain('const shouldShowOutlineDraftWordCount = plotPointStandalone || isDetailOutlineTab;');
    expect(panelSource).toContain('if (isDetailOutlineTab) return;');
    expect(panelSource).toContain("if (!isDetailOutlineTab) setOutlinePreviewDraft(entry?.content ?? '');");
    expect(panelSource).not.toContain('const outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('selectedOutlineChapter?.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContain('selectedOutlineChapter.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContain('selectedVolumeWordCount');
    expect(outlineRightPanelSource).not.toContain('章节字数：');
    expect(outlineRightPanelSource).not.toContain('正文：<WordCountText value={selectedOutlineChapter.chapter.wordCount} compact />');
    expect(outlineRightPanelSource).not.toContain('第{selectedOutlineChapter.chapter.serialNumber}章 {selectedChapterTitle}');
    expect(outlineRightPanelSource).toContain('{shouldShowOutlineDraftWordCount && (');
    expect(panelSource).toContain(': `第${selectedOutlineChapter.chapter.serialNumber}章概要`');
    expect(outlineRightPanelSource).toContain('{isDetailOutlineTab && (');
    expect(outlineRightPanelSource).toContain('meta={detailOutlineReaderWordCount > 0 ? <WordCountText value={detailOutlineReaderWordCount} compact /> : null}');
    expect(outlineRightPanelSource).toContain('className="mt-3 flex items-center gap-3"');
    expect(outlineRightPanelSource).toContain('metaClassName="shrink-0 text-xs font-bold text-slate-400"');
    expect(outlineRightPanelSource).not.toContain('已关联 {selectedDetailOutlineReaderItems.length} 项');
    expect(outlineRightPanelSource).not.toContain('className="mt-3 flex items-center justify-between gap-3"');
    expect(outlineRightPanelSource).not.toContain('metaClassName="min-w-0 truncate text-right text-xs font-bold text-slate-400"');
    expect(panelSource).toContain("isDetailOutlineTab ? 'AI输出章纲'");
    expect(outlineRightPanelSource).toContain('生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。');
    expect(panelSource).toContain("const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement]");
    expect(panelSource).toContain('setLastDetailOutlineReplacement({');
    expect(panelSource).toContain('content: selectedOutlineEntry?.content ??');
    expect(panelSource).toContain('updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);');
    expect(panelSource).toContain('const undoDetailOutlineReplacement = () => {');
    expect(outlineRightPanelSource).toContain("isDetailOutlineTab ? '替换章纲' : '保存概要'");
    expect(outlineRightPanelSource).toContain('onClick={undoDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContain('disabled={!lastDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContain('撤销替换');
    expect(outlineRightPanelSource).toContain("isDetailOutlineTab ? '复制章纲' : '复制概要'");
    expect(panelSource).toContain('const OUTLINE_ACTION_RIGHT_MIN_WIDTH = 420;');
    expect(panelSource).toContain('? OUTLINE_ACTION_RIGHT_MIN_WIDTH');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap bg-brand');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-red-200');
    expect(outlineRightPanelSource).not.toContain('保存章纲');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-output-clear-tool');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-10 z-30 px-1');
  });

  it('keeps detail outline card top labels from competing with body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardMetaAnchor = panelSource.indexOf('xy-floating-outline-chapter-meta');
    const cardMetaStart = panelSource.lastIndexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);', cardMetaAnchor);
    const cardMetaEnd = panelSource.indexOf('</section>', cardMetaStart);
    const cardMetaSource = panelSource.slice(cardMetaStart, cardMetaEnd);

    expect(cardMetaAnchor).toBeGreaterThan(-1);
    expect(cardMetaStart).toBeGreaterThan(-1);
    expect(cardMetaEnd).toBeGreaterThan(cardMetaStart);
    expect(cardMetaSource).toContain('chapter.serialNumber');
    expect(cardMetaSource).toContain('chapter.title.trim() ||');
    expect(cardMetaSource).toContain('WordCountText value={chapter.wordCount} compact');
    expect(cardMetaSource).toContain("? `第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`");
    expect(cardMetaSource).toContain('max-w-[44%]');
    expect(cardMetaSource).not.toContain('max-w-[58%]');
    expect(cardMetaSource).not.toContain('正文：');
    expect(cardMetaSource).toContain('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *');
  });

  it('keeps detail outline card titles free of body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardSourceStart = panelSource.indexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);');
    const cardSourceEnd = panelSource.indexOf('</section>', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const labelStart = cardSource.indexOf('<label className={isDetailOutlineTab ?');
    const labelEnd = cardSource.indexOf('</label>', labelStart);
    const labelSource = cardSource.slice(labelStart, labelEnd);

    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(labelStart).toBeGreaterThan(-1);
    expect(labelEnd).toBeGreaterThan(labelStart);
    expect(labelSource).toContain('xy-detail-outline-title-count');
    expect(labelSource).toContain('xy-floating-title-text');
    expect(labelSource).toContain('{outlineCardTitle}');
    expect(panelSource).toContain("? `第${chapter.serialNumber}章章纲`");
    expect(panelSource).not.toContain("? `第${chapter.serialNumber}章章纲（第${getVolumeDisplayIndex(volume.id)}卷）`");
    expect(labelSource).toContain("isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined");
    expect(labelSource).not.toContain('countTextWords(outlineCardContent)');
    expect(labelSource).not.toContain('WordCountText');
    expect(labelSource).not.toContain('章纲：');
    expect(cardSource).toContain('<WordCountText value={countTextWords(outlineCardContent)} />');
    expect(cardSource).toContain('onClick={() => updateChapterSummary(chapter.serialNumber, \'\')}');
    expect(cardSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-card-clear-tool absolute z-30 px-1');
    expect(cardSource).not.toContain("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContain("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(cardSource).not.toContain('{!isDetailOutlineTab && (');
    expect(styleSource).toContain('gap: 0.32rem;');
    expect(styleSource).toContain('max-width: min(13rem, calc(42% - 1.5rem));');
    expect(styleSource).toContain('.xy-detail-outline-title-count .xy-floating-title-text');
    expect(styleSource).toContain('text-overflow: ellipsis;');
    expect(styleSource).toContain('.xy-floating-outline-card-clear-tool {');
    expect(styleSource).toContain('right: 1.65rem;');
    expect(styleSource).toContain('bottom: 0;');
    expect(styleSource).toContain('transform: translateY(50%);');
  });

  it('places library preview font size controls in the header tool slot and applies detail outline size to every chapter outline card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardSourceStart = panelSource.indexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);');
    const cardSourceEnd = panelSource.indexOf('</section>', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const settingPreviewStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const settingPreviewEnd = panelSource.indexOf('<div className="mt-6 flex shrink-0 justify-end">', settingPreviewStart);
    const settingPreviewSource = panelSource.slice(settingPreviewStart, settingPreviewEnd);
    const emptySettingPreviewStart = panelSource.indexOf('placeholder="这里会显示选中的设定内容。"');
    const emptySettingPreviewEnd = panelSource.indexOf('</div>', emptySettingPreviewStart);
    const emptySettingPreviewSource = panelSource.slice(emptySettingPreviewStart, emptySettingPreviewEnd);
    const toolbarStart = panelSource.indexOf('<h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ? \'章纲目录\' : \'章节概要\'}</h3>');
    const toolbarEnd = panelSource.indexOf('<div className="mt-3 min-h-0 flex-1 overflow-y-auto">', toolbarStart);
    const toolbarSource = panelSource.slice(toolbarStart, toolbarEnd);
    const fontIndex = toolbarSource.indexOf('showInlineFieldSizeButton && renderDetailOutlineFontSizeTool()');
    const fieldSizeIndex = toolbarSource.indexOf('renderFieldSizeButton()');

    expect(panelSource).toContain('detailOutlineFontSize?: number');
    expect(panelSource).toContain('const detailOutlineFontSize = Math.min(');
    expect(panelSource).toContain('const setDetailOutlineFontSize = (value: number) =>');
    expect(panelSource).toContain('fontSize: detailOutlineFontSize');
    expect(panelSource).toContain('const renderDetailOutlineFontSizeTool = () => {');
    expect(panelSource).toContain('if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;');
    expect(panelSource).toContain('const renderBrainstormFontSizeTool = () => {');
    expect(panelSource).toContain('const renderSettingPreviewFontSizeTool = () => {');
    expect(panelSource).toContain('const renderLibraryHeaderFontSizeTool = () => (');
    expect(panelSource).toContain('const [headerToolPortalTarget, setHeaderToolPortalTarget]');
    expect(panelSource).toContain("setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'))");
    expect(panelSource).toContain('const libraryHeaderFontSizePortal = headerToolPortalTarget && !showInlineFieldSizeButton');
    expect(panelSource).toContain('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(panelSource).toContain('{libraryHeaderFontSizePortal}');
    expect(panelSource).toContain('ariaLabel="章纲字号"');
    expect(panelSource).toContain('ariaLabel="脑洞预览字号"');
    expect(panelSource).toContain('ariaLabel="脑洞输出字号"');
    expect(panelSource).toContain('ariaLabel="设定预览字号"');
    expect(panelSource).toContain('className="shrink-0"');
    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(cardSource).not.toContain('ariaLabel="章纲字号"');
    expect(cardSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(settingPreviewSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(emptySettingPreviewSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(toolbarStart).toBeGreaterThan(-1);
    expect(toolbarEnd).toBeGreaterThan(toolbarStart);
    expect(toolbarSource).not.toContain("{renderDetailOutlineFontSizeTool()}");
    expect(fontIndex).toBeGreaterThan(-1);
    expect(fieldSizeIndex).toBeGreaterThan(fontIndex);
  });

  it('uses border-embedded transparent backplates without rectangular white shadows', async () => {
    const styleSource = await readSharedStylesSource();
    const transparentBackplateStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview label');
    const transparentBackplateEnd = styleSource.indexOf('.xy-floating-field.xy-floating-chat-shell', transparentBackplateStart);
    const transparentBackplateSource = styleSource.slice(transparentBackplateStart, transparentBackplateEnd);
    const countRuleStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    const countRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count', countRuleStart);
    const countRuleSource = styleSource.slice(countRuleStart, countRuleEnd);
    const clearRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const clearRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count textarea', clearRuleStart);
    const clearRuleSource = styleSource.slice(clearRuleStart, clearRuleEnd);

    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate {');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate *');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count *');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count {');
    expect(styleSource).toContain('.xy-brainstorm-floating-title-tool::before,');
    expect(styleSource).toContain('.xy-brainstorm-output-title-tool::before');
    expect(styleSource).toContain('display: block !important;');
    expect(styleSource).toContain('.xy-brainstorm-output-preview-list {');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('padding: 0;');
    expect(transparentBackplateSource).toContain('background-color: transparent;');
    expect(transparentBackplateSource).toContain('text-shadow: none;');
    expect(transparentBackplateSource).toContain('-webkit-text-stroke: 3px #ffffff;');
    expect(transparentBackplateSource).toContain('paint-order: stroke fill;');
    expect(transparentBackplateSource).toContain('isolation: isolate;');
    expect(transparentBackplateSource).toContain('background-image: linear-gradient(');
    expect(countRuleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count *');
    expect(countRuleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *');
    expect(clearRuleSource).toContain('.xy-floating-outline-clear-button *');
    expect(clearRuleSource).toContain('background-color: transparent !important;');
    expect(clearRuleSource).not.toContain('background: transparent !important;');
    expect(clearRuleSource).not.toContain('1px 0 0 #ffffff');
    expect(clearRuleSource).not.toContain('-1px 0 0 #ffffff');
  });

  it('explicitly marks border-embedded content with the transparent backplate class', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContain('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(panelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate');
    expect(chapterSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
  });

  it('does not show an AI dialogue label in the setting outline generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const outputAreaAnchor = panelSource.indexOf('可以在这里生成');
    const outputAreaStart = panelSource.lastIndexOf('<div className="relative mt-5 min-h-0 flex-1">', outputAreaAnchor);
    const outputAreaEnd = panelSource.indexOf('{activeTab === SETTING_TAB && (', outputAreaAnchor);
    const outputAreaSource = panelSource.slice(outputAreaStart, outputAreaEnd);

    expect(outputAreaAnchor).toBeGreaterThan(-1);
    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(outputAreaEnd).toBeGreaterThan(outputAreaStart);
    expect(outputAreaSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full');
    expect(outputAreaSource).not.toContain('AI对话框');
    expect(outputAreaSource).not.toContain('rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(outputAreaSource).not.toContain('absolute -top-2 left-4 bg-white px-1 text-sm font-black text-gray-900');
  });

  it('does not show an AI dialogue label in the plot point generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointAreaEnd = panelSource.indexOf('title={plotPointLinkedSettingSummary}');
    const plotPointAreaStart = panelSource.lastIndexOf('<div className="relative flex min-h-0 flex-1 flex-col">', plotPointAreaEnd);
    const plotPointAreaSource = panelSource.slice(plotPointAreaStart, plotPointAreaEnd);

    expect(plotPointAreaEnd).toBeGreaterThan(-1);
    expect(plotPointAreaStart).toBeGreaterThan(-1);
    expect(plotPointAreaEnd).toBeGreaterThan(plotPointAreaStart);
    expect(plotPointAreaSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value');
    expect(plotPointAreaSource).not.toContain('AI对话框');
    expect(plotPointAreaSource).not.toContain('rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(plotPointAreaSource).not.toContain('absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950');
  });

  it('uses the 07 no-card right-side shell across official editor right panels', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContain('<aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">');
    expect(panelSource).toContain('<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">');
    expect(panelSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full');
    expect(chapterSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1');
    expect(chapterSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value');
    expect(panelSource).not.toContain('relative mt-5 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(panelSource).not.toContain('relative flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(panelSource).not.toContain('relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(chapterSource).not.toContain('AI 閰嶇疆');
    expect(chapterSource).not.toContain('AI 输出框');
    expect(chapterSource).not.toContain('flex min-h-[240px] flex-col rounded-2xl border border-[#08AACE] bg-white');
  });

  it('does not show the plot chain generation rules heading in the right panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointControlsStart = panelSource.indexOf('<span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>');
    const plotPointControlsEnd = panelSource.indexOf('<div className="relative flex min-h-0 flex-1 flex-col">', plotPointControlsStart);
    const plotPointControlsSource = panelSource.slice(plotPointControlsStart, plotPointControlsEnd);

    expect(plotPointControlsStart).toBeGreaterThan(-1);
    expect(plotPointControlsEnd).toBeGreaterThan(plotPointControlsStart);
    expect(plotPointControlsSource).toContain('剧情点类型：');
    expect(plotPointControlsSource).toContain('剧情点数量：');
    expect(plotPointControlsSource).not.toContain('生成规则</div>');
  });

  it('keeps plot point preview actions at the bottom without the preview title or status copy', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const centerPanelStart = panelSource.indexOf('<section className="min-w-0 flex min-h-0 flex-col bg-white">', plotPointStandaloneStart);
    const centerPanelEnd = panelSource.indexOf('{plotPointRightResizeHandle}', centerPanelStart);
    const centerPanelSource = panelSource.slice(centerPanelStart, centerPanelEnd);
    const candidateListIndex = centerPanelSource.indexOf('plotPointVisibleCandidates.length === 0');
    const actionRowIndex = centerPanelSource.indexOf('<div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">');

    expect(plotPointStandaloneStart).toBeGreaterThan(-1);
    expect(centerPanelStart).toBeGreaterThan(-1);
    expect(centerPanelEnd).toBeGreaterThan(centerPanelStart);
    expect(candidateListIndex).toBeGreaterThan(-1);
    expect(actionRowIndex).toBeGreaterThan(candidateListIndex);
    expect(centerPanelSource).not.toContain('<h2 className="text-sm font-black text-slate-950">剧情点预览</h2>');
    expect(centerPanelSource).not.toContain('等待手动刷新衔接剧情');
    expect(centerPanelSource).toContain('清空');
    expect(centerPanelSource).toContain('重新生成');
    expect(centerPanelSource).toContain('继续生成');
  });

  it('renders the selected plot point delete action as a bordered warning button', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const selectedListStart = panelSource.indexOf('visiblePlotPointSelectedItems.map((item) => {');
    const deleteButtonAnchor = panelSource.indexOf('删除', selectedListStart);
    const removeButtonStart = panelSource.lastIndexOf('<button', deleteButtonAnchor);
    const removeButtonEnd = panelSource.indexOf('</button>', deleteButtonAnchor);
    const removeButtonSource = panelSource.slice(removeButtonStart, removeButtonEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(deleteButtonAnchor).toBeGreaterThan(selectedListStart);
    expect(removeButtonStart).toBeGreaterThan(selectedListStart);
    expect(removeButtonEnd).toBeGreaterThan(removeButtonStart);
    expect(removeButtonSource).toContain('border border-red-200');
    expect(removeButtonSource).toContain('bg-red-50');
    expect(removeButtonSource).toContain('shadow-sm');
    expect(removeButtonSource).not.toContain('className="shrink-0 text-xs font-black text-red-500"');
    expect(removeButtonSource).toContain('togglePlotPointCandidate(item.id)');
    expect(removeButtonSource).not.toContain('openDetailOutlineFromPlotPoint');
  });

  it('renders plot chain slots with the same collapsible tree structure as the chapter sidebar', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const gridTemplateStart = panelSource.indexOf('gridTemplateColumns:', plotPointStandaloneStart);
    const navStart = panelSource.indexOf('<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2" aria-label="剧情链目录树">');
    const navEnd = panelSource.indexOf('</nav>', navStart);
    const navSource = panelSource.slice(navStart, navEnd);

    expect(gridTemplateStart).toBeGreaterThan(-1);
    expect(panelSource.slice(gridTemplateStart, gridTemplateStart + 240)).toContain('${plotPointLayoutTreeWidth}px 8px ${plotPointLayoutLeftWidth}px 8px');
    expect(navStart).toBeGreaterThan(-1);
    expect(navEnd).toBeGreaterThan(navStart);
    expect(panelSource).toContain('const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() => readPlotPointLayoutTreeWidth(storageKey));');
    expect(panelSource).toContain('const plotPointTreeResizeHandle = (');
    expect(panelSource).toContain('onPointerDown={startPlotPointTreeWidthResize}');
    expect(panelSource).toContain('title="拖拽调整剧情链目录宽度"');
    expect(panelSource).toContain('{plotPointTreeResizeHandle}');
    expect(panelSource).toContain('const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() => (');
    expect(panelSource).toContain('normalizePlotPointChainNames(activeTabConfig.plotPointChainNames)');
    expect(panelSource).not.toContain('aria-label="剧情链名称"');
    expect(panelSource).not.toContain('value={currentPlotPointChainName}');
    expect(panelSource).not.toContain('onChange={(event) => renamePlotPointChain(event.target.value)}');
    expect(panelSource).toContain('const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<Record<PlotPointChainSlot, boolean>>({');
    expect(panelSource).not.toContain('<h2 className="whitespace-nowrap text-sm font-bold text-gray-900">剧情链</h2>');
    expect(navSource).toContain('aria-label="当前主链未写序号导航"');
    expect(navSource).toContain('onContextMenu={(event) => {');
    expect(navSource).toContain('setPlotPointChainMenuSlot(plotPointActiveChainSlot)');
    expect(navSource).toContain('setPlotPointChainRenameDraft(plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`)');
    expect(navSource).toContain('aria-label="当前主链菜单"');
    expect(navSource).toContain('renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)');
    expect(navSource).toContain('const originalIndex = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);');
    expect(navSource).toContain('plotPointUnwrittenItems.map((item) => {');
    expect(navSource).toContain('aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContain("setPlotPointChainFilterMode('all')");
    expect(navSource).toContain('setActivePlotPointChainItemId(item.id)');
    expect(navSource).toContain('暂无未写剧情点');
    expect(navSource).toContain('备选链 {PLOT_POINT_CHAIN_SLOTS.length - 1} 条');
    expect(navSource).toContain('PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (');
    expect(navSource).toContain('onClick={() => setActivePlotPointChainSlot(slot)}');
    expect(navSource).toContain('aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}');
    expect(navSource).toContain('expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true');
    expect(navSource).not.toContain('{PLOT_POINT_CHAIN_SLOTS.length}条');
    expect(navSource).toContain('主链');
    expect(navSource).not.toContain('{plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`}');
    expect(navSource).toContain('{plotPointUnwrittenItems.length} 未写');
    expect(navSource).toContain('className="group flex h-[36px] w-full items-center gap-1 rounded-md bg-[#EAF9FD] px-2 py-1.5 text-left transition-colors hover:bg-[#dff5fb]"');
    expect(navSource).toContain('<span className="min-w-0 flex-1 truncate text-sm font-medium text-[#078fb0]">{plotPointChainNames[slot] ?? `剧情链${slot}`}</span>');
    expect(navSource).toContain('<span className="ml-1 shrink-0 text-xs text-gray-400">{(plotPointChainSelections[slot] ?? []).length}点</span>');
    expect(navSource).toContain('className="ml-1 mt-0.5 space-y-0.5"');
    expect(navSource).toContain("activePoint ? 'text-orange-600' : 'text-gray-700'");
    expect(navSource).toContain('剧情点{originalIndex + 1}');
    expect(navSource).toContain('border-transparent hover:bg-gray-50');
    expect(navSource).not.toContain("ring-2 ring-[#bdeef7]");
    expect(navSource).not.toContain('border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-100');
    expect(navSource).not.toContain("border-[#08AACE] bg-[#08AACE] text-white");
    expect(navSource).not.toContain("border-[#bdeef7] bg-white text-[#078fb0] hover:border-[#08AACE] hover:bg-[#F7FCFE]");
    expect(navSource).not.toContain('text-orange-500');
    expect(navSource).not.toContain('剧情点{index + 1}');
    expect(navSource).not.toContain('PLOT_POINT_CHAIN_SLOTS.map((slot) => {');
    expect(panelSource).not.toContain('aria-label="剧情链导航"');
    expect(panelSource).not.toContain('mb-3 flex min-w-0 gap-2 overflow-x-auto');
    expect(panelSource).not.toContain('<h2 className="text-sm font-black text-slate-950">剧情链{plotPointActiveChainSlot}</h2>');
    expect(panelSource).toContain('选中的剧情点会加入当前剧情链。');
    expect(panelSource).not.toContain('选中的剧情点会加入当前数字剧情链。');
  });

  it('renders selected plot point cards as full-width content, inline metrics, and folded AI review', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotChainSource = await readWorkbenchPlotChainSource();
    const selectedListStart = panelSource.indexOf('visiblePlotPointSelectedItems.map((item) => {');
    const selectedListEnd = panelSource.indexOf('{plotPointLeftResizeHandle}', selectedListStart);
    const selectedListSource = panelSource.slice(selectedListStart, selectedListEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(selectedListEnd).toBeGreaterThan(selectedListStart);
    expect(panelSource).toContain("const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');");
    expect(panelSource).toContain('const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];');
    expect(panelSource).toContain('const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));');
    expect(panelSource).toContain("if (plotPointChainFilterMode === 'written') return written;");
    expect(panelSource).toContain("if (plotPointChainFilterMode === 'unwritten') return !written;");
    expect(panelSource).toContain('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContain('movePlotPointChainItemToUnwritten(item.id)');
    expect(panelSource).toContain("['all', '全部']");
    expect(panelSource).toContain("['unwritten', '只看未写']");
    expect(panelSource).toContain("['written', '只看已写']");
    expect(panelSource).toContain('className="flex flex-wrap items-center gap-2"');
    expect(panelSource).toContain('h-10 w-20 whitespace-nowrap rounded-2xl border px-2');
    expect(panelSource).toContain('h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE]');
    expect(panelSource).not.toContain('grid-cols-[repeat(auto-fit,minmax(128px,1fr))]');
    expect(panelSource).toContain('onClick={openDetailOutlineFromPlotPoint}');
    expect(panelSource).not.toContain("['hideWritten', '已写隐藏']");
    expect(selectedListSource).toContain('visiblePlotPointSelectedItems.map((item) => {');
    expect(selectedListSource).toContain('const written = plotPointWrittenIdSet.has(item.id);');
    expect(selectedListSource).toContain("written ? '移回未写' : '标为已写'");
    expect(selectedListSource).toContain('删除');
    expect(selectedListSource).not.toContain('生成章纲');
    expect(panelSource).toContain('当前过滤条件下没有剧情点');
    expect(selectedListSource).toContain("['内容', metrics.clarity]");
    expect(selectedListSource).toContain("['潜力', metrics.potential]");
    expect(selectedListSource).toContain("['衔接', metrics.fit]");
    expect(selectedListSource).toContain('const reviewExpanded = expandedPlotPointPreviewIds.includes(`chain-review:${item.id}`);');
    expect(selectedListSource).toContain('<p className="min-w-0 flex-1 line-clamp-6 text-sm font-bold leading-6 text-slate-700">{displayText}</p>');
    expect(selectedListSource).not.toContain('aria-hidden="true"');
    expect(selectedListSource).not.toContain('>剧情点 {index + 1}</span>');
    expect(selectedListSource).toContain('line-clamp-6 text-sm font-bold leading-6 text-slate-700');
    expect(selectedListSource).toContain('mt-3 grid grid-cols-3 gap-2');
    expect(panelSource).toContain("from '@/features/workbench/model/workbenchPlotChain'");
    expect(plotChainSource).toContain('function getWorkbenchPlotPointMetricClass(score: number)');
    expect(plotChainSource).toContain("if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';");
    expect(plotChainSource).toContain("if (score >= 80) return 'border-purple-200 bg-purple-50 text-purple-700';");
    expect(plotChainSource).toContain("if (score >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';");
    expect(plotChainSource).toContain("return 'border-emerald-200 bg-emerald-50 text-emerald-700';");
    expect(selectedListSource).toContain('${getWorkbenchPlotPointMetricClass(value)}');
    expect(selectedListSource).toContain('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}');
    expect(selectedListSource.indexOf('mt-3 grid grid-cols-3 gap-2')).toBeLessThan(
      selectedListSource.indexOf('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}'),
    );
    expect(selectedListSource).toContain("{reviewExpanded ? '收起AI评价' : 'AI评价'}");
    expect(selectedListSource).toContain('{reviewExpanded && (');
    expect(selectedListSource).toContain('getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)');
    expect(selectedListSource).not.toContain('w-[104px] shrink-0 space-y-1.5');
    expect(selectedListSource).not.toContain('flex h-8 items-center justify-between rounded-xl bg-white px-3 shadow-sm');
    expect(selectedListSource).toContain('flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm');
    expect(selectedListSource).toContain('text-xs font-black opacity-80');
    expect(selectedListSource).toContain('text-sm font-black');
    expect(selectedListSource).not.toContain('text-center shadow-sm');
    expect(selectedListSource).not.toContain('潜力 {metrics.potential}');
    expect(panelSource).toContain('title="拖拽调整剧情链左侧宽度"');
    expect(panelSource).toContain('group-hover:bg-[#08AACE]" />');
    expect(panelSource).not.toContain('title="拖拽调整剧情链左侧宽度"\\n    >\\n      <div className="w-px bg-transparent');
  });

  it('hides raw reasoning text in the plot chain right output so it matches final candidates', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const renderFunctionStart = panelSource.indexOf('function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {})');
    const renderFunctionEnd = panelSource.indexOf('function getLatestUsefulAiText', renderFunctionStart);
    const renderFunctionSource = panelSource.slice(renderFunctionStart, renderFunctionEnd);

    expect(renderFunctionStart).toBeGreaterThan(-1);
    expect(renderFunctionEnd).toBeGreaterThan(renderFunctionStart);
    expect(renderFunctionSource).toContain('options.hideReasoningBody ?');
    expect(renderFunctionSource).toContain('<span>{thinkingLabel}</span>');
    expect(renderFunctionSource).toContain('{reasoning && (');
    expect(panelSource).toContain('renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })');
  });

  it('uses the requested default tab even when the shared storage remembered another setting tab', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('defaultActiveTab');
    expect(panelSource).toContain('readActiveTab(storageKey, normalizedTabs, defaultActiveTab)');
    expect(panelSource).toContain('这里显示选中的脑洞内容，也可以直接编辑。');
  });

  it('uses the selected danger recycle button style for the brainstorm recycle entry', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const recycleButtonAnchor = panelSource.indexOf('setIsBrainstormRecycleOpen(true)');
    const recycleButtonStart = panelSource.lastIndexOf('<button', recycleButtonAnchor);
    const recycleButtonEnd = panelSource.indexOf('</button>', recycleButtonAnchor);
    const recycleButtonSource = panelSource.slice(recycleButtonStart, recycleButtonEnd);

    expect(recycleButtonAnchor).toBeGreaterThan(-1);
    expect(recycleButtonStart).toBeGreaterThan(-1);
    expect(recycleButtonEnd).toBeGreaterThan(recycleButtonStart);
    expect(recycleButtonSource).toContain('border border-red-100 bg-red-50');
    expect(recycleButtonSource).toContain('hover:border-red-200 hover:bg-red-100');
    expect(recycleButtonSource).toContain('<Trash2 className="h-4 w-4" />');
    expect(recycleButtonSource).toContain('bg-white text-red-500');
    expect(recycleButtonSource).toContain('{brainstormRecycleEntries.length}');
    expect(recycleButtonSource).not.toContain('打开');
    expect(recycleButtonSource).not.toContain('个已删除脑洞');
  });

  it('removes the brainstorm recycle button scheme test page from the test collection', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('BrainstormRecycleButtonTestPage');
    expect(testCollectionSource).not.toContain('/brainstorm-recycle-button-test');
    expect(testCollectionSource).not.toContain('脑洞回收站按钮方案');
  });

  it('removes the plot chain tree design scheme test page after applying scheme A', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('剧情链目录分组方案');
    expect(testCollectionSource).not.toContain('/plot-chain-tree-design-test');
    expect(testCollectionSource).not.toContain('PlotChainTreeDesignTestPage');
    expect(testCollectionSource).not.toContain('PlotChainTreeDesignA');
    expect(testCollectionSource).not.toContain('方案 A：目录树层级');
    expect(testCollectionSource).not.toContain('方案 D：紧凑深浅对比');
  });

  it('removes the plot chain left detail scheme test page after applying scheme E to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(testCollectionSource).not.toContain('PlotChainLeftDetailTestPage');
    expect(testCollectionSource).not.toContain('/plot-chain-left-detail-test');
    expect(testCollectionSource).not.toContain('剧情链左二调试方案');
    expect(panelSource).toContain('aria-label="当前主链未写序号导航"');
    expect(panelSource).toContain('aria-label="当前主链菜单"');
    expect(panelSource).toContain('备选链 {PLOT_POINT_CHAIN_SLOTS.length - 1} 条');
    expect(panelSource).toContain('plotPointChainWrittenSelections');
    expect(panelSource).toContain('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContain("['written', '只看已写']");
  });

  it('lets detail outline reader associate the current plot chain', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines' | 'plotChain';");
    expect(panelSource).toContain('detailOutlineReaderPlotChainIds?: string[];');
    expect(panelSource).toContain('const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds]');
    expect(panelSource).toContain('const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])');
    expect(panelSource).toContain("['plotChain', '剧情链']");
    expect(panelSource).toContain("detailOutlineReaderTab === 'plotChain'");
    expect(panelSource).toContain('toggleDraftDetailOutlineReaderPlotChain(item.id)');
    expect(panelSource).toContain('detailOutlineReaderPlotChainIds: nextPlotChainIds');
    expect(panelSource).toContain('plotChainText ? `【关联剧情链】');
    expect(panelSource).toContain('请根据关联的设定、前文章纲和剧情链生成章纲。');
  });

  it('adds a test preview for all suggested border transparent backplate placements', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const backplateTestSource = await readBorderBackplateApplicationTestSource();

    expect(testCollectionSource).toContain('BorderBackplateApplicationTestPage');
    expect(testCollectionSource).toContain('/border-backplate-application-test');
    expect(testCollectionSource).toContain('边框透明背板应用预览');
    expect(backplateTestSource).toContain('左上标题');
    expect(backplateTestSource).toContain('章纲字数位置');
    expect(backplateTestSource).toContain('右上章节元信息');
    expect(backplateTestSource).toContain('右上删除清空');
    expect(backplateTestSource).toContain('左下字号');
    expect(backplateTestSource).toContain('底边流式输出');
    expect(backplateTestSource).toContain('模型提示词标签');
    expect(backplateTestSource).toContain('会话按钮');
    expect(backplateTestSource).toContain('xy-border-embedded-transparent-backplate');
    expect(backplateTestSource).toContain('xy-floating-count');
    expect(backplateTestSource).toContain('xy-floating-border-font-tool');
    expect(backplateTestSource).toContain('xy-floating-outline-output-clear-tool');
  });

  it('hides inline field size control when the workbench header owns the entry and opens from external signal', () => {
    const { rerender } = render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={0}
      />,
    );

    expect(screen.queryByRole('button', { name: /设置/ })).not.toBeInTheDocument();

    rerender(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={1}
      />,
    );

    expect(screen.getByRole('heading', { name: /设置/ })).toBeInTheDocument();
  });
  it('requires right-click unlock before opening the clear settings confirmation dialog', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('isClearSettingsUnlocked');
    expect(panelSource).toContain('aria-disabled={!isClearSettingsUnlocked');
    expect(panelSource).toContain('setClearSettingsUnlockMenu({');
    expect(panelSource).toContain('setIsClearSettingsConfirmOpen(true)');
    expect(panelSource).toContain("activeTab === SETTING_TAB ? 'grid-cols-4' : 'grid-cols-3'");
    expect(panelSource).toContain('min-w-0 border-l border-gray-200 px-2 text-sm font-bold text-white');
    expect(panelSource).not.toContain('h-9 w-full rounded-xl border border-red-200');
  });
});
