import { describe, expect, it } from 'vitest';

import { buildPlotPointOutputFormatInstruction } from './workbenchPlotPointPrompt';

describe('workbenchPlotPointPrompt', () => {
  it('requires the selected candidate count for follow-up generation', () => {
    const instruction = buildPlotPointOutputFormatInstruction({ count: 5, hasChain: true });

    expect(instruction).toContain('必须输出 5 个');
    expect(instruction).toContain('1-5');
    expect(instruction).toContain('每一条第一句都必须出现本书主角名字');
  });
});
