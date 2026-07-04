export const INTERNAL_ROUTE_STORAGE_KEY = 'xinyuexia_show_internal_routes';

export const INTERNAL_ROUTE_PATHS = [
  '/test-collection',
  '/software-ui-catalog',
  '/hidden-content',
  '/hidden-pages-test',
  '/error-log',
  '/theme-colors',
  '/test-browser',
] as const;

type InternalRouteEnv = {
  DEV?: boolean;
};

type InternalRouteStorage = {
  getItem: (key: string) => string | null;
};

const INTERNAL_ROUTE_PATH_SET = new Set<string>(INTERNAL_ROUTE_PATHS);

function getDefaultStorage(): InternalRouteStorage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function isDefaultDevMode() {
  return import.meta.env.DEV === true;
}

export function isInternalRoutePath(path: string) {
  return INTERNAL_ROUTE_PATH_SET.has(path);
}

export function areInternalRoutesEnabled(
  env?: InternalRouteEnv,
  storage: InternalRouteStorage | null = getDefaultStorage(),
) {
  if (env?.DEV ?? isDefaultDevMode()) return true;
  try {
    return storage?.getItem(INTERNAL_ROUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function filterInternalRouteItems<T extends { to: string }>(
  items: T[],
  enabled = areInternalRoutesEnabled(),
) {
  if (enabled) return items;
  return items.filter((item) => !isInternalRoutePath(item.to));
}
