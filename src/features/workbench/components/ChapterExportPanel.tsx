import { useEffect, useMemo, useState } from 'react';

import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { WordCountText } from '@/shared/ui/WordCountText';

export type ChapterExportFormat = 'txt' | 'doc';

function getChapterExportTitle(item: { serialNumber: number; title: string }, workType: WorkbenchNovel['type']) {
  const chapterUnit = workType === 'script' ? '集' : '章';
  return `第${item.serialNumber}${chapterUnit}${item.title ? ` ${item.title}` : ''}`;
}

type ChapterExportPanelProps = {
  volumes: Volume[];
  workType: WorkbenchNovel['type'];
  getChapterWordCount: (chapterId: number) => number;
  onClose: () => void;
  onExport: (format: ChapterExportFormat, chapterIds: number[]) => void;
};

export function ChapterExportPanel({
  volumes,
  workType,
  getChapterWordCount,
  onClose,
  onExport,
}: ChapterExportPanelProps) {
  const [format, setFormat] = useState<ChapterExportFormat>('txt');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const chapterGroups = useMemo(
    () =>
      volumes.map((volume) => ({
        volume,
        chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber),
      })),
    [volumes],
  );
  const allChapterIds = useMemo(
    () => chapterGroups.flatMap((group) => group.chapters.map((chapter) => chapter.id)),
    [chapterGroups],
  );
  const chapterSignature = chapterGroups
    .map((group) => `${group.volume.id}:${group.chapters.map((chapter) => chapter.id).join(',')}`)
    .join('|');
  const selectedSet = new Set(selectedIds);
  const selectedWordCount = chapterGroups.reduce(
    (sum, group) =>
      sum +
      group.chapters.reduce(
        (innerSum, chapter) => (selectedSet.has(chapter.id) ? innerSum + getChapterWordCount(chapter.id) : innerSum),
        0,
      ),
    0,
  );
  const chapterUnit = workType === 'script' ? '集' : '章';

  useEffect(() => {
    setSelectedIds(allChapterIds);
    setNotice('');
  }, [allChapterIds, chapterSignature]);

  const normalizeSelectedIds = (ids: Set<number>) => allChapterIds.filter((chapterId) => ids.has(chapterId));

  const toggleAll = () => {
    setNotice('');
    setSelectedIds(selectedIds.length === allChapterIds.length ? [] : allChapterIds);
  };

  const toggleVolume = (chapterIds: number[]) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isFullSelected = chapterIds.every((chapterId) => next.has(chapterId));
      chapterIds.forEach((chapterId) => {
        if (isFullSelected) next.delete(chapterId);
        else next.add(chapterId);
      });
      return normalizeSelectedIds(next);
    });
  };

  const toggleChapter = (chapterId: number) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return normalizeSelectedIds(next);
    });
  };

  const submitExport = () => {
    if (selectedIds.length === 0) {
      setNotice('请至少选择一个章节。');
      return;
    }
    onExport(format, selectedIds);
    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-gray-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">选择要导出的章节</div>
            <div className="mt-1 text-xs text-gray-400">
              已选择 {selectedIds.length} 个{chapterUnit}，约 <WordCountText value={selectedWordCount} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['txt', 'doc'] as ChapterExportFormat[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormat(item)}
                className={`h-9 rounded-lg px-4 text-sm font-bold transition-colors ${
                  format === item
                    ? 'bg-brand text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-brand/50 hover:text-brand'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {allChapterIds.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
            当前作品还没有可导出的章节
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.length === allChapterIds.length}
                onChange={toggleAll}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm font-bold text-gray-800">全选 / 取消全选</span>
            </label>

            {chapterGroups.map(({ volume, chapters }) => {
              const volumeChapterIds = chapters.map((chapter) => chapter.id);
              const selectedCount = volumeChapterIds.filter((chapterId) => selectedSet.has(chapterId)).length;

              return (
                <section key={volume.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-brand-light/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCount === volumeChapterIds.length && volumeChapterIds.length > 0}
                      onChange={() => toggleVolume(volumeChapterIds)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-brand-dark">{volume.name}</span>
                    <span className="text-xs font-bold text-gray-500">
                      {selectedCount}/{chapters.length}
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 p-3">
                    {chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          selectedSet.has(chapter.id)
                            ? 'border-brand/40 bg-orange-50'
                            : 'border-gray-100 bg-white hover:border-brand/30 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet.has(chapter.id)}
                          onChange={() => toggleChapter(chapter.id)}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                          {getChapterExportTitle(chapter, workType)}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">
                          <WordCountText value={getChapterWordCount(chapter.id)} />
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-4">
        <div className="text-sm text-red-500">{notice}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submitExport}
            className="h-10 rounded-lg bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark"
          >
            开始导出
          </button>
        </div>
      </div>
    </div>
  );
}
