import { Component, Suspense, lazy, useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppFrame } from '@/shared/layout/AppFrame';
import { WorkspaceTabsProvider } from '@/shared/tabs/WorkspaceTabsContext';
import { bindWorkbenchTransientAiCleanup } from '@/features/workbench/model/workbenchTransientAiCleanup';

const TestCollectionPage = lazy(() => import('@/features/tests/pages/TestCollectionPage').then((module) => ({ default: module.TestCollectionPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const ErrorLogPage = lazy(() => import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })));
const SettingTaxonomyPlanTestPage = lazy(() => import('@/features/tests/pages/SettingTaxonomyPlanTestPage').then((module) => ({ default: module.SettingTaxonomyPlanTestPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));
const ConceptLibraryPage = lazy(() => import('@/features/concept-library/pages/ConceptLibraryPage').then((module) => ({ default: module.ConceptLibraryPage })));
const LibraryHubPage = lazy(() => import('@/features/library-hub/pages/LibraryHubPage').then((module) => ({ default: module.LibraryHubPage })));
const DbSettingsPage = lazy(() => import('@/features/settings/pages/DbSettingsPage').then((module) => ({ default: module.DbSettingsPage })));
const ModelManagePage = lazy(() => import('@/features/models/pages/ModelManagePage').then((module) => ({ default: module.ModelManagePage })));
const NovelLibraryPage = lazy(() => import('@/features/novels/pages/NovelLibraryPage').then((module) => ({ default: module.NovelLibraryPage })));
const PromptsPage = lazy(() => import('@/features/prompts/pages/PromptsPage').then((module) => ({ default: module.PromptsPage })));
const ScriptEditorPage = lazy(() => import('@/features/script-editor/pages/ScriptEditorPage'));
const WorkbenchPage = lazy(() => import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const TokenUsagePage = lazy(() => import('@/pages/TokenUsagePage'));
const TextOverridesPage = lazy(() => import('@/features/text-overrides/pages/TextOverridesPage').then((module) => ({ default: module.TextOverridesPage })));
const DashboardLayout = lazy(() => import('@/shared/layout/DashboardLayout').then((module) => ({ default: module.DashboardLayout })));

function AppFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-100 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
        页面加载中...
      </div>
    </div>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Renderer page crashed:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-xl rounded-2xl border border-red-100 bg-white p-6 text-sm leading-6 text-slate-700 shadow-sm">
          <h1 className="text-lg font-bold text-red-600">页面加载失败</h1>
          <p className="mt-2">当前页面出现运行错误，但软件没有白屏。可以先返回首页，再继续操作。</p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => {
              window.location.hash = '#/dashboard';
              window.location.reload();
            }}
            className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  useEffect(() => {
    bindWorkbenchTransientAiCleanup();
  }, []);

  return (
    <WorkspaceTabsProvider>
      <AppFrame>
        <AppErrorBoundary>
          <Suspense fallback={<AppFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/novels" element={<NovelLibraryPage />} />
                <Route path="/scripts" element={<NovelLibraryPage />} />
                <Route path="/library" element={<LibraryHubPage />} />
                <Route path="/concept-library" element={<ConceptLibraryPage />} />
                <Route path="/prompts" element={<PromptsPage />} />
                <Route path="/model-manage" element={<ModelManagePage />} />
                <Route path="/db-settings" element={<DbSettingsPage />} />
                <Route path="/text-overrides" element={<TextOverridesPage />} />
                <Route path="/token-usage" element={<TokenUsagePage />} />
                <Route path="/test-collection" element={<TestCollectionPage />} />
                <Route path="/setting-taxonomy-plan-test" element={<SettingTaxonomyPlanTestPage />} />
                <Route path="/software-ui-catalog" element={<SoftwareUiCatalogPage />} />
                <Route path="/hidden-content" element={<HiddenPagesTestPage />} />
                <Route path="/hidden-pages-test" element={<HiddenPagesTestPage />} />
                <Route path="/error-log" element={<ErrorLogPage />} />
                <Route path="/theme-colors" element={<DarkThemeColorPage />} />
                <Route path="/test-browser" element={<TestBrowserPage />} />
              </Route>
              <Route path="/workbench" element={<WorkbenchPage />} />
              <Route path="/script-editor-v2" element={<ScriptEditorPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </AppFrame>
    </WorkspaceTabsProvider>
  );
}
