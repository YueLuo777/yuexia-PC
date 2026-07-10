import type { Volume } from './workbenchTypes';

export function countWords(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  const chineseChars = trimmed.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const englishWords = trimmed.match(/[a-zA-Z]+/g)?.length ?? 0;
  const numbers = trimmed.match(/\d+/g)?.length ?? 0;
  return chineseChars + englishWords + numbers;
}

export function getSelectedChapter(volumes: Volume[]) {
  for (const volume of volumes) {
    const chapter = volume.chapters.find((item) => item.isSelected);
    if (chapter) return { volumeId: volume.id, volumeName: volume.name, chapter };
  }
  return null;
}

export function ensureOneSelected(volumes: Volume[]): Volume[] {
  if (getSelectedChapter(volumes)) return volumes;
  const firstVolume = volumes.find((volume) => volume.chapters.length > 0);
  if (!firstVolume) return volumes;

  return volumes.map((volume) => ({
    ...volume,
    chapters: volume.chapters.map((chapter, index) => ({
      ...chapter,
      isSelected: volume.id === firstVolume.id && index === 0,
    })),
  }));
}
