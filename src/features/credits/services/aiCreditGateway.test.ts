import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  configureAiCreditGateway,
  releaseAiCredits,
  reserveAiCredits,
  resetAiCreditGateway,
  settleAiCredits,
} from './aiCreditGateway';

describe('aiCreditGateway', () => {
  afterEach(resetAiCreditGateway);

  it('keeps a replaceable reserve, settle and release boundary for the future credit service', async () => {
    const reserve = vi.fn(async () => ({ reservationId: 'reservation-1', estimatedCredits: 12 }));
    const settle = vi.fn(async () => undefined);
    const release = vi.fn(async () => undefined);
    configureAiCreditGateway({ reserve, settle, release });

    const reservation = await reserveAiCredits({
      operation: 'work-profile-optimization',
      resourceId: '7',
      quantity: 5,
      idempotencyKey: 'request-1',
    });
    await settleAiCredits(reservation);
    await releaseAiCredits(reservation);

    expect(reserve).toHaveBeenCalledWith(expect.objectContaining({ resourceId: '7', quantity: 5 }));
    expect(settle).toHaveBeenCalledWith(reservation);
    expect(release).toHaveBeenCalledWith(reservation);
  });
});
