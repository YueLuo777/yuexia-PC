export const CHAPTER_NAV_VOLUME_ROW_CLASS =
  'group flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-[#AEE7F1] bg-[#CDEFF6] px-2 text-left text-sm font-black text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-[#BFEAF3]';

export const CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS = 'h-4 w-4 shrink-0 text-[#08AACE]';
export const CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS = 'h-4 w-4 shrink-0 text-slate-400';
export const CHAPTER_NAV_VOLUME_COUNT_CLASS =
  'rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-400';

export const CHAPTER_SIDEBAR_HEADER_ACTION_CLASS =
  'flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 text-sm text-white transition-colors hover:bg-[#0798b8]';

export const CHAPTER_NAV_TREE_CLASS =
  "relative mt-1 space-y-px pl-6 before:absolute before:bottom-5 before:left-3 before:top-0 before:w-px before:bg-[#7DCDDC] before:content-['']";
export const CHAPTER_NAV_SELECTED_BORDER_CLASS = 'border-[#078FAE]';
export const CHAPTER_NAV_SELECTED_LINE_CLASS = 'bg-[#078FAE]';
export const CHAPTER_NAV_ROW_BASE_CLASS =
  'group relative flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-md border-2 px-3 py-2 text-left text-xs font-bold transition-colors';
export const CHAPTER_NAV_ROW_SELECTED_CLASS =
  `[--tw-border-opacity:1] [--tw-bg-opacity:1] ${CHAPTER_NAV_SELECTED_BORDER_CLASS} bg-white text-slate-700`;
export const CHAPTER_NAV_ROW_DEFAULT_CLASS =
  'border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white';

const CHAPTER_NAV_CONNECTOR_HORIZONTAL_BASE_CLASS =
  'pointer-events-none absolute left-[-14px] top-1/2 h-px w-3';
const CHAPTER_NAV_CONNECTOR_HORIZONTAL_DEFAULT_CLASS =
  `${CHAPTER_NAV_CONNECTOR_HORIZONTAL_BASE_CLASS} bg-[#9ADFEA]`;
const CHAPTER_NAV_CONNECTOR_HORIZONTAL_SELECTED_CLASS =
  `${CHAPTER_NAV_CONNECTOR_HORIZONTAL_BASE_CLASS} ${CHAPTER_NAV_SELECTED_LINE_CLASS}`;

export const CHAPTER_NAV_SELECTED_PATH_CLASS =
  `pointer-events-none absolute left-3 top-0 z-[1] w-px ${CHAPTER_NAV_SELECTED_LINE_CLASS}`;

export function getChapterConnectorHorizontalClass(selected: boolean) {
  return selected
    ? CHAPTER_NAV_CONNECTOR_HORIZONTAL_SELECTED_CLASS
    : CHAPTER_NAV_CONNECTOR_HORIZONTAL_DEFAULT_CLASS;
}

export function getChapterSelectedPathHeight(selectedIndex: number) {
  const rowHeight = 40;
  const rowGap = 1;
  return selectedIndex * (rowHeight + rowGap) + rowHeight / 2;
}
