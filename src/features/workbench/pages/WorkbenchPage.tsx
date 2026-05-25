import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ChapterEditor } from '@/features/workbench/components/ChapterEditor';
import { ChapterRecycleModal } from '@/features/workbench/components/ChapterRecycleModal';
import { ChapterSidebar } from '@/features/workbench/components/ChapterSidebar';
import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PublishedSidebar } from '@/features/workbench/components/PublishedSidebar';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import { WorkbenchAIPanel } from '@/features/workbench/components/WorkbenchAIPanel';
import { WorkbenchHeader } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchLibraryPanel } from '@/features/workbench/components/WorkbenchLibraryPanel';
import { WorkbenchModal } from '@/features/workbench/components/WorkbenchModal';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import { readWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import {
  loadNavConfig,
  normalizeNavConfig,
  type NavGroupConfig,
} from '@/shared/navigation/navConfig';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

type ModalKey = 'workInfo' | 'notes' | 'settingLibrary' | 'detailOutlineLibrary' | 'summaryLibrary';
type ManagementModalKey = 'models' | 'agents';
type FindScope = 'chapter' | 'book';
type ChapterExportFormat = 'txt' | 'doc';
type PendingPublish = { type: 'single'; volumeId: number; chapterId: number; title: string };
type MemoScope = 'global' | 'work';
type MemoItem = { id: string; title: string; content: string; updatedAt: string };
type ContextTab = '角色' | '大纲' | '细纲' | '概要';
interface ChapterExportItem {
  volumeId: number;
  volumeName: string;
  chapterId: number;
  serialNumber: number;
  title: string;
  content: string;
}
const AI_PANEL_MIN_WIDTH = 430;
const AI_PANEL_DEFAULT_WIDTH = 430;
const PUBLISH_CONFIRM_KEY = 'xinyuexia_workbench_publish_confirm';
const GLOBAL_NOTES_KEY = 'xinyuexia_workbench_notes';
const WORK_NOTES_KEY_PREFIX = 'xinyuexia_workbench_notes_';
const GLOBAL_NOTES_LIST_KEY = 'xinyuexia_workbench_notes_list_v1';
const WORK_NOTES_LIST_KEY_PREFIX = 'xinyuexia_workbench_notes_list_v1_';
const APP_SCALE_KEY = 'xinyuexia_app_scale';
const APP_SCALE_VERSION_KEY = 'xinyuexia_app_scale_version';
const APP_SCALE_BASE = 1.1;
const APP_SCALE_STORAGE_VERSION = '2';
const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';

function getEffectiveAppScale() {
  if (typeof window === 'undefined') return APP_SCALE_BASE;
  const cssScale = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue(APP_EFFECTIVE_SCALE_CSS_VAR),
  );
  if (Number.isFinite(cssScale) && cssScale > 0) return cssScale;

  const savedScale = Number.parseFloat(localStorage.getItem(APP_SCALE_KEY) ?? '1');
  if (!Number.isFinite(savedScale)) return APP_SCALE_BASE;
  const isCurrentVersion = localStorage.getItem(APP_SCALE_VERSION_KEY) === APP_SCALE_STORAGE_VERSION;
  const effectiveScale = isCurrentVersion ? savedScale : savedScale * APP_SCALE_BASE;
  return Math.max(APP_SCALE_BASE, Math.min(APP_SCALE_BASE * 2, effectiveScale));
}

function getAiPanelMaxWidth() {
  if (typeof window === 'undefined') return AI_PANEL_DEFAULT_WIDTH;
  return Math.max(AI_PANEL_MIN_WIDTH, Math.floor(window.innerWidth / (3 * getEffectiveAppScale())));
}

function normalizeAiPanelWidth(value: number) {
  const maxWidth = getAiPanelMaxWidth();
  const minWidth = Math.min(AI_PANEL_MIN_WIDTH, maxWidth);
  if (!Number.isFinite(value)) return Math.min(AI_PANEL_DEFAULT_WIDTH, maxWidth);
  return Math.max(minWidth, Math.min(maxWidth, value));
}

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

function getChapterExportTitle(item: Pick<ChapterExportItem, 'serialNumber' | 'title'>, workType: WorkbenchNovel['type']) {
  const chapterUnit = workType === 'script' ? '集' : '章';
  return `第${item.serialNumber}${chapterUnit}${item.title ? ` ${item.title}` : ''}`;
}

function sanitizeExportFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').trim() || '导出章节';
}

function escapeDocHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildChapterExportText(novelTitle: string, workType: WorkbenchNovel['type'], items: ChapterExportItem[]) {
  const lines: string[] = [`《${novelTitle}》`, ''];
  let currentVolumeId: number | null = null;

  items.forEach((item) => {
    if (currentVolumeId !== item.volumeId) {
      currentVolumeId = item.volumeId;
      lines.push(`# ${item.volumeName}`, '');
    }
    lines.push(`## ${getChapterExportTitle(item, workType)}`);
    if (item.content.trim()) lines.push(item.content.trim());
    lines.push('');
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function buildChapterExportDoc(novelTitle: string, workType: WorkbenchNovel['type'], items: ChapterExportItem[]) {
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

function formatMemoTime() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createMemoItem(scope: MemoScope, index: number, content = ''): MemoItem {
  return {
    id: `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${scope === 'global' ? '全局' : '作品'}备忘录 ${index}`,
    content,
    updatedAt: formatMemoTime(),
  };
}

function readMemoItems(listKey: string, legacyKey: string, scope: MemoScope) {
  try {
    const parsed = JSON.parse(localStorage.getItem(listKey) ?? '[]') as Partial<MemoItem>[];
    const valid = parsed
      .filter((item): item is MemoItem => Boolean(item.id && item.title))
      .map((item) => ({
        id: String(item.id),
        title: String(item.title),
        content: String(item.content ?? ''),
        updatedAt: String(item.updatedAt ?? ''),
      }));
    if (valid.length > 0) return valid;
  } catch {
    // Fall back to the legacy single-text memo below.
  }

  const legacyContent = localStorage.getItem(legacyKey) ?? '';
  return legacyContent.trim() ? [createMemoItem(scope, 1, legacyContent)] : [];
}

function WorkbenchFindReplaceModal({
  novelId,
  volumes,
  selectedChapter,
  editorContent,
  onClose,
  onSelectChapter,
  onUpdateChapterContents,
}: {
  novelId: number;
  volumes: ReturnType<typeof useWorkbenchData>['volumes'];
  selectedChapter: ReturnType<typeof useWorkbenchData>['selectedChapter'];
  editorContent: string;
  onClose: () => void;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onUpdateChapterContents: (updates: Record<number, string>) => void;
}) {
  const draggable = useDraggableModal('workbench_find_replace');
  useTopModalEscape(true, onClose);
  const [scope, setScope] = useState<FindScope>('chapter');
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('');

  const chapters = volumes.flatMap((volume) => (
    volume.chapters.map((chapter) => ({
      volumeId: volume.id,
      chapterId: chapter.id,
      label: `第${chapter.serialNumber}${chapter.title ? `章 ${chapter.title}` : '章'}`,
      content: selectedChapter?.chapter.id === chapter.id ? editorContent : readChapterContent(novelId, chapter.id),
    }))
  ));
  const scopedChapters = scope === 'chapter' && selectedChapter
    ? chapters.filter((chapter) => chapter.chapterId === selectedChapter.chapter.id)
    : chapters;
  const matches = scopedChapters.flatMap((chapter) => (
    findOccurrences(chapter.content, searchText).map((index) => ({ ...chapter, index }))
  ));
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
    const targets = targetScope === 'chapter' && selectedChapter
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

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/30 px-6 py-6">
      <section
        className="w-[700px] max-w-[94vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-14 cursor-move items-center justify-between border-b border-gray-100 px-5"
        >
          <h2 className="text-lg font-bold text-gray-900">查找替换</h2>
          <button data-no-modal-drag="true" onClick={onClose} className="rounded-lg px-3 py-1.5 text-base text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            关闭
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4">
            <label className="text-base font-medium text-gray-700">查找</label>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 focus-within:border-brand">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-gray-800 outline-none"
              />
              <button
                onClick={() => setScope((prev) => (prev === 'book' ? 'chapter' : 'book'))}
                className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
              >
                {scope === 'book' ? '搜索本章' : '搜索本书'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4">
            <label className="text-base font-medium text-gray-700">替换</label>
            <input
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              placeholder="输入替换词"
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => goMatch(-1)} disabled={total === 0} className="rounded-lg px-3 py-2 text-base text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40">
              上一个
            </button>
            <div className="w-20 text-center text-2xl font-bold text-brand">{total === 0 ? '0/0' : `${safeActiveIndex + 1}/${total}`}</div>
            <button onClick={() => goMatch(1)} disabled={total === 0} className="rounded-lg px-3 py-2 text-base text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40">
              下一个
            </button>
            <button onClick={replaceCurrent} disabled={total === 0} className="ml-auto rounded-lg bg-brand px-8 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:bg-gray-300">替换</button>
            <button onClick={() => replaceInScope('chapter')} disabled={!searchText} className="rounded-lg bg-gray-700 px-7 py-3 text-base font-bold text-white hover:bg-gray-800 disabled:bg-gray-300">本章替换</button>
            <button onClick={() => replaceInScope('book')} disabled={!searchText} className="rounded-lg bg-gray-700 px-7 py-3 text-base font-bold text-white hover:bg-gray-800 disabled:bg-gray-300">全书替换</button>
          </div>

          <div className="h-5 text-sm text-gray-400">
            {status || (scope === 'book' && total > 0 ? matches[safeActiveIndex]?.label : '')}
          </div>
        </div>
      </section>
    </div>
  );
}

function ManagementModal({
  type,
  onClose,
}: {
  type: ManagementModalKey;
  onClose: () => void;
}) {
  const draggable = useDraggableModal(`workbench_${type}_management`);
  useTopModalEscape(true, onClose);
  const title = type === 'models' ? '模型管理' : '提示词管理';

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-8 py-8" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-11 shrink-0 cursor-move items-center justify-between border-b border-slate-200 bg-white px-4"
        >
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="关闭"
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          {type === 'models' ? <ModelManagePage /> : <PromptsPage />}
        </div>
      </section>
    </div>
  );
}

function EditorSettingsModal({
  publishConfirm,
  onChangePublishConfirm,
  onClose,
}: {
  publishConfirm: boolean;
  onChangePublishConfirm: (checked: boolean) => void;
  onClose: () => void;
}) {
  const draggable = useDraggableModal('workbench_editor_settings');
  useTopModalEscape(true, onClose);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-6 py-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="w-[520px] max-w-[94vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-12 cursor-move items-center justify-between border-b border-gray-100 px-5"
        >
          <h2 className="text-base font-bold text-gray-900">作品编辑器设定</h2>
          <button data-no-modal-drag="true" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            关闭
          </button>
        </header>

        <div className="p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand/60">
            <input
              type="checkbox"
              checked={publishConfirm}
              onChange={(event) => onChangePublishConfirm(event.target.checked)}
              className="mt-1 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-base font-bold text-gray-900">发布确认</span>
              <span className="mt-1 block text-sm leading-6 text-gray-500">勾选后，点击发布章节时，会先弹出确认窗口，避免误点发布。</span>
            </span>
          </label>
        </div>
      </section>
    </div>
  );
}

function WorkbenchQuickNav({
  isOpen,
  navConfig,
  currentPath,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  navConfig: NavGroupConfig[];
  currentPath: string;
  onOpen: () => void;
  onClose: () => void;
}) {
  const visibleGroups = navConfig
    .filter((group) => !group.hidden)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.hidden),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="absolute left-0 top-1/2 z-40 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-brand-light hover:text-brand"
        title="打开导航栏"
        aria-label="打开导航栏"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex bg-black/10" onMouseDown={onClose}>
          <aside
            className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[12px_0_36px_rgba(15,23,42,0.16)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="text-base font-bold text-slate-900">快速导航</div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="收起导航栏"
                aria-label="收起导航栏"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </header>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {visibleGroups.map((group) => (
                <section key={group.title} className="mb-4">
                  <div className="mb-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPath === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          className={`block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                            isActive
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function ChapterExportPanel({
  volumes,
  workType,
  getChapterWordCount,
  onClose,
  onExport,
}: {
  volumes: Volume[];
  workType: WorkbenchNovel['type'];
  getChapterWordCount: (chapterId: number) => number;
  onClose: () => void;
  onExport: (format: ChapterExportFormat, chapterIds: number[]) => void;
}) {
  const [format, setFormat] = useState<ChapterExportFormat>('txt');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const chapterGroups = volumes.map((volume) => ({
    volume,
    chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber),
  }));
  const allChapterIds = chapterGroups.flatMap((group) => group.chapters.map((chapter) => chapter.id));
  const chapterSignature = chapterGroups
    .map((group) => `${group.volume.id}:${group.chapters.map((chapter) => chapter.id).join(',')}`)
    .join('|');
  const selectedSet = new Set(selectedIds);
  const selectedWordCount = chapterGroups.reduce((sum, group) => (
    sum + group.chapters.reduce((innerSum, chapter) => (
      selectedSet.has(chapter.id) ? innerSum + getChapterWordCount(chapter.id) : innerSum
    ), 0)
  ), 0);
  const chapterUnit = workType === 'script' ? '集' : '章';

  useEffect(() => {
    setSelectedIds(allChapterIds);
    setNotice('');
  }, [chapterSignature]);

  const normalizeSelectedIds = (ids: Set<number>) => allChapterIds.filter((chapterId) => ids.has(chapterId));

  const toggleAll = () => {
    setNotice('');
    setSelectedIds(selectedIds.length === allChapterIds.length ? [] : allChapterIds);
  };

  const toggleVolume = (chapterIds: number[]) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isFullSelected = chapterIds.every((chapterId) => next.has(chapterId));
      chapterIds.forEach((chapterId) => {
        if (isFullSelected) next.delete(chapterId);
        else next.add(chapterId);
      });
      return normalizeSelectedIds(next);
    });
  };

  const toggleChapter = (chapterId: number) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return normalizeSelectedIds(next);
    });
  };

  const submitExport = () => {
    if (selectedIds.length === 0) {
      setNotice('请至少选择一个章节。');
      return;
    }
    onExport(format, selectedIds);
    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-gray-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">选择要导出的章节</div>
            <div className="mt-1 text-xs text-gray-400">
              已选择 {selectedIds.length} 个{chapterUnit}，约 {selectedWordCount} 字
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['txt', 'doc'] as ChapterExportFormat[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormat(item)}
                className={`h-9 rounded-lg px-4 text-sm font-bold transition-colors ${
                  format === item
                    ? 'bg-brand text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-brand/50 hover:text-brand'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {allChapterIds.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
            当前作品还没有可导出的章节
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.length === allChapterIds.length}
                onChange={toggleAll}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm font-bold text-gray-800">全选 / 取消全选</span>
            </label>

            {chapterGroups.map(({ volume, chapters }) => {
              const volumeChapterIds = chapters.map((chapter) => chapter.id);
              const selectedCount = volumeChapterIds.filter((chapterId) => selectedSet.has(chapterId)).length;

              return (
                <section key={volume.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-brand-light/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCount === volumeChapterIds.length && volumeChapterIds.length > 0}
                      onChange={() => toggleVolume(volumeChapterIds)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-brand-dark">{volume.name}</span>
                    <span className="text-xs font-bold text-gray-500">{selectedCount}/{chapters.length}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 p-3">
                    {chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          selectedSet.has(chapter.id)
                            ? 'border-brand/40 bg-orange-50'
                            : 'border-gray-100 bg-white hover:border-brand/30 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet.has(chapter.id)}
                          onChange={() => toggleChapter(chapter.id)}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                          {getChapterExportTitle(chapter, workType)}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">{getChapterWordCount(chapter.id)} 字</span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-4">
        <div className="text-sm text-red-500">{notice}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-600 hover:bg-gray-50">
            取消
          </button>
          <button type="button" onClick={submitExport} className="h-10 rounded-lg bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark">
            开始导出
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkbenchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isEditorSettingsOpen, setIsEditorSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [managementModal, setManagementModal] = useState<ManagementModalKey | null>(null);
  const [isContextLibraryOpen, setIsContextLibraryOpen] = useState(false);
  const [contextTab, setContextTab] = useState<ContextTab>('角色');
  const [publishConfirm, setPublishConfirm] = useState(() => localStorage.getItem(PUBLISH_CONFIRM_KEY) === 'true');
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(null);
  const [globalNotes, setGlobalNotes] = useState<MemoItem[]>(() => readMemoItems(GLOBAL_NOTES_LIST_KEY, GLOBAL_NOTES_KEY, 'global'));
  const [workNotes, setWorkNotes] = useState<MemoItem[]>([]);
  const [workNotesNovelId, setWorkNotesNovelId] = useState<number | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<{ scope: MemoScope; id: string } | null>(null);
  const [collapsedMemoSections, setCollapsedMemoSections] = useState<Record<MemoScope, boolean>>({ global: false, work: false });
  const [showPublished, setShowPublished] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [quickNavConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));
  const [replaceUndoSnapshot, setReplaceUndoSnapshot] = useState<{ chapterId: number; content: string } | null>(null);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_ai_panel_width') ?? String(AI_PANEL_DEFAULT_WIDTH), 10);
    return normalizeAiPanelWidth(saved);
  });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(290);
  const { tabs, activeTabId } = useWorkspaceTabs();

  const {
    currentNovel,
    currentNovelId,
    volumes,
    recycledChapters,
    selectedChapter,
    editorContent,
    sortAsc,
    lastSavedAt,
    selectChapter,
    toggleVolume,
    toggleSort,
    addVolume,
    deleteVolume,
    addChapter,
    renameChapter,
    updateChapterSerialNumber,
    setChapterPublished,
    deleteChapter,
    restoreChapter,
    permanentDeleteChapter,
    saveContent,
    updateChapterContents,
    getChapterWordCount,
    setCurrentNovel,
  } = useWorkbenchData();

  useEffect(() => {
    if (!currentNovel) return;
    if (currentNovel.type === 'script') {
      setShowPublished(false);
      return;
    }
    const key = `workbench_show_published_${currentNovel.type}`;
    setShowPublished(localStorage.getItem(key) === 'true');
  }, [currentNovel?.id, currentNovel?.type]);

  useEffect(() => {
    if (!currentNovel) return;
    if (currentNovel.type === 'script') return;
    localStorage.setItem(`workbench_show_published_${currentNovel.type}`, String(showPublished));
  }, [currentNovel, showPublished]);

  useEffect(() => {
    localStorage.setItem('xinyuexia_ai_panel_width', String(aiPanelWidth));
  }, [aiPanelWidth]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId) return;
    if (currentNovelId === activeTab.workId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  useEffect(() => {
    const handleResize = () => setAiPanelWidth((prev) => normalizeAiPanelWidth(prev));
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(GLOBAL_NOTES_LIST_KEY, JSON.stringify(globalNotes));
  }, [globalNotes]);

  useEffect(() => {
    if (!currentNovelId) return;
    setWorkNotes(readMemoItems(`${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`, `${WORK_NOTES_KEY_PREFIX}${currentNovelId}`, 'work'));
    setWorkNotesNovelId(currentNovelId);
  }, [currentNovelId]);

  useEffect(() => {
    if (!currentNovelId || workNotesNovelId !== currentNovelId) return;
    localStorage.setItem(`${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`, JSON.stringify(workNotes));
  }, [currentNovelId, workNotes, workNotesNovelId]);

  useEffect(() => {
    const currentExists = selectedMemo?.scope === 'global'
      ? globalNotes.some((note) => note.id === selectedMemo.id)
      : workNotes.some((note) => note.id === selectedMemo?.id);
    if (currentExists) return;
    const fallback = globalNotes[0] ? { scope: 'global' as const, id: globalNotes[0].id } : workNotes[0] ? { scope: 'work' as const, id: workNotes[0].id } : null;
    setSelectedMemo(fallback);
  }, [globalNotes, selectedMemo, workNotes]);

  useEffect(() => {
    localStorage.setItem(PUBLISH_CONFIRM_KEY, String(publishConfirm));
  }, [publishConfirm]);

  useEffect(() => {
    setReplaceUndoSnapshot(null);
  }, [selectedChapter?.chapter.id]);

  useEffect(() => {
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id !== 'close_floating') return;
      setIsRecycleOpen(false);
      setActiveModal(null);
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
  }, []);

  const handlePanelDragStart = (event: ReactMouseEvent) => {
    event.preventDefault();
    dragStartX.current = event.clientX;
    dragStartWidth.current = aiPanelWidth;
    setIsDraggingPanel(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDraggingPanel) return;

    const handleMove = (event: MouseEvent) => {
      const deltaX = dragStartX.current - event.clientX;
      setAiPanelWidth(normalizeAiPanelWidth(dragStartWidth.current + deltaX));
    };

    const handleUp = () => {
      setIsDraggingPanel(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingPanel, aiPanelWidth]);

  if (!currentNovel) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">未选择作品</h1>
          <p className="mt-2 text-sm text-gray-500">请先从作品列表选择一本小说或剧本。</p>
          <Link to="/novels" className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark">
            返回我的小说
          </Link>
        </div>
      </div>
    );
  }

  const chapterCount = volumes.reduce((sum, volume) => sum + volume.chapters.length, 0);
  const selectedVolumeName = selectedChapter
    ? volumes.find((volume) => volume.id === selectedChapter.volumeId)?.name ?? '未选择卷'
    : '未选择卷';

  const canUndoReplace = Boolean(
    selectedChapter && replaceUndoSnapshot?.chapterId === selectedChapter.chapter.id,
  );
  const activeMemo = selectedMemo?.scope === 'global'
    ? globalNotes.find((note) => note.id === selectedMemo.id) ?? null
    : workNotes.find((note) => note.id === selectedMemo?.id) ?? null;
  const settingsStorageKey = `xinyuexia_workbench_settings_${currentNovel.id}`;
  const outlineStorageKey = `xinyuexia_workbench_outline_${currentNovel.id}`;
  const contextTabs: ContextTab[] = ['角色', '大纲', '细纲', '概要'];
  const normalizeContextTab = (tab: string) => (tab === '设定' || tab === '设定库' ? '大纲' : tab);
  const contextEntries = (() => {
    const settingsEntries = readWorkbenchLibraryEntries(settingsStorageKey);
    const outlineEntries = readWorkbenchLibraryEntries(outlineStorageKey);
    if (contextTab === '概要') {
      return outlineEntries.filter((entry) => entry.tab === '章节概要' || entry.tab === '卷概要');
    }
    return settingsEntries.filter((entry) => normalizeContextTab(entry.tab) === contextTab);
  })();

  const selectMemo = (scope: MemoScope, id: string) => setSelectedMemo({ scope, id });

  const addMemo = (scope: MemoScope) => {
    const list = scope === 'global' ? globalNotes : workNotes;
    const next = createMemoItem(scope, list.length + 1);
    if (scope === 'global') setGlobalNotes((prev) => [next, ...prev]);
    else setWorkNotes((prev) => [next, ...prev]);
    setSelectedMemo({ scope, id: next.id });
    setCollapsedMemoSections((prev) => ({ ...prev, [scope]: false }));
  };

  const updateMemo = (updates: Partial<Pick<MemoItem, 'title' | 'content'>>) => {
    if (!selectedMemo) return;
    const patch = { ...updates, updatedAt: formatMemoTime() };
    const updater = (items: MemoItem[]) => items.map((item) => (item.id === selectedMemo.id ? { ...item, ...patch } : item));
    if (selectedMemo.scope === 'global') setGlobalNotes(updater);
    else setWorkNotes(updater);
  };

  const toggleMemoSection = (scope: MemoScope) => {
    setCollapsedMemoSections((prev) => ({ ...prev, [scope]: !prev[scope] }));
  };

  const replaceEditorContent = (content: string) => {
    if (selectedChapter) {
      setReplaceUndoSnapshot({
        chapterId: selectedChapter.chapter.id,
        content: editorContent,
      });
    }
    saveContent(content);
  };

  const undoReplaceEditorContent = () => {
    if (!selectedChapter || replaceUndoSnapshot?.chapterId !== selectedChapter.chapter.id) return;
    saveContent(replaceUndoSnapshot.content);
    setReplaceUndoSnapshot(null);
  };

  const downloadTextFile = (fileName: string, content: string, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const collectExportChapters = (chapterIds: number[]): ChapterExportItem[] => {
    const targetIds = new Set(chapterIds);
    return volumes.flatMap((volume) => (
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .filter((chapter) => targetIds.has(chapter.id))
        .map((chapter) => ({
          volumeId: volume.id,
          volumeName: volume.name,
          chapterId: chapter.id,
          serialNumber: chapter.serialNumber,
          title: chapter.title,
          content: selectedChapter?.chapter.id === chapter.id
            ? editorContent
            : readChapterContent(currentNovel.id, chapter.id),
        }))
    ));
  };

  const handleExportSelectedChapters = (format: ChapterExportFormat, chapterIds: number[]) => {
    const items = collectExportChapters(chapterIds);
    if (items.length === 0) return;

    const fileBaseName = sanitizeExportFileName(`${currentNovel.title}_章节`);
    if (format === 'doc') {
      downloadTextFile(
        `${fileBaseName}.doc`,
        buildChapterExportDoc(currentNovel.title, currentNovel.type, items),
        'application/msword;charset=utf-8',
      );
      return;
    }

    downloadTextFile(
      `${fileBaseName}.txt`,
      buildChapterExportText(currentNovel.title, currentNovel.type, items),
    );
  };

  const handleExportChapters = () => {
    setIsExportOpen(true);
  };

  const publishChapterNow = (chapterId: number) => {
    setChapterPublished(chapterId, true);
  };

  const handlePublishChapter = (volumeId: number, chapterId: number) => {
    const volume = volumes.find((item) => item.id === volumeId);
    const chapter = volume?.chapters.find((item) => item.id === chapterId);
    if (!volume || !chapter) return;
    const duplicate = volume.chapters.find((item) => (
      item.id !== chapterId && item.isPublished && item.serialNumber === chapter.serialNumber
    ));
    if (duplicate) {
      window.alert(`已有第${chapter.serialNumber}${currentNovel.type === 'script' ? '集' : '章'}，请检查序号`);
      return;
    }
    if (publishConfirm) {
      const unit = currentNovel.type === 'script' ? '集' : '章';
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

  const handleExportBackup = () => {
    const keys: Record<string, string | null> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('xinyuexia_')) keys[key] = localStorage.getItem(key);
    }
    downloadTextFile(
      `新月下写作备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`,
      JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), keys }, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = typeof reader.result === 'string' ? reader.result : '';
          const data = JSON.parse(raw) as { keys?: Record<string, unknown>; data?: Record<string, unknown> };
          const keys = data.keys ?? data.data;
          if (!keys || typeof keys !== 'object') throw new Error('Invalid backup');

          Object.entries(keys).forEach(([key, value]) => {
            if (!key.startsWith('xinyuexia_')) return;
            if (value === null || value === undefined) {
              localStorage.removeItem(key);
              return;
            }
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });

          window.alert('数据导入成功，请刷新页面查看');
          window.location.reload();
        } catch {
          window.alert('导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="relative flex h-full flex-col bg-gray-50">
      <WorkbenchHeader
        workTitle={currentNovel.title}
        onOpenWorkInfo={() => setActiveModal('workInfo')}
        onOpenNotes={() => setActiveModal('notes')}
        onOpenSettingLibrary={() => setActiveModal('settingLibrary')}
        onOpenDetailOutlineLibrary={() => setActiveModal('detailOutlineLibrary')}
        onOpenSummaryLibrary={() => setActiveModal('summaryLibrary')}
      />

      <WorkbenchQuickNav
        isOpen={isQuickNavOpen}
        navConfig={quickNavConfig}
        currentPath={location.pathname}
        onOpen={() => setIsQuickNavOpen(true)}
        onClose={() => setIsQuickNavOpen(false)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ChapterSidebar
          volumes={volumes}
          sortAsc={sortAsc}
          recycledCount={recycledChapters.length}
          workType={currentNovel.type}
          showPublished={showPublished}
          onTogglePublished={() => setShowPublished((prev) => !prev)}
          onToggleVolume={toggleVolume}
          onToggleSort={toggleSort}
          onSelectChapter={selectChapter}
          onAddChapter={addChapter}
          onAddVolume={addVolume}
          onDeleteVolume={deleteVolume}
          onDeleteChapter={deleteChapter}
          onPublishChapter={handlePublishChapter}
          onOpenRecycle={() => setIsRecycleOpen(true)}
          onExportChapters={handleExportChapters}
          getChapterWordCount={getChapterWordCount}
        />

        {showPublished && (
          <PublishedSidebar
            volumes={volumes}
            onSelectChapter={selectChapter}
            onUnpublishChapter={(chapterId) => setChapterPublished(chapterId, false)}
            onDeleteChapter={deleteChapter}
            getChapterWordCount={getChapterWordCount}
          />
        )}

        <ChapterEditor
          chapter={selectedChapter?.chapter ?? null}
          volumeName={selectedVolumeName}
          content={editorContent}
          lastSavedAt={lastSavedAt}
          allChapters={volumes.flatMap((volume) => volume.chapters)}
          onRenameChapter={renameChapter}
          onChangeContent={saveContent}
          onUpdateSerialNumber={updateChapterSerialNumber}
          onDeleteChapter={(chapterId) => {
            if (!selectedChapter) return;
            deleteChapter(selectedChapter.volumeId, chapterId);
          }}
          onOpenFind={() => setIsFindOpen(true)}
        />

        <div
          className="group z-10 flex w-[4px] shrink-0 cursor-ew-resize items-center justify-center bg-transparent transition-colors hover:bg-brand/30"
          onMouseDown={handlePanelDragStart}
          title="拖拽调整宽度"
        >
          <div className="h-8 w-[2px] rounded-full bg-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <aside
          className="shrink-0 border-l border-gray-200 bg-white"
          style={{
            width: aiPanelWidth,
            maxWidth: `calc(33.333vw / var(${APP_EFFECTIVE_SCALE_CSS_VAR}, 1))`,
          }}
        >
          <WorkbenchAIPanel
            activeTool="ai"
            workId={currentNovel.id}
            selectedChapterContent={editorContent}
            onReplaceContent={replaceEditorContent}
            onUndoReplace={undoReplaceEditorContent}
            canUndoReplace={canUndoReplace}
            onOpenModelManage={() => setManagementModal('models')}
            onOpenAgentManage={() => setManagementModal('agents')}
            onOpenContextLibrary={() => setIsContextLibraryOpen(true)}
          />
        </aside>
      </div>

      <WorkbenchModal
        title="导出章节"
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        widthClass="w-[820px]"
        heightClass="h-[78vh] max-h-[88vh]"
      >
        <ChapterExportPanel
          volumes={volumes}
          workType={currentNovel.type}
          getChapterWordCount={getChapterWordCount}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExportSelectedChapters}
        />
      </WorkbenchModal>

      <ChapterRecycleModal
        isOpen={isRecycleOpen}
        chapters={recycledChapters}
        onClose={() => setIsRecycleOpen(false)}
        onRestore={(chapterId) => {
          restoreChapter(chapterId);
          setIsRecycleOpen(false);
        }}
        onPermanentDelete={permanentDeleteChapter}
      />

      {managementModal && (
        <ManagementModal
          type={managementModal}
          onClose={() => setManagementModal(null)}
        />
      )}

      {isContextLibraryOpen && (
        <WorkbenchModal
          title="关联上下文"
          isOpen={isContextLibraryOpen}
          onClose={() => setIsContextLibraryOpen(false)}
          widthClass="w-[980px]"
          heightClass="h-[78vh]"
        >
          <div className="grid min-h-0 flex-1 grid-cols-[210px_minmax(0,1fr)] bg-white">
            <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 text-sm font-bold text-gray-700">作品设定库</div>
              <div className="space-y-2">
                {contextTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setContextTab(tab)}
                    className={`flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold transition-colors ${
                      contextTab === tab
                        ? 'bg-brand text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className="text-xs opacity-75">
                      {tab === '概要'
                        ? readWorkbenchLibraryEntries(outlineStorageKey).filter((entry) => entry.tab === '章节概要' || entry.tab === '卷概要').length
                        : readWorkbenchLibraryEntries(settingsStorageKey).filter((entry) => normalizeContextTab(entry.tab) === tab).length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
            <main className="min-h-0 overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{contextTab}</h3>
                  <p className="mt-1 text-xs text-gray-400">暂时只读取内容，后续再配置勾选、召回权重和拼接规则。</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{contextEntries.length} 条</span>
              </div>
              {contextEntries.length === 0 ? (
                <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
                  当前标签下暂无内容
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {contextEntries.map((entry) => (
                    <article key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{entry.title}</h4>
                        <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-bold text-brand">{normalizeContextTab(entry.tab)}</span>
                      </div>
                      <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                        {entry.content || '暂无内容'}
                      </p>
                      <div className="mt-3 text-[11px] text-gray-400">{entry.updatedAt}</div>
                    </article>
                  ))}
                </div>
              )}
            </main>
          </div>
        </WorkbenchModal>
      )}

      {isFindOpen && currentNovelId && (
        <WorkbenchFindReplaceModal
          novelId={currentNovelId}
          volumes={volumes}
          selectedChapter={selectedChapter}
          editorContent={editorContent}
          onClose={() => setIsFindOpen(false)}
          onSelectChapter={selectChapter}
          onUpdateChapterContents={updateChapterContents}
        />
      )}

      {isEditorSettingsOpen && (
        <EditorSettingsModal
          publishConfirm={publishConfirm}
          onChangePublishConfirm={setPublishConfirm}
          onClose={() => setIsEditorSettingsOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!pendingPublish}
        title="确认发布"
        description={pendingPublish
          ? `确定要发布「${pendingPublish.title}」吗？发布后章节会移动到已发布。`
          : ''}
        confirmText="确认发布"
        onClose={() => setPendingPublish(null)}
        onConfirm={() => {
          if (pendingPublish) publishChapterNow(pendingPublish.chapterId);
          setPendingPublish(null);
        }}
      />

      <WorkbenchModal
        title="作品信息"
        isOpen={activeModal === 'workInfo'}
        onClose={() => setActiveModal(null)}
        widthClass="w-[864px]"
        heightClass="h-[86vh] max-h-[92vh]"
      >
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <div className="space-y-5">
            <section className="rounded-xl border border-gray-200 p-5">
              <h3 className="mb-4 text-lg font-bold text-gray-900">作品概览</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">作品名</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.title}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">类型</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.type === 'script' ? '剧本' : '小说'}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">分类</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.category ?? '未分类'}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">卷数</p><p className="mt-1.5 text-base font-bold text-gray-900">{volumes.length}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">章节数</p><p className="mt-1.5 text-base font-bold text-gray-900">{chapterCount}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">总字数</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.wordCount ?? 0}</p></div>
              </div>
            </section>
            <section className="rounded-xl border border-gray-200 p-5">
              <h3 className="mb-4 text-lg font-bold text-gray-900">作品简介</h3>
              <div className="min-h-[180px] whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-base leading-8 text-gray-700">
                {currentNovel.synopsis?.trim() || '暂无简介'}
              </div>
            </section>
          </div>
        </div>
      </WorkbenchModal>

      <WorkbenchModal title="大纲设定" isOpen={activeModal === 'settingLibrary'} onClose={() => setActiveModal(null)} widthClass="w-[1452px]" heightClass="h-[86vh] max-h-[95vh]" titleClassName="text-3xl" closeOnBackdrop={false}>
        <WorkbenchLibraryPanel storageKey={settingsStorageKey} outlineStorageKey={outlineStorageKey} tabs={['大纲', '角色', '脑洞']} emptyText="暂无内容" volumes={volumes} scale={1.1} defaultActiveTab="脑洞" />
      </WorkbenchModal>

      <WorkbenchModal title="细纲" isOpen={activeModal === 'detailOutlineLibrary'} onClose={() => setActiveModal(null)} widthClass="w-[1452px]" heightClass="h-[86vh] max-h-[95vh]" titleClassName="text-3xl" closeOnBackdrop={false}>
        <WorkbenchLibraryPanel storageKey={settingsStorageKey} outlineStorageKey={outlineStorageKey} tabs={['细纲']} emptyText="暂无细纲内容" volumes={volumes} scale={1.1} />
      </WorkbenchModal>

      <WorkbenchModal title="概要" isOpen={activeModal === 'summaryLibrary'} onClose={() => setActiveModal(null)} widthClass="w-[1452px]" heightClass="h-[86vh] max-h-[95vh]" titleClassName="text-3xl" closeOnBackdrop={false}>
        <WorkbenchLibraryPanel storageKey={settingsStorageKey} outlineStorageKey={outlineStorageKey} tabs={['概要']} emptyText="暂无概要内容" volumes={volumes} scale={1.1} />
      </WorkbenchModal>

      <WorkbenchModal title="备忘录" isOpen={activeModal === 'notes'} onClose={() => setActiveModal(null)} widthClass="w-[min(1180px,96vw)]">
        <div className="grid min-h-0 flex-1 grid-cols-[330px_minmax(0,1fr)] bg-white">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
            {([
              { scope: 'global' as const, title: '全局备忘录', items: globalNotes },
              { scope: 'work' as const, title: '作品备忘录', items: workNotes },
            ]).map(({ scope, title, items }) => (
              <section key={scope} className="mb-4 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white">
                <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-100 px-3">
                  <button
                    onClick={() => toggleMemoSection(scope)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand"
                    title={collapsedMemoSections[scope] ? '展开' : '折叠'}
                  >
                    {collapsedMemoSections[scope] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => toggleMemoSection(scope)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-bold text-gray-900"
                  >
                    {title}
                  </button>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">{items.length}</span>
                  <button
                    onClick={() => addMemo(scope)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-white text-brand hover:bg-brand-light"
                    title="新建备忘录"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {!collapsedMemoSections[scope] && (
                  <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
                    {items.length === 0 ? (
                      <p className="px-3 py-8 text-center text-xs leading-5 text-gray-400">暂无备忘录</p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => {
                          const selected = selectedMemo?.scope === scope && selectedMemo.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => selectMemo(scope, item.id)}
                              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                selected ? 'border-brand bg-brand-light/70' : 'border-gray-100 bg-gray-50 hover:border-brand/40 hover:bg-white'
                              }`}
                            >
                              <div className="truncate text-sm font-bold text-gray-800">{item.title}</div>
                              <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{item.content || '暂无内容'}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}
          </aside>

          <main className="flex min-h-0 flex-col p-5">
            {activeMemo ? (
              <>
                <div className="mb-4 flex shrink-0 items-center gap-3">
                  <input
                    value={activeMemo.title}
                    onChange={(event) => updateMemo({ title: event.target.value })}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-900 outline-none focus:border-brand"
                  />
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                    {selectedMemo?.scope === 'global' ? '全局' : '作品'}
                  </span>
                </div>
                <textarea
                  value={activeMemo.content}
                  onChange={(event) => updateMemo({ content: event.target.value })}
                  placeholder={selectedMemo?.scope === 'global'
                    ? '全局备忘录会在整个软件中共通...'
                    : '作品备忘录只属于当前作品...'}
                  className="editor-scrollbar flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                />
                <div className="mt-3 text-right text-xs text-gray-400">更新于 {activeMemo.updatedAt || '-'}</div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                请在左侧新建或选择备忘录
              </div>
            )}
          </main>
        </div>
      </WorkbenchModal>
    </div>
  );
}
