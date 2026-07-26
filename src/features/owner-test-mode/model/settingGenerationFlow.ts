export type SettingGenerationStep = {
  id: string;
  name: string;
  scope: string;
  modelId: string;
  promptId: string;
  includePreviousResults: boolean;
};

export type SettingGenerationFlow = {
  version: 1;
  steps: SettingGenerationStep[];
};

export const SETTING_GENERATION_FLOW_STORAGE_KEY = 'xinyuexia_owner_setting_generation_flow_v1';

const DEFAULT_STEP_BLUEPRINTS = [
  ['世界基础', '作品定位、世界背景、力量体系、设定红线'],
  ['剧情规划', '整体剧情、第一卷、爽点设计、创作规范、剧情时间线'],
  ['主要人物', '男主角、女主角及主要配角'],
  ['地点与势力', '地点地图、势力设定'],
  ['创作补充', '道具资源、伏笔线索、怪物图鉴'],
] as const;

function createStep(index: number, name = `生成步骤${index + 1}`, scope = ''): SettingGenerationStep {
  return {
    id: `setting-flow-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    scope,
    modelId: '',
    promptId: '',
    includePreviousResults: index > 0,
  };
}

export function createDefaultSettingGenerationFlow(): SettingGenerationFlow {
  return {
    version: 1,
    steps: DEFAULT_STEP_BLUEPRINTS.map(([name, scope], index) => createStep(index, name, scope)),
  };
}

function normalizeStep(value: unknown, index: number): SettingGenerationStep | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<SettingGenerationStep>;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createStep(index).id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : `生成步骤${index + 1}`,
    scope: typeof raw.scope === 'string' ? raw.scope : '',
    modelId: typeof raw.modelId === 'string' ? raw.modelId : '',
    promptId: typeof raw.promptId === 'string' ? raw.promptId : '',
    includePreviousResults: index > 0 && raw.includePreviousResults !== false,
  };
}

export function readSettingGenerationFlow(): SettingGenerationFlow {
  if (typeof window === 'undefined') return createDefaultSettingGenerationFlow();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTING_GENERATION_FLOW_STORAGE_KEY) ?? 'null') as {
      steps?: unknown[];
    } | null;
    const steps = parsed?.steps?.map(normalizeStep).filter((step): step is SettingGenerationStep => Boolean(step)) ?? [];
    return steps.length > 0 ? { version: 1, steps } : createDefaultSettingGenerationFlow();
  } catch {
    return createDefaultSettingGenerationFlow();
  }
}

export function writeSettingGenerationFlow(flow: SettingGenerationFlow) {
  window.localStorage.setItem(SETTING_GENERATION_FLOW_STORAGE_KEY, JSON.stringify(flow));
}

export function appendSettingGenerationStep(flow: SettingGenerationFlow): SettingGenerationFlow {
  return { ...flow, steps: [...flow.steps, createStep(flow.steps.length)] };
}
