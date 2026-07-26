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
  widthClass: string;
  actions: StageActionItem[];
}

const STANDARD_STAGES: StageItem[] = [
  {
    id: 'preparation',
    number: 1,
    title: '准备阶段',
    widthClass: 'w-[226px]',
    actions: [
      { id: 'brainstormLibrary', title: '脑洞库' },
      { id: 'generateBrainstorm', title: '生成脑洞' },
    ],
  },
  {
    id: 'settings',
    number: 2,
    title: '设定阶段',
    widthClass: 'w-[226px]',
    actions: [
      { id: 'createSettings', title: '新建设定' },
      { id: 'settingsList', title: '设定列表' },
    ],
  },
  {
    id: 'creation',
    number: 3,
    title: '创作阶段',
    widthClass: 'w-[190px]',
    actions: [
      { id: 'chapterOutline', title: '章纲' },
      { id: 'writing', title: '正文' },
    ],
  },
  {
    id: 'check',
    number: 4,
    title: '检查阶段',
    widthClass: 'w-[314px]',
    actions: [
      { id: 'storyAudit', title: '审核剧情' },
      { id: 'statusUpdate', title: '更新状态' },
      { id: 'summary', title: '生成梗概' },
    ],
  },
];

interface StandardModeWorkbenchNavigationProps {
  title: string;
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
    <header className="flex h-[112px] shrink-0 items-start gap-6 overflow-x-auto overflow-y-hidden border-b border-[#dce1e8] bg-white px-4 py-3">
      <div className="xy-capsule-group mt-0.5 min-w-0 shrink-0">
        <div
          className="flex min-h-8 min-w-0 max-w-[220px] items-center px-3 text-[0.8125rem] font-semibold text-[#1f2933]"
          title={title}
        >
          <span className="truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={onOpenWorkInfo}
          className={`xy-capsule-button shrink-0 ${workInfoOpen ? 'xy-active' : ''}`}
        >
          作品信息
        </button>
      </div>

      <nav aria-label="标准模式创作导航" className="flex min-w-[1100px] flex-1 items-start justify-center gap-3">
        <button
          type="button"
          onClick={onSelectHome}
          aria-current={activeStage === null ? 'page' : undefined}
          className={`h-10 w-[136px] shrink-0 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeStage === null
              ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_2px_rgba(8,170,206,0.18)]'
              : 'border-[#d4dbe4] bg-white text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB]'
          }`}
        >
          工作台首页
        </button>

        {STANDARD_STAGES.map((stage) => {
          const stageActive = activeStage === stage.id;
          return (
            <div key={stage.id} className={`flex shrink-0 flex-col items-center ${stage.widthClass}`}>
              <button
                type="button"
                onClick={() => onSelectStage(stage.id)}
                aria-current={stageActive ? 'step' : undefined}
                className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
                  stageActive
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_2px_rgba(8,170,206,0.22)]'
                    : 'border-[#d4dbe4] bg-white text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB]'
                }`}
              >
                <span className="text-xs font-bold">{stage.number}</span>
                <span>{stage.title}</span>
              </button>

              <div className="relative flex w-full justify-center gap-1.5 pt-4">
                <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-[#b9c6d3]" />
                {stage.actions.length > 1 ? (
                  <span className="absolute left-[18%] right-[18%] top-2 h-px bg-[#b9c6d3]" />
                ) : null}
                {stage.actions.map((action) => {
                  const actionActive = activeAction === action.id;
                  return (
                    <div key={action.id} className="relative pt-0">
                      <span className="absolute left-1/2 top-[-8px] h-2 w-px -translate-x-1/2 bg-[#b9c6d3]" />
                      <button
                        type="button"
                        onClick={() => onSelectAction(stage.id, action.id)}
                        aria-current={actionActive ? 'page' : undefined}
                        className={`relative h-8 whitespace-nowrap rounded-md border px-3 text-[13px] font-semibold transition-colors ${
                          actionActive
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_rgba(8,170,206,0.18)]'
                            : 'border-[#dce1e8] bg-white text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB]'
                        }`}
                      >
                        {action.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      {endAction ? <div className="w-[148px] shrink-0 pt-0.5">{endAction}</div> : null}
    </header>
  );
}
import type { ReactNode } from 'react';
