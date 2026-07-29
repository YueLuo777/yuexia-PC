import { describe, expect, it } from 'vitest';

import { resolveWorkbenchExperience } from './ModeAwareWorkbenchPage';

describe('resolveWorkbenchExperience', () => {
  it('lets an explicit standard workbench link override professional mode', () => {
    expect(resolveWorkbenchExperience('?experience=standard', 'professional')).toBe('standard');
  });

  it('keeps the current application mode when the link has no valid override', () => {
    expect(resolveWorkbenchExperience('', 'professional')).toBe('professional');
    expect(resolveWorkbenchExperience('?experience=unknown', 'standard')).toBe('standard');
  });
});
