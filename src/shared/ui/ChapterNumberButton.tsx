import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ChapterNumberButtonState = 'empty' | 'used' | 'hasOutline';

interface ChapterNumberButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  selected?: boolean;
  state?: ChapterNumberButtonState;
  showAlertDot?: boolean;
}

export const CHAPTER_NUMBER_GRID_STYLE = { gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' };
export const CHAPTER_NUMBER_BASE_CLASS =
  'relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block';

function getChapterNumberStateClass(state: ChapterNumberButtonState) {
  if (state === 'used') return 'xy-detail-outline-number-used hover:border-[#067B96] hover:bg-[#D3EEF5]';
  if (state === 'hasOutline') return 'xy-detail-outline-number-has-outline hover:border-[#08AACE]';
  return 'xy-detail-outline-number-no-outline hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#078fb0]';
}

export function ChapterNumberButton({
  children,
  selected = false,
  state = 'empty',
  showAlertDot = false,
  ...buttonProps
}: ChapterNumberButtonProps) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={[
        CHAPTER_NUMBER_BASE_CLASS,
        'xy-detail-outline-number-white-bg',
        getChapterNumberStateClass(state),
        selected ? 'xy-detail-outline-number-selected' : '',
      ].join(' ')}
    >
      {children}
      {showAlertDot ? (
        <span
          className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
          aria-label="未润色"
        />
      ) : null}
    </button>
  );
}
