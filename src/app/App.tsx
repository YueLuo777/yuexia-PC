import { Component, Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppFrame } from '@/shared/layout/AppFrame';
import { WorkspaceTabsProvider } from '@/shared/tabs/WorkspaceTabsContext';

const ExtractPage = lazy(() => import('@/features/extract/pages/ExtractPage').then((module) => ({ default: module.ExtractPage })));
const ExtractTestPage = lazy(() => import('@/features/extract/pages/ExtractTestPage').then((module) => ({ default: module.ExtractTestPage })));
const AiChatPage = lazy(() => import('@/features/ai-chat/pages/AiChatPage').then((module) => ({ default: module.AiChatPage })));
const TestCollectionPage = lazy(() => import('@/features/tests/pages/TestCollectionPage').then((module) => ({ default: module.TestCollectionPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const ExtractPlotTabsTestPage = lazy(() => import('@/features/tests/pages/ExtractPlotTabsTestPage').then((module) => ({ default: module.ExtractPlotTabsTestPage })));
const SettingLibraryTabsTestPage = lazy(() => import('@/features/tests/pages/SettingLibraryTabsTestPage').then((module) => ({ default: module.SettingLibraryTabsTestPage })));
const BrainstormAiChainTestPage = lazy(() => import('@/features/tests/pages/BrainstormAiChainTestPage').then((module) => ({ default: module.BrainstormAiChainTestPage })));
const ResizableModalTestPage = lazy(() => import('@/features/tests/pages/ResizableModalTestPage').then((module) => ({ default: module.ResizableModalTestPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));
const BrainstormLibraryPage = lazy(() => import('@/features/brainstorm-library/pages/BrainstormLibraryPage').then((module) => ({ default: module.BrainstormLibraryPage })));
const IdeaGeneratorPage = lazy(() => import('@/features/ideas/pages/IdeaGeneratorPage').then((module) => ({ default: module.IdeaGeneratorPage })));
const IdeaLibraryPage = lazy(() => import('@/features/ideas/pages/IdeaLibraryPage').then((module) => ({ default: module.IdeaLibraryPage })));
const OutlineGeneratorPage = lazy(() => import('@/features/ideas/pages/OutlineGeneratorPage').then((module) => ({ default: module.OutlineGeneratorPage })));
const DbSettingsPage = lazy(() => import('@/features/settings/pages/DbSettingsPage').then((module) => ({ default: module.DbSettingsPage })));
const MaterialsCollectionPage = lazy(() => import('@/features/materials/pages/MaterialsCollectionPage').then((module) => ({ default: module.MaterialsCollectionPage })));
const MaterialsPage = lazy(() => import('@/features/materials/pages/MaterialsPage').then((module) => ({ default: module.MaterialsPage })));
const ModelManagePage = lazy(() => import('@/features/models/pages/ModelManagePage').then((module) => ({ default: module.ModelManagePage })));
const MoonfallSettingsPage = lazy(() => import('@/features/moonfall-settings/pages/MoonfallSettingsPage').then((module) => ({ default: module.MoonfallSettingsPage })));
const NovelLibraryPage = lazy(() => import('@/features/novels/pages/NovelLibraryPage').then((module) => ({ default: module.NovelLibraryPage })));
const PlotLibraryPage = lazy(() => import('@/features/plot-library/pages/PlotLibraryPage').then((module) => ({ default: module.PlotLibraryPage })));
const PromptsPage = lazy(() => import('@/features/prompts/pages/PromptsPage').then((module) => ({ default: module.PromptsPage })));
const ScriptEditorPage = lazy(() => import('@/features/script-editor/pages/ScriptEditorPage'));
const WorkbenchPage = lazy(() => import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })));
const ButtonTestPage = lazy(() => import('@/pages/ButtonTestPage'));
const CoverLibraryPage = lazy(() => import('@/features/covers/pages/CoverLibraryPage').then((module) => ({ default: module.CoverLibraryPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const TagZonePage = lazy(() => import('@/pages/TagZonePage'));
const TokenUsagePage = lazy(() => import('@/pages/TokenUsagePage'));
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
                <Route path="/extract" element={<ExtractTestPage />} />
                <Route path="/extract-1" element={<ExtractPage />} />
                <Route path="/plot-library" element={<PlotLibraryPage />} />
                <Route path="/moonfall-settings" element={<MoonfallSettingsPage />} />
                <Route path="/brainstorm-library" element={<BrainstormLibraryPage />} />
                <Route path="/cover-library" element={<CoverLibraryPage />} />
                <Route path="/materials" element={<MaterialsCollectionPage />} />
                <Route path="/materials/settings" element={<MaterialsPage />} />
                <Route path="/prompts" element={<PromptsPage />} />
                <Route path="/model-manage" element={<ModelManagePage />} />
                <Route path="/db-settings" element={<DbSettingsPage />} />
                <Route path="/idea-generator" element={<IdeaGeneratorPage />} />
                <Route path="/outline-generator" element={<OutlineGeneratorPage />} />
                <Route path="/idea-library" element={<IdeaLibraryPage />} />
                <Route path="/token-usage" element={<TokenUsagePage />} />
                <Route path="/call-data" element={<Navigate to="/token-usage" replace />} />
                <Route path="/ai-chat" element={<AiChatPage />} />
                <Route path="/test-collection" element={<TestCollectionPage />} />
                <Route path="/extract-plot-tabs-test" element={<ExtractPlotTabsTestPage />} />
                <Route path="/setting-library-tabs-test" element={<SettingLibraryTabsTestPage />} />
                <Route path="/brainstorm-ai-chain-test" element={<BrainstormAiChainTestPage />} />
                <Route path="/resizable-modal-test" element={<ResizableModalTestPage />} />
                <Route path="/theme-colors" element={<DarkThemeColorPage />} />
                <Route path="/dark-theme-colors" element={<DarkThemeColorPage />} />
                <Route path="/test-browser" element={<TestBrowserPage />} />
                <Route path="/button-test" element={<ButtonTestPage />} />
                <Route path="/extract-test" element={<Navigate to="/extract" replace />} />
              </Route>
              <Route path="/workbench" element={<WorkbenchPage />} />
              <Route path="/script-editor-v2" element={<ScriptEditorPage />} />
              <Route path="/tag-zone" element={<TagZonePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </AppFrame>
    </WorkspaceTabsProvider>
  );
}
