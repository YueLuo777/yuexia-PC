import { ArrowLeft, Check, Search, X } from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';
import { buildTestNumberByPath, formatTestSerial } from '@/features/tests/model/testCollectionNumbering';
import { useTestCollectionTestedState } from '@/features/tests/hooks/useTestCollectionTestedState';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

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
const WorkSettingTaxonomyProposalTestPage = lazy(() =>
  import('@/features/tests/pages/WorkSettingTaxonomyProposalTestPage').then((module) => ({
    default: module.WorkSettingTaxonomyProposalTestPage,
  })),
);
const SettingAiReadyTaxonomyTestPage = lazy(() =>
  import('@/features/tests/pages/SettingAiReadyTaxonomyTestPage').then((module) => ({
    default: module.SettingAiReadyTaxonomyTestPage,
  })),
);
const PromptDrivenNovelWorkspaceTestPage = lazy(() =>
  import('@/features/tests/pages/PromptDrivenNovelWorkspaceTestPage').then((module) => ({
    default: module.PromptDrivenNovelWorkspaceTestPage,
  })),
);
const UiConsistencyComparisonTestPage = lazy(() => import('@/features/tests/pages/UiConsistencyComparisonTestPage'));
const StandardModeWorkbenchTestPage = lazy(() => import('@/features/tests/pages/StandardModeWorkbenchTestPage'));
const ProfessionalWorkbenchBaselineTestPage = lazy(() =>
  import('@/features/tests/pages/ProfessionalWorkbenchBaselineTestPage').then((module) => ({
    default: module.ProfessionalWorkbenchBaselineTestPage,
  })),
);
const StandardModeFourStageWorkbenchTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeFourStageWorkbenchTestPage').then((module) => ({
    default: module.StandardModeFourStageWorkbenchTestPage,
  })),
);
const StandardModeSettingTemplateChoiceTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeSettingTemplateChoiceTestPage').then((module) => ({
    default: module.StandardModeSettingTemplateChoiceTestPage,
  })),
);
const StandardModeCreationPagesDesignTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeCreationPagesDesignTestPage').then((module) => ({
    default: module.StandardModeCreationPagesDesignTestPage,
  })),
);
const StandardModeCompactSettingWorkspaceTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeCompactSettingWorkspaceTestPage').then((module) => ({
    default: module.StandardModeCompactSettingWorkspaceTestPage,
  })),
);
const StandardModeProjectProgressTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeProjectProgressTestPage').then((module) => ({
    default: module.StandardModeProjectProgressTestPage,
  })),
);
const StandardModeGuidedNavigationTestPage = lazy(() =>
  import('@/features/tests/pages/StandardModeGuidedNavigationTestPage').then((module) => ({
    default: module.StandardModeGuidedNavigationTestPage,
  })),
);
const FourLevelSettingStructureTestPage = lazy(() =>
  import('@/features/tests/pages/FourLevelSettingStructureTestPage').then((module) => ({
    default: module.FourLevelSettingStructureTestPage,
  })),
);
const SettingTemplateAssemblerTestPage = lazy(() =>
  import('@/features/tests/pages/SettingTemplateAssemblerTestPage').then((module) => ({
    default: module.SettingTemplateAssemblerTestPage,
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
const TestBrowserPage = lazy(() =>
  import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })),
);
const TomatoGenreIterationTestPage = lazy(() =>
  import('@/features/tests/pages/TomatoGenreIterationTestPage').then((module) => ({
    default: module.TomatoGenreIterationTestPage,
  })),
);
const BuiltInAiProductIdeaTestPage = lazy(() =>
  import('@/features/tests/pages/BuiltInAiProductIdeaTestPage').then((module) => ({
    default: module.BuiltInAiProductIdeaTestPage,
  })),
);

const testNumberByPath = buildTestNumberByPath(testGroups);
const validTestPaths = new Set(testNumberByPath.keys());

type CollectionTab = 'untested' | 'tested';

function formatTestNumber(path: string) {
  return formatTestSerial(testNumberByPath.get(path));
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
  const { testedTestPaths, toggleTestedTest } = useTestCollectionTestedState(validTestPaths);

  useEffect(() => {
    const showIndex = () => setActivePath(null);
    window.addEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
    return () => window.removeEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
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
      case '/work-setting-taxonomy-proposal-test':
        return <WorkSettingTaxonomyProposalTestPage />;
      case '/setting-ai-ready-taxonomy-test':
        return <SettingAiReadyTaxonomyTestPage />;
      case '/prompt-driven-novel-workspace-test':
        return <PromptDrivenNovelWorkspaceTestPage />;
      case '/ui-consistency-comparison-test':
        return <UiConsistencyComparisonTestPage />;
      case '/standard-mode-workbench-test':
        return <StandardModeWorkbenchTestPage />;
      case '/professional-workbench-baseline-test':
        return <ProfessionalWorkbenchBaselineTestPage />;
      case '/standard-mode-four-stage-workbench-test':
        return <StandardModeFourStageWorkbenchTestPage />;
      case '/standard-mode-setting-template-choice-test':
        return <StandardModeSettingTemplateChoiceTestPage />;
      case '/standard-mode-creation-pages-design-test':
        return <StandardModeCreationPagesDesignTestPage />;
      case '/standard-mode-compact-setting-workspace-test':
        return <StandardModeCompactSettingWorkspaceTestPage />;
      case '/standard-mode-project-progress-test':
        return <StandardModeProjectProgressTestPage />;
      case '/standard-mode-guided-navigation-test':
        return <StandardModeGuidedNavigationTestPage />;
      case '/four-level-setting-structure-test':
        return <FourLevelSettingStructureTestPage />;
      case '/setting-template-assembler-test':
        return <SettingTemplateAssemblerTestPage />;
      case '/test-browser':
        return <TestBrowserPage />;
      case '/tomato-genre-iteration-test':
        return <TomatoGenreIterationTestPage />;
      case '/built-in-ai-product-idea-test':
        return <BuiltInAiProductIdeaTestPage />;
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
