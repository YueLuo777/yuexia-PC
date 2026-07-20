import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModelStream } from '@/features/models/services/callModel';
import {
  BODY_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  readPromptSnapshot,
} from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';
import { applyFormat, getStoredFormatSettings } from './EditorToolModals';
import { WorkbenchModal } from './WorkbenchModal';

export type WorkbenchAITool = 'ai';
export type WorkbenchLinkedContextSource = 'setting' | 'role' | 'outline' | 'summary' | 'chapter';

export interface WorkbenchLinkedContextItem {
  id: string;
  source: WorkbenchLinkedContextSource;
  group: string;
  title: string;
  content: string;
}

export const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
export const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 162;
export const MAX_AI_SESSIONS = 8;
export function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.min(
    FLOATING_AI_TEXTAREA_MAX_HEIGHT,
    Math.max(FLOATING_AI_TEXTAREA_MIN_HEIGHT, textarea.scrollHeight),
  );
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > FLOATING_AI_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
}

export interface AiSession {
  id: number;
  input: string;
  output: string;
  messages: AiMessage[];
  linkChapter: boolean;
  hasSentChapterContext: boolean;
  backgroundTaskId?: string;
  backgroundAssistantMessageId?: number;
}

export interface AiMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export interface WorkbenchAiRequestLog {
  createdAt: string;
  modelName: string;
  promptName: string;
  systemPrompt: string;
  userContent: string;
  visibleUserContent: string;
  contextTitle: string;
  contextText: string;
  linkedItems: WorkbenchLinkedContextItem[];
  linkChapter: boolean;
  contextWordCount: number;
}

export interface WorkbenchAIPanelProps {
  activeTool: WorkbenchAITool;
  workId: number | string;
  selectedChapterContent: string;
  linkedContextItems?: WorkbenchLinkedContextItem[];
  chapterContextLabel?: string;
  onClose?: () => void;
  onReplaceContent: (content: string) => void;
  onUndoReplace?: () => void;
  canUndoReplace?: boolean;
  onOpenModelManage?: () => void;
  onOpenAgentManage?: () => void;
  onOpenContextLibrary?: () => void;
  onClearLinkedContext?: () => void;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
}

export function readConfig() {
  return {
    models: readModelSnapshot(),
    prompts: readPromptSnapshot().prompts,
  };
}

export function getDefaultInstruction(_tool: WorkbenchAITool) {
  return '请根据我的要求处理当前章节正文。';
}

export function getTextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
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
  ].join('\n');
}

export function stripAiThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

export function getBackgroundTaskDisplayOutput(task: BackgroundAiTask, stoppedText = '【已停止】本次生成已停止。') {
  if (task.status === 'aborted' && !stripAiThinkingBlock(task.output).trim()) return stoppedText;
  if (task.status === 'failed' && task.error && !stripAiThinkingBlock(task.output).trim())
    return `【错误】${task.error}`;
  return task.output;
}

export function renderAiChatContent(content: string) {
  const thinkingMatch = content.match(
    /^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/,
  );
  if (thinkingMatch) {
    const seconds = thinkingMatch[1] ?? '0';
    const done = thinkingMatch[2] === 'done';
    const reasoning = thinkingMatch[3]?.trim() ?? '';
    const answer = thinkingMatch[4]?.trimStart() ?? '';
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] p-3 text-xs leading-6 text-slate-600">
          <div className="mb-1 flex items-center justify-between font-black text-[#078fb0]">
            <span>{done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`}</span>
          </div>
          {reasoning && <div className="max-h-36 overflow-y-auto whitespace-pre-wrap break-words">{reasoning}</div>}
        </div>
        {answer && <div className="whitespace-pre-wrap break-words">{answer}</div>}
      </div>
    );
  }
  return content;
}

export function buildBodyLinkedContextPayload(items: WorkbenchLinkedContextItem[]) {
  const formatItems = (source: WorkbenchLinkedContextSource, fallbackTitle: string) =>
    items
      .filter((item) => item.source === source && item.content.trim())
      .map((item, index) => {
        const itemTitle = item.title.trim() || `${fallbackTitle}${index + 1}`;
        const prefix = item.group ? `${itemTitle}（${item.group}）` : itemTitle;
        return `### ${prefix}\n${item.content.trim()}`;
      })
      .join('\n\n');
  const linkedSettingText = joinAiRequestSections([formatItems('setting', '设定'), formatItems('role', '角色')]);
  return joinAiRequestSections([
    wrapAiRequestTag('本章章纲', formatItems('outline', '章纲')),
    wrapAiRequestTag('前文梗概', formatItems('summary', '梗概')),
    wrapAiRequestTag('关联设定', linkedSettingText),
    wrapAiRequestTag('前文正文', formatItems('chapter', '正文')),
  ]);
}

export function getLinkedContextSourceLabel(source: WorkbenchLinkedContextSource) {
  if (source === 'setting') return '设定';
  if (source === 'role') return '角色';
  if (source === 'outline') return '章纲';
  if (source === 'summary') return '梗概';
  return '正文';
}

export function buildAiRequestLog({
  createdAt,
  modelName,
  promptName,
  systemPrompt,
  userContent,
  contextTitle,
  contextText,
  linkedItems,
  linkChapter,
  visibleUserContent,
}: Omit<WorkbenchAiRequestLog, 'contextWordCount'>): WorkbenchAiRequestLog {
  return {
    createdAt,
    modelName,
    promptName,
    systemPrompt,
    userContent,
    visibleUserContent,
    contextTitle,
    contextText,
    linkedItems,
    linkChapter,
    contextWordCount: getTextWordCount(contextText),
  };
}

export function getBodyAiLogFillGroupWeights(log: WorkbenchAiRequestLog): Record<string, number> {
  const hasContext = Boolean(log.contextText.trim());
  const hasUser = Boolean(log.visibleUserContent.trim());
  if (hasContext && hasUser) return { prompt: 1, context: 2, user: 1 };
  if (hasContext) return { prompt: 1, context: 2 };
  if (hasUser) return { prompt: 2, user: 1 };
  return { prompt: 1 };
}

export function createDefaultSession(id = 1): AiSession {
  return {
    id,
    input: '',
    output: '',
    messages: [],
    linkChapter: false,
    hasSentChapterContext: false,
  };
}

export function normalizeSessions(value: unknown): AiSession[] {
  if (!Array.isArray(value)) return [createDefaultSession()];
  const sessions = value
    .map((item, index): AiSession | null => {
      if (!item || typeof item !== 'object') return null;
      const session = item as Partial<AiSession>;
      const id = Number.isFinite(session.id) ? Number(session.id) : index + 1;
      return {
        id,
        input: typeof session.input === 'string' ? session.input : '',
        output: typeof session.output === 'string' ? session.output : '',
        messages: Array.isArray(session.messages)
          ? session.messages
              .filter((message): message is AiMessage =>
                Boolean(message && typeof message === 'object' && 'content' in message),
              )
              .map((message, messageIndex) => ({
                id: Number.isFinite(message.id) ? Number(message.id) : messageIndex + 1,
                role: message.role === 'user' ? 'user' : 'assistant',
                content: typeof message.content === 'string' ? message.content : '',
              }))
          : [],
        linkChapter: Boolean(session.linkChapter),
        hasSentChapterContext: Boolean(session.hasSentChapterContext),
        backgroundTaskId: typeof session.backgroundTaskId === 'string' ? session.backgroundTaskId : undefined,
        backgroundAssistantMessageId: Number.isFinite(session.backgroundAssistantMessageId)
          ? Number(session.backgroundAssistantMessageId)
          : undefined,
      };
    })
    .filter((session): session is AiSession => Boolean(session));
  return sessions.length > 0 ? sessions : [createDefaultSession()];
}

export function readStoredAiState(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {
        sessions: [createDefaultSession()],
        activeSessionId: 1,
        nextSessionId: 2,
        nextMessageId: 1,
      };
    }
    const parsed = JSON.parse(raw) as {
      sessions?: unknown;
      activeSessionId?: number;
      nextSessionId?: number;
      nextMessageId?: number;
    };
    const sessions = normalizeSessions(parsed.sessions);
    const activeSessionId = sessions.some((session) => session.id === parsed.activeSessionId)
      ? Number(parsed.activeSessionId)
      : sessions[0].id;
    return {
      sessions,
      activeSessionId,
      nextSessionId: Number.isFinite(parsed.nextSessionId)
        ? Math.max(Number(parsed.nextSessionId), Math.max(...sessions.map((session) => session.id)) + 1)
        : Math.max(...sessions.map((session) => session.id)) + 1,
      nextMessageId: Number.isFinite(parsed.nextMessageId)
        ? Number(parsed.nextMessageId)
        : Math.max(0, ...sessions.flatMap((session) => session.messages.map((message) => message.id))) + 1,
    };
  } catch {
    return {
      sessions: [createDefaultSession()],
      activeSessionId: 1,
      nextSessionId: 2,
      nextMessageId: 1,
    };
  }
}
