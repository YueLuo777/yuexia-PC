export type StandardModeWorkCoverHistoryItem = {
  src: string;
  savedAt: number;
};

const STORAGE_PREFIX = 'xinyuexia_standard_work_cover_history_v1_';
const HISTORY_LIMIT = 8;

function getStorageKey(novelId: number) {
  return `${STORAGE_PREFIX}${novelId}`;
}

function isHistoryItem(value: unknown): value is StandardModeWorkCoverHistoryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<StandardModeWorkCoverHistoryItem>;
  return typeof item.src === 'string' && item.src.length > 0 && typeof item.savedAt === 'number';
}

export function readStandardModeWorkCoverHistory(novelId: number) {
  try {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey(novelId)) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem).slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function rememberPreviousStandardModeWorkCover(
  novelId: number,
  previousCover: string | undefined,
  nextCover: string | undefined,
  currentHistory = readStandardModeWorkCoverHistory(novelId),
) {
  if (!previousCover || previousCover === nextCover) return currentHistory;
  const nextHistory = [
    { src: previousCover, savedAt: Date.now() },
    ...currentHistory.filter((item) => item.src !== previousCover && item.src !== nextCover),
  ].slice(0, HISTORY_LIMIT);
  localStorage.setItem(getStorageKey(novelId), JSON.stringify(nextHistory));
  return nextHistory;
}
