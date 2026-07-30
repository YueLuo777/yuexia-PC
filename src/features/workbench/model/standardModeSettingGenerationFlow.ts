import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { readStandardSettingTemplateState } from './standardModeSettingModel';
import {
  buildStandardSettingGenerationOutputTemplate,
  formatStandardSettingGenerationTargets,
  type StandardSettingGenerationTarget,
} from './standardModeSettingGenerationTargets';

export type StandardSettingGenerationStep = {
  id: string;
  name: string;
  scope: string;
  promptName: string;
};

export type StandardSettingGenerationStatus = 'idle' | 'running' | 'paused' | 'failed' | 'completed';

export type StandardSettingGenerationState = {
  version: 1;
  currentStepIndex: number;
  currentStepId: string;
  completedStepIds: string[];
  status: StandardSettingGenerationStatus;
  autoContinue: boolean;
  requirement: string;
  error: string;
};

export const STANDARD_SETTING_GENERATION_STEPS: StandardSettingGenerationStep[] = [
  {
    id: 'world-foundation',
    name: '基础设定',
    scope: '作品定位、世界背景、力量体系、设定红线',
    promptName: '作品设定生成-世界基础',
  },
  {
    id: 'plot-planning',
    name: '剧情规划',
    scope: '整体剧情、第一卷、爽点设计、创作规范、剧情时间线',
    promptName: '作品设定生成-剧情规划',
  },
  {
    id: 'main-characters',
    name: '主要人物',
    scope: '男主角或女主角、重要配角、人物关系与当前目标',
    promptName: '作品设定生成-主要人物',
  },
  {
    id: 'places-and-factions',
    name: '地点与势力',
    scope: '地点地图、主要势力、势力关系与活动范围',
    promptName: '作品设定生成-地点与势力',
  },
  {
    id: 'creation-supplements',
    name: '创作补充',
    scope: '道具资源、伏笔线索、怪物图鉴及前面遗漏的必要设定',
    promptName: '作品设定生成-创作补充',
  },
];

export const LIGHT_XIANXIA_SETTING_GENERATION_STEPS: StandardSettingGenerationStep[] = [
  {
    id: 'world-foundation',
    name: '核心设定',
    scope: '作品定位、核心脑洞、世界背景、力量体系、设定红线',
    promptName: '作品设定生成-世界基础',
  },
  {
    id: 'main-characters',
    name: '主角与金手指',
    scope: '主角、重要正反派、金手指核心、主角成长路线',
    promptName: '作品设定生成-主要人物',
  },
  {
    id: 'plot-planning',
    name: '故事与首卷',
    scope: '故事主线、第一卷规划、开篇节奏与核心爽点',
    promptName: '作品设定生成-剧情规划',
  },
  {
    id: 'places-and-factions',
    name: '地点与势力',
    scope: '主角起始地点、宗门势力及其资源、冲突与秘密',
    promptName: '作品设定生成-地点与势力',
  },
  {
    id: 'creation-supplements',
    name: '功法与伏笔',
    scope: '主角核心功法、长线伏笔及前面步骤遗漏的必要设定',
    promptName: '作品设定生成-创作补充',
  },
];

export const STANDARD_XIANXIA_SETTING_GENERATION_STEPS: StandardSettingGenerationStep[] = [
  {
    id: 'world-foundation',
    name: '世界规则与力量',
    scope: '作品核心、世界结构、力量体系、修炼资源、社会规则与设定红线',
    promptName: '作品设定生成-世界基础',
  },
  {
    id: 'main-characters',
    name: '主角阵容与金手指',
    scope: '主角、女主角、重要正反派、人物关系、金手指及成长路线',
    promptName: '作品设定生成-主要人物',
  },
  {
    id: 'plot-planning',
    name: '全书剧情与节奏',
    scope: '故事主线、阶段规划、第一卷、核心冲突、爽点、悬念与节奏',
    promptName: '作品设定生成-剧情规划',
  },
  {
    id: 'places-and-factions',
    name: '地图势力与关系',
    scope: '世界地图、关键地点、主要势力、势力关系及活动范围',
    promptName: '作品设定生成-地点与势力',
  },
  {
    id: 'creation-supplements',
    name: '功法资源与伏笔',
    scope: '功法技能、装备资源、世界秘密、线索伏笔及遗漏设定',
    promptName: '作品设定生成-创作补充',
  },
];

export const FULL_XIANXIA_SETTING_GENERATION_STEPS: StandardSettingGenerationStep[] = [
  {
    id: 'world-foundation',
    name: '完整世界体系',
    scope: '作品核心、世界层级、力量规则、修炼资源、社会文明与全部设定红线',
    promptName: '作品设定生成-世界基础',
  },
  {
    id: 'main-characters',
    name: '完整人物与金手指',
    scope: '主角、女主角、正反派阵容、人物关系、金手指成长限制与隐藏真相',
    promptName: '作品设定生成-主要人物',
  },
  {
    id: 'plot-planning',
    name: '完整剧情规划',
    scope: '全书阶段、分卷剧情、冲突体系、爽点体系、悬念体系与节奏规则',
    promptName: '作品设定生成-剧情规划',
  },
  {
    id: 'places-and-factions',
    name: '完整地图与势力',
    scope: '世界地图、区域地点、秘境遗迹、势力格局、组织档案与势力关系',
    promptName: '作品设定生成-地点与势力',
  },
  {
    id: 'creation-supplements',
    name: '资源伏笔与怪物',
    scope: '功法装备、资源传承、秘密伏笔、线索链、种族怪物及遗漏设定',
    promptName: '作品设定生成-创作补充',
  },
];

const SETTINGS_STORAGE_PREFIX = 'xinyuexia_workbench_settings_';

export function getStandardSettingGenerationSteps(settingsStorageKey: string) {
  const novelId = settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
  const templateId = readStandardSettingTemplateState(novelId)?.templateId;
  if (templateId === 'male-fantasy-xianxia-light') return LIGHT_XIANXIA_SETTING_GENERATION_STEPS;
  if (templateId === 'male-fantasy-xianxia') return STANDARD_XIANXIA_SETTING_GENERATION_STEPS;
  if (templateId === 'male-fantasy-xianxia-full') return FULL_XIANXIA_SETTING_GENERATION_STEPS;
  return STANDARD_SETTING_GENERATION_STEPS;
}

export function createStandardSettingGenerationState(): StandardSettingGenerationState {
  return {
    version: 1,
    currentStepIndex: 0,
    currentStepId: 'world-foundation',
    completedStepIds: [],
    status: 'idle',
    autoContinue: false,
    requirement: '',
    error: '',
  };
}

export function getStandardSettingGenerationStorageKey(settingsStorageKey: string) {
  return `xinyuexia_standard_setting_generation_v1:${settingsStorageKey}`;
}

export function readStandardSettingGenerationState(settingsStorageKey: string) {
  const fallback = createStandardSettingGenerationState();
  if (typeof localStorage === 'undefined' || !settingsStorageKey) return fallback;
  try {
    const parsed = JSON.parse(
      localStorage.getItem(getStandardSettingGenerationStorageKey(settingsStorageKey)) ?? 'null',
    ) as Partial<StandardSettingGenerationState> | null;
    if (!parsed) return fallback;
    const completedStepIds = Array.isArray(parsed.completedStepIds)
      ? parsed.completedStepIds.filter((id): id is string => typeof id === 'string')
      : [];
    const generationSteps = getStandardSettingGenerationSteps(settingsStorageKey);
    const legacyStep = STANDARD_SETTING_GENERATION_STEPS[Math.max(
      0,
      Math.min(STANDARD_SETTING_GENERATION_STEPS.length - 1, Number(parsed.currentStepIndex) || 0),
    )];
    const currentStepId = typeof parsed.currentStepId === 'string' ? parsed.currentStepId : legacyStep.id;
    const resolvedStepIndex = generationSteps.findIndex((step) => step.id === currentStepId);
    const currentStepIndex = resolvedStepIndex >= 0 ? resolvedStepIndex : 0;
    return {
      version: 1,
      currentStepIndex,
      currentStepId: generationSteps[currentStepIndex]?.id ?? 'world-foundation',
      completedStepIds,
      status: parsed.status === 'running' ? 'paused' : (parsed.status ?? 'idle'),
      autoContinue: parsed.autoContinue !== false,
      requirement: typeof parsed.requirement === 'string' ? parsed.requirement : '',
      error: parsed.status === 'running'
        ? '上次生成因页面关闭、切换或软件退出而中断，原设定内容未被改动；请点击继续当前步骤。'
        : typeof parsed.error === 'string' ? parsed.error : '',
    } satisfies StandardSettingGenerationState;
  } catch {
    return fallback;
  }
}

export function writeStandardSettingGenerationState(settingsStorageKey: string, state: StandardSettingGenerationState) {
  if (!settingsStorageKey) return;
  const generationSteps = getStandardSettingGenerationSteps(settingsStorageKey);
  const currentStepIndex = Math.max(0, Math.min(generationSteps.length - 1, state.currentStepIndex));
  localStorage.setItem(getStandardSettingGenerationStorageKey(settingsStorageKey), JSON.stringify({
    ...state,
    currentStepIndex,
    currentStepId: generationSteps[currentStepIndex]?.id ?? 'world-foundation',
  }));
}

export function clearStandardSettingGenerationState(settingsStorageKey: string) {
  if (!settingsStorageKey) return;
  localStorage.removeItem(getStandardSettingGenerationStorageKey(settingsStorageKey));
  localStorage.removeItem(getStandardSettingGenerationSnapshotStorageKey(settingsStorageKey));
}

export type StandardSettingLastRequest = {
  createdAt: string;
  stepName: string;
  promptName: string;
  userContent: string;
};

export type StandardSettingGenerationSnapshot = {
  stepId: string;
  targetEntryIds: string[];
};

function getStandardSettingGenerationSnapshotStorageKey(settingsStorageKey: string) {
  return `xinyuexia_standard_setting_generation_snapshot_v1:${settingsStorageKey}`;
}

export function writeStandardSettingGenerationSnapshot(
  settingsStorageKey: string,
  snapshot: StandardSettingGenerationSnapshot,
) {
  localStorage.setItem(getStandardSettingGenerationSnapshotStorageKey(settingsStorageKey), JSON.stringify(snapshot));
}

export function readStandardSettingGenerationSnapshot(settingsStorageKey: string) {
  try {
    return JSON.parse(
      localStorage.getItem(getStandardSettingGenerationSnapshotStorageKey(settingsStorageKey)) ?? 'null',
    ) as StandardSettingGenerationSnapshot | null;
  } catch {
    return null;
  }
}

export function clearStandardSettingGenerationSnapshot(settingsStorageKey: string) {
  localStorage.removeItem(getStandardSettingGenerationSnapshotStorageKey(settingsStorageKey));
}

function getStandardSettingLastRequestStorageKey(settingsStorageKey: string) {
  return `xinyuexia_standard_setting_last_request_v1:${settingsStorageKey}`;
}

export function writeStandardSettingLastRequest(settingsStorageKey: string, request: StandardSettingLastRequest) {
  if (!settingsStorageKey || typeof localStorage === 'undefined') return;
  localStorage.setItem(getStandardSettingLastRequestStorageKey(settingsStorageKey), JSON.stringify(request));
}

export function readStandardSettingLastRequest(settingsStorageKey: string) {
  if (!settingsStorageKey || typeof localStorage === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(getStandardSettingLastRequestStorageKey(settingsStorageKey)) ?? 'null') as StandardSettingLastRequest | null;
  } catch {
    return null;
  }
}

export function findBuiltInSettingPrompt(prompts: PromptItem[], step: StandardSettingGenerationStep) {
  const candidates = prompts.filter((prompt) => prompt.category === '内置' && prompt.content.trim());
  return (
    candidates.find((prompt) => prompt.name.trim() === step.promptName) ??
    candidates.find((prompt) => prompt.name.trim() === '作品设定生成') ??
    null
  );
}

export function buildStandardSettingStepRequest({
  step,
  requirement,
  brainstorm,
  existingSettings,
  promptContent,
  targets,
}: {
  step: StandardSettingGenerationStep;
  requirement: string;
  brainstorm: string;
  existingSettings: string;
  promptContent: string;
  targets: StandardSettingGenerationTarget[];
}) {
  const isCharacterStep = step.id === 'main-characters';
  const characterSettingTargets = targets.filter((target) => target.sourceKind !== 'role');
  const characterSettingRules = characterSettingTargets.length > 0
    ? [
        '【本步骤同时填写以下原有设定】',
        formatStandardSettingGenerationTargets(characterSettingTargets),
        '人物标签输出完成后，继续严格照下面的标签骨架填写这些原有设定；不得新增、改名或遗漏：',
        buildStandardSettingGenerationOutputTemplate(characterSettingTargets),
      ].join('\n\n')
    : '';
  const writeRules = isCharacterStep
    ? [
        '【本步骤人物创建规则】',
        '本步骤不是填写固定人物占位条目，而是创建完整的人物设定。男主角和女主角必须各自获得符合题材的真实中文姓名；条目名与【人物姓名】必须完全一致，严禁继续使用“男主角”“女主角”“主角”“重要配角”“反派”“其他角色”等身份词或序号作为姓名。',
        '除男女主外，必须根据剧情需要创建有真实姓名的重要正派角色、正派配角、重要反派角色、反派配角和龙套角色。每个人物单独输出一个条目，不得把多个人物合并在同一条目中。',
        '【身份定位】只能填写：男主角、女主角、重要正派角色、正派配角、重要反派角色、反派配角、龙套角色。软件会据此把人物放入男女主、重要配角、反派、其他角色分组。',
        '严格使用以下格式；每个星号标题都要替换为该人物的真实姓名。每个人物都必须填写所有适用字段，不得只写姓名、身份和几句简介：',
        '<人物设定>',
        '*真实姓名*：',
        '【身份定位】：上述七种身份定位之一',
        '【人物姓名】：与星号标题完全一致的真实姓名',
        '【外貌】：具体内容',
        '【性格】：具体内容',
        '【称号】：具体内容，没有则写“无”',
        '【别名】：具体内容，没有则写“无”',
        '【人物出身】：具体内容',
        '【人物经历】：具体内容',
        '【人物秘密】：具体内容',
        '【当前目标】：具体内容',
        '【核心动机】：具体内容',
        '【行为原则】：具体内容',
        '【行为底线】：具体内容',
        '【语言习惯】：具体内容',
        '【标志动作】：具体内容',
        '【角色已知信息】：具体内容',
        '【角色错误认知】：具体内容',
        '【金手指当前功能】：主角必填，其他人物没有则写“无”',
        '【金手指来源】：主角必填，其他人物没有则写“无”',
        '【金手指升级方式】：主角必填，其他人物没有则写“无”',
        '【金手指解锁条件】：主角必填，其他人物没有则写“无”',
        '【金手指使用限制】：主角必填，其他人物没有则写“无”',
        '【金手指使用代价】：主角必填，其他人物没有则写“无”',
        '【金手指真实来历】：主角必填，其他人物没有则写“无”',
        '【金手指隐藏目的】：主角必填，其他人物没有则写“无”',
        '【金手指当前解锁状态】：主角必填，其他人物没有则写“无”',
        '【境界修为】：具体内容，没有超凡体系则写现实能力层级',
        '【功法体系】：具体内容，没有则写“无”',
        '【战斗技能】：具体内容',
        '【其他技能】：具体内容',
        '【战力范围】：具体内容',
        '【自身弱点】：具体内容',
        '【当前处境】：具体内容',
        '【当前任务】：具体内容',
        '【当前风险】：具体内容',
        '【当前地点】：具体内容',
        '【身体状态】：具体内容',
        '【精神状态】：具体内容',
        '【当前资源】：具体内容',
        '【人物关系】：具体内容',
        '【隶属势力】：具体内容',
        '</人物设定>',
        characterSettingRules,
      ].filter(Boolean).join('\n\n')
    : [
        '以下写入规则优先级最高；如果前面的提示词要求新建设定、自由命名或改变分组，以这里的规则为准。',
        '【本步骤只能写入以下原有设定】',
        formatStandardSettingGenerationTargets(targets),
        '【输出要求】',
        '你是在填写软件中已经存在的设定，不是在创建设定。只能输出上面列出的原有设定，设定名、所属分组和字段名必须逐字一致；禁止新增、改名、合并或在设定名后追加内容。每个设定只能出现一次，必须填写到对应的原有字段中。严格照下面的标签骨架输出，把“填写该字段内容”替换成完整设定正文；不要输出骨架之外的任何内容。',
        buildStandardSettingGenerationOutputTemplate(targets),
      ].join('\n\n');
  return [
    promptContent.trim(),
    '【当前生成步骤】',
    step.name,
    '【本步只生成】',
    step.scope,
    writeRules,
    brainstorm.trim() ? `【关联脑洞】\n${brainstorm.trim()}` : '',
    existingSettings.trim() ? `【已经完成的设定】\n${existingSettings.trim()}` : '',
    requirement.trim() ? `【用户补充要求】\n${requirement.trim()}` : '',
    '只写用户可见的中文设定内容，禁止输出JSON、Markdown代码块以及type、body、structuredFieldSetId、lockedDefaultEntryId等软件内部字段。不要解释，不要寒暄。',
  ]
    .filter(Boolean)
    .join('\n\n');
}
