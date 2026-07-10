import { describe, expect, it } from 'vitest';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
};

describe('Workbench library loading', () => {
  it('loads the large library panel only when a library flow is opened', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const managementModalSource = await readSource('../components/WorkbenchManagementModal.tsx');

    expect(source).toContainSource('const LazyWorkbenchLibraryPanel = lazy(() =>');
    expect(source).toContainSource("import('@/features/workbench/components/WorkbenchLibraryPanel')");
    expect(managementModalSource).toContainSource("import('@/features/models/pages/ModelManagePage')");
    expect(managementModalSource).toContainSource("import('@/features/prompts/pages/PromptsPage')");
    expect(source).not.toContainSource(
      "import { WorkbenchLibraryPanel } from '@/features/workbench/components/WorkbenchLibraryPanel';",
    );
    expect(source).toContainSource('<Suspense');
  });
});

describe('Workbench page component boundaries', () => {
  it('keeps the chapter export selection UI in its own component', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const exportPanelSource = await readSource('../components/ChapterExportPanel.tsx');

    expect(source).toContainSource("from '@/features/workbench/components/ChapterExportPanel';");
    expect(source).not.toContainSource('function ChapterExportPanel({');
    expect(exportPanelSource).toContainSource('export function ChapterExportPanel({');
  });

  it('keeps chapter export formatting in a pure model module', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const exportSource = await readSource('../model/chapterExport.ts');

    expect(source).toContainSource("from '@/features/workbench/model/chapterExport';");
    expect(source).not.toContainSource('export function buildChapterExportText(');
    expect(exportSource).toContainSource('export function buildChapterExportText(');
    expect(exportSource).toContainSource('export function buildChapterExportDoc(');
  });

  it('keeps editor settings in its own component', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const modalSource = await readSource('../components/WorkbenchEditorSettingsModal.tsx');

    expect(source).toContainSource(
      "import { WorkbenchEditorSettingsModal } from '@/features/workbench/components/WorkbenchEditorSettingsModal';",
    );
    expect(source).not.toContainSource('function EditorSettingsModal({');
    expect(modalSource).toContainSource('export function WorkbenchEditorSettingsModal({');
  });

  it('keeps model and prompt management in its own portal component', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const modalSource = await readSource('../components/WorkbenchManagementModal.tsx');

    expect(source).toContainSource("from '@/features/workbench/components/WorkbenchManagementModal';");
    expect(source).not.toContainSource('function ManagementModal({');
    expect(modalSource).toContainSource('export function WorkbenchManagementModal({');
  });

  it('keeps context preview and explicit selection in its own component', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const contextSource = await readSource('../components/WorkbenchContextSelectionColumn.tsx');

    expect(source).toContainSource("from '@/features/workbench/components/WorkbenchContextSelectionColumn';");
    expect(source).not.toContainSource('function ContextSelectionColumn({');
    expect(contextSource).toContainSource('onClick={() => setPreviewItemId(item.id)}');
    expect(contextSource).toContainSource('role="checkbox"');
    expect(contextSource).toContainSource('onToggle(item.id);');
  });
});

describe('Workbench find replace modal placement', () => {
  it('opens from a body portal with centered default geometry', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const modalSource = await readSource('../components/WorkbenchFindReplaceModal.tsx');
    const defaultGeometry = modalSource.slice(
      modalSource.indexOf('const FIND_REPLACE_DEFAULT_GEOMETRY'),
      modalSource.indexOf('const FIND_REPLACE_MODAL_STORAGE_ID'),
    );

    expect(defaultGeometry).toContainSource('x: 0');
    expect(defaultGeometry).toContainSource('y: 0');
    expect(defaultGeometry).toContainSource('width: 592');
    expect(defaultGeometry).not.toContainSource('left:');
    expect(defaultGeometry).not.toContainSource('top:');
    expect(source).toContainSource(
      "import { WorkbenchFindReplaceModal } from '@/features/workbench/components/WorkbenchFindReplaceModal';",
    );
    expect(modalSource).toContainSource("const FIND_REPLACE_MODAL_STORAGE_ID = 'workbench_find_replace_centered_v2';");
    expect(modalSource).toContainSource('return createPortal(');
    expect(modalSource).toContainSource('document.body');
    expect(modalSource).toContainSource('WebkitAppRegion');
  });

  it('keeps centered draggable geometry inside the viewport before saving', async () => {
    const source = await readSource('../../../shared/hooks/useDraggableModal.ts');

    expect(source).toContainSource("const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';");
    expect(source).toContainSource('const APP_SCALE_ROOT_SELECTOR = \'[data-capsule-select-portal-root="true"]\';');
    expect(source).toContainSource('const MAX_MODAL_VIEWPORT_RATIO = 0.8;');
    expect(source).toContainSource('const RESIZE_ACTIVATION_DISTANCE_PX = 8;');
    expect(source).toContainSource('function getEffectiveModalScale()');
    expect(source).toContainSource('function getModalScaleContext(element?: HTMLElement | null)');
    expect(source).toContainSource(
      'const scaleRoot = element?.closest(APP_SCALE_ROOT_SELECTOR) as HTMLElement | null;',
    );
    expect(source).toContainSource('const visualViewportWidth = window.innerWidth / scale;');
    expect(source).toContainSource('const visualViewportHeight = window.innerHeight / scale;');
    expect(source).toContainSource('Math.floor(viewportWidth * MAX_MODAL_VIEWPORT_RATIO)');
    expect(source).toContainSource('Math.floor(viewportHeight * MAX_MODAL_VIEWPORT_RATIO)');
    expect(source).toContainSource('(rect.left - originLeft) / scale');
    expect(source).toContainSource('(rect.top - originTop) / scale');
    expect(source).toContainSource('getViewportBounds(resize.element)');
    expect(source).toContainSource('getModalScaleContext(resize.element)');
    expect(source).toContainSource('Math.hypot(deltaX * scale, deltaY * scale) < RESIZE_ACTIVATION_DISTANCE_PX');
    expect(source).toContainSource(
      'function clampFixedGeometryToVisualViewport(element: HTMLElement, geometry: ModalGeometry)',
    );
    expect(source).toContainSource('const rect = element.getBoundingClientRect();');
    expect(source).toContainSource('rect.bottom > visualBottom - visualPadding');
    expect(source).toContainSource('const centeredWidth = Number.isFinite(next.width) ? Number(next.width) : 0;');
    expect(source).toContainSource('(visualViewportWidth - centeredWidth) / 2 - VIEWPORT_PADDING / 2');
    expect(source).toContainSource('next = clampFixedGeometryToVisualViewport(resize.element, next);');
    expect(source).toContainSource('const next = normalizeGeometryToViewport(rawNext);');
    expect(source).toContainSource('saveGeometry(storageKey, next);');
  });

  it('renders top-level prompt and model management modals fixed in the body portal', async () => {
    const modalSource = await readSource('../components/WorkbenchManagementModal.tsx');

    expect(modalSource).toContainSource('return createPortal(');
    expect(modalSource).toContainSource('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(modalSource).toContainSource('document.body');
    expect(modalSource).toContainSource('data-global-modal-static="true"');
    expect(modalSource).toContainSource('items-center justify-center');
    expect(modalSource).toContainSource('<LazyModelManagePage embedded onClose={onClose} />');
    expect(modalSource).toContainSource('<LazyPromptsPage />');
    expect(modalSource).not.toContainSource('useDraggableModal');
    expect(modalSource).not.toContainSource('data-draggable-managed');
    expect(modalSource).not.toContainSource('ModalResizeHandles');
    expect(modalSource).not.toContainSource('headerDragHandleProps');
    expect(modalSource).not.toContainSource('WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS');
  });
});

describe('Workbench splitters', () => {
  it('uses the minimum sidebar widths as the default for new works', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource('const CHAPTER_SIDEBAR_MIN_WIDTH = 200;');
    expect(source).toContainSource('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = CHAPTER_SIDEBAR_MIN_WIDTH;');
    expect(source).toContainSource('const PUBLISHED_SIDEBAR_MIN_WIDTH = 170;');
    expect(source).toContainSource('const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = PUBLISHED_SIDEBAR_MIN_WIDTH;');
    expect(source).not.toContainSource('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 300;');
    expect(source).not.toContainSource('const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = 190;');
  });

  it('overlays draggable hit areas on the existing panel border lines', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource('group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize');
    expect(source).toContainSource('h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100');
    expect(source).not.toContainSource('bg-[#EF4444] opacity-0');
    expect(source).not.toContainSource('h-8 w-px rounded-full bg-slate-300');
  });
  it('does not allow empty chapter content sources to be selected or confirmed', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource('function hasContextContent(item: WorkbenchLinkedContextItem | null | undefined)');
    expect(source).toContainSource('const canPickChapter = rowSelectable && chapterWordCount > 0;');
    expect(source).toContainSource(
      'const canPickSummary = Boolean(row.summaryItem) && !row.isCurrent && summaryWordCount > 0;',
    );
    expect(source).toContainSource('const outlineLocked = lockedIds.has(row.outlineItem.id);');
    expect(source).toContainSource('disabled={!canPickChapter}');
    expect(source).toContainSource('disabled={!canPickSummary}');
    expect(source).toContainSource('if (!hasContextContent(item)) return;');
    expect(source).toContainSource('&& draftContextWordCount > 0');
    expect(source).toContainSource('&& selectedDraftContextItems.every(hasContextContent);');
    expect(source).toContainSource("const contextLibraryConfirmTitle = canConfirmContextLibrary ? '确认关联资料'");
    expect(source).toContainSource("'请选择至少一项有内容的资料';");
  });
});

describe('Workbench flow stats', () => {
  it('routes the header log button through the active page handler before falling back to signal broadcast', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource('type HeaderLogOpenHandler = () => void;');
    expect(source).toContainSource('const headerLogOpenHandlerRef = useRef<HeaderLogOpenHandler | null>(null);');
    expect(source).toContainSource(
      'const registerHeaderLogOpenHandler = useCallback((handler: HeaderLogOpenHandler | null) => {',
    );
    expect(source).toContainSource('headerLogOpenHandlerRef.current = handler;');
    expect(source).toContainSource('const openHeaderLog = useCallback(() => {');
    expect(source).toContainSource('const handler = headerLogOpenHandlerRef.current;');
    expect(source).toContainSource('handler();');
    expect(source).toContainSource('setAiLogOpenSignal((value) => value + 1);');
    expect(source).toContainSource('onOpenLog={openHeaderLog}');
    expect(source).toContainSource('onRegisterHeaderLog={registerHeaderLogOpenHandler}');
  });

  it('tracks unpolished chapter count from content fingerprints', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource(
      "import { countUnpolishedChapters } from '@/features/workbench/model/chapterPolishStatus';",
    );
    expect(source).toContainSource('const unpolishedChapterCount = countUnpolishedChapters(');
    expect(source).toContainSource(
      "polish: { meta: `${unpolishedChapterCount}章未润色`, tone: unpolishedChapterCount > 0 ? 'warning' : 'normal' },",
    );
  });

  it('marks summary flow as warning when summary chapters are fewer than writing chapters', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource(
      'const summaryChapterSerials = new Set(summaryContextItems.map((item) => getContextEntrySerial(item.title)).filter(Boolean));',
    );
    expect(source).toContainSource(
      'const summaryChapterCount = summaryChapterSerials.size > 0 ? summaryChapterSerials.size : summaryContextItems.length;',
    );
    expect(source).toContainSource('summary: { meta: `${summaryChapterCount}');
    expect(source).toContainSource("tone: summaryChapterCount < chapterCount ? 'warning' : 'normal'");
    expect(source).not.toContainSource('summary: { meta: `${summaryContextItems.length}章` },');
  });
});

describe('Workbench library snapshots', () => {
  it('keeps parent flow stats and linked AI context synchronized with library writes', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const snapshotSource = await readSource('../hooks/useWorkbenchLibrarySnapshots.ts');

    expect(snapshotSource).toContainSource(
      'export function useWorkbenchLibrarySnapshots(settingsStorageKey: string, outlineStorageKey: string)',
    );
    expect(snapshotSource).toContainSource('WORKBENCH_LIBRARY_UPDATED_EVENT');
    expect(snapshotSource).toContainSource('GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY');
    expect(snapshotSource).toContainSource(
      'window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, handleLibraryUpdated);',
    );
    expect(snapshotSource).toContainSource("window.addEventListener('storage', handleStorage);");
    expect(snapshotSource).toContainSource(
      'shouldSyncWorkbenchLibrarySnapshot(storageKey, settingsStorageKey, outlineStorageKey)',
    );
    expect(snapshotSource).toContainSource(
      'shouldSyncWorkbenchLibrarySnapshot(event.key, settingsStorageKey, outlineStorageKey)',
    );
    expect(source).toContainSource(
      'const { settingsEntries, outlineEntries } = useWorkbenchLibrarySnapshots(settingsStorageKey, outlineStorageKey);',
    );
    expect(source).not.toContainSource(
      'const settingsEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey);',
    );
    expect(source).not.toContainSource('const outlineEntries = readWorkbenchLibraryEntries(outlineStorageKey);');
    expect(source).toContainSource('const reviewLibraryEntries = useMemo(');
    expect(source.match(/reviewLibraryEntries=\{reviewLibraryEntries\}/g)).toHaveLength(2);
  });

  it('normalizes legacy setting and brainstorm tabs before building parent context stats', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource(
      "import { BRAINSTORM_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';",
    );
    expect(source).toContainSource('settingsEntries.filter((entry) => normalizeTabName(entry.tab) === SETTING_TAB)');
    expect(source).toContainSource(
      'settingsEntries.filter((entry) => normalizeTabName(entry.tab) === BRAINSTORM_TAB).length',
    );
    expect(source).not.toContainSource("settingsEntries.filter((entry) => entry.tab === '大纲')");
    expect(source).not.toContainSource("settingsEntries.filter((entry) => entry.tab === '脑洞')");
  });
});

describe('Workbench linked context clearing', () => {
  it('does not reattach required outline context after the AI panel clears linked materials', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource(
      'const shouldAttachRequiredContext = !contextSelectionTouched || linkedContextItems.length > 0;',
    );
    expect(source).toContainSource(
      'const effectiveRequiredContextItems = shouldAttachRequiredContext ? requiredContextItems : [];',
    );
    expect(source).toContainSource(
      'const effectiveLinkedContextItems = mergeContextItems([...effectiveRequiredContextItems, ...optionalLinkedContextItems]);',
    );
    expect(source).toContainSource('setContextSelectionTouched(true);');
    expect(source).toContainSource('updateLinkedContextItems([]);');
  });

  it('saves required outline items when confirming linked materials from the context library', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource(
      'const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);',
    );
    expect(source).toContainSource('updateLinkedContextItems(confirmedSelectedItems);');
    expect(source).toContainSource('setDraftContextIds(new Set(confirmedSelectedItems.map((item) => item.id)));');
    expect(source).toContainSource('确认关联');
    expect(source).not.toContainSource('确认读取');
    expect(source).toContainSource('title={contextLibraryConfirmTitle}');
  });

  it('locks the current chapter outline and keeps previous chapter outline out of optional selections', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContainSource('<ContextSelectionDot checked={selectedOutline} disabled locked={outlineLocked} />');
    expect(source).toContainSource('label={`第${row.serialNumber}章章纲`}');
    expect(source).toContainSource('const rowIds = [row.chapterItem.id, row.summaryItem?.id].filter(');
    expect(source).not.toContainSource('row.isCurrent ? null : row.outlineItem.id');
    expect(source).not.toContainSource(
      'if (!selected) {\n        if (hasContextContent(row.outlineItem)) next.add(row.outlineItem.id);',
    );
    expect(source).toContainSource('if (item.id === row.outlineItem.id) return;');
    expect(source).toContainSource(
      'const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);',
    );
  });
});

describe('ChapterEditor prompt snapshots', () => {
  it('subscribes to prompt library updates for review and status prompt selects', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource("from '@/features/prompts/hooks/usePrompts';");
    expect(source).toContainSource('normalizePromptCategoryName');
    expect(source).toContainSource('usePrompts');
    expect(source).toContainSource('const { prompts: reviewPrompts } = usePrompts();');
    expect(source).not.toContainSource('readPromptSnapshot().prompts');
    expect(source).not.toContainSource('import { normalizePromptCategoryName, readPromptSnapshot }');
  });

  it('uses review mode prompt categories for chapter review prompt selects', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource('const REVIEW_MODE_PROMPT_CATEGORIES: Record<ReviewMode, string> = {');
    expect(source).toContainSource("audit: '审核'");
    expect(source).toContainSource('comment: COMMENT_PROMPT_CATEGORY');
    expect(source).toContainSource('polish: POLISH_PROMPT_CATEGORY');
    expect(source).toContainSource('const reviewAuditPrompts = useMemo(() => {');
    expect(source).toContainSource("normalizePromptCategoryName(prompt.category) === '审核'");
    expect(source).toContainSource('const reviewCommentPrompts = useMemo(() => {');
    expect(source).toContainSource('normalizePromptCategoryName(prompt.category) === COMMENT_PROMPT_CATEGORY');
    expect(source).toContainSource('const reviewPolishPrompts = useMemo(() => {');
    expect(source).toContainSource('normalizePromptCategoryName(prompt.category) === POLISH_PROMPT_CATEGORY');
    expect(source).toContainSource('const activeReviewPromptOptions =');
    expect(source).toContainSource('? buildAuditPromptSelectOptions(reviewAuditPrompts)');
    expect(source).toContainSource('const activeReviewPromptCategory = REVIEW_MODE_PROMPT_CATEGORIES[reviewMode];');
    expect(source).not.toContainSource('const activeReviewPromptOptions = bodyPrompts;');
    expect(source).not.toContainSource('const activeReviewPromptCategory = BODY_PROMPT_CATEGORY;');
  });

  it('stores and restores review background outputs within the matching chapter only', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');
    const taskStateSource = await readSource('../model/chapterReviewTaskState.ts');

    expect(taskStateSource).toContainSource('return `${settingsStorageKey}_review_background_tasks_v2`;');
    expect(taskStateSource).toContainSource(
      'type ReviewBackgroundTaskIdsByChapter = Record<string, Partial<Record<ReviewMode, string>>>;',
    );
    expect(taskStateSource).toContainSource('Number(task.meta.chapterId) === chapterId');
    expect(taskStateSource).toContainSource('(!mode || task.meta.mode === mode)');
    expect(taskStateSource).toContainSource(
      'function readRestorableReviewBackgroundTaskIds(settingsStorageKey: string, chapterId: number | null)',
    );
    expect(taskStateSource).toContainSource(
      'else if (storedTaskIds[mode]) writeReviewBackgroundTaskId(settingsStorageKey, chapterId, mode, undefined);',
    );
    expect(source).toContainSource(
      'writeReviewBackgroundTaskId(settingsStorageKey, activeReviewChapter.id, requestMode, task.id);',
    );
    expect(source).toContainSource(
      'isReviewBackgroundTaskForChapter(task, settingsStorageKey, activeReviewChapterId, mode)',
    );
    expect(source).toContainSource('setReviewModeStates(clearAllReviewModeResults);');
  });

  it('uses the reactive parent library snapshot for review detail outlines', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource('reviewLibraryEntries?: WorkbenchLibraryEntry[];');
    expect(source).toContainSource('const entries = reviewLibraryEntries ?? [');
    expect(source).toContainSource('}, [outlineStorageKey, reviewLibraryEntries, settingsStorageKey]);');
  });

  it('keeps review annotation preview empty before AI output exists', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource(') : !reviewAiOutput.trim() && !isAuditStructureReview ? (');
    expect(source).toContainSource('{activeReviewModeTitle}后内容会显示在这里。');
    expect(source).toContainSource(') : reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (');
  });

  it('keeps review prompt and model management modals fixed at 80 percent', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource('const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS =');
    expect(source).toContainSource(
      "'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';",
    );
    expect(source).toContainSource("const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';");
    expect(source).toContainSource('const reviewManagementModalSizeClass = isEmbeddedReviewMode');
    expect(source).toContainSource('? REVIEW_MANAGEMENT_MODAL_SIZE_CLASS');
    expect(source).toContainSource(': REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS;');
    expect(source).toContainSource(
      'className={`flex ${REVIEW_MANAGEMENT_MODAL_SIZE_CLASS} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}',
    );
    expect(source).toContainSource(
      'className={`flex ${reviewManagementModalSizeClass} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}',
    );
    expect(source).not.toContainSource("from '@/features/workbench/components/workbenchManagementModalSize';");
  });

  it('renders audit results in the middle review column instead of the right input panel', async () => {
    const source = await readSource('../components/ChapterEditor.tsx');

    expect(source).toContainSource("const AUDIT_OUTLINE_FIT_ITEM = '章纲贴合度';");
    expect(source).toContainSource('const AUDIT_STRUCTURE_CHECK_ITEMS = [');
    expect(source).toContainSource('AUDIT_OUTLINE_FIT_ITEM,');
    expect(source).toContainSource('const AUDIT_STRUCTURE_PROMPT_FORMAT = `请按软件可识别的固定格式输出。');
    expect(source).toContainSource('每一项只能选择：通过 / 不通过');
    expect(source).toContainSource('不要输出“部分通过”“基本通过”等第三种状态');
    expect(source).toContainSource('【审核项】章纲贴合度');
    expect(source).toContainSource('【贴合度】0%-100%');
    expect(source).toContainSource('【审核项】前后逻辑是否清楚');
    expect(source).toContainSource('【审核项】剧情推进是否顺畅');
    expect(source).toContainSource('【审核项】伏笔/设定是否矛盾');
    expect(source).toContainSource('【结果】通过 / 不通过');
    expect(source).toContainSource('【剧情审核结论】通过 / 不通过');
    expect(source).toContainSource('不要新增、删除、改名审核项');
    expect(source).toContainSource('function buildAuditPromptSelectOptions');
    expect(source).toContainSource("const metaLabel = subCategory === '文本审核' ? '文本' : '剧情';");
    expect(source).toContainSource(
      'return items.map((prompt) => ({ value: prompt.id, label: prompt.name, metaLabel }));',
    );
    expect(source).not.toContainSource('value: `__audit_group_${subCategory}`');
    expect(source).not.toContainSource("variant: 'groupedOption' as const");
    expect(source).toContainSource('function getAuditStructureItemStatus(output: string, item: string) {');
    expect(source).toContainSource('function getAuditOutlineFitPercent(output: string) {');
    expect(source).toContainSource('function getAuditStructureItemDetail(output: string, item: string) {');
    expect(source).toContainSource("description: getAuditBracketField(section, '说明')");
    expect(source).toContainSource("suggestion: getAuditBracketField(section, '建议')");
    expect(source).toContainSource('const explicitResult = targetText.match(/【结果】\\s*(不通过|通过)/)');
    expect(source).toContainSource("return 'passed' as const;");
    expect(source).toContainSource("return 'failed' as const;");
    expect(source).toContainSource(
      'function isTextAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {',
    );
    expect(source).toContainSource("return getAuditPromptSubcategory(prompt) === '文本审核';");
    expect(source).toContainSource(
      'function isStructureAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {',
    );
    expect(source).toContainSource("return getAuditPromptSubcategory(prompt) === '剧情审核';");
    expect(source).toContainSource('const isAuditTextReview = reviewMode ===');
    expect(source).toContainSource('const isAuditStructureReview = reviewMode ===');
    expect(source).toContainSource('const auditRevisedText = useMemo(');
    expect(source).toContainSource('reviewRevisedDraft.trim() ||');
    expect(source).toContainSource(
      "() => (isAuditTextReview ? reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput) : '')",
    );
    expect(source).toContainSource('function buildReviewTextDiff(originalText: string, revisedText: string) {');
    expect(source).toContainSource('const REVIEW_TEXT_DIFF_MAX_CELLS = 320_000;');
    expect(source).toContainSource(
      'function renderTextAuditOriginalDiff(originalText: string, revisedText?: string) {',
    );
    expect(source).toContainSource(
      'function renderTextAuditRevisedDiff(originalText: string | undefined, revisedText: string | undefined) {',
    );
    expect(source).toContainSource('className="rounded bg-red-50 px-0.5 text-red-400 line-through"');
    expect(source).toContainSource('className="font-black text-red-500"');
    expect(source).toContainSource('整段已删除');
    expect(source).toContainSource('审核后缺少本段，请让 AI 保留段落位置。');
    expect(source).toContainSource('renderTextAuditOriginalDiff(paragraph, auditRevisedParagraphs[index])');
    expect(source).toContainSource('renderTextAuditRevisedDiff(originalParagraph, revisedParagraph)');
    expect(source).toContainSource('grid grid-cols-[2rem_minmax(0,1fr)] gap-2');
    expect(source).toContainSource('aria-label={`第 ${index + 1} 段`}');
    expect(source).toContainSource('{index + 1}');
    expect(source).not.toContainSource("第 {index + 1} 段{originalParagraph === undefined ? ' · 新增段落' : ''}");
    expect(source).toContainSource('Math.max(reviewOriginalParagraphs.length, auditRevisedParagraphs.length)');
    expect(source).toContainSource('如果认为某一整段应删除，请保留该段位置为空段，不要让后续段落前移；');
    expect(source).toContainSource(
      '软件会自动把审核后新增或改写的字句标成红色，请不要自行添加 HTML、Markdown 标记或颜色说明。',
    );
    expect(source).not.toContainSource("(isAuditTextReview ? auditVisibleOutput : '')");
    expect(source).toContainSource(
      'const auditParagraphCountMatches = reviewOriginalParagraphs.length === auditRevisedParagraphs.length;',
    );
    expect(source).toContainSource(') : !reviewAiOutput.trim() && !isAuditStructureReview ? (');
    expect(source).toContainSource(') : isAuditTextReview ? (');
    expect(source).toContainSource(
      '原文 {reviewOriginalParagraphs.length} 段 / 审核后 {auditRevisedParagraphs.length} 段',
    );
    expect(source).toContainSource(') : isAuditStructureReview ? (');
    expect(source).toContainSource('AUDIT_STRUCTURE_CHECK_ITEMS.map((item) => {');
    expect(source).toContainSource('const itemStatus = getAuditStructureItemStatus(reviewAiOutput, item);');
    expect(source).toContainSource(
      'const [expandedAuditStructureItems, setExpandedAuditStructureItems] = useState<Set<string>>(() => new Set());',
    );
    expect(source).toContainSource('const toggleAuditStructureItem = (item: string) => {');
    expect(source).toContainSource('const expanded = expandedAuditStructureItems.has(item);');
    expect(source).toContainSource('const itemDetail = getAuditStructureItemDetail(reviewAiOutput, item);');
    expect(source).toContainSource('onClick={() => toggleAuditStructureItem(item)}');
    expect(source).toContainSource('aria-expanded={expanded}');
    expect(source).toContainSource('className={`h-4 w-4 shrink-0 transition-transform');
    expect(source).toContainSource("${expanded ? 'rotate-180' : '-rotate-90'}");
    expect(source).toContainSource("{itemDetail.description || '暂无说明。'}");
    expect(source).toContainSource("{itemDetail.suggestion || '暂无建议。'}");
    expect(source).toContainSource("章纲贴合度: ['章纲贴合度', '是否偏离章纲', '是否符合章纲'");
    expect(source).toContainSource('const outlineFitPercent =');
    expect(source).toContainSource(
      'item === AUDIT_OUTLINE_FIT_ITEM ? getAuditOutlineFitPercent(reviewAiOutput) : null;',
    );
    expect(source).toContainSource('const itemStatusLabel =');
    expect(source).toContainSource('outlineFitPercent !== null');
    expect(source).toContainSource("前后逻辑是否清楚: ['前后逻辑是否清楚', '因果是否清楚'");
    expect(source).toContainSource("剧情推进是否顺畅: ['剧情推进是否顺畅', '节奏是否断裂'");
    expect(source).toContainSource("? '文本审核'");
    expect(source).toContainSource(": '剧情审核'");
    expect(source).toContainSource('`第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`');
    expect(source).not.toContainSource("reviewMode === 'audit' ? '审核后'");
    expect(source).not.toContainSource('{auditVisibleOutput}');
    expect(source).not.toContainSource('本章主要事情是否清楚：通过 / 部分通过 / 不通过');
    expect(source).not.toContainSource("itemStatus === 'partial'");
    expect(source).not.toContainSource("'部分通过'");
    expect(source).toContainSource('renderAiThinkingContent(reviewAiOutput)');
    expect(source).toContainSource('AI 思考过程和文字输出会显示在这里');
  });
});
