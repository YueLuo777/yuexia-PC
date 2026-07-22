type WorkbenchSurvivalStatus = '存活' | '死亡';

type WorkbenchSurvivalStatusToggleProps = {
  value: WorkbenchSurvivalStatus;
  onChange: (value: WorkbenchSurvivalStatus) => void;
};

const SURVIVAL_STATUSES: WorkbenchSurvivalStatus[] = ['存活', '死亡'];

export function WorkbenchSurvivalStatusToggle({ value, onChange }: WorkbenchSurvivalStatusToggleProps) {
  return (
    <div
      aria-label="生存状态"
      className="flex h-[48px] w-[124px] shrink-0 items-center overflow-hidden rounded-xl border-2 border-slate-950 bg-white p-1"
      role="group"
    >
      {SURVIVAL_STATUSES.map((status) => {
        const active = value === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={`h-full min-w-0 flex-1 rounded-lg text-xs font-black transition-colors ${
              active ? 'bg-[#ECFEFF] text-slate-950' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
