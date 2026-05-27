interface WorkbenchHeaderProps {
  workTitle: string;
  onOpenWorkInfo: () => void;
  onOpenNotes: () => void;
  onOpenSettingLibrary: () => void;
  onOpenDetailOutlineLibrary: () => void;
  onOpenSummaryLibrary: () => void;
}

export function WorkbenchHeader({
  workTitle,
  onOpenWorkInfo,
  onOpenNotes,
  onOpenSettingLibrary,
  onOpenDetailOutlineLibrary,
  onOpenSummaryLibrary,
}: WorkbenchHeaderProps) {
  const navItems = [
    { key: 'settingLibrary', label: '大纲设定', onClick: onOpenSettingLibrary },
    { key: 'detailOutlineLibrary', label: '生成细纲', onClick: onOpenDetailOutlineLibrary },
    { key: 'summaryLibrary', label: '章节概要', onClick: onOpenSummaryLibrary },
    { key: 'notes', label: '备忘录', onClick: onOpenNotes },
  ];

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
            className="xy-capsule-button shrink-0 bg-[#08B3D9] text-white hover:bg-[#07a0c2] hover:text-white"
          >
            作品信息
          </button>
        </div>
      </div>

      <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        {navItems.map(({ key, label, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="rounded-full bg-brand px-4 py-1.5 text-base font-medium text-white transition-colors hover:bg-brand-dark"
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
