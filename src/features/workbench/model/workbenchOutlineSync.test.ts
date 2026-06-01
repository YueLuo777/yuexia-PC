import { describe, expect, it } from 'vitest';

import { shouldSyncOutlinePreviewDraft } from './workbenchOutlineSync';

describe('shouldSyncOutlinePreviewDraft', () => {
  it('does not sync stored outline text into standalone plot-chain AI dialog', () => {
    expect(shouldSyncOutlinePreviewDraft({ plotPointStandalone: true })).toBe(false);
  });

  it('keeps syncing outline text for normal outline views', () => {
    expect(shouldSyncOutlinePreviewDraft({ plotPointStandalone: false })).toBe(true);
  });
});
