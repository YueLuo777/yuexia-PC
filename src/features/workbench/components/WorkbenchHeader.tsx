import { Settings } from 'lucide-react';

import type { WorkbenchCreationFlowPageKey, WorkbenchHeaderFlowItem } from '@/features/workbench/model/workbenchCreationFlow';

interface WorkbenchHeaderProps {
  workTitle: string;
  flowItems: WorkbenchHeaderFlowItem[];
  activeFlow: WorkbenchCreationFlowPageKey;
  fieldSizeVisible?: boolean;
  logVisible?: boolean;
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
  onOpenWorkInfo,
  onOpenFieldSize,
  onOpenLog,
  onSelectFlow,
}: WorkbenchHeaderProps) {
  const workInfoItem = flowItems.find((item) => item.id === 'workInfo');
  const creationFlowItems = flowItems.filter((item) => item.id !== 'workInfo' && item.flow && item.group === 'creation');
  const reviewFlowItems = flowItems.filter((item) => item.flow && item.group === 'review');
  const hasRightTools = fieldSizeVisible || logVisible;

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
    <header className="relative flex h-14 shrink-0 items-start border-b border-[#08AACE] bg-white px-4">
      <div className={`absolute left-0 right-0 top-0 flex h-12 items-center overflow-x-auto px-4 ${hasRightTools ? 'pr-56' : ''}`}>
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
      {hasRightTools ? (
        <div className="absolute right-5 top-6 inline-flex -translate-y-1/2 items-center gap-2">
          {fieldSizeVisible ? (
            <button
              type="button"
              onClick={onOpenFieldSize}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-[#08AACE] hover:text-[#08AACE]"
              aria-label="字段尺寸"
            >
              <Settings className="h-4 w-4" />
              字段尺寸
            </button>
          ) : null}
          {logVisible ? (
            <button
              type="button"
              onClick={onOpenLog}
              className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-[#08AACE] hover:text-[#08AACE]"
            >
              日志
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
