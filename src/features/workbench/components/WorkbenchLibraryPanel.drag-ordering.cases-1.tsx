import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchLibraryPanelConstantsSource,
  readSharedStylesSource,
  readCombinedAiConfigSelectSource,
  readCapsuleSelectSource,
  readChapterEditorSource,
  readAiInlineInputSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel entry ordering behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('keeps the original model and prompt selectors around the floating dropdown', async () => {
    const source = await readCombinedAiConfigSelectSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContainSource('grid h-11 min-w-0 grid-cols-2 overflow-visible rounded-xl border-2 border-[#08AACE]');
    expect(source).toContainSource('<Settings className="h-3.5 w-3.5" />');
    expect(source).toContainSource('xy-combined-ai-config-label');
    expect(source).not.toContainSource('bg-[#F4F8FA] p-2');
    expect(styleSource).toContainSource('.xy-combined-ai-config-label,');
  });
  it('keeps model and prompt dropdowns flush with their selectors', async () => {
    const capsuleSource = await readCapsuleSelectSource();
    const combinedSource = await readCombinedAiConfigSelectSource();

    expect(capsuleSource).toContainSource('top: rect.bottom,');
    expect(capsuleSource).toContainSource('top-[calc(100%-2px)]');
    expect(capsuleSource).toContainSource('border-2 border-t-0 border-[#08AACE]');
    expect(capsuleSource).toContainSource('connectedDropdownOpen');
    expect(capsuleSource).toContainSource('border-b-transparent');
    expect(capsuleSource).toContainSource('shadow-[0_18px_34px_rgba(8,170,206,0.14)]');
    expect(capsuleSource).not.toContainSource('rect.bottom + 6');
    expect(capsuleSource).not.toContainSource('top-[calc(100%+6px)]');
    expect(combinedSource).toContainSource('absolute top-[calc(100%+0.5rem)] z-[10050]');
    expect(combinedSource).toContainSource('rounded-2xl border border-white bg-white p-1.5');
    expect(combinedSource).toContainSource('shadow-[0_20px_48px_rgba(15,23,42,0.15)]');
    expect(combinedSource).toContainSource(
      "openSegment === 'model' ? 'left-0 w-1/2' : 'right-0 w-1/2'",
    );
    expect(combinedSource).not.toContainSource('top-[calc(100%+6px)]');
    expect(combinedSource).not.toContainSource('rounded-xl border border-slate-200 bg-white py-1 shadow-2xl');
  });
  it('places preview word counts on the top-left border beside frame titles', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-count.xy-floating-count-top-left',
    );
    expect(styleSource).toContainSource('left: var(--xy-floating-count-left, 6.2rem);');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count.xy-floating-count-top-left::before');
    expect(styleSource).toContainSource('left: -1.2rem;');
    expect(styleSource).toContainSource('top: 0;');
    expect(panelSource).toContainSource('xy-floating-count xy-floating-count-top-left');
    expect(panelSource).toContainSource(
      "<label className={isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined}>",
    );
    expect(panelSource).toContainSource('<label aria-hidden="true" className="opacity-0">脑洞预览</label>');
    expect(panelSource).toContainSource('aria-label="脑洞名称"');
    expect(panelSource).toContainSource('onChange={(event) => onTitleChange(event.target.value)}');
    expect(panelSource).toContainSource(
      'xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none',
    );
    expect(panelSource).toContainSource('style={getFloatingTitleInputStyle(title, 3, 9)}');
    expect(panelSource).toContainSource('style={getFloatingTitleInputStyle(titleValue, 4, 12)}');
    expect(panelSource).toContainSource('<label className="xy-floating-title-count">');
    expect(panelSource).toContainSource(
      '<WordCountText value={countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} />',
    );
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate',
    );
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label.xy-floating-title-count');
    expect(styleSource).toContainSource('gap: 0.32rem;');
    expect(styleSource).toContainSource('.xy-floating-title-count > span');
    expect(styleSource).toContainSource('width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('border: 0 !important;');
    expect(styleSource).toContainSource('border-radius: 0 !important;');
    expect(styleSource).toContainSource('background: transparent !important;');
    expect(styleSource).toContainSource('padding: 0 !important;');
    expect(panelSource).toContainSource("'--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`");
    expect(styleSource).toContainSource('height: 20px;');
    expect(styleSource).toContainSource('align-items: baseline;');
    expect(styleSource).toContainSource('font-size: 1rem;');
    expect(styleSource).toContainSource('font-weight: 500;');
    expect(styleSource).toContainSource('line-height: 20px;');
    expect(styleSource).toContainSource('display: block !important;');
    expect(styleSource).toContainSource('min-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('max-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('height: 20px !important;');
    expect(styleSource).toContainSource('min-height: 0 !important;');
    expect(styleSource).toContainSource('line-height: 20px !important;');
    expect(styleSource).toContainSource('top: 0 !important;');
    expect(styleSource).toContainSource('transform: translateY(-50%) !important;');
    const brainstormPreviewFieldRuleStart = styleSource.indexOf(
      '.xy-floating-field.xy-brainstorm-preview-field textarea {',
    );
    const brainstormPreviewFieldRule = styleSource.slice(
      brainstormPreviewFieldRuleStart,
      styleSource.indexOf(
        '.xy-floating-field.xy-floating-outline-preview .xy-floating-rich-preview',
        brainstormPreviewFieldRuleStart,
      ),
    );
    expect(brainstormPreviewFieldRule).toContainSource('border-color: #111827;');
    expect(styleSource).toContainSource('margin-top: -0.375rem;');
    expect(styleSource).toContainSource('padding-top: 0.625rem;');
    const brainstormOutputTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-output-title-tool {');
    const brainstormOutputTitleToolRule = styleSource.slice(
      brainstormOutputTitleToolRuleStart,
      styleSource.indexOf(
        '.xy-brainstorm-floating-title-tool .xy-floating-title-input',
        brainstormOutputTitleToolRuleStart,
      ),
    );
    expect(brainstormOutputTitleToolRule).not.toContainSource('translateY(calc(-50% - 1px))');
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
    expect(brainstormTitleToolRule).toContainSource('background-image: linear-gradient(');
    expect(inlineTitleToolRule).toContainSource('background-color: transparent !important;');
    expect(inlineTitleToolRule).not.toContainSource('background: transparent !important;');
    expect(panelSource).not.toContainSource(
      '章纲：<WordCountText value={countTextWords(outlineCardContent)} compact />',
    );
  });
  it('keeps the brainstorm output action area shellless under the bordered frame', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const outputAreaStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const actionAreaStart = panelSource.indexOf('<AiInlineInput', outputAreaStart);
    const actionAreaEnd = panelSource.indexOf('</section>', actionAreaStart);
    const actionAreaSource = panelSource.slice(actionAreaStart, actionAreaEnd);

    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(actionAreaStart).toBeGreaterThan(outputAreaStart);
    expect(actionAreaEnd).toBeGreaterThan(actionAreaStart);
    expect(panelSource).toContainSource('grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2 p-4');
    expect(panelSource).toContainSource('<div className="min-h-0 space-y-3">');
    expect(panelSource).not.toContainSource('flex min-h-0 flex-1 flex-col gap-5 p-4');
    expect(actionAreaSource).not.toContainSource('shrink-0 rounded-xl border border-gray-200 bg-white p-3');
    expect(actionAreaSource).not.toContainSource('mt-3 flex items-center justify-between gap-2');
    expect(actionAreaSource).not.toContainSource('xy-animated-checkbox');
  });
  it('keeps brainstorm short-field labels in the border-floating style with enough top space', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).not.toContainSource('xy-brainstorm-short-field');
    expect(styleSource).not.toContainSource('.xy-floating-field.xy-brainstorm-short-field label');
    expect(panelSource).toContainSource(
      'xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2',
    );
    expect(panelSource).toContainSource('flex min-h-full flex-col gap-4 pt-2');
    expect(panelSource).toContainSource('height: `${Math.max(52, pairedRows * 20 + 32)}px`');
    expect(panelSource).toContainSource('minHeight: `${Math.max(180, questionRows * 20 + 52)}px`');
    expect(panelSource).toContainSource("height: '100%'");
    expect(styleSource).toContainSource('.xy-brainstorm-question-panel > div > div:last-child');
    expect(styleSource).toContainSource('flex: 1 1 180px;');
    expect(panelSource).not.toContainSource('Math.min(4, Math.max(1, rows))');
    expect(panelSource).not.toContainSource("overflowY: isLastField || questionRows >= 4 ? 'auto' : 'hidden'");
    expect(panelSource).not.toContainSource('flex min-h-[132px] flex-1 flex-col');
  });
  it('allows the brainstorm preview and output splitter to drag in both directions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;');
    expect(panelSource).toContainSource('const deltaX = (moveEvent.clientX - startX) / eventScale;');
    expect(panelSource).toContainSource('Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX)');
    expect(panelSource).toContainSource(
      'const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);',
    );
    expect(constantsSource).not.toContainSource('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 420;');
  });
  it('keeps setting and outline action sidebars wide enough to drag', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(constantsSource).toContainSource('export const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 560;');
    expect(panelSource).toContainSource('function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1)');
    expect(panelSource).toContainSource('const isSettingTab = tab === SETTING_TAB;');
    expect(panelSource).toContainSource(
      'const minWidth = isSettingTab ? SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH : SETTING_LIBRARY_LEFT_MIN_WIDTH;',
    );
    expect(panelSource).toContainSource('function getDetailOutlineLeftMinWidth(scaleValue = 1)');
    expect(panelSource).toContainSource(
      'const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);',
    );
    expect(panelSource).toContainSource('return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);');
    expect(panelSource).toContainSource(
      'if (tab === SETTING_TAB) return sharedNavigationWidth ? SETTING_LIBRARY_LEFT_MIN_WIDTH : SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH;',
    );
    expect(panelSource).toContainSource('return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB');
    expect(panelSource).toContainSource(
      'const isOutlineActionTab = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB;',
    );
    expect(panelSource).toContainSource('const viewportDivider = isSettingTab ? 2 : isOutlineActionTab ? 2.5 : 5;');
    expect(panelSource).toContainSource(
      'const viewportLimitWidth = Math.floor(window.innerWidth / normalizedScale / viewportDivider);',
    );
    expect(panelSource).toContainSource('return Math.max(');
    expect(panelSource).toContainSource('const fixedMaxWidth = isSettingTab');
    expect(panelSource).toContainSource('isOutlineActionTab');
    expect(panelSource).toContainSource('Math.min(fixedMaxWidth, viewportLimitWidth)');
    expect(panelSource).toContainSource(
      'const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale, readSharedWorkbenchLeftNavWidthEnabled());',
    );
    expect(panelSource).toContainSource(
      'const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));',
    );
    expect(panelSource).toContainSource('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
    expect(panelSource).toContainSource(
      'isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),',
    );
    expect(panelSource).toContainSource('const outlineSidebarWidth = settingLibraryLeftWidth;');
    expect(panelSource).toContainSource('gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished');
    expect(panelSource).toContainSource(
      '`${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`',
    );
    expect(panelSource).toContainSource(
      '`${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`',
    );
    expect(panelSource).toContainSource(
      "style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}",
    );
    expect(panelSource).toContainSource('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black');
    expect(panelSource).toContainSource("window.addEventListener('resize', syncVisibleLeftWidth);");
    expect(panelSource).not.toContainSource("window.addEventListener('resize', clampVisibleLeftWidth);");
    expect(panelSource).not.toContainSource(
      'const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : SETTING_LIBRARY_LEFT_MAX_WIDTH;',
    );
    expect(panelSource).not.toContainSource(
      'const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);',
    );
    expect(panelSource).not.toContainSource('const outlineSidebarWidth = Math.min(');
    expect(panelSource).not.toContainSource('OUTLINE_COLUMN_OPTIONS');
    expect(panelSource).not.toContainSource('loadOutlineColumns');
    expect(panelSource).not.toContainSource('每行显示');
    expect(panelSource).not.toContainSource('const OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH = 400;');
    expect(panelSource).not.toContainSource('function isOutlineLeftToolbarSafeTab(tab: string)');
    expect(panelSource).not.toContainSource('function getOutlineLeftMaxDisplayWidth(scaleValue = 1)');
    expect(panelSource).not.toContainSource('window.devicePixelRatio');
  });
  it('drags and restores the setting page left splitter width', () => {
    const storageKey = 'workbench-setting-left-resize-interaction-test';
    const widthStorageKey = `${storageKey}_大纲_left_width`;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });

    try {
      const { unmount } = render(
        <WorkbenchLibraryPanel
          storageKey={storageKey}
          tabs={['大纲', '角色', '脑洞']}
          emptyText="暂无内容"
          defaultActiveTab="大纲"
        />,
      );

      const leftSplitter = screen.getByTitle('拖拽调整左侧宽度');
      fireEvent.pointerDown(leftSplitter, { clientX: 100, pointerId: 1 });
      fireEvent.pointerMove(window, { clientX: 190 });
      fireEvent.pointerUp(window);

      const savedWidth = Number(localStorage.getItem(widthStorageKey));
      expect(savedWidth).toBeGreaterThan(180);
      expect(savedWidth).toBeLessThanOrEqual(640);

      unmount();
      render(
        <WorkbenchLibraryPanel
          storageKey={storageKey}
          tabs={['大纲', '角色', '脑洞']}
          emptyText="暂无内容"
          defaultActiveTab="大纲"
        />,
      );

      const restoredSplitter = screen.getByTitle('拖拽调整左侧宽度');
      expect(restoredSplitter.parentElement).toHaveStyle({
        gridTemplateColumns: `${savedWidth}px 0px minmax(0,1fr) 0px 430px`,
      });
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    }
  });
  it('uses border-embedded transparent backplates without rectangular white shadows', async () => {
    const styleSource = await readSharedStylesSource();
    const transparentBackplateStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview label');
    const transparentBackplateEnd = styleSource.indexOf(
      '.xy-floating-field.xy-floating-chat-shell',
      transparentBackplateStart,
    );
    const transparentBackplateSource = styleSource.slice(transparentBackplateStart, transparentBackplateEnd);
    const countRuleStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    const countRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count', countRuleStart);
    const countRuleSource = styleSource.slice(countRuleStart, countRuleEnd);
    const clearRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const clearRuleEnd = styleSource.indexOf(
      '.xy-floating-field.xy-floating-with-bottom-count textarea',
      clearRuleStart,
    );
    const clearRuleSource = styleSource.slice(clearRuleStart, clearRuleEnd);

    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate {');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate *');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count *');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count {');
    expect(styleSource).toContainSource('.xy-brainstorm-floating-title-tool::before,');
    expect(styleSource).toContainSource('.xy-brainstorm-output-title-tool::before');
    expect(styleSource).toContainSource('display: block !important;');
    expect(styleSource).toContainSource('.xy-brainstorm-output-preview-list {');
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource('padding: 0;');
    expect(transparentBackplateSource).toContainSource('background-color: transparent;');
    expect(transparentBackplateSource).toContainSource('text-shadow: none;');
    expect(transparentBackplateSource).toContainSource(
      '-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);',
    );
    expect(transparentBackplateSource).toContainSource('paint-order: stroke fill;');
    expect(transparentBackplateSource).toContainSource('isolation: isolate;');
    expect(transparentBackplateSource).toContainSource('background-image: linear-gradient(');
    expect(countRuleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview .xy-floating-count *');
    expect(countRuleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *',
    );
    expect(countRuleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(clearRuleSource).toContainSource('.xy-floating-outline-clear-button *');
    expect(clearRuleSource).toContainSource('background-color: transparent !important;');
    expect(clearRuleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(clearRuleSource).not.toContainSource('background: transparent !important;');
    expect(clearRuleSource).not.toContainSource('1px 0 0 #ffffff');
    expect(clearRuleSource).not.toContainSource('-1px 0 0 #ffffff');
  });
  it('explicitly marks border-embedded content with the transparent backplate class', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(panelSource).toContainSource('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate',
    );
    expect(chapterSource).toContainSource('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
  });
  it('keeps outline page text inputs protected from draggable overlays and decorative hit targets', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const aiInlineInputSource = await readAiInlineInputSource();
    const selectedSettingStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const selectedSettingSource = panelSource.slice(
      panelSource.lastIndexOf('<textarea', selectedSettingStart),
      selectedSettingStart,
    );
    const volumeStart = panelSource.indexOf('placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"');
    const volumeSource = panelSource.slice(panelSource.lastIndexOf('<textarea', volumeStart), volumeStart);
    const chapterStart = panelSource.indexOf('该章章纲会显示在这里，可由 AI 根据章节内容生成。');
    const chapterSource = panelSource.slice(panelSource.lastIndexOf('<textarea', chapterStart), chapterStart);
    const draftStart = panelSource.indexOf('生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。');
    const draftSource = panelSource.slice(panelSource.lastIndexOf('<textarea', draftStart), draftStart);

    expect(selectedSettingStart).toBeGreaterThan(-1);
    expect(volumeStart).toBeGreaterThan(-1);
    expect(chapterStart).toBeGreaterThan(-1);
    expect(draftStart).toBeGreaterThan(-1);
    expect(selectedSettingSource).toContainSource('data-no-modal-drag="true"');
    expect(volumeSource).toContainSource('data-no-modal-drag="true"');
    expect(chapterSource).toContainSource('data-no-modal-drag="true"');
    expect(draftSource).toContainSource('data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContainSource('<div data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContainSource("variant?: 'default' | 'neutral'");
    expect(aiInlineInputSource).toContainSource("variant = 'neutral'");
    expect(aiInlineInputSource).toContainSource("variant === 'neutral' ? 'xy-ai-inline-neutral' : ''");
    expect(aiInlineInputSource).toContainSource('<textarea\n        data-no-modal-drag="true"');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral.xy-floating-with-inline-actions textarea',
    );
    expect(styleSource).toContainSource('border-color: #d7dee8;');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-send',
    );
    expect(styleSource).toContainSource('color: #21B8DA;');
    expect(styleSource).toContainSource(
      '.xy-ai-inline-send {\n  flex: 1.12 1 0;\n  background: #ffffff;\n  color: #21B8DA;',
    );
    expect(styleSource).toContainSource('.writer-assistant-theme .xy-ai-inline-send {\n  color: #21B8DA;');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-stop {\n  border-left-color: #d7dee8;',
    );
    expect(styleSource).not.toContainSource(
      '.writer-assistant-theme .xy-ai-inline-stop {\n  border-left-color: var(--xy-wa-blue);',
    );
    expect(styleSource).not.toContainSource(
      '.xy-floating-field input,\n.xy-floating-field textarea {\n  position: relative;\n  z-index: 1;',
    );
    expect(styleSource).toContainSource('.xy-floating-field label.xy-border-embedded-transparent-backplate,');
    expect(styleSource).toContainSource(
      '.xy-floating-field label.xy-border-embedded-transparent-backplate {\n  position: absolute;',
    );
    expect(styleSource).toContainSource(
      '.xy-floating-field .xy-floating-outline-chapter-meta {\n  pointer-events: none;',
    );
  });
  it('removes the completed border transparent backplate placement test page', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('BorderBackplateApplicationTestPage');
    expect(testCollectionSource).not.toContainSource('/border-backplate-application-test');
    expect(testCollectionSource).not.toContainSource('边框透明背板应用预览');
  });
  it('persists manual setting order when dragging one setting entry before another', async () => {
    const storageKey = 'workbench-drag-sort-setting-entry-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-positioning',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-start',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-refreshing',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
        },
        {
          id: 'core-conflict',
          tab: '大纲',
          title: '自定义核心四',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心矛盾。' }),
          updatedAt: '2026/6/18 01:03:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定4');
    const source = screen.getByText('自定义核心四').closest('button');
    const target = screen.getByText('自定义核心一').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });
    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles.slice(0, 4)).toEqual(['自定义核心四', '自定义核心一', '自定义核心二', '自定义核心三']);
  });
  it('previews setting entry order while dragging over another entry', async () => {
    const storageKey = 'workbench-drag-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-one',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-two',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-three',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
        .filter((title): title is string => Boolean(title));

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);

    const source = screen.getByText('自定义核心二').closest('button');
    const target = screen.getByText('自定义核心一').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);

    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
});
