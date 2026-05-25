import { BookMarked, ChevronDown, ChevronRight, Download, FileText, Play, RotateCcw, Settings, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SortableExtractModule } from '@/features/extract/components/SortableExtractModule';
import { useExtractModules } from '@/features/extract/hooks/useExtractModules';
import { useExtractNovels } from '@/features/extract/hooks/useExtractNovels';
import { loadExtractFiles, saveExtractFiles } from '@/features/extract/model/extractFileStorage';
import type { ExtractModule } from '@/features/extract/model/extractTypes';
import { readModelSnapshot } from '@/features/models/hooks/useModels';
import type { ModelItem } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { savePlotItems } from '@/features/plot-library/hooks/usePlotLibrary';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ExtractMode = 'chapter' | 'multi' | 'smart';
type OutputMode = 'single' | 'book' | 'multi';

interface UploadFileItem {
  id: string;
  name: string;
  content: string;
  selected: boolean;
}

interface ExtractResultItem {
  id: string;
  chapterTitle: string;
  content: string;
}

interface ExtractJob {
  id: string;
  name: string;
  content: string;
  sourceFile: string;
}

interface ExtractHistoryItem {
  id: string;
  timestamp: number;
  fileNames: string[];
  extractModeLabel: string;
  resultCount: number;
  results: ExtractResultItem[];
  novelTitle?: string | null;
}

const HISTORY_KEY = 'xinyuexia_extract_history_v1';
const EXTRACT_MODEL_KEY = 'xinyuexia_extract_selected_model';
const EXTRACT_PREVIEW_COLLAPSE_KEY = 'xinyuexia_extract_preview_collapsed';
const EXTRACT_SELECTED_NOVEL_KEY = 'xinyuexia_extract_selected_novel';
const EXTRACT_MODE_KEY = 'xinyuexia_extract_mode';
const EXTRACT_OUTPUT_MODE_KEY = 'xinyuexia_extract_output_mode';
const EXTRACT_BATCH_SIZE_KEY = 'xinyuexia_extract_batch_size';
const EXTRACT_POINTS_PER_FILE_KEY = 'xinyuexia_extract_points_per_file';
const MAX_UPLOAD_HISTORY = 20;

interface ExtractRuntimeState {
  isExtracting: boolean;
  isPaused: boolean;
  extractProgress: string;
  results: ExtractResultItem[];
  extractTotal: number;
  activeResultIndex: number;
  importedResultIds: string[];
}

const extractRuntimeListeners = new Set<(state: ExtractRuntimeState) => void>();
let extractRuntimeState: ExtractRuntimeState = {
  isExtracting: false,
  isPaused: false,
  extractProgress: '',
  results: [],
  extractTotal: 0,
  activeResultIndex: 0,
  importedResultIds: [],
};
let extractCancelRequested = false;
let extractPauseRequested = false;
let extractResumeWaiters: Array<() => void> = [];
let extractAbortController: AbortController | null = null;

function emitExtractRuntime(next: Partial<ExtractRuntimeState>) {
  extractRuntimeState = { ...extractRuntimeState, ...next };
  extractRuntimeListeners.forEach((listener) => listener(extractRuntimeState));
}

function subscribeExtractRuntime(listener: (state: ExtractRuntimeState) => void) {
  extractRuntimeListeners.add(listener);
  listener(extractRuntimeState);
  return () => {
    extractRuntimeListeners.delete(listener);
  };
}

function requestExtractStop() {
  extractCancelRequested = true;
  extractPauseRequested = false;
  extractAbortController?.abort();
  extractResumeWaiters.splice(0).forEach((resume) => resume());
  emitExtractRuntime({ isPaused: false, extractProgress: '正在中止提炼...' });
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function pauseExtractRun() {
  if (!extractRuntimeState.isExtracting || extractPauseRequested) return;
  extractPauseRequested = true;
  extractAbortController?.abort();
  emitExtractRuntime({ isPaused: true, extractProgress: '已暂停提炼，当前任务会在继续后重新提炼...' });
}

function resumeExtractRun() {
  if (!extractRuntimeState.isExtracting) return;
  extractPauseRequested = false;
  emitExtractRuntime({ isPaused: false, extractProgress: '继续提炼...' });
  extractResumeWaiters.splice(0).forEach((resume) => resume());
}

async function waitIfExtractPaused(doneCount: number, totalCount: number) {
  while (extractPauseRequested && !extractCancelRequested) {
    emitExtractRuntime({
      isPaused: true,
      extractProgress: `已暂停提炼，已完成 ${doneCount}/${totalCount}`,
    });
    await new Promise<void>((resolve) => {
      extractResumeWaiters.push(resolve);
    });
  }
}

function readEnabledModels() {
  return readModelSnapshot().filter((model) => model.enabled);
}

function readHistory(): ExtractHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ExtractHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: ExtractHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

function buildSystemPrompt(modules: ExtractModule[]) {
  return modules
    .filter((module) => module.active && module.zone === 'system')
    .map((module) => `【${module.label}】\n${module.instruction.trim()}`)
    .join('\n\n');
}

function buildExtractRequest(file: ExtractJob, modules: ExtractModule[]) {
  const outputModules = modules.filter((module) => module.active && module.zone === 'output');
  return [
    '请阅读以下章节正文，并按要求输出提炼结果。',
    `文件名：${file.name}`,
    '',
    '【输出模块】',
    ...outputModules.map((module) => `【${module.label}】\n${module.instruction.trim()}`),
    '',
    '【正文】',
    file.content.trim() || '暂无正文',
  ].join('\n');
}

const CHAPTER_TITLE_REGEX =
  /(?:^|\n)\s*((?:第[一二三四五六七八九十百千万零\d]+章|第\d+章|Chapter\s+\d+|序章|楔子|引子|开篇|终章|尾声)[^\n]*)/gi;

function splitChapters(file: UploadFileItem): ExtractJob[] {
  const matches: { index: number; title: string; raw: string }[] = [];
  const regex = new RegExp(CHAPTER_TITLE_REGEX.source, 'gi');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(file.content)) !== null) {
    matches.push({
      index: match.index,
      title: (match[1] ?? match[0]).trim(),
      raw: match[0],
    });
  }
  if (matches.length === 0) return [{ id: file.id, name: file.name, content: file.content, sourceFile: file.name }];
  return matches.map((current, index) => {
    const start = current.index + current.raw.length;
    const end = index < matches.length - 1 ? matches[index + 1].index : file.content.length;
    return {
      id: `${file.id}-chapter-${index}`,
      name: current.title || `${file.name} 第${index + 1}章`,
      content: file.content.slice(start, end).trim(),
      sourceFile: file.name,
    };
  });
}

function estimateDensity(content: string) {
  const highWords = ['反杀', '决战', '真相', '暴露', '死亡', '背叛', '突破', '崩溃', '爆发', '危机', '杀', '血', '恨'];
  const hitCount = highWords.reduce((sum, word) => sum + (content.includes(word) ? 1 : 0), 0);
  if (hitCount >= 3 || content.length > 3000) return 'high';
  if (hitCount >= 1 || content.length > 1200) return 'mid';
  return 'low';
}

function mergeJobs(jobs: ExtractJob[], batchSize: number, label: string): ExtractJob[] {
  const batches: ExtractJob[] = [];
  for (let index = 0; index < jobs.length; index += batchSize) {
    const group = jobs.slice(index, index + batchSize);
    batches.push({
      id: `${group[0]?.id ?? 'batch'}-${label}-${index}`,
      name: group.length === 1 ? group[0].name : `${group[0].name} ~ ${group[group.length - 1].name}`,
      sourceFile: group[0]?.sourceFile ?? label,
      content: group.map((job) => `【${job.name}】\n${job.content}`).join('\n\n---\n\n'),
    });
  }
  return batches;
}

function buildSmartBatches(jobs: ExtractJob[]) {
  const batches: ExtractJob[] = [];
  let index = 0;
  while (index < jobs.length) {
    const current = jobs[index];
    const density = estimateDensity(current.content);
    if (density === 'high') {
      batches.push(current);
      index += 1;
      continue;
    }
    const group = [current];
    let totalLength = current.content.length;
    while (index + group.length < jobs.length && group.length < 5 && totalLength < 12000) {
      const next = jobs[index + group.length];
      if (estimateDensity(next.content) === 'high') break;
      group.push(next);
      totalLength += next.content.length;
      if (group.length >= 2 && totalLength > 3500) break;
    }
    batches.push(group.length === 1 ? current : mergeJobs(group, group.length, 'smart')[0]);
    index += group.length;
  }
  return batches;
}

function buildExtractJobs(files: UploadFileItem[], mode: ExtractMode, chaptersPerBatch: number) {
  const chapterJobs = files.flatMap(splitChapters).filter((job) => job.content.trim());
  if (mode === 'multi') return mergeJobs(chapterJobs, Math.max(2, chaptersPerBatch), 'multi');
  if (mode === 'smart') return buildSmartBatches(chapterJobs);
  return chapterJobs;
}

async function extractTextFromFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt') return file.text();
  const arrayBuffer = await file.arrayBuffer();
  const utf8 = new TextDecoder('utf-8').decode(arrayBuffer);
  const xmlMatches = utf8.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (xmlMatches?.length) return xmlMatches.map((item) => item.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('');
  const plainText = utf8.replace(/[^\u4e00-\u9fff\w\s，。！？、：；“”《》#<>\-/]/g, '');
  return plainText.trim();
}

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeUploadHistory(files: UploadFileItem[]) {
  const map = new Map<string, UploadFileItem>();
  files.forEach((file) => {
    map.delete(`${file.name}__${file.content.length}`);
    map.set(`${file.name}__${file.content.length}`, file);
  });
  return Array.from(map.values()).slice(-MAX_UPLOAD_HISTORY);
}

function LinkNovelModal({
  isOpen,
  novels,
  selectedNovelId,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  novels: ReturnType<typeof useExtractNovels>;
  selectedNovelId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-[520px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">关联小说</h3>
          <p className="mt-1 text-xs text-gray-400">选择当前提炼任务要关联的小说。</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {novels
              .filter((novel) => novel.type === 'novel')
              .map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => {
                    onSelect(novel.id);
                    onClose();
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    selectedNovelId === novel.id
                      ? 'border-brand bg-brand-light/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">{novel.title}</div>
                  <div className="mt-1 text-[11px] text-gray-400">{novel.chapters.length} 章</div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterSelectModal({
  isOpen,
  novel,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  novel: ReturnType<typeof useExtractNovels>[number] | null;
  onClose: () => void;
  onConfirm: (chapterIds: number[]) => void;
}) {
  const chapters = useMemo(() => novel?.chapters.filter((chapter) => chapter.content.trim()) ?? [], [novel]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setCollapsedGroups({});
  }, [isOpen, novel?.id]);

  if (!isOpen || !novel) return null;

  const selectedSet = new Set(selectedIds);

  const toggleOne = (chapterId: number) => {
    setSelectedIds((prev) => (
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    ));
  };

  const toggleRange = (ids: number[]) => {
    setSelectedIds((prev) => {
      const current = new Set(prev);
      const allSelected = ids.every((id) => current.has(id));
      ids.forEach((id) => {
        if (allSelected) current.delete(id);
        else current.add(id);
      });
      return chapters.map((chapter) => chapter.id).filter((id) => current.has(id));
    });
  };

  const rangeGroups = (size: number) => {
    const groups: Array<{ label: string; ids: number[] }> = [];
    for (let index = 0; index < chapters.length; index += size) {
      const group = chapters.slice(index, index + size);
      groups.push({
        label: `${group[0].serialNumber}-${group[group.length - 1].serialNumber}章`,
        ids: group.map((chapter) => chapter.id),
      });
    }
    return groups;
  };

  const chapterGroups = rangeGroups(100);

  const toggleGroupCollapse = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[76vh] w-[820px] max-w-[94vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">选择关联小说章节</h3>
            <p className="mt-1 text-xs text-gray-400">《{novel.title}》可载入 {chapters.length} 章，已选择 {selectedIds.length} 章。</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button onClick={() => setSelectedIds(chapters.map((chapter) => chapter.id))} className="rounded-lg border border-brand/30 px-3 py-1.5 text-xs text-brand hover:bg-brand-light">
              全选
            </button>
            <button onClick={() => setSelectedIds([])} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
              清空
            </button>
            <button onClick={() => toggleRange(chapters.slice(0, 10).map((chapter) => chapter.id))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              前 10 章
            </button>
            <button onClick={() => toggleRange(chapters.slice(0, 50).map((chapter) => chapter.id))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              前 50 章
            </button>
          </div>
          <div className="space-y-2">
            {[10, 50].map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] text-gray-400">每 {size} 章</span>
                {rangeGroups(size).map((group) => {
                  const allSelected = group.ids.every((id) => selectedSet.has(id));
                  return (
                    <button
                      key={`${size}-${group.label}`}
                      onClick={() => toggleRange(group.ids)}
                      className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                        allSelected
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {chapters.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              当前小说没有可载入的章节正文
            </div>
          ) : (
            <div className="space-y-3">
              {chapterGroups.map((group) => {
                const groupChapters = chapters.filter((chapter) => group.ids.includes(chapter.id));
                const collapsed = collapsedGroups[group.label] ?? false;
                const selectedCount = group.ids.filter((id) => selectedSet.has(id)).length;
                const allSelected = selectedCount === group.ids.length;

                return (
                  <section key={group.label} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
                      <button
                        onClick={() => toggleGroupCollapse(group.label)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        title={collapsed ? '展开分组' : '折叠分组'}
                      >
                        {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                        <span className="text-xs font-bold text-gray-700">{group.label}</span>
                        <span className="text-[10px] text-gray-400">{selectedCount}/{group.ids.length}</span>
                      </button>
                      <button
                        onClick={() => toggleRange(group.ids)}
                        className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                          allSelected
                            ? 'border-brand bg-brand-light text-brand'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {allSelected ? '取消本组' : '选择本组'}
                      </button>
                    </div>

                    {!collapsed && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(34px,1fr))] gap-1.5 p-3">
                        {groupChapters.map((chapter) => (
                          <button
                            key={chapter.id}
                            onClick={() => toggleOne(chapter.id)}
                            title={`第${chapter.serialNumber}章 ${chapter.title || '未命名'} · ${chapter.wordCount || chapter.content.length} 字`}
                            className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                              selectedSet.has(chapter.id)
                                ? 'border-brand bg-brand text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-brand/50 hover:text-brand'
                            }`}
                          >
                            {chapter.serialNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-white">
            取消
          </button>
          <button
            onClick={() => onConfirm(selectedIds)}
            disabled={selectedIds.length === 0}
            className="rounded-md bg-brand px-5 py-1.5 text-sm text-white hover:bg-brand-dark disabled:bg-gray-300"
          >
            载入选中章节
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExtractPage() {
  const navigate = useNavigate();
  const novels = useExtractNovels();
  const {
    modules,
    activeModules,
    updateModule,
    toggleActive,
    moveModule,
    resetExtractModules,
  } = useExtractModules();

  const [models, setModels] = useState<ModelItem[]>(readEnabledModels);
  const [selectedModelId, setSelectedModelId] = usePersistentState<string>(EXTRACT_MODEL_KEY, '');
  const [selectedNovelId, setSelectedNovelId] = usePersistentState<number | null>(
    EXTRACT_SELECTED_NOVEL_KEY,
    novels.find((novel) => novel.type === 'novel')?.id ?? null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(modules[0]?.id ?? null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragBaseModules, setDragBaseModules] = useState<ExtractModule[] | null>(null);
  const [moduleDraft, setModuleDraft] = useState({ label: '', instruction: '' });
  const [extractMode, setExtractMode] = usePersistentState<ExtractMode>(EXTRACT_MODE_KEY, 'chapter');
  const [outputMode, setOutputMode] = usePersistentState<OutputMode>(EXTRACT_OUTPUT_MODE_KEY, 'single');
  const [chaptersPerBatch, setChaptersPerBatch] = usePersistentState<number>(EXTRACT_BATCH_SIZE_KEY, 3);
  const [pointsPerFile, setPointsPerFile] = usePersistentState<number>(EXTRACT_POINTS_PER_FILE_KEY, 2);
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [history, setHistory] = useState<ExtractHistoryItem[]>(readHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [showLinkNovel, setShowLinkNovel] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [extractProgress, setExtractProgress] = useState(extractRuntimeState.extractProgress);
  const [isExtracting, setIsExtracting] = useState(extractRuntimeState.isExtracting);
  const [isExtractPaused, setIsExtractPaused] = useState(extractRuntimeState.isPaused);
  const [saveMessage, setSaveMessage] = useState('');
  const [results, setResults] = useState<ExtractResultItem[]>(extractRuntimeState.results);
  const [showExtractConfirm, setShowExtractConfirm] = useState(false);
  const [extractTotal, setExtractTotal] = useState(extractRuntimeState.extractTotal);
  const [activeResultIndex, setActiveResultIndex] = useState(extractRuntimeState.activeResultIndex);
  const [importedResultIds, setImportedResultIds] = useState<string[]>(extractRuntimeState.importedResultIds);
  const [isModulePreviewOpen, setIsModulePreviewOpen] = useState(false);
  const [collapsedPreviewIds, setCollapsedPreviewIds] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(EXTRACT_PREVIEW_COLLAPSE_KEY) ?? '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const syncModels = () => setModels(readEnabledModels());
    window.addEventListener(APP_EVENTS.modelsUpdated, syncModels);
    return () => window.removeEventListener(APP_EVENTS.modelsUpdated, syncModels);
  }, []);

  useEffect(() => {
    if (!selectedModelId && models[0]) setSelectedModelId(models[0].id);
  }, [models, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    if (!selectedModuleId && modules[0]) setSelectedModuleId(modules[0].id);
  }, [modules, selectedModuleId]);

  useEffect(() => {
    localStorage.setItem(EXTRACT_PREVIEW_COLLAPSE_KEY, JSON.stringify(collapsedPreviewIds));
  }, [collapsedPreviewIds]);

  useEffect(() => subscribeExtractRuntime((state) => {
    setIsExtracting(state.isExtracting);
    setIsExtractPaused(state.isPaused);
    setExtractProgress(state.extractProgress);
    setResults(state.results);
    setExtractTotal(state.extractTotal);
    setActiveResultIndex(state.activeResultIndex);
    setImportedResultIds(state.importedResultIds);
  }), []);

  useEffect(() => {
    let mounted = true;
    void loadExtractFiles()
      .then((storedFiles) => {
        if (mounted) setFiles(normalizeUploadHistory(storedFiles));
      })
      .finally(() => {
        if (mounted) setFilesLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persistFiles = useCallback((updater: (prev: UploadFileItem[]) => UploadFileItem[]) => {
    setFiles((prev) => {
      const next = normalizeUploadHistory(updater(prev));
      if (filesLoaded) void saveExtractFiles(next);
      return next;
    });
  }, [filesLoaded]);

  const selectedModel = models.find((model) => model.id === selectedModelId) ?? null;
  const orderedModels = useMemo(() => {
    if (!selectedModelId) return models;
    const selected = models.find((model) => model.id === selectedModelId);
    if (!selected) return models;
    return [selected, ...models.filter((model) => model.id !== selectedModelId)];
  }, [models, selectedModelId]);
  const selectedNovel = novels.find((novel) => novel.id === selectedNovelId) ?? null;
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? null;

  useEffect(() => {
    if (!selectedModule) {
      setModuleDraft({ label: '', instruction: '' });
      return;
    }
    setModuleDraft({
      label: selectedModule.label,
      instruction: selectedModule.instruction,
    });
  }, [selectedModule?.id, selectedModule?.label, selectedModule?.instruction]);

  const displayedModules = useMemo(() => {
    const sourceModules = dragBaseModules ?? modules;
    if (!draggingId || !dragOverId || draggingId === dragOverId) return sourceModules;
    const current = [...sourceModules];
    const from = current.findIndex((module) => module.id === draggingId);
    const to = current.findIndex((module) => module.id === dragOverId);
    if (from < 0 || to < 0) return sourceModules;
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    return current;
  }, [dragBaseModules, draggingId, dragOverId, modules]);

  const selectedFiles = files.filter((file) => file.selected);
  const previewModules = activeModules.filter((module) => module.zone === 'output');
  const pendingImportResults = results.filter((result) => !importedResultIds.includes(result.id));

  const canExtract = Boolean(
    selectedModel &&
    selectedFiles.length > 0 &&
    activeModules.some((module) => module.zone === 'output') &&
    !isExtracting,
  );

  const handleToggleZone = (id: string) => {
    const target = modules.find((module) => module.id === id);
    if (!target) return;
    updateModule(id, { zone: target.zone === 'system' ? 'output' : 'system' });
  };

  const handleTogglePreviewHidden = (id: string) => {
    const target = modules.find((module) => module.id === id);
    if (!target) return;
    updateModule(id, { hidePreview: !target.hidePreview });
  };

  const handleDropModule = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    moveModule(draggingId, targetId);
    setDraggingId(null);
    setDragOverId(null);
    setDragBaseModules(null);
  };

  const handleSaveModuleDraft = () => {
    if (!selectedModule) return;
    const nextLabel = moduleDraft.label.trim() || selectedModule.label;
    updateModule(selectedModule.id, {
      label: nextLabel,
      instruction: moduleDraft.instruction,
    });
    setSaveMessage(`已保存模块：${nextLabel}`);
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const nextFiles: UploadFileItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!/\.(txt|doc|docx)$/i.test(file.name)) continue;
      const content = await extractTextFromFile(file);
      if (!content.trim()) continue;
      nextFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        content,
        selected: true,
      });
    }

    if (nextFiles.length === 0) return;

    persistFiles((prev) => {
      const existingMap = new Map(prev.map((item) => [`${item.name}__${item.content.length}`, item]));
      const merged = [...prev];
      nextFiles.forEach((item) => {
        const key = `${item.name}__${item.content.length}`;
        if (existingMap.has(key)) {
          merged.forEach((existing, index) => {
            if (`${existing.name}__${existing.content.length}` === key) {
              merged[index] = { ...existing, selected: true };
            }
          });
        } else {
          merged.push(item);
        }
      });
      return merged;
    });

    setSaveMessage(`已保存 ${nextFiles.length} 个文件，可在下方直接重复选择。`);
  };

  const handleLoadNovelChapters = (chapterIds: number[]) => {
    if (!selectedNovel) return;
    const idSet = new Set(chapterIds);
    const nextFiles = selectedNovel.chapters
      .filter((chapter) => idSet.has(chapter.id) && chapter.content.trim())
      .map((chapter) => ({
        id: `novel-${selectedNovel.id}-${chapter.id}-${Date.now()}`,
        name: `第${chapter.serialNumber}章 ${chapter.title || '未命名'}.txt`,
        content: chapter.content,
        selected: true,
      }));
    if (nextFiles.length === 0) {
      setSaveMessage('关联小说暂无可载入的章节正文。');
      return;
    }
    persistFiles((prev) => [...prev, ...nextFiles]);
    setSaveMessage(`已从《${selectedNovel.title}》载入 ${nextFiles.length} 章。`);
    setShowChapterSelect(false);
  };

  const handleExportResults = () => {
    if (results.length === 0) {
      setSaveMessage('暂无可导出的提炼结果。');
      return;
    }
    const safeTitle = (selectedNovel?.title || '提炼结果').replace(/[\\/:*?"<>|]/g, '_');
    const toText = (items: ExtractResultItem[]) => items.map((item, index) => [
      `# 剧情点 ${index + 1}`,
      `来源：${item.chapterTitle}`,
      '',
      item.content.trim(),
      '',
    ].join('\n')).join('\n---\n\n');

    if (outputMode === 'book') {
      downloadText(`${safeTitle}_剧情提炼.txt`, toText(results));
      setSaveMessage('已导出整书提炼结果。');
      return;
    }

    if (outputMode === 'multi') {
      mergeJobs(results.map((result) => ({
        id: result.id,
        name: result.chapterTitle,
        content: result.content,
        sourceFile: safeTitle,
      })), Math.max(1, pointsPerFile), 'export').forEach((group, index) => {
        downloadText(`${safeTitle}_剧情提炼_${index + 1}.txt`, group.content);
      });
      setSaveMessage(`已按每 ${pointsPerFile} 条导出。`);
      return;
    }

    results.forEach((result, index) => {
      downloadText(`${safeTitle}_剧情点_${index + 1}.txt`, toText([result]));
    });
    setSaveMessage('已逐条导出提炼结果。');
  };

  const handleExtract = async () => {
    if (!selectedModel || !canExtract) return;
    extractCancelRequested = false;
    extractPauseRequested = false;
    extractAbortController?.abort();
    extractAbortController = null;
    setSaveMessage('');
    emitExtractRuntime({
      isExtracting: true,
      isPaused: false,
      results: [],
      activeResultIndex: 0,
      importedResultIds: [],
      extractProgress: '准备开始提炼...',
    });

    const systemPrompt = buildSystemPrompt(modules);
    const nextResults: ExtractResultItem[] = [];
    const jobs = buildExtractJobs(selectedFiles, extractMode, chaptersPerBatch);
    emitExtractRuntime({ extractTotal: jobs.length });

    for (let index = 0; index < jobs.length; index += 1) {
      if (extractCancelRequested) {
        emitExtractRuntime({ extractProgress: `已中止提炼，已完成 ${nextResults.length}/${jobs.length}` });
        break;
      }
      await waitIfExtractPaused(nextResults.length, jobs.length);
      if (extractCancelRequested) {
        emitExtractRuntime({ extractProgress: `已中止提炼，已完成 ${nextResults.length}/${jobs.length}` });
        break;
      }

      const file = jobs[index];
      emitExtractRuntime({ extractProgress: `正在处理 ${index + 1}/${jobs.length}：${file.name}` });
      try {
        extractAbortController = new AbortController();
        const content = await callModel({
          model: selectedModel,
          prompt: systemPrompt,
          userContent: buildExtractRequest(file, modules),
          signal: extractAbortController.signal,
        });
        if (extractCancelRequested) {
          emitExtractRuntime({ extractProgress: `已中止提炼，已完成 ${nextResults.length}/${jobs.length}` });
          break;
        }
        nextResults.push({ id: `${file.id}-${index}`, chapterTitle: file.name, content });
      } catch (error) {
        if (isAbortError(error) && extractPauseRequested && !extractCancelRequested) {
          emitExtractRuntime({ extractProgress: `已暂停提炼，已完成 ${nextResults.length}/${jobs.length}` });
          await waitIfExtractPaused(nextResults.length, jobs.length);
          index -= 1;
          continue;
        }
        if (isAbortError(error) || extractCancelRequested) {
          emitExtractRuntime({ extractProgress: `已中止提炼，已完成 ${nextResults.length}/${jobs.length}` });
          break;
        }
        nextResults.push({
          id: `${file.id}-${index}`,
          chapterTitle: file.name,
          content: error instanceof Error ? `【错误】${error.message}` : '【错误】模型请求失败。',
        });
      }

      emitExtractRuntime({
        results: [...nextResults],
        activeResultIndex: nextResults.length - 1,
      });
    }

    if (!extractCancelRequested) {
      const extractModeLabel =
        extractMode === 'chapter'
          ? '逐章提炼'
          : extractMode === 'multi'
            ? `每 ${chaptersPerBatch} 章合并`
            : '智能提炼';

      const nextHistory: ExtractHistoryItem[] = [
        {
          id: `${Date.now()}`,
          timestamp: Date.now(),
          fileNames: selectedFiles.map((file) => file.name),
          extractModeLabel,
          resultCount: nextResults.length,
          results: nextResults,
          novelTitle: selectedNovel?.title ?? null,
        },
        ...history,
      ].slice(0, 20);

      setHistory(nextHistory);
      writeHistory(nextHistory);
      emitExtractRuntime({ extractProgress: `提炼完成，共 ${nextResults.length} 条结果` });
    }

    extractPauseRequested = false;
    extractCancelRequested = false;
    extractAbortController = null;
    emitExtractRuntime({ isExtracting: false, isPaused: false });
  };

  const handleImportCurrentResults = () => {
    const importTargets = results.filter((result) => !importedResultIds.includes(result.id));
    if (importTargets.length === 0) {
      setSaveMessage('当前没有新的剧情点可导入。');
      return;
    }

    savePlotItems(importTargets.map((result, index) => ({
      title: `提炼剧情点 ${results.findIndex((item) => item.id === result.id) + 1}`,
      chapter: result.chapterTitle,
      novelTitle: selectedNovel?.title ?? '未关联小说',
      content: result.content,
      tags: [
        '提炼剧情',
        extractMode === 'chapter' ? '逐章提炼' : extractMode === 'multi' ? '合并提炼' : '智能提炼',
        outputMode === 'book' ? '整书导出' : `批次${index + 1}`,
      ],
    })));

    emitExtractRuntime({ importedResultIds: [...importedResultIds, ...importTargets.map((result) => result.id)] });
    setSaveMessage(`已导入剧情库：${importTargets.length} 条`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50" onClick={() => setSelectedModuleId(null)}>
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">提炼剧情</h1>
            <p className="mt-1 text-xs text-gray-400">勾选模块 → 上传文件 → 配置 → AI 提炼 → 导出</p>
          </div>

          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => {
                resetExtractModules();
                setSaveMessage('已恢复默认模块。');
              }}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 transition-colors hover:bg-gray-200"
            >
              <RotateCcw className="h-3 w-3" />
              恢复默认
            </button>
            <button
              onClick={() => setShowLinkNovel(true)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-colors"
              style={
                selectedNovel
                  ? { color: '#0084ff', backgroundColor: 'rgba(0,132,255,0.05)', borderColor: 'rgba(0,132,255,0.15)' }
                  : { color: '#6b7280', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }
              }
            >
              <BookMarked className="h-3 w-3" />
              <span>{selectedNovel?.title || '关联小说'}</span>
            </button>
            {selectedNovelId !== null && (
              <button
                onClick={() => setSelectedNovelId(null)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] text-red-600 transition-colors hover:bg-red-100"
              >
                取消关联
              </button>
            )}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 transition-colors hover:bg-gray-200"
            >
              <FileText className="h-3 w-3" />
              提炼历史
              {history.length > 0 && <span className="ml-0.5 text-[9px] text-gray-400">({history.length})</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <aside className="relative flex w-[240px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <section className="flex min-h-0 flex-1 flex-col border-b border-gray-200">
            <div className="border-b border-gray-100 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-gray-900">模块列表</div>
                  <button
                    onClick={() => setIsModulePreviewOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark"
                    title={isModulePreviewOpen ? '折叠模块预览' : '展开模块预览'}
                  >
                    <span>模块预览</span>
                    {isModulePreviewOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {displayedModules.map((module) => (
                <SortableExtractModule
                  key={module.id}
                  module={module}
                  isSelected={selectedModuleId === module.id}
                  isDragOver={dragOverId === module.id && draggingId !== module.id}
                  isDragging={draggingId === module.id}
                  onSelect={setSelectedModuleId}
                  onToggleActive={toggleActive}
                  onToggleZone={handleToggleZone}
                  onTogglePreviewHidden={handleTogglePreviewHidden}
                  onDragStart={(id) => {
                    setDragBaseModules(modules);
                    setDraggingId(id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                    setDragBaseModules(null);
                  }}
                  onDragOver={setDragOverId}
                  onDrop={handleDropModule}
                />
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-gray-100 px-3 py-3">
              <div className="text-sm font-bold text-gray-900">模块编辑</div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-3">
              {selectedModule ? (
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="shrink-0 text-xs font-medium text-gray-500">名称：</label>
                    <input
                      value={moduleDraft.label}
                      onChange={(event) => setModuleDraft((prev) => ({ ...prev, label: event.target.value }))}
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                    <button
                      onClick={handleSaveModuleDraft}
                      className="shrink-0 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark"
                    >
                      保存内容
                    </button>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col">
                    <label className="mb-1 block text-xs font-medium text-gray-500">模块内容</label>
                    <textarea
                      value={moduleDraft.instruction}
                      onChange={(event) => setModuleDraft((prev) => ({ ...prev, instruction: event.target.value }))}
                      className="h-full min-h-0 flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 outline-none focus:border-brand"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">请选择一个模块</div>
              )}
            </div>
          </section>

          {isModulePreviewOpen && (
            <div className="absolute inset-0 z-20 flex flex-col bg-white shadow-xl">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-3">
                <div className="text-sm font-bold text-gray-900">模块预览</div>
                <button
                  onClick={() => setIsModulePreviewOpen(false)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark"
                  title="折叠模块预览"
                >
                  <span>模块预览</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/60 p-3">
                <div className="space-y-3">
                  {previewModules.map((module) => {
                    const collapsed = collapsedPreviewIds[module.id] ?? false;
                    return (
                      <div key={module.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <button
                          onClick={() => setCollapsedPreviewIds((prev) => ({ ...prev, [module.id]: !collapsed }))}
                          className="flex w-full items-center justify-between bg-sky-50 px-3 py-2 text-left text-sm font-bold text-sky-600"
                        >
                          <span className="min-w-0 truncate">{module.label}</span>
                          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                        </button>
                        {!collapsed && !module.hidePreview && (
                          <div className="whitespace-pre-wrap p-3 text-sm leading-7 text-gray-600">
                            {module.instruction}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!previewModules.length && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
                      暂无可显示预览
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 py-4">
          <div className="grid shrink-0 grid-cols-3 gap-3">
            <section className="rounded-xl border border-gray-200 bg-white p-3">
              <h3 className="mb-2 flex items-center gap-1 text-[15px] font-bold text-gray-900">
                <Settings className="h-3.5 w-3.5 text-brand" /> AI 模型
              </h3>
              {models.length === 0 ? (
                <div className="space-y-1">
                  <p className="text-[11px] text-amber-500">未配置可用模型</p>
                  <button
                    onClick={() => navigate('/model-manage')}
                    className="text-[11px] text-brand hover:underline"
                  >
                    去“模型管理”配置
                  </button>
                </div>
              ) : (
                <div className="max-h-[150px] space-y-1.5 overflow-y-auto pr-1">
                  {orderedModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`flex h-[33px] w-full items-center rounded-lg border px-2.5 text-left text-[15px] transition-all ${
                        selectedModel?.id === model.id
                          ? 'border-brand bg-brand-light text-brand font-medium'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex w-full min-w-0 items-center gap-3">
                        <span className="min-w-0 flex-1 truncate">{model.name}</span>
                        {selectedModel?.id === model.id && <span className="ml-auto shrink-0 text-brand">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-3">
              <h3 className="mb-2 text-[15px] font-bold text-gray-900">提炼模式</h3>
              <div className="max-h-[150px] space-y-1.5 overflow-y-auto pr-1">
                <label className={`flex h-[33px] items-center gap-2 rounded-lg border px-2.5 text-[15px] transition-colors ${
                  extractMode === 'chapter' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={extractMode === 'chapter'} onChange={() => setExtractMode('chapter')} className="h-3 w-3 text-brand" />
                  <span className={`font-medium ${extractMode === 'chapter' ? 'text-brand' : 'text-gray-700'}`}>逐章提炼</span>
                </label>
                <label className={`flex h-[33px] items-center gap-2 rounded-lg border px-2.5 text-[15px] transition-colors ${
                  extractMode === 'multi' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={extractMode === 'multi'} onChange={() => setExtractMode('multi')} className="h-3 w-3 text-brand" />
                  <span className={`font-medium ${extractMode === 'multi' ? 'text-brand' : 'text-gray-700'}`}>
                    每
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={chaptersPerBatch}
                      onChange={(event) => setChaptersPerBatch(Math.max(2, Math.min(50, Number(event.target.value))))}
                      className="mx-1 h-6 w-10 rounded border border-gray-200 bg-white px-1 text-center text-sm focus:border-brand focus:outline-none"
                    />
                    章合并
                  </span>
                </label>
                <label className={`flex h-[33px] items-center gap-2 rounded-lg border px-2.5 text-[15px] transition-colors ${
                  extractMode === 'smart' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={extractMode === 'smart'} onChange={() => setExtractMode('smart')} className="h-3 w-3 text-brand" />
                  <span className={`font-medium ${extractMode === 'smart' ? 'text-brand' : 'text-gray-700'}`}>智能提炼</span>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-3">
              <h3 className="mb-2 text-[15px] font-bold text-gray-900">导出设置</h3>
              <div className="space-y-2">
                <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  outputMode === 'single' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={outputMode === 'single'} onChange={() => setOutputMode('single')} className="h-3 w-3 text-brand" />
                  <span className={`text-[15px] font-medium ${outputMode === 'single' ? 'text-brand' : 'text-gray-700'}`}>
                    1 个剧情点 = 1 个 txt
                  </span>
                </label>
                <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  outputMode === 'book' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={outputMode === 'book'} onChange={() => setOutputMode('book')} className="h-3 w-3 text-brand" />
                  <span className={`text-[15px] font-medium ${outputMode === 'book' ? 'text-brand' : 'text-gray-700'}`}>
                    1 本小说 = 1 个 txt
                  </span>
                </label>
                <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  outputMode === 'multi' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" checked={outputMode === 'multi'} onChange={() => setOutputMode('multi')} className="h-3 w-3 text-brand" />
                  <div className="flex items-center gap-1 text-[15px]">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={pointsPerFile}
                      onChange={(event) => setPointsPerFile(Math.max(1, Math.min(1000, Number(event.target.value))))}
                      className="w-12 rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[15px] focus:border-brand focus:outline-none"
                    />
                    <span className={`font-medium ${outputMode === 'multi' ? 'text-brand' : 'text-gray-700'}`}>
                      个剧情点 = 1 个 txt
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <section className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <FileText className="h-4 w-4 text-brand" />
              上传文件 / 载入章节
            </h3>
            {selectedNovel && (
              <button
                onClick={() => setShowChapterSelect(true)}
                className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-lg border border-brand/30 px-3 py-1.5 text-xs text-brand transition-colors hover:bg-brand-light"
              >
                <BookMarked className="h-3.5 w-3.5" />
                载入关联小说章节
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx"
              multiple
              onChange={(event) => {
                const list = event.target.files;
                if (list) void handleFiles(list);
                event.target.value = '';
              }}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingFile(false);
                void handleFiles(event.dataTransfer.files);
              }}
              className={`flex h-[188px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 transition-all ${
                isDraggingFile
                  ? 'border-brand bg-brand-light/40'
                  : 'border-gray-200 hover:border-brand hover:bg-brand-light/30'
              }`}
            >
              <FileText className={`h-8 w-8 ${isDraggingFile ? 'text-brand' : 'text-gray-300'}`} />
              <span className={`text-sm ${isDraggingFile ? 'font-medium text-brand' : 'text-gray-500'}`}>
                {isDraggingFile ? '松开上传' : '点击或拖拽 .txt / .doc / .docx 文件'}
              </span>
              <span className="text-[10px] text-gray-400">内容自动保存，关闭后可继续。</span>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-hidden">
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-gray-900">最近上传</div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    保留最近 {files.length}/{MAX_UPLOAD_HISTORY} 个，已选择 {selectedFiles.length} 个待处理
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => persistFiles((prev: UploadFileItem[]) => prev.map((file: UploadFileItem) => ({ ...file, selected: true })))}
                    disabled={files.length === 0}
                    className="text-xs font-medium text-brand hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    全选
                  </button>
                  <button
                    onClick={() => persistFiles((prev: UploadFileItem[]) => prev.map((file: UploadFileItem) => ({ ...file, selected: false })))}
                    disabled={files.length === 0}
                    className="text-xs font-medium text-gray-500 hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => persistFiles((prev: UploadFileItem[]) => prev.map((file: UploadFileItem) => ({ ...file, selected: !file.selected })))}
                    disabled={files.length === 0}
                    className="text-xs font-medium text-gray-500 hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    反选
                  </button>
                  <button
                    onClick={() => persistFiles(() => [])}
                    disabled={files.length === 0}
                    className="text-xs font-medium text-red-500 hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    清空
                  </button>
                </div>
              </div>
              <div className="max-h-[300px] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {files.length === 0 ? (
                  <div className="flex h-24 items-center justify-center px-4 text-center text-sm text-gray-400">
                    暂无记录，上传文件或载入章节后会显示在这里。
                  </div>
                ) : [...files].reverse().map((file) => (
                  <div key={file.id} className="flex min-h-[44px] items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={() => persistFiles((prev: UploadFileItem[]) => prev.map((item: UploadFileItem) => (
                        item.id === file.id ? { ...item, selected: !item.selected } : item
                      )))}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700" title={file.name}>{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">{file.content.length.toLocaleString()} 字</span>
                    <button
                      onClick={() => persistFiles((prev: UploadFileItem[]) => prev.filter((item: UploadFileItem) => item.id !== file.id))}
                      className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                      title="移除记录"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-3 flex shrink-0 items-center justify-between">
            <span className="rounded-full border border-brand/20 bg-brand-light px-3 py-1 text-xs text-brand">
              {saveMessage || extractProgress || '准备就绪'}
            </span>
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <button
                  onClick={handleExportResults}
                  className="flex w-[132px] items-center justify-center gap-1.5 rounded-lg border border-brand/30 bg-white px-4 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light"
                >
                  <Download className="h-4 w-4" />
                  导出结果
                </button>
              )}
              <button
                onClick={isExtractPaused ? resumeExtractRun : pauseExtractRun}
                disabled={!isExtracting}
                className={`order-2 flex w-[92px] items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isExtractPaused
                    ? 'border-brand bg-brand-light text-brand hover:bg-brand-light/80'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                } disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
              >
                {isExtractPaused ? '继续' : '暂停'}
              </button>
              <button
                onClick={() => {
                  if (isExtracting) {
                    requestExtractStop();
                    return;
                  }
                  setShowExtractConfirm(true);
                }}
                disabled={!isExtracting && !canExtract}
                className={`order-1 flex w-[168px] items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 ${
                  isExtracting ? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brand-dark'
                }`}
              >
                <Play className="h-4 w-4" />
                {isExtracting ? '中止提炼' : '开始提炼'}
              </button>
            </div>
          </div>
        </main>

        <aside className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {isExtracting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />}
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">{isExtracting ? '提炼中' : '提炼结果'}</h3>
                <div className="mt-0.5 text-[11px] text-gray-400">
                  {results.length}/{Math.max(extractTotal || results.length, 1)} · {selectedModel?.name ?? '未选择模型'}
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
            {results.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => emitExtractRuntime({ activeResultIndex: index })}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                      activeResultIndex === index
                        ? 'border-brand bg-brand text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}

            {results[activeResultIndex] ? (
              <div className="overflow-hidden border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">剧情点 {activeResultIndex + 1}</div>
                      <div className="mt-1 truncate text-xs text-slate-400">{results[activeResultIndex].chapterTitle}</div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-400">{results[activeResultIndex].content.length} 字</div>
                  </div>
                </div>
                <div className="min-h-[360px] whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-700">
                  {results[activeResultIndex].content.trim() || '暂无内容'}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-gray-200 bg-white px-6 text-center">
                <Sparkles className="mb-3 h-8 w-8 text-slate-300" />
                <div className="text-base font-bold text-slate-400">{isExtracting ? '等待首个结果' : '等待开始提炼'}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">
                  开始提炼后，进度和剧情点会直接显示在这里。
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <div className="mb-3 line-clamp-2 text-xs leading-5 text-gray-500">
              {extractProgress || saveMessage || '准备就绪'}
            </div>
            <div className="flex items-center justify-start gap-2">
              <button
                onClick={handleExportResults}
                disabled={results.length === 0}
                className="w-1/5 rounded-xl border border-brand/30 bg-white px-2 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                导出 TXT
              </button>
              <button
                onClick={handleImportCurrentResults}
                disabled={pendingImportResults.length === 0}
                className="w-1/5 rounded-xl bg-brand px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                导入剧情库{pendingImportResults.length > 0 ? ` ${pendingImportResults.length}` : ''}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={showExtractConfirm}
        title="确认提炼"
        description={`确定开始提炼吗？\n当前将使用 ${selectedModel?.name ?? '未选择模型'}，处理 ${buildExtractJobs(selectedFiles, extractMode, chaptersPerBatch).length} 个批次。`}
        confirmText="开始提炼"
        confirmVariant="primary"
        onClose={() => setShowExtractConfirm(false)}
        onConfirm={() => {
          setShowExtractConfirm(false);
          void handleExtract();
        }}
      />

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex max-h-[80vh] w-[640px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-bold text-gray-900">提炼历史</h3>
              <button onClick={() => setShowHistory(false)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">暂无提炼记录</div>
              ) : history.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-1 text-xs font-bold text-brand"># {index + 1}</div>
                  <div className="text-xs text-gray-700">{item.fileNames.join('、')}</div>
                  <div className="mt-1 text-[11px] text-gray-400">
                    {item.extractModeLabel} · {item.resultCount} 条结果
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <LinkNovelModal
        isOpen={showLinkNovel}
        novels={novels}
        selectedNovelId={selectedNovelId}
        onSelect={setSelectedNovelId}
        onClose={() => setShowLinkNovel(false)}
      />

      <ChapterSelectModal
        isOpen={showChapterSelect}
        novel={selectedNovel}
        onClose={() => setShowChapterSelect(false)}
        onConfirm={handleLoadNovelChapters}
      />
    </div>
  );
}
