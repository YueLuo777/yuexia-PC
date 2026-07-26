import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { WorkbenchCreationFlowContent } from '@/features/workbench/components/WorkbenchCreationFlowContent';
import { WorkbenchWritingLayout } from '@/features/workbench/components/WorkbenchWritingLayout';
import { type ChapterExportFormat } from '@/features/workbench/components/ChapterExportPanel';
import { WorkbenchPageModalHost } from '@/features/workbench/components/WorkbenchPageModalHost';
import { ChapterSidebar } from '@/features/workbench/components/ChapterSidebar';
import { PublishedSidebar } from '@/features/workbench/components/PublishedSidebar';
import { WorkbenchAIPanel, type WorkbenchLinkedContextItem } from '@/features/workbench/components/WorkbenchAIPanel';
import { WorkbenchHeader, type WorkbenchHeaderFlowStats } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchContextSelectionColumn } from '@/features/workbench/components/WorkbenchContextSelectionColumn';
import { WorkbenchContextChapterSummaryList } from '@/features/workbench/components/WorkbenchContextChapterSummaryList';
import { type WorkbenchManagementModalKey } from '@/features/workbench/components/WorkbenchManagementModal';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import { useWorkbenchLibrarySnapshots } from '@/features/workbench/hooks/useWorkbenchLibrarySnapshots';
import { useWorkbenchLayoutWidths } from '@/features/workbench/hooks/useWorkbenchLayoutWidths';
import { useWorkbenchNotes } from '@/features/workbench/hooks/useWorkbenchNotes';
import { useWorkbenchDocumentActions } from '@/features/workbench/hooks/useWorkbenchDocumentActions';
import { useWorkbenchCloseShortcut } from '@/features/workbench/hooks/useWorkbenchCloseShortcut';
import {
  WORKBENCH_HEADER_FLOW_ITEMS,
  isWorkbenchCreationFlowPageKey,
  type WorkbenchCreationFlowPageKey,
} from '@/features/workbench/model/workbenchCreationFlow';
import { useWorkbenchStatusFlowNavigation } from '@/features/workbench/model/workbenchSettingStatusSelection';
import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN,
  readSharedWorkbenchAiRightWidth,
  writeSharedWorkbenchAiRightWidth,
} from '@/features/workbench/model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidth,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidth,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';
import {
  clearWorkbenchLinkedContextItems,
  readWorkbenchLinkedContextItems,
  writeWorkbenchLinkedContextItems,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  BRAINSTORM_TAB,
  BRAINSTORM_TYPE,
  ROLE_TAB,
  SETTING_TAB,
  UNCATEGORIZED_TYPE,
  normalizeTabName,
} from '@/features/workbench/components/workbenchLibraryTabs';
import { parseSettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { WordCountText } from '@/shared/ui/WordCountText';
import { countUnpolishedChapters } from '@/features/workbench/model/chapterPolishStatus';
import {
  buildChapterExportDoc,
  buildChapterExportText,
  sanitizeExportFileName,
  type ChapterExportItem,
} from '@/features/workbench/model/chapterExport';
import {
  extractContextStatusRecord,
  getContextEntryGroup,
  getContextEntrySerial,
  getContextItemsWordCount,
  getContextWordCount,
  getPreferredChapterNarrativeItem,
  hasContextContent,
  isContextOutlineEntry,
  isContextStatusCandidate,
  isContextSummaryEntry,
  keepExclusiveChapterNarrativeItems,
  mergeContextItems,
  normalizeContextSource,
  orderContextEntriesByType,
  parseContextRoleContent,
  parseContextRoleStatusContent,
  parseContextSettingContent,
} from '@/features/workbench/model/workbenchContextModel';

import {
  type ModalKey,
  type PendingPublish,
  type MemoScope,
  type HeaderLogOpenHandler,
  type MemoItem,
  type ContextLibraryTab,
  LazyWorkbenchLibraryPanel,
  WorkbenchLibraryPanel,
  WorkbenchNoNovelState,
  getWorkbenchChapterHeaderStats,
  FIELD_SIZE_FLOW_IDS,
  type ContextColumn,
  AI_PANEL_MIN_WIDTH,
  AI_PANEL_DEFAULT_WIDTH,
  CHAPTER_SIDEBAR_MIN_WIDTH,
  CHAPTER_SIDEBAR_MAX_WIDTH,
  CHAPTER_SIDEBAR_DEFAULT_WIDTH,
  PUBLISHED_SIDEBAR_MIN_WIDTH,
  PUBLISHED_SIDEBAR_MAX_WIDTH,
  PUBLISHED_SIDEBAR_DEFAULT_WIDTH,
  CONTEXT_SETTING_TYPE_ORDER,
  CONTEXT_ROLE_TYPE_ORDER,
  PUBLISH_CONFIRM_KEY,
  GLOBAL_NOTES_KEY,
  WORK_NOTES_KEY_PREFIX,
  GLOBAL_NOTES_LIST_KEY,
  WORK_NOTES_LIST_KEY_PREFIX,
  APP_SCALE_KEY,
  APP_SCALE_VERSION_KEY,
  APP_SCALE_BASE,
  APP_SCALE_STORAGE_VERSION,
  APP_EFFECTIVE_SCALE_CSS_VAR,
  ContextSourceWordStatus,
  getEffectiveAppScale,
  getAiPanelMaxWidth,
  normalizeAiPanelWidth,
  getChapterSidebarMaxWidth,
  normalizeChapterSidebarWidth,
  readWorkbenchChapterSidebarWidth,
  normalizePublishedSidebarWidth,
  formatMemoTime,
  createMemoItem,
  readMemoItems,
} from '@/features/workbench/components/workbenchPageSupport';
import { buildWorkbenchContextLibrary } from '../hooks/useWorkbenchContextLibrary';
import { buildWorkbenchPageChapterContext } from './workbenchPageChapterContext';

export interface WorkbenchPageProps {
  experience?: 'professional' | 'standard';
  fixedFlow?: Extract<WorkbenchCreationFlowPageKey, 'chapterOutline' | 'writing'>;
}

export function WorkbenchPage({ experience = 'professional', fixedFlow }: WorkbenchPageProps = {}) {
  const navigate = useNavigate();
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isEditorSettingsOpen, setIsEditorSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [internalCreationFlow, setInternalCreationFlow] = useState<WorkbenchCreationFlowPageKey>('writing');
  const activeCreationFlow = fixedFlow ?? internalCreationFlow;
  const switchCreationFlow = useCallback(
    (flow: WorkbenchCreationFlowPageKey) => {
      if (fixedFlow) return;
      setInternalCreationFlow(flow);
    },
    [fixedFlow],
  );
  useWorkbenchStatusFlowNavigation(switchCreationFlow);
  const [managementModal, setManagementModal] = useState<WorkbenchManagementModalKey | null>(null);
  const [fieldSizeOpenSignal, setFieldSizeOpenSignal] = useState(0);
  const [aiLogOpenSignal, setAiLogOpenSignal] = useState(0);
  const headerLogOpenHandlerRef = useRef<HeaderLogOpenHandler | null>(null);
  const registerHeaderLogOpenHandler = useCallback((handler: HeaderLogOpenHandler | null) => {
    headerLogOpenHandlerRef.current = handler;
  }, []);
  const openHeaderLog = useCallback(() => {
    const handler = headerLogOpenHandlerRef.current;
    if (handler) {
      handler();
      return;
    }
    setAiLogOpenSignal((value) => value + 1);
  }, []);
  const [settingLibraryInitialTab, setSettingLibraryInitialTab] = useState<'脑洞' | '大纲'>('大纲');
  const [isContextLibraryOpen, setIsContextLibraryOpen] = useState(false);
  const [contextLibraryTab, setContextLibraryTab] = useState<ContextLibraryTab>('outlineChapter');
  const [contextSearchText, setContextSearchText] = useState('');
  const [draftContextIds, setDraftContextIds] = useState<Set<string>>(() => new Set());
  const [linkedContextItems, setLinkedContextItems] = useState<WorkbenchLinkedContextItem[]>([]);
  const [contextSelectionTouched, setContextSelectionTouched] = useState(
    () => localStorage.getItem('xinyuexia_keep_workbench_associations_v1') !== '1',
  );
  const [publishConfirm, setPublishConfirm] = useState(() => localStorage.getItem(PUBLISH_CONFIRM_KEY) === 'true');
  const [showPublished, setShowPublished] = useState(false);
  const {
    aiPanelWidth,
    chapterSidebarWidth,
    publishedSidebarWidth,
    handlePanelDragStart,
    handleChapterSidebarDragStart,
    handlePublishedSidebarDragStart,
  } = useWorkbenchLayoutWidths();
  const { tabs, activeTabId } = useWorkspaceTabs();

  const {
    currentNovel,
    currentNovelId,
    volumes,
    recycledChapters,
    selectedChapter,
    editorContent,
    sortAsc,
    chapterSaveProps,
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
    updateNovelChapterContent,
    getChapterWordCount,
    setCurrentNovel,
  } = useWorkbenchData();
  const {
    globalNotes,
    workNotes,
    selectedMemo,
    collapsedMemoSections,
    activeMemo,
    selectMemo,
    addMemo,
    updateMemo,
    toggleMemoSection,
  } = useWorkbenchNotes(currentNovelId);

  const {
    pendingPublish,
    setPendingPublish,
    replaceEditorContent,
    undoReplaceEditorContent,
    canUndoReplace,
    handleExportSelectedChapters,
    handleExportChapters,
    publishChapterNow,
    handlePublishChapter,
  } = useWorkbenchDocumentActions({
    novel: currentNovel,
    volumes,
    selectedChapter,
    editorContent,
    publishConfirm,
    saveContent,
    setChapterPublished,
    openExport: () => setIsExportOpen(true),
  });

  const currentNovelType = currentNovel?.type ?? null;
  const currentWorkbenchId = currentNovel?.id ?? currentNovelId;
  const settingsStorageKey = currentWorkbenchId ? `xinyuexia_workbench_settings_${currentWorkbenchId}` : '';
  const outlineStorageKey = currentWorkbenchId ? `xinyuexia_workbench_outline_${currentWorkbenchId}` : '';
  const { settingsEntries, outlineEntries } = useWorkbenchLibrarySnapshots(settingsStorageKey, outlineStorageKey);
  const reviewLibraryEntries = useMemo(
    () => [...settingsEntries, ...outlineEntries],
    [outlineEntries, settingsEntries],
  );

  useEffect(() => {
    if (!currentNovelType) return;
    setInternalCreationFlow('writing');
    if (currentNovelType === 'script') {
      setShowPublished(false);
      return;
    }
    const key = `workbench_show_published_${currentNovelType}`;
    setShowPublished(localStorage.getItem(key) === 'true');
  }, [currentNovelId, currentNovelType]);

  useEffect(() => {
    if (!currentNovelId) return;
    const storedItems = readWorkbenchLinkedContextItems(currentNovelId);
    setLinkedContextItems(storedItems);
    setContextSelectionTouched(
      localStorage.getItem('xinyuexia_keep_workbench_associations_v1') !== '1' || storedItems.length > 0,
    );
    setDraftContextIds(new Set());
    setIsContextLibraryOpen(false);
  }, [currentNovelId]);

  useEffect(() => {
    setContextSelectionTouched(localStorage.getItem('xinyuexia_keep_workbench_associations_v1') !== '1');
    setDraftContextIds(new Set());
    setIsContextLibraryOpen(false);
  }, [selectedChapter?.chapter.id]);

  useEffect(() => {
    if (!currentNovel) return;
    if (currentNovel.type === 'script') return;
    localStorage.setItem(`workbench_show_published_${currentNovel.type}`, String(showPublished));
  }, [currentNovel, showPublished]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId) return;
    if (currentNovelId === activeTab.workId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  useEffect(() => {
    localStorage.setItem(PUBLISH_CONFIRM_KEY, String(publishConfirm));
  }, [publishConfirm]);

  useWorkbenchCloseShortcut({
    layers: [
      { open: isRecycleOpen, close: () => setIsRecycleOpen(false) },
      { open: isExportOpen, close: () => setIsExportOpen(false) },
      { open: isFindOpen, close: () => setIsFindOpen(false) },
      { open: isEditorSettingsOpen, close: () => setIsEditorSettingsOpen(false) },
      { open: Boolean(activeModal), close: () => setActiveModal(null) },
      { open: Boolean(managementModal), close: () => setManagementModal(null) },
      { open: isContextLibraryOpen, close: () => setIsContextLibraryOpen(false) },
      { open: Boolean(pendingPublish), close: () => setPendingPublish(null) },
    ],
    onExit: () => navigate('/novels'),
  });

  if (!currentNovel) {
    return <WorkbenchNoNovelState />;
  }

  const { chapterCount, unpolishedChapterCount, selectedVolumeName } = getWorkbenchChapterHeaderStats(
    settingsStorageKey,
    volumes,
    selectedChapter,
    editorContent,
    currentNovel.id,
  );

  const settingContextEntries = orderContextEntriesByType(
    settingsEntries.filter((entry) => normalizeTabName(entry.tab) === SETTING_TAB),
    CONTEXT_SETTING_TYPE_ORDER,
    (entry) => parseContextSettingContent(entry.content).type,
  );
  const roleContextEntries = orderContextEntriesByType(
    settingsEntries.filter((entry) => normalizeContextSource(entry.tab) === 'role'),
    CONTEXT_ROLE_TYPE_ORDER,
    (entry) => parseContextRoleContent(entry.content).type,
    { pinnedFirst: true },
  );
  const settingContextItems: WorkbenchLinkedContextItem[] = settingContextEntries
    .map((entry) => {
      const parsed = parseContextSettingContent(entry.content);
      return {
        id: `setting:${entry.id}`,
        source: 'setting' as const,
        group: parsed.type || '未分类',
        title: entry.title || '未命名设定',
        content: parsed.body || entry.content || '',
      };
    })
    .filter((item) => item.content.trim());
  const roleContextItems: WorkbenchLinkedContextItem[] = roleContextEntries
    .map((entry) => {
      const parsed = parseContextRoleContent(entry.content);
      return {
        id: `role:${entry.id}`,
        source: 'role' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名角色',
        content: parsed.body || entry.content || '',
      };
    })
    .filter((item) => item.content.trim());
  const roleStatusContextItems: WorkbenchLinkedContextItem[] = roleContextEntries
    .map((entry) => {
      const parsed = parseContextRoleStatusContent(entry.content);
      return {
        id: `status:role:${entry.id}`,
        source: 'role' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名角色',
        content: parsed.body,
      };
    })
    .filter((item) => item.content.trim());
  const settingStatusContextItems: WorkbenchLinkedContextItem[] = settingContextEntries
    .filter((entry) => isContextStatusCandidate(entry.tab, entry.type, entry.title, entry.content))
    .map((entry) => {
      const parsed = parseContextSettingContent(entry.content);
      return {
        id: `status:setting:${entry.id}`,
        source: 'setting' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名设定',
        content: extractContextStatusRecord(parsed.body || entry.content),
      };
    })
    .filter((item) => item.content.trim());
  const statusContextItems = [...roleStatusContextItems, ...settingStatusContextItems];
  const libraryContextEntries = [...settingsEntries, ...outlineEntries];
  const outlineContextItems: WorkbenchLinkedContextItem[] = libraryContextEntries
    .filter(isContextOutlineEntry)
    .map((entry) => ({
      id: `outline:${entry.id}`,
      source: 'outline',
      group: getContextEntryGroup(entry.tab, entry.type),
      title: entry.title || '未命名章纲',
      content: entry.content || '',
    }));
  const summaryContextItems: WorkbenchLinkedContextItem[] = libraryContextEntries
    .filter(isContextSummaryEntry)
    .map((entry) => ({
      id: `summary:${entry.id}`,
      source: 'summary',
      group: getContextEntryGroup(entry.tab, entry.type),
      title: entry.title || '未命名梗概',
      content: entry.content || '',
    }));
  const summaryChapterSerials = new Set(
    summaryContextItems.map((item) => getContextEntrySerial(item.title)).filter(Boolean),
  );
  const summaryChapterCount = summaryChapterSerials.size > 0 ? summaryChapterSerials.size : summaryContextItems.length;
  const flowStats: WorkbenchHeaderFlowStats = {
    brainstorm: {
      meta: `${settingsEntries.filter((entry) => normalizeTabName(entry.tab) === BRAINSTORM_TAB).length}个脑洞`,
    },
    outline: {
      meta: `${
        settingsEntries.filter((entry) => {
          const normalizedTab = normalizeTabName(entry.tab);
          if (normalizedTab === ROLE_TAB) return true;
          if (normalizedTab !== SETTING_TAB) return false;
          const settingType = parseSettingContent(entry.content).type;
          return settingType !== BRAINSTORM_TYPE && settingType !== UNCATEGORIZED_TYPE;
        }).length
      }个设定`,
    },
    chapterOutline: { meta: `${outlineContextItems.length}章` },
    writing: { meta: `${chapterCount}章` },
    audit: { meta: `${chapterCount}章未审`, tone: 'warning' },
    polish: { meta: `${unpolishedChapterCount}章未润色`, tone: unpolishedChapterCount > 0 ? 'warning' : 'normal' },
    comment: { meta: `${chapterCount}章未点评`, tone: 'warning' },
    status: { meta: `${chapterCount}章未更新`, tone: 'warning' },
    summary: { meta: `${summaryChapterCount}章`, tone: summaryChapterCount < chapterCount ? 'warning' : 'normal' },
  };
  const { chapterContextItems, contextChapterRows, selectedChapterSerialNumber } = buildWorkbenchPageChapterContext({
    volumes,
    selectedChapter,
    outlineContextItems,
    summaryContextItems,
    readContent: (chapterId) => readChapterContent(currentNovel.id, chapterId),
  });
  const otherContextColumns: ContextColumn[] = [
    { source: 'setting', title: '大纲设定', subtitle: '读取大纲里的设定分类和卡片', items: settingContextItems },
  ];
  const roleContextColumns: ContextColumn[] = [
    {
      source: 'role',
      title: '人物设定',
      subtitle: '读取大纲里的人物设定，并保持分类和卡片顺序',
      items: roleContextItems,
    },
  ];
  const statusContextColumns: ContextColumn[] = [
    {
      source: 'role',
      title: '状态',
      subtitle: '读取角色、道具、势力等卡片里的最新状态记录',
      items: statusContextItems,
    },
  ];
  const activeContextColumns =
    contextLibraryTab === 'status'
      ? statusContextColumns
      : contextLibraryTab === 'role'
        ? roleContextColumns
        : otherContextColumns;
  const {
    allContextItems,
    canConfirmContextLibrary,
    chapterRowContextItems,
    confirmContextLibrary,
    contextItemById,
    contextLibraryConfirmTitle,
    defaultOptionalContextItems,
    draftChapterWordCount,
    draftContextWordCount,
    draftOutlineWordCount,
    draftSummaryWordCount,
    effectiveLinkedContextItems,
    effectiveRequiredContextItems,
    openContextLibrary,
    optionalLinkedContextItems,
    pickChapterContextItem,
    pickDraftContextItem,
    previousContextRow,
    rawOptionalLinkedContextItems,
    requiredContextIds,
    requiredContextItems,
    selectRecentChapterContexts,
    shouldAttachRequiredContext,
    toggleChapterContextRow,
    toggleDraftContext,
    updateLinkedContextItems,
  } = buildWorkbenchContextLibrary({
    contextChapterRows,
    contextSelectionTouched,
    currentNovelId,
    draftContextIds,
    linkedContextItems,
    outlineContextItems,
    roleContextItems,
    selectedChapterSerialNumber,
    setContextLibraryTab,
    setContextSelectionTouched,
    setDraftContextIds,
    setIsContextLibraryOpen,
    setLinkedContextItems,
    settingContextItems,
    statusContextItems,
    summaryContextItems,
  });

  const showFieldSizeButton = activeCreationFlow === 'writing' || FIELD_SIZE_FLOW_IDS.has(activeCreationFlow);
  const showHeaderLogButton = true;

  const chapterEditorProps = {
    chapter: selectedChapter?.chapter ?? null,
    volumeName: selectedVolumeName,
    content: editorContent,
    ...chapterSaveProps,
    allChapters: volumes.flatMap((volume) => volume.chapters),
    volumes,
    settingsStorageKey,
    outlineStorageKey,
    reviewLibraryEntries,
    getChapterContent: (chapterId: number) =>
      selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(currentNovel.id, chapterId),
    onUpdateChapterContent: (chapterId: number, nextContent: string) =>
      updateNovelChapterContent(currentNovel.id, chapterId, nextContent),
    onRenameChapter: renameChapter,
    onChangeContent: saveContent,
    onUpdateSerialNumber: updateChapterSerialNumber,
    onDeleteChapter: (chapterId: number) => {
      if (selectedChapter) deleteChapter(selectedChapter.volumeId, chapterId);
    },
    onOpenFind: () => setIsFindOpen(true),
    onOpenSummaryLibrary: () => switchCreationFlow('summary'),
  };
  const creationFlowContent = (
    <WorkbenchCreationFlowContent
      activeFlow={activeCreationFlow}
      settingsStorageKey={settingsStorageKey}
      outlineStorageKey={outlineStorageKey}
      volumes={volumes}
      fieldSizeOpenSignal={fieldSizeOpenSignal}
      aiLogOpenSignal={aiLogOpenSignal}
      onRegisterHeaderLog={registerHeaderLogOpenHandler}
      getChapterContent={chapterEditorProps.getChapterContent}
      chapterEditorProps={chapterEditorProps}
    />
  );

  return (
    <div
      className="relative flex h-full flex-col bg-[#f5f5f7]"
      data-workbench-experience={experience}
      data-workbench-flow={activeCreationFlow}
    >
      {experience === 'professional' ? (
        <WorkbenchHeader
          workTitle={currentNovel.title}
          flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
          activeFlow={activeCreationFlow}
          flowStats={flowStats}
          fieldSizeVisible={showFieldSizeButton}
          logVisible={showHeaderLogButton}
          extraTools={<div id="workbench-header-extra-tools" className="inline-flex items-center gap-2" />}
          onOpenFieldSize={() => {
            if (activeCreationFlow === 'writing') {
              setIsEditorSettingsOpen(true);
              return;
            }
            setFieldSizeOpenSignal((value) => value + 1);
          }}
          onOpenLog={openHeaderLog}
          onSelectFlow={switchCreationFlow}
          onOpenWorkInfo={() => setActiveModal('workInfo')}
        />
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        <WorkbenchWritingLayout
          writing={activeCreationFlow === 'writing'}
          content={creationFlowContent}
          showPublished={showPublished}
          aiPanelWidth={aiPanelWidth}
          onChapterResize={handleChapterSidebarDragStart}
          onPublishedResize={handlePublishedSidebarDragStart}
          onAiResize={handlePanelDragStart}
          chapterSidebarProps={{
            volumes,
            width: chapterSidebarWidth,
            sortAsc,
            recycledCount: recycledChapters.length,
            workType: currentNovel.type,
            showPublished,
            onTogglePublished: () => setShowPublished((prev) => !prev),
            onToggleVolume: toggleVolume,
            onToggleSort: toggleSort,
            onSelectChapter: selectChapter,
            onEditChapter: selectChapter,
            onAddChapter: addChapter,
            onAddVolume: addVolume,
            onDeleteVolume: deleteVolume,
            onDeleteChapter: deleteChapter,
            onPublishChapter: handlePublishChapter,
            onOpenRecycle: () => setIsRecycleOpen(true),
            onExportChapters: handleExportChapters,
            getChapterWordCount,
          }}
          publishedSidebarProps={{
            volumes,
            width: publishedSidebarWidth,
            onSelectChapter: selectChapter,
            onEditChapter: selectChapter,
            onUnpublishChapter: (chapterId) => setChapterPublished(chapterId, false),
            onDeleteChapter: deleteChapter,
            getChapterWordCount,
          }}
          aiPanelProps={{
            activeTool: 'ai',
            workId: currentNovel.id,
            selectedChapterContent: editorContent,
            linkedContextItems: effectiveLinkedContextItems,
            onReplaceContent: replaceEditorContent,
            onUndoReplace: undoReplaceEditorContent,
            canUndoReplace,
            onOpenModelManage: () => setManagementModal('models'),
            onOpenAgentManage: () => setManagementModal('agents'),
            onOpenContextLibrary: openContextLibrary,
            onClearLinkedContext: () => {
              setContextSelectionTouched(true);
              updateLinkedContextItems([]);
            },
            openLogSignal: aiLogOpenSignal,
            onRegisterHeaderLog: registerHeaderLogOpenHandler,
          }}
        />
      </div>

      <WorkbenchPageModalHost
        exportPanel={{
          open: isExportOpen,
          volumes,
          workType: currentNovel.type,
          getChapterWordCount,
          onClose: () => setIsExportOpen(false),
          onExport: handleExportSelectedChapters,
        }}
        recycle={{
          isOpen: isRecycleOpen,
          chapters: recycledChapters,
          onClose: () => setIsRecycleOpen(false),
          onRestore: (chapterId) => {
            restoreChapter(chapterId);
            setIsRecycleOpen(false);
          },
          onPermanentDelete: permanentDeleteChapter,
        }}
        managementType={managementModal}
        onCloseManagement={() => setManagementModal(null)}
        contextLibrary={{
          open: isContextLibraryOpen,
          tab: contextLibraryTab,
          rows: contextChapterRows,
          columns: activeContextColumns,
          selectedIds: draftContextIds as Set<string>,
          lockedIds: requiredContextIds as Set<string>,
          searchText: contextSearchText,
          chapterWords: draftChapterWordCount,
          summaryWords: draftSummaryWordCount,
          outlineWords: draftOutlineWordCount,
          totalWords: draftContextWordCount,
          canConfirm: canConfirmContextLibrary,
          confirmTitle: contextLibraryConfirmTitle,
          onClose: () => setIsContextLibraryOpen(false),
          onTabChange: setContextLibraryTab,
          onSearchChange: setContextSearchText,
          onToggleChapter: toggleChapterContextRow,
          onPickItem: pickChapterContextItem,
          onSelectRecent: selectRecentChapterContexts,
          onClear: () => setDraftContextIds(new Set<string>(requiredContextIds as Set<string>)),
          onToggle: toggleDraftContext,
          onConfirm: confirmContextLibrary,
        }}
        findReplace={
          currentNovelId
            ? {
                open: isFindOpen,
                novelId: currentNovelId,
                volumes,
                selectedChapter,
                editorContent,
                onClose: () => setIsFindOpen(false),
                onSelectChapter: selectChapter,
                onUpdateChapterContents: updateChapterContents,
              }
            : null
        }
        editorSettings={{
          open: isEditorSettingsOpen,
          publishConfirm,
          onChangePublishConfirm: setPublishConfirm,
          onClose: () => setIsEditorSettingsOpen(false),
        }}
        publish={{
          item: pendingPublish,
          onClose: () => setPendingPublish(null),
          onConfirm: () => {
            if (pendingPublish) publishChapterNow(pendingPublish.chapterId);
            setPendingPublish(null);
          },
        }}
        workInfo={{
          open: activeModal === 'workInfo',
          novel: currentNovel,
          volumeCount: volumes.length,
          chapterCount,
          onClose: () => setActiveModal(null),
        }}
        settingLibrary={{
          open: activeModal === 'settingLibrary',
          initialTab: settingLibraryInitialTab,
          onClose: () => setActiveModal(null),
          storageKey: settingsStorageKey,
          outlineStorageKey,
          tabs: ['大纲', '角色', '脑洞'],
          emptyText: '暂无内容',
          volumes,
          scale: 1.1,
          defaultActiveTab: settingLibraryInitialTab,
        }}
        detailOutlineLibrary={{
          open: activeModal === 'detailOutlineLibrary',
          onClose: () => setActiveModal(null),
          storageKey: settingsStorageKey,
          outlineStorageKey,
          tabs: ['细纲'],
          emptyText: '暂无章纲内容',
          volumes,
          getChapterContent: (chapterId) => readChapterContent(currentNovel.id, chapterId),
          scale: 1.1,
        }}
        notes={{
          open: activeModal === 'notes',
          globalNotes,
          workNotes,
          selected: selectedMemo,
          collapsed: collapsedMemoSections,
          activeMemo,
          onClose: () => setActiveModal(null),
          onToggleSection: toggleMemoSection,
          onAdd: addMemo,
          onSelect: selectMemo,
          onUpdate: updateMemo,
        }}
      />
    </div>
  );
}
