import { useEffect, useMemo, useRef, useState } from 'react';
import type { ModelItem } from '@/features/models/model/modelTypes';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import {
  readWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  extractReviewAnnotations,
  extractReviewRevisedText,
  buildTextAuditRevisedText,
  getReviewAnnotationParagraphIndex,
  preserveReviewParagraphIndentation,
  splitReviewParagraphs,
  type ReviewAnnotation,
} from '@/features/workbench/model/chapterReviewText';
import { isAuditOutputPassed } from '@/features/workbench/model/chapterAuditResult';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';
import { findReviewDetailOutline, isReviewDetailOutlineEntry } from '../components/chapterEditorPresentation';
import { scrollReviewComparisonTargetIntoCenter } from '../components/chapterEditorLayout';

export function useChapterReviewPresentation(options: {
  sortedChapters: Chapter[];
  reviewChapterId: number | null;
  chapter: Chapter | null;
  content: string;
  getChapterContent: (id: number) => string;
  reviewLibraryEntries?: WorkbenchLibraryEntry[];
  settingsStorageKey: string;
  outlineStorageKey?: string;
  reviewRevisedDraft: string;
  reviewAiOutput: string;
  reviewModels: ModelItem[];
  reviewModelId: string;
  reviewMode: ReviewMode;
  isAuditTextReview: boolean;
}) {
  const {
    sortedChapters,
    reviewChapterId,
    chapter,
    content,
    getChapterContent,
    reviewLibraryEntries,
    settingsStorageKey,
    outlineStorageKey,
    reviewRevisedDraft,
    reviewAiOutput,
    reviewModels,
    reviewModelId,
    reviewMode,
    isAuditTextReview,
  } = options;
  const [activeReviewParagraphIndex, setActiveReviewParagraphIndex] = useState(0);
  const reviewOriginalPreviewPaneRef = useRef<HTMLDivElement | null>(null);
  const reviewAnnotationPreviewPaneRef = useRef<HTMLDivElement | null>(null);
  const reviewOriginalParagraphRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reviewAnnotationRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeReviewChapter =
    sortedChapters.find((item) => item.id === reviewChapterId) ?? chapter ?? sortedChapters[0] ?? null;
  const activeReviewContent = activeReviewChapter
    ? activeReviewChapter.id === chapter?.id
      ? content
      : getChapterContent(activeReviewChapter.id)
    : '';
  const activeReviewWordCount = activeReviewContent.replace(/\s/g, '').length;
  const detailOutlineEntries = useMemo(() => {
    const entries = reviewLibraryEntries ?? [
      ...readWorkbenchLibraryEntries(settingsStorageKey),
      ...(outlineStorageKey ? readWorkbenchLibraryEntries(outlineStorageKey) : []),
    ];
    return entries.filter(isReviewDetailOutlineEntry);
  }, [outlineStorageKey, reviewLibraryEntries, settingsStorageKey]);
  const activeReviewDetailOutline = useMemo(
    () => findReviewDetailOutline(detailOutlineEntries, activeReviewChapter),
    [activeReviewChapter, detailOutlineEntries],
  );
  const activeReviewDetailOutlineText = activeReviewDetailOutline?.content.trim() ?? '';
  const polishPreviewText = reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput);
  const polishPreviewParagraphs = useMemo(() => splitReviewParagraphs(polishPreviewText), [polishPreviewText]);
  const activeReviewModel = reviewModels.find((model) => model.id === reviewModelId) ?? reviewModels[0] ?? null;
  const reviewPreviewOriginalTitle = activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 原文` : '原文';
  const reviewPreviewAnnotationLabel =
    reviewMode === 'polish'
      ? '润色后'
      : reviewMode === 'audit'
        ? isAuditTextReview
          ? '文本审核'
          : '剧情审核'
        : 'AI标注';
  const reviewPreviewAnnotationTitle = activeReviewChapter
    ? `第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`
    : reviewPreviewAnnotationLabel;
  const auditOutputPassed = isAuditOutputPassed(reviewAiOutput);
  const reviewOriginalParagraphs = useMemo(() => splitReviewParagraphs(activeReviewContent), [activeReviewContent]);
  const auditRevisedText = useMemo(
    () =>
      isAuditTextReview
        ? reviewRevisedDraft.trimEnd() ||
          extractReviewRevisedText(reviewAiOutput) ||
          buildTextAuditRevisedText(reviewAiOutput, activeReviewContent)
        : '',
    [activeReviewContent, isAuditTextReview, reviewAiOutput, reviewRevisedDraft],
  );
  const auditRevisedParagraphs = useMemo(
    () => preserveReviewParagraphIndentation(reviewOriginalParagraphs, splitReviewParagraphs(auditRevisedText)),
    [auditRevisedText, reviewOriginalParagraphs],
  );
  const auditParagraphCountMatches = reviewOriginalParagraphs.length === auditRevisedParagraphs.length;
  const reviewAnnotations = useMemo(() => extractReviewAnnotations(reviewAiOutput), [reviewAiOutput]);
  const reviewAnnotationsByParagraph = useMemo(() => {
    const result = new Map<number, ReviewAnnotation[]>();
    reviewAnnotations.forEach((annotation) => {
      const index = getReviewAnnotationParagraphIndex(annotation, reviewOriginalParagraphs.length);
      if (index < 0) return;
      result.set(index, [...(result.get(index) ?? []), annotation]);
    });
    return result;
  }, [reviewAnnotations, reviewOriginalParagraphs.length]);
  useEffect(
    () =>
      setActiveReviewParagraphIndex((current) =>
        reviewOriginalParagraphs.length === 0 ? 0 : Math.min(current, reviewOriginalParagraphs.length - 1),
      ),
    [reviewOriginalParagraphs.length],
  );
  const selectReviewPreviewParagraph = (index: number) => {
    setActiveReviewParagraphIndex(index);
    window.requestAnimationFrame(() => {
      scrollReviewComparisonTargetIntoCenter(
        reviewOriginalPreviewPaneRef.current,
        reviewOriginalParagraphRefs.current[index],
      );
      scrollReviewComparisonTargetIntoCenter(
        reviewAnnotationPreviewPaneRef.current,
        reviewAnnotationRefs.current[index],
      );
    });
  };
  return {
    activeReviewParagraphIndex,
    reviewOriginalPreviewPaneRef,
    reviewAnnotationPreviewPaneRef,
    reviewOriginalParagraphRefs,
    reviewAnnotationRefs,
    activeReviewChapter,
    activeReviewContent,
    activeReviewWordCount,
    activeReviewDetailOutline,
    activeReviewDetailOutlineText,
    polishPreviewText,
    polishPreviewParagraphs,
    activeReviewModel,
    reviewPreviewOriginalTitle,
    reviewPreviewAnnotationTitle,
    auditOutputPassed,
    reviewOriginalParagraphs,
    auditRevisedText,
    auditRevisedParagraphs,
    auditParagraphCountMatches,
    reviewAnnotations,
    reviewAnnotationsByParagraph,
    selectReviewPreviewParagraph,
  };
}
