import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY,
} from '@/features/workbench/model/workbenchSharedAiRightWidth';
import {
  readSharedWorkbenchLeftNavWidth,
  readSharedWorkbenchLeftNavWidthEnabled,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';
import { ASSOCIATED_CHAPTERS_KEY } from '@/features/workbench/model/workbenchAssociationCleanup';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';

export const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
export const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 150;
export const SPLIT_BUTTON_OUTLINE_GROUP_CLASS =
  'flex h-8 items-stretch overflow-hidden rounded-md border border-brand bg-white shadow-none';
export const SPLIT_BUTTON_OUTLINE_ACTION_CLASS =
  'inline-flex flex-1 items-center justify-center whitespace-nowrap px-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light';
export const REVIEW_PAGE_LEFT_WIDTH = 180;
export const REVIEW_PAGE_RIGHT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
export const REVIEW_PREVIEW_OUTLINE_WIDTH = 360;
export const REVIEW_PREVIEW_TEXT_WIDTH = 420;
export const STATUS_PAGE_LEFT_WIDTH = 190;
export const STATUS_PAGE_RIGHT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
export const REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_left_width';
export const REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY = WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY;
export const REVIEW_MODEL_ID_STORAGE_KEY = 'xinyuexia_chapter_editor_review_model_id';
export const REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_width';
export const REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_text_width';
export const REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_width_mode';
export const REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_visible';
export const REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_font_size';
export const REVIEW_PREVIEW_TYPOGRAPHY_VERSION_KEY = 'xinyuexia_chapter_editor_review_typography_version';
export const REVIEW_PREVIEW_TYPOGRAPHY_VERSION = 'body-adapted-v1';
export const REVIEW_PREVIEW_SEPARATOR_WIDTH = 7;
export const STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_left_width';
export const STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY = WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY;
export const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS =
  'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] xy-flow-group-bg px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm transition-colors';
export const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';
export const WORKBENCH_FOLDER_GROUP_COUNT_CLASS =
  'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';
export const REVIEW_PAGE_LEFT_WIDTH_LIMIT = { min: 180, max: 360 };
export const REVIEW_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;
export const REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT = { min: 240, max: 560 };
export const REVIEW_PREVIEW_TEXT_WIDTH_LIMIT = { min: 240, max: 760 };
export const STATUS_PAGE_LEFT_WIDTH_LIMIT = { min: 190, max: 360 };
export const STATUS_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;
export const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS =
  'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';
export const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS =
  'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';
export const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';
export const REVIEW_PREVIEW_MIN_FONT_SIZE = 12;
export const REVIEW_PREVIEW_MAX_FONT_SIZE = 28;
export const REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS = 'space-y-3';
export const REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS = 'border-l-2 px-3 py-1.5 leading-7 transition-colors';
export const REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-slate-900';
export const REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS = 'border-transparent bg-white text-slate-700 hover:bg-slate-50';
export type ReviewPreviewWidthMode = 'locked' | 'free';
export type CenteredReviewComparisonScrollMetrics = {
  containerClientHeight: number;
  containerScrollHeight: number;
  targetOffsetTop: number;
  targetClientHeight: number;
};

export function getCenteredReviewComparisonScrollTop({
  containerClientHeight,
  containerScrollHeight,
  targetOffsetTop,
  targetClientHeight,
}: CenteredReviewComparisonScrollMetrics) {
  const maxScrollTop = Math.max(0, containerScrollHeight - containerClientHeight);
  const centeredTop = targetOffsetTop - (containerClientHeight - targetClientHeight) / 2;
  return Math.min(maxScrollTop, Math.max(0, Math.round(centeredTop)));
}

export function scrollReviewComparisonTargetIntoCenter(container: HTMLElement | null, target: HTMLElement | null) {
  if (!container || !target) return;
  container.scrollTo({
    top: getCenteredReviewComparisonScrollTop({
      containerClientHeight: container.clientHeight,
      containerScrollHeight: container.scrollHeight,
      targetOffsetTop: target.offsetTop,
      targetClientHeight: target.clientHeight,
    }),
    behavior: 'smooth',
  });
}

export function clampPanelWidth(value: number, limit: { min: number; max: number }) {
  if (!Number.isFinite(value)) return limit.min;
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

export function readStoredPanelWidth(storageKey: string, fallback: number, limit: { min: number; max: number }) {
  try {
    const stored = Number(localStorage.getItem(storageKey));
    return clampPanelWidth(Number.isFinite(stored) && stored > 0 ? stored : fallback, limit);
  } catch {
    return clampPanelWidth(fallback, limit);
  }
}

export function readWorkbenchLeftPanelWidth(storageKey: string, fallback: number, limit: { min: number; max: number }) {
  if (readSharedWorkbenchLeftNavWidthEnabled()) {
    return clampPanelWidth(readSharedWorkbenchLeftNavWidth(limit.max, limit.min), limit);
  }
  return readStoredPanelWidth(storageKey, fallback, limit);
}

export function readReviewPreviewWidthMode(): ReviewPreviewWidthMode {
  try {
    return localStorage.getItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY) === 'free' ? 'free' : 'locked';
  } catch {
    return 'locked';
  }
}

export function readReviewModelId() {
  try {
    return localStorage.getItem(REVIEW_MODEL_ID_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function readReviewPreviewOutlineVisible() {
  try {
    return localStorage.getItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function clampReviewPreviewFontSize(value: number) {
  if (!Number.isFinite(value)) return 14;
  return Math.min(REVIEW_PREVIEW_MAX_FONT_SIZE, Math.max(REVIEW_PREVIEW_MIN_FONT_SIZE, Math.round(value)));
}

export function readReviewPreviewFontSize() {
  try {
    const stored = localStorage.getItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY);
    const storedSize = stored === null ? null : clampReviewPreviewFontSize(Number(stored));
    if (localStorage.getItem(REVIEW_PREVIEW_TYPOGRAPHY_VERSION_KEY) !== REVIEW_PREVIEW_TYPOGRAPHY_VERSION) {
      localStorage.setItem(REVIEW_PREVIEW_TYPOGRAPHY_VERSION_KEY, REVIEW_PREVIEW_TYPOGRAPHY_VERSION);
      if (storedSize === null || storedSize === 14) {
        localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, '18');
        return 18;
      }
    }
    return storedSize ?? 18;
  } catch {
    return 18;
  }
}

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

export function readAssociatedChapterCount(chapters: Pick<Chapter, 'id'>[]) {
  try {
    const parsed = JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return 0;
    const validIds = new Set(chapters.map((chapter) => chapter.id));
    return parsed.filter((id) => Number.isFinite(id) && validIds.has(Number(id))).length;
  } catch {
    return 0;
  }
}
