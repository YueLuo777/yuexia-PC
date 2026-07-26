import { FileText, Layers3, Lightbulb, ListTree, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore, type ComponentType } from 'react';

import { SettingGenerationFlowLauncher } from '@/features/owner-test-mode/components/SettingGenerationFlowLauncher';
import { useOwnerTestMode } from '@/features/owner-test-mode/model/ownerTestMode';
import { WorkbenchNoNovelState } from '@/features/workbench/components/workbenchPageSupport';
import {
  StandardModeWorkbenchNavigation,
  type StandardStage,
  type StandardStageAction,
} from '@/features/workbench/components/StandardModeWorkbenchNavigation';
import { StandardModeSharedCreationPage } from '@/features/workbench/components/StandardModeSharedCreationPage';
import { useWorkbenchData, readChapterContent } from '@/features/workbench/hooks/useWorkbenchData';
import { buildStandardModeWorkbenchStats } from '@/features/workbench/model/standardModeWorkbenchStats';
import { readWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';
import { StandardModeBrainstormPage } from '@/features/workbench/pages/StandardModeBrainstormPage';
import { StandardModeSettingPage } from '@/features/workbench/pages/StandardModeSettingPage';
import { getBackgroundAiTasksSnapshot, subscribeBackgroundAiTasks } from '@/shared/ai/backgroundAiTasks';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { AppModalShell } from '@/shared/ui/AppModalShell';

const PROCESS_STEPS: Array<{
  stage: StandardStage;
  title: string;
  summary: string;
  result: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    stage: 'preparation',
    title: '生成脑洞',
    summary: '先确定题材、主角、主要冲突和故事看点。',
    result: '得到后续创作都要围绕的故事方向。',
    icon: Lightbulb,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    stage: 'settings',
    title: '扩展设定',
    summary: '把脑洞补全为世界、人物、势力和关键规则。',
    result: '让后续内容有统一依据，减少前后矛盾。',
    icon: Layers3,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    stage: 'creation',
    title: '生成章纲',
    summary: '把设定拆成每章要发生的事件和推进目标。',
    result: '先确定章节结构，再开始写正文。',
    icon: ListTree,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  {
    stage: 'creation',
    title: '生成正文',
    summary: '根据本章章纲和相关设定完成章节内容。',
    result: '保证正文围绕计划推进，同时保留修改空间。',
    icon: FileText,
    tone: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  {
    stage: 'check',
    title: '审核剧情',
    summary: '检查正文是否符合章纲、设定和前文逻辑。',
    result: '发现偏离、冲突和文字问题后再确认修改。',
    icon: ShieldCheck,
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

export function StandardModeWorkbenchPage() {
  const ownerTestMode = useOwnerTestMode();
  const [activeStage, setActiveStage] = useState<StandardStage | null>(null);
  const [activeAction, setActiveAction] = useState<StandardStageAction | null>(null);
  const [isWorkInfoOpen, setIsWorkInfoOpen] = useState(false);
  const { tabs, activeTabId } = useWorkspaceTabs();
  const { currentNovel, currentNovelId, volumes, setCurrentNovel } = useWorkbenchData();
  const reviewTasks = useSyncExternalStore(
    subscribeBackgroundAiTasks,
    getBackgroundAiTasksSnapshot,
    getBackgroundAiTasksSnapshot,
  );
  const settingsStorageKey = currentNovelId ? `xinyuexia_workbench_settings_${currentNovelId}` : '';
  const outlineStorageKey = currentNovelId ? `xinyuexia_workbench_outline_${currentNovelId}` : '';

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId || activeTab.workId === currentNovelId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  const stats = useMemo(() => {
    if (!currentNovel) return null;
    const outlineEntries = outlineStorageKey ? readWorkbenchLibraryEntries(outlineStorageKey) : [];
    return buildStandardModeWorkbenchStats({
      novelWordCount:
        currentNovel.wordCount ??
        volumes.flatMap((volume) => volume.chapters).reduce((total, chapter) => total + chapter.wordCount, 0),
      volumes,
      outlineEntries,
      reviewTasks,
      settingsStorageKey,
      readChapterContent: (chapterId) => readChapterContent(currentNovel.id, chapterId),
    });
  }, [currentNovel, outlineStorageKey, reviewTasks, settingsStorageKey, volumes]);

  if (!currentNovel || !stats) return <WorkbenchNoNovelState />;

  const statItems = [
    { label: '总字数', value: stats.wordCount.toLocaleString('zh-CN'), unit: '字', tone: 'text-[#078FAB]' },
    { label: '章纲', value: stats.outlineCount.toLocaleString('zh-CN'), unit: '章', tone: 'text-emerald-600' },
    { label: '正文', value: stats.draftCount.toLocaleString('zh-CN'), unit: '章', tone: 'text-violet-600' },
    { label: '已审核', value: stats.reviewedChapterCount.toLocaleString('zh-CN'), unit: '章', tone: 'text-rose-600' },
  ];
  const isBrainstormPage = activeAction === 'brainstormLibrary' || activeAction === 'generateBrainstorm';
  const isSettingPage = activeAction === 'createSettings' || activeAction === 'settingsList';
  const isSharedCreationPage = activeAction === 'chapterOutline' || activeAction === 'writing';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-standard-mode-workbench="true">
      <StandardModeWorkbenchNavigation
        title={currentNovel.title}
        activeStage={activeStage}
        activeAction={activeAction}
        workInfoOpen={isWorkInfoOpen}
        onSelectHome={() => {
          setActiveStage(null);
          setActiveAction(null);
        }}
        onSelectStage={(stage) => {
          setActiveStage(stage);
          setActiveAction(null);
        }}
        onSelectAction={(stage, action) => {
          setActiveStage(stage);
          setActiveAction(action);
        }}
        onOpenWorkInfo={() => setIsWorkInfoOpen(true)}
        endAction={ownerTestMode && activeAction === 'settingsList' ? <SettingGenerationFlowLauncher /> : null}
      />

      {isBrainstormPage ? (
        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <StandardModeBrainstormPage focusGeneration={activeAction === 'generateBrainstorm'} />
        </main>
      ) : isSettingPage ? (
        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <StandardModeSettingPage
            novelId={String(currentNovel.id)}
            novelTitle={currentNovel.title}
            novelCategory={currentNovel.category || '玄幻'}
            settingsStorageKey={settingsStorageKey}
            forceTemplateSelection={activeAction === 'createSettings'}
            onInitialized={() => {
              setActiveStage('settings');
              setActiveAction('settingsList');
            }}
          />
        </main>
      ) : isSharedCreationPage ? (
        <main className="min-h-0 flex-1 overflow-hidden">
          <StandardModeSharedCreationPage action={activeAction} />
        </main>
      ) : (
        <main className="min-h-0 flex-1 overflow-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[1500px] min-w-[920px]">
            <section className="flex items-end justify-between gap-6 border-b border-[#dce1e8] pb-5">
              <div>
                <h1 className="text-xl font-bold text-[#1f2933]">工作台首页</h1>
                <p className="mt-1.5 text-sm font-medium text-[#7b8794]">
                  查看当前创作进度，并按顺序完成从脑洞到检查的流程。
                </p>
              </div>
              <div className="text-right text-sm font-medium text-[#7b8794]">
                <div>{currentNovel.category || '未分类'}</div>
                <div className="mt-1">最近编辑 {currentNovel.lastModifiedAt || '暂无记录'}</div>
              </div>
            </section>

            <section aria-label="作品进度统计" className="mt-5 grid grid-cols-4 gap-3">
              {statItems.map((item) => (
                <article
                  key={item.label}
                  className="h-[104px] rounded-[6px] border border-[#dce1e8] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                >
                  <div className="text-sm font-semibold text-[#657180]">{item.label}</div>
                  <div className={`mt-2 flex items-baseline gap-1.5 ${item.tone}`}>
                    <span className="text-2xl font-bold">{item.value}</span>
                    <span className="text-sm font-semibold">{item.unit}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="mt-7">
              <div className="flex items-center justify-between border-b border-[#dce1e8] pb-3">
                <h2 className="text-base font-bold text-[#1f2933]">创作流程</h2>
                <span className="text-sm font-medium text-[#8a95a2]">前一步的结果会成为下一步的依据</span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {PROCESS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const active = activeStage === step.stage;
                  return (
                    <article
                      key={step.title}
                      className={`relative min-h-[216px] rounded-[6px] border bg-white px-4 pb-4 pt-5 transition-colors ${
                        active ? 'border-[#08AACE] shadow-[0_0_0_1px_#08AACE]' : 'border-[#dce1e8]'
                      }`}
                    >
                      <div className="absolute right-3 top-3 text-xs font-bold text-[#a0a9b4]">{index + 1}</div>
                      <div className={`grid h-9 w-9 place-items-center rounded-md border ${step.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 text-[15px] font-bold text-[#1f2933]">{step.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#657180]">{step.summary}</p>
                      <div className="mt-3 border-t border-[#edf0f3] pt-3 text-[13px] font-medium leading-5 text-[#8a95a2]">
                        {step.result}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      )}

      <AppModalShell
        title="作品信息"
        isOpen={isWorkInfoOpen}
        onClose={() => setIsWorkInfoOpen(false)}
        widthClass="w-[520px]"
        heightClass="h-auto max-h-[70vh]"
        contentClassName="p-5"
        storageId="standard_mode_work_info"
        centerOnOpen
      >
        <dl className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-4 gap-y-4 text-sm">
          <dt className="font-semibold text-[#7b8794]">作品名称</dt>
          <dd className="font-semibold text-[#1f2933]">{currentNovel.title}</dd>
          <dt className="font-semibold text-[#7b8794]">小说类型</dt>
          <dd className="font-semibold text-[#1f2933]">{currentNovel.category || '未分类'}</dd>
          <dt className="font-semibold text-[#7b8794]">创建时间</dt>
          <dd className="font-semibold text-[#1f2933]">{currentNovel.createdAt || '暂无记录'}</dd>
          <dt className="font-semibold text-[#7b8794]">最近编辑</dt>
          <dd className="font-semibold text-[#1f2933]">{currentNovel.lastModifiedAt || '暂无记录'}</dd>
        </dl>
      </AppModalShell>
    </div>
  );
}
