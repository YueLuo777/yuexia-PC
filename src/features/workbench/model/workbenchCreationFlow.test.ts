import { describe, expect, it } from 'vitest';

import { WORKBENCH_HEADER_FLOW_ITEMS } from './workbenchCreationFlow';

describe('WORKBENCH_HEADER_FLOW_ITEMS', () => {
  it('keeps the workbench header flow in the expected writing order', () => {
    expect(WORKBENCH_HEADER_FLOW_ITEMS.map((item) => item.id)).toEqual([
      'workInfo',
      'brainstorm',
      'outline',
      'chapterOutline',
      'writing',
      'audit',
      'comment',
      'polish',
      'status',
      'summary',
    ]);
    expect(WORKBENCH_HEADER_FLOW_ITEMS.map((item) => item.id)).not.toContain('plotChain');
  });
});
