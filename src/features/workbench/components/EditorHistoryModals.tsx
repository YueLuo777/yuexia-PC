import { useEffect, useState } from 'react';
import {
  AtSign,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Diamond,
  Link2,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Rows3,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react';

import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { WordCountText } from '@/shared/ui/WordCountText';
import { EmptyState } from '@/shared/ui/EmptyState';

import { ModalShell } from './EditorToolModalShell';
import { ASSOCIATED_CHAPTERS_KEY, loadSnapshots, readJson, writeJson } from './editorToolState';
import type { ChapterAssociateItem, HistorySnapshot } from './editorToolState';

export function HistoryModal({
  isOpen,
  onClose,
  chapterId,
  onRestore,
}: {
  isOpen: boolean;
  onClose: () => void;
  chapterId: number;
  onRestore: (content: string) => void;
}) {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  useEffect(() => {
    if (isOpen) setSnapshots(loadSnapshots()[String(chapterId)] ?? []);
  }, [chapterId, isOpen]);
  if (!isOpen) return null;

  return (
    <ModalShell
      title="历史版本"
      icon={<RotateCcw className="h-4 w-4 text-brand" />}
      onClose={onClose}
      widthClass="w-[480px]"
    >
      <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-gray-600">
        每 5 分钟自动保存一次历史版本，最多保留 20 个。
      </div>
      <div className="max-h-[520px] space-y-2 overflow-y-auto p-4">
        {snapshots.length === 0 ? (
          <EmptyState
            className="min-h-[180px]"
            title="暂无历史快照"
            description="产生新的自动保存记录后，将在这里显示。"
          />
        ) : (
          [...snapshots].reverse().map((snapshot) => (
            <div
              key={snapshot.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm text-gray-700">{snapshot.timestamp}</span>
                  <span className="text-xs text-gray-400">
                    <WordCountText value={snapshot.wordCount} compact />
                  </span>
                </div>
                <p className="truncate text-xs text-gray-400">{snapshot.content.slice(0, 60)}</p>
              </div>
              <button
                onClick={() => {
                  onRestore(snapshot.content);
                  onClose();
                }}
                className="ml-3 shrink-0 rounded-md border border-brand px-3 py-1.5 text-xs text-brand hover:bg-brand-light"
              >
                恢复
              </button>
            </div>
          ))
        )}
      </div>
    </ModalShell>
  );
}

export function TitleOptimizeModal({
  isOpen,
  onClose,
  currentChapterSerial,
  currentContent,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentChapterSerial: number;
  currentContent: string;
  onApply: (title: string) => void;
}) {
  const [candidateCount, setCandidateCount] = useState(10);
  const [platform, setPlatform] = useState('番茄');
  const [maxLength, setMaxLength] = useState(16);
  const [titles, setTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  if (!isOpen) return null;

  const generate = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      const seed = currentContent.replace(/\s/g, '').slice(0, 18) || '本章剧情';
      setTitles(
        [
          `第${currentChapterSerial}章 ${seed}暗潮初起`,
          `第${currentChapterSerial}章 危机逼近，真相浮现`,
          `第${currentChapterSerial}章 反转将至`,
          `第${currentChapterSerial}章 旧局崩塌`,
          `第${currentChapterSerial}章 他终于出手`,
          `第${currentChapterSerial}章 所有人都低估了他`,
          `第${currentChapterSerial}章 一步错，满盘惊`,
          `第${currentChapterSerial}章 隐藏底牌曝光`,
          `第${currentChapterSerial}章 局势彻底失控`,
          `第${currentChapterSerial}章 新的交易`,
        ]
          .map((title) => title.slice(0, maxLength + 4))
          .slice(0, candidateCount),
      );
      setIsGenerating(false);
    }, 600);
  };

  return (
    <ModalShell
      title="AI 标题优化"
      icon={<Sparkles className="h-4 w-4 text-brand" />}
      onClose={onClose}
      widthClass="w-[520px]"
    >
      <div className="max-h-[640px] space-y-4 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">
            发布平台
            <input
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="text-xs text-gray-500">
            标题字数上限
            <input
              type="number"
              min={1}
              max={50}
              value={maxLength}
              onChange={(event) => setMaxLength(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              第{currentChapterSerial}章 · {platform}
            </span>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              候选数
              <input
                type="number"
                min={1}
                max={20}
                value={candidateCount}
                onChange={(event) => setCandidateCount(Number(event.target.value))}
                className="w-16 rounded-md border border-gray-200 px-2 py-1 text-center text-sm"
              />
            </label>
          </div>
          <button
            onClick={generate}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-sm text-white hover:bg-brand-dark disabled:bg-gray-300"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? '生成中...' : '生成标题'}
          </button>
        </div>
        {titles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">生成结果</p>
            {titles.map((title, index) => (
              <button
                key={`${title}-${index}`}
                onClick={() => {
                  onApply(title.replace(/^第\d+章\s*/, ''));
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left hover:border-brand hover:bg-brand-light"
              >
                <span className="text-sm text-gray-700">
                  {index + 1}. {title}
                </span>
                <span className="text-xs text-gray-400">
                  <WordCountText value={title.length} compact />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export function ChapterAssociateModal({
  isOpen,
  onClose,
  chapters,
  onAssociate,
}: {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterAssociateItem[];
  onAssociate: (ids: number[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    const stored = readJson<number[]>(ASSOCIATED_CHAPTERS_KEY, []);
    setSelectedIds(new Set(stored.filter((id) => chapters.some((chapter) => chapter.id === id))));
  }, [chapters, isOpen]);

  if (!isOpen) return null;
  const selectedChapters = chapters.filter((chapter) => selectedIds.has(chapter.id));
  const selectedCount = selectedIds.size;
  const selectedWords = selectedChapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0);
  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectRecent = (count: number) => setSelectedIds(new Set(chapters.slice(-count).map((chapter) => chapter.id)));

  return (
    <ModalShell
      title="关联章节"
      icon={<Link2 className="h-4 w-4 text-brand" />}
      onClose={onClose}
      widthClass="w-[420px]"
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {[5, 10, 50, 100].map((count) => (
            <button
              key={count}
              onClick={() => selectRecent(count)}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50"
            >
              近{count}章
            </button>
          ))}
          <button
            onClick={() => setSelectedIds(new Set(chapters.map((chapter) => chapter.id)))}
            className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50"
          >
            全选
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50"
          >
            清空
          </button>
        </div>
        <div className="ml-2 shrink-0 text-[10px] text-gray-500">
          <span className="font-bold text-brand">{selectedCount}</span> 章
        </div>
      </div>
      <div className="max-h-[320px] overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-5 gap-2">
          {chapters.map((chapter) => {
            const isSelected = selectedIds.has(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => toggle(chapter.id)}
                className={`rounded border px-1 py-1.5 text-[11px] transition-colors ${isSelected ? 'border-brand bg-brand-light font-medium text-brand-dark' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                第{chapter.serialNumber}章
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[10px] text-gray-500">
          已选 <span className="font-bold text-brand">{selectedCount}</span> 章 ·{' '}
          <span className="font-bold text-brand">{selectedWords.toLocaleString()}</span> 字
        </span>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              const ids = Array.from(selectedIds);
              writeJson(ASSOCIATED_CHAPTERS_KEY, ids);
              onAssociate(ids);
              onClose();
            }}
            disabled={selectedCount === 0}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认关联
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
