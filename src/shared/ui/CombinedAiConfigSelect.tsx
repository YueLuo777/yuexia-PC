import { Check, ChevronDown, Settings } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';

import type { CapsuleSelectOption } from '@/shared/ui/CapsuleSelect';

type CombinedAiConfigSelectProps = {
  modelLabel?: string;
  promptLabel?: string;
  modelValue: string;
  promptValue: string;
  modelOptions: CapsuleSelectOption[];
  promptOptions: CapsuleSelectOption[];
  onModelChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onModelManage: () => void;
  onPromptManage: () => void;
  promptDisabled?: boolean;
  promptDisabledLabel?: string;
  onPromptContextMenu?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: CSSProperties;
};

type OpenSegment = 'model' | 'prompt' | null;
type HoverTooltip = { text: string; x: number; y: number } | null;

function getDisplayOption(value: string, options: CapsuleSelectOption[]) {
  return options.find((option) => option.value === value) ?? options[0] ?? null;
}

function getDisplayLabel(value: string, options: CapsuleSelectOption[], placeholder: string) {
  return getDisplayOption(value, options)?.label || placeholder;
}

export function CombinedAiConfigSelect({
  modelLabel = '模型',
  promptLabel = '提示词',
  modelValue,
  promptValue,
  modelOptions,
  promptOptions,
  onModelChange,
  onPromptChange,
  onModelManage,
  onPromptManage,
  promptDisabled = false,
  promptDisabledLabel = '提示词已禁用',
  onPromptContextMenu,
  className = '',
  style,
}: CombinedAiConfigSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipTimerRef = useRef<number | null>(null);
  const [openSegment, setOpenSegment] = useState<OpenSegment>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip>(null);
  const activeOptions = openSegment === 'model' ? modelOptions : promptOptions;
  const activeValue = openSegment === 'model' ? modelValue : promptValue;
  const activeDisplayValue = getDisplayOption(activeValue, activeOptions)?.value ?? '';
  const modelDisplay = getDisplayLabel(modelValue, modelOptions, '暂无可用模型');
  const promptDisplay = promptDisabled ? promptDisabledLabel : getDisplayLabel(promptValue, promptOptions, `暂无${promptLabel}`);
  const isModelOpen = openSegment === 'model';
  const isPromptOpen = openSegment === 'prompt' && !promptDisabled;

  useEffect(() => {
    if (!openSegment) return;
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpenSegment(null);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [openSegment]);

  useEffect(() => () => {
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
    }
  }, []);

  const hideHoverTooltip = () => {
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setHoverTooltip(null);
  };

  const scheduleHoverTooltip = (event: ReactMouseEvent<HTMLElement>, text: string) => {
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    tooltipTimerRef.current = window.setTimeout(() => {
      setHoverTooltip({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
      tooltipTimerRef.current = null;
    }, 120);
  };

  const renderDropdown = () => {
    if (!openSegment || (openSegment === 'prompt' && promptDisabled)) return null;
    return (
      <div
        className={`absolute top-[calc(100%-2px)] z-[10050] max-h-[240px] overflow-y-auto border-2 border-t-0 border-[#08AACE] bg-white py-1 shadow-[0_18px_34px_rgba(8,170,206,0.14)] ${
          openSegment === 'model' ? 'left-0 w-1/2 rounded-bl-xl rounded-br-none' : 'right-0 w-1/2 rounded-bl-none rounded-br-xl'
        }`}
      >
        {activeOptions.map((option) => {
          const selected = !option.disabled && option.value === activeDisplayValue;
          return (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (option.disabled) return;
                if (openSegment === 'model') onModelChange(option.value);
                else onPromptChange(option.value);
                setOpenSegment(null);
              }}
              className={`flex h-9 w-full items-center justify-between gap-3 px-4 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-slate-300 ${
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
    );
  };

  return (
    <div ref={rootRef} style={style} className={`relative min-w-0 pt-3 ${className}`}>
      <div className="grid h-11 min-w-0 grid-cols-2 overflow-visible rounded-xl border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
        <div className="relative min-w-0 border-r border-[#08AACE]/25">
          <button
            type="button"
            aria-label={modelDisplay}
            onMouseEnter={(event) => scheduleHoverTooltip(event, modelDisplay)}
            onMouseLeave={hideHoverTooltip}
            onBlur={hideHoverTooltip}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              hideHoverTooltip();
              setOpenSegment((current) => (current === 'model' ? null : 'model'));
            }}
            className={`grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center text-left transition-colors hover:bg-[#EAF9FD] ${
              isModelOpen ? 'rounded-tl-[10px] rounded-bl-none' : 'rounded-l-[10px]'
            }`}
          >
            <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-800">{modelDisplay}</span>
            <ChevronDown className={`h-4 w-4 text-[#08AACE] transition-transform ${openSegment === 'model' ? 'rotate-180' : ''}`} />
          </button>
          <span className="xy-combined-ai-config-label xy-border-embedded-transparent-backplate absolute left-3 top-0 z-10 -translate-y-1/2 font-black leading-none text-[#08AACE]">
            {modelLabel}
          </span>
          <button
            type="button"
            aria-label={`${modelLabel}管理`}
            title={`${modelLabel}管理`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onModelManage();
            }}
            className="xy-combined-ai-config-manage xy-border-embedded-transparent-backplate absolute right-7 top-0 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[#08AACE] hover:text-[#057F9B]"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative min-w-0" onContextMenu={onPromptContextMenu}>
          <button
            type="button"
            aria-label={promptDisplay}
            onMouseEnter={(event) => scheduleHoverTooltip(event, promptDisplay)}
            onMouseLeave={hideHoverTooltip}
            onBlur={hideHoverTooltip}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              hideHoverTooltip();
              if (promptDisabled) return;
              setOpenSegment((current) => (current === 'prompt' ? null : 'prompt'));
            }}
            className={`grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center text-left transition-colors ${
              isPromptOpen ? 'rounded-tr-[10px] rounded-br-none' : 'rounded-r-[10px]'
            } ${
              promptDisabled ? 'cursor-default bg-slate-50 text-slate-400' : 'hover:bg-[#EAF9FD]'
            }`}
          >
            <span className={`min-w-0 truncate pl-4 pr-1 text-sm font-black ${promptDisabled ? 'text-slate-400' : 'text-slate-800'}`}>{promptDisplay}</span>
            <ChevronDown className={`h-4 w-4 text-[#08AACE] transition-transform ${openSegment === 'prompt' ? 'rotate-180' : ''}`} />
          </button>
          <span className="xy-combined-ai-config-label xy-border-embedded-transparent-backplate absolute left-3 top-0 z-10 -translate-y-1/2 font-black leading-none text-[#08AACE]">
            {promptLabel}
          </span>
          <button
            type="button"
            aria-label={`${promptLabel}管理`}
            title={`${promptLabel}管理`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPromptManage();
            }}
            className="xy-combined-ai-config-manage xy-border-embedded-transparent-backplate absolute right-7 top-0 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[#08AACE] hover:text-[#057F9B]"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {renderDropdown()}
      {hoverTooltip ? createPortal(
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[10060] -translate-x-1/2 -translate-y-full rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg"
          style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
        >
          {hoverTooltip.text}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
