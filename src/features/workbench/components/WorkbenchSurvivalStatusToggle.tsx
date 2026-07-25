type WorkbenchSurvivalStatus = '存活' | '死亡';

type WorkbenchSurvivalStatusToggleProps = {
  value: WorkbenchSurvivalStatus;
  disabled?: boolean;
  onChange: (value: WorkbenchSurvivalStatus) => void;
};

const SURVIVAL_STATUSES: WorkbenchSurvivalStatus[] = ['存活', '死亡'];

const STATUS_META: Record<WorkbenchSurvivalStatus, { dot: string; text: string }> = {
  存活: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  死亡: { dot: 'bg-rose-300', text: 'text-slate-500' },
};

export function WorkbenchSurvivalStatusToggle({ value, disabled = false, onChange }: WorkbenchSurvivalStatusToggleProps) {
  const current = value === '死亡' ? '死亡' : '存活';
  const handleChange = (next: WorkbenchSurvivalStatus) => {
    if (disabled) return;
    onChange(next);
  };

  return (
    <div
      aria-label="生存状态"
      data-workbench-header-control="true"
      className="relative flex h-[48px] w-[142px] shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100/80 px-1.5"
      role="group"
    >
      {SURVIVAL_STATUSES.map((status) => {
        const active = current === status;
        const meta = STATUS_META[status];
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => handleChange(status)}
            className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-black transition-colors ${
              active
                ? `bg-white ${meta.text} shadow-sm`
                : disabled
                  ? 'cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
            }`}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
            <span className="truncate">{status}</span>
          </button>
        );
      })}
    </div>
  );
}
