import {
  BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
  BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
} from '../components/workbenchBrainstormState';

export const STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY =
  'xinyuexia_standard_brainstorm_preview_font_size_v1';
export const DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE = 15;

export function clampStandardBrainstormPreviewFontSize(value: number) {
  const normalized = Number.isFinite(value) ? Math.round(value) : DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE;
  return Math.min(BRAINSTORM_PREVIEW_MAX_FONT_SIZE, Math.max(BRAINSTORM_PREVIEW_MIN_FONT_SIZE, normalized));
}

export function readStandardBrainstormPreviewFontSize() {
  if (typeof localStorage === 'undefined') return DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE;
  const stored = localStorage.getItem(STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY);
  return stored === null
    ? DEFAULT_STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE
    : clampStandardBrainstormPreviewFontSize(Number(stored));
}

export function writeStandardBrainstormPreviewFontSize(value: number) {
  const next = clampStandardBrainstormPreviewFontSize(value);
  localStorage.setItem(STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY, String(next));
  return next;
}
