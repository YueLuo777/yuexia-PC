export type WorkProfileOptimizationTarget = 'title' | 'synopsis' | 'both';

export type WorkProfileOptimizationCandidate = {
  id: string;
  title: string;
  synopsis: string;
};

export type WorkProfileOptimizationRequest = {
  target: WorkProfileOptimizationTarget;
  count: number;
  style: string;
  referenceTitles: string;
  requirements: string;
  currentTitle: string;
  currentSynopsis: string;
  channel: string;
  category: string;
  targetWordCount: number;
};

export const WORK_PROFILE_OPTIMIZATION_PROMPT_NAME = '标准模式-作品资料优化';

export const WORK_PROFILE_OPTIMIZATION_STYLES = [
  '网文爆款',
  '简洁有力',
  '悬念钩子',
  '爽点直给',
  '意境文艺',
  '轻松幽默',
] as const;

export const DEFAULT_WORK_PROFILE_OPTIMIZATION_PROMPT = `你是专业的中文网文书名与作品简介策划。
请根据作品资料和用户要求生成候选方案。书名必须有辨识度、符合频道与题材，最多20个汉字；简介应突出主角、核心矛盾、核心卖点与追读钩子，最多1000个汉字。
只输出合法JSON，不要输出Markdown代码块、解释、思考过程或其他文字。固定格式：
{"candidates":[{"title":"候选书名","synopsis":"候选简介"}]}`;

function targetLabel(target: WorkProfileOptimizationTarget) {
  if (target === 'title') return '只生成书名，synopsis保留为空字符串';
  if (target === 'synopsis') return '只生成简介，title保留为空字符串';
  return '同时生成相互匹配的书名和简介';
}

export function buildWorkProfileOptimizationUserContent(request: WorkProfileOptimizationRequest) {
  const targetWords = request.targetWordCount > 0
    ? `${Math.round(request.targetWordCount / 10_000)}万字`
    : '未填写';
  return [
    `生成目标：${targetLabel(request.target)}`,
    `候选数量：${request.count}个`,
    `书名风格：${request.style}`,
    `作品频道：${request.channel || '未填写'}`,
    `作品题材：${request.category || '未填写'}`,
    `预计篇幅：${targetWords}`,
    `当前书名：${request.currentTitle || '未填写'}`,
    `当前简介：${request.currentSynopsis || '未填写'}`,
    `参考书名：${request.referenceTitles.trim() || '无'}`,
    `用户要求：${request.requirements.trim() || '无额外要求'}`,
    '',
    `必须返回恰好${request.count}个候选。不要复刻参考书名，不要使用书名号。`,
  ].join('\n');
}

function extractJsonText(content: string) {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) return trimmed.slice(objectStart, objectEnd + 1);
  return trimmed;
}

function normalizeCandidate(
  value: unknown,
  index: number,
  target: WorkProfileOptimizationTarget,
): WorkProfileOptimizationCandidate | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim().replace(/^《|》$/g, '').slice(0, 20) : '';
  const synopsis = typeof record.synopsis === 'string' ? record.synopsis.trim().slice(0, 1000) : '';
  if (target === 'title' && !title) return null;
  if (target === 'synopsis' && !synopsis) return null;
  if (target === 'both' && (!title || !synopsis)) return null;
  return { id: `candidate-${index + 1}`, title, synopsis };
}

export function parseWorkProfileOptimizationCandidates(
  content: string,
  target: WorkProfileOptimizationTarget,
  count: number,
) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonText(content));
  } catch {
    throw new Error('AI返回格式不正确，请重新生成。');
  }
  const values = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { candidates?: unknown[] } | null)?.candidates)
      ? (parsed as { candidates: unknown[] }).candidates
      : [];
  const candidates = values
    .map((value, index) => normalizeCandidate(value, index, target))
    .filter((value): value is WorkProfileOptimizationCandidate => Boolean(value))
    .slice(0, count);
  if (candidates.length === 0) throw new Error('AI没有返回可用的作品资料候选，请重新生成。');
  return candidates;
}
