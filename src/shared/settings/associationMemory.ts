export const REMEMBER_ASSOCIATIONS_KEY = 'xinyuexia_remember_associations';
export const REMEMBER_ASSOCIATIONS_CHANGED_EVENT = 'xinyuexia_remember_associations_changed';

export function isRememberAssociationsEnabled() {
  return false;
}

export function setRememberAssociationsEnabled(_enabled: boolean) {
  try {
    localStorage.removeItem(REMEMBER_ASSOCIATIONS_KEY);
  } catch {
    // Ignore storage failures.
  }
  window.dispatchEvent(new CustomEvent(REMEMBER_ASSOCIATIONS_CHANGED_EVENT, { detail: { enabled: false } }));
}
