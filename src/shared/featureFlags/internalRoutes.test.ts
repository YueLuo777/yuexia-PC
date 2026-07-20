import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  INTERNAL_ROUTE_PATHS,
  areInternalRoutesEnabled,
  areInternalRouteModulesBundled,
  filterInternalRouteItems,
  isInternalRoutePath,
} from './internalRoutes';

const createStorage = (enabled: boolean) => ({
  getItem: (key: string) => (key === 'xinyuexia_show_internal_routes' && enabled ? '1' : null),
});

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('internal route feature gate', () => {
  it('keeps internal pages available in development', () => {
    expect(areInternalRoutesEnabled({ DEV: true }, createStorage(false))).toBe(true);
  });

  it('hides internal pages in production unless the bundle explicitly includes them', () => {
    expect(areInternalRoutesEnabled({ DEV: false }, createStorage(false))).toBe(false);
    expect(areInternalRoutesEnabled({ DEV: false }, createStorage(true))).toBe(false);
    expect(areInternalRoutesEnabled({ DEV: false, VITE_INCLUDE_INTERNAL_ROUTES: '1' }, createStorage(true))).toBe(true);
  });

  it('keeps internal route modules out of normal production bundles', () => {
    expect(areInternalRouteModulesBundled({ DEV: true })).toBe(true);
    expect(areInternalRouteModulesBundled({ DEV: false })).toBe(false);
    expect(areInternalRouteModulesBundled({ DEV: false, VITE_INCLUDE_INTERNAL_ROUTES: '1' })).toBe(true);

    expect(areInternalRoutesEnabled({ DEV: false }, createStorage(true))).toBe(false);
    expect(areInternalRoutesEnabled({ DEV: false, VITE_INCLUDE_INTERNAL_ROUTES: '1' }, createStorage(true))).toBe(true);
  });

  it('filters test and diagnostics navigation items behind the same gate', () => {
    const gateSource = readSource('internalRoutes.ts');

    expect(INTERNAL_ROUTE_PATHS).toContainSource('/test-collection');
    expect(gateSource).toContainSource("import { INTERNAL_ROUTE_PATHS } from '@/app/routeRegistry';");
    expect(gateSource).toContainSource("export { INTERNAL_ROUTE_PATHS } from '@/app/routeRegistry';");
    expect(isInternalRoutePath('/error-log')).toBe(true);
    expect(
      filterInternalRouteItems(
        [
          { to: '/novels', label: '首页' },
          { to: '/test-collection', label: '测试' },
        ],
        false,
      ),
    ).toEqual([{ to: '/novels', label: '首页' }]);
  });

  it('uses the same gate for dashboard routes and navigation links', () => {
    const gateSource = readSource('internalRoutes.ts');
    const appSource = readSource('../../app/App.tsx');
    const layoutSource = readSource('../layout/DashboardLayout.tsx');

    expect(gateSource).toContainSource("env.DEV === true || env.VITE_INCLUDE_INTERNAL_ROUTES === '1'");
    expect(gateSource).not.toContainSource('return import.meta.env;');
    expect(gateSource).not.toContainSource('= import.meta.env');
    expect(appSource).toContainSource(
      "import { areInternalRoutesEnabled } from '@/shared/featureFlags/internalRoutes';",
    );
    expect(appSource).toContainSource('const showInternalRoutes = areInternalRoutesEnabled();');
    expect(appSource).not.toContainSource('@/features/tests/pages/TestCollectionPage');
    expect(appSource).not.toContainSource('@/features/tests/pages/SoftwareUiCatalogPage');
    expect(appSource).not.toContainSource('@/features/tests/pages/ErrorLogPage');
    expect(appSource).toContainSource("import('@/app/InternalRoutesPage')");
    expect(appSource).toContainSource('{showInternalRoutes && InternalRoutesPage && <Route path="*"');
    expect(layoutSource).toContainSource(
      "import { filterInternalRouteItems } from '@/shared/featureFlags/internalRoutes';",
    );
    expect(layoutSource).toContainSource('const visiblePublicNavItems = filterInternalRouteItems(visibleNavItems);');
  });
});
