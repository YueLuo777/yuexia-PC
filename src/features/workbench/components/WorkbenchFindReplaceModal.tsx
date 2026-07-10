import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { readChapterContent } from '@/features/workbench/hooks/useWorkbenchData';
import type { Volume } from '@/features/workbench/model/workbenchTypes';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

type FindScope = 'chapter' | 'book';

const FIND_REPLACE_DEFAULT_GEOMETRY = {
  x: 0,
  y: 0,
  width: 592,
};
const FIND_REPLACE_MODAL_STORAGE_ID = 'workbench_find_replace_centered_v2';

function replaceAt(text: string, index: number, search: string, replacement: string) {
  return `${text.slice(0, index)}${replacement}${text.slice(index + search.length)}`;
}

function findOccurrences(text: string, search: string) {
  if (!search) return [];
  const result: number[] = [];
  let index = text.indexOf(search);
  while (index >= 0) {
    result.push(index);
    index = text.indexOf(search, index + Math.max(search.length, 1));
  }
  return result;
}

type WorkbenchFindReplaceModalProps = {
  novelId: number;
  volumes: Volume[];
  selectedChapter: { volumeId: number; volumeName: string; chapter: Volume['chapters'][number] } | null;
  editorContent: string;
  onClose: () => void;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onUpdateChapterContents: (updates: Record<number, string>) => void;
};

export function WorkbenchFindReplaceModal({
  novelId,
  volumes,
  selectedChapter,
  editorContent,
  onClose,
  onSelectChapter,
  onUpdateChapterContents,
}: WorkbenchFindReplaceModalProps) {
  const draggable = useDraggableModal(FIND_REPLACE_MODAL_STORAGE_ID, FIND_REPLACE_DEFAULT_GEOMETRY);
  useTopModalEscape(true, onClose);
  const [scope, setScope] = useState<FindScope>('chapter');
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('');

  const chapters = volumes.flatMap((volume) =>
    volume.chapters.map((chapter) => ({
      volumeId: volume.id,
      chapterId: chapter.id,
      label: `第${chapter.serialNumber}${chapter.title ? `章 ${chapter.title}` : '章'}`,
      content: selectedChapter?.chapter.id === chapter.id ? editorContent : readChapterContent(novelId, chapter.id),
    })),
  );
  const scopedChapters =
    scope === 'chapter' && selectedChapter
      ? chapters.filter((chapter) => chapter.chapterId === selectedChapter.chapter.id)
      : chapters;
  const matches = scopedChapters.flatMap((chapter) =>
    findOccurrences(chapter.content, searchText).map((index) => ({ ...chapter, index })),
  );
  const total = matches.length;
  const safeActiveIndex = total === 0 ? 0 : Math.min(activeIndex, total - 1);

  useEffect(() => {
    setActiveIndex(0);
    setStatus('');
  }, [scope, searchText]);

  const goMatch = (direction: -1 | 1) => {
    if (total === 0) return;
    const next = (safeActiveIndex + direction + total) % total;
    setActiveIndex(next);
    const match = matches[next];
    if (scope === 'book') onSelectChapter(match.volumeId, match.chapterId);
  };

  const replaceCurrent = () => {
    const match = matches[safeActiveIndex];
    if (!match) {
      setStatus('未找到匹配内容');
      return;
    }
    onUpdateChapterContents({
      [match.chapterId]: replaceAt(match.content, match.index, searchText, replaceText),
    });
    setStatus('已替换当前匹配');
  };

  const replaceInScope = (targetScope: FindScope) => {
    if (!searchText) return;
    const targets =
      targetScope === 'chapter' && selectedChapter
        ? chapters.filter((chapter) => chapter.chapterId === selectedChapter.chapter.id)
        : chapters;
    const updates: Record<number, string> = {};
    let count = 0;
    targets.forEach((chapter) => {
      const occurrences = findOccurrences(chapter.content, searchText);
      if (occurrences.length === 0) return;
      updates[chapter.chapterId] = chapter.content.split(searchText).join(replaceText);
      count += occurrences.length;
    });
    if (count === 0) {
      setStatus('未找到匹配内容');
      return;
    }
    onUpdateChapterContents(updates);
    setStatus(targetScope === 'chapter' ? `本章已替换 ${count} 处` : `全书已替换 ${count} 处`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/30 px-6 py-6"
      style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        className="relative w-[592px] max-w-[94vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={{ ...draggable.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-11 cursor-move items-center justify-between border-b border-gray-100 px-4"
          style={{ ...draggable.dragHandleProps.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        >
          <h2 className="text-base font-bold text-gray-900">查找替换</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            关闭
          </button>
        </header>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
            <label className="text-sm font-medium text-gray-700">查找</label>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 focus-within:border-brand">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-sm text-gray-800 outline-none"
              />
              <button
                onClick={() => setScope((prev) => (prev === 'book' ? 'chapter' : 'book'))}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                {scope === 'book' ? '搜索本章' : '搜索本书'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
            <label className="text-sm font-medium text-gray-700">替换</label>
            <input
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              placeholder="输入替换词"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goMatch(-1)}
              disabled={total === 0}
              className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40"
            >
              上一个
            </button>
            <div className="w-14 text-center text-lg font-bold text-brand">
              {total === 0 ? '0/0' : `${safeActiveIndex + 1}/${total}`}
            </div>
            <button
              onClick={() => goMatch(1)}
              disabled={total === 0}
              className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40"
            >
              下一个
            </button>
            <button
              onClick={replaceCurrent}
              disabled={total === 0}
              className="ml-auto rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              替换
            </button>
            <button
              onClick={() => replaceInScope('chapter')}
              disabled={!searchText}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              本章替换
            </button>
            <button
              onClick={() => replaceInScope('book')}
              disabled={!searchText}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              全书替换
            </button>
          </div>

          <div className="h-4 text-xs text-gray-400">
            {status || (scope === 'book' && total > 0 ? matches[safeActiveIndex]?.label : '')}
          </div>
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>,
    document.body,
  );
}
