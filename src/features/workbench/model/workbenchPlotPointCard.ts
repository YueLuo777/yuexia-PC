type CollapsedPlotPointInput = {
  title: string;
  adapted: string;
};

function extractNumber(value: string) {
  const match = value.match(/(\d{1,3}(?:\.\d+)?)/);
  return match ? match[1] : null;
}

export function getPlotPointScoreColorClass(value: string | null) {
  if (!value) return 'text-slate-400';
  const score = Number(extractNumber(value));
  if (!Number.isFinite(score)) return 'text-slate-400';
  if (score < 70) return 'text-green-500';
  if (score < 80) return 'text-blue-500';
  if (score < 90) return 'text-purple-500';
  return 'text-yellow-500';
}

function normalizePlotPointTitle(title: string) {
  return title.trim().replace(/^导入剧情点\s*(\d+)$/i, '剧情点 $1') || '未命名剧情点';
}

function extractAverageScore(text: string) {
  const match = text.match(/(?:平均分|综合评分)\s*[：:]\s*(\d{1,3}(?:\.\d+)?)/);
  return match?.[1] ?? null;
}

function cleanPreviewText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/<fs>[\s\S]*?<\/fs>/gi, '')
    .replace(/<bq>[\s\S]*?<\/bq>/gi, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^第\s*\d+\s*个剧情点(?:（[^）]*）|\([^)]*\))?\s*$/.test(line))
    .filter((line) => !/^#\s*评分/.test(line))
    .filter((line) => !/^#\s*(?:剧情梗概|梗概|主题标签)\s*$/.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripRepeatedTitlePrefix(text: string, title: string) {
  const normalizedTitle = normalizePlotPointTitle(title);
  if (!normalizedTitle || normalizedTitle === '未命名剧情点') return text;
  const escapedTitle = normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const colonPrefix = new RegExp(`^${escapedTitle}\\s*[：:]\\s*`);
  if (colonPrefix.test(text)) return text.replace(colonPrefix, '').trim();
  const contentLabelPrefix = new RegExp(`^${escapedTitle}\\s+(?=剧情内容|内容\\s*[：:])`);
  if (contentLabelPrefix.test(text)) return text.replace(contentLabelPrefix, '').trim();
  const shortLabelPrefix = new RegExp(`^${escapedTitle}\\s*[，,、。；;\\-—]+\\s*`);
  if (normalizedTitle.length <= 6 && shortLabelPrefix.test(text)) {
    return text.replace(shortLabelPrefix, '').trim();
  }
  return text.trim();
}

function stripLeadingContentLabel(text: string) {
  let next = text.trim();
  for (let index = 0; index < 2; index += 1) {
    const cleaned = next
      .replace(/^(?:剧情内容|内容)\s*[：:]\s*/, '')
      .replace(/^[\u4e00-\u9fa5A-Za-z0-9]{4,12}\s*[：:]\s*/, '')
      .trim();
    if (cleaned === next) break;
    next = cleaned;
  }
  return next;
}

export function prepareCollapsedPlotPointCard(input: CollapsedPlotPointInput) {
  const title = normalizePlotPointTitle(input.title);
  const previewText = stripLeadingContentLabel(stripRepeatedTitlePrefix(cleanPreviewText(input.adapted), title));
  return {
    title,
    averageScore: extractAverageScore(input.adapted),
    previewText,
  };
}

export function getPlotPointDisplayText(input: { title: string; previewText: string }) {
  return input.previewText.trim();
}
