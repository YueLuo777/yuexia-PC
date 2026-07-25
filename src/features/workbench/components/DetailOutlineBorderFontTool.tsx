import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

import { DETAIL_OUTLINE_MAX_FONT_SIZE, DETAIL_OUTLINE_MIN_FONT_SIZE } from './workbenchBrainstormState';

type DetailOutlineBorderFontToolProps = {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
};

export function DetailOutlineTitleWordCount({ value }: { value: number }) {
  return (
    <span className="xy-detail-outline-title-word-count whitespace-nowrap">
      <span className="text-brand">{value}</span>
      <span className="text-slate-400">字</span>
    </span>
  );
}

export function DetailOutlineBorderFontTool({ value, onChange, ariaLabel }: DetailOutlineBorderFontToolProps) {
  return (
    <div className="xy-detail-outline-border-font-tool xy-border-embedded-transparent-backplate absolute right-9 top-1 z-[60] -translate-y-1/2">
      <FontSizeStepper
        value={value}
        min={DETAIL_OUTLINE_MIN_FONT_SIZE}
        max={DETAIL_OUTLINE_MAX_FONT_SIZE}
        onChange={onChange}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
