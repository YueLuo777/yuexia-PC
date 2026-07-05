import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type CapsuleActionVariant = 'default' | 'active' | 'danger';

export type CapsuleActionItem = {
  id: string;
  label: ReactNode;
  variant?: CapsuleActionVariant;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

interface CapsuleActionGroupProps {
  items: CapsuleActionItem[];
  className?: string;
}

const variantClass: Record<CapsuleActionVariant, string> = {
  default: 'text-slate-700 hover:bg-[#EAF9FD] hover:text-[#078fb0]',
  active: 'bg-[#EAF9FD] text-[#078fb0] hover:bg-[#DDF5FA]',
  danger: 'text-red-500 hover:bg-red-50 hover:text-red-600',
};

export function CapsuleActionGroup({ items, className = '' }: CapsuleActionGroupProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item, index) => {
          const { label, variant = 'default', className: itemClassName = '', type = 'button', ...buttonProps } = item;
          return (
            <button
              type={type}
              className={[
                'h-8 min-w-0 truncate px-2 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300',
                index > 0 ? 'border-l border-slate-200' : '',
                variantClass[variant],
                itemClassName,
              ].filter(Boolean).join(' ')}
              {...buttonProps}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
