import { describe, expect, it } from 'vitest';

import {
  BRAINSTORM_READER_CANDIDATE_MAX_WIDTH,
  BRAINSTORM_READER_CANDIDATE_MIN_WIDTH,
  BRAINSTORM_READER_PREVIEW_MIN_WIDTH,
  BRAINSTORM_READER_SPLITTER_WIDTH,
  clampBrainstormReaderCandidateWidth,
} from './useBrainstormReaderSplit';

describe('brainstorm reader split width', () => {
  it('protects both the candidate list and preview while resizing', () => {
    expect(clampBrainstormReaderCandidateWidth(100, 1180)).toBe(BRAINSTORM_READER_CANDIDATE_MIN_WIDTH);
    expect(clampBrainstormReaderCandidateWidth(900, 1180)).toBe(BRAINSTORM_READER_CANDIDATE_MAX_WIDTH);

    const narrowContainerWidth = 760;
    expect(clampBrainstormReaderCandidateWidth(500, narrowContainerWidth)).toBe(
      narrowContainerWidth - BRAINSTORM_READER_PREVIEW_MIN_WIDTH - BRAINSTORM_READER_SPLITTER_WIDTH,
    );
  });
});
