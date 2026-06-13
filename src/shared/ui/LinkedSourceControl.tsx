import { X } from 'lucide-react';
import { type ReactNode } from 'react';

type LinkedSourceControlProps = {
  linked: boolean;
  label: string;
  linkedLabel?: string;
  onOpen: () => void;
  onClear?: () => void;
  clearOnLinkedClick?: boolean;
  meta?: ReactNode;
  title?: string;
  className?: string;
  groupClassName?: string;
  buttonClassName?: string;
  linkedButtonClassName?: string;
  clearButtonClassName?: string;
  metaClassName?: string;
};

export function LinkedSourceControl({
  linked,
  label,
  linkedLabel = '已关联',
  onOpen,
  onClear,
  clearOnLinkedClick = false,
  meta,
  title,
  className = 'flex items-center gap-2',
  groupClassName = 'flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white',
  buttonClassName = 'h-10 min-w-[92px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]',
  linkedButtonClassName = 'min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold text-gray-700 hover:bg-gray-100',
  clearButtonClassName = 'flex h-full w-10 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600',
  metaClassName = 'text-xs font-black leading-5 text-[#08AACE]',
}: LinkedSourceControlProps) {
  const handleLinkedClick = clearOnLinkedClick && onClear ? onClear : onOpen;

  return (
    <div className={className}>
      {linked ? (
        <div className={groupClassName}>
          <button
            type="button"
            onClick={handleLinkedClick}
            className={linkedButtonClassName}
            title={title}
          >
            {linkedLabel}
          </button>
          {onClear && !clearOnLinkedClick && (
            <button
              type="button"
              onClick={onClear}
              className={clearButtonClassName}
              title="取消关联"
              aria-label="取消关联"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className={buttonClassName}
          title={title}
        >
          {label}
        </button>
      )}
      {linked && meta ? <div className={metaClassName}>{meta}</div> : null}
    </div>
  );
}
