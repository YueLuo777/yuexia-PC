export const REPLACE_BODY_WARNING_THRESHOLD_KEY = 'xinyuexia_replace_body_warning_threshold';
export const DEFAULT_REPLACE_BODY_WARNING_THRESHOLD = 2000;
export const MAX_REPLACE_BODY_WARNING_THRESHOLD = 100000;

export function normalizeReplaceBodyWarningThreshold(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_REPLACE_BODY_WARNING_THRESHOLD;
  return Math.min(MAX_REPLACE_BODY_WARNING_THRESHOLD, Math.max(0, Math.round(parsed)));
}

export function readReplaceBodyWarningThreshold() {
  const stored = localStorage.getItem(REPLACE_BODY_WARNING_THRESHOLD_KEY);
  return stored === null ? DEFAULT_REPLACE_BODY_WARNING_THRESHOLD : normalizeReplaceBodyWarningThreshold(stored);
}

export function writeReplaceBodyWarningThreshold(value: unknown) {
  const normalized = normalizeReplaceBodyWarningThreshold(value);
  localStorage.setItem(REPLACE_BODY_WARNING_THRESHOLD_KEY, String(normalized));
  return normalized;
}

export function getReplaceBodyWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

export function shouldWarnBeforeReplacingBody(text: string, threshold = readReplaceBodyWarningThreshold()) {
  return threshold > 0 && getReplaceBodyWordCount(text) < threshold;
}
