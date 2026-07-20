import { FolderOpen } from 'lucide-react';
import { useState } from 'react';

import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { ChapterNumberButton, CHAPTER_NUMBER_GRID_STYLE } from '@/shared/ui/ChapterNumberButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';
import {
  buildReviewTextDiff,
  extractReviewRevisedText,
  splitReviewParagraphs,
} from '@/features/workbench/model/chapterReviewText';
import {
  REVIEW_PAGE_LEFT_WIDTH,
  REVIEW_PAGE_RIGHT_WIDTH,
  REVIEW_PREVIEW_MAX_FONT_SIZE,
  REVIEW_PREVIEW_MIN_FONT_SIZE,
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from '@/features/workbench/components/chapterEditorLayout';
import { renderAiThinkingContent } from '@/features/workbench/components/chapterEditorPresentation';

import {
  TextAuditInteractiveReviewPrototype,
  type TextAuditDiffParagraph,
} from './TextAuditInteractiveReviewPrototype';

export const TEXT_AUDIT_REPLICA_ORIGINAL_TEXT = [
  '林啸站在门口，心里非常复杂。他知道今天一定会出事。',
  '屋里很安静，安静得让人感觉特别安静。',
  '桌上的信封没有署名，封口却压着林家的旧印。',
  '“你终于来了”老人抬起头。',
].join('\n');

export const TEXT_AUDIT_REPLICA_AI_OUTPUT = `【修改后全文】
林啸站在门口，指节无声收紧。他知道今天多半会出事。
屋里很安静，连灯芯爆开的轻响都显得刺耳。
桌上的信封没有署名，封口却压着林家的旧印。
“你终于来了。”老人抬起头。

【修改说明】
第1段：把笼统心理改为可见动作，并弱化绝对判断。
第2段：删除重复表达，补充具体声音。
第4段：补全对话句末标点。`;

const PARAGRAPH_META = [
  { category: '表达优化', note: '把笼统心理改成可见动作，并把绝对判断改成更自然的预感。' },
  { category: '重复表达', note: '删除重复表达，补成更具体的氛围描写。' },
  { category: '未修改', note: '本段表达清楚，审核后保持原文。' },
  { category: '标点修正', note: '补全对话句末标点。' },
];

export const TEXT_AUDIT_REPLICA_CHAPTERS = [
  { id: 1, serialNumber: 1, title: '旧印来信', wordCount: 86 },
  { id: 2, serialNumber: 2, title: '雨夜访客', wordCount: 2450 },
  { id: 3, serialNumber: 3, title: '藏在信里的名字', wordCount: 2318 },
];

function buildPrototypeParagraphs(): TextAuditDiffParagraph[] {
  const originalParagraphs = splitReviewParagraphs(TEXT_AUDIT_REPLICA_ORIGINAL_TEXT);
  const revisedParagraphs = splitReviewParagraphs(extractReviewRevisedText(TEXT_AUDIT_REPLICA_AI_OUTPUT));
  return originalParagraphs.map((original, index) => {
    const revised = revisedParagraphs[index] ?? '';
    const diff = buildReviewTextDiff(original, revised);
    return {
      id: `paragraph-${index + 1}`,
      label: `第 ${index + 1} 段`,
      original,
      originalDiff: diff.original.map((segment) => ({
        text: segment.text,
        changed: segment.changed,
        removed: segment.changed,
      })),
      revised: diff.revised,
      note: PARAGRAPH_META[index]?.note ?? 'AI 对本段进行了文字修正。',
      category: PARAGRAPH_META[index]?.category ?? '文字修正',
    };
  });
}

export const TEXT_AUDIT_REPLICA_PARAGRAPHS = buildPrototypeParagraphs();

export function ReviewDirectoryReplica({
  activeChapterId,
  onSelect,
}: {
  activeChapterId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        <div>
          <button type="button" className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS} aria-expanded="true">
            <FolderOpen className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
            <span className="min-w-0 flex-1 truncate leading-none">第一卷 暗潮初起</span>
            <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{TEXT_AUDIT_REPLICA_CHAPTERS.length}章</span>
          </button>
          <div className="mt-1 grid justify-start gap-2 px-1.5 py-1.5" style={CHAPTER_NUMBER_GRID_STYLE}>
            {TEXT_AUDIT_REPLICA_CHAPTERS.map((chapter) => (
              <ChapterNumberButton
                key={chapter.id}
                onClick={() => onSelect(chapter.id)}
                title={`第${chapter.serialNumber}章 ${chapter.title} · ${chapter.wordCount}字`}
                selected={activeChapterId === chapter.id}
                state="empty"
              >
                {chapter.serialNumber}
              </ChapterNumberButton>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ReviewAiPanelReplica({
  initialOutput = TEXT_AUDIT_REPLICA_AI_OUTPUT,
  initialInput = '只修正错别字、语病、标点和重复表达，不改变剧情。',
}: {
  initialOutput?: string;
  initialInput?: string;
} = {}) {
  const [modelId, setModelId] = useState('deepseek-v3');
  const [promptId, setPromptId] = useState('text-audit-basic');
  const [reviewOutput, setReviewOutput] = useState(initialOutput);
  const [reviewInput, setReviewInput] = useState(initialInput);
  return (
    <aside className="relative flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
      <div className="flex min-h-0 flex-1 flex-col">
        <CombinedAiConfigSelect
          style={{ width: 250, minWidth: 120, maxWidth: '100%' }}
          modelValue={modelId}
          promptValue={promptId}
          modelOptions={[{ value: 'deepseek-v3', label: 'DeepSeek V3' }]}
          promptOptions={[{ value: 'text-audit-basic', label: '基础校对', metaLabel: '文本' }]}
          onModelChange={setModelId}
          onPromptChange={setPromptId}
          onModelManage={() => undefined}
          onPromptManage={() => undefined}
        />
        <div className="relative mt-3 min-h-0 flex-1">
          <div className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 z-40 flex items-center gap-2 px-1">
            <button
              type="button"
              onClick={() => setReviewOutput('')}
              className="text-xs font-black text-red-500 hover:text-red-600"
            >
              清空
            </button>
          </div>
          <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value">
            <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-slate-700">
              {reviewOutput.trim() ? (
                renderAiThinkingContent(reviewOutput)
              ) : (
                <span className="flex h-full items-center justify-center px-5 text-center font-bold text-slate-400">
                  发送后，AI 思考过程和文字输出会显示在这里；中间“第1章 文本审核”框同步显示审核结果。
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 shrink-0">
          <AiInlineInput
            value={reviewInput}
            onChange={(event) => setReviewInput(event.target.value)}
            onSend={() => setReviewOutput(initialOutput)}
            onStop={() => undefined}
            sendDisabled={false}
            stopDisabled
            textareaClassName="editor-scrollbar"
          />
        </div>
      </div>
    </aside>
  );
}

function ReviewPreviewReplica({ chapterTitle }: { chapterTitle: string }) {
  const [showOutline, setShowOutline] = useState(false);
  const [widthMode, setWidthMode] = useState<'locked' | 'free'>('locked');
  const [fontSize, setFontSize] = useState(14);
  return (
    <main className="min-h-0 bg-white">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-900">第1章 {chapterTitle}</h3>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              正文预览 {' · '}{' '}
              <WordCountText value={TEXT_AUDIT_REPLICA_ORIGINAL_TEXT.replace(/\s/g, '').length} compact />
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOutline((current) => !current)}
              className={`h-8 rounded-lg border px-3 text-xs font-black transition-colors ${
                showOutline
                  ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#078fb0]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#9BEFFC] hover:text-[#078fb0]'
              }`}
            >
              {showOutline ? '隐藏章纲' : '显示章纲'}
            </button>
            <div className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-[#9BEFFC] bg-white text-xs font-black">
              {[
                ['locked', '等宽锁定'],
                ['free', '自由调节'],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWidthMode(mode as 'locked' | 'free')}
                  className={`px-3 transition-colors ${
                    widthMode === mode
                      ? 'bg-[#EAF9FD] text-[#078fb0]'
                      : 'text-slate-500 hover:bg-[#F5FCFE] hover:text-[#078fb0]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <FontSizeStepper
              value={fontSize}
              min={REVIEW_PREVIEW_MIN_FONT_SIZE}
              max={REVIEW_PREVIEW_MAX_FONT_SIZE}
              ariaLabel="审核原文字号"
              onChange={setFontSize}
              className="shrink-0"
            />
          </div>
        </div>
        <div
          className="grid min-h-0 flex-1"
          style={{ gridTemplateColumns: showOutline ? '280px minmax(0,1fr)' : 'minmax(0,1fr)' }}
        >
          {showOutline ? (
            <section className="flex min-h-0 flex-col border-r border-slate-100 bg-white">
              <span className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
                第1章 章纲
              </span>
              <pre className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 text-slate-700">
                林啸收到带有林家旧印的匿名信，赴约后见到等待已久的老人，为下一章的身份揭晓埋下悬念。
              </pre>
            </section>
          ) : null}
          <section className="flex min-h-0 flex-col bg-white">
            <div className="flex h-[33px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-[#EAF9FD] px-4">
              <span className="text-xs font-black text-[#078fb0]">第1章 文本审核</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">3 处修改</span>
            </div>
            <div className="min-h-0 flex-1" style={{ fontSize }}>
              <TextAuditInteractiveReviewPrototype paragraphs={TEXT_AUDIT_REPLICA_PARAGRAPHS} variant="review-page" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function TextAuditReviewWorkbenchTestPage() {
  const [activeChapterId, setActiveChapterId] = useState(1);
  const activeChapter =
    TEXT_AUDIT_REPLICA_CHAPTERS.find((chapter) => chapter.id === activeChapterId) ?? TEXT_AUDIT_REPLICA_CHAPTERS[0];
  return (
    <div className="flex h-full min-h-[720px] bg-white">
      <section className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
        <div
          className="grid min-h-0 flex-1 bg-slate-50 pb-3"
          style={{
            gridTemplateColumns: `${REVIEW_PAGE_LEFT_WIDTH}px 0px minmax(0,1fr) 0px ${REVIEW_PAGE_RIGHT_WIDTH}px`,
          }}
        >
          <ReviewDirectoryReplica activeChapterId={activeChapterId} onSelect={setActiveChapterId} />
          <div />
          <ReviewPreviewReplica chapterTitle={activeChapter.title} />
          <div />
          <ReviewAiPanelReplica />
        </div>
      </section>
    </div>
  );
}
