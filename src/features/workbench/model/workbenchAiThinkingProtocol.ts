export function createAiThinkingPlaceholder(seconds = 0) {
  return `[[THINKING seconds=${Math.max(0, seconds)} status=thinking]]\n\n[[/THINKING]]`;
}

export function isAiThinkingContent(content: string) {
  return content.trimStart().startsWith('[[THINKING ');
}

export function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : createAiThinkingPlaceholder(seconds));
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body,
  ]
    .join('\n')
    .trimEnd();
}
