import {
  BASIC_SETTING_ENTRY_TITLE,
  BASIC_SETTING_ENTRY_TYPE,
  DEFAULT_WORK_SETTING_STARTER_ENTRIES,
} from '@/features/workbench/model/workbenchSettingTaxonomy';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type {
  PendingSettingFieldUpdate,
  SettingFieldHistoryEvent,
  SettingFieldUpdatePolicy,
} from '@/features/workbench/model/workbenchSettingStatus';

import { ROLE_BASE_SETTING_FIELD_DEFINITIONS, ROLE_STATE_FIELD_DEFINITIONS } from './workbenchRoleSettingFields';

export const STRUCTURED_SETTING_UNCATEGORIZED_TYPE = '\u672a\u5206\u7c7b';
export const DEFAULT_MALE_PROTAGONIST_ROLE_TITLE = '\u7537\u4e3b\u89d2';
export const SETTING_IMPORT_FORMAT_TAB_IDS = ['work', 'roles', 'factions', 'items', 'monsters', 'foreshadow'] as const;
export type SettingImportFormatTabId = (typeof SETTING_IMPORT_FORMAT_TAB_IDS)[number];
export const SETTING_IMPORT_FORMAT_PREVIEW_SCOPES = ['设定条目', '分组', '标签'] as const;
export type SettingImportFormatPreviewScope = (typeof SETTING_IMPORT_FORMAT_PREVIEW_SCOPES)[number];

export type SettingImportFormatField = {
  title: string;
  placeholder?: string;
};

export type SettingImportFormatEntry = {
  id: string;
  tabId: SettingImportFormatTabId;
  tabTitle: string;
  groupName: string;
  title: string;
  fields: SettingImportFormatField[];
  note?: string;
};

export type SettingImportFormatGroup = {
  name: string;
  entries: SettingImportFormatEntry[];
};

export type SettingImportFormatTab = {
  id: SettingImportFormatTabId;
  title: string;
  groups: SettingImportFormatGroup[];
};

export type BuildSettingImportFormatTabsOptions = {
  visibleSettingTypes: string[];
  settingEntries: WorkbenchLibraryEntry[];
  getSettingTypeWorkspaceDomain: (type: string) => string | null;
};

export interface SettingContent {
  type: string;
  body: string;
  structuredFieldSetId?: string;
  lockedDefaultEntryId?: string;
  statusHistory?: SettingFieldHistoryEvent[];
  pendingStatusUpdates?: PendingSettingFieldUpdate[];
  fieldUpdatePolicies?: Record<string, SettingFieldUpdatePolicy>;
}

export type StructuredSettingFieldDefinition = {
  key: string;
  title: string;
  placeholder?: string;
  control?: 'input' | 'textarea';
  maxLength?: number;
  fieldClassName?: string;
};

export type StructuredSettingFieldGroup = {
  title: string;
  description: string;
  fieldKeys: readonly string[];
};

export type StructuredSettingFieldSet = {
  id: string;
  entryType: string;
  entryTitle: string;
  matchAllTitles?: boolean;
  titleFieldLabel?: string;
  titleFieldGroupTitle?: string;
  gridColumnsClassName: string;
  gridContentClassName?: string;
  headerFieldKeys?: readonly string[];
  fields: readonly StructuredSettingFieldDefinition[];
  groups?: readonly StructuredSettingFieldGroup[];
};

export type StructuredSettingFieldDraft = {
  entryId: string;
  fieldSetId: string;
  body: string;
  fields: Record<string, string>;
} | null;

export const STRUCTURED_SETTING_TABS = ['基础设定', '状态设定', '确认'] as const;
export type StructuredSettingTab = (typeof STRUCTURED_SETTING_TABS)[number];

export const MONSTER_BESTIARY_FIELDS: readonly StructuredSettingFieldDefinition[] = [
  { key: 'monsterImage', title: '怪物形象', placeholder: '体型、外貌、颜色、标志性器官、压迫感和辨认特征。' },
  {
    key: 'monsterAbility',
    title: '怪物能力',
    placeholder: '攻击方式、天赋能力、防御特性、特殊感知、族群配合或战斗习惯。',
  },
  {
    key: 'monsterBackground',
    title: '怪物背景',
    placeholder: '来源、种族来历、诞生原因、传说、与地图/势力/主线的关联。',
  },
  { key: 'monsterWeakness', title: '怪物弱点', placeholder: '弱点部位、克制方式、恐惧物、行动限制、破解条件和禁忌。' },
  {
    key: 'habitatTrace',
    title: '出没位置',
    placeholder: '栖息地、当前出没区域、最近出现章节、是否正在追踪或伏击角色。',
  },
  { key: 'dropResources', title: '掉落/资源', placeholder: '妖丹、兽骨、鳞甲、毒囊、血脉、材料、情报或可获取收益。' },
];
export const FORESHADOW_SETTING_FIELDS: readonly StructuredSettingFieldDefinition[] = [
  {
    key: 'foreshadowCode',
    title: '伏笔编号',
    placeholder: '最多 10 位编号。',
    control: 'input',
    maxLength: 10,
    fieldClassName: 'xy-structured-header-field xy-foreshadow-code-field h-[48px] w-[176px] shrink-0',
  },
  {
    key: 'firstSeenChapter',
    title: '首次出现章节',
    placeholder: '第3章',
    control: 'input',
    maxLength: 7,
    fieldClassName: 'xy-structured-header-field h-[48px] min-w-0',
  },
  {
    key: 'recoveredChapter',
    title: '回收章节',
    placeholder: '第36章',
    control: 'input',
    maxLength: 7,
    fieldClassName: 'xy-structured-header-field h-[48px] min-w-0',
  },
  {
    key: 'relatedObject',
    title: '关联对象',
    placeholder: '关联人物、道具、势力、地图、怪物或剧情事件。',
    fieldClassName: 'min-h-0',
  },
  {
    key: 'setupMethod',
    title: '铺垫方式',
    placeholder: '读者第一次看到它时是什么形式，例如异常反应、对话暗示、物品细节或旁人失态。',
    fieldClassName: 'min-h-0',
  },
  {
    key: 'foreshadowContent',
    title: '伏笔内容',
    placeholder: '详细写明表层信息、隐藏真相、后续反转、回收方式和对剧情的影响。',
    fieldClassName: 'col-span-2 min-h-0',
  },
];
export const STRUCTURED_SETTING_FIELD_SETS: readonly StructuredSettingFieldSet[] = [
  {
    id: 'work-core-basic',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: BASIC_SETTING_ENTRY_TITLE,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'storyType', title: '故事类型', placeholder: '题材类型、时代背景、风格方向和读者期待。' },
      { key: 'coreConcept', title: '核心创意', placeholder: '这本书最核心、最有辨识度的卖点。' },
      { key: 'oneSentenceSummary', title: '一句话概括', placeholder: '用一句话概括主角、目标、冲突和看点。' },
    ],
  },
  {
    id: 'work-core-world-view',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: '世界观',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'eraBackground', title: '时代背景', placeholder: '故事发生的时代、文明状态、历史阶段和基础环境。' },
      { key: 'worldPattern', title: '世界格局', placeholder: '国家、宗门、势力范围、区域关系和主要冲突格局。' },
      { key: 'socialOrder', title: '社会秩序', placeholder: '权力、法律、阶层、交易、宗门或国家规则如何运转。' },
    ],
  },
  {
    id: 'work-core-cheat-advantage',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: '主角金手指/优势',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'abilitySource', title: '能力来源', placeholder: '金手指从哪里来，主角为什么拥有它。' },
      { key: 'coreFunction', title: '核心功能', placeholder: '最常用、最能制造爽点的主要能力。' },
      { key: 'upgradeMethod', title: '升级方式', placeholder: '如何解锁、进阶、强化或扩展能力。' },
      { key: 'useLimit', title: '使用限制', placeholder: '冷却、代价、条件、风险，以及不能做到什么。' },
      { key: 'hiddenTruth', title: '隐藏真相', placeholder: '金手指背后的来源、阴谋、使命或后期反转。' },
    ],
  },
  {
    id: 'faction-righteous-no-1',
    entryType: '正派势力',
    entryTitle: '1号势力',
    titleFieldLabel: '势力名',
    titleFieldGroupTitle: '基础设定',
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '基础设定',
        description: '长期档案，智能导入时优先补全，后续除非设定变更通常不覆盖。',
        fieldKeys: ['basicInfo', 'factionTraits', 'organization', 'mainCharacters'],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，智能更新时优先刷新这一侧。',
        fieldKeys: ['factionRelations', 'protagonistStrategy', 'coreConflict'],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '势力名称、类型、地盘、公开身份、核心资源和当前定位。' },
      { key: 'factionTraits', title: '势力特点', placeholder: '行事风格、价值观、优势、短板、外界印象。' },
      { key: 'organization', title: '组织架构', placeholder: '首领、长老、部门、等级、权力来源和决策方式。' },
      { key: 'mainCharacters', title: '主要人物', placeholder: '首领、代表人物、关键成员，以及他们在势力中的作用。' },
      { key: 'factionRelations', title: '势力关系', placeholder: '当前盟友、敌人、合作对象、冲突对象和利益绑定。' },
      {
        key: 'protagonistStrategy',
        title: '对主角策略',
        placeholder: '当前如何拉拢、利用、保护、试探、压制或追杀主角。',
      },
      {
        key: 'coreConflict',
        title: '核心问题/矛盾',
        placeholder: '当前内部隐患、外部压力、资源危机、路线冲突或待解决问题。',
      },
    ],
  },
  {
    id: 'faction-world-map',
    entryType: '世界地图',
    entryTitle: '世界地图',
    matchAllTitles: true,
    titleFieldLabel: '地图名',
    titleFieldGroupTitle: '基础设定',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'mapOverview', title: '世界架构', placeholder: '大陆规模、地理风貌、主要国家/宗门分布和世界层级。' },
      { key: 'regionDivision', title: '区域划分', placeholder: '国家、城池、宗门地盘、荒域、边境、海域等区域层级。' },
      {
        key: 'factionDistribution',
        title: '势力分布',
        placeholder: '哪些势力控制哪些地域，边界、缓冲区和争夺区在哪里。',
      },
      {
        key: 'resourceDistribution',
        title: '资源分布',
        placeholder: '矿脉、灵药、妖兽材料、遗迹、交易中心和稀缺产地。',
      },
      { key: 'geographyRules', title: '世界规则', placeholder: '禁飞、灵气浓度、空间异常、天气灾害等地图底层规则。' },
    ],
  },
  {
    id: 'faction-danger-zone',
    entryType: '世界地图',
    entryTitle: '危险区域',
    matchAllTitles: true,
    titleFieldLabel: '区域名',
    titleFieldGroupTitle: '基础设定',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'zoneOverview', title: '区域概况', placeholder: '危险区类型、范围、环境、入口位置和外界认知。' },
      { key: 'dangerSource', title: '危险来源', placeholder: '怪物、机关、污染、阵法、诅咒、空间异常或人为伏击。' },
      { key: 'entryCondition', title: '进入条件', placeholder: '开启时间、令牌、境界限制、路线门槛、代价和禁忌。' },
      { key: 'resourceReward', title: '资源收益', placeholder: '灵药、矿石、妖丹、传承、情报、地图线索和可获得奖励。' },
      { key: 'historyBackground', title: '历史背景', placeholder: '禁区形成原因、旧战场、遗迹主人、传说和主线关联。' },
      { key: 'coreRules', title: '核心规则', placeholder: '危险区内不可违反的底层规则、触发机制和生存限制。' },
    ],
  },
  {
    id: 'monster-list',
    entryType: '怪物列表',
    entryTitle: '怪物图鉴',
    matchAllTitles: true,
    titleFieldLabel: '怪物名',
    gridColumnsClassName: 'grid-cols-2',
    fields: MONSTER_BESTIARY_FIELDS,
  },
  {
    id: 'foreshadow-main',
    entryType: '主线伏笔',
    entryTitle: '1号主线伏笔',
    matchAllTitles: true,
    titleFieldLabel: '伏笔名称',
    gridColumnsClassName: 'grid-cols-2',
    gridContentClassName: 'grid-rows-[150px_minmax(0,1fr)]',
    headerFieldKeys: ['foreshadowCode', 'firstSeenChapter', 'recoveredChapter'],
    fields: FORESHADOW_SETTING_FIELDS,
  },
  {
    id: 'foreshadow-character',
    entryType: '人物伏笔',
    entryTitle: '1号人物伏笔',
    matchAllTitles: true,
    titleFieldLabel: '伏笔名称',
    gridColumnsClassName: 'grid-cols-2',
    gridContentClassName: 'grid-rows-[150px_minmax(0,1fr)]',
    headerFieldKeys: ['foreshadowCode', 'firstSeenChapter', 'recoveredChapter'],
    fields: FORESHADOW_SETTING_FIELDS,
  },
  {
    id: 'item-ability',
    entryType: '功法能力',
    entryTitle: '功法能力',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '基础设定',
        description: '功法能力的长期规则，记录来源、核心效果、成长方式、限制和伏笔。',
        fieldKeys: ['basicInfo', 'abilitySource', 'coreEffect', 'growthMethod', 'useLimit', 'foreshadowing'],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，AI 更新时只刷新熟练度、突破、受损封印、暴露程度、代价和最近使用。',
        fieldKeys: ['currentMastery', 'breakthroughState', 'damageSeal', 'exposureLevel', 'cooldownCost', 'recentUse'],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '功法/能力名称、类型、等级、首次登场章节。' },
      { key: 'abilitySource', title: '能力来源', placeholder: '传承、血脉、系统、法宝、师承、禁术或特殊机缘。' },
      { key: 'coreEffect', title: '核心效果', placeholder: '主要能力、战斗表现、辅助用途、剧情作用和辨识度。' },
      { key: 'growthMethod', title: '修炼/升级', placeholder: '如何修炼、突破条件、熟练度提升方式、进阶材料或代价。' },
      { key: 'useLimit', title: '使用限制', placeholder: '冷却、消耗、境界门槛、反噬、禁忌、不能做到什么。' },
      {
        key: 'foreshadowing',
        title: '相关伏笔',
        placeholder: '隐藏形态、后续解锁、来源秘密、与人物身世或主线的关联。',
      },
      { key: 'currentMastery', title: '当前熟练度', placeholder: '当前掌握到什么程度、能稳定使用哪些招式。' },
      { key: 'breakthroughState', title: '当前突破', placeholder: '是否接近突破、卡在哪一层、缺少什么条件。' },
      { key: 'damageSeal', title: '受损/封印', placeholder: '是否受损、被封、被污染、被限制或暂时无法使用。' },
      { key: 'exposureLevel', title: '暴露程度', placeholder: '是否被他人知晓、被谁识破、会引来什么风险。' },
      { key: 'cooldownCost', title: '冷却/代价', placeholder: '最近使用后的冷却、消耗、反噬、伤势或副作用。' },
      { key: 'recentUse', title: '最近使用', placeholder: '最近章节中何时使用、造成什么结果、留下什么线索。' },
    ],
  },
  {
    id: 'item-resource-currency',
    entryType: '资源货币',
    entryTitle: '资源货币',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '资源名称、货币类型、主要用途、流通范围。' },
      { key: 'valueLevel', title: '价值等级', placeholder: '下品、中品、上品等换算比例、购买力和价格边界。' },
      { key: 'acquireChannel', title: '获取渠道', placeholder: '矿脉、任务、宗门俸禄、交易、掠夺、奖励。' },
      { key: 'consumeUsage', title: '消耗用途', placeholder: '修炼、炼器、阵法、交通、情报、治疗等消耗场景。' },
      { key: 'circulationLimit', title: '流通限制', placeholder: '禁区、黑市、势力管制、假币、兑换门槛。' },
      { key: 'relatedRules', title: '关联规则', placeholder: '与势力税收、资源矿脉、物品价格、人物债务的关系。' },
    ],
  },
  {
    id: 'item-special-resource',
    entryType: '特殊资源',
    entryTitle: '特殊资源',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '基础设定',
        description: '特殊资源的长期规则，记录为什么珍贵、怎么获得、谁能用、什么时候失效和主线关联。',
        fieldKeys: [
          'basicInfo',
          'acquireCondition',
          'useRules',
          'permissionBoundary',
          'failureCondition',
          'mainlineRelation',
        ],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，AI 更新时只刷新归属、可用、次数、竞争、激活和触发状态。',
        fieldKeys: [
          'currentOwnership',
          'availableStatus',
          'remainingUses',
          'competitionRisk',
          'activationProgress',
          'recentTrigger',
        ],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '资源类型、唯一性、等级、首次登场章节。' },
      { key: 'acquireCondition', title: '获取条件', placeholder: '身份、令牌、任务、地点、境界、代价。' },
      { key: 'useRules', title: '使用规则', placeholder: '使用次数、有效期、限制、失败代价。' },
      { key: 'permissionBoundary', title: '权限边界', placeholder: '谁能使用、是否可转让、是否绑定身份或血脉。' },
      { key: 'failureCondition', title: '失效条件', placeholder: '过期、被夺、违约、地点关闭、次数耗尽等失效规则。' },
      { key: 'mainlineRelation', title: '主线关联', placeholder: '与人物身世、势力争夺、地图线索或后期反转的关系。' },
      { key: 'currentOwnership', title: '当前归属', placeholder: '谁拥有资格、资格是否被抢夺、转让或冻结。' },
      { key: 'availableStatus', title: '可用状态', placeholder: '是否激活、过期、封锁、已使用或待确认。' },
      { key: 'remainingUses', title: '剩余次数', placeholder: '还能使用几次、是否已有部分消耗或临时锁定。' },
      { key: 'competitionRisk', title: '竞争风险', placeholder: '哪些人物或势力正在争夺、是否暴露。' },
      { key: 'activationProgress', title: '激活进度', placeholder: '已满足哪些条件、还缺哪些钥匙、地点或章节触发。' },
      { key: 'recentTrigger', title: '最近触发', placeholder: '最近章节触发了什么条件、线索或限制。' },
    ],
  },
  {
    id: 'item-equipment',
    entryType: '物品装备',
    entryTitle: '物品装备',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '类型、等级、初次登场章节。' },
      { key: 'description', title: '物品描述', placeholder: '外观、材质、标志性细节、识别特征。' },
      { key: 'functionEffect', title: '效果/功能', placeholder: '主要能力、使用条件、副作用、限制和战斗/剧情用途。' },
      { key: 'origin', title: '来历', placeholder: '物品的来源背景、制造者、历史、被谁发现或带入剧情。' },
      { key: 'ownershipChange', title: '归属变化', placeholder: '曾经持有者、转手原因、争夺过程、当前归属如何形成。' },
      { key: 'currentStatus', title: '当前状态', placeholder: '持有者、损坏/封印/激活状态、是否可用、是否暴露。' },
      {
        key: 'foreshadowing',
        title: '相关伏笔',
        placeholder: '隐藏能力、后续解锁、与人物身世/主线秘密/地图线索的关联。',
      },
    ],
  },
  {
    id: 'work-plot-blueprint',
    entryType: '剧情规划',
    entryTitle: '剧情蓝图',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'overallPlanning', title: '整体规划', placeholder: '预计总字数、共几卷、故事从哪里开始到哪里结束。' },
      { key: 'mainGoal', title: '主线目标', placeholder: '主角长期要完成的大目标。' },
      { key: 'phasePace', title: '阶段节奏', placeholder: '前期、中期、后期分别推进什么内容。' },
    ],
  },
  {
    id: 'work-plot-volume',
    entryType: '剧情规划',
    entryTitle: '分卷剧情',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'volumeOverview', title: '分卷总览', placeholder: '每一卷的卷名、字数、核心阶段和主要任务。' },
      { key: 'volumeCoreEvent', title: '卷核心事件', placeholder: '这一卷最重要的剧情事件和冲突推进。' },
      { key: 'volumeClimax', title: '卷末高潮', placeholder: '卷末的大收获、大反转、大决战或阶段性爆点。' },
      { key: 'nextVolumeHook', title: '下一卷钩子', placeholder: '本卷结尾留下什么问题、危机或新地图。' },
    ],
  },
  {
    id: 'work-plot-payoff',
    entryType: '剧情规划',
    entryTitle: '爽点设计',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'corePayoffTypes', title: '核心爽点类型', placeholder: '升级、反杀、打脸、误解、收获、揭秘等主要爽点。' },
      { key: 'faceSlapTargets', title: '打脸对象设计', placeholder: '谁看不起主角、为什么被打脸、打脸场景在哪里。' },
      { key: 'payoffFormula', title: '爽点公式', placeholder: '主角想法、实际行动、结果、配角反应、主角内心反应。' },
      { key: 'payoffPace', title: '爽点节奏', placeholder: '小爽点、中爽点、大爆点分别多久出现一次。' },
    ],
  },
];
