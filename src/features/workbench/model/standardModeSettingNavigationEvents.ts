export type StandardModeSettingNavigationAction = 'change-template' | 'upgrade-template' | 'settings-cleared';

export type StandardModeSettingNavigationEvent = {
  action: StandardModeSettingNavigationAction;
  storageKey: string;
};

const STANDARD_MODE_SETTING_NAVIGATION_EVENT = 'xinyuexia_standard_setting_navigation';

export function publishStandardModeSettingNavigationAction(event: StandardModeSettingNavigationEvent) {
  window.dispatchEvent(new CustomEvent(STANDARD_MODE_SETTING_NAVIGATION_EVENT, { detail: event }));
}

export function subscribeStandardModeSettingNavigationAction(
  listener: (event: StandardModeSettingNavigationEvent) => void,
) {
  const handleEvent = (event: Event) => {
    const detail = (event as CustomEvent<StandardModeSettingNavigationEvent>).detail;
    if (!detail?.storageKey || !detail.action) return;
    listener(detail);
  };
  window.addEventListener(STANDARD_MODE_SETTING_NAVIGATION_EVENT, handleEvent);
  return () => window.removeEventListener(STANDARD_MODE_SETTING_NAVIGATION_EVENT, handleEvent);
}
