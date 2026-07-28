import { Trash2 } from 'lucide-react';

type BrainstormRecycleButtonProps = {
  count: number;
  onClick: () => void;
};

export function BrainstormRecycleButton({ count, onClick }: BrainstormRecycleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-left shadow-sm transition-colors hover:border-red-200 hover:bg-red-100"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-red-500">
          <Trash2 className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-black text-slate-800">脑洞回收站</span>
      </span>
      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-red-400">
        {count}
      </span>
    </button>
  );
}
