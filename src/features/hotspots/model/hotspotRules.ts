import type { HotspotItem } from '@/features/hotspots/model/hotspotTypes';

export type HotspotRulePolarity = 'bonus' | 'penalty' | 'risk';

export interface HotspotRuleGroup {
  id: string;
  name: string;
  polarity: HotspotRulePolarity;
  score: number;
  description: string;
  keywords: string[];
}

export interface HotspotRuleEvaluation {
  score: number;
  level: 'high' | 'medium' | 'low' | 'risk';
  levelLabel: string;
  matchedRules: Array<{
    id: string;
    name: string;
    score: number;
    polarity: HotspotRulePolarity;
    matchedKeywords: string[];
  }>;
}

export const HOTSPOT_RULE_BASE_SCORE = 50;

export const HOTSPOT_RULE_GROUPS: HotspotRuleGroup[] = [
  {
    id: 'strong-emotion',
    name: '强情绪/强反转',
    polarity: 'bonus',
    score: 14,
    description: '读者容易代入的情绪钩子，适合转成开局受压、反击、打脸或爽点链路。',
    keywords: ['被嘲', '逆袭', '反转', '翻车', '破防', '崩了', '爆火', '出圈', '打脸', '争议', '突然', '首次'],
  },
  {
    id: 'identity-gap',
    name: '身份反差',
    polarity: 'bonus',
    score: 16,
    description: '普通身份和高能力/高处境之间有落差，适合都市、系统流、娱乐圈、升级流。',
    keywords: ['普通人', '外卖员', '保安', '学徒', '草根', '黑马', '天才', '少女', '00后', '新人', '小伙', '大学生'],
  },
  {
    id: 'industry-secret',
    name: '行业内幕/商业博弈',
    polarity: 'bonus',
    score: 13,
    description: '行业规则、资本、平台和流量冲突容易抽象成虚构世界的势力与规则。',
    keywords: [
      '资本',
      '平台',
      '公司',
      '品牌',
      '直播',
      '短视频',
      '带货',
      '流量',
      '商业',
      '行业',
      '老板',
      '职场',
      '机构',
    ],
  },
  {
    id: 'tech-imagination',
    name: '技术想象',
    polarity: 'bonus',
    score: 15,
    description: '可以转成金手指、系统能力、未来科技、修炼体系或世界观规则。',
    keywords: ['AI', '机器人', '芯片', '算法', '系统', '黑科技', '技术', '无人机', '新能源', '量子', '脑机', '数据'],
  },
  {
    id: 'relationship-conflict',
    name: '人物关系/立场冲突',
    polarity: 'bonus',
    score: 12,
    description: '关系张力明确，适合改成主角、对手、盟友、家人或师徒之间的长期冲突。',
    keywords: ['前任', '夫妻', '父母', '母亲', '父亲', '亲子', '同学', '师徒', '老板', '员工', '队友', '搭档', '朋友'],
  },
  {
    id: 'social-anxiety',
    name: '社会焦虑/群体共鸣',
    polarity: 'bonus',
    score: 10,
    description: '能抽象成群体压力和时代焦虑，适合都市现实向、职场、校园或系统爽文。',
    keywords: [
      '就业',
      '失业',
      '买房',
      '房贷',
      '彩礼',
      '加班',
      '内卷',
      '焦虑',
      '年轻人',
      '毕业',
      '学历',
      '收入',
      '消费',
    ],
  },
  {
    id: 'sports-result',
    name: '纯比赛结果',
    polarity: 'penalty',
    score: -22,
    description: '比分和赛果通常只能借情绪，不适合直接当长篇选题。',
    keywords: ['夺冠', '晋级', '决赛', '半决赛', '总决赛', '淘汰', '比分', '4:3', '3:0', '2:1', '绝杀', '战胜'],
  },
  {
    id: 'weather-disaster',
    name: '天气/灾害',
    polarity: 'penalty',
    score: -24,
    description: '真实灾害不宜直接改写，可只抽象成极端环境、末世规则或救援背景。',
    keywords: ['暴雨', '台风', '高温', '地震', '洪水', '山火', '泥石流', '塌方', '强降雨', '雷暴', '冰雹'],
  },
  {
    id: 'official-notice',
    name: '公告/通报/发布会',
    polarity: 'penalty',
    score: -18,
    description: '信息性强，戏剧冲突弱，通常只适合做背景素材。',
    keywords: ['发布会', '通报', '通知', '公告', '回应', '声明', '辟谣', '发布', '官宣', '提醒'],
  },
  {
    id: 'sensitive-realcase',
    name: '真实刑案/伤亡高风险',
    polarity: 'risk',
    score: -35,
    description: '高风险内容需要避免影射真实人物和真实事件，不建议直接写。',
    keywords: ['刑案', '死亡', '遇难', '坠机', '杀人', '诈骗', '失联', '被害', '伤亡', '嫌犯', '警方', '逮捕', '拘留'],
  },
  {
    id: 'politics-diplomacy',
    name: '政治/外交/军事敏感',
    polarity: 'risk',
    score: -30,
    description: '现实指向强，改编风险高，不适合作为普通网文热点题材。',
    keywords: ['总统', '首相', '外交', '制裁', '军方', '导弹', '战争', '冲突', '选举', '议会', '政府'],
  },
  {
    id: 'celebrity-gossip',
    name: '真实明星八卦',
    polarity: 'penalty',
    score: -12,
    description: '可以借娱乐圈情绪，但不应直接影射真人。',
    keywords: ['明星', '演员', '歌手', '恋情', '离婚', '绯闻', '粉丝', '塌房', '经纪人', '顶流'],
  },
];

function normalizeText(value: string) {
  return value.toLowerCase();
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getEvaluationLevel(score: number, hasRisk: boolean): HotspotRuleEvaluation['level'] {
  if (hasRisk && score < 55) return 'risk';
  if (score >= 72) return 'high';
  if (score >= 52) return 'medium';
  return 'low';
}

export function evaluateHotspotByRules(item: HotspotItem): HotspotRuleEvaluation {
  const target = normalizeText([item.title, item.category, item.sourceName].filter(Boolean).join(' '));
  const matchedRules = HOTSPOT_RULE_GROUPS.map((group) => {
    const matchedKeywords = group.keywords.filter((keyword) => target.includes(normalizeText(keyword)));
    if (matchedKeywords.length === 0) return null;
    return {
      id: group.id,
      name: group.name,
      score: group.score,
      polarity: group.polarity,
      matchedKeywords,
    };
  }).filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));

  const score = clampScore(HOTSPOT_RULE_BASE_SCORE + matchedRules.reduce((total, rule) => total + rule.score, 0));
  const hasRisk = matchedRules.some((rule) => rule.polarity === 'risk');
  const level = getEvaluationLevel(score, hasRisk);
  const levelLabel =
    level === 'high' ? '高适配' : level === 'medium' ? '可借情绪' : level === 'risk' ? '风险较高' : '低适配';
  return { score, level, levelLabel, matchedRules };
}

export function rankHotspotsByRuleEvaluation(items: HotspotItem[]) {
  return [...items].sort((left, right) => {
    const leftEvaluation = evaluateHotspotByRules(left);
    const rightEvaluation = evaluateHotspotByRules(right);
    if (leftEvaluation.score !== rightEvaluation.score) return rightEvaluation.score - leftEvaluation.score;
    return left.rank - right.rank;
  });
}
