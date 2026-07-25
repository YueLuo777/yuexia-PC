import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

const BRAINSTORM_READER_CANDIDATE_WIDTH_KEY = 'xinyuexia_brainstorm_reader_candidate_width_v1';
const BRAINSTORM_READER_CANDIDATE_DEFAULT_WIDTH = 300;
export const BRAINSTORM_READER_CANDIDATE_MIN_WIDTH = 220;
export const BRAINSTORM_READER_CANDIDATE_MAX_WIDTH = 520;
export const BRAINSTORM_READER_PREVIEW_MIN_WIDTH = 480;
export const BRAINSTORM_READER_SPLITTER_WIDTH = 8;
const BRAINSTORM_READER_FALLBACK_CONTENT_WIDTH = 1180;
const BRAINSTORM_READER_KEYBOARD_STEP = 12;

function getCandidateMaxWidth(containerWidth: number) {
  return Math.max(
    BRAINSTORM_READER_CANDIDATE_MIN_WIDTH,
    Math.min(
      BRAINSTORM_READER_CANDIDATE_MAX_WIDTH,
      containerWidth - BRAINSTORM_READER_PREVIEW_MIN_WIDTH - BRAINSTORM_READER_SPLITTER_WIDTH,
    ),
  );
}

export function clampBrainstormReaderCandidateWidth(value: number, containerWidth: number) {
  return Math.min(
    getCandidateMaxWidth(containerWidth),
    Math.max(BRAINSTORM_READER_CANDIDATE_MIN_WIDTH, value),
  );
}

function readCandidateWidth() {
  if (typeof window === 'undefined') return BRAINSTORM_READER_CANDIDATE_DEFAULT_WIDTH;
  const saved = Number(window.localStorage.getItem(BRAINSTORM_READER_CANDIDATE_WIDTH_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : BRAINSTORM_READER_CANDIDATE_DEFAULT_WIDTH;
}

type BrainstormReaderSplit = {
  candidateWidth: number;
  candidateMaxWidth: number;
  gridRef: RefObject<HTMLDivElement | null>;
  gridStyle: CSSProperties;
  onSplitterPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSplitterKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

export function useBrainstormReaderSplit(isOpen: boolean): BrainstormReaderSplit {
  const gridRef = useRef<HTMLDivElement>(null);
  const stopResizeRef = useRef<(() => void) | null>(null);
  const [candidateWidth, setCandidateWidth] = useState(readCandidateWidth);
  const [candidateMaxWidth, setCandidateMaxWidth] = useState(BRAINSTORM_READER_CANDIDATE_MAX_WIDTH);

  const getContainerWidth = useCallback(() => {
    const width = gridRef.current?.getBoundingClientRect().width ?? 0;
    return width > 0 ? width : BRAINSTORM_READER_FALLBACK_CONTENT_WIDTH;
  }, []);

  const commitWidth = useCallback(
    (value: number) => {
      const containerWidth = getContainerWidth();
      const nextWidth = clampBrainstormReaderCandidateWidth(value, containerWidth);
      setCandidateMaxWidth(getCandidateMaxWidth(containerWidth));
      setCandidateWidth(nextWidth);
      window.localStorage.setItem(BRAINSTORM_READER_CANDIDATE_WIDTH_KEY, String(nextWidth));
    },
    [getContainerWidth],
  );

  useEffect(() => {
    if (!isOpen) return;
    commitWidth(candidateWidth);
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => commitWidth(candidateWidth));
    observer.observe(grid);
    return () => observer.disconnect();
  }, [candidateWidth, commitWidth, isOpen]);

  useEffect(
    () => () => {
      stopResizeRef.current?.();
    },
    [],
  );

  const onSplitterPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = candidateWidth;
      const handleRectWidth = event.currentTarget.getBoundingClientRect().width;
      const eventScale = handleRectWidth && event.currentTarget.offsetWidth
        ? handleRectWidth / event.currentTarget.offsetWidth
        : 1;

      const stopResize = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', stopResize);
        window.removeEventListener('pointercancel', stopResize);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        stopResizeRef.current = null;
      };
      const handleMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        commitWidth(startWidth + (moveEvent.clientX - startX) / eventScale);
      };

      stopResizeRef.current?.();
      stopResizeRef.current = stopResize;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', stopResize);
      window.addEventListener('pointercancel', stopResize);
    },
    [candidateWidth, commitWidth],
  );

  const onSplitterKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') commitWidth(BRAINSTORM_READER_CANDIDATE_MIN_WIDTH);
      else if (event.key === 'End') commitWidth(candidateMaxWidth);
      else commitWidth(candidateWidth + (event.key === 'ArrowRight' ? 1 : -1) * BRAINSTORM_READER_KEYBOARD_STEP);
    },
    [candidateMaxWidth, candidateWidth, commitWidth],
  );

  return {
    candidateWidth,
    candidateMaxWidth,
    gridRef,
    gridStyle: {
      gridTemplateColumns: `${candidateWidth}px ${BRAINSTORM_READER_SPLITTER_WIDTH}px minmax(0, 1fr)`,
    },
    onSplitterPointerDown,
    onSplitterKeyDown,
  };
}
