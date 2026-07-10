export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY = 'xinyuexia_workbench_left_nav_width';
export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY = 'xinyuexia_workbench_left_nav_width_unified';
export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT = 'xinyuexia:workbench-shared-left-nav-width';
export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_DEFAULT = 200;
export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN = 180;
export const WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX = 640;

export function normalizeSharedWorkbenchLeftNavWidth(
  value: number,
  maxWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX,
  minWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN,
) {
  const effectiveMax =
    Number.isFinite(maxWidth) && maxWidth > 0 ? Math.round(maxWidth) : WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX;
  const effectiveMin = Math.min(Math.max(WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN, Math.round(minWidth)), effectiveMax);
  if (!Number.isFinite(value))
    return Math.min(Math.max(WORKBENCH_SHARED_LEFT_NAV_WIDTH_DEFAULT, effectiveMin), effectiveMax);
  return Math.max(effectiveMin, Math.min(effectiveMax, Math.round(value)));
}

export function readSharedWorkbenchLeftNavWidth(
  maxWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX,
  minWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN,
) {
  try {
    const stored = Number(localStorage.getItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY));
    return normalizeSharedWorkbenchLeftNavWidth(
      Number.isFinite(stored) && stored > 0 ? stored : WORKBENCH_SHARED_LEFT_NAV_WIDTH_DEFAULT,
      maxWidth,
      minWidth,
    );
  } catch {
    return normalizeSharedWorkbenchLeftNavWidth(WORKBENCH_SHARED_LEFT_NAV_WIDTH_DEFAULT, maxWidth, minWidth);
  }
}

export function writeSharedWorkbenchLeftNavWidth(
  value: number,
  maxWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX,
  minWidth = WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN,
) {
  const normalized = normalizeSharedWorkbenchLeftNavWidth(value, maxWidth, minWidth);
  localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, String(normalized));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, { detail: { width: normalized } }));
  }
  return normalized;
}

export function readSharedWorkbenchLeftNavWidthEnabled() {
  try {
    return localStorage.getItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeSharedWorkbenchLeftNavWidthEnabled(enabled: boolean) {
  localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, String(enabled));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, { detail: { enabled } }));
  }
  return enabled;
}
