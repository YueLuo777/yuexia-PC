import { ChevronDown, ChevronRight } from 'lucide-react';

import { wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';

export type LibraryAiRequestLog = {
  createdAt: string;
  tab: string;
  modelName: string;
  promptName: string;
  hasLinkedBrainstorm: boolean;
  linkedBrainstormTitle: string;
  visibleUserText: string;
  systemPrompt: string;
  userContent: string;
  contextTitle?: string;
  contextText?: string;
  contextWordCount?: number;
  readerContextTitle?: string;
  readerContextText?: string;
  readerContextWordCount?: number;
};

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

export function compactTextForAi(content: string, maxLength: number) {
  const text = content.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}……`;
}

function getRequestLogMeta(content?: string, unit = '字') {
  return `${countTextWords(content ?? '')} ${unit}`;
}

export function escapeXmlAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatBrainstormReferenceForAi(title: string, text: string) {
  const content = text.trim();
  if (!content) return '';
  const safeTitle = title.trim() || '脑洞';
  return [
    '【参考资料开始：用户关联脑洞】',
    '注意：以下内容只是参考资料，不是输出格式，不要照抄标签，不要为它单独生成设定，不要输出本段任何标签。',
    '资料类型：脑洞',
    `资料标题：${safeTitle}`,
    '',
    content,
    '',
    '【参考资料结束：用户关联脑洞】',
  ].join('\n');
}

export function formatSettingLinkedContextForAi(context: {
  source: 'current' | 'other' | 'brainstorm' | null;
  title: string;
  text: string;
}) {
  const text = context.text.trim();
  if (!context.source || !text) return '';
  if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, text);
  if (context.source === 'other')
    return wrapAiRequestTag('关联其他设定', text, { 标题: context.title.trim() || '其他设定' });
  const tagName = '待处理设定';
  const title = context.title.trim() || '当前设定';
  return wrapAiRequestTag(tagName, text, { 标题: title });
}

export function formatCurrentSettingLinkedText(title: string, body: string) {
  const safeTitle = title.trim() || '当前设定';
  return [`设定名：${safeTitle}`, body.trim()].filter(Boolean).join('\n');
}

export function buildCurrentSettingLinkSnapshot(entry: { title: string } | null, body: string) {
  const title = entry?.title.trim() || '当前设定';
  return { title, text: entry ? formatCurrentSettingLinkedText(title, body) : '' };
}

export function formatSettingUserRequirementForAi(userText: string) {
  const text = userText.trim();
  return wrapAiRequestTag('修改要求', text);
}

export function buildLibraryLogGroups(
  log: LibraryAiRequestLog,
  options?: {
    includeContext?: boolean;
    includeReaderContext?: boolean;
    contextFallback?: string;
    userTitle?: string;
    readerTitle?: string;
    readerEmptyText?: string;
    omitEmptyUser?: boolean;
    expandReaderContextContent?: boolean;
    expandAllContent?: boolean;
  },
): AiRequestLogGroup[] {
  const expandedContentClassName = 'overflow-visible';
  const groups: AiRequestLogGroup[] = [
    {
      id: 'prompt',
      title: '提示词',
      meta: getRequestLogMeta(log.systemPrompt),
      content: log.systemPrompt,
      emptyText: '空内容',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    },
  ];
  if (options?.includeReaderContext) {
    groups.push({
      id: 'reader-context',
      title: options.readerTitle || '关联设定',
      meta: log.readerContextTitle || getRequestLogMeta(log.readerContextText),
      content: log.readerContextText,
      emptyText: options.readerEmptyText || '未关联设定或前文章纲',
      tone: 'cyan',
      contentClassName: options.expandAllContent
        ? expandedContentClassName
        : options.expandReaderContextContent
          ? 'min-h-[360px] overflow-visible'
          : undefined,
    });
  }
  if (options?.includeContext !== false) {
    groups.push({
      id: 'context',
      title: '关联内容',
      meta:
        log.contextTitle || (log.hasLinkedBrainstorm ? log.linkedBrainstormTitle : getRequestLogMeta(log.contextText)),
      content: log.contextText || (log.hasLinkedBrainstorm ? log.userContent : ''),
      emptyText: options?.contextFallback || '未关联内容',
      tone: 'cyan',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    });
  }
  if (!(options?.omitEmptyUser && !log.userContent.trim())) {
    groups.push({
      id: 'user',
      title: options?.userTitle || '用户要求',
      meta: getRequestLogMeta(log.userContent),
      content: log.userContent,
      emptyText: '空内容',
      tone: 'amber',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    });
  }
  return groups;
}

export function buildRequestLogPlainPreview(groups: AiRequestLogGroup[]) {
  return groups
    .map((group) => group.content?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n');
}

export function getBrainstormQuestionRows(value: string) {
  const rows = value
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / 26)), 0);
  return Math.max(1, rows);
}

export function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {}) {
  const thinkingMatch = content.match(
    /^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/,
  );
  if (thinkingMatch) {
    const seconds = thinkingMatch[1] ?? '0';
    const done = thinkingMatch[2] === 'done';
    const reasoning = thinkingMatch[3]?.trim() ?? '';
    const answer = thinkingMatch[4]?.trimStart() ?? '';
    const thinkingLabel = done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`;
    return (
      <div className="space-y-3">
        {options.hideReasoningBody ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-sm font-medium text-gray-600">
            {done ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronRight className="h-4 w-4 text-brand" />}
            <span>{thinkingLabel}</span>
          </div>
        ) : (
          <details open={!done} className="group rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-gray-600">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-gray-600">
              {done ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronRight className="h-4 w-4 text-brand" />}
              <span>{thinkingLabel}</span>
            </summary>
            {reasoning && (
              <div className="mt-2 border-l-2 border-gray-200 pl-3 text-sm leading-7 text-gray-500">{reasoning}</div>
            )}
          </details>
        )}
        {answer && <div>{answer}</div>}
      </div>
    );
  }
  const loadingMatch = content.match(/^正在生成(\.{1,3})$/);
  if (!loadingMatch) return content;
  return (
    <span className="inline-flex min-w-[88px] items-center">
      <span>正在生成</span>
      <span className="inline-block w-[24px]">{loadingMatch[1]}</span>
    </span>
  );
}
