import routeRegistry from '../../config/app-routes.json';

export type FormalRouteComponentKey =
  | 'modelManage'
  | 'novelLibrary'
  | 'prompts'
  | 'settings'
  | 'templateManage'
  | 'tokenUsage'
  | 'tomatoGenreIteration'
  | 'workbench';

export type InternalRouteComponentKey =
  | 'errorLog'
  | 'hiddenPages'
  | 'softwareUiCatalog'
  | 'testBrowser'
  | 'testCollection';

type RouteNavigationMetadata = {
  iconName: string;
  label: string;
};

export type FormalRouteDefinition = {
  id: string;
  path: string;
  component: FormalRouteComponentKey;
  dashboard: boolean;
  smoke: boolean;
  nav?: RouteNavigationMetadata;
};

export type InternalRouteDefinition = {
  id: string;
  path: string;
  component?: InternalRouteComponentKey;
  redirectTo?: string;
  nav?: RouteNavigationMetadata;
};

export type LegacyRouteRedirect = {
  path: string;
  to: string;
};

const registry = routeRegistry as {
  startupPath: string;
  formal: FormalRouteDefinition[];
  internal: InternalRouteDefinition[];
  legacyRedirects: LegacyRouteRedirect[];
};

export const FORMAL_ROUTE_DEFINITIONS = registry.formal;
export const INTERNAL_ROUTE_DEFINITIONS = registry.internal;
export const STARTUP_ROUTE_PATH = registry.startupPath;

export const APP_ROUTE_PATHS = Object.fromEntries(
  FORMAL_ROUTE_DEFINITIONS.map((route) => [route.id, route.path]),
) as Readonly<Record<string, string>>;

export const INTERNAL_ROUTE_PATHS = INTERNAL_ROUTE_DEFINITIONS.map((route) => route.path);

export const DEFAULT_NAV_ROUTE_ITEMS = [...FORMAL_ROUTE_DEFINITIONS, ...INTERNAL_ROUTE_DEFINITIONS]
  .filter((route): route is (FormalRouteDefinition | InternalRouteDefinition) & { nav: RouteNavigationMetadata } =>
    Boolean(route.nav),
  )
  .map((route) => ({ ...route.nav, to: route.path }));

export const FORMAL_SMOKE_ROUTE_PATHS = FORMAL_ROUTE_DEFINITIONS.filter((route) => route.smoke).map(
  (route) => route.path,
);

export const LEGACY_ROUTE_REDIRECTS = registry.legacyRedirects;
