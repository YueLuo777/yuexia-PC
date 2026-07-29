export const DEFAULT_WORKBENCH_ROLE_TYPES = [
  '男主角',
  '女主角',
  '重要正派角色',
  '正派配角',
  '重要反派角色',
  '反派配角',
  '龙套角色',
];

export function normalizeWorkbenchRoleType(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '未分类') return '龙套角色';
  if (trimmed === '男女主' || trimmed === '男主') return '男主角';
  if (trimmed === '女主') return '女主角';
  if (trimmed === '重要配角' || trimmed === '正派重要角色') return '重要正派角色';
  if (trimmed === '普通配角') return '正派配角';
  if (trimmed === '重要反派') return '重要反派角色';
  if (trimmed === '反派') return '重要反派角色';
  if (trimmed === '其他角色') return '龙套角色';
  if (trimmed === '龙套') return '龙套角色';
  return trimmed;
}

export type WorkbenchRoleLifeStatus = '存活' | '死亡';

export function isMaleProtagonistRoleType(value?: string | null) {
  return normalizeWorkbenchRoleType(value) === '男主角';
}

export function isDefaultWorkbenchRoleType(value?: string | null) {
  return DEFAULT_WORKBENCH_ROLE_TYPES.includes(normalizeWorkbenchRoleType(value));
}

export function normalizeWorkbenchRoleLifeStatus(
  roleType?: string | null,
  lifeStatus?: string | null,
): WorkbenchRoleLifeStatus {
  if (isMaleProtagonistRoleType(roleType)) return '存活';
  return lifeStatus === '死亡' ? '死亡' : '存活';
}

export function shouldShowRolePinAction(roleType?: string | null) {
  return !isMaleProtagonistRoleType(roleType);
}

export function canCreateWorkbenchRoleInType(existingTypes: string[], targetType: string) {
  const normalizedTargetType = normalizeWorkbenchRoleType(targetType);
  if (normalizedTargetType !== '男主角') return true;
  return !existingTypes.some((type) => normalizeWorkbenchRoleType(type) === '男主角');
}
