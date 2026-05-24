import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';

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
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ModalKey = 'workInfo' | 'settings' | 'outline' | 'notes';
type ManagementModalKey = 'models' | 'agents';
type FindScope = 'chapter' | 'book';
type PendingPublish = { type: 'single'; volumeId: number; chapterId: number; title: string } | { type: 'all'; count: number };
type MemoScope = 'global' | 'work';
type MemoItem = { id: string; title: string; content: string; updatedAt: string };
const AI_PANEL_MIN_WIDTH = 430;
const AI_PANEL_DEFAULT_WIDTH = 430;
const PUBLISH_CONFIRM_KEY = 'xinyuexia_workbench_publish_confirm';
const GLOBAL_NOTES_KEY = 'xinyuexia_workbench_notes';
const WORK_NOTES_KEY_PREFIX = 'xinyuexia_workbench_notes_';
const GLOBAL_NOTES_LIST_KEY = 'xinyuexia_workbench_notes_list_v1';
const WORK_NOTES_LIST_KEY_PREFIX = 'xinyuexia_workbench_notes_list_v1_';
const APP_SCALE_KEY = 'xinyuexia_app_scale';
const BASE_APP_SCALE = 1.1;
const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';

function getEffectiveAppScale() {
  if (typeof window === 'undefined') return BASE_APP_SCALE;
  const cssScale = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue(APP_EFFECTIVE_SCALE_CSS_VAR),
  );
  if (Number.isFinite(cssScale) && cssScale > 0) return cssScale;

  const savedScale = Number.parseFloat(localStorage.getItem(APP_SCALE_KEY) ?? '1');
  const appScale = Number.isFinite(savedScale) ? Math.max(0.8, Math.min(1.5, savedScale)) : 1;
  return BASE_APP_SCALE * appScale;
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
              <span className="mt-1 block text-sm leading-6 text-gray-500">勾选后，点击发布章节或一键发布时，会先弹出确认窗口，避免误点发布。</span>
            </span>
          </label>
        </div>
      </section>
    </div>
  );
}

export function WorkbenchPage() {
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isEditorSettingsOpen, setIsEditorSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [managementModal, setManagementModal] = useState<ManagementModalKey | null>(null);
  const [publishConfirm, setPublishConfirm] = useState(() => localStorage.getItem(PUBLISH_CONFIRM_KEY) === 'true');
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(null);
  const [globalNotes, setGlobalNotes] = useState<MemoItem[]>(() => readMemoItems(GLOBAL_NOTES_LIST_KEY, GLOBAL_NOTES_KEY, 'global'));
  const [workNotes, setWorkNotes] = useState<MemoItem[]>([]);
  const [workNotesNovelId, setWorkNotesNovelId] = useState<number | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<{ scope: MemoScope; id: string } | null>(null);
  const [collapsedMemoSections, setCollapsedMemoSections] = useState<Record<MemoScope, boolean>>({ global: false, work: false });
  const [showPublished, setShowPublished] = useState(false);
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

  const selectedChapterTitle = selectedChapter?.chapter.title ?? null;
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

  const handleExportChapters = () => {
    const chapterUnit = currentNovel.type === 'script' ? '集' : '章';
    const lines: string[] = [`《${currentNovel.title}》`, ''];

    volumes.forEach((volume) => {
      lines.push(`# ${volume.name}`);
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .forEach((chapter) => {
          const title = chapter.title || `第${chapter.serialNumber}${chapterUnit}`;
          const body = selectedChapter?.chapter.id === chapter.id
            ? editorContent
            : readChapterContent(currentNovel.id, chapter.id);
          lines.push('');
          lines.push(`## ${title}`);
          if (body.trim()) lines.push(body);
        });
      lines.push('');
    });

    downloadTextFile(`${currentNovel.title}_章节.txt`, lines.join('\n').replace(/\n{3,}/g, '\n\n'));
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

  const publishAllNow = () => {
    volumes.forEach((volume) => {
      const publishedSerials = new Set<number>();
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .forEach((chapter) => {
          if (publishedSerials.has(chapter.serialNumber)) return;
          publishedSerials.add(chapter.serialNumber);
          if (!chapter.isPublished) setChapterPublished(chapter.id, true);
        });
      });
  };

  const handlePublishAll = () => {
    if (publishConfirm) {
      const count = volumes.reduce((sum, volume) => sum + volume.chapters.filter((chapter) => !chapter.isPublished).length, 0);
      if (count === 0) return;
      setPendingPublish({ type: 'all', count });
      return;
    }
    publishAllNow();
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
    <div className="flex h-full flex-col bg-gray-50">
      <WorkbenchHeader
        workTitle={currentNovel.title}
        onOpenWorkInfo={() => setActiveModal('workInfo')}
        onOpenSettings={() => setActiveModal('settings')}
        onOpenOutline={() => setActiveModal('outline')}
        onOpenNotes={() => setActiveModal('notes')}
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
          onPublishAll={handlePublishAll}
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
          />
        </aside>
      </div>

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
        description={pendingPublish?.type === 'single'
          ? `确定要发布「${pendingPublish.title}」吗？发布后章节会移动到已发布。`
          : `确定要发布 ${pendingPublish?.count ?? 0} 个未发布章节吗？`}
        confirmText="确认发布"
        onClose={() => setPendingPublish(null)}
        onConfirm={() => {
          if (pendingPublish?.type === 'single') publishChapterNow(pendingPublish.chapterId);
          if (pendingPublish?.type === 'all') publishAllNow();
          setPendingPublish(null);
        }}
      />

      <WorkbenchModal title="作品信息" isOpen={activeModal === 'workInfo'} onClose={() => setActiveModal(null)}>
        <div className="flex-1 overflow-y-auto bg-white p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-base font-bold text-gray-900">作品概览</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">作品名</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.title}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">类型</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.type === 'script' ? '剧本' : '小说'}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">分类</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.category ?? '未分类'}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">卷数</p><p className="mt-1 text-sm font-bold text-gray-900">{volumes.length}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">章节数</p><p className="mt-1 text-sm font-bold text-gray-900">{chapterCount}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">总字数</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.wordCount ?? 0}</p></div>
              </div>
            </section>
            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-base font-bold text-gray-900">时间与位置</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">创建时间</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.createdAt ?? '-'}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">最近修改</p><p className="mt-1 text-sm font-bold text-gray-900">{currentNovel.lastModifiedAt ?? '-'}</p></div>
                <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">当前卷 / 章节</p><p className="mt-1 text-sm font-bold text-gray-900">{selectedVolumeName} / {selectedChapterTitle ?? '未选择章节'}</p></div>
              </div>
            </section>
          </div>
        </div>
      </WorkbenchModal>

      <WorkbenchModal title="设定库" isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} widthClass="w-[1320px]">
        <WorkbenchLibraryPanel storageKey={`xinyuexia_workbench_settings_${currentNovel.id}`} tabs={['角色', '设定', '大纲', '细纲']} emptyText="暂无设定内容" />
      </WorkbenchModal>

      <WorkbenchModal title="概要库" isOpen={activeModal === 'outline'} onClose={() => setActiveModal(null)} widthClass="w-[min(1500px,96vw)]">
        <WorkbenchLibraryPanel storageKey={`xinyuexia_workbench_outline_${currentNovel.id}`} tabs={['章节概要', '卷概要']} emptyText="暂无概要内容" volumes={volumes} />
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
