import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import type { WorkbenchCreationFlowPageKey, WorkbenchHeaderFlowItem } from '@/features/workbench/model/workbenchCreationFlow';

interface WorkbenchHeaderProps {
  workTitle: string;
  flowItems: WorkbenchHeaderFlowItem[];
  activeFlow: WorkbenchCreationFlowPageKey;
  fieldSizeVisible?: boolean;
  logVisible?: boolean;
  extraTools?: ReactNode;
  onOpenWorkInfo: () => void;
  onOpenFieldSize?: () => void;
  onOpenLog?: () => void;
  onSelectFlow: (flow: WorkbenchCreationFlowPageKey) => void;
}

export function WorkbenchHeader({
  workTitle,
  flowItems,
  activeFlow,
  fieldSizeVisible = false,
  logVisible = false,
  extraTools = null,
  onOpenWorkInfo,
  onOpenFieldSize,
  onOpenLog,
  onSelectFlow,
}: WorkbenchHeaderProps) {
  const workInfoItem = flowItems.find((item) => item.id === 'workInfo');
  const creationFlowItems = flowItems.filter((item) => item.id !== 'workInfo' && item.flow && item.group === 'creation');
  const reviewFlowItems = flowItems.filter((item) => item.flow && item.group === 'review');
  const hasRightTools = Boolean(extraTools) || fieldSizeVisible || logVisible;

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
    <header className="xy-wa-toolbar relative flex h-12 shrink-0 items-start border-b bg-white px-4">
      <div className={`absolute left-0 right-0 top-0 flex h-12 items-center overflow-x-auto px-4 ${hasRightTools ? 'pr-56' : ''}`}>
        <div className="xy-capsule-group min-w-0 shrink-0">
          <div
            className="flex min-h-8 min-w-0 max-w-[260px] items-center px-3 text-[0.8125rem] font-semibold text-[#1f2933]"
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
      {hasRightTools ? (
        <div className="absolute right-5 top-6 inline-flex -translate-y-1/2 items-center gap-2">
          {extraTools}
          {fieldSizeVisible ? (
            <button
              type="button"
              onClick={onOpenFieldSize}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-medium text-[#586574] transition-colors hover:border-[#1e71ef] hover:text-[#1e71ef]"
              aria-label="设置"
            >
              <Settings className="h-4 w-4" />
              设置
            </button>
          ) : null}
          {logVisible ? (
            <button
              type="button"
              onClick={onOpenLog}
              className="h-8 rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-medium text-[#586574] transition-colors hover:border-[#1e71ef] hover:text-[#1e71ef]"
            >
              日志
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
