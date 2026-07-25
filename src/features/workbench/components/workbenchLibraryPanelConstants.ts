import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN,
} from '@/features/workbench/model/workbenchSharedAiRightWidth';

export const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS =
  'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#AEE7F1] bg-[#CDEFF6] px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm transition-colors hover:bg-[#BFEAF3]';
export const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';
export const WORKBENCH_FOLDER_GROUP_COUNT_CLASS =
  'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';
export const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS =
  'min-h-[38px] w-full rounded-xl border border-transparent bg-white px-4 py-2 text-left text-sm font-black leading-5 shadow-sm';
export const WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS = `group cursor-default select-none ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} transition-[background-color,border-color,box-shadow,opacity,transform] duration-150`;
export const WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS = `flex items-center ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} text-gray-400`;
export const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS =
  'flex h-12 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3';
export const DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS = 'whitespace-nowrap text-sm font-bold text-gray-900';
export const DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS =
  'flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]';
export const DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS =
  'flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white transition-colors hover:bg-[#0798b8]';
export const DETAIL_OUTLINE_VOLUME_ROW_CLASS = WORKBENCH_FOLDER_GROUP_BUTTON_CLASS;
export const DETAIL_OUTLINE_VOLUME_ICON_CLASS = WORKBENCH_FOLDER_GROUP_ICON_CLASS;
export const DETAIL_OUTLINE_VOLUME_TITLE_CLASS = 'min-w-0 flex-1 truncate leading-none';
export const DETAIL_OUTLINE_VOLUME_COUNT_CLASS = WORKBENCH_FOLDER_GROUP_COUNT_CLASS;

export const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;
export const SETTING_LIBRARY_LEFT_WIDTH = 280;
export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 280;
export const SETTING_LIBRARY_LEFT_MAX_WIDTH = 640;
export const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 560;
export const SETTING_LIBRARY_RIGHT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
export const SETTING_LIBRARY_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;
export const OUTLINE_ACTION_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;
export const SETTING_LIBRARY_RIGHT_MAX_WIDTH = 620;
export const BRAINSTORM_PREVIEW_WIDTH = 520;
export const BRAINSTORM_PREVIEW_MIN_WIDTH = 320;
export const BRAINSTORM_PREVIEW_MAX_WIDTH = 760;
export const BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH = 280;
export const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;
export const BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH = 340;
export const BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH = 760;
export const BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH = 320;
