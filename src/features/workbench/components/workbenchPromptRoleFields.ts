import { PROMPT_SETTING_TEMPLATES } from '@/features/workbench/model/promptBasedSettingTemplates';
import type { PromptTaxonomyTemplateKey } from '@/features/workbench/model/promptBasedSettingTaxonomyTypes';
import { isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import type { RoleContent } from './workbenchRoleContent';
import { getRoleBaseSetting, getRoleStateSettings } from './workbenchRoleContent';
import { parseSectionedSettingBody } from './workbenchStructuredSettings';
import type { RoleStateFieldKey } from './workbenchRoleSettingFields';

export type PromptRoleField = {
  key: string;
  label: string;
  placeholder: string;
  wide?: boolean;
};

export type PromptRoleFieldSection = {
  title: string;
  fields: PromptRoleField[];
};

const SHARED_ROLE_FIELD_PLACEHOLDERS: Readonly<Record<string, string>> = {
  外貌: '身形、容貌、衣着、气质和辨识特征。',
  性格: '稳定性格、行事方式、情绪底色和关键弱点。',
  称号: '正式称号、职位称呼或江湖称号。',
  别名: '外号、化名和其他称呼。',
  人物出身: '出生地、家庭和最初身份。',
  人物经历: '改变人物性格、立场或能力的重要经历。',
  人物秘密: '人物不愿公开的秘密。',
  当前目标: '这个人物当前想达成的具体结果。',
  核心动机: '这个人物持续行动的根本原因。',
  行为原则: '做决定和行动时遵守的原则。',
  行为底线: '绝不会做、不愿触碰的事和特定禁忌。',
  语言习惯: '说话特点、口头禅、语气和常用表达。',
  标志动作: '反复出现、能让读者认出的动作。',
  角色已知信息: '这个人物当前明确掌握的信息。',
  角色错误认知: '这个人物当前相信但实际错误的内容。',
  境界修为: '当前真实境界、小层次和根基状态。',
  功法体系: '主修、辅修、特殊功法及能量来源。',
  战斗技能: '正面战斗、身法、防御、控制和逃脱手段。',
  其他技能: '炼丹、炼器、阵法、医术、情报、伪装等非正面能力。',
  战力范围: '当前可靠对付的敌人层级。',
  自身弱点: '会在哪些情况下受制、失败，以及可被怎样针对。',
  当前处境: '当前面临的主要问题或危机。',
  当前任务: '当前正在执行或必须完成的事。',
  当前风险: '当前可能导致损失、失败或暴露的风险。',
  当前地点: '当前所在位置和活动范围。',
  身体状态: '伤势、疲劳、反噬和其他身体异常。',
  精神状态: '当前情绪、心态和精神异常状态。',
  当前资源: '当前可使用的钱、物品、人脉、情报、权限和其他资源。',
  人物关系: '与主要人物的关系、态度、利益联系和可能变化。',
  隶属势力: '正式身份、名义归属、实际阵营和临时合作。',
};

const ROLE_STATE_LABEL_KEYS: Partial<Record<string, RoleStateFieldKey>> = {
  当前处境: 'currentSituation',
  当前目标: 'currentGoal',
  金手指当前解锁状态: 'abilityState',
  当前资源: 'resourceState',
};

const ROLE_FIELD_LEGACY_TITLES: Record<string, readonly string[]> = {
  性格: ['核心性格'],
  称号: ['称号/外号/别称'],
  人物经历: ['人物背景'],
  金手指当前功能: ['金手指/能力'],
};

export function getPromptRoleTemplateKey(roleType: string): PromptTaxonomyTemplateKey {
  if (isMaleProtagonistRoleType(roleType)) return 'protagonist';
  return roleType.includes('反派') ? 'antagonist' : 'supporting-role';
}

export function getPromptRoleFieldSections(roleType: string): PromptRoleFieldSection[] {
  const templateKey = getPromptRoleTemplateKey(roleType);
  return PROMPT_SETTING_TEMPLATES[templateKey].sections.map((section) => ({
    title: section.title,
    fields: section.fields.map((field) => ({
      key: `prompt:${templateKey}:${field.label}`,
      label: field.label,
      placeholder: SHARED_ROLE_FIELD_PLACEHOLDERS[field.label] ?? field.hint,
      wide: field.wide,
    })),
  }));
}

export function parsePromptRoleFields(role: RoleContent) {
  const sections = parseSectionedSettingBody(getRoleBaseSetting(role));
  const stateSettings = getRoleStateSettings(role);
  const result: Record<string, string> = {};
  getPromptRoleFieldSections(role.type).flatMap((section) => section.fields).forEach((field) => {
    const stateKey = ROLE_STATE_LABEL_KEYS[field.label];
    if (stateKey) {
      result[field.key] = stateSettings[stateKey] ?? '';
      return;
    }
    if (field.label === '人物关系') {
      result[field.key] = role.relationship ?? '';
      return;
    }
    result[field.key] =
      sections[field.label] ??
      ROLE_FIELD_LEGACY_TITLES[field.label]?.map((title) => sections[title]).find((value) => value !== undefined) ??
      '';
  });
  const hasRecognizedContent = Object.values(result).some((value) => value.trim());
  const rawBaseSetting = getRoleBaseSetting(role).trim();
  if (!hasRecognizedContent && rawBaseSetting && Object.keys(sections).length === 0) {
    const fallback = getPromptRoleFieldSections(role.type)
      .flatMap((section) => section.fields)
      .find((field) => field.label === '人物经历');
    if (fallback) result[fallback.key] = rawBaseSetting;
  }
  return result;
}

export function getPromptRoleStateKey(label: string) {
  return ROLE_STATE_LABEL_KEYS[label] ?? null;
}

export function stringifyPromptRoleBaseFields(roleType: string, fields: Record<string, string>) {
  return getPromptRoleFieldSections(roleType)
    .flatMap((section) => section.fields)
    .filter((field) => !ROLE_STATE_LABEL_KEYS[field.label] && field.label !== '人物关系')
    .map((field) => `【${field.label}】：\n${(fields[field.key] ?? '').trim()}`)
    .join('\n\n');
}
