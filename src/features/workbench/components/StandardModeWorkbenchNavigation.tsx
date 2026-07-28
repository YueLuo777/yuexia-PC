export type StandardNavigationGroup = 'creationFlow' | 'tools';

export type StandardStageAction =
  | 'workDetails'
  | 'brainstormLibrary'
  | 'generateBrainstorm'
  | 'naming'
  | 'createSettings'
  | 'settingsList'
  | 'changeSettingTemplate'
  | 'chapterOutline'
  | 'writing'
  | 'storyAudit'
  | 'statusUpdate'
  | 'summary';

export const STANDARD_MODE_ACTION_SELECTED_CLASS =
  'border-[#08AACE] bg-[#DFF6FB] text-[#078FAB]';

type NavigationAction = {
  id: StandardStageAction;
  title: string;
  activeActions?: StandardStageAction[];
};

const CREATION_FLOW_ACTIONS: NavigationAction[] = [
  { id: 'workDetails', title: '作品详情' },
  {
    id: 'settingsList',
    title: '作品设定',
    activeActions: ['settingsList', 'createSettings', 'changeSettingTemplate'],
  },
  { id: 'writing', title: '生成正文' },
  { id: 'storyAudit', title: '审核检查' },
];

const TOOL_ACTIONS: NavigationAction[] = [
  {
    id: 'generateBrainstorm',
    title: '生成脑洞',
    activeActions: ['generateBrainstorm', 'brainstormLibrary'],
  },
  { id: 'naming', title: '取名' },
  { id: 'chapterOutline', title: '生成章纲' },
  { id: 'statusUpdate', title: '更新状态' },
  { id: 'summary', title: '生成梗概' },
];

interface StandardModeWorkbenchNavigationProps {
  locked?: boolean;
  bookTitle: string;
  activeAction: StandardStageAction;
  onSelectAction: (group: StandardNavigationGroup, action: StandardStageAction) => void;
}

export function StandardModeWorkbenchNavigation({
  locked = false,
  bookTitle,
  activeAction,
  onSelectAction,
}: StandardModeWorkbenchNavigationProps) {
  const renderGroup = (
    group: StandardNavigationGroup,
    label: string,
    actions: NavigationAction[],
  ) => (
    <section
      aria-label={group === 'creationFlow' ? `书名：${label}` : label}
      data-standard-navigation-group={group}
      data-standard-navigation-boundary={group === 'creationFlow' ? 'review-right-edge' : undefined}
      className="xy-capsule-group xy-flow-status-group shrink-0"
    >
      <div
        data-standard-navigation-book-title={group === 'creationFlow' ? 'true' : undefined}
        className={
          group === 'creationFlow'
            ? 'flex min-h-8 w-fit min-w-28 max-w-[calc(15.5em+2rem)] shrink-0 items-center justify-center border-r border-[#dce1e8] px-4 text-center text-[15px] font-black tracking-wide text-[#087A96]'
            : 'flex min-h-8 shrink-0 items-center border-r border-[#dce1e8] px-3 text-xs font-bold text-[#657180]'
        }
        title={group === 'creationFlow' ? label : undefined}
      >
        <span className={group === 'creationFlow' ? 'min-w-0 w-full truncate text-center' : undefined}>{label}</span>
      </div>
      {actions.map((action) => {
        const active = (action.activeActions ?? [action.id]).includes(activeAction);
        return (
          <button
            key={action.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelectAction(group, action.id)}
            className={`xy-capsule-button xy-flow-status-button shrink-0 ${active ? 'xy-active' : ''}`}
          >
            <span className="xy-flow-status-title">{action.title}</span>
          </button>
        );
      })}
    </section>
  );

  return (
    <header
      inert={locked ? true : undefined}
      aria-disabled={locked || undefined}
      data-standard-navigation-locked={locked ? 'true' : undefined}
      className={`h-12 shrink-0 overflow-x-auto overflow-y-hidden border-b border-[#dce1e8] bg-white transition-opacity ${locked ? 'pointer-events-none opacity-60' : ''}`}
    >
      <nav
        aria-label="标准模式创作导航"
        className="flex h-full min-w-max items-center justify-start gap-10 px-4"
      >
        {renderGroup('creationFlow', bookTitle.trim() || '未命名作品', CREATION_FLOW_ACTIONS)}
        {renderGroup('tools', '功能栏', TOOL_ACTIONS)}
      </nav>
    </header>
  );
}
