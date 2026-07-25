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

export const APP_SCALE_KEY = 'xinyuexia_app_scale';
export const APP_SCALE_VERSION_KEY = 'xinyuexia_app_scale_version';
export const DARK_THEME_KEY = 'xinyuexia_dark_theme';
export const APP_THEME_KEY = 'xinyuexia_app_theme_mode_v1';
export const APP_SCALE_BASE = 1.1;
export const APP_SCALE_STORAGE_VERSION = '2';
export const APP_SCALE_OPTIONS = [1, 1.1, 1.25, 1.5, 1.75, 2].map((labelScale) => ({
  labelScale,
  effectiveScale: Number((APP_SCALE_BASE * labelScale).toFixed(3)),
}));
export const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';
export const RIGHT_MOUSE_GESTURE_THRESHOLD = 90;
export const RIGHT_MOUSE_GESTURE_VERTICAL_TOLERANCE = 80;
export const RIGHT_MOUSE_GESTURE_PREVIEW_THRESHOLD = 18;

export type AppThemeMode = 'light' | 'shuimo' | 'shuimo2' | 'test07';

export const THEME_OPTIONS: Array<{ key: AppThemeMode; label: string }> = [
  { key: 'light', label: '默认主题' },
  { key: 'shuimo', label: '水墨' },
  { key: 'shuimo2', label: '水墨2' },
  { key: 'test07', label: '清爽主题' },
];

export type MouseGesturePreview = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  points: Array<{ x: number; y: number }>;
  ready: boolean;
  invalid: boolean;
  direction: 'left' | 'right' | null;
};

export function loadScale() {
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

export function getScaleLabel(scale: number) {
  return Math.round((scale / APP_SCALE_BASE) * 100);
}

export function isAppThemeMode(value: string | null): value is AppThemeMode {
  return value === 'light' || value === 'shuimo' || value === 'shuimo2' || value === 'test07';
}

export function loadThemeMode(): AppThemeMode {
  try {
    const savedTheme = localStorage.getItem(APP_THEME_KEY);
    if (isAppThemeMode(savedTheme)) return savedTheme;
    return 'light';
  } catch {
    return 'light';
  }
}

export interface AppFrameProps {
  children: ReactNode;
}

export const INTERNAL_ROUTE_MODULES_BUNDLED =
  import.meta.env.DEV || import.meta.env.VITE_INCLUDE_INTERNAL_ROUTES === '1';
export const SoftwareUiCatalogPage = INTERNAL_ROUTE_MODULES_BUNDLED
  ? lazy(() =>
      import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({
        default: module.SoftwareUiCatalogPage,
      })),
    )
  : null;
