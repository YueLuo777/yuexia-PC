const REVIEW_LOG_SECTION_PREFIX = '[[YUEXIA_REVIEW_LOG_SECTION:';
const REVIEW_LOG_SECTION_SUFFIX = ']]';
const REVIEW_LOG_SECTION_TITLES = ['系统提示词', '关联章纲', '原文', '其他要求', '发送上下文'] as const;

export type ReviewLogSectionTitle = (typeof REVIEW_LOG_SECTION_TITLES)[number];

export function createReviewLogSection(title: ReviewLogSectionTitle, content: string) {
  return `${REVIEW_LOG_SECTION_PREFIX}${title}${REVIEW_LOG_SECTION_SUFFIX}\n${content}`;
}

export function getReviewLogSection(log: string, title: string) {
  const marker = `${REVIEW_LOG_SECTION_PREFIX}${title}${REVIEW_LOG_SECTION_SUFFIX}`;
  const start = log.indexOf(marker);
  if (start >= 0) {
    const bodyStart = start + marker.length;
    const nextSectionStart = REVIEW_LOG_SECTION_TITLES.map((sectionTitle) =>
      log.indexOf(`${REVIEW_LOG_SECTION_PREFIX}${sectionTitle}${REVIEW_LOG_SECTION_SUFFIX}`, bodyStart),
    )
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0];
    return (nextSectionStart === undefined ? log.slice(bodyStart) : log.slice(bodyStart, nextSectionStart)).trim();
  }

  const findHeader = (sectionTitle: string, fromIndex = 0) => log.indexOf(`\n【${sectionTitle}】`, fromIndex);
  const originalStart = findHeader('原文');
  const sendContextStart = findHeader('发送上下文');
  const outlineStart = originalStart >= 0 ? log.lastIndexOf('\n【关联章纲】', originalStart) : findHeader('关联章纲');
  const promptStart = findHeader('系统提示词');
  const userStart = originalStart >= 0 ? findHeader('其他要求', originalStart) : -1;
  const safeUserStart = userStart >= 0 && (sendContextStart < 0 || userStart < sendContextStart) ? userStart : -1;
  const legacySections: Record<string, { start: number; end: number }> = {
    系统提示词: { start: promptStart, end: outlineStart },
    关联章纲: { start: outlineStart, end: originalStart },
    原文: { start: originalStart, end: safeUserStart >= 0 ? safeUserStart : sendContextStart },
    其他要求: { start: safeUserStart, end: sendContextStart },
    发送上下文: { start: sendContextStart, end: -1 },
  };
  const legacySection = legacySections[title];
  if (!legacySection || legacySection.start < 0) return '';
  const bodyStart = log.indexOf('\n', legacySection.start + 1);
  if (bodyStart < 0) return '';
  return (legacySection.end < 0 ? log.slice(bodyStart) : log.slice(bodyStart, legacySection.end)).trim();
}

export function getReviewLogFillGroupWeights(options: {
  hasOutline: boolean;
  hasUser: boolean;
}): Record<string, number> {
  return {
    prompt: 1,
    ...(options.hasOutline ? { outline: 1 } : {}),
    original: 2,
    ...(options.hasUser ? { user: 1 } : {}),
  };
}

export function createAiThinkingPlaceholder(seconds = 0) {
  return `[[THINKING seconds=${Math.max(0, seconds)} status=thinking]]\n\n[[/THINKING]]`;
}

export function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body,
  ]
    .join('\n')
    .trimEnd();
}
