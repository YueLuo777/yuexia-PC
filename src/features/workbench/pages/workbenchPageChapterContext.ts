import type { WorkbenchLinkedContextItem } from '@/features/workbench/components/WorkbenchAIPanel';
import type { ContextChapterPair } from '@/features/workbench/components/workbenchPageSupport';
import { getContextEntrySerial } from '@/features/workbench/model/workbenchContextModel';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';

type SelectedChapter = { chapter: Chapter } | null;

interface BuildWorkbenchPageChapterContextOptions {
  volumes: Volume[];
  selectedChapter: SelectedChapter;
  outlineContextItems: WorkbenchLinkedContextItem[];
  summaryContextItems: WorkbenchLinkedContextItem[];
  readContent: (chapterId: number) => string;
}

export function buildWorkbenchPageChapterContext({
  volumes,
  selectedChapter,
  outlineContextItems,
  summaryContextItems,
  readContent,
}: BuildWorkbenchPageChapterContextOptions) {
  const selectedChapterSerialNumber = selectedChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
  const chapterContextItems: WorkbenchLinkedContextItem[] = volumes.flatMap((volume) =>
    volume.chapters
      .filter((chapter) => chapter.serialNumber <= selectedChapterSerialNumber)
      .map((chapter) => ({
        id: `chapter:${chapter.id}`,
        source: 'chapter' as const,
        group: volume.name,
        title: chapter.title || `第${chapter.serialNumber}章`,
        content: readContent(chapter.id),
      })),
  );
  const outlineItemBySerial = new Map<number, WorkbenchLinkedContextItem>();
  outlineContextItems.forEach((item) => {
    const serial = getContextEntrySerial(item.title);
    if (serial && !outlineItemBySerial.has(serial)) outlineItemBySerial.set(serial, item);
  });
  const summaryItemBySerial = new Map<number, WorkbenchLinkedContextItem>();
  summaryContextItems.forEach((item) => {
    const serial = getContextEntrySerial(item.title);
    if (serial && !summaryItemBySerial.has(serial)) summaryItemBySerial.set(serial, item);
  });
  const contextChapterRows: ContextChapterPair[] = volumes
    .flatMap((volume) =>
      [...volume.chapters]
        .filter((chapter) => chapter.serialNumber <= selectedChapterSerialNumber)
        .sort((left, right) => right.serialNumber - left.serialNumber)
        .map((chapter) => ({
          volumeId: volume.id,
          volumeName: volume.name,
          chapterId: chapter.id,
          serialNumber: chapter.serialNumber,
          title: chapter.title,
          isCurrent: chapter.id === selectedChapter?.chapter.id,
          chapterItem: chapterContextItems.find((item) => item.id === `chapter:${chapter.id}`) ?? {
            id: `chapter:${chapter.id}`,
            source: 'chapter' as const,
            group: volume.name,
            title: chapter.title || `第${chapter.serialNumber}章`,
            content: readContent(chapter.id),
          },
          outlineItem: outlineItemBySerial.get(chapter.serialNumber) ?? {
            id: `outline:chapter:${chapter.id}`,
            source: 'outline' as const,
            group: volume.name,
            title: `第${chapter.serialNumber}章 章纲`,
            content: '',
          },
          summaryItem: summaryItemBySerial.get(chapter.serialNumber) ?? null,
        })),
    )
    .sort((left, right) => right.serialNumber - left.serialNumber);

  return { chapterContextItems, contextChapterRows, selectedChapterSerialNumber };
}
