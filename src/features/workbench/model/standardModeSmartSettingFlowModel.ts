import { cloneTemplateStructure, type TemplateStructure } from './standardModeTemplateModel';
import { createSmartTemplateStructure } from './standardModeSmartSettingTemplateFactory';
import {
  MALE_URBAN_CULTIVATION_STRUCTURE,
  MALE_URBAN_NO_CULTIVATION_STRUCTURE,
} from './standardModeUrbanSettingTemplates';
import {
  MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
  MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
} from './standardModeXianxiaSettingTemplates';

export type BookChannel = 'male' | 'female' | 'general';
export type BookSource = 'blank' | 'brainstorm';
export type BrainstormReadMode = 'smart' | 'manual';

export type SmartBookSetup = {
  title: string;
  source: BookSource;
  channel: BookChannel;
  genreType: string;
  protagonistName: string;
  protagonistRole: string;
  premise: string;
  brainstormId: string;
  brainstormTitle: string;
  brainstormContent: string;
  brainstormReadMode: BrainstormReadMode;
};

export type SmartTemplatePreset = {
  id: string;
  title: string;
  channel: BookChannel;
  genreCategory: string;
  keywords: string[];
  description: string;
  structure: TemplateStructure;
};

export type SmartTemplateBrainstorm = {
  id: string;
  title: string;
  content: string;
  detectedChannel: BookChannel;
  detectedGenre: string;
  recommendedTemplateId: string;
};

export type BookGenreOption = {
  label: string;
  templateId: string;
  group: 'hot' | 'niche';
};

const GENERAL_STRUCTURE = createSmartTemplateStructure('general', [
  ['作品设定', [
    ['作品基础', [
      ['作品定位', ['小说类型', '故事年代', '作品卖点', '目标读者', '一句话主线']],
      ['整体剧情', ['开局事件', '主线目标', '主要冲突', '结局方向']],
    ]],
  ]],
  ['人物设定', [
    ['主要角色', [
      ['主角', ['人物姓名', '身份定位', '性格', '人物背景', '当前目标']],
      ['重要配角', ['人物姓名', '人物身份', '与主角关系', '行动目标']],
    ]],
  ]],
  ['地点地图', [['常用地点', [['主要地点', ['地点名称', '地点作用', '相关人物']]]]]],
  ['势力设定', [['主要势力', [['势力资料', ['势力名称', '势力目标', '主要成员']]]]]],
  ['伏笔线索', [['剧情线索', [['主要线索', ['线索内容', '首次出现', '后续作用']]]]]],
]);

const FEMALE_CEO_STRUCTURE = createSmartTemplateStructure('female-ceo', [
  ['作品设定', [
    ['作品方向', [
      ['作品定位', ['现代言情类型', '核心感情看点', '目标读者', '一句话感情主线']],
      ['感情剧情', ['相遇方式', '关系阻碍', '感情转折', '最终关系']],
    ]],
  ]],
  ['人物设定', [
    ['核心角色', [
      ['女主角', ['人物姓名', '职业身份', '性格', '家庭背景', '人生目标', '感情底线']],
      ['男主角', ['人物姓名', '集团身份', '性格', '家庭关系', '感情态度', '隐藏问题']],
    ]],
    ['关系人物', [
      ['家人与朋友', ['人物身份', '与主角关系', '支持或阻碍']],
      ['感情竞争者', ['人物身份', '竞争原因', '采取的行动']],
    ]],
  ]],
  ['势力设定', [
    ['豪门与职场', [
      ['豪门家族', ['家族名称', '家族成员', '利益关系', '婚姻态度']],
      ['公司集团', ['公司名称', '主营业务', '权力结构', '职场冲突']],
    ]],
  ]],
  ['地点地图', [['现代场景', [
    ['公司场景', ['场景名称', '所属部门', '剧情作用']],
    ['生活场景', ['居住地点', '社交地点', '约会地点']],
  ]]]],
  ['伏笔线索', [['关系秘密', [
    ['身份秘密', ['秘密内容', '知情人物', '揭露时机']],
    ['感情误会', ['误会来源', '影响关系', '化解方式']],
  ]]]],
]);

const FEMALE_SWEET_STRUCTURE = createSmartTemplateStructure('female-sweet', [
  ['作品设定', [['甜宠方向', [
    ['作品定位', ['甜宠类型', '核心感情看点', '目标读者', '一句话感情主线']],
    ['感情进度', ['初次相遇', '关系升温', '确认关系', '日常甜点']],
  ]]]],
  ['人物设定', [['核心角色', [
    ['女主角', ['人物姓名', '职业身份', '性格', '生活目标', '感情需求']],
    ['男主角', ['人物姓名', '职业身份', '性格', '宠爱方式', '感情顾虑']],
  ]]]],
  ['地点地图', [['日常场景', [['生活地点', ['居住地点', '工作地点', '约会地点']]]]]],
  ['伏笔线索', [['感情伏笔', [['关系伏笔', ['伏笔内容', '出现时机', '回收方式']]]]]],
]);

const FEMALE_ANCIENT_STRUCTURE = createSmartTemplateStructure('female-ancient', [
  ['作品设定', [['古言方向', [
    ['作品定位', ['古言类型', '感情看点', '身份冲突', '一句话主线']],
    ['时代规则', ['朝代背景', '婚姻规则', '女性处境', '礼法限制']],
  ]]]],
  ['人物设定', [['核心角色', [
    ['女主角', ['人物姓名', '家族身份', '性格', '当前处境', '人生目标']],
    ['男主角', ['人物姓名', '身份地位', '政治立场', '感情态度']],
  ]]]],
  ['势力设定', [['家族朝堂', [
    ['主要家族', ['家族名称', '家族地位', '联姻关系']],
    ['朝堂势力', ['势力名称', '政治目标', '主要人物']],
  ]]]],
  ['地点地图', [['古代场景', [['主要地点', ['府邸宫殿', '所属势力', '剧情作用']]]]]],
]);

const MALE_FANTASY_XIANXIA_STRUCTURE = createSmartTemplateStructure('male-fantasy-xianxia', [
  ['作品设定', [
    ['核心设定', [
      ['作品定位', ['小说类型', '故事发生时代', '作品卖点', '读者主要想看什么', '目标读者类型', '一句话写清主线']],
      ['世界背景', ['世界排列与连接', '主要区域与文明', '主要势力和冲突格局', '社会运行规则', '世界秘密内容与知情范围']],
      ['修炼体系', ['修炼境界', '突破条件与风险', '境界战力差距', '当前剧情最高战力', '辅助修炼手段', '修炼资源与境界关系']],
      ['设定红线', ['世界规则限制', '金手指与能力上限', '禁止临时增加的设定', '不能违背的剧情常识']],
    ]],
    ['剧情规划', [
      ['整体剧情', ['开局事件', '全书主线目标', '主要矛盾与敌人', '阶段推进安排', '最终结局方向']],
      ['分卷规划', ['本卷主要任务', '本卷核心事件', '本卷结尾高潮', '下一卷剧情钩子']],
      ['爽点节奏', ['核心爽点类型', '爽点触发条件', '爽点铺垫与兑现', '小爽点与大高潮频率']],
    ]],
  ]],
  ['人物设定', [
    ['主角', [
      ['男主角', ['人物姓名', '身份定位', '外貌', '性格', '称号与别名', '人物背景', '当前目标', '核心动机', '行为原则与底线', '言行特点', '已知信息与错误认知', '金手指来源', '金手指当前功能', '金手指升级方式', '金手指限制与代价', '金手指当前解锁状态', '境界修为', '功法与战斗技能', '其他技能', '战力范围与弱点', '当前处境与地点', '身心状态与资源', '人物关系与隶属势力']],
    ]],
    ['核心角色', [
      ['重要角色', ['人物姓名', '身份定位', '外貌与辨识特征', '性格与弱点', '人物背景', '当前目标', '核心动机与底线', '已知信息与错误认知', '境界修为', '主要能力与弱点', '剧情作用', '成长变化', '当前处境与状态', '人物关系与隶属势力']],
    ]],
    ['反派', [
      ['反派角色', ['人物姓名', '身份定位', '外貌与伪装', '性格与致命弱点', '人物背景', '当前目标', '核心动机与底线', '已知信息与错误认知', '境界修为', '主要手段与弱点', '当前计划', '与主角冲突原因', '失败代价', '可被利用的破绽', '当前处境与状态', '人物关系与隶属势力']],
    ]],
    ['其他人物', [
      ['简单人物', ['人物姓名', '人物身份', '性格特点', '与主角关系', '当前目标', '能提供的帮助或阻碍', '当前地点与状态', '隶属势力']],
    ]],
  ]],
  ['地点地图', [
    ['世界总览', [
      ['世界排列与连接', ['世界层级与空间关系', '区域划分', '区域连接方式', '跨区域通行条件', '主要资源分布', '主要势力控制范围']],
    ]],
    ['地点列表', [
      ['地点设定', ['地点名称与类型', '所属区域与位置', '环境与辨识特征', '进入与离开方式', '控制势力与相关人物', '资源与危险', '特殊规则', '剧情作用']],
    ]],
  ]],
  ['势力设定', [
    ['势力列表', [
      ['势力设定', ['势力名称与类型', '总部与控制范围', '势力目标与立场', '首领与主要成员', '实力与核心资源', '盟友与敌人', '对主角态度与行动', '内部问题与当前状态']],
    ]],
  ]],
  ['道具资源', [
    ['功法能力', [
      ['功法能力', ['名称、类型与等级', '来源与获得方式', '核心效果', '战斗与辅助用途', '修炼与升级方式', '使用条件与代价', '当前掌握状态', '关联人物与剧情作用']],
    ]],
    ['物品装备', [
      ['物品装备', ['名称、类型与等级', '外观与辨识特征', '核心功能', '使用条件与副作用', '来历与流转', '当前持有者与状态', '关联人物与剧情作用']],
    ]],
    ['资源体系', [
      ['资源货币', ['资源或货币名称', '类型与价值等级', '主要获取渠道', '主要消耗用途', '流通与换算规则', '稀缺程度与争夺原因', '世界经济与修炼影响']],
    ]],
  ]],
  ['伏笔线索', [
    ['伏笔列表', [
      ['伏笔线索', ['伏笔内容', '伏笔类型', '关联人物与设定', '埋设位置与方式', '计划揭露时间', '揭露条件与方式', '当前推进状态', '回收后的剧情作用']],
    ]],
  ]],
  ['怪物图鉴', [
    ['怪物列表', [
      ['怪物设定', ['怪物名称、类型与等级', '外貌与辨识特征', '栖息地点与分布', '能力与攻击方式', '行动习惯', '弱点与克制方式', '掉落资源与用途', '关联势力与剧情作用']],
    ]],
  ]],
]);

const SUSPENSE_STRUCTURE = createSmartTemplateStructure('suspense', [
  ['作品设定', [['案件规划', [
    ['核心案件', ['案件类型', '受害者', '表面真相', '真实真相']],
    ['调查进程', ['开局线索', '关键转折', '误导方向', '揭露方式']],
  ]]]],
  ['人物设定', [['案件人物', [
    ['调查者', ['人物身份', '调查能力', '个人动机', '行动限制']],
    ['嫌疑人', ['人物身份', '作案动机', '不在场证明', '隐藏秘密']],
  ]]]],
  ['地点地图', [['案件地点', [['案发现场', ['地点名称', '现场状态', '关键物证', '可疑细节']]]]]],
  ['势力设定', [['利益关系', [['相关组织', ['组织名称', '组织目标', '涉案原因']]]]]],
  ['伏笔线索', [['证据与误导', [
    ['关键证据', ['证据内容', '发现位置', '证明事项']],
    ['误导线索', ['线索内容', '误导方向', '识破条件']],
  ]]]],
]);

export const SMART_TEMPLATE_PRESETS: SmartTemplatePreset[] = [
  {
    id: 'female-ceo',
    title: '现代总裁',
    channel: 'female',
    genreCategory: '现代言情',
    keywords: ['总裁', '豪门', '现代言情', '职场恋爱'],
    description: '突出感情发展、豪门关系、职场冲突和男女主成长。',
    structure: FEMALE_CEO_STRUCTURE,
  },
  {
    id: 'female-sweet',
    title: '甜宠',
    channel: 'female',
    genreCategory: '现代言情',
    keywords: ['甜宠'],
    description: '突出关系升温、日常互动、情绪满足和轻冲突。',
    structure: FEMALE_SWEET_STRUCTURE,
  },
  {
    id: 'female-ancient',
    title: '古言',
    channel: 'female',
    genreCategory: '古代言情',
    keywords: ['古言', '宫斗', '宅斗'],
    description: '包含家族身份、婚姻礼法、朝堂关系和古代生活规则。',
    structure: FEMALE_ANCIENT_STRUCTURE,
  },
  {
    id: 'male-fantasy-xianxia',
    title: '玄幻仙侠（标准版）',
    channel: 'male',
    genreCategory: '玄幻仙侠',
    keywords: ['玄幻', '仙侠', '修仙', '宗门', '凡人流'],
    description: '保留玄幻仙侠创作必需的世界、修炼、人物和剧情结构，合并重复字段并删除过程记录。',
    structure: MALE_FANTASY_XIANXIA_STRUCTURE,
  },
  {
    id: 'male-fantasy-xianxia-full',
    title: '玄幻仙侠（完整版）',
    channel: 'male',
    genreCategory: '玄幻仙侠',
    keywords: ['玄幻', '仙侠', '修仙', '宗门', '凡人流'],
    description: '覆盖世界规则、剧情阶段、人物关系、地点势力、资源伏笔和怪物种族，适合完整规划与长期创作。',
    structure: MALE_FANTASY_XIANXIA_FULL_STRUCTURE,
  },
  {
    id: 'male-fantasy-xianxia-light',
    title: '玄幻仙侠（轻量版）',
    channel: 'male',
    genreCategory: '玄幻仙侠',
    keywords: ['玄幻', '仙侠', '修仙', '宗门', '凡人流'],
    description: '只保留开书和前期创作必需的核心设定，适合先快速确定方向并开始写作。',
    structure: MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
  },
  {
    id: 'male-urban-no-cultivation',
    title: '都市（无修炼）',
    channel: 'male',
    genreCategory: '都市',
    keywords: ['都市（无修炼）', '都市现实', '商战', '职场'],
    description: '聚焦事业、商业竞争、现实资源和城市人际关系，不包含修炼体系。',
    structure: MALE_URBAN_NO_CULTIVATION_STRUCTURE,
  },
  {
    id: 'male-urban-cultivation',
    title: '都市（有修炼）',
    channel: 'male',
    genreCategory: '都市',
    keywords: ['都市（修炼）', '都市修炼', '都市异能'],
    description: '在都市现实结构上增加修炼体系、隐藏势力、秘境、修炼资源和异兽。',
    structure: MALE_URBAN_CULTIVATION_STRUCTURE,
  },
  {
    id: 'suspense',
    title: '悬疑推理',
    channel: 'general',
    genreCategory: '悬疑',
    keywords: ['悬疑', '推理', '案件', '刑侦'],
    description: '突出案件结构、嫌疑人、证据、误导线索和真相揭露。',
    structure: SUSPENSE_STRUCTURE,
  },
  {
    id: 'general',
    title: '通用小说基础',
    channel: 'general',
    genreCategory: '通用',
    keywords: ['通用', '其他'],
    description: '保留作品、人物、地点、势力和伏笔等通用结构。',
    structure: GENERAL_STRUCTURE,
  },
];

export const BOOK_GENRE_OPTIONS: Record<BookChannel, BookGenreOption[]> = {
  male: [
    { label: '玄幻', templateId: 'male-fantasy-xianxia', group: 'hot' },
    { label: '仙侠', templateId: 'male-fantasy-xianxia', group: 'hot' },
    { label: '科幻', templateId: 'general', group: 'hot' },
    { label: '末世', templateId: 'general', group: 'hot' },
    { label: '都市（无修炼体系）', templateId: 'male-urban-no-cultivation', group: 'hot' },
    { label: '都市（有修炼体系）', templateId: 'male-urban-cultivation', group: 'hot' },
    { label: '武侠', templateId: 'male-fantasy-xianxia', group: 'niche' },
    { label: '奇幻', templateId: 'male-fantasy-xianxia', group: 'niche' },
    { label: '历史', templateId: 'general', group: 'niche' },
    { label: '军事', templateId: 'general', group: 'niche' },
    { label: '游戏', templateId: 'general', group: 'niche' },
    { label: '体育', templateId: 'general', group: 'niche' },
    { label: '灵异', templateId: 'suspense', group: 'niche' },
    { label: '悬疑推理', templateId: 'suspense', group: 'niche' },
    { label: '诸天无限', templateId: 'general', group: 'niche' },
    { label: '现实题材', templateId: 'male-urban-no-cultivation', group: 'niche' },
  ],
  female: [
    { label: '总裁', templateId: 'female-ceo', group: 'hot' },
    { label: '甜宠', templateId: 'female-sweet', group: 'hot' },
    { label: '年代文', templateId: 'female-ancient', group: 'hot' },
    { label: '现代言情', templateId: 'female-sweet', group: 'hot' },
    { label: '古代言情', templateId: 'female-ancient', group: 'hot' },
    { label: '穿越重生', templateId: 'female-ancient', group: 'hot' },
    { label: '无限流', templateId: 'general', group: 'niche' },
    { label: '职场婚恋', templateId: 'female-ceo', group: 'niche' },
    { label: '青春校园', templateId: 'female-sweet', group: 'niche' },
    { label: '宫斗宅斗', templateId: 'female-ancient', group: 'niche' },
    { label: '种田经商', templateId: 'female-ancient', group: 'niche' },
    { label: '仙侠奇缘', templateId: 'general', group: 'niche' },
    { label: '玄幻言情', templateId: 'general', group: 'niche' },
    { label: '悬疑推理', templateId: 'suspense', group: 'niche' },
    { label: '科幻末世', templateId: 'general', group: 'niche' },
    { label: '游戏竞技', templateId: 'general', group: 'niche' },
  ],
  general: [
    { label: '悬疑', templateId: 'suspense', group: 'hot' },
    { label: '通用', templateId: 'general', group: 'niche' },
  ],
};

export function detectBrainstormBookSetup(title: string, content: string) {
  const source = `${title}\n${content}`;
  if (/(总裁|豪门|女主|甜宠|言情|宫斗|宅斗)/.test(source)) {
    const genreType = /(总裁|豪门)/.test(source)
      ? '总裁'
      : /(宫斗|宅斗)/.test(source)
        ? '古代言情'
        : '现代言情';
    return { channel: 'female' as const, genreType };
  }
  if (/(仙侠|修仙|宗门|长生)/.test(source)) return { channel: 'male' as const, genreType: '仙侠' };
  if (/(科幻|星际|机甲)/.test(source)) return { channel: 'male' as const, genreType: '科幻' };
  if (/(末世|丧尸|灾变)/.test(source)) return { channel: 'male' as const, genreType: '末世' };
  if (/(悬疑|推理|刑侦|案件)/.test(source)) return { channel: 'male' as const, genreType: '悬疑推理' };
  return { channel: 'male' as const, genreType: '玄幻' };
}

export const TEST_BRAINSTORMS: SmartTemplateBrainstorm[] = [
  {
    id: 'brainstorm-ceo',
    title: '闪婚后，总裁发现夫人身份不简单',
    content: '女主为摆脱家族联姻与陌生总裁闪婚，进入集团后逐步揭开母亲旧案，也与男主从协议关系发展为真正伴侣。',
    detectedChannel: 'female',
    detectedGenre: '总裁',
    recommendedTemplateId: 'female-ceo',
  },
  {
    id: 'brainstorm-xianxia',
    title: '凡人杂役靠残卷问道长生',
    content: '山村少年进入宗门成为杂役，依靠能补全残缺功法的古卷稳步修炼，在宗门争斗和秘境探索中寻找长生之路。',
    detectedChannel: 'male',
    detectedGenre: '仙侠',
    recommendedTemplateId: 'male-fantasy-xianxia',
  },
];

export function cloneSmartTemplateStructure(structure: TemplateStructure): TemplateStructure {
  return cloneTemplateStructure(structure);
}

export function getRecommendedTemplatesForNovelCategory(category: string, selectedChannel?: BookChannel) {
  const normalized = category.trim();
  const channel = selectedChannel ?? (/(总裁|言情|甜宠|古言|女频)/.test(normalized) ? 'female' : 'male');
  if (channel === 'male' && /^(玄幻|仙侠)$/.test(normalized)) {
    return SMART_TEMPLATE_PRESETS.filter((preset) => preset.genreCategory === '玄幻仙侠');
  }
  if (channel === 'male' && (normalized === '都市' || normalized.startsWith('都市（'))) {
    return SMART_TEMPLATE_PRESETS.filter((preset) => preset.genreCategory === '都市');
  }
  const selectedOption = BOOK_GENRE_OPTIONS[channel].find((item) => item.label === normalized);
  const selectedPreset = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === selectedOption?.templateId);
  if (selectedPreset) return [selectedPreset];
  const keyword = normalized.toLowerCase();
  const matched = SMART_TEMPLATE_PRESETS.find((preset) =>
    (preset.channel === channel || preset.channel === 'general')
    && preset.keywords.some((item) => keyword.includes(item.toLowerCase()) || item.toLowerCase().includes(keyword)),
  );
  return [matched ?? SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'general')!];
}

export function recommendTemplateForNovelCategory(category: string, selectedChannel?: BookChannel) {
  const normalized = category.trim();
  const setup: SmartBookSetup = {
    title: '',
    source: 'blank',
    channel: selectedChannel ?? (/(总裁|言情|甜宠|古言|女频)/.test(normalized) ? 'female' : 'male'),
    genreType: normalized || '玄幻',
    protagonistName: '',
    protagonistRole: '',
    premise: '',
    brainstormId: '',
    brainstormTitle: '',
    brainstormContent: '',
    brainstormReadMode: 'smart',
  };
  return getRecommendedTemplatesForNovelCategory(normalized, setup.channel)[0] ?? recommendSmartTemplate(setup);
}

export function recommendSmartTemplate(setup: SmartBookSetup) {
  if (setup.source === 'brainstorm' && setup.brainstormReadMode === 'smart') {
    const brainstorm = TEST_BRAINSTORMS.find((item) => item.id === setup.brainstormId);
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === brainstorm?.recommendedTemplateId);
    if (preset) return preset;
  }

  const selectedOption = BOOK_GENRE_OPTIONS[setup.channel].find((item) => item.label === setup.genreType);
  if (selectedOption) {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === selectedOption.templateId);
    if (preset) return preset;
  }

  const keyword = setup.genreType.trim().toLowerCase();
  return SMART_TEMPLATE_PRESETS.find((preset) =>
    (preset.channel === setup.channel || preset.channel === 'general')
    && preset.keywords.some((item) => keyword.includes(item.toLowerCase())),
  ) ?? SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'general')!;
}
