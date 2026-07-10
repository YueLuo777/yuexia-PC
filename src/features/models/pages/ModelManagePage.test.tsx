import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('ModelManagePage drag sorting', () => {
  it('uses swap-style preview while dragging model cards', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContain('getSwapPreviewItems');
    expect(source).toContain('const previewModels =');
    expect(source).toContain('previewModels.map((model, previewIndex) =>');
    expect(source).toContain('const modelDropHandledRef = useRef(false);');
    expect(source).toContain('const modelDragOverIndexRef = useRef<number | null>(null);');
    expect(source).toContain('setModelDragOverIndex(previewIndex);');
    expect(source).toContain('commitModelDragDrop(modelDragOverIndexRef.current);');
    expect(source).toContain('type ModelPointerDragState');
    expect(source).toContain('beginModelPointerDrag');
    expect(source).toContain('beginWindowModelPointerTracking');
    expect(source).toContain('const MODEL_POINTER_DRAG_ACTIVATION_DISTANCE = 14;');
    expect(source).toContain('const MODEL_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;');
    expect(source).toContain('const MODEL_POINTER_DRAG_RETARGET_DISTANCE = 28;');
    expect(source).toContain('const MODEL_POINTER_DRAG_RETURN_DISTANCE = 28;');
    expect(source).toContain('distance < MODEL_POINTER_DRAG_ACTIVATION_DISTANCE');
    expect(source).toContain('!pointerDrag.armed');
    expect(source).toContain('hasModelPointerRetargetedTooSoon');
    expect(source).toContain('data-model-index={targetIndex}');
    expect(source).toContain('data-model-preview-index={previewIndex}');
    expect(source).toContain('next.splice(targetIndex, 0, moved);');
    expect(source).toContain('虚影，松手后落实');
    expect(source).not.toContain('targetIndex === pointerDrag.sourceIndex');
    expect(source).not.toContain('setDragOverIndex(index);');
  });

  it('keeps the embedded management modal header compact and hides failure logs there', () => {
    const source = readSource('ModelManagePage.tsx');
    const workbenchPageSource = readSource('../../workbench/pages/WorkbenchPage.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readSource('../../workbench/components/ChapterEditor.tsx');

    expect(source).toContain('type ModelManagePageProps');
    expect(source).toContain('embedded = false');
    expect(source).toContain('模型 {enabledCount} 个');
    expect(source).toContain('{onClose ? (');
    expect(source).toContain('data-no-modal-drag="true"');
    expect(source).toContain('{!embedded && (');
    expect(source).toContain('className={`model-failure-panel');

    expect(workbenchPageSource).toContain('<ModelManagePage embedded onClose={onClose} />');
    expect(libraryModalSource).toContain('<ModelManagePage embedded onClose={onClose} />');
    expect(chapterEditorSource).toContain(
      '<ModelManagePage embedded onClose={() => setReviewManagementModal(null)} />',
    );
    expect(workbenchPageSource).not.toContain('headerDragHandleProps={draggable.dragHandleProps}');
    expect(libraryModalSource).not.toContain('headerDragHandleProps={draggable.dragHandleProps}');
  });

  it('uses a four-column and three-visible-row friendly model card grid', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContain('const MODEL_MANAGE_COLUMNS: ModelCardsPerRow = 4;');
    expect(source).toContain("const MODEL_CARD_HEIGHT_CLASS = 'h-[250px]';");
    expect(source).toContain('flex min-h-0 flex-1 overflow-hidden px-5 py-4');
    expect(source).toContain('{models.length > 1 ? (');
    expect(source).toContain('<div className="mb-3 flex items-center gap-4">');
    expect(source).toContain('return MODEL_MANAGE_COLUMNS;');
    expect(source).toContain('style={{ gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }}');
    expect(source).toContain('每行 {value} 个');
    expect(source).toContain('一列约 3 个');
    expect(source).toContain('top-[80px] w-10');
    expect(source).not.toContain('flex min-h-0 flex-1 overflow-hidden px-7 py-6');
    expect(source).not.toContain('<div className="mb-5 flex items-center gap-4">');
    expect(source).not.toContain('return parsed.cardsPerRow === 4 ? 4 : 3;');
    expect(source).not.toContain('min-h-[296px]');
    expect(source).not.toContain('([3, 4] as const)');
  });

  it('caps workbench management modal size at 80 percent of the app viewport', () => {
    const workbenchPageSource = readSource('../../workbench/pages/WorkbenchPage.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readSource('../../workbench/components/ChapterEditor.tsx');
    const sizeSource = readSource('../../workbench/components/workbenchManagementModalSize.ts');

    expect(sizeSource).toContain(
      "WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[min(calc(1040px/var(--xinyuexia-effective-scale,1)),calc(80vh/var(--xinyuexia-effective-scale,1)))] w-[min(calc(1500px/var(--xinyuexia-effective-scale,1)),calc(80vw/var(--xinyuexia-effective-scale,1)))]'",
    );
    expect(sizeSource).toContain("WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]'");
    expect(workbenchPageSource).toContain('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(workbenchPageSource).toContain('return createPortal(');
    expect(workbenchPageSource).toContain('document.body');
    expect(workbenchPageSource).toContain('data-global-modal-static="true"');
    expect(libraryModalSource).toContain('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(libraryModalSource).toContain('data-global-modal-static="true"');
    expect(chapterEditorSource).toContain(
      "const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';",
    );
    expect(chapterEditorSource).toContain("const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';");
    expect(chapterEditorSource).toContain('data-global-modal-static="true"');
    expect(libraryModalSource).toContain('max-w-[80vw]');
    expect(libraryModalSource).not.toContain('w-[min(1200px,94vw)]');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContain('94vw');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContain('88vh');
    expect(`${workbenchPageSource}\n${libraryModalSource}\n${chapterEditorSource}`).not.toContain(
      'h-[min(820px,88vh)] w-[min(1500px,94vw)]',
    );
    expect(workbenchPageSource).not.toContain('useDraggableModal(`workbench_${type}_management`)');
    expect(libraryModalSource).not.toContain('useDraggableModal');
    expect(libraryModalSource).not.toContain('ModalResizeHandles');
  });
});
