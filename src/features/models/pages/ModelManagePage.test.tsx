import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from '@/features/workbench/components/chapterEditorSource.testUtils';

const readSource = (relativePath: string) => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
  if (relativePath !== 'ModelManagePage.tsx') return source;
  return `${source}\n${readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/ModelManageParts.tsx'), 'utf8')}`;
};

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
    const workbenchManagementModalSource = readSource('../../workbench/components/WorkbenchManagementModal.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readChapterEditorSource();

    expect(source).toContainSource('type ModelManagePageProps');
    expect(source).toContainSource('embedded = false');
    expect(source).toContainSource('模型 {enabledCount} 个');
    expect(source).toContainSource('{onClose ? (');
    expect(source).toContainSource('data-no-modal-drag="true"');
    expect(source).toContainSource('{!embedded && (');
    expect(source).toContainSource('className={`model-failure-panel');

    expect(workbenchManagementModalSource).toContainSource('<LazyModelManagePage embedded onClose={onClose} />');
    expect(libraryModalSource).toContainSource('<ModelManagePage embedded onClose={onClose} />');
    expect(chapterEditorSource).toContainSource('<ModelManagePage embedded onClose={onClose} />');
    expect(workbenchPageSource).not.toContainSource('headerDragHandleProps={draggable.dragHandleProps}');
    expect(libraryModalSource).not.toContainSource('headerDragHandleProps={draggable.dragHandleProps}');
  });

  it('uses a four-column and three-visible-row friendly model card grid', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContainSource('const MODEL_MANAGE_COLUMNS: ModelCardsPerRow = 4;');
    expect(source).toContainSource("const MODEL_CARD_HEIGHT_CLASS = 'h-[247px]';");
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

  it('matches the add-model card to the create-prompt card styling', () => {
    const source = readSource('ModelManagePage.tsx');
    const promptSource = readSource('../../prompts/pages/PromptsPage.tsx');
    const sharedCreateCardStyle =
      'rounded-xl border border-dashed border-[#08AACE]/50 bg-white text-[#08AACE] transition-colors hover:border-[#08AACE] hover:bg-[#E7F8FD]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]';

    expect(source).toContainSource(sharedCreateCardStyle);
    expect(promptSource).toContainSource(sharedCreateCardStyle);
    expect(source).toContainSource('<RadialCreateButton label="新增模型" />');
    expect(promptSource).toContainSource('<RadialCreateButton label="创建提示词" />');
  });

  it('enlarges the model editor and switches slider changes to the custom temperature preset', () => {
    const source = readSource('ModelManagePage.tsx');

    expect(source).toContainSource('widthClass="w-[713px]"');
    expect(source).toContainSource('heightClass="min-h-[650px] max-h-[calc(100vh-48px)]"');
    expect(source).toContainSource('grid grid-cols-4 gap-2');
    expect(source).toContainSource('getTemperaturePresetSelection');
    expect(source).toContainSource("setTemperaturePresetSelection('custom');");
    expect(source).toContainSource('<div className="text-sm font-bold">自定义</div>');
    expect(source).toContainSource('手动调节温度');
  });

  it('caps workbench management modal size at 80 percent of the app viewport', () => {
    const workbenchPageSource = readSource('../../workbench/pages/WorkbenchPage.tsx');
    const workbenchManagementModalSource = readSource('../../workbench/components/WorkbenchManagementModal.tsx');
    const libraryModalSource = readSource('../../workbench/components/workbenchLibraryManagementModal.tsx');
    const chapterEditorSource = readChapterEditorSource();
    const sizeSource = readSource('../../workbench/components/workbenchManagementModalSize.ts');

    expect(sizeSource).toContainSource(
      "WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[min(calc(1040px/var(--xinyuexia-effective-scale,1)),calc(80vh/var(--xinyuexia-effective-scale,1)))] w-[min(calc(1500px/var(--xinyuexia-effective-scale,1)),calc(80vw/var(--xinyuexia-effective-scale,1)))]'",
    );
    expect(sizeSource).toContainSource("WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]'");
    expect(workbenchPageSource).toContainSource('WorkbenchManagementModal');
    expect(workbenchManagementModalSource).toContainSource('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(workbenchManagementModalSource).toContainSource('<WorkbenchModal');
    expect(workbenchManagementModalSource).toContainSource('storageId={`workbench_management_${type}`}');
    expect(libraryModalSource).toContainSource('WORKBENCH_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS');
    expect(libraryModalSource).toContainSource('<WorkbenchModal');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS = 'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';",
    );
    expect(chapterEditorSource).toContainSource('<WorkbenchModal');
    expect(libraryModalSource).toContainSource('max-w-[80vw]');
    expect(libraryModalSource).not.toContainSource('w-[min(1200px,94vw)]');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContainSource('94vw');
    expect(`${libraryModalSource}\n${sizeSource}`).not.toContainSource('88vh');
    expect(
      `${workbenchPageSource}\n${workbenchManagementModalSource}\n${libraryModalSource}\n${chapterEditorSource}`,
    ).not.toContainSource('h-[min(820px,88vh)] w-[min(1500px,94vw)]');
    expect(workbenchManagementModalSource).not.toContainSource('useDraggableModal(`workbench_${type}_management`)');
    expect(libraryModalSource).not.toContainSource('useDraggableModal');
    expect(libraryModalSource).not.toContainSource('ModalResizeHandles');
  });
});
