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

const readChapterEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterEditor.tsx'), 'utf8');
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
  it('places brainstorm output clear action on the top right and font tools on the bottom border', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const actionToolStart = panelSource.indexOf('<div className="xy-floating-brainstorm-output-action-tool');
    const actionToolSource = panelSource.slice(actionToolStart, panelSource.indexOf('<div className="xy-floating-border-font-tool">', actionToolStart));

    expect(panelSource).toContain('xy-floating-brainstorm-output-action-tool');
    expect(actionToolSource).toContain('onClick={clearLibraryAiDialog}');
    expect(actionToolSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(actionToolSource).not.toContain('border-r border-slate-200');
    expect(actionToolSource).toContain('className="h-full px-3 text-sm font-black text-red-500');
    expect(panelSource).toContain('ariaLabel="脑洞输出字号"');
    expect(panelSource).toContain('xy-floating-border-font-tool');
    expect(panelSource).toContain('className="xy-floating-border-stream-tool"');
    expect(panelSource).toContain('className="xy-stream-toggle-text">流式输出</span>');
    expect(panelSource).toContain('className="xy-stream-toggle-track"');
    expect(panelSource).toContain('className="xy-stream-toggle-thumb"');
    expect(panelSource).toContain('updateActiveTabConfig({ brainstormStreamEnabled: event.target.checked })');
    expect(panelSource).not.toContain('xy-floating-brainstorm-output-font-tool');
    expect(panelSource).not.toContain('<span>流式输出</span>');
    expect(styleSource).toContain('.xy-floating-border-stream-tool {');
    expect(styleSource).toContain('.xy-stream-toggle-text {');
    expect(styleSource).toContain('height: 1.76rem;');
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
    expect(panelSource).toContain('<label className={isDetailOutlineTab ? \'xy-floating-title-count\' : undefined}>');
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
    expect(styleSource).not.toContain('.xy-floating-edge-tool.xy-floating-brainstorm-session-tool');
    const actionToolStart = panelSource.indexOf('<div className="xy-floating-brainstorm-output-action-tool');
    const actionToolSource = panelSource.slice(actionToolStart, panelSource.indexOf('<div className="xy-floating-border-font-tool">', actionToolStart));

    expect(actionToolSource).toContain('xy-floating-brainstorm-output-action-tool');
    expect(actionToolSource).toContain('清空');
    expect(actionToolSource).not.toContain('删除');
    expect(actionToolSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(actionToolSource).toContain('flex h-7 max-w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm');
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
    expect(styleSource).toContain('right: 4.35rem;');
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
    expect(panelSource).toContain('<div className="mt-3 shrink-0 text-sm font-bold leading-6 text-gray-600">');
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
    const countButtonStart = panelSource.indexOf("{['1', '2', '3', '5', '10'].map((value) => {");
    const generateButtonStart = panelSource.indexOf('onClick={openBrainstormGenerateConfirm}', countButtonStart);
    const countButtonSource = panelSource.slice(countButtonStart, generateButtonStart);

    expect(countButtonStart).toBeGreaterThan(-1);
    expect(generateButtonStart).toBeGreaterThan(countButtonStart);
    expect(panelSource).not.toContain('xy-brainstorm-count-field');
    expect(panelSource).not.toContain('xy-brainstorm-count-options');
    expect(panelSource).toContain('一次生成几个脑洞');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
    expect(panelSource).toContain('<div className="mt-2 flex items-center justify-between gap-2">');
    expect(panelSource).toContain('<div className="flex min-w-0 items-center gap-2">');
    expect(panelSource).toContain('flex h-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white');
    expect(countButtonSource).toContain('setBrainstormQuestionField(\'brainstormCount\', active ? \'\' : value)');
    expect(countButtonSource).toContain('last:border-r-0');
    expect(countButtonSource).not.toContain('3个');
  });
  it('keeps brainstorm count buttons compact while the generate button stays on the right', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain('<div className="mt-2 flex items-center justify-between gap-2">');
    expect(panelSource).toContain('min-w-[42px] border-r border-slate-200 px-3 text-sm font-black');
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
    expect(panelSource).toContain('function getBrainstormOutputCount(value: string)');
    expect(panelSource).toContain('return `新脑洞${index + 1}`;');
    expect(panelSource).toContain('function splitBrainstormGeneratedText(text: string, count: number)');
    expect(panelSource).toContain('const brainstormOutputPreviewCount = activeIsBrainstorm ? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount) : 1;');
    expect(panelSource).toContain('const brainstormOutputPreviews = Array.from({ length: brainstormOutputPreviewCount }, (_, index) => (');
    expect(panelSource).toContain('{brainstormOutputPreviews.map((previewValue, index) => {');
    expect(panelSource).toContain('aria-label={`脑洞输出名称 ${index + 1}`}');
    expect(panelSource).toContain('onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}');
    expect(panelSource).toContain('updateActiveBrainstormAiSession({ previewTitles: [], previewDrafts: [] });');
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
    expect(panelSource).toContain('<div className="mt-2 flex items-center justify-between gap-2">');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
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
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={activeOutlinePromptId');
    const outlineRightPanelStart = panelSource.lastIndexOf('<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">', outlineRightPanelAnchor);
    const outlineRightPanelEnd = panelSource.indexOf('{isOutlineSettingsOpen && (', outlineRightPanelStart);
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
    expect(panelSource).toContain('const shouldShowOutlineDraftWordCount = plotPointStandalone || isDetailOutlineTab;');
    expect(panelSource).not.toContain('const outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('selectedOutlineChapter?.chapter.wordCount');
    expect(outlineRightPanelSource).toContain('{shouldShowOutlineDraftWordCount && (');
    expect(panelSource).toContain(': `第${selectedOutlineChapter.chapter.serialNumber}章概要`');
    expect(outlineRightPanelSource).toContain('{isDetailOutlineTab && (');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-output-clear-tool');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-10 z-30 px-1');
  });

  it('shows chapter title and body word count on each outline and summary card top right', async () => {
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
    expect(cardMetaSource).not.toContain('正文：');
    expect(cardMetaSource).toContain('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *');
  });

  it('places detail outline word count on the top-left border beside the card title', async () => {
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
    expect(labelSource).toContain('{outlineCardTitle}');
    expect(labelSource).toContain("isDetailOutlineTab ? 'xy-floating-title-count' : undefined");
    expect(labelSource).toContain('{isDetailOutlineTab && <span><WordCountText value={countTextWords(outlineCardContent)} /></span>}');
    expect(labelSource).not.toContain('章纲：');
    expect(cardSource).not.toContain("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContain("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(cardSource).not.toContain('{!isDetailOutlineTab && (');
    expect(styleSource).toContain('gap: 0.32rem;');
  });

  it('places the detail outline font size control on each chapter outline card lower left', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardFontAnchor = panelSource.indexOf('ariaLabel="章纲字号"');
    const cardFontStart = panelSource.lastIndexOf('{isDetailOutlineTab && (', cardFontAnchor);
    const cardFontEnd = panelSource.indexOf('</section>', cardFontStart);
    const cardFontSource = panelSource.slice(cardFontStart, cardFontEnd);

    expect(panelSource).toContain('detailOutlineFontSize?: number');
    expect(panelSource).toContain('const detailOutlineFontSize = Math.min(');
    expect(panelSource).toContain('const setDetailOutlineFontSize = (value: number) =>');
    expect(panelSource).toContain('fontSize: detailOutlineFontSize');
    expect(cardFontAnchor).toBeGreaterThan(-1);
    expect(cardFontStart).toBeGreaterThan(-1);
    expect(cardFontEnd).toBeGreaterThan(cardFontStart);
    expect(cardFontSource).toContain('isDetailOutlineTab &&');
    expect(cardFontSource).toContain('<div className="xy-floating-border-font-tool">');
    expect(cardFontSource).toContain('value={detailOutlineFontSize}');
    expect(cardFontSource).toContain('min={DETAIL_OUTLINE_MIN_FONT_SIZE}');
    expect(cardFontSource).toContain('max={DETAIL_OUTLINE_MAX_FONT_SIZE}');
    expect(cardFontSource).toContain('onChange={setDetailOutlineFontSize}');
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
    expect(styleSource).toContain('display: none !important;');
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
    expect(clearRuleSource).toContain('background: transparent !important;');
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

    expect(screen.queryByRole('button', { name: /字段尺寸/ })).not.toBeInTheDocument();

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

    expect(screen.getByRole('heading', { name: /字段尺寸/ })).toBeInTheDocument();
  });
  it('requires right-click unlock before opening the clear settings confirmation dialog', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('isClearSettingsUnlocked');
    expect(panelSource).toContain('aria-disabled={!isClearSettingsUnlocked');
    expect(panelSource).toContain('setClearSettingsUnlockMenu({');
    expect(panelSource).toContain('setIsClearSettingsConfirmOpen(true)');
  });
});
