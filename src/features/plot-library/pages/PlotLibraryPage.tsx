import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowUpDown, Check, Edit3, Library, Search, Tag, Trash2, X } from 'lucide-react';

import {
  parsePlotRating,
  parsePlotScoreMap,
  sanitizePlotLibraryContent,
  usePlotLibrary,
} from '@/features/plot-library/hooks/usePlotLibrary';
import type { NewPlotLibraryItem, PlotLibraryItem } from '@/features/plot-library/model/plotLibraryTypes';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

type SortMode = 'time' | 'id-asc' | 'wordCount-desc' | 'wordCount-asc' | 'score-desc' | 'score-asc';
type ModalTextSegment = { text: string; hidden: boolean };

function extractScore(content: string): number | null {
  return parsePlotRating(content) ?? null;
}

function extractPlotTags(content: string): string[] {
  if (!content) return [];
  const blocks = Array.from(content.matchAll(/<bq>([\s\S]*?)<\/bq>/g));
  if (blocks.length === 0) return [];
  const tags = blocks.flatMap((match) =>
    match[1]
      .replace(/标签[:：]/g, '')
      .split(/[#＃、\s，,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length < 20),
  );
  return Array.from(new Set(tags)).slice(0, 8);
}

function isRedundantModalMetaLine(line: string) {
  const trimmed = line.trim();
  return (
    /^第\s*\d+\s*个剧情点(?:（[^）]*）|\([^)]*\))?\s*$/.test(trimmed) ||
    /^#\s*(?:评分|主题标签)\s*$/.test(trimmed) ||
    /^【?评分】?\s*[:：]?\s*\d{0,3}\s*$/.test(trimmed) ||
    /^评分\s*[:：]\s*\d{1,3}\s*$/.test(trimmed) ||
    /^【?主题标签】?\s*[:：]?.*$/.test(trimmed) ||
    /^主题标签\s*[:：].*$/.test(trimmed) ||
    /^【?标签】?\s*[:：]?.*$/.test(trimmed)
  );
}

function prepareModalText(rawText: string): string {
  if (!rawText) return '';
  let cleanText = sanitizePlotLibraryContent(rawText);
  cleanText = cleanText.replace(/<fs>[\s\S]*?<\/fs>/g, '');
  cleanText = cleanText.replace(/<bq>[\s\S]*?<\/bq>/g, '');
  cleanText = cleanText
    .split('\n')
    .filter((line) => !isRedundantModalMetaLine(line))
    .join('\n');
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  return cleanText.trim();
}

function stripForcedPromptLeak(rawText: string) {
  return rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return !(/【?强制包裹】?/.test(trimmed) || /所有分数必须放在/.test(trimmed) || /仅填数字/.test(trimmed));
    })
    .join('\n');
}

function appendModalLineSegments(segments: ModalTextSegment[], text: string) {
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (line) segments.push({ text: line, hidden: isRedundantModalMetaLine(line) });
    if (index < lines.length - 1) segments.push({ text: '\n', hidden: false });
  });
}

function prepareFullModalSegments(rawText: string): ModalTextSegment[] {
  if (!rawText) return [];
  const cleanText = stripForcedPromptLeak(rawText).trim();
  const segments: ModalTextSegment[] = [];
  const blockRegex = /<(fs|bq)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(cleanText)) !== null) {
    appendModalLineSegments(segments, cleanText.slice(lastIndex, match.index));
    const blockText = (match[2] ?? '').trim();
    if (blockText) segments.push({ text: blockText, hidden: true });
    lastIndex = match.index + match[0].length;
  }
  appendModalLineSegments(segments, cleanText.slice(lastIndex));
  return segments.filter((segment) => segment.text.length > 0);
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[＃#【】「」『』《》，,。.!！?？:：;；、\s]+/g, ' ')
    .trim();
}

function buildPlotSearchText(item: PlotLibraryItem) {
  return normalizeSearchText(
    [
      item.title,
      item.novelTitle,
      item.chapter,
      item.content,
      item.fsText ?? '',
      item.bqText ?? '',
      prepareModalText(item.content),
      item.tags.join(' '),
      extractPlotTags(item.content).join(' '),
      String(item.rating ?? ''),
      String(item.wordCount ?? ''),
    ].join(' '),
  );
}

function matchesSearch(item: PlotLibraryItem, keyword: string) {
  const terms = normalizeSearchText(keyword).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = buildPlotSearchText(item);
  return terms.every((term) => haystack.includes(term));
}

function extractFsScores(content: string): Record<string, string> | null {
  return parsePlotScoreMap(content);
}

function extractNumber(value: string): number | null {
  const m = value.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function getScoreColor(value: string): string {
  const num = extractNumber(value);
  if (num === null) return 'text-gray-800';
  if (num < 70) return 'text-green-500';
  if (num < 80) return 'text-blue-500';
  if (num < 90) return 'text-purple-500';
  return 'text-yellow-500';
}

function isScoringDimension(key: string): boolean {
  return ['新颖度', '冲突强度', '情绪强度', '期待感', '平均分', '张力', '情绪冲击', '综合评分'].includes(key);
}

function findAverageScore(scores: Record<string, string> | null): string | null {
  if (!scores) return null;
  return scores['平均分'] ?? scores['综合评分'] ?? null;
}

function isAverageScoreKey(key: string) {
  return key === '平均分' || key === '综合评分';
}

function buildTagNav(items: PlotLibraryItem[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const tags = extractPlotTags(item.content);
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function readContent(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((line) => (typeof line === 'string' ? line : String(line ?? '')))
      .join('\n')
      .trim();
  }
  return '';
}

function normalizeTextPlotBlock(block: string) {
  return sanitizePlotLibraryContent(block)
    .replace(/^剧情点\s*\d+\s*[:：]?\s*/i, '')
    .replace(/^第\s*\d+\s*个剧情点(?:（[^）]*）|\([^)]*\))?\s*/i, '')
    .replace(/^(?:[-=]{6,}|[\u2026]{3,})\s*/gm, '')
    .replace(/^#(?:评分|主题标签)\s*$/gm, '')
    .trim();
}

function normalizeImportedPlotPoint(value: unknown, index: number): NewPlotLibraryItem | null {
  if (!isRecord(value)) return null;
  const content = readContent(value.content);
  if (!content) return null;
  const rawTags = Array.isArray(value.tags)
    ? value.tags.map((tag) => readString(tag)).filter(Boolean)
    : readString(value.tags)
        .split(/[,，、\s]+/)
        .filter(Boolean);
  const rating =
    typeof value.rating === 'number' && Number.isFinite(value.rating)
      ? Math.max(0, Math.min(100, value.rating))
      : undefined;
  return {
    title: readString(value.title),
    chapter: readString(value.chapter),
    novelTitle: readString(value.novelTitle),
    content,
    tags: rawTags,
    rating,
  };
}

function parseTextPlotPoints(rawText: string): NewPlotLibraryItem[] {
  const text = rawText.replace(/\r\n/g, '\n').trim();
  if (!text) return [];
  const blocks = text
    .split(/\n\s*(?:={6,}|-{6,}|[\u2026]{3,}|【?剧情点\s*\d+】?)\s*\n/g)
    .map(normalizeTextPlotBlock)
    .filter(Boolean);
  const usableBlocks = blocks.length > 1 ? blocks : [normalizeTextPlotBlock(text)];
  return usableBlocks
    .filter((content) => content.length > 0)
    .map((content, index) => ({
      title: '',
      chapter: '',
      novelTitle: '',
      content,
      tags: [],
    }));
}

function parseImportedPlotPoints(rawText: string): NewPlotLibraryItem[] {
  try {
    const parsed = JSON.parse(rawText) as unknown;
    const source = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.items) ? parsed.items : [];
    const normalized = source
      .map((item, index) => normalizeImportedPlotPoint(item, index))
      .filter((item): item is NewPlotLibraryItem => Boolean(item));
    if (normalized.length > 0) return normalized;
  } catch {
    // Plain text import falls through to the text parser.
  }
  return parseTextPlotPoints(rawText);
}

function buildReadablePlotExport(items: PlotLibraryItem[]) {
  return items.map((item) => normalizeTextPlotBlock(item.content)).join('\n\n\n');
}

function normalizePlotContentForDuplicate(content: string) {
  return normalizeTextPlotBlock(content)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getPlotCreatedTime(item: PlotLibraryItem) {
  const time = new Date(item.createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function createStablePlotIdMap(items: PlotLibraryItem[]) {
  return new Map(
    items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => getPlotCreatedTime(a.item) - getPlotCreatedTime(b.item) || a.index - b.index)
      .map(({ item }, index) => [item.id, index + 1] as const),
  );
}

function isAutoImportedTitle(title: string) {
  return /^导入剧情点\s*\d+$/i.test(title.trim());
}

function getPlotDisplayTitle(item: PlotLibraryItem, displayId: number) {
  const title = item.title.trim();
  if (title && !isAutoImportedTitle(title)) return title;
  return `剧情点 ${displayId}`;
}

interface PlotLibraryPageProps {
  embedded?: boolean;
}

export function PlotLibraryPage({ embedded = false }: PlotLibraryPageProps = {}) {
  const {
    items,
    recycleItems,
    addItems,
    deleteItem,
    updateItem,
    clearAll,
    restoreItem,
    permanentDeleteItem,
    clearRecycle,
  } = usePlotLibrary();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRecycle, setShowRecycle] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);
  const [isImportDragging, setIsImportDragging] = useState(false);
  const [showDetail, setShowDetail] = useState<PlotLibraryItem | null>(null);
  const [showFullDetailContent, setShowFullDetailContent] = useState(false);
  const [recycleDetail, setRecycleDetail] = useState<PlotLibraryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modalFontSize, setModalFontSize] = useState(13);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [selectedExportIds, setSelectedExportIds] = useState<Set<string>>(() => new Set());
  const [collapsedExportGroups, setCollapsedExportGroups] = useState<Set<number>>(() => new Set());

  const tagNav = useMemo(() => buildTagNav(items), [items]);
  const stablePlotIdByItemId = useMemo(() => createStablePlotIdMap(items), [items]);
  const recycleColumnCount = 3;
  const recycleModalWidth = 980;

  useEffect(() => {
    if (!embedded) return;
    const updateTarget = () => setToolbarTarget(document.getElementById('extract-plot-library-toolbar'));
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, [embedded]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      list = list.filter((p) => matchesSearch(p, search));
    }
    if (activeTagFilter) {
      list = list.filter((p) => extractPlotTags(p.content).includes(activeTagFilter));
    }
    switch (sortMode) {
      case 'time':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'id-asc':
        list.sort((a, b) => (stablePlotIdByItemId.get(a.id) ?? 0) - (stablePlotIdByItemId.get(b.id) ?? 0));
        break;
      case 'wordCount-desc':
        list.sort((a, b) => b.wordCount - a.wordCount);
        break;
      case 'wordCount-asc':
        list.sort((a, b) => a.wordCount - b.wordCount);
        break;
      case 'score-desc':
        list.sort((a, b) => {
          const scoreDiff = (extractScore(b.content) || 0) - (extractScore(a.content) || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case 'score-asc':
        list.sort((a, b) => {
          const scoreDiff = (extractScore(a.content) || 0) - (extractScore(b.content) || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }
    return list;
  }, [items, search, sortMode, activeTagFilter, stablePlotIdByItemId]);

  const visiblePlotItems = useMemo(() => filtered.filter((item) => item.content.trim().length > 0), [filtered]);

  const exportSortedItems = useMemo(
    () =>
      [...visiblePlotItems].sort((a, b) => {
        const scoreDiff = (extractScore(b.content) || 0) - (extractScore(a.content) || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (stablePlotIdByItemId.get(a.id) ?? 0) - (stablePlotIdByItemId.get(b.id) ?? 0);
      }),
    [stablePlotIdByItemId, visiblePlotItems],
  );

  const exportGroups = useMemo(() => {
    const groups: PlotLibraryItem[][] = [];
    for (let index = 0; index < exportSortedItems.length; index += 50) {
      groups.push(exportSortedItems.slice(index, index + 50));
    }
    return groups;
  }, [exportSortedItems]);

  const selectedExportItems = useMemo(
    () => exportSortedItems.filter((item) => selectedExportIds.has(item.id)),
    [exportSortedItems, selectedExportIds],
  );
  const exportPreviewText = useMemo(() => buildReadablePlotExport(selectedExportItems), [selectedExportItems]);

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = parseImportedPlotPoints(await file.text());
      if (imported.length === 0) {
        window.alert('未读取到可导入的剧情点，请检查 TXT 或 JSON 格式。');
        return;
      }
      const existingContentKeys = new Set(items.map((item) => normalizePlotContentForDuplicate(item.content)));
      const importContentKeys = new Set<string>();
      const uniqueImported = imported.filter((item) => {
        const key = normalizePlotContentForDuplicate(item.content);
        if (!key || existingContentKeys.has(key) || importContentKeys.has(key)) return false;
        importContentKeys.add(key);
        return true;
      });
      const created = uniqueImported.length > 0 ? addItems(uniqueImported) : [];
      setShowImportModal(false);
      setIsImportDragging(false);
      setImportResult({ created: created.length, skipped: imported.length - uniqueImported.length });
    } catch (error) {
      console.error('Import plot points failed:', error);
      window.alert('导入失败，请确认文件是剧情点 TXT 或 JSON。');
    }
  };

  const handleImportPlotPoints = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    void handleImportFile(file);
  };

  const handleImportDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImportDragging(false);
    void handleImportFile(event.dataTransfer.files?.[0]);
  };

  const handleOpenExportModal = () => {
    if (visiblePlotItems.length === 0) {
      window.alert('剧情库暂无可导出的剧情点。');
      return;
    }
    setShowExportModal(true);
  };

  const handleConfirmExportPlotPoints = () => {
    if (selectedExportItems.length === 0) {
      window.alert('请先选择要导出的剧情点。');
      return;
    }
    const blob = new Blob([exportPreviewText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `plot-library-selected-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const toggleExportSelection = (id: string) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExportGroupCollapse = (groupIndex: number) => {
    setCollapsedExportGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupIndex)) {
        next.delete(groupIndex);
      } else {
        next.add(groupIndex);
      }
      return next;
    });
  };

  const toggleExportGroupSelection = (groupItems: PlotLibraryItem[]) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupItems.every((item) => next.has(item.id));
      for (const item of groupItems) {
        if (allSelected) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
      }
      return next;
    });
  };

  const toolbar = (
    <div className="flex items-center gap-2">
      <label className="xy-ui132-search w-48">
        <Search />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索..."
          style={{ paddingRight: search ? '2rem' : undefined }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </label>
      <div className="flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
        <CapsuleSelect
          value={sortMode}
          onChange={(value) => setSortMode(value as SortMode)}
          className="w-[118px]"
          buttonClassName="h-8 gap-1 rounded-lg px-3 text-xs"
          options={[
            { value: 'time', label: '最新' },
            { value: 'id-asc', label: 'ID顺序' },
            { value: 'wordCount-desc', label: '字数多' },
            { value: 'wordCount-asc', label: '字数少' },
            { value: 'score-desc', label: '评分高' },
            { value: 'score-asc', label: '评分低' },
          ]}
        />
      </div>
      <button
        type="button"
        onClick={() => setShowImportModal(true)}
        className="flex h-8 items-center rounded-lg bg-[#EAF9FD] px-3 text-[11px] font-bold text-[#08AACE] transition-colors hover:bg-[#d9f3fa]"
      >
        <span className="whitespace-nowrap">导入剧情点</span>
      </button>
      <button
        type="button"
        onClick={handleOpenExportModal}
        className="flex h-8 items-center rounded-lg bg-white px-3 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        <span className="whitespace-nowrap">导出剧情点</span>
      </button>
      <button
        onClick={() => setShowRecycle(true)}
        className="flex h-8 items-center rounded-lg bg-slate-100 px-3 text-[11px] text-slate-600 transition-colors hover:bg-slate-200"
      >
        <span className="whitespace-nowrap">回收站{recycleItems.length > 0 ? ` ${recycleItems.length}` : ''}</span>
      </button>
      {items.length > 0 && (
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex h-8 items-center rounded-lg bg-red-50 px-3 text-[11px] text-red-600 transition-colors hover:bg-red-100"
        >
          <span className="whitespace-nowrap">清空</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <input
        ref={importInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        className="hidden"
        onChange={handleImportPlotPoints}
      />
      {embedded && toolbarTarget ? createPortal(toolbar, toolbarTarget) : null}
      {(!embedded || !toolbarTarget) && (
        <div
          className={`flex ${embedded ? 'h-14' : 'h-16'} shrink-0 items-center border-b border-gray-200 bg-white px-6`}
        >
          <div className="flex w-full items-center justify-between">
            {!embedded ? (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900">剧情库</h1>
                <p className="text-[10px] text-gray-400">
                  共 {items.length} 条剧情点
                  {search.trim() && ` · 搜索 ${filtered.length} 条`}
                  {activeTagFilter && ` · 筛选「${activeTagFilter}」${filtered.length} 条`}
                </p>
              </div>
            ) : (
              <div className="min-w-0 text-xs font-bold text-gray-400">共 {items.length} 条剧情点</div>
            )}
            <div className="flex items-center gap-2">
              <label className="xy-ui132-search w-48">
                <Search />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索..."
                  style={{ paddingRight: search ? '2rem' : undefined }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </label>
              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <CapsuleSelect
                  value={sortMode}
                  onChange={(value) => setSortMode(value as SortMode)}
                  className="w-[118px]"
                  buttonClassName="h-8 gap-1 rounded-lg px-3 text-xs"
                  options={[
                    { value: 'time', label: '最新' },
                    { value: 'id-asc', label: 'ID顺序' },
                    { value: 'wordCount-desc', label: '字数多' },
                    { value: 'wordCount-asc', label: '字数少' },
                    { value: 'score-desc', label: '评分高' },
                    { value: 'score-asc', label: '评分低' },
                  ]}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="flex h-8 items-center rounded-lg bg-[#EAF9FD] px-3 text-[11px] font-bold text-[#08AACE] transition-colors hover:bg-[#d9f3fa]"
              >
                <span className="whitespace-nowrap">导入剧情点</span>
              </button>
              <button
                type="button"
                onClick={handleOpenExportModal}
                className="flex h-8 items-center rounded-lg bg-white px-3 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <span className="whitespace-nowrap">导出剧情点</span>
              </button>
              <button
                onClick={() => setShowRecycle(true)}
                className="flex h-8 items-center rounded-lg bg-slate-100 px-3 text-[11px] text-slate-600 transition-colors hover:bg-slate-200"
              >
                <span className="whitespace-nowrap">
                  回收站{recycleItems.length > 0 ? ` ${recycleItems.length}` : ''}
                </span>
              </button>
              {items.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex h-8 items-center rounded-lg bg-red-50 px-3 text-[11px] text-red-600 transition-colors hover:bg-red-100"
                >
                  <span className="whitespace-nowrap">清空</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-[198px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => setActiveTagFilter(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                activeTagFilter === null ? 'bg-brand text-white' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">全部</span>
              <span className={`text-xs ${activeTagFilter === null ? 'text-white/80' : 'text-gray-400'}`}>
                {items.length}
              </span>
            </button>
            {tagNav.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  activeTagFilter === tag ? 'bg-brand text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm truncate flex-1 min-w-0">{tag}</span>
                <span
                  className={`text-xs shrink-0 ml-1 ${activeTagFilter === tag ? 'text-white/80' : 'text-gray-400'}`}
                >
                  {count}
                </span>
              </button>
            ))}
            {tagNav.length === 0 && <div className="text-center py-6 text-sm text-gray-300">暂无标签</div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <Library className="w-12 h-12 mb-2" />
              <p className="text-sm">{items.length === 0 ? '暂无剧情点，在提炼页面导入' : '没有匹配的剧情点'}</p>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {visiblePlotItems.map((item, index) => {
                const tags = extractPlotTags(item.content);
                const fsScores = extractFsScores(item.content);
                const averageScore = findAverageScore(fsScores);
                const displayId = stablePlotIdByItemId.get(item.id) ?? index + 1;
                return (
                  <div
                    key={item.id}
                    className="group relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-all hover:border-brand hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowFullDetailContent(false);
                        setShowDetail(item);
                      }}
                      className="flex min-h-[176px] w-full flex-col overflow-hidden text-left"
                    >
                      <div className="relative flex w-full flex-1 min-h-0">
                        <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gray-200" />
                        {fsScores ? (
                          <div className="w-1/2 min-w-0 bg-gray-50/30 flex flex-col">
                            <div className="flex items-center justify-between border-b border-gray-100 px-2.5 py-2 leading-none">
                              <span className="text-[13px] text-blue-600">ID：</span>
                              <span className="text-[15px] font-bold text-blue-600">{displayId}</span>
                            </div>
                            <div className="flex flex-1 flex-col justify-center gap-1.5 p-2.5 pb-3 pt-2">
                              {Object.entries(fsScores)
                                .filter(([key]) => !isAverageScoreKey(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between leading-none">
                                    <span className="text-[15px] text-gray-500">{key}</span>
                                    <span
                                      className={`text-[15px] font-bold ${
                                        isScoringDimension(key) ? getScoreColor(value) : 'text-gray-800'
                                      }`}
                                    >
                                      {value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                            <div className="mt-auto flex flex-col gap-1.5 border-t border-gray-100 px-2.5 py-2 leading-none">
                              {averageScore && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[13px] text-gray-400">平均分</span>
                                  <span className={`text-[15px] font-bold ${getScoreColor(averageScore)}`}>
                                    {averageScore}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-900">字数</span>
                                <span className="text-[15px] font-bold text-gray-900">{item.wordCount}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-1/2 min-w-0 p-2.5 bg-gray-50/30 flex items-center justify-center">
                            <span className="text-[11px] text-gray-400">无评分</span>
                          </div>
                        )}
                        <div className="w-1/2 min-w-0 px-1.5 py-2.5 flex flex-col justify-center gap-2">
                          {tags.length > 0 ? (
                            tags.map((tag, i) => (
                              <span
                                key={i}
                                className="w-full truncate rounded-full px-1.5 py-1 text-center text-[12px] leading-none"
                                style={{ backgroundColor: '#f0f5ff', color: '#4a6cf7' }}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[14px] text-gray-400 text-center">无标签</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">导入剧情点</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">支持 TXT 或 JSON，会自动写入剧情库。</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsImportDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsImportDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsImportDragging(false);
                }}
                onDrop={handleImportDrop}
                className={`flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isImportDragging
                    ? 'border-[#08AACE] bg-[#EAF9FD]'
                    : 'border-slate-200 bg-slate-50 hover:border-[#08AACE] hover:bg-[#F5FCFE]'
                }`}
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#08AACE] shadow-sm">
                  <Library className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-black text-gray-900">拖拽文件到这里上传</p>
                <p className="mt-1 text-[11px] text-gray-500">或点击下方按钮从本地选择文件</p>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="mt-4 h-8 rounded-lg bg-[#08AACE] px-4 text-[12px] font-bold text-white hover:bg-[#078fb0]"
                >
                  本地上传
                </button>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="h-8 rounded-lg bg-gray-100 px-4 text-[12px] font-bold text-gray-600 hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {importResult !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setImportResult(null)}
        >
          <div
            className="w-[360px] overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h3 className="text-sm font-bold text-gray-900">导入完成</h3>
              <button
                type="button"
                onClick={() => setImportResult(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 rounded-xl bg-[#EAF9FD] px-4 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#08AACE] shadow-sm">
                  <Check className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-gray-900">已导入 {importResult.created} 条剧情点</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {importResult.skipped > 0 ? `已跳过 ${importResult.skipped} 条重复剧情点。` : '未发现重复剧情点。'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setImportResult(null)}
                className="h-8 rounded-lg bg-[#08AACE] px-4 text-[12px] font-bold text-white hover:bg-[#078fb0]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="flex h-[76vh] w-[1120px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">导出剧情点</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  已选择 {selectedExportItems.length} / {visiblePlotItems.length} 条
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-2">
              <button
                type="button"
                onClick={() => setSelectedExportIds(new Set(exportSortedItems.map((item) => item.id)))}
                className="h-8 rounded-lg bg-[#EAF9FD] px-3 text-[11px] font-bold text-[#08AACE] hover:bg-[#d9f3fa]"
              >
                全选当前
              </button>
              <button
                type="button"
                onClick={() => setSelectedExportIds(new Set())}
                className="h-8 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
              >
                清空选择
              </button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)]">
              <div className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 p-4">
                <div className="space-y-3">
                  {exportGroups.map((groupItems, groupIndex) => {
                    const start = groupIndex * 50 + 1;
                    const end = start + groupItems.length - 1;
                    const collapsed = collapsedExportGroups.has(groupIndex);
                    const allSelected =
                      groupItems.length > 0 && groupItems.every((item) => selectedExportIds.has(item.id));
                    return (
                      <div key={groupIndex} className="rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => toggleExportGroupCollapse(groupIndex)}
                            className="flex min-w-0 items-center gap-2 text-left text-[12px] font-black text-gray-800"
                          >
                            <span className={`inline-block transition-transform ${collapsed ? '-rotate-90' : ''}`}>
                              ⌄
                            </span>
                            <span>
                              {start}-{end}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleExportGroupSelection(groupItems)}
                            className={`h-7 rounded-lg px-2 text-[11px] font-bold transition-colors ${
                              allSelected
                                ? 'bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {allSelected ? '取消本组' : '选中本组'}
                          </button>
                        </div>
                        {!collapsed && (
                          <div className="grid grid-cols-5 gap-2 p-3">
                            {groupItems.map((item) => {
                              const displayId = stablePlotIdByItemId.get(item.id) ?? 0;
                              const selected = selectedExportIds.has(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleExportSelection(item.id)}
                                  className={`h-10 rounded-xl border text-[15px] font-black transition-colors ${
                                    selected
                                      ? 'border-[#08AACE] bg-[#08AACE] text-white shadow-[0_6px_14px_rgba(8,170,206,0.22)]'
                                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                                  }`}
                                  title={`评分 ${extractScore(item.content) || 0}`}
                                >
                                  {displayId}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex min-h-0 flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-gray-900">导出预览</h4>
                  <span className="text-[11px] text-gray-400">TXT</span>
                </div>
                <pre className="editor-scrollbar min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-[12px] leading-6 text-gray-800">
                  {exportPreviewText || '请先选择要导出的剧情点。'}
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="h-8 rounded-lg bg-gray-100 px-4 text-[12px] font-bold text-gray-600 hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmExportPlotPoints}
                className="h-8 rounded-lg bg-[#08AACE] px-4 text-[12px] font-bold text-white hover:bg-[#078fb0]"
              >
                导出选中
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => {
            setShowDetail(null);
            setEditingId(null);
            setShowFullDetailContent(false);
          }}
        >
          <div
            className="w-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">剧情点</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">{showDetail.chapter}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{showDetail.wordCount} 字</span>
                </div>
              </div>
              <div className="flex min-w-[340px] items-center justify-end gap-2">
                {editingId === showDetail.id ? (
                  <>
                    <button
                      onClick={() => {
                        const nextContent = sanitizePlotLibraryContent(editContent);
                        updateItem(showDetail.id, { content: editContent });
                        setEditingId(null);
                        setShowDetail({ ...showDetail, content: nextContent, wordCount: nextContent.length });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
                    >
                      <Check className="w-3 h-3" /> 保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                      }}
                      className="px-3 py-1.5 text-[11px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowFullDetailContent((prev) => !prev)}
                      className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {showFullDetailContent ? '继续隐藏' : '显示全部'}
                    </button>
                    <FontSizeStepper
                      value={modalFontSize}
                      min={MIN_FONT_SIZE}
                      max={MAX_FONT_SIZE}
                      onChange={setModalFontSize}
                      ariaLabel="剧情详情字号"
                    />
                    <button
                      onClick={() => {
                        setEditingId(showDetail.id);
                        setEditContent(showDetail.content);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> 编辑
                    </button>
                    <button
                      onClick={() => {
                        deleteItem(showDetail.id);
                        setShowDetail(null);
                        setEditingId(null);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> 删除
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowDetail(null);
                    setEditingId(null);
                    setShowFullDetailContent(false);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {editingId === showDetail.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[400px] resize-none rounded-lg border border-transparent bg-gray-50/60 p-3 font-mono leading-relaxed text-gray-800 outline-none ring-1 ring-gray-100 transition-colors focus:bg-white focus:ring-brand/30"
                  style={{ fontSize: modalFontSize }}
                  spellCheck={false}
                />
              ) : (
                <div
                  className="min-h-[400px] rounded-lg border border-transparent p-3 leading-relaxed text-gray-800 whitespace-pre-wrap break-words"
                  style={{ fontSize: modalFontSize }}
                >
                  {showFullDetailContent
                    ? prepareFullModalSegments(showDetail.content).map((segment, index) => (
                        <span key={index} className={segment.hidden ? 'text-red-600' : undefined}>
                          {segment.text}
                        </span>
                      ))
                    : prepareModalText(showDetail.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRecycle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowRecycle(false)}
        >
          <div
            className="flex max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{ width: `min(${recycleModalWidth}px, 94vw)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Trash2 className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">剧情库回收站</h3>
                  <p className="mt-0.5 text-[11px] text-gray-400">已删除剧情点可在这里恢复或永久删除。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {recycleItems.length > 0 && (
                  <button
                    onClick={clearRecycle}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] text-red-600 transition-colors hover:bg-red-50"
                  >
                    清空回收站
                  </button>
                )}
                <button onClick={() => setShowRecycle(false)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[582px] min-h-0 overflow-y-auto p-5">
              {recycleItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-300">
                  <Trash2 className="mb-3 h-10 w-10" />
                  <p className="text-sm">回收站为空</p>
                </div>
              ) : (
                <div
                  className="grid min-h-[542px] auto-rows-[170px] gap-4"
                  style={{ gridTemplateColumns: `repeat(${recycleColumnCount}, minmax(0, 1fr))` }}
                >
                  {recycleItems.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => setRecycleDetail(item)}
                      className="h-[170px] cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light/20"
                    >
                      <div className="flex h-full flex-col">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-bold text-gray-900">{item.title}</h4>
                            <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                              {item.wordCount} 字
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {item.chapter || item.novelTitle || '未记录来源'} · 删除于{' '}
                            {item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-'}
                          </p>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">
                            {prepareModalText(item.content) || item.content}
                          </p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              restoreItem(item.id);
                            }}
                            className="rounded-lg border border-brand/30 px-2 py-1.5 text-[11px] text-brand transition-colors hover:bg-brand-light"
                          >
                            恢复
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              permanentDeleteItem(item.id);
                            }}
                            className="rounded-lg border border-red-200 px-2 py-1.5 text-[11px] text-red-600 transition-colors hover:bg-red-50"
                          >
                            永久删除
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {recycleDetail && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35"
          onClick={() => setRecycleDetail(null)}
        >
          <div
            className="flex max-h-[82vh] w-[760px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-gray-900">{recycleDetail.title}</h3>
                <p className="mt-1 text-[11px] text-gray-400">
                  {recycleDetail.wordCount} 字 · {recycleDetail.chapter || recycleDetail.novelTitle || '未记录来源'}
                </p>
              </div>
              <button onClick={() => setRecycleDetail(null)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="whitespace-pre-wrap break-words rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-7 text-gray-800">
                {prepareModalText(recycleDetail.content) || recycleDetail.content || '暂无内容'}
              </div>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[400px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">清空剧情库</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">剧情点会先移入回收站</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                <span className="text-xs text-gray-600">将删除</span>
                <span className="text-sm font-bold text-red-600">{items.length}</span>
                <span className="text-xs text-gray-600">条剧情点，可在回收站恢复</span>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                  setShowDetail(null);
                }}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> 确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
