import { beforeEach, describe, expect, it } from 'vitest';

import {
  STANDARD_SETTING_GENERATION_STEPS,
  buildStandardSettingStepRequest,
  createStandardSettingGenerationState,
  findBuiltInSettingPrompt,
  getStandardSettingGenerationSteps,
  getStandardSettingGenerationStorageKey,
  readStandardSettingGenerationState,
  readStandardSettingLastRequest,
  writeStandardSettingLastRequest,
  writeStandardSettingGenerationSnapshot,
  writeStandardSettingGenerationState,
  readStandardSettingGenerationSnapshot,
} from './standardModeSettingGenerationFlow';
import { writeStandardSettingTemplateState } from './standardModeSettingModel';
import {
  MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
  MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
  MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
} from './standardModeXianxiaSettingTemplates';

describe('standard mode setting generation flow', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    [
      'male-fantasy-xianxia-light',
      '玄幻仙侠（轻量版）',
      MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
      ['核心设定', '主角与金手指', '故事与首卷', '地点与势力', '功法与伏笔'],
    ],
    [
      'male-fantasy-xianxia',
      '玄幻仙侠（标准版）',
      MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE,
      ['世界规则与力量', '主角阵容与金手指', '全书剧情与节奏', '地图势力与关系', '功法资源与伏笔'],
    ],
    [
      'male-fantasy-xianxia-full',
      '玄幻仙侠（完整版）',
      MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
      ['完整世界体系', '完整人物与金手指', '完整剧情规划', '完整地图与势力', '资源伏笔与怪物'],
    ],
  ])('binds %s to its own generation order', (templateId, templateName, structure, expectedNames) => {
    const novelId = `${templateId}-flow-test`;
    writeStandardSettingTemplateState(novelId, {
      version: 2,
      mode: 'template',
      templateId,
      templateName,
      structure,
    });

    const steps = getStandardSettingGenerationSteps(`xinyuexia_workbench_settings_${novelId}`);

    expect(steps.map((step) => step.name)).toEqual(expectedNames);
    expect(steps.map((step) => step.id)).toEqual([
      'world-foundation',
      'main-characters',
      'plot-planning',
      'places-and-factions',
      'creation-supplements',
    ]);
  });

  it('migrates a legacy index to the same stable step id after the template order changes', () => {
    const novelId = 'legacy-light-flow-test';
    const settingsStorageKey = `xinyuexia_workbench_settings_${novelId}`;
    writeStandardSettingTemplateState(novelId, {
      version: 2,
      mode: 'template',
      templateId: 'male-fantasy-xianxia-light',
      templateName: '玄幻仙侠（轻量版）',
      structure: MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
    });
    localStorage.setItem(getStandardSettingGenerationStorageKey(settingsStorageKey), JSON.stringify({
      version: 1,
      currentStepIndex: 2,
      completedStepIds: ['world-foundation', 'plot-planning'],
      status: 'idle',
      autoContinue: false,
      requirement: '',
      error: '',
    }));

    expect(readStandardSettingGenerationState(settingsStorageKey)).toMatchObject({
      currentStepIndex: 1,
      currentStepId: 'main-characters',
    });
  });
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

  it('keeps the exact last setting request available after the generation panel is rebuilt', () => {
    writeStandardSettingLastRequest('setting-request-log-test', {
      createdAt: '2026-07-29',
      stepName: '主要人物',
      promptName: '作品设定生成-主要人物',
      userContent: '完整发送内容',
    });

    expect(readStandardSettingLastRequest('setting-request-log-test')).toEqual({
      createdAt: '2026-07-29',
      stepName: '主要人物',
      promptName: '作品设定生成-主要人物',
      userContent: '完整发送内容',
    });
  });

  it('keeps the interrupted character transaction available for safe restoration', () => {
    writeStandardSettingGenerationSnapshot('character-snapshot-test', {
      stepId: 'main-characters',
      targetEntryIds: ['male', 'female'],
    });

    expect(readStandardSettingGenerationSnapshot('character-snapshot-test')).toMatchObject({
      stepId: 'main-characters',
      targetEntryIds: ['male', 'female'],
    });
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
      targets: [{
        id: 'plot-overview',
        title: '整体剧情',
        domainId: 'work',
        domainTitle: '作品设定',
        groupTitle: '剧情规划',
        sourceKind: 'setting',
        fieldTitles: ['开局事件', '全书主线目标'],
      }],
    });

    expect(request).toContain('剧情规划');
    expect(request).toContain('少年获得古镜');
    expect(request).toContain('世界背景：九州');
    expect(request).toContain('节奏更快');
    expect(request).toContain('只写用户可见的中文设定内容');
    expect(request).toContain('禁止输出JSON');
    expect(request).toContain('structuredFieldSetId');
    expect(request).toContain('【锁定输出协议】');
    expect(request).toContain('[[SETTING_ENTRY:plot-overview]]');
    expect(request).toContain('[[FIELD:legacy-field-1]]');
    expect(request).toContain('不得省略、改名或改写标记');
  });

  it('uses the same locked id protocol for character generation', () => {
    const request = buildStandardSettingStepRequest({
      step: STANDARD_SETTING_GENERATION_STEPS[2],
      requirement: '',
      brainstorm: '都市异能题材',
      existingSettings: '前两步设定',
      promptContent: '人物提示词',
      targets: [{
        id: 'male-placeholder',
        title: '男主角',
        domainId: 'character',
        domainTitle: '人物设定',
        groupTitle: '男女主',
        sourceKind: 'role',
        fieldTitles: ['人物姓名', '身份定位'],
      }],
    });

    expect(request).toContain('【锁定输出协议】');
    expect(request).toContain('[[SETTING_ENTRY:male-placeholder]]');
    expect(request).toContain('[[TITLE]]男主角');
    expect(request).toContain('[[FIELD:legacy-field-1]]');
    expect(request).not.toContain('重要正派角色、正派配角、重要反派角色、反派配角和龙套角色');
  });

  it('keeps every blueprint target writable in a mixed step', () => {
    const request = buildStandardSettingStepRequest({
      step: getStandardSettingGenerationSteps('')[2],
      requirement: '',
      brainstorm: '',
      existingSettings: '',
      promptContent: '人物提示词',
      targets: [
        {
          id: 'male-placeholder',
          title: '男主角',
          domainId: 'character',
          domainTitle: '人物设定',
          groupTitle: '主要人物',
          sourceKind: 'role',
          fieldTitles: ['人物姓名'],
        },
        {
          id: 'gold-finger',
          title: '金手指核心',
          domainId: 'work',
          domainTitle: '作品设定',
          groupTitle: '主角设定',
          sourceKind: 'setting',
          fieldTitles: ['能力本质', '使用限制'],
        },
      ],
    });

    expect(request).toContain('[[SETTING_ENTRY:male-placeholder]]');
    expect(request).toContain('[[SETTING_ENTRY:gold-finger]]');
    expect(request).toContain('[[FIELD:legacy-field-1]]');
    expect(request).toContain('能力本质');
  });
});
