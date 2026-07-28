import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, Minus, Plus, Square, X } from 'lucide-react';

import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';
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
import { applyCustomThemeColors } from '@/features/theme/model/customThemeColors';
import { areInternalRoutesEnabled } from '@/shared/featureFlags/internalRoutes';

import {
  APP_SCALE_KEY,
  APP_SCALE_VERSION_KEY,
  DARK_THEME_KEY,
  APP_THEME_KEY,
  APP_SCALE_BASE,
  APP_SCALE_STORAGE_VERSION,
  APP_SCALE_OPTIONS,
  APP_EFFECTIVE_SCALE_CSS_VAR,
  RIGHT_MOUSE_GESTURE_THRESHOLD,
  RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE,
  RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD,
  type AppThemeMode,
  THEME_OPTIONS,
  type MouseGesturePreview,
  loadScale,
  getScaleLabel,
  isAppThemeMode,
  loadThemeMode,
  type AppFrameProps,
  INTERNAL_ROUTE_MODULES_BUNDLED,
  SoftwareUiCatalogPage,
} from './appFrameSupport';
import { renderAppFrameView } from './AppFrameView';
import { useAppFrameNavigationEffects } from './useAppFrameNavigationEffects';

export function AppFrame({ children }: AppFrameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { novels, selectNovel } = useNovelLibrary();
  const { tabs, activeTabId, setActiveTabId, openWorkTab, closeTab } = useWorkspaceTabs();
  const [isMaximized, setIsMaximized] = useState(false);
  const [appScale, setAppScale] = useState(loadScale);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<AppThemeMode>(loadThemeMode);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const [showSoftwareUiCatalog, setShowSoftwareUiCatalog] = useState(false);
  const [shortcutBindings, setShortcutBindings] = useState(loadShortcutBindings);
  const [mouseGestureSettings, setMouseGestureSettings] = useState(loadMouseGestureSettings);
  const [mouseGesturePreview, setMouseGesturePreview] = useState<MouseGesturePreview | null>(null);
  const showInternalTools = areInternalRoutesEnabled();

  const effectiveScale = useMemo(() => Number(appScale.toFixed(3)), [appScale]);
  const activeTheme = THEME_OPTIONS.find((option) => option.key === themeMode) ?? THEME_OPTIONS[0];
  const themeClassName = themeMode === 'light' ? '' : `theme-${themeMode}`;

  useTopModalEscape(showInternalTools && showSoftwareUiCatalog, () => setShowSoftwareUiCatalog(false));

  const { activateHomeTab } = useAppFrameNavigationEffects({
    appScale,
    effectiveScale,
    isThemeMenuOpen,
    location,
    mouseGestureSettings,
    navigate,
    setActiveTabId,
    setIsMaximized,
    setIsThemeMenuOpen,
    setMouseGesturePreview,
    themeMenuRef,
    themeMode,
  });

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
      active: boolean;
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

    const isOverlay = (element: HTMLElement) =>
      element.classList.contains('fixed') && element.classList.contains('inset-0');
    const findOverlay = (target: HTMLElement | null) => {
      let current: HTMLElement | null = target;
      while (current) {
        if (isOverlay(current)) return current;
        current = current.parentElement;
      }
      return null;
    };
    const findDialog = (overlay: HTMLElement, target: HTMLElement) => {
      const children = Array.from(overlay.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      return children.find((child) => child.contains(target)) ?? null;
    };
    const findDialogDragHandle = (dialog: HTMLElement) => {
      const explicitHandle = dialog.querySelector<HTMLElement>('[data-modal-drag-handle="true"]');
      if (explicitHandle) return explicitHandle;
      const semanticHeader = dialog.querySelector<HTMLElement>('header');
      if (semanticHeader) return semanticHeader;
      const firstBlock = Array.from(dialog.children).find(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      if (!firstBlock) return null;
      const hasTitle = Boolean(firstBlock.querySelector('h1,h2,h3,[data-modal-title="true"]'));
      const hasCloseButton = Boolean(firstBlock.querySelector('button,[aria-label*="关闭"],[title*="关闭"]'));
      return hasTitle || hasCloseButton ? firstBlock : null;
    };
    const isInDialogDragHandle = (dialog: HTMLElement, target: HTMLElement) => {
      const handle = findDialogDragHandle(dialog);
      return Boolean(handle?.contains(target));
    };
    const getDialogKey = (dialog: HTMLElement, overlay?: HTMLElement) => {
      const explicitId =
        dialog.dataset.modalId ||
        dialog.dataset.globalModalId ||
        overlay?.dataset.modalId ||
        overlay?.dataset.globalModalId;
      if (explicitId) return `xinyuexia_global_modal_position_${explicitId.slice(0, 80)}`;
      const title =
        dialog.querySelector('[data-modal-title="true"],h1,h2,h3')?.textContent?.trim() || dialog.className || 'modal';
      return `xinyuexia_global_modal_position_${title.slice(0, 40)}`;
    };
    const readDialogGeometry = (key: string) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}') as {
          x?: number;
          y?: number;
          left?: number;
          top?: number;
          width?: number;
          height?: number;
        };
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
      localStorage.setItem(
        key,
        JSON.stringify({
          x: Math.round(Number(dialog.dataset.globalDragX || 0)),
          y: Math.round(Number(dialog.dataset.globalDragY || 0)),
          left: Number.isFinite(Number(dialog.dataset.globalFixedLeft))
            ? Math.round(Number(dialog.dataset.globalFixedLeft))
            : undefined,
          top: Number.isFinite(Number(dialog.dataset.globalFixedTop))
            ? Math.round(Number(dialog.dataset.globalFixedTop))
            : undefined,
          width: Number.isFinite(Number(dialog.dataset.globalResizeWidth))
            ? Math.round(Number(dialog.dataset.globalResizeWidth))
            : undefined,
          height: Number.isFinite(Number(dialog.dataset.globalResizeHeight))
            ? Math.round(Number(dialog.dataset.globalResizeHeight))
            : undefined,
        }),
      );
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
      if (
        dialog.dataset.draggableManaged === 'true' ||
        dialog.dataset.globalModalStatic === 'true' ||
        dialog.dataset.globalDraggableApplied === 'true'
      )
        return;
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
    const isInteractive = (target: HTMLElement) =>
      Boolean(target.closest('button,input,textarea,select,a,[contenteditable="true"],[data-no-modal-drag="true"]'));

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof HTMLElement)) return;
      const overlay = findOverlay(event.target);
      if (!overlay) return;
      const dialog = findDialog(overlay, event.target);
      if (!dialog || dialog.dataset.draggableManaged === 'true' || dialog.dataset.globalModalStatic === 'true') return;
      if (event.target.closest('[data-global-modal-resize-handle="true"]')) {
        event.preventDefault();
        event.stopPropagation();
        applyDialogPosition(dialog, overlay);
        const rect = dialog.getBoundingClientRect();
        const direction = event.target.dataset.globalModalResizeDirection as ResizeState['direction'] | undefined;
        const resizeDirection = direction ?? 'bottom-right';
        resizeState = {
          dialog,
          key: getDialogKey(dialog, overlay),
          pointerId: event.pointerId,
          direction: resizeDirection,
          active: false,
          startX: event.clientX,
          startY: event.clientY,
          originLeft: Math.round(rect.left),
          originTop: Math.round(rect.top),
          originWidth: rect.width,
          originHeight: rect.height,
        };
        document.body.style.cursor =
          resizeDirection === 'left' || resizeDirection === 'right'
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
      const fixed =
        Number.isFinite(Number(dialog.dataset.globalFixedLeft)) &&
        Number.isFinite(Number(dialog.dataset.globalFixedTop));
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
        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;
        if (!resizeState.active) {
          if (Math.hypot(deltaX, deltaY) < 3) return;
          resizeState.active = true;
          applyFixedPosition(resizeState.dialog, resizeState.originLeft, resizeState.originTop);
          applySize(resizeState.dialog, resizeState.originWidth, resizeState.originHeight);
        }
        const maxWidth = Math.max(minModalWidth, window.innerWidth - viewportPadding);
        const maxHeight = Math.max(minModalHeight, window.innerHeight - viewportPadding);
        const rightEdge = resizeState.originLeft + resizeState.originWidth;
        const bottomEdge = resizeState.originTop + resizeState.originHeight;
        const maxLeftResizeWidth = Math.max(minModalWidth, rightEdge - viewportPadding / 2);
        const maxTopResizeHeight = Math.max(minModalHeight, bottomEdge - viewportPadding / 2);
        const width =
          resizeState.direction === 'left'
            ? clamp(resizeState.originWidth - deltaX, minModalWidth, maxLeftResizeWidth)
            : resizeState.direction === 'right' || resizeState.direction === 'bottom-right'
              ? clamp(resizeState.originWidth + deltaX, minModalWidth, maxWidth)
              : resizeState.originWidth;
        const height =
          resizeState.direction === 'top'
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
        if (resizeState.active) saveDialogGeometry(resizeState.key, resizeState.dialog);
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
    if (location.pathname !== '/workbench') {
      setActiveTabId(HOME_TAB.id);
      return;
    }

    const raw = localStorage.getItem('xinyuexia_current_novel_id');
    const workId = raw ? Number(raw) : null;
    if (!workId || !Number.isFinite(workId)) return;

    const work = novels.find((item) => item.id === workId);
    if (!work) return;
    if (work.type !== 'novel') return;
    const path = '/workbench';

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

  const mouseGesturePath = mouseGesturePreview?.points.length
    ? mouseGesturePreview.points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(' ')
    : '';
  const mouseGestureDirectionLabel =
    mouseGesturePreview?.direction === 'right'
      ? '前进'
      : location.pathname === '/test-collection'
        ? '返回测试'
        : '返回我的小说';
  const mouseGestureContinueLabel = mouseGesturePreview?.direction === 'right' ? '继续右滑' : '继续左滑';
  const mouseGestureArrow = mouseGesturePreview?.direction === 'right' ? '→' : '←';
  const renderThemeOption = (option: (typeof THEME_OPTIONS)[number]) => {
    const isSelected = option.key === activeTheme.key;
    return (
      <button
        type="button"
        role="menuitemradio"
        aria-checked={isSelected}
        onClick={() => {
          setThemeMode(option.key);
          setIsThemeMenuOpen(false);
        }}
        className={`xy-theme-option ${isSelected ? 'xy-theme-option-active' : ''}`}
      >
        <span className="xy-theme-option-mark" aria-hidden="true">
          {isSelected ? '✓' : ''}
        </span>
        <span className="xy-theme-option-label">{option.label}</span>
      </button>
    );
  };

  return renderAppFrameView({
    APP_SCALE_OPTIONS,
    BookOpen,
    FlaskConical,
    HOME_TAB,
    Minus,
    Plus,
    SoftwareUiCatalogPage,
    Square,
    Suspense,
    THEME_OPTIONS,
    X,
    activateTab,
    activeTabId,
    appScale,
    children,
    effectiveScale,
    getScaleLabel,
    handleCloseTab,
    isMaximized,
    isScaleMenuOpen,
    isThemeMenuOpen,
    routePath: location.pathname,
    mouseGestureArrow,
    mouseGestureContinueLabel,
    mouseGestureDirectionLabel,
    mouseGesturePath,
    mouseGesturePreview,
    navigate,
    renderThemeOption,
    setAppScale,
    setIsScaleMenuOpen,
    setIsThemeMenuOpen,
    setShowSoftwareUiCatalog,
    showInternalTools,
    showSoftwareUiCatalog,
    tabs,
    themeClassName,
    themeMenuRef,
    themeMode,
    toggleMaximizeWindow,
  });
}
