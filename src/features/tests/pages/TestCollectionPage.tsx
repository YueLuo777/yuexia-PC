import {
  ArrowLeft,
  Check,
  ChevronDown,
  EyeOff,
  Globe,
  NotebookText,
  Moon,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Search,
  Tags,
  Type,
  X,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';

const BrainstormAiChainTestPage = lazy(() => import('@/features/tests/pages/BrainstormAiChainTestPage').then((module) => ({ default: module.BrainstormAiChainTestPage })));
const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const ErrorLogPage = lazy(() => import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })));
const PromptTaxonomyTestPage = lazy(() => import('@/features/tests/pages/PromptTaxonomyTestPage').then((module) => ({ default: module.PromptTaxonomyTestPage })));
const BorderBackplateApplicationTestPage = lazy(() => import('@/features/tests/pages/BorderBackplateApplicationTestPage').then((module) => ({ default: module.BorderBackplateApplicationTestPage })));
const WorkbenchRightPanelUnifiedTestPage = lazy(() => import('@/features/tests/pages/WorkbenchRightPanelUnifiedTestPage').then((module) => ({ default: module.WorkbenchRightPanelUnifiedTestPage })));
const WorkbenchShelllessAuditTestPage = lazy(() => import('@/features/tests/pages/WorkbenchShelllessAuditTestPage').then((module) => ({ default: module.WorkbenchShelllessAuditTestPage })));
const WorkbenchAiPanelReplicaTestPage = lazy(() => import('@/features/tests/pages/WorkbenchAiPanelReplicaTestPage').then((module) => ({ default: module.WorkbenchAiPanelReplicaTestPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));

const testGroups = [
  {
    title: 'UI 与主题',
    items: [
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
    ],
  },
  {
    title: 'AI 链路测试',
    items: [
      {
        title: 'AI 生成链路测试中心',
        description: '集中测试脑洞、大纲、细纲、概要、提炼、续写、审核、更新等 AI 生成链路。',
        path: '/brainstorm-ai-chain-test',
        icon: Sparkles,
        badge: 'AI',
      },
      {
        title: '右侧 AI 配置栏统一方案',
        description: '测试作品编辑器右侧 AI 区域的统一布局，并检查浮动按钮背后的白色垫片是否已去掉。',
        path: '/workbench-right-panel-unified-test',
        icon: SlidersHorizontal,
        badge: 'Panel / 垫片',
      },
      {
        title: '???????????',
        description: '????????????????????????????????????????? shellless ???',
        path: '/workbench-shellless-audit-test',
        icon: SlidersHorizontal,
        badge: 'Shellless',
      },
      {
        title: '????? AI ????',
        description: '??????????????????????????????????? AI ????????????',
        path: '/workbench-ai-panel-replica-test',
        icon: SlidersHorizontal,
        badge: 'Replica',
      },
      {
        title: '输出日志折叠分组测试',
        description: '测试输出日志右侧区域按提示词、关联内容、用户要求分组折叠，只隐藏显示不影响发送给 AI。',
        path: '/ai-log-folding-test',
        icon: NotebookText,
        badge: 'Log UI',
      },
      {
        title: '隐藏页面',
        description: '集中检查没有展示在正式导航里的页面、旧入口和内嵌功能。',
        path: '/hidden-pages-test',
        icon: EyeOff,
        badge: 'Hidden',
      },
      {
        title: '错误日志',
        description: '记录软件里出现过的问题、原因、修复办法和后续防复发规则。',
        path: '/error-log',
        icon: NotebookText,
        badge: 'Log',
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

function LogFoldSection({
  id,
  title,
  meta,
  content,
  collapsed,
  onToggle,
  tone = 'slate',
}: {
  id: string;
  title: string;
  meta: string;
  content: string;
  collapsed: boolean;
  onToggle: (id: string) => void;
  tone?: 'slate' | 'cyan' | 'amber';
}) {
  const toneClass = tone === 'cyan'
    ? 'border-cyan-100 bg-cyan-50/70 text-cyan-700'
    : tone === 'amber'
      ? 'border-amber-100 bg-amber-50/80 text-amber-700'
      : 'border-slate-100 bg-slate-50 text-slate-700';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-950">{title}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${toneClass}`}>{meta}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-400">折叠只影响当前查看，仍会完整发送给 AI。</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      {!collapsed && (
        <div className="ai-request-log-text whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-slate-700">
          {content}
        </div>
      )}
    </section>
  );
}

export function AiLogFoldingTestPage() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    prompt: false,
    context: false,
    user: false,
  });
  const toggleSection = (id: string) => {
    setCollapsedSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const promptText = [
    '你是番茄小说男频细纲编辑。',
    '',
    '用户会提供【小说大纲】和【前文章节细纲】。',
    '你的任务是根据这些内容，继续生成当前章节的“单章剧情细纲”。',
    '',
    '要求：',
    '1. 只生成当前这一章，不要生成后续章节。',
    '2. 细纲控制在300-500字。',
    '3. 必须承接前文章节细纲，尤其是上一章的结尾钩子。',
    '4. 不要写正文，不要写对白，只输出细纲结果。',
  ].join('\n');
  const contextText = [
    '【关联脑洞】',
    '主角修水管时发现小区地下水路连着旧城灵脉，水压异常其实是灵气潮汐。',
    '',
    '【读取设定 / 剧情大纲】',
    '第一卷围绕主角从普通维修工误入高武世界展开，核心冲突是旧城灵脉被商业势力暗中抽取。',
    '',
    '【前文细纲】',
    '第1章：主角接到深夜维修单，发现水表倒转。',
    '第2章：主角被神秘住户提醒不要碰地下阀门，但仍因责任心进入地下管廊。',
  ].join('\n');
  const userText = '根据当前设定，生成第3章细纲。要求主角发现第一个可利用的能力，但不要让他立刻变强。';
  const fullPayload = [
    '【System Prompt】',
    promptText,
    '',
    '【Context】',
    contextText,
    '',
    '【User Request】',
    userText,
  ].join('\n');

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <h1 className="text-xl font-black text-slate-950">输出日志折叠分组测试</h1>
        <p className="mt-1 text-xs font-bold text-slate-400">以大纲设定输出日志为原型：右侧内容分组折叠，但底层发送内容保持完整。</p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden bg-white">
        <aside className="border-r border-slate-100 bg-slate-50 p-5 text-sm">
          <div className="space-y-3">
            {[
              ['链路', '生成细纲'],
              ['模型', 'GPT5.5'],
              ['提示词', collapsedSections.prompt ? '已折叠 · 仍发送' : '展开显示'],
              ['关联内容', collapsedSections.context ? '已折叠 · 仍发送' : '脑洞 + 读取设定'],
              ['用户要求', collapsedSections.user ? '已折叠 · 仍发送' : '展开显示'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">{label}</div>
                <div className="mt-1 break-words font-black text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </aside>
        <main className="min-h-0 overflow-y-auto p-6">
          <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">
            这里测试的是“查看层折叠”：折叠某一组后只是不显示，下面完整发送预览仍然保留全部内容。
          </div>
          <div className="space-y-3">
            <LogFoldSection
              id="prompt"
              title="提示词"
              meta={`${promptText.length} 字符`}
              content={promptText}
              collapsed={Boolean(collapsedSections.prompt)}
              onToggle={toggleSection}
              tone="slate"
            />
            <LogFoldSection
              id="context"
              title="关联内容"
              meta="脑洞 / 读取设定 / 前文细纲"
              content={contextText}
              collapsed={Boolean(collapsedSections.context)}
              onToggle={toggleSection}
              tone="cyan"
            />
            <LogFoldSection
              id="user"
              title="用户要求"
              meta={`${userText.length} 字符`}
              content={userText}
              collapsed={Boolean(collapsedSections.user)}
              onToggle={toggleSection}
              tone="amber"
            />
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-black text-slate-950">完整发送预览</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">用于确认折叠没有改变实际发送给 AI 的内容。</p>
              </div>
              <div className="ai-request-log-text whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-slate-700">
                {fullPayload}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

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
      case '/brainstorm-ai-chain-test':
        return <BrainstormAiChainTestPage />;
      case '/workbench-right-panel-unified-test':
        return <WorkbenchRightPanelUnifiedTestPage />;
      case '/workbench-shellless-audit-test':
        return <WorkbenchShelllessAuditTestPage />;
      case '/workbench-ai-panel-replica-test':
        return <WorkbenchAiPanelReplicaTestPage />;
      case '/ai-log-folding-test':
        return <AiLogFoldingTestPage />;
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
