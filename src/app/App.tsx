import { Component, Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import {
  FORMAL_ROUTE_DEFINITIONS,
  LEGACY_ROUTE_REDIRECTS,
  STARTUP_ROUTE_PATH,
  type FormalRouteComponentKey,
} from '@/app/routeRegistry';
import { AppFrame } from '@/shared/layout/AppFrame';
import { RendererReadySignal } from '@/app/RendererReadySignal';
import { WorkspaceTabsProvider } from '@/shared/tabs/WorkspaceTabsContext';
import {
  bindWorkbenchAssociationCloseCleanup,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import { bindWorkbenchTransientAiCleanup } from '@/features/workbench/model/workbenchTransientAiCleanup';
import { prepareWorkbenchForAppClose } from '@/features/workbench/model/workbenchAppCloseCleanup';
import { areInternalRoutesEnabled } from '@/shared/featureFlags/internalRoutes';

const TomatoGenreIterationTestPage = lazy(() =>
  import('@/features/tests/pages/TomatoGenreIterationTestPage').then((module) => ({
    default: module.TomatoGenreIterationTestPage,
  })),
);
const ModelManagePage = lazy(() =>
  import('@/features/models/pages/ModelManagePage').then((module) => ({ default: module.ModelManagePage })),
);
const NovelLibraryPage = lazy(() =>
  import('@/features/novels/pages/NovelLibraryPage').then((module) => ({ default: module.NovelLibraryPage })),
);
const PromptsPage = lazy(() =>
  import('@/features/prompts/pages/PromptsPage').then((module) => ({ default: module.PromptsPage })),
);
const TemplateManagePage = lazy(() =>
  import('@/features/templates/pages/TemplateManagePage').then((module) => ({ default: module.TemplateManagePage })),
);
const WorkbenchPage = lazy(() =>
  import('@/features/workbench/pages/ModeAwareWorkbenchPage').then((module) => ({
    default: module.ModeAwareWorkbenchPage,
  })),
);
const TokenUsagePage = lazy(() => import('@/pages/TokenUsagePage'));
const DashboardLayout = lazy(() =>
  import('@/shared/layout/DashboardLayout').then((module) => ({ default: module.DashboardLayout })),
);
const SettingsPage = lazy(() =>
  import('@/shared/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const INTERNAL_ROUTE_MODULES_BUNDLED = import.meta.env.DEV || import.meta.env.VITE_INCLUDE_INTERNAL_ROUTES === '1';
const InternalRoutesPage = INTERNAL_ROUTE_MODULES_BUNDLED
  ? lazy(() => import('@/app/InternalRoutesPage').then((module) => ({ default: module.InternalRoutesPage })))
  : null;

const FORMAL_ROUTE_COMPONENTS = {
  modelManage: ModelManagePage,
  novelLibrary: NovelLibraryPage,
  prompts: PromptsPage,
  settings: SettingsPage,
  templateManage: TemplateManagePage,
  tokenUsage: TokenUsagePage,
  tomatoGenreIteration: TomatoGenreIterationTestPage,
  workbench: WorkbenchPage,
} satisfies Record<FormalRouteComponentKey, ComponentType>;

const DASHBOARD_FORMAL_ROUTES = FORMAL_ROUTE_DEFINITIONS.filter((route) => route.dashboard);
const STANDALONE_FORMAL_ROUTES = FORMAL_ROUTE_DEFINITIONS.filter((route) => !route.dashboard);

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
          <p className="mt-2">当前页面出现运行错误，但软件没有白屏。可以先返回我的小说，再继续操作。</p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => {
              window.location.hash = `#${STARTUP_ROUTE_PATH}`;
              window.location.reload();
            }}
            className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            返回我的小说
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  const showInternalRoutes = areInternalRoutesEnabled();

  useEffect(() => {
    const disposeAssociationCleanup = bindWorkbenchAssociationCloseCleanup();
    const disposeTransientAiCleanup = bindWorkbenchTransientAiCleanup();
    const disposeDesktopClose = window.xinyuexiaWindow?.onPrepareClose(() => {
      prepareWorkbenchForAppClose();
      void window.xinyuexiaWindow?.confirmCloseCleanup();
    });
    return () => {
      disposeAssociationCleanup();
      disposeTransientAiCleanup();
      disposeDesktopClose?.();
    };
  }, []);

  return (
    <WorkspaceTabsProvider>
      <AppFrame>
        <AppErrorBoundary>
          <Suspense fallback={<AppFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to={STARTUP_ROUTE_PATH} replace />} />
              <Route element={<DashboardLayout />}>
                {DASHBOARD_FORMAL_ROUTES.map((route) => {
                  const Page = FORMAL_ROUTE_COMPONENTS[route.component];
                  return <Route key={route.id} path={route.path} element={<Page />} />;
                })}
                {showInternalRoutes && InternalRoutesPage && <Route path="*" element={<InternalRoutesPage />} />}
                {LEGACY_ROUTE_REDIRECTS.map((redirect) => (
                  <Route key={redirect.path} path={redirect.path} element={<Navigate to={redirect.to} replace />} />
                ))}
              </Route>
              {STANDALONE_FORMAL_ROUTES.map((route) => {
                const Page = FORMAL_ROUTE_COMPONENTS[route.component];
                return <Route key={route.id} path={route.path} element={<Page />} />;
              })}
              <Route path="*" element={<Navigate to={STARTUP_ROUTE_PATH} replace />} />
            </Routes>
            <RendererReadySignal />
          </Suspense>
        </AppErrorBoundary>
      </AppFrame>
    </WorkspaceTabsProvider>
  );
}
