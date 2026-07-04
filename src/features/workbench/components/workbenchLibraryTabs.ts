import { DEFAULT_SETTING_TYPES } from '@/features/workbench/model/workbenchSettingTaxonomy';
import type { WorkbenchFieldSizeKey } from './workbenchFieldSizeSettings';

export const ROLE_TAB = '角色';
export const BRAINSTORM_TAB = '脑洞';
export const SETTING_TAB = '大纲';
export const PROMPT_SETTING_CATEGORY = '设定';
export const DETAIL_OUTLINE_TAB = '细纲';
export const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';
export const PLOT_CHAIN_PROMPT_CATEGORY = DETAIL_OUTLINE_PROMPT_CATEGORY;
export const DETAIL_OUTLINE_DISPLAY_LABEL = '章纲';
export const OUTLINE_LIBRARY_TAB = '梗概';
export const LEGACY_OUTLINE_LIBRARY_TAB = '摘要';
export const LEGACY_OUTLINE_LIBRARY_TAB_OLD = '概要';
export const BRAINSTORM_TYPE = '脑洞库';
export const CHAPTER_SUMMARY_TAB = '章节梗概';
export const LEGACY_CHAPTER_SUMMARY_TAB = '章节摘要';
export const LEGACY_CHAPTER_SUMMARY_TAB_OLD = '章节概要';
export const VOLUME_SUMMARY_TAB = '卷梗概';
export const LEGACY_VOLUME_SUMMARY_TAB = '卷摘要';
export const LEGACY_VOLUME_SUMMARY_TAB_OLD = '卷概要';
export const CHAPTER_DETAIL_OUTLINE_TAB = '章节细纲';
export const SETTING_LIBRARY_TABS = new Set([ROLE_TAB, BRAINSTORM_TAB, SETTING_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB]);
export const UNCATEGORIZED_TYPE = '未分类';
export const DEFAULT_SETTING_ENTRY_TYPE = DEFAULT_SETTING_TYPES[0] ?? UNCATEGORIZED_TYPE;

export const WORKBENCH_FIELD_SIZE_KEYS_BY_TAB: Record<string, WorkbenchFieldSizeKey[]> = {
  [SETTING_TAB]: ['settingName', 'settingModelSelect', 'settingPromptSelect'],
  [ROLE_TAB]: ['roleSearch', 'roleDetailName', 'roleDetailCategory', 'roleModelSelect', 'rolePromptSelect'],
  [BRAINSTORM_TAB]: ['brainstormModelSelect', 'brainstormPromptSelect'],
  [OUTLINE_LIBRARY_TAB]: ['outlineSummaryModelSelect', 'outlineSummaryPromptSelect'],
  [DETAIL_OUTLINE_TAB]: ['detailOutlineModelSelect', 'detailOutlinePromptSelect'],
};

export function getWorkbenchFieldSizeTabLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === OUTLINE_LIBRARY_TAB) return '章节梗概';
  if (tab === DETAIL_OUTLINE_TAB) return '生成章纲';
  return tab;
}

export function getWorkbenchTabDisplayLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === DETAIL_OUTLINE_TAB) return DETAIL_OUTLINE_DISPLAY_LABEL;
  if (tab === CHAPTER_DETAIL_OUTLINE_TAB) return '章节章纲';
  return tab;
}


export function normalizeTabName(tab: string) {
  if (tab === '角色库') return ROLE_TAB;
  if (tab === '设定') return SETTING_TAB;
  if (tab === '设定库') return SETTING_TAB;
  if (tab === '摘要库' || tab === '概要库' || tab === LEGACY_OUTLINE_LIBRARY_TAB || tab === LEGACY_OUTLINE_LIBRARY_TAB_OLD) return OUTLINE_LIBRARY_TAB;
  if (tab === LEGACY_CHAPTER_SUMMARY_TAB || tab === LEGACY_CHAPTER_SUMMARY_TAB_OLD) return CHAPTER_SUMMARY_TAB;
  if (tab === LEGACY_VOLUME_SUMMARY_TAB || tab === LEGACY_VOLUME_SUMMARY_TAB_OLD) return VOLUME_SUMMARY_TAB;
  return tab;
}

export function isSettingLikeTab(tab: string) {
  return tab === BRAINSTORM_TAB || tab === SETTING_TAB;
}

export function isDetailOutlineLikeTab(tab: string) {
  return tab === DETAIL_OUTLINE_TAB || tab === DETAIL_OUTLINE_DISPLAY_LABEL || tab === CHAPTER_DETAIL_OUTLINE_TAB;
}

