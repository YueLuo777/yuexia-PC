import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, Minus, Plus, Square, X } from 'lucide-react';

import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import {
  loadShortcutBindings,
  loadMouseGestureSettings,
  matchesShortcut,
  SHORTCUT_ACTION_EVENT,
  SHORTCUT_UPDATED_EVENT,
  shortcutActions,
  type ShortcutActionId,
} from '@/shared/shortcuts/shortcutConfig';
import { hasTopModalEscapeHandler, useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { HOME_TAB, useWorkspaceTabs, type WorkspaceTab } from '@/shared/tabs/WorkspaceTabsContext';
import { TextOverrideLayer } from '@/shared/text-overrides/TextOverrideLayer';
import { AdjustmentModeLayer } from '@/shared/adjustment-mode/AdjustmentModeLayer';

declare global {
  interface Window {
    xinyuexiaWindow?: {
      minimize: () => Promise<void>;
      maximizeToggle: () => Promise<boolean>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      reload: () => Promise<void>;
      beginTitlebarDrag: (input: TitlebarDragPayload) => Promise<TitlebarDragResult>;
      moveTitlebarDrag: (input: TitlebarDragPayload) => Promise<boolean>;
      endTitlebarDrag?: (input: TitlebarDragPayload) => Promise<boolean>;
      onMaximizedChange?: (callback: (isMaximized: boolean) => void) => () => void;
    };
  }
}

const APP_SCALE_KEY = 'xinyuexia_app_scale';
const APP_SCALE_VERSION_KEY = 'xinyuexia_app_scale_version';
const DARK_THEME_KEY = 'xinyuexia_dark_theme';
const APP_SCALE_BASE = 1.1;
const APP_SCALE_STORAGE_VERSION = '2';
const APP_SCALE_OPTIONS = [1, 1.1, 1.25, 1.5, 1.75, 2].map((labelScale) => ({
  labelScale,
  effectiveScale: Number((APP_SCALE_BASE * labelScale).toFixed(3)),
}));
const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';
const HOME_LAST_ROUTE_KEY = 'xinyuexia_home_last_route_this_session_v1';
const TITLEBAR_DRAG_THRESHOLD = 8;
const TITLEBAR_DOUBLE_CLICK_MAX_DURATION_MS = 260;
const TITLEBAR_DOUBLE_CLICK_GAP_MS = 320;
const TITLEBAR_DOUBLE_CLICK_DISTANCE = 8;
const RIGHT_MOUSE_GESTURE_THRESHOLD = 90;
const RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE = 80;
const RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD = 18;

type TitlebarDragPayload = {
  screenX: number;
  screenY: number;
  clientX?: number;
  clientY?: number;
  windowWidth?: number;
  dragOffsetX?: number;
  dragOffsetY?: number;
  dragSessionId?: string;
};

type TitlebarDragResult = {
  dragSessionId?: string;
  isMaximized: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
} | null;

type MouseGesturePreview = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  points: Array<{ x: number; y: number }>;
  ready: boolean;
  invalid: boolean;
  direction: 'left' | 'right' | null;
};

function loadScale() {
  try {
    const raw = Number(localStorage.getItem(APP_SCALE_KEY) ?? '1');
    if (!Number.isFinite(raw)) return APP_SCALE_BASE;
    const isCurrentVersion = localStorage.getItem(APP_SCALE_VERSION_KEY) === APP_SCALE_STORAGE_VERSION;
    const effectiveScale = isCurrentVersion ? raw : raw * APP_SCALE_BASE;
    return Math.max(APP_SCALE_BASE, Math.min(APP_SCALE_BASE * 2, effectiveScale));
  } catch {
    return APP_SCALE_BASE;
  }
}

function getScaleLabel(scale: number) {
  return Math.round((scale / APP_SCALE_BASE) * 100);
}

function loadDarkTheme() {
  try {
    return localStorage.getItem(DARK_THEME_KEY) === '1';
  } catch {
    return false;
  }
}

function readLastHomeRoute() {
  try {
    return sessionStorage.getItem(HOME_LAST_ROUTE_KEY) || HOME_TAB.path;
  } catch {
    return HOME_TAB.path;
  }
}

function rememberHomeRoute(pathname: string) {
  if (pathname === HOME_TAB.path) return;
  try {
    sessionStorage.setItem(HOME_LAST_ROUTE_KEY, pathname);
  } catch {
    // Session storage may be unavailable in restricted contexts.
  }
}

interface AppFrameProps {
  children: ReactNode;
}

const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const TestCollectionPage = lazy(() => import('@/features/tests/pages/TestCollectionPage').then((module) => ({ default: module.TestCollectionPage })));

type TitlebarDragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragSessionId: string;
  started: boolean;
  pending: boolean;
};

function isTitlebarInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return true;
  return Boolean(
    target.closest('button,input,textarea,select,a,[contenteditable="true"],[data-titlebar-no-drag="true"]'),
  );
}

export function AppFrame({ children }: AppFrameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { novels, selectNovel } = useNovelLibrary();
  const { tabs, activeTabId, setActiveTabId, openWorkTab, closeTab } = useWorkspaceTabs();
  const [isMaximized, setIsMaximized] = useState(false);
  const [appScale, setAppScale] = useState(loadScale);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(loadDarkTheme);
  const [showTestCollection, setShowTestCollection] = useState(false);
  const [showSoftwareUiCatalog, setShowSoftwareUiCatalog] = useState(false);
  const [shortcutBindings, setShortcutBindings] = useState(loadShortcutBindings);
  const [mouseGestureSettings, setMouseGestureSettings] = useState(loadMouseGestureSettings);
  const [mouseGesturePreview, setMouseGesturePreview] = useState<MouseGesturePreview | null>(null);
  const titlebarDragRef = useRef<TitlebarDragState | null>(null);
  const suppressTitlebarClickRef = useRef(false);
  const lastTitlebarDragAtRef = useRef(0);
  const titlebarClickRef = useRef({ lastAt: 0, lastClientX: 0, lastClientY: 0 });
  const titlebarPointerMetaRef = useRef({ startedAt: 0, startClientX: 0, startClientY: 0, moved: false });

  const effectiveScale = useMemo(() => Number(appScale.toFixed(3)), [appScale]);

  useTopModalEscape(showTestCollection, () => setShowTestCollection(false));
  useTopModalEscape(showSoftwareUiCatalog, () => setShowSoftwareUiCatalog(false));

  const activateHomeTab = useCallback(() => {
    setActiveTabId(HOME_TAB.id);
    navigate(readLastHomeRoute());
  }, [navigate, setActiveTabId]);

  useEffect(() => {
    localStorage.setItem(APP_SCALE_KEY, String(appScale));
    localStorage.setItem(APP_SCALE_VERSION_KEY, APP_SCALE_STORAGE_VERSION);
  }, [appScale]);

  useEffect(() => {
    document.documentElement.style.setProperty(APP_EFFECTIVE_SCALE_CSS_VAR, String(effectiveScale));
    return () => {
      document.documentElement.style.removeProperty(APP_EFFECTIVE_SCALE_CSS_VAR);
    };
  }, [effectiveScale]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkTheme);
    localStorage.setItem(DARK_THEME_KEY, isDarkTheme ? '1' : '0');
  }, [isDarkTheme]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyZoom = body.style.zoom;
    const prevRootOverflow = root?.style.overflow ?? '';

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.zoom = '1';
    if (root) root.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.zoom = prevBodyZoom;
      if (root) root.style.overflow = prevRootOverflow;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    window.xinyuexiaWindow?.isMaximized().then((value) => {
      if (mounted) setIsMaximized(value);
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return window.xinyuexiaWindow?.onMaximizedChange?.((value) => {
      setIsMaximized(value);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault();
        void window.xinyuexiaWindow?.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mouseGestureSettings.goHomeLeftSwipe && !mouseGestureSettings.forwardRightSwipe) {
      setMouseGesturePreview(null);
      return;
    }
    let gesture: {
      startX: number;
      startY: number;
      visible: boolean;
      ready: boolean;
      invalidated: boolean;
      direction: 'left' | 'right' | null;
      points: Array<{ x: number; y: number }>;
    } | null = null;
    let suppressNextContextMenu = false;

    const goHome = () => activateHomeTab();
    const goForward = () => {
      navigate(1);
    };

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      if (event.button !== 2) return;
      gesture = {
        startX: event.clientX,
        startY: event.clientY,
        visible: false,
        ready: false,
        invalidated: false,
        direction: null,
        points: [{ x: event.clientX, y: event.clientY }],
      };
      setMouseGesturePreview(null);
    };

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!gesture) return;
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const distance = Math.hypot(deltaX, deltaY);
      if (Math.abs(deltaX) < RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD && !gesture.visible) return;
      if (distance < RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD) return;
      const lastPoint = gesture.points[gesture.points.length - 1];
      const segmentDx = lastPoint ? event.clientX - lastPoint.x : 0;
      const segmentDy = lastPoint ? event.clientY - lastPoint.y : 0;
      if (!gesture.direction) {
        if (deltaX <= -RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD) gesture.direction = 'left';
        if (deltaX >= RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD) gesture.direction = 'right';
      }
      if (gesture.visible && gesture.direction) {
        const reversed = gesture.direction === 'left' ? segmentDx > 0 : segmentDx < 0;
        if (reversed || Math.abs(segmentDy) > 14) {
          gesture.invalidated = true;
          gesture.ready = false;
        }
      }
      gesture.visible = true;
      const directionEnabled = (
        (gesture.direction === 'left' && mouseGestureSettings.goHomeLeftSwipe) ||
        (gesture.direction === 'right' && mouseGestureSettings.forwardRightSwipe)
      );
      gesture.ready = !gesture.invalidated
        && directionEnabled
        && Math.abs(deltaY) <= RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE;
      if (gesture.direction === 'left') gesture.ready = gesture.ready && deltaX <= -RIGHT_MOUSE_GESTURE_THRESHOLD;
      if (gesture.direction === 'right') gesture.ready = gesture.ready && deltaX >= RIGHT_MOUSE_GESTURE_THRESHOLD;
      if (!lastPoint || Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y) >= 3) {
        gesture.points = [...gesture.points, { x: event.clientX, y: event.clientY }].slice(-220);
      }
      suppressNextContextMenu = true;
      event.preventDefault();
      event.stopPropagation();
      setMouseGesturePreview({
        startX: gesture.startX,
        startY: gesture.startY,
        currentX: event.clientX,
        currentY: event.clientY,
        points: gesture.points,
        ready: gesture.ready,
        invalid: gesture.invalidated,
        direction: gesture.direction,
      });
    };

    const handleMouseUp = () => {
      if (gesture?.ready && !gesture.invalidated) {
        suppressNextContextMenu = true;
        if (gesture.direction === 'left') goHome();
        if (gesture.direction === 'right') goForward();
      }
      gesture = null;
      setMouseGesturePreview(null);
    };

    const handleContextMenu = (event: globalThis.MouseEvent) => {
      if (!suppressNextContextMenu) return;
      event.preventDefault();
      event.stopPropagation();
      suppressNextContextMenu = false;
    };

    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [activateHomeTab, mouseGestureSettings.forwardRightSwipe, mouseGestureSettings.goHomeLeftSwipe, navigate]);

  useEffect(() => {
    type DragState = {
      dialog: HTMLElement;
      key: string;
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      fixed: boolean;
    };
    type ResizeState = {
      dialog: HTMLElement;
      key: string;
      pointerId: number;
      direction: 'left' | 'right' | 'top' | 'bottom' | 'bottom-right';
      startX: number;
      startY: number;
      originLeft: number;
      originTop: number;
      originWidth: number;
      originHeight: number;
    };
    let dragState: DragState | null = null;
    let resizeState: ResizeState | null = null;
    const minModalWidth = 360;
    const minModalHeight = 260;
    const viewportPadding = 32;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const isOverlay = (element: HTMLElement) => (
      element.classList.contains('fixed') && element.classList.contains('inset-0')
    );
    const findOverlay = (target: HTMLElement | null) => {
      let current: HTMLElement | null = target;
      while (current) {
        if (isOverlay(current)) return current;
        current = current.parentElement;
      }
      return null;
    };
    const findDialog = (overlay: HTMLElement, target: HTMLElement) => {
      const children = Array.from(overlay.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
      return children.find((child) => child.contains(target)) ?? null;
    };
    const findDialogDragHandle = (dialog: HTMLElement) => {
      const explicitHandle = dialog.querySelector<HTMLElement>('[data-modal-drag-handle="true"]');
      if (explicitHandle) return explicitHandle;
      return dialog.querySelector<HTMLElement>('header');
    };
    const isInDialogDragHandle = (dialog: HTMLElement, target: HTMLElement) => {
      const handle = findDialogDragHandle(dialog);
      return Boolean(handle?.contains(target));
    };
    const getDialogKey = (dialog: HTMLElement, overlay?: HTMLElement) => {
      const explicitId = dialog.dataset.modalId
        || dialog.dataset.globalModalId
        || overlay?.dataset.modalId
        || overlay?.dataset.globalModalId;
      if (explicitId) return `xinyuexia_global_modal_position_${explicitId.slice(0, 80)}`;
      const title = dialog.querySelector('[data-modal-title="true"],h1,h2,h3')?.textContent?.trim() || dialog.className || 'modal';
      return `xinyuexia_global_modal_position_${title.slice(0, 40)}`;
    };
    const readDialogGeometry = (key: string) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}') as { x?: number; y?: number; left?: number; top?: number; width?: number; height?: number };
        return {
          x: Number.isFinite(parsed.x) ? Math.round(Number(parsed.x)) : 0,
          y: Number.isFinite(parsed.y) ? Math.round(Number(parsed.y)) : 0,
          left: Number.isFinite(parsed.left) ? Math.round(Number(parsed.left)) : undefined,
          top: Number.isFinite(parsed.top) ? Math.round(Number(parsed.top)) : undefined,
          width: Number.isFinite(parsed.width) ? Math.round(Number(parsed.width)) : undefined,
          height: Number.isFinite(parsed.height) ? Math.round(Number(parsed.height)) : undefined,
        };
      } catch {
        return { x: 0, y: 0 };
      }
    };
    const saveDialogGeometry = (key: string, dialog: HTMLElement) => {
      localStorage.setItem(key, JSON.stringify({
        x: Math.round(Number(dialog.dataset.globalDragX || 0)),
        y: Math.round(Number(dialog.dataset.globalDragY || 0)),
        left: Number.isFinite(Number(dialog.dataset.globalFixedLeft)) ? Math.round(Number(dialog.dataset.globalFixedLeft)) : undefined,
        top: Number.isFinite(Number(dialog.dataset.globalFixedTop)) ? Math.round(Number(dialog.dataset.globalFixedTop)) : undefined,
        width: Number.isFinite(Number(dialog.dataset.globalResizeWidth)) ? Math.round(Number(dialog.dataset.globalResizeWidth)) : undefined,
        height: Number.isFinite(Number(dialog.dataset.globalResizeHeight)) ? Math.round(Number(dialog.dataset.globalResizeHeight)) : undefined,
      }));
    };
    const applyTransform = (dialog: HTMLElement, x: number, y: number) => {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      dialog.dataset.globalDragX = String(roundedX);
      dialog.dataset.globalDragY = String(roundedY);
      if (roundedX === 0 && roundedY === 0) {
        dialog.style.transform = '';
        dialog.style.willChange = '';
        return;
      }
      dialog.style.transform = `translate(${roundedX}px, ${roundedY}px)`;
    };
    const applyFixedPosition = (dialog: HTMLElement, left: number, top: number) => {
      const roundedLeft = Math.round(left);
      const roundedTop = Math.round(top);
      dialog.dataset.globalFixedLeft = String(roundedLeft);
      dialog.dataset.globalFixedTop = String(roundedTop);
      dialog.dataset.globalDragX = '0';
      dialog.dataset.globalDragY = '0';
      dialog.style.position = 'fixed';
      dialog.style.left = `${roundedLeft}px`;
      dialog.style.top = `${roundedTop}px`;
      dialog.style.right = 'auto';
      dialog.style.bottom = 'auto';
      dialog.style.margin = '0';
      dialog.style.transform = '';
      dialog.style.willChange = '';
    };
    const applySize = (dialog: HTMLElement, width?: number, height?: number) => {
      if (width) {
        const nextWidth = Math.round(width);
        dialog.dataset.globalResizeWidth = String(nextWidth);
        dialog.style.width = `${nextWidth}px`;
      }
      if (height) {
        const nextHeight = Math.round(height);
        dialog.dataset.globalResizeHeight = String(nextHeight);
        dialog.style.height = `${nextHeight}px`;
      }
    };
    const ensureResizeHandle = (dialog: HTMLElement) => {
      if (dialog.dataset.globalResizableApplied === 'true') return;
      dialog.dataset.globalResizableApplied = 'true';
      if (getComputedStyle(dialog).position === 'static') dialog.style.position = 'relative';
      const createResizeHandle = (
        direction: 'left' | 'right' | 'top' | 'bottom' | 'bottom-right',
        style: Partial<CSSStyleDeclaration>,
      ) => {
        const handle = document.createElement('div');
        handle.dataset.noModalDrag = 'true';
        handle.dataset.globalModalResizeHandle = 'true';
        handle.dataset.globalModalResizeDirection = direction;
        handle.title = '拖动调整弹窗大小';
        Object.assign(handle.style, {
          position: 'absolute',
          zIndex: '30',
          touchAction: 'none',
          ...style,
        });
        dialog.appendChild(handle);
        return handle;
      };
      createResizeHandle('top', {
        left: '16px',
        right: '16px',
        top: '0px',
        height: '8px',
        cursor: 'ns-resize',
      });
      createResizeHandle('bottom', {
        left: '16px',
        right: '16px',
        bottom: '0px',
        height: '8px',
        cursor: 'ns-resize',
      });
      createResizeHandle('left', {
        left: '0px',
        top: '16px',
        bottom: '16px',
        width: '8px',
        cursor: 'ew-resize',
      });
      createResizeHandle('right', {
        right: '0px',
        top: '16px',
        bottom: '16px',
        width: '8px',
        cursor: 'ew-resize',
      });
      const handle = createResizeHandle('bottom-right', {
        right: '0px',
        bottom: '0px',
        width: '20px',
        height: '20px',
        cursor: 'nwse-resize',
      });
      const mark = document.createElement('div');
      Object.assign(mark.style, {
        position: 'absolute',
        right: '4px',
        bottom: '4px',
        width: '12px',
        height: '12px',
        borderRight: '2px solid rgb(209 213 219)',
        borderBottom: '2px solid rgb(209 213 219)',
        borderBottomRightRadius: '8px',
        pointerEvents: 'none',
      });
      handle.appendChild(mark);
    };
    const applyDialogPosition = (dialog: HTMLElement, overlay?: HTMLElement) => {
      if (dialog.dataset.draggableManaged === 'true' || dialog.dataset.globalDraggableApplied === 'true') return;
      const geometry = readDialogGeometry(getDialogKey(dialog, overlay));
      dialog.dataset.globalDraggableApplied = 'true';
      const handle = findDialogDragHandle(dialog);
      if (handle) {
        handle.style.cursor = 'move';
        handle.style.touchAction = 'none';
      }
      ensureResizeHandle(dialog);
      if (Number.isFinite(geometry.left) && Number.isFinite(geometry.top)) {
        applyFixedPosition(dialog, Number(geometry.left), Number(geometry.top));
      } else {
        applyTransform(dialog, geometry.x, geometry.y);
      }
      applySize(dialog, geometry.width, geometry.height);
    };
    const applyAllPositions = () => {
      document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach((overlay) => {
        Array.from(overlay.children).forEach((child) => {
          if (child instanceof HTMLElement) applyDialogPosition(child, overlay);
        });
      });
    };
    const isInteractive = (target: HTMLElement) => Boolean(
      target.closest('button,input,textarea,select,a,[contenteditable="true"],[data-no-modal-drag="true"]'),
    );

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof HTMLElement)) return;
      const overlay = findOverlay(event.target);
      if (!overlay) return;
      const dialog = findDialog(overlay, event.target);
      if (!dialog || dialog.dataset.draggableManaged === 'true') return;
      if (event.target.closest('[data-global-modal-resize-handle="true"]')) {
        event.preventDefault();
        event.stopPropagation();
        applyDialogPosition(dialog, overlay);
        const rect = dialog.getBoundingClientRect();
        const direction = event.target.dataset.globalModalResizeDirection as ResizeState['direction'] | undefined;
        const resizeDirection = direction ?? 'bottom-right';
        applyFixedPosition(dialog, rect.left, rect.top);
        applySize(dialog, rect.width, rect.height);
        resizeState = {
          dialog,
          key: getDialogKey(dialog, overlay),
          pointerId: event.pointerId,
          direction: resizeDirection,
          startX: event.clientX,
          startY: event.clientY,
          originLeft: Math.round(rect.left),
          originTop: Math.round(rect.top),
          originWidth: rect.width,
          originHeight: rect.height,
        };
        document.body.style.cursor = resizeDirection === 'left' || resizeDirection === 'right'
          ? 'ew-resize'
          : resizeDirection === 'top' || resizeDirection === 'bottom'
            ? 'ns-resize'
            : 'nwse-resize';
        document.body.style.userSelect = 'none';
        try {
          event.target.setPointerCapture(event.pointerId);
        } catch {
          // Window-level listeners still receive resize events in capture phase.
        }
        return;
      }
      if (isInteractive(event.target)) return;
      if (!isInDialogDragHandle(dialog, event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      applyDialogPosition(dialog, overlay);
      const key = getDialogKey(dialog, overlay);
      const fixed = Number.isFinite(Number(dialog.dataset.globalFixedLeft)) && Number.isFinite(Number(dialog.dataset.globalFixedTop));
      dragState = {
        dialog,
        key,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: fixed ? Number(dialog.dataset.globalFixedLeft || 0) : Number(dialog.dataset.globalDragX || 0),
        originY: fixed ? Number(dialog.dataset.globalFixedTop || 0) : Number(dialog.dataset.globalDragY || 0),
        fixed,
      };
      try {
        dialog.setPointerCapture(event.pointerId);
      } catch {
        // Window-level listeners still receive the drag events in capture phase.
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (dragState && dragState.pointerId === event.pointerId) {
        event.preventDefault();
        const x = dragState.originX + event.clientX - dragState.startX;
        const y = dragState.originY + event.clientY - dragState.startY;
        if (dragState.fixed) {
          applyFixedPosition(dragState.dialog, x, y);
        } else {
          dragState.dialog.style.willChange = 'transform';
          applyTransform(dragState.dialog, x, y);
        }
        return;
      }
      if (resizeState && resizeState.pointerId === event.pointerId) {
        event.preventDefault();
        const maxWidth = Math.max(minModalWidth, window.innerWidth - viewportPadding);
        const maxHeight = Math.max(minModalHeight, window.innerHeight - viewportPadding);
        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;
        const rightEdge = resizeState.originLeft + resizeState.originWidth;
        const bottomEdge = resizeState.originTop + resizeState.originHeight;
        const maxLeftResizeWidth = Math.max(minModalWidth, rightEdge - viewportPadding / 2);
        const maxTopResizeHeight = Math.max(minModalHeight, bottomEdge - viewportPadding / 2);
        const width = resizeState.direction === 'left'
          ? clamp(resizeState.originWidth - deltaX, minModalWidth, maxLeftResizeWidth)
          : resizeState.direction === 'right' || resizeState.direction === 'bottom-right'
            ? clamp(resizeState.originWidth + deltaX, minModalWidth, maxWidth)
            : resizeState.originWidth;
        const height = resizeState.direction === 'top'
          ? clamp(resizeState.originHeight - deltaY, minModalHeight, maxTopResizeHeight)
          : resizeState.direction === 'bottom' || resizeState.direction === 'bottom-right'
            ? clamp(resizeState.originHeight + deltaY, minModalHeight, maxHeight)
            : resizeState.originHeight;
        const left = resizeState.direction === 'left' ? rightEdge - width : resizeState.originLeft;
        const top = resizeState.direction === 'top' ? bottomEdge - height : resizeState.originTop;
        applyFixedPosition(resizeState.dialog, left, top);
        applySize(resizeState.dialog, width, height);
      }
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (dragState && dragState.pointerId === event.pointerId) {
        const x = Math.round(Number(dragState.dialog.dataset.globalDragX || 0));
        const y = Math.round(Number(dragState.dialog.dataset.globalDragY || 0));
        applyTransform(dragState.dialog, x, y);
        saveDialogGeometry(dragState.key, dragState.dialog);
        dragState = null;
      }
      if (resizeState && resizeState.pointerId === event.pointerId) {
        saveDialogGeometry(resizeState.key, resizeState.dialog);
        resizeState = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    let applyFrameId = 0;
    const scheduleApplyAllPositions = () => {
      if (applyFrameId) return;
      applyFrameId = window.requestAnimationFrame(() => {
        applyFrameId = 0;
        applyAllPositions();
      });
    };

    scheduleApplyAllPositions();
    const observer = new MutationObserver(scheduleApplyAllPositions);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    return () => {
      observer.disconnect();
      if (applyFrameId) window.cancelAnimationFrame(applyFrameId);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, []);

  useEffect(() => {
    const updateShortcuts = () => {
      setShortcutBindings(loadShortcutBindings());
      setMouseGestureSettings(loadMouseGestureSettings());
    };
    window.addEventListener(SHORTCUT_UPDATED_EVENT, updateShortcuts);
    return () => window.removeEventListener(SHORTCUT_UPDATED_EVENT, updateShortcuts);
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    };

    const dispatchShortcutAction = (id: ShortcutActionId) => {
      window.dispatchEvent(new CustomEvent(SHORTCUT_ACTION_EVENT, { detail: { id } }));
    };

    const executeShortcut = (id: ShortcutActionId) => {
      if (id === 'close_floating') {
        dispatchShortcutAction(id);
        return;
      }
      if (id === 'go_home') {
        activateHomeTab();
        return;
      }
      if (id === 'close_work_tab') {
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (!activeTab || activeTab.fixed) return;
        const tabIndex = tabs.findIndex((tab) => tab.id === activeTab.id);
        const remainingTabs = tabs.filter((tab) => tab.id !== activeTab.id);
        const fallbackIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
        const fallbackTab = remainingTabs[fallbackIndex] ?? HOME_TAB;
        closeTab(activeTab.id);
        if (fallbackTab.workId) selectNovel(fallbackTab.workId);
        setActiveTabId(fallbackTab.id);
        navigate(fallbackTab.path);
        return;
      }
      dispatchShortcutAction(id);
    };

    const handleShortcut = (event: KeyboardEvent) => {
      const matched = shortcutActions.find((action) => matchesShortcut(event, shortcutBindings[action.id]));
      if (!matched) return;

      const editable = isEditableTarget(event.target);
      if (editable && (matched.id === 'delete_chapter' || matched.id === 'undo_edit')) return;
      if (matched.id === 'close_floating') {
        if (hasTopModalEscapeHandler()) return;
        executeShortcut(matched.id);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      executeShortcut(matched.id);
    };

    window.addEventListener('keydown', handleShortcut, true);
    return () => window.removeEventListener('keydown', handleShortcut, true);
  }, [activateHomeTab, activeTabId, closeTab, navigate, selectNovel, setActiveTabId, shortcutBindings, tabs]);

  useEffect(() => {
    if (location.pathname !== '/workbench' && location.pathname !== '/script-editor-v2') {
      setActiveTabId(HOME_TAB.id);
      rememberHomeRoute(location.pathname);
      return;
    }

    const raw = localStorage.getItem('xinyuexia_current_novel_id');
    const workId = raw ? Number(raw) : null;
    if (!workId || !Number.isFinite(workId)) return;

    const work = novels.find((item) => item.id === workId);
    if (!work) return;
    const path = work.type === 'script' ? '/script-editor-v2' : '/workbench';
    if (path !== location.pathname) return;

    openWorkTab({
      workId: work.id,
      workType: work.type,
      title: work.title,
      path,
    });
  }, [location.pathname, novels, openWorkTab, setActiveTabId]);

  const activateTab = (tab: WorkspaceTab) => {
    if (tab.id === HOME_TAB.id) {
      activateHomeTab();
      return;
    }
    if (tab.workId) selectNovel(tab.workId);
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const handleCloseTab = (event: MouseEvent<HTMLButtonElement>, tab: WorkspaceTab) => {
    event.stopPropagation();
    if (tab.fixed) return;

    const tabIndex = tabs.findIndex((item) => item.id === tab.id);
    const remainingTabs = tabs.filter((item) => item.id !== tab.id);
    const fallbackIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
    const fallbackTab = remainingTabs[fallbackIndex] ?? HOME_TAB;

    closeTab(tab.id);
    if (activeTabId === tab.id) activateTab(fallbackTab);
  };

  const toggleMaximizeWindow = async () => {
    const next = await window.xinyuexiaWindow?.maximizeToggle();
    if (typeof next === 'boolean') setIsMaximized(next);
  };

  const registerTitlebarClick = (event: ReactPointerEvent<HTMLElement>, heldMs: number, moved: number) => {
    if (heldMs > TITLEBAR_DOUBLE_CLICK_MAX_DURATION_MS || moved >= TITLEBAR_DRAG_THRESHOLD) {
      titlebarClickRef.current = { lastAt: 0, lastClientX: 0, lastClientY: 0 };
      return;
    }
    if (Date.now() - lastTitlebarDragAtRef.current < 420) return;

    const previous = titlebarClickRef.current;
    const now = Date.now();
    const isSecondClick = now - previous.lastAt <= TITLEBAR_DOUBLE_CLICK_GAP_MS
      && Math.hypot(event.clientX - previous.lastClientX, event.clientY - previous.lastClientY) <= TITLEBAR_DOUBLE_CLICK_DISTANCE;
    if (isSecondClick) {
      titlebarClickRef.current = { lastAt: 0, lastClientX: 0, lastClientY: 0 };
      void toggleMaximizeWindow();
      return;
    }

    titlebarClickRef.current = {
      lastAt: now,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
    };
  };

  const handleTitlebarPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || isTitlebarInteractiveTarget(event.target)) return;
    titlebarPointerMetaRef.current = {
      startedAt: Date.now(),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
    titlebarDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      dragOffsetX: 0,
      dragOffsetY: 0,
      dragSessionId: '',
      started: false,
      pending: false,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort; window-level drag still starts on the next move event.
    }
  };

  const handleTitlebarPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = titlebarDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const moved = Math.hypot(event.clientX - dragState.startClientX, event.clientY - dragState.startClientY);
    if (moved >= TITLEBAR_DRAG_THRESHOLD) {
      titlebarPointerMetaRef.current.moved = true;
    }
    if (!dragState.started && !dragState.pending && moved < TITLEBAR_DRAG_THRESHOLD) return;

    event.preventDefault();
    event.stopPropagation();

    if (!dragState.started) {
      if (dragState.pending) return;
      dragState.pending = true;
      void window.xinyuexiaWindow?.beginTitlebarDrag({
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: dragState.startClientX,
        clientY: dragState.startClientY,
        windowWidth: window.innerWidth,
      }).then((result) => {
        const current = titlebarDragRef.current;
        if (!current || current.pointerId !== dragState.pointerId) return;
        if (!result) {
          titlebarDragRef.current = null;
          return;
        }
        current.pending = false;
        current.started = true;
        current.dragOffsetX = result.dragOffsetX;
        current.dragOffsetY = result.dragOffsetY;
        current.dragSessionId = result.dragSessionId ?? '';
        setIsMaximized(result.isMaximized);
      }).catch(() => {
        const current = titlebarDragRef.current;
        if (current?.pointerId === dragState.pointerId) titlebarDragRef.current = null;
      });
      return;
    }

    void window.xinyuexiaWindow?.moveTitlebarDrag({
      screenX: event.screenX,
      screenY: event.screenY,
      dragOffsetX: dragState.dragOffsetX,
      dragOffsetY: dragState.dragOffsetY,
      dragSessionId: dragState.dragSessionId,
    });
  };

  const finishTitlebarPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = titlebarDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const heldMs = Date.now() - titlebarPointerMetaRef.current.startedAt;
    const moved = Math.hypot(event.clientX - dragState.startClientX, event.clientY - dragState.startClientY);
    if (dragState.started || dragState.pending) {
      lastTitlebarDragAtRef.current = Date.now();
      titlebarClickRef.current = { lastAt: 0, lastClientX: 0, lastClientY: 0 };
      suppressTitlebarClickRef.current = true;
      window.setTimeout(() => {
        suppressTitlebarClickRef.current = false;
      }, 450);
    } else {
      registerTitlebarClick(event, heldMs, moved);
    }
    void window.xinyuexiaWindow?.endTitlebarDrag?.({ dragSessionId: dragState.dragSessionId, screenX: event.screenX, screenY: event.screenY });
    titlebarDragRef.current = null;
  };

  const handleTitlebarClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressTitlebarClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const mouseGesturePath = mouseGesturePreview?.points.length
    ? mouseGesturePreview.points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' ')
    : '';
  const mouseGestureDirectionLabel = mouseGesturePreview?.direction === 'right' ? '前进' : '返回首页';
  const mouseGestureContinueLabel = mouseGesturePreview?.direction === 'right' ? '继续右滑' : '继续左滑';
  const mouseGestureArrow = mouseGesturePreview?.direction === 'right' ? '→' : '←';

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden bg-slate-50 ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header
        className="app-titlebar flex h-12 shrink-0 items-center border-b border-slate-300 bg-[#dfe5ec] px-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onPointerDown={handleTitlebarPointerDown}
        onPointerMove={handleTitlebarPointerMove}
        onPointerUp={finishTitlebarPointerDrag}
        onPointerCancel={finishTitlebarPointerDrag}
        onClickCapture={handleTitlebarClickCapture}
      >
        <nav
          className="flex h-full min-w-0 flex-1 items-center overflow-x-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="flex max-w-full shrink-0 items-center overflow-hidden rounded-xl bg-[#eeeeee] p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const isHomeTab = tab.id === HOME_TAB.id;
            return (
                <div
                  key={tab.id}
                  role="button"
                  tabIndex={0}
                  data-titlebar-no-drag="true"
                  onClick={() => activateTab(tab)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') activateTab(tab);
                  }}
                  className={`workspace-tab group relative flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate-700 transition-all hover:text-slate-950 ${
                    isActive
                      ? `workspace-tab-active bg-white font-bold text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ${isHomeTab ? 'workspace-tab-home' : ''}`
                      : `workspace-tab-inactive bg-transparent ${isHomeTab ? 'workspace-tab-home-inactive' : ''}`
                  } ${isHomeTab ? 'w-[150px] text-center' : 'min-w-[150px] max-w-[260px] text-left'}`}
                  title={tab.title}
                >
                  <span className={`${isHomeTab ? 'shrink-0' : 'min-w-0 flex-1 truncate text-center'}`}>{tab.title}</span>
                  {!tab.fixed && (
                    <button
                      type="button"
                      onClick={(event) => handleCloseTab(event, tab)}
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors ${
                        isActive ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                      }`}
                      aria-label={`关闭${tab.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
            );
          })}
          </div>
        </nav>

        <div
          className="flex shrink-0 items-center gap-1.5"
          data-titlebar-no-drag="true"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => {
              setShowSoftwareUiCatalog(false);
              setShowTestCollection(true);
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title="测试"
          >
            <FlaskConical className="h-4 w-4" />
            测试
          </button>
          <button
            onClick={() => {
              setShowTestCollection(false);
              setShowSoftwareUiCatalog(true);
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title="UI库"
          >
            <BookOpen className="h-4 w-4" />
            UI库
          </button>
          <button
            onClick={() => setIsDarkTheme((prev) => !prev)}
            className={`xy-dark-theme-switch mr-2 ${isDarkTheme ? 'xy-dark-active' : ''}`}
            title="主题"
            aria-pressed={isDarkTheme}
          >
            <span className="xy-dark-theme-switch-track" aria-hidden="true" />
            <span className="xy-dark-theme-switch-text">主题</span>
          </button>
          <div className="relative ml-1">
            <button
              onClick={() => setIsScaleMenuOpen((prev) => !prev)}
              className="h-8 min-w-[70px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
              title="界面比例"
            >
              {getScaleLabel(appScale)}%
            </button>
            {isScaleMenuOpen && (
              <div className="absolute right-0 top-10 z-[80] w-[104px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {APP_SCALE_OPTIONS.map((option) => {
                  const isSelected = Math.abs(appScale - option.effectiveScale) < 0.001;
                  return (
                    <button
                      key={option.labelScale}
                      onClick={() => {
                        setAppScale(option.effectiveScale);
                        setIsScaleMenuOpen(false);
                      }}
                      className={`grid h-9 w-full grid-cols-[22px_1fr] items-center px-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-slate-100 font-semibold text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-center text-base leading-none">{isSelected ? '✓' : ''}</span>
                      <span>{Math.round(option.labelScale * 100)}%</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="hidden">
            <button
              onClick={() => setAppScale((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(1))))}
              className="px-2.5 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              title="缩小 10%"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[48px] text-center text-xs text-slate-500">{Math.round(appScale * 100)}%</span>
            <button
              onClick={() => setAppScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(1))))}
              className="px-2.5 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              title="放大 10%"
            >
              <Plus className="h-4 w-4" />
            </button>
            </div>
          </div>
          <button
            onClick={() => void window.xinyuexiaWindow?.minimize()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="最小化"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              await toggleMaximizeWindow();
            }}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title={isMaximized ? '还原' : '最大化'}
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => void window.xinyuexiaWindow?.close()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
        <div
          className="origin-top-left overflow-hidden bg-slate-50"
          style={{
            width: `${100 / effectiveScale}%`,
            height: `${100 / effectiveScale}%`,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <div className="h-full bg-slate-50">
            {children}
          </div>
        </div>
      </div>
      {mouseGesturePreview && (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
          <svg className="absolute inset-0 h-full w-full">
            <path
              d={mouseGesturePath}
              fill="none"
              stroke={mouseGesturePreview.invalid ? '#ef4444' : mouseGesturePreview.ready ? '#0284c7' : '#0ea5e9'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </svg>
          <div
            className={`absolute flex min-w-[140px] items-center gap-3 rounded-2xl border px-5 py-4 text-white shadow-2xl ${
              mouseGesturePreview.invalid ? 'border-red-500 bg-red-600' : 'border-slate-700 bg-slate-950'
            }`}
            style={{
              left: Math.max(20, mouseGesturePreview.startX - 92),
              top: Math.max(58, mouseGesturePreview.startY - 96),
            }}
          >
            <span className="text-4xl leading-none">{mouseGestureArrow}</span>
            <span className="text-lg font-black text-white">
              {mouseGesturePreview.invalid ? '无效手势' : mouseGesturePreview.ready ? mouseGestureDirectionLabel : mouseGestureContinueLabel}
            </span>
          </div>
        </div>
      )}
      {showTestCollection && (
        <div
          className="fixed inset-0 z-[335] flex items-center justify-center bg-slate-950/45 p-5"
          data-titlebar-no-drag="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTestCollection(false);
          }}
        >
          <div
            className="flex h-[min(820px,90vh)] w-[min(1180px,94vw)] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">正在打开测试...</div>}>
              <TestCollectionPage embedded onClose={() => setShowTestCollection(false)} />
            </Suspense>
          </div>
        </div>
      )}
      {showSoftwareUiCatalog && (
        <div
          className="fixed inset-0 z-[340] flex items-center justify-center bg-slate-950/45 p-5"
          data-titlebar-no-drag="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSoftwareUiCatalog(false);
          }}
        >
          <div
            className="flex h-[min(900px,92vh)] w-[min(1520px,96vw)] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">正在打开 UI库...</div>}>
              <SoftwareUiCatalogPage embedded onClose={() => setShowSoftwareUiCatalog(false)} />
            </Suspense>
          </div>
        </div>
      )}
      <TextOverrideLayer />
      <AdjustmentModeLayer />
    </div>
  );
}
