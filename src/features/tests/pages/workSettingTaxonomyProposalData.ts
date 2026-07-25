export type WorkPreviewId = 'work-positioning' | 'world-background';
export type RolePreviewId = 'lin-ke' | 'su-wan-ning' | 'han-zhen' | 'xue-wu-hen';
export type PreviewId = WorkPreviewId | RolePreviewId;

export type PreviewEntry = {
  id: PreviewId;
  title: string;
  domain: 'work' | 'character';
  group: string;
  tag?: '男主' | '女主' | '配角' | '反派';
};

export type FieldDefinition = {
  key: string;
  label: string;
  value: string;
  compact?: boolean;
  colSpan?: 2 | 3 | 6;
};

export type RoleSection = {
  title: string;
  columns: 2 | 3 | 6;
  fields: FieldDefinition[];
};

export type RoleProfile = {
  name: string;
  identity: string;
  sections: RoleSection[];
};

type RoleProfileInput = Omit<RoleProfile, 'sections'> & {
  base: FieldDefinition[];
  backgroundAndGoal: FieldDefinition[];
  strengthAndMethods: FieldDefinition[];
  storyRoleAndStance: FieldDefinition[];
  currentState: FieldDefinition[];
  relationshipsAndNotes: FieldDefinition[];
  special?: { title: '金手指（男主专属）' | '反派计划（反派专属）'; fields: FieldDefinition[] };
};

export const STANDARD_ROLE_SECTION_TITLES = [
  '基础档案',
  '实力与手段',
  '剧情定位与立场',
  '当前状态',
  '关系与补充',
] as const;

export const PREVIEW_ENTRIES: PreviewEntry[] = [
  { id: 'work-positioning', title: '作品定位', domain: 'work', group: '核心设定' },
  { id: 'world-background', title: '世界背景', domain: 'work', group: '核心设定' },
  { id: 'lin-ke', title: '林刻', domain: 'character', group: '男女主', tag: '男主' },
  { id: 'su-wan-ning', title: '苏晚凝', domain: 'character', group: '男女主', tag: '女主' },
  { id: 'han-zhen', title: '韩镇', domain: 'character', group: '重要配角', tag: '配角' },
  { id: 'xue-wu-hen', title: '薛无痕', domain: 'character', group: '反派', tag: '反派' },
];

function createRoleProfile(input: RoleProfileInput): RoleProfile {
  const commonBeforeSpecial: RoleSection[] = [
    {
      title: '基础档案',
      columns: 6,
      fields: [
        ...input.base.map((field): FieldDefinition => ({ ...field, colSpan: field.colSpan ?? 2 })),
        ...input.backgroundAndGoal.map((field): FieldDefinition => ({ ...field, colSpan: field.colSpan ?? 3 })),
      ],
    },
    { title: '实力与手段', columns: 2, fields: input.strengthAndMethods },
  ];
  const specialSection: RoleSection[] = input.special
    ? [{ title: input.special.title, columns: 2, fields: input.special.fields }]
    : [];

  return {
    name: input.name,
    identity: input.identity,
    sections: [
      ...commonBeforeSpecial,
      ...specialSection,
      { title: '剧情定位与立场', columns: 2, fields: input.storyRoleAndStance },
      { title: '当前状态', columns: 2, fields: input.currentState },
      { title: '关系与补充', columns: 2, fields: input.relationshipsAndNotes },
    ],
  };
}

export const ROLE_PROFILES: Record<RolePreviewId, RoleProfile> = {
  'lin-ke': {
    name: '林刻',
    identity: '男主角',
    sections: [
      {
        title: '基础档案',
        columns: 6,
        fields: [
          {
            key: 'appearance',
            label: '外貌',
            value: '黑发，身形修长，左眉有一道很浅的旧伤。',
            compact: true,
            colSpan: 2,
          },
          {
            key: 'personality',
            label: '性格',
            value: '冷静克制，遇事先判断代价，不轻易许诺。',
            compact: true,
            colSpan: 2,
          },
          { key: 'aliases', label: '称号/外号/别称', value: '刻刀、林先生', compact: true, colSpan: 2 },
          {
            key: 'background',
            label: '人物背景',
            value: '出身边城旧族，家族在十年前的矿难中衰败，他一直在追查事故背后的交易。',
            colSpan: 3,
          },
          {
            key: 'goal',
            label: '当前目标',
            value: '取得进入上层矿区的资格，找到当年矿难账册，并保护仍留在边城的妹妹。',
            colSpan: 3,
          },
        ],
      },
      {
        title: '金手指（男主专属）',
        columns: 2,
        fields: [
          {
            key: 'ability-overview',
            label: '能力概述',
            value: '可看见物品和术法中的结构裂隙，并以精神力进行短暂修正或破坏。',
          },
          { key: 'ability-source', label: '能力来源', value: '幼年矿难中融合了一枚失去主人、尚未完全苏醒的天工核心。' },
          {
            key: 'ability-rules',
            label: '能力规则',
            value: '只能作用于已经理解的结构；目标越复杂，精神消耗越高。强行使用会留下不可逆裂纹。',
          },
          {
            key: 'ability-state',
            label: '能力状态',
            value: '开局仅能识别凡阶器物裂隙，每日稳定使用三次，尚未解锁主动修正。',
          },
        ],
      },
      {
        title: '实力与手段',
        columns: 2,
        fields: [
          { key: 'realm', label: '境界修为', value: '炼体境九重，尚未筑基，肉身强度略高于同境矿工。' },
          { key: 'cultivation', label: '功法体系', value: '修炼边城通用锻体诀，并尝试用裂隙视野修正行功路线。' },
          { key: 'combat-skills', label: '战斗技能', value: '近身短打、刻刀格斗和针对术法结构的精确破坏。' },
          { key: 'other-skills', label: '其他技能', value: '器物裂隙识别、临场修复、矿脉结构判断和基础锻造。' },
        ],
      },
      {
        title: '当前状态',
        columns: 2,
        fields: [
          {
            key: 'situation',
            label: '当前处境',
            value: '身份被矿场监工怀疑，必须在三日后的资格考核前找到新的担保人。',
          },
          {
            key: 'resources',
            label: '资源状态',
            value: '十二枚铜铢、一把旧刻刀、半份矿区地图，以及一次尚未使用的能力机会。',
          },
        ],
      },
      {
        title: '关系',
        columns: 2,
        fields: [
          {
            key: 'relationships',
            label: '人物关系',
            value: '妹妹林禾是行动底线；与巡矿使顾沉舟互相利用；被监工赵魁持续盯防。',
          },
          { key: 'faction', label: '隶属势力', value: '当前不隶属宗门，暂归边城矿籍，正在筹建矿工互助队。' },
        ],
      },
    ],
  },
  'su-wan-ning': createRoleProfile({
    name: '苏晚凝',
    identity: '女主角',
    base: [
      { key: 'appearance', label: '外貌', value: '白衣束袖，眉眼清冷，常佩一柄无鞘短剑。', compact: true },
      { key: 'personality', label: '性格', value: '理智果断，外冷内韧，对宗门规矩保持警惕。', compact: true },
      { key: 'aliases', label: '称号/外号/别称', value: '凝霜剑、苏师姐', compact: true },
    ],
    backgroundAndGoal: [
      { key: 'background', label: '人物背景', value: '出身上三重天没落剑宗，是宗门重建计划中唯一掌握旧剑库密钥的人。' },
      { key: 'goal', label: '当前目标', value: '查清师父失踪真相，保住剑宗传承，同时摆脱被宗门联姻利用的命运。' },
    ],
    strengthAndMethods: [
      { key: 'realm', label: '境界修为', value: '凝丹境中期，根基稳固，但旧伤导致长时间御剑后经脉刺痛。' },
      { key: 'cultivation', label: '功法体系', value: '修炼寒月剑典，以剑意凝霜封锁对手灵力运转。' },
      { key: 'combat-skills', label: '战斗技能', value: '近身快剑、寒霜剑域、短时封脉，擅长打断敌方蓄势。' },
      { key: 'other-skills', label: '其他技能', value: '御剑赶路、剑阵辨识、旧剑库机关解读和宗门礼仪。' },
    ],
    storyRoleAndStance: [
      { key: 'story-role', label: '角色作用', value: '连接上层宗门线与旧剑库秘密，是主角进入上三重天的重要合作者。' },
      { key: 'stance', label: '阵营立场', value: '优先守护剑宗弟子，不盲从宗门高层；与主角合作但保留独立判断。' },
    ],
    currentState: [
      { key: 'situation', label: '当前处境', value: '遭宗门内鬼监视，必须在剑库开启前确认主角是否值得托付密钥。' },
      { key: 'resources', label: '资源状态', value: '寒月短剑、旧剑库密钥、三枚疗伤丹，以及两名可信任的外门弟子。' },
    ],
    relationshipsAndNotes: [
      { key: 'relationships', label: '人物关系', value: '与林刻从互相试探发展为并肩合作；对师叔沈鹤保持表面服从。' },
      { key: 'other', label: '其他', value: '不依附主角成长，有自己的目标、选择和阶段性胜负。' },
    ],
  }),
  'han-zhen': createRoleProfile({
    name: '韩镇',
    identity: '重要配角',
    base: [
      { key: 'appearance', label: '外貌', value: '身形魁梧，右臂布满旧伤，常披玄铁护肩。', compact: true },
      { key: 'personality', label: '性格', value: '寡言守诺，判断务实，对年轻弟子格外严厉。', compact: true },
      { key: 'aliases', label: '称号/外号/别称', value: '镇山手、韩教头', compact: true },
    ],
    backgroundAndGoal: [
      {
        key: 'background',
        label: '人物背景',
        value: '曾任边军百夫长，因拒绝掩盖矿区事故被除名，如今负责训练城防新人。',
      },
      { key: 'goal', label: '当前目标', value: '保护边城百姓并洗清旧部罪名，不愿再次成为权贵争斗的弃子。' },
    ],
    strengthAndMethods: [
      { key: 'realm', label: '境界修为', value: '筑基境圆满，正面战力强，但右臂旧伤限制持续作战。' },
      { key: 'cultivation', label: '功法体系', value: '修炼军阵炼体诀，通过稳固气血和队形配合强化攻防。' },
      { key: 'combat-skills', label: '战斗技能', value: '镇山拳、军阵合击、地形封锁，擅长保护弱者与拖住强敌。' },
      { key: 'other-skills', label: '其他技能', value: '练兵、战场急救、地形判断和边军旧部联络。' },
    ],
    storyRoleAndStance: [
      {
        key: 'story-role',
        label: '角色作用',
        value: '主角早期的实战导师和边城情报入口，也承担揭示旧军方利益链的任务。',
      },
      { key: 'stance', label: '阵营立场', value: '站在边城和旧部一方；认可主角能力，但会反对拿平民冒险的方案。' },
      { key: 'knowledge', label: '掌握情报', value: '熟悉矿区暗道、边军旧部和十年前事故的部分幸存者名单。' },
      { key: 'story-link', label: '剧情关联', value: '矿难旧案、边军清洗和顾沉舟调查线都需要通过他取得关键证词。' },
    ],
    currentState: [
      { key: 'situation', label: '当前处境', value: '身份被重新调查，仍秘密联络三名散落各地的旧部。' },
      { key: 'resources', label: '资源状态', value: '一套残缺军阵、边城训练场、三条旧部联络线和少量疗伤药。' },
    ],
    relationshipsAndNotes: [
      {
        key: 'relationships',
        label: '人物关系',
        value: '把林刻视为可塑之才；与巡矿使顾沉舟有旧怨；受百夫长旧部信任。',
      },
      { key: 'other', label: '其他', value: '帮助主角有明确原因，也会因底线和利益变化产生分歧。' },
    ],
  }),
  'xue-wu-hen': createRoleProfile({
    name: '薛无痕',
    identity: '阶段反派',
    base: [
      { key: 'appearance', label: '外貌', value: '面容温雅，瞳色偏灰，衣袖常带淡淡药香。', compact: true },
      { key: 'personality', label: '性格', value: '耐心自负，擅长示弱，把所有关系都视作筹码。', compact: true },
      { key: 'aliases', label: '称号/外号/别称', value: '无痕公子、血衣客', compact: true },
    ],
    backgroundAndGoal: [
      {
        key: 'background',
        label: '人物背景',
        value: '出身血河宗旁支，幼年因灵根缺陷被放弃，靠献祭秘术重新进入核心序列。',
      },
      { key: 'goal', label: '当前目标', value: '夺取边城地下的天工核心，以此换取血河宗少宗主候选资格。' },
      { key: 'desire', label: '核心欲望', value: '证明自己比宗门嫡系更有资格掌权，并彻底摆脱被再次抛弃的恐惧。' },
      { key: 'logic', label: '行为逻辑', value: '先用利益收买，再制造依赖，最后清除拒绝进入其规则的人。' },
    ],
    strengthAndMethods: [
      { key: 'realm', label: '境界修为', value: '凝丹境初期，真实灵力不稳，依靠血傀分担反噬。' },
      { key: 'cultivation', label: '功法体系', value: '修炼血河祭傀经，以精血禁制连接傀儡并转移自身伤势。' },
      { key: 'combat-skills', label: '战斗技能', value: '远程引爆血傀禁制，并借祭血阵短时提升一个小境界。' },
      { key: 'other-skills', label: '其他技能', value: '药理、身份伪装、利益谈判和组织渗透。' },
    ],
    special: {
      title: '反派计划（反派专属）',
      fields: [
        { key: 'plan', label: '阶段计划', value: '制造矿难迫使边城封锁，再以救援名义接管矿区并寻找核心入口。' },
        {
          key: 'conflict',
          label: '与主角冲突',
          value: '主角修复矿脉阵法会破坏封锁计划，双方围绕核心归属和矿工生死正面冲突。',
        },
        { key: 'cost', label: '失败代价', value: '失去少宗主资格并被血傀反噬，因此越接近失败越容易采取极端手段。' },
        {
          key: 'weakness',
          label: '弱点破绽',
          value: '过度依赖控制关系；血傀与本体共享痛觉，封锁祭血阵即可暴露真实修为。',
        },
      ],
    },
    storyRoleAndStance: [
      {
        key: 'story-role',
        label: '角色作用',
        value: '作为边城篇主要压力来源，推动矿难旧案、天工核心和血河宗三条线汇合。',
      },
      { key: 'stance', label: '阵营立场', value: '效忠血河宗外堂，但一切行动以争夺少宗主资格和自身存活为先。' },
      { key: 'faction', label: '所属势力', value: '血河宗外堂，控制矿场监工、黑市药商和两支血傀小队。' },
      { key: 'exposure', label: '暴露程度', value: '表面身份仍是外来药商，仅顾沉舟怀疑其与血河宗有关。' },
    ],
    currentState: [
      { key: 'situation', label: '当前处境', value: '尚未确认天工核心宿主，正借监工赵魁筛查矿难幸存者。' },
      { key: 'resources', label: '资源状态', value: '六具血傀、矿场内应名单、半张核心封印图和一枚宗门求援符。' },
    ],
    relationshipsAndNotes: [
      { key: 'relationships', label: '人物关系', value: '控制赵魁，利用宗门师弟薛成，把林刻视为可收编的核心宿主。' },
      { key: 'other', label: '其他', value: '每次行动都有收益预期、失败代价和可被主角利用的破绽。' },
    ],
  }),
};

export const WORK_PREVIEWS: Record<WorkPreviewId, { group: string; fields: FieldDefinition[] }> = {
  'work-positioning': {
    group: '核心设定',
    fields: [
      { key: 'genre', label: '故事类型', value: '东方玄幻、升级流、势力经营' },
      {
        key: 'idea',
        label: '核心创意',
        value: '主角能看见万物结构裂隙，从修补一件废器开始，逐步触及整个世界的崩坏真相。',
      },
      {
        key: 'summary',
        label: '一句话概括',
        value: '边城矿奴凭借洞察裂隙的能力修器、破法、建城，最终重铸即将崩塌的九重天。',
      },
    ],
  },
  'world-background': {
    group: '核心设定',
    fields: [
      {
        key: 'era',
        label: '时代背景',
        value: '九重天自混沌初开后已经历三次天裂，如今处于宗门与新兴城邦争夺矿脉的铸世历末期。',
      },
      {
        key: 'world',
        label: '世界格局',
        value: '上三重天由古宗垄断，中三重天由城邦联盟割据，下三重天承担矿产与人口供给。',
      },
      {
        key: 'order',
        label: '社会秩序',
        value: '身份、修为与资源配额共同决定阶层。凡人可通过工籍晋升，但核心术法仍由宗门严格控制。',
      },
    ],
  },
};

export function isRolePreviewId(id: PreviewId): id is RolePreviewId {
  return id in ROLE_PROFILES;
}
