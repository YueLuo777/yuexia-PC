import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type CapsuleSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type CapsuleSelectProps = {
  value: string;
  options: CapsuleSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  floatingLabel?: string;
};

export function CapsuleSelect({
  value,
  options,
  onChange,
  disabled = false,
  disabledLabel,
  placeholder = '请选择',
  className = '',
  buttonClassName = '',
  actionLabel,
  onActionClick,
  floatingLabel,
}: CapsuleSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ left: 0, top: 0, width: 240, fixed: true });
  const current = options.find((option) => option.value === value);
  const displayLabel = disabled && disabledLabel ? disabledLabel : current?.label || options[0]?.label || placeholder;
  const visibleOptions = current ? [current, ...options.filter((option) => option.value !== current.value)] : options;
  const hasInlineActions = Boolean(actionLabel);

  const updateDropdownRect = () => {
    const rect = (controlRef.current ?? buttonRef.current)?.getBoundingClientRect();
    if (!rect) return;
    const viewportWidth = Math.max(
      window.innerWidth || 0,
      document.documentElement.clientWidth || 0,
      rect.right + 8,
    );
    const safeWidth = Math.max(rect.width, 1);
    const safeLeft = Math.min(
      Math.max(rect.left, 8),
      Math.max(8, viewportWidth - safeWidth - 8),
    );
    setDropdownRect({
      left: safeLeft,
      top: rect.bottom + 6,
      width: safeWidth,
      fixed: true,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownRect();
    const frameId = window.requestAnimationFrame(updateDropdownRect);
    return () => window.cancelAnimationFrame(frameId);
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

  const toggleOpen = (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault();
    event.stopPropagation();
    updateDropdownRect();
    setOpen((currentOpen) => !currentOpen);
  };

  const dropdownMenu = open && !disabled ? (
    <div
      ref={dropdownRef}
      className={`${hasInlineActions ? 'absolute left-0 right-0 top-[calc(100%+6px)]' : dropdownRect.fixed ? 'fixed' : 'absolute'} z-[10050] max-h-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl`}
      style={hasInlineActions ? undefined : {
        left: dropdownRect.left,
        top: dropdownRect.top,
        width: dropdownRect.width,
      }}
    >
      {visibleOptions.map((option) => {
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
                ? 'bg-[#EAF9FD] font-black text-slate-900 hover:bg-[#EAF9FD]'
                : 'bg-white font-bold text-slate-800 hover:bg-sky-50 hover:text-[#08AACE]'
            }`}
          >
            <span className="min-w-0 truncate">{option.label}</span>
            {selected && <Check className="h-4 w-4 shrink-0 text-[#08AACE]" />}
          </button>
        );
      })}
    </div>
  ) : null;
  const dropdown = dropdownMenu && hasInlineActions ? dropdownMenu : dropdownMenu ? createPortal(dropdownMenu, document.body) : null;

  if (hasInlineActions) {
    return (
      <div ref={rootRef} className={`relative min-w-0 ${floatingLabel ? 'pt-2' : ''} ${className}`}>
        <div
          ref={(element) => {
            controlRef.current = element;
          }}
          className={`relative h-12 min-w-0 rounded-[28px] border-2 bg-white p-0 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${
            disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE] text-slate-900'
          }`}
        >
          {floatingLabel && (
            <span className="pointer-events-none absolute left-9 top-0 z-20 max-w-[128px] -translate-y-1/2 bg-white px-1 text-sm font-black leading-none text-slate-800">
              {floatingLabel}
            </span>
          )}
          <div className="flex h-full min-w-0 overflow-hidden rounded-[26px] pr-12">
            <button
              ref={buttonRef}
              id={id}
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className={`min-w-0 flex-1 text-left text-base font-black transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:text-slate-400 ${buttonClassName} !h-full !rounded-none !py-0 ${floatingLabel ? '!pl-9 !pr-3' : '!px-4'}`}
            >
              <span className="block truncate">{displayLabel}</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className="grid h-full w-10 shrink-0 place-items-center bg-transparent text-slate-700 transition-colors hover:bg-transparent hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label="展开选项"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onActionClick?.();
              }}
              className="absolute inset-y-0 right-0 z-10 grid w-12 place-items-center rounded-r-[26px] border-l border-[#bfeef8] bg-[#EAF9FD] text-[13px] font-black text-[#078fb0] transition-colors hover:bg-[#08AACE] hover:text-white"
            >
              {actionLabel}
            </button>
          </div>
        </div>
        {dropdown}
      </div>
    );
  }

  if (floatingLabel) {
    return (
      <div ref={rootRef} className={`relative min-w-0 ${className}`}>
        <fieldset
          ref={(element) => {
            controlRef.current = element;
          }}
          className="min-w-0 overflow-hidden rounded-[28px] border-2 border-[#08AACE] bg-white p-0 text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <legend className="ml-9 max-w-[128px] px-1 text-sm font-black leading-none text-slate-800">
            {floatingLabel}
          </legend>
          <button
            ref={buttonRef}
            id={id}
            type="button"
            disabled={disabled}
            onClick={toggleOpen}
            className={`flex h-12 w-full items-center justify-between gap-3 bg-white text-left text-base font-black text-slate-900 transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${buttonClassName} !h-12 !rounded-none !py-0 !pl-9 !pr-4`}
          >
            <span className="min-w-0 truncate">{displayLabel}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-800 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </fieldset>
        {dropdown}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#08AACE] bg-white px-5 text-left text-base font-black text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${buttonClassName}`}
      >
        <span className="min-w-0 truncate">{displayLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-800 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {dropdown}
    </div>
  );
}
