import { beforeEach, describe, expect, it } from 'vitest';

import {
  REMEMBER_ASSOCIATIONS_KEY,
  isRememberAssociationsEnabled,
  setRememberAssociationsEnabled,
} from './associationMemory';

describe('association memory setting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps association persistence disabled even if old data tried to enable it', () => {
    localStorage.setItem(REMEMBER_ASSOCIATIONS_KEY, 'true');

    expect(isRememberAssociationsEnabled()).toBe(false);

    setRememberAssociationsEnabled(true);

    expect(isRememberAssociationsEnabled()).toBe(false);
    expect(localStorage.getItem(REMEMBER_ASSOCIATIONS_KEY)).toBeNull();
  });
});
