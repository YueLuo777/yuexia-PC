import type { ReactNode } from 'react';

export type StandardStage = 'preparation' | 'settings' | 'creation' | 'check';
export type StandardStageAction =
  | 'brainstormLibrary'
  | 'generateBrainstorm'
  | 'createSettings'
  | 'settingsList'
  | 'chapterOutline'
  | 'writing'
  | 'storyAudit'
  | 'statusUpdate'
  | 'summary';

interface StageActionItem {
  id: StandardStageAction;
  title: string;
}

interface StageItem {
  id: StandardStage;
  number: number;
  title: string;
  actions: StageActionItem[];
}

const STANDARD_STAGES: StageItem[] = [
  {
    id: 'preparation',
    number: 1,
    title: '准备阶段',
    actions: [
      { id: 'brainstormLibrary', title: '脑洞库' },
      { id: 'generateBrainstorm', title: '生成脑洞' },
    ],
  },
  {
    id: 'settings',
    number: 2,
    title: '设定阶段',
    actions: [
      { id: 'createSettings', title: '新建设定' },
      { id: 'settingsList', title: '设定列表' },
    ],
  },
  {
    id: 'creation',
    number: 3,
    title: '创作阶段',
    actions: [
      { id: 'chapterOutline', title: '章纲' },
      { id: 'writing', title: '正文' },
    ],
  },
  {
    id: 'check',
    number: 4,
    title: '检查阶段',
    actions: [
      { id: 'storyAudit', title: '审核剧情' },
      { id: 'statusUpdate', title: '更新状态' },
      { id: 'summary', title: '生成梗概' },
    ],
  },
];

interface StandardModeWorkbenchNavigationProps {
  title: string;
  channelLabel?: string;
  categoryLabel?: string;
  activeStage: StandardStage | null;
  activeAction: StandardStageAction | null;
  workInfoOpen: boolean;
  onSelectHome: () => void;
  onSelectStage: (stage: StandardStage) => void;
  onSelectAction: (stage: StandardStage, action: StandardStageAction) => void;
  onOpenWorkInfo: () => void;
  endAction?: ReactNode;
}

export function StandardModeWorkbenchNavigation({
  title,
  channelLabel = '男频',
  categoryLabel = '未分类',
  activeStage,
  activeAction,
  workInfoOpen,
  onSelectHome,
  onSelectStage,
  onSelectAction,
  onOpenWorkInfo,
  endAction,
}: StandardModeWorkbenchNavigationProps) {
  return (
    <header className="flex h-[76px] shrink-0 items-stretch gap-3 overflow-x-auto overflow-y-hidden border-b border-[#dce1e8] bg-white px-4 py-1.5">
      <section className="flex w-[280px] shrink-0 items-center gap-3 rounded-md border border-[#dce1e8] bg-[#fbfdff] px-3">
        <button
          type="button"
          onClick={onSelectHome}
          aria-current={activeStage === null ? 'page' : undefined}
          className={`h-10 shrink-0 rounded-md border px-3 text-sm font-bold transition-colors ${
            activeStage === null
              ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_rgba(8,170,206,0.2)]'
              : 'border-[#d4dbe4] bg-white text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB]'
          }`}
        >
          工作台首页
        </button>
        <button
          type="button"
          onClick={onOpenWorkInfo}
          aria-pressed={workInfoOpen}
          className="min-w-0 flex-1 text-left"
          title="查看作品信息"
        >
          <span className="block truncate text-sm font-bold text-[#1f2933]" title={title}>{title}</span>
          <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-[#7b8794]">
            <span className="shrink-0">{channelLabel}</span>
            <span className="text-[#c5ccd5]">·</span>
            <span className="truncate" title={categoryLabel}>{categoryLabel}</span>
          </span>
        </button>
      </section>

      <nav aria-label="标准模式创作导航" className="grid min-w-[980px] flex-1 grid-cols-4 gap-2.5">
        {STANDARD_STAGES.map((stage) => {
          const stageActive = activeStage === stage.id;
          return (
            <section
              key={stage.id}
              className={`grid min-w-0 grid-rows-[24px_1fr] rounded-md border px-2 py-1 transition-colors ${
                stageActive
                  ? 'border-[#08AACE] bg-[#F3FCFE] shadow-[0_0_0_1px_rgba(8,170,206,0.2)]'
                  : 'border-[#dce1e8] bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectStage(stage.id)}
                aria-current={stageActive ? 'step' : undefined}
                className={`flex min-w-0 items-center justify-center gap-1.5 border-b text-xs font-bold ${
                  stageActive ? 'border-[#bdebf4] text-[#078FAB]' : 'border-[#edf0f3] text-[#657180]'
                }`}
              >
                <span>{stage.number}</span>
                <span>{stage.title}</span>
              </button>
              <div className="flex min-w-0 items-end justify-center gap-1.5 pt-1.5">
                {stage.actions.map((action) => {
                  const actionActive = activeAction === action.id;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onSelectAction(stage.id, action.id)}
                      aria-current={actionActive ? 'page' : undefined}
                      className={`h-7 min-w-0 flex-1 whitespace-nowrap rounded border px-1.5 text-[12px] font-semibold transition-colors ${
                        actionActive
                          ? 'border-[#08AACE] bg-[#DFF6FB] text-[#078FAB]'
                          : 'border-[#dce1e8] bg-white text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB]'
                      }`}
                    >
                      {action.title}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
      {endAction ? <div className="w-[148px] shrink-0 pt-1">{endAction}</div> : null}
    </header>
  );
}
