import { useEffect, useState } from 'react';

import type { ChapterExportFormat } from '../components/ChapterExportPanel';
import type { PendingPublish } from '../components/workbenchPageSupport';
import {
  buildChapterExportDoc,
  buildChapterExportText,
  sanitizeExportFileName,
  type ChapterExportItem,
} from '../model/chapterExport';
import type { Chapter, Volume, WorkbenchNovel } from '../model/workbenchTypes';
import { readChapterContent } from './useWorkbenchData';

function download(fileName: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useWorkbenchDocumentActions(options: {
  novel: WorkbenchNovel | null;
  volumes: Volume[];
  selectedChapter: { chapter: Chapter } | null;
  editorContent: string;
  publishConfirm: boolean;
  saveContent: (content: string) => void;
  setChapterPublished: (id: number, value: boolean) => void;
  openExport: () => void;
}) {
  const {
    novel,
    volumes,
    selectedChapter,
    editorContent,
    publishConfirm,
    saveContent,
    setChapterPublished,
    openExport,
  } = options;
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(null);
  const [undo, setUndo] = useState<{ chapterId: number; content: string } | null>(null);

  useEffect(() => setUndo(null), [selectedChapter?.chapter.id]);

  const replaceEditorContent = (content: string) => {
    if (selectedChapter) setUndo({ chapterId: selectedChapter.chapter.id, content: editorContent });
    saveContent(content);
  };
  const undoReplaceEditorContent = () => {
    if (!selectedChapter || undo?.chapterId !== selectedChapter.chapter.id) return;
    saveContent(undo.content);
    setUndo(null);
  };
  const collect = (ids: number[]): ChapterExportItem[] => {
    if (!novel) return [];
    const targets = new Set(ids);
    return volumes.flatMap((volume) =>
      [...volume.chapters]
        .sort((left, right) => left.serialNumber - right.serialNumber)
        .filter((chapter) => targets.has(chapter.id))
        .map((chapter) => ({
          volumeId: volume.id,
          volumeName: volume.name,
          chapterId: chapter.id,
          serialNumber: chapter.serialNumber,
          title: chapter.title,
          content:
            selectedChapter?.chapter.id === chapter.id ? editorContent : readChapterContent(novel.id, chapter.id),
        })),
    );
  };
  const handleExportSelectedChapters = (format: ChapterExportFormat, ids: number[]) => {
    if (!novel) return;
    const items = collect(ids);
    if (!items.length) return;
    const base = sanitizeExportFileName(`${novel.title}_章节`);
    if (format === 'doc') {
      download(
        `${base}.doc`,
        buildChapterExportDoc(novel.title, novel.type, items),
        'application/msword;charset=utf-8',
      );
    } else download(`${base}.txt`, buildChapterExportText(novel.title, novel.type, items));
  };
  const publishChapterNow = (id: number) => setChapterPublished(id, true);
  const handlePublishChapter = (volumeId: number, chapterId: number) => {
    if (!novel) return;
    const volume = volumes.find((item) => item.id === volumeId);
    const chapter = volume?.chapters.find((item) => item.id === chapterId);
    if (!volume || !chapter) return;
    const duplicate = volume.chapters.find(
      (item) => item.id !== chapterId && item.isPublished && item.serialNumber === chapter.serialNumber,
    );
    if (duplicate) {
      window.alert(`已有第${chapter.serialNumber}${novel.type === 'script' ? '集' : '章'}，请检查序号`);
      return;
    }
    if (publishConfirm) {
      const unit = novel.type === 'script' ? '集' : '章';
      setPendingPublish({
        type: 'single',
        volumeId,
        chapterId,
        title: chapter.title || `第${chapter.serialNumber}${unit}`,
      });
      return;
    }
    publishChapterNow(chapterId);
  };

  return {
    pendingPublish,
    setPendingPublish,
    replaceEditorContent,
    undoReplaceEditorContent,
    canUndoReplace: Boolean(selectedChapter && undo?.chapterId === selectedChapter.chapter.id),
    handleExportSelectedChapters,
    handleExportChapters: openExport,
    publishChapterNow,
    handlePublishChapter,
  };
}
