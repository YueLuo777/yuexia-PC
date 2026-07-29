import type { PromptItem } from '@/features/prompts/model/promptTypes';
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

export function createStandardSettingGenerationState(): StandardSettingGenerationState {
  return {
    version: 1,
    currentStepIndex: 0,
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
    const currentStepIndex = Math.max(
      0,
      Math.min(STANDARD_SETTING_GENERATION_STEPS.length - 1, Number(parsed.currentStepIndex) || 0),
    );
    return {
      version: 1,
      currentStepIndex,
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
  localStorage.setItem(getStandardSettingGenerationStorageKey(settingsStorageKey), JSON.stringify(state));
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
      ].join('\n')
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
