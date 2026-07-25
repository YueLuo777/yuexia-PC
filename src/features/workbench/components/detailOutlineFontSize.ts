import { DETAIL_OUTLINE_MAX_FONT_SIZE, DETAIL_OUTLINE_MIN_FONT_SIZE } from './workbenchBrainstormState';

export function normalizeDetailOutlineFontSize(value: unknown, fallback: number) {
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(DETAIL_OUTLINE_MAX_FONT_SIZE, Math.max(DETAIL_OUTLINE_MIN_FONT_SIZE, numericValue));
}
