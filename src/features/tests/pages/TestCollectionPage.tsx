import {
  ArrowLeft,
  Check,
  EyeOff,
  FolderTree,
  Globe,
  NotebookText,
  Moon,
  Palette,
  Search,
  Tags,
  X,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';

const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const ChapterSidebarCompactTitleTestPage = lazy(() => import('@/features/tests/pages/ChapterSidebarCompactTitleTestPage').then((module) => ({ default: module.ChapterSidebarCompactTitleTestPage })));
const SettingTabPlacementOptionsTestPage = lazy(() => import('@/features/tests/pages/SettingTabPlacementOptionsTestPage').then((module) => ({ default: module.SettingTabPlacementOptionsTestPage })));
const WorkbenchHeaderFixedFlowPositionTestPage = lazy(() => import('@/features/tests/pages/WorkbenchHeaderFixedFlowPositionTestPage').then((module) => ({ default: module.WorkbenchHeaderFixedFlowPositionTestPage })));
const ErrorLogPage = lazy(() => import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })));
const SettingEntryMergePlanTestPage = lazy(() => import('@/features/tests/pages/SettingEntryMergePlanTestPage').then((module) => ({ default: module.SettingEntryMergePlanTestPage })));
const SettingStateStructurePlanTestPage = lazy(() => import('@/features/tests/pages/SettingStateStructurePlanTestPage').then((module) => ({ default: module.SettingStateStructurePlanTestPage })));
const PromptLibraryStructureTestPage = lazy(() => import('@/features/tests/pages/PromptLibraryStructureTestPage').then((module) => ({ default: module.PromptLibraryStructureTestPage })));
const PromptWorkflowPreviewTestPage = lazy(() => import('@/features/tests/pages/PromptWorkflowPreviewTestPage').then((module) => ({ default: module.PromptWorkflowPreviewTestPage })));
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
        title: '正文目录左移测试',
        description: '测试正文区域左侧目录的章节标题整体左移后，能否把“第X章”的第字移动到更靠左的位置并扩大标题展示空间。',
        path: '/chapter-sidebar-compact-title-test',
        icon: NotebookText,
        badge: 'Chapter',
      },
      {
        title: '设定标签布局方案测试',
        description: '对比设定页面大类标签放在顶部两行、横向滚动、左侧三行两列和底部贴边等方案。',
        path: '/setting-tab-placement-options-test',
        icon: Tags,
        badge: 'Tabs',
      },
      {
        title: '工作台流程按钮固定位置测试',
        description: '用 20 字书名作为基准，测试顶部脑洞/设定/章纲/正文等流程按钮是否能保持固定位置。',
        path: '/workbench-header-fixed-flow-position-test',
        icon: NotebookText,
        badge: 'Header',
      },
    ],
  },
  {
    title: 'AI 链路测试',
    items: [
      {
        title: '设定条目合并方案测试',
        description: '测试作品设定、道具资源、地点场景、伏笔线索和书写规则的条目合并粒度。',
        path: '/setting-entry-merge-plan-test',
        icon: Tags,
        badge: 'Merge',
      },
      {
        title: '设定状态结构方案测试',
        description: '测试主角金手指、势力分组、世界地图、危险区域、道具资源、伏笔线索的固定档案和状态设定拆分方案。',
        path: '/setting-state-structure-plan-test',
        icon: Tags,
        badge: 'State',
      },
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

const TEST_COLLECTION_TESTED_PATHS_KEY = 'xinyuexia_test_collection_tested_paths_v1';

type CollectionTab = 'untested' | 'tested';

function readTestedTestPaths() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_TESTED_PATHS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string' && testNumberByPath.has(item));
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
      case '/setting-entry-merge-plan-test':
        return <SettingEntryMergePlanTestPage />;
      case '/setting-state-structure-plan-test':
        return <SettingStateStructurePlanTestPage />;
      case '/prompt-library-structure-test':
        return <PromptLibraryStructureTestPage />;
      case '/prompt-workflow-preview-test':
        return <PromptWorkflowPreviewTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/error-log':
        return <ErrorLogPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/theme-colors':
        return <DarkThemeColorPage variant="modal" onClose={() => setActivePath(null)} />;
      case '/chapter-sidebar-compact-title-test':
        return <ChapterSidebarCompactTitleTestPage />;
      case '/setting-tab-placement-options-test':
        return <SettingTabPlacementOptionsTestPage />;
      case '/workbench-header-fixed-flow-position-test':
        return <WorkbenchHeaderFixedFlowPositionTestPage />;
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
                   testedTestPaths.has(activePath) ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-transparent',
                 ].join(' ')}
               >
                 <Check className="h-3 w-3" />
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
             <p className="mt-0.5 text-xs text-slate-400">共 {totalCount} 个测试 · 待测试 {untestedCount} 个 · 已测试 {testedCount} 个</p>
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
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">{group.items.length}</span>
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
                                 : 'border-slate-200 bg-white text-transparent hover:border-brand/50 hover:text-brand',
                             ].join(' ')}
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
               {collectionTab === 'tested' ? '暂无已测试内容' : '没有找到匹配的测试内容'}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
