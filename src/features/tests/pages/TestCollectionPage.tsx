import {
  ArrowLeft,
  Check,
  EyeOff,
  Globe,
  NotebookText,
  Moon,
  Palette,
  SlidersHorizontal,
  Search,
  Tags,
  Type,
  X,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';

const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const ErrorLogPage = lazy(() => import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })));
const BorderBackplateApplicationTestPage = lazy(() => import('@/features/tests/pages/BorderBackplateApplicationTestPage').then((module) => ({ default: module.BorderBackplateApplicationTestPage })));
const WorkbenchSoftCyanButtonStyleTestPage = lazy(() => import('@/features/tests/pages/WorkbenchSoftCyanButtonStyleTestPage').then((module) => ({ default: module.WorkbenchSoftCyanButtonStyleTestPage })));
const WorkbenchSurfaceColorStyleTestPage = lazy(() => import('@/features/tests/pages/WorkbenchSurfaceColorStyleTestPage').then((module) => ({ default: module.WorkbenchSurfaceColorStyleTestPage })));
const WorkbenchRightPanelUnifiedTestPage = lazy(() => import('@/features/tests/pages/WorkbenchRightPanelUnifiedTestPage').then((module) => ({ default: module.WorkbenchRightPanelUnifiedTestPage })));
const WorkbenchAiRequestTagPolicyTestPage = lazy(() => import('@/features/tests/pages/WorkbenchAiRequestTagPolicyTestPage').then((module) => ({ default: module.WorkbenchAiRequestTagPolicyTestPage })));
const WorkbenchFlowButtonStatsTestPage = lazy(() => import('@/features/tests/pages/WorkbenchFlowButtonStatsTestPage').then((module) => ({ default: module.WorkbenchFlowButtonStatsTestPage })));
const WorkbenchSidebarBoldNavigationTestPage = lazy(() => import('@/features/tests/pages/WorkbenchSidebarBoldNavigationTestPage').then((module) => ({ default: module.WorkbenchSidebarBoldNavigationTestPage })));
const WorkbenchFlowGraySelectedStateTestPage = lazy(() => import('@/features/tests/pages/WorkbenchFlowGraySelectedStateTestPage').then((module) => ({ default: module.WorkbenchFlowGraySelectedStateTestPage })));
const SettingImportHierarchyTestPage = lazy(() => import('@/features/tests/pages/SettingImportHierarchyTestPage').then((module) => ({ default: module.SettingImportHierarchyTestPage })));
const SettingWorkspaceMultiLayoutTestPage = lazy(() => import('@/features/tests/pages/SettingWorkspaceMultiLayoutTestPage').then((module) => ({ default: module.SettingWorkspaceMultiLayoutTestPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));

const testGroups = [
  {
    title: 'UI 与主题',
    items: [
      {
        title: '错误日志',
        description: '记录软件里出现过的问题、原因、修复办法和后续防复发规则。',
        path: '/error-log',
        icon: NotebookText,
        badge: 'Log',
      },
      {
        title: '隐藏页面',
        description: '集中检查没有展示在正式导航里的页面、旧入口和内嵌功能。',
        path: '/hidden-pages-test',
        icon: EyeOff,
        badge: 'Hidden',
      },
      {
        title: 'UI库',
        description: '查看软件内可复用 UI、手动上传 UI 和技术词典记录。',
        path: '/software-ui-catalog',
        icon: Palette,
        badge: 'UI',
      },
      {
        title: '主题颜色',
        description: '查看主题颜色、深色主题配色和页面色板测试。',
        path: '/theme-colors',
        icon: Moon,
        badge: 'Theme',
      },
      {
        title: '边框透明背板应用预览',
        description: '集中预览作品编辑器里适合使用边框透明背板技术的贴边标题、字数、清空、章节信息和配置标签。',
        path: '/border-backplate-application-test',
        icon: Type,
        badge: 'Backplate',
      },
      {
        title: '作品编辑器浅青按钮状态测试',
        description: '测试当前页、主要操作按钮、右侧配置边框、关联资料和已关联字数改为 #E7F8FD / #08AACE 的浅青方案。',
        path: '/workbench-soft-cyan-button-style-test',
        icon: Palette,
        badge: 'Soft Cyan',
      },
      {
        title: '作品编辑器输入区与标题栏配色测试',
        description: '测试内容输入 #F5F5F7 搭配不同软件标题栏、右侧面板和边界深浅的多套方案。',
        path: '/workbench-surface-color-style-test',
        icon: Palette,
        badge: 'Surface',
      },
    ],
  },
  {
    title: 'AI 链路测试',
    items: [
      {
        title: '右侧 AI 配置栏统一方案',
        description: '测试作品编辑器右侧 AI 区域的统一布局，并检查浮动按钮背后的白色垫片是否已去掉。',
        path: '/workbench-right-panel-unified-test',
        icon: SlidersHorizontal,
        badge: 'Panel / 垫片',
      },
      {
        title: 'AI 请求标签策略测试',
        description: '测试脑洞、大纲、章纲、正文、审核、点评、润色、状态、梗概哪些链路需要用标签区分材料和要求。',
        path: '/workbench-ai-request-tag-policy-test',
        icon: Tags,
        badge: 'Tag',
      },
      {
        title: '作品编辑器流程按钮信息化方案',
        description: '测试顶部两组组合按钮在按钮内部显示脑洞、设定、章纲、正文、审核、点评、状态和梗概数量的方案。',
        path: '/workbench-flow-button-stats-test',
        icon: SlidersHorizontal,
        badge: 'Flow Stats',
      },
      {
        title: '作品编辑器左侧导航加粗测试',
        description: '测试正文第一卷、章节，以及脑洞、设定等页面分组和设定条目加粗后的效果。',
        path: '/workbench-sidebar-bold-navigation-test',
        icon: NotebookText,
        badge: 'Bold Nav',
      },
      {
        title: '脑洞正文导航灰色选中态测试',
        description: '测试脑洞、设定、章纲、正文顶部导航选中状态使用不同灰色背景、边框和阴影的方案。',
        path: '/workbench-flow-gray-selected-state-test',
        icon: Palette,
        badge: 'Gray Active',
      },
      {
        title: '设定三层智能导入测试',
        description: '测试智能导入把一级分组、二级设定、三级子设定分层识别，并预览已有则填入、没有则创建和分组重命名。',
        path: '/setting-import-hierarchy-test',
        icon: Tags,
        badge: 'Import 3',
      },
      {
        title: '设定工作台多标签布局测试',
        description: '测试作品设定、人物设定、势力组织、道具资源等一级标签的多种布局方案。',
        path: '/setting-workspace-multi-layout-test',
        icon: Tags,
        badge: 'Setting UI',
      },
    ],
  },
  {
    title: '工具测试',
    items: [
      {
        title: '内置浏览器',
        description: '测试网页打开、收藏和登录状态保留。',
        path: '/test-browser',
        icon: Globe,
        badge: 'Browser',
      },
    ],
  },
];

const testNumberByPath = new Map(
  testGroups
    .flatMap((group) => group.items)
    .map((item, index) => [item.path, index + 1] as const),
);
const TEST_COLLECTION_DELETE_MARKS_KEY = 'xinyuexia_test_collection_delete_marks_v1';

function readDeleteMarkedTestPaths() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_DELETE_MARKS_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && testNumberByPath.has(item))
      : [];
  } catch {
    return [];
  }
}

function formatTestNumber(path: string) {
  return String(testNumberByPath.get(path) ?? 0).padStart(2, '0');
}

type TestCollectionPageProps = {
  embedded?: boolean;
  onClose?: () => void;
};

export function TestCollectionPage({ embedded = false, onClose }: TestCollectionPageProps = {}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activePath, setActivePath] = useState<string | null>(null);
  const [deleteMarkedTestPaths, setDeleteMarkedTestPaths] = useState<Set<string>>(() => new Set(readDeleteMarkedTestPaths()));

  useEffect(() => {
    const showIndex = () => setActivePath(null);
    window.addEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
    return () => window.removeEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
  }, []);

  const activeItem = useMemo(() => (
    testGroups.flatMap((group) => group.items).find((item) => item.path === activePath) ?? null
  ), [activePath]);
  const activeNumber = activePath ? formatTestNumber(activePath) : null;

  const handleBack = () => {
    if (embedded && activePath) {
      setActivePath(null);
      return;
    }
    if (embedded) {
      onClose?.();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/novels');
  };

  const openTestPage = (path: string) => {
    setActivePath(path);
  };

  const toggleDeleteMarkedTest = (path: string) => {
    setDeleteMarkedTestPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      localStorage.setItem(TEST_COLLECTION_DELETE_MARKS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return testGroups;
    return testGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (
          formatTestNumber(item.path).includes(keyword) ||
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.badge.toLowerCase().includes(keyword)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = testGroups.reduce((sum, group) => sum + group.items.length, 0);
  const deleteMarkedCount = deleteMarkedTestPaths.size;

  const renderActiveTest = () => {
    switch (activePath) {
      case '/workbench-right-panel-unified-test':
        return <WorkbenchRightPanelUnifiedTestPage />;
      case '/workbench-ai-request-tag-policy-test':
        return <WorkbenchAiRequestTagPolicyTestPage />;
      case '/workbench-flow-button-stats-test':
        return <WorkbenchFlowButtonStatsTestPage />;
      case '/workbench-sidebar-bold-navigation-test':
        return <WorkbenchSidebarBoldNavigationTestPage />;
      case '/workbench-flow-gray-selected-state-test':
        return <WorkbenchFlowGraySelectedStateTestPage />;
      case '/setting-import-hierarchy-test':
        return <SettingImportHierarchyTestPage />;
      case '/setting-workspace-multi-layout-test':
        return <SettingWorkspaceMultiLayoutTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/error-log':
        return <ErrorLogPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/border-backplate-application-test':
        return <BorderBackplateApplicationTestPage />;
      case '/workbench-soft-cyan-button-style-test':
        return <WorkbenchSoftCyanButtonStyleTestPage />;
      case '/workbench-surface-color-style-test':
        return <WorkbenchSurfaceColorStyleTestPage />;
      case '/theme-colors':
        return <DarkThemeColorPage variant="modal" onClose={() => setActivePath(null)} />;
      case '/test-browser':
        return <TestBrowserPage />;
      default:
        return null;
    }
  };

  if (activePath) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-slate-50">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
          <button
            onClick={() => setActivePath(null)}
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            返回测试
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 px-4 text-sm font-black text-slate-700">
            <span className="min-w-0 truncate">{activeItem ? `${activeNumber}号测试：${activeItem.title}` : '测试内容'}</span>
            {activePath && (
              <button
                type="button"
                onClick={() => toggleDeleteMarkedTest(activePath)}
                className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs font-black transition-colors ${
                  deleteMarkedTestPaths.has(activePath)
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <span className={`grid h-4 w-4 place-items-center rounded border ${deleteMarkedTestPaths.has(activePath) ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 text-transparent'}`}>
                  <Check className="h-3 w-3" />
                </span>
                标记待删除
              </button>
            )}
          </div>
          <button
            onClick={() => setActivePath(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">正在打开测试内容...</div>}>
            {renderActiveTest()}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">测试</h1>
            <p className="mt-0.5 text-xs text-slate-400">已收纳 {totalCount} 个测试内容 · 已标记待删除 {deleteMarkedCount} 个</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
              title={embedded ? '关闭' : '返回'}
            >
              {embedded ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </button>
            <div className="relative w-[280px] max-w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索测试内容"
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition-colors focus:border-brand focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="space-y-7">
          {visibleGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-700">{group.title}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const deleteMarked = deleteMarkedTestPaths.has(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => openTestPage(item.path)}
                      className="group flex min-h-[128px] flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
                            {formatTestNumber(item.path)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            role="checkbox"
                            aria-checked={deleteMarked}
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleDeleteMarkedTest(item.path);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              event.preventDefault();
                              event.stopPropagation();
                              toggleDeleteMarkedTest(item.path);
                            }}
                            className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors ${
                              deleteMarked
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-slate-200 bg-white text-slate-300 hover:border-red-200 hover:text-red-500'
                            }`}
                            title={deleteMarked ? '取消待删除标记' : '标记待删除，之后告诉 Codex 删除'}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:bg-brand-light group-hover:text-brand">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                      <div className="text-base font-bold text-slate-900">{item.title}</div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              没有找到匹配的测试内容
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
