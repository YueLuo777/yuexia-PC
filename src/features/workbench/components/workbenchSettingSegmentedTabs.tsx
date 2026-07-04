const SETTING_SEGMENTED_TAB_GROUP_CLASS = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white';
const SETTING_SEGMENTED_TAB_BUTTON_CLASS = 'min-w-[96px] px-4 text-sm font-black transition-colors';
const SETTING_SEGMENTED_TAB_ACTIVE_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]';
const SETTING_SEGMENTED_TAB_IDLE_CLASS = 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]';

type SettingSegmentedTabsProps<T extends string> = {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function SettingSegmentedTabs<T extends string>({ tabs, activeTab, onChange }: SettingSegmentedTabsProps<T>) {
  return (
    <div className={SETTING_SEGMENTED_TAB_GROUP_CLASS}>
      {tabs.map((tab, index) => {
        const active = activeTab === tab;
        const borderClassName = index === 0 ? '' : 'border-l border-gray-200';
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`${SETTING_SEGMENTED_TAB_BUTTON_CLASS} ${borderClassName} ${
              active ? SETTING_SEGMENTED_TAB_ACTIVE_CLASS : SETTING_SEGMENTED_TAB_IDLE_CLASS
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
