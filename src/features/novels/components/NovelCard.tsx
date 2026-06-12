import { Feather, MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  btnColors?: Record<string, 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'amber' | 'pink' | 'teal' | 'indigo' | 'gray'>;
}

interface NovelCardProps {
  novel: Novel;
  isSelected: boolean;
  settings: NovelCardSettings;
  onPrepareOpen?: (id: number) => void;
  onOpen: (id: number) => void;
  onRename: (id: number, title: string) => void;
  onCover: (id: number) => void;
  onExport: (id: number) => void;
  onDelete: (id: number) => void;
}

const widthMap = {
  small: 156,
  medium: 178,
  large: 200,
} as const;

const coverHeightMap = {
  small: 192,
  medium: 208,
  large: 236,
} as const;

const statFontMap = {
  small: 'text-xs',
  medium: 'text-[13px]',
  large: 'text-[15px]',
} as const;

export function NovelCard({ novel, isSelected, settings, onPrepareOpen, onOpen, onRename, onCover, onExport, onDelete }: NovelCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const btnOrder = settings.btnOrder?.length ? settings.btnOrder : ['重命名', '封面', '导出', '删除'];
  const statFont = statFontMap[settings.statFontSize ?? 'medium'];
  const menuItems = btnOrder.filter(Boolean);

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
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
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
        onOpen(novel.id);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onOpen(novel.id);
      }}
      className="group relative flex cursor-pointer flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#1e71ef]/35"
      style={{ width: widthMap[settings.cardWidth] }}
    >
      <div
        className={`xy-wa-book-cover ${novel.cover ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'} relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[4px] border shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition ${
          isSelected ? 'border-[#1e71ef] ring-2 ring-[#1e71ef]/20' : 'border-[#d8dde6] group-hover:border-[#9ebcf6]'
        }`}
        style={{
          height: coverHeightMap[settings.coverHeight],
        }}
      >
        {novel.cover ? (
          <img src={novel.cover} alt="封面" className="h-full w-full object-cover" />
        ) : (
          <Feather className="pointer-events-none absolute bottom-7 right-4 h-14 w-14 -rotate-12 text-[#4b8fe8]/35" strokeWidth={1.7} />
        )}
      </div>

      <div className="flex flex-col px-0.5 pb-1 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-[15px] font-medium leading-5 text-[#1f2933]" title={novel.title}>{novel.title}</h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
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
        <div className={`mt-1 truncate text-[#9aa3af] ${statFont}`}>
          {novel.wordCount} 字
        </div>
      </div>

      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%-36px)] z-20 w-28 overflow-hidden rounded-md border border-[#dce1e8] bg-white py-1 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {menuItems.map((label) => (
            <button
              key={label}
              role="menuitem"
              onClick={(event) => {
                actions[label]?.(event);
                setIsMenuOpen(false);
              }}
              className={`block h-8 w-full px-3 text-left text-[13px] transition-colors ${
                label === '删除' ? 'text-red-500 hover:bg-red-50' : 'text-[#586574] hover:bg-[#f2f6ff] hover:text-[#1e71ef]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
