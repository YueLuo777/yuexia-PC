export type RoleStateFieldKey = 'currentSituation' | 'currentGoal' | 'abilityState' | 'resourceState' | 'otherState';

export type RoleStateFieldLevel = '每章更新' | '变化时更新' | '按需关联' | '硬性约束';

export type RoleStateSettings = Record<RoleStateFieldKey, string>;
export type RoleStateUpdateChapterKey = RoleStateFieldKey | 'relationshipState';
export type RoleStateUpdateChapters = Partial<Record<RoleStateUpdateChapterKey, number>>;
export type RoleBaseSettingFieldKey = 'appearance' | 'aliasName' | 'corePersonality' | 'background' | 'abilityRules';

export const ROLE_STATE_FIELD_DEFINITIONS: Array<{
  key: RoleStateFieldKey;
  title: string;
  level: RoleStateFieldLevel;
}> = [
  { key: 'currentSituation', title: '当前处境', level: '每章更新' },
  { key: 'currentGoal', title: '当前目标', level: '每章更新' },
  { key: 'abilityState', title: '能力状态', level: '每章更新' },
  { key: 'resourceState', title: '资源状态', level: '变化时更新' },
  { key: 'otherState', title: '其他', level: '按需关联' },
];

export const ROLE_BASE_SETTING_FIELD_DEFINITIONS: Array<{
  key: RoleBaseSettingFieldKey;
  title: string;
  placeholder: string;
}> = [
  { key: 'appearance', title: '外貌', placeholder: '身形、容貌、衣着、气质、标志性细节。' },
  { key: 'aliasName', title: '称号/外号/别称', placeholder: '江湖称号、常用外号、化名、别称或他人称呼。' },
  { key: 'corePersonality', title: '性格', placeholder: '稳定性格、行事原则、情绪底色和关键弱点。' },
  { key: 'background', title: '人物背景', placeholder: '出身、经历、秘密、创伤、目标来源。' },
  { key: 'abilityRules', title: '金手指/能力', placeholder: '能力来源、边界、代价、限制和成长规则。' },
];
