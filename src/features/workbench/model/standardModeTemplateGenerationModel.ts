import type { TemplateEntryNode, TemplateStructure } from './standardModeTemplateModel';

export const SETTING_GENERATION_CONTRACT_VERSION = 'setting-generation-v2' as const;

export type TemplateEntryInstanceMode = 'single' | 'collection';

export type TemplateGenerationStage = {
  id: string;
  name: string;
  order: number;
  description: string;
  promptName: string;
  promptGuidance: string;
};

export type TemplateEntryGenerationRule = {
  entryId: string;
  mode: TemplateEntryInstanceMode;
  required: boolean;
  titleFieldId?: string;
  minCount: number;
  recommendedCount: number;
  maxCount: number;
  stageId: string;
  dependencyEntryIds: string[];
  promptGuidance: string;
};

export type TemplateGenerationBlueprint = {
  version: 1;
  stages: TemplateGenerationStage[];
  entryRules: Record<string, TemplateEntryGenerationRule>;
};

export type SettingGenerationPromptProfile = {
  version: 1;
  id: string;
  name: string;
  revision: number;
  globalGuidance: string;
  forbiddenGuidance: string;
  stageGuidance: Record<string, string>;
  entryGuidance: Record<string, string>;
  contractVersion: typeof SETTING_GENERATION_CONTRACT_VERSION;
};

export type SettingTemplatePackage = {
  formatVersion: 3;
  id: string;
  name: string;
  revision: number;
  source: 'built-in' | 'custom';
  structure: TemplateStructure;
  generationBlueprint: TemplateGenerationBlueprint;
  promptProfile: SettingGenerationPromptProfile;
  contractVersion: typeof SETTING_GENERATION_CONTRACT_VERSION;
  updatedAt: string;
};

export type CreateSettingTemplatePackageInput<Source extends SettingTemplatePackage['source'] = SettingTemplatePackage['source']> = {
  id: string;
  name: string;
  source: Source;
  structure: TemplateStructure;
  revision?: number;
  generationBlueprint?: TemplateGenerationBlueprint;
  promptProfile?: SettingGenerationPromptProfile;
  updatedAt?: string;
};

export type TemplateGenerationValidationIssue = {
  code: string;
  message: string;
  entryId?: string;
  stageId?: string;
};

export type TemplateGenerationValidationResult = {
  valid: boolean;
  errors: TemplateGenerationValidationIssue[];
  warnings: TemplateGenerationValidationIssue[];
};

const COLLECTION_ENTRY_TITLES = new Set([
  '女主角档案', '重要配角档案', '重要正派角色', '普通配角', '阶段反派档案', '阶段反派',
  '区域档案', '关键地点档案', '秘境与遗迹', '宗门势力档案', '宗门势力', '国家与王朝',
  '家族势力', '其他势力', '功法档案', '技能档案', '法宝装备', '丹药材料', '传承机缘',
  '长线伏笔', '短线伏笔', '妖兽档案', '异族档案',
]);

const RECOMMENDED_COLLECTION_COUNTS: Record<string, number> = {
  女主角档案: 1,
  重要配角档案: 2,
  重要正派角色: 2,
  普通配角: 2,
  阶段反派档案: 1,
  阶段反派: 1,
  区域档案: 2,
  关键地点档案: 2,
  秘境与遗迹: 1,
  宗门势力档案: 2,
  宗门势力: 2,
  国家与王朝: 1,
  家族势力: 1,
  其他势力: 1,
  功法档案: 2,
  技能档案: 3,
  法宝装备: 2,
  丹药材料: 2,
  传承机缘: 1,
  长线伏笔: 2,
  短线伏笔: 2,
  妖兽档案: 2,
  异族档案: 1,
};

function cleanEntryTitle(title: string) {
  return title.replace(/\s*[（(]可重复[）)]\s*$/u, '').trim();
}

function getEnabledEntries(structure: TemplateStructure) {
  return structure
    .filter((domain) => domain.enabled)
    .flatMap((domain) => domain.groups
      .filter((group) => group.enabled)
      .flatMap((group) => group.entries
        .filter((entry) => entry.enabled)
        .map((entry) => ({ domain, group, entry }))));
}

function inferCollectionMode(entry: TemplateEntryNode) {
  const title = cleanEntryTitle(entry.title);
  return /[（(]可重复[）)]/u.test(entry.title) || COLLECTION_ENTRY_TITLES.has(title);
}

function findTitleFieldId(entry: TemplateEntryNode) {
  const fields = entry.sections
    .filter((section) => section.enabled)
    .flatMap((section) => section.fields.filter((field) => field.enabled));
  return fields.find((field) => /(名称|姓名|标题|名字)$/u.test(field.title.trim()))?.id;
}

function createEntryRule(entry: TemplateEntryNode, stageId: string): TemplateEntryGenerationRule {
  const title = cleanEntryTitle(entry.title);
  const collection = inferCollectionMode(entry);
  const titleFieldId = findTitleFieldId(entry);
  const recommendedCount = collection ? (RECOMMENDED_COLLECTION_COUNTS[title] ?? 2) : 1;
  const optional = title === '女主角档案';
  return {
    entryId: entry.id,
    mode: collection ? 'collection' : 'single',
    required: !optional,
    titleFieldId: collection
      ? (titleFieldId ?? entry.sections.flatMap((section) => section.fields)[0]?.id)
      : /(人物|主角|配角|反派|角色)/u.test(title) ? titleFieldId : undefined,
    minCount: collection ? (optional ? 0 : 1) : 1,
    recommendedCount,
    maxCount: collection ? Math.max(recommendedCount + 2, 3) : 1,
    stageId,
    dependencyEntryIds: [],
    promptGuidance: '',
  };
}

const XIANXIA_STAGE_DEFINITIONS: TemplateGenerationStage[] = [
  {
    id: 'world-foundation',
    name: '世界规则与力量',
    order: 0,
    description: '作品核心、世界结构、力量体系、修炼资源、社会规则与设定红线',
    promptName: '作品设定生成-世界基础',
    promptGuidance: '先确定不可轻易改动的世界规则、力量上限和作品承诺。',
  },
  {
    id: 'main-characters',
    name: '主角阵容与金手指',
    order: 1,
    description: '主角、重要正反派、人物关系、金手指及成长路线',
    promptName: '作品设定生成-主要人物',
    promptGuidance: '人物必须有真实姓名、明确动机、行动边界，并与世界规则和主线冲突一致。',
  },
  {
    id: 'plot-planning',
    name: '全书剧情与节奏',
    order: 2,
    description: '故事主线、阶段规划、第一卷、核心冲突、爽点、悬念与节奏',
    promptName: '作品设定生成-剧情规划',
    promptGuidance: '剧情规划必须承接已完成的世界和人物设定，并形成可执行的开篇与首卷推进。',
  },
  {
    id: 'places-and-factions',
    name: '地图势力与关系',
    order: 3,
    description: '世界地图、关键地点、主要势力、势力关系及活动范围',
    promptName: '作品设定生成-地点与势力',
    promptGuidance: '地点和势力必须服务于人物行动、资源争夺与剧情冲突，避免孤立罗列。',
  },
  {
    id: 'creation-supplements',
    name: '功法资源与伏笔',
    order: 4,
    description: '功法技能、装备资源、秘密伏笔、种族怪物及遗漏设定',
    promptName: '作品设定生成-创作补充',
    promptGuidance: '补充内容必须引用前面已确定的规则和剧情需要，禁止无约束扩张设定。',
  },
];

function getXianxiaStageId(domainTitle: string, groupTitle: string, entryTitle: string) {
  if (domainTitle === '人物设定' || groupTitle.includes('金手指') || entryTitle === '主角成长线') {
    return 'main-characters';
  }
  if (domainTitle === '剧情规划') return 'plot-planning';
  if (domainTitle === '地点地图' || domainTitle === '势力设定') return 'places-and-factions';
  if (domainTitle === '道具资源' || domainTitle === '伏笔线索' || domainTitle === '怪物图鉴') {
    return 'creation-supplements';
  }
  return 'world-foundation';
}

export function buildXianxiaTemplateGenerationBlueprint(
  structure: TemplateStructure,
  templateId = 'male-fantasy-xianxia',
): TemplateGenerationBlueprint {
  const stageNames = templateId === 'male-fantasy-xianxia-light'
    ? ['核心设定', '主角与金手指', '故事与首卷', '地点与势力', '功法与伏笔']
    : templateId === 'male-fantasy-xianxia-full'
      ? ['完整世界体系', '完整人物与金手指', '完整剧情规划', '完整地图与势力', '资源伏笔与怪物']
      : XIANXIA_STAGE_DEFINITIONS.map((stage) => stage.name);
  const stages = XIANXIA_STAGE_DEFINITIONS.map((stage, index) => ({
    ...stage,
    name: stageNames[index] ?? stage.name,
  }));
  const entryRules = Object.fromEntries(
    getEnabledEntries(structure).map(({ domain, group, entry }) => {
      const rule = createEntryRule(entry, getXianxiaStageId(domain.title, group.title, entry.title));
      return [entry.id, rule];
    }),
  );
  return { version: 1, stages, entryRules };
}

export function createDefaultSettingGenerationPromptProfile(
  id = `setting-prompt-${Date.now()}`,
  name = '设定生成提示词',
): SettingGenerationPromptProfile {
  return {
    version: 1,
    id,
    name,
    revision: 1,
    globalGuidance: '请生成具体、前后一致、可直接用于长篇创作的中文设定。',
    forbiddenGuidance: '禁止使用序号占位名、空泛描述或模板之外的字段。',
    stageGuidance: {},
    entryGuidance: {},
    contractVersion: SETTING_GENERATION_CONTRACT_VERSION,
  };
}

export function buildDefaultTemplateGenerationBlueprint(
  structure: TemplateStructure,
): TemplateGenerationBlueprint {
  const enabledDomains = structure.filter((domain) => domain.enabled);
  const stages = enabledDomains.map((domain, index) => ({
    id: `stage:${domain.id}`,
    name: domain.title,
    order: index,
    description: `生成${domain.title}中的设定。`,
    promptName: '作品设定生成',
    promptGuidance: '',
  }));
  const stageByDomainId = new Map(enabledDomains.map((domain, index) => [domain.id, stages[index]?.id ?? '']));
  const entryRules = Object.fromEntries(
    getEnabledEntries(structure).map(({ domain, entry }) => [
      entry.id,
      createEntryRule(entry, stageByDomainId.get(domain.id) ?? stages[0]?.id ?? 'stage:default'),
    ]),
  );
  return { version: 1, stages, entryRules };
}

export function normalizeTemplateGenerationBlueprint(
  structure: TemplateStructure,
  blueprint?: Partial<TemplateGenerationBlueprint> | null,
): TemplateGenerationBlueprint {
  const fallback = buildDefaultTemplateGenerationBlueprint(structure);
  const inputStages = Array.isArray(blueprint?.stages) ? blueprint.stages : [];
  const enabledStageIds = new Set(inputStages.map((stage) => stage.id));
  const stages = inputStages.length > 0
    ? inputStages.map((stage, index) => ({
        id: String(stage.id || `stage:custom-${index}`),
        name: String(stage.name || `生成步骤${index + 1}`),
        order: index,
        description: String(stage.description ?? ''),
        promptName: String(stage.promptName || '作品设定生成'),
        promptGuidance: String(stage.promptGuidance ?? ''),
      }))
    : fallback.stages;
  const fallbackStageId = stages[0]?.id ?? 'stage:default';
  const inputRules = blueprint?.entryRules && typeof blueprint.entryRules === 'object'
    ? blueprint.entryRules
    : {};
  const entryRules = Object.fromEntries(getEnabledEntries(structure).map(({ entry }) => {
    const fallbackRule = fallback.entryRules[entry.id] ?? createEntryRule(entry, fallbackStageId);
    const input = inputRules[entry.id];
    if (!input) return [entry.id, { ...fallbackRule, stageId: fallbackStageId }];
    const mode = input.mode === 'collection' ? 'collection' : 'single';
    const recommendedCount = Math.max(0, Math.floor(Number(input.recommendedCount) || fallbackRule.recommendedCount));
    const minCount = Math.max(0, Math.min(recommendedCount, Math.floor(Number(input.minCount) || 0)));
    const maxCount = Math.max(recommendedCount, Math.floor(Number(input.maxCount) || recommendedCount));
    return [entry.id, {
      ...fallbackRule,
      ...input,
      entryId: entry.id,
      mode,
      required: input.required !== false,
      titleFieldId: input.titleFieldId
        || (mode === 'collection'
          ? findTitleFieldId(entry) ?? entry.sections.flatMap((section) => section.fields)[0]?.id
          : fallbackRule.titleFieldId),
      minCount: mode === 'single' ? 1 : minCount,
      recommendedCount: mode === 'single' ? 1 : recommendedCount,
      maxCount: mode === 'single' ? 1 : maxCount,
      stageId: enabledStageIds.has(input.stageId) ? input.stageId : fallbackStageId,
      dependencyEntryIds: Array.isArray(input.dependencyEntryIds)
        ? input.dependencyEntryIds.filter((id) => id !== entry.id)
        : [],
      promptGuidance: String(input.promptGuidance ?? ''),
    } satisfies TemplateEntryGenerationRule];
  }));
  return { version: 1, stages, entryRules };
}

function hasDependencyCycle(entryRules: Record<string, TemplateEntryGenerationRule>) {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (entryId: string): boolean => {
    if (visiting.has(entryId)) return true;
    if (visited.has(entryId)) return false;
    visiting.add(entryId);
    const cyclic = (entryRules[entryId]?.dependencyEntryIds ?? [])
      .filter((dependencyId) => entryRules[dependencyId])
      .some(visit);
    visiting.delete(entryId);
    visited.add(entryId);
    return cyclic;
  };
  return Object.keys(entryRules).some(visit);
}

export function validateTemplateGenerationBlueprint(
  structure: TemplateStructure,
  blueprint: TemplateGenerationBlueprint,
): TemplateGenerationValidationResult {
  const errors: TemplateGenerationValidationIssue[] = [];
  const warnings: TemplateGenerationValidationIssue[] = [];
  const stageIds = new Set(blueprint.stages.map((stage) => stage.id));
  const protocolIdPattern = /^[^\]\r\n]+$/;
  if (blueprint.stages.length === 0) {
    errors.push({ code: 'missing-stages', message: '至少需要一个生成步骤。' });
  }
  if (stageIds.size !== blueprint.stages.length) {
    errors.push({ code: 'duplicate-stage-id', message: '生成步骤存在重复内部ID。' });
  }
  blueprint.stages.forEach((stage) => {
    if (!protocolIdPattern.test(stage.id)) {
      errors.push({ code: 'invalid-stage-id', stageId: stage.id, message: `生成步骤“${stage.name}”的内部ID不符合输出协议。` });
    }
  });
  const enabledEntries = getEnabledEntries(structure);
  const enabledEntryIds = new Set(enabledEntries.map(({ entry }) => entry.id));
  enabledEntries.forEach(({ entry }) => {
    const rule = blueprint.entryRules[entry.id];
    if (!rule) {
      errors.push({ code: 'missing-entry-rule', entryId: entry.id, message: `“${entry.title}”缺少生成规则。` });
      return;
    }
    if (!protocolIdPattern.test(entry.id)) {
      errors.push({ code: 'invalid-entry-id', entryId: entry.id, message: `“${entry.title}”的内部ID不符合输出协议。` });
    }
    if (!stageIds.has(rule.stageId)) {
      errors.push({ code: 'missing-entry-stage', entryId: entry.id, message: `“${entry.title}”没有有效生成步骤。` });
    }
    if (rule.mode === 'collection') {
      const fieldIds = new Set(entry.sections.flatMap((section) => section.fields.map((field) => field.id)));
      if (!rule.titleFieldId || !fieldIds.has(rule.titleFieldId)) {
        errors.push({ code: 'missing-title-field', entryId: entry.id, message: `“${entry.title}”允许多项，但没有有效名称字段。` });
      }
      if (rule.minCount > rule.recommendedCount || rule.recommendedCount > rule.maxCount) {
        errors.push({ code: 'invalid-count-policy', entryId: entry.id, message: `“${entry.title}”的生成数量范围无效。` });
      }
    }
    entry.sections.flatMap((section) => section.fields).forEach((field) => {
      if (!protocolIdPattern.test(field.id)) {
        errors.push({ code: 'invalid-field-id', entryId: entry.id, message: `“${entry.title} / ${field.title}”的内部ID不符合输出协议。` });
      }
    });
    rule.dependencyEntryIds.forEach((dependencyId) => {
      if (!enabledEntryIds.has(dependencyId)) {
        errors.push({ code: 'missing-dependency', entryId: entry.id, message: `“${entry.title}”引用了不存在的依赖设定。` });
      }
    });
    if (!rule.promptGuidance.trim()) {
      warnings.push({ code: 'missing-entry-guidance', entryId: entry.id, message: `“${entry.title}”尚未填写专属生成说明。` });
    }
  });
  blueprint.stages.forEach((stage) => {
    if (!Object.values(blueprint.entryRules).some((rule) => rule.stageId === stage.id)) {
      errors.push({ code: 'empty-stage', stageId: stage.id, message: `生成步骤“${stage.name}”尚未分配任何设定。` });
    }
  });
  const stageOrder = new Map(blueprint.stages.map((stage, index) => [stage.id, index]));
  Object.values(blueprint.entryRules).forEach((rule) => {
    rule.dependencyEntryIds.forEach((dependencyId) => {
      const dependency = blueprint.entryRules[dependencyId];
      if (dependency && (stageOrder.get(dependency.stageId) ?? 0) > (stageOrder.get(rule.stageId) ?? 0)) {
        errors.push({
          code: 'dependency-after-entry',
          entryId: rule.entryId,
          message: '设定依赖被安排在更晚的生成步骤中，请调整步骤或依赖关系。',
        });
      }
    });
  });
  if (hasDependencyCycle(blueprint.entryRules)) {
    errors.push({ code: 'dependency-cycle', message: '设定依赖关系存在循环。' });
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function cloneSettingGenerationPromptProfile(
  profile: SettingGenerationPromptProfile,
): SettingGenerationPromptProfile {
  return {
    ...profile,
    stageGuidance: { ...profile.stageGuidance },
    entryGuidance: { ...profile.entryGuidance },
    contractVersion: SETTING_GENERATION_CONTRACT_VERSION,
  };
}

export function normalizeSettingGenerationPromptProfile(
  templateId: string,
  templateName: string,
  profile?: Partial<SettingGenerationPromptProfile> | null,
): SettingGenerationPromptProfile {
  const fallback = createDefaultSettingGenerationPromptProfile(
    `setting-prompt:${templateId}`,
    `${templateName}提示词`,
  );
  if (!profile || profile.contractVersion !== SETTING_GENERATION_CONTRACT_VERSION) return fallback;
  return {
    version: 1,
    id: typeof profile.id === 'string' && profile.id.trim() ? profile.id : fallback.id,
    name: typeof profile.name === 'string' && profile.name.trim() ? profile.name : fallback.name,
    revision: Number.isInteger(profile.revision) && Number(profile.revision) > 0 ? Number(profile.revision) : 1,
    globalGuidance: typeof profile.globalGuidance === 'string' ? profile.globalGuidance : fallback.globalGuidance,
    forbiddenGuidance: typeof profile.forbiddenGuidance === 'string'
      ? profile.forbiddenGuidance
      : fallback.forbiddenGuidance,
    stageGuidance: profile.stageGuidance && typeof profile.stageGuidance === 'object'
      ? { ...profile.stageGuidance }
      : {},
    entryGuidance: profile.entryGuidance && typeof profile.entryGuidance === 'object'
      ? { ...profile.entryGuidance }
      : {},
    contractVersion: SETTING_GENERATION_CONTRACT_VERSION,
  };
}

export function createSettingTemplatePackage<Source extends SettingTemplatePackage['source']>({
  id,
  name,
  source,
  structure,
  revision = 1,
  generationBlueprint,
  promptProfile,
  updatedAt = new Date().toLocaleString('zh-CN'),
}: CreateSettingTemplatePackageInput<Source>): Omit<SettingTemplatePackage, 'source'> & { source: Source } {
  const clonedStructure = structure.map((domain) => ({
    ...domain,
    groups: domain.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => ({
        ...entry,
        sections: entry.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({ ...field })),
        })),
      })),
    })),
  }));
  return {
    formatVersion: 3,
    id,
    name,
    revision: Math.max(1, Math.floor(revision)),
    source,
    structure: clonedStructure,
    generationBlueprint: normalizeTemplateGenerationBlueprint(clonedStructure, generationBlueprint),
    promptProfile: normalizeSettingGenerationPromptProfile(id, name, promptProfile),
    contractVersion: SETTING_GENERATION_CONTRACT_VERSION,
    updatedAt,
  };
}
