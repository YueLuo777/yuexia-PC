import { describe, expect, it } from 'vitest';

import {
  STANDARD_SETTING_GENERATION_STEPS,
  buildStandardSettingStepRequest,
  createStandardSettingGenerationState,
  findBuiltInSettingPrompt,
  readStandardSettingGenerationState,
  writeStandardSettingGenerationState,
} from './standardModeSettingGenerationFlow';

describe('standard mode setting generation flow', () => {
  it('uses the agreed five-step order', () => {
    expect(STANDARD_SETTING_GENERATION_STEPS.map((step) => step.name)).toEqual([
      '基础设定',
      '剧情规划',
      '主要人物',
      '地点与势力',
      '创作补充',
    ]);
  });

  it('restores an interrupted run as paused', () => {
    const key = 'setting-generation-test';
    writeStandardSettingGenerationState(key, {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 2,
      status: 'running',
    });

    expect(readStandardSettingGenerationState(key)).toMatchObject({ currentStepIndex: 2, status: 'paused' });
  });

  it('prefers a step prompt and falls back to the generic built-in setting prompt', () => {
    const prompts = [
      { id: 'generic', name: '作品设定生成', category: '内置', content: '通用内容' },
      { id: 'step', name: '作品设定生成-世界基础', category: '内置', content: '分步内容' },
    ] as never;

    expect(findBuiltInSettingPrompt(prompts, STANDARD_SETTING_GENERATION_STEPS[0])?.id).toBe('step');
    expect(findBuiltInSettingPrompt(prompts, STANDARD_SETTING_GENERATION_STEPS[1])?.id).toBe('generic');
  });

  it('builds a scoped request with brainstorm, previous settings, and user requirements', () => {
    const request = buildStandardSettingStepRequest({
      step: STANDARD_SETTING_GENERATION_STEPS[1],
      requirement: '节奏更快',
      brainstorm: '少年获得古镜',
      existingSettings: '世界背景：九州',
      promptContent: '内置提示词正文',
    });

    expect(request).toContain('剧情规划');
    expect(request).toContain('少年获得古镜');
    expect(request).toContain('世界背景：九州');
    expect(request).toContain('节奏更快');
    expect(request).toContain('只写用户可见的中文设定内容');
    expect(request).toContain('禁止输出JSON');
    expect(request).toContain('structuredFieldSetId');
  });
});
