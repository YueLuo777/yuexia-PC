interface WorkbenchHeaderProps {
  workTitle: string;
  onOpenWorkInfo: () => void;
  onOpenSettings: () => void;
  onOpenOutline: () => void;
  onOpenNotes: () => void;
}

export function WorkbenchHeader({
  workTitle,
  onOpenWorkInfo,
  onOpenSettings,
  onOpenOutline,
  onOpenNotes,
}: WorkbenchHeaderProps) {
  const navItems = [
    { key: 'workInfo', label: '作品信息', onClick: onOpenWorkInfo },
    { key: 'settings', label: '设定库', onClick: onOpenSettings },
    { key: 'outline', label: '概要库', onClick: onOpenOutline },
    { key: 'notes', label: '备忘录', onClick: onOpenNotes },
  ];

  return (
    <header className="relative flex h-12 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-4">
      <div className="absolute left-0 top-0 flex h-full max-w-[360px] items-center px-4">
        <h1 className="line-clamp-2 text-base font-bold leading-5 text-gray-900" title={workTitle}>
          小说名：{workTitle}
        </h1>
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
