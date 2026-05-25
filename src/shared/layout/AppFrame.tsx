import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Minus, Moon, PanelLeft, Plus, Square, X } from 'lucide-react';

import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import {
  loadShortcutBindings,
  matchesShortcut,
  SHORTCUT_ACTION_EVENT,
  SHORTCUT_UPDATED_EVENT,
  shortcutActions,
  type ShortcutActionId,
} from '@/shared/shortcuts/shortcutConfig';
import { hasTopModalEscapeHandler } from '@/shared/hooks/useTopModalEscape';
import { HOME_TAB, useWorkspaceTabs, type WorkspaceTab } from '@/shared/tabs/WorkspaceTabsContext';

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
const TITLEBAR_DRAG_THRESHOLD = 8;
const TITLEBAR_DOUBLE_CLICK_MAX_DURATION_MS = 260;
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
};

type TitlebarDragResult = {
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

interface AppFrameProps {
  children: ReactNode;
}

type TitlebarDragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  dragOffsetX: number;
  dragOffsetY: number;
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
  const [shortcutBindings, setShortcutBindings] = useState(loadShortcutBindings);
  const [mouseGesturePreview, setMouseGesturePreview] = useState<MouseGesturePreview | null>(null);
  const titlebarDragRef = useRef<TitlebarDragState | null>(null);
  const suppressTitlebarClickRef = useRef(false);
  const titlebarPointerMetaRef = useRef({ startedAt: 0, startClientX: 0, startClientY: 0, moved: false });

  const effectiveScale = useMemo(() => Number(appScale.toFixed(3)), [appScale]);

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
    let gesture: {
      startX: number;
      startY: number;
      visible: boolean;
      ready: boolean;
      invalidated: boolean;
      hasMovedLeft: boolean;
      points: Array<{ x: number; y: number }>;
    } | null = null;
    let suppressNextContextMenu = false;

    const goHome = () => {
      setActiveTabId(HOME_TAB.id);
      navigate('/dashboard');
    };

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      if (event.button !== 2) return;
      gesture = {
        startX: event.clientX,
        startY: event.clientY,
        visible: false,
        ready: false,
        invalidated: false,
        hasMovedLeft: false,
        points: [{ x: event.clientX, y: event.clientY }],
      };
      setMouseGesturePreview(null);
    };

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!gesture) return;
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const distance = Math.hypot(deltaX, deltaY);
      if (deltaX > -RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD && !gesture.visible) return;
      if (distance < RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD) return;
      const lastPoint = gesture.points[gesture.points.length - 1];
      const segmentDx = lastPoint ? event.clientX - lastPoint.x : 0;
      const segmentDy = lastPoint ? event.clientY - lastPoint.y : 0;
      if (gesture.visible && gesture.hasMovedLeft) {
        if (segmentDx > 4 || Math.abs(segmentDy) > 14) {
          gesture.invalidated = true;
          gesture.ready = false;
        }
      }
      if (segmentDx < -2) gesture.hasMovedLeft = true;
      gesture.visible = true;
      gesture.ready = !gesture.invalidated
        && gesture.hasMovedLeft
        && deltaX <= -RIGHT_MOUSE_GESTURE_THRESHOLD
        && Math.abs(deltaY) <= RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE;
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
      });
    };

    const handleMouseUp = () => {
      if (gesture?.ready && !gesture.invalidated) {
        suppressNextContextMenu = true;
        goHome();
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
  }, [navigate, setActiveTabId]);

  useEffect(() => {
    type DragState = {
      dialog: HTMLElement;
      key: string;
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    };
    let dragState: DragState | null = null;

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
      const firstChild = Array.from(dialog.children).find((child): child is HTMLElement => child instanceof HTMLElement);
      return firstChild ?? null;
    };
    const isInDialogDragHandle = (dialog: HTMLElement, target: HTMLElement) => {
      const handle = findDialogDragHandle(dialog);
      return Boolean(handle?.contains(target));
    };
    const getDialogKey = (dialog: HTMLElement) => {
      const title = dialog.querySelector('h1,h2,h3')?.textContent?.trim() || dialog.className || 'modal';
      return `xinyuexia_global_modal_position_${title.slice(0, 40)}`;
    };
    const readDialogPosition = (key: string) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}') as { x?: number; y?: number };
        return {
          x: Number.isFinite(parsed.x) ? Math.round(Number(parsed.x)) : 0,
          y: Number.isFinite(parsed.y) ? Math.round(Number(parsed.y)) : 0,
        };
      } catch {
        return { x: 0, y: 0 };
      }
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
    const applyDialogPosition = (dialog: HTMLElement) => {
      if (dialog.dataset.draggableManaged === 'true' || dialog.dataset.globalDraggableApplied === 'true') return;
      const position = readDialogPosition(getDialogKey(dialog));
      dialog.dataset.globalDraggableApplied = 'true';
      const handle = findDialogDragHandle(dialog);
      if (handle) {
        handle.style.cursor = 'move';
        handle.style.touchAction = 'none';
      }
      applyTransform(dialog, position.x, position.y);
    };
    const applyAllPositions = () => {
      document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach((overlay) => {
        Array.from(overlay.children).forEach((child) => {
          if (child instanceof HTMLElement) applyDialogPosition(child);
        });
      });
    };
    const isInteractive = (target: HTMLElement) => Boolean(
      target.closest('button,input,textarea,select,a,[contenteditable="true"],[data-no-modal-drag="true"]'),
    );

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof HTMLElement) || isInteractive(event.target)) return;
      const overlay = findOverlay(event.target);
      if (!overlay) return;
      const dialog = findDialog(overlay, event.target);
      if (!dialog || dialog.dataset.draggableManaged === 'true') return;
      if (!isInDialogDragHandle(dialog, event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      applyDialogPosition(dialog);
      const key = getDialogKey(dialog);
      dragState = {
        dialog,
        key,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: Number(dialog.dataset.globalDragX || 0),
        originY: Number(dialog.dataset.globalDragY || 0),
      };
      try {
        dialog.setPointerCapture(event.pointerId);
      } catch {
        // Window-level listeners still receive the drag events in capture phase.
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      event.preventDefault();
      const x = dragState.originX + event.clientX - dragState.startX;
      const y = dragState.originY + event.clientY - dragState.startY;
      dragState.dialog.style.willChange = 'transform';
      applyTransform(dragState.dialog, x, y);
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const x = Math.round(Number(dragState.dialog.dataset.globalDragX || 0));
      const y = Math.round(Number(dragState.dialog.dataset.globalDragY || 0));
      applyTransform(dragState.dialog, x, y);
      localStorage.setItem(dragState.key, JSON.stringify({ x, y }));
      dragState = null;
    };

    applyAllPositions();
    const observer = new MutationObserver(applyAllPositions);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, []);

  useEffect(() => {
    const updateShortcuts = () => setShortcutBindings(loadShortcutBindings());
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
        setActiveTabId(HOME_TAB.id);
        navigate('/dashboard');
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
  }, [activeTabId, closeTab, navigate, selectNovel, setActiveTabId, shortcutBindings, tabs]);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setActiveTabId(HOME_TAB.id);
      return;
    }

    if (location.pathname !== '/workbench' && location.pathname !== '/script-editor-v2') return;

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

  const handleTitlebarDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button,[data-titlebar-no-drag="true"]')) return;
    const meta = titlebarPointerMetaRef.current;
    const heldMs = Date.now() - meta.startedAt;
    if (meta.moved || heldMs > TITLEBAR_DOUBLE_CLICK_MAX_DURATION_MS) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    void toggleMaximizeWindow();
  };

  const handleTitlebarPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || isTitlebarInteractiveTarget(event.target)) return;
    titlebarPointerMetaRef.current = {
      startedAt: Date.now(),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
    if (event.detail > 1) return;
    titlebarDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      dragOffsetX: 0,
      dragOffsetY: 0,
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
    });
  };

  const finishTitlebarPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = titlebarDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    if (dragState.started || dragState.pending) {
      suppressTitlebarClickRef.current = true;
      window.setTimeout(() => {
        suppressTitlebarClickRef.current = false;
      }, 0);
    }
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
        onDoubleClick={handleTitlebarDoubleClick}
      >
        <nav
          className="flex h-full min-w-0 flex-1 items-end overflow-x-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isHomeTab = tab.id === HOME_TAB.id;
            return (
              <div key={tab.id} className={`flex h-11 shrink-0 items-end ${index === 0 ? '' : '-ml-px'}`}>
                <div
                  role="button"
                  tabIndex={0}
                  data-titlebar-no-drag="true"
                  onClick={() => activateTab(tab)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') activateTab(tab);
                  }}
                  className={`workspace-tab group relative flex h-10 shrink-0 cursor-pointer items-center gap-2 border px-3 text-[15px] font-semibold transition-colors ${
                    isActive
                      ? `workspace-tab-active rounded-t-lg border-slate-300 border-b-white bg-white text-slate-950 shadow-[0_-1px_0_rgba(255,255,255,0.7)] ${isHomeTab ? 'workspace-tab-home' : ''}`
                      : `workspace-tab-inactive border-transparent bg-transparent text-slate-700 shadow-none hover:text-slate-900 ${isHomeTab ? 'workspace-tab-home-inactive' : ''}`
                  } ${isHomeTab ? 'w-[118px] justify-center text-center' : 'min-w-[112px] max-w-[260px] w-fit text-left'}`}
                  title={tab.title}
                >
                  {!isHomeTab && (
                    <PanelLeft className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  )}
                  <span className={`${isHomeTab ? 'shrink-0 text-[18px] font-bold' : 'min-w-0 flex-1 truncate'}`}>{tab.title}</span>
                  {!tab.fixed && (
                    <button
                      type="button"
                      onClick={(event) => handleCloseTab(event, tab)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'
                      }`}
                      aria-label={`关闭${tab.title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div
          className="flex shrink-0 items-center gap-1.5"
          data-titlebar-no-drag="true"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setIsDarkTheme((prev) => !prev)}
            className={`mr-2 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
              isDarkTheme
                ? 'border-blue-500/50 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="黑色主题"
          >
            <Moon className="h-4 w-4" />
            黑色主题
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
              stroke={mouseGesturePreview.ready ? '#0284c7' : '#0ea5e9'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </svg>
          <div
            className="absolute flex min-w-[140px] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-white shadow-2xl"
            style={{
              left: Math.max(20, mouseGesturePreview.startX - 92),
              top: Math.max(58, mouseGesturePreview.startY - 96),
            }}
          >
            <span className="text-4xl leading-none">←</span>
            <span className="text-lg font-black text-white">{mouseGesturePreview.ready ? '返回首页' : '继续左滑'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
