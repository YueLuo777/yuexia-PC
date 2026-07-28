export const STANDARD_SETTING_GENERATION_LOCK_EVENT = 'xinyuexia:standard-setting-generation-lock';

export function publishStandardSettingGenerationLock(locked: boolean) {
  window.dispatchEvent(new CustomEvent(STANDARD_SETTING_GENERATION_LOCK_EVENT, { detail: { locked } }));
}

export function subscribeStandardSettingGenerationLock(listener: (locked: boolean) => void) {
  const handleLockChange = (event: Event) => {
    const detail = (event as CustomEvent<{ locked?: unknown }>).detail;
    listener(detail?.locked === true);
  };
  window.addEventListener(STANDARD_SETTING_GENERATION_LOCK_EVENT, handleLockChange);
  return () => window.removeEventListener(STANDARD_SETTING_GENERATION_LOCK_EVENT, handleLockChange);
}
