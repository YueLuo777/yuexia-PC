import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_TEXT_AUDIT_COUNTDOWN_SECONDS,
  formatAuditTextStage,
  getAuditTextStageState,
  normalizeTextAuditCountdownSeconds,
  setAuditTextCountdownDecision,
  stripAuditTextStageMarkers,
  waitForAuditTextCountdown,
} from './chapterAuditWorkflow';

describe('chapter audit workflow', () => {
  afterEach(() => vi.useRealTimers());
  it('defaults to three seconds and clamps persisted values', () => {
    expect(DEFAULT_TEXT_AUDIT_COUNTDOWN_SECONDS).toBe(3);
    expect(normalizeTextAuditCountdownSeconds(undefined)).toBe(3);
    expect(normalizeTextAuditCountdownSeconds(-2)).toBe(0);
    expect(normalizeTextAuditCountdownSeconds(999)).toBe(300);
  });

  it('reads the latest text-stage marker and removes internal markers from visible output', () => {
    const output = [
      '剧情审核结果',
      formatAuditTextStage({ status: 'countdown', seconds: 3 }),
      formatAuditTextStage({ status: 'running', seconds: 0 }),
    ].join('\n');
    expect(getAuditTextStageState(output)).toEqual({ status: 'running', seconds: 0 });
    expect(stripAuditTextStageMarkers(output)).toBe('剧情审核结果');
  });

  it('lets the user start immediately or cancel during the countdown', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const startPromise = waitForAuditTextCountdown({
      taskId: 'start-task', seconds: 3, signal: controller.signal, onTick: vi.fn(),
    });
    setAuditTextCountdownDecision('start-task', 'start');
    await vi.advanceTimersByTimeAsync(100);
    await expect(startPromise).resolves.toBe('start');

    const cancelPromise = waitForAuditTextCountdown({
      taskId: 'cancel-task', seconds: 3, signal: controller.signal, onTick: vi.fn(),
    });
    setAuditTextCountdownDecision('cancel-task', 'cancel');
    await vi.advanceTimersByTimeAsync(100);
    await expect(cancelPromise).resolves.toBe('cancel');
  });
});
