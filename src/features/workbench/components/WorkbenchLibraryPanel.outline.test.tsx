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

  it('auto-creates an editable outline setting when typing into the empty setting name field', async () => {
    localStorage.setItem(
      'workbench-outline-empty-name-edit-test_work_setting_starter_version',
      TEST_WORK_SETTING_STARTER_VERSION,
    );

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-outline-empty-name-edit-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('输入设定名'), { target: { value: '测试设定名' } });

    expect(await screen.findByDisplayValue('测试设定名')).toBeInTheDocument();
    const storedEntries = JSON.parse(localStorage.getItem('workbench-outline-empty-name-edit-test') ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(1);
    expect(storedSettingEntries[0]).toMatchObject({ tab: '大纲', title: '测试设定名' });
  });

  it('auto-creates an editable outline setting when typing into the empty setting preview field', async () => {
    localStorage.setItem(
      'workbench-outline-empty-preview-edit-test_work_setting_starter_version',
      TEST_WORK_SETTING_STARTER_VERSION,
    );

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-outline-empty-preview-edit-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('这里可以直接输入设定内容，会自动新建设定。'), {
      target: { value: '测试设定正文' },
    });

    expect(await screen.findByDisplayValue('测试设定正文')).toBeInTheDocument();
    const storedEntries = JSON.parse(localStorage.getItem('workbench-outline-empty-preview-edit-test') ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(1);
    expect(storedSettingEntries[0]).toMatchObject({ tab: '大纲', title: '新建大纲' });
    expect(JSON.parse(storedSettingEntries[0].content)).toMatchObject({ type: '核心设定', body: '测试设定正文' });
  });

  it('keeps disabled floating capsule selects outlined instead of filled', async () => {
    const capsuleSource = await readCapsuleSelectSource();

    expect(capsuleSource).toContainSource("controlHeight: 'h-[42px]'");
    expect(capsuleSource).toContainSource("disabled ? 'border-slate-200 bg-white text-slate-400' : 'border-[#08AACE]'");
    expect(capsuleSource).toContainSource("${disabled ? 'bg-white' : 'bg-white'}");
    expect(capsuleSource).not.toContainSource(
      "disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE]'",
    );
  });

  it('routes prompt management categories to setting and chapter-outline names', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("const PROMPT_SETTING_CATEGORY = '设定';");
    expect(panelSource).toContainSource("const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';");
    expect(panelSource).toContainSource('const PLOT_CHAIN_PROMPT_CATEGORY = DETAIL_OUTLINE_PROMPT_CATEGORY;');
    expect(panelSource).toContainSource('activeTab === DETAIL_OUTLINE_TAB');
    expect(panelSource).toContainSource('? DETAIL_OUTLINE_PROMPT_CATEGORY');
    expect(panelSource).toContainSource(
      'const outlinePromptCategory = plotPointStandalone ? PLOT_CHAIN_PROMPT_CATEGORY : isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : SUMMARY_PROMPT_CATEGORY;',
    );
    expect(panelSource).not.toContainSource("const PROMPT_SETTING_CATEGORY = '大纲';");
    expect(panelSource).not.toContainSource("const PLOT_CHAIN_PROMPT_CATEGORY = '剧情链';");
    expect(panelSource).toContainSource("'暂无设定提示词'");
    expect(panelSource).toContainSource('normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY');
  });

  it('removes white backplates from outline preview labels and edge text tools', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label');
    expect(styleSource).toContainSource('background-color: transparent;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    expect(styleSource).toContainSource('.xy-floating-outline-clear-button,');
    expect(styleSource).toContainSource('.xy-floating-inline-title-tool');
    expect(styleSource).toContainSource('text-shadow: none;');
    expect(styleSource).toContainSource('--xy-floating-backplate-bg: #F8FAFC;');
    expect(styleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(styleSource).toContainSource('paint-order: stroke fill;');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate::before,');
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label::before,');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count::before');
    expect(styleSource).toContainSource('height: 0.42em;');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate:not(.absolute)');
    expect(styleSource).toContainSource('background-image: linear-gradient(');
    expect(styleSource).toContainSource('transparent calc(50% - 0.24em)');
    expect(styleSource).toContainSource('var(--xy-floating-backplate-bg, #ffffff) calc(50% + 0.24em)');
    expect(styleSource).toContainSource('background-size: 100% 100%');
    expect(panelSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1',
    );
    expect(styleSource).toContainSource('.xy-floating-outline-inner-clear-tool {');
    expect(styleSource).toContainSource('top: auto;');
    expect(styleSource).toContainSource('right: 1.55rem;');
    expect(styleSource).toContainSource('bottom: 0.75rem;');
    expect(styleSource).toContainSource('transform: none;');
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0',
    );
    expect(panelSource).not.toContainSource('absolute -top-2 right-4 bg-white px-1');
    expect(panelSource).not.toContainSource(
      'absolute left-[104px] top-0 z-20 max-w-[calc(100%-232px)] -translate-y-1/2 bg-white px-1',
    );
    expect(panelSource).not.toContainSource('block max-w-[220px] truncate bg-white px-1');
  });

  it('uses the tested white empty state for chapter outline directories and removes the temporary test page route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContainSource(
      'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]',
    );
    expect(chapterEditorSource).toContainSource("} from '@/shared/ui/ChapterNumberButton';");
    expect(chapterNumberButtonSource).toContainSource(
      "return 'xy-detail-outline-number-no-outline hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]';",
    );
    expect(panelSource).not.toContainSource('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(chapterEditorSource).not.toContainSource('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(testCollectionSource).not.toContainSource('OutlineDirectoryStateTestPage');
    expect(testCollectionSource).not.toContainSource('/outline-directory-state-test');
  });

  it('matches audit comment and status chapter directories to the detail outline volume style without losing summary actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();

    expect(chapterEditorSource).toContainSource('volumes?: Volume[]');
    expect(chapterEditorSource).toContainSource('const chapterDirectoryGroups = useMemo(() => {');
    expect(chapterEditorSource).toContainSource(
      'chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber)',
    );
    expect(chapterEditorSource).toContainSource(
      "return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];",
    );
    expect(chapterEditorSource).toContainSource(
      'const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());',
    );
    expect(chapterEditorSource).toContainSource(
      'const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());',
    );
    expect(chapterEditorSource).toContainSource('const toggleReviewDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContainSource('const toggleStatusDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContainSource('chapterDirectoryGroups.forEach((group) => next.add(group.id));');
    expect(chapterEditorSource).toContainSource('onClick={() => toggleReviewDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContainSource('onClick={() => toggleStatusDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(chapterEditorSource).toContainSource(
      '<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-3">',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">',
    );
    expect(chapterEditorSource).not.toContainSource("{reviewMode === 'audit' ? '审核目录' : '点评目录'}");
    expect(chapterEditorSource).not.toContainSource('审核目录');
    expect(chapterEditorSource).not.toContainSource('点评目录');
    expect(chapterEditorSource).not.toContainSource(
      '<div className="mb-3 text-sm font-black text-slate-900">章节目录</div>',
    );
    expect(chapterEditorSource).toContainSource('className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}');
    expect(chapterEditorSource).toContainSource('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(chapterEditorSource).toContainSource('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(chapterEditorSource).not.toContainSource(
      'className="group flex h-[36px] w-full cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 text-left transition-colors hover:bg-brand/10"',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-brand-dark">',
    );
    expect(chapterEditorSource).toContainSource(
      '<span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>',
    );
    expect(chapterEditorSource).toContainSource('CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE');
    expect(chapterEditorSource).toContainSource('style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}');
    expect(chapterEditorSource).toContainSource('<ChapterNumberButton');
    expect(chapterNumberButtonSource).toContainSource(
      'relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block',
    );
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(chapterNumberButtonSource).toContainSource(
      "'xy-detail-outline-number-no-outline hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'",
    );
    expect(chapterEditorSource).not.toContainSource(
      "'border-transparent xy-detail-outline-number-selected xy-selected-orange-bg text-slate-900'",
    );
    expect(chapterEditorSource).not.toContainSource("groupHasSelectedChapter ? 'xy-selected-orange-bg' : ''");
    expect(chapterEditorSource).toContainSource('statusUpdatedChapterIds.has(item.id)');
    expect(chapterNumberButtonSource).toContainSource(
      "'xy-detail-outline-number-used hover:border-[#067B96] hover:bg-[#D3EEF5]'",
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="text-sm font-black text-slate-900">章节位置</span>',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#08B3D9]" />已更新</span>',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-slate-200 bg-slate-50" />未更新</span>',
    );
    expect(panelSource).toContainSource('卷梗概');
    expect(panelSource).toContainSource('const enableVolumeSummary = !isDetailOutlineTab;');
    expect(panelSource).toContainSource(
      "const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;",
    );
    expect(panelSource).toContainSource('selectOutlineVolume(volume);');
    const summaryChapterButtonSources = Array.from(
      panelSource.matchAll(/const outlineButtonClass = `relative h-9 min-w-9[\s\S]*?\}\`;/g),
      (match) => match[0],
    );
    expect(summaryChapterButtonSources.length).toBeGreaterThanOrEqual(2);
    summaryChapterButtonSources.forEach((buttonSource) => {
      expect(buttonSource).toContainSource("? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
      expect(buttonSource).not.toContainSource("? 'border-transparent xy-selected-orange-bg text-slate-900'");
    });
    expect(panelSource).toContainSource('if (isDetailOutlineTab) {');
    expect(panelSource).toContainSource('<ChapterNumberButton');
    expect(panelSource).toContainSource(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">',
    );
    expect(panelSource).toContainSource("isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'");
    expect(panelSource).not.toContainSource(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" aria-label="剧情链目录树">',
    );
    expect(panelSource).not.toContainSource("isDetailOutlineTab ? 'bg-[#F8FAFC]' : 'bg-gray-50 px-3 py-3'");
    expect(panelSource).toContainSource('<div className="grid grid-cols-1 gap-3">');
    expect(panelSource).not.toContainSource("isDetailOutlineTab ? 'grid-cols-1' : 'grid-cols-2'");
  });

  it('splits the review preview area into outline, original text, and AI annotation panes', async () => {
    const chapterEditorSource = await readChapterEditorSource();

    expect(chapterEditorSource).toContainSource('type ReviewAnnotation = {');
    expect(chapterEditorSource).toContainSource('function extractReviewAnnotations(output: string)');
    expect(chapterEditorSource).toContainSource('const reviewAnnotationsByParagraph = useMemo(() => {');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_visible';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewOutlineVisible() {');
    expect(chapterEditorSource).toContainSource(
      "return localStorage.getItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY) !== 'false';",
    );
    expect(chapterEditorSource).toContainSource(
      'const [showReviewOutline, setShowReviewOutline] = useState(() => readReviewPreviewOutlineVisible());',
    );
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY, String(nextShowReviewOutline));',
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_font_size';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewFontSize() {');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(() => readReviewPreviewFontSize());',
    );
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewFontSizeWithStorage = (nextFontSize: number) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, String(fontSize));',
    );
    expect(chapterEditorSource).toContainSource('onChange={setReviewPreviewFontSizeWithStorage}');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MODEL_ID_STORAGE_KEY = 'xinyuexia_chapter_editor_review_model_id';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewModelId() {');
    expect(chapterEditorSource).toContainSource("return localStorage.getItem(REVIEW_MODEL_ID_STORAGE_KEY) ?? '';");
    expect(chapterEditorSource).toContainSource(
      'const [reviewModelId, setReviewModelId] = useState(() => readReviewModelId());',
    );
    expect(chapterEditorSource).toContainSource('const setReviewModelIdWithStorage = (nextModelId: string) => {');
    expect(chapterEditorSource).toContainSource('localStorage.setItem(REVIEW_MODEL_ID_STORAGE_KEY, nextModelId);');
    expect(chapterEditorSource).toContainSource('onModelChange={setReviewModelIdWithStorage}');
    expect(chapterEditorSource).not.toContainSource('onModelChange={setReviewModelId}');
    expect(chapterEditorSource).toContainSource("type ReviewPreviewWidthMode = 'locked' | 'free';");
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_width_mode';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_text_width';",
    );
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH = 420;');
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH_LIMIT = { min: 240, max: 760 };');
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_SEPARATOR_WIDTH = 7;');
    expect(chapterEditorSource).toContainSource('function readReviewPreviewWidthMode(): ReviewPreviewWidthMode {');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewTextWidth, setReviewPreviewTextWidth] = useState(() => readStoredPanelWidth(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, REVIEW_PREVIEW_TEXT_WIDTH, REVIEW_PREVIEW_TEXT_WIDTH_LIMIT));',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewWidthMode, setReviewPreviewWidthMode] = useState<ReviewPreviewWidthMode>(() => readReviewPreviewWidthMode());',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewUsesCustomTextWidth, setReviewPreviewUsesCustomTextWidth] = useState(false);',
    );
    expect(chapterEditorSource).toContainSource(
      'const getBalancedReviewPreviewTextWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'const syncReviewPreviewTextColumnsWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewWidthModeWithStorage = (nextMode: ReviewPreviewWidthMode) => {',
    );
    expect(chapterEditorSource).toContainSource("if (nextMode === 'free') {");
    expect(chapterEditorSource).toContainSource('setReviewPreviewUsesCustomTextWidth(false);');
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 300, max: 640 };',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 360, max: 640 };',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const reviewPreviewGridTemplateColumns = effectiveShowReviewOutline',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewHiddenTextColumnMinWidth = `calc((100% - ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px) / 3)`;',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewFreeTextColumnMinWidth = effectiveShowReviewOutline',
    );
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewUseFreeCustomWidth = reviewPreviewWidthMode === 'free' && reviewPreviewUsesCustomTextWidth;",
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewGridTemplateColumns = !reviewPreviewUseFreeCustomWidth',
    );
    expect(chapterEditorSource).toContainSource(
      '`${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`${reviewPreviewOutlineWidth}px 7px ${reviewPreviewAnnotationWidth}px 7px ${reviewPreviewAnnotationWidth}px`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) 7px minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewAnnotationWidth}px)`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`${reviewPreviewOutlineWidth}px 7px minmax(0,1fr) 7px ${reviewPreviewAnnotationWidth}px`',
    );
    expect(chapterEditorSource).not.toContainSource('`minmax(0,1fr) 7px ${reviewPreviewAnnotationWidth}px`');
    expect(chapterEditorSource).toContainSource('reviewPreviewOutlineResizeHandle');
    expect(chapterEditorSource).toContainSource('reviewPreviewTextResizeHandle');
    expect(chapterEditorSource).toContainSource('renderReviewPreviewColumnSeparator()');
    expect(chapterEditorSource).toContainSource('reviewPreviewTextColumnSeparator');
    expect(chapterEditorSource).not.toContainSource('reviewPreviewAnnotationResizeHandle');
    expect(chapterEditorSource).toContainSource('第${activeReviewChapter.serialNumber}章 章纲');
    expect(chapterEditorSource).toContainSource("['locked', '等宽锁定'] as const");
    expect(chapterEditorSource).toContainSource("['free', '自由调节'] as const");
    expect(chapterEditorSource).toContainSource('onClick={() => setReviewPreviewWidthModeWithStorage(mode)}');
    expect(chapterEditorSource).not.toContainSource('const reviewPreviewTextColumnsWidthLabel');
    expect(chapterEditorSource).not.toContainSource('原文/审核同宽');
    expect(chapterEditorSource).not.toContainSource('原文/润色后同宽');
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewOriginalTitle = activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 原文` : '原文';",
    );
    expect(chapterEditorSource).toContainSource('const reviewPreviewAnnotationTitle = activeReviewChapter');
    expect(chapterEditorSource).not.toContainSource('润色前');
    expect(chapterEditorSource).toContainSource('AI标注');
    expect(chapterEditorSource).not.toContainSource('AI 返回“原文标注”JSON 后，这里会高亮问题片段并显示审核说明。');
    expect(chapterEditorSource).toContainSource('renderAnnotatedReviewParagraph(paragraph, paragraphAnnotations)');
  });

  it('syncs published and library group rows to the body folder navigation style', async () => {
    const chapterSidebarSource = await readChapterSidebarSource();
    const publishedSidebarSource = await readPublishedSidebarSource();
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const testCollectionSource = await readTestCollectionSource();

    for (const source of [chapterSidebarSource, publishedSidebarSource, panelSource, chapterEditorSource]) {
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP');
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_ICON_CLASS');
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_COUNT_CLASS');
      expect(source).toContainSource('FolderOpen');
      expect(source).toContainSource('Folder');
    }
    expect(constantsSource).toContainSource('border-[#BDEEF7] xy-flow-group-bg');
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';",
    );
    expect(constantsSource).toContainSource('font-black text-[#1f2933]');
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';",
    );

    expect(chapterSidebarSource).toContainSource('const VolumeFolderIcon = volume.isExpanded ? FolderOpen : Folder;');
    expect(chapterSidebarSource).toContainSource('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(publishedSidebarSource).toContainSource('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(publishedSidebarSource).toContainSource('aria-expanded={expanded}');
    expect(publishedSidebarSource).toContainSource("chapter.isSelected ? 'border-transparent xy-selected-mint-bg'");
    expect(publishedSidebarSource).not.toContainSource('volumeHasSelectedChapter');
    expect(publishedSidebarSource).not.toContainSource('border-orange-400 bg-orange-50');
    expect(publishedSidebarSource).not.toContainSource('text-orange-600');

    expect(panelSource).toContainSource('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContainSource('const GroupFolderIcon = collapsed ? Folder : FolderOpen;');
    expect(panelSource).toContainSource('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContainSource('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).toContainSource('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).not.toContainSource("groupHasSelectedEntry ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContainSource("groupHasCheckedItem ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContainSource('volumeHasSelectedOutlineChapter');
    expect(panelSource).toContainSource(
      "volumeIsSelected\n                                ? 'border-brand bg-brand text-white'",
    );
    expect(panelSource).toContainSource('xy-selected-mint-bg text-gray-900');
    expect(panelSource).toContainSource('xy-selected-content-bg text-slate-900');
    expect(panelSource).not.toContainSource(
      'className="group flex h-[36px] items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"',
    );
    expect(panelSource).not.toContainSource(
      'className="group flex h-[36px] cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"',
    );
    expect(testCollectionSource).not.toContainSource('ChapterGroupColorOptionsTestPage');
    expect(testCollectionSource).not.toContainSource('/chapter-group-color-options-test');
  });

  it('migrates the number 13 detail outline sidebar replica into production and retires the test route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const testCollectionSource = await readTestCollectionSource();
    const outlineGridCondition = panelSource.indexOf('isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryStart = panelSource.lastIndexOf('gridTemplateColumns:', outlineGridCondition);
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS = 'flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS = 'whitespace-nowrap text-sm font-bold text-gray-900';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS = 'flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS = 'flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white transition-colors hover:bg-[#0798b8]';",
    );
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_ROW_CLASS = WORKBENCH_FOLDER_GROUP_BUTTON_CLASS;',
    );
    expect(constantsSource).not.toContainSource("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'flex h-[54px]");
    expect(constantsSource).not.toContainSource("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'grid h-[54px]");
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_ICON_CLASS = WORKBENCH_FOLDER_GROUP_ICON_CLASS;',
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_VOLUME_TITLE_CLASS = 'min-w-0 flex-1 truncate leading-none';",
    );
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_COUNT_CLASS = WORKBENCH_FOLDER_GROUP_COUNT_CLASS;',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}',
    );
    expect(outlineDirectorySource).toContainSource('<div key={volume.id} className="mb-1">');
    expect(outlineDirectorySource).not.toContainSource('strokeWidth={isDetailOutlineTab ? 2.4 : undefined}');
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ICON_CLASS : WORKBENCH_FOLDER_GROUP_ICON_CLASS}',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS : WORKBENCH_FOLDER_GROUP_COUNT_CLASS}',
    );
    expect(testCollectionSource).not.toContainSource('WorkbenchDetailOutlineSidebarReplicaTestPage');
    expect(testCollectionSource).not.toContainSource('/workbench-detail-outline-sidebar-replica-test');
    expect(testCollectionSource).not.toContainSource('13号测试');
  });

  it('uses the body page format for the outline right-side output card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={activeOutlinePromptId');
    const outlineRightPanelStart = panelSource.lastIndexOf(
      '<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
      outlineRightPanelAnchor,
    );
    const outlineRightPanelEnd = panelSource.indexOf('</aside>', outlineRightPanelStart);
    const outlineRightPanelSource = panelSource.slice(outlineRightPanelStart, outlineRightPanelEnd);

    expect(outlineRightPanelAnchor).toBeGreaterThan(-1);
    expect(outlineRightPanelStart).toBeGreaterThan(-1);
    expect(outlineRightPanelEnd).toBeGreaterThan(outlineRightPanelStart);
    expect(outlineRightPanelSource).toContainSource('<div className="relative mt-5 min-h-[170px] flex-1">');
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
    expect(panelSource).toContainSource('const shouldShowOutlineDraftWordCount = plotPointStandalone;');
    expect(panelSource).not.toContainSource(
      'const shouldShowOutlineDraftWordCount = plotPointStandalone || isDetailOutlineTab;',
    );
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
    expect(outlineRightPanelSource).toContainSource('label="关联大纲"');
    expect(outlineRightPanelSource).toContainSource('linkedLabel="已关联大纲"');
    expect(outlineRightPanelSource).toContainSource('clearOnLinkedClick');
    expect(outlineRightPanelSource).toContainSource('onClear={clearDetailOutlineReaderSelection}');
    expect(outlineRightPanelSource).toContainSource(
      'linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-black text-white bg-red-500 hover:bg-red-600"',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'clearButtonClassName="flex h-full w-9 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600"',
    );
    expect(outlineRightPanelSource).toContainSource(
      'meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}',
    );
    expect(outlineRightPanelSource).toContainSource('className="mt-3 flex items-center gap-2"');
    expect(outlineRightPanelSource).toContainSource(
      'groupClassName="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"',
    );
    expect(outlineRightPanelSource).toContainSource(
      'buttonClassName="h-10 w-[132px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"',
    );
    expect(panelSource).toContainSource("readerTitle: '关联资料'");
    expect(panelSource).toContainSource("readerEmptyText: '未关联章纲、设定或角色'");
    expect(panelSource).toContainSource("if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);");
    expect(panelSource).toContainSource("return wrapAiRequestTag('梗概要求', userText);");
    expect(panelSource).toContainSource(
      "const outlineUserLogTitle = isDetailOutlineTab && !plotPointStandalone ? '其他要求' : '输入内容';",
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
    expect(outlineRightPanelSource).toContainSource('disabled={!lastDetailOutlineReplacement}');
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

  it('keeps detail outline card top labels from competing with body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardMetaAnchor = panelSource.indexOf('xy-floating-outline-chapter-meta');
    const cardMetaStart = panelSource.lastIndexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
      cardMetaAnchor,
    );
    const cardMetaEnd = panelSource.indexOf('</section>', cardMetaStart);
    const cardMetaSource = panelSource.slice(cardMetaStart, cardMetaEnd);

    expect(cardMetaAnchor).toBeGreaterThan(-1);
    expect(cardMetaStart).toBeGreaterThan(-1);
    expect(cardMetaEnd).toBeGreaterThan(cardMetaStart);
    expect(cardMetaSource).toContainSource('chapter.serialNumber');
    expect(cardMetaSource).toContainSource('chapter.title.trim() ||');
    expect(cardMetaSource).toContainSource('detailOutlineParts.outline');
    expect(cardMetaSource).toContainSource('WordCountText value={countTextWords(detailOutlineParts.outline)}');
    expect(cardMetaSource).toContainSource(
      "`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`",
    );
    expect(cardMetaSource).toContainSource('max-w-[44%]');
    expect(cardMetaSource).not.toContainSource('max-w-[58%]');
    expect(cardMetaSource).not.toContainSource('正文：');
    expect(cardMetaSource).toContainSource('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta',
    );
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *',
    );
  });

  it('keeps detail outline card titles free of body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardSourceStart = panelSource.indexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
    );
    const cardSourceEnd = panelSource.indexOf('})()', cardSourceStart);
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
      '<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>',
    );
    expect(labelSource).toContainSource('xy-detail-outline-title-count');
    expect(labelSource).toContainSource('xy-floating-title-text xy-detail-outline-heading-title');
    expect(labelSource).toContainSource('{outlineCardTitle}');
    expect(panelSource).toContainSource('? `第${chapter.serialNumber}章章纲`');
    expect(panelSource).not.toContainSource(
      '? `第${chapter.serialNumber}章章纲（第${getVolumeDisplayIndex(volume.id)}卷）`',
    );
    expect(labelSource).not.toContainSource('countTextWords(outlineCardContent)');
    expect(labelSource).not.toContainSource('WordCountText');
    expect(labelSource).not.toContainSource('章纲：');
    expect(cardSource).toContainSource('<WordCountText value={countTextWords(detailOutlineParts.outline)} />');
    expect(panelSource).toContainSource(
      '<WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />',
    );
    const rightPreviewStart = panelSource.indexOf('<div className="relative mt-5 min-h-[170px] flex-1">');
    const rightPreviewEnd = panelSource.indexOf('{isDetailOutlineTab && (', rightPreviewStart);
    const rightPreviewSource = panelSource.slice(rightPreviewStart, rightPreviewEnd);

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
    expect(rightPreviewSource).toContainSource('{renderDetailOutlineDraftClearButton()}');
    const clearOutputStart = panelSource.indexOf('const clearOutlineAiOutputDraft = () => {');
    const clearOutputEnd = panelSource.indexOf('const renderDetailOutlineDraftClearButton = () => {', clearOutputStart);
    const clearOutputSource = panelSource.slice(clearOutputStart, clearOutputEnd);
    const clearPreviewStart = panelSource.indexOf('const clearOutlinePreviewDraft = () => {');
    const clearPreviewEnd = panelSource.indexOf('const plotPointLinkedSettingSummary =', clearPreviewStart);
    const clearPreviewSource = panelSource.slice(clearPreviewStart, clearPreviewEnd);

    expect(clearOutputSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearOutputSource).not.toContainSource('updateChapterSummary');
    expect(clearOutputSource).not.toContainSource('updateVolumeSummary');
    expect(clearPreviewSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearPreviewSource).not.toContainSource('updateChapterSummary');
    expect(clearPreviewSource).not.toContainSource('updateVolumeSummary');
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(cardSource).not.toContainSource('{!isDetailOutlineTab && (');
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

  it('places library preview font size controls in the header tool slot and applies detail outline size to every chapter outline card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardSourceStart = panelSource.indexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
    );
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
    expect(panelSource).toContainSource('const detailOutlineFontSize = Math.min(');
    expect(panelSource).toContainSource('const setDetailOutlineFontSize = (value: number) =>');
    expect(panelSource).toContainSource('fontSize: detailOutlineFontSize');
    expect(panelSource).toContainSource('const renderDetailOutlineFontSizeTool = () => {');
    expect(panelSource).toContainSource('if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;');
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
    expect(panelSource).toContainSource('{libraryHeaderFontSizePortal}');
    expect(panelSource).toContainSource("ariaLabel: '章纲字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞输出字号'");
    expect(panelSource).toContainSource("ariaLabel: '设定预览字号'");
    expect(panelSource).not.toContainSource('章纲目录');
    expect(panelSource).not.toContainSource('<h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ?');
    expect(panelSource).not.toContainSource('>章节梗概</h3>');
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('settingPreview')}");
    expect(panelSource).toContainSource("if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');");
    expect(panelSource).toContainSource('style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}');
    expect(panelSource).toContainSource('onMouseDown={() => {');
    expect(panelSource).toContainSource('className="shrink-0"');
    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(cardSource).not.toContainSource('ariaLabel="章纲字号"');
    expect(cardSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
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
    const outputAreaStart = panelSource.lastIndexOf('<div className="relative mt-5 min-h-0 flex-1">', outputAreaAnchor);
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
    expect(modalHeaderSource).toContainSource('<h3 className="text-xl font-bold text-gray-900">关联资料</h3>');
    expect(modalHeaderSource).toContainSource('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalHeaderSource).toContainSource('本次将读取');
    expect(modalHeaderSource).toContainSource('draftDetailOutlineReaderItems.map((entry) => (');
    expect(modalHeaderSource).toContainSource('setDetailOutlineReaderPreviewId(entry.id);');
    expect(modalHeaderSource).toContainSource("['outlines', '章纲']");
    expect(modalHeaderSource).toContainSource("['settings', '设定']");
    expect(modalHeaderSource).toContainSource("['roles', '角色']");
    expect(modalHeaderSource).not.toContainSource("['plotChain', '剧情链']");
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
    expect(panelSource).toContainSource(
      "const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');",
    );
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
    expect(panelSource).toContainSource('addRole(selectedCreateType, { switchToRoleTab: false, title: createTitle })');
    expect(panelSource).toContainSource('<RoleBaseStateEditor');
    expect(panelSource).toContainSource('baseSetting: string;');
    expect(panelSource).toContainSource('stateSettings: RoleStateSettings;');
    expect(panelSource).toContainSource('>基础设定<');
    expect(panelSource).toContainSource('>状态设定<');
    expect(panelSource).toContainSource('style={{ fontSize: roleTextFontSize }}');
  });
});
