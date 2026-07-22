import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useChapterAuditWorkflowSettings } from './useChapterAuditWorkflowSettings';

describe('useChapterAuditWorkflowSettings', () => {
  beforeEach(() => localStorage.clear());

  it('uses a three-second default and persists a custom countdown', () => {
    const { result, unmount } = renderHook(() => useChapterAuditWorkflowSettings());
    expect(result.current.textAuditCountdownSeconds).toBe(3);
    act(() => result.current.setTextAuditCountdownSeconds(8));
    expect(result.current.textAuditCountdownSeconds).toBe(8);
    unmount();

    const restored = renderHook(() => useChapterAuditWorkflowSettings());
    expect(restored.result.current.textAuditCountdownSeconds).toBe(8);
  });
});
