import { Feather } from 'lucide-react';

import {
  NOVEL_CARD_WIDTHS,
  NOVEL_COVER_HEIGHTS,
  type NovelCardSettings,
} from '@/features/novels/components/NovelCard';
import type { Novel } from '@/features/novels/model/novelTypes';
import {
  formatNovelCardStatValue,
  type StandardModeNovelCardStats,
} from '@/features/novels/model/standardModeNovelCardStats';

interface StandardModeNovelCardProps {
  novel: Novel;
  settings: NovelCardSettings;
  defaultCoverSrc?: string;
  stats: StandardModeNovelCardStats;
  onPrepareOpen?: (id: number) => void;
  onOpenWorkbench: (id: number) => void;
}

export function StandardModeNovelCard({
  novel,
  settings,
  defaultCoverSrc,
  stats,
  onPrepareOpen,
  onOpenWorkbench,
}: StandardModeNovelCardProps) {
  const coverSrc = novel.cover || defaultCoverSrc;

  return (
    <article
      data-testid="standard-mode-novel-card"
      data-standard-mode-novel-card="true"
      className="group overflow-hidden rounded-[6px] border border-[#d8dde6] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.10)] transition-colors hover:border-[#9DDFEA]"
      style={{ width: NOVEL_CARD_WIDTHS[settings.cardWidth] }}
      onPointerEnter={() => onPrepareOpen?.(novel.id)}
      onFocus={() => onPrepareOpen?.(novel.id)}
    >
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden border-b border-[#d8dde6] bg-[#f4f7fb]"
        style={{ height: NOVEL_COVER_HEIGHTS[settings.coverHeight] }}
      >
        {coverSrc ? (
          <img src={coverSrc} alt={novel.cover ? `${novel.title}封面` : '默认封面'} className="h-full w-full object-cover" />
        ) : (
          <Feather className="h-14 w-14 -rotate-12 text-[#4b8fe8]/35" strokeWidth={1.7} />
        )}
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <h3 className="truncate text-[15px] font-semibold leading-5 text-[#1f2933]" title={novel.title}>
          {novel.title}
        </h3>
        <div className="mt-2 grid h-11 grid-cols-3" aria-label="作品统计">
          {[
            { label: '章纲数', value: stats.outlineCount },
            { label: '章节数', value: stats.chapterCount },
            { label: '总字数', value: stats.wordCount },
          ].map((item, index) => (
            <div
              key={item.label}
              data-standard-mode-novel-stat={item.label}
              className={`flex min-w-0 flex-col items-center justify-center px-1 ${index > 0 ? 'border-l border-slate-200' : ''}`}
            >
              <span
                className="block max-w-full overflow-hidden font-black leading-4 text-[#1f2933]"
                style={{ fontSize: item.value >= 10_000 ? 9 : 14 }}
              >
                {formatNovelCardStatValue(item.value)}
              </span>
              <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-[#8d98a6]">{item.label}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onOpenWorkbench(novel.id)}
          className="mt-2.5 h-9 w-full rounded-md border border-[#9DDFEA] bg-white text-sm font-semibold text-[#078FAB] transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD]"
        >
          进入工作台
        </button>
      </div>
    </article>
  );
}
