export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_ai_panel_width';
export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT = 'xinyuexia:workbench-shared-ai-right-width';
export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT = 430;
export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN = 380;
export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX = 620;
export const WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT = {
  min: WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN,
  max: WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX,
};

export function normalizeSharedWorkbenchAiRightWidth(value: number, maxWidth = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX) {
  const effectiveMax =
    Number.isFinite(maxWidth) && maxWidth > 0 ? Math.round(maxWidth) : WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX;
  const effectiveMin = Math.min(WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN, effectiveMax);
  if (!Number.isFinite(value)) return Math.min(WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT, effectiveMax);
  return Math.max(effectiveMin, Math.min(effectiveMax, Math.round(value)));
}

export function readSharedWorkbenchAiRightWidth(maxWidth = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX) {
  try {
    const stored = Number(localStorage.getItem(WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY));
    return normalizeSharedWorkbenchAiRightWidth(
      Number.isFinite(stored) && stored > 0 ? stored : WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
      maxWidth,
    );
  } catch {
    return normalizeSharedWorkbenchAiRightWidth(WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT, maxWidth);
  }
}

export function writeSharedWorkbenchAiRightWidth(value: number, maxWidth = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MAX) {
  const normalized = normalizeSharedWorkbenchAiRightWidth(value, maxWidth);
  localStorage.setItem(WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY, String(normalized));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, { detail: { width: normalized } }));
  }
  return normalized;
}
