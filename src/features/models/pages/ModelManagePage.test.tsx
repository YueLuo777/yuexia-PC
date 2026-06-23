import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

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
});
