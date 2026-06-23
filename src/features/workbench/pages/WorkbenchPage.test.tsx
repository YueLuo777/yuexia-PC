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
    expect(source).toContain('function getEffectiveModalScale()');
    expect(source).toContain('const visualViewportWidth = window.innerWidth / scale;');
    expect(source).toContain('const visualViewportHeight = window.innerHeight / scale;');
    expect(source).toContain('function clampFixedGeometryToVisualViewport(element: HTMLElement, geometry: ModalGeometry)');
    expect(source).toContain('const rect = element.getBoundingClientRect();');
    expect(source).toContain('rect.bottom > window.innerHeight - visualPadding');
    expect(source).toContain('const centeredWidth = Number.isFinite(next.width) ? Number(next.width) : 0;');
    expect(source).toContain('(visualViewportWidth - centeredWidth) / 2 - VIEWPORT_PADDING / 2');
    expect(source).toContain('next = clampFixedGeometryToVisualViewport(resize.element, next);');
    expect(source).toContain('const next = normalizeGeometryToViewport(rawNext);');
    expect(source).toContain('saveGeometry(storageKey, next);');
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
    expect(source).toContain('const canPickSummary = Boolean(row.summaryItem) && !row.isCurrent && summaryWordCount > 0;');
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
  it('marks summary flow as warning when summary chapters are fewer than writing chapters', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('const summaryChapterSerials = new Set(summaryContextItems.map((item) => getContextEntrySerial(item.title)).filter(Boolean));');
    expect(source).toContain('const summaryChapterCount = summaryChapterSerials.size > 0 ? summaryChapterSerials.size : summaryContextItems.length;');
    expect(source).toContain("summary: { meta: `${summaryChapterCount}章`, tone: summaryChapterCount < chapterCount ? 'warning' : 'normal' },");
    expect(source).not.toContain("summary: { meta: `${summaryContextItems.length}章` },");
  });
});

describe('Workbench linked context clearing', () => {
  it('does not reattach required outline context after the AI panel clears linked materials', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('const shouldAttachRequiredContext = !contextSelectionTouched || linkedContextItems.length > 0;');
    expect(source).toContain('const effectiveRequiredContextItems = shouldAttachRequiredContext ? requiredContextItems : [];');
    expect(source).toContain('const effectiveLinkedContextItems = mergeContextItems([...effectiveRequiredContextItems, ...optionalLinkedContextItems]);');
    expect(source).toContain('setContextSelectionTouched(true);');
    expect(source).toContain('updateLinkedContextItems([]);');
  });

  it('saves required outline items when confirming linked materials from the context library', async () => {
    const source = await readSource('WorkbenchPage.tsx');

    expect(source).toContain('const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);');
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
    expect(source).not.toContain('if (!selected) {\n        if (hasContextContent(row.outlineItem)) next.add(row.outlineItem.id);');
    expect(source).toContain('if (item.id === row.outlineItem.id) return;');
    expect(source).toContain('const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);');
  });
});
