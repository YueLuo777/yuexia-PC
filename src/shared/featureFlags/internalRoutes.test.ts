import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  INTERNAL_ROUTE_PATHS,
  areInternalRoutesEnabled,
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

  it('hides internal pages in production unless explicitly enabled', () => {
    expect(areInternalRoutesEnabled({ DEV: false }, createStorage(false))).toBe(false);
    expect(areInternalRoutesEnabled({ DEV: false }, createStorage(true))).toBe(true);
  });

  it('filters test and diagnostics navigation items behind the same gate', () => {
    expect(INTERNAL_ROUTE_PATHS).toContain('/test-collection');
    expect(isInternalRoutePath('/error-log')).toBe(true);
    expect(filterInternalRouteItems([
      { to: '/novels', label: '首页' },
      { to: '/test-collection', label: '测试' },
    ], false)).toEqual([{ to: '/novels', label: '首页' }]);
  });

  it('uses the same gate for dashboard routes and navigation links', () => {
    const gateSource = readSource('internalRoutes.ts');
    const appSource = readSource('../../app/App.tsx');
    const layoutSource = readSource('../layout/DashboardLayout.tsx');

    expect(gateSource).toContain('return import.meta.env.DEV === true;');
    expect(gateSource).not.toContain('= import.meta.env');
    expect(appSource).toContain("import { areInternalRoutesEnabled } from '@/shared/featureFlags/internalRoutes';");
    expect(appSource).toContain('const showInternalRoutes = areInternalRoutesEnabled();');
    expect(appSource).toContain('{showInternalRoutes && (');
    expect(layoutSource).toContain("import { filterInternalRouteItems } from '@/shared/featureFlags/internalRoutes';");
    expect(layoutSource).toContain('const visiblePublicNavItems = filterInternalRouteItems(visibleNavItems);');
  });
});
