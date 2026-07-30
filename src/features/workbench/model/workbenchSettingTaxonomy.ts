import { PROMPT_BASED_SETTING_DOMAINS } from './promptBasedSettingTaxonomyData';

const getPromptTaxonomyDomain = (id: string) => {
  const domain = PROMPT_BASED_SETTING_DOMAINS.find((item) => item.id === id);
  if (!domain) throw new Error(`Missing setting taxonomy domain: ${id}`);
  return domain;
};

const WORK_DOMAIN = getPromptTaxonomyDomain('work');

export const BASIC_SETTING_ENTRY_TYPE = '核心设定';
export const BASIC_SETTING_ENTRY_TITLE = '作品定位';

export const DEFAULT_WORK_SETTING_TYPES = WORK_DOMAIN.groups.map((group) => group.title);

export const DEFAULT_WORK_SETTING_STARTER_VERSION = '2026-07-24-prompt-taxonomy-v1';

const SETTING_DOMAIN_IDS = ['location', 'faction', 'resource', 'foreshadow', 'monster'] as const;
const SETTING_DOMAIN_WORKSPACE_IDS = {
  location: 'setting:location',
  faction: 'setting:faction',
  resource: 'setting:item',
  foreshadow: 'setting:foreshadow',
  monster: 'setting:monster',
} as const;

export const SETTING_WORKSPACE_DOMAIN_GROUPS: Record<string, string[]> = {
  'setting:plot': [],
  ...Object.fromEntries(
    SETTING_DOMAIN_IDS.map((domainId) => [
      SETTING_DOMAIN_WORKSPACE_IDS[domainId],
      getPromptTaxonomyDomain(domainId).groups.map((group) => group.title),
    ]),
  ),
};

export const DEFAULT_WORK_SETTING_STARTER_ENTRIES = [
  ...WORK_DOMAIN.groups.flatMap((group) =>
    group.entries.map((entry) => ({ type: group.title, title: entry.title, template: entry.template })),
  ),
  { type: '世界总览', title: '世界架构', template: 'world-structure' },
  { type: '危险区域', title: '危险区域', template: 'danger-zone' },
  { type: '正派势力', title: '1号势力', template: 'faction' },
  { type: '功法能力', title: '功法能力', template: 'ability' },
  { type: '物品装备', title: '物品装备', template: 'item' },
  { type: '特殊资源', title: '特殊资源', template: 'special-resource' },
  { type: '资源货币', title: '资源货币', template: 'currency' },
  { type: '主线伏笔', title: '1号主线伏笔', template: 'foreshadow' },
  { type: '人物伏笔', title: '1号人物伏笔', template: 'foreshadow' },
  { type: '世界伏笔', title: '1号世界伏笔', template: 'foreshadow' },
  { type: '其他线索', title: '1号其他线索', template: 'foreshadow' },
  { type: '常见怪物', title: '怪物图鉴', template: 'monster' },
] as const;

const normalizeSettingTaxonomyType = (value: string | undefined) => value?.trim() || '未分类';

export const getDefaultWorkSettingEntryId = (type: string, title: string) =>
  `${normalizeSettingTaxonomyType(type)}::${title.trim()}`;

export const DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS: ReadonlySet<string> = new Set(
  DEFAULT_WORK_SETTING_STARTER_ENTRIES.map((item) => getDefaultWorkSettingEntryId(item.type, item.title)),
);

export const SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES: Record<string, string> = {
  作品设定: DEFAULT_WORK_SETTING_TYPES[0],
  地点地图: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:location'][0],
  势力设定: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:faction'][0],
  道具资源: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:item'][0],
  伏笔线索: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:foreshadow'][0],
  怪物图鉴: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:monster'][0],
};

export const SETTING_IMPORT_ROLE_TOP_LABELS = new Set(['人物设定', '角色设定']);

export const DEFAULT_SETTING_TYPES = [
  ...DEFAULT_WORK_SETTING_TYPES,
  ...Object.values(SETTING_WORKSPACE_DOMAIN_GROUPS).flat(),
];

export const DEFAULT_SETTING_TYPE_DOMAINS = Object.fromEntries(
  Object.entries(SETTING_WORKSPACE_DOMAIN_GROUPS).flatMap(([domain, groups]) => groups.map((group) => [group, domain])),
) as Record<string, string>;

export const SETTING_TAXONOMY_LEGACY_ENTRY_MAP: Record<string, { type: string; title: string }> = {
  '核心设定::基础设定': { type: '核心设定', title: '作品定位' },
  '核心设定::世界观': { type: '核心设定', title: '世界背景' },
  '剧情规划::剧情蓝图': { type: '剧情规划', title: '整体剧情' },
  '剧情规划::分卷剧情': { type: '剧情规划', title: '第一卷' },
  '世界地图::世界架构': { type: '世界总览', title: '世界架构' },
  '世界地图::危险区域': { type: '危险区域', title: '危险区域' },
  '资源货币::资源货币': { type: '资源货币', title: '资源货币' },
  '怪物列表::怪物图鉴': { type: '常见怪物', title: '怪物图鉴' },
};
