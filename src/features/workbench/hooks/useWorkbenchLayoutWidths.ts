import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  readSharedWorkbenchAiRightWidth,
  writeSharedWorkbenchAiRightWidth,
} from '../model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidth,
} from '../model/workbenchSharedLeftNavWidth';
import {
  CHAPTER_SIDEBAR_MIN_WIDTH,
  PUBLISHED_SIDEBAR_DEFAULT_WIDTH,
  getAiPanelMaxWidth,
  getChapterSidebarMaxWidth,
  normalizeAiPanelWidth,
  normalizeChapterSidebarWidth,
  normalizePublishedSidebarWidth,
  readWorkbenchChapterSidebarWidth,
} from '../components/workbenchPageSupport';

export function useWorkbenchLayoutWidths() {
  const [navigationWidthUnified, setNavigationWidthUnified] = useState(readSharedWorkbenchLeftNavWidthEnabled);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => readSharedWorkbenchAiRightWidth(getAiPanelMaxWidth()));
  const [chapterSidebarWidth, setChapterSidebarWidth] = useState(readWorkbenchChapterSidebarWidth);
  const [publishedSidebarWidth, setPublishedSidebarWidth] = useState(() =>
    normalizePublishedSidebarWidth(
      Number.parseInt(
        localStorage.getItem('xinyuexia_published_sidebar_width') ?? String(PUBLISHED_SIDEBAR_DEFAULT_WIDTH),
        10,
      ),
    ),
  );
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
      if (enabled) setChapterSidebarWidth(readWorkbenchChapterSidebarWidth());
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
    localStorage.setItem('xinyuexia_published_sidebar_width', String(publishedSidebarWidth));
  }, [publishedSidebarWidth]);
  useEffect(() => {
    const resize = () => {
      setAiPanelWidth((v) => normalizeAiPanelWidth(v));
      setChapterSidebarWidth((v) => normalizeChapterSidebarWidth(v));
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
      if (dragging === 'chapter') setChapterSidebarWidth(normalizeChapterSidebarWidth(startWidth.current + delta));
      if (dragging === 'published')
        setPublishedSidebarWidth(normalizePublishedSidebarWidth(startWidth.current + delta));
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
  }, [dragging]);
  return {
    aiPanelWidth,
    chapterSidebarWidth,
    publishedSidebarWidth,
    handlePanelDragStart: begin('ai', aiPanelWidth),
    handleChapterSidebarDragStart: begin('chapter', chapterSidebarWidth),
    handlePublishedSidebarDragStart: begin('published', publishedSidebarWidth),
  };
}
