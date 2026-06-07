type WordCountTextProps = {
  value: number | string;
  unit?: string;
  className?: string;
  numberClassName?: string;
  unitClassName?: string;
  compact?: boolean;
};

export function WordCountText({
  value,
  unit = '字',
  className = '',
  numberClassName = 'text-brand',
  unitClassName = 'text-slate-400',
  compact = false,
}: WordCountTextProps) {
  return (
    <span className={className}>
      <span className={numberClassName}>{value}</span>
      <span className={unitClassName}>{compact ? ` ${unit}` : ` ${unit}`}</span>
    </span>
  );
}
