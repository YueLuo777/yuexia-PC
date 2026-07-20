import { useCallback, useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { Location, NavigateFunction } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';
import { applyCustomThemeColors } from '@/features/theme/model/customThemeColors';
import type { MouseGestureSettings } from '@/shared/shortcuts/shortcutConfig';
import { HOME_TAB } from '@/shared/tabs/WorkspaceTabsContext';

import {
  APP_EFFECTIVE_SCALE_CSS_VAR,
  APP_SCALE_KEY,
  APP_SCALE_STORAGE_VERSION,
  APP_SCALE_VERSION_KEY,
  APP_THEME_KEY,
  DARK_THEME_KEY,
  RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD,
  RIGHT_MOUSE_GESTURE_THRESHOLD,
  RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE,
  type AppThemeMode,
  type MouseGesturePreview,
} from './appFrameSupport';

type AppFrameNavigationEffectsInput = {
  appScale: number;
  effectiveScale: number;
  isThemeMenuOpen: boolean;
  location: Location;
  mouseGestureSettings: MouseGestureSettings;
  navigate: NavigateFunction;
  setActiveTabId: (id: string) => void;
  setIsMaximized: Dispatch<SetStateAction<boolean>>;
  setIsThemeMenuOpen: Dispatch<SetStateAction<boolean>>;
  setMouseGesturePreview: Dispatch<SetStateAction<MouseGesturePreview | null>>;
  themeMenuRef: RefObject<HTMLDivElement | null>;
  themeMode: AppThemeMode;
};

export function useAppFrameNavigationEffects({
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
}: AppFrameNavigationEffectsInput) {
  useEffect(() => {
    applyCustomThemeColors();
  }, []);
  useEffect(() => {
    if (!isThemeMenuOpen) return;
    const handleThemeMenuOutsidePointerDown = (event: PointerEvent) => {
      if (themeMenuRef.current?.contains(event.target as Node)) return;
      setIsThemeMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleThemeMenuOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleThemeMenuOutsidePointerDown);
  }, [isThemeMenuOpen, setIsThemeMenuOpen, themeMenuRef]);
  const activateHomeTab = useCallback(() => {
    setActiveTabId(HOME_TAB.id);
    navigate(HOME_TAB.path);
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
    document.documentElement.classList.remove('theme-dark');
    document.documentElement.classList.toggle('theme-shuimo', themeMode === 'shuimo');
    document.documentElement.classList.toggle('theme-shuimo2', themeMode === 'shuimo2');
    document.documentElement.classList.toggle('theme-test07', themeMode === 'test07');
    localStorage.setItem(APP_THEME_KEY, themeMode);
    localStorage.setItem(DARK_THEME_KEY, '0');
    return () => {
      document.documentElement.classList.remove('theme-shuimo2');
      document.documentElement.classList.remove('theme-test07');
    };
  }, [themeMode]);
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
    window.xinyuexiaWindow
      ?.isMaximized()
      .then((value) => {
        if (mounted) setIsMaximized(value);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [setIsMaximized]);
  useEffect(() => {
    return window.xinyuexiaWindow?.onMaximizedChange?.((value) => {
      setIsMaximized(value);
    });
  }, [setIsMaximized]);
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

    const goHome = () => {
      if (location.pathname === '/test-collection') {
        window.dispatchEvent(new Event(TEST_COLLECTION_SHOW_INDEX_EVENT));
        return;
      }
      activateHomeTab();
    };
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
      const directionEnabled =
        (gesture.direction === 'left' && mouseGestureSettings.goHomeLeftSwipe) ||
        (gesture.direction === 'right' && mouseGestureSettings.forwardRightSwipe);
      gesture.ready =
        !gesture.invalidated && directionEnabled && Math.abs(deltaY) <= RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE;
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
  }, [
    activateHomeTab,
    location.pathname,
    mouseGestureSettings.forwardRightSwipe,
    mouseGestureSettings.goHomeLeftSwipe,
    navigate,
    setMouseGesturePreview,
  ]);
  return { activateHomeTab };
}
