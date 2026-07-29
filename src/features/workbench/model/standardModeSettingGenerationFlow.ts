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
      error: typeof parsed.error === 'string' ? parsed.error : '',
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
}

export type StandardSettingLastRequest = {
  createdAt: string;
  stepName: string;
  promptName: string;
  userContent: string;
};

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
  return [
    promptContent.trim(),
    '【当前生成步骤】',
    step.name,
    '【本步只生成】',
    step.scope,
    '以下写入规则优先级最高；如果前面的提示词要求新建设定、自由命名或改变分组，以这里的规则为准。',
    '【本步骤只能写入以下原有设定】',
    formatStandardSettingGenerationTargets(targets),
    brainstorm.trim() ? `【关联脑洞】\n${brainstorm.trim()}` : '',
    existingSettings.trim() ? `【已经完成的设定】\n${existingSettings.trim()}` : '',
    requirement.trim() ? `【用户补充要求】\n${requirement.trim()}` : '',
    '【输出要求】',
    '你是在填写软件中已经存在的设定，不是在创建设定。只能输出上面列出的原有设定，设定名、所属分组和字段名必须逐字一致；禁止新增、改名、合并或在设定名后追加内容。每个设定只能出现一次，必须填写到对应的原有字段中。严格照下面的标签骨架输出，把“填写该字段内容”替换成完整设定正文；不要输出骨架之外的任何内容。',
    buildStandardSettingGenerationOutputTemplate(targets),
    '只写用户可见的中文设定内容，禁止输出JSON、Markdown代码块以及type、body、structuredFieldSetId、lockedDefaultEntryId等软件内部字段。不要解释，不要寒暄。',
  ]
    .filter(Boolean)
    .join('\n\n');
}
