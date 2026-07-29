import { Check, ChevronRight, Feather, MoreHorizontal } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

import type { Novel } from '@/features/novels/model/novelTypes';

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
  small: 156,
  medium: 178,
  large: 200,
} as const;

export const NOVEL_COVER_HEIGHTS = {
  small: 192,
  medium: 208,
  large: 236,
} as const;

const statFontMap = {
  small: 'text-xs',
  medium: 'text-[13px]',
  large: 'text-[15px]',
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
  const statFont = statFontMap[settings.statFontSize ?? 'medium'];
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
      tabIndex={0}
      onPointerEnter={() => onPrepareOpen?.(novel.id)}
      onPointerDown={() => onPrepareOpen?.(novel.id)}
      onFocus={() => onPrepareOpen?.(novel.id)}
      onClick={() => {
        setIsMenuOpen(false);
        setIsMoveMenuOpen(false);
        onOpen(novel.id);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onOpen(novel.id);
      }}
      className="group relative flex cursor-pointer flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#1e71ef]/35"
      style={{ width: NOVEL_CARD_WIDTHS[settings.cardWidth] }}
    >
      <div
        className={`xy-wa-book-cover group/cover ${coverSrc ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'} relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[4px] border border-[#d8dde6] shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition group-hover:border-[#9ebcf6]`}
        style={{
          height: NOVEL_COVER_HEIGHTS[settings.coverHeight],
        }}
      >
        {coverSrc ? (
          <img src={coverSrc} alt={novel.cover ? '封面' : '默认封面'} className="h-full w-full object-cover" />
        ) : (
          <Feather
            className="pointer-events-none absolute bottom-7 right-4 h-14 w-14 -rotate-12 text-[#4b8fe8]/35"
            strokeWidth={1.7}
          />
        )}
        <div
          data-professional-workbench-overlay="true"
          onPointerEnter={() => onPrepareStandardWorkbench?.(novel.id)}
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/10 opacity-0 transition-opacity duration-150 group-hover/cover:pointer-events-auto group-hover/cover:opacity-100 group-focus-within/cover:pointer-events-auto group-focus-within/cover:opacity-100"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenStandardWorkbench(novel.id);
            }}
            onFocus={() => onPrepareStandardWorkbench?.(novel.id)}
            className="h-10 rounded-md border border-[#08AACE] bg-white/95 px-5 text-sm font-bold text-[#078FAB] shadow-[0_6px_18px_rgba(15,23,42,0.18)] transition-colors hover:bg-[#EAF9FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08AACE]/40"
          >
            进入工作台
          </button>
        </div>
      </div>

      <div className="flex flex-col px-0.5 pb-1 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-[15px] font-medium leading-5 text-[#1f2933]" title={novel.title}>
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
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#cfd6df] bg-white text-[#68727f] transition-colors hover:border-[#1e71ef] hover:text-[#1e71ef]"
            title="更多"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className={`mt-1 truncate text-[#9aa3af] ${statFont}`}>{novel.wordCount} 字</div>
      </div>

      {isMenuOpen ? (
        <div
          role="menu"
          aria-label="作品操作菜单"
          className="absolute right-0 top-[calc(100%-36px)] z-20 w-[222px] rounded-xl border border-slate-100 bg-white py-2 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
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
