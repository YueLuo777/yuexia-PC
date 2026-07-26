import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import {
  WORKBENCH_AI_THINKING_BODY_CLASS,
  WORKBENCH_AI_THINKING_HEADER_CLASS,
  WORKBENCH_AI_THINKING_ICON_CLASS,
  WORKBENCH_AI_THINKING_SURFACE_CLASS,
  WORKBENCH_AI_THINKING_TITLE_CLASS,
} from './workbenchAiThinkingStyles';

type WorkbenchAiThinkingShellProps = {
  label: string;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: LucideIcon;
  iconClassName?: string;
};

export function WorkbenchAiThinkingShell({
  label,
  children,
  className = '',
  bodyClassName = '',
  defaultOpen = true,
  open,
  onOpenChange,
  icon: LeadingIcon,
  iconClassName = '',
}: WorkbenchAiThinkingShellProps) {
  const hasBody = children !== undefined && children !== null && children !== false;
  const [expanded, setExpanded] = useState(open ?? defaultOpen);

  useEffect(() => {
    if (open !== undefined) setExpanded(open);
  }, [open]);

  if (!hasBody) {
    return (
      <div className={`${WORKBENCH_AI_THINKING_SURFACE_CLASS} ${className}`.trim()}>
        <div className={WORKBENCH_AI_THINKING_HEADER_CLASS}>
          {LeadingIcon ? (
            <LeadingIcon className={`h-4 w-4 ${WORKBENCH_AI_THINKING_ICON_CLASS} ${iconClassName}`.trim()} />
          ) : null}
          <span className={`truncate text-sm ${WORKBENCH_AI_THINKING_TITLE_CLASS}`}>{label}</span>
        </div>
      </div>
    );
  }

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    onOpenChange?.(next);
  };

  return (
    <div className={`${WORKBENCH_AI_THINKING_SURFACE_CLASS} ${className}`.trim()}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={toggleExpanded}
        className={`${WORKBENCH_AI_THINKING_HEADER_CLASS} w-full cursor-pointer text-left ${WORKBENCH_AI_THINKING_TITLE_CLASS}`}
      >
        {LeadingIcon ? (
          <LeadingIcon className={`h-4 w-4 ${WORKBENCH_AI_THINKING_ICON_CLASS} ${iconClassName}`.trim()} />
        ) : expanded ? (
          <ChevronDown className={`h-4 w-4 shrink-0 ${WORKBENCH_AI_THINKING_ICON_CLASS}`} />
        ) : (
          <ChevronRight className={`h-4 w-4 shrink-0 ${WORKBENCH_AI_THINKING_ICON_CLASS}`} />
        )}
        <span className="truncate text-sm">{label}</span>
      </button>
      {expanded ? (
        <div className={`${WORKBENCH_AI_THINKING_BODY_CLASS} ${bodyClassName}`.trim()}>{children}</div>
      ) : null}
    </div>
  );
}
