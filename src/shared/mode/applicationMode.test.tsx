import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  APPLICATION_MODE_STORAGE_KEY,
  readApplicationMode,
  useApplicationMode,
  writeApplicationMode,
} from './applicationMode';

describe('applicationMode', () => {
  afterEach(() => {
    localStorage.removeItem(APPLICATION_MODE_STORAGE_KEY);
  });

  it('defaults to professional mode and persists the selected mode', () => {
    expect(readApplicationMode()).toBe('professional');

    writeApplicationMode('standard');

    expect(readApplicationMode()).toBe('standard');
    expect(localStorage.getItem(APPLICATION_MODE_STORAGE_KEY)).toBe('standard');
  });

  it('updates mounted consumers after a mode change', () => {
    const { result } = renderHook(() => useApplicationMode());
    expect(result.current).toBe('professional');

    act(() => writeApplicationMode('standard'));

    expect(result.current).toBe('standard');
  });
});

