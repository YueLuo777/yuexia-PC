import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';

import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

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
const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 200;
const CHAPTER_SIDEBAR_BOTTOM_ROW_CLASS = 'flex items-center gap-1.5 border-t border-[#e6e8ec] px-2 py-2';
const CHAPTER_SIDEBAR_BOTTOM_BUTTON_CLASS =
  'flex h-8 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md px-1.5 text-sm leading-none text-white transition-colors';
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
  width = CHAPTER_SIDEBAR_DEFAULT_WIDTH,
}: ChapterSidebarProps) {
  const [chapterMenu, setChapterMenu] = useState<ChapterContextMenu>(emptyChapterMenu);
  const [volumeMenu, setVolumeMenu] = useState<VolumeContextMenu>(emptyVolumeMenu);
  const [isNonEmptyVolumePromptOpen, setIsNonEmptyVolumePromptOpen] = useState(false);
  const chapterUnit = workType === 'script' ? '集' : '章';
  const volumeUnit = workType === 'script' ? '卷' : '卷';
  const unpublishedCount = volumes.reduce(
    (sum, volume) => sum + volume.chapters.filter((chapter) => !chapter.isPublished).length,
    0,
  );

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

  const sortedUnpublishedChapters = (volume: Volume) =>
    [...volume.chapters]
      .filter((chapter) => !chapter.isPublished)
      .sort((a, b) => (sortAsc ? a.serialNumber - b.serialNumber : b.serialNumber - a.serialNumber));

  const handleDeleteVolume = (volumeId: number) => {
    const target = volumes.find((volume) => volume.id === volumeId);
    if (!target) return;
    if (target.chapters.length > 0) {
      setIsNonEmptyVolumePromptOpen(true);
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
    <aside className="flex shrink-0 flex-col border-r border-[#e1e5eb] bg-gray-50" style={{ width }}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3">
        <div className="flex items-center gap-2">
          <h2 className="whitespace-nowrap text-sm font-bold text-gray-900">未发布</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]">
            {unpublishedCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {workType !== 'script' && (
            <button
              onClick={onTogglePublished}
              className={CHAPTER_SIDEBAR_HEADER_ACTION_CLASS}
              title="已发布"
            >
              {showPublished ? '收回已发布' : '展开已发布'}
            </button>
          )}
        </div>
      </div>

      <div className="editor-scrollbar flex-1 overflow-y-auto px-1 py-2">
        {volumes.map((volume) => {
          const chapters = sortedUnpublishedChapters(volume);
          const selectedChapterIndex = chapters.findIndex((chapter) => chapter.isSelected);
          return (
            <div key={volume.id} className="mb-1">
              <div
                className={CHAPTER_NAV_VOLUME_ROW_CLASS}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setVolumeMenu({ visible: true, ...getContextMenuPoint(event), volumeId: volume.id });
                }}
              >
                <button
                  onClick={() => onToggleVolume(volume.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={volume.isExpanded}
                >
                  {volume.isExpanded ? (
                    <ChevronDown className={CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS} />
                  ) : (
                    <ChevronRight className={CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS} />
                  )}
                  <span className="min-w-0 flex-1 truncate leading-none">{volume.name}</span>
                  <span className={CHAPTER_NAV_VOLUME_COUNT_CLASS}>
                    {volume.chapters.length}
                    {chapterUnit}
                  </span>
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddChapter(volume.id);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-md bg-white/70 text-xl font-bold leading-none text-[#6f7e90] transition-colors hover:bg-white hover:text-[#08AACE]"
                  title={`新增${chapterUnit}`}
                >
                  +
                </button>
              </div>

              {volume.isExpanded && (
                <div className={CHAPTER_NAV_TREE_CLASS}>
                  {selectedChapterIndex >= 0 ? (
                    <span
                      aria-hidden="true"
                      data-chapter-selected-path="true"
                      className={CHAPTER_NAV_SELECTED_PATH_CLASS}
                      style={{ height: getChapterSelectedPathHeight(selectedChapterIndex) }}
                    />
                  ) : null}
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      aria-current={chapter.isSelected ? 'page' : undefined}
                      onClick={() => onSelectChapter(volume.id, chapter.id)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setChapterMenu({
                          visible: true,
                          ...getContextMenuPoint(event),
                          volumeId: volume.id,
                          chapterId: chapter.id,
                        });
                      }}
                      className={`xy-chapter-sidebar-row ${CHAPTER_NAV_ROW_BASE_CLASS} ${
                        chapter.isSelected
                          ? CHAPTER_NAV_ROW_SELECTED_CLASS
                          : CHAPTER_NAV_ROW_DEFAULT_CLASS
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={getChapterConnectorHorizontalClass(chapter.isSelected)}
                      />
                      <span className="flex-1 truncate whitespace-nowrap text-sm font-black text-inherit">
                        第{chapter.serialNumber}
                        {chapterUnit}
                        {chapter.title ? ` ${chapter.title}` : ''}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] font-black text-gray-400 transition-opacity group-hover:opacity-0">
                        {getChapterWordCount(chapter.id)}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePublish(volume.id, chapter.id);
                        }}
                        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded bg-[#08AACE] px-2 py-1 text-xs leading-none text-white opacity-0 transition-all hover:bg-[#0798b8] group-hover:opacity-100"
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

      <div className={CHAPTER_SIDEBAR_BOTTOM_ROW_CLASS}>
        <button
          onClick={onAddVolume}
          className={`${CHAPTER_SIDEBAR_BOTTOM_BUTTON_CLASS} bg-[#08AACE] hover:bg-[#0798b8]`}
          title={`新增${volumeUnit}`}
        >
          新增卷
        </button>
        <button
          onClick={onToggleSort}
          className={`${CHAPTER_SIDEBAR_BOTTOM_BUTTON_CLASS} bg-[#08AACE] hover:bg-[#0798b8]`}
        >
          {sortAsc ? '倒序' : '正序'}
        </button>
      </div>

      <div className="border-t border-[#e6e8ec] px-2 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportChapters}
            className={`${CHAPTER_SIDEBAR_BOTTOM_BUTTON_CLASS} bg-[#08AACE] hover:bg-[#0798b8]`}
          >
            导出章节
          </button>
          <button
            onClick={onOpenRecycle}
            className={`relative ${CHAPTER_SIDEBAR_BOTTOM_BUTTON_CLASS} bg-red-500 hover:bg-red-600`}
          >
            回收站
            {recycledCount > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />}
          </button>
        </div>
      </div>

      {chapterMenu.visible && (
        <div
          className={CHAPTER_CONTEXT_MENU_CLASS}
          style={{ left: chapterMenu.x, top: chapterMenu.y }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId)
                handleEditChapter(chapterMenu.volumeId, chapterMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            重命名
          </button>
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId)
                handleEditChapter(chapterMenu.volumeId, chapterMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            修改章节
          </button>
          <div className={CHAPTER_CONTEXT_MENU_DIVIDER_CLASS} />
          <button
            onClick={() => {
              if (chapterMenu.volumeId && chapterMenu.chapterId)
                handlePublish(chapterMenu.volumeId, chapterMenu.chapterId);
            }}
            className={CHAPTER_CONTEXT_MENU_ITEM_CLASS}
          >
            发布章节
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
              if (chapterMenu.volumeId && chapterMenu.chapterId)
                onDeleteChapter(chapterMenu.volumeId, chapterMenu.chapterId);
              setChapterMenu(emptyChapterMenu);
            }}
            className={CHAPTER_CONTEXT_MENU_DANGER_CLASS}
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

      <ConfirmDialog
        isOpen={isNonEmptyVolumePromptOpen}
        title="无法删除卷"
        description="该卷下还有章节，请先删除章节后再删除卷。"
        confirmText="确定"
        confirmVariant="warning"
        showCancel={false}
        onClose={() => setIsNonEmptyVolumePromptOpen(false)}
        onConfirm={() => setIsNonEmptyVolumePromptOpen(false)}
      />
    </aside>
  );
}
