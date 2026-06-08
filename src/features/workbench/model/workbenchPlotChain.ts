import type { PlotLibraryItem } from '@/features/plot-library/model/plotLibraryTypes';
import { getPlotPointDisplayText, prepareCollapsedPlotPointCard } from '@/features/workbench/model/workbenchPlotPointCard';

export type PlotPointSourceMode = 'library' | 'ai' | 'mixed';
export type PlotPointLengthMode = 'short' | 'medium' | 'long';
export type PlotPointChainSlot = 1 | 2 | 3;

export type WorkbenchPlotPointCandidate = {
  id: string;
  title: string;
  source: '剧情库' | 'AI生成';
  originalGenre: string;
  original: string;
  adapted: string;
  variable: string;
  review?: string;
  score?: string | null;
};

export const PLOT_POINT_CHAIN_SLOTS: PlotPointChainSlot[] = [1, 2, 3];
const HIDDEN_PLOT_POINT_SOURCE_MODES: PlotPointSourceMode[] = ['library', 'mixed'];
export const PLOT_POINT_GENERATE_COUNTS = [5, 10, 20] as const;
const PLOT_POINT_LENGTH_MODES: PlotPointLengthMode[] = ['short', 'medium', 'long'];
export const PLOT_POINT_OPENING_ELEMENT_OPTIONS = ['强情绪', '强冲突', '强悬念', '强期待', '强爽点', '强压迫'];
export const DEFAULT_PLOT_POINT_OPENING_ELEMENTS = ['强情绪', '强冲突'];

export const PLOT_POINT_FALLBACK_CANDIDATES: WorkbenchPlotPointCandidate[] = [
  {
    id: 'fallback-pressure-start',
    title: '开局强压迫',
    source: 'AI生成',
    originalGenre: '通用',
    original: '主角刚进入故事就被推到压力中心，必须立刻做出选择。',
    adapted: '主角在关键场合被当众否定，原本依靠的身份、资源或关系同时失效，只能靠一个微弱线索自救。',
    variable: '压力场景 / 身份失效 / 自救线索',
  },
  {
    id: 'fallback-hidden-cost',
    title: '获得机会但付出代价',
    source: '剧情库',
    originalGenre: '成长流',
    original: '主角得到一次翻身机会，但机会附带隐藏代价。',
    adapted: '主角发现一条能逆转困局的路径，但每推进一步都会暴露更深的风险和敌人的关注。',
    variable: '翻身机会 / 隐藏代价 / 敌人关注',
  },
  {
    id: 'fallback-first-victory',
    title: '第一场小胜',
    source: '剧情库',
    originalGenre: '爽文节奏',
    original: '主角先赢下一场小胜，让读者看到希望，但大危机还没解除。',
    adapted: '主角用一个不起眼的细节赢回第一点主动权，同时引出更大的幕后问题。',
    variable: '小胜 / 主动权 / 幕后问题',
  },
];

export function getPlotPointLengthLabel(length: PlotPointLengthMode) {
  if (length === 'short') return '短';
  if (length === 'medium') return '中';
  return '长';
}

export function normalizePlotPointSourceMode(value?: string | null): PlotPointSourceMode {
  if (value === 'ai') return 'ai';
  if ((value === 'library' || value === 'mixed') && !HIDDEN_PLOT_POINT_SOURCE_MODES.includes(value)) return value;
  return 'ai';
}

export function normalizePlotPointGenerateCount(value?: number | null): (typeof PLOT_POINT_GENERATE_COUNTS)[number] {
  return PLOT_POINT_GENERATE_COUNTS.includes(value as (typeof PLOT_POINT_GENERATE_COUNTS)[number])
    ? (value as (typeof PLOT_POINT_GENERATE_COUNTS)[number])
    : 10;
}

export function normalizePlotPointLengthMode(value?: string | null): PlotPointLengthMode {
  return PLOT_POINT_LENGTH_MODES.includes(value as PlotPointLengthMode) ? (value as PlotPointLengthMode) : 'short';
}

export function normalizePlotPointOpeningElements(value?: string[] | null) {
  const elements = Array.isArray(value)
    ? value.filter((item) => PLOT_POINT_OPENING_ELEMENT_OPTIONS.includes(item))
    : DEFAULT_PLOT_POINT_OPENING_ELEMENTS;
  return Array.from(new Set(elements));
}

export function normalizePlotPointChainSlot(value?: number | null): PlotPointChainSlot {
  return PLOT_POINT_CHAIN_SLOTS.includes(value as PlotPointChainSlot) ? (value as PlotPointChainSlot) : 1;
}

export function normalizePlotPointChainSelections(value?: unknown): Record<PlotPointChainSlot, string[]> {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    1: Array.isArray(source['1']) ? source['1'].filter((item): item is string => typeof item === 'string') : [],
    2: Array.isArray(source['2']) ? source['2'].filter((item): item is string => typeof item === 'string') : [],
    3: Array.isArray(source['3']) ? source['3'].filter((item): item is string => typeof item === 'string') : [],
  };
}

export function normalizePlotPointChainNames(value?: unknown): Record<PlotPointChainSlot, string> {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    PLOT_POINT_CHAIN_SLOTS.map((slot) => {
      const name = source[String(slot)];
      return [slot, typeof name === 'string' && name.trim() ? name : `剧情链${slot}`];
    }),
  ) as Record<PlotPointChainSlot, string>;
}

export function getWorkbenchPlotPointText(item: WorkbenchPlotPointCandidate, length: PlotPointLengthMode) {
  if (length === 'short') return item.adapted;
  if (length === 'medium') return `${item.adapted} 这个剧情点可以展开成一个完整场景，重点写清冲突、选择和结果。`;
  return `${item.adapted} 这个剧情点可以扩展为多场连续推进：先制造压力，再给主角选择，随后出现代价或反转，最后留下下一步期待。`;
}

export function getWorkbenchPlotPointPreviewText(item: WorkbenchPlotPointCandidate) {
  return prepareCollapsedPlotPointCard(item).previewText || item.adapted.replace(/\s+/g, ' ').trim();
}

export function getWorkbenchPlotPointDisplayText(item: WorkbenchPlotPointCandidate, previewText: string) {
  const title = prepareCollapsedPlotPointCard(item).title;
  return getPlotPointDisplayText({ title, previewText });
}

export function getWorkbenchPlotPointReview(item: WorkbenchPlotPointCandidate, hasChain: boolean) {
  if (item.review?.trim()) return `AI评价：${item.review.replace(/^AI评价[：:]\s*/, '').trim()}`;
  if (hasChain) return 'AI评价：适合作为衔接点，重点要承接上一条剧情的后果，不要重新开一条无关冲突。';
  if (item.source === '剧情库') return 'AI评价：有成熟剧情骨架，适合先做变量替换，再按当前设定调整人物、势力和道具。';
  return 'AI评价：适合自由生成时使用，建议补足明确目标、强冲突和下一步期待。';
}

export function getWorkbenchPlotPointNumericScore(value: string | null | undefined) {
  if (!value) return null;
  const match = value.match(/\d{1,3}(?:\.\d+)?/);
  if (!match) return null;
  const score = Number(match[0]);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
}

export function getWorkbenchPlotPointDecisionMetrics(
  item: WorkbenchPlotPointCandidate,
  scoreText: string | null | undefined,
  hasChain: boolean,
  index: number,
) {
  const baseScore = getWorkbenchPlotPointNumericScore(scoreText) ?? 82;
  const textLength = item.adapted.length;
  const clarity = Math.max(68, Math.min(96, baseScore + (textLength < 180 ? 4 : 0) - (textLength > 360 ? 5 : 0)));
  const potential = Math.max(70, Math.min(98, baseScore + (item.review ? 3 : 0) + (item.source === 'AI生成' ? 1 : 0)));
  const fit = hasChain
    ? Math.max(70, Math.min(98, baseScore + 4 - Math.min(index, 4)))
    : Math.max(68, Math.min(94, baseScore - 1));
  return { clarity, potential, fit };
}

export function getWorkbenchPlotPointFitLabel(fit: number, hasChain: boolean) {
  if (hasChain) {
    if (fit >= 90) return '强衔接';
    if (fit >= 82) return '可衔接';
    return '需调整';
  }
  if (fit >= 90) return '强开端';
  if (fit >= 82) return '开端可用';
  return '需打磨';
}

export function getWorkbenchPlotPointFitClass(fit: number) {
  if (fit >= 90) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (fit >= 82) return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

export function getWorkbenchPlotPointMetricClass(score: number) {
  if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';
  if (score >= 80) return 'border-purple-200 bg-purple-50 text-purple-700';
  if (score >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export function plotLibraryItemToCandidate(item: PlotLibraryItem): WorkbenchPlotPointCandidate {
  return {
    id: `library:${item.id}`,
    title: item.title || '未命名剧情点',
    source: '剧情库',
    originalGenre: item.tags[0] ?? item.chapter ?? '剧情库',
    original: item.content.trim().slice(0, 120) || item.title,
    adapted: item.content.trim().slice(0, 180) || item.title,
    variable: item.tags.length > 0 ? item.tags.join(' / ') : '按当前小说设定替换变量',
    score: item.rating == null ? undefined : String(item.rating),
  };
}
