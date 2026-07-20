import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  readSharedWorkbenchAiRightWidth,
  writeSharedWorkbenchAiRightWidth,
} from '@/features/workbench/model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidth,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';

import {
  CHAPTER_EDITOR_RESIZE_HANDLE_CLASS,
  clampPanelWidth,
  clampReviewPreviewFontSize,
  readReviewPreviewFontSize,
  readReviewPreviewOutlineVisible,
  readReviewPreviewWidthMode,
  readStoredPanelWidth,
  readWorkbenchLeftPanelWidth,
  REVIEW_PAGE_LEFT_WIDTH,
  REVIEW_PAGE_LEFT_WIDTH_LIMIT,
  REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
  REVIEW_PAGE_RIGHT_WIDTH_LIMIT,
  REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY,
  REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY,
  REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY,
  REVIEW_PREVIEW_OUTLINE_WIDTH,
  REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT,
  REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY,
  REVIEW_PREVIEW_SEPARATOR_WIDTH,
  REVIEW_PREVIEW_TEXT_WIDTH,
  REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
  REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,
  REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY,
  STATUS_PAGE_LEFT_WIDTH,
  STATUS_PAGE_LEFT_WIDTH_LIMIT,
  STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
  STATUS_PAGE_RIGHT_WIDTH_LIMIT,
  STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY,
  type ReviewPreviewWidthMode,
} from '../components/chapterEditorLayout';

interface UseChapterEditorPanelsOptions {
  canShowReviewOutline: boolean;
}

export function useChapterEditorPanels({ canShowReviewOutline }: UseChapterEditorPanelsOptions) {
  const [reviewPageLeftWidth, setReviewPageLeftWidth] = useState(() =>
    readWorkbenchLeftPanelWidth(
      REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
      REVIEW_PAGE_LEFT_WIDTH,
      REVIEW_PAGE_LEFT_WIDTH_LIMIT,
    ),
  );
  const [reviewPageRightWidth, setReviewPageRightWidth] = useState(() =>
    readSharedWorkbenchAiRightWidth(REVIEW_PAGE_RIGHT_WIDTH_LIMIT.max),
  );
  const [reviewPreviewOutlineWidth, setReviewPreviewOutlineWidth] = useState(() =>
    readStoredPanelWidth(
      REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY,
      REVIEW_PREVIEW_OUTLINE_WIDTH,
      REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT,
    ),
  );
  const [reviewPreviewTextWidth, setReviewPreviewTextWidth] = useState(() =>
    readStoredPanelWidth(
      REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,
      REVIEW_PREVIEW_TEXT_WIDTH,
      REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
    ),
  );
  const [reviewPreviewWidthMode, setReviewPreviewWidthMode] = useState<ReviewPreviewWidthMode>(() =>
    readReviewPreviewWidthMode(),
  );
  const [reviewPreviewUsesCustomTextWidth, setReviewPreviewUsesCustomTextWidth] = useState(false);
  const [statusPageLeftWidth, setStatusPageLeftWidth] = useState(() =>
    readWorkbenchLeftPanelWidth(
      STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
      STATUS_PAGE_LEFT_WIDTH,
      STATUS_PAGE_LEFT_WIDTH_LIMIT,
    ),
  );
  const [statusPageRightWidth, setStatusPageRightWidth] = useState(() =>
    readSharedWorkbenchAiRightWidth(STATUS_PAGE_RIGHT_WIDTH_LIMIT.max),
  );
  const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(() => readReviewPreviewFontSize());
  const [showReviewOutline, setShowReviewOutline] = useState(() => readReviewPreviewOutlineVisible());
  const [activeReviewPreviewScrollPane, setActiveReviewPreviewScrollPane] = useState<
    'outline' | 'original' | 'annotation' | null
  >(null);
  const reviewPreviewGridRef = useRef<HTMLDivElement | null>(null);
  const reviewPreviewScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const syncSharedAiRightWidth = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      setReviewPageRightWidth(readSharedWorkbenchAiRightWidth(REVIEW_PAGE_RIGHT_WIDTH_LIMIT.max));
      setStatusPageRightWidth(readSharedWorkbenchAiRightWidth(STATUS_PAGE_RIGHT_WIDTH_LIMIT.max));
    };
    window.addEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
  }, []);

  useEffect(() => {
    const syncSharedLeftNavWidth = () => {
      if (!readSharedWorkbenchLeftNavWidthEnabled()) return;
      setReviewPageLeftWidth(
        readWorkbenchLeftPanelWidth(
          REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
          REVIEW_PAGE_LEFT_WIDTH,
          REVIEW_PAGE_LEFT_WIDTH_LIMIT,
        ),
      );
      setStatusPageLeftWidth(
        readWorkbenchLeftPanelWidth(
          STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
          STATUS_PAGE_LEFT_WIDTH,
          STATUS_PAGE_LEFT_WIDTH_LIMIT,
        ),
      );
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
  }, []);

  useEffect(
    () => () => {
      if (reviewPreviewScrollTimerRef.current !== null) window.clearTimeout(reviewPreviewScrollTimerRef.current);
    },
    [],
  );

  const effectiveShowReviewOutline = canShowReviewOutline && showReviewOutline;
  const handleReviewPreviewScroll = (pane: 'outline' | 'original' | 'annotation') => {
    setActiveReviewPreviewScrollPane(pane);
    if (reviewPreviewScrollTimerRef.current !== null) window.clearTimeout(reviewPreviewScrollTimerRef.current);
    reviewPreviewScrollTimerRef.current = window.setTimeout(() => {
      setActiveReviewPreviewScrollPane(null);
      reviewPreviewScrollTimerRef.current = null;
    }, 650);
  };

  const getBalancedReviewPreviewTextWidth = (
    nextOutlineWidth = reviewPreviewOutlineWidth,
    nextShowOutline = effectiveShowReviewOutline,
  ) => {
    const gridWidth = reviewPreviewGridRef.current?.clientWidth ?? 0;
    const fixedWidth = nextShowOutline
      ? nextOutlineWidth + REVIEW_PREVIEW_SEPARATOR_WIDTH * 2
      : REVIEW_PREVIEW_SEPARATOR_WIDTH;
    const dynamicTextWidthLimit = {
      ...REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
      max: Math.max(REVIEW_PREVIEW_TEXT_WIDTH_LIMIT.max, (gridWidth - fixedWidth) / 2),
    };
    return gridWidth > fixedWidth
      ? clampPanelWidth((gridWidth - fixedWidth) / 2, dynamicTextWidthLimit)
      : REVIEW_PREVIEW_TEXT_WIDTH;
  };
  const syncReviewPreviewTextColumnsWidth = (
    nextOutlineWidth = reviewPreviewOutlineWidth,
    nextShowOutline = effectiveShowReviewOutline,
  ) => {
    const sharedTextWidth = getBalancedReviewPreviewTextWidth(nextOutlineWidth, nextShowOutline);
    setReviewPreviewTextWidth(sharedTextWidth);
    localStorage.setItem(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, String(sharedTextWidth));
    return sharedTextWidth;
  };
  const setReviewPreviewWidthModeWithStorage = (nextMode: ReviewPreviewWidthMode) => {
    if (nextMode === 'free') {
      syncReviewPreviewTextColumnsWidth();
      setReviewPreviewUsesCustomTextWidth(false);
    }
    setReviewPreviewWidthMode(nextMode);
    localStorage.setItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY, nextMode);
  };
  const setReviewOutlineVisibilityWithBalancedColumns = (nextShowReviewOutline: boolean) => {
    const gridWidth = reviewPreviewGridRef.current?.clientWidth ?? 0;
    setShowReviewOutline(nextShowReviewOutline);
    localStorage.setItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY, String(nextShowReviewOutline));
    setReviewPreviewUsesCustomTextWidth(false);
    let nextOutlineWidth = reviewPreviewOutlineWidth;
    if (nextShowReviewOutline) {
      const availableWidth = Math.max(0, gridWidth - REVIEW_PREVIEW_SEPARATOR_WIDTH * 2);
      const outlineWidth =
        availableWidth > 0
          ? clampPanelWidth(availableWidth * 0.26, REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT)
          : REVIEW_PREVIEW_OUTLINE_WIDTH;
      setReviewPreviewOutlineWidth(outlineWidth);
      localStorage.setItem(REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY, String(outlineWidth));
      nextOutlineWidth = outlineWidth;
    }
    if (reviewPreviewWidthMode === 'free')
      syncReviewPreviewTextColumnsWidth(nextOutlineWidth, canShowReviewOutline && nextShowReviewOutline);
  };
  const setReviewPreviewFontSizeWithStorage = (nextFontSize: number) => {
    const fontSize = clampReviewPreviewFontSize(nextFontSize);
    setReviewPreviewFontSize(fontSize);
    localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, String(fontSize));
  };

  const startPanelWidthResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    options: {
      initialWidth: number;
      storageKey: string;
      limit: { min: number; max: number };
      direction: 1 | -1;
      onChange: (value: number) => void;
      onCommit?: (value: number) => void;
      onStart?: () => void;
    },
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const startX = event.clientX;
    const { initialWidth, storageKey, limit, direction, onChange, onCommit, onStart } = options;
    onStart?.();
    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      onChange(clampPanelWidth(initialWidth + (moveEvent.clientX - startX) * direction, limit));
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      const finalWidth = clampPanelWidth(initialWidth + (upEvent.clientX - startX) * direction, limit);
      onChange(finalWidth);
      onCommit?.(finalWidth);
      if (!onCommit) localStorage.setItem(storageKey, String(finalWidth));
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const renderPanelResizeHandle = (onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void) => (
    <div
      data-no-modal-drag="true"
      onPointerDown={onPointerDown}
      className={CHAPTER_EDITOR_RESIZE_HANDLE_CLASS}
      title="拖拽调整宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
  const renderReviewPreviewColumnSeparator = (
    options: { onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void; title?: string } = {},
  ) => (
    <div
      data-no-modal-drag="true"
      onPointerDown={options.onPointerDown}
      className={`group flex h-full w-full items-stretch justify-center bg-white ${options.onPointerDown ? 'cursor-ew-resize' : 'cursor-default'}`}
      title={options.title}
    >
      <div
        className={`h-full w-px bg-slate-300 ${options.onPointerDown ? 'transition-colors group-hover:bg-[#08AACE]' : ''}`}
      />
    </div>
  );

  const statusLeftResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: statusPageLeftWidth,
      storageKey: STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
      limit: STATUS_PAGE_LEFT_WIDTH_LIMIT,
      direction: 1,
      onChange: setStatusPageLeftWidth,
      onCommit: (value) => {
        if (readSharedWorkbenchLeftNavWidthEnabled()) {
          writeSharedWorkbenchLeftNavWidth(value, STATUS_PAGE_LEFT_WIDTH_LIMIT.max, STATUS_PAGE_LEFT_WIDTH_LIMIT.min);
        } else localStorage.setItem(STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY, String(value));
      },
    }),
  );
  const statusRightResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: statusPageRightWidth,
      storageKey: STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY,
      limit: STATUS_PAGE_RIGHT_WIDTH_LIMIT,
      direction: -1,
      onChange: setStatusPageRightWidth,
      onCommit: (value) => writeSharedWorkbenchAiRightWidth(value),
    }),
  );
  const reviewLeftResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: reviewPageLeftWidth,
      storageKey: REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
      limit: REVIEW_PAGE_LEFT_WIDTH_LIMIT,
      direction: 1,
      onChange: setReviewPageLeftWidth,
      onCommit: (value) => {
        if (readSharedWorkbenchLeftNavWidthEnabled()) {
          writeSharedWorkbenchLeftNavWidth(value, REVIEW_PAGE_LEFT_WIDTH_LIMIT.max, REVIEW_PAGE_LEFT_WIDTH_LIMIT.min);
        } else localStorage.setItem(REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY, String(value));
      },
    }),
  );
  const reviewRightResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: reviewPageRightWidth,
      storageKey: REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY,
      limit: REVIEW_PAGE_RIGHT_WIDTH_LIMIT,
      direction: -1,
      onChange: setReviewPageRightWidth,
      onCommit: (value) => writeSharedWorkbenchAiRightWidth(value),
    }),
  );
  const reviewPreviewOutlineResizeHandle = renderReviewPreviewColumnSeparator({
    title: '拖拽调整章纲宽度',
    onPointerDown: (event) =>
      startPanelWidthResize(event, {
        initialWidth: reviewPreviewOutlineWidth,
        storageKey: REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY,
        limit: REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT,
        direction: 1,
        onChange: setReviewPreviewOutlineWidth,
      }),
  });
  const reviewPreviewTextResizeHandle = renderReviewPreviewColumnSeparator({
    title: '拖拽调整原文宽度',
    onPointerDown: (event) =>
      startPanelWidthResize(event, {
        initialWidth: reviewPreviewTextWidth,
        storageKey: REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,
        limit: REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
        direction: 1,
        onChange: setReviewPreviewTextWidth,
        onStart: () => setReviewPreviewUsesCustomTextWidth(true),
      }),
  });
  const reviewPreviewTextColumnSeparator =
    reviewPreviewWidthMode === 'locked' ? renderReviewPreviewColumnSeparator() : reviewPreviewTextResizeHandle;
  const reviewPreviewHiddenTextColumnMinWidth = `calc((100% - ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px) / 3)`;
  const reviewPreviewFreeTextColumnMinWidth = effectiveShowReviewOutline
    ? `calc((100% - ${reviewPreviewOutlineWidth}px - ${REVIEW_PREVIEW_SEPARATOR_WIDTH * 2}px) / 3)`
    : reviewPreviewHiddenTextColumnMinWidth;
  const reviewPreviewUseFreeCustomWidth = reviewPreviewWidthMode === 'free' && reviewPreviewUsesCustomTextWidth;
  const reviewPreviewGridTemplateColumns = !reviewPreviewUseFreeCustomWidth
    ? effectiveShowReviewOutline
      ? `${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr)`
      : `minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`
    : effectiveShowReviewOutline
      ? `${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, 1fr)`
      : `minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`;

  return {
    reviewPageLeftWidth,
    reviewPageRightWidth,
    statusPageLeftWidth,
    statusPageRightWidth,
    reviewPreviewWidthMode,
    reviewPreviewFontSize,
    showReviewOutline,
    effectiveShowReviewOutline,
    activeReviewPreviewScrollPane,
    reviewPreviewGridRef,
    reviewPreviewGridTemplateColumns,
    handleReviewPreviewScroll,
    setReviewPreviewWidthModeWithStorage,
    setReviewOutlineVisibilityWithBalancedColumns,
    setReviewPreviewFontSizeWithStorage,
    statusLeftResizeHandle,
    statusRightResizeHandle,
    reviewLeftResizeHandle,
    reviewRightResizeHandle,
    reviewPreviewOutlineResizeHandle,
    reviewPreviewTextColumnSeparator,
  };
}
