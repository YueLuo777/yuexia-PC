import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from './chapterEditorSource.testUtils';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

const readEditorToolModalsSource = () =>
  [
    'EditorToolModals.tsx',
    'editorToolState.ts',
    'EditorToolModalShell.tsx',
    'EditorGenerateModals.tsx',
    'EditorAiGenerateModal.tsx',
    'EditorFontSettingsModal.tsx',
    'EditorSmartFormatModal.tsx',
    'EditorReplaceTools.tsx',
    'EditorHistoryModals.tsx',
  ]
    .map(readSource)
    .join('\n\n');

describe('ChapterEditor grid line font setting', () => {
  it('keeps the symbol replacement settings reachable after rules already exist', () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource('openSymbolReplaceSettings={() => setIsSymbolReplaceOpen(true)}');
    expect(source).toContainSource('title="词语替换设置"');
    expect(source).toContainSource('aria-label="词语替换设置"');
  });

  it('keeps review chapter selection non-orange and strengthens review preview dividers', () => {
    const chapterEditorEntrySource = readSource('ChapterEditor.tsx');
    const chapterEditorSource = [readChapterEditorSource(), readSource('../model/chapterReviewLog.ts')].join('\n\n');
    const chapterNumberButtonSource = readSource('../../../shared/ui/ChapterNumberButton.tsx');
    const logLayoutSource = readSource('../../../shared/ui/AiRequestLogModalLayout.tsx');
    const reviewLayoutSource = readSource('ChapterReviewPanel.tsx');
    const reviewOriginalBodySource = readSource('ChapterReviewOriginalBody.tsx');
    const reviewPanelStart = chapterEditorSource.indexOf('canRenderReviewPanel &&');
    const reviewPanelSource = [
      readSource('ChapterEditorView.tsx'),
      readSource('ChapterReviewDirectory.tsx'),
      readSource('ChapterReviewPreview.tsx'),
      reviewOriginalBodySource,
    ].join('\n\n');

    expect(reviewPanelStart).toBeGreaterThan(-1);
    expect(reviewLayoutSource).toContainSource(
      "className={`grid min-h-0 flex-1 bg-slate-50 ${embeddedMode ? 'pb-3' : ''}`}",
    );
    expect(chapterEditorSource).toContainSource('ChapterNumberButton,');
    expect(chapterNumberButtonSource).toContainSource(
      "return 'xy-detail-outline-number-no-outline hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#078fb0]';",
    );
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(reviewPanelSource).toContainSource('flex h-full min-h-0 flex-col overflow-hidden bg-white');
    expect(reviewPanelSource).not.toContainSource(
      'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white',
    );
    expect(reviewPanelSource).not.toContainSource(
      'flex h-full min-h-0 flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white',
    );
    expect(reviewPanelSource).not.toContainSource(
      'flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white',
    );
    expect(chapterEditorSource).not.toContainSource("type AuditPromptStage = 'structure' | 'text';");
    expect(chapterEditorSource).not.toContainSource('const AUDIT_PROMPT_STAGES');
    expect(chapterEditorSource).not.toContainSource('reviewAuditStagePrompts');
    expect(chapterEditorSource).toContainSource(
      'const getBalancedReviewPreviewTextWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'const fixedWidth = nextShowOutline ? nextOutlineWidth + REVIEW_PREVIEW_SEPARATOR_WIDTH * 2 : REVIEW_PREVIEW_SEPARATOR_WIDTH;',
    );
    expect(chapterEditorSource).toContainSource('const dynamicTextWidthLimit = {');
    expect(chapterEditorSource).toContainSource(
      'max: Math.max(REVIEW_PREVIEW_TEXT_WIDTH_LIMIT.max, (gridWidth - fixedWidth) / 2)',
    );
    expect(chapterEditorSource).toContainSource(
      'const syncReviewPreviewTextColumnsWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource('setReviewPreviewTextWidth(sharedTextWidth);');
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, String(sharedTextWidth));',
    );
    expect(chapterEditorSource).toContainSource('return sharedTextWidth;');
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewWidthModeWithStorage = (nextMode: ReviewPreviewWidthMode) => {',
    );
    expect(chapterEditorSource).toContainSource("if (nextMode === 'free') {");
    expect(chapterEditorSource).toContainSource('setReviewPreviewUsesCustomTextWidth(false);');
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY, nextMode);',
    );
    expect(chapterEditorSource).toContainSource(
      'const availableWidth = Math.max(0, gridWidth - REVIEW_PREVIEW_SEPARATOR_WIDTH * 2);',
    );
    expect(chapterEditorSource).toContainSource('setReviewPreviewOutlineWidth(outlineWidth);');
    expect(chapterEditorSource).toContainSource(
      'const setReviewOutlineVisibilityWithBalancedColumns = (nextShowReviewOutline: boolean) => {',
    );
    expect(chapterEditorSource).toContainSource('setShowReviewOutline(nextShowReviewOutline);');
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY, String(nextShowReviewOutline));',
    );
    expect(chapterEditorSource).toContainSource('setReviewPreviewUsesCustomTextWidth(false);');
    expect(chapterEditorSource).toContainSource(
      'clampPanelWidth(availableWidth * 0.26, REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT)',
    );
    expect(chapterEditorSource).toContainSource('setReviewPreviewOutlineWidth(outlineWidth);');
    expect(chapterEditorSource).toContainSource(
      "if (reviewPreviewWidthMode === 'free') syncReviewPreviewTextColumnsWidth(nextOutlineWidth, canShowReviewOutline && nextShowReviewOutline);",
    );
    expect(chapterEditorSource).not.toContainSource('REVIEW_PREVIEW_ANNOTATION_WIDTH_STORAGE_KEY');
    expect(chapterEditorSource).toContainSource(
      'const [showReviewOutline, setShowReviewOutline] = useState(() => readReviewPreviewOutlineVisible());',
    );
    expect(chapterEditorSource).toContainSource(
      "const activeReviewDetailOutlineText = activeReviewDetailOutline?.content.trim() ?? '';",
    );
    expect(chapterEditorSource).toContainSource("const canShowReviewOutline = reviewMode !== 'polish';");
    expect(chapterEditorSource).toContainSource(
      'const effectiveShowReviewOutline = canShowReviewOutline && showReviewOutline;',
    );
    expect(chapterEditorSource).toContainSource(
      'const polishPreviewText = reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput);',
    );
    expect(chapterEditorSource).toContainSource(
      'const polishPreviewParagraphs = useMemo(() => splitReviewParagraphs(polishPreviewText), [polishPreviewText]);',
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_width';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_text_width';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_width_mode';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_visible';",
    );
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_SEPARATOR_WIDTH = 7;');
    expect(chapterEditorSource).not.toContainSource(
      "const REVIEW_PREVIEW_ANNOTATION_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_annotation_width';",
    );
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH = 420;');
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH_LIMIT = { min: 240, max: 760 };');
    expect(chapterEditorSource).toContainSource("type ReviewPreviewWidthMode = 'locked' | 'free';");
    expect(chapterEditorSource).toContainSource('function readReviewPreviewWidthMode(): ReviewPreviewWidthMode {');
    expect(chapterEditorSource).toContainSource(
      "return localStorage.getItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY) === 'free' ? 'free' : 'locked';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewOutlineVisible() {');
    expect(chapterEditorSource).toContainSource(
      "return localStorage.getItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY) !== 'false';",
    );
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 300, max: 640 };',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 360, max: 640 };',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewOutlineWidth, setReviewPreviewOutlineWidth] = useState(() => readStoredPanelWidth(REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY, REVIEW_PREVIEW_OUTLINE_WIDTH, REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT));',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewTextWidth, setReviewPreviewTextWidth] = useState(() => readStoredPanelWidth(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, REVIEW_PREVIEW_TEXT_WIDTH, REVIEW_PREVIEW_TEXT_WIDTH_LIMIT));',
    );
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
    expect(chapterEditorSource).toContainSource("if (reviewModelId) setReviewModelIdWithStorage('');");
    expect(chapterEditorSource).toContainSource('if (!reviewModels.some((model) => model.id === reviewModelId)) {');
    expect(chapterEditorSource).toContainSource('setReviewModelIdWithStorage(reviewModels[0].id);');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewWidthMode, setReviewPreviewWidthMode] = useState<ReviewPreviewWidthMode>(() => readReviewPreviewWidthMode());',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewUsesCustomTextWidth, setReviewPreviewUsesCustomTextWidth] = useState(false);',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const [reviewPreviewAnnotationWidth, setReviewPreviewAnnotationWidth]',
    );
    expect(chapterEditorSource).toContainSource(
      "const [activeReviewPreviewScrollPane, setActiveReviewPreviewScrollPane] = useState<'outline' | 'original' | 'annotation' | null>(null);",
    );
    expect(chapterEditorSource).toContainSource(
      "const handleReviewPreviewScroll = (pane: 'outline' | 'original' | 'annotation') => {",
    );
    expect(chapterEditorSource).toContainSource('const renderReviewPreviewColumnSeparator = (');
    expect(chapterEditorSource).toContainSource(
      "className={`group flex h-full w-full items-stretch justify-center bg-white ${options.onPointerDown ? 'cursor-ew-resize' : 'cursor-default'}`}",
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewOutlineResizeHandle = renderReviewPreviewColumnSeparator({',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewTextResizeHandle = renderReviewPreviewColumnSeparator({',
    );
    expect(chapterEditorSource).toContainSource('initialWidth: reviewPreviewTextWidth,');
    expect(chapterEditorSource).toContainSource('storageKey: REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,');
    expect(chapterEditorSource).toContainSource('limit: REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,');
    expect(chapterEditorSource).toContainSource('onChange: setReviewPreviewTextWidth,');
    expect(chapterEditorSource).toContainSource('onStart: () => setReviewPreviewUsesCustomTextWidth(true),');
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewTextColumnSeparator = reviewPreviewWidthMode === 'locked'",
    );
    expect(chapterEditorSource).toContainSource('? renderReviewPreviewColumnSeparator()');
    expect(chapterEditorSource).toContainSource(': reviewPreviewTextResizeHandle;');
    expect(chapterEditorSource).not.toContainSource(
      'const reviewPreviewAnnotationResizeHandle = renderReviewPreviewResizeHandle((event) => startPanelWidthResize(event, {',
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
      '`calc((100% - ${reviewPreviewOutlineWidth}px - ${REVIEW_PREVIEW_SEPARATOR_WIDTH * 2}px) / 3)`',
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
    expect(chapterEditorSource).not.toContainSource('const reviewPreviewTextColumnsWidthLabel');
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewOriginalTitle = activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 原文` : '原文';",
    );
    expect(chapterEditorSource).toContainSource('const reviewPreviewAnnotationTitle = activeReviewChapter');
    expect(chapterEditorSource).not.toContainSource('reviewCompareView');
    expect(chapterEditorSource).not.toContainSource('setReviewCompareView');
    expect(chapterEditorSource).not.toContainSource('syncReviewDraftFromOutput');
    expect(chapterEditorSource).not.toContainSource('applyReviewParagraph');
    expect(chapterEditorSource).not.toContainSource('applyAllReviewParagraphs');
    expect(reviewPanelSource).not.toContainSource("['preview', '原文'] as const");
    expect(reviewPanelSource).not.toContainSource("['paragraph', '段落'] as const");
    expect(reviewPanelSource).not.toContainSource("['full', '全文'] as const");
    expect(reviewPanelSource).not.toContainSource('生成对比');
    expect(reviewPanelSource).toContainSource('canShowReviewOutline ? (');
    expect(reviewPanelSource).toContainSource(
      'onClick={() => setReviewOutlineVisibilityWithBalancedColumns(!showReviewOutline)}',
    );
    expect(reviewPanelSource).toContainSource("{showReviewOutline ? '隐藏章纲' : '显示章纲'}");
    expect(reviewPanelSource).toContainSource("['locked', '等宽锁定'] as const");
    expect(reviewPanelSource).toContainSource("['free', '自由调节'] as const");
    expect(reviewPanelSource).toContainSource('onClick={() => setReviewPreviewWidthModeWithStorage(mode)}');
    expect(reviewPanelSource).toContainSource('reviewPreviewWidthMode === mode');
    expect(reviewPanelSource).not.toContainSource('原文/AI同宽');
    expect(reviewPanelSource).not.toContainSource('原文/审核同宽');
    expect(reviewPanelSource).not.toContainSource('原文/润色后同宽');
    expect(reviewPanelSource).toContainSource('style={{ gridTemplateColumns: reviewPreviewGridTemplateColumns }}');
    expect(reviewPanelSource).toContainSource('{effectiveShowReviewOutline ? reviewPreviewOutlineResizeHandle : null}');
    expect(reviewPanelSource).toContainSource('{showContinuousTextAudit ? null : reviewPreviewTextColumnSeparator}');
    expect(reviewPanelSource).toContainSource("activeReviewPreviewScrollPane === 'outline' ? 'scrollbar-active' : ''");
    expect(reviewPanelSource).toContainSource("onScroll={() => handleReviewPreviewScroll('outline')}");
    expect(reviewPanelSource).toContainSource("activeReviewPreviewScrollPane === 'original' ? 'scrollbar-active' : ''");
    expect(reviewPanelSource).toContainSource("onScroll={() => handleReviewPreviewScroll('original')}");
    expect(reviewPanelSource).toContainSource(
      "activeReviewPreviewScrollPane === 'annotation' ? 'scrollbar-active' : ''",
    );
    expect(reviewPanelSource).toContainSource("onScroll={() => handleReviewPreviewScroll('annotation')}");
    expect(chapterEditorSource).toContainSource(
      'const reviewOriginalParagraphRefs = useRef<Array<HTMLButtonElement | null>>([]);',
    );
    expect(chapterEditorSource).toContainSource('export function getCenteredReviewComparisonScrollTop({');
    expect(chapterEditorSource).toContainSource(
      'function scrollReviewComparisonTargetIntoCenter(container: HTMLElement | null, target: HTMLElement | null) {',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewOriginalPreviewPaneRef = useRef<HTMLDivElement | null>(null);',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewAnnotationPreviewPaneRef = useRef<HTMLDivElement | null>(null);',
    );
    expect(chapterEditorSource).toContainSource(
      'scrollReviewComparisonTargetIntoCenter(reviewOriginalPreviewPaneRef.current, reviewOriginalParagraphRefs.current[index]);',
    );
    expect(chapterEditorSource).toContainSource(
      'scrollReviewComparisonTargetIntoCenter(reviewAnnotationPreviewPaneRef.current, reviewAnnotationRefs.current[index]);',
    );
    expect(chapterEditorSource).not.toContainSource("scrollIntoView({ block: 'center', behavior: 'smooth' })");
    expect(reviewPanelSource).toContainSource('paragraphRefs.current[index] = node;');
    expect(reviewPanelSource).toContainSource('paragraphRefs={reviewOriginalParagraphRefs}');
    expect(reviewPanelSource).toContainSource('ref={reviewOriginalPreviewPaneRef}');
    expect(reviewPanelSource).toContainSource('ref={reviewAnnotationPreviewPaneRef}');
    expect(reviewPanelSource).not.toContainSource('快速定位');
    expect(reviewPanelSource).toContainSource('第${activeReviewChapter.serialNumber}章 章纲');
    expect(reviewPanelSource).toContainSource('{reviewPreviewOriginalTitle}');
    expect(reviewPanelSource).toContainSource('{reviewPreviewAnnotationTitle}');
    expect(reviewPanelSource).not.toContainSource('润色前');
    expect(reviewPanelSource).toContainSource('文笔润色后内容会显示在这里。');
    expect(chapterEditorSource).toContainSource(
      "import { isChapterContentPolished } from '@/features/workbench/model/chapterPolishStatus';",
    );
    expect(chapterEditorSource).toContainSource("const polished = reviewMode === 'polish'");
    expect(chapterEditorSource).toContainSource(
      "title={`第${item.serialNumber}章 ${item.title || '未命名章节'} · ${item.wordCount}字${reviewMode === 'polish' ? ` · ${polished ? '已润色' : '未润色'}` : ''}`}",
    );
    expect(chapterEditorSource).toContainSource("reviewMode === 'polish' && !polished");
    expect(chapterEditorSource).toContainSource("showAlertDot={reviewMode === 'polish' && !polished}");
    expect(chapterNumberButtonSource).toContainSource(
      'absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white',
    );
    expect(chapterNumberButtonSource).toContainSource('aria-label="未润色"');
    expect(chapterEditorSource).not.toContainSource("{polished ? '已润' : '未润'}");
    expect(chapterEditorSource).not.toContainSource('changedParagraphIndexes');
    expect(chapterEditorSource).not.toContainSource('markChapterContentPolished');
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(chapterNumberButtonSource).toContainSource(
      "if (state === 'hasOutline') return 'xy-detail-outline-number-has-outline hover:border-[#08AACE]';",
    );
    expect(reviewOriginalBodySource).toContainSource('REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS');
    expect(reviewOriginalBodySource).toContainSource(
      'selected ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS',
    );
    expect(reviewOriginalBodySource).not.toContainSource("selected ? 'bg-[#08AACE]' : 'bg-slate-300'");
    expect(reviewOriginalBodySource).toContainSource('{index + 1}');
    expect(reviewOriginalBodySource).not.toContainSource('当前选中');
    expect(reviewOriginalBodySource).not.toContainSource("selected ? 'pr-20' : ''");
    expect(reviewOriginalBodySource).not.toContainSource('shadow-[');
    expect(reviewOriginalBodySource).not.toContainSource('ring-1');
    expect(chapterEditorSource).toContainSource('className={`${REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS} ${');
    expect(reviewPanelSource).not.toContainSource("selected ? 'bg-[#EAF9FD] text-slate-900 ring-1 ring-[#9BEFFC]'");
    expect(reviewPanelSource).not.toContainSource('className={`rounded-xl border p-3 transition-colors ${');
    expect(reviewPanelSource).not.toContainSource('AI 返回“原文标注”JSON 后，这里会高亮问题片段并显示审核说明。');
    expect(chapterEditorSource).toContainSource('promptOptions:');
    expect(chapterEditorSource).toContainSource(
      "activeReviewPromptOptions.length === 0 ? [{ value: '', label: '无', disabled: true }] : activeReviewPromptOptions",
    );
    expect(chapterEditorSource).toContainSource(
      'reviewCommentPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))',
    );
    expect(chapterEditorSource).not.toContainSource('<span className="text-[#08AACE]">审核提示词</span>');
    expect(chapterEditorSource).not.toContainSource('<span className="text-slate-400">一级分类：审核</span>');
    expect(reviewPanelSource).toContainSource('未找到第${activeReviewChapter.serialNumber}章 章纲。');
    expect(chapterEditorSource).toContainSource("import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';");
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_font_size';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewFontSize() {');
    expect(chapterEditorSource).toContainSource(
      'const stored = localStorage.getItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY);',
    );
    expect(chapterEditorSource).toContainSource("REVIEW_PREVIEW_TYPOGRAPHY_VERSION = 'body-adapted-v1';");
    expect(chapterEditorSource).toContainSource("localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, '18');");
    expect(chapterEditorSource).toContainSource('return storedSize ?? 18;');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(() => readReviewPreviewFontSize());',
    );
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewFontSizeWithStorage = (nextFontSize: number) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, String(fontSize));',
    );
    expect(reviewPanelSource).toContainSource('ariaLabel="审核原文字号"');
    expect(reviewPanelSource).toContainSource('onChange={setReviewPreviewFontSizeWithStorage}');
    expect(chapterEditorSource).toContainSource('onModelChange={setReviewModelIdWithStorage}');
    expect(chapterEditorSource).not.toContainSource('onModelChange={setReviewModelId}');
    expect(chapterEditorSource).toContainSource(
      'if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;',
    );
    expect(chapterEditorSource).toContainSource(
      "if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;",
    );
    expect(chapterEditorSource.indexOf('lastOpenLogSignalRef.current = openLogSignal;')).toBeLessThan(
      chapterEditorSource.indexOf(
        "if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;",
      ),
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
      "const promptText = auditPromptText || [basePromptText, compareInstruction].filter(Boolean).join('\\n\\n');",
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
    expect(chapterEditorSource).toContainSource("const user = getReviewLogSection(reviewRequestLog, '其他要求')");
    expect(chapterEditorSource).toContainSource("title: '其他要求'");
    expect(logLayoutSource).toContainSource(
      'className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5"',
    );
    expect(chapterEditorSource).toContainSource("title: '关联章纲'");
    expect(chapterEditorSource).toContainSource('content: outline');
    expect(chapterEditorSource).toContainSource("title: '原文'");
    expect(chapterEditorSource).toContainSource("content: getReviewLogSection(reviewRequestLog, '原文')");
    expect(chapterEditorSource).toContainSource('export function getReviewLogFillGroupWeights(options: {');
    expect(chapterEditorSource).toContainSource('hasOutline: boolean;');
    expect(chapterEditorSource).toContainSource('hasUser: boolean;');
    expect(chapterEditorSource).toContainSource('original: options.hasOutline ? 1 : 2,');
    expect(chapterEditorSource).toContainSource('fillSingleGroup');
    expect(chapterEditorSource).toContainSource('fillGroupWeights={getReviewLogFillGroupWeights');
    expect(chapterEditorSource).not.toContainSource(
      'absolute inset-4 z-10 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
    );
    expect(chapterEditorSource).not.toContainSource("title: '关联内容'");
    expect(chapterEditorSource).not.toContainSource("title: '用户要求'");
    expect(chapterEditorSource).not.toContainSource('fillGroupId="context"');
    expect(chapterEditorSource).not.toContainSource('fillGroupId="original"');
    expect(reviewPanelSource).toContainSource('style={{ fontSize: reviewPreviewFontSize }}');
    expect(reviewPanelSource).not.toContainSource('xy-selected-orange-bg');
    expect(reviewPanelSource).not.toContainSource('grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-100');
    expect(chapterEditorSource).toContainSource("const REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS = 'space-y-0';");
    expect(chapterEditorSource).toContainSource(
      "'relative overflow-hidden rounded-xl border px-4 py-0 text-[15px] font-medium leading-8 transition-[background-color,border-color,color,opacity]'",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS = 'border-[#08AACE] bg-[#DDF5FA] text-slate-950';",
    );
    expect(chapterEditorSource).toContainSource(
      "'border-transparent bg-white text-slate-300 opacity-80 hover:bg-slate-50 hover:text-slate-500'",
    );
    expect(chapterEditorSource).not.toContainSource('shadow-[0_10px_24px_rgba(8,170,206,0.14)]');
    expect(chapterEditorSource).not.toContainSource('ring-1 ring-[#08AACE]/20');
    expect(reviewPanelSource).toContainSource('className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}');
    expect(reviewPanelSource).toContainSource('REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS');
    expect(reviewPanelSource).toContainSource('REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS');
    expect(reviewPanelSource).toContainSource('REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS');
    expect(reviewPanelSource).toContainSource('{index + 1}');
    expect(reviewPanelSource).not.toContainSource('当前选中');
    expect(reviewPanelSource).not.toContainSource('border-l-2 border-emerald-300 bg-emerald-50/35 px-3 py-1.5');
    expect(reviewPanelSource).not.toContainSource('<span className="font-black text-slate-800">当前章节：</span>');
    expect(reviewPanelSource).not.toContainSource('<span className="font-black text-slate-800">正文字数：</span>');
    expect(reviewPanelSource).not.toContainSource('<span className="font-black text-slate-800">关联章纲：</span>');
    expect(reviewPanelSource).not.toContainSource('<div className="relative mt-5 min-h-0 flex-1">');
    expect(chapterEditorSource).toContainSource('<div className="relative mt-3 min-h-0 flex-1">');
  });

  it('uses minimum left panel widths as review and status defaults for new works', () => {
    const chapterEditorSource = readChapterEditorSource();

    expect(chapterEditorSource).toContainSource('const REVIEW_PAGE_LEFT_WIDTH = 180;');
    expect(chapterEditorSource).toContainSource('const STATUS_PAGE_LEFT_WIDTH = 190;');
    expect(chapterEditorSource).toContainSource('const REVIEW_PAGE_LEFT_WIDTH_LIMIT = { min: 180, max: 360 };');
    expect(chapterEditorSource).toContainSource('const STATUS_PAGE_LEFT_WIDTH_LIMIT = { min: 190, max: 360 };');
    expect(chapterEditorSource).not.toContainSource('const REVIEW_PAGE_LEFT_WIDTH = 220;');
    expect(chapterEditorSource).not.toContainSource('const STATUS_PAGE_LEFT_WIDTH = 230;');
  });

  it('uses the same draggable modal shell behavior for the standalone status workflow', () => {
    const chapterEditorEntrySource = readSource('ChapterEditor.tsx');
    const chapterEditorViewSource = readSource('ChapterEditorView.tsx');
    const statusPanelSource = readSource('ChapterStatusPanel.tsx');

    expect(chapterEditorEntrySource).toContainSource(
      "const statusModalDraggable = useDraggableModal('chapter_status_panel');",
    );
    expect(chapterEditorEntrySource).toContainSource('statusModalDraggable,');
    expect(chapterEditorViewSource).toContainSource('statusModalDraggable,');
    expect(chapterEditorViewSource).toContainSource('statusModalDraggable={statusModalDraggable}');
    expect(statusPanelSource).toContainSource('data-draggable-managed="true"');
    expect(statusPanelSource).toContainSource('data-global-modal-static="true"');
    expect(statusPanelSource).toContainSource('statusModalDraggable.dragHandleProps');
    expect(statusPanelSource).toContainSource("statusModalDraggable.getResizeHandleProps('top')");
    expect(statusPanelSource).toContainSource("statusModalDraggable.getResizeHandleProps('bottom')");
    expect(statusPanelSource).toContainSource("statusModalDraggable.getResizeHandleProps('left')");
    expect(statusPanelSource).toContainSource("statusModalDraggable.getResizeHandleProps('right')");
    expect(statusPanelSource).toContainSource('statusModalDraggable.resizeHandleProps');
    expect(statusPanelSource).not.toContainSource('w-[min(1280px,94vw)]');
  });

  it('keeps the editor paper line mode in the real chapter editor font settings', () => {
    const chapterEditorSource = readChapterEditorSource();
    const modalSource = readEditorToolModalsSource();

    expect(modalSource).toContainSource("export type EditorGridLineMode = 'none' | 'solid' | 'dashed';");
    expect(modalSource).toContainSource("gridLineMode: 'dashed'");
    expect(modalSource).toContainSource("gridLineEnabled: gridLineMode !== 'none'");
    expect(modalSource).toContainSource('export const EDITOR_GRID_LINE_LEFT_OFFSET_PX = 64;');
    expect(modalSource).toContainSource('export const EDITOR_GRID_LINE_RIGHT_OFFSET_PX = 64;');
    expect(modalSource).toContainSource("const EDITOR_GRID_LINE_MASK_COLOR = '#FFFFFF';");
    expect(modalSource).toContainSource('const EDITOR_GRID_LINE_ROW_EXTRA_PX = 20;');
    expect(modalSource).toContainSource('const EDITOR_GRID_LINE_FOOT_GAP_PX = 1;');
    expect(modalSource).toContainSource("const dash = mode === 'dashed' ? \" stroke-dasharray='7 7'\" : '';");
    expect(modalSource).toContainSource("x1='${EDITOR_GRID_LINE_LEFT_OFFSET_PX}'");
    expect(modalSource).toContainSource('export function getEditorGridLineMetrics(fontSizePx: number)');
    expect(modalSource).toContainSource(
      'const lineHeightPx = Math.max(fontSizePx + EDITOR_GRID_LINE_ROW_EXTRA_PX, Math.round(fontSizePx * 1.75));',
    );
    expect(modalSource).toContainSource('const lineOffsetPx = lineHeightPx - EDITOR_GRID_LINE_FOOT_GAP_PX;');
    expect(modalSource).toContainSource('export function getEditorTextLineHeight(fontSettings: FontSettings)');
    expect(modalSource).toContainSource("if (gridLineMode === 'none') return fontSettings.lineHeight;");
    expect(modalSource).toContainSource('return `${getEditorGridLineMetrics(fontSettings.fontSize).lineHeightPx}px`;');
    expect(modalSource).toContainSource(
      'export function getEditorGridLineStyle(fontSettings: FontSettings, scrollTop = 0): CSSProperties',
    );
    expect(modalSource).toContainSource(
      'const { lineHeightPx, lineOffsetPx } = getEditorGridLineMetrics(fontSettings.fontSize);',
    );
    expect(modalSource).not.toContainSource(
      'const underlineGapPx = Math.max(8, Math.round(fontSettings.fontSize * 0.22));',
    );
    expect(modalSource).not.toContainSource('firstLineCoverHeightPx');
    expect(modalSource).not.toContainSource('EDITOR_GRID_LINE_TOP_MASK_EXTRA_PX');
    expect(modalSource).toContainSource(
      'const repeatedTopLineMaskHeightPx = Math.max(0, EDITOR_GRID_LINE_TOP_OFFSET_PX + lineOffsetPx - lineHeightPx + 4);',
    );
    expect(modalSource).toContainSource(
      'backgroundPosition: `left 0, right 0, 0 ${EDITOR_GRID_LINE_TOP_OFFSET_PX - scrollTop}px`',
    );
    expect(modalSource).toContainSource("backgroundRepeat: 'no-repeat, no-repeat, repeat-y'");
    expect(modalSource).toContainSource(
      'backgroundSize: `100% ${repeatedTopLineMaskHeightPx}px, ${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px 100%, ${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}px ${lineHeightPx}px`',
    );
    expect(modalSource).toContainSource('onClick={() => update({ gridLineMode: option.value })}');
    expect(modalSource).toContainSource('local.gridLineMode === option.value');
    expect(modalSource).not.toContainSource('checked={local.gridLineEnabled}');
    expect(modalSource).toContainSource('...getEditorGridLineStyle(local)');
    expect(modalSource).toContainSource('lineHeight: getEditorTextLineHeight(local)');
    expect(modalSource).toContainSource('const editorGridLineStyle = getEditorGridLineStyle(fontSettings);');
    expect(modalSource).toContainSource('const editorTextLineHeight = getEditorTextLineHeight(fontSettings);');
    expect(modalSource).toContainSource('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(modalSource).toContainSource('paddingLeft: editorTextPaddingLeft');
    expect(modalSource).toContainSource('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(modalSource).toContainSource('paddingRight: editorTextPaddingRight');
    expect(modalSource).toContainSource('export function applyParagraphIndentToText(text: string, enabled: boolean)');
    expect(modalSource).not.toContainSource('xy-wa-editor-paragraph-overlay');
    expect(modalSource).not.toContainSource("color: paragraphIndent ? fontSettings.fontColor : 'transparent'");
    expect(modalSource).not.toContainSource("const editorTextIndent = paragraphIndent ? '2em' : undefined;");
    expect(modalSource).not.toContainSource('textIndent: editorTextIndent');

    expect(chapterEditorSource).toContainSource('EDITOR_GRID_LINE_LEFT_OFFSET_PX,');
    expect(chapterEditorSource).toContainSource('EDITOR_GRID_LINE_RIGHT_OFFSET_PX,');
    expect(chapterEditorSource).toContainSource('getEditorGridLineStyle,');
    expect(chapterEditorSource).toContainSource('getEditorTextLineHeight,');
    expect(chapterEditorSource).toContainSource(
      'const editorGridLineStyle = useMemo(() => getEditorGridLineStyle(fontSettings, editorScrollTop), [editorScrollTop, fontSettings]);',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextLineHeight = useMemo(() => getEditorTextLineHeight(fontSettings), [fontSettings]);',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).not.toContainSource(
      "const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;",
    );
    expect(chapterEditorSource).toContainSource('...editorGridLineStyle');
    expect(chapterEditorSource).toContainSource("backgroundColor: 'transparent'");
    expect(chapterEditorSource).toContainSource('paddingLeft: editorTextPaddingLeft');
    expect(chapterEditorSource).toContainSource('paddingRight: editorTextPaddingRight');
    expect(chapterEditorSource).toContainSource('lineHeight: editorTextLineHeight');
    expect(chapterEditorSource).toContainSource(
      'const normalizeEditorText = (value: string) => applyParagraphIndentToText(value, formatSettings.paragraphIndent);',
    );
    expect(chapterEditorSource).toContainSource('color: fontSettings.fontColor');
    expect(chapterEditorSource).not.toContainSource(
      "color: formatSettings.paragraphIndent ? 'transparent' : fontSettings.fontColor",
    );
    expect(chapterEditorSource).not.toContainSource('textIndent: editorTextIndent');
    expect(chapterEditorSource).not.toContainSource('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).not.toContainSource(
      'const normalizeEditorText = (value: string) => stripLineIndents(value);',
    );
    expect(chapterEditorSource).toContainSource('const cleanedPaste = stripLineIndents(pasted);');
    expect(chapterEditorSource).toContainSource(
      "const insertText = formatSettings.paragraphIndent ? '\\n\\u3000\\u3000' : '\\n';",
    );
    expect(chapterEditorSource).toContainSource(
      'className="flex items-center gap-2 border-b border-[#e1e5eb] bg-white px-4 py-2"',
    );
    expect(chapterEditorSource).not.toContainSource('className="flex items-center gap-2 bg-white px-4 py-2"');
    expect(chapterEditorSource).not.toContainSource('normalizeParagraphIndents');
    expect(chapterEditorSource).not.toContainSource('PARAGRAPH_INDENT');
    expect(chapterEditorSource).not.toContainSource('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).toContainSource(
      'onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}',
    );
    expect(chapterEditorSource).toContainSource('placeholder=""');
    expect(chapterEditorSource).not.toContainSource('placeholder="从这里开始写..."');
    expect(chapterEditorSource).toContainSource(
      "const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#AEE7F1] bg-[#CDEFF6]",
    );
    expect(chapterEditorSource).toContainSource(
      "const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';",
    );
  });

  it('keeps high frequency word highlighting visible and color configurable', () => {
    const chapterEditorSource = readChapterEditorSource();
    const modalSource = readEditorToolModalsSource();

    expect(modalSource).toContainSource("const HIGH_FREQ_HIGHLIGHT_COLOR_KEY = 'xinyuexia_high_freq_highlight_color';");
    expect(modalSource).toContainSource('const highFreqHighlightColorOptions = [');
    expect(modalSource).toContainSource("{ label: '暖黄', value: '#FDE68A'");
    expect(modalSource).toContainSource("{ label: '浅青', value: '#BDEEF7'");
    expect(modalSource).toContainSource("{ label: '浅紫', value: '#DDD6FE'");
    expect(modalSource).toContainSource('function getStoredHighFreqHighlightColor()');
    expect(modalSource).toContainSource(
      'const [highlightColor, setHighlightColor] = useState(getStoredHighFreqHighlightColor);',
    );
    expect(modalSource).toContainSource('setHighlightColor(getStoredHighFreqHighlightColor());');
    expect(modalSource).toContainSource('writeJson(HIGH_FREQ_HIGHLIGHT_COLOR_KEY, highlightColor)');
    expect(modalSource).toContainSource('style={{ backgroundColor: option.value }}');
    expect(modalSource).toContainSource('backgroundColor: highlightOption.value');
    expect(modalSource).toContainSource('boxShadow: `0 0 0 1px ${highlightOption.ring}`');
    expect(modalSource).not.toContainSource('bg-yellow-300/90');
    expect(chapterEditorSource).toContainSource("backgroundColor: 'transparent'");
  });
});
