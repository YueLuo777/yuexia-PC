import type { StructuredSettingFieldSet } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  ROLE_BASE_SETTING_FIELD_DEFINITIONS,
  ROLE_STATE_FIELD_DEFINITIONS,
} from '@/features/workbench/components/workbenchRoleSettingFields';

export type StructuredSettingPreviewGroup = {
  id: string;
  title: string;
  fieldSetIds: readonly string[];
};

export type StructuredSettingReplicaDomain = {
  id: string;
  title: string;
  count: number;
  fieldSetIds: readonly string[];
};

export const ROLE_PREVIEW_FIELD_SET: StructuredSettingFieldSet = {
  id: 'role-main-preview',
  entryType: '人物设定',
  entryTitle: '男主角',
  titleFieldLabel: '人物姓名',
  gridColumnsClassName: 'grid-cols-2',
  groups: [
    {
      title: '基础设定',
      description: '人物长期稳定的身份、外貌、性格、背景和能力规则。',
      fieldKeys: ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => field.key),
    },
    {
      title: '状态设定',
      description: '随章节推进持续变化的处境、目标、能力和资源状态。',
      fieldKeys: ROLE_STATE_FIELD_DEFINITIONS.map((field) => field.key),
    },
  ],
  fields: [
    ...ROLE_BASE_SETTING_FIELD_DEFINITIONS,
    ...ROLE_STATE_FIELD_DEFINITIONS.map((field) => ({
      key: field.key,
      title: field.title,
      placeholder: `填写人物的${field.title}，更新频率：${field.level}。`,
    })),
  ],
};

export const STRUCTURED_SETTING_PREVIEW_GROUPS: readonly StructuredSettingPreviewGroup[] = [
  {
    id: 'work',
    title: '作品与剧情',
    fieldSetIds: [
      'work-core-basic',
      'work-core-world-view',
      'work-core-cheat-advantage',
      'work-plot-blueprint',
      'work-plot-volume',
      'work-plot-payoff',
    ],
  },
  {
    id: 'faction',
    title: '势力与地图',
    fieldSetIds: ['faction-righteous-no-1', 'faction-world-map', 'faction-danger-zone'],
  },
  {
    id: 'item',
    title: '能力与资源',
    fieldSetIds: ['item-ability', 'item-resource-currency', 'item-special-resource', 'item-equipment'],
  },
  { id: 'monster', title: '怪物图鉴', fieldSetIds: ['monster-list'] },
  { id: 'foreshadow', title: '伏笔线索', fieldSetIds: ['foreshadow-main', 'foreshadow-character'] },
];

export const STRUCTURED_SETTING_REPLICA_DOMAINS: readonly StructuredSettingReplicaDomain[] = [
  { id: 'work', title: '作品设定', count: 6, fieldSetIds: STRUCTURED_SETTING_PREVIEW_GROUPS[0].fieldSetIds },
  { id: 'character', title: '人物设定', count: 1, fieldSetIds: [ROLE_PREVIEW_FIELD_SET.id] },
  { id: 'faction', title: '势力设定', count: 3, fieldSetIds: STRUCTURED_SETTING_PREVIEW_GROUPS[1].fieldSetIds },
  { id: 'item', title: '道具资源', count: 4, fieldSetIds: STRUCTURED_SETTING_PREVIEW_GROUPS[2].fieldSetIds },
  { id: 'monster', title: '怪物图鉴', count: 1, fieldSetIds: STRUCTURED_SETTING_PREVIEW_GROUPS[3].fieldSetIds },
  { id: 'foreshadow', title: '伏笔线索', count: 2, fieldSetIds: STRUCTURED_SETTING_PREVIEW_GROUPS[4].fieldSetIds },
];

export {
  getCompactStructuredFieldLayout as getCompactFieldLayout,
  getCompactStructuredTitleWidth as getCompactTitleWidth,
  getCompactStructuredVisibleFieldKeys as getVisibleFieldKeys,
} from '@/features/workbench/components/workbenchStructuredSettingCompactLayout';
