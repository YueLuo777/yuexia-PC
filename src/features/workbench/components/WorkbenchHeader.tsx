interface WorkbenchHeaderProps {
  onOpenWorkInfo: () => void;
  onOpenSettings: () => void;
  onOpenOutline: () => void;
  onOpenNotes: () => void;
  onOpenFind: () => void;
  onOpenEditorSettings: () => void;
}

export function WorkbenchHeader({
  onOpenWorkInfo,
  onOpenSettings,
  onOpenOutline,
  onOpenNotes,
  onOpenFind,
  onOpenEditorSettings,
}: WorkbenchHeaderProps) {
  const navItems = [
    { key: 'workInfo', label: '作品信息', onClick: onOpenWorkInfo },
    { key: 'settings', label: '设定库', onClick: onOpenSettings },
    { key: 'outline', label: '概要库', onClick: onOpenOutline },
    { key: 'notes', label: '备忘录', onClick: onOpenNotes },
  ];

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <nav className="flex items-center gap-1">
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

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onOpenFind}
          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-base font-medium text-gray-600 transition-colors hover:border-brand hover:text-brand"
          title="查找替换"
        >
          查找
        </button>
        <button
          onClick={onOpenEditorSettings}
          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-base font-medium text-gray-600 transition-colors hover:border-brand hover:text-brand"
          title="作品编辑器设定"
        >
          设定
        </button>
      </div>
    </header>
  );
}
