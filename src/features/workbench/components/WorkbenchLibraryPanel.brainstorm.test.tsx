import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  readWorkbenchLibraryPanelSource,
  readWorkbenchLibraryPanelConstantsSource,
  readWorkbenchLibrarySidebarSource,
  readSharedStylesSource,
  readChapterEditorSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel brainstorm flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores only setting and brainstorm sidebar rows to the original white card style', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const chapterSidebarSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'ChapterSidebar.tsx'),
      'utf8',
    );
    const chapterNavigationStylesSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'chapterNavigationStyles.ts'),
      'utf8',
    );
    const settingSidebarStart = sidebarSource.indexOf(
      'className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"',
    );
    const settingSidebarSource = sidebarSource.slice(settingSidebarStart);

    expect(settingSidebarStart).toBeGreaterThan(-1);
    expect(settingSidebarSource).toContainSource(
      'className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"',
    );
    expect(settingSidebarSource).toContainSource(
      'xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto space-y-1',
    );
    expect(settingSidebarSource).toContainSource('className="mt-0.5 space-y-0.5"');
    expect(chapterSidebarSource).toContainSource('className="editor-scrollbar flex-1 overflow-y-auto px-1 py-2"');
    expect(chapterSidebarSource).toContainSource('className={`xy-chapter-sidebar-row ${CHAPTER_NAV_ROW_BASE_CLASS}');
    expect(chapterNavigationStylesSource).toContainSource(
      'group relative flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-md border-2 px-3 py-2',
    );
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full",
    );
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[38px] w-full rounded-xl",
    );
    expect(panelSource).toContainSource('className="flex w-full items-center gap-2"');
    expect(panelSource).toContainSource("activeIsBrainstorm ? '' : 'pl-3'");
    expect(panelSource).toContainSource(
      'className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]"',
    );
    expect(settingSidebarSource).not.toContainSource('bg-gray-50 px-3 py-3');
    expect(settingSidebarSource).not.toContainSource('xy-setting-sidebar-scrollbar scrollbar-scroll-only');
    expect(settingSidebarSource).not.toContainSource('scrollbar-half-width min-h-0 flex-1 overflow-y-auto space-y-1');
    expect(settingSidebarSource).not.toContainSource('space-y-0.5 overflow-y-auto pr-1');
    expect(settingSidebarSource).not.toContainSource('max-h-[760px] space-y-0.5 overflow-y-auto');
    expect(settingSidebarSource).not.toContainSource('setting-group:${effectiveLibraryTab}:${group.type}');
  });

  it('shows persistent brainstorm numbers and provides manual compact sorting above recycle bin', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(sidebarSource).toContainSource('{entry.brainstormSerialNumber ?? previewIndex + 1}');
    expect(sidebarSource).not.toContainSource('{entry.brainstormSerialNumber ?? previewIndex + 1}号');
    expect(sidebarSource).toContainSource('className="-ml-1 shrink-0 text-sm font-black text-[#08AACE]"');
    expect(sidebarSource).toContainSource('脑洞排序');
    expect(sidebarSource).toContainSource('resequenceBrainstormEntries(brainstormEntries)');
    expect(sidebarSource.indexOf('脑洞排序')).toBeLessThan(sidebarSource.indexOf('脑洞回收站'));
    expect(panelSource).toContainSource('brainstormSerialNumberIsUsed');
    expect(panelSource).toContainSource('nextBrainstormSerialNumber');
  });

  it('does not render the internal setting role brainstorm tabs and shows the requested brainstorm page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource('这里显示选中的脑洞内容，也可以直接编辑。');
    expect(panelSource).toContainSource('defaultActiveTab');
    expect(panelSource).not.toContainSource("tabs={['设定', '角色', '脑洞']}");
  });

  it('renders outline linked context as current, other-setting, or brainstorm segmented control', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const linkControlStart = panelSource.indexOf(
      "title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}",
    );
    const linkControlSource = panelSource.slice(
      panelSource.lastIndexOf('<div className="xy-ai-panel-link-row flex min-w-0 items-center gap-1.5">', linkControlStart),
      panelSource.indexOf('<div className="xy-ai-panel-input-row">', linkControlStart),
    );

    expect(linkControlStart).toBeGreaterThan(-1);
    expect(panelSource).toContainSource("settingLinkSource?: 'current' | 'other' | 'brainstorm' | null;");
    expect(panelSource).toContainSource('associationSessionId?: string | null;');
    expect(panelSource).toContainSource('linkedOtherSettingIds?: string[];');
    expect(panelSource).toContainSource('getWorkbenchAssociationRuntimeId');
    expect(panelSource).toContainSource('isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)');
    expect(panelSource).toContainSource("settingLinkSource: 'brainstorm'");
    expect(panelSource).toContainSource('promptDisabled: false');
    expect(panelSource).toContainSource("settingLinkSource: 'current'");
    expect(panelSource).toContainSource("settingLinkSource: selectedIds.length > 0 ? 'other' : null");
    expect(panelSource).toContainSource('const getActiveLinkedSettingSnapshot = () => {');
    expect(panelSource).toContainSource("source === 'current'");
    expect(panelSource).toContainSource("source === 'other'");
    expect(panelSource).toContainSource('buildCurrentSettingLinkedContext({');
    expect(panelSource).toContainSource(
      'body: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) :',
    );
    expect(linkControlSource).toContainSource('关联');
    expect(linkControlSource).toContainSource('当前设定');
    expect(linkControlSource).toContainSource('其他设定');
    expect(linkControlSource).toContainSource('脑洞');
    expect(linkControlSource).not.toContainSource('if (isOutlineCharacterScope) return;');
    expect(linkControlSource).not.toContainSource('disabled={isOutlineCharacterScope}');
    expect(linkControlSource).toContainSource('关联脑洞库内容到人物设定');
    expect(linkControlSource).toContainSource('openOtherSettingReader');
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'current'");
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'other'");
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'brainstorm'");
    const brainstormControlIndex = linkControlSource.indexOf(
      "title={isOutlineCharacterScope ? '关联脑洞库内容到人物设定' : '关联脑洞库内容'}",
    );
    const trailingClearIndex = linkControlSource.indexOf(
      "(activeSettingLinkSource === 'other' || activeSettingLinkSource === 'brainstorm')",
    );
    expect(brainstormControlIndex).toBeGreaterThan(-1);
    expect(trailingClearIndex).toBeGreaterThan(brainstormControlIndex);
    expect(linkControlSource).toContainSource(
      "title={activeSettingLinkSource === 'other' ? '取消关联其他设定' : '取消关联脑洞'}",
    );
    expect(linkControlSource).toContainSource(
      'updateActiveTabConfig({ associationSessionId: null, settingLinkSource: null, promptDisabled: false })',
    );
    expect(linkControlSource).toContainSource('loadedBrainstormId: null');
    expect(linkControlSource).toContainSource('linkedOtherSettingIds: []');
    expect(linkControlSource).toContainSource('promptDisabled: true');
    expect(linkControlSource).toContainSource('关联 <WordCountText value={linkedSettingWordCount} compact />');
    expect(linkControlSource).not.toContainSource('label="关联脑洞"');
    expect(linkControlSource).not.toContainSource('linkedLabel="已关联脑洞"');
    expect(panelSource).toContainSource('const OTHER_SETTING_LINK_TABS');
    expect(panelSource).toContainSource('关联其他设定');
    const otherSettingModalStart = panelSource.indexOf('const otherSettingReaderModal = (');
    const otherSettingModalSource = panelSource.slice(
      otherSettingModalStart,
      panelSource.indexOf('const brainstormEntries = entries.filter', otherSettingModalStart),
    );
    expect(otherSettingModalStart).toBeGreaterThan(-1);
    expect(otherSettingModalSource).toContainSource('<OtherSettingReaderModal');
    expect(otherSettingModalSource).toContainSource('selectAllCurrentOtherSettingLinkTab');
    expect(otherSettingModalSource).toContainSource('toggleVisibleOtherSettingLinkGroupSelection');
    expect(panelSource).toContainSource('关联所有');
    expect(panelSource).toContainSource('全选');
    expect(panelSource).toContainSource('<AssociationReaderItemRow');
    expect(panelSource).toContainSource('onToggle={() => onToggleEntry(entry.id)}');
    expect(panelSource).toContainSource("draftIds.has(selectedEntry.id) ? '已勾选' : '未勾选'");
    expect(otherSettingModalSource).not.toContainSource('关联此项');
    expect(otherSettingModalSource).not.toContainSource('selectedOtherSettingLinkEntry.tabTitle');
    expect(otherSettingModalSource).not.toContainSource('selectedOtherSettingLinkEntry.type} ·');
    expect(panelSource).toContainSource("rawContent.startsWith('{') ? '' : entry.content");
    expect(panelSource).toContainSource('作品设定');
    expect(panelSource).toContainSource('人物设定');
    expect(panelSource).toContainSource('势力设定');
    expect(panelSource).toContainSource('道具资源');
    expect(panelSource).toContainSource('怪物图鉴');
    expect(panelSource).toContainSource('伏笔线索');
    expect(panelSource).toContainSource("usage: '参考资料'");
    expect(panelSource).toContainSource('const isPromptDisabledForRequest = activeTab === SETTING_TAB');
    expect(panelSource).toContainSource(
      "outlineSettingScope !== 'character' && getActiveSettingLinkSource() === 'current'",
    );
    expect(panelSource).toContainSource('const effectivePromptDisabled = activeTab === SETTING_TAB');
    expect(panelSource).toContainSource("!isOutlineCharacterScope && activeSettingLinkSource === 'current'");
    expect(panelSource).toContainSource('promptDisabled={effectivePromptDisabled}');
    expect(panelSource).not.toContainSource('autoDisablePromptOnCurrentLink');
    expect(panelSource).not.toContainSource('关联当前时自动禁用提示词');
  });

  it('places brainstorm output clear action in the save action group and font tools in the header slot', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const brainstormPreviewStart = panelSource.indexOf('placeholder="这里显示选中的脑洞内容，也可以直接编辑。"');
    const brainstormPreviewEnd = panelSource.indexOf('</main>', brainstormPreviewStart);
    const brainstormPreviewSource = panelSource.slice(brainstormPreviewStart, brainstormPreviewEnd);
    const brainstormOutputStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const brainstormOutputEnd = panelSource.indexOf(
      'className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"',
      brainstormOutputStart,
    );
    const brainstormOutputSource = panelSource.slice(brainstormOutputStart, brainstormOutputEnd);
    const actionGroupStart = panelSource.indexOf(
      '<div className="flex min-w-0 flex-wrap items-center gap-2">',
      brainstormOutputEnd,
    );
    const actionGroupSource = panelSource.slice(
      actionGroupStart,
      panelSource.indexOf('{settingLibraryMode ===', actionGroupStart),
    );

    expect(panelSource).not.toContainSource('xy-floating-brainstorm-output-action-tool');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContainSource('替换当前脑洞');
    expect(actionGroupSource).not.toContainSource('替换脑洞');
    expect(actionGroupSource).toContainSource('保存为新脑洞');
    expect(actionGroupSource).toContainSource('复制脑洞');
    expect(actionGroupSource).toContainSource('清空脑洞');
    expect(actionGroupSource).toContainSource('onClick={onCopy}');
    expect(actionGroupSource).toContainSource('disabled={!outputValue.trim()}');
    expect(actionGroupSource).toContainSource('onClick={onClear}');
    expect(actionGroupSource).toContainSource('disabled={!outputValue.trim() && !isLoading}');
    expect(panelSource).toContainSource('onCopy={copyBrainstormOutputArea}');
    expect(panelSource).toContainSource('onClear={clearBrainstormOutputArea}');
    expect(actionGroupSource).not.toContainSource('onClick={clearLibraryAiDialog}');
    expect(panelSource).toContainSource('const clearBrainstormOutputArea = () => {');
    expect(panelSource).toContainSource('const copyBrainstormOutputArea = () => {');
    expect(panelSource).toContainSource('void navigator.clipboard.writeText(outputText);');
    expect(panelSource).toContainSource('if (activeTab !== BRAINSTORM_TAB) return;');
    expect(panelSource).toContainSource("output: '',");
    expect(panelSource).toContainSource("result: '',");
    expect(actionGroupSource).not.toContainSource('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).toContainSource(
      "const [activeLibraryFontTarget, setActiveLibraryFontTarget] = useState<LibraryFontTarget>('brainstormOutput');",
    );
    expect(panelSource).toContainSource('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContainSource("if (activeLibraryFontTarget === 'brainstormPreview')");
    expect(panelSource).toContainSource('className="xy-header-stream-tool"');
    expect(panelSource).toContainSource("ariaLabel: 'AI输出字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}");
    expect(panelSource).toContainSource("onFocusOutput={() => setActiveLibraryFontTarget('brainstormOutput')}");
    expect(panelSource).toContainSource('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(brainstormPreviewSource).not.toContainSource('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContainSource('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContainSource('xy-floating-border-stream-tool');
    expect(panelSource).toContainSource('className="xy-stream-toggle-text">流式输出</span>');
    expect(panelSource).toContainSource('className="xy-stream-toggle-track"');
    expect(panelSource).toContainSource('className="xy-stream-toggle-thumb"');
    expect(panelSource).toContainSource('onBrainstormStreamEnabledChange(event.target.checked)');
    expect(panelSource).toContainSource('updateActiveTabConfig({ brainstormStreamEnabled: enabled })');
    expect(panelSource).not.toContainSource('xy-floating-brainstorm-output-font-tool');
    expect(panelSource).not.toContainSource('<span>流式输出</span>');
    expect(styleSource).toContainSource('.xy-floating-border-stream-tool {');
    expect(styleSource).toContainSource('.xy-header-stream-tool {');
    expect(styleSource).toContainSource('.xy-stream-toggle-text {');
    expect(styleSource).toContainSource('height: 1.76rem;');
    expect(styleSource).toContainSource('height: 2.25rem;');
    expect(styleSource).toContainSource('background: #ffffff;');
    expect(styleSource).toContainSource('width: 2.02rem;');
    expect(styleSource).toContainSource('.xy-stream-toggle-track {');
    expect(styleSource).toContainSource('background: #08AACE;');
  });

  it('uses a dark brainstorm request border and keeps the request input close to AI output', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContainSource('className="xy-brainstorm-ai-input"');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-brainstorm-ai-input.xy-floating-with-inline-actions textarea',
    );
    expect(styleSource).toContainSource('border-color: #111827;');
    expect(styleSource).toContainSource('.xy-brainstorm-output-preview-list {');
    expect(styleSource).toContainSource('padding-bottom: 0.25rem;');
    expect(styleSource).not.toContainSource('padding-bottom: 1.25rem;');
  });

  it('uses setting-name typography for brainstorm question fields and titles', async () => {
    const workspaceSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(workspaceSource).toContainSource('xy-brainstorm-question-field');
    expect(styleSource).toContainSource('.xy-floating-field.xy-brainstorm-question-field textarea {');
    expect(styleSource).toContainSource('font-size: 1rem !important;');
    expect(styleSource).toContainSource('font-weight: 500 !important;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-brainstorm-question-field textarea::placeholder {');
    expect(styleSource).toContainSource('color: #020617;');
    expect(styleSource).toContainSource('opacity: 1;');
    expect(workspaceSource).toContainSource('className="font-medium leading-5"');
    expect(workspaceSource).not.toContainSource('className="font-bold leading-5"');
    expect(styleSource).toContainSource('.xy-brainstorm-floating-title-tool .xy-floating-title-input,');
    expect(styleSource).toContainSource('font-weight: 900 !important;');
    expect(styleSource).toContainSource('.xy-combined-ai-config-frame {');
    expect(styleSource).toContainSource('border-color: #08aace !important;');
    expect(testCollectionSource).not.toContainSource('BrainstormTypographyConsistencyTestPage');
    expect(testCollectionSource).not.toContainSource('/brainstorm-typography-consistency-test');
    expect(testCollectionSource).not.toContainSource('16号测试：脑洞页面字体统一');
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

    expect(panelSource).not.toContainSource('const renderBrainstormAiSessionControls');
    expect(panelSource).not.toContainSource('renderBrainstormAiSessionControls()');
    expect(panelSource).not.toContainSource('addBrainstormAiSession');
    expect(panelSource).not.toContainSource('selectBrainstormAiSession');
  });

  it('uses a single clear button for brainstorm output actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).not.toContainSource('.xy-floating-brainstorm-output-action-tool {');
    expect(styleSource).not.toContainSource('.xy-floating-edge-tool.xy-floating-brainstorm-session-tool');
    const outputListStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const outputListEnd = panelSource.indexOf('className="min-h-0 space-y-3"', outputListStart);
    const outputListSource = panelSource.slice(outputListStart, outputListEnd);
    const actionGroupStart = panelSource.indexOf(
      '<div className="flex min-w-0 flex-wrap items-center gap-2">',
      outputListEnd,
    );
    const actionGroupSource = panelSource.slice(actionGroupStart, panelSource.indexOf('</section>', actionGroupStart));

    expect(outputListSource).not.toContainSource('清空脑洞');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContainSource('替换当前脑洞');
    expect(actionGroupSource).toContainSource('保存为新脑洞');
    expect(actionGroupSource).toContainSource('复制脑洞');
    expect(actionGroupSource).toContainSource('清空脑洞');
    expect(actionGroupSource).toContainSource('onClick={onCopy}');
    expect(actionGroupSource).toContainSource('onClick={onClear}');
    expect(actionGroupSource).not.toContainSource('onClick={clearLibraryAiDialog}');
    expect(actionGroupSource).not.toContainSource('删除');
    expect(actionGroupSource).not.toContainSource('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).not.toContainSource(
      'px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900',
    );
  });

  it('keeps the brainstorm question panel fixed without scrollbar layout classes', async () => {
    const source = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContainSource('xy-brainstorm-question-panel');
    expect(source).toContainSource(
      'xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2',
    );
    expect(source).toContainSource('flex min-h-full flex-col gap-4 pt-2');
    expect(source).toContainSource('grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700');
    expect(source).not.toContainSource(
      'xy-brainstorm-question-panel editor-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white p-3',
    );
    expect(source).not.toContainSource('xy-brainstorm-count-options');
    expect(source).not.toContainSource(
      'editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3',
    );
    expect(source).not.toContainSource('flex h-[60px] items-center gap-2 px-4 pt-3');
    expect(styleSource).toContainSource(
      '.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label::before',
    );
    expect(styleSource).toContainSource(
      '.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label,',
    );
    expect(styleSource).toContainSource('font-size: 1rem;');
    expect(styleSource).toContainSource('font-weight: 500;');
    expect(styleSource).toContainSource('line-height: 20px;');
  });

  it('records the reusable shellless panel technique for brainstorm fields', async () => {
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-shellless-panel {');
    expect(styleSource).toContainSource('border: 0;');
    expect(styleSource).toContainSource('border-radius: 0;');
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource('box-shadow: none;');
  });

  it('renders brainstorm count as a sequential-only segmented button group aligned to the input left edge', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const countButtonStart = panelSource.indexOf("{['3', '5', '10'].map((value) => {");
    const generateButtonStart = panelSource.indexOf('onClick={onGenerate}', countButtonStart);
    const countButtonSource = panelSource.slice(countButtonStart, generateButtonStart);

    expect(countButtonStart).toBeGreaterThan(-1);
    expect(generateButtonStart).toBeGreaterThan(countButtonStart);
    expect(panelSource).not.toContainSource('xy-brainstorm-count-field');
    expect(panelSource).not.toContainSource('xy-brainstorm-count-options');
    expect(panelSource).toContainSource('逐个生成几个脑洞');
    expect(panelSource).not.toContainSource('一次生成几个脑洞');
    expect(panelSource).not.toContainSource("['sequential', '逐个']");
    expect(panelSource).not.toContainSource("['batch', '一次']");
    expect(panelSource).not.toContainSource('brainstormGenerateMode');
    expect(panelSource).toContainSource('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).toContainSource("{isLoading ? '生成中...' : '逐个生成'}");
    expect(panelSource).toContainSource('onGenerate={openBrainstormGenerateConfirm}');
    expect(panelSource).not.toContainSource(
      '<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>',
    );
    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('<div className="flex min-w-0 flex-1 items-center gap-2">');
    expect(panelSource).toContainSource(
      'flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white',
    );
    expect(countButtonSource).toContainSource("onFieldChange('brainstormCount', active ? '' : value)");
    expect(countButtonSource).toContainSource('last:border-r-0');
    expect(countButtonSource).not.toContainSource("'1'");
    expect(countButtonSource).not.toContainSource("'2'");
    expect(countButtonSource).not.toContainSource('3个');
  });

  it('keeps brainstorm request headers out of visible generated output', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const buildStart = panelSource.indexOf(
      'const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {',
    );
    const buildEnd = panelSource.indexOf('const openBrainstormGenerateConfirm = () => {', buildStart);
    const buildSource = panelSource.slice(buildStart, buildEnd);
    const latestUsefulStart = panelSource.indexOf('function getLatestUsefulAiText(content: string)');
    const latestUsefulEnd = panelSource.indexOf('function getBrainstormEntryBody', latestUsefulStart);
    const latestUsefulSource = panelSource.slice(latestUsefulStart, latestUsefulEnd);

    expect(panelSource).toContainSource(
      "const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION = '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';",
    );
    expect(panelSource).toContainSource("const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';");
    expect(panelSource).toContainSource("const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';");
    expect(panelSource).toContainSource(
      "const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';",
    );
    expect(panelSource).toContainSource(
      "const BRAINSTORM_GENERATE_RULE_TEXT = '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';",
    );
    expect(panelSource).toContainSource('function stripBrainstormRequestHeader(content: string)');
    expect(panelSource).toContainSource('function isBrainstormEchoedRequest(content: string, requestText: string)');
    expect(panelSource).toContainSource('function getBrainstormOtherRequirementsBlock(requestText: string)');
    expect(panelSource).toContainSource('function getBrainstormDisplayContent(content: string, requestText: string)');
    expect(panelSource).toContainSource(
      'const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();',
    );
    expect(panelSource).toContainSource(
      "? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\\n\\n')",
    );
    expect(panelSource).toContainSource('options: { visibleText?: string; previewCount?: number } = {},');
    expect(panelSource).toContainSource('const visibleUserText = (options.visibleText ?? text).trim();');
    expect(panelSource).toContainSource('const visibleText = stripBrainstormRequestHeader(promptText);');
    expect(panelSource).toContainSource('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(panelSource).toContainSource(
      'const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());',
    );
    expect(panelSource).toContainSource("target: 'workbenchLibraryAi'");
    expect(panelSource).toContainSource('function getBrainstormBackgroundTaskResult(task: BackgroundAiTask)');
    expect(panelSource).toContainSource(
      'const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));',
    );
    expect(panelSource).toContainSource('output === request || output === otherRequirements');
    expect(panelSource).toContainSource('? getBrainstormDisplayContent(content, requestText)');
    expect(panelSource).toContainSource('【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。');
    expect(panelSource).toContainSource('【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。');
    expect(panelSource).toContainSource(
      "emit(replacePendingOutput(`【错误】${message}`), { replace: true, progressLabel: '失败' });",
    );
    expect(latestUsefulSource).toContainSource("if (turns.length > 0) return '';");
    expect(buildSource).toContainSource('BRAINSTORM_GENERATE_TASK_TEXT');
    expect(buildSource).toContainSource('BRAINSTORM_GENERATE_RULE_TEXT');
    expect(buildSource).toContainSource('BRAINSTORM_OTHER_REQUIREMENTS_HEADER');
    expect(buildSource).not.toContainSource('BRAINSTORM_REQUEST_HEADER');
    expect(buildSource).not.toContainSource('【用户要求】');
    expect(panelSource).not.toContainSource('void sendLibraryAiMessage(promptText);');
  });

  it('locks brainstorm output box count to the requested generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const confirmStart = panelSource.indexOf('const confirmBrainstormGenerate = () => {');
    const confirmEnd = panelSource.indexOf('const addRoleTypeByName', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);
    const previewStart = panelSource.indexOf('const brainstormOutputPreviewCount = activeIsBrainstorm');
    const previewEnd = panelSource.indexOf('const brainstormOutputSplitParts', previewStart);
    const previewSource = panelSource.slice(previewStart, previewEnd);

    expect(panelSource).toContainSource('previewCount?: number;');
    expect(confirmSource).toContainSource(
      'const previewCount = getBrainstormOutputCount(brainstormGenerateDraft.brainstormCount);',
    );
    expect(confirmSource).not.toContainSource('generationMode');
    expect(confirmSource).toContainSource('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(confirmSource).not.toContainSource('setBrainstormQuestionDraft(EMPTY_BRAINSTORM_QUESTION_DRAFT)');
    expect(previewSource).toContainSource(
      'activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)',
    );
    expect(panelSource).toContainSource('previewCount: targetBrainstormPreviewCount');
  });

  it('generates multiple brainstorm outputs sequentially without a batch mode', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const sendStart = panelSource.indexOf('const sendLibraryAiMessage = async (');
    const sendEnd = panelSource.indexOf('const stopLibraryAiMessage = () => {', sendStart);
    const sendSource = panelSource.slice(sendStart, sendEnd);

    expect(panelSource).not.toContainSource('BrainstormGenerateMode');
    expect(panelSource).not.toContainSource('brainstormGenerateMode');
    expect(panelSource).not.toContainSource("targetBrainstormGenerateMode === 'batch'");
    expect(panelSource).toContainSource(
      'function buildSequentialBrainstormRequestText(baseRequestText: string, index: number, total: number, completedItems: string[])',
    );
    expect(panelSource).toContainSource(
      "function formatSequentialBrainstormOutput(completedItems: string[], activeIndex?: number, activeContent = '')",
    );
    expect(sendSource).toContainSource('const shouldGenerateBrainstormSequentially = targetTab === BRAINSTORM_TAB');
    expect(sendSource).not.toContainSource('targetBrainstormGenerateMode');
    expect(sendSource).not.toContainSource('generationMode');
    expect(sendSource).toContainSource('for (let index = 1; index <= targetBrainstormPreviewCount; index += 1)');
    expect(sendSource).toContainSource(
      'const itemRequestText = buildSequentialBrainstormRequestText(requestText, index, targetBrainstormPreviewCount, completedItems);',
    );
    expect(sendSource).toContainSource('userContent: itemRequestText');
    expect(sendSource).toContainSource('completedItems.push(stripAiThinkingBlock(itemDisplayContent));');
    expect(sendSource).toContainSource(
      'return replacePendingOutput(formatSequentialBrainstormOutput(completedItems));',
    );
  });

  it('keeps linked brainstorm preview focused on the item content without redundant metadata cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('项目类型');
    expect(panelSource).not.toContainSource('关联方式');
    expect(panelSource).not.toContainSource('关联后会作为完整脑洞项目随本次请求发送给 AI。');
  });

  it('keeps brainstorm count buttons compact while the generate button stays on the right', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black');
    expect(panelSource).toContainSource(
      'h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white',
    );
    expect(styleSource).not.toContainSource('.xy-brainstorm-count-field');
    expect(styleSource).not.toContainSource('.xy-brainstorm-count-options');
  });

  it('uses editable temporary brainstorm output previews driven by generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryClickStart = panelSource.indexOf('onClick={() => {');
    const entryClickEnd = panelSource.indexOf('onDoubleClick={() =>', entryClickStart);
    const entryClickSource = panelSource.slice(entryClickStart, entryClickEnd);

    expect(panelSource).toContainSource('previewTitles?: string[];');
    expect(panelSource).toContainSource('previewDrafts?: string[];');
    expect(panelSource).toContainSource('previewSelectedIndexes?: number[];');
    expect(panelSource).toContainSource('previewCount?: number;');
    expect(panelSource).toContainSource(
      'function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[])',
    );
    expect(panelSource).toContainSource('function getBrainstormOutputCount(value: string)');
    expect(panelSource).toContainSource("return 'AI输出';");
    expect(panelSource).not.toContainSource('return `${index + 1}号脑洞`;');
    expect(panelSource).not.toContainSource('return `脑洞输出框${index + 1}`;');
    expect(panelSource).not.toContainSource('return `新脑洞${index + 1}`;');
    expect(panelSource).toContainSource('const getNextBrainstormTitles = (count: number) => {');
    expect(panelSource).toContainSource(
      'return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);',
    );
    expect(panelSource).toContainSource('const nextTitles = getNextBrainstormTitles(previews.length);');
    expect(panelSource).toContainSource('const previews = getCurrentBrainstormOutputPreviews(true);');
    expect(panelSource).toContainSource(
      'createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle())',
    );
    expect(panelSource).not.toContainSource(
      'createWorkbenchLibraryEntry(BRAINSTORM_TAB, preview.title || getNextBrainstormTitle())',
    );
    expect(panelSource).toContainSource('function splitBrainstormGeneratedText(text: string, count: number)');
    expect(panelSource).toContainSource(
      'activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)',
    );
    expect(panelSource).toContainSource('const brainstormOutputPreviews = Array.from(');
    expect(panelSource).toContainSource('{ length: brainstormOutputPreviewCount }');
    expect(panelSource).toContainSource(
      "(_, index) => activeBrainstormAiSession?.previewDrafts?.[index] ?? brainstormOutputSplitParts[index] ?? ''",
    );
    expect(panelSource).toContainSource('const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(');
    expect(panelSource).toContainSource(
      'const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);',
    );
    expect(panelSource).toContainSource('const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes');
    expect(panelSource).toContainSource(
      'const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;',
    );
    expect(panelSource).toContainSource('{previews.map((previewValue, index) => {');
    expect(panelSource).toContainSource('role="checkbox"');
    expect(panelSource).toContainSource('aria-checked={outputChecked}');
    expect(panelSource).toContainSource('onClick={() => onToggleSelected(index)}');
    expect(panelSource).toContainSource('aria-label={`AI输出名称 ${index + 1}`}');
    expect(panelSource).toContainSource('onChange={(event) => onTitleChange(index, event.target.value)}');
    expect(panelSource).toContainSource('previewCount: targetBrainstormPreviewCount');
    expect(panelSource).toContainSource('disabled={!currentEntryId || selectedCount !== 1}');
    expect(panelSource).toContainSource('disabled={selectedCount === 0}');
    expect(panelSource).toContainSource('clearStoredBrainstormAiSessionPreviews(storageKey);');
    expect(panelSource).not.toContainSource("currentSelectedEntry.title || '未命名脑洞'");
    expect(entryClickSource).not.toContainSource('setAiResult(getBrainstormEntryBody(entry));');
  });

  it('uses short brainstorm genre and theme placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("placeholder: '如都市、玄幻'");
    expect(panelSource).toContainSource("placeholder: '如系统流'");
    expect(panelSource).not.toContainSource('如都市高武、玄幻、仙侠、科幻');
    expect(panelSource).not.toContainSource('如系统流、凡人流');
  });

  it('aligns brainstorm generator fields with the model prompt selector', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const brainstormPanelStart = panelSource.indexOf('<div className="flex max-w-full items-start gap-2">');
    const brainstormPanelEnd = panelSource.indexOf(
      ') : (',
      panelSource.indexOf('xy-brainstorm-question-panel', brainstormPanelStart),
    );
    const brainstormPanelSource = panelSource.slice(brainstormPanelStart, brainstormPanelEnd);

    expect(brainstormPanelStart).toBeGreaterThan(-1);
    expect(brainstormPanelEnd).toBeGreaterThan(brainstormPanelStart);
    expect(brainstormPanelSource).toContainSource("className={activeIsBrainstorm ? 'w-full' : undefined}");
    expect(brainstormPanelSource).toContainSource("width: '100%'");
    expect(brainstormPanelSource).toContainSource('<div className="flex max-w-full items-start gap-2">');
    expect(brainstormPanelSource).not.toContainSource('items-start justify-end gap-2');
    expect(brainstormPanelSource).toContainSource(
      '<div key="brainstorm-genre-background-row" className="grid shrink-0 grid-cols-2 gap-4',
    );
    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).not.toContainSource(
      '<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>',
    );
  });

  it('uses the brainstorm library gray background for chapter directory sidebars', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource("isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'");
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50">',
    );
    expect(chapterSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(chapterSource).not.toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-1 py-2">',
    );
  });

  it('uses the selected danger recycle button style for the brainstorm recycle entry', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const recycleButtonAnchor = sidebarSource.indexOf('setIsBrainstormRecycleOpen(true)');
    const recycleButtonStart = sidebarSource.lastIndexOf('<button', recycleButtonAnchor);
    const recycleButtonEnd = sidebarSource.indexOf('</button>', recycleButtonAnchor);
    const recycleButtonSource = sidebarSource.slice(recycleButtonStart, recycleButtonEnd);

    expect(recycleButtonAnchor).toBeGreaterThan(-1);
    expect(recycleButtonStart).toBeGreaterThan(-1);
    expect(recycleButtonEnd).toBeGreaterThan(recycleButtonStart);
    expect(recycleButtonSource).toContainSource('border border-red-100 bg-red-50');
    expect(recycleButtonSource).toContainSource('hover:border-red-200 hover:bg-red-100');
    expect(recycleButtonSource).toContainSource('<Trash2 className="h-4 w-4" />');
    expect(recycleButtonSource).toContainSource('bg-white text-red-500');
    expect(recycleButtonSource).toContainSource('{brainstormRecycleCount}');
    expect(recycleButtonSource).not.toContainSource('打开');
    expect(recycleButtonSource).not.toContainSource('个已删除脑洞');
  });

  it('uses the chapter-style black text selected state for brainstorm entries', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).toContainSource('currentSelectedEntryId === entry.id');
    expect(entryListSource).toContainSource("'border-transparent xy-selected-mint-bg text-gray-900'");
    expect(entryListSource).toContainSource(
      "activeIsBrainstorm\n                              ? 'border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'",
    );
    expect(entryListSource).toContainSource("activeIsBrainstorm ? '' : 'pl-3'");
    expect(entryListSource).toContainSource('{entry.brainstormSerialNumber ?? previewIndex + 1}');
    expect(entryListSource).not.toContainSource('{entry.brainstormSerialNumber ?? previewIndex + 1}号');
    expect(entryListSource).toContainSource(
      'className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]"',
    );
    expect(entryListSource).not.toContainSource("activeIsBrainstorm ? 'text-xs font-black text-gray-400'");
    expect(entryListSource).not.toContainSource('text-orange-500');
  });

  it('removes the brainstorm recycle button scheme test page from the test collection', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('BrainstormRecycleButtonTestPage');
    expect(testCollectionSource).not.toContainSource('/brainstorm-recycle-button-test');
    expect(testCollectionSource).not.toContainSource('脑洞回收站按钮方案');
  });
});
