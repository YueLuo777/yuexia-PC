import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface ModalPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ModalGeometry {
  x: number;
  y: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export type ResizeDirection = 'left' | 'right' | 'top' | 'bottom' | 'bottom-right';

export const MIN_MODAL_WIDTH = 360;
export const MIN_MODAL_HEIGHT = 260;
export const VIEWPORT_PADDING = 32;
export const MAX_MODAL_VIEWPORT_RATIO = 0.96;
export const RESIZE_ACTIVATION_DISTANCE_PX = 8;
export const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';
export const APP_SCALE_ROOT_SELECTOR = '[data-capsule-select-portal-root="true"]';

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function readGeometry(storageKey: string, fallback: ModalGeometry = { x: 0, y: 0 }): ModalGeometry {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
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
    return fallback;
  }
}

export function saveGeometry(storageKey: string, geometry: ModalGeometry) {
  localStorage.setItem(storageKey, JSON.stringify(geometry));
}

export function isSameGeometry(a: ModalGeometry, b: ModalGeometry) {
  return (
    a.x === b.x && a.y === b.y && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
  );
}

export function getEffectiveModalScale() {
  if (typeof window === 'undefined') return 1;
  const scale = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue(APP_EFFECTIVE_SCALE_CSS_VAR),
  );
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export function getModalScaleContext(element?: HTMLElement | null) {
  if (typeof window === 'undefined') {
    return {
      scale: 1,
      originLeft: 0,
      originTop: 0,
      viewportWidth: 1280,
      viewportHeight: 820,
      visualLeft: 0,
      visualTop: 0,
      visualRight: 1280,
      visualBottom: 820,
    };
  }

  const scaleRoot = element?.closest(APP_SCALE_ROOT_SELECTOR) as HTMLElement | null;
  if (scaleRoot) {
    const scale = getEffectiveModalScale();
    const rect = scaleRoot.getBoundingClientRect();
    return {
      scale,
      originLeft: rect.left,
      originTop: rect.top,
      viewportWidth: rect.width / scale,
      viewportHeight: rect.height / scale,
      visualLeft: rect.left,
      visualTop: rect.top,
      visualRight: rect.right,
      visualBottom: rect.bottom,
    };
  }

  return {
    scale: 1,
    originLeft: 0,
    originTop: 0,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    visualLeft: 0,
    visualTop: 0,
    visualRight: window.innerWidth,
    visualBottom: window.innerHeight,
  };
}

export function getViewportBounds(element?: HTMLElement | null) {
  if (typeof window === 'undefined') {
    return {
      maxWidth: 1280,
      maxHeight: 820,
    };
  }
  const { viewportWidth, viewportHeight } = getModalScaleContext(element);
  return {
    maxWidth: Math.max(MIN_MODAL_WIDTH, Math.floor(viewportWidth * MAX_MODAL_VIEWPORT_RATIO)),
    maxHeight: Math.max(MIN_MODAL_HEIGHT, Math.floor(viewportHeight * MAX_MODAL_VIEWPORT_RATIO)),
  };
}

export function normalizeGeometryToViewport(geometry: ModalGeometry, element?: HTMLElement | null): ModalGeometry {
  const { maxWidth, maxHeight } = getViewportBounds(element);
  const { viewportWidth, viewportHeight } = getModalScaleContext(element);
  const next: ModalGeometry = { ...geometry };
  if (Number.isFinite(next.width)) next.width = clamp(Number(next.width), MIN_MODAL_WIDTH, maxWidth);
  if (Number.isFinite(next.height)) next.height = clamp(Number(next.height), MIN_MODAL_HEIGHT, maxHeight);

  const fixed = Number.isFinite(next.left) && Number.isFinite(next.top);
  if (fixed && typeof window !== 'undefined') {
    const width = next.width ?? Math.min(maxWidth, Math.max(MIN_MODAL_WIDTH, viewportWidth * 0.72));
    const height = next.height ?? Math.min(maxHeight, Math.max(MIN_MODAL_HEIGHT, viewportHeight * 0.72));
    next.left = clamp(
      Number(next.left),
      VIEWPORT_PADDING / 2,
      Math.max(VIEWPORT_PADDING / 2, viewportWidth - width - VIEWPORT_PADDING / 2),
    );
    next.top = clamp(
      Number(next.top),
      VIEWPORT_PADDING / 2,
      Math.max(VIEWPORT_PADDING / 2, viewportHeight - height - VIEWPORT_PADDING / 2),
    );
    next.x = 0;
    next.y = 0;
  } else if (typeof window !== 'undefined') {
    const centeredWidth = Number.isFinite(next.width) ? Number(next.width) : 0;
    const centeredHeight = Number.isFinite(next.height) ? Number(next.height) : 0;
    const maxX =
      centeredWidth > 0
        ? Math.max(0, (viewportWidth - centeredWidth) / 2 - VIEWPORT_PADDING / 2)
        : Math.max(0, viewportWidth / 2 - VIEWPORT_PADDING);
    const maxY =
      centeredHeight > 0
        ? Math.max(0, (viewportHeight - centeredHeight) / 2 - VIEWPORT_PADDING / 2)
        : Math.max(0, viewportHeight / 2 - VIEWPORT_PADDING);
    next.x = clamp(Number.isFinite(next.x) ? Number(next.x) : 0, -maxX, maxX);
    next.y = clamp(Number.isFinite(next.y) ? Number(next.y) : 0, -maxY, maxY);
  }
  return next;
}

export function getSafeFixedGeometryFromRect(rect: DOMRect, element?: HTMLElement | null): ModalGeometry {
  if (typeof window === 'undefined') {
    return {
      x: 0,
      y: 0,
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(Math.max(MIN_MODAL_WIDTH, rect.width)),
      height: Math.round(Math.max(MIN_MODAL_HEIGHT, rect.height)),
    };
  }
  const { maxWidth, maxHeight } = getViewportBounds(element);
  const { scale, originLeft, originTop, viewportWidth, viewportHeight } = getModalScaleContext(element);
  const width = Math.round(clamp(rect.width / scale, MIN_MODAL_WIDTH, maxWidth));
  const height = Math.round(clamp(rect.height / scale, MIN_MODAL_HEIGHT, maxHeight));
  const maxLeft = Math.max(VIEWPORT_PADDING / 2, viewportWidth - width - VIEWPORT_PADDING / 2);
  const maxTop = Math.max(VIEWPORT_PADDING / 2, viewportHeight - height - VIEWPORT_PADDING / 2);
  return {
    x: 0,
    y: 0,
    left: Math.round(clamp((rect.left - originLeft) / scale, VIEWPORT_PADDING / 2, maxLeft)),
    top: Math.round(clamp((rect.top - originTop) / scale, VIEWPORT_PADDING / 2, maxTop)),
    width,
    height,
  };
}

export function clampFixedGeometryToVisualViewport(element: HTMLElement, geometry: ModalGeometry): ModalGeometry {
  if (typeof window === 'undefined') return geometry;
  const { scale, visualLeft, visualTop, visualRight, visualBottom } = getModalScaleContext(element);
  const visualPadding = VIEWPORT_PADDING / 2;
  const rect = element.getBoundingClientRect();
  const next = { ...geometry };

  if (Number.isFinite(next.left)) {
    if (rect.left < visualLeft + visualPadding) {
      next.left = Number(next.left) + (visualLeft + visualPadding - rect.left) / scale;
    }
    if (rect.right > visualRight - visualPadding) {
      next.left = Number(next.left) - (rect.right - (visualRight - visualPadding)) / scale;
    }
  }

  if (Number.isFinite(next.top)) {
    if (rect.top < visualTop + visualPadding) {
      next.top = Number(next.top) + (visualTop + visualPadding - rect.top) / scale;
    }
    if (rect.bottom > visualBottom - visualPadding) {
      next.top = Number(next.top) - (rect.bottom - (visualBottom - visualPadding)) / scale;
    }
  }

  return next;
}
