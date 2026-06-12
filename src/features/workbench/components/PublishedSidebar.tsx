import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';

import type { Volume } from '@/features/workbench/model/workbenchTypes';

const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#c7dcff] bg-[#eaf2ff] px-1 text-left text-[14px] font-medium text-[#1f2933] shadow-sm transition-colors hover:bg-[#dfeaff]';
const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#1e71ef]';
const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-[#6f7e90]';
const CHAPTER_CONTEXT_MENU_CLASS = 'fixed z-[100] w-[206px] overflow-visible rounded-[8px] border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)]';
const CHAPTER_CONTEXT_MENU_ITEM_CLASS = 'flex h-[42px] w-full items-center gap-3 px-3 text-left text-[15px] font-medium text-[#1f2933] transition-colors hover:bg-[#f5f7fa]';
const CHAPTER_CONTEXT_MENU_DANGER_CLASS = 'flex h-[42px] w-full items-center gap-3 px-3 text-left text-[15px] font-medium text-[#ff3b30] transition-colors hover:bg-[#fff1f0]';
const CHAPTER_CONTEXT_MENU_SUBMENU_CLASS = 'absolute left-[calc(100%+4px)] top-0 hidden w-[176px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)] group-hover:block';
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
  width = 190,
  onSelectChapter,
  onEditChapter,
  onUnpublishChapter,
  onDeleteChapter,
  getChapterWordCount,
}: PublishedSidebarProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; volumeId: number | null; chapterId: number | null }>(
    { visible: false, x: 0, y: 0, volumeId: null, chapterId: null },
  );
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

  const publishedVolumes = useMemo(() => (
    volumes.map((volume) => ({
      ...volume,
      chapters: volume.chapters.filter((chapter) => chapter.isPublished),
    }))
  ), [volumes]);

  const displayVolumes = useMemo(() => (
    publishedVolumes.map((volume) => ({
      ...volume,
      chapters: [...volume.chapters].sort((a, b) => (
        sortAsc ? a.serialNumber - b.serialNumber : b.serialNumber - a.serialNumber
      )),
    }))
  ), [publishedVolumes, sortAsc]);

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
          className="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          title={sortAsc ? '正序' : '倒序'}
        >
          {sortAsc ? '正序' : '倒序'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {displayVolumes.map((volume) => {
          const expanded = expandedIds.has(volume.id);
          const VolumeFolderIcon = expanded ? FolderOpen : Folder;

          return (
          <div key={volume.id} className="mb-1">
            <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
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
                <VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                <span className="min-w-0 flex-1 truncate leading-none">{volume.name}</span>
                <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{volume.chapters.length}章</span>
              </button>
            </div>

            {expanded && (
              <div className="mt-0.5 space-y-0.5">
                {volume.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`group relative flex items-center gap-2 rounded-md border-l-[3px] px-[26px] py-2 transition-colors ${
                      chapter.isSelected ? 'border-[#1e71ef] bg-[#d4e2f9]' : 'border-transparent hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectChapter(volume.id, chapter.id)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setContextMenu({ visible: true, ...getContextMenuPoint(event), volumeId: volume.id, chapterId: chapter.id });
                    }}
                  >
                    <span className={`flex-1 truncate whitespace-nowrap text-sm font-medium ${chapter.isSelected ? 'text-[#1f2933]' : 'text-gray-700'}`}>
                      第{chapter.serialNumber}章<span className="hidden">{chapter.title ? ` ${chapter.title}` : ''}</span>
                    </span>
                    <span className="shrink-0 text-xs text-gray-400 transition-opacity group-hover:opacity-0">
                      {getChapterWordCount(chapter.id)}
                    </span>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnpublishChapter(chapter.id);
                      }}
                      className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded bg-gray-400 px-2 py-1 text-xs leading-none text-white opacity-0 transition-all hover:bg-gray-500 group-hover:opacity-100"
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
              if (contextMenu.volumeId && contextMenu.chapterId) handleEditChapter(contextMenu.volumeId, contextMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            重命名
          </button>
          <button
            onClick={() => {
              if (contextMenu.volumeId && contextMenu.chapterId) handleEditChapter(contextMenu.volumeId, contextMenu.chapterId);
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
            <button
              type="button"
              className={`${CHAPTER_CONTEXT_MENU_ITEM_CLASS} bg-transparent`}
            >
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
              if (contextMenu.volumeId && contextMenu.chapterId) onDeleteChapter(contextMenu.volumeId, contextMenu.chapterId);
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
