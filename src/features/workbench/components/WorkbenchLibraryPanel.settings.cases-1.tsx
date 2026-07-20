import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchLibraryPanelConstantsSource,
  readWorkbenchLibrarySidebarSource,
  readWorkbenchOtherSettingReaderModalSource,
  readSharedStylesSource,
  readAiRequestLogModalLayoutSource,
  readChapterEditorSource,
  readEditorToolModalsSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel setting library flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('keeps the empty setting row the same height as a normal setting item', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource(
      "export const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[38px] w-full rounded-xl border border-transparent bg-white px-4 py-2 text-left text-sm font-black leading-5 shadow-sm';",
    );
    expect(constantsSource).toContainSource(
      'export const WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS = `group cursor-default select-none ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS}',
    );
    expect(constantsSource).toContainSource(
      'export const WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS = `flex items-center ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} text-gray-400`;',
    );
    expect(panelSource).toContainSource('className={WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS}');
    expect(panelSource).toContainSource('className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} ${');
    expect(panelSource).not.toContainSource('text-xs font-bold leading-5 text-gray-400');
    expect(panelSource).not.toContainSource(
      '<p className="px-3 py-4 text-xs text-gray-400">{isOutlineCharacterScope ?',
    );
    expect(constantsSource).not.toContainSource(
      "const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[34px] w-full rounded-lg border border-transparent bg-white px-1 py-1.5",
    );
  });
  it('uses minimum left navigation widths as setting library defaults for new works', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;');
    expect(constantsSource).toContainSource(
      'export const SETTING_LIBRARY_LEFT_WIDTH = SETTING_LIBRARY_LEFT_MIN_WIDTH;',
    );
    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(constantsSource).not.toContainSource('const SETTING_LIBRARY_LEFT_WIDTH = 430;');
    expect(panelSource).toContainSource('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
  });
  it('counts only visible work settings in the work setting scope badge', async () => {
    const storageKey = 'workbench-visible-setting-count-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    const visibleEntries = Array.from({ length: 5 }, (_, index) => ({
      id: `visible-${index}`,
      tab: '大纲',
      title: `人物设定${index + 1}`,
      content: JSON.stringify({ type: '人物设定', body: `人物设定内容${index + 1}` }),
      updatedAt: '2026/6/15 19:00:00',
    }));
    const hiddenEntries = Array.from({ length: 43 }, (_, index) => ({
      id: `hidden-${index}`,
      tab: '大纲',
      title: `隐藏设定${index + 1}`,
      content: JSON.stringify({ type: '测试隐藏组', body: `隐藏内容${index + 1}` }),
      updatedAt: '2026/6/15 19:00:00',
    }));
    localStorage.setItem(storageKey, JSON.stringify([...visibleEntries, ...hiddenEntries]));
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['测试隐藏组']));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定5' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '作品设定48' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定5' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '测试隐藏组' })).not.toBeInTheDocument();
  });
  it('removes the old right-click unlock flow from clear settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContainSource('clearSettingsTooltipLayer');
    expect(panelSource).not.toContainSource('clearSettingsUnlockedTarget');
    expect(panelSource).not.toContainSource('已锁定，右键可以解锁');
    expect(panelSource).toContainSource('aria-disabled="true"');
  });
  it('does not overwrite saved setting splitter width while syncing visible width', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const syncStart = panelSource.indexOf('const syncVisibleLeftWidth = () => {');
    const syncEffectSource = panelSource.slice(syncStart, panelSource.indexOf('  useEffect(() => {', syncStart + 1));

    expect(syncStart).toBeGreaterThan(-1);
    expect(syncEffectSource).toContainSource(
      'setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));',
    );
    expect(syncEffectSource).toContainSource("window.addEventListener('resize', syncVisibleLeftWidth);");
    expect(syncEffectSource).not.toContainSource('persistSettingLibraryWidth');
    expect(syncEffectSource).not.toContainSource('clampSettingLibraryLeftWidth(currentWidth');
  });
  it('uses distinct labels for word highlighting and text replacement', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const toolModalSource = await readEditorToolModalsSource();

    expect(chapterEditorSource).toContainSource('词语高亮');
    expect(chapterEditorSource).toContainSource('文字替换');
    expect(chapterEditorSource).not.toContainSource('自动替换');
    expect(chapterEditorSource).not.toContainSource('一键替换');
    expect(chapterEditorSource).not.toContainSource('title="文字替换设置"');
    expect(chapterEditorSource).not.toContainSource('>高频词<');
    expect(toolModalSource).toContainSource('词语替换设置');
    expect(toolModalSource).toContainSource('添加需要替换的词语');
    expect(toolModalSource).toContainSource('暂无替换词，请在下方添加');
    expect(toolModalSource).toContainSource('请输入需要替换的词语');
    expect(toolModalSource).not.toContainSource('高频词设置');
    expect(toolModalSource).not.toContainSource('添加需要高亮的高频词');
  });
  it('lets the chapter editor output log fill the last expanded log group to the bottom', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();

    expect(chapterEditorSource).toContainSource(
      "import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';",
    );
    expect(chapterEditorSource).toContainSource('<AiRequestLogModalLayout');
    expect(logLayoutSource).toContainSource(
      'className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden"',
    );
    expect(logLayoutSource).toContainSource('className="border-r border-slate-100 bg-slate-50 p-4 text-sm"');
    expect(chapterEditorSource).toContainSource('value: `作品编辑器 ${activeReviewModeTitle}`');
    expect(chapterEditorSource).toContainSource("value: activeReviewModel?.name ?? '未选择模型'");
    expect(chapterEditorSource).toContainSource("value: activeReviewPrompt?.name ?? '默认提示词'");
    expect(logLayoutSource).toContainSource(
      'className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5"',
    );
    expect(chapterEditorSource).toContainSource(
      'if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;',
    );
    expect(chapterEditorSource).toContainSource(
      "if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;",
    );
    expect(chapterEditorSource).toContainSource('setIsReviewLogOpen(true);');
    expect(chapterEditorSource).toContainSource('onRegisterHeaderLog?: (handler: (() => void) | null) => void;');
    expect(chapterEditorSource).toContainSource('onRegisterHeaderLog(() => setIsReviewLogOpen(true));');
    expect(chapterEditorSource).toContainSource("import { WorkbenchModal } from './WorkbenchModal';");
    expect(chapterEditorSource).toContainSource('const reviewLogModal = isReviewLogOpen ? (');
    expect(chapterEditorSource).toContainSource('storageId="chapter_editor_review_request_log"');
    expect(chapterEditorSource).toContainSource('closeOnBackdrop={false}');
    expect(chapterEditorSource).toContainSource(
      'const basePromptText = activeReviewPrompt?.content?.trim() || modeInstruction;',
    );
    expect(chapterEditorSource).toContainSource(
      "const promptText = [basePromptText, compareInstruction].filter(Boolean).join('\\n\\n');",
    );
    expect(chapterEditorSource).toContainSource('const userRequirementText = reviewAiInput.trim();');
    expect(chapterEditorSource).toContainSource(
      "const userText = userRequirementText ? wrapAiRequestTag(requirementTag, userRequirementText) : '';",
    );
    expect(chapterEditorSource).not.toContainSource('reviewAiInput.trim() || modeInstruction');
    expect(chapterEditorSource).toContainSource("const REVIEW_LOG_SECTION_PREFIX = '[[YUEXIA_REVIEW_LOG_SECTION:';");
    expect(chapterEditorSource).toContainSource("createReviewLogSection('系统提示词', promptText)");
    expect(chapterEditorSource).toContainSource("...(userText ? [createReviewLogSection('其他要求', userText)] : [])");
    expect(chapterEditorSource).toContainSource("log.lastIndexOf('\\n【关联章纲】', originalStart)");
    expect(chapterEditorSource).not.toContainSource("['其他要求', '用户要求']");
    expect(chapterEditorSource).toContainSource("const user = getReviewLogSection(reviewRequestLog, '其他要求')");
    expect(chapterEditorSource).toContainSource("title: '其他要求'");
    expect(chapterEditorSource).toContainSource("title: '关联章纲'");
    expect(chapterEditorSource).toContainSource('content: outline');
    expect(chapterEditorSource).toContainSource("title: '原文'");
    expect(chapterEditorSource).toContainSource("content: getReviewLogSection(reviewRequestLog, '原文')");
    expect(chapterEditorSource).toContainSource('export function getReviewLogFillGroupWeights(options: {');
    expect(chapterEditorSource).toContainSource('hasOutline: boolean;');
    expect(chapterEditorSource).toContainSource('hasUser: boolean;');
    expect(chapterEditorSource).toContainSource('original: 2,');
    expect(chapterEditorSource).toContainSource('fillSingleGroup');
    expect(chapterEditorSource).toContainSource('fillGroupWeights={getReviewLogFillGroupWeights');
    expect(chapterEditorSource).not.toContainSource(
      'absolute inset-4 z-10 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
    );
    expect(chapterEditorSource).not.toContainSource('fillGroupId="context"');
    expect(chapterEditorSource).not.toContainSource('fillGroupId="original"');
    expect(chapterEditorSource).not.toContainSource("title: '用户要求'");
  });
  it('does not add a group-name fallback entry when the format group already has concrete entries', async () => {
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const entryTitlesStart = structuredSettingsSource.indexOf('function getSettingImportFormatEntryTitles(');
    const entryTitlesEnd = structuredSettingsSource.indexOf(
      'function createSettingImportFormatEntry(',
      entryTitlesStart,
    );
    const entryTitlesSource = structuredSettingsSource.slice(entryTitlesStart, entryTitlesEnd);

    expect(entryTitlesSource).not.toContainSource('...structuredTitles, normalizedType');
    expect(entryTitlesSource).toContainSource(
      'const knownTitles = Array.from(new Set([...currentTitles, ...starterTitles, ...structuredTitles]))',
    );
    expect(entryTitlesSource).toContainSource(
      'const visibleTitles = knownTitles.filter((title) => normalizeSettingType(title) !== normalizedType);',
    );
    expect(entryTitlesSource).toContainSource('return visibleTitles.length > 0 ? visibleTitles : [normalizedType];');
  });
  it('keeps setting map text fields hidden until scrolling with half-width scrollbars', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const settingSidebarStart = panelSource.indexOf(
      'gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm',
    );
    const settingSidebarSource = panelSource.slice(settingSidebarStart, settingSidebarStart + 12000);

    expect(panelSource).toContainSource(
      'const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);',
    );
    expect(panelSource).toContainSource('onScroll={() => handleSettingSidebarScroll');
    expect(settingSidebarSource).not.toContainSource(
      'scrollbar-scroll-only scrollbar-half-width min-h-0 flex-1 overflow-y-auto',
    );
    expect(panelSource).toContainSource('className="mt-0.5 space-y-0.5"');
    expect(panelSource).not.toContainSource(
      'scrollbar-scroll-only scrollbar-half-width mt-0.5 max-h-[760px] space-y-0.5 overflow-y-auto',
    );
    expect(panelSource).toContainSource('scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700');
    expect(panelSource).toContainSource('onScroll={() => handleSettingSidebarScroll(`setting-textarea:');
    expect(styleSource).toContainSource('.xy-setting-sidebar-scrollbar::-webkit-scrollbar');
    expect(styleSource).toContainSource('.scrollbar-scroll-only.scrollbar-half-width::-webkit-scrollbar');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:vertical:start:decrement');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:vertical:end:increment');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:single-button:vertical:decrement');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:single-button:vertical:increment');
    expect(styleSource).toContainSource(
      '.scrollbar-scroll-only::-webkit-scrollbar-button:single-button:vertical:decrement',
    );
    expect(styleSource).toContainSource(
      '.scrollbar-scroll-only::-webkit-scrollbar-button:single-button:vertical:increment',
    );
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-corner');
    expect(styleSource).toContainSource('.scrollbar-scroll-only::-webkit-scrollbar-corner');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-resizer');
    expect(styleSource).toContainSource('.scrollbar-scroll-only::-webkit-resizer');
    expect(styleSource).toContainSource('background-image: none !important;');
    expect(styleSource).toContainSource('-webkit-appearance: none !important;');
    expect(styleSource).toContainSource('display: none !important;');
    expect(styleSource).toContainSource('width: 4px;');
    expect(styleSource).toContainSource('height: 4px;');
  });
  it('keeps the other-setting link picker focused on the list and preview only', async () => {
    const modalSource = await readWorkbenchOtherSettingReaderModalSource();

    expect(modalSource).toContainSource('grid-cols-[300px_minmax(0,1fr)]');
    expect(modalSource).toContainSource('已选 {draftEntries.length} 项');
    expect(modalSource).not.toContainSource('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalSource).not.toContainSource('本次将关联');
    expect(modalSource).not.toContainSource('还没有选择其他设定');
    expect(modalSource).not.toContainSource('确认后，这些条目会合并成“关联其他设定”上下文');
  });
  it('uses the requested default tab even when the shared storage remembered another setting tab', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource('defaultActiveTab');
    expect(panelSource).toContainSource("const tabsSignature = tabs.map(normalizeTabName).join('\\u001f');");
    expect(panelSource).toContainSource(
      "const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\\u001f') : []), [tabsSignature]);",
    );
    expect(panelSource).not.toContainSource(
      'const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);',
    );
    expect(panelSource).toContainSource('readActiveTab(storageKey, normalizedTabs, defaultActiveTab)');
    expect(panelSource).toContainSource('这里显示选中的脑洞内容，也可以直接编辑。');
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
  it('renders clear settings in the category context menu with double confirmation', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';",
    );
    expect(panelSource).toContainSource(
      'const [clearSettingsConfirmStep, setClearSettingsConfirmStep] = useState<1 | 2>(1);',
    );
    expect(panelSource).toContainSource('const openClearSettingsConfirm = (target: ClearSettingsTarget) => {');
    expect(panelSource).toContainSource('const openClearSettingsConfirmFromMenu = (target: ClearSettingsTarget) => {');
    expect(panelSource).toContainSource('const createEntryFromCategoryMenu = () => {');
    expect(panelSource).toContainSource('const createEntryFromEntryMenu = () => {');
    expect(panelSource).toContainSource('const openSiblingCategoryCreateFromMenu = () => {');
    expect(panelSource).toContainSource('const openCategoryRenameFromMenu = () => {');
    expect(panelSource).toContainSource('const confirmCategoryRename = () => {');
    expect(panelSource).toContainSource('const copyEntryFromMenu = () => {');
    expect(panelSource).toContainSource('const moveEntryFromMenuToType = (targetType: string) => {');
    expect(panelSource).toContainSource('if (clearSettingsConfirmStep === 1) {');
    expect(panelSource).toContainSource('setClearSettingsConfirmStep(2);');
    expect(panelSource).toContainSource('clearSettingsTargetMeta[clearSettingsConfirmTarget]');
    expect(panelSource).toContainSource('clearSettingCategories();');
    expect(panelSource).toContainSource('clearSettingEntries();');
    expect(panelSource).toContainSource('aria-disabled="true"');
    expect(panelSource).toContainSource("mode === 'category' ? '新建分组'");
    expect(panelSource).toContainSource("mode === 'category' ? '输入分组名字'");
    expect(panelSource).toContainSource(
      'clearEntryLabel={clearSettingsTargetMeta[categoryMenuClearEntryTarget].label}',
    );
    expect(panelSource).toContainSource(
      'clearCategoryLabel={clearSettingsTargetMeta[categoryMenuClearCategoryTarget].label}',
    );
    expect(panelSource).toContainSource('清空{clearEntryLabel}');
    expect(panelSource).toContainSource('清空{clearCategoryLabel}');
    expect(panelSource).toContainSource("新建{menu.kind === 'role' ? '角色' : '设定'}");
    expect(panelSource).toContainSource("entryKindLabel={entryMenu?.tab === ROLE_TAB ? '角色' : '设定'}");
    expect(panelSource).toContainSource('新建{entryKindLabel}');
    expect(panelSource).toContainSource('新建分组');
    expect(panelSource).not.toContainSource('新建同级分组');
    expect(panelSource).toContainSource('重命名分组');
    expect(panelSource).toContainSource('复制');
    expect(panelSource).toContainSource('移动到分组');
    expect(panelSource).toContainSource('moveOptions={entryMenuMoveOptions}');
    expect(panelSource).toContainSource('{moveOptions.map((type) => (');
    expect(panelSource).toContainSource('setSettingCreateContextKind(categoryMenu.kind);');
    expect(panelSource).toContainSource("label: '设定分组'");
    expect(panelSource).toContainSource("settingEntries: {\n      label: '设定'");
    expect(panelSource).toContainSource("roleEntries: {\n      label: '角色'");
    expect(panelSource).toContainSource("roleCategories: {\n      label: '角色分组'");
    expect(panelSource).toContainSource('确定要清空全部自建人物分组吗？');
    expect(panelSource).toContainSource(
      '女主角、重要正派角色、正派配角、重要反派角色、反派配角、龙套角色等默认分组会保留。',
    );
    expect(panelSource).not.toContainSource('SETTING_CLEAR_DOMAIN_LABELS');
    expect(panelSource).not.toContainSource("'setting:faction': '势力'");
    expect(panelSource).not.toContainSource("'setting:item': '道具资源'");
    expect(panelSource).toContainSource('确定要清空全部自建设定分组吗？默认分组和默认设定条目会保留。');
    expect(panelSource).toContainSource(
      '确定要清空全部自建设定吗？当前共有 ${deletableSettingEntriesForClear.length} 条可删除设定会被删除，默认设定条目会保留。',
    );
    expect(panelSource).toContainSource('确定要清空全部角色吗？');
    expect(panelSource).toContainSource('确认清空${meta.label}');
    expect(panelSource).toContainSource('<ClearSettingsConfirmDialog');
    expect(panelSource).toContainSource(
      'onClearEntries={() => openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)}',
    );
    expect(panelSource).toContainSource(
      'onClearCategories={() => openClearSettingsConfirmFromMenu(categoryMenuClearCategoryTarget)}',
    );
    expect(panelSource).toContainSource('onClick={onClearEntries}');
    expect(panelSource).toContainSource('onClick={onClearCategories}');
    expect(panelSource).toContainSource('w-max min-w-[136px] max-w-[220px]');
    expect(panelSource).toContainSource(
      'w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500',
    );
    expect(panelSource).not.toContainSource(
      'className="fixed z-[10000] min-w-[168px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"',
    );
    expect(panelSource).toContainSource('mt-3 shrink-0 space-y-2');
    expect(panelSource).toContainSource(
      'grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]',
    );
    expect(panelSource).not.toContainSource('aria-label="清空分组"');
    expect(panelSource).not.toContainSource('border-r border-red-100 bg-red-50 px-2 text-sm font-black text-red-500');
    expect(panelSource).not.toContainSource('isActiveClearSettingsUnlocked');
    expect(panelSource).not.toContainSource('setClearSettingsUnlockMenu({');
    expect(panelSource).not.toContainSource('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContainSource('h-9 w-full rounded-xl border border-red-200');
  });
  it('does not confirm the setting create dialog while Chinese IME composition is active', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalStart = panelSource.indexOf('export function SettingCreateDialog(');
    const modalEnd = panelSource.indexOf('type CategoryRenameDialogProps', modalStart);
    const modalSource = panelSource.slice(modalStart, modalEnd);
    const confirmStart = panelSource.indexOf('const confirmSettingCreate = () => {');
    const confirmEnd = panelSource.indexOf('const openSettingCreateDialog', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);

    expect(modalStart).toBeGreaterThan(-1);
    expect(panelSource).toContainSource("const [settingCreateDraft, setSettingCreateDraft] = useState('');");
    expect(panelSource).toContainSource("const [settingCreateTypeDraft, setSettingCreateTypeDraft] = useState('');");
    expect(confirmSource).toContainSource('const createTitle = settingCreateDraft.trim();');
    expect(confirmSource).toContainSource('const selectedCreateType = getValidSettingCreateType();');
    expect(confirmSource).not.toContainSource('addSettingTypeByName(settingTitleDraft);');
    expect(confirmSource).not.toContainSource('addRoleTypeByName(settingTitleDraft);');
    expect(modalSource).toContainSource("event.key === 'Enter'");
    expect(modalSource).toContainSource('event.nativeEvent.isComposing');
    expect(modalSource).toContainSource('event.keyCode === 229');
    expect(modalSource).toContainSource('!isImeComposing');
    expect(modalSource).toContainSource('value={draft}');
    expect(modalSource).toContainSource('onChange={(event) => onDraftChange(event.target.value)}');
    expect(modalSource).toContainSource('所属分组');
    expect(modalSource).toContainSource('value={typeValue}');
    expect(modalSource).toContainSource('onChange={(event) => onTypeChange(event.target.value)}');
    expect(modalSource).toContainSource('onConfirm();');
    expect(panelSource).toContainSource('onConfirm={confirmSettingCreate}');
  });
  it('shows a newly created setting group in the current setting workspace tab', async () => {
    const storageKey = 'workbench-create-setting-group-in-domain-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '势力设定0' }));
    fireEvent.click(screen.getByRole('button', { name: '分组' }));
    fireEvent.change(screen.getByPlaceholderText('输入分组名字'), { target: { value: '宗门势力' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    expect(screen.getByRole('button', { name: /宗门势力/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(`${storageKey}_setting_types`) ?? '[]')).toContainSource('宗门势力');
    expect(JSON.parse(localStorage.getItem(`${storageKey}_setting_type_domains`) ?? '{}')).toMatchObject({
      宗门势力: 'setting:faction',
    });
  });
  it('creates a new setting in the selected group instead of the first group', async () => {
    const storageKey = 'workbench-create-setting-in-selected-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源0' }));
    fireEvent.click(screen.getByRole('button', { name: '设定' }));
    fireEvent.change(screen.getByPlaceholderText('输入设定名字'), { target: { value: '测试装备设定' } });
    fireEvent.change(screen.getByLabelText('所属分组'), { target: { value: '物品装备' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const createdEntry = storedEntries.find((entry: { title: string }) => entry.title === '测试装备设定');
    expect(createdEntry).toBeTruthy();
    expect(JSON.parse(createdEntry.content).type).toBe('物品装备');
    expect(JSON.parse(createdEntry.content).type).not.toBe('功法能力');
  });
  it('defaults new setting creation to the selected setting entry group', async () => {
    const storageKey = 'workbench-create-setting-defaults-to-selected-entry-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'basic-setting',
          tab: '大纲',
          title: '基础设定',
          content: JSON.stringify({ type: '核心设定', body: '' }),
          updatedAt: '2026/6/18 12:00:00',
        },
        {
          id: 'world-view',
          tab: '大纲',
          title: '世界观',
          content: JSON.stringify({ type: '核心设定', body: '' }),
          updatedAt: '2026/6/18 12:01:00',
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

    ensureLibraryGroupExpanded('核心设定2');
    fireEvent.click(screen.getByText('世界观').closest('button') as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: '设定' }));

    expect(screen.getByLabelText('所属分组')).toHaveValue('核心设定');

    fireEvent.change(screen.getByPlaceholderText('输入设定名字'), { target: { value: '新核心设定条目' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const createdEntry = storedEntries.find((entry: { title: string }) => entry.title === '新核心设定条目');
    expect(createdEntry).toBeTruthy();
    expect(JSON.parse(createdEntry.content).type).toBe('核心设定');
  });
  it('does not render the setting entry grip dot icon', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).not.toContainSource('GripVertical');
  });
  it('keeps the normal arrow cursor on setting entry rows', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(constantsSource).toContainSource('cursor-default select-none');
    expect(entryListSource).not.toContainSource('cursor-grab select-none');
    expect(entryListSource).not.toContainSource('active:cursor-grabbing');
  });
  it('keeps custom setting entries editable and deletable from the context menu without a footer delete button', async () => {
    const storageKey = 'workbench-custom-setting-entry-stays-editable-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'custom-setting',
          tab: '大纲',
          title: '自定义剧情设定',
          content: JSON.stringify({ type: '剧情规划', body: '' }),
          updatedAt: '2026/6/19 01:00:00',
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

    ensureLibraryGroupExpanded('剧情规划1');
    fireEvent.click(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('自定义剧情设定')).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).not.toBeDisabled();
  });
});
