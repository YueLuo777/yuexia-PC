import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 px-5 py-6 text-center ${className}`}
    >
      <div className="text-sm font-bold text-slate-500">{title}</div>
      {description ? <div className="mt-2 text-xs font-medium leading-5 text-slate-400">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
