import type { useDraggableModal } from '@/shared/hooks/useDraggableModal';

type DraggableModalControls = ReturnType<typeof useDraggableModal>;

interface ModalResizeHandlesProps {
  draggable: Pick<DraggableModalControls, 'getResizeHandleProps' | 'resizeHandleProps'>;
}

export function ModalResizeHandles({ draggable }: ModalResizeHandlesProps) {
  return (
    <>
      <div
        data-no-modal-drag="true"
        {...draggable.getResizeHandleProps('top')}
        className="absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize"
        title="拖动调整弹窗高度"
      />
      <div
        data-no-modal-drag="true"
        {...draggable.getResizeHandleProps('bottom')}
        className="absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize"
        title="拖动调整弹窗高度"
      />
      <div
        data-no-modal-drag="true"
        {...draggable.getResizeHandleProps('left')}
        className="absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize"
        title="拖动调整弹窗宽度"
      />
      <div
        data-no-modal-drag="true"
        {...draggable.getResizeHandleProps('right')}
        className="absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize"
        title="拖动调整弹窗宽度"
      />
      <div
        data-no-modal-drag="true"
        {...draggable.resizeHandleProps}
        className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize"
        title="拖动调整弹窗大小"
      >
        <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
      </div>
    </>
  );
}
