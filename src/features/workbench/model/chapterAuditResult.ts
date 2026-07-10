import { stripReviewThinkingBlock } from './chapterReviewText';

export const AUDIT_OUTLINE_FIT_ITEM = '章纲贴合度';

export const AUDIT_STRUCTURE_CHECK_ITEMS = [
  AUDIT_OUTLINE_FIT_ITEM,
  '主要事件是否完整',
  '人物行为是否合理',
  '前后逻辑是否清楚',
  '剧情推进是否顺畅',
  '伏笔/设定是否矛盾',
];

const AUDIT_STRUCTURE_ITEM_KEYWORDS: Record<string, string[]> = {
  章纲贴合度: ['章纲贴合度', '是否偏离章纲', '是否符合章纲', '符合章纲', '章纲'],
  主要事件是否完整: ['主要事件是否完整', '本章主要事情是否清楚', '主要事件', '事情是否清楚'],
  人物行为是否合理: ['人物行为是否合理', '人物行为', '行为是否合理'],
  前后逻辑是否清楚: ['前后逻辑是否清楚', '因果是否清楚', '前后逻辑', '因果', '逻辑因果'],
  剧情推进是否顺畅: ['剧情推进是否顺畅', '节奏是否断裂', '剧情推进', '节奏', '断裂'],
  '伏笔/设定是否矛盾': ['伏笔/设定是否矛盾', '伏笔', '设定是否矛盾', '设定矛盾'],
};

function getReviewVisibleOutput(output: string) {
  return stripReviewThinkingBlock(output).trim();
}

export function isAuditOutputPassed(output: string) {
  const clean = getReviewVisibleOutput(output);
  const conclusionMatch = clean.match(/【剧情审核结论】\s*(不通过|通过)/);
  if (conclusionMatch) return conclusionMatch[1] === '通过' && !/【结果】\s*不通过/.test(clean);
  return /通过/.test(clean) && !/部分通过|不通过|未通过|不合格|失败/.test(clean);
}

export function getAuditOutlineFitPercent(output: string) {
  const clean = getReviewVisibleOutput(output);
  const outlineMatch = clean.match(
    /【审核项】\s*(?:章纲贴合度|是否偏离章纲|是否符合章纲)[\s\S]{0,160}?【贴合度】\s*(\d{1,3})\s*%/,
  );
  const fallbackMatch = clean.match(/章纲贴合度[^\d]{0,20}(\d{1,3})\s*%/);
  const value = Number((outlineMatch ?? fallbackMatch)?.[1]);
  if (!Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function getAuditStructureItemKeywords(item: string) {
  return AUDIT_STRUCTURE_ITEM_KEYWORDS[item] ?? [item];
}

function getAuditStructureItemSection(output: string, item: string) {
  const clean = getReviewVisibleOutput(output);
  if (!clean) return '';
  const keywords = getAuditStructureItemKeywords(item);
  const matches = [...clean.matchAll(/【审核项】\s*([^\n\r]+)/g)];
  const matchedIndex = matches.findIndex((match) => {
    const title = match[1]?.trim() ?? '';
    return keywords.some((keyword) => title.includes(keyword));
  });
  if (matchedIndex >= 0) {
    const start = matches[matchedIndex].index ?? 0;
    const nextAuditStart = matches[matchedIndex + 1]?.index;
    const summaryStart = clean.indexOf('【总体判断】', start + 1);
    const endCandidates = [nextAuditStart, summaryStart].filter(
      (index): index is number => typeof index === 'number' && index > start,
    );
    const end = endCandidates.length > 0 ? Math.min(...endCandidates) : clean.length;
    return clean.slice(start, end).trim();
  }

  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const lineIndex = lines.findIndex((line) => keywords.some((keyword) => line.includes(keyword)));
  if (lineIndex < 0) return '';
  const nextIndex = lines.findIndex((line, index) => index > lineIndex && /【审核项】|【总体判断】/.test(line));
  return lines
    .slice(lineIndex, nextIndex < 0 ? lineIndex + 8 : nextIndex)
    .join('\n')
    .trim();
}

function getAuditBracketField(section: string, label: string) {
  const marker = `【${label}】`;
  const start = section.indexOf(marker);
  if (start < 0) return '';
  const bodyStart = start + marker.length;
  const nextMarkers = [
    '【审核项】',
    '【贴合度】',
    '【结果】',
    '【说明】',
    '【建议】',
    '【总体判断】',
    '【剧情审核结论】',
    '【最需要改的问题】',
    '【优先修改建议】',
  ].filter((nextMarker) => nextMarker !== marker);
  const nextStart = nextMarkers
    .map((nextMarker) => section.indexOf(nextMarker, bodyStart))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return (nextStart === undefined ? section.slice(bodyStart) : section.slice(bodyStart, nextStart)).trim();
}

export function getAuditStructureItemDetail(output: string, item: string) {
  const section = getAuditStructureItemSection(output, item);
  return {
    description: getAuditBracketField(section, '说明'),
    suggestion: getAuditBracketField(section, '建议'),
  };
}

export function getAuditStructureItemStatus(output: string, item: string) {
  const clean = getReviewVisibleOutput(output);
  if (!clean) return 'pending' as const;
  const keywords = getAuditStructureItemKeywords(item);
  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const matchedIndex = lines.findIndex((line) => keywords.some((keyword) => line.includes(keyword)));
  const matchedLine = matchedIndex >= 0 ? lines[matchedIndex] : '';
  const targetText = matchedIndex >= 0 ? lines.slice(matchedIndex, matchedIndex + 5).join('\n') : clean;
  const explicitResult = targetText.match(/【结果】\s*(不通过|通过)/) ?? matchedLine.match(/[：:]\s*(不通过|通过)/);
  if (explicitResult) return explicitResult[1] === '不通过' ? ('failed' as const) : ('passed' as const);
  if (item === AUDIT_OUTLINE_FIT_ITEM) {
    const outlineFitPercent = getAuditOutlineFitPercent(output);
    if (outlineFitPercent !== null) return outlineFitPercent >= 85 ? ('passed' as const) : ('failed' as const);
  }
  if (/不通过|未通过|不合格|失败/.test(targetText)) return 'failed' as const;
  if (/通过|合格/.test(targetText)) return 'passed' as const;
  if (isAuditOutputPassed(output)) return 'passed' as const;
  return 'pending' as const;
}
