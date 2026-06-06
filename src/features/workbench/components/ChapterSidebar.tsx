import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';

import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

interface ChapterSidebarProps {
  volumes: Volume[];
  sortAsc: boolean;
  recycledCount: number;
  workType: WorkbenchNovel['type'];
  showPublished: boolean;
  onTogglePublished: () => void;
  onToggleVolume: (volumeId: number) => void;
  onToggleSort: () => void;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onEditChapter?: (volumeId: number, chapterId: number) => void;
  onAddChapter: (volumeId: number) => void;
  onAddVolume: () => void;
  onDeleteVolume: (volumeId: number) => void;
  onDeleteChapter: (volumeId: number, chapterId: number) => void;
  onPublishChapter: (volumeId: number, chapterId: number) => void;
  onOpenRecycle: () => void;
  onExportChapters: () => void;
  getChapterWordCount: (chapterId: number) => number;
  width?: number;
}

interface ChapterContextMenu {
  visible: boolean;
  x: number;
  y: number;
  volumeId: number | null;
  chapterId: number | null;
}

interface VolumeContextMenu {
  visible: boolean;
  x: number;
  y: number;
  volumeId: number | null;
}

const emptyChapterMenu: ChapterContextMenu = { visible: false, x: 0, y: 0, volumeId: null, chapterId: null };
const emptyVolumeMenu: VolumeContextMenu = { visible: false, x: 0, y: 0, volumeId: null };

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

function renderPanelWidthBadge(width: number) {
  return (
    <span className="shrink-0 text-[11px] font-black leading-none text-emerald-600">
      {Math.round(width)}PX
    </span>
  );
}

export function ChapterSidebar({
  volumes,
  sortAsc,
  recycledCount,
  workType,
  showPublished,
  onTogglePublished,
  onToggleVolume,
  onToggleSort,
  onSelectChapter,
  onEditChapter,
  onAddChapter,
  onAddVolume,
  onDeleteVolume,
  onDeleteChapter,
  onPublishChapter,
  onOpenRecycle,
  onExportChapters,
  getChapterWordCount,
  width = 200,
}: ChapterSidebarProps) {
  const [chapterMenu, setChapterMenu] = useState<ChapterContextMenu>(emptyChapterMenu);
  const [volumeMenu, setVolumeMenu] = useState<VolumeContextMenu>(emptyVolumeMenu);
  const chapterUnit = workType === 'script' ? '集' : '章';
  const volumeUnit = workType === 'script' ? '卷' : '卷';
  const unpublishedCount = volumes.reduce((sum, volume) => sum + volume.chapters.filter((chapter) => !chapter.isPublished).length, 0);

  useEffect(() => {
    if (!chapterMenu.visible) return;
    const close = () => setChapterMenu(emptyChapterMenu);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [chapterMenu.visible]);

  useEffect(() => {
    if (!volumeMenu.visible) return;
    const close = () => setVolumeMenu(emptyVolumeMenu);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [volumeMenu.visible]);

  const sortedUnpublishedChapters = (volume: Volume) => (
    [...volume.chapters]
      .filter((chapter) => !chapter.isPublished)
      .sort((a, b) => (sortAsc ? a.serialNumber - b.serialNumber : b.serialNumber - a.serialNumber))
  );

  const handleDeleteVolume = (volumeId: number) => {
    const target = volumes.find((volume) => volume.id === volumeId);
    if (!target) return;
    if (target.chapters.length > 0) {
      window.alert('该卷下还有章节，请先删除章节');
      return;
    }
    onDeleteVolume(volumeId);
  };

  const handlePublish = (volumeId: number, chapterId: number) => {
    onPublishChapter(volumeId, chapterId);
    setChapterMenu(emptyChapterMenu);
  };

  const handleEditChapter = (volumeId: number, chapterId: number) => {
    (onEditChapter ?? onSelectChapter)(volumeId, chapterId);
    setChapterMenu(emptyChapterMenu);
  };

  return (
    <aside className="flex shrink-0 flex-col border-r border-gray-300 bg-white" style={{ width }}>
      <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="whitespace-nowrap text-sm font-bold text-gray-900">未发布</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand-dark">
            {unpublishedCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {renderPanelWidthBadge(width)}
          {workType !== 'script' && (
          <button
            onClick={onTogglePublished}
            className="flex items-center justify-center whitespace-nowrap rounded-md bg-orange-500 px-2 py-1 text-sm text-white transition-colors hover:bg-orange-600"
            title="已发布"
          >
            {showPublished ? '收回已发布' : '展开已发布'}
          </button>
          )}
        </div>
      </div>

      <div className="editor-scrollbar flex-1 overflow-y-auto px-2 py-2">
        {volumes.map((volume) => {
          const chapters = sortedUnpublishedChapters(volume);

          return (
            <div key={volume.id} className="mb-1">
              <div
                className="group flex h-[36px] items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setVolumeMenu({ visible: true, ...getContextMenuPoint(event), volumeId: volume.id });
                }}
              >
                <button onClick={() => onToggleVolume(volume.id)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                  {volume.isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                  )}
                  <span className="truncate text-sm font-medium text-brand-dark">{volume.name}</span>
                  <span className="ml-1 shrink-0 text-xs text-gray-400">{volume.chapters.length}{chapterUnit}</span>
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddChapter(volume.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded text-xl font-bold text-brand-dark transition-colors hover:bg-brand/20"
                  title={`新增${chapterUnit}`}
                >
                  +
                </button>
              </div>

              {volume.isExpanded && (
                <div className="ml-1 mt-0.5 space-y-0.5">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      onClick={() => onSelectChapter(volume.id, chapter.id)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setChapterMenu({ visible: true, ...getContextMenuPoint(event), volumeId: volume.id, chapterId: chapter.id });
                      }}
                      className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-left transition-colors ${
                        chapter.isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex-1 truncate whitespace-nowrap text-sm font-medium ${chapter.isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                        第{chapter.serialNumber}{chapterUnit}{chapter.title ? ` ${chapter.title}` : ''}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400 transition-opacity group-hover:opacity-0">
                        {getChapterWordCount(chapter.id)}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePublish(volume.id, chapter.id);
                        }}
                        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded bg-brand px-2 py-1 text-xs leading-none text-white opacity-0 transition-all hover:bg-brand-dark group-hover:opacity-100"
                        title={`发布${chapterUnit}`}
                      >
                        发布
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 border-t border-gray-100 px-2 py-2">
        <button onClick={onAddVolume} className="xy-ui125-plus-button" title={`新增${volumeUnit}`}>
          <Plus />
        </button>
        <button onClick={onToggleSort} className="flex-1 whitespace-nowrap rounded-md bg-brand px-1 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark">
          {sortAsc ? '倒序' : '正序'}
        </button>
      </div>

      <div className="border-t border-gray-200 p-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportChapters}
            className="flex-1 whitespace-nowrap rounded-md bg-[#0695B5] px-1.5 py-1.5 text-sm text-white transition-colors hover:bg-[#057f9a]"
          >
            导出章节
          </button>
          <button
            onClick={onOpenRecycle}
            className="relative flex-1 whitespace-nowrap rounded-md bg-red-500 px-1.5 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
          >
            回收站
            {recycledCount > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />}
          </button>
        </div>
      </div>

      {chapterMenu.visible && (
        <div
          className="fixed z-[100] min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ left: chapterMenu.x, top: chapterMenu.y }}
        >
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId) handleEditChapter(chapterMenu.volumeId, chapterMenu.chapterId);
            }}
            className="w-full px-3 py-2 text-left text-base text-gray-700 transition-colors hover:bg-gray-50"
          >
            修改章节
          </button>
          <div className="mx-2 h-px bg-gray-100" />
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId) handlePublish(chapterMenu.volumeId, chapterMenu.chapterId);
            }}
            className="w-full px-3 py-2 text-left text-base text-brand transition-colors hover:bg-brand-light"
          >
            发布章节
          </button>
          <div className="mx-2 h-px bg-gray-100" />
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId) onDeleteChapter(chapterMenu.volumeId, chapterMenu.chapterId);
              setChapterMenu(emptyChapterMenu);
            }}
            className="w-full px-3 py-2 text-left text-base text-red-500 transition-colors hover:bg-red-50"
          >
            删除章节
          </button>
        </div>
      )}

      {volumeMenu.visible && (
        <div
          className="fixed z-[100] min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ left: volumeMenu.x, top: volumeMenu.y }}
        >
          <button
            onClick={() => {
              onAddVolume();
              setVolumeMenu(emptyVolumeMenu);
            }}
            className="w-full px-3 py-2 text-left text-base text-brand transition-colors hover:bg-brand-light"
          >
            新增卷
          </button>
          <div className="mx-2 h-px bg-gray-100" />
          <button
            onClick={() => {
              if (volumeMenu.volumeId) handleDeleteVolume(volumeMenu.volumeId);
              setVolumeMenu(emptyVolumeMenu);
            }}
            className="w-full px-3 py-2 text-left text-base text-red-500 transition-colors hover:bg-red-50"
          >
            删除卷
          </button>
        </div>
      )}
    </aside>
  );
}
