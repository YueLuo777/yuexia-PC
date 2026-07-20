import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_REPLACE_BODY_WARNING_THRESHOLD,
  REPLACE_BODY_WARNING_THRESHOLD_KEY,
  getReplaceBodyWordCount,
  normalizeReplaceBodyWarningThreshold,
  readReplaceBodyWarningThreshold,
  shouldWarnBeforeReplacingBody,
  writeReplaceBodyWarningThreshold,
} from './workbenchReplaceBodyWarning';

describe('workbenchReplaceBodyWarning', () => {
  beforeEach(() => {
    localStorage.removeItem(REPLACE_BODY_WARNING_THRESHOLD_KEY);
  });

  it('uses 2000 words by default and warns only below the threshold', () => {
    expect(readReplaceBodyWarningThreshold()).toBe(DEFAULT_REPLACE_BODY_WARNING_THRESHOLD);
    expect(shouldWarnBeforeReplacingBody('字'.repeat(1999))).toBe(true);
    expect(shouldWarnBeforeReplacingBody('字'.repeat(2000))).toBe(false);
  });

  it('counts non-whitespace characters and supports disabling the warning with zero', () => {
    expect(getReplaceBodyWordCount('一 二\n三')).toBe(3);
    expect(shouldWarnBeforeReplacingBody('短正文', 0)).toBe(false);
  });

  it('normalizes and persists the configured threshold', () => {
    expect(normalizeReplaceBodyWarningThreshold(-100)).toBe(0);
    expect(normalizeReplaceBodyWarningThreshold('invalid')).toBe(DEFAULT_REPLACE_BODY_WARNING_THRESHOLD);
    expect(writeReplaceBodyWarningThreshold('1500')).toBe(1500);
    expect(readReplaceBodyWarningThreshold()).toBe(1500);
  });
});
