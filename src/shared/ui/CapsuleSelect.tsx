import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
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
  style?: CSSProperties;
  buttonClassName?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  floatingLabel?: string;
  disableToggleActive?: boolean;
  onDisableToggle?: () => void;
  disableToggleLabel?: string;
};

function getInlineActionShape(buttonClassName: string) {
  if (/\bh-9\b/.test(buttonClassName)) {
    return {
      controlHeight: 'h-9',
      controlRadius: 'rounded-[22px]',
      innerRadius: 'rounded-[20px]',
      actionRadius: 'rounded-r-[20px]',
      arrowWidth: 'w-6',
      actionWidth: 'w-10',
      actionPadding: 'pr-10',
    };
  }
  if (/\bh-11\b/.test(buttonClassName)) {
    return {
      controlHeight: 'h-11',
      controlRadius: 'rounded-[26px]',
      innerRadius: 'rounded-[24px]',
      actionRadius: 'rounded-r-[24px]',
      arrowWidth: 'w-6',
      actionWidth: 'w-11',
      actionPadding: 'pr-11',
    };
  }
  if (/\bh-12\b/.test(buttonClassName)) {
    return {
      controlHeight: 'h-12',
      controlRadius: 'rounded-[28px]',
      innerRadius: 'rounded-[26px]',
      actionRadius: 'rounded-r-[26px]',
      arrowWidth: 'w-7',
      actionWidth: 'w-11',
      actionPadding: 'pr-11',
    };
  }
  return {
    controlHeight: 'h-10',
    controlRadius: 'rounded-[24px]',
    innerRadius: 'rounded-[22px]',
    actionRadius: 'rounded-r-[22px]',
    arrowWidth: 'w-6',
    actionWidth: 'w-10',
    actionPadding: 'pr-10',
  };
}

export function CapsuleSelect({
  value,
  options,
  onChange,
  disabled = false,
  disabledLabel,
  placeholder = '请选择',
  className = '',
  style,
  buttonClassName = '',
  actionLabel,
  onActionClick,
  floatingLabel,
  disableToggleActive = false,
  onDisableToggle,
  disableToggleLabel,
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
  const hasDisableToggle = Boolean(onDisableToggle);
  const shouldRenderLocalDropdown = hasInlineActions || Boolean(floatingLabel);
  const inlineActionShape = getInlineActionShape(buttonClassName);
  const disableToggleTitle = disableToggleLabel ?? (disableToggleActive ? '启用提示词' : '禁用提示词');

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
      className={`${shouldRenderLocalDropdown ? 'absolute left-0 right-0 top-[calc(100%+6px)]' : dropdownRect.fixed ? 'fixed' : 'absolute'} z-[10050] max-h-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl`}
      style={shouldRenderLocalDropdown ? undefined : {
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
  const dropdown = dropdownMenu && shouldRenderLocalDropdown ? dropdownMenu : dropdownMenu ? createPortal(dropdownMenu, document.body) : null;

  if (hasInlineActions) {
    return (
      <div ref={rootRef} style={style} className={`relative min-w-0 ${floatingLabel ? 'pt-3' : ''} ${className}`}>
        <div
          ref={(element) => {
            controlRef.current = element;
          }}
          className={`relative min-w-0 border-2 bg-white p-0 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${inlineActionShape.controlHeight} ${inlineActionShape.controlRadius} ${
            disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE] text-slate-900'
          }`}
        >
          {floatingLabel && (
            <span className={`pointer-events-none absolute left-5 top-0 z-20 max-w-[128px] -translate-y-1/2 px-1 text-[12px] font-black leading-none text-slate-800 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
              {floatingLabel}
            </span>
          )}
          <div className={`flex h-full min-w-0 overflow-hidden ${inlineActionShape.innerRadius} ${inlineActionShape.actionPadding}`}>
            <button
              ref={buttonRef}
              id={id}
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className={`flex min-w-0 flex-1 items-center text-left text-sm font-black leading-none transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:text-slate-400 ${buttonClassName} !h-full !rounded-none !py-0 ${floatingLabel ? '!pl-6 !pr-1' : '!px-4'}`}
            >
              <span className="block min-w-0 flex-1 truncate">{displayLabel}</span>
            </button>
            {hasDisableToggle && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDisableToggle?.();
                }}
                className="grid h-full w-9 shrink-0 place-items-center bg-transparent text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title={disableToggleTitle}
                aria-label={disableToggleTitle}
                aria-pressed={disableToggleActive}
              >
                <span className="relative h-[22px] w-[22px] rounded-full border-[2.4px] border-current">
                  <span className="absolute left-1/2 top-1/2 h-[1.6px] w-[13px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-full bg-current" />
                </span>
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className={`grid h-full shrink-0 place-items-center bg-transparent text-slate-700 transition-colors hover:bg-transparent hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300 ${inlineActionShape.arrowWidth}`}
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
              className={`absolute inset-y-0 right-0 z-10 grid place-items-center bg-[#EAF9FD] text-[12px] font-black text-[#078fb0] transition-colors hover:bg-[#d9f3fa] hover:text-[#056b84] ${inlineActionShape.actionWidth} ${inlineActionShape.actionRadius}`}
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
      <div ref={rootRef} style={style} className={`relative min-w-0 pt-3 ${className}`}>
        <div
          ref={(element) => {
            controlRef.current = element;
          }}
          data-capsule-control="true"
          className={`relative min-w-0 border-2 bg-white p-0 text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${inlineActionShape.controlHeight} ${inlineActionShape.controlRadius} ${
            disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE]'
          }`}
        >
          <span className={`pointer-events-none absolute left-5 top-0 z-20 max-w-[128px] -translate-y-1/2 px-1 text-[12px] font-black leading-none text-slate-800 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
            {floatingLabel}
          </span>
          <div className="flex h-full min-w-0 overflow-hidden rounded-[inherit]">
            <button
              ref={buttonRef}
              id={id}
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className={`flex h-full min-w-0 flex-1 items-center bg-transparent text-left text-sm font-black leading-none text-slate-900 transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:text-slate-400 ${buttonClassName} !h-full !rounded-none !py-0 !pl-6 !pr-1`}
            >
              <span className="block min-w-0 flex-1 truncate">{displayLabel}</span>
            </button>
            {hasDisableToggle && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDisableToggle?.();
                }}
                className="grid h-full w-9 shrink-0 place-items-center bg-transparent text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title={disableToggleTitle}
                aria-label={disableToggleTitle}
                aria-pressed={disableToggleActive}
              >
                <span className="relative h-[22px] w-[22px] rounded-full border-[2.4px] border-current">
                  <span className="absolute left-1/2 top-1/2 h-[1.6px] w-[13px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-full bg-current" />
                </span>
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={toggleOpen}
              className="grid h-full w-9 shrink-0 place-items-center bg-transparent text-slate-700 transition-colors hover:bg-transparent hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label="展开选项"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {dropdown}
      </div>
    );
  }

  return (
    <div ref={rootRef} style={style} className={`relative min-w-0 ${className}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#08AACE] bg-white px-5 text-left text-base font-black text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] transition-colors hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${buttonClassName}`}
      >
        <span className="block min-w-0 flex-1 truncate">{displayLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-800 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {dropdown}
    </div>
  );
}
