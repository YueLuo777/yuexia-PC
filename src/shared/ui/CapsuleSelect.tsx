import { Check, ChevronDown, FileText, ListTree } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export type CapsuleSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  variant?: 'group' | 'groupedOption';
  count?: number;
  metaLabel?: string;
};

type CapsuleSelectProps = {
  value: string;
  options: CapsuleSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
  title?: string;
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
  preserveOptionOrder?: boolean;
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
      connectedControlRadius: 'rounded-t-[22px] rounded-b-none',
      connectedDropdownRadius: 'rounded-b-[22px]',
    };
  }
  if (/\bh-\[42px\]\b/.test(buttonClassName)) {
    return {
      controlHeight: 'h-[42px]',
      controlRadius: 'rounded-[23px]',
      innerRadius: 'rounded-[21px]',
      actionRadius: 'rounded-r-[21px]',
      arrowWidth: 'w-6',
      actionWidth: 'w-10',
      actionPadding: 'pr-10',
      connectedControlRadius: 'rounded-t-[23px] rounded-b-none',
      connectedDropdownRadius: 'rounded-b-[23px]',
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
      connectedControlRadius: 'rounded-t-[26px] rounded-b-none',
      connectedDropdownRadius: 'rounded-b-[26px]',
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
      connectedControlRadius: 'rounded-t-[28px] rounded-b-none',
      connectedDropdownRadius: 'rounded-b-[28px]',
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
    connectedControlRadius: 'rounded-t-[24px] rounded-b-none',
    connectedDropdownRadius: 'rounded-b-[24px]',
  };
}

export function CapsuleSelect({
  value,
  options,
  onChange,
  disabled = false,
  disabledLabel,
  title,
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
  preserveOptionOrder = false,
}: CapsuleSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ left: 0, top: 0, width: 240, fixed: true });
  const current = options.find((option) => option.value === value);
  const displayedOption = current ?? options[0] ?? null;
  const displayedValue = displayedOption?.value ?? '';
  const displayLabel = disabled && disabledLabel ? disabledLabel : displayedOption?.label || placeholder;
  const visibleOptions = preserveOptionOrder
    ? options
    : displayedOption
      ? [displayedOption, ...options.filter((option) => option.value !== displayedOption.value)]
      : options;
  const hasInlineActions = Boolean(actionLabel);
  const hasDisableToggle = Boolean(onDisableToggle);
  const shouldRenderLocalDropdown = hasInlineActions || Boolean(floatingLabel);
  const inlineActionShape = getInlineActionShape(buttonClassName);
  const connectedDropdownOpen = open && !disabled && shouldRenderLocalDropdown;
  const disableToggleTitle = disableToggleLabel ?? (disableToggleActive ? '启用提示词' : '禁用提示词');

  const updateDropdownRect = () => {
    const rect = (controlRef.current ?? buttonRef.current)?.getBoundingClientRect();
    if (!rect) return;
    const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, rect.right + 8);
    const safeWidth = Math.max(rect.width, 1);
    const safeLeft = Math.min(Math.max(rect.left, 8), Math.max(8, viewportWidth - safeWidth - 8));
    setDropdownRect({
      left: safeLeft,
      top: rect.bottom,
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

  const dropdownMenu =
    open && !disabled ? (
      <div
        ref={dropdownRef}
        className={`${shouldRenderLocalDropdown ? `absolute left-0 right-0 top-[calc(100%-2px)] ${inlineActionShape.connectedDropdownRadius} border-2 border-t-0 border-[#08AACE] shadow-[0_18px_34px_rgba(8,170,206,0.14)]` : `${dropdownRect.fixed ? 'fixed' : 'absolute'} rounded-xl border border-slate-200 shadow-2xl`} z-[10050] max-h-[240px] overflow-y-auto bg-white py-1`}
        style={
          shouldRenderLocalDropdown
            ? undefined
            : {
                left: dropdownRect.left,
                top: dropdownRect.top,
                width: dropdownRect.width,
              }
        }
      >
        {visibleOptions.map((option) => {
          const selected = !option.disabled && displayedValue === option.value;
          const isGroup = option.variant === 'group';
          const isGroupedOption = option.variant === 'groupedOption';
          const hasMetaLabel = !isGroup && Boolean(option.metaLabel);
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
              className={
                isGroup
                  ? 'flex h-8 w-full cursor-default items-center gap-2 px-5 text-left text-xs font-black text-slate-500 disabled:cursor-default disabled:text-slate-500'
                  : `flex min-h-9 items-center justify-between gap-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-slate-300 ${
                      isGroupedOption
                        ? 'ml-6 w-[calc(100%-1.5rem)] border-l border-dashed border-slate-200 px-4'
                        : 'w-full px-5'
                    } ${
                      selected
                        ? 'bg-[#EAF9FD] font-black text-slate-900 hover:bg-[#EAF9FD]'
                        : 'bg-white font-bold text-slate-800 hover:bg-sky-50 hover:text-[#08AACE]'
                    }`
              }
            >
              {isGroup ? (
                <>
                  <ListTree className="h-3.5 w-3.5 shrink-0 text-[#08AACE]" />
                  <span className="min-w-0 truncate">{option.label}</span>
                  {typeof option.count === 'number' ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] leading-none text-slate-400">
                      {option.count}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="flex min-w-0 items-center gap-2">
                    {isGroupedOption ? <FileText className="h-4 w-4 shrink-0 text-slate-300" /> : null}
                    <span className="min-w-0 truncate">{option.label}</span>
                    {hasMetaLabel ? (
                      <span className="shrink-0 text-[11px] font-black text-slate-400">{option.metaLabel}</span>
                    ) : null}
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-[#08AACE]" />}
                </>
              )}
            </button>
          );
        })}
      </div>
    ) : null;
  const dropdown =
    dropdownMenu && shouldRenderLocalDropdown
      ? dropdownMenu
      : dropdownMenu
        ? createPortal(dropdownMenu, document.body)
        : null;

  if (hasInlineActions) {
    return (
      <div
        ref={rootRef}
        style={style}
        title={title}
        className={`relative min-w-0 ${floatingLabel ? 'pt-3' : ''} ${className}`}
      >
        <div
          ref={(element) => {
            controlRef.current = element;
          }}
          className={`relative min-w-0 border-2 bg-white p-0 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${inlineActionShape.controlHeight} ${inlineActionShape.controlRadius} ${
            disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE] text-slate-900'
          } ${connectedDropdownOpen ? `${inlineActionShape.connectedControlRadius} border-b-transparent` : ''}`}
        >
          {floatingLabel && (
            <span
              className={`xy-border-embedded-transparent-backplate pointer-events-none absolute left-5 top-0 z-20 max-w-[128px] -translate-y-1/2 text-[12px] font-black leading-none text-slate-800 ${disabled ? '[--xy-floating-backplate-bg:#f1f5f9]' : ''}`}
            >
              {floatingLabel}
            </span>
          )}
          <div
            className={`flex h-full min-w-0 overflow-hidden ${inlineActionShape.innerRadius} ${inlineActionShape.actionPadding}`}
          >
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
      <div ref={rootRef} style={style} title={title} className={`relative min-w-0 pt-3 ${className}`}>
        <div
          ref={(element) => {
            controlRef.current = element;
          }}
          data-capsule-control="true"
          className={`relative min-w-0 border-2 bg-white p-0 text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${inlineActionShape.controlHeight} ${inlineActionShape.controlRadius} ${
            disabled ? 'border-slate-200 bg-white text-slate-400' : 'border-[#08AACE]'
          } ${connectedDropdownOpen ? `${inlineActionShape.connectedControlRadius} border-b-transparent` : ''}`}
        >
          <span
            className="xy-border-embedded-transparent-backplate pointer-events-none absolute left-5 top-0 z-20 max-w-[128px] -translate-y-1/2 text-[12px] font-black leading-none text-slate-800"
          >
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
    <div ref={rootRef} style={style} title={title} className={`relative min-w-0 ${className}`}>
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
