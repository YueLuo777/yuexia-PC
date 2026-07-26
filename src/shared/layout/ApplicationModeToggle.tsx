import { useApplicationMode, writeApplicationMode } from '@/shared/mode/applicationMode';

export function ApplicationModeToggle() {
  const mode = useApplicationMode();
  const nextMode = mode === 'professional' ? 'standard' : 'professional';
  const label = mode === 'professional' ? '进入标准模式' : '进入专业模式';

  return (
    <button
      type="button"
      onClick={() => writeApplicationMode(nextMode)}
      className="h-8 shrink-0 rounded-md border border-[#9DDFEA] bg-white px-3 text-sm font-semibold text-[#078FAB] transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD]"
      title={label}
      aria-label={label}
    >
      {label}
    </button>
  );
}

