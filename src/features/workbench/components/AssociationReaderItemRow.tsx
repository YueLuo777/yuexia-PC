import type { ReactNode } from 'react';

export const ASSOCIATION_READER_MODAL_WIDTH_CLASS = 'w-[1180px]';
export const ASSOCIATION_READER_MODAL_HEIGHT_CLASS = 'h-[min(760px,90vh)]';
export const ASSOCIATION_READER_GRID_CLASS = 'grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]';

type AssociationSelectionBoxProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
};

export function AssociationSelectionBox({ checked, label, onToggle }: AssociationSelectionBoxProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onToggle}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-[3px] border text-sm font-black transition-colors ${
        checked
          ? 'border-[#08AACE] bg-[#08AACE] text-white'
          : 'border-slate-300 bg-white text-transparent hover:border-[#08AACE] hover:text-[#08AACE]'
      }`}
    >
      ✓
    </button>
  );
}

type AssociationReaderItemRowProps = {
  title: string;
  selected: boolean;
  checked: boolean;
  meta?: ReactNode;
  onPreview: () => void;
  onToggle: () => void;
};

export function AssociationReaderItemRow({
  title,
  selected,
  checked,
  meta,
  onPreview,
  onToggle,
}: AssociationReaderItemRowProps) {
  return (
    <div
      className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-black transition-colors ${
        selected
          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
          : 'border-transparent bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
      }`}
    >
      <button type="button" onClick={onPreview} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {meta ? <span className="shrink-0 text-xs text-[#08AACE]">{meta}</span> : null}
      </button>
      <AssociationSelectionBox checked={checked} label={`${checked ? '取消选择' : '选择'}${title}`} onToggle={onToggle} />
    </div>
  );
}
