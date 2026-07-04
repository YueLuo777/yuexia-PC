export const BASIC_SETTING_ENTRY_TYPE = '核心设定';
export const BASIC_SETTING_ENTRY_TITLE = '基础设定';

export const DEFAULT_WORK_SETTING_TYPES = ['核心设定', '剧情规划', '资源货币', '世界地图'];

export const DEFAULT_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';

export const DEFAULT_WORK_SETTING_STARTER_ENTRIES = [
  { type: BASIC_SETTING_ENTRY_TYPE, title: BASIC_SETTING_ENTRY_TITLE },
  { type: BASIC_SETTING_ENTRY_TYPE, title: '世界观' },
  { type: BASIC_SETTING_ENTRY_TYPE, title: '主角金手指/优势' },
  { type: '剧情规划', title: '剧情蓝图' },
  { type: '剧情规划', title: '爽点设计' },
  { type: '剧情规划', title: '分卷剧情' },
  { type: '主线伏笔', title: '1号主线伏笔' },
  { type: '人物伏笔', title: '1号人物伏笔' },
  { type: '世界地图', title: '世界架构' },
  { type: '世界地图', title: '危险区域' },
  { type: '资源货币', title: '资源货币' },
] as const;

const normalizeSettingTaxonomyType = (value: string | undefined) => value?.trim() || '未分类';

export const getDefaultWorkSettingEntryId = (type: string, title: string) => `${normalizeSettingTaxonomyType(type)}::${title.trim()}`;

export const DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS: ReadonlySet<string> = new Set(
  DEFAULT_WORK_SETTING_STARTER_ENTRIES.map((item) => getDefaultWorkSettingEntryId(item.type, item.title)),
);

export const SETTING_WORKSPACE_DOMAIN_GROUPS = {
  'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力'],
  'setting:item': ['功法能力', '物品装备', '特殊资源'],
  'setting:monster': ['怪物列表'],
  'setting:foreshadow': ['主线伏笔', '人物伏笔'],
} as const;

export const SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES: Record<string, string> = {
  作品设定: DEFAULT_WORK_SETTING_TYPES[0],
  势力设定: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:faction'][0],
  道具资源: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:item'][0],
  怪物图鉴: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:monster'][0],
  伏笔线索: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:foreshadow'][0],
};

export const SETTING_IMPORT_ROLE_TOP_LABELS = new Set(['人物设定', '角色设定']);

export const DEFAULT_SETTING_TYPES = [
  ...DEFAULT_WORK_SETTING_TYPES,
  ...Object.values(SETTING_WORKSPACE_DOMAIN_GROUPS).flat(),
];

export const DEFAULT_SETTING_TYPE_DOMAINS = Object.fromEntries(
  Object.entries(SETTING_WORKSPACE_DOMAIN_GROUPS).flatMap(([domain, groups]) => (
    groups.map((group) => [group, domain])
  )),
) as Record<string, string>;
