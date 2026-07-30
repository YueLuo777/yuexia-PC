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

export function getNovelIdFromStandardSettingStorageKey(settingsStorageKey: string) {
  return settingsStorageKey.startsWith(SETTINGS_STORAGE_PREFIX)
    ? settingsStorageKey.slice(SETTINGS_STORAGE_PREFIX.length)
    : '';
}

export function getStandardSettingGenerationSteps(settingsStorageKey: string) {
  const novelId = getNovelIdFromStandardSettingStorageKey(settingsStorageKey);
  const template = readStandardSettingTemplateState(novelId);
  if (template?.generationBlueprint.stages.length) {
    return [...template.generationBlueprint.stages]
      .sort((left, right) => left.order - right.order)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        scope: stage.description,
        promptName: stage.promptName,
      }));
  }
  return STANDARD_SETTING_GENERATION_STEPS;
}

export function createStandardSettingGenerationState(settingsStorageKey = ''): StandardSettingGenerationState {
  const firstStepId = getStandardSettingGenerationSteps(settingsStorageKey)[0]?.id ?? 'world-foundation';
  return {
    version: 1,
    currentStepIndex: 0,
    currentStepId: firstStepId,
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
  const fallback = createStandardSettingGenerationState(settingsStorageKey);
  if (typeof localStorage === 'undefined' || !settingsStorageKey) return fallback;
  try {
    const parsed = JSON.parse(
      localStorage.getItem(getStandardSettingGenerationStorageKey(settingsStorageKey)) ?? 'null',
    ) as Partial<StandardSettingGenerationState> | null;
    if (!parsed) return fallback;
    const generationSteps = getStandardSettingGenerationSteps(settingsStorageKey);
    const validStepIds = new Set(generationSteps.map((step) => step.id));
    const completedStepIds = Array.isArray(parsed.completedStepIds)
      ? parsed.completedStepIds.filter((id): id is string => typeof id === 'string' && validStepIds.has(id))
      : [];
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

export function buildStandardSettingTemplatePromptContent(
  settingsStorageKey: string,
  step: StandardSettingGenerationStep,
  targets: StandardSettingGenerationTarget[],
) {
  const novelId = getNovelIdFromStandardSettingStorageKey(settingsStorageKey);
  const template = readStandardSettingTemplateState(novelId);
  if (!template) return '';
  const profile = template.promptProfile;
  const stageGuidance = profile.stageGuidance[step.id]
    || template.generationBlueprint.stages.find((stage) => stage.id === step.id)?.promptGuidance
    || '';
  const entryGuidance = targets.flatMap((target) => {
    const entryId = target.templateEntryId ?? target.id;
    const guidance = profile.entryGuidance[entryId] || target.rule?.promptGuidance || '';
    return guidance.trim() ? [`${target.title}：${guidance.trim()}`] : [];
  });
  return [
    profile.globalGuidance.trim() ? `【模板生成目标】\n${profile.globalGuidance.trim()}` : '',
    stageGuidance.trim() ? `【本步骤专属要求】\n${stageGuidance.trim()}` : '',
    entryGuidance.length ? `【各设定专属要求】\n${entryGuidance.join('\n')}` : '',
    profile.forbiddenGuidance.trim() ? `【模板禁止事项】\n${profile.forbiddenGuidance.trim()}` : '',
  ].filter(Boolean).join('\n\n');
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
  const writeRules = [
    '以下写入协议优先级最高，属于软件锁定协议，不得省略、改名或改写标记。',
    '【本步骤生成目标】',
    formatStandardSettingGenerationTargets(targets),
    '【锁定输出协议】',
    '严格照下面的协议骨架输出。单项设定只能输出一个 [[ITEM]]；多项设定按推荐数量重复 [[ITEM]]。每个字段标记只能出现一次，字段内容不能为空；没有相关内容时填写“无”。除协议内容外不要输出解释、寒暄、Markdown 或代码块。',
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
    '字段正文只写用户可见的中文设定内容，禁止输出JSON、Markdown代码块以及type、body、structuredFieldSetId、lockedDefaultEntryId等存储字段。',
  ]
    .filter(Boolean)
    .join('\n\n');
}
