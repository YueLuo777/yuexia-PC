import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  readSharedWorkbenchAiRightWidth,
  writeSharedWorkbenchAiRightWidth,
} from '../model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  normalizeSharedWorkbenchLeftNavWidth,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidth,
} from '../model/workbenchSharedLeftNavWidth';
import {
  CHAPTER_SIDEBAR_MIN_WIDTH,
  getAiPanelMaxWidth,
  getChapterSidebarMaxWidth,
  normalizeAiPanelWidth,
  normalizeChapterSidebarWidth,
  normalizePublishedSidebarWidth,
  readWorkbenchChapterSidebarWidth,
  readWorkbenchPublishedSidebarWidth,
} from '../components/workbenchPageSupport';

export function useWorkbenchLayoutWidths() {
  const [navigationWidthUnified, setNavigationWidthUnified] = useState(readSharedWorkbenchLeftNavWidthEnabled);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => readSharedWorkbenchAiRightWidth(getAiPanelMaxWidth()));
  const [chapterSidebarWidth, setChapterSidebarWidth] = useState(readWorkbenchChapterSidebarWidth);
  const [publishedSidebarWidth, setPublishedSidebarWidth] = useState(readWorkbenchPublishedSidebarWidth);
  const [dragging, setDragging] = useState<'ai' | 'chapter' | 'published' | null>(null);
  const startX = useRef(0),
    startWidth = useRef(290);
  useEffect(() => {
    writeSharedWorkbenchAiRightWidth(aiPanelWidth);
  }, [aiPanelWidth]);
  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof CustomEvent) setAiPanelWidth(normalizeAiPanelWidth(Number(event.detail?.width)));
    };
    window.addEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, sync);
    return () => window.removeEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, sync);
  }, []);
  useEffect(() => {
    const sync = () => {
      const enabled = readSharedWorkbenchLeftNavWidthEnabled();
      setNavigationWidthUnified(enabled);
      if (enabled) {
        setChapterSidebarWidth(readWorkbenchChapterSidebarWidth());
        setPublishedSidebarWidth(readWorkbenchPublishedSidebarWidth());
      }
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, sync);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, sync);
  }, []);
  useEffect(() => {
    if (navigationWidthUnified)
      writeSharedWorkbenchLeftNavWidth(chapterSidebarWidth, getChapterSidebarMaxWidth(), CHAPTER_SIDEBAR_MIN_WIDTH);
    else localStorage.setItem('xinyuexia_chapter_sidebar_width', String(chapterSidebarWidth));
  }, [chapterSidebarWidth, navigationWidthUnified]);
  useEffect(() => {
    if (!navigationWidthUnified) localStorage.setItem('xinyuexia_published_sidebar_width', String(publishedSidebarWidth));
  }, [navigationWidthUnified, publishedSidebarWidth]);
  useEffect(() => {
    const resize = () => {
      setAiPanelWidth((v) => normalizeAiPanelWidth(v));
      if (readSharedWorkbenchLeftNavWidthEnabled()) {
        setChapterSidebarWidth(readWorkbenchChapterSidebarWidth());
        setPublishedSidebarWidth(readWorkbenchPublishedSidebarWidth());
      } else {
        setChapterSidebarWidth((v) => normalizeChapterSidebarWidth(v));
        setPublishedSidebarWidth((v) => normalizePublishedSidebarWidth(v));
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);
  const begin = (kind: 'ai' | 'chapter' | 'published', width: number) => (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    startX.current = event.clientX;
    startWidth.current = width;
    setDragging(kind);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };
  useEffect(() => {
    if (!dragging) return;
    const move = (event: MouseEvent) => {
      const delta = event.clientX - startX.current;
      if (dragging === 'ai') setAiPanelWidth(normalizeAiPanelWidth(startWidth.current - delta));
      if (dragging === 'chapter') {
        const nextWidth = navigationWidthUnified
          ? normalizeSharedWorkbenchLeftNavWidth(startWidth.current + delta, getChapterSidebarMaxWidth(), CHAPTER_SIDEBAR_MIN_WIDTH)
          : normalizeChapterSidebarWidth(startWidth.current + delta);
        setChapterSidebarWidth(nextWidth);
        if (navigationWidthUnified) setPublishedSidebarWidth(normalizePublishedSidebarWidth(nextWidth));
      }
      if (dragging === 'published') {
        const nextWidth = navigationWidthUnified
          ? normalizeSharedWorkbenchLeftNavWidth(startWidth.current + delta)
          : normalizePublishedSidebarWidth(startWidth.current + delta);
        setPublishedSidebarWidth(normalizePublishedSidebarWidth(nextWidth));
        if (navigationWidthUnified) setChapterSidebarWidth(normalizeChapterSidebarWidth(nextWidth));
      }
    };
    const up = () => {
      setDragging(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [dragging, navigationWidthUnified]);
  return {
    aiPanelWidth,
    chapterSidebarWidth,
    publishedSidebarWidth,
    handlePanelDragStart: begin('ai', aiPanelWidth),
    handleChapterSidebarDragStart: begin('chapter', chapterSidebarWidth),
    handlePublishedSidebarDragStart: begin('published', publishedSidebarWidth),
  };
}
