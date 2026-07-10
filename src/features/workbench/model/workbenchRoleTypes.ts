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
  if (trimmed === '重要反派') return '重要反派角色';
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

export function getDefaultPlotChainRoleIds(roles: Array<{ id: string; group: string }>) {
  return roles.filter((role) => normalizeWorkbenchRoleType(role.group) === '男主角').map((role) => role.id);
}

export function getInitialPlotChainRoleIds({
  configuredRoleIds,
  plotPointStandalone,
  roles,
}: {
  configuredRoleIds?: string[];
  plotPointStandalone: boolean;
  roles: Array<{ id: string; group: string }>;
}) {
  if (!plotPointStandalone) return [];
  const defaultRoleIds = getDefaultPlotChainRoleIds(roles);
  return Array.from(new Set([...(configuredRoleIds ?? []), ...defaultRoleIds]));
}

export function canCreateWorkbenchRoleInType(existingTypes: string[], targetType: string) {
  const normalizedTargetType = normalizeWorkbenchRoleType(targetType);
  if (normalizedTargetType !== '男主角') return true;
  return !existingTypes.some((type) => normalizeWorkbenchRoleType(type) === '男主角');
}

export function getMaleProtagonistNames(roles: Array<{ title: string; group: string }>) {
  return roles
    .filter((role) => normalizeWorkbenchRoleType(role.group) === '男主角')
    .map((role) => role.title.trim())
    .filter(Boolean);
}

export function getPlotPointProtagonistReplacementRule(roles: Array<{ title: string; group: string }>) {
  const protagonistNames = getMaleProtagonistNames(roles);
  if (protagonistNames.length === 0) return '';
  const protagonistName = protagonistNames[0];
  return `主角变量替换硬规则：无论剧情点来源是剧情库、AI生成还是混合来源，输出中凡是“主角”“男主”“主人公”“原剧情主角”这类主角占位，都必须默认改成本书男主名字“${protagonistName}”，不要保留“主角”占位词，也不要照抄剧情库原小说的主角名。`;
}
