import { describe, expect, it } from 'vitest';

import {
  BRAINSTORM_TAB,
  DETAIL_OUTLINE_TAB,
  ROLE_TAB,
  SETTING_TAB,
} from './workbenchLibraryTabs';
import { getWorkbenchLibraryAiLogScope } from './workbenchLibraryAiLogTriggers';

describe('workbenchLibraryAiLogTriggers', () => {
  it('routes setting, role, and brainstorm tabs to the library log', () => {
    expect(getWorkbenchLibraryAiLogScope(SETTING_TAB)).toBe('library');
    expect(getWorkbenchLibraryAiLogScope(ROLE_TAB)).toBe('library');
    expect(getWorkbenchLibraryAiLogScope(BRAINSTORM_TAB)).toBe('library');
  });

  it('routes outline-oriented tabs to the outline log', () => {
    expect(getWorkbenchLibraryAiLogScope(DETAIL_OUTLINE_TAB)).toBe('outline');
    expect(getWorkbenchLibraryAiLogScope('summary')).toBe('outline');
  });
});
