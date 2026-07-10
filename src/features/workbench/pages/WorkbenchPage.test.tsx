import { describe, expect, it } from 'vitest';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
};

describe('Workbench find replace modal placement', () => {
  it('opens from a body portal with centered default geometry', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const defaultGeometry = source.slice(
      source.indexOf('const FIND_REPLACE_DEFAULT_GEOMETRY'),
      source.indexOf('const FIND_REPLACE_MODAL_STORAGE_ID'),
    );
    const modalSource = source.slice(
      source.indexOf('function WorkbenchFindReplaceModal'),
      source.indexOf('function ManagementModal'),
    );

    expect(defaultGeometry).toContain('x: 0');
    expect(defaultGeometry).toContain('y: 0');
    expect(defaultGeometry).toContain('width: 592');
    expect(defaultGeometry).not.toContain('left:');
    expect(defaultGeometry).not.toContain('top:');
    expect(source).toContain("const FIND_REPLACE_MODAL_STORAGE_ID = 'workbench_find_replace_centered_v2';");
    expect(modalSource).toContain('return createPortal(');
    expect(modalSource).toContain('document.body');
    expect(modalSource).toContain('WebkitAppRegion');
  });

  it('keeps centered draggable geometry inside the viewport before saving', async () => {
    const source = await readSource('../../../shared/hooks/useDraggableModal.ts');

    expect(source).toContain("const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';");
    expect(source).toContain('const APP_SCALE_ROOT_SELECTOR = \'[data-capsule-select-portal-root="true"]\';');
    expect(source).toContain('const MAX_MODAL_VIEWPORT_RATIO = 0.8;');
    expect(source).toContain('const RESIZE_ACTIVATION_DISTANCE_PX = 8;');
    expect(source).toContain('function getEffectiveModalScale()');
    expect(source).toContain('function getModalScaleContext(element?: HTMLElement | null)');
    expect(source).toContain('const scaleRoot = element?.closest(APP_SCALE_ROOT_SELECTOR) as HTMLElement | null;');
    expect(source).toContain('const visualViewportWidth = window.innerWidth / scale;');
    expect(source).toContain('const visualViewportHeight = window.innerHeight / scale;');
    expect(source).toContain('Math.floor(viewportWidth * MAX_MODAL_VIEWPORT_RATIO)');
    expect(source).toContain('Math.floor(viewportHeight * MAX_MODAL_VIEWPORT_RATIO)');
    expect(source).toContain('(rect.left - originLeft) / scale');
    expect(source).toContain('(rect.top - originTop) / scale');
    expect(source).toContain('getViewportBounds(resize.element)');
    expect(source).toContain('getModalScaleContext(resize.element)');
    expect(source).toContain('Math.hypot(deltaX * scale, deltaY * scale) < RESIZE_ACTIVATION_DISTANCE_PX');
    expect(source).toContain(
      'function clampFixedGeometryToVisualViewport(element: HTMLElement, geometry: ModalGeometry)',
    );
    expect(source).toContain('const rect = element.getBoundingClientRect();');
    expect(source).toContain('rect.bottom > visualBottom - visualPadding');
    expect(source).toContain('const centeredWidth = Number.isFinite(next.width) ? Number(next.width) : 0;');
    expect(source).toContain('(visualViewportWidth - centeredWidth) / 2 - VIEWPORT_PADDING / 2');
    expect(source).toContain('next = clampFixedGeometryToVisualViewport(resize.element, next);');
    expect(source).toContain('const next = normalizeGeometryToViewport(rawNext);');
    expect(source).toContain('saveGeometry(storageKey, next);');
  });

  it('renders top-level prompt and model management modals fixed in the body portal', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const modalSource = source.slice(
      source.indexOf('function ManagementModal'),
      source.indexOf('function EditorSettingsModal'),
    );

    expect(modalSource).toContain('return createPortal(');
    expect(modalSource).toContain('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(modalSource).toContain('document.body');
    expect(modalSource).toContain('data-global-modal-static="true"');
    expect(modalSource).toContain('items-center justify-center');
    expect(modalSource).toContain('<ModelManagePage embedded onClose={onClose} />');
    expect(modalSource).not.toContain('useDraggableModal');
    expect(modalSource).not.toContain('data-draggable-managed');
    expect(modalSource).not.toContain('ModalResizeHandles');
    expect(modalSource).not.toContain('headerDragHandleProps');
    expect(modalSource).not.toContain('WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS');
  });
});

describe('Workbench splitters', () => {
  it('uses the minimum sidebar widths as the default for new works', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('const CHAPTER_SIDEBAR_MIN_WIDTH = 200;');
    expect(source).toContain('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = CHAPTER_SIDEBAR_MIN_WIDTH;');
    expect(source).toContain('const PUBLISHED_SIDEBAR_MIN_WIDTH = 170;');
    expect(source).toContain('const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = PUBLISHED_SIDEBAR_MIN_WIDTH;');
    expect(source).not.toContain('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 300;');
    expect(source).not.toContain('const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = 190;');
  });

  it('overlays draggable hit areas on the existing panel border lines', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize');
    expect(source).toContain('h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100');
    expect(source).not.toContain('bg-[#EF4444] opacity-0');
    expect(source).not.toContain('h-8 w-px rounded-full bg-slate-300');
  });
  it('does not allow empty chapter content sources to be selected or confirmed', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('function hasContextContent(item: WorkbenchLinkedContextItem | null | undefined)');
    expect(source).toContain('const canPickChapter = rowSelectable && chapterWordCount > 0;');
    expect(source).toContain(
      'const canPickSummary = Boolean(row.summaryItem) && !row.isCurrent && summaryWordCount > 0;',
    );
    expect(source).toContain('const outlineLocked = lockedIds.has(row.outlineItem.id);');
    expect(source).toContain('disabled={!canPickChapter}');
    expect(source).toContain('disabled={!canPickSummary}');
    expect(source).toContain('if (!hasContextContent(item)) return;');
    expect(source).toContain('&& draftContextWordCount > 0');
    expect(source).toContain('&& selectedDraftContextItems.every(hasContextContent);');
    expect(source).toContain("const contextLibraryConfirmTitle = canConfirmContextLibrary ? '确认关联资料'");
    expect(source).toContain("'请选择至少一项有内容的资料';");
  });
});

describe('Workbench flow stats', () => {
  it('routes the header log button through the active page handler before falling back to signal broadcast', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('type HeaderLogOpenHandler = () => void;');
    expect(source).toContain('const headerLogOpenHandlerRef = useRef<HeaderLogOpenHandler | null>(null);');
    expect(source).toContain(
      'const registerHeaderLogOpenHandler = useCallback((handler: HeaderLogOpenHandler | null) => {',
    );
    expect(source).toContain('headerLogOpenHandlerRef.current = handler;');
    expect(source).toContain('const openHeaderLog = useCallback(() => {');
    expect(source).toContain('const handler = headerLogOpenHandlerRef.current;');
    expect(source).toContain('handler();');
    expect(source).toContain('setAiLogOpenSignal((value) => value + 1);');
    expect(source).toContain('onOpenLog={openHeaderLog}');
    expect(source).toContain('onRegisterHeaderLog={registerHeaderLogOpenHandler}');
  });

  it('tracks unpolished chapter count from content fingerprints', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      "import { countUnpolishedChapters } from '@/features/workbench/model/chapterPolishStatus';",
    );
    expect(source).toContain('const unpolishedChapterCount = countUnpolishedChapters(');
    expect(source).toContain(
      "polish: { meta: `${unpolishedChapterCount}章未润色`, tone: unpolishedChapterCount > 0 ? 'warning' : 'normal' },",
    );
  });

  it('marks summary flow as warning when summary chapters are fewer than writing chapters', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      'const summaryChapterSerials = new Set(summaryContextItems.map((item) => getContextEntrySerial(item.title)).filter(Boolean));',
    );
    expect(source).toContain(
      'const summaryChapterCount = summaryChapterSerials.size > 0 ? summaryChapterSerials.size : summaryContextItems.length;',
    );
    expect(source).toContain(
      "summary: { meta: `${summaryChapterCount}章`, tone: summaryChapterCount < chapterCount ? 'warning' : 'normal' },",
    );
    expect(source).not.toContain('summary: { meta: `${summaryContextItems.length}章` },');
  });
});

describe('Workbench library snapshots', () => {
  it('keeps parent flow stats and linked AI context synchronized with library writes', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      'function useWorkbenchLibrarySnapshots(settingsStorageKey: string, outlineStorageKey: string)',
    );
    expect(source).toContain('WORKBENCH_LIBRARY_UPDATED_EVENT');
    expect(source).toContain('GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY');
    expect(source).toContain('window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, handleLibraryUpdated);');
    expect(source).toContain("window.addEventListener('storage', handleStorage);");
    expect(source).toContain('shouldSyncWorkbenchLibrarySnapshot(storageKey, settingsStorageKey, outlineStorageKey)');
    expect(source).toContain('shouldSyncWorkbenchLibrarySnapshot(event.key, settingsStorageKey, outlineStorageKey)');
    expect(source).toContain(
      'const { settingsEntries, outlineEntries } = useWorkbenchLibrarySnapshots(settingsStorageKey, outlineStorageKey);',
    );
    expect(source).not.toContain(
      'const settingsEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey);',
    );
    expect(source).not.toContain('const outlineEntries = readWorkbenchLibraryEntries(outlineStorageKey);');
  });

  it('normalizes legacy setting and brainstorm tabs before building parent context stats', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      "import { BRAINSTORM_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';",
    );
    expect(source).toContain('settingsEntries.filter((entry) => normalizeTabName(entry.tab) === SETTING_TAB)');
    expect(source).toContain(
      'settingsEntries.filter((entry) => normalizeTabName(entry.tab) === BRAINSTORM_TAB).length',
    );
    expect(source).not.toContain("settingsEntries.filter((entry) => entry.tab === '大纲')");
    expect(source).not.toContain("settingsEntries.filter((entry) => entry.tab === '脑洞')");
  });
});

describe('Workbench linked context clearing', () => {
  it('does not reattach required outline context after the AI panel clears linked materials', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      'const shouldAttachRequiredContext = !contextSelectionTouched || linkedContextItems.length > 0;',
    );
    expect(source).toContain(
      'const effectiveRequiredContextItems = shouldAttachRequiredContext ? requiredContextItems : [];',
    );
    expect(source).toContain(
      'const effectiveLinkedContextItems = mergeContextItems([...effectiveRequiredContextItems, ...optionalLinkedContextItems]);',
    );
    expect(source).toContain('setContextSelectionTouched(true);');
    expect(source).toContain('updateLinkedContextItems([]);');
  });

  it('saves required outline items when confirming linked materials from the context library', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain(
      'const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);',
    );
    expect(source).toContain('updateLinkedContextItems(confirmedSelectedItems);');
    expect(source).toContain('setDraftContextIds(new Set(confirmedSelectedItems.map((item) => item.id)));');
    expect(source).toContain('确认关联');
    expect(source).not.toContain('确认读取');
    expect(source).toContain('title={contextLibraryConfirmTitle}');
  });

  it('locks the current chapter outline and keeps previous chapter outline out of optional selections', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('<ContextSelectionDot checked={selectedOutline} disabled locked={outlineLocked} />');
    expect(source).toContain('label={`第${row.serialNumber}章章纲`}');
    expect(source).toContain('const rowIds = [');
    expect(source).toContain('row.chapterItem.id,');
    expect(source).toContain('row.summaryItem?.id,');
    expect(source).not.toContain('row.isCurrent ? null : row.outlineItem.id');
    expect(source).not.toContain(
      'if (!selected) {\n        if (hasContextContent(row.outlineItem)) next.add(row.outlineItem.id);',
    );
    expect(source).toContain('if (item.id === row.outlineItem.id) return;');
    expect(source).toContain(
      'const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);',
    );
  });
});

describe('ChapterEditor prompt snapshots', () => {
  it('subscribes to prompt library updates for review and status prompt selects', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain("from '@/features/prompts/hooks/usePrompts';");
    expect(source).toContain('normalizePromptCategoryName');
    expect(source).toContain('usePrompts');
    expect(source).toContain('const { prompts: reviewPrompts } = usePrompts();');
    expect(source).not.toContain('readPromptSnapshot().prompts');
    expect(source).not.toContain('import { normalizePromptCategoryName, readPromptSnapshot }');
  });

  it('uses review mode prompt categories for chapter review prompt selects', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain('const REVIEW_MODE_PROMPT_CATEGORIES: Record<ReviewMode, string> = {');
    expect(source).toContain("audit: '审核'");
    expect(source).toContain('comment: COMMENT_PROMPT_CATEGORY');
    expect(source).toContain('polish: POLISH_PROMPT_CATEGORY');
    expect(source).toContain('const reviewAuditPrompts = useMemo(() => {');
    expect(source).toContain("normalizePromptCategoryName(prompt.category) === '审核'");
    expect(source).toContain('const reviewCommentPrompts = useMemo(() => {');
    expect(source).toContain('normalizePromptCategoryName(prompt.category) === COMMENT_PROMPT_CATEGORY');
    expect(source).toContain('const reviewPolishPrompts = useMemo(() => {');
    expect(source).toContain('normalizePromptCategoryName(prompt.category) === POLISH_PROMPT_CATEGORY');
    expect(source).toContain('const activeReviewPromptOptions =');
    expect(source).toContain('? buildAuditPromptSelectOptions(reviewAuditPrompts)');
    expect(source).toContain('const activeReviewPromptCategory = REVIEW_MODE_PROMPT_CATEGORIES[reviewMode];');
    expect(source).not.toContain('const activeReviewPromptOptions = bodyPrompts;');
    expect(source).not.toContain('const activeReviewPromptCategory = BODY_PROMPT_CATEGORY;');
  });

  it('does not restore finished review background outputs into a fresh review page', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain(
      'function getRestorableReviewBackgroundTaskId(settingsStorageKey: string, taskId?: string) {',
    );
    expect(source).toContain("if (!task || task.status !== 'running') return undefined;");
    expect(source).toContain(
      "if (task.meta?.target !== 'chapterReview' || task.meta.settingsStorageKey !== settingsStorageKey) return undefined;",
    );
    expect(source).toContain('function readRestorableReviewBackgroundTaskIds(settingsStorageKey: string) {');
    expect(source).toContain(
      'else if (storedTaskIds[mode]) writeReviewBackgroundTaskId(settingsStorageKey, mode, undefined);',
    );
    expect(source).toContain('const storedTaskIds = readRestorableReviewBackgroundTaskIds(settingsStorageKey);');
    expect(source).not.toContain('?? readReviewBackgroundTaskIds(settingsStorageKey)[reviewMode]');
  });

  it('keeps review annotation preview empty before AI output exists', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain(') : !reviewAiOutput.trim() && !isAuditStructureReview ? (');
    expect(source).toContain('{activeReviewModeTitle}后内容会显示在这里。');
    expect(source).toContain(') : reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (');
  });

  it('keeps review prompt and model management modals fixed at 80 percent', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain('const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS =');
    expect(source).toContain(
      "'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';",
    );
    expect(source).toContain("const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';");
    expect(source).toContain('const reviewManagementModalSizeClass = isEmbeddedReviewMode');
    expect(source).toContain('? REVIEW_MANAGEMENT_MODAL_SIZE_CLASS');
    expect(source).toContain(': REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS;');
    expect(source).toContain(
      'className={`flex ${REVIEW_MANAGEMENT_MODAL_SIZE_CLASS} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}',
    );
    expect(source).toContain(
      'className={`flex ${reviewManagementModalSizeClass} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}',
    );
    expect(source).not.toContain("from '@/features/workbench/components/workbenchManagementModalSize';");
  });

  it('renders audit results in the middle review column instead of the right input panel', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContain("const AUDIT_OUTLINE_FIT_ITEM = '章纲贴合度';");
    expect(source).toContain('const AUDIT_STRUCTURE_CHECK_ITEMS = [');
    expect(source).toContain('AUDIT_OUTLINE_FIT_ITEM,');
    expect(source).toContain('const AUDIT_STRUCTURE_PROMPT_FORMAT = `请按软件可识别的固定格式输出。');
    expect(source).toContain('每一项只能选择：通过 / 不通过');
    expect(source).toContain('不要输出“部分通过”“基本通过”等第三种状态');
    expect(source).toContain('【审核项】章纲贴合度');
    expect(source).toContain('【贴合度】0%-100%');
    expect(source).toContain('【审核项】前后逻辑是否清楚');
    expect(source).toContain('【审核项】剧情推进是否顺畅');
    expect(source).toContain('【审核项】伏笔/设定是否矛盾');
    expect(source).toContain('【结果】通过 / 不通过');
    expect(source).toContain('【剧情审核结论】通过 / 不通过');
    expect(source).toContain('不要新增、删除、改名审核项');
    expect(source).toContain('function buildAuditPromptSelectOptions');
    expect(source).toContain("const metaLabel = subCategory === '文本审核' ? '文本' : '剧情';");
    expect(source).toContain('return items.map((prompt) => ({ value: prompt.id, label: prompt.name, metaLabel }));');
    expect(source).not.toContain('value: `__audit_group_${subCategory}`');
    expect(source).not.toContain("variant: 'groupedOption' as const");
    expect(source).toContain('function getAuditStructureItemStatus(output: string, item: string) {');
    expect(source).toContain('function getAuditOutlineFitPercent(output: string) {');
    expect(source).toContain('function getAuditStructureItemDetail(output: string, item: string) {');
    expect(source).toContain("description: getAuditBracketField(section, '说明')");
    expect(source).toContain("suggestion: getAuditBracketField(section, '建议')");
    expect(source).toContain('const explicitResult = targetText.match(/【结果】\\s*(不通过|通过)/)');
    expect(source).toContain("return 'passed' as const;");
    expect(source).toContain("return 'failed' as const;");
    expect(source).toContain(
      'function isTextAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {',
    );
    expect(source).toContain("return getAuditPromptSubcategory(prompt) === '文本审核';");
    expect(source).toContain(
      'function isStructureAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {',
    );
    expect(source).toContain("return getAuditPromptSubcategory(prompt) === '剧情审核';");
    expect(source).toContain('const isAuditTextReview = reviewMode ===');
    expect(source).toContain('const isAuditStructureReview = reviewMode ===');
    expect(source).toContain('const auditRevisedText = useMemo(');
    expect(source).toContain('reviewRevisedDraft.trim() ||');
    expect(source).toContain(
      "() => (isAuditTextReview ? reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput) : '')",
    );
    expect(source).toContain('function buildReviewTextDiff(originalText: string, revisedText: string) {');
    expect(source).toContain('const REVIEW_TEXT_DIFF_MAX_CELLS = 320_000;');
    expect(source).toContain('function renderTextAuditOriginalDiff(originalText: string, revisedText?: string) {');
    expect(source).toContain(
      'function renderTextAuditRevisedDiff(originalText: string | undefined, revisedText: string | undefined) {',
    );
    expect(source).toContain('className="rounded bg-red-50 px-0.5 text-red-400 line-through"');
    expect(source).toContain('className="font-black text-red-500"');
    expect(source).toContain('整段已删除');
    expect(source).toContain('审核后缺少本段，请让 AI 保留段落位置。');
    expect(source).toContain('renderTextAuditOriginalDiff(paragraph, auditRevisedParagraphs[index])');
    expect(source).toContain('renderTextAuditRevisedDiff(originalParagraph, revisedParagraph)');
    expect(source).toContain('grid grid-cols-[2rem_minmax(0,1fr)] gap-2');
    expect(source).toContain('aria-label={`第 ${index + 1} 段`}');
    expect(source).toContain('{index + 1}');
    expect(source).not.toContain("第 {index + 1} 段{originalParagraph === undefined ? ' · 新增段落' : ''}");
    expect(source).toContain('Math.max(reviewOriginalParagraphs.length, auditRevisedParagraphs.length)');
    expect(source).toContain('如果认为某一整段应删除，请保留该段位置为空段，不要让后续段落前移；');
    expect(source).toContain(
      '软件会自动把审核后新增或改写的字句标成红色，请不要自行添加 HTML、Markdown 标记或颜色说明。',
    );
    expect(source).not.toContain("(isAuditTextReview ? auditVisibleOutput : '')");
    expect(source).toContain(
      'const auditParagraphCountMatches = reviewOriginalParagraphs.length === auditRevisedParagraphs.length;',
    );
    expect(source).toContain(') : !reviewAiOutput.trim() && !isAuditStructureReview ? (');
    expect(source).toContain(') : isAuditTextReview ? (');
    expect(source).toContain('原文 {reviewOriginalParagraphs.length} 段 / 审核后 {auditRevisedParagraphs.length} 段');
    expect(source).toContain(') : isAuditStructureReview ? (');
    expect(source).toContain('AUDIT_STRUCTURE_CHECK_ITEMS.map((item) => {');
    expect(source).toContain('const itemStatus = getAuditStructureItemStatus(reviewAiOutput, item);');
    expect(source).toContain(
      'const [expandedAuditStructureItems, setExpandedAuditStructureItems] = useState<Set<string>>(() => new Set());',
    );
    expect(source).toContain('const toggleAuditStructureItem = (item: string) => {');
    expect(source).toContain('const expanded = expandedAuditStructureItems.has(item);');
    expect(source).toContain('const itemDetail = getAuditStructureItemDetail(reviewAiOutput, item);');
    expect(source).toContain('onClick={() => toggleAuditStructureItem(item)}');
    expect(source).toContain('aria-expanded={expanded}');
    expect(source).toContain('className={`h-4 w-4 shrink-0 transition-transform');
    expect(source).toContain("${expanded ? 'rotate-180' : '-rotate-90'}");
    expect(source).toContain("{itemDetail.description || '暂无说明。'}");
    expect(source).toContain("{itemDetail.suggestion || '暂无建议。'}");
    expect(source).toContain("章纲贴合度: ['章纲贴合度', '是否偏离章纲', '是否符合章纲'");
    expect(source).toContain('const outlineFitPercent =');
    expect(source).toContain('item === AUDIT_OUTLINE_FIT_ITEM ? getAuditOutlineFitPercent(reviewAiOutput) : null;');
    expect(source).toContain('const itemStatusLabel =');
    expect(source).toContain('outlineFitPercent !== null');
    expect(source).toContain("前后逻辑是否清楚: ['前后逻辑是否清楚', '因果是否清楚'");
    expect(source).toContain("剧情推进是否顺畅: ['剧情推进是否顺畅', '节奏是否断裂'");
    expect(source).toContain("? '文本审核'");
    expect(source).toContain(": '剧情审核'");
    expect(source).toContain('`第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`');
    expect(source).not.toContain("reviewMode === 'audit' ? '审核后'");
    expect(source).not.toContain('{auditVisibleOutput}');
    expect(source).not.toContain('本章主要事情是否清楚：通过 / 部分通过 / 不通过');
    expect(source).not.toContain("itemStatus === 'partial'");
    expect(source).not.toContain("'部分通过'");
    expect(source).toContain('renderAiThinkingContent(reviewAiOutput)');
    expect(source).toContain('AI 思考过程和文字输出会显示在这里');
  });
});
