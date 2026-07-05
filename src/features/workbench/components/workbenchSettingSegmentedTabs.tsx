import { SegmentedTabs } from '@/shared/ui/SegmentedTabs';

type SettingSegmentedTabsProps<T extends string> = {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function SettingSegmentedTabs<T extends string>(props: SettingSegmentedTabsProps<T>) {
  return <SegmentedTabs {...props} />;
}
