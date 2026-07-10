export type ContextMenuSize = { width: number; height: number };

export const CONTEXT_MENU_VIEWPORT_PADDING = 8;
export const SETTING_CATEGORY_CONTEXT_MENU_SIZE = { width: 220, height: 300 };
export const SETTING_ENTRY_CONTEXT_MENU_SIZE = { width: 180, height: 280 };
export const PROMPT_DISABLE_CONTEXT_MENU_SIZE = { width: 140, height: 72 };
export const DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE = { width: 136, height: 56 };

export function clampFixedMenuPosition(x: number, y: number, size: ContextMenuSize) {
  if (typeof window === 'undefined') return { left: x, top: y };
  return {
    left: Math.max(
      CONTEXT_MENU_VIEWPORT_PADDING,
      Math.min(x, window.innerWidth - size.width - CONTEXT_MENU_VIEWPORT_PADDING),
    ),
    top: Math.max(
      CONTEXT_MENU_VIEWPORT_PADDING,
      Math.min(y, window.innerHeight - size.height - CONTEXT_MENU_VIEWPORT_PADDING),
    ),
  };
}
