import { lazy, type ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { INTERNAL_ROUTE_DEFINITIONS, STARTUP_ROUTE_PATH, type InternalRouteComponentKey } from '@/app/routeRegistry';

const TestCollectionPage = lazy(() =>
  import('@/features/tests/pages/TestCollectionPage').then((module) => ({ default: module.TestCollectionPage })),
);
const SoftwareUiCatalogPage = lazy(() =>
  import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })),
);
const HiddenPagesTestPage = lazy(() =>
  import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })),
);
const ErrorLogPage = lazy(() =>
  import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })),
);
const TestBrowserPage = lazy(() =>
  import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })),
);

const INTERNAL_ROUTE_COMPONENTS = {
  errorLog: ErrorLogPage,
  hiddenPages: HiddenPagesTestPage,
  softwareUiCatalog: SoftwareUiCatalogPage,
  testBrowser: TestBrowserPage,
  testCollection: TestCollectionPage,
} satisfies Record<InternalRouteComponentKey, ComponentType>;

export function InternalRoutesPage() {
  return (
    <Routes>
      {INTERNAL_ROUTE_DEFINITIONS.map((route) => {
        if (route.redirectTo) {
          return <Route key={route.id} path={route.path} element={<Navigate to={route.redirectTo} replace />} />;
        }
        if (!route.component) return null;
        const Page = INTERNAL_ROUTE_COMPONENTS[route.component];
        return <Route key={route.id} path={route.path} element={<Page />} />;
      })}
      <Route path="*" element={<Navigate to={STARTUP_ROUTE_PATH} replace />} />
    </Routes>
  );
}
