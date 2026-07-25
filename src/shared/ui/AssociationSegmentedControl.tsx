import type { ReactNode } from 'react';

export type AssociationSegment = {
  id: string;
  label: ReactNode;
  active: boolean;
  onClick: () => void;
  minWidthClassName?: string;
  title?: string;
};

type AssociationSegmentedControlProps = {
  segments: AssociationSegment[];
  meta?: ReactNode;
  prefixLabel?: string;
  className?: string;
};

export function AssociationSegmentedControl({
  segments,
  meta,
  prefixLabel = '关联',
  className = 'xy-ai-panel-link-row flex min-w-0 items-center gap-2',
}: AssociationSegmentedControlProps) {
  return (
    <div className={className}>
      <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9] bg-white shadow-sm">
        <span className="grid w-12 shrink-0 place-items-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
          {prefixLabel}
        </span>
        {segments.map((segment, index) => (
          <button
            key={segment.id}
            type="button"
            onClick={segment.onClick}
            title={segment.title}
            className={`${segment.minWidthClassName ?? 'min-w-28'} whitespace-nowrap px-3 text-sm font-bold transition-colors ${
              index > 0 ? 'border-l border-[#08B3D9]/30' : ''
            } ${
              segment.active
                ? 'bg-[#08B3D9] font-black text-white hover:bg-[#079AB9]'
                : 'bg-white text-slate-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
            }`}
          >
            {segment.label}
          </button>
        ))}
      </div>
      {meta ? <span className="min-w-0 shrink text-sm font-bold text-slate-400">{meta}</span> : null}
    </div>
  );
}
