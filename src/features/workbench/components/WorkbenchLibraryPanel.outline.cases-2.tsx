import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  readWorkbenchLibraryPanelSource,
  readWorkbenchLibraryPanelConstantsSource,
  readWorkbenchDetailOutlineReaderModalSource,
  readSharedStylesSource,
  readAiRequestLogModalLayoutSource,
  readChapterNumberButtonSource,
  readCapsuleSelectSource,
  readChapterEditorSource,
  readChapterSidebarSource,
  readPublishedSidebarSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel outline flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('uses the body page format for the outline right-side output card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={promptId}');
    const outlineRightPanelStart = panelSource.lastIndexOf(
      '<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
      outlineRightPanelAnchor,
    );
    const outlineRightPanelEnd = panelSource.indexOf('</aside>', outlineRightPanelStart);
    const outlineRightPanelSource = panelSource.slice(outlineRightPanelStart, outlineRightPanelEnd);

    expect(outlineRightPanelAnchor).toBeGreaterThan(-1);
    expect(outlineRightPanelStart).toBeGreaterThan(-1);
    expect(outlineRightPanelEnd).toBeGreaterThan(outlineRightPanelStart);
    expect(outlineRightPanelSource).toContainSource('<div className="xy-ai-panel-output-slot relative">');
    expect(outlineRightPanelSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full',
    );
    expect(outlineRightPanelSource).not.toContainSource('AI对话框');
    expect(outlineRightPanelSource).not.toContainSource('xy-soft-shell-panel');
    expect(outlineRightPanelSource).not.toContainSource(
      'relative mt-6 flex min-h-[310px] flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1',
    );
    expect(styleSource).toContainSource('.xy-floating-field.xy-outline-ai-output-frame {');
    expect(styleSource).toContainSource('border: 2px solid #111827;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-outline-ai-output-frame label.xy-floating-title-count,');
    expect(styleSource).toContainSource('transform: translateY(-50%) scale(1);');
    expect(styleSource).toContainSource('.xy-ai-panel-output-slot {');
    expect(styleSource).toContainSource('min-height: 170px;');
    expect(styleSource).toContainSource('margin-top: 1.25rem;');
    expect(styleSource).toContainSource('margin-top: 0.75rem;');
    expect(panelSource).toContainSource('const shouldShowOutlineDraftWordCount = false;');
    expect(panelSource).toContainSource('if (isDetailOutlineLikeTab(activeTab)) return;');
    expect(panelSource).toContainSource(
      "if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');",
    );
    expect(panelSource).not.toContainSource('const outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContainSource('outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContainSource('selectedOutlineChapter?.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContainSource('selectedOutlineChapter.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContainSource('selectedVolumeWordCount');
    expect(outlineRightPanelSource).not.toContainSource('章节字数：');
    expect(outlineRightPanelSource).not.toContainSource(
      '正文：<WordCountText value={selectedOutlineChapter.chapter.wordCount} compact />',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      '第{selectedOutlineChapter.chapter.serialNumber}章 {selectedChapterTitle}',
    );
    expect(outlineRightPanelSource).toContainSource('{shouldShowOutlineDraftWordCount && (');
    expect(panelSource).toContainSource(': `第${selectedOutlineChapter.chapter.serialNumber}章梗概`');
    expect(outlineRightPanelSource).toContainSource('{isDetailOutlineTab && (');
    expect(outlineRightPanelSource).toContainSource('label="大纲"');
    expect(outlineRightPanelSource).toContainSource('linkedLabel="已关联大纲"');
    expect(outlineRightPanelSource).toContainSource('prefixLabel="关联"');
    expect(outlineRightPanelSource).toContainSource('clearOnLinkedClick');
    expect(outlineRightPanelSource).toContainSource('onClear={clearDetailOutlineReaderSelection}');
    expect(outlineRightPanelSource).toContainSource(
      'linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap bg-[#08AACE] px-3 text-sm font-black text-white hover:bg-[#0796B8]"',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'clearButtonClassName="flex h-full w-9 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600"',
    );
    expect(outlineRightPanelSource).toContainSource(
      'meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}',
    );
    expect(outlineRightPanelSource).toContainSource('className="xy-ai-panel-link-row flex items-center gap-2"');
    expect(outlineRightPanelSource).toContainSource(
      'groupClassName="flex h-10 w-[134px] shrink-0 overflow-hidden rounded-xl border border-[#08AACE] bg-white shadow-sm"',
    );
    expect(outlineRightPanelSource).toContainSource('prefixClassName="grid w-12 shrink-0 place-items-center');
    expect(outlineRightPanelSource).toContainSource(
      'buttonClassName="min-w-0 flex-1 whitespace-nowrap bg-white px-3 text-sm font-bold text-slate-600 hover:bg-[#E9FAFD]"',
    );
    expect(panelSource).toContainSource("readerTitle: '关联资料'");
    expect(panelSource).toContainSource("readerEmptyText: '未关联章纲、设定或角色'");
    expect(panelSource).toContainSource("if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);");
    expect(panelSource).toContainSource("return wrapAiRequestTag('梗概要求', userText);");
    expect(panelSource).toContainSource(
      "const outlineUserLogTitle = isDetailOutlineTab ? '其他要求' : '输入内容';",
    );
    expect(panelSource).toContainSource('userTitle: outlineUserLogTitle');
    expect(panelSource).toContainSource(
      'function getOutlineAiLogFillGroupWeights(options: { hasReaderContext: boolean; hasContext: boolean; hasUser: boolean; })',
    );
    expect(panelSource).toContainSource('if (hasReference) {');
    expect(panelSource).toContainSource("...(options.hasReaderContext ? { 'reader-context': 1 } : {})");
    expect(panelSource).toContainSource('if (options.hasUser) return { prompt: 2, user: 1 };');
    expect(panelSource).toContainSource('fillGroupWeights={fillGroupWeights}');
    expect(panelSource).toContainSource('label: outlineUserLogTitle');
    expect(logLayoutSource).toContainSource('<div className="text-xs text-slate-400">{item.label}</div>');
    expect(panelSource).not.toContainSource("userTitle: '输入内容'");
    expect(outlineRightPanelSource).not.toContainSource('label="关联设定"');
    expect(outlineRightPanelSource).not.toContainSource(
      'linkedButtonClassName="h-9 shrink-0 rounded-xl bg-[#08AACE] px-3 text-sm font-black text-white transition-colors hover:bg-[#0798b8]"',
    );
    expect(outlineRightPanelSource).not.toContainSource('metaClassName="shrink-0 text-xs font-bold text-slate-400"');
    expect(outlineRightPanelSource).not.toContainSource('已关联 {selectedDetailOutlineReaderItems.length} 项');
    expect(outlineRightPanelSource).not.toContainSource('className="mt-3 flex items-center justify-between gap-3"');
    expect(outlineRightPanelSource).not.toContainSource(
      'metaClassName="min-w-0 truncate text-right text-xs font-bold text-slate-400"',
    );
    expect(panelSource).toContainSource("isDetailOutlineTab ? 'AI输出章纲'");
    expect(panelSource).toContainSource("? 'AI输出框'");
    expect(panelSource).not.toContainSource(
      '? getOutlineChapterFrameTitle(selectedOutlineChapter.volume, selectedOutlineChapter.chapter)',
    );
    expect(outlineRightPanelSource).toContainSource('生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。');
    expect(panelSource).toContainSource('const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement]');
    expect(panelSource).toContainSource('setLastDetailOutlineReplacement({');
    expect(panelSource).toContainSource('content: selectedOutlineEntry?.content ??');
    expect(panelSource).toContainSource('updateActiveTabConfig({ outlineAiTaskId: undefined });');
    expect(panelSource).toContainSource("setOutlinePreviewDraft('');");
    expect(panelSource).toContainSource(
      'updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);',
    );
    expect(panelSource).toContainSource('const undoDetailOutlineReplacement = () => {');
    expect(outlineRightPanelSource).toContainSource("isDetailOutlineTab ? '替换章纲' : '保存梗概'");
    expect(outlineRightPanelSource).toContainSource('onClick={undoDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContainSource('disabled={!canUndoDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContainSource('撤销替换');
    expect(outlineRightPanelSource).toContainSource("isDetailOutlineTab ? '复制章纲' : '复制梗概'");
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    expect(constantsSource).toContainSource(
      'export const OUTLINE_ACTION_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;',
    );
    expect(panelSource).toContainSource('? OUTLINE_ACTION_RIGHT_MIN_WIDTH');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap bg-brand');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200');
    expect(outlineRightPanelSource).not.toContainSource(
      'min-w-[92px] flex-1 whitespace-nowrap border-l border-red-200',
    );
    expect(outlineRightPanelSource).not.toContainSource("isDetailOutlineTab ? '清空章纲' : '清空梗概'");
    expect(outlineRightPanelSource).not.toContainSource('保存章纲');
    expect(outlineRightPanelSource).not.toContainSource('xy-floating-outline-output-clear-tool');
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-10 z-30 px-1',
    );
  });
  it('removes the duplicate chapter meta and embeds independent font controls in both detail outline frames', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardMetaStart = panelSource.indexOf('const { volume, chapter } = selectedOutlineChapter;');
    const cardMetaEnd = panelSource.indexOf('</section>', cardMetaStart);
    const cardMetaSource = panelSource.slice(cardMetaStart, cardMetaEnd);

    expect(cardMetaStart).toBeGreaterThan(-1);
    expect(cardMetaEnd).toBeGreaterThan(cardMetaStart);
    expect(cardMetaSource).toContainSource('detailOutlineParts.outline');
    expect(cardMetaSource).not.toContainSource('chapter.title.trim() ||');
    expect(cardMetaSource).not.toContainSource('xy-floating-outline-chapter-meta');
    expect(cardMetaSource).not.toContainSource('未命名章节');
    expect(cardMetaSource).toContainSource('ariaLabel="章纲字号"');
    expect(panelSource).toContainSource('ariaLabel="状态变化字号"');
    expect(panelSource).toContainSource('detailOutlineStateFontSize?: number');
    expect(panelSource).toContainSource('activeTabConfig.detailOutlineStateFontSize');
    expect(panelSource).toContainSource('xy-detail-outline-border-font-tool xy-border-embedded-transparent-backplate');
    expect(panelSource).toContainSource('{!isDetailOutlineTab && libraryHeaderFontSizePortal}');
  });
  it('places each detail outline word count directly after its frame title', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardSourceStart = panelSource.indexOf('const { volume, chapter } = selectedOutlineChapter;');
    const cardSourceEnd = panelSource.indexOf('\n  }\n\n  return (', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const labelStart = cardSource.indexOf('<label className="xy-floating-title-count xy-detail-outline-title-count">');
    const labelEnd = cardSource.indexOf('</label>', labelStart);
    const labelSource = cardSource.slice(labelStart, labelEnd);

    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(labelStart).toBeGreaterThan(-1);
    expect(labelEnd).toBeGreaterThan(labelStart);
    expect(cardSource).toContainSource('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(cardSource).toContainSource('value={detailOutlineParts.outline}');
    expect(cardSource).toContainSource('value={detailOutlineParts.stateExpectation}');
    expect(panelSource).toContainSource(
      '<DetailOutlineTitleWordCount value={countTextWords(detailOutlineParts.stateExpectation)} />',
    );
    expect(labelSource).toContainSource('xy-detail-outline-title-count');
    expect(labelSource).toContainSource('xy-floating-title-text xy-detail-outline-heading-title');
    expect(labelSource).toContainSource('{outlineCardTitle}');
    expect(labelSource).toContainSource(
      '<DetailOutlineTitleWordCount value={countTextWords(detailOutlineParts.outline)} spacingClassName="ml-[2ch]" />',
    );
    expect(panelSource).toContainSource(
      'className={`${spacingClassName} xy-detail-outline-title-word-count xy-border-embedded-transparent-backplate whitespace-nowrap`}',
    );
    expect(panelSource).toContainSource('spacingClassName="ml-[2ch]"');
    expect(panelSource).toContainSource('className="text-brand">{value}</span>');
    expect(panelSource).toContainSource('className="text-slate-400">字</span>');
    expect(styleSource).toContainSource(
      '.xy-floating-field .xy-detail-outline-border-font-tool .xy-font-size-stepper-input',
    );
    expect(styleSource).toContainSource('height: 1.76rem;');
    expect(styleSource).toContainSource('border-radius: 0;');
    expect(panelSource).toContainSource('className="flex h-full min-h-0 flex-col gap-6"');
    expect(panelSource).toContainSource('absolute right-9 top-1 z-[60] -translate-y-1/2');
    expect(styleSource).toContainSource('isolation: isolate;');
    expect(panelSource).toContainSource('? `第${chapter.serialNumber}章 章纲`');
    expect(panelSource).not.toContainSource('? `${volume.name} 第${chapter.serialNumber}章 章纲`');
    expect(cardSource).not.toContainSource('<WordCountText value={countTextWords(detailOutlineParts.outline)} />');
    expect(cardSource).not.toContainSource(
      '<WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />',
    );
    expect(labelSource).not.toContainSource('章纲：');
    expect(panelSource).toContainSource('const clearOutlineAiOutputDraft = () => {');
    expect(panelSource).toContainSource('onClick={clearOutlineAiOutputDraft}');
    expect(panelSource).toContainSource('const renderDetailOutlineDraftClearButton = () => {');
    expect(panelSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1',
    );
    expect(cardSource).not.toContainSource("onClick={() => updateChapterSummary(chapter.serialNumber, '')}");
    expect(cardSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-card-clear-tool absolute z-30 px-1',
    );
    expect(panelSource).toContainSource('{renderDetailOutlineDraftClearButton()}');
    const clearOutputStart = panelSource.indexOf('const clearOutlineAiOutputDraft = () => {');
    const clearOutputEnd = panelSource.indexOf('const renderDetailOutlineDraftClearButton = () => {', clearOutputStart);
    const clearOutputSource = panelSource.slice(clearOutputStart, clearOutputEnd);
    const clearPreviewStart = panelSource.indexOf('const clearOutlinePreviewDraft = () => {');
    const clearPreviewEnd = panelSource.indexOf('  return {', clearPreviewStart);
    const clearPreviewSource = panelSource.slice(clearPreviewStart, clearPreviewEnd);

    expect(clearOutputSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearOutputSource).not.toContainSource('updateChapterSummary');
    expect(clearOutputSource).not.toContainSource('updateVolumeSummary');
    expect(clearPreviewSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearPreviewSource).not.toContainSource('updateChapterSummary');
    expect(clearPreviewSource).not.toContainSource('updateVolumeSummary');
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(styleSource).toContainSource('gap: 0.32rem;');
    expect(styleSource).toContainSource('max-width: min(13rem, calc(42% - 1.5rem));');
    expect(styleSource).toContainSource('.xy-detail-outline-title-count .xy-floating-title-text');
    expect(styleSource).toContainSource(
      '.xy-detail-outline-title-count .xy-floating-title-text.xy-detail-outline-heading-title',
    );
    expect(styleSource).toContainSource('color: #020617;');
    expect(styleSource).toContainSource('font-size: 0.875rem;');
    expect(styleSource).toContainSource('font-weight: 900;');
    expect(styleSource).toContainSource('-webkit-text-stroke: 0;');
    expect(styleSource).toContainSource('text-overflow: ellipsis;');
    expect(styleSource).toContainSource('.xy-floating-outline-draft-clear-tool {');
    expect(styleSource).toContainSource('top: 0;');
    expect(styleSource).toContainSource('right: 1.65rem;');
    expect(styleSource).toContainSource('bottom: auto;');
    expect(styleSource).toContainSource('transform: translateY(-50%);');
  });
  it('keeps general library font controls in the header while moving detail outline controls into their frames', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardSourceStart = panelSource.indexOf('const { volume, chapter } = selectedOutlineChapter;');
    const cardSourceEnd = panelSource.indexOf('</section>', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const settingPreviewStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const settingPreviewEnd = panelSource.indexOf(
      '<div className="mt-6 flex shrink-0 justify-end">',
      settingPreviewStart,
    );
    const settingPreviewSource = panelSource.slice(settingPreviewStart, settingPreviewEnd);
    const emptySettingPreviewStart = panelSource.indexOf('placeholder="这里可以直接输入设定内容，会自动新建设定。"');
    const emptySettingPreviewEnd = panelSource.indexOf('</div>', emptySettingPreviewStart);
    const emptySettingPreviewSource = panelSource.slice(emptySettingPreviewStart, emptySettingPreviewEnd);
    const outlineGridCondition = panelSource.indexOf('isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryStart = panelSource.lastIndexOf('gridTemplateColumns:', outlineGridCondition);
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(panelSource).toContainSource('detailOutlineFontSize?: number');
    expect(panelSource).toContainSource('detailOutlineStateFontSize?: number');
    expect(panelSource).toContainSource('const detailOutlineFontSize = clampFontSize(');
    expect(panelSource).toContainSource('setDetailOutlineFontSize: (value: number) =>');
    expect(panelSource).toContainSource('fontSize: detailOutlineFontSize');
    expect(panelSource).toContainSource('const renderDetailOutlineFontSizeTool = () => {');
    expect(panelSource).toContainSource('if (activeTab !== DETAIL_OUTLINE_TAB) return null;');
    expect(panelSource).toContainSource(
      'const getActiveLibraryFontConfig = () => getWorkbenchLibraryActiveFontConfig({',
    );
    expect(panelSource).toContainSource('function getWorkbenchLibraryActiveFontConfig');
    expect(panelSource).toContainSource('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContainSource('const renderLibraryHeaderFontSizeTool = () => {');
    expect(panelSource).toContainSource('const [headerToolPortalTarget, setHeaderToolPortalTarget]');
    expect(panelSource).toContainSource(
      "setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'))",
    );
    expect(panelSource).toContainSource(
      'const libraryHeaderFontSizePortal = headerToolPortalTarget && !showInlineFieldSizeButton',
    );
    expect(panelSource).toContainSource('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(panelSource).toContainSource('{!isDetailOutlineTab && libraryHeaderFontSizePortal}');
    expect(panelSource).toContainSource("ariaLabel: '章纲字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContainSource("ariaLabel: 'AI输出字号'");
    expect(panelSource).toContainSource("ariaLabel: '设定预览字号'");
    expect(panelSource).not.toContainSource('章纲目录');
    expect(panelSource).not.toContainSource('<h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ?');
    expect(panelSource).not.toContainSource('>章节梗概</h3>');
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('settingPreview')}");
    expect(panelSource).toContainSource('if (isDetailOutlineTab) onActivateFont();');
    expect(panelSource).toContainSource(
      'const fontStyle = isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined;',
    );
    expect(panelSource).toContainSource('onMouseDown={() => {');
    expect(panelSource).toContainSource('className="shrink-0"');
    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(cardSource).toContainSource('ariaLabel="章纲字号"');
    expect(panelSource).toContainSource('ariaLabel="状态变化字号"');
    expect(panelSource).toContainSource('fontSize: detailOutlineStateFontSize');
    expect(settingPreviewSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
    expect(emptySettingPreviewSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(outlineDirectorySource).not.toContainSource('mb-3 flex min-h-9 items-center justify-end gap-2');
    expect(outlineDirectorySource).not.toContainSource("renderLibraryAiLogButton('outline')");
    expect(outlineDirectorySource).not.toContainSource('renderDetailOutlineFontSizeTool()');
    expect(outlineDirectorySource).not.toContainSource('renderFieldSizeButton()');
    expect(outlineDirectorySource).toContainSource('<div className="min-h-0 flex-1 overflow-y-auto">');
  });
  it('does not show an AI dialogue label in the setting outline generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const outputFrameAnchor = panelSource.indexOf('xy-outline-ai-output-frame xy-floating-fill h-full');
    const outputAreaAnchor = panelSource.indexOf('生成设定', outputFrameAnchor);
    const outputAreaStart = panelSource.lastIndexOf('<div className="xy-ai-panel-output-slot relative">', outputAreaAnchor);
    const outputAreaEnd = panelSource.indexOf('{activeTab === SETTING_TAB && (', outputAreaAnchor);
    const outputAreaSource = panelSource.slice(outputAreaStart, outputAreaEnd);

    expect(outputAreaAnchor).toBeGreaterThan(-1);
    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(outputAreaEnd).toBeGreaterThan(outputAreaStart);
    expect(outputAreaSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full',
    );
    expect(outputAreaSource).toContainSource(
      '<label className="xy-floating-title-count xy-border-embedded-transparent-backplate">生成设定</label>',
    );
    expect(outputAreaSource).toContainSource('onClick={clearLibraryAiDialog}');
    expect(outputAreaSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1',
    );
    expect(outputAreaSource).not.toContainSource('可以在这里生成');
    expect(outputAreaSource).not.toContainSource('text-gray-400');
    expect(outputAreaSource).not.toContainSource('AI对话框');
    expect(outputAreaSource).not.toContainSource('rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(outputAreaSource).not.toContainSource(
      'absolute -top-2 left-4 bg-white px-1 text-sm font-black text-gray-900',
    );
    expect(styleSource).toContainSource('.xy-floating-outline-top-clear-tool {');
    expect(styleSource).toContainSource('transform: translateY(-50%);');
  });
  it('keeps detail outline reader aligned with the setting link picker layout', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalHeaderSource = await readWorkbenchDetailOutlineReaderModalSource();
    const readerAsideStart = modalHeaderSource.indexOf(
      '<aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">',
    );
    const readerAsideEnd = modalHeaderSource.indexOf(
      '<main className="editor-scrollbar min-h-0 overflow-y-auto p-6">',
      readerAsideStart,
    );
    const readerAsideHeaderSource = modalHeaderSource.slice(readerAsideStart, readerAsideEnd);

    expect(readerAsideStart).toBeGreaterThan(-1);
    expect(readerAsideEnd).toBeGreaterThan(readerAsideStart);
    expect(modalHeaderSource).toContainSource('<WorkbenchModal');
    expect(modalHeaderSource).toContainSource('title="关联资料"');
    expect(modalHeaderSource).toContainSource('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalHeaderSource).toContainSource('本次将读取');
    expect(modalHeaderSource).toContainSource('draftDetailOutlineReaderItems.map((entry) => (');
    expect(modalHeaderSource).toContainSource('setDetailOutlineReaderPreviewId(entry.id);');
    expect(modalHeaderSource).toContainSource("['outlines', '章纲']");
    expect(modalHeaderSource).toContainSource("['settings', '设定']");
    expect(modalHeaderSource).toContainSource("['roles', '角色']");
    expect(modalHeaderSource).not.toContainSource('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).not.toContainSource('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).toContainSource("setDetailOutlineReaderTab('outlines');");
    expect(panelSource).not.toContainSource("setDetailOutlineReaderTab('settings');");
    expect(readerAsideHeaderSource).toContainSource('WORKBENCH_FOLDER_GROUP_BUTTON_CLASS');
    expect(modalHeaderSource).toContainSource('onClick={selectAllActiveDetailOutlineReaderItems}');
    expect(modalHeaderSource).toContainSource('关联所有');
  });
  it('uses compact detail outline chapter number blocks without word count badges', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();

    expect(panelSource).toContainSource("import { ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';");
    expect(panelSource).toContainSource("const outlineWordCount = countTextWords(entry?.content ?? '');");
    expect(panelSource).toContainSource('const chapterContentWordCount = chapter.wordCount;');
    expect(panelSource).not.toContainSource("countTextWords(getChapterContent?.(chapter.id) ?? '')");
    expect(panelSource).toContainSource(
      "const outlineButtonState = chapterContentWordCount > 0 ? 'used' : hasSummary ? 'hasOutline' : 'empty';",
    );
    expect(panelSource).toContainSource('<ChapterNumberButton');
    expect(panelSource).toContainSource('state={outlineButtonState}');
    expect(chapterNumberButtonSource).toContainSource("if (state === 'used') return 'xy-detail-outline-number-used");
    expect(chapterNumberButtonSource).toContainSource(
      "if (state === 'hasOutline') return 'xy-detail-outline-number-has-outline",
    );
    expect(chapterNumberButtonSource).toContainSource("return 'xy-detail-outline-number-no-outline");
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(chapterNumberButtonSource).toContainSource('xy-detail-outline-number-block');
    expect(chapterNumberButtonSource).toContainSource('xy-detail-outline-number-white-bg');
    expect(panelSource).not.toContainSource('const outlineButtonStateClass = selected');
    expect(panelSource).not.toContainSource(
      "const outlineWordLabel = outlineWordCount > 0 ? `${outlineWordCount}字` : '无章纲';",
    );
    expect(panelSource).toContainSource("gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))'");
    expect(chapterNumberButtonSource).toContainSource(
      'relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block',
    );
    expect(panelSource).not.toContainSource(
      'relative grid h-[50px] w-[50px] place-items-center rounded-[13px] border text-center text-2xl font-black leading-none transition-colors',
    );
    expect(panelSource).not.toContainSource(
      "'border-[#8CEBC0] bg-[#EAFBF3] text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.16)]'",
    );
    expect(panelSource).not.toContainSource(
      ": 'border-[#FED7AA] bg-[#FFF7ED] text-slate-950 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]'",
    );
    expect(panelSource).not.toContainSource(
      "'border-slate-200 bg-white text-slate-900 hover:border-[#BBF7D0] hover:bg-[#F2FCF7]'",
    );
    expect(panelSource).not.toContainSource(
      ": 'border-slate-200 bg-white text-slate-400 hover:border-orange-200 hover:bg-orange-50/50'",
    );
    expect(panelSource).not.toContainSource('outlineBadgeClass');
    expect(panelSource).not.toContainSource("label: '有章纲'");
    const selectedStyle = styleSource.match(/\.xy-detail-outline-number-selected \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(selectedStyle).toContainSource('border-color: var(--xy-detail-outline-number-selected);');
    expect(selectedStyle).toContainSource('box-shadow:');
    expect(selectedStyle).not.toContainSource('background:');
    const whiteBgStyle = styleSource.match(/\.xy-detail-outline-number-white-bg \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(whiteBgStyle).toContainSource('background: #ffffff;');
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-used'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-has-outline'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-no-outline'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-selected')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-no-outline'),
    );
  });
  it('adds a detail outline published lane that follows published chapters and manual moves', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "const DETAIL_OUTLINE_PUBLISHED_GROUP_NAME = 'detail_outline_published_chapters';",
    );
    expect(panelSource).toContainSource(
      'const [showDetailOutlinePublished, setShowDetailOutlinePublished] = useState(false);',
    );
    expect(panelSource).toContainSource(
      'const [manualDetailOutlinePublishedChapterIds, setManualDetailOutlinePublishedChapterIds]',
    );
    expect(panelSource).toContainSource(
      'const isDetailOutlineChapterPublished = (chapter: Chapter) => Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);',
    );
    expect(panelSource).toContainSource(
      'const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);',
    );
    expect(panelSource).toContainSource(
      'const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);',
    );
    expect(panelSource).toContainSource('const moveDetailOutlineChapterToPublished = (chapterId: number) => {');
    expect(panelSource).toContainSource('const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {');
    expect(panelSource).toContainSource('if (chapter.isPublished) return;');
    expect(panelSource).toContainSource("showDetailOutlinePublished ? '收回已发布' : '展开已发布'");
    expect(panelSource).toContainSource('>已发布</span>');
    expect(panelSource).not.toContainSource('章纲已发布');
    expect(panelSource).toContainSource('暂无已发布章纲');
    expect(panelSource).toContainSource('移动到已发布');
    expect(panelSource).toContainSource('移回未发布');
  });
  it('keeps published detail outline volume groups synced even when no outline chapters are published', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource('renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)');
    expect(panelSource).toContainSource(
      'detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);',
    );
    expect(panelSource).not.toContainSource('detailOutlinePublishedCount === 0 ? (');
    expect(panelSource).toContainSource('volumes.length === 0 ? (');
  });
  it('removes the detail outline selection scheme test page after applying it to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('WorkbenchDetailOutlineSelectionStyleTestPage');
    expect(testCollectionSource).not.toContainSource('/workbench-detail-outline-selection-style-test');
    expect(testCollectionSource).not.toContainSource('Outline State');
    expect(testCollectionSource).not.toContainSource('章纲选中态方案测试');
  });
  it('keeps outline work settings and character settings as a left sidebar scope switch', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "const [outlineSettingScope, setOutlineSettingScope] = useState<'work' | 'character'>('work')",
    );
    expect(panelSource).not.toContainSource('{false && activeTab === SETTING_TAB');
    expect(panelSource).toContainSource('const visibleWorkSettingCount = settingEntries.filter');
    expect(panelSource).toContainSource('const visibleRoleCount = roleEntries.filter');
    expect(panelSource).toContainSource(
      "{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }",
    );
    expect(panelSource).toContainSource("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContainSource('settingWorkspaceTopTabs');
    expect(panelSource).toContainSource('const effectiveLibraryTab = isOutlineCharacterScope ? ROLE_TAB : activeTab');
    expect(panelSource).toContainSource(
      'const activeSettingTypeOptions = activeIsBrainstorm ? [BRAINSTORM_TYPE] : isOutlineCharacterScope ? roleTypeOptions : settingTypeOptions',
    );
    expect(panelSource).toContainSource('openSettingCreateDialog');
    expect(panelSource).toContainSource(
      'phaseActionsRef.current.addRole?.(selectedCreateType, { switchToRoleTab: false, title: createTitle })',
    );
    expect(panelSource).toContainSource('<RoleBaseStateEditor');
    expect(panelSource).toContainSource('baseSetting: string;');
    expect(panelSource).toContainSource('stateSettings: RoleStateSettings;');
    expect(panelSource).toContainSource('>基础设定<');
    expect(panelSource).toContainSource('>状态设定<');
    expect(panelSource).toContainSource('style={{ fontSize: roleTextFontSize }}');
  });
});
