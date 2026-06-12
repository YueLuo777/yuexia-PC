import {
  ArrowLeft,
  Check,
  EyeOff,
  Globe,
  Lightbulb,
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
const PromptTaxonomyTestPage = lazy(() => import('@/features/tests/pages/PromptTaxonomyTestPage').then((module) => ({ default: module.PromptTaxonomyTestPage })));
const BorderBackplateApplicationTestPage = lazy(() => import('@/features/tests/pages/BorderBackplateApplicationTestPage').then((module) => ({ default: module.BorderBackplateApplicationTestPage })));
const BrainstormWhiteSurfaceExactTestPage = lazy(() => import('@/features/tests/pages/BrainstormWhiteSurfaceExactTestPage').then((module) => ({ default: module.BrainstormWhiteSurfaceExactTestPage })));
const WorkbenchRightPanelUnifiedTestPage = lazy(() => import('@/features/tests/pages/WorkbenchRightPanelUnifiedTestPage').then((module) => ({ default: module.WorkbenchRightPanelUnifiedTestPage })));
const WorkbenchAiRequestTagPolicyTestPage = lazy(() => import('@/features/tests/pages/WorkbenchAiRequestTagPolicyTestPage').then((module) => ({ default: module.WorkbenchAiRequestTagPolicyTestPage })));
const LinkedContextSelectionInteractionTestPage = lazy(() => import('@/features/tests/pages/LinkedContextSelectionInteractionTestPage').then((module) => ({ default: module.LinkedContextSelectionInteractionTestPage })));
const BrainstormLinkVisualOptionsTestPage = lazy(() => import('@/features/tests/pages/BrainstormLinkVisualOptionsTestPage').then((module) => ({ default: module.BrainstormLinkVisualOptionsTestPage })));
const DetailOutlineFocusLayoutTestPage = lazy(() => import('@/features/tests/pages/DetailOutlineFocusLayoutTestPage').then((module) => ({ default: module.DetailOutlineFocusLayoutTestPage })));
const StructuredDetailOutlineTagFillTestPage = lazy(() => import('@/features/tests/pages/StructuredDetailOutlineTagFillTestPage').then((module) => ({ default: module.StructuredDetailOutlineTagFillTestPage })));
const DetailOutlineLifecycleTestPage = lazy(() => import('@/features/tests/pages/DetailOutlineLifecycleTestPage').then((module) => ({ default: module.DetailOutlineLifecycleTestPage })));
const NoPlotPointCreationLoopTestPage = lazy(() => import('@/features/tests/pages/NoPlotPointCreationLoopTestPage').then((module) => ({ default: module.NoPlotPointCreationLoopTestPage })));
const SettingCheckModalTestPage = lazy(() => import('@/features/tests/pages/SettingCheckModalTestPage').then((module) => ({ default: module.SettingCheckModalTestPage })));
const SettingTaxonomyPlanTestPage = lazy(() => import('@/features/tests/pages/SettingTaxonomyPlanTestPage').then((module) => ({ default: module.SettingTaxonomyPlanTestPage })));
const SettingNavigationColorOptionsTestPage = lazy(() => import('@/features/tests/pages/SettingNavigationColorOptionsTestPage').then((module) => ({ default: module.SettingNavigationColorOptionsTestPage })));
const AiInputBorderOptionsTestPage = lazy(() => import('@/features/tests/pages/AiInputBorderOptionsTestPage').then((module) => ({ default: module.AiInputBorderOptionsTestPage })));
const SoftwareModalStyleTestPage = lazy(() => import('@/features/tests/pages/SoftwareModalStyleTestPage').then((module) => ({ default: module.SoftwareModalStyleTestPage })));
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
        title: '提示词分类优化测试',
        description: '测试提示词少分类、多标签、页面自动筛选，以及使用页下拉框只显示相关提示词。',
        path: '/prompt-taxonomy-test',
        icon: Tags,
        badge: 'Prompt',
      },
      {
        title: '边框透明背板应用预览',
        description: '集中预览作品编辑器里适合使用边框透明背板技术的贴边标题、字数、清空、章节信息和配置标签。',
        path: '/border-backplate-application-test',
        icon: Type,
        badge: 'Backplate',
      },
      {
        title: '脑洞页白侧栏成品测试',
        description: '一比一复刻脑洞页面四栏结构，测试白侧栏和 #F5F5F7 工作区的成品效果。',
        path: '/brainstorm-white-surface-exact-test',
        icon: Lightbulb,
        badge: 'Brainstorm Surface',
      },
      {
        title: '弹窗样式测试',
        description: '参考截图里的小型菜单弹窗，把作品菜单、导航设置、系统设置和快捷键内容套入同一套弹窗样式。',
        path: '/software-modal-style-test',
        icon: Palette,
        badge: 'Modal UI',
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
        title: '关联资料选择交互测试',
        description: '测试“点击条目只预览，点击勾选框或右侧按钮才关联”的资料选择交互。',
        path: '/linked-context-selection-interaction-test',
        icon: Check,
        badge: 'Preview / Select',
      },
      {
        title: '关联脑洞视觉方案',
        description: '测试关联脑洞弹窗的多种视觉方案，让脑洞卡片、标签、预览和关联状态更突出。',
        path: '/brainstorm-link-visual-options-test',
        icon: Lightbulb,
        badge: 'Brainstorm UI',
      },
      {
        title: '章纲单章聚焦布局测试',
        description: '测试左侧章节目录、中间当前章纲大编辑区、右侧 AI 工作区的单章聚焦章纲生产布局。',
        path: '/detail-outline-focus-layout-test',
        icon: NotebookText,
        badge: 'Chapter UI',
      },
      {
        title: '结构化章纲标签填充测试',
        description: '测试 AI 输出 XML 标签后，软件把本章目标、剧情流程、伏笔信息和状态变化填入对应章纲区域的方案。',
        path: '/structured-detail-outline-tag-fill-test',
        icon: NotebookText,
        badge: 'Tag Fill',
      },
      {
        title: '章纲生命周期测试',
        description: '测试正文生成后，章纲进入已执行、待核对、异常和反推章纲等状态的页面方案。',
        path: '/detail-outline-lifecycle-test',
        icon: NotebookText,
        badge: 'Lifecycle',
      },
      {
        title: '无剧情点创作闭环测试',
        description: '测试大纲直接到章纲、状态改为更新，并由更新统一处理新增人物设定和状态同步的闭环方案。',
        path: '/no-plot-point-creation-loop-test',
        icon: NotebookText,
        badge: 'Loop',
      },
      {
        title: '设定检查弹窗测试',
        description: '测试“大纲”改名为“设定”后，在人物设定右侧点击检查设定并关联资料补充新增人物、道具和状态的弹窗方案。',
        path: '/setting-check-modal-test',
        icon: NotebookText,
        badge: 'Setting Check',
      },
      {
        title: '设定分类与人物字段方案',
        description: '临时保存作品设定分类顺序、人物设定字段，以及人物关系应放入人物设定卡片的后续实现方案。',
        path: '/setting-taxonomy-plan-test',
        icon: NotebookText,
        badge: 'Setting Plan',
      },
      {
        title: '设定导航配色方案',
        description: '测试作品设定/人物设定侧栏导航的多套配色方案，参考当前主题、Linear、飞书和 Apple 侧栏。',
        path: '/setting-navigation-color-options-test',
        icon: Palette,
        badge: 'Setting Color',
      },
      {
        title: 'AI 输入框边框方案',
        description: '测试右侧 AI 输入框边框线、已关联资料背景、已关联字数提示和发送/停止按钮的多套视觉方案。',
        path: '/ai-input-border-options-test',
        icon: Palette,
        badge: 'Input UI',
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
    navigate('/dashboard');
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
      case '/linked-context-selection-interaction-test':
        return <LinkedContextSelectionInteractionTestPage />;
      case '/brainstorm-link-visual-options-test':
        return <BrainstormLinkVisualOptionsTestPage />;
      case '/detail-outline-focus-layout-test':
        return <DetailOutlineFocusLayoutTestPage />;
      case '/structured-detail-outline-tag-fill-test':
        return <StructuredDetailOutlineTagFillTestPage />;
      case '/detail-outline-lifecycle-test':
        return <DetailOutlineLifecycleTestPage />;
      case '/no-plot-point-creation-loop-test':
        return <NoPlotPointCreationLoopTestPage />;
      case '/setting-check-modal-test':
        return <SettingCheckModalTestPage />;
      case '/setting-taxonomy-plan-test':
        return <SettingTaxonomyPlanTestPage />;
      case '/setting-navigation-color-options-test':
        return <SettingNavigationColorOptionsTestPage />;
      case '/ai-input-border-options-test':
        return <AiInputBorderOptionsTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/error-log':
        return <ErrorLogPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/prompt-taxonomy-test':
        return <PromptTaxonomyTestPage />;
      case '/border-backplate-application-test':
        return <BorderBackplateApplicationTestPage />;
      case '/brainstorm-white-surface-exact-test':
        return <BrainstormWhiteSurfaceExactTestPage />;
      case '/software-modal-style-test':
        return <SoftwareModalStyleTestPage />;
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
