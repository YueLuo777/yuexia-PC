import type { BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { parseSettingContent } from './workbenchStructuredSettings';

export const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';

export const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';

export function parseAiChatTurns(content: string) {
  const turns: Array<{ role: 'user' | 'ai'; content: string }> = [];
  const markerPattern = /\[\[(USER|AI)\]\]\n/g;
  const matches = [...content.matchAll(markerPattern)];
  if (matches.length === 0) {
    if (content.trim()) turns.push({ role: 'ai', content: content.trim() });
    return turns;
  }
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? content.length) : content.length;
    const text = content.slice(start, end).trim();
    if (!text) return;
    turns.push({
      role: match[1] === 'USER' ? 'user' : 'ai',
      content: text,
    });
  });
  return turns;
}

export function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body ? `\n${body}` : '',
  ]
    .join('\n')
    .trimEnd();
}

export function stripAiThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

export function stripBrainstormRequestHeader(content: string) {
  const trimmed = content.trim();
  if (!trimmed.startsWith(BRAINSTORM_REQUEST_HEADER)) return content;
  return trimmed.slice(BRAINSTORM_REQUEST_HEADER.length).replace(/^\s+/, '');
}

export function normalizeBrainstormEchoText(content: string) {
  return stripBrainstormRequestHeader(stripAiThinkingBlock(content)).replace(/\s+/g, '').trim();
}

export function getBrainstormOtherRequirementsBlock(requestText: string) {
  const headerIndex = requestText.indexOf(BRAINSTORM_OTHER_REQUIREMENTS_HEADER);
  return headerIndex >= 0 ? requestText.slice(headerIndex) : requestText;
}

export function isBrainstormEchoedRequest(content: string, requestText: string) {
  const output = normalizeBrainstormEchoText(content);
  const request = normalizeBrainstormEchoText(requestText);
  const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));
  return Boolean(output && request && (output === request || output === otherRequirements));
}

export function getBrainstormDisplayContent(content: string, requestText: string) {
  if (isBrainstormEchoedRequest(content, requestText)) {
    return '【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。';
  }
  const displayContent = stripBrainstormRequestHeader(content).trim();
  return displayContent || '【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。';
}

export function buildSequentialBrainstormRequestText(
  baseRequestText: string,
  index: number,
  total: number,
  completedItems: string[],
) {
  return [
    baseRequestText,
    '',
    '【逐个生成模式】',
    `现在只生成第 ${index} / ${total} 个脑洞。`,
    '不要输出其他编号的脑洞，不要复述提示词，直接输出这个脑洞的完整内容。',
    completedItems.length > 0
      ? `【已生成脑洞，避免重复】\n${completedItems.map((item, itemIndex) => `${itemIndex + 1}. ${item}`).join('\n\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatSequentialBrainstormOutput(completedItems: string[], activeIndex?: number, activeContent = '') {
  const lines = completedItems.map((item, index) => `${index + 1}. ${item.trim()}`);
  if (activeIndex && activeContent.trim()) lines.push(`${activeIndex}. ${activeContent.trim()}`);
  return lines.join('\n\n').trim();
}

export function getLatestUsefulAiText(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns]
    .reverse()
    .find((turn) => turn.role === 'ai' && turn.content.trim() && !/^正在生成\.{1,3}$/.test(turn.content.trim()));
  if (latestAi) return stripAiThinkingBlock(latestAi.content);
  if (turns.length > 0) return '';

  const legacyAiMatches = [...content.matchAll(/(?:^|\n)AI[：:]\s*([\s\S]*?)(?=\n\s*用户[：:]|\n\s*\[\[USER\]\]|$)/g)]
    .map((match) => match[1]?.trim() ?? '')
    .filter((value) => value && !/^正在生成\.{1,3}$/.test(value));
  if (legacyAiMatches.length > 0) return legacyAiMatches[legacyAiMatches.length - 1];

  return content
    .replace(/\[\[(?:USER|AI)\]\]\n?/g, '')
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .replace(/^\s*(?:用户|AI)[：:].*$/gm, '')
    .replace(/^正在生成\.{1,3}\s*$/gm, '')
    .trim();
}

export function getLatestAiTurnContent(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns].reverse().find((turn) => turn.role === 'ai');
  return latestAi?.content ?? content;
}

export function getLibraryBackgroundTaskOutput(task: BackgroundAiTask, stoppedText = '【已中止】本次生成已停止。') {
  if (task.status === 'aborted' && !stripAiThinkingBlock(getLatestAiTurnContent(task.output)).trim())
    return stoppedText;
  if (task.status === 'failed' && task.error && !stripAiThinkingBlock(getLatestAiTurnContent(task.output)).trim())
    return `【错误】${task.error}`;
  return task.output;
}

export function getBrainstormBackgroundTaskResult(task: BackgroundAiTask) {
  return stripBrainstormRequestHeader(getLatestAiTurnContent(getLibraryBackgroundTaskOutput(task))).trim();
}

export function getBrainstormEntryBody(entry: WorkbenchLibraryEntry | null | undefined) {
  if (!entry) return '';
  const parsed = parseSettingContent(entry.content);
  return getLatestUsefulAiText(parsed.body || entry.content);
}

export function getSettingEntryBody(entry: WorkbenchLibraryEntry | null | undefined) {
  if (!entry) return '';
  const parsed = parseSettingContent(entry.content);
  const rawContent = entry.content.trim();
  return getLatestUsefulAiText(parsed.body || (rawContent.startsWith('{') ? '' : entry.content));
}
