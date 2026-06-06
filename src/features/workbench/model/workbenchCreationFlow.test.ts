import { describe, expect, it } from 'vitest';

import { WORKBENCH_HEADER_FLOW_ITEMS } from './workbenchCreationFlow';

describe('WORKBENCH_HEADER_FLOW_ITEMS', () => {
  it('keeps the workbench header flow in the expected writing order', () => {
    expect(WORKBENCH_HEADER_FLOW_ITEMS.map((item) => item.title)).toEqual([
      '作品信息',
      '大纲',
      '剧情链',
      '章纲',
      '正文',
      '脑洞',
      '审核',
      '点评',
      '状态',
      '概要',
    ]);
  });
});
