import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('NavSettingsModal flat navigation editing', () => {
  it('removes zone management from the navigation settings UI', () => {
    const source = readSource('NavSettingsModal.tsx');

    expect(source).toContainSource("title: '导航'");
    expect(source).toContainSource('支持双击改名、隐藏显示、拖拽排序，以及新增、拖拽、删除分割线。');
    expect(source).toContainSource('config.flatMap((group) => group.items.map');
    expect(source).toContainSource('const draftItems = draft[0]?.items ?? [];');
    expect(source).toContainSource("dividerAfterItemTo: '/novels'");
    expect(source).toContainSource("dividerAfterItemTos: ['/novels']");
    expect(source).toContainSource('addDivider');
    expect(source).toContainSource('removeDivider');
    expect(source).toContainSource('setNavDividerDragSrc(item.to)');
    expect(source).toContainSource('resolveDividerDropTarget');
    expect(source).toContainSource('className="flex items-center gap-2"');
    expect(source).toContainSource('disabled={visibleDraftItems.length <= draftDividerAfterItemTos.length}');
    expect(source).toContainSource('新增分割线');
    expect(source.match(/新增分割线/g)?.length).toBe(1);
    expect(source).not.toContainSource(
      'mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#e1e5eb]',
    );
    expect(source).not.toContainSource('导航分割线');
    expect(source).not.toContainSource('点击新增分割线');
    expect(source).toContainSource('删除');
    expect(source).not.toContainSource('updateDividerAfterItem');
    expect(source).not.toContainSource('不显示分割线');
    expect(source).not.toContainSource('在「{item.label}」后面');
    expect(source).not.toContainSource('新增专区');
    expect(source).not.toContainSource('隐藏专区');
    expect(source).not.toContainSource('恢复专区');
    expect(source).not.toContainSource('空专区');
    expect(source).not.toContainSource('跨专区');
    expect(source).not.toContainSource('handleAddGroup');
    expect(source).not.toContainSource('toggleGroupHidden');
    expect(source).not.toContainSource('editingGroup');
  });

  it('uses swap-style preview for draggable navigation rows', () => {
    const source = readSource('NavSettingsModal.tsx');

    expect(source).toContainSource('const previewDraftItems =');
    expect(source).toContainSource('getSwapPreviewItems');
    expect(source).toContainSource('const navDropHandledRef = useRef(false);');
    expect(source).toContainSource('const navDragOverRef = useRef<{ itemIdx: number; pos:');
    expect(source).toContainSource('const setNavDragOver = (next:');
    expect(source).toContainSource('commitDragDrop(navDragOverRef.current.itemIdx);');
    expect(source).toContainSource('type NavPointerDragState');
    expect(source).toContainSource('beginNavPointerDrag');
    expect(source).toContainSource('const NAV_POINTER_DRAG_ACTIVATION_DISTANCE = 14;');
    expect(source).toContainSource('const NAV_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;');
    expect(source).toContainSource('const NAV_POINTER_DRAG_RETARGET_DISTANCE = 28;');
    expect(source).toContainSource('const NAV_POINTER_DRAG_RETURN_DISTANCE = 28;');
    expect(source).toContainSource('distance < NAV_POINTER_DRAG_ACTIVATION_DISTANCE');
    expect(source).toContainSource('!pointerDrag.armed');
    expect(source).toContainSource('beginWindowNavPointerTracking');
    expect(source).toContainSource('hasNavPointerRetargetedTooSoon');
    expect(source).toContainSource('data-nav-item-index={itemIndex}');
    expect(source).toContainSource('data-nav-item-preview-index={previewIndex}');
    expect(source).toContainSource("navDragSrcRef.current < previewIndex ? 'after' : 'before'");
    expect(source).toContainSource('previewDraftItems.map((item, previewIndex) =>');
    expect(source).toContainSource('虚影，松手后落实');
    expect(source).not.toContainSource('targetIndex === pointerDrag.sourceIndex');
    expect(source).not.toContainSource("dragSrc === itemIndex\n                          ? 'scale-[0.98]");
  });
});
