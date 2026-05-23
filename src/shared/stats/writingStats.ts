const WRITING_STATS_KEY = 'xinyuexia_writing_daily_stats_v1';

export const WRITING_STATS_UPDATED_EVENT = 'xinyuexia_writing_stats_updated';

type DailyWritingStats = Record<string, number>;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readDailyStats(): DailyWritingStats {
  try {
    const parsed = JSON.parse(localStorage.getItem(WRITING_STATS_KEY) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value))) : 0]),
    );
  } catch {
    return {};
  }
}

function writeDailyStats(stats: DailyWritingStats) {
  localStorage.setItem(WRITING_STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent(WRITING_STATS_UPDATED_EVENT));
}

export function recordWritingWords(delta: number, date = new Date()) {
  const words = Math.max(0, Math.round(delta));
  if (words <= 0) return;
  const key = getLocalDateKey(date);
  const stats = readDailyStats();
  stats[key] = (stats[key] ?? 0) + words;
  writeDailyStats(stats);
}

export function readWritingSummary(now = new Date()) {
  const stats = readDailyStats();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  const monthPrefix = getLocalDateKey(now).slice(0, 7);

  return {
    yesterdayWords: stats[yesterdayKey] ?? 0,
    monthWords: Object.entries(stats).reduce((sum, [key, value]) => (
      key.startsWith(monthPrefix) ? sum + value : sum
    ), 0),
  };
}
