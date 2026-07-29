import { useState, type ReactNode } from 'react';

import type { DiyLevel, TemplateDiyController } from '@/features/templates/hooks/useTemplateDiyController';

export const DIY_LEVEL_META: Record<DiyLevel, { short: string; title: string; placeholder: string }> = {
  domain: { short: '一级', title: '设定分类', placeholder: '输入一级分类名称' },
  group: { short: '二级', title: '所属分组', placeholder: '输入二级分组名称' },
  entry: { short: '三级', title: '设定条目', placeholder: '输入三级设定名称' },
  field: { short: '四级', title: '设定字段', placeholder: '输入四级设定名称' },
};

export function DiyLockButton({
  level,
  locked,
  onToggle,
}: {
  level: DiyLevel;
  locked: boolean;
  onToggle: () => void;
}) {
  const label = DIY_LEVEL_META[level].short;
  return (
    <button
      type="button"
      aria-label={`${label}删除${locked ? '已锁定，点击解锁' : '未锁定，点击锁定'}`}
      aria-pressed={locked}
      onClick={onToggle}
      className={`h-7 shrink-0 rounded-md border px-2.5 text-[11px] font-black ${
        locked
          ? 'border-[#9DDFEA] bg-[#EAF9FD] text-[#078FAB] hover:bg-[#D9F4F9]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]'
      }`}
    >
      {locked ? '已锁定' : '锁定'}
    </button>
  );
}

export function DiyDeleteButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="h-7 shrink-0 rounded px-2 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
    >
      删除
    </button>
  );
}

export function DiyAddRow({
  level,
  disabled = false,
  onAdd,
  compact = false,
}: {
  level: DiyLevel;
  disabled?: boolean;
  onAdd: (value: string) => boolean;
  compact?: boolean;
}) {
  const [value, setValue] = useState('');
  const add = () => {
    if (onAdd(value)) setValue('');
  };
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'border-t border-slate-200 bg-[#FBFCFD] p-2'}`}>
      <input
        value={value}
        disabled={disabled}
        aria-label={DIY_LEVEL_META[level].placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') add();
        }}
        placeholder={DIY_LEVEL_META[level].placeholder}
        className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold outline-none placeholder:text-slate-400 focus:border-[#08AACE] disabled:bg-slate-100"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={add}
        className="h-9 shrink-0 rounded-md bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#0798B8] disabled:bg-slate-200 disabled:text-slate-400"
      >
        新增
      </button>
    </div>
  );
}

export function DiyLevelHeading({
  level,
  title,
  controller,
  className = '',
}: {
  level: DiyLevel;
  title: string;
  controller: TemplateDiyController;
  className?: string;
}) {
  const meta = DIY_LEVEL_META[level];
  return (
    <div className={`flex h-12 items-center gap-2 border-b border-slate-200 bg-[#F8FBFC] px-3 ${className}`}>
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-600">{meta.short}</span>
      <strong className="min-w-0 truncate text-sm font-black text-slate-700">{title}</strong>
      <DiyLockButton
        level={level}
        locked={controller.lockedLevels[level]}
        onToggle={() => controller.toggleLevelLock(level, meta.title)}
      />
    </div>
  );
}

export function DiyEmptyState({ children }: { children: ReactNode }) {
  return <div className="flex min-h-28 items-center justify-center px-4 text-center text-xs font-bold text-slate-400">{children}</div>;
}
