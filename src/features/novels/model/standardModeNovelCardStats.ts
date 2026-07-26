import type { Novel } from '@/features/novels/model/novelTypes';
import { isDetailOutlineLikeTab } from '@/features/workbench/components/workbenchLibraryTabs';
import { readWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';

export interface StandardModeNovelCardStats {
  outlineCount: number;
  chapterCount: number;
  wordCount: number;
}

export function formatNovelCardStatValue(value: number) {
  const safeValue = Math.max(0, Math.round(value));
  if (safeValue < 10_000) return safeValue.toLocaleString('zh-CN');
  if (safeValue < 100_000_000) {
    return `${(safeValue / 10_000).toFixed(safeValue < 1_000_000 ? 2 : 1).replace(/\.?0+$/, '')}万`;
  }
  return `${(safeValue / 100_000_000).toFixed(1).replace(/\.0$/, '')}亿`;
}

function readChapterCount(novelId: number) {
  try {
    const volumeMap = JSON.parse(localStorage.getItem('xinyuexia_volumes_v1') ?? '{}') as Record<string, unknown>;
    const volumes = volumeMap[String(novelId)];
    if (!Array.isArray(volumes)) return 0;
    return volumes.reduce((total, volume) => {
      if (!volume || typeof volume !== 'object') return total;
      const chapters = (volume as { chapters?: unknown }).chapters;
      return total + (Array.isArray(chapters) ? chapters.length : 0);
    }, 0);
  } catch {
    return 0;
  }
}

export function readStandardModeNovelCardStats(novel: Novel): StandardModeNovelCardStats {
  const outlineEntries = readWorkbenchLibraryEntries(`xinyuexia_workbench_outline_${novel.id}`);
  return {
    outlineCount: outlineEntries.filter(
      (entry) => !entry.deletedAt && isDetailOutlineLikeTab(entry.tab) && entry.content.trim().length > 0,
    ).length,
    chapterCount: readChapterCount(novel.id),
    wordCount: Math.max(0, novel.wordCount),
  };
}
