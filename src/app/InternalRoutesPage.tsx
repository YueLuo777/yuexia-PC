import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

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

export function InternalRoutesPage() {
  return (
    <Routes>
      <Route path="/test-collection" element={<TestCollectionPage />} />
      <Route path="/software-ui-catalog" element={<SoftwareUiCatalogPage />} />
      <Route path="/hidden-content" element={<HiddenPagesTestPage />} />
      <Route path="/hidden-pages-test" element={<HiddenPagesTestPage />} />
      <Route path="/error-log" element={<ErrorLogPage />} />
      <Route path="/theme-colors" element={<Navigate to="/settings?section=theme" replace />} />
      <Route path="/test-browser" element={<TestBrowserPage />} />
      <Route path="*" element={<Navigate to="/novels" replace />} />
    </Routes>
  );
}
