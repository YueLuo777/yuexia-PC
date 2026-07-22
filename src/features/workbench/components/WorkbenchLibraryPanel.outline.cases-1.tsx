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
    expect(capsuleSource).toContainSource(
      'xy-border-embedded-transparent-backplate pointer-events-none absolute left-5 top-0',
    );
    expect(capsuleSource).not.toContainSource("${disabled ? 'bg-white' : 'bg-white'}");
    expect(capsuleSource).not.toContainSource(
      "disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE]'",
    );
  });
  it('routes prompt management categories to setting and chapter-outline names', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("const PROMPT_SETTING_CATEGORY = '设定';");
    expect(panelSource).toContainSource("const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';");
    expect(panelSource).toContainSource('activeTab === DETAIL_OUTLINE_TAB');
    expect(panelSource).toContainSource('? DETAIL_OUTLINE_PROMPT_CATEGORY');
    expect(panelSource).toContainSource(
      'const outlinePromptCategory = isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : SUMMARY_PROMPT_CATEGORY;',
    );
    expect(panelSource).not.toContainSource("const PROMPT_SETTING_CATEGORY = '大纲';");
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
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1',
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
    expect(panelSource).toContainSource("isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'");
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
    expect(panelSource).toContainSource('<AssociationReaderItemRow');
    expect(panelSource).toContainSource('checked={checked}');
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
    const chapterSidebarSource = await readChapterSidebarSource();
    const testCollectionSource = await readTestCollectionSource();
    const outlineGridCondition = panelSource.indexOf('isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryStart = panelSource.lastIndexOf('gridTemplateColumns:', outlineGridCondition);
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS = 'flex h-12 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3';",
    );
    expect(chapterSidebarSource).toContainSource(
      'className="flex h-12 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3"',
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
});
