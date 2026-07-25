import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';

import type { Volume } from '@/features/workbench/model/workbenchTypes';

import {
  CHAPTER_NAV_ROW_BASE_CLASS,
  CHAPTER_NAV_ROW_DEFAULT_CLASS,
  CHAPTER_NAV_ROW_SELECTED_CLASS,
  CHAPTER_NAV_SELECTED_PATH_CLASS,
  CHAPTER_NAV_TREE_CLASS,
  CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS,
  CHAPTER_NAV_VOLUME_COUNT_CLASS,
  CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS,
  CHAPTER_NAV_VOLUME_ROW_CLASS,
  CHAPTER_SIDEBAR_HEADER_ACTION_CLASS,
  getChapterConnectorHorizontalClass,
  getChapterSelectedPathHeight,
} from './chapterNavigationStyles';

const CHAPTER_CONTEXT_MENU_CLASS =
  'fixed z-[100] w-[136px] overflow-visible rounded-[8px] border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)]';
const CHAPTER_CONTEXT_MENU_ITEM_CLASS =
  'flex h-[42px] w-full items-center gap-3 px-3 text-left text-[15px] font-medium text-[#1f2933] transition-colors hover:bg-[#f5f7fa]';
const CHAPTER_CONTEXT_MENU_DANGER_CLASS =
  'flex h-[42px] w-full items-center gap-3 px-3 text-left text-[15px] font-medium text-[#ff3b30] transition-colors hover:bg-[#fff1f0]';
const CHAPTER_CONTEXT_MENU_SUBMENU_CLASS =
  'absolute left-[calc(100%+4px)] top-0 hidden w-[176px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)] group-hover:block';
const CHAPTER_CONTEXT_MENU_DIVIDER_CLASS = 'mx-3 h-px bg-[#edf0f2]';

function getContextMenuPoint(event: ReactMouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  let container: HTMLElement | null = target;
  while (container && window.getComputedStyle(container).transform === 'none') {
    container = container.parentElement;
  }

  if (!container) return { x: event.clientX, y: event.clientY };

  const rect = container.getBoundingClientRect();
  const scaleX = rect.width / container.offsetWidth || 1;
  const scaleY = rect.height / container.offsetHeight || scaleX;
  return {
    x: (event.clientX - rect.left) / scaleX,
    y: (event.clientY - rect.top) / scaleY,
  };
}

interface PublishedSidebarProps {
  volumes: Volume[];
  width?: number;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onEditChapter?: (volumeId: number, chapterId: number) => void;
  onUnpublishChapter: (chapterId: number) => void;
  onDeleteChapter: (volumeId: number, chapterId: number) => void;
  getChapterWordCount: (chapterId: number) => number;
}

export function PublishedSidebar({
  volumes,
  width = 170,
  onSelectChapter,
  onEditChapter,
  onUnpublishChapter,
  onDeleteChapter,
  getChapterWordCount,
}: PublishedSidebarProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    volumeId: number | null;
    chapterId: number | null;
  }>({ visible: false, x: 0, y: 0, volumeId: null, chapterId: null });
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(volumes.filter((volume) => volume.isExpanded).map((volume) => volume.id)),
  );

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => {
        if (!next.has(volume.id) && volume.isExpanded) next.add(volume.id);
      });
      return next;
    });
  }, [volumes]);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => setContextMenu({ visible: false, x: 0, y: 0, volumeId: null, chapterId: null });
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu.visible]);

  const publishedVolumes = useMemo(
    () =>
      volumes.map((volume) => ({
        ...volume,
        chapters: volume.chapters.filter((chapter) => chapter.isPublished),
      })),
    [volumes],
  );

  const displayVolumes = useMemo(
    () =>
      publishedVolumes.map((volume) => ({
        ...volume,
        chapters: [...volume.chapters].sort((a, b) =>
          sortAsc ? a.serialNumber - b.serialNumber : b.serialNumber - a.serialNumber,
        ),
      })),
    [publishedVolumes, sortAsc],
  );

  const totalChapters = displayVolumes.reduce((sum, volume) => sum + volume.chapters.length, 0);

  const handleEditChapter = (volumeId: number, chapterId: number) => {
    (onEditChapter ?? onSelectChapter)(volumeId, chapterId);
    setContextMenu({ visible: false, x: 0, y: 0, volumeId: null, chapterId: null });
  };

  return (
    <aside className="flex shrink-0 flex-col border-r border-gray-300 bg-white" style={{ width }}>
      <div className="flex h-[42px] items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">已发布</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand-dark">
            {totalChapters}
          </span>
        </div>
        <button
          onClick={() => setSortAsc((prev) => !prev)}
          className={CHAPTER_SIDEBAR_HEADER_ACTION_CLASS}
          title={sortAsc ? '正序' : '倒序'}
        >
          {sortAsc ? '正序' : '倒序'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {displayVolumes.map((volume) => {
          const expanded = expandedIds.has(volume.id);
          const selectedChapterIndex = volume.chapters.findIndex((chapter) => chapter.isSelected);
          return (
            <div key={volume.id} className="mb-1">
              <div className={CHAPTER_NAV_VOLUME_ROW_CLASS}>
                <button
                  onClick={() => {
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(volume.id)) next.delete(volume.id);
                      else next.add(volume.id);
                      return next;
                    });
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={expanded}
                >
                  {expanded ? (
                    <ChevronDown className={CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS} />
                  ) : (
                    <ChevronRight className={CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS} />
                  )}
                  <span className="min-w-0 flex-1 truncate leading-none">{volume.name}</span>
                  <span className={CHAPTER_NAV_VOLUME_COUNT_CLASS}>{volume.chapters.length}章</span>
                </button>
              </div>

              {expanded && (
                <div className={CHAPTER_NAV_TREE_CLASS}>
                  {selectedChapterIndex >= 0 ? (
                    <span
                      aria-hidden="true"
                      data-chapter-selected-path="true"
                      className={CHAPTER_NAV_SELECTED_PATH_CLASS}
                      style={{ height: getChapterSelectedPathHeight(selectedChapterIndex) }}
                    />
                  ) : null}
                  {volume.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      aria-current={chapter.isSelected ? 'page' : undefined}
                      className={`${CHAPTER_NAV_ROW_BASE_CLASS} ${
                        chapter.isSelected
                          ? CHAPTER_NAV_ROW_SELECTED_CLASS
                          : CHAPTER_NAV_ROW_DEFAULT_CLASS
                      }`}
                      onClick={() => onSelectChapter(volume.id, chapter.id)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setContextMenu({
                          visible: true,
                          ...getContextMenuPoint(event),
                          volumeId: volume.id,
                          chapterId: chapter.id,
                        });
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={getChapterConnectorHorizontalClass(chapter.isSelected)}
                      />
                      <span
                        className="flex-1 truncate whitespace-nowrap text-sm font-black text-inherit"
                      >
                        第{chapter.serialNumber}章{chapter.title ? ` ${chapter.title}` : ''}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] font-black text-gray-400 transition-opacity group-hover:opacity-0">
                        {getChapterWordCount(chapter.id)}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onUnpublishChapter(chapter.id);
                        }}
                        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded bg-[#08AACE] px-2 py-1 text-xs leading-none text-white opacity-0 transition-all hover:bg-[#0798b8] group-hover:opacity-100"
                      >
                        撤回
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {displayVolumes.every((volume) => volume.chapters.length === 0) && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <p className="text-xs">暂无已发布章节</p>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div
          className={CHAPTER_CONTEXT_MENU_CLASS}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            onClick={() => {
              if (contextMenu.volumeId && contextMenu.chapterId)
                handleEditChapter(contextMenu.volumeId, contextMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            重命名
          </button>
          <button
            onClick={() => {
              if (contextMenu.volumeId && contextMenu.chapterId)
                handleEditChapter(contextMenu.volumeId, contextMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            修改章节
          </button>
          <div className={CHAPTER_CONTEXT_MENU_DIVIDER_CLASS} />
          <button
            onClick={() => {
              if (contextMenu.chapterId) onUnpublishChapter(contextMenu.chapterId);
              setContextMenu({ visible: false, x: 0, y: 0, volumeId: null, chapterId: null });
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            撤回章节
          </button>
          <div className="group relative">
            <button type="button" className={`${CHAPTER_CONTEXT_MENU_ITEM_CLASS} bg-transparent`}>
              <span className="min-w-0 flex-1">移入分组</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#c3c9d2]" />
            </button>
            <div className={CHAPTER_CONTEXT_MENU_SUBMENU_CLASS}>
              <button
                type="button"
                disabled
                className="flex h-[42px] w-full items-center px-4 text-left text-[15px] font-medium text-[#8d98a6]"
              >
                暂留选项
              </button>
            </div>
          </div>
          <div className={CHAPTER_CONTEXT_MENU_DIVIDER_CLASS} />
          <button
            onClick={() => {
              if (contextMenu.volumeId && contextMenu.chapterId)
                onDeleteChapter(contextMenu.volumeId, contextMenu.chapterId);
              setContextMenu({ visible: false, x: 0, y: 0, volumeId: null, chapterId: null });
            }}
            className={CHAPTER_CONTEXT_MENU_DANGER_CLASS}
          >
            删除章节
          </button>
        </div>
      )}
    </aside>
  );
}
