import { useEffect, useMemo, useState } from 'react';

import {
  AUDIT_PROMPT_CATEGORY,
  COMMENT_PROMPT_CATEGORY,
  STATUS_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  usePrompts,
} from '@/features/prompts/hooks/usePrompts';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';

import { POLISH_PROMPT_CATEGORY, REVIEW_MODE_PROMPT_CATEGORIES } from '../components/chapterEditorReviewConfig';
import {
  buildAuditPromptSelectOptions,
  getAuditPromptSubcategory,
  isStructureAuditPrompt,
  isTextAuditPrompt,
} from '../components/chapterEditorPresentation';

interface UseChapterReviewPromptsOptions {
  reviewMode: ReviewMode;
  clearReviewAiOutput: () => void;
}

export function useChapterReviewPrompts({ reviewMode, clearReviewAiOutput }: UseChapterReviewPromptsOptions) {
  const [reviewAuditPromptId, setReviewAuditPromptId] = useState('');
  const [reviewCommentPromptId, setReviewCommentPromptId] = useState('');
  const [reviewPolishPromptId, setReviewPolishPromptId] = useState('');
  const [statusPromptId, setStatusPromptId] = useState('');
  const { prompts } = usePrompts();

  const reviewAuditPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === AUDIT_PROMPT_CATEGORY),
    [prompts],
  );
  const reviewCommentPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === COMMENT_PROMPT_CATEGORY),
    [prompts],
  );
  const reviewPolishPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === POLISH_PROMPT_CATEGORY),
    [prompts],
  );
  const statusPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === STATUS_PROMPT_CATEGORY),
    [prompts],
  );

  const activeAuditPrompt =
    reviewAuditPrompts.find((prompt) => prompt.id === reviewAuditPromptId) ?? reviewAuditPrompts[0] ?? null;
  const activeCommentPrompt =
    reviewCommentPrompts.find((prompt) => prompt.id === reviewCommentPromptId) ?? reviewCommentPrompts[0] ?? null;
  const activePolishPrompt =
    reviewPolishPrompts.find((prompt) => prompt.id === reviewPolishPromptId) ?? reviewPolishPrompts[0] ?? null;
  const activeReviewPrompt =
    reviewMode === 'audit' ? activeAuditPrompt : reviewMode === 'comment' ? activeCommentPrompt : activePolishPrompt;
  const activeReviewPromptOptions =
    reviewMode === 'audit'
      ? buildAuditPromptSelectOptions(reviewAuditPrompts)
      : reviewMode === 'comment'
        ? reviewCommentPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
        : reviewPolishPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }));
  const activeReviewPromptId =
    reviewMode === 'audit'
      ? reviewAuditPromptId
      : reviewMode === 'comment'
        ? reviewCommentPromptId
        : reviewPolishPromptId;
  const setActiveReviewPromptId =
    reviewMode === 'audit'
      ? setReviewAuditPromptId
      : reviewMode === 'comment'
        ? setReviewCommentPromptId
        : setReviewPolishPromptId;
  const activeReviewPromptCategory = REVIEW_MODE_PROMPT_CATEGORIES[reviewMode];
  const isAuditTextReview = reviewMode === 'audit' && isTextAuditPrompt(activeReviewPrompt);
  const isAuditStructureReview = reviewMode === 'audit' && isStructureAuditPrompt(activeReviewPrompt);
  const activeStatusPromptId = statusPrompts.some((prompt) => prompt.id === statusPromptId)
    ? statusPromptId
    : (statusPrompts[0]?.id ?? '');

  const handleActiveReviewPromptChange = (nextPromptId: string) => {
    const previousAuditType = reviewMode === 'audit' ? getAuditPromptSubcategory(activeReviewPrompt) : undefined;
    const nextPrompt = reviewMode === 'audit' ? reviewAuditPrompts.find((prompt) => prompt.id === nextPromptId) : null;
    setActiveReviewPromptId(nextPromptId);
    if (reviewMode === 'audit' && nextPrompt && getAuditPromptSubcategory(nextPrompt) !== previousAuditType) {
      clearReviewAiOutput();
    }
  };

  useEffect(() => {
    if (reviewAuditPrompts.length === 0) {
      if (reviewAuditPromptId) setReviewAuditPromptId('');
      return;
    }
    if (!reviewAuditPrompts.some((prompt) => prompt.id === reviewAuditPromptId)) {
      setReviewAuditPromptId(reviewAuditPrompts[0].id);
    }
  }, [reviewAuditPromptId, reviewAuditPrompts]);

  useEffect(() => {
    if (reviewCommentPrompts.length === 0) {
      if (reviewCommentPromptId) setReviewCommentPromptId('');
      return;
    }
    if (!reviewCommentPrompts.some((prompt) => prompt.id === reviewCommentPromptId)) {
      setReviewCommentPromptId(reviewCommentPrompts[0].id);
    }
  }, [reviewCommentPromptId, reviewCommentPrompts]);

  useEffect(() => {
    if (reviewPolishPrompts.length === 0) {
      if (reviewPolishPromptId) setReviewPolishPromptId('');
      return;
    }
    if (!reviewPolishPrompts.some((prompt) => prompt.id === reviewPolishPromptId)) {
      setReviewPolishPromptId(reviewPolishPrompts[0].id);
    }
  }, [reviewPolishPromptId, reviewPolishPrompts]);

  useEffect(() => {
    if (!statusPromptId && statusPrompts[0]) setStatusPromptId(statusPrompts[0].id);
  }, [statusPromptId, statusPrompts]);

  return {
    activeReviewPrompt,
    activeReviewPromptOptions,
    activeReviewPromptId,
    activeReviewPromptCategory,
    isAuditTextReview,
    isAuditStructureReview,
    handleActiveReviewPromptChange,
    statusPrompts,
    activeStatusPromptId,
    setStatusPromptId,
  };
}
