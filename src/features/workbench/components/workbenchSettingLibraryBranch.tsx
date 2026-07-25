/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- generated closure adapter; dependencies remain typed at the controller boundary.
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
  getWorkbenchTabDisplayLabel,
  isDetailOutlineLikeTab,
  isSettingLikeTab,
  normalizeTabName,
} from './workbenchLibraryTabs';
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
  stringifySettingContent, resolveActiveSettingWorkspaceType,
  stringifyStructuredSettingFields,
  type SettingContent,
  type SettingImportFormatPreviewScope,
  type SettingImportFormatTabId,
  type StructuredSettingFieldDraft,
  type StructuredSettingTab,
} from './workbenchStructuredSettings';
import { getWorkbenchSidebarWordCountSource } from './workbenchLibrarySidebarWordCount';
import { getDefaultWorkbenchLibraryEntryTitle } from '@/features/workbench/model/workbenchLibraryStorage';
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
import {
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
import { resolveBrainstormLibraryLeftWidth } from './workbenchLibraryStorageState';
import {
  BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
  BRAINSTORM_REQUEST_HEADER,
  buildSequentialBrainstormRequestText,
  formatAiThinkingResponse,
  formatSequentialBrainstormOutput,
  getBrainstormDisplayContent,
  getBrainstormEntryBody,
  getLatestUsefulAiText,
  getSettingEntryBody,
  parseAiChatTurns,
  stripAiThinkingBlock,
  stripBrainstormRequestHeader,
} from './workbenchLibraryAiText';
import { SUMMARY_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { createPortal } from 'react-dom';
import {
  BRAINSTORM_GENERATE_RULE_TEXT,
  BRAINSTORM_GENERATE_TASK_TEXT,
  BRAINSTORM_OUTPUT_ONLY_INSTRUCTION,
  BRAINSTORM_QUESTION_FIELDS,
  DETAIL_OUTLINE_MAX_FONT_SIZE,
  DETAIL_OUTLINE_MIN_FONT_SIZE,
  EMPTY_BRAINSTORM_QUESTION_DRAFT,
  LIBRARY_AI_TIMEOUT_MS,
  createBrainstormAiSession,
  getActiveBrainstormAiSessionId,
  getBrainstormOutputCount,
  getFloatingTitleInputStyle,
  getSelectedBrainstormPreviewIndexes,
  getTemporaryBrainstormTitle,
  normalizeBrainstormAiSessions,
  normalizeBrainstormCountValue,
  splitBrainstormGeneratedText,
  type BrainstormAiSession,
  type BrainstormQuestionDraft,
  type BrainstormQuestionKey,
} from './workbenchBrainstormState';
import {
  buildLibraryLogGroups,
  buildRequestLogPlainPreview,
  compactTextForAi,
  countSettingLinkedContextWords,
  escapeXmlAttribute,
  formatSettingLinkedContextForAi,
  formatSettingUserRequirementForAi,
  getBrainstormQuestionRows,
  renderAiChatContent,
  type LibraryAiRequestLog,
} from './workbenchLibraryRequestLog';
import { LibraryAiLogModal, type LibraryAiLogViewTab } from './workbenchLibraryAiLogModal';
import { LibraryManagementModal, type LibraryManagementModalState } from './workbenchLibraryManagementModal';
import { WorkbenchLibrarySidebar } from './workbenchLibrarySidebar';
import { WorkbenchSettingTreeSidebar } from './WorkbenchSettingTreeSidebar';
import { RoleBaseStateEditor } from './workbenchRoleEditor';
import {
  BrainstormOutputWorkspace,
  BrainstormPreviewEditor,
  BrainstormQuestionPanel,
} from './workbenchBrainstormWorkspace';
import { WorkbenchSettingEditor } from './workbenchSettingEditor';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import {
  DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
  PROMPT_DISABLE_CONTEXT_MENU_SIZE,
  SETTING_CATEGORY_CONTEXT_MENU_SIZE,
  SETTING_ENTRY_CONTEXT_MENU_SIZE,
  clampFixedMenuPosition,
} from './workbenchLibraryMenuPosition';
import {
  getWorkbenchAssociationRuntimeId,
  isWorkbenchAssociationRuntimeCurrent,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Lock, Pin, Square, Unlock, X } from 'lucide-react';
import { WordCountText } from '@/shared/ui/WordCountText';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';
import { renderSettingLibraryView } from './workbenchSettingLibraryView';

export function renderSettingLibraryBranch(scope: Record<string, any>) {
  const {
    activeBrainstormAiSession,
    activeBrainstormOutputScrollIndex,
    activeSettingSidebarScrollKey,
    activeStructuredSettingTab,
    activeTab,
    activeTabConfig,
    addEntryToTab,
    aiChatTurns,
    aiInput,
    aiOutput,
    aiResult,
    aside,
    beginLibraryEntryPointerDrag,
    brainstormGenerateConfirmModal,
    brainstormOutputFontSize,
    brainstormPreviewFontSize,
    brainstormPreviewResizeHandle,
    brainstormPreviewWidth,
    brainstormPromptEditModal,
    brainstormPromptManagerModal,
    brainstormQuestionDraft,
    brainstormReaderModal,
    brainstormRecycleEntries,
    brainstormRecycleModal,
    buildBrainstormPromptFromQuestions,
    buildLibraryAiRequestPayload,
    button,
    canSendLibraryAiMessage,
    categoryContextMenu,
    categoryRenameModal,
    clearActiveLinkedBrainstorm,
    clearActiveLinkedOtherSettings,
    clearBrainstormOutputArea,
    clearBrainstormRecycleConfirmDialog,
    clearLibraryAiDialog,
    clearSettingsConfirmDialog,
    copyBrainstormOutputArea,
    createEditableSettingEntry,
    currentOutlineChapterNumber,
    deleteConfirmDialog,
    div,
    draggingLibraryEntry,
    entries,
    entryContextMenu,
    entryRenameDialog,
    expandedRoleTypes,
    expandedSettingTypes,
    fieldSizeSettingsModal,
    fieldSizeSpecs,
    finishLibraryEntryPointerDrag,
    getActiveLinkedSettingSnapshot,
    getActiveSettingLinkSource,
    getConfigFieldSizeStyle,
    getEmbeddedConfigSelectStyle,
    getPreviewedLibraryGroupEntries,
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    h3,
    handleBrainstormOutputTextareaScroll,
    handleLibraryAiInputKeyDown,
    handleLibraryAiOutputScroll,
    handleLibraryCategoryDragLeave,
    handleLibraryCategoryDragOver,
    handleLibraryCategoryDrop,
    handleLibraryEntryDragEnd,
    handleLibraryEntryDragOver,
    handleLibraryEntryDragStart,
    handleLibraryEntryDrop,
    handleSettingSidebarScroll,
    hasLibraryAiContent,
    isLibraryAiLoading,
    isLibraryAiLogOpen,
    isSettingLibraryPanel,
    label,
    lastLibraryAiRequestLog,
    leftResizeHandle,
    libraryAiInputRef,
    libraryAiLogScope,
    libraryAiLogViewTab,
    libraryAiOutputRef,
    libraryDropTarget,
    libraryHeaderFontSizePortal,
    libraryPointerSuppressClickRef,
    loadingDotCount,
    main,
    managementModal,
    models,
    openBrainstormGenerateConfirm,
    openCategoryMenu,
    openEntryMenu,
    openOtherSettingReader,
    openSettingCreateDialog,
    otherSettingReaderModal,
    outlineSettingDomain,
    outlineSettingScope,
    promptDisableContextMenu,
    prompts,
    renderFieldSizeButton,
    renderLibraryAiLogButton,
    renderTopTabs,
    rightResizeHandle,
    roleEntries,
    roleTextFontSize,
    roleTypeOptions,
    saveBrainstormOutput,
    saveBrainstormOutputAsNew,
    scaleStyle,
    sendLibraryAiMessage,
    setActiveLibraryFontTarget,
    setActiveStructuredSettingTab,
    setAiInput,
    setBrainstormQuestionField,
    setExpandedRoleTypes,
    setExpandedSettingTypes,
    setIsBrainstormReaderOpen,
    setIsBrainstormRecycleOpen,
    setIsLibraryAiLogOpen,
    setLibraryAiLogViewTab,
    setManagementModal,
    setOutlineSettingDomain,
    setOutlineSettingScope,
    setPromptDisableMenu,
    setSelectedBrainstormReaderId,
    setSelectedIdForTab,
    setSettingImportFormatEntryId,
    setSettingImportFormatPreviewScope,
    setSettingImportFormatTabId,
    setShowLibraryAiLogTitles,
    setStructuredSettingFieldDraft,
    settingCreateModal,
    settingEntries,
    settingImportFormatEntryId,
    settingImportFormatGuideTabs,
    settingImportFormatPreviewScope,
    settingImportFormatTabId,
    settingLibraryLeftWidth,
    settingLibraryMode,
    settingLibraryRightWidth,
    settingPreviewFontSize,
    settingTypeOptions,
    showInlineFieldSizeButton,
    showLibraryAiLogTitles,
    smartImportSettings,
    span,
    stopLibraryAiMessage,
    structuredSettingFieldDraft,
    tabConfigs,
    toolbarPortalId,
    updateActiveBrainstormAiSession,
    updateActiveTabConfig,
    updateEntry,
    updateLibraryEntryPointerPreview,
  } = scope;
  if (
    isSettingLibraryPanel &&
    SETTING_LIBRARY_TABS.has(activeTab) &&
    activeTab !== OUTLINE_LIBRARY_TAB &&
    activeTab !== DETAIL_OUTLINE_TAB
  ) {
    const isOutlineCharacterScope = activeTab === SETTING_TAB && outlineSettingScope === 'character';
    const effectiveLibraryTab = isOutlineCharacterScope ? ROLE_TAB : activeTab;
    const effectiveTabConfig = tabConfigs[effectiveLibraryTab] ?? {};
    const effectiveSelectedId = effectiveTabConfig.selectedId ?? null;
    const selectedSettingWorkspaceDomain =
      activeTab === SETTING_TAB && !isOutlineCharacterScope ? getSelectedSettingWorkspaceDomain() : null;
    const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();
    const parsedSettingEntryCache = new Map<string, ReturnType<typeof parseSettingContent>>();
    const parsedRoleEntryCache = new Map<string, ReturnType<typeof parseRoleContent>>();
    const getParsedSettingEntry = (entry: WorkbenchLibraryEntry) => {
      const cached = parsedSettingEntryCache.get(entry.id);
      if (cached) return cached;
      const parsed = parseSettingContent(entry.content);
      parsedSettingEntryCache.set(entry.id, parsed);
      return parsed;
    };
    const getParsedRoleEntry = (entry: WorkbenchLibraryEntry) => {
      const cached = parsedRoleEntryCache.get(entry.id);
      if (cached) return cached;
      const parsed = parseRoleContent(entry.content);
      parsedRoleEntryCache.set(entry.id, parsed);
      return parsed;
    };
    const allCurrentEntries = entries.filter((entry) => entry.tab === effectiveLibraryTab);
    const currentEntries = selectedSettingWorkspaceDomain
      ? allCurrentEntries.filter(
          (entry) =>
            getSettingTypeWorkspaceDomain(getParsedSettingEntry(entry).type) === selectedSettingWorkspaceDomain,
        )
      : allCurrentEntries;
    const currentSelectedEntry =
      currentEntries.find((entry) => entry.id === effectiveSelectedId) ?? currentEntries[0] ?? null;
    const activeIsSettingLike = isOutlineCharacterScope || isSettingLikeTab(effectiveLibraryTab);
    const activeIsBrainstorm = activeTab === BRAINSTORM_TAB;
    const currentSelectedSetting =
      activeIsSettingLike && currentSelectedEntry ? getParsedSettingEntry(currentSelectedEntry) : null;
    const currentSelectedSettingIsLockedDefault = currentSelectedEntry
      ? isLockedDefaultSettingEntry(currentSelectedEntry)
      : false;
    const currentStructuredSettingFieldSet = currentSelectedEntry
      ? getStructuredSettingFieldSet(currentSelectedEntry, currentSelectedSetting)
      : null;
    const parsedCurrentStructuredSettingFields =
      currentSelectedSetting && currentStructuredSettingFieldSet
        ? parseStructuredSettingFields(currentSelectedSetting.body, currentStructuredSettingFieldSet)
        : {};
    const currentStructuredSettingFields =
      currentSelectedEntry && currentSelectedSetting && currentStructuredSettingFieldSet
        ? resolveStructuredSettingDraftFields(
            structuredSettingFieldDraft,
            currentSelectedEntry.id,
            currentStructuredSettingFieldSet.id,
            currentSelectedSetting.body,
            parsedCurrentStructuredSettingFields,
          )
        : parsedCurrentStructuredSettingFields;
    const updateStructuredSettingField = (key: string, value: string) => {
      if (!currentSelectedEntry || !currentSelectedSetting || !currentStructuredSettingFieldSet) return;
      const nextFields = {
        ...currentStructuredSettingFields,
        [key]: value,
      };
      const nextBody = stringifyStructuredSettingFields(nextFields, currentStructuredSettingFieldSet);
      setStructuredSettingFieldDraft(
        createStructuredSettingFieldDraft(
          currentSelectedEntry.id,
          currentStructuredSettingFieldSet.id,
          nextBody,
          nextFields,
        ),
      );
      updateEntry(currentSelectedEntry.id, {
        content: stringifySettingContent({
          ...currentSelectedSetting,
          structuredFieldSetId: currentStructuredSettingFieldSet.id,
          body: nextBody,
        }),
      });
    };
    const currentSelectedRole =
      isOutlineCharacterScope && currentSelectedEntry ? getParsedRoleEntry(currentSelectedEntry) : null;
    const currentSelectedRoleIsMaleProtagonist = Boolean(
      currentSelectedRole && isMaleProtagonistRoleType(currentSelectedRole.type),
    );
    const currentSelectedRoleLifeStatus = currentSelectedRoleIsMaleProtagonist
      ? '存活'
      : currentSelectedRole?.lifeStatus;
    const updateOutlineCharacterRole = (updates: Partial<RoleContent>) => {
      if (!currentSelectedEntry || !currentSelectedRole) return;
      const normalizedUpdates = {
        ...updates,
        ...(updates.type ? { type: normalizeWorkbenchRoleType(updates.type) } : {}),
      };
      if (
        normalizedUpdates.type &&
        isMaleProtagonistRoleTypeChangeLocked(currentSelectedRole.type, normalizedUpdates.type)
      )
        return;
      const nextType = normalizeWorkbenchRoleType(normalizedUpdates.type ?? currentSelectedRole.type);
      if (isMaleProtagonistRoleType(nextType)) normalizedUpdates.lifeStatus = '存活';
      if (
        normalizedUpdates.type &&
        !canCreateWorkbenchRoleInType(
          roleEntries
            .filter((entry) => entry.id !== currentSelectedEntry.id)
            .map((entry) => getParsedRoleEntry(entry).type),
          normalizedUpdates.type,
        )
      )
        return;
      updateEntry(currentSelectedEntry.id, {
        content: stringifyRoleContent({ ...currentSelectedRole, ...normalizedUpdates }),
      });
    };
    const activeSettingTypeOptions = activeIsBrainstorm
      ? [BRAINSTORM_TYPE]
      : isOutlineCharacterScope
        ? roleTypeOptions
        : settingTypeOptions;
    const currentBrainstormBody = activeIsBrainstorm ? (currentSelectedSetting?.body ?? '') : '';
    const currentBrainstormPreviewWordCount = activeIsBrainstorm ? countTextWords(currentBrainstormBody) : 0;
    const brainstormLayoutLeftWidth = resolveBrainstormLibraryLeftWidth(settingLibraryLeftWidth);
    const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);
    const brainstormLayoutRightWidth = Math.max(
      BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
      Math.min(settingLibraryRightWidth, BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH),
    );
    const activeSettingLinkSource = getActiveSettingLinkSource();
    const currentLinkedSettingContext = getActiveLinkedSettingSnapshot();
    const linkedSettingWordCount = countSettingLinkedContextWords(currentLinkedSettingContext);
    const effectivePromptDisabled =
      activeTab === SETTING_TAB
        ? !isOutlineCharacterScope && activeSettingLinkSource === 'current'
        : Boolean(activeTabConfig.promptDisabled);
    const latestUsefulAiOutput = activeIsBrainstorm ? getLatestUsefulAiText(aiResult || aiOutput) : aiOutput.trim();
    const smartImportLocked = activeTabConfig.smartImportLocked !== false;
    const activeSettingWorkspaceDomain = selectedSettingWorkspaceDomain;
    const visibleSettingTypeOptions = activeSettingWorkspaceDomain
      ? activeSettingTypeOptions.filter((type) => getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain)
      : activeSettingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type));
    const activeSettingWorkspaceType = resolveActiveSettingWorkspaceType(currentSelectedSetting?.type, effectiveTabConfig.typeDraft, selectedSettingWorkspaceType, visibleSettingTypeOptions);
    const groupedSettingEntries = visibleSettingTypeOptions.map((type) => ({
      type,
      entries: currentEntries.filter((entry) => {
        if (isOutlineCharacterScope) return getParsedRoleEntry(entry).type === type;
        const parsed = getParsedSettingEntry(entry);
        if (activeIsBrainstorm) return (parsed.type || BRAINSTORM_TYPE) === type || parsed.type === UNCATEGORIZED_TYPE;
        return parsed.type === type;
      }),
    }));
    const getLibrarySidebarEntryType = (entry: WorkbenchLibraryEntry, fallbackType: string) => {
      const parsed = activeIsSettingLike ? getParsedSettingEntry(entry) : null;
      const role = isOutlineCharacterScope ? getParsedRoleEntry(entry) : null;
      return role?.type ?? parsed?.type ?? fallbackType;
    };
    const getLibrarySidebarEntryWordCount = (entry: WorkbenchLibraryEntry) => countTextWords(getWorkbenchSidebarWordCountSource(entry, activeIsSettingLike ? getParsedSettingEntry(entry) : null, isOutlineCharacterScope ? getParsedRoleEntry(entry) : null));
    const settingTreeDomains = [
      { id: 'work', label: '作品设定', settingDomain: null },
      { id: 'character', label: '人物设定', settingDomain: null },
      { id: 'setting:location', label: '地点地图', settingDomain: 'setting:location' },
      { id: 'setting:faction', label: '势力设定', settingDomain: 'setting:faction' },
      { id: 'setting:item', label: '道具资源', settingDomain: 'setting:item' },
      { id: 'setting:foreshadow', label: '伏笔线索', settingDomain: 'setting:foreshadow' },
      { id: 'setting:monster', label: '怪物图鉴', settingDomain: 'setting:monster' },
    ];
    const selectSettingWorkspaceDomain = (id: string) => {
      setOutlineSettingDomain(id);
      setOutlineSettingScope(id === 'character' ? 'character' : 'work');
    };
    const activeTabDisplayLabel = getWorkbenchTabDisplayLabel(activeTab);
    const panelTitle = `${activeTabDisplayLabel}生成`;
    const promptCategory =
      activeTab === SETTING_TAB
        ? PROMPT_SETTING_CATEGORY
        : activeTab === DETAIL_OUTLINE_TAB
          ? DETAIL_OUTLINE_PROMPT_CATEGORY
          : activeTab;
    const promptCategoryLabel = activeTab === SETTING_TAB ? activeTabDisplayLabel : promptCategory;
    const activeTabPrompts = prompts.filter(
      (prompt) => normalizePromptCategoryName(prompt.category) === promptCategory,
    );
    const activePromptId = activeTabPrompts.some((prompt) => prompt.id === activeTabConfig.promptId)
      ? activeTabConfig.promptId
      : (activeTabPrompts[0]?.id ?? '');
    const showPromptDisableButton = activeTab !== SETTING_TAB;
    const rightSelectFieldTab = activeIsBrainstorm ? BRAINSTORM_TAB : activeTab === ROLE_TAB ? ROLE_TAB : SETTING_TAB;
    const showInlineLibraryAiLogButton = showInlineFieldSizeButton && (activeTab === SETTING_TAB || activeIsBrainstorm);
    const showHeaderLibraryAiLogButton = false;
    const showPanelHeader =
      showInlineFieldSizeButton &&
      (showInlineLibraryAiLogButton ||
        (!activeIsBrainstorm && (activeTab !== SETTING_TAB || showHeaderLibraryAiLogButton)));
    const libraryToolbarPortalTarget =
      toolbarPortalId && activeIsBrainstorm && typeof document !== 'undefined'
        ? document.getElementById(toolbarPortalId)
        : null;
    const libraryToolbarPortal = libraryToolbarPortalTarget
      ? createPortal(
          <>
            {renderFieldSizeButton()}
            {renderLibraryAiLogButton('library')}
          </>,
          libraryToolbarPortalTarget,
        )
      : null;
    const rawBrainstormOutputValue =
      activeIsBrainstorm && isLibraryAiLoading && !aiResult
        ? `正在生成${'.'.repeat(loadingDotCount)}`
        : aiResult || latestUsefulAiOutput;
    const brainstormOutputValue = activeIsBrainstorm
      ? stripAiThinkingBlock(rawBrainstormOutputValue)
      : rawBrainstormOutputValue;
    const brainstormOutputWordCount = activeIsBrainstorm ? countTextWords(brainstormOutputValue) : 0;
    const brainstormOutputPreviewCount = activeIsBrainstorm
      ? (activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount))
      : 1;
    const brainstormOutputSplitParts = activeIsBrainstorm
      ? splitBrainstormGeneratedText(brainstormOutputValue, brainstormOutputPreviewCount)
      : [];
    const brainstormOutputPreviews = Array.from(
      { length: brainstormOutputPreviewCount },
      (_, index) => activeBrainstormAiSession?.previewDrafts?.[index] ?? brainstormOutputSplitParts[index] ?? '',
    );
    const brainstormOutputTitles = Array.from(
      { length: brainstormOutputPreviewCount },
      (_, index) => activeBrainstormAiSession?.previewTitles?.[index]?.trim() || getTemporaryBrainstormTitle(index),
    );
    const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(
      brainstormOutputPreviews,
      activeBrainstormAiSession?.previewSelectedIndexes,
    );
    const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);
    const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes.filter((index) =>
      brainstormOutputPreviews[index]?.trim(),
    ).length;
    const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;
    const setBrainstormOutputPreviewDraft = (index: number, value: string) => {
      const nextDrafts = [...brainstormOutputPreviews];
      nextDrafts[index] = value;
      updateActiveBrainstormAiSession({ previewDrafts: nextDrafts });
    };
    const setBrainstormOutputPreviewTitle = (index: number, value: string) => {
      const nextTitles = [...brainstormOutputTitles];
      nextTitles[index] = value;
      updateActiveBrainstormAiSession({ previewTitles: nextTitles });
    };
    const toggleBrainstormOutputPreviewSelected = (index: number) => {
      const nextSelected = selectedBrainstormOutputIndexSet.has(index)
        ? selectedBrainstormOutputIndexes.filter((item) => item !== index)
        : [...selectedBrainstormOutputIndexes, index].sort((a, b) => a - b);
      updateActiveBrainstormAiSession({ previewSelectedIndexes: nextSelected });
    };
    const previewAiRequestText = activeIsBrainstorm
      ? buildBrainstormPromptFromQuestions(brainstormQuestionDraft)
      : aiInput.trim();
    const previewAiRequestLog =
      activeTab === SETTING_TAB || activeIsBrainstorm
        ? buildLibraryAiRequestPayload(previewAiRequestText, activeIsBrainstorm ? previewAiRequestText : undefined).log
        : null;
    const visibleAiRequestLog = previewAiRequestLog ?? lastLibraryAiRequestLog;
    const visibleAiRequestLogGroups = visibleAiRequestLog
      ? buildLibraryLogGroups(visibleAiRequestLog, {
          includeContext: !activeIsBrainstorm,
          omitEmptyUser: activeIsBrainstorm,
          userTitle: activeTab === SETTING_TAB ? '修改要求' : activeIsBrainstorm ? '其他要求' : undefined,
        })
      : [];
    const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);
    const activeSettingImportFormatTab =
      settingImportFormatGuideTabs.find((tab) => tab.id === settingImportFormatTabId) ??
      settingImportFormatGuideTabs[0];
    const selectedSettingImportFormatEntry = findSettingImportFormatEntry(
      settingImportFormatEntryId,
      settingImportFormatGuideTabs,
    );
    const selectedSettingImportFormatGroup =
      activeSettingImportFormatTab?.groups.find((group) =>
        group.entries.some((entry) => entry.id === selectedSettingImportFormatEntry?.id),
      ) ??
      activeSettingImportFormatTab?.groups[0] ??
      null;
    const settingImportFormatPreview =
      selectedSettingImportFormatEntry && activeSettingImportFormatTab && selectedSettingImportFormatGroup
        ? buildSettingImportFormatScopedPreview(
            settingImportFormatPreviewScope,
            activeSettingImportFormatTab,
            selectedSettingImportFormatGroup,
            selectedSettingImportFormatEntry,
          )
        : '';
    const selectSettingImportFormatTab = (tabId: SettingImportFormatTabId) => {
      const nextTab = settingImportFormatGuideTabs.find((tab) => tab.id === tabId) ?? settingImportFormatGuideTabs[0];
      if (!nextTab) return;
      setSettingImportFormatTabId(nextTab.id);
      setSettingImportFormatEntryId(nextTab.groups[0]?.entries[0]?.id ?? DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID);
    };
    const libraryAiLogModal =
      isLibraryAiLogOpen && libraryAiLogScope === 'library' ? (
        <LibraryAiLogModal
          id={`workbench_library_ai_log_${activeTab}`}
          activeViewTab={libraryAiLogViewTab}
          formatTabs={settingImportFormatGuideTabs}
          activeFormatTab={activeSettingImportFormatTab}
          selectedFormatEntry={selectedSettingImportFormatEntry ?? null}
          settingImportFormatPreview={settingImportFormatPreview}
          settingImportFormatPreviewScope={settingImportFormatPreviewScope}
          visibleAiRequestLog={visibleAiRequestLog}
          visibleAiRequestLogGroups={visibleAiRequestLogGroups}
          visibleAiRequestLogPlainPreview={visibleAiRequestLogPlainPreview}
          showLibraryAiLogTitles={showLibraryAiLogTitles}
          userTextTitle={activeTab === SETTING_TAB ? '修改要求' : '其他要求'}
          onClose={() => setIsLibraryAiLogOpen(false)}
          onViewTabChange={setLibraryAiLogViewTab}
          onFormatTabChange={selectSettingImportFormatTab}
          onFormatEntryChange={setSettingImportFormatEntryId}
          onFormatPreviewScopeChange={setSettingImportFormatPreviewScope}
          onShowLibraryAiLogTitlesChange={setShowLibraryAiLogTitles}
        />
      ) : null;
    return renderSettingLibraryView({
      AiInlineInput,
      BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH,
      BRAINSTORM_TAB,
      BrainstormOutputWorkspace,
      BrainstormPreviewEditor,
      BrainstormQuestionPanel,
      CombinedAiConfigSelect,
      DETAIL_OUTLINE_PROMPT_CATEGORY,
      DETAIL_OUTLINE_TAB,
      LibraryManagementModal,
      Lock,
      PROMPT_DISABLE_CONTEXT_MENU_SIZE,
      PROMPT_SETTING_CATEGORY,
      RoleBaseStateEditor,
      SETTING_TAB,
      Unlock,
      WordCountText,
      WorkbenchLibrarySidebar,
      WorkbenchSettingTreeSidebar,
      WorkbenchSettingEditor,
      X,
      activeBrainstormOutputScrollIndex,
      activeIsBrainstorm,
      activeIsSettingLike,
      activePromptId,
      activeSettingLinkSource,
      activeSettingSidebarScrollKey,
      activeSettingWorkspaceType,
      settingGroupOptions: visibleSettingTypeOptions,
      activeStructuredSettingTab,
      activeTab,
      activeTabConfig,
      activeTabPrompts,
      addEntryToTab,
      aiChatTurns,
      aiInput,
      beginLibraryEntryPointerDrag,
      brainstormGenerateConfirmModal,
      brainstormLayoutLeftWidth,
      brainstormLayoutPreviewWidth,
      brainstormLayoutRightWidth,
      brainstormOutputFontSize,
      brainstormOutputPreviews,
      brainstormOutputTitles,
      brainstormOutputValue,
      brainstormPreviewFontSize,
      brainstormPreviewResizeHandle,
      brainstormPromptEditModal,
      brainstormPromptManagerModal,
      brainstormQuestionDraft,
      brainstormReaderModal,
      brainstormRecycleEntries,
      brainstormRecycleModal,
      canSendLibraryAiMessage,
      categoryContextMenu,
      categoryRenameModal,
      clampFixedMenuPosition,
      clearActiveLinkedBrainstorm,
      clearActiveLinkedOtherSettings,
      clearBrainstormOutputArea,
      clearBrainstormRecycleConfirmDialog,
      clearLibraryAiDialog,
      clearSettingsConfirmDialog,
      copyBrainstormOutputArea,
      countTextWords,
      createEditableSettingEntry,
      currentBrainstormBody,
      currentBrainstormPreviewWordCount,
      currentEntries,
      currentOutlineChapterNumber,
      currentSelectedEntry,
      currentSelectedRole,
      currentSelectedRoleLifeStatus,
      currentSelectedSetting,
      currentSelectedSettingIsLockedDefault,
      currentStructuredSettingFieldSet,
      currentStructuredSettingFields,
      deleteConfirmDialog,
      draggingLibraryEntry,
      effectiveLibraryTab,
      effectivePromptDisabled,
      entryContextMenu,
      entryRenameDialog,
      expandedRoleTypes,
      expandedSettingTypes,
      fieldSizeSettingsModal,
      fieldSizeSpecs,
      finishLibraryEntryPointerDrag,
      getConfigFieldSizeStyle,
      getEmbeddedConfigSelectStyle,
      getLibrarySidebarEntryType,
      getLibrarySidebarEntryWordCount,
      getPreviewedLibraryGroupEntries,
      getTemporaryBrainstormTitle,
      getDefaultWorkbenchLibraryEntryTitle,
      getWorkbenchAssociationRuntimeId,
      groupedSettingEntries,
      getSettingTypeWorkspaceDomain,
      handleBrainstormOutputTextareaScroll,
      handleLibraryAiInputKeyDown,
      handleLibraryAiOutputScroll,
      handleLibraryCategoryDragLeave,
      handleLibraryCategoryDragOver,
      handleLibraryCategoryDrop,
      handleLibraryEntryDragEnd,
      handleLibraryEntryDragOver,
      handleLibraryEntryDragStart,
      handleLibraryEntryDrop,
      handleSettingSidebarScroll,
      hasLibraryAiContent,
      isLibraryAiLoading,
      isOutlineCharacterScope,
      leftResizeHandle,
      libraryAiInputRef,
      libraryAiLogModal,
      libraryAiOutputRef,
      libraryDropTarget,
      libraryHeaderFontSizePortal,
      libraryPointerSuppressClickRef,
      libraryToolbarPortal,
      libraryToolbarPortalTarget,
      linkedSettingWordCount,
      managementModal,
      models,
      openBrainstormGenerateConfirm,
      openCategoryMenu,
      openEntryMenu,
      openOtherSettingReader,
      openSettingCreateDialog,
      otherSettingReaderModal,
      panelTitle,
      promptCategoryLabel,
      promptDisableContextMenu,
      renderAiChatContent,
      renderFieldSizeButton,
      renderLibraryAiLogButton,
      renderTopTabs,
      resizeFloatingAiTextarea,
      rightResizeHandle,
      rightSelectFieldTab,
      roleEntries,
      roleTextFontSize,
      roleTypeOptions,
      saveBrainstormOutput,
      saveBrainstormOutputAsNew,
      scaleStyle,
      selectedBrainstormOutputCount,
      selectedBrainstormOutputIndexSet,
      sendLibraryAiMessage,
      setActiveLibraryFontTarget,
      setActiveStructuredSettingTab,
      setAiInput,
      setBrainstormOutputPreviewDraft,
      setBrainstormOutputPreviewTitle,
      setBrainstormQuestionField,
      setExpandedRoleTypes,
      setExpandedSettingTypes,
      setIsBrainstormReaderOpen,
      setIsBrainstormRecycleOpen,
      setManagementModal,
      setPromptDisableMenu,
      setSelectedBrainstormReaderId,
      setSelectedIdForTab,
      settingCreateModal,
      settingEntries,
      settingLibraryLeftWidth,
      settingLibraryMode,
      settingLibraryRightWidth,
      settingPreviewFontSize,
      settingTreeDomains,
      settingTypeOptions,
      outlineSettingDomain,
      selectSettingWorkspaceDomain,
      showBrainstormOutputSelection,
      showHeaderLibraryAiLogButton,
      showInlineLibraryAiLogButton,
      showPanelHeader,
      showPromptDisableButton,
      smartImportLocked,
      smartImportSettings,
      stopLibraryAiMessage,
      stringifySettingContent,
      toggleBrainstormOutputPreviewSelected,
      updateActiveTabConfig,
      updateEntry,
      updateLibraryEntryPointerPreview,
      updateOutlineCharacterRole,
      updateStructuredSettingField,
    });
  }
  return null;
}
