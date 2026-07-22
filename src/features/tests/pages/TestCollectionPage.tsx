import {
  ArrowLeft,
  Check,
  EyeOff,
  FolderTree,
  Globe,
  ListTree,
  NotebookText,
  Moon,
  Palette,
  Ruler,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';

const HiddenPagesTestPage = lazy(() =>
  import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })),
);
const SoftwareUiCatalogPage = lazy(() =>
  import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })),
);
const DarkThemeColorPage = lazy(() =>
  import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })),
);
const Shuimo2DeepPalettePreviewTestPage = lazy(() =>
  import('@/features/tests/pages/Shuimo2DeepPalettePreviewTestPage').then((module) => ({
    default: module.Shuimo2DeepPalettePreviewTestPage,
  })),
);
const NavigationContextMenuPrototypeTestPage = lazy(() =>
  import('@/features/tests/pages/NavigationContextMenuPrototypeTestPage').then((module) => ({
    default: module.NavigationContextMenuPrototypeTestPage,
  })),
);
const CompactLibraryFormTestPage = lazy(() =>
  import('@/features/tests/pages/CompactLibraryFormTestPage').then((module) => ({
    default: module.CompactLibraryFormTestPage,
  })),
);
const SettingNameWidthDesignTestPage = lazy(() =>
  import('@/features/tests/pages/SettingNameWidthDesignTestPage').then((module) => ({
    default: module.SettingNameWidthDesignTestPage,
  })),
);
const SettingsHierarchyDesignTestPage = lazy(() =>
  import('@/features/tests/pages/SettingsHierarchyDesignTestPage').then((module) => ({
    default: module.SettingsHierarchyDesignTestPage,
  })),
);
const WorkbenchFlowTabsSpacingTestPage = lazy(() =>
  import('@/features/tests/pages/WorkbenchFlowTabsSpacingTestPage').then((module) => ({
    default: module.WorkbenchFlowTabsSpacingTestPage,
  })),
);
const UiConsistencyAuditTestPage = lazy(() =>
  import('@/features/tests/pages/UiConsistencyAuditTestPage').then((module) => ({
    default: module.UiConsistencyAuditTestPage,
  })),
);
const AiPanelVisualConsistencyTestPage = lazy(() =>
  import('@/features/tests/pages/AiPanelVisualConsistencyTestPage').then((module) => ({
    default: module.AiPanelVisualConsistencyTestPage,
  })),
);
const ErrorLogPage = lazy(() =>
  import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })),
);
const PromptLibraryStructureTestPage = lazy(() =>
  import('@/features/tests/pages/PromptLibraryStructureTestPage').then((module) => ({
    default: module.PromptLibraryStructureTestPage,
  })),
);
const PromptWorkflowPreviewTestPage = lazy(() =>
  import('@/features/tests/pages/PromptWorkflowPreviewTestPage').then((module) => ({
    default: module.PromptWorkflowPreviewTestPage,
  })),
);
const AuditPromptSelectSoftGroupingTestPage = lazy(() =>
  import('@/features/tests/pages/AuditPromptSelectSoftGroupingTestPage').then((module) => ({
    default: module.AuditPromptSelectSoftGroupingTestPage,
  })),
);
const TextAuditDiffDisplayTestPage = lazy(() =>
  import('@/features/tests/pages/TextAuditDiffDisplayTestPage').then((module) => ({
    default: module.TextAuditDiffDisplayTestPage,
  })),
);
const TextAuditReviewWorkbenchTestPage = lazy(() =>
  import('@/features/tests/pages/TextAuditReviewWorkbenchTestPage').then((module) => ({
    default: module.TextAuditReviewWorkbenchTestPage,
  })),
);
const PostAuditStatusUpdateTestPage = lazy(() =>
  import('@/features/tests/pages/PostAuditStatusUpdateTestPage').then((module) => ({
    default: module.PostAuditStatusUpdateTestPage,
  })),
);
const TestBrowserPage = lazy(() =>
  import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })),
);
const GenreIterationPage = lazy(() =>
  import('@/features/genre-iteration/pages/GenreIterationPage').then((module) => ({
    default: module.GenreIterationPage,
  })),
);
const TomatoGenreIterationTestPage = lazy(() =>
  import('@/features/tests/pages/TomatoGenreIterationTestPage').then((module) => ({
    default: module.TomatoGenreIterationTestPage,
  })),
);
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
        title: '水墨2 深度配色预览',
        description: '对照软件标题栏、正文选中、分组、AI 输入区、发送图标、字号控件和首页侧栏的水墨2候选配色。',
        path: '/shuimo2-deep-palette-preview-test',
        icon: Palette,
        badge: 'Shuimo2',
      },
      {
        title: '导航右键菜单原型',
        description: '测试导航项右键重命名/隐藏、空白处恢复隐藏导航、分割线删除和拖拽排序。',
        path: '/navigation-context-menu-prototype-test',
        icon: ListTree,
        badge: 'Nav Menu',
      },
      {
        title: '资料库紧凑行式表单',
        description: '使用正常尺寸验证短字段按内容宽度、标签与输入同行、短字段并排和长文本压缩高度。',
        path: '/compact-library-form-test',
        icon: Sparkles,
        badge: 'Compact Form',
      },
      {
        title: '设定页面完整复原（图1表单）',
        description: '原08号测试：完整复刻正式设定页的流程栏、分类栏、资料目录、编辑器和右侧 AI 区，并按内容分配字段宽度。',
        path: '/setting-name-width-design-test',
        icon: Ruler,
        badge: 'Setting Form',
      },
      {
        title: '软件设置入口多方案',
        description: '对比全顶部导航、图标窄栏、卡片逐级进入、搜索优先和单页折叠五种设置布局。',
        path: '/settings-hierarchy-design-test',
        icon: ListTree,
        badge: 'Settings UI',
      },
      {
        title: '顶部工作流按钮栏间距测试',
        description: '对比脑洞、设定、章纲等顶部按钮栏的底部留白、分组间距和流程层次。',
        path: '/workbench-flow-tabs-spacing-test',
        icon: Ruler,
        badge: 'Flow Tabs',
      },
      {
        title: '同类 UI 一致性审查',
        description: '按实际软件入口列出六类同用途 UI 的并存版本、具体差异、源码位置和建议统一方向。',
        path: '/ui-consistency-audit-test',
        icon: ListTree,
        badge: 'UI Audit',
      },
      {
        title: 'AI面板三页统一方案',
        description: '并排查看设定、章纲、正文三种真实业务按钮在统一输出框、关联区、输入框和操作栏下的视觉效果。',
        path: '/ai-panel-visual-consistency-test',
        icon: Sparkles,
        badge: 'AI Layout',
      },
    ],
  },
  {
    title: 'AI 链路测试',
    items: [
      {
        title: '所有提示词',
        description: '整理旧提示词会创建的资料库、模板字段、读取链路和章节发布更新方式。',
        path: '/prompt-library-structure-test',
        icon: FolderTree,
        badge: 'Prompt Lib',
      },
      {
        title: '提示词目录预览测试',
        description: '左侧按流程列出提示词文件，右侧预览选中的提示词原文。',
        path: '/prompt-workflow-preview-test',
        icon: FolderTree,
        badge: 'Prompt View',
      },
      {
        title: '审核提示词轻量下拉方案',
        description: '对比标签、轻分隔、顶部筛选和双列分类，降低审核提示词下拉的切换感。',
        path: '/audit-prompt-select-soft-grouping-test',
        icon: ListTree,
        badge: 'Audit Prompt',
      },
      {
        title: '文本审核差异显示方案',
        description: '对比审核后正文红字、左右对照、段落卡片和改动清单几种文本审核结果显示方式。',
        path: '/text-audit-diff-display-test',
        icon: NotebookText,
        badge: 'Text Audit',
      },
      {
        title: '文本审核逐段审阅工作台',
        description: '在接近正式审核页面的章节目录、正文预览和 AI 配置三栏中，测试逐段接受、保留和编辑后采用。',
        path: '/text-audit-review-workbench-test',
        icon: NotebookText,
        badge: 'Audit Page',
      },
      {
        title: '审核后状态更新工作台',
        description: '测试AI识别正文对象、分类查询设定、未匹配对象新建确认、状态变化逐项确认和按段落依据写入的完整流程。',
        path: '/post-audit-status-update-test',
        icon: ListTree,
        badge: 'Status Flow',
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
      {
        title: '番茄题材迭代原型',
        description: '用内置浏览器打开番茄小说排行榜，读取当前小说公开信息后做爽点提炼和题材迁移。',
        path: '/tomato-genre-iteration-test',
        icon: Globe,
        badge: 'Tomato',
      },
      {
        title: '题材迭代',
        description: '从正式导航移入测试板块的题材迭代工作台，用于继续验证小说读取、爽点提炼和题材迁移流程。',
        path: '/genre-iteration-test',
        icon: Sparkles,
        badge: 'Genre',
      },
    ],
  },
];
const testNumberByPath = new Map(
  testGroups.flatMap((group) => group.items).map((item, index) => [item.path, index + 1] as const),
);
const validTestPaths = new Set(testNumberByPath.keys());

const TEST_COLLECTION_TESTED_PATHS_KEY = 'xinyuexia_test_collection_tested_paths_v1';

type CollectionTab = 'untested' | 'tested';

function readTestedTestPaths() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_TESTED_PATHS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const validPaths = parsed.filter((item): item is string => typeof item === 'string' && validTestPaths.has(item));
    if (validPaths.length !== parsed.length) {
      localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(validPaths));
    }
    return validPaths;
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
  const [collectionTab, setCollectionTab] = useState<CollectionTab>('untested');
  const [testedTestPaths, setTestedTestPaths] = useState<Set<string>>(() => new Set(readTestedTestPaths()));

  useEffect(() => {
    const showIndex = () => setActivePath(null);
    window.addEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
    return () => window.removeEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
  }, []);

  useEffect(() => {
    setTestedTestPaths((current) => {
      const next = new Set(Array.from(current).filter((path) => validTestPaths.has(path)));
      if (next.size === current.size) return current;
      localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const activeItem = useMemo(
    () => testGroups.flatMap((group) => group.items).find((item) => item.path === activePath) ?? null,
    [activePath],
  );
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

  const toggleTestedTest = (path: string) => {
    const willBeTested = !testedTestPaths.has(path);
    setTestedTestPaths((current) => {
      const next = new Set(current);
      if (willBeTested) {
        next.add(path);
      } else {
        next.delete(path);
      }
      localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return testGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const isTested = testedTestPaths.has(item.path);
          if (collectionTab === 'tested' ? !isTested : isTested) {
            return false;
          }
          return (
            !keyword ||
            formatTestNumber(item.path).includes(keyword) ||
            item.title.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword) ||
            item.badge.toLowerCase().includes(keyword)
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [collectionTab, search, testedTestPaths]);

  const totalCount = testGroups.reduce((sum, group) => sum + group.items.length, 0);
  const testedCount = testedTestPaths.size;
  const untestedCount = totalCount - testedCount;

  const renderActiveTest = () => {
    switch (activePath) {
      case '/prompt-library-structure-test':
        return <PromptLibraryStructureTestPage />;
      case '/prompt-workflow-preview-test':
        return <PromptWorkflowPreviewTestPage />;
      case '/audit-prompt-select-soft-grouping-test':
        return <AuditPromptSelectSoftGroupingTestPage />;
      case '/text-audit-diff-display-test':
        return <TextAuditDiffDisplayTestPage />;
      case '/text-audit-review-workbench-test':
        return <TextAuditReviewWorkbenchTestPage />;
      case '/post-audit-status-update-test':
        return <PostAuditStatusUpdateTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/error-log':
        return <ErrorLogPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/theme-colors':
        return <DarkThemeColorPage variant="modal" onClose={() => setActivePath(null)} />;
      case '/shuimo2-deep-palette-preview-test':
        return <Shuimo2DeepPalettePreviewTestPage />;
      case '/navigation-context-menu-prototype-test':
        return <NavigationContextMenuPrototypeTestPage />;
      case '/compact-library-form-test':
        return <CompactLibraryFormTestPage />;
      case '/settings-hierarchy-design-test':
        return <SettingsHierarchyDesignTestPage />;
      case '/setting-name-width-design-test':
        return <SettingNameWidthDesignTestPage />;
      case '/workbench-flow-tabs-spacing-test':
        return <WorkbenchFlowTabsSpacingTestPage />;
      case '/ui-consistency-audit-test':
        return <UiConsistencyAuditTestPage />;
      case '/ai-panel-visual-consistency-test':
        return <AiPanelVisualConsistencyTestPage />;
      case '/test-browser':
        return <TestBrowserPage />;
      case '/tomato-genre-iteration-test':
        return <TomatoGenreIterationTestPage />;
      case '/genre-iteration-test':
        return <GenreIterationPage />;
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
            <span className="min-w-0 truncate">
              {activeItem ? `${activeNumber}号测试：${activeItem.title}` : '测试内容'}
            </span>
          </div>
          {activePath && (
            <button
              type="button"
              onClick={() => toggleTestedTest(activePath)}
              className="mr-2 flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
            >
              <span
                className={[
                  'flex h-4 w-4 items-center justify-center rounded border',
                  testedTestPaths.has(activePath) ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white',
                ].join(' ')}
              >
                {testedTestPaths.has(activePath) ? <Check className="h-3 w-3" /> : null}
              </span>
              {testedTestPaths.has(activePath) ? '取消已测试' : '标记已测试'}
            </button>
          )}
          <button
            onClick={() => setActivePath(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                正在打开测试内容...
              </div>
            }
          >
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
            <p className="mt-0.5 text-xs text-slate-400">
              共 {totalCount} 个测试 · 待测试 {untestedCount} 个 · 已测试 {testedCount} 个
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-bold">
              <button
                type="button"
                onClick={() => setCollectionTab('untested')}
                className={[
                  'px-3 transition-colors',
                  collectionTab === 'untested' ? 'bg-brand-light text-brand' : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')}
              >
                待测试 {untestedCount}
              </button>
              <button
                type="button"
                onClick={() => setCollectionTab('tested')}
                className={[
                  'border-l border-slate-200 px-3 transition-colors',
                  collectionTab === 'tested' ? 'bg-brand-light text-brand' : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')}
              >
                已测试 {testedCount}
              </button>
            </div>
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
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {group.items.length}
                </span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isTested = testedTestPaths.has(item.path);
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
                            aria-checked={isTested}
                            tabIndex={0}
                            title={isTested ? '取消已测试' : '标记已测试'}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTestedTest(item.path);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleTestedTest(item.path);
                              }
                            }}
                            className={[
                              'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                              isTested
                                ? 'border-brand bg-brand text-white'
                                : 'border-slate-200 bg-white hover:border-brand/50',
                            ].join(' ')}
                          >
                            {isTested ? <Check className="h-4 w-4" /> : null}
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
              {collectionTab === 'tested' ? '暂无已测试内容' : '没有找到匹配的测试内容'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
