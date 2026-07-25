import type { PromptTaxonomyDomain } from './promptBasedSettingTaxonomyTypes';

const PROMPT_BASED_SETTING_DOMAIN_DEFINITIONS: PromptTaxonomyDomain[] = [
  {
    id: 'work',
    title: '作品设定',
    groups: [
      {
        title: '核心设定',
        entries: [
          { id: 'work-positioning', title: '作品定位', template: 'work-positioning', sources: ['创意白皮书模板.md', '白皮书示例.md'], note: '保留已验证的作品卖点和一句话梗概职责。' },
          { id: 'world-background', title: '世界背景', template: 'world-background', sources: ['创意白皮书模板.md', '全局创作规范.md'], note: '只记录整个世界共同遵守的背景，不记录主角私人物品。' },
          { id: 'power-system', title: '力量体系', template: 'power-system', sources: ['创意白皮书模板.md', '全局创作规范.md', '升级补丁_自动审核系统v2.0.md'], note: '用于明确境界、突破风险、当前最高战力和辅助修炼手段。' },
          { id: 'setting-red-lines', title: '设定红线', template: 'setting-red-lines', sources: ['创意白皮书模板.md', '多模型防漏修复补丁v3.0.md'], note: '新内容和这里冲突时，修改新内容，不能偷改原规则。' },
        ],
      },
      {
        title: '剧情规划',
        entries: [
          { id: 'overall-plot', title: '整体剧情', template: 'overall-plot', sources: ['整书大纲模板.md', '创意白皮书模板.md'], note: '记录全书级方向，不代替分卷和章节细纲。' },
          { id: 'volume-one', title: '第一卷', template: 'volume-plot', sources: ['整书大纲模板.md', '一键生成细纲.md'], note: '每卷单独一条设定，方便继续新建卷。' },
          { id: 'payoff-design', title: '爽点设计', template: 'payoff-design', sources: ['创意白皮书模板.md', '一键生成细纲.md', '全局创作规范.md'], note: '保留市场提示词中的爽点公式和节奏检查。' },
        ],
      },
      {
        title: '创作规范',
        entries: [
          { id: 'writing-style', title: '写作风格', template: 'writing-style', sources: ['写作风格指南模板.md', 'humanize-text.md'], note: '记录本书专属风格，不把底层工作流程放进来。' },
          { id: 'chapter-rules', title: '章节规则', template: 'chapter-rules', sources: ['全局创作规范.md', '一键AI续写章节_v4.0.md'], note: '供细纲、续写和剧情审核共同读取。' },
          { id: 'prohibited-content', title: '禁止事项', template: 'prohibited-content', sources: ['全局创作规范.md', '升级补丁_自动审核系统v2.0.md'], note: '集中管理剧情毒点、行文问题和本书特殊禁忌。' },
          { id: 'terminology-format', title: '称呼与格式', template: 'terminology-format', sources: ['写作风格指南模板.md', '全局创作规范.md'], note: '统一称呼、专有名词和特殊文本格式。' },
        ],
      },
      {
        title: '剧情时间线',
        entries: [{ id: 'timeline', title: '时间线发展记录', template: 'timeline', sources: ['一键章节发布.md', '摘要系统模板.md'], note: '章节摘要仍属于摘要页，只把全局时间线放到设定页。' }],
      },
    ],
  },
  {
    id: 'character',
    title: '人物设定',
    groups: [
      { title: '男女主', entries: [
        { id: 'lin-ke', title: '林刻', tag: '男主', template: 'protagonist', sources: ['人物档案模板.md', '创意白皮书模板.md', '一键章节发布.md'], note: '金手指从作品设定移到男主档案，不保留重复的剧情定位字段。' },
        { id: 'su-wan-ning', title: '苏晚凝', tag: '女主', template: 'supporting-role', sources: ['人物档案模板.md', '创意白皮书模板.md', '一键章节发布.md'], note: '女主保留独立目标、立场、成长和剧情作用。' },
      ] },
      { title: '重要配角', entries: [{ id: 'han-zhen', title: '韩镇', tag: '配角', template: 'supporting-role', sources: ['人物档案模板.md', '一键章节发布.md'], note: '重点说明能提供什么、知道多少、为什么帮助主角。' }] },
      { title: '反派', entries: [{ id: 'xue-wu-hen', title: '薛无痕', tag: '反派', template: 'antagonist', sources: ['人物档案模板.md', '创意白皮书模板.md', '一键章节发布.md'], note: '在市场模板基础上补充可执行的反派计划、压力、代价和弱点。' }] },
      { title: '其他角色', entries: [{ id: 'black-robed-elder', title: '黑袍老人', template: 'supporting-role', sources: ['人物档案模板.md', '一键导入已有小说.md'], note: '信息较少的角色仍使用统一结构，允许字段暂时留空。' }] },
    ],
  },
  {
    id: 'faction',
    title: '势力设定',
    groups: [
      { title: '正派势力', entries: [{ id: 'cold-moon-sect', title: '寒月剑宗', template: 'faction', sources: ['势力档案模板.md', '创意白皮书模板.md', '一键章节发布.md'], note: '阵营分组只表示当前归类，势力关系仍以字段为准。' }] },
      { title: '反派势力', entries: [{ id: 'blood-river-sect', title: '血河宗', template: 'faction', sources: ['势力档案模板.md', '一键章节发布.md'], note: '章节发布时主要更新实力消长、核心成员和势力关系。' }] },
      { title: '中立势力', entries: [{ id: 'wanbao-guild', title: '万宝商会', template: 'faction', sources: ['势力档案模板.md'], note: '中立不代表没有立场，仍需记录利益关系和对主角策略。' }] },
      { title: '其他势力', entries: [{ id: 'miner-mutual-aid', title: '矿工互助队', template: 'faction', sources: ['势力档案模板.md', '一键章节发布.md'], note: '新建、临时或尚未确定阵营的组织放在这里。' }] },
    ],
  },
  {
    id: 'resource',
    title: '道具资源',
    groups: [
      { title: '功法能力', entries: [{ id: 'cold-moon-sword-art', title: '寒月剑典', template: 'ability', sources: ['人物档案模板.md', '创意白皮书模板.md', '一键章节发布.md'], note: '人物页记录角色会什么，这里记录功法本身的完整规则。' }] },
      { title: '物品装备', entries: [{ id: 'chi-xiao-sword', title: '赤霄剑', template: 'item', sources: ['物品档案模板.md', '一键章节发布.md'], note: '归属、损坏、消耗和暴露状态都可随章节更新。' }] },
      { title: '特殊资源', entries: [{ id: 'upper-mine-pass', title: '上层矿区通行资格', template: 'special-resource', sources: ['创意白皮书模板.md', '物品档案模板.md'], note: '适合不是实体物品，但具有归属、次数、失效和争夺规则的资源。' }] },
      { title: '资源货币', entries: [{ id: 'spirit-stone-system', title: '灵石体系', template: 'currency', sources: ['创意白皮书模板.md', '全局创作规范.md'], note: '从作品设定移到道具资源，不记录主角背包和个人流水账。' }] },
    ],
  },
  {
    id: 'location',
    title: '地点地图',
    groups: [
      { title: '世界总览', entries: [{ id: 'world-structure', title: '世界架构', template: 'world-structure', sources: ['创意白皮书模板.md', '地点档案模板.md'], note: '只记录整个世界怎样排列、连接和划分，不记录单个地点详情。' }] },
      { title: '国家区域', entries: [{ id: 'eastern-wilderness', title: '东荒域', template: 'location', sources: ['地点档案模板.md', '创意白皮书模板.md'], note: '大陆、国家、州域和大型区域放在这里。' }] },
      { title: '城池宗门', entries: [{ id: 'qingyun-city', title: '青云城', template: 'location', sources: ['地点档案模板.md', '一键章节发布.md'], note: '城池、宗门驻地、家族领地等长期活动地点放在这里。' }] },
      { title: '建筑地点', entries: [{ id: 'mine-main-shaft', title: '矿场主井', template: 'location', sources: ['地点档案模板.md', '一键章节发布.md'], note: '建筑、街道、院落、店铺和交通点等具体地点放在这里。' }] },
      { title: '秘境遗迹', entries: [{ id: 'ancient-sword-ruins', title: '古剑遗迹', template: 'danger-zone', sources: ['地点档案模板.md', '创意白皮书模板.md'], note: '有进入条件、资源收益和特殊规则的秘境遗迹放在这里。' }] },
      { title: '危险区域', entries: [{ id: 'black-stone-zone', title: '黑石禁地', template: 'danger-zone', sources: ['地点档案模板.md', '创意白皮书模板.md'], note: '禁地、灾区和长期高危区域使用危险区域结构。' }] },
      { title: '其他地点', entries: [{ id: 'nameless-ferry', title: '无名渡口', template: 'location', sources: ['地点档案模板.md'], note: '暂时无法归入其他分类的地点先放在这里。' }] },
    ],
  },
  {
    id: 'monster',
    title: '怪物图鉴',
    groups: [
      { title: '常见怪物', entries: [{ id: 'red-shell-rat', title: '赤甲矿鼠', template: 'monster', sources: ['软件现有怪物图鉴'], note: '提示词库暂无独立怪物模板，保留软件现有设定并补全行动习惯。' }] },
      { title: '精英怪物', entries: [{ id: 'spirit-spider-queen', title: '噬灵蛛后', template: 'monster', sources: ['软件现有怪物图鉴'], note: '精英怪物应写清战术差异、克制手段和有价值掉落。' }] },
      { title: '首领怪物', entries: [{ id: 'sky-rending-dragon', title: '裂天魔蛟', template: 'monster', sources: ['软件现有怪物图鉴', '创意白皮书模板.md'], note: '首领怪物必须关联阶段剧情、地图和资源收益。' }] },
      { title: '特殊生命', entries: [{ id: 'heavenly-puppet', title: '天工傀儡', template: 'monster', sources: ['软件现有怪物图鉴', '创意白皮书模板.md'], note: '傀儡、器灵、污染体和无法算普通妖兽的生命放在这里。' }] },
    ],
  },
  {
    id: 'foreshadow',
    title: '伏笔线索',
    groups: [
      { title: '主线伏笔', entries: [{ id: 'nine-heavens-crack', title: '九重天裂缝', template: 'foreshadow', sources: ['伏笔库模板.md', '摘要系统模板.md', '一键章节发布.md'], note: '与整书主线和最终冲突直接相关的伏笔。' }] },
      { title: '人物伏笔', entries: [{ id: 'mine-disaster-truth', title: '林刻矿难真相', template: 'foreshadow', sources: ['伏笔库模板.md', '人物档案模板.md'], note: '与人物身世、秘密、关系和成长直接相关的伏笔。' }] },
      { title: '世界伏笔', entries: [{ id: 'missing-craftsman', title: '失踪的铸天师', template: 'foreshadow', sources: ['伏笔库模板.md', '创意白皮书模板.md'], note: '与历史、世界规则、地图、势力和大型秘密相关。' }] },
      { title: '其他线索', entries: [{ id: 'night-walker-title', title: '夜行客称号', template: 'foreshadow', sources: ['伏笔库模板.md', '一键章节发布.md'], note: '暂时无法确定属于主线、人物或世界的线索先放在这里。' }] },
    ],
  },
];

export const PROMPT_BASED_SETTING_DOMAIN_ORDER = [
  'work',
  'character',
  'location',
  'faction',
  'resource',
  'foreshadow',
  'monster',
] as const;

export const PROMPT_BASED_SETTING_DOMAINS = PROMPT_BASED_SETTING_DOMAIN_ORDER.map((domainId) => {
  const domain = PROMPT_BASED_SETTING_DOMAIN_DEFINITIONS.find((item) => item.id === domainId);
  if (!domain) throw new Error(`Missing prompt-based setting domain: ${domainId}`);
  return domain;
});

export const PROMPT_BASED_SETTING_ENTRIES = PROMPT_BASED_SETTING_DOMAINS.flatMap((domain) =>
  domain.groups.flatMap((group) => group.entries.map((entry) => ({ ...entry, domainId: domain.id, domainTitle: domain.title, groupTitle: group.title }))),
);
