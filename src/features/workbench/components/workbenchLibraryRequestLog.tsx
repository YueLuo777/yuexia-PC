import { wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
import { WorkbenchAiThinkingShell } from './WorkbenchAiThinkingShell';

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

export type SettingLinkedContextItem = {
  usage: '本次处理对象' | '参考资料';
  path: string;
  text: string;
};

export type SettingLinkedContext = {
  source: 'current' | 'other' | 'brainstorm' | null;
  title: string;
  text: string;
  items?: SettingLinkedContextItem[];
};

function getSettingLinkedContextItems(context: SettingLinkedContext) {
  if (context.items?.length) return context.items;
  if (context.source !== 'current' && context.source !== 'other') return [];
  if (!context.text.trim()) return [];
  return [
    {
      usage: context.source === 'current' ? ('本次处理对象' as const) : ('参考资料' as const),
      path: context.title.trim() || (context.source === 'current' ? '当前设定' : '其他设定'),
      text: context.text,
    },
  ];
}

export function hasSettingLinkedContext(context: SettingLinkedContext) {
  if (!context.source) return false;
  if (context.source === 'brainstorm') return Boolean(context.text.trim());
  return getSettingLinkedContextItems(context).length > 0;
}

export function countSettingLinkedContextWords(context: SettingLinkedContext) {
  if (context.source === 'brainstorm') return countTextWords(context.text);
  return getSettingLinkedContextItems(context).reduce((total, item) => total + countTextWords(item.text), 0);
}

export function formatSettingLinkedContextForAi(context: SettingLinkedContext) {
  if (!hasSettingLinkedContext(context)) return '';
  if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, context.text);
  const settings = getSettingLinkedContextItems(context).map((item) => {
    const path = escapeXmlAttribute(item.path.trim() || '未分类设定');
    const content = item.text.trim() || '当前内容为空';
    return [
      `<设定 用途="${item.usage}" 路径="${path}">`,
      '<当前内容>',
      content,
      '</当前内容>',
      '</设定>',
    ].join('\n');
  });
  return [
    '<关联设定>',
    '处理规则：仅修改用途为“本次处理对象”的设定；用途为“参考资料”的设定只用于保持一致，不得改写。',
    ...settings,
    '</关联设定>',
  ].join('\n');
}

export function formatSettingLinkedContextForDisplay(context: SettingLinkedContext) {
  if (!hasSettingLinkedContext(context)) return '';
  if (context.source === 'brainstorm') {
    return ['资料类型：脑洞', `资料标题：${context.title.trim() || '脑洞'}`, '当前内容：', context.text.trim()].join(
      '\n',
    );
  }
  return getSettingLinkedContextItems(context)
    .map((item) =>
      [
        `分类路径：${item.path.split('/').join(' ＞ ')}`,
        `用途：${item.usage}`,
        '当前内容：',
        item.text.trim() || '当前内容为空',
      ].join('\n'),
    )
    .join('\n\n');
}

export function buildCurrentSettingLinkSnapshot(
  entry: { title: string } | null,
  body: string,
  path?: string,
) {
  const title = entry?.title.trim() || '当前设定';
  const text = entry ? body.trim() : '';
  return {
    title,
    text,
    items: entry
      ? [{ usage: '本次处理对象' as const, path: path?.trim() || title, text }]
      : [],
  };
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
          <WorkbenchAiThinkingShell label={thinkingLabel} />
        ) : (
          <WorkbenchAiThinkingShell
            label={thinkingLabel}
            open={!done}
            bodyClassName="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600"
          >
            {reasoning || undefined}
          </WorkbenchAiThinkingShell>
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
