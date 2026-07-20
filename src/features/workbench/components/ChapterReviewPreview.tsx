import { ChevronDown } from 'lucide-react';
import type { RefObject, ReactNode } from 'react';

import {
  AUDIT_OUTLINE_FIT_ITEM,
  AUDIT_STRUCTURE_CHECK_ITEMS,
  getAuditOutlineFitPercent,
  getAuditStructureItemDetail,
  getAuditStructureItemStatus,
} from '@/features/workbench/model/chapterAuditResult';
import type { ReviewAnnotation } from '@/features/workbench/model/chapterReviewText';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';

import {
  REVIEW_PREVIEW_MAX_FONT_SIZE,
  REVIEW_PREVIEW_MIN_FONT_SIZE,
  REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS,
} from './chapterEditorLayout';
import type { ReviewPreviewWidthMode } from './chapterEditorLayout';
import {
  countCompactWords,
  getReviewAnnotationNoteSpacingClass,
  getReviewSeverityClass,
  renderAnnotatedReviewParagraph,
  renderTextAuditOriginalDiff,
} from './chapterEditorPresentation';
import { ChapterTextAuditContinuousReview } from './ChapterTextAuditContinuousReview';

type ReviewScrollPane = 'outline' | 'original' | 'annotation' | null;

interface ChapterReviewPreviewProps {
  activeReviewChapter: Chapter | null;
  activeReviewWordCount: number;
  canShowReviewOutline: boolean;
  showReviewOutline: boolean;
  setReviewOutlineVisibilityWithBalancedColumns: (visible: boolean) => void;
  reviewPreviewWidthMode: ReviewPreviewWidthMode;
  setReviewPreviewWidthModeWithStorage: (mode: ReviewPreviewWidthMode) => void;
  reviewPreviewFontSize: number;
  setReviewPreviewFontSizeWithStorage: (fontSize: number) => void;
  reviewPreviewGridRef: RefObject<HTMLDivElement | null>;
  reviewPreviewGridTemplateColumns: string;
  effectiveShowReviewOutline: boolean;
  activeReviewPreviewScrollPane: ReviewScrollPane;
  handleReviewPreviewScroll: (pane: Exclude<ReviewScrollPane, null>) => void;
  activeReviewDetailOutlineText: string;
  reviewPreviewOutlineResizeHandle: ReactNode;
  reviewPreviewOriginalTitle: string;
  reviewOriginalPreviewPaneRef: RefObject<HTMLDivElement | null>;
  reviewOriginalParagraphs: string[];
  activeReviewContent: string;
  activeReviewParagraphIndex: number;
  isAuditTextReview: boolean;
  auditRevisedText: string;
  reviewOriginalParagraphRefs: RefObject<Array<HTMLButtonElement | null>>;
  selectReviewPreviewParagraph: (index: number) => void;
  auditRevisedParagraphs: string[];
  reviewPreviewTextColumnSeparator: ReactNode;
  reviewPreviewAnnotationTitle: string;
  reviewMode: ReviewMode;
  polishPreviewText: string;
  reviewAnnotations: ReviewAnnotation[];
  reviewAnnotationPreviewPaneRef: RefObject<HTMLDivElement | null>;
  activeReviewModeTitle: string;
  reviewAiOutput: string;
  isAuditStructureReview: boolean;
  polishPreviewParagraphs: string[];
  auditParagraphCountMatches: boolean;
  auditOutputPassed: boolean;
  expandedAuditStructureItems: Set<string>;
  toggleAuditStructureItem: (item: string) => void;
  reviewAnnotationsByParagraph: Map<number, ReviewAnnotation[]>;
  reviewAnnotationRefs: RefObject<Array<HTMLDivElement | null>>;
  onApplyTextAuditContent: (content: string) => void;
}

export function ChapterReviewPreview({
  activeReviewChapter,
  activeReviewWordCount,
  canShowReviewOutline,
  showReviewOutline,
  setReviewOutlineVisibilityWithBalancedColumns,
  reviewPreviewWidthMode,
  setReviewPreviewWidthModeWithStorage,
  reviewPreviewFontSize,
  setReviewPreviewFontSizeWithStorage,
  reviewPreviewGridRef,
  reviewPreviewGridTemplateColumns,
  effectiveShowReviewOutline,
  activeReviewPreviewScrollPane,
  handleReviewPreviewScroll,
  activeReviewDetailOutlineText,
  reviewPreviewOutlineResizeHandle,
  reviewPreviewOriginalTitle,
  reviewOriginalPreviewPaneRef,
  reviewOriginalParagraphs,
  activeReviewContent,
  activeReviewParagraphIndex,
  isAuditTextReview,
  auditRevisedText,
  reviewOriginalParagraphRefs,
  selectReviewPreviewParagraph,
  auditRevisedParagraphs,
  reviewPreviewTextColumnSeparator,
  reviewPreviewAnnotationTitle,
  reviewMode,
  polishPreviewText,
  reviewAnnotations,
  reviewAnnotationPreviewPaneRef,
  activeReviewModeTitle,
  reviewAiOutput,
  isAuditStructureReview,
  polishPreviewParagraphs,
  auditParagraphCountMatches,
  auditOutputPassed,
  expandedAuditStructureItems,
  toggleAuditStructureItem,
  reviewAnnotationsByParagraph,
  reviewAnnotationRefs,
  onApplyTextAuditContent,
}: ChapterReviewPreviewProps) {
  const showContinuousTextAudit = isAuditTextReview && Boolean(auditRevisedText.trim());
  return (
    <main className="min-h-0 bg-white">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-900">
              {activeReviewChapter
                ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
                : '暂无章节'}
            </h3>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              正文预览
              {' · '}
              <WordCountText value={activeReviewWordCount} compact />
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canShowReviewOutline ? (
              <button
                type="button"
                onClick={() => setReviewOutlineVisibilityWithBalancedColumns(!showReviewOutline)}
                className={`h-8 rounded-lg border px-3 text-xs font-black transition-colors ${
                  showReviewOutline
                    ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#078fb0]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#9BEFFC] hover:text-[#078fb0]'
                }`}
              >
                {showReviewOutline ? '隐藏章纲' : '显示章纲'}
              </button>
            ) : null}
            <div className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-[#9BEFFC] bg-white text-xs font-black">
              {[['locked', '等宽锁定'] as const, ['free', '自由调节'] as const].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setReviewPreviewWidthModeWithStorage(mode)}
                  className={`px-3 transition-colors ${
                    reviewPreviewWidthMode === mode
                      ? 'bg-[#EAF9FD] text-[#078fb0]'
                      : 'text-slate-500 hover:bg-[#F5FCFE] hover:text-[#078fb0]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <FontSizeStepper
              value={reviewPreviewFontSize}
              min={REVIEW_PREVIEW_MIN_FONT_SIZE}
              max={REVIEW_PREVIEW_MAX_FONT_SIZE}
              ariaLabel="审核原文字号"
              onChange={setReviewPreviewFontSizeWithStorage}
              className="shrink-0"
            />
          </div>
        </div>
        <div
          ref={reviewPreviewGridRef}
          className="grid min-h-0 flex-1"
          style={{ gridTemplateColumns: reviewPreviewGridTemplateColumns }}
        >
          {effectiveShowReviewOutline ? (
            <section className="flex min-h-0 flex-col bg-white">
              <span className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
                {activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 章纲` : '章纲'}
              </span>
              <div
                className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'outline' ? 'scrollbar-active' : ''}`}
                onScroll={() => handleReviewPreviewScroll('outline')}
                style={{ fontSize: reviewPreviewFontSize }}
              >
                {activeReviewDetailOutlineText ? (
                  <pre className="whitespace-pre-wrap break-words font-sans">{activeReviewDetailOutlineText}</pre>
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                    {activeReviewChapter
                      ? `未找到第${activeReviewChapter.serialNumber}章章纲。`
                      : '未选择章节，无法读取章纲。'}
                  </div>
                )}
              </div>
            </section>
          ) : null}
          {effectiveShowReviewOutline ? reviewPreviewOutlineResizeHandle : null}
          <section className={showContinuousTextAudit ? 'hidden' : 'flex min-h-0 flex-col bg-white'}>
            <span className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
              {reviewPreviewOriginalTitle}
            </span>
            <div
              ref={reviewOriginalPreviewPaneRef}
              className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'original' ? 'scrollbar-active' : ''}`}
              onScroll={() => handleReviewPreviewScroll('original')}
              style={{ fontSize: reviewPreviewFontSize }}
            >
              {reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">
                  这里会显示所选章节正文。
                </div>
              ) : (
                <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                  {reviewOriginalParagraphs.map((paragraph, index) => {
                    const selected = activeReviewParagraphIndex === index;
                    const shouldShowTextAuditDiff = isAuditTextReview && Boolean(auditRevisedText.trim());
                    return (
                      <button
                        ref={(node) => {
                          reviewOriginalParagraphRefs.current[index] = node;
                        }}
                        key={`${index}-${paragraph.slice(0, 18)}`}
                        type="button"
                        onClick={() => selectReviewPreviewParagraph(index)}
                        className={`relative block w-full text-left outline-none ${
                          REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS
                        } ${selected ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS}`}
                        style={{ fontSize: reviewPreviewFontSize }}
                      >
                        <span className="block whitespace-pre-wrap break-words">
                          {shouldShowTextAuditDiff
                            ? renderTextAuditOriginalDiff(paragraph, auditRevisedParagraphs[index])
                            : paragraph}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
          {showContinuousTextAudit ? null : reviewPreviewTextColumnSeparator}
          <section
            className="flex min-h-0 flex-col bg-white"
            style={
              showContinuousTextAudit ? { gridColumn: effectiveShowReviewOutline ? '3 / -1' : '1 / -1' } : undefined
            }
          >
            {showContinuousTextAudit ? (
              <ChapterTextAuditContinuousReview
                chapterKey={activeReviewChapter?.id ?? 'none'}
                originalParagraphs={reviewOriginalParagraphs}
                revisedParagraphs={auditRevisedParagraphs}
                reviewAiOutput={reviewAiOutput}
                fontSize={reviewPreviewFontSize}
                onApply={onApplyTextAuditContent}
              />
            ) : (
              <>
                <div className="flex h-[33px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-[#EAF9FD] px-4">
                  <span className="text-xs font-black text-[#078fb0]">{reviewPreviewAnnotationTitle}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">
                    {reviewMode === 'polish'
                      ? `${polishPreviewText.trim() ? countCompactWords(polishPreviewText) : 0} 字`
                      : isAuditTextReview
                        ? `${auditRevisedText.trim() ? countCompactWords(auditRevisedText) : 0} 字`
                        : `${reviewAnnotations.length} 条`}
                  </span>
                </div>
                <div
                  ref={reviewAnnotationPreviewPaneRef}
                  className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'annotation' ? 'scrollbar-active' : ''}`}
                  onScroll={() => handleReviewPreviewScroll('annotation')}
                  style={{ fontSize: reviewPreviewFontSize }}
                >
                  {reviewMode === 'polish' ? (
                    !polishPreviewText.trim() ? (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                        文笔润色后内容会显示在这里。
                      </div>
                    ) : (
                      <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                        {polishPreviewParagraphs.map((paragraph, index) => (
                          <p
                            key={`${index}-${paragraph.slice(0, 18)}`}
                            className={`whitespace-pre-wrap break-words ${
                              REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS
                            } ${REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS}`}
                            style={{ fontSize: reviewPreviewFontSize }}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )
                  ) : !reviewAiOutput.trim() && !isAuditStructureReview ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                      {activeReviewModeTitle}后内容会显示在这里。
                    </div>
                  ) : isAuditTextReview ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-amber-600">
                      {auditRevisedText.trim()
                        ? `原文 ${reviewOriginalParagraphs.length} 段，审核后 ${auditRevisedParagraphs.length} 段。段落数量不一致，请让 AI 按原文段落重新输出。`
                        : 'AI正在思考，请稍后……'}
                    </div>
                  ) : isAuditStructureReview ? (
                    <div className="space-y-3">
                      <div
                        className={`rounded-xl border px-4 py-3 ${
                          auditOutputPassed
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <div className="text-sm font-black">{auditOutputPassed ? '通过' : '待确认 / 需处理'}</div>
                        <div className="mt-1 text-xs font-bold">
                          {auditOutputPassed ? 'AI 剧情审核结论为通过。' : '请查看下方审核元素和 AI 说明。'}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {AUDIT_STRUCTURE_CHECK_ITEMS.map((item) => {
                          const itemStatus = getAuditStructureItemStatus(reviewAiOutput, item);
                          const outlineFitPercent =
                            item === AUDIT_OUTLINE_FIT_ITEM ? getAuditOutlineFitPercent(reviewAiOutput) : null;
                          const itemStatusLabel =
                            outlineFitPercent !== null
                              ? `${outlineFitPercent}%`
                              : itemStatus === 'passed'
                                ? '通过'
                                : itemStatus === 'failed'
                                  ? '不通过'
                                  : '待核对';
                          const expanded = expandedAuditStructureItems.has(item);
                          const itemDetail = getAuditStructureItemDetail(reviewAiOutput, item);
                          return (
                            <div
                              key={item}
                              className={`overflow-hidden rounded-lg border text-sm font-bold ${
                                itemStatus === 'passed'
                                  ? 'border-emerald-100 bg-white text-emerald-700'
                                  : itemStatus === 'failed'
                                    ? 'border-red-100 bg-red-50 text-red-700'
                                    : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleAuditStructureItem(item)}
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                                aria-expanded={expanded}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <ChevronDown
                                    className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : '-rotate-90'}`}
                                  />
                                  <span className="min-w-0 truncate">{item}</span>
                                </span>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${
                                    itemStatus === 'passed'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : itemStatus === 'failed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {itemStatusLabel}
                                </span>
                              </button>
                              {expanded ? (
                                <div className="space-y-2 border-t border-current/10 px-4 pb-3 pt-2 text-xs font-bold leading-6 text-slate-600">
                                  <div>
                                    <div className="mb-1 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                                      说明
                                    </div>
                                    <div className="whitespace-pre-wrap break-words">
                                      {itemDetail.description || '暂无说明。'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="mb-1 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                                      建议
                                    </div>
                                    <div className="whitespace-pre-wrap break-words">
                                      {itemDetail.suggestion || '暂无建议。'}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">
                      这里会显示带 AI 标注的正文。
                    </div>
                  ) : (
                    <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                      {reviewOriginalParagraphs.map((paragraph, index) => {
                        const paragraphAnnotations = reviewAnnotationsByParagraph.get(index) ?? [];
                        const selected = activeReviewParagraphIndex === index;
                        return (
                          <div
                            ref={(node) => {
                              reviewAnnotationRefs.current[index] = node;
                            }}
                            key={`${index}-${paragraph.slice(0, 18)}`}
                            className={`${REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS} ${
                              selected
                                ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS
                                : paragraphAnnotations.length > 0
                                  ? 'border-amber-300 bg-amber-50/30'
                                  : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words" style={{ fontSize: reviewPreviewFontSize }}>
                              {renderAnnotatedReviewParagraph(paragraph, paragraphAnnotations)}
                            </p>
                            {paragraphAnnotations.length > 0 ? (
                              <div className={`${getReviewAnnotationNoteSpacingClass(paragraph)} space-y-2`}>
                                {paragraphAnnotations.map((annotation) => (
                                  <div
                                    key={annotation.id}
                                    className={`rounded-lg border px-3 py-2 text-xs font-bold leading-5 ${getReviewSeverityClass(annotation.severity)}`}
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-black">{annotation.id}</span>
                                      <span>{annotation.severity}</span>
                                      <span>{annotation.type}</span>
                                      <span>{annotation.action}</span>
                                    </div>
                                    {annotation.problem ? <div className="mt-1">问题：{annotation.problem}</div> : null}
                                    {annotation.suggestion ? (
                                      <div className="mt-1">建议：{annotation.suggestion}</div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
