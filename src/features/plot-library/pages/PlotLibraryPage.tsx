import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, ArrowUpDown, Check, Edit3, Library, Minus, Plus, Search,
  Tag, Trash2, X,
} from 'lucide-react';

import { usePlotLibrary } from '@/features/plot-library/hooks/usePlotLibrary';
import type { PlotLibraryItem } from '@/features/plot-library/model/plotLibraryTypes';

type SortMode = 'time' | 'wordCount-desc' | 'wordCount-asc' | 'score-desc' | 'score-asc';

function extractScore(content: string): number | null {
  const match = content.match(/平均分[:：]\s*(\d+)/);
  if (match) return parseInt(match[1], 10);
  const m2 = content.match(/评分[:：]\s*(\d+)/);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function extractPlotTags(content: string): string[] {
  if (!content) return [];
  const blocks = Array.from(content.matchAll(/<bq>([\s\S]*?)<\/bq>/g));
  if (blocks.length === 0) return [];
  const tags = blocks.flatMap((match) => (
    match[1]
      .replace(/标签[:：]/g, '')
      .split(/[#＃、\s，,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length < 20)
  ));
  return Array.from(new Set(tags)).slice(0, 8);
}

function isRedundantModalMetaLine(line: string) {
  const trimmed = line.trim();
  return (
    /^【?评分】?\s*[:：]?\s*\d{0,3}\s*$/.test(trimmed) ||
    /^评分\s*[:：]\s*\d{1,3}\s*$/.test(trimmed) ||
    /^【?主题标签】?\s*[:：]?.*$/.test(trimmed) ||
    /^主题标签\s*[:：].*$/.test(trimmed) ||
    /^【?标签】?\s*[:：]?.*$/.test(trimmed)
  );
}

function prepareModalText(rawText: string): string {
  if (!rawText) return '';
  let cleanText = rawText;
  cleanText = cleanText.replace(/<fs>[\s\S]*?<\/fs>/g, '');
  cleanText = cleanText.replace(/<bq>[\s\S]*?<\/bq>/g, '');
  cleanText = cleanText
    .split('\n')
    .filter((line) => !isRedundantModalMetaLine(line))
    .join('\n');
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  return cleanText.trim();
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[＃#【】「」『』《》，,。.!！?？:：;；、\s]+/g, ' ')
    .trim();
}

function buildPlotSearchText(item: PlotLibraryItem) {
  return normalizeSearchText([
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
  ].join(' '));
}

function matchesSearch(item: PlotLibraryItem, keyword: string) {
  const terms = normalizeSearchText(keyword).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = buildPlotSearchText(item);
  return terms.every((term) => haystack.includes(term));
}

function extractFsScores(content: string): Record<string, string> | null {
  if (!content) return null;
  const match = content.match(/<fs>([\s\S]*?)<\/fs>/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const scores: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^([^：:]+)[：:]\s*(.+)$/);
    if (m) scores[m[1].trim()] = m[2].trim();
  }
  return Object.keys(scores).length > 0 ? scores : null;
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

interface PlotLibraryPageProps {
  embedded?: boolean;
}

export function PlotLibraryPage({ embedded = false }: PlotLibraryPageProps = {}) {
  const { items, recycleItems, deleteItem, updateItem, clearAll, restoreItem, permanentDeleteItem, clearRecycle } = usePlotLibrary();
  const [toolbarTarget, setToolbarTarget] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRecycle, setShowRecycle] = useState(false);
  const [showDetail, setShowDetail] = useState<PlotLibraryItem | null>(null);
  const [recycleDetail, setRecycleDetail] = useState<PlotLibraryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modalFontSize, setModalFontSize] = useState(13);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const tagNav = useMemo(() => buildTagNav(items), [items]);
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
  }, [items, search, sortMode, activeTagFilter]);

  const toolbar = (
    <div className="flex items-center gap-2">
      <div className="relative w-48">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索..."
          className="h-8 w-full rounded-lg border border-gray-200 pl-8 pr-6 text-xs focus:border-brand focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm leading-10 focus:border-brand focus:outline-none"
        >
          <option className="h-10 py-2 text-sm" value="time">最新</option>
          <option className="h-10 py-2 text-sm" value="wordCount-desc">字数多</option>
          <option className="h-10 py-2 text-sm" value="wordCount-asc">字数少</option>
          <option className="h-10 py-2 text-sm" value="score-desc">评分高</option>
          <option className="h-10 py-2 text-sm" value="score-asc">评分低</option>
        </select>
      </div>
      <button
        onClick={() => setShowRecycle(true)}
        className="flex h-8 items-center gap-1 rounded-lg bg-slate-100 px-3 text-[11px] text-slate-600 transition-colors hover:bg-slate-200"
      >
        <Trash2 className="h-3 w-3" /> 回收站{recycleItems.length > 0 ? ` ${recycleItems.length}` : ''}
      </button>
      {items.length > 0 && (
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex h-8 items-center gap-1 rounded-lg bg-red-50 px-3 text-[11px] text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-3 w-3" /> 清空
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {embedded && toolbarTarget ? createPortal(toolbar, toolbarTarget) : null}
      {(!embedded || !toolbarTarget) && <div className={`flex ${embedded ? 'h-14' : 'h-16'} shrink-0 items-center border-b border-gray-200 bg-white px-6`}>
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
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索..."
                className="h-8 w-full rounded-lg border border-gray-200 pl-8 pr-6 text-xs focus:border-brand focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm leading-10 focus:border-brand focus:outline-none"
              >
                <option className="h-10 py-2 text-sm" value="time">最新</option>
                <option className="h-10 py-2 text-sm" value="wordCount-desc">字数多</option>
                <option className="h-10 py-2 text-sm" value="wordCount-asc">字数少</option>
                <option className="h-10 py-2 text-sm" value="score-desc">评分高</option>
                <option className="h-10 py-2 text-sm" value="score-asc">评分低</option>
              </select>
            </div>
            <button
              onClick={() => setShowRecycle(true)}
              className="flex h-8 items-center gap-1 rounded-lg bg-slate-100 px-3 text-[11px] text-slate-600 transition-colors hover:bg-slate-200"
            >
              <Trash2 className="w-3 h-3" /> 回收站{recycleItems.length > 0 ? ` ${recycleItems.length}` : ''}
            </button>
            {items.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex h-8 items-center gap-1 rounded-lg bg-red-50 px-3 text-[11px] text-red-600 transition-colors hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3" /> 清空
              </button>
            )}
          </div>
        </div>
      </div>}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-[198px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => setActiveTagFilter(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                activeTagFilter === null
                  ? 'bg-brand text-white'
                  : 'hover:bg-gray-50 text-gray-700'
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
                  activeTagFilter === tag
                    ? 'bg-brand text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm truncate flex-1 min-w-0">{tag}</span>
                <span className={`text-xs shrink-0 ml-1 ${activeTagFilter === tag ? 'text-white/80' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            ))}
            {tagNav.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-300">暂无标签</div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <Library className="w-12 h-12 mb-2" />
              <p className="text-sm">
                {items.length === 0 ? '暂无剧情点，在提炼页面导入' : '没有匹配的剧情点'}
              </p>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {filtered.filter((item) => item.content.trim().length > 0).map((item) => {
                const tags = extractPlotTags(item.content);
                const fsScores = extractFsScores(item.content);
                const averageScore = findAverageScore(fsScores);
                return (
                  <button
                    key={item.id}
                    onClick={() => setShowDetail(item)}
                    className="w-full overflow-hidden text-left bg-white rounded-lg border border-gray-200 hover:border-brand hover:shadow-md transition-all group flex flex-col min-h-[150px]"
                  >
                    <div className="relative flex w-full flex-1 min-h-0">
                      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gray-200" />
                      {fsScores ? (
                        <div className="w-1/2 min-w-0 bg-gray-50/30 flex flex-col">
                          <div className="flex items-center justify-between border-b border-gray-100 px-2.5 py-2 leading-none">
                            <span className="text-[13px] text-gray-400">字数</span>
                            <span className="text-[15px] font-bold text-gray-900">{item.wordCount}</span>
                          </div>
                          <div className="flex flex-1 flex-col justify-center gap-1.5 p-2.5 pt-2 pb-0">
                            {Object.entries(fsScores).filter(([key]) => !isAverageScoreKey(key)).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between leading-none">
                                <span className="text-[15px] text-gray-500">{key}</span>
                                <span className={`text-[15px] font-bold ${
                                  isScoringDimension(key) ? getScoreColor(value) : 'text-gray-800'
                                }`}>{value}</span>
                              </div>
                            ))}
                          </div>
                          {averageScore && (
                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-2.5 py-2 leading-none">
                              <span className="text-[13px] text-gray-400">平均分</span>
                              <span className={`text-[15px] font-bold ${getScoreColor(averageScore)}`}>{averageScore}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-1/2 min-w-0 p-2.5 bg-gray-50/30 flex items-center justify-center">
                          <span className="text-[11px] text-gray-400">无评分</span>
                        </div>
                      )}
                      <div className="w-1/2 min-w-0 p-2.5 flex flex-col justify-center gap-2">
                        {tags.length > 0 ? (
                          tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-[14px] rounded-full text-center leading-none"
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => { setShowDetail(null); setEditingId(null); }}>
          <div className="w-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">剧情点</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">{showDetail.chapter}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{showDetail.wordCount} 字</span>
                </div>
              </div>
              <div className="flex min-w-[270px] items-center justify-end gap-2">
                {editingId === showDetail.id ? (
                  <>
                    <button
                      onClick={() => {
                        updateItem(showDetail.id, { content: editContent });
                        setEditingId(null);
                        setShowDetail({ ...showDetail, content: editContent, wordCount: editContent.length });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
                    >
                      <Check className="w-3 h-3" /> 保存
                    </button>
                    <button
                      onClick={() => { setEditingId(null); }}
                      className="px-3 py-1.5 text-[11px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => setModalFontSize((s) => Math.max(MIN_FONT_SIZE, s - 1))}
                        disabled={modalFontSize <= MIN_FONT_SIZE}
                        className="flex items-center justify-center px-2.5 py-1.5 text-gray-500 hover:text-brand hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="减小字号"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] text-gray-500 px-1 min-w-[22px] text-center tabular-nums font-medium">
                        {modalFontSize}
                      </span>
                      <button
                        onClick={() => setModalFontSize((s) => Math.min(MAX_FONT_SIZE, s + 1))}
                        disabled={modalFontSize >= MAX_FONT_SIZE}
                        className="flex items-center justify-center px-2.5 py-1.5 text-gray-500 hover:text-brand hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="放大字号"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => { setEditingId(showDetail.id); setEditContent(showDetail.content); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> 编辑
                    </button>
                    <button
                      onClick={() => { deleteItem(showDetail.id); setShowDetail(null); setEditingId(null); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> 删除
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setShowDetail(null); setEditingId(null); }}
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
                  {prepareModalText(showDetail.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRecycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowRecycle(false)}>
          <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl" style={{ width: `min(${recycleModalWidth}px, 94vw)` }} onClick={(e) => e.stopPropagation()}>
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
                <div className="grid min-h-[542px] auto-rows-[170px] gap-4" style={{ gridTemplateColumns: `repeat(${recycleColumnCount}, minmax(0, 1fr))` }}>
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
                            <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{item.wordCount} 字</span>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {item.chapter || item.novelTitle || '未记录来源'} · 删除于 {item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-'}
                          </p>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">{prepareModalText(item.content) || item.content}</p>
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35" onClick={() => setRecycleDetail(null)}>
          <div className="flex max-h-[82vh] w-[760px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-gray-900">{recycleDetail.title}</h3>
                <p className="mt-1 text-[11px] text-gray-400">{recycleDetail.wordCount} 字 · {recycleDetail.chapter || recycleDetail.novelTitle || '未记录来源'}</p>
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
                onClick={() => { clearAll(); setShowClearConfirm(false); setShowDetail(null); }}
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
