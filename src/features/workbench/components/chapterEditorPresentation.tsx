import { useEffect, useRef, useState } from 'react';

import {
  AUDIT_PROMPT_CATEGORY,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  normalizePromptSubcategory,
} from '@/features/prompts/hooks/usePrompts';
import { buildReviewTextDiff, stripReviewThinkingBlock } from '@/features/workbench/model/chapterReviewText';
import { stripAuditTextStageMarkers } from '@/features/workbench/model/chapterAuditWorkflow';
import type { ReviewAnnotation } from '@/features/workbench/model/chapterReviewText';
import { REVIEW_MODE_TITLES } from '@/features/workbench/model/chapterReviewTaskState';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';
import type { BackgroundAiTask } from '@/shared/ai/backgroundAiTasks';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';

export function getStatusTargetLabel(entry: WorkbenchLibraryEntry) {
  return `${entry.tab}${entry.type ? ` / ${entry.type}` : ''}`;
}

export function isStatusTargetEntry(entry: WorkbenchLibraryEntry) {
  const source = `${entry.tab} ${entry.type ?? ''} ${entry.title} ${entry.content}`;
  if (/脑洞|草稿|概要|梗概|细纲/.test(entry.tab)) return false;
  return /角色|人物|主角|配角|反派|宝物|法宝|道具|装备|势力|组织|宗门|家族|王朝|学院/.test(source);
}

export function getExistingStatusForChapter(content: string, chapterSerial: number) {
  const pattern = new RegExp(`^- 更新到第${chapterSerial}章[^\\n]*：(.+)$`, 'm');
  return content.match(pattern)?.[1]?.trim() ?? '';
}

export function upsertEntryStatus(content: string, chapter: Chapter, status: string) {
  const cleanStatus = status.trim();
  const titlePart = chapter.title ? `《${chapter.title}》` : '';
  const nextLine = `- 更新到第${chapter.serialNumber}章${titlePart}：${cleanStatus}`;
  const linePattern = new RegExp(`^- 更新到第${chapter.serialNumber}章[^\\n]*$`, 'm');
  if (linePattern.test(content)) return content.replace(linePattern, nextLine);
  const marker = '【状态记录】';
  if (content.includes(marker)) return `${content.trimEnd()}\n${nextLine}`;
  return `${content.trimEnd()}\n\n${marker}\n${nextLine}`.trimStart();
}

export function countCompactWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function AiThinkingContent({
  answer,
  done,
  reasoning,
  seconds,
}: {
  answer: string;
  done: boolean;
  reasoning: string;
  seconds: string;
}) {
  const hasAnswer = Boolean(answer.trim());
  const previousHasAnswerRef = useRef(hasAnswer);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(!hasAnswer);

  useEffect(() => {
    if (!previousHasAnswerRef.current && hasAnswer) {
      setIsReasoningExpanded(false);
    } else if (previousHasAnswerRef.current && !hasAnswer) {
      setIsReasoningExpanded(true);
    }
    previousHasAnswerRef.current = hasAnswer;
  }, [hasAnswer]);

  const thinkingLabel = done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] px-3 py-2 text-xs leading-6 text-slate-600">
        <button
          type="button"
          aria-expanded={isReasoningExpanded}
          onClick={() => setIsReasoningExpanded((expanded) => !expanded)}
          className="block w-full truncate text-left font-black text-[#078fb0]"
          title={isReasoningExpanded ? '折叠思考过程' : '展开思考过程'}
        >
          {thinkingLabel}
        </button>
        {isReasoningExpanded && reasoning ? (
          <div className="mt-1 max-h-36 overflow-y-auto whitespace-pre-wrap break-words">{reasoning}</div>
        ) : null}
      </div>
      {answer && <div className="whitespace-pre-wrap break-words">{answer}</div>}
    </div>
  );
}

function renderAiThinkingSection(content: string) {
  const thinkingMatch = content.match(
    /^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/,
  );
  if (!thinkingMatch) return <div className="whitespace-pre-wrap break-words">{content}</div>;
  const seconds = thinkingMatch[1] ?? '0';
  const done = thinkingMatch[2] === 'done';
  const reasoning = thinkingMatch[3]?.trim() ?? '';
  const answer = thinkingMatch[4]?.trimStart() ?? '';
  return <AiThinkingContent answer={answer} done={done} reasoning={reasoning} seconds={seconds} />;
}

export function renderAiThinkingContent(content: string) {
  const visibleContent = stripAuditTextStageMarkers(content);
  const sections = visibleContent.split(/\n{2,}(?=\[\[THINKING seconds=)/).filter((section) => section.trim());
  if (sections.length <= 1) return renderAiThinkingSection(visibleContent);
  return <div className="space-y-4">{sections.map((section, index) => <div key={index}>{renderAiThinkingSection(section)}</div>)}</div>;
}

export function isReviewDetailOutlineEntry(entry: WorkbenchLibraryEntry) {
  return /章节细纲|细纲|绔犺妭缁嗙翰|缁嗙翰/.test(`${entry.tab} ${entry.title} ${entry.type ?? ''}`);
}

export function findReviewDetailOutline(entries: WorkbenchLibraryEntry[], chapter: Chapter | null) {
  if (!chapter) return null;
  const serialPatterns = [
    new RegExp(`第\\s*${chapter.serialNumber}\\s*章`),
    new RegExp(`绗\\s*${chapter.serialNumber}\\s*绔`),
    new RegExp(`\\b${chapter.serialNumber}\\b`),
  ];
  return (
    entries.find(
      (entry) =>
        isReviewDetailOutlineEntry(entry) &&
        serialPatterns.some((pattern) => pattern.test(`${entry.title} ${entry.type ?? ''}`)),
    ) ?? null
  );
}

export function getReviewBackgroundTaskOutput(task: BackgroundAiTask, mode: ReviewMode) {
  if (task.status === 'aborted' && !stripReviewThinkingBlock(task.output).trim()) {
    return `【已停止】本次${REVIEW_MODE_TITLES[mode]}已停止。`;
  }
  if (task.status === 'failed' && task.error && !stripReviewThinkingBlock(task.output).trim()) {
    return `【错误】${task.error}`;
  }
  return task.output;
}

export function getAuditPromptSubcategory(prompt?: { category: string; subCategory?: string } | null) {
  return (
    normalizePromptSubcategory(prompt?.category ?? AUDIT_PROMPT_CATEGORY, prompt?.subCategory) ??
    DEFAULT_AUDIT_PROMPT_SUBCATEGORY
  );
}

export function isTextAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {
  return getAuditPromptSubcategory(prompt) === '文本审核';
}

export function isStructureAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {
  return getAuditPromptSubcategory(prompt) === '剧情审核';
}

export function buildAuditPromptSelectOptions(
  prompts: Array<{ id: string; name: string }>,
) {
  return prompts.map((prompt) => ({
    value: prompt.id,
    label: prompt.name,
  }));
}

export function getReviewSeverityClass(severity: string) {
  if (/严重|高|红|不通过/.test(severity)) return 'border-red-200 bg-red-50 text-red-700';
  if (/中|黄|警告/.test(severity)) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-cyan-200 bg-cyan-50 text-[#078fb0]';
}

export function getReviewAnnotationNoteSpacingClass(text: string) {
  return text.length > 80 ? 'mt-3' : 'mt-2';
}

export function renderAnnotatedReviewParagraph(paragraph: string, annotations: ReviewAnnotation[]) {
  if (!paragraph) return <span className="text-slate-300">空段落</span>;
  const matchedAnnotations = annotations.filter((annotation) => paragraph.includes(annotation.originalText));
  if (matchedAnnotations.length === 0) return paragraph;

  const parts: Array<{ text: string; annotation?: ReviewAnnotation }> = [];
  let cursor = 0;
  matchedAnnotations
    .map((annotation) => ({ annotation, index: paragraph.indexOf(annotation.originalText, cursor) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .forEach(({ annotation, index }) => {
      if (index < cursor) return;
      if (index > cursor) parts.push({ text: paragraph.slice(cursor, index) });
      parts.push({ text: paragraph.slice(index, index + annotation.originalText.length), annotation });
      cursor = index + annotation.originalText.length;
    });
  if (cursor < paragraph.length) parts.push({ text: paragraph.slice(cursor) });

  return (
    <>
      {parts.map((part, index) =>
        part.annotation ? (
          <mark
            key={`${part.annotation.id}-${index}`}
            className="rounded bg-amber-100 px-0.5 text-amber-900 ring-1 ring-amber-300"
            title={`${part.annotation.type}：${part.annotation.problem || part.annotation.suggestion}`}
          >
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

export function renderTextAuditOriginalDiff(originalText: string, revisedText?: string) {
  if (!originalText) return <span className="text-slate-300">空段落</span>;
  if (revisedText === undefined) {
    return <span className="rounded bg-red-50 px-0.5 text-red-500 line-through">{originalText}</span>;
  }
  const diff = buildReviewTextDiff(originalText, revisedText);
  if (!diff.hasChanges) return originalText;
  return (
    <>
      {diff.original.map((segment, index) =>
        segment.changed ? (
          <span key={`${index}-${segment.text}`} className="rounded bg-red-50 px-0.5 text-red-400 line-through">
            {segment.text}
          </span>
        ) : (
          <span key={`${index}-${segment.text}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function renderTextAuditRevisedDiff(originalText: string | undefined, revisedText: string | undefined) {
  if (revisedText === undefined) {
    return (
      <span className="inline-flex rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-black text-red-500">
        审核后缺少本段，请让 AI 保留段落位置。
      </span>
    );
  }
  if (!revisedText) {
    return originalText ? (
      <span className="inline-flex rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-black text-red-500">
        整段已删除
      </span>
    ) : (
      <span className="text-slate-300">空段落</span>
    );
  }
  if (originalText === undefined) {
    return <span className="font-black text-red-500">{revisedText}</span>;
  }
  const diff = buildReviewTextDiff(originalText, revisedText);
  if (!diff.hasChanges) return revisedText;
  return (
    <>
      {diff.revised.map((segment, index) =>
        segment.changed ? (
          <span key={`${index}-${segment.text}`} className="font-black text-red-500">
            {segment.text}
          </span>
        ) : (
          <span key={`${index}-${segment.text}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}
