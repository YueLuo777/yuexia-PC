import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';

const CHAPTER_POLISH_STATUS_KEY_PREFIX = 'xinyuexia_chapter_polish_status_v1';

type ChapterPolishStatusMap = Record<string, string>;

export function getChapterContentFingerprint(content: string) {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 31 + content.charCodeAt(index)) >>> 0;
  }
  return `${content.length}:${hash.toString(36)}`;
}

export function getChapterPolishStatusStorageKey(storageKey: string) {
  return `${CHAPTER_POLISH_STATUS_KEY_PREFIX}:${storageKey}`;
}

function readChapterPolishStatusMap(storageKey: string): ChapterPolishStatusMap {
  try {
    const parsed = JSON.parse(localStorage.getItem(getChapterPolishStatusStorageKey(storageKey)) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, string] => (
        typeof entry[0] === 'string' && typeof entry[1] === 'string'
      )),
    );
  } catch {
    return {};
  }
}

function writeChapterPolishStatusMap(storageKey: string, statusMap: ChapterPolishStatusMap) {
  localStorage.setItem(getChapterPolishStatusStorageKey(storageKey), JSON.stringify(statusMap));
}

export function isChapterContentPolished(storageKey: string, chapterId: number, content: string) {
  const statusMap = readChapterPolishStatusMap(storageKey);
  return statusMap[String(chapterId)] === getChapterContentFingerprint(content);
}

export function markChapterContentPolished(storageKey: string, chapterId: number, content: string) {
  const statusMap = readChapterPolishStatusMap(storageKey);
  writeChapterPolishStatusMap(storageKey, {
    ...statusMap,
    [String(chapterId)]: getChapterContentFingerprint(content),
  });
}

export function countUnpolishedChapters(
  storageKey: string,
  volumes: Volume[],
  getChapterContent: (chapterId: number) => string,
) {
  return volumes.reduce((sum, volume) => (
    sum + volume.chapters.filter((chapter: Chapter) => (
      !isChapterContentPolished(storageKey, chapter.id, getChapterContent(chapter.id))
    )).length
  ), 0);
}
