import type { WorkbenchCreationFlowPageKey, WorkbenchHeaderFlowItem } from '@/features/workbench/model/workbenchCreationFlow';

interface WorkbenchHeaderProps {
  workTitle: string;
  flowItems: WorkbenchHeaderFlowItem[];
  activeFlow: WorkbenchCreationFlowPageKey;
  onOpenWorkInfo: () => void;
  onSelectFlow: (flow: WorkbenchCreationFlowPageKey) => void;
}

const REVIEW_FLOW_IDS = new Set<WorkbenchCreationFlowPageKey>(['audit', 'comment', 'status', 'summary']);

export function WorkbenchHeader({
  workTitle,
  flowItems,
  activeFlow,
  onOpenWorkInfo,
  onSelectFlow,
}: WorkbenchHeaderProps) {
  const workInfoItem = flowItems.find((item) => item.id === 'workInfo');
  const creationFlowItems = flowItems.filter((item) => item.id !== 'workInfo' && item.flow && !REVIEW_FLOW_IDS.has(item.flow));
  const reviewFlowItems = flowItems.filter((item) => item.flow && REVIEW_FLOW_IDS.has(item.flow));

  const renderFlowButton = (item: WorkbenchHeaderFlowItem) => {
    const active = item.flow === activeFlow;
    return (
      <button
        key = {item.id}
        type="button"
        onClick={() => {
          if (item.flow) onSelectFlow(item.flow);
        }}
        className={`xy-capsule-button shrink-0 ${active ? 'xy-active' : ''}`}
      >
        {item.title}
      </button>
    );
  };

  return (
    <header className="relative flex h-12 shrink-0 items-center border-b border-gray-200 bg-white px-4">
      <div className="absolute inset-y-0 left-0 right-0 flex items-center overflow-x-auto px-4">
        <div className="xy-capsule-group min-w-0 shrink-0">
          <div
            className="flex min-h-9 min-w-0 max-w-[260px] items-center px-3.5 text-[0.8125rem] font-extrabold text-slate-700"
            title={workTitle}
          >
            <span className="min-w-0 truncate">{workTitle}</span>
          </div>
          {workInfoItem ? (
            <button
              type="button"
              onClick={onOpenWorkInfo}
              className="xy-capsule-button xy-work-info-primary shrink-0"
            >
              {workInfoItem.title}
            </button>
          ) : null}
        </div>

        <div className="xy-capsule-group ml-3 shrink-0">
          {creationFlowItems.map(renderFlowButton)}
        </div>
        <div className="xy-capsule-group ml-3 shrink-0">
          {reviewFlowItems.map(renderFlowButton)}
        </div>
      </div>
    </header>
  );
}
