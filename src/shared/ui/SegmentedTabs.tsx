import type { ReactNode } from 'react';

interface SegmentedTabsProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
  getLabel?: (tab: T) => ReactNode;
  className?: string;
  buttonClassName?: string;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  getLabel,
  className = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white',
  buttonClassName = 'min-w-[96px] px-4 text-sm font-black transition-colors',
}: SegmentedTabsProps<T>) {
  return (
    <div className={className}>
      {tabs.map((tab, index) => {
        const active = activeTab === tab;
        const borderClassName = index === 0 ? '' : 'border-l border-gray-200';
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`${buttonClassName} ${borderClassName} ${
              active
                ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'
            }`}
          >
            {getLabel ? getLabel(tab) : tab}
          </button>
        );
      })}
    </div>
  );
}
