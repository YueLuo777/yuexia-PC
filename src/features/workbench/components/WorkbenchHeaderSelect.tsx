import { ChevronDown } from 'lucide-react';

type WorkbenchHeaderSelectProps = {
  label: string;
  ariaLabel?: string;
  value: string;
  options: string[];
  width: number;
  disabled?: boolean;
  title?: string;
  onChange: (value: string) => void;
};

export function WorkbenchHeaderSelect({
  label,
  ariaLabel = label,
  value,
  options,
  width,
  disabled = false,
  title,
  onChange,
}: WorkbenchHeaderSelectProps) {
  return (
    <div
      data-workbench-header-control="true"
      title={title}
      className="relative flex h-[48px] shrink-0 items-center rounded-xl border-2 border-slate-950 bg-white"
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <span className="xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 -translate-y-1/2 text-base font-black leading-6 text-slate-950">
        {label}
      </span>
      <select
        data-no-modal-drag="true"
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        title={title}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-x-0 bottom-0 h-9 w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent px-6 pb-0 pr-12 text-base font-medium leading-[34px] text-slate-950 outline-none disabled:cursor-not-allowed disabled:text-slate-950 disabled:opacity-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-6 h-4 w-4 text-slate-950" />
    </div>
  );
}
