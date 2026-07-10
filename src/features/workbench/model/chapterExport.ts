import type { WorkbenchNovel } from './workbenchTypes';

export interface ChapterExportItem {
  volumeId: number;
  volumeName: string;
  chapterId: number;
  serialNumber: number;
  title: string;
  content: string;
}

function getChapterExportTitle(
  item: Pick<ChapterExportItem, 'serialNumber' | 'title'>,
  workType: WorkbenchNovel['type'],
) {
  const chapterUnit = workType === 'script' ? '集' : '章';
  return `第${item.serialNumber}${chapterUnit}${item.title ? ` ${item.title}` : ''}`;
}

export function sanitizeExportFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').trim() || '导出章节';
}

function escapeDocHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildChapterExportText(
  novelTitle: string,
  workType: WorkbenchNovel['type'],
  items: ChapterExportItem[],
) {
  const lines: string[] = [`《${novelTitle}》`, ''];
  let currentVolumeId: number | null = null;

  items.forEach((item) => {
    if (currentVolumeId !== item.volumeId) {
      currentVolumeId = item.volumeId;
      lines.push(item.volumeName, '');
    }
    lines.push(getChapterExportTitle(item, workType));
    if (item.content.trim()) lines.push(item.content.trim());
    lines.push('');
  });

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

export function buildChapterExportDoc(
  novelTitle: string,
  workType: WorkbenchNovel['type'],
  items: ChapterExportItem[],
) {
  let currentVolumeId: number | null = null;
  const body: string[] = [`<h1>《${escapeDocHtml(novelTitle)}》</h1>`];

  items.forEach((item) => {
    if (currentVolumeId !== item.volumeId) {
      currentVolumeId = item.volumeId;
      body.push(`<h2>${escapeDocHtml(item.volumeName)}</h2>`);
    }
    body.push(`<h3>${escapeDocHtml(getChapterExportTitle(item, workType))}</h3>`);
    const paragraphs = item.content
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) {
      body.push('<p></p>');
      return;
    }
    paragraphs.forEach((paragraph) => {
      body.push(`<p>${escapeDocHtml(paragraph)}</p>`);
    });
  });

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: "Microsoft YaHei", SimSun, serif; font-size: 14pt; line-height: 1.85; color: #111827; }
    h1 { text-align: center; font-size: 22pt; margin: 0 0 28pt; }
    h2 { font-size: 17pt; margin: 24pt 0 12pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 6pt; }
    h3 { font-size: 15pt; margin: 18pt 0 10pt; }
    p { margin: 0 0 8pt; text-indent: 2em; }
  </style>
</head>
<body>
${body.join('\n')}
</body>
</html>`;
}
