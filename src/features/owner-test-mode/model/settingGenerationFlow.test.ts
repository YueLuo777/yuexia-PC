import { beforeEach, describe, expect, it } from 'vitest';

import {
  appendSettingGenerationStep,
  createDefaultSettingGenerationFlow,
  readSettingGenerationFlow,
  SETTING_GENERATION_FLOW_STORAGE_KEY,
  writeSettingGenerationFlow,
} from './settingGenerationFlow';

describe('settingGenerationFlow', () => {
  beforeEach(() => localStorage.clear());

  it('starts with an ordered multi-step setting workflow', () => {
    const flow = readSettingGenerationFlow();

    expect(flow.steps.map((step) => step.name)).toEqual([
      '世界基础',
      '剧情规划',
      '主要人物',
      '地点与势力',
      '创作补充',
    ]);
    expect(flow.steps[0].includePreviousResults).toBe(false);
    expect(flow.steps.slice(1).every((step) => step.includePreviousResults)).toBe(true);
  });

  it('persists owner configuration independently from novel settings', () => {
    const flow = appendSettingGenerationStep(createDefaultSettingGenerationFlow());
    flow.steps[0] = { ...flow.steps[0], modelId: 'model-a', promptId: 'prompt-a' };
    writeSettingGenerationFlow(flow);

    expect(readSettingGenerationFlow().steps[0]).toMatchObject({ modelId: 'model-a', promptId: 'prompt-a' });
    expect(localStorage.getItem(SETTING_GENERATION_FLOW_STORAGE_KEY)).toContain('model-a');
    expect(
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).some((key) =>
        key?.includes('workbench_settings'),
      ),
    ).toBe(false);
  });
});
