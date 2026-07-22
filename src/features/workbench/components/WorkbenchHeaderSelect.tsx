import { ChevronDown } from 'lucide-react';

type WorkbenchHeaderSelectProps = {
  label: string;
  ariaLabel?: string;
  value: string;
  options: string[];
  width: number;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function WorkbenchHeaderSelect({
  label,
  ariaLabel = label,
  value,
  options,
  width,
  disabled = false,
  onChange,
}: WorkbenchHeaderSelectProps) {
  return (
    <div
      className="relative flex h-[48px] shrink-0 items-center rounded-xl border-2 border-slate-950 bg-white"
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <span className="xy-border-embedded-transparent-backplate absolute left-4 top-0 z-10 -translate-y-1/2 text-sm font-medium leading-5 text-slate-950">
        {label}
      </span>
      <select
        data-no-modal-drag="true"
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent px-4 pr-10 text-base font-medium leading-6 text-slate-950 outline-none disabled:cursor-not-allowed disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 h-4 w-4 text-slate-950" />
    </div>
  );
}
