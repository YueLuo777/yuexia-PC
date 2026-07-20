/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- compatibility branch extracted from the repository baseline.
import { createOutlineControllerPhase1 } from './createOutlineControllerPhase1';
import { createOutlineControllerPhase2 } from './createOutlineControllerPhase2';
import { createOutlineControllerPhase3 } from './createOutlineControllerPhase3';
import { renderOutlineWorkspaceView } from './OutlineWorkspaceView';
import {
  BRAINSTORM_TAB,
  BRAINSTORM_TYPE,
  CHAPTER_DETAIL_OUTLINE_TAB,
  CHAPTER_SUMMARY_TAB,
  DEFAULT_SETTING_ENTRY_TYPE,
  DETAIL_OUTLINE_DISPLAY_LABEL,
  DETAIL_OUTLINE_PROMPT_CATEGORY,
  DETAIL_OUTLINE_TAB,
  LEGACY_VOLUME_SUMMARY_TAB,
  LEGACY_VOLUME_SUMMARY_TAB_OLD,
  OUTLINE_LIBRARY_TAB,
  PROMPT_SETTING_CATEGORY,
  ROLE_TAB,
  SETTING_LIBRARY_TABS,
  SETTING_TAB,
  UNCATEGORIZED_TYPE,
  VOLUME_SUMMARY_TAB,
  WORKBENCH_FIELD_SIZE_KEYS_BY_TAB,
  getWorkbenchFieldSizeTabLabel,
  getWorkbenchTabDisplayLabel,
  isDetailOutlineLikeTab,
  isSettingLikeTab,
  normalizeTabName,
} from './workbenchLibraryTabs';
import {
  DEFAULT_ROLE_TYPES,
  ROLE_TAXONOMY_DEFAULTS_VERSION,
  SETTING_TAXONOMY_DEFAULTS_VERSION,
  clearStoredBrainstormAiSessionPreviews,
  getBrainstormRecycleStorageKey,
  getHiddenRoleTypesStorageKey,
  getHiddenSettingTypesStorageKey,
  getRoleTaxonomyDefaultsVersionStorageKey,
  getRoleTypesStorageKey,
  getSettingTaxonomyDefaultsVersionStorageKey,
  getSettingTypeDomainsStorageKey,
  getSettingTypesStorageKey,
  hasLibraryAiDialogContent,
  isLockedDefaultSettingEntry,
  normalizeEntries,
  normalizeLinkedOtherSettingIds,
  readBrainstormRecycleEntries,
  readCustomRoleTypes,
  readCustomSettingTypeDomains,
  readCustomSettingTypes,
  readHiddenRoleTypes,
  readHiddenSettingTypes,
  readNormalizedEntries,
  readNormalizedEntriesWithVisibleDefaults,
  readTabConfigs,
  writeBrainstormRecycleEntries,
  type LibraryFontTarget,
  type LibraryTabConfig,
  type LibraryTabConfigs,
} from './workbenchLibraryDataState';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import {
  BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
  BRAINSTORM_REQUEST_HEADER,
  buildSequentialBrainstormRequestText,
  formatAiThinkingResponse,
  formatSequentialBrainstormOutput,
  getBrainstormBackgroundTaskResult,
  getBrainstormDisplayContent,
  getBrainstormEntryBody,
  getLatestUsefulAiText,
  getLibraryBackgroundTaskOutput,
  getSettingEntryBody,
  parseAiChatTurns,
  stripAiThinkingBlock,
  stripBrainstormRequestHeader,
} from './workbenchLibraryAiText';
import { SUMMARY_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import {
  DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID,
  DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID,
  buildSettingImportFormatScopedPreview,
  buildSettingImportFormatTabs,
  createStructuredSettingFieldDraft,
  findSettingImportFormatEntry,
  getStructuredSettingFieldSet,
  getStructuredSettingFieldSetByDefaultTitle,
  normalizeSettingType,
  parseSectionedSettingBody,
  parseSettingContent,
  parseStructuredSettingFields,
  resolveStructuredSettingDraftFields,
  stringifySettingContent,
  stringifyStructuredSettingFields,
  type SettingContent,
  type SettingImportFormatPreviewScope,
  type SettingImportFormatTabId,
  type StructuredSettingFieldDraft,
  type StructuredSettingTab,
} from './workbenchStructuredSettings';
import {
  appendRoleHistory,
  buildRoleReaderContent,
  createEmptyRoleBaseSettingFields,
  createEmptyRoleStateSettings,
  createRoleHistoryVersion,
  getRoleBaseSetting,
  getRoleReadableContent,
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  getRoleStateUpdateLabel,
  parseRoleBaseSettingFields,
  parseRoleContent,
  stringifyRoleBaseSettingFields,
  stringifyRoleContent,
  type RoleContent,
} from './workbenchRoleContent';
import {
  getWorkbenchAssociationRuntimeId,
  isWorkbenchAssociationRuntimeCurrent,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  canCreateWorkbenchRoleInType,
  isDefaultWorkbenchRoleType,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleLifeStatus,
  normalizeWorkbenchRoleType,
  shouldShowRolePinAction,
} from '@/features/workbench/model/workbenchRoleTypes';
import {
  OTHER_SETTING_LINK_TABS,
  countTextWords,
  filterOtherSettingLinkGroups,
  flattenOtherSettingLinkEntries,
  isMaleProtagonistRoleTypeChangeLocked,
  resolveOtherSettingLinkDraftEntries,
  resolveOtherSettingLinkEntry,
  type ClearSettingsMeta,
  type ClearSettingsTarget,
  type PendingCategoryRename,
  type PendingEntryDelete,
  type PendingEntryRename,
  type SettingLinkSource,
  type WorkbenchLibraryPanelProps,
} from '@/features/workbench/model/workbenchLibraryPanelModel';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import {
  DETAIL_OUTLINE_PUBLISHED_GROUP_NAME,
  DETAIL_OUTLINE_STATE_MARKER,
  getDetailOutlinePreviewHeight,
  mergeDetailOutlineStateExpectation,
  splitDetailOutlineStateExpectation,
} from './workbenchDetailOutlineState';
import { OutlineAiLogModal } from './workbenchOutlineAiLogModal';
import { DetailOutlineReaderModal, type DetailOutlineReaderTab } from './workbenchDetailOutlineReaderModal';
import { callModel, callModelStream } from '@/features/models/services/callModel';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Lock, Pin, Square, Unlock, X } from 'lucide-react';
import {
  BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH,
  BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
  BRAINSTORM_PREVIEW_WIDTH,
  DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS,
  DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS,
  DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS,
  DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS,
  DETAIL_OUTLINE_VOLUME_COUNT_CLASS,
  DETAIL_OUTLINE_VOLUME_ICON_CLASS,
  DETAIL_OUTLINE_VOLUME_ROW_CLASS,
  DETAIL_OUTLINE_VOLUME_TITLE_CLASS,
  OUTLINE_LEFT_MAX_DISPLAY_WIDTH,
  SETTING_LIBRARY_LEFT_MAX_WIDTH,
  SETTING_LIBRARY_LEFT_MIN_WIDTH,
  SETTING_LIBRARY_LEFT_WIDTH,
  SETTING_LIBRARY_RIGHT_WIDTH,
  SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH,
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS,
  WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS,
} from './workbenchLibraryPanelConstants';
import { ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';
import {
  DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
  PROMPT_DISABLE_CONTEXT_MENU_SIZE,
  SETTING_CATEGORY_CONTEXT_MENU_SIZE,
  SETTING_ENTRY_CONTEXT_MENU_SIZE,
  clampFixedMenuPosition,
} from './workbenchLibraryMenuPosition';
import { LibraryManagementModal, type LibraryManagementModalState } from './workbenchLibraryManagementModal';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import {
  buildLibraryLogGroups,
  buildRequestLogPlainPreview,
  compactTextForAi,
  escapeXmlAttribute,
  formatSettingLinkedContextForAi,
  formatSettingUserRequirementForAi,
  getBrainstormQuestionRows,
  renderAiChatContent,
  type LibraryAiRequestLog,
} from './workbenchLibraryRequestLog';
import { WordCountText } from '@/shared/ui/WordCountText';
import { LinkedSourceControl } from '@/shared/ui/LinkedSourceControl';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';

export function renderOutlineLibraryBranch(scope: Record<string, any>) {
  const {
    DOMException,
    activeDetailOutlineScrollId,
    activeTab,
    activeTabConfig,
    collapsedDetailOutlineReaderGroups,
    deleteConfirmDialog,
    detailOutlineChapterMenu,
    detailOutlineFontSize,
    detailOutlineReaderPreviewId,
    detailOutlineReaderTab,
    draftDetailOutlineReaderOutlineIds,
    draftDetailOutlineReaderRoleIds,
    draftDetailOutlineReaderSettingIds,
    entries,
    expandedOutlineVolumeIds,
    fieldSizeSettingsModal,
    forceOutlineSelectionRefresh,
    getChapterContent,
    getEmbeddedConfigSelectStyle,
    getFieldSizeStyle,
    h4,
    handleDetailOutlineTextareaScroll,
    isDetailOutlineReaderOpen,
    isLibraryAiLoading,
    isLibraryAiLogOpen,
    lastDetailOutlineReplacement,
    lastOutlineAiRequestLog,
    leftResizeHandle,
    libraryAiLogScope,
    libraryHeaderFontSizePortal,
    managementModal,
    manualDetailOutlinePublishedChapterIds,
    models,
    outlineEntries,
    outlinePreviewDraft,
    outlinePreviewRefs,
    outlineSelectionType,
    outlineStorageKey,
    persist,
    prompts,
    renderDetailOutlineFontSizeTool,
    renderFieldSizeButton,
    renderLibraryAiLogButton,
    renderTopTabs,
    rightResizeHandle,
    roleTypeOptions,
    scaleStyle,
    selectedOutlineChapterId,
    selectedOutlineVolumeId,
    setActiveLibraryFontTarget,
    setCollapsedDetailOutlineReaderGroups,
    setDetailOutlineChapterMenu,
    setDetailOutlineReaderPreviewId,
    setDetailOutlineReaderTab,
    setDraftDetailOutlineReaderOutlineIds,
    setDraftDetailOutlineReaderRoleIds,
    setDraftDetailOutlineReaderSettingIds,
    setExpandedOutlineVolumeIds,
    setIsDetailOutlineReaderOpen,
    setIsLibraryAiLoading,
    setIsLibraryAiLogOpen,
    setLastDetailOutlineReplacement,
    setLastOutlineAiRequestLog,
    setManagementModal,
    setManualDetailOutlinePublishedChapterIds,
    setOutlineEntries,
    setOutlinePreviewDraft,
    setOutlineSelectionType,
    setSelectedId,
    setSelectedOutlineChapterId,
    setSelectedOutlineVolumeId,
    setShowDetailOutlinePublished,
    settingLibraryLeftWidth,
    settingLibraryRightWidth,
    settingTypeOptions,
    showDetailOutlinePublished,
    showInlineFieldSizeButton,
    storageKey,
    suppressNextOutlinePreviewSyncRef,
    tabs,
    updateActiveTabConfig,
    volumes,
  } = scope;
  if (
    (tabs.includes(CHAPTER_SUMMARY_TAB) && tabs.includes(VOLUME_SUMMARY_TAB)) ||
    activeTab === OUTLINE_LIBRARY_TAB ||
    activeTab === DETAIL_OUTLINE_TAB
  ) {
    const group = undefined;
    const {
      activeOutlinePrompt,
      activeOutlinePromptId,
      buildDetailOutlineReaderContext,
      chapterEntries,
      clearDetailOutlineReaderSelection,
      clearDraftDetailOutlineReader,
      clearOutlineAiOutputDraft,
      configuredOutlinePromptId,
      confirmDetailOutlineReader,
      currentOutlineEntries,
      detailOutlinePublishedCount,
      detailOutlinePublishedVolumes,
      detailOutlineReaderOutlineItems,
      detailOutlineReaderOutlineLimitSerial,
      detailOutlineReaderRoleEntries,
      detailOutlineReaderRoleItems,
      detailOutlineReaderSettingEntries,
      detailOutlineReaderSettingItems,
      detailOutlineReaderWordCount,
      detailOutlineUnpublishedCount,
      detailOutlineUnpublishedVolumes,
      effectiveSelectedOutlineChapterId,
      enableVolumeSummary,
      filterDetailOutlineVolumesByPublishState,
      getChapterSummaryDisplayTitle,
      getChapterSummaryEntry,
      getChapterSummaryTitle,
      getLegacyChapterSummaryTitle,
      getLegacyVolumeSummaryTitle,
      getOlderLegacyChapterSummaryTitle,
      getOlderLegacyVolumeSummaryTitle,
      getOutlineChapterFrameTitle,
      getVolumeDisplayIndex,
      getVolumeSummaryEntry,
      getVolumeSummaryTitle,
      hasCurrentDetailOutlineReaderSession,
      inheritedDetailOutlineSettingIds,
      isDetailOutlineChapterPublished,
      isDetailOutlineTab,
      moveDetailOutlineChapterToPublished,
      moveDetailOutlineChapterToUnpublished,
      openDetailOutlineReader,
      outlineAiInput,
      outlineChapterTab,
      outlineChapters,
      outlineModelFieldSizeKey,
      outlinePreviewTitle,
      outlinePromptCategory,
      outlinePromptOptions,
      outlineSidebarWidth,
      persistCurrentOutline,
      renderDetailOutlineDraftClearButton,
      safeOutlineSelectionType,
      saveOutlinePreviewDraft,
      selectOutlineChapter,
      selectOutlineVolume,
      selectedDetailOutlineOutlineIds,
      selectedDetailOutlineOutlineItems,
      selectedDetailOutlineReaderItems,
      selectedDetailOutlineRoleIds,
      selectedDetailOutlineRoleItems,
      selectedDetailOutlineSettingIds,
      selectedDetailOutlineSettingItems,
      selectedOutlineChapter,
      selectedOutlineEntry,
      selectedOutlineModel,
      selectedOutlineVolume,
      selectedVolumeEntry,
      setOutlineAiInput,
      toggleDraftDetailOutlineReaderOutline,
      toggleDraftDetailOutlineReaderRole,
      toggleDraftDetailOutlineReaderSetting,
      toggleOutlineVolume,
      undoDetailOutlineReplacement,
      updateChapterSummary,
      updateOutlineEntry,
      updateOutlinePromptId,
      updateVolumeSummary,
      volumeEntries,
    } = createOutlineControllerPhase1({
      CHAPTER_DETAIL_OUTLINE_TAB,
      CHAPTER_SUMMARY_TAB,
      DETAIL_OUTLINE_PROMPT_CATEGORY,
      DETAIL_OUTLINE_TAB,
      LEGACY_VOLUME_SUMMARY_TAB,
      LEGACY_VOLUME_SUMMARY_TAB_OLD,
      OUTLINE_LIBRARY_TAB,
      ROLE_TAB,
      SETTING_TAB,
      SUMMARY_PROMPT_CATEGORY,
      VOLUME_SUMMARY_TAB,
      activeTab,
      activeTabConfig,
      buildRoleReaderContent,
      countTextWords,
      createWorkbenchLibraryEntry,
      draftDetailOutlineReaderOutlineIds,
      draftDetailOutlineReaderRoleIds,
      draftDetailOutlineReaderSettingIds,
      entries,
      forceOutlineSelectionRefresh,
      getWorkbenchAssociationRuntimeId,
      group,
      isDetailOutlineLikeTab,
      isWorkbenchAssociationRuntimeCurrent,
      joinAiRequestSections,
      lastDetailOutlineReplacement,
      manualDetailOutlinePublishedChapterIds,
      models,
      normalizeEntries,
      normalizePromptCategoryName,
      outlineEntries,
      outlinePreviewDraft,
      outlineSelectionType,
      outlineStorageKey,
      parseRoleContent,
      parseSettingContent,
      persist,
      prompts,
      roleTypeOptions,
      selectedOutlineChapterId,
      selectedOutlineVolumeId,
      setDetailOutlineChapterMenu,
      setDetailOutlineReaderPreviewId,
      setDetailOutlineReaderTab,
      setDraftDetailOutlineReaderOutlineIds,
      setDraftDetailOutlineReaderRoleIds,
      setDraftDetailOutlineReaderSettingIds,
      setExpandedOutlineVolumeIds,
      setIsDetailOutlineReaderOpen,
      setLastDetailOutlineReplacement,
      setManualDetailOutlinePublishedChapterIds,
      setOutlineEntries,
      setOutlinePreviewDraft,
      setOutlineSelectionType,
      setSelectedId,
      setSelectedOutlineChapterId,
      setSelectedOutlineVolumeId,
      setShowDetailOutlinePublished,
      settingLibraryLeftWidth,
      settingTypeOptions,
      stopBackgroundAiTask,
      stripAiThinkingBlock,
      suppressNextOutlinePreviewSyncRef,
      updateActiveTabConfig,
      volumes,
      wrapAiRequestTag,
      writeWorkbenchLibraryEntries,
    });
    const {
      activeDetailOutlineReaderItems,
      activeDetailOutlineReaderPreviewItem,
      buildOutlineAiRequestLog,
      detailOutlineReaderModal,
      detailOutlineReaderNavGroups,
      draftDetailOutlineReaderItems,
      draftDetailOutlineReaderWordCount,
      formatOutlineUserTextForAi,
      getDraftDetailOutlineReaderIdsForActiveTab,
      getOutlineAiContext,
      getOutlineContextTitle,
      getOutlineDefaultPrompt,
      getOutlineFullContextTitle,
      getSelectedOutlineContext,
      isActiveDetailOutlineReaderPreviewChecked,
      outlineAiLogModal,
      outlineDraftCountLeft,
      outlineDraftFrameTitle,
      outlinePreviewDraftContent,
      outlineUserLogTitle,
      previewOutlineContextText,
      previewOutlinePromptText,
      selectAllActiveDetailOutlineReaderItems,
      setDraftDetailOutlineReaderIdsForActiveTab,
      shouldShowOutlineBodyContext,
      shouldShowOutlineDraftWordCount,
      toggleActiveDetailOutlineReaderGroupSelection,
      toggleDetailOutlineReaderGroup,
      visibleOutlineAiRequestLog,
    } = createOutlineControllerPhase2({
      DETAIL_OUTLINE_STATE_MARKER,
      DetailOutlineReaderModal,
      OutlineAiLogModal,
      activeOutlinePrompt,
      activeTab,
      buildDetailOutlineReaderContext,
      clearDraftDetailOutlineReader,
      collapsedDetailOutlineReaderGroups,
      confirmDetailOutlineReader,
      countTextWords,
      detailOutlineReaderOutlineItems,
      detailOutlineReaderPreviewId,
      detailOutlineReaderRoleItems,
      detailOutlineReaderSettingItems,
      detailOutlineReaderTab,
      draftDetailOutlineReaderOutlineIds,
      draftDetailOutlineReaderRoleIds,
      draftDetailOutlineReaderSettingIds,
      getChapterContent,
      getVolumeDisplayIndex,
      isDetailOutlineReaderOpen,
      isDetailOutlineTab,
      isLibraryAiLoading,
      isLibraryAiLogOpen,
      joinAiRequestSections,
      lastOutlineAiRequestLog,
      libraryAiLogScope,
      outlineAiInput,
      outlinePreviewDraft,
      outlinePreviewTitle,
      safeOutlineSelectionType,
      selectedDetailOutlineReaderItems,
      selectedDetailOutlineRoleItems,
      selectedDetailOutlineSettingItems,
      selectedOutlineChapter,
      selectedOutlineModel,
      selectedOutlineVolume,
      setCollapsedDetailOutlineReaderGroups,
      setDetailOutlineReaderPreviewId,
      setDetailOutlineReaderTab,
      setDraftDetailOutlineReaderOutlineIds,
      setDraftDetailOutlineReaderRoleIds,
      setDraftDetailOutlineReaderSettingIds,
      setIsDetailOutlineReaderOpen,
      setIsLibraryAiLogOpen,
      stripAiThinkingBlock,
      toggleDraftDetailOutlineReaderOutline,
      toggleDraftDetailOutlineReaderRole,
      toggleDraftDetailOutlineReaderSetting,
      updateActiveTabConfig,
      wrapAiRequestTag,
    });
    const {
      clearOutlinePreviewDraft,
      sendOutlineAiMessage,
      stopOutlineAiMessage,
    } = createOutlineControllerPhase3({
      DOMException,
      activeOutlinePrompt,
      activeTab,
      activeTabConfig,
      buildOutlineAiRequestLog,
      callModelStream,
      detailOutlineReaderWordCount,
      formatAiThinkingResponse,
      formatOutlineUserTextForAi,
      getOutlineAiContext,
      getOutlineContextTitle,
      getOutlineDefaultPrompt,
      isDetailOutlineTab,
      isLibraryAiLoading,
      openDetailOutlineReader,
      outlineAiInput,
      selectedDetailOutlineReaderItems,
      selectedOutlineModel,
      setIsLibraryAiLoading,
      setLastOutlineAiRequestLog,
      setOutlineAiInput,
      setOutlinePreviewDraft,
      startBackgroundAiTask,
      stopBackgroundAiTask,
      storageKey,
      stripAiThinkingBlock,
      updateActiveTabConfig,
    });
    const renderDetailOutlineVolumeTree = (displayVolumes: Volume[], publishedLane = false) => (
      <div className="space-y-3">
        {displayVolumes.map((volume) => {
          const expanded = expandedOutlineVolumeIds.has(volume.id);
          const VolumeFolderIcon = expanded ? FolderOpen : Folder;
          const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;

          return (
            <div key={volume.id} className="mb-1">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleOutlineVolume(volume.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  toggleOutlineVolume(volume.id);
                }}
                className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                aria-expanded={expanded}
              >
                <VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                <span className="min-w-0 flex-1 truncate leading-none">{volume.name}</span>
                <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{volume.chapters.length}章</span>
                {enableVolumeSummary && !publishedLane && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      selectOutlineVolume(volume);
                    }}
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold transition-colors ${
                      volumeIsSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-brand/40 bg-white/70 text-brand-dark hover:bg-white'
                    }`}
                  >
                    卷梗概
                  </button>
                )}
              </div>
              {expanded && (
                <div
                  className="mt-1 grid justify-start gap-1.5 px-1.5 py-1.5"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}
                >
                  {volume.chapters.map((chapter) => {
                    const entry = getChapterSummaryEntry(chapter.serialNumber);
                    const selected = effectiveSelectedOutlineChapterId === chapter.id;
                    const outlineWordCount = countTextWords(entry?.content ?? '');
                    const chapterContentWordCount = chapter.wordCount;
                    const hasSummary = outlineWordCount > 0;
                    const outlineButtonState =
                      chapterContentWordCount > 0 ? 'used' : hasSummary ? 'hasOutline' : 'empty';
                    const outlineButtonClass = `relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                      selected
                        ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                        : hasSummary
                          ? 'border-[#08B3D9] bg-[#E1F3F7] text-[#08AACE] hover:border-[#067B96] hover:bg-[#D3EEF5]'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                    }`;
                    if (isDetailOutlineTab) {
                      return (
                        <ChapterNumberButton
                          key={chapter.id}
                          onMouseDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            event.stopPropagation();
                            selectOutlineChapter(chapter.id, chapter.serialNumber);
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const { left, top } = clampFixedMenuPosition(
                              event.clientX,
                              event.clientY,
                              DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
                            );
                            setDetailOutlineChapterMenu({
                              visible: true,
                              x: left,
                              y: top,
                              chapter,
                            });
                          }}
                          selected={selected}
                          state={outlineButtonState}
                          title={publishedLane ? '移回未发布' : '移动到已发布'}
                        >
                          {chapter.serialNumber}
                        </ChapterNumberButton>
                      );
                    }
                    return (
                      <button
                        key={chapter.id}
                        onMouseDown={(event) => {
                          if (event.button !== 0) return;
                          event.preventDefault();
                          event.stopPropagation();
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onContextMenu={(event) => {
                          if (!isDetailOutlineTab) return;
                          event.preventDefault();
                          event.stopPropagation();
                          const { left, top } = clampFixedMenuPosition(
                            event.clientX,
                            event.clientY,
                            DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
                          );
                          setDetailOutlineChapterMenu({
                            visible: true,
                            x: left,
                            y: top,
                            chapter,
                          });
                        }}
                        className={outlineButtonClass}
                        title={publishedLane ? '移回未发布' : '移动到已发布'}
                      >
                        {chapter.serialNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
    return renderOutlineWorkspaceView({
      AiInlineInput,
      ChapterNumberButton,
      CombinedAiConfigSelect,
      DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
      DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS,
      DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS,
      DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS,
      DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS,
      DETAIL_OUTLINE_TAB,
      DETAIL_OUTLINE_VOLUME_COUNT_CLASS,
      DETAIL_OUTLINE_VOLUME_ICON_CLASS,
      DETAIL_OUTLINE_VOLUME_ROW_CLASS,
      DETAIL_OUTLINE_VOLUME_TITLE_CLASS,
      Folder,
      FolderOpen,
      LibraryManagementModal,
      LinkedSourceControl,
      OUTLINE_LIBRARY_TAB,
      WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
      WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
      WORKBENCH_FOLDER_GROUP_ICON_CLASS,
      WordCountText,
      activeDetailOutlineScrollId,
      activeOutlinePromptId,
      activeTab,
      activeTabConfig,
      clampFixedMenuPosition,
      clearDetailOutlineReaderSelection,
      countTextWords,
      deleteConfirmDialog,
      detailOutlineChapterMenu,
      detailOutlineFontSize,
      detailOutlinePublishedCount,
      detailOutlinePublishedVolumes,
      detailOutlineReaderModal,
      detailOutlineReaderWordCount,
      detailOutlineUnpublishedCount,
      detailOutlineUnpublishedVolumes,
      effectiveSelectedOutlineChapterId,
      enableVolumeSummary,
      expandedOutlineVolumeIds,
      fieldSizeSettingsModal,
      getChapterContent,
      getChapterSummaryEntry,
      getDetailOutlinePreviewHeight,
      getEmbeddedConfigSelectStyle,
      getFieldSizeStyle,
      getOutlineChapterFrameTitle,
      getVolumeDisplayIndex,
      handleDetailOutlineTextareaScroll,
      isDetailOutlineChapterPublished,
      isDetailOutlineTab,
      isLibraryAiLoading,
      lastDetailOutlineReplacement,
      leftResizeHandle,
      libraryHeaderFontSizePortal,
      managementModal,
      mergeDetailOutlineStateExpectation,
      models,
      moveDetailOutlineChapterToPublished,
      moveDetailOutlineChapterToUnpublished,
      openDetailOutlineReader,
      outlineAiInput,
      outlineAiLogModal,
      outlineChapters,
      outlineDraftCountLeft,
      outlineDraftFrameTitle,
      outlineModelFieldSizeKey,
      outlinePreviewDraft,
      outlinePreviewDraftContent,
      outlinePreviewRefs,
      outlinePromptCategory,
      outlinePromptOptions,
      outlineSidebarWidth,
      renderAiChatContent,
      renderDetailOutlineDraftClearButton,
      renderDetailOutlineVolumeTree,
      renderTopTabs,
      resizeFloatingAiTextarea,
      rightResizeHandle,
      safeOutlineSelectionType,
      saveOutlinePreviewDraft,
      scaleStyle,
      selectOutlineChapter,
      selectOutlineVolume,
      selectedDetailOutlineReaderItems,
      selectedOutlineChapter,
      selectedOutlineVolume,
      selectedVolumeEntry,
      sendOutlineAiMessage,
      setActiveLibraryFontTarget,
      setDetailOutlineChapterMenu,
      setManagementModal,
      setOutlineAiInput,
      setOutlinePreviewDraft,
      setShowDetailOutlinePublished,
      settingLibraryRightWidth,
      shouldShowOutlineDraftWordCount,
      showDetailOutlinePublished,
      splitDetailOutlineStateExpectation,
      stopOutlineAiMessage,
      stripAiThinkingBlock,
      toggleOutlineVolume,
      undoDetailOutlineReplacement,
      updateActiveTabConfig,
      updateChapterSummary,
      updateOutlinePromptId,
      updateVolumeSummary,
      volumes,
    });
  }
  return null;
}
