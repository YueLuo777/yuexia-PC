import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Library,
  Link2,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';

import { BrowserWorkspace } from '@/features/script-editor/components/BrowserWorkspace';
import {
  readScriptLinkedNovelId,
  writeScriptLinkedNovelId,
} from '@/features/script-editor/model/scriptLinkedNovelStorage';
import { useMaterials } from '@/features/materials/hooks/useMaterials';
import type { MaterialItem } from '@/features/materials/model/materialTypes';
import { WorkbenchAIPanel } from '@/features/workbench/components/WorkbenchAIPanel';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import type { Chapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { loadNavConfig, normalizeNavConfig, type NavGroupConfig } from '@/shared/navigation/navConfig';

import {
  AI_COLLAPSED_KEYS,
  EDITOR_MODE_KEY,
  FULL_WIDTH,
  GROUP_SIZE,
  LinkNovelModal,
  MIN_WIDTH,
  MaterialPreviewArea,
  MaterialSidebar,
  MODE_LABELS,
  NovelPreviewArea,
  NovelSidebar,
  ResizeHandle,
  ScriptEditorArea,
  ScriptEditorQuickNav,
  ScriptSidebar,
  WIDTH_STORAGE_KEYS,
  normalizeEditorContent,
  readStoredJson,
  type EditorMode,
  type MaterialFilterType,
} from '../components/ScriptEditorWorkspacePanels';

export function ScriptEditorPage() {
  const location = useLocation();
  const {
    novels,
    currentNovel,
    currentNovelId,
    volumesMap,
    volumes,
    selectedChapter,
    editorContent,
    setCurrentNovel,
    selectChapter,
    toggleVolume,
    addVolume,
    addChapter,
    renameChapter,
    deleteChapter,
    saveContent,
    updateNovelChapterContent,
  } = useWorkbenchData();
  const currentScript = currentNovel?.type === 'script' ? currentNovel : null;
  const { items: materials } = useMaterials();
  const { tabs, activeTabId } = useWorkspaceTabs();
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [quickNavConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));

  const [editorMode, setEditorMode] = useState<EditorMode>(
    () => (localStorage.getItem(EDITOR_MODE_KEY) as EditorMode) || 'dual',
  );
  const [aiCollapsed, setAiCollapsed] = useState<boolean>(() => readStoredJson(AI_COLLAPSED_KEYS[editorMode], false));
  const [linkedNovelId, setLinkedNovelId] = useState<number | null>(() =>
    readScriptLinkedNovelId(currentScript?.id ?? null),
  );
  const [selectedNovelChapterId, setSelectedNovelChapterId] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [deleteChapterTarget, setDeleteChapterTarget] = useState<{
    volumeId: number;
    chapterId: number;
    title: string;
  } | null>(null);
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    readStoredJson(WIDTH_STORAGE_KEYS[editorMode], {}),
  );

  const dragRef = useRef<{
    leftKey: string;
    rightKey: string;
    startX: number;
    startWidths: Record<string, number>;
  } | null>(null);

  const selectedScriptChapter = selectedChapter?.chapter ?? null;
  const selectedVolumeName = selectedChapter?.volumeName ?? null;
  const linkedNovel = useMemo(
    () => novels.find((novel) => novel.id === linkedNovelId && novel.type === 'novel') ?? null,
    [linkedNovelId, novels],
  );
  const linkedNovelVolumes = useMemo(
    () => (linkedNovelId ? (volumesMap[linkedNovelId] ?? []) : []),
    [linkedNovelId, volumesMap],
  );
  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    setLinkedNovelId(readScriptLinkedNovelId(currentScript?.id ?? null));
    setSelectedNovelChapterId(null);
  }, [currentScript?.id]);

  const updateLinkedNovel = useCallback(
    (novelId: number | null) => {
      writeScriptLinkedNovelId(currentScript?.id ?? null, novelId);
      setLinkedNovelId(novelId);
    },
    [currentScript?.id],
  );

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId) return;
    if (currentNovelId === activeTab.workId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  useEffect(() => {
    if (currentScript) return;
    if (activeTab?.workType === 'novel') return;
    const firstScript = novels.find((novel) => novel.type === 'script');
    if (firstScript) setCurrentNovel(firstScript.id);
  }, [activeTab?.workType, currentScript, novels, setCurrentNovel]);

  useEffect(() => {
    localStorage.setItem(EDITOR_MODE_KEY, editorMode);
    setColWidths(readStoredJson(WIDTH_STORAGE_KEYS[editorMode], {}));
    setAiCollapsed(readStoredJson(AI_COLLAPSED_KEYS[editorMode], false));
  }, [editorMode]);

  useEffect(() => {
    if (!linkedNovel) {
      setSelectedNovelChapterId(null);
      return;
    }
    const hasSelected = linkedNovelVolumes.some((volume) =>
      volume.chapters.some((chapter) => chapter.id === selectedNovelChapterId),
    );
    if (hasSelected) return;
    const firstChapter = linkedNovelVolumes
      .flatMap((volume) => volume.chapters)
      .sort((a, b) => a.serialNumber - b.serialNumber)[0];
    setSelectedNovelChapterId(firstChapter?.id ?? null);
  }, [linkedNovel, linkedNovelVolumes, selectedNovelChapterId]);

  useEffect(() => {
    if (currentNovelId) {
      localStorage.setItem('current_novel_id', String(currentNovelId));
    }
  }, [currentNovelId]);

  useEffect(() => {
    if (selectedScriptChapter?.id) {
      localStorage.setItem('current_chapter_id', String(selectedScriptChapter.id));
    }
  }, [selectedScriptChapter?.id]);

  const widths = useMemo(() => {
    const browserWidths = {
      sDir: Math.max(MIN_WIDTH, colWidths.sDir ?? 200),
      sEdit: Math.max(MIN_WIDTH, colWidths.sEdit ?? 420),
      ai: Math.max(MIN_WIDTH, colWidths.ai ?? 300),
      browserPane: FULL_WIDTH,
      nPreview: 0,
      mPreview: 0,
      mSidebar: 0,
    };
    if (editorMode === 'browser') return browserWidths;

    const base = {
      sDir: Math.max(MIN_WIDTH, colWidths.sDir ?? 200),
      sEdit: Math.max(MIN_WIDTH, colWidths.sEdit ?? 420),
      ai: Math.max(MIN_WIDTH, colWidths.ai ?? 300),
      browserPane: Math.max(320, colWidths.browserPane ?? 520),
      nPreview: Math.max(MIN_WIDTH, colWidths.nPreview ?? 380),
      mPreview: Math.max(MIN_WIDTH, colWidths.mPreview ?? 320),
      mSidebar: Math.max(MIN_WIDTH, colWidths.mSidebar ?? 260),
    };

    if (!aiCollapsed) return base;

    if (editorMode === 'dual') {
      const extra = Math.floor(base.ai / 2);
      return {
        ...base,
        ai: 0,
        sEdit: base.sEdit + extra,
        nPreview: base.nPreview + (base.ai - extra),
      };
    }

    return {
      ...base,
      ai: 0,
      sEdit: base.sEdit + Math.floor(base.ai / 2),
      mPreview: base.mPreview + Math.ceil(base.ai / 2),
    };
  }, [aiCollapsed, colWidths, editorMode]);

  const persistWidths = useCallback(
    (next: Record<string, number>) => {
      setColWidths(next);
      localStorage.setItem(WIDTH_STORAGE_KEYS[editorMode], JSON.stringify(next));
    },
    [editorMode],
  );

  const startResize = useCallback(
    (leftKey: string, rightKey: string, event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = {
        leftKey,
        rightKey,
        startX: event.clientX,
        startWidths: { ...widths },
      };

      const handleMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return;
        const { leftKey: currentLeftKey, rightKey: currentRightKey, startX, startWidths } = dragRef.current;
        const delta = moveEvent.clientX - startX;
        const nextLeft = Math.max(MIN_WIDTH, startWidths[currentLeftKey] + delta);
        if (currentRightKey === '__flex') {
          persistWidths({ ...startWidths, [currentLeftKey]: nextLeft });
          return;
        }
        const nextRight = Math.max(MIN_WIDTH, startWidths[currentRightKey] - delta);
        persistWidths({
          ...startWidths,
          [currentLeftKey]: nextLeft,
          [currentRightKey]: nextRight,
        });
      };

      const handleUp = () => {
        dragRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [persistWidths, widths],
  );

  const handleToggleAI = useCallback(() => {
    setAiCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(AI_COLLAPSED_KEYS[editorMode], JSON.stringify(next));
      return next;
    });
  }, [editorMode]);

  useEffect(() => {
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id === 'close_floating') {
        setIsLinkModalOpen(false);
        setDeleteChapterTarget(null);
        return;
      }
      if (!selectedChapter || !selectedScriptChapter) return;
      if (action.detail?.id === 'delete_chapter') {
        setDeleteChapterTarget({
          volumeId: selectedChapter.volumeId,
          chapterId: selectedChapter.chapter.id,
          title: selectedChapter.chapter.title || `第${selectedChapter.chapter.serialNumber}集`,
        });
      } else if (action.detail?.id === 'smart_format') {
        saveContent(normalizeEditorContent(editorContent));
      } else if (action.detail?.id === 'save_chapter') {
        saveContent(editorContent);
      }
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
  }, [editorContent, saveContent, selectedChapter, selectedScriptChapter]);

  if (!currentScript) {
    if (activeTab?.workType === 'novel') {
      return <div className="flex h-full flex-col bg-gray-50" />;
    }
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">未选择剧本</h1>
          <p className="mt-2 text-sm text-gray-500">请先从剧本列表选择一个剧本，再进入脚本编辑器。</p>
          <Link
            to="/scripts"
            className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
          >
            返回我的剧本
          </Link>
        </div>
      </div>
    );
  }

  const linkedNovelOptions = novels.filter((novel) => novel.type === 'novel');

  return (
    <div className="script-editor-page relative flex h-full flex-col overflow-hidden bg-white">
      <ScriptEditorQuickNav
        isOpen={isQuickNavOpen}
        navConfig={quickNavConfig}
        currentPath={location.pathname}
        onOpen={() => setIsQuickNavOpen(true)}
        onClose={() => setIsQuickNavOpen(false)}
      />
      <header className="script-editor-topbar flex h-11 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-xs text-gray-500">剧本名：</span>
          <span className="max-w-[220px] truncate rounded border border-brand px-2 py-1 text-xs font-bold text-brand">
            {currentScript.title}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-2">
          {(Object.keys(MODE_LABELS) as EditorMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setEditorMode(mode)}
              className={`script-editor-mode-button rounded-md px-3 py-1.5 text-xs transition-colors ${
                editorMode === mode
                  ? 'script-editor-mode-active bg-brand font-medium text-white'
                  : 'script-editor-mode-idle bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <div className="xy-capsule-group">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className={`xy-capsule-button max-w-[240px] ${linkedNovel ? 'xy-active' : ''}`}
          >
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">{linkedNovel?.title || '关联小说'}</span>
          </button>
          {linkedNovelId !== null && (
            <button
              onClick={() => {
                updateLinkedNovel(null);
                setSelectedNovelChapterId(null);
              }}
              className="xy-capsule-button xy-danger"
            >
              取消关联
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ScriptSidebar
          volumes={volumes}
          selectedChapterId={selectedScriptChapter?.id ?? null}
          width={widths.sDir}
          onToggleVolume={toggleVolume}
          onSelectChapter={selectChapter}
          onAddVolume={addVolume}
          onAddChapter={addChapter}
          onDeleteChapter={deleteChapter}
        />
        <ResizeHandle onMouseDown={(event) => startResize('sDir', 'sEdit', event)} />

        <ScriptEditorArea
          width={widths.sEdit}
          volumeName={selectedVolumeName}
          chapter={selectedScriptChapter}
          content={editorContent}
          aiCollapsed={aiCollapsed}
          showAiToggle
          onToggleAI={handleToggleAI}
          onChangeContent={saveContent}
          onRenameChapter={(title) => {
            if (selectedScriptChapter) renameChapter(selectedScriptChapter.id, title);
          }}
          onDeleteChapter={() => {
            if (!selectedChapter) return;
            setDeleteChapterTarget({
              volumeId: selectedChapter.volumeId,
              chapterId: selectedChapter.chapter.id,
              title: selectedChapter.chapter.title || `第${selectedChapter.chapter.serialNumber}集`,
            });
          }}
        />

        <>
          <ResizeHandle
            onMouseDown={(event) =>
              startResize(
                'sEdit',
                aiCollapsed
                  ? editorMode === 'dual'
                    ? 'nPreview'
                    : editorMode === 'script'
                      ? 'mPreview'
                      : '__flex'
                  : 'ai',
                event,
              )
            }
          />
          {!aiCollapsed && (
            <>
              <aside
                className="shrink-0 overflow-hidden border-l border-gray-200 bg-white"
                style={{ width: widths.ai }}
              >
                <WorkbenchAIPanel
                  activeTool="ai"
                  workId={`script-${currentScript.id}`}
                  selectedChapterContent={editorContent}
                  chapterContextLabel="本集"
                  onClose={handleToggleAI}
                  onReplaceContent={saveContent}
                />
              </aside>
              <ResizeHandle
                onMouseDown={(event) =>
                  startResize(
                    'ai',
                    editorMode === 'dual' ? 'nPreview' : editorMode === 'script' ? 'mPreview' : '__flex',
                    event,
                  )
                }
              />
            </>
          )}
        </>

        {editorMode === 'dual' && (
          <>
            <NovelPreviewArea
              width={widths.nPreview}
              linkedNovelId={linkedNovelId}
              linkedNovel={linkedNovel}
              linkedVolumes={linkedNovelVolumes}
              selectedChapterId={selectedNovelChapterId}
              onSaveContent={updateNovelChapterContent}
            />
            <ResizeHandle onMouseDown={(event) => startResize('nPreview', '__flex', event)} />
            <NovelSidebar
              linkedNovel={linkedNovel}
              linkedVolumes={linkedNovelVolumes}
              selectedChapterId={selectedNovelChapterId}
              onSelectChapter={setSelectedNovelChapterId}
            />
          </>
        )}

        {editorMode === 'script' && (
          <>
            <MaterialPreviewArea material={selectedMaterial} width={widths.mPreview} />
            <ResizeHandle onMouseDown={(event) => startResize('mPreview', 'mSidebar', event)} />
            <MaterialSidebar
              width={widths.mSidebar}
              materials={materials}
              selectedMaterialId={selectedMaterialId}
              onSelectMaterial={setSelectedMaterialId}
            />
          </>
        )}

        {editorMode === 'browser' && <BrowserWorkspace width={widths.browserPane} />}
      </div>

      <LinkNovelModal
        isOpen={isLinkModalOpen}
        novels={linkedNovelOptions}
        onClose={() => setIsLinkModalOpen(false)}
        onLink={(novelId) => {
          updateLinkedNovel(novelId);
          setIsLinkModalOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteChapterTarget}
        title="确认删除"
        description={`确定要删除章节“${deleteChapterTarget?.title ?? ''}”吗？删除后会进入回收站。`}
        confirmText="移入回收站"
        confirmVariant="warning"
        onClose={() => setDeleteChapterTarget(null)}
        onConfirm={() => {
          if (deleteChapterTarget) {
            deleteChapter(deleteChapterTarget.volumeId, deleteChapterTarget.chapterId);
          }
          setDeleteChapterTarget(null);
        }}
      />
    </div>
  );
}

export default ScriptEditorPage;
