import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

interface ModalPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface ModalGeometry {
  x: number;
  y: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

type ResizeDirection = 'left' | 'right' | 'top' | 'bottom' | 'bottom-right';

const MIN_MODAL_WIDTH = 360;
const MIN_MODAL_HEIGHT = 260;
const VIEWPORT_PADDING = 32;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readGeometry(storageKey: string): ModalGeometry {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { x: 0, y: 0 };
    const parsed = JSON.parse(raw) as Partial<ModalGeometry>;
    return {
      x: Number.isFinite(parsed.x) ? Number(parsed.x) : 0,
      y: Number.isFinite(parsed.y) ? Number(parsed.y) : 0,
      left: Number.isFinite(parsed.left) ? Number(parsed.left) : undefined,
      top: Number.isFinite(parsed.top) ? Number(parsed.top) : undefined,
      width: Number.isFinite(parsed.width) ? Number(parsed.width) : undefined,
      height: Number.isFinite(parsed.height) ? Number(parsed.height) : undefined,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function saveGeometry(storageKey: string, geometry: ModalGeometry) {
  localStorage.setItem(storageKey, JSON.stringify(geometry));
}

export function useDraggableModal(id: string) {
  const storageKey = `xinyuexia_modal_position_${id}`;
  const [geometry, setGeometry] = useState<ModalGeometry>(() => readGeometry(storageKey));
  const geometryRef = useRef(geometry);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: ModalGeometry;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    direction: ResizeDirection;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    originWidth: number;
    originHeight: number;
  } | null>(null);

  useEffect(() => {
    const next = readGeometry(storageKey);
    geometryRef.current = next;
    setGeometry(next);
  }, [storageKey]);

  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  const style = useMemo<CSSProperties>(() => {
    const fixed = Number.isFinite(geometry.left) && Number.isFinite(geometry.top);
    return {
      ...(fixed
        ? {
          position: 'fixed',
          left: geometry.left,
          top: geometry.top,
          transform: 'none',
        }
        : {
          transform: `translate(${geometry.x}px, ${geometry.y}px)`,
        }),
      ...(geometry.width ? { width: geometry.width } : null),
      ...(geometry.height ? { height: geometry.height } : null),
    };
  }, [geometry.height, geometry.left, geometry.top, geometry.width, geometry.x, geometry.y]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const resize = resizeRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        event.preventDefault();
        const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
        const next = isFixed
          ? {
            ...geometryRef.current,
            left: Math.round((drag.origin.left ?? 0) + event.clientX - drag.startX),
            top: Math.round((drag.origin.top ?? 0) + event.clientY - drag.startY),
            x: 0,
            y: 0,
          }
          : {
            ...geometryRef.current,
            x: drag.origin.x + event.clientX - drag.startX,
            y: drag.origin.y + event.clientY - drag.startY,
          };
        geometryRef.current = next;
        setGeometry(next);
        return;
      }
      if (resize && resize.pointerId === event.pointerId) {
        event.preventDefault();
        const maxWidth = Math.max(MIN_MODAL_WIDTH, window.innerWidth - VIEWPORT_PADDING);
        const maxHeight = Math.max(MIN_MODAL_HEIGHT, window.innerHeight - VIEWPORT_PADDING);
        const deltaX = event.clientX - resize.startX;
        const deltaY = event.clientY - resize.startY;
        const rightEdge = resize.originLeft + resize.originWidth;
        const bottomEdge = resize.originTop + resize.originHeight;
        const maxLeftResizeWidth = Math.max(MIN_MODAL_WIDTH, rightEdge - VIEWPORT_PADDING / 2);
        const maxTopResizeHeight = Math.max(MIN_MODAL_HEIGHT, bottomEdge - VIEWPORT_PADDING / 2);
        const width = Math.round(
          resize.direction === 'left'
            ? clamp(resize.originWidth - deltaX, MIN_MODAL_WIDTH, maxLeftResizeWidth)
            : resize.direction === 'right' || resize.direction === 'bottom-right'
              ? clamp(resize.originWidth + deltaX, MIN_MODAL_WIDTH, maxWidth)
              : resize.originWidth,
        );
        const height = Math.round(
          resize.direction === 'top'
            ? clamp(resize.originHeight - deltaY, MIN_MODAL_HEIGHT, maxTopResizeHeight)
            : resize.direction === 'bottom' || resize.direction === 'bottom-right'
              ? clamp(resize.originHeight + deltaY, MIN_MODAL_HEIGHT, maxHeight)
              : resize.originHeight,
        );
        const left = resize.direction === 'left' ? rightEdge - width : resize.originLeft;
        const top = resize.direction === 'top' ? bottomEdge - height : resize.originTop;
        const next = {
          ...geometryRef.current,
          x: 0,
          y: 0,
          left,
          top,
          width,
          height,
        };
        geometryRef.current = next;
        setGeometry(next);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      const resize = resizeRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        dragRef.current = null;
        saveGeometry(storageKey, geometryRef.current);
      }
      if (resize && resize.pointerId === event.pointerId) {
        resizeRef.current = null;
        saveGeometry(storageKey, geometryRef.current);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, [storageKey]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button,input,textarea,select,a,[data-no-modal-drag="true"]')) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep dragging alive if pointer capture is unavailable.
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: {
        ...geometryRef.current,
        left: Number.isFinite(geometryRef.current.left) ? geometryRef.current.left : undefined,
        top: Number.isFinite(geometryRef.current.top) ? geometryRef.current.top : undefined,
      },
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
    const next = isFixed
      ? {
        ...geometryRef.current,
        left: Math.round((drag.origin.left ?? 0) + event.clientX - drag.startX),
        top: Math.round((drag.origin.top ?? 0) + event.clientY - drag.startY),
        x: 0,
        y: 0,
      }
      : {
        ...geometryRef.current,
        x: drag.origin.x + event.clientX - drag.startX,
        y: drag.origin.y + event.clientY - drag.startY,
      };
    geometryRef.current = next;
    setGeometry(next);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
    const next = isFixed
      ? {
        ...geometryRef.current,
        left: Math.round((drag.origin.left ?? 0) + event.clientX - drag.startX),
        top: Math.round((drag.origin.top ?? 0) + event.clientY - drag.startY),
        x: 0,
        y: 0,
      }
      : {
        ...geometryRef.current,
        x: drag.origin.x + event.clientX - drag.startX,
        y: drag.origin.y + event.clientY - drag.startY,
      };
    dragRef.current = null;
    geometryRef.current = next;
    setGeometry(next);
    saveGeometry(storageKey, next);
  };

  const onResizePointerDown = (event: ReactPointerEvent<HTMLElement>, direction: ResizeDirection = 'bottom-right') => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const fixedGeometry = {
      ...geometryRef.current,
      x: 0,
      y: 0,
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(geometryRef.current.width ?? rect.width),
      height: Math.round(geometryRef.current.height ?? rect.height),
    };
    geometryRef.current = fixedGeometry;
    setGeometry(fixedGeometry);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep resizing alive if pointer capture is unavailable.
    }
    const cursor = direction === 'left' || direction === 'right'
      ? 'ew-resize'
      : direction === 'top' || direction === 'bottom'
        ? 'ns-resize'
        : 'nwse-resize';
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
    resizeRef.current = {
      pointerId: event.pointerId,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: fixedGeometry.left,
      originTop: fixedGeometry.top,
      originWidth: fixedGeometry.width,
      originHeight: fixedGeometry.height,
    };
  };

  return {
    style,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      style: { touchAction: 'none' },
    },
    resizeHandleProps: {
      onPointerDown: onResizePointerDown,
      style: { touchAction: 'none' },
    },
    getResizeHandleProps: (direction: ResizeDirection) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => onResizePointerDown(event, direction),
      style: { touchAction: 'none' },
    }),
  };
}
