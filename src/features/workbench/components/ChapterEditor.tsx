import { ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { useModels } from '@/features/models/hooks/useModels';
import {
  AUDIT_PROMPT_SUBCATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  normalizePromptSubcategory,
} from '@/features/prompts/hooks/usePrompts';
import { isChapterContentPolished } from '@/features/workbench/model/chapterPolishStatus';
import {
  AUDIT_OUTLINE_FIT_ITEM,
  AUDIT_STRUCTURE_CHECK_ITEMS,
  getAuditOutlineFitPercent,
  getAuditStructureItemDetail,
  getAuditStructureItemStatus,
  isAuditOutputPassed,
} from '@/features/workbench/model/chapterAuditResult';
import {
  buildReviewTextDiff,
  extractReviewAnnotations,
  extractReviewRevisedText,
  getReviewAnnotationParagraphIndex,
  splitReviewParagraphs,
  stripReviewThinkingBlock,
  type ReviewAnnotation,
} from '@/features/workbench/model/chapterReviewText';
import { getReviewLogFillGroupWeights, getReviewLogSection } from '@/features/workbench/model/chapterReviewLog';
import { REVIEW_MODE_TITLES, type ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';
import { ASSOCIATED_CHAPTERS_KEY } from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import {
  EDITOR_GRID_LINE_LEFT_OFFSET_PX,
  EDITOR_GRID_LINE_RIGHT_OFFSET_PX,
  getStoredFormatSettings,
  getStoredFontSettings,
  getEditorGridLineStyle,
  getEditorTextLineHeight,
  type FormatOptions,
  type FontSettings,
} from '@/features/workbench/components/EditorToolModals';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import {
  ChapterNumberButton,
  CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE,
} from '@/shared/ui/ChapterNumberButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';

import { WorkbenchModal } from './WorkbenchModal';
import { ChapterStatusPanel } from './ChapterStatusPanel';
import { ChapterWritingSurface } from './ChapterWritingSurface';
import { ChapterEditorModalHost } from './ChapterEditorModalHost';
import { ChapterStatusManagementModal } from './ChapterStatusManagementModal';
import { ChapterReviewPanel } from './ChapterReviewPanel';
import { ChapterReviewLogModal } from './ChapterReviewLogModal';
import type { ChapterEditorProps } from './chapterEditorTypes';
import { ChapterEditorSettingsModal } from './ChapterEditorSettingsModal';
import { useChapterStatus } from '../hooks/useChapterStatus';
import { useChapterReviewState } from '../hooks/useChapterReviewState';
import { useChapterReviewBackgroundTasks } from '../hooks/useChapterReviewBackgroundTasks';
import { useChapterReviewPrompts } from '../hooks/useChapterReviewPrompts';
import { useChapterReviewRequest } from '../hooks/useChapterReviewRequest';
import { useChapterEditorInput } from '../hooks/useChapterEditorInput';
import { useChapterAssociations } from '../hooks/useChapterAssociations';
import { useChapterEditorPanels } from '../hooks/useChapterEditorPanels';
import { useChapterEditorSettingsModal } from '../hooks/useChapterEditorSettingsModal';
import { useChapterReviewPresentation } from '../hooks/useChapterReviewPresentation';
import { useApplyTextAuditContent } from '../hooks/useApplyTextAuditContent';
import type { ChapterEditorEmbeddedMode } from './chapterEditorReviewConfig';
import {
  countCompactWords,
  findReviewDetailOutline,
  getExistingStatusForChapter,
  getReviewAnnotationNoteSpacingClass,
  getReviewBackgroundTaskOutput,
  getReviewSeverityClass,
  getStatusTargetLabel,
  isReviewDetailOutlineEntry,
  isStatusTargetEntry,
  renderAiThinkingContent,
  renderAnnotatedReviewParagraph,
  renderTextAuditOriginalDiff,
  renderTextAuditRevisedDiff,
  upsertEntryStatus,
} from './chapterEditorPresentation';
import {
  FLOATING_AI_TEXTAREA_MAX_HEIGHT,
  FLOATING_AI_TEXTAREA_MIN_HEIGHT,
  getCenteredReviewComparisonScrollTop,
  readReviewModelId,
  resizeFloatingAiTextarea,
  REVIEW_MANAGEMENT_MODAL_SIZE_CLASS,
  REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS,
  REVIEW_MODEL_ID_STORAGE_KEY,
  REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS,
  scrollReviewComparisonTargetIntoCenter,
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from './chapterEditorLayout';
import type { ReviewPreviewWidthMode } from './chapterEditorLayout';
import { renderChapterEditorView } from './ChapterEditorView';

export function ChapterEditor({
  embeddedMode,
  fieldSizeOpenSignal = 0,
  showInlineFieldSizeButton = true,
  openLogSignal = 0,
  onRegisterHeaderLog,
  chapter,
  volumeName,
  content,
  lastSavedAt,
  allChapters,
  volumes = [],
  settingsStorageKey,
  outlineStorageKey,
  reviewLibraryEntries,
  getChapterContent,
  onUpdateChapterContent,
  onRenameChapter,
  onChangeContent,
  onUpdateSerialNumber,
  onDeleteChapter,
  onOpenFind,
  onOpenSummaryLibrary,
}: ChapterEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isSmartFormatOpen, setIsSmartFormatOpen] = useState(false);
  const [isHighFreqOpen, setIsHighFreqOpen] = useState(false);
  const [isSymbolReplaceOpen, setIsSymbolReplaceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTitleOptimizeOpen, setIsTitleOptimizeOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(
    () => embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish',
  );
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(() => embeddedMode === 'status');
  const { isOpen: isEditorSettingsOpen, setIsOpen: setIsEditorSettingsOpen } =
    useChapterEditorSettingsModal(fieldSizeOpenSignal);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());
  const [expandedAuditStructureItems, setExpandedAuditStructureItems] = useState<Set<string>>(() => new Set());
  const [reviewModelId, setReviewModelId] = useState(() => readReviewModelId());
  const activeChapterId = chapter?.id ?? null;
  const {
    activeReviewState,
    reviewChapterId,
    reviewMode,
    setReviewMode,
    reviewModeStates,
    setReviewModeStates,
    updateReviewModeState,
    isReviewAiLoading,
    setIsReviewAiLoading,
    isReviewLogOpen,
    setIsReviewLogOpen,
    reviewAiInput,
    reviewAiOutput,
    reviewRevisedDraft,
    reviewRequestLog,
    setReviewAiInput,
    setReviewAiOutput,
    setReviewRevisedDraft,
    clearReviewAiOutput,
    activateReviewMode,
    selectReviewChapter,
  } = useChapterReviewState({
    initialMode: embeddedMode === 'comment' || embeddedMode === 'polish' ? embeddedMode : 'audit',
    activeChapterId,
    settingsStorageKey,
  });
  const {
    activeReviewPrompt,
    activeReviewPromptOptions,
    activeReviewPromptId,
    activeReviewPromptCategory,
    isAuditTextReview,
    isAuditStructureReview,
    handleActiveReviewPromptChange,
    statusPrompts,
    activeStatusPromptId,
    setStatusPromptId,
  } = useChapterReviewPrompts({ reviewMode, clearReviewAiOutput });
  const canShowReviewOutline = reviewMode !== 'polish';
  const {
    reviewPageLeftWidth,
    reviewPageRightWidth,
    statusPageLeftWidth,
    statusPageRightWidth,
    reviewPreviewWidthMode,
    reviewPreviewFontSize,
    showReviewOutline,
    effectiveShowReviewOutline,
    activeReviewPreviewScrollPane,
    reviewPreviewGridRef,
    reviewPreviewGridTemplateColumns,
    handleReviewPreviewScroll,
    setReviewPreviewWidthModeWithStorage,
    setReviewOutlineVisibilityWithBalancedColumns,
    setReviewPreviewFontSizeWithStorage,
    statusLeftResizeHandle,
    statusRightResizeHandle,
    reviewLeftResizeHandle,
    reviewRightResizeHandle,
    reviewPreviewOutlineResizeHandle,
    reviewPreviewTextColumnSeparator,
  } = useChapterEditorPanels({ canShowReviewOutline });
  const [reviewManagementModal, setReviewManagementModal] = useState<'models' | 'prompts' | null>(null);
  const [embeddedPortalElement, setEmbeddedPortalElement] = useState<HTMLDivElement | null>(null);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [fontSettings, setFontSettings] = useState<FontSettings>(getStoredFontSettings);
  const [formatSettings, setFormatSettings] = useState<FormatOptions>(getStoredFormatSettings);
  const [copyToast, setCopyToast] = useState('');
  const showToast = useCallback((text: string) => setCopyToast(text), []);
  const {
    textareaRef,
    editorScrollTop,
    setEditorScrollTop,
    commitContent,
    handleContentChange,
    handlePaste,
    handleKeyDown,
    copyText,
    findNext,
    replaceAll,
    handleSmartFormatNow,
    handleSymbolReplaceNow,
    handleSymbolAutoEnabled,
  } = useChapterEditorInput({
    chapter,
    content,
    formatSettings,
    findText,
    replaceText,
    onChangeContent,
    onOpenFind,
    onToast: showToast,
    setIsSymbolReplaceOpen,
    setShowDeleteConfirm,
  });
  const { associatedCount, handleAssociate } = useChapterAssociations({
    allChapters,
    setIsAssociateOpen,
    setIsHistoryOpen,
  });
  const editorGridLineStyle = useMemo(
    () => getEditorGridLineStyle(fontSettings, editorScrollTop),
    [editorScrollTop, fontSettings],
  );
  const editorTextLineHeight = useMemo(() => getEditorTextLineHeight(fontSettings), [fontSettings]);
  const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;
  const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;
  const reviewModalDraggable = useDraggableModal('chapter_review_panel');
  useTopModalEscape(isReviewLogOpen, () => setIsReviewLogOpen(false));
  useTopModalEscape(Boolean(reviewManagementModal), () => setReviewManagementModal(null));
  useTopModalEscape(!embeddedMode && isReviewOpen && !isReviewLogOpen && !reviewManagementModal, () =>
    setIsReviewOpen(false),
  );
  useTopModalEscape(!embeddedMode && isStatusUpdateOpen, () => setIsStatusUpdateOpen(false));
  useTopModalEscape(isFindOpen, () => setIsFindOpen(false));

  useEffect(() => {
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;
    lastOpenLogSignalRef.current = openLogSignal;
    setIsReviewLogOpen(true);
  }, [embeddedMode, openLogSignal, setIsReviewLogOpen]);

  useEffect(() => {
    if (!onRegisterHeaderLog) return;
    if (embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish') {
      onRegisterHeaderLog(() => setIsReviewLogOpen(true));
      return () => onRegisterHeaderLog(null);
    }
    onRegisterHeaderLog(null);
  }, [embeddedMode, onRegisterHeaderLog, setIsReviewLogOpen]);

  const titleCount = chapter?.title.length ?? 0;
  const serialValue = chapter?.serialNumber ?? 1;
  const safeVolumeName = volumeName ?? '第一卷';
  const wordCount = useMemo(() => content.replace(/\s/g, '').length, [content]);
  const { models: modelSnapshot } = useModels();
  const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);
  const sortedReviewChapters = useMemo(
    () => [...allChapters].sort((a, b) => a.serialNumber - b.serialNumber),
    [allChapters],
  );
  const chapterDirectoryGroups = useMemo(() => {
    if (volumes.length > 0) {
      return volumes.map((volume) => ({
        id: volume.id,
        name: volume.name,
        chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber),
      }));
    }
    return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];
  }, [sortedReviewChapters, volumes]);
  const {
    expandedStatusVolumeIds,
    toggleStatusDirectoryVolume,
    activeStatusChapter,
    statusPreviewChapters,
    statusPreviewText,
    statusPreviewWordCount,
    statusTargetEntries,
    selectedStatusTargets,
    statusTargetIds,
    toggleStatusTarget,
    statusDraft,
    setStatusDraft,
    statusUpdatedChapterIds,
    selectStatusChapter,
    saveStatusUpdate,
  } = useChapterStatus({
    chapter,
    content,
    getChapterContent,
    sortedChapters: sortedReviewChapters,
    chapterDirectoryGroups,
    settingsStorageKey,
    embeddedStatus: embeddedMode === 'status',
    setIsStatusUpdateOpen,
    onToast: setCopyToast,
  });
  useEffect(() => {
    setExpandedReviewVolumeIds((current) => {
      const next = new Set(current);
      chapterDirectoryGroups.forEach((group) => next.add(group.id));
      return next;
    });
  }, [chapterDirectoryGroups]);
  const toggleReviewDirectoryVolume = (volumeId: number) => {
    setExpandedReviewVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };
  const toggleAuditStructureItem = (item: string) => {
    setExpandedAuditStructureItems((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };
  const {
    activeReviewParagraphIndex,
    reviewOriginalPreviewPaneRef,
    reviewAnnotationPreviewPaneRef,
    reviewOriginalParagraphRefs,
    reviewAnnotationRefs,
    activeReviewChapter,
    activeReviewContent,
    activeReviewWordCount,
    activeReviewDetailOutline,
    activeReviewDetailOutlineText,
    polishPreviewText,
    polishPreviewParagraphs,
    activeReviewModel,
    reviewPreviewOriginalTitle,
    reviewPreviewAnnotationTitle,
    auditOutputPassed,
    reviewOriginalParagraphs,
    auditRevisedText,
    auditRevisedParagraphs,
    auditParagraphCountMatches,
    reviewAnnotations,
    reviewAnnotationsByParagraph,
    selectReviewPreviewParagraph,
  } = useChapterReviewPresentation({
    sortedChapters: sortedReviewChapters,
    reviewChapterId,
    chapter,
    content,
    getChapterContent,
    reviewLibraryEntries,
    settingsStorageKey,
    outlineStorageKey,
    reviewRevisedDraft,
    reviewAiOutput,
    reviewModels,
    reviewModelId,
    reviewMode,
    isAuditTextReview,
  });
  const applyTextAuditContent = useApplyTextAuditContent({
    activeReviewChapter,
    onUpdateChapterContent,
    setReviewRevisedDraft,
    onToast: setCopyToast,
  });
  const setReviewModelIdWithStorage = (nextModelId: string) => {
    setReviewModelId(nextModelId);
    localStorage.setItem(REVIEW_MODEL_ID_STORAGE_KEY, nextModelId);
  };
  useEffect(() => {
    if (reviewModels.length === 0) {
      if (reviewModelId) setReviewModelIdWithStorage('');
      return;
    }
    if (!reviewModels.some((model) => model.id === reviewModelId)) {
      setReviewModelIdWithStorage(reviewModels[0].id);
    }
  }, [reviewModelId, reviewModels]);

  useChapterReviewBackgroundTasks({
    activeReviewChapterId: activeReviewChapter?.id ?? null,
    reviewMode,
    reviewModeStates,
    setReviewModeStates,
    setIsReviewAiLoading,
    settingsStorageKey,
  });

  const openReviewPanel = useCallback(
    (mode: ReviewMode) => {
      activateReviewMode(mode);
      setReviewManagementModal(null);
      setIsReviewOpen(true);
    },
    [activateReviewMode],
  );

  useEffect(() => {
    if (embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish') {
      openReviewPanel(embeddedMode);
    }
  }, [embeddedMode, activeChapterId, openReviewPanel]);

  const { sendReviewAiMessage, stopReviewAiMessage } = useChapterReviewRequest({
    reviewMode,
    activeReviewState,
    updateReviewModeState,
    isReviewAiLoading,
    setIsReviewAiLoading,
    activeReviewChapter,
    activeReviewModel,
    activeReviewPrompt,
    activeReviewDetailOutline,
    activeReviewContent,
    activeReviewWordCount,
    reviewAiInput,
    settingsStorageKey,
  });

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(''), 1600);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  if (!chapter) {
    return (
      <section className="flex flex-1 items-center justify-center bg-white">
        <p className="text-sm text-gray-400">请选择章节</p>
      </section>
    );
  }

  const editorSettingsModal = (
    <ChapterEditorSettingsModal isOpen={isEditorSettingsOpen} onClose={() => setIsEditorSettingsOpen(false)} />
  );

  const isEmbeddedReviewMode = embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish';
  const activeReviewModeTitle = REVIEW_MODE_TITLES[reviewMode];
  const showStatusUpdatePanel = embeddedMode ? embeddedMode === 'status' : isStatusUpdateOpen;
  const showReviewPanel = embeddedMode ? isEmbeddedReviewMode : isReviewOpen;
  const reviewPortalTarget = isEmbeddedReviewMode ? embeddedPortalElement : document.body;
  const canRenderReviewPanel = showReviewPanel && Boolean(reviewPortalTarget);
  const reviewManagementModalSizeClass = isEmbeddedReviewMode
    ? REVIEW_MANAGEMENT_MODAL_SIZE_CLASS
    : REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS;
  const reviewLogModal = isReviewLogOpen ? (
    <ChapterReviewLogModal
      isOpen={isReviewLogOpen}
      activeReviewModeTitle={activeReviewModeTitle}
      reviewRequestLog={reviewRequestLog ?? ''}
      activeReviewModel={activeReviewModel ?? null}
      activeReviewPrompt={activeReviewPrompt ?? null}
      chapter={activeReviewChapter ?? null}
      onClose={() => setIsReviewLogOpen(false)}
    />
  ) : null;

  return renderChapterEditorView({
    ChapterEditorModalHost,
    ChapterReviewPanel,
    ChapterStatusManagementModal,
    ChapterStatusPanel,
    ChapterWritingSurface,
    activeReviewChapter,
    activeReviewContent,
    activeReviewDetailOutlineText,
    activeReviewModeTitle,
    activeReviewModel,
    activeReviewParagraphIndex,
    activeReviewPreviewScrollPane,
    activeReviewPromptCategory,
    activeReviewPromptId,
    activeReviewPromptOptions,
    activeReviewWordCount,
    applyTextAuditContent,
    activeStatusChapter,
    activeStatusPromptId,
    allChapters,
    associatedCount,
    auditOutputPassed,
    auditParagraphCountMatches,
    auditRevisedParagraphs,
    auditRevisedText,
    canRenderReviewPanel,
    canShowReviewOutline,
    chapter,
    chapterDirectoryGroups,
    clearReviewAiOutput,
    commitContent,
    content,
    copyText,
    copyToast,
    editorSettingsModal,
    editorGridLineStyle,
    editorScrollTop,
    editorTextLineHeight,
    editorTextPaddingLeft,
    editorTextPaddingRight,
    effectiveShowReviewOutline,
    embeddedMode,
    expandedAuditStructureItems,
    expandedReviewVolumeIds,
    expandedStatusVolumeIds,
    findNext,
    findText,
    fontSettings,
    formatSettings,
    getChapterContent,
    handleActiveReviewPromptChange,
    handleAssociate,
    handleContentChange,
    handleKeyDown,
    handlePaste,
    handleReviewPreviewScroll,
    handleSmartFormatNow,
    handleSymbolAutoEnabled,
    handleSymbolReplaceNow,
    isAssociateOpen,
    isAuditStructureReview,
    isAuditTextReview,
    isEmbeddedReviewMode,
    isFindOpen,
    isFontSettingsOpen,
    isHighFreqOpen,
    isHistoryOpen,
    isReviewAiLoading,
    isSmartFormatOpen,
    isSymbolReplaceOpen,
    isTitleOptimizeOpen,
    lastSavedAt,
    onDeleteChapter,
    onOpenFind,
    onRenameChapter,
    onUpdateSerialNumber,
    polishPreviewParagraphs,
    polishPreviewText,
    replaceAll,
    replaceText,
    reviewAiInput,
    reviewAiOutput,
    reviewAnnotationPreviewPaneRef,
    reviewAnnotationRefs,
    reviewAnnotations,
    reviewAnnotationsByParagraph,
    reviewLeftResizeHandle,
    reviewLogModal,
    reviewManagementModal,
    reviewManagementModalSizeClass,
    reviewModalDraggable,
    reviewMode,
    reviewModelId,
    reviewModels,
    reviewOriginalParagraphRefs,
    reviewOriginalParagraphs,
    reviewOriginalPreviewPaneRef,
    reviewPageLeftWidth,
    reviewPageRightWidth,
    reviewPortalTarget,
    reviewPreviewAnnotationTitle,
    reviewPreviewFontSize,
    reviewPreviewGridRef,
    reviewPreviewGridTemplateColumns,
    reviewPreviewOriginalTitle,
    reviewPreviewOutlineResizeHandle,
    reviewPreviewTextColumnSeparator,
    reviewPreviewWidthMode,
    reviewRightResizeHandle,
    safeVolumeName,
    saveStatusUpdate,
    selectReviewChapter,
    selectReviewPreviewParagraph,
    selectStatusChapter,
    selectedStatusTargets,
    sendReviewAiMessage,
    serialValue,
    setCopyToast,
    setEditorScrollTop,
    setEmbeddedPortalElement,
    setFindText,
    setFontSettings,
    setFormatSettings,
    setIsAssociateOpen,
    setIsEditorSettingsOpen,
    setIsFindOpen,
    setIsFontSettingsOpen,
    setIsHighFreqOpen,
    setIsHistoryOpen,
    setIsReviewOpen,
    setIsSmartFormatOpen,
    setIsStatusUpdateOpen,
    setIsSymbolReplaceOpen,
    setIsTitleOptimizeOpen,
    setReplaceText,
    setReviewAiInput,
    setReviewManagementModal,
    setReviewModelIdWithStorage,
    setReviewOutlineVisibilityWithBalancedColumns,
    setReviewPreviewFontSizeWithStorage,
    setReviewPreviewWidthModeWithStorage,
    setShowDeleteConfirm,
    setStatusDraft,
    setStatusPromptId,
    settingsStorageKey,
    showDeleteConfirm,
    showInlineFieldSizeButton,
    showReviewOutline,
    showStatusUpdatePanel,
    statusDraft,
    statusLeftResizeHandle,
    statusPageLeftWidth,
    statusPageRightWidth,
    statusPreviewChapters,
    statusPreviewText,
    statusPreviewWordCount,
    statusPrompts,
    statusRightResizeHandle,
    statusTargetEntries,
    statusTargetIds,
    statusUpdatedChapterIds,
    stopReviewAiMessage,
    textareaRef,
    titleCount,
    toggleAuditStructureItem,
    toggleReviewDirectoryVolume,
    toggleStatusDirectoryVolume,
    toggleStatusTarget,
    wordCount,
  });
}
