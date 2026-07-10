import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('ModelManagePage drag sorting', () => {
  it('uses swap-style preview while dragging model cards', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContainSource('getSwapPreviewItems');
    expect(source).toContainSource('const previewModels =');
    expect(source).toContainSource('previewModels.map((model, previewIndex) =>');
    expect(source).toContainSource('const modelDropHandledRef = useRef(false);');
    expect(source).toContainSource('const modelDragOverIndexRef = useRef<number | null>(null);');
    expect(source).toContainSource('setModelDragOverIndex(previewIndex);');
    expect(source).toContainSource('commitModelDragDrop(modelDragOverIndexRef.current);');
    expect(source).toContainSource('type ModelPointerDragState');
    expect(source).toContainSource('beginModelPointerDrag');
    expect(source).toContainSource('beginWindowModelPointerTracking');
    expect(source).toContainSource('const MODEL_POINTER_DRAG_ACTIVATION_DISTANCE = 14;');
    expect(source).toContainSource('const MODEL_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;');
    expect(source).toContainSource('const MODEL_POINTER_DRAG_RETARGET_DISTANCE = 28;');
    expect(source).toContainSource('const MODEL_POINTER_DRAG_RETURN_DISTANCE = 28;');
    expect(source).toContainSource('distance < MODEL_POINTER_DRAG_ACTIVATION_DISTANCE');
    expect(source).toContainSource('!pointerDrag.armed');
    expect(source).toContainSource('hasModelPointerRetargetedTooSoon');
    expect(source).toContainSource('data-model-index={targetIndex}');
    expect(source).toContainSource('data-model-preview-index={previewIndex}');
    expect(source).toContainSource('next.splice(targetIndex, 0, moved);');
    expect(source).toContainSource('虚影，松手后落实');
    expect(source).not.toContainSource('targetIndex === pointerDrag.sourceIndex');
    expect(source).not.toContainSource('setDragOverIndex(index);');
  });

  it('keeps the embedded management modal header compact and hides failure logs there', () => {
    const source = readSource('ModelManagePage.tsx');
    const workbenchPageSource = readSource('../../workbench/pages/WorkbenchPage.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readSource('../../workbench/components/ChapterEditor.tsx');

    expect(source).toContainSource('type ModelManagePageProps');
    expect(source).toContainSource('embedded = false');
    expect(source).toContainSource('模型 {enabledCount} 个');
    expect(source).toContainSource('{onClose ? (');
    expect(source).toContainSource('data-no-modal-drag="true"');
    expect(source).toContainSource('{!embedded && (');
    expect(source).toContainSource('className={`model-failure-panel');

    expect(workbenchPageSource).toContainSource('<LazyModelManagePage embedded onClose={onClose} />');
    expect(libraryModalSource).toContainSource('<ModelManagePage embedded onClose={onClose} />');
    expect(chapterEditorSource).toContainSource(
      '<ModelManagePage embedded onClose={() => setReviewManagementModal(null)} />',
    );
    expect(workbenchPageSource).not.toContainSource('headerDragHandleProps={draggable.dragHandleProps}');
    expect(libraryModalSource).not.toContainSource('headerDragHandleProps={draggable.dragHandleProps}');
  });

  it('uses a four-column and three-visible-row friendly model card grid', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContainSource('const MODEL_MANAGE_COLUMNS: ModelCardsPerRow = 4;');
    expect(source).toContainSource("const MODEL_CARD_HEIGHT_CLASS = 'h-[250px]';");
    expect(source).toContainSource('flex min-h-0 flex-1 overflow-hidden px-5 py-4');
    expect(source).toContainSource('{models.length > 1 ? (');
    expect(source).toContainSource('<div className="mb-3 flex items-center gap-4">');
    expect(source).toContainSource('return MODEL_MANAGE_COLUMNS;');
    expect(source).toContainSource('style={{ gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }}');
    expect(source).toContainSource('每行 {value} 个');
    expect(source).toContainSource('一列约 3 个');
    expect(source).toContainSource('top-[80px] w-10');
    expect(source).not.toContainSource('flex min-h-0 flex-1 overflow-hidden px-7 py-6');
    expect(source).not.toContainSource('<div className="mb-5 flex items-center gap-4">');
    expect(source).not.toContainSource('return parsed.cardsPerRow === 4 ? 4 : 3;');
    expect(source).not.toContainSource('min-h-[296px]');
    expect(source).not.toContainSource('([3, 4] as const)');
  });

  it('caps workbench management modal size at 80 percent of the app viewport', () => {
    const workbenchPageSource = readSource('../../workbench/pages/WorkbenchPage.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readSource('../../workbench/components/ChapterEditor.tsx');
    const sizeSource = readSource('../../workbench/components/workbenchManagementModalSize.ts');

    expect(sizeSource).toContainSource(
      "WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[min(calc(1040px/var(--xinyuexia-effective-scale,1)),calc(80vh/var(--xinyuexia-effective-scale,1)))] w-[min(calc(1500px/var(--xinyuexia-effective-scale,1)),calc(80vw/var(--xinyuexia-effective-scale,1)))]'",
    );
    expect(sizeSource).toContainSource("WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]'");
    expect(workbenchPageSource).toContainSource('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(workbenchPageSource).toContainSource('return createPortal(');
    expect(workbenchPageSource).toContainSource('document.body');
    expect(workbenchPageSource).toContainSource('data-global-modal-static="true"');
    expect(libraryModalSource).toContainSource('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(libraryModalSource).toContainSource('data-global-modal-static="true"');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';",
    );
    expect(chapterEditorSource).toContainSource('data-global-modal-static="true"');
    expect(libraryModalSource).toContainSource('max-w-[80vw]');
    expect(libraryModalSource).not.toContainSource('w-[min(1200px,94vw)]');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContainSource('94vw');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContainSource('88vh');
    expect(`${workbenchPageSource}\n${libraryModalSource}\n${chapterEditorSource}`).not.toContainSource(
      'h-[min(820px,88vh)] w-[min(1500px,94vw)]',
    );
    expect(workbenchPageSource).not.toContainSource('useDraggableModal(`workbench_${type}_management`)');
    expect(libraryModalSource).not.toContainSource('useDraggableModal');
    expect(libraryModalSource).not.toContainSource('ModalResizeHandles');
  });
});
