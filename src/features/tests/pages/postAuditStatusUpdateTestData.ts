export type StatusTestParagraph = {
  number: number;
  text: string;
};

export type StatusTestChange = {
  id: string;
  targetId: string;
  target: string;
  group: string;
  category: '人物' | '道具' | '地点' | '伏笔' | '其他设定';
  field: string;
  before: string;
  after: string;
  paragraph: number;
  reason: string;
};

export type StatusChangeDecision = 'pending' | 'confirmed' | 'ignored';
export type NewSettingDecision = 'pending' | 'create' | 'ignored';

export const STATUS_TEST_CHAPTERS = [
  { serial: 9, title: '密林追踪', state: '已更新' },
  { serial: 10, title: '旧城来客', state: '已更新' },
  { serial: 11, title: '箭雨突围', state: '已更新' },
  { serial: 12, title: '黑石镇', state: '待更新' },
  { serial: 13, title: '夜探城主府', state: '未审核' },
] as const;

export const STATUS_TEST_PARAGRAPHS: StatusTestParagraph[] = [
  { number: 1, text: '暮色压低了远处的山脊，林月与韩策沿着荒废官道继续向北。' },
  { number: 2, text: '林月踏过残破的界碑，黑石镇低矮的城墙终于出现在暮色里。' },
  { number: 3, text: '守门人检查路引时，韩策始终站在她右后方，替她挡住街角窥探的视线。' },
  { number: 4, text: '箭头擦着肩骨穿过，她抬起右臂时，伤口再次渗出血来，只能改用左手牵马。' },
  { number: 5, text: '两人在城南客栈停下时，街对面的黑袍老人看了林月一眼，随即消失在人群里。' },
  { number: 6, text: '林月将赤霄剑推到韩策面前：“接下来的路，它交给你。”' },
  { number: 7, text: '韩策握住剑柄，沉默地检查剑鞘上的旧裂纹；楼下酒客则低声提起了“夜行客”这个称号。' },
  { number: 8, text: '韩策收起剑，没有再追问她的来历，只说了一句：“我跟你走。”' },
];

export const STATUS_TEST_SETTINGS = [
  { id: 'lin-yue', name: '林月', group: '人物设定', status: '青云城；轻伤；持有赤霄剑' },
  { id: 'han-ce', name: '韩策', group: '人物设定', status: '戒备林月；独自行事' },
  { id: 'chi-xiao', name: '赤霄剑', group: '物品装备', status: '持有者：林月' },
  { id: 'black-stone', name: '黑石镇', group: '地点设定', status: '尚未到达' },
] as const;

export const STATUS_TEST_DISCOVERED = [
  { name: '林月', kind: '人物', clue: '位置、伤势、持有物发生变化', settingId: 'lin-yue' },
  { name: '韩策', kind: '人物', clue: '态度和同行关系发生变化', settingId: 'han-ce' },
  { name: '黑袍老人', kind: '人物', clue: '正文提及，但身份信息不足', settingId: null },
  { name: '赤霄剑', kind: '道具', clue: '持有者发生变化', settingId: 'chi-xiao' },
  { name: '黑石镇', kind: '地点', clue: '主角已进入该地点', settingId: 'black-stone' },
  { name: '夜行客', kind: '称号', clue: '疑似新称号，设定库无同名条目', settingId: null },
] as const;

export const STATUS_TEST_CHANGES: StatusTestChange[] = [
  {
    id: 'location',
    targetId: 'lin-yue',
    target: '林月',
    group: '人物设定',
    category: '人物',
    field: '所在位置',
    before: '青云城',
    after: '已进入黑石镇',
    paragraph: 2,
    reason: '正文明确写到林月越过界碑并看见黑石镇城墙，可以确认位置已经变化。',
  },
  {
    id: 'injury',
    targetId: 'lin-yue',
    target: '林月',
    group: '人物设定',
    category: '人物',
    field: '身体状态',
    before: '轻伤，不影响行动',
    after: '右肩箭伤加重，右臂活动受限',
    paragraph: 4,
    reason: '伤口再次渗血并迫使她改用左手牵马，说明伤势已经影响行动。',
  },
  {
    id: 'sword-owner',
    targetId: 'chi-xiao',
    target: '赤霄剑',
    group: '物品装备',
    category: '道具',
    field: '当前持有者',
    before: '林月',
    after: '韩策',
    paragraph: 6,
    reason: '林月明确把赤霄剑交给韩策，物品归属发生变化。',
  },
  {
    id: 'attitude',
    targetId: 'han-ce',
    target: '韩策',
    group: '人物设定',
    category: '人物',
    field: '对林月态度',
    before: '保持戒备，不承诺同行',
    after: '初步信任，明确愿意同行',
    paragraph: 8,
    reason: '韩策不再追问来历并主动表示同行，态度从戒备转为初步信任。',
  },
  {
    id: 'town-arrival',
    targetId: 'black-stone',
    target: '黑石镇',
    group: '地点设定',
    category: '地点',
    field: '当前相关人物',
    before: '林月、韩策尚未到达',
    after: '林月、韩策已进入黑石镇',
    paragraph: 2,
    reason: '正文明确写到两人越过黑石镇界碑，可以把到达信息记录到地点当前状态。',
  },
];
