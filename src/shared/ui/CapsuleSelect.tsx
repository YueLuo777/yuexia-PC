import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type CapsuleSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function CapsuleSelect({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = '请选择',
  className = '',
  buttonClassName = '',
}: {
  value: string;
  options: CapsuleSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ left: 0, top: 0, width: 240 });
  const current = options.find((option) => option.value === value);
  const displayLabel = current?.label || options[0]?.label || placeholder;

  const updateDropdownRect = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropdownRect({
      left: rect.left,
      top: rect.bottom + 6,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownRect();
  }, [open, value, options.length]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    const update = () => updateDropdownRect();
    window.addEventListener('mousedown', close);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((currentOpen) => !currentOpen);
        }}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#08AACE] bg-white px-5 text-left text-base font-black text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${buttonClassName}`}
      >
        <span className="min-w-0 truncate">{displayLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-800 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[10050] max-h-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl"
          style={{
            left: dropdownRect.left,
            top: dropdownRect.top,
            width: dropdownRect.width,
          }}
        >
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-9 w-full items-center justify-between gap-3 px-5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-slate-300 ${
                  selected
                    ? 'bg-[#1f6ed4] font-black text-white'
                    : 'bg-white font-bold text-slate-800 hover:bg-sky-50 hover:text-[#08AACE]'
                }`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
