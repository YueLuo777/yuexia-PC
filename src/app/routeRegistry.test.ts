import { describe, expect, it } from 'vitest';

import {
  APP_ROUTE_PATHS,
  DEFAULT_NAV_ROUTE_ITEMS,
  FORMAL_ROUTE_DEFINITIONS,
  FORMAL_SMOKE_ROUTE_PATHS,
  INTERNAL_ROUTE_DEFINITIONS,
  INTERNAL_ROUTE_PATHS,
  LEGACY_ROUTE_REDIRECTS,
  STARTUP_ROUTE_PATH,
} from './routeRegistry';

describe('application route registry', () => {
  it('keeps route identifiers and paths unique', () => {
    const routes = [...FORMAL_ROUTE_DEFINITIONS, ...INTERNAL_ROUTE_DEFINITIONS];

    expect(new Set(routes.map((route) => route.id)).size).toBe(routes.length);
    expect(new Set(routes.map((route) => route.path)).size).toBe(routes.length);
    expect(routes.every((route) => route.path.startsWith('/'))).toBe(true);
  });

  it('derives startup, navigation, internal and smoke paths from the registry', () => {
    expect(STARTUP_ROUTE_PATH).toBe(APP_ROUTE_PATHS.novels);
    expect(DEFAULT_NAV_ROUTE_ITEMS.map((item) => item.to)).toEqual([
      '/novels',
      '/tomato-browser',
      '/prompts',
      '/model-manage',
      '/token-usage',
      '/test-collection',
    ]);
    expect(INTERNAL_ROUTE_PATHS).toEqual(INTERNAL_ROUTE_DEFINITIONS.map((route) => route.path));
    expect(FORMAL_SMOKE_ROUTE_PATHS).toContain('/tomato-browser');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('scripts');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('scriptEditor');
    expect(FORMAL_SMOKE_ROUTE_PATHS).not.toContain('/scripts');
    expect(FORMAL_SMOKE_ROUTE_PATHS).not.toContain('/script-editor-v2');
    expect(FORMAL_SMOKE_ROUTE_PATHS).toEqual(
      FORMAL_ROUTE_DEFINITIONS.filter((route) => route.smoke).map((route) => route.path),
    );
  });

  it('redirects only to registered formal routes', () => {
    const formalPaths = new Set(FORMAL_ROUTE_DEFINITIONS.map((route) => route.path));
    const redirects = [
      ...LEGACY_ROUTE_REDIRECTS,
      ...INTERNAL_ROUTE_DEFINITIONS.filter((route) => route.redirectTo).map((route) => ({
        path: route.path,
        to: route.redirectTo!,
      })),
    ];

    expect(redirects.every((redirect) => formalPaths.has(redirect.to.split('?')[0]))).toBe(true);
  });

  it('keeps concept and data migration inside their unified pages', () => {
    const formalPaths = FORMAL_ROUTE_DEFINITIONS.map((route) => route.path);
    const redirects = Object.fromEntries(LEGACY_ROUTE_REDIRECTS.map((route) => [route.path, route.to]));

    expect(formalPaths).not.toContain('/concept-library');
    expect(formalPaths).not.toContain('/db-settings');
    expect(formalPaths).not.toContain('/text-overrides');
    expect(redirects).not.toHaveProperty('/concept-library');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('library');
    expect(redirects['/db-settings']).toBe('/settings?section=backup');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('conceptLibrary');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('dbSettings');
    expect(APP_ROUTE_PATHS).not.toHaveProperty('textOverrides');
  });
});
