export const REMEMBER_ASSOCIATIONS_KEY = 'xinyuexia_remember_associations';
export const REMEMBER_ASSOCIATIONS_CHANGED_EVENT = 'xinyuexia_remember_associations_changed';

export function isRememberAssociationsEnabled() {
  try {
    return localStorage.getItem(REMEMBER_ASSOCIATIONS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setRememberAssociationsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(REMEMBER_ASSOCIATIONS_KEY, String(enabled));
  } catch {
    // Ignore storage failures.
  }
  window.dispatchEvent(new CustomEvent(REMEMBER_ASSOCIATIONS_CHANGED_EVENT, { detail: { enabled } }));
}
