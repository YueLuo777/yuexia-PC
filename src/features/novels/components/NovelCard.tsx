import { Check, ChevronRight, Feather, MoreHorizontal } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

import type { Novel } from '@/features/novels/model/novelTypes';
import {
  formatNovelCardStatValue,
  type StandardModeNovelCardStats,
} from '@/features/novels/model/standardModeNovelCardStats';

export interface NovelCardSettings {
  cardWidth: 'small' | 'medium' | 'large';
  coverHeight: 'small' | 'medium' | 'large';
  statFontSize?: 'small' | 'medium' | 'large';
  buttonFontSize?: 'small' | 'medium' | 'large';
  buttonFontWeight?: 'normal' | 'bold';
  btnPerRow?: 2 | 3;
  btnRows?: 1 | 2 | 3;
  btnOrder?: string[];
  btnColors?: Record<
    string,
    'green' | 'orange' | 'blue' | 'red' | 'purple' | 'amber' | 'pink' | 'teal' | 'indigo' | 'gray'
  >;
}

interface NovelCardProps {
  novel: Novel;
  settings: NovelCardSettings;
  defaultCoverSrc?: string;
  stats: StandardModeNovelCardStats;
  categories: string[];
  onPrepareOpen?: (id: number) => void;
  onPrepareStandardWorkbench?: (id: number) => void;
  onOpen: (id: number) => void;
  onOpenStandardWorkbench: (id: number) => void;
  onRename: (id: number, title: string) => void;
  onCover: (id: number) => void;
  onExport: (id: number) => void;
  onMoveToCategory: (id: number, category: string) => void;
  onDelete: (id: number) => void;
}

export const NOVEL_CARD_WIDTHS = {
  small: 200,
  medium: 220,
  large: 238,
} as const;

export const NOVEL_COVER_HEIGHTS = {
  small: 240,
  medium: 264,
  large: 286,
} as const;

function getMenuLabel(label: string) {
  if (label === '封面') return '书封管理';
  if (label === '删除') return '移入回收站';
  return label;
}

export function NovelCard({
  novel,
  settings,
  defaultCoverSrc,
  stats,
  categories,
  onPrepareOpen,
  onPrepareStandardWorkbench,
  onOpen,
  onOpenStandardWorkbench,
  onRename,
  onCover,
  onExport,
  onMoveToCategory,
  onDelete,
}: NovelCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const btnOrder = settings.btnOrder?.length ? settings.btnOrder : ['重命名', '封面', '导出', '删除'];
  const configuredMenuItems = btnOrder.filter((label) => Boolean(label) && label !== '移入');
  const deleteItemIndex = configuredMenuItems.indexOf('删除');
  const menuItems =
    deleteItemIndex >= 0
      ? [...configuredMenuItems.slice(0, deleteItemIndex), '移入', ...configuredMenuItems.slice(deleteItemIndex)]
      : [...configuredMenuItems, '移入'];
  const moveCategories = Array.from(new Set([...categories, novel.category].filter(Boolean)));
  const coverSrc = novel.cover || (novel.type === 'novel' ? defaultCoverSrc : undefined);

  const actions: Record<string, (event: React.MouseEvent) => void> = {
    重命名: (event) => {
      event.stopPropagation();
      onRename(novel.id, novel.title);
    },
    封面: (event) => {
      event.stopPropagation();
      onCover(novel.id);
    },
    导出: (event) => {
      event.stopPropagation();
      onExport(novel.id);
    },
    删除: (event) => {
      event.stopPropagation();
      onDelete(novel.id);
    },
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cardRef.current?.contains(target)) return;
      setIsMenuOpen(false);
      setIsMoveMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsMoveMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isMenuOpen]);

  return (
    <article
      ref={cardRef}
      className="group relative flex shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-[#9DDFEA]"
      style={{ width: NOVEL_CARD_WIDTHS[settings.cardWidth] }}
    >
      <button
        type="button"
        aria-label={`点击《${novel.title}》封面进入标准工作台`}
        onClick={() => onOpenStandardWorkbench(novel.id)}
        onPointerEnter={() => onPrepareStandardWorkbench?.(novel.id)}
        onPointerDown={() => onPrepareStandardWorkbench?.(novel.id)}
        onFocus={() => onPrepareStandardWorkbench?.(novel.id)}
        className={`xy-wa-book-cover ${coverSrc ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'} relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-t-lg border-b border-slate-200 bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#08AACE]/40`}
        style={{
          height: NOVEL_COVER_HEIGHTS[settings.coverHeight],
        }}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={novel.cover ? '封面' : '默认封面'}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <Feather
            className="pointer-events-none absolute bottom-7 right-4 h-14 w-14 -rotate-12 text-[#4b8fe8]/35"
            strokeWidth={1.7}
          />
        )}
      </button>

      <div className="flex flex-col px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-base font-black text-slate-900" title={novel.title}>
            {novel.title}
          </h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (isMenuOpen) setIsMoveMenuOpen(false);
              setIsMenuOpen((prev) => !prev);
            }}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:border-[#08AACE] hover:text-[#078FAB]"
            title="更多"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400" aria-label="作品统计">
          <span>{stats.chapterCount}章</span>
          <span>{formatNovelCardStatValue(stats.wordCount)}字</span>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-b-lg border-t border-slate-200">
        <button
          type="button"
          aria-label={`进入《${novel.title}》标准工作台`}
          onClick={() => onOpenStandardWorkbench(novel.id)}
          onPointerEnter={() => onPrepareStandardWorkbench?.(novel.id)}
          onFocus={() => onPrepareStandardWorkbench?.(novel.id)}
          className="h-11 whitespace-nowrap bg-slate-50 text-xs font-black text-[#078FAB] transition-colors hover:bg-[#EAF9FD]"
        >
          进入标准工作台
        </button>
        <button
          type="button"
          aria-label={`进入《${novel.title}》专业工作台`}
          onClick={() => onOpen(novel.id)}
          onPointerEnter={() => onPrepareOpen?.(novel.id)}
          onFocus={() => onPrepareOpen?.(novel.id)}
          className="h-11 whitespace-nowrap border-l border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition-colors hover:bg-slate-100"
        >
          进入专业工作台
        </button>
      </div>

      {isMenuOpen ? (
        <div
          role="menu"
          aria-label="作品操作菜单"
          className="absolute left-0 z-20 w-[222px] rounded-xl border border-slate-100 bg-white py-2 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
          style={{ top: NOVEL_COVER_HEIGHTS[settings.coverHeight] + 42 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-3 pb-2 pt-1">
            <div className="text-[13px] font-medium text-[#8b95a1]">最近更新：{novel.lastModifiedAt || '暂无记录'}</div>
            <div className="mt-1 truncate text-[13px] font-medium text-[#8b95a1]">
              当前分类：{novel.category || '未分类'}
            </div>
          </div>
          <div className="mx-1 border-t border-slate-200" />
          {menuItems.map((label) => (
            <Fragment key={label}>
              {(label === '移入' || label === '删除') && <div className="mx-1 border-t border-slate-200" />}
              {label === '移入' ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsMoveMenuOpen(true)}
                  onMouseLeave={() => setIsMoveMenuOpen(false)}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={isMoveMenuOpen}
                    onFocus={() => setIsMoveMenuOpen(true)}
                    className="flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-[14px] font-medium text-[#3d4856] transition-colors hover:bg-[#f2f3f5]"
                  >
                    <span>移入分类</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  {isMoveMenuOpen ? (
                    <div
                      role="menu"
                      aria-label="分类选择"
                      className="absolute left-[calc(100%-1px)] top-0 z-30 w-[212px] rounded-xl border border-slate-100 bg-white py-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
                    >
                      {moveCategories.map((category) => {
                        const isCurrent = category === novel.category;
                        return (
                          <button
                            key={category}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isCurrent}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (!isCurrent) onMoveToCategory(novel.id, category);
                            }}
                            className={`flex h-10 w-full items-center justify-between gap-3 px-4 text-left text-[14px] font-medium transition-colors ${
                              isCurrent ? 'bg-[#f2f6ff] font-bold text-[#126df5]' : 'text-[#3d4856] hover:bg-[#f4f7fb]'
                            }`}
                          >
                            <span className="min-w-0 truncate">{category}</span>
                            {isCurrent ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  role="menuitem"
                  onClick={(event) => {
                    actions[label]?.(event);
                    setIsMenuOpen(false);
                    setIsMoveMenuOpen(false);
                  }}
                  className={`block h-11 w-full rounded-md px-3 text-left text-[14px] font-medium transition-colors ${
                    label === '删除' ? 'text-red-500 hover:bg-red-50' : 'text-[#3d4856] hover:bg-[#f2f3f5]'
                  }`}
                >
                  {getMenuLabel(label)}
                </button>
              )}
            </Fragment>
          ))}
        </div>
      ) : null}
    </article>
  );
}
