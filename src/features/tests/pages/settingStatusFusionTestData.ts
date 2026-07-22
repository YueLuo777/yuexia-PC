export type SettingFieldPolicy = '锁定' | '谨慎更新' | '变化时检测' | '每章检测' | '关键变化';
export type SettingUpdateKind = '状态变化' | '信息补充' | '内容纠错';

export type SettingField = {
  key: string;
  label: string;
  group: string;
  value: string;
  policy: SettingFieldPolicy;
  updatedChapter?: number;
};

export type SettingHistoryEvent = {
  id: string;
  settingId: string;
  fieldKey: string;
  fieldLabel: string;
  kind: SettingUpdateKind;
  before: string;
  after: string;
  chapter: number;
  paragraph: number;
  evidence: string;
  context: string;
  reason: string;
  confirmedAt: string;
};

export type PendingSettingUpdate = Omit<SettingHistoryEvent, 'confirmedAt'>;

export type FusionSetting = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  fields: SettingField[];
};

export const FUSION_SETTING_CATEGORIES = [
  { name: '人物设定', count: 2 },
  { name: '物品装备', count: 1 },
  { name: '伏笔线索', count: 1 },
] as const;

export const FUSION_SETTINGS: FusionSetting[] = [
  {
    id: 'lin-yue',
    title: '林月',
    category: '人物设定',
    subtitle: '核心人物 · 存活',
    fields: [
      { key: 'identity', label: '身份定位', group: '身份档案', value: '青云城林家遗孤，赤霄剑原持有者。', policy: '锁定', updatedChapter: 1 },
      { key: 'appearance', label: '外貌', group: '外貌与称号', value: '青色长衫，束发，右眉有一道浅色旧伤。', policy: '变化时检测', updatedChapter: 10 },
      { key: 'alias', label: '称号/别称', group: '外貌与称号', value: '暂未公开称号。', policy: '谨慎更新' },
      { key: 'personality', label: '核心性格', group: '性格与背景', value: '克制、警惕，不轻易向陌生人交付信任。', policy: '谨慎更新', updatedChapter: 8 },
      { key: 'background', label: '人物背景', group: '性格与背景', value: '林家覆灭后独自追查旧案，真实血脉仍未揭晓。', policy: '谨慎更新', updatedChapter: 6 },
      { key: 'relationship', label: '人物关系', group: '当前状态', value: '与韩策互相戒备，暂时同行。', policy: '变化时检测', updatedChapter: 10 },
      { key: 'situation', label: '当前处境', group: '当前状态', value: '前往黑石镇途中，右肩轻伤。', policy: '每章检测', updatedChapter: 11 },
      { key: 'goal', label: '当前目标', group: '当前状态', value: '进入黑石镇，寻找林家旧案线索。', policy: '每章检测', updatedChapter: 11 },
      { key: 'resources', label: '资源与持有物', group: '当前状态', value: '赤霄剑、残缺路引、碎银十二两。', policy: '变化时检测', updatedChapter: 11 },
    ],
  },
  {
    id: 'han-ce',
    title: '韩策',
    category: '人物设定',
    subtitle: '重要配角 · 存活',
    fields: [
      { key: 'identity', label: '身份定位', group: '身份档案', value: '来历不明的游侠，熟悉北境道路。', policy: '谨慎更新', updatedChapter: 5 },
      { key: 'appearance', label: '外貌', group: '外貌与称号', value: '黑色短衣，左手虎口有长期用剑留下的茧。', policy: '变化时检测', updatedChapter: 5 },
      { key: 'relationship', label: '人物关系', group: '当前状态', value: '对林月保持戒备。', policy: '变化时检测', updatedChapter: 10 },
      { key: 'goal', label: '当前目标', group: '当前状态', value: '护送林月抵达黑石镇。', policy: '每章检测', updatedChapter: 10 },
    ],
  },
  {
    id: 'chi-xiao',
    title: '赤霄剑',
    category: '物品装备',
    subtitle: '重要法宝 · 未认主',
    fields: [
      { key: 'origin', label: '来历', group: '设定档案', value: '林家祖传古剑，剑鞘存在无法解释的旧裂纹。', policy: '谨慎更新', updatedChapter: 3 },
      { key: 'rules', label: '能力与限制', group: '设定档案', value: '尚未完全解封，强行催动会反噬持有者。', policy: '锁定', updatedChapter: 3 },
      { key: 'owner', label: '当前持有者', group: '当前状态', value: '林月', policy: '关键变化', updatedChapter: 11 },
      { key: 'condition', label: '当前状态', group: '当前状态', value: '剑身完整，剑鞘有旧裂纹。', policy: '变化时检测', updatedChapter: 11 },
    ],
  },
  {
    id: 'night-walker',
    title: '夜行客身份',
    category: '伏笔线索',
    subtitle: '身份伏笔 · 未回收',
    fields: [
      { key: 'content', label: '伏笔内容', group: '伏笔档案', value: '酒客偶尔提到“夜行客”，真实身份和目的未知。', policy: '谨慎更新', updatedChapter: 7 },
      { key: 'stage', label: '当前阶段', group: '当前状态', value: '已埋下，尚无直接目击。', policy: '关键变化', updatedChapter: 7 },
      { key: 'related', label: '关联对象', group: '当前状态', value: '暂未确认。', policy: '变化时检测' },
    ],
  },
];

export const FUSION_HISTORY: SettingHistoryEvent[] = [
  {
    id: 'history-lin-appearance-10', settingId: 'lin-yue', fieldKey: 'appearance', fieldLabel: '外貌', kind: '信息补充',
    before: '青色长衫，束发。', after: '青色长衫，束发，右眉有一道浅色旧伤。', chapter: 10, paragraph: 18,
    evidence: '灯火照过她的侧脸，右眉那道浅白旧伤一闪而过。',
    context: '韩策第一次在近距离看清林月的容貌，正文补充了此前没有记录的稳定特征。',
    reason: '这是补充已存在的外貌特征，并非人物刚刚受伤。', confirmedAt: '第10章审核后',
  },
  {
    id: 'history-lin-situation-11', settingId: 'lin-yue', fieldKey: 'situation', fieldLabel: '当前处境', kind: '状态变化',
    before: '沿北境官道赶路，身体无明显负担。', after: '前往黑石镇途中，右肩轻伤。', chapter: 11, paragraph: 32,
    evidence: '箭锋擦过右肩，血很快浸湿半边衣袖。',
    context: '林月在箭雨中受伤，但仍能继续行动，伤势暂定为轻伤。',
    reason: '正文明确出现伤势变化，并开始影响后续行动。', confirmedAt: '第11章审核后',
  },
  {
    id: 'history-lin-relation-10', settingId: 'lin-yue', fieldKey: 'relationship', fieldLabel: '人物关系', kind: '状态变化',
    before: '不信任韩策，拒绝同行。', after: '与韩策互相戒备，暂时同行。', chapter: 10, paragraph: 26,
    evidence: '“只到黑石镇。”林月收起短刃，算是答应了同行。',
    context: '两人的关系从拒绝接触转为带有戒备的短期合作。',
    reason: '合作关系成立，但信任尚未建立。', confirmedAt: '第10章审核后',
  },
  {
    id: 'history-sword-owner-11', settingId: 'chi-xiao', fieldKey: 'owner', fieldLabel: '当前持有者', kind: '状态变化',
    before: '林家保管', after: '林月', chapter: 11, paragraph: 4,
    evidence: '她从旧匣中取出赤霄剑，第一次将它负在身后。',
    context: '赤霄剑正式离开林家旧宅，由林月随身持有。',
    reason: '物品持有关系发生明确变化。', confirmedAt: '第11章审核后',
  },
];

export const FUSION_PENDING_UPDATES: PendingSettingUpdate[] = [
  {
    id: 'pending-lin-appearance-12', settingId: 'lin-yue', fieldKey: 'appearance', fieldLabel: '外貌', kind: '状态变化',
    before: '青色长衫，束发，右眉有一道浅色旧伤。', after: '换上白色劲装，右肩缠着已经渗血的绷带。', chapter: 12, paragraph: 4,
    evidence: '箭头擦着肩骨穿过，换过的白色劲装很快又被右肩渗出的血染红。',
    context: '前一段：林月和韩策进入黑石镇。\n当前段：她的箭伤再次渗血，外衣和伤势都出现可见变化。\n后一段：两人在城南客栈停下。',
    reason: '外貌属于可变化字段，本次同时包含衣着变化和伤势造成的可见特征。',
  },
  {
    id: 'pending-lin-situation-12', settingId: 'lin-yue', fieldKey: 'situation', fieldLabel: '当前处境', kind: '状态变化',
    before: '前往黑石镇途中，右肩轻伤。', after: '已进入黑石镇，右肩箭伤加重，右臂活动受限。', chapter: 12, paragraph: 4,
    evidence: '她抬起右臂时，伤口再次渗出血来，只能改用左手牵马。',
    context: '正文先确认两人越过黑石镇界碑，随后写明伤口再次渗血并影响右臂活动。',
    reason: '位置和伤势均有明确变化，且已影响人物行动。',
  },
  {
    id: 'pending-sword-owner-12', settingId: 'chi-xiao', fieldKey: 'owner', fieldLabel: '当前持有者', kind: '状态变化',
    before: '林月', after: '韩策', chapter: 12, paragraph: 6,
    evidence: '林月将赤霄剑推到韩策面前：“接下来的路，它交给你。”',
    context: '韩策随后握住剑柄并收起赤霄剑，交接动作已经完成。',
    reason: '正文明确完成物品转交，应更新当前持有者。',
  },
  {
    id: 'pending-night-stage-12', settingId: 'night-walker', fieldKey: 'stage', fieldLabel: '当前阶段', kind: '信息补充',
    before: '已埋下，尚无直接目击。', after: '再次被提及，疑似与黑石镇黑袍老人有关。', chapter: 12, paragraph: 7,
    evidence: '楼下酒客低声提起了“夜行客”这个称号。',
    context: '同章此前出现身份不明的黑袍老人，但正文尚未确认两者为同一人。',
    reason: '只能补充疑似关联，不能直接把黑袍老人确认为夜行客。',
  },
];
