export * from './draggableModalGeometry';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  type ModalPosition,
  type ModalGeometry,
  type ResizeDirection,
  MIN_MODAL_WIDTH,
  MIN_MODAL_HEIGHT,
  VIEWPORT_PADDING,
  MAX_MODAL_VIEWPORT_RATIO,
  RESIZE_ACTIVATION_DISTANCE_PX,
  APP_EFFECTIVE_SCALE_CSS_VAR,
  APP_SCALE_ROOT_SELECTOR,
  clamp,
  readGeometry,
  saveGeometry,
  isSameGeometry,
  getEffectiveModalScale,
  getModalScaleContext,
  getViewportBounds,
  normalizeGeometryToViewport,
  getSafeFixedGeometryFromRect,
  clampFixedGeometryToVisualViewport,
} from './draggableModalGeometry';
export function useDraggableModal(id: string, defaultGeometry?: ModalGeometry) {
  const storageKey = `xinyuexia_modal_position_${id}`;
  const defaultX = defaultGeometry?.x;
  const defaultY = defaultGeometry?.y;
  const defaultLeft = defaultGeometry?.left;
  const defaultTop = defaultGeometry?.top;
  const defaultWidth = defaultGeometry?.width;
  const defaultHeight = defaultGeometry?.height;
  const hasDefaultGeometry = Boolean(defaultGeometry);
  const [geometry, setGeometry] = useState<ModalGeometry>(() =>
    normalizeGeometryToViewport(readGeometry(storageKey, defaultGeometry)),
  );
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
    active: boolean;
    element: HTMLElement;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    originWidth: number;
    originHeight: number;
  } | null>(null);

  const applyFixedGeometry = (element: HTMLElement, next: ModalGeometry) => {
    if (Number.isFinite(next.left)) element.style.left = `${Math.round(next.left ?? 0)}px`;
    if (Number.isFinite(next.top)) element.style.top = `${Math.round(next.top ?? 0)}px`;
    element.style.position = 'fixed';
    element.style.transform = 'none';
    element.style.margin = '0';
    if (next.width) element.style.width = `${Math.round(next.width)}px`;
    if (next.height) element.style.height = `${Math.round(next.height)}px`;
  };

  useEffect(() => {
    const fallback = hasDefaultGeometry
      ? {
          x: defaultX ?? 0,
          y: defaultY ?? 0,
          left: defaultLeft,
          top: defaultTop,
          width: defaultWidth,
          height: defaultHeight,
        }
      : undefined;
    const next = normalizeGeometryToViewport(readGeometry(storageKey, fallback));
    geometryRef.current = next;
    setGeometry((current) => (isSameGeometry(current, next) ? current : next));
  }, [defaultHeight, defaultLeft, defaultTop, defaultWidth, defaultX, defaultY, hasDefaultGeometry, storageKey]);

  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  useEffect(() => {
    const handleResize = () => {
      const next = normalizeGeometryToViewport(geometryRef.current);
      geometryRef.current = next;
      setGeometry(next);
      saveGeometry(storageKey, next);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [storageKey]);

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
        const scale = getEffectiveModalScale();
        const deltaX = (event.clientX - drag.startX) / scale;
        const deltaY = (event.clientY - drag.startY) / scale;
        const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
        const next = isFixed
          ? {
              ...geometryRef.current,
              left: Math.round((drag.origin.left ?? 0) + deltaX),
              top: Math.round((drag.origin.top ?? 0) + deltaY),
              x: 0,
              y: 0,
            }
          : {
              ...geometryRef.current,
              x: drag.origin.x + deltaX,
              y: drag.origin.y + deltaY,
            };
        geometryRef.current = next;
        setGeometry(next);
        return;
      }
      if (resize && resize.pointerId === event.pointerId) {
        event.preventDefault();
        const { scale } = getModalScaleContext(resize.element);
        const deltaX = (event.clientX - resize.startX) / scale;
        const deltaY = (event.clientY - resize.startY) / scale;
        if (!resize.active) {
          if (Math.hypot(deltaX * scale, deltaY * scale) < RESIZE_ACTIVATION_DISTANCE_PX) return;
          resize.active = true;
          applyFixedGeometry(resize.element, {
            ...geometryRef.current,
            x: 0,
            y: 0,
            left: resize.originLeft,
            top: resize.originTop,
            width: resize.originWidth,
            height: resize.originHeight,
          });
        }
        const { maxWidth, maxHeight } = getViewportBounds(resize.element);
        const { viewportWidth, viewportHeight } = getModalScaleContext(resize.element);
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
        const rawLeft = resize.direction === 'left' ? rightEdge - width : resize.originLeft;
        const rawTop = resize.direction === 'top' ? bottomEdge - height : resize.originTop;
        const left = clamp(
          rawLeft,
          VIEWPORT_PADDING / 2,
          Math.max(VIEWPORT_PADDING / 2, viewportWidth - width - VIEWPORT_PADDING / 2),
        );
        const top = clamp(
          rawTop,
          VIEWPORT_PADDING / 2,
          Math.max(VIEWPORT_PADDING / 2, viewportHeight - height - VIEWPORT_PADDING / 2),
        );
        let next: ModalGeometry = {
          ...geometryRef.current,
          x: 0,
          y: 0,
          left,
          top,
          width,
          height,
        };
        applyFixedGeometry(resize.element, next);
        next = clampFixedGeometryToVisualViewport(resize.element, next);
        geometryRef.current = next;
        applyFixedGeometry(resize.element, next);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      const resize = resizeRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        dragRef.current = null;
        const next = normalizeGeometryToViewport(geometryRef.current);
        geometryRef.current = next;
        setGeometry(next);
        saveGeometry(storageKey, next);
      }
      if (resize && resize.pointerId === event.pointerId) {
        resizeRef.current = null;
        if (resize.active) {
          const next = clampFixedGeometryToVisualViewport(resize.element, geometryRef.current);
          geometryRef.current = next;
          applyFixedGeometry(resize.element, next);
          setGeometry(next);
          saveGeometry(storageKey, next);
        }
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
    const scale = getEffectiveModalScale();
    const deltaX = (event.clientX - drag.startX) / scale;
    const deltaY = (event.clientY - drag.startY) / scale;
    const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
    const rawNext = isFixed
      ? {
          ...geometryRef.current,
          left: Math.round((drag.origin.left ?? 0) + deltaX),
          top: Math.round((drag.origin.top ?? 0) + deltaY),
          x: 0,
          y: 0,
        }
      : {
          ...geometryRef.current,
          x: drag.origin.x + deltaX,
          y: drag.origin.y + deltaY,
        };
    const next = normalizeGeometryToViewport(rawNext);
    geometryRef.current = next;
    setGeometry(next);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const scale = getEffectiveModalScale();
    const deltaX = (event.clientX - drag.startX) / scale;
    const deltaY = (event.clientY - drag.startY) / scale;
    const isFixed = Number.isFinite(drag.origin.left) && Number.isFinite(drag.origin.top);
    const rawNext = isFixed
      ? {
          ...geometryRef.current,
          left: Math.round((drag.origin.left ?? 0) + deltaX),
          top: Math.round((drag.origin.top ?? 0) + deltaY),
          x: 0,
          y: 0,
        }
      : {
          ...geometryRef.current,
          x: drag.origin.x + deltaX,
          y: drag.origin.y + deltaY,
        };
    const next = normalizeGeometryToViewport(rawNext);
    dragRef.current = null;
    geometryRef.current = next;
    setGeometry(next);
    saveGeometry(storageKey, next);
  };

  const onResizePointerDown = (event: ReactPointerEvent<HTMLElement>, direction: ResizeDirection = 'bottom-right') => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget.closest('[data-draggable-managed="true"]') as HTMLElement | null;
    const rect = element?.getBoundingClientRect();
    if (!element || !rect) return;
    const fixedGeometry = getSafeFixedGeometryFromRect(rect, element);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep resizing alive if pointer capture is unavailable.
    }
    const cursor =
      direction === 'left' || direction === 'right'
        ? 'ew-resize'
        : direction === 'top' || direction === 'bottom'
          ? 'ns-resize'
          : 'nwse-resize';
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
    const { left = 0, top = 0, width = MIN_MODAL_WIDTH, height = MIN_MODAL_HEIGHT } = fixedGeometry;
    resizeRef.current = {
      pointerId: event.pointerId,
      direction,
      active: false,
      element,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: left,
      originTop: top,
      originWidth: width,
      originHeight: height,
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
