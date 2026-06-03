interface WorkbenchHeaderProps {
  workTitle: string;
  onOpenWorkInfo: () => void;
}

export function WorkbenchHeader({
  workTitle,
  onOpenWorkInfo,
}: WorkbenchHeaderProps) {
  return (
    <header className="relative flex h-12 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-4">
      <div className="absolute left-0 top-0 flex h-full max-w-[620px] items-center px-4">
        <div className="xy-capsule-group min-w-0">
          <div
            className="flex min-h-9 min-w-0 max-w-[390px] items-center px-3.5 text-[0.8125rem] font-extrabold text-slate-700"
            title={workTitle}
          >
            <span className="min-w-0 truncate">{workTitle}</span>
          </div>
          <button
            onClick={onOpenWorkInfo}
            className="xy-capsule-button xy-work-info-primary shrink-0"
          >
            作品信息
          </button>
        </div>
      </div>
    </header>
  );
}
