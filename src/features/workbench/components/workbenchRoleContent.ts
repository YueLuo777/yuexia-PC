import { wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import { normalizeWorkbenchRoleLifeStatus, normalizeWorkbenchRoleType } from '@/features/workbench/model/workbenchRoleTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { parseSectionedSettingBody } from './workbenchStructuredSettings';
import {
  ROLE_BASE_SETTING_FIELD_DEFINITIONS,
  ROLE_STATE_FIELD_DEFINITIONS,
  type RoleBaseSettingFieldKey,
  type RoleStateFieldKey,
  type RoleStateSettings,
  type RoleStateUpdateChapters,
} from './workbenchRoleSettingFields';

export interface RoleContent {
  type: string;
  lifeStatus: '存活' | '死亡';
  baseSetting: string;
  relationship: string;
  stateSettings: RoleStateSettings;
  stateUpdateChapters?: RoleStateUpdateChapters;
  personality: string;
  background: string;
  status: string;
  history?: RoleHistoryVersion[];
}


export interface RoleHistoryVersion {
  title: string;
  type: string;
  lifeStatus: '存活' | '死亡';
  baseSetting: string;
  relationship: string;
  stateSettings: RoleStateSettings;
  stateUpdateChapters?: RoleStateUpdateChapters;
  personality: string;
  background: string;
  status: string;
  savedAt: string;
}


export const ROLE_HISTORY_LIMIT = 20;


function truncateTextForAi(content: string, maxLength: number) {
  const text = content.trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}……`;
}



export function createEmptyRoleStateSettings(): RoleStateSettings {
  return ROLE_STATE_FIELD_DEFINITIONS.reduce((result, field) => ({
    ...result,
    [field.key]: '',
  }), {} as RoleStateSettings);
}

export function normalizeRoleStateSettings(value: unknown, legacyStatus = ''): RoleStateSettings {
  const next = createEmptyRoleStateSettings();
  if (value && typeof value === 'object') {
    const record = value as Partial<Record<RoleStateFieldKey, unknown>>;
    ROLE_STATE_FIELD_DEFINITIONS.forEach((field) => {
      const fieldValue = record[field.key];
      next[field.key] = typeof fieldValue === 'string' ? fieldValue : '';
    });
  }
  if (!ROLE_STATE_FIELD_DEFINITIONS.some((field) => next[field.key].trim()) && legacyStatus.trim()) {
    next.currentSituation = legacyStatus;
  }
  return next;
}

export function normalizeRoleStateUpdateChapters(value: unknown): RoleStateUpdateChapters {
  const next: RoleStateUpdateChapters = {};
  if (!value || typeof value !== 'object') return next;
  const record = value as Partial<Record<RoleStateFieldKey, unknown>>;
  ROLE_STATE_FIELD_DEFINITIONS.forEach((field) => {
    const chapter = record[field.key];
    if (typeof chapter === 'number' && Number.isFinite(chapter) && chapter > 0) {
      next[field.key] = Math.floor(chapter);
    }
  });
  return next;
}

function buildLegacyRoleBaseSetting(parsed: Partial<RoleContent>) {
  return [
    parsed.personality?.trim() ? `人物设定：${parsed.personality.trim()}` : '',
    parsed.background?.trim() ? parsed.background.trim() : '',
  ].filter(Boolean).join('\n\n');
}

export function getRoleBaseSetting(role: RoleContent) {
  return role.baseSetting?.trim()
    ? role.baseSetting
    : buildLegacyRoleBaseSetting(role);
}

export function getRoleStateSettings(role: RoleContent) {
  return normalizeRoleStateSettings(role.stateSettings, role.status);
}

export function getRoleStateUpdateChapters(role: RoleContent) {
  return normalizeRoleStateUpdateChapters(role.stateUpdateChapters);
}

export function getRoleStateUpdateLabel(chapter: number | undefined) {
  return chapter ? `更新至第${chapter}章` : '未记录章节';
}

export function buildRoleStateSettingsText(settings: RoleStateSettings) {
  return ROLE_STATE_FIELD_DEFINITIONS
    .map((field) => {
      const content = settings[field.key].trim();
      return content ? `${field.title}：${content}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

export function getRoleReadableContent(role: RoleContent) {
  return [
    getRoleBaseSetting(role),
    role.relationship?.trim() ? `人物关系：${role.relationship.trim()}` : '',
    buildRoleStateSettingsText(getRoleStateSettings(role)),
  ].filter((part) => part.trim()).join('\n\n');
}

export function parseRoleContent(content: string): RoleContent {
  try {
    const parsed = JSON.parse(content) as Partial<RoleContent>;
    const type = normalizeWorkbenchRoleType(parsed.type);
    const lifeStatus = normalizeWorkbenchRoleLifeStatus(type, parsed.lifeStatus);
    const baseSetting = typeof parsed.baseSetting === 'string'
      ? parsed.baseSetting
      : buildLegacyRoleBaseSetting(parsed);
    const stateSettings = normalizeRoleStateSettings(parsed.stateSettings, parsed.status);
    const stateUpdateChapters = normalizeRoleStateUpdateChapters(parsed.stateUpdateChapters);
    return {
      type,
      lifeStatus,
      baseSetting,
      relationship: parsed.relationship || '',
      stateSettings,
      stateUpdateChapters,
      personality: parsed.personality || '',
      background: parsed.background || baseSetting,
      status: parsed.status || buildRoleStateSettingsText(stateSettings),
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, ROLE_HISTORY_LIMIT) : [],
    };
  } catch {
    const stateSettings = createEmptyRoleStateSettings();
    return {
      type: '未分类',
      lifeStatus: '存活',
      baseSetting: content || '',
      relationship: '',
      stateSettings,
      stateUpdateChapters: {},
      personality: '',
      background: content || '',
      status: '',
      history: [],
    };
  }
}

export function stringifyRoleContent(value: RoleContent) {
  const type = normalizeWorkbenchRoleType(value.type);
  const baseSetting = getRoleBaseSetting(value);
  const stateSettings = getRoleStateSettings(value);
  const stateUpdateChapters = getRoleStateUpdateChapters(value);
  return JSON.stringify({
    ...value,
    type,
    lifeStatus: normalizeWorkbenchRoleLifeStatus(type, value.lifeStatus),
    baseSetting,
    relationship: value.relationship || '',
    stateSettings,
    stateUpdateChapters,
    background: value.background || baseSetting,
    status: value.status || buildRoleStateSettingsText(stateSettings),
  });
}

export function buildRoleReaderContent(entry: WorkbenchLibraryEntry, role: RoleContent) {
  const baseSetting = getRoleBaseSetting(role);
  const stateText = buildRoleStateSettingsText(getRoleStateSettings(role));
  const baseContent = [
    `角色名：${entry.title || '未命名角色'}`,
    `角色分类：${normalizeWorkbenchRoleType(role.type) || '未分类'}`,
    truncateTextForAi(baseSetting, 900),
  ].filter(Boolean).join('\n\n');
  const stateContent = [
    `生存状态：${role.lifeStatus}`,
    truncateTextForAi(stateText, 900),
  ].filter(Boolean).join('\n\n');
  return [
    wrapAiRequestTag('基础设定', baseContent),
    role.relationship.trim() ? wrapAiRequestTag('人物关系', truncateTextForAi(role.relationship, 700)) : '',
    wrapAiRequestTag('状态设定', stateContent),
  ].filter(Boolean).join('\n\n');
}

export function createRoleHistoryVersion(entry: WorkbenchLibraryEntry, role: RoleContent): RoleHistoryVersion {
  return {
    title: entry.title,
    type: role.type,
    lifeStatus: role.lifeStatus,
    baseSetting: getRoleBaseSetting(role),
    relationship: role.relationship,
    stateSettings: getRoleStateSettings(role),
    stateUpdateChapters: getRoleStateUpdateChapters(role),
    personality: role.personality,
    background: role.background,
    status: role.status,
    savedAt: new Date().toLocaleString('zh-CN'),
  };
}

function isSameRoleVersion(left: RoleHistoryVersion, right: RoleHistoryVersion) {
  return left.title === right.title &&
    left.type === right.type &&
    left.lifeStatus === right.lifeStatus &&
    left.baseSetting === right.baseSetting &&
    left.relationship === right.relationship &&
    JSON.stringify(left.stateSettings) === JSON.stringify(right.stateSettings) &&
    JSON.stringify(left.stateUpdateChapters ?? {}) === JSON.stringify(right.stateUpdateChapters ?? {}) &&
    left.personality === right.personality &&
    left.background === right.background &&
    left.status === right.status;
}

export function appendRoleHistory(history: RoleHistoryVersion[] | undefined, version: RoleHistoryVersion) {
  const current = history ?? [];
  if (current[0] && isSameRoleVersion(current[0], version)) return current.slice(0, ROLE_HISTORY_LIMIT);
  return [version, ...current].slice(0, ROLE_HISTORY_LIMIT);
}




export function createEmptyRoleBaseSettingFields() {
  return ROLE_BASE_SETTING_FIELD_DEFINITIONS.reduce((result, field) => {
    result[field.key] = '';
    return result;
  }, {} as Record<RoleBaseSettingFieldKey, string>);
}

export function parseRoleBaseSettingFields(body: string) {
  const sections = parseSectionedSettingBody(body);
  const fields = createEmptyRoleBaseSettingFields();
  const hasSectionedContent = ROLE_BASE_SETTING_FIELD_DEFINITIONS.some((field) => sections[field.title] !== undefined);
  ROLE_BASE_SETTING_FIELD_DEFINITIONS.forEach((field) => {
    fields[field.key] = sections[field.title] ?? '';
  });
  if (!hasSectionedContent && body.trim()) {
    fields.background = body;
  }
  return fields;
}

export function stringifyRoleBaseSettingFields(fields: Record<RoleBaseSettingFieldKey, string>) {
  return ROLE_BASE_SETTING_FIELD_DEFINITIONS
    .map((field) => `【${field.title}】：\n${fields[field.key].trim()}`)
    .join('\n\n');
}
