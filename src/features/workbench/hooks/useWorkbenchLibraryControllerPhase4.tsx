/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import {
  getWorkbenchLibraryPhaseActions,
  registerWorkbenchLibraryPhaseActions,
} from './workbenchLibraryPhaseActionsBridge';
import {
  buildCurrentSettingLinkedContext,
  buildOtherSettingLinkedContext,
  buildSettingLinkedContextPayload,
} from '../components/workbenchSettingLinkedContext';
export function useWorkbenchLibraryControllerPhase4(scope: Record<string, any>) {
  const phaseActionsRef = { current: getWorkbenchLibraryPhaseActions(scope.settingTypeOptionsRef) };
  const getRoleEntries = () => phaseActionsRef.current.roleEntries ?? [];
  const {
    settingTypeOptionsRef,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    Lock,
    Pin,
    Square,
    Unlock,
    X,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    createPortal,
    useModels,
    callModel,
    callModelStream,
    SUMMARY_PROMPT_CATEGORY,
    normalizePromptCategoryName,
    usePrompts,
    joinAiRequestSections,
    wrapAiRequestTag,
    DEFAULT_WORKBENCH_ROLE_TYPES,
    canCreateWorkbenchRoleInType,
    isDefaultWorkbenchRoleType,
    isMaleProtagonistRoleType,
    normalizeWorkbenchRoleLifeStatus,
    normalizeWorkbenchRoleType,
    shouldShowRolePinAction,
    BASIC_SETTING_ENTRY_TITLE,
    BASIC_SETTING_ENTRY_TYPE,
    DEFAULT_SETTING_TYPE_DOMAINS,
    DEFAULT_SETTING_TYPES,
    DEFAULT_WORK_SETTING_STARTER_ENTRIES,
    DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS,
    DEFAULT_WORK_SETTING_STARTER_VERSION,
    DEFAULT_WORK_SETTING_TYPES,
    SETTING_WORKSPACE_DOMAIN_GROUPS,
    getDefaultWorkSettingEntryId,
    GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
    WORKBENCH_LIBRARY_UPDATED_EVENT,
    createWorkbenchLibraryEntry,
    readWorkbenchLibraryEntries,
    readWorkbenchLibraryEntriesWithGlobalBrainstorm,
    writeWorkbenchLibraryEntries,
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
    getWorkbenchAssociationRuntimeId,
    isWorkbenchAssociationRuntimeCurrent,
    WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
    WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
    readSharedWorkbenchLeftNavWidthEnabled,
    OTHER_SETTING_LINK_TABS,
    countTextWords,
    filterOtherSettingLinkGroups,
    flattenOtherSettingLinkEntries,
    isMaleProtagonistRoleTypeChangeLocked,
    resolveOtherSettingLinkDraftEntries,
    resolveOtherSettingLinkEntry,
    useDraggableModal,
    useTopModalEscape,
    startBackgroundAiTask,
    stopBackgroundAiTask,
    AiInlineInput,
    ChapterNumberButton,
    CombinedAiConfigSelect,
    LinkedSourceControl,
    ModalResizeHandles,
    WordCountText,
    FieldSizeSettingsModal,
    WorkbenchLibraryAiLogButton,
    WorkbenchLibraryFieldSizeButton,
    WorkbenchLibraryFontSizeTool,
    WorkbenchLibraryHeaderFontSizeTool,
    WorkbenchLibraryTopTabs,
    getWorkbenchLibraryActiveFontConfig,
    useWorkbenchLibraryAiLogTriggers,
    useWorkbenchLibraryFieldSizes,
    useWorkbenchLibraryFontSizes,
    useWorkbenchLibraryBackgroundTasks,
    useWorkbenchLibraryDrag,
    getLibraryEntryTargetIdAtPreviewIndexFromList,
    getPreviewedLibraryGroupEntriesFromList,
    moveLibraryEntryBeforeInList,
    moveLibraryEntryToTypeInList,
    WorkbenchOutlinePreviewPane,
    WorkbenchOutlineAiPanel,
    useWorkbenchLibraryResizeHandles,
    ClearSettingsConfirmDialog,
    EntryDeleteConfirmDialog,
    BrainstormGenerateConfirmModal,
    BrainstormPromptEditModal,
    BrainstormPromptManagerModal,
    BrainstormReaderModal,
    BrainstormRecycleModal,
    LibraryCategoryContextMenu,
    LibraryEntryContextMenu,
    CategoryRenameDialog,
    EntryRenameDialog,
    PromptDisableContextMenu,
    SettingCreateDialog,
    OtherSettingReaderModal,
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
    resizeFloatingAiTextarea,
    BrainstormOutputWorkspace,
    BrainstormPreviewEditor,
    BrainstormQuestionPanel,
    DetailOutlineReaderModal,
    LibraryAiLogModal,
    LibraryManagementModal,
    OutlineAiLogModal,
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
    buildLibraryLogGroups,
    buildRequestLogPlainPreview,
    compactTextForAi,
    escapeXmlAttribute,
    formatSettingUserRequirementForAi,
    getBrainstormQuestionRows,
    renderAiChatContent,
    DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
    PROMPT_DISABLE_CONTEXT_MENU_SIZE,
    SETTING_CATEGORY_CONTEXT_MENU_SIZE,
    SETTING_ENTRY_CONTEXT_MENU_SIZE,
    clampFixedMenuPosition,
    DETAIL_OUTLINE_PUBLISHED_GROUP_NAME,
    DETAIL_OUTLINE_STATE_MARKER,
    getDetailOutlinePreviewHeight,
    mergeDetailOutlineStateExpectation,
    splitDetailOutlineStateExpectation,
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
    clampSettingLibraryLeftWidth,
    getActiveTabStorageKey,
    getTabConfigsStorageKey,
    hasStoredExpandedNumberSet,
    persistExpandedNumberSet,
    persistExpandedStringSet,
    persistManualDetailOutlinePublishedChapterIds,
    readActiveTab,
    readBrainstormPreviewWidth,
    readExpandedNumberSet,
    readExpandedStringSet,
    readManualDetailOutlinePublishedChapterIds,
    readSettingLibraryLeftWidth,
    readSettingLibraryRightWidth,
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
    RoleBaseStateEditor,
    RoleHistoryModal,
    WorkbenchLibrarySidebar,
    WorkbenchRoleSidebar,
    WorkbenchRoleLibraryView,
    WorkbenchSettingEditor,
    WorkbenchSimpleLibraryView,
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
    buildImportedRoleEntryTitle,
    createImportedRoleContent,
    createMarkdownSettingSegments,
    createSmartSettingSegments,
    createTaggedSettingSegments,
    getImportedRoleSection,
    normalizeImportedSettingBody,
    normalizeImportedSettingKey,
    renderSettingLibraryBranch,
    renderOutlineLibraryBranch,
    storageKey,
    tabs,
    emptyText,
    volumes,
    getChapterContent,
    outlineStorageKey,
    scale,
    defaultActiveTab,
    fieldSizeOpenSignal,
    showInlineFieldSizeButton,
    openLogSignal,
    onRegisterHeaderLog,
    toolbarPortalId,
    tabsSignature,
    normalizedTabs,
    isSettingLibraryPanel,
    entries,
    setEntries,
    brainstormRecycleEntries,
    setBrainstormRecycleEntries,
    outlineEntries,
    setOutlineEntries,
    activeTab,
    setActiveTab,
    outlineSettingScope,
    setOutlineSettingScope,
    outlineSettingDomain,
    setOutlineSettingDomain,
    settingLibraryMode,
    tabConfigs,
    setTabConfigs,
    activeTabConfig,
    roleSearch,
    setRoleSearch,
    customRoleTypes,
    setCustomRoleTypes,
    hiddenRoleTypes,
    setHiddenRoleTypes,
    customSettingTypes,
    setCustomSettingTypes,
    customSettingTypeDomains,
    setCustomSettingTypeDomains,
    hiddenSettingTypes,
    setHiddenSettingTypes,
    outlineStart,
    setOutlineStart,
    outlineEnd,
    setOutlineEnd,
    selectedOutlineChapterId,
    setSelectedOutlineChapterId,
    selectedOutlineVolumeId,
    setSelectedOutlineVolumeId,
    outlineSelectionType,
    setOutlineSelectionType,
    outlinePreviewDraft,
    setOutlinePreviewDraftState,
    lastDetailOutlineReplacement,
    setLastDetailOutlineReplacement,
    forceOutlineSelectionRefresh,
    expandedOutlineVolumeIds,
    setExpandedOutlineVolumeIds,
    showDetailOutlinePublished,
    setShowDetailOutlinePublished,
    manualDetailOutlinePublishedChapterIds,
    setManualDetailOutlinePublishedChapterIds,
    detailOutlineChapterMenu,
    setDetailOutlineChapterMenu,
    lastOpenLogSignalRef,
    fieldSizeSettingsDraggable,
    isFieldSizeSettingsOpen,
    setIsFieldSizeSettingsOpen,
    fieldSizeSpecs,
    visibleFieldSizeKeys,
    fieldSizeTabLabel,
    updateFieldSizeSpec,
    resetFieldSizeSpecs,
    getFieldSizeStyle,
    getEmbeddedConfigSelectStyle,
    getConfigFieldSizeStyle,
    settingLibraryLeftWidth,
    setSettingLibraryLeftWidth,
    settingLibraryRightWidth,
    setSettingLibraryRightWidth,
    brainstormPreviewWidth,
    setBrainstormPreviewWidth,
    expandedRoleTypes,
    setExpandedRoleTypes,
    expandedSettingTypes,
    setExpandedSettingTypes,
    categoryMenu,
    setCategoryMenu,
    entryMenu,
    setEntryMenu,
    entryMoveMenuOpen,
    setEntryMoveMenuOpen,
    pendingEntryDelete,
    setPendingEntryDelete,
    pendingEntryRename,
    setPendingEntryRename,
    entryRenameDraft,
    setEntryRenameDraft,
    pendingCategoryRename,
    setPendingCategoryRename,
    categoryRenameDraft,
    setCategoryRenameDraft,
    isClearSettingsConfirmOpen,
    setIsClearSettingsConfirmOpen,
    clearSettingsConfirmTarget,
    setClearSettingsConfirmTarget,
    clearSettingsConfirmStep,
    setClearSettingsConfirmStep,
    activeStructuredSettingTab,
    setActiveStructuredSettingTab,
    promptDisableMenu,
    setPromptDisableMenu,
    managementModal,
    setManagementModal,
    roleHistoryEntryId,
    setRoleHistoryEntryId,
    isBrainstormReaderOpen,
    setIsBrainstormReaderOpen,
    selectedBrainstormReaderId,
    setSelectedBrainstormReaderId,
    isOtherSettingReaderOpen,
    setIsOtherSettingReaderOpen,
    otherSettingReaderTabId,
    setOtherSettingReaderTabId,
    otherSettingReaderPreviewId,
    setOtherSettingReaderPreviewId,
    draftOtherSettingReaderIds,
    setDraftOtherSettingReaderIds,
    otherSettingReaderQuery,
    setOtherSettingReaderQuery,
    isBrainstormRecycleOpen,
    setIsBrainstormRecycleOpen,
    isClearBrainstormRecycleConfirmOpen,
    setIsClearBrainstormRecycleConfirmOpen,
    isBrainstormPromptManagerOpen,
    setIsBrainstormPromptManagerOpen,
    editingBrainstormPrompt,
    setEditingBrainstormPrompt,
    isCreatingBrainstormPrompt,
    setIsCreatingBrainstormPrompt,
    brainstormPromptDraft,
    setBrainstormPromptDraft,
    brainstormQuestionDraft,
    setBrainstormQuestionDraft,
    brainstormGenerateDraft,
    setBrainstormGenerateDraft,
    isBrainstormConfirmScrolling,
    setIsBrainstormConfirmScrolling,
    activeDetailOutlineScrollId,
    setActiveDetailOutlineScrollId,
    isDetailOutlineReaderOpen,
    setIsDetailOutlineReaderOpen,
    detailOutlineReaderTab,
    setDetailOutlineReaderTab,
    detailOutlineReaderPreviewId,
    setDetailOutlineReaderPreviewId,
    collapsedDetailOutlineReaderGroups,
    setCollapsedDetailOutlineReaderGroups,
    draftDetailOutlineReaderSettingIds,
    setDraftDetailOutlineReaderSettingIds,
    draftDetailOutlineReaderRoleIds,
    setDraftDetailOutlineReaderRoleIds,
    draftDetailOutlineReaderOutlineIds,
    setDraftDetailOutlineReaderOutlineIds,
    activeBrainstormOutputScrollIndex,
    setActiveBrainstormOutputScrollIndex,
    activeSettingSidebarScrollKey,
    setActiveSettingSidebarScrollKey,
    settingCreateDialog,
    setSettingCreateDialog,
    settingCreateContextKind,
    setSettingCreateContextKind,
    settingCreateDraft,
    setSettingCreateDraft,
    settingCreateTypeDraft,
    setSettingCreateTypeDraft,
    isLibraryAiLoading,
    setIsLibraryAiLoading,
    isLibraryAiLogOpen,
    setIsLibraryAiLogOpen,
    libraryAiLogScope,
    setLibraryAiLogScope,
    libraryAiLogViewTab,
    setLibraryAiLogViewTab,
    showLibraryAiLogTitles,
    setShowLibraryAiLogTitles,
    settingImportFormatTabId,
    setSettingImportFormatTabId,
    settingImportFormatEntryId,
    setSettingImportFormatEntryId,
    settingImportFormatPreviewScope,
    setSettingImportFormatPreviewScope,
    structuredSettingFieldDraft,
    setStructuredSettingFieldDraft,
    lastLibraryAiRequestLog,
    setLastLibraryAiRequestLog,
    suppressNextOutlinePreviewSyncRef,
    activeLibraryFontTarget,
    setActiveLibraryFontTarget,
    lastOutlineAiRequestLog,
    setLastOutlineAiRequestLog,
    loadingDotCount,
    setLoadingDotCount,
    tabPortalTarget,
    setTabPortalTarget,
    headerToolPortalTarget,
    setHeaderToolPortalTarget,
    outlinePreviewRefs,
    libraryAiOutputRef,
    libraryAiAutoScrollRef,
    libraryAiProgrammaticScrollRef,
    libraryAiInputRef,
    libraryAiRequestSeqRef,
    brainstormConfirmScrollTimerRef,
    brainstormOutputScrollTimerRef,
    detailOutlineScrollTimerRef,
    settingSidebarScrollTimerRef,
    roleExpandedReloadRef,
    settingExpandedReloadRef,
    outlineExpandedReloadRef,
    modelSnapshot,
    models,
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    togglePin,
    brainstormPrompts,
    rolePromptOptions,
    outlinePrompts,
    scaleStyle,
    selectedId,
    roleTypeDraft,
    roleNameDraft,
    settingTypeDraft,
    settingTitleDraft,
    brainstormAiSessions,
    activeBrainstormAiSessionId,
    activeBrainstormAiSession,
    aiInput,
    canSendLibraryAiMessage,
    aiOutput,
    aiResult,
    hasLibraryAiContent,
    animatedAiOutput,
    aiChatTurns,
    previousActiveTabRef,
    brainstormStreamEnabled,
    currentOutlineChapterNumber,
    updateTabConfig,
    updateActiveTabConfig,
    brainstormPreviewFontSize,
    brainstormOutputFontSize,
    settingPreviewFontSize,
    roleTextFontSize,
    detailOutlineFontSize,
    setBrainstormPreviewFontSize,
    setBrainstormOutputFontSize,
    setSettingPreviewFontSize,
    setRoleTextFontSize,
    setDetailOutlineFontSize,
    updateBrainstormAiSession,
    updateActiveBrainstormAiSession,
    setOutlinePreviewDraft,
    setSelectedId,
    setSelectedIdForTab,
    setRoleTypeDraft,
    setRoleNameDraft,
    setSettingTypeDraft,
    setSettingTitleDraft,
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    setAiInput,
    setAiOutput,
    setAiResult,
    setBrainstormQuestionField,
    hasBrainstormQuestionContent,
    buildBrainstormPromptFromQuestions,
    openBrainstormGenerateConfirm,
    scrollLibraryAiOutputToBottom,
    handleLibraryAiOutputScroll,
    setRememberedActiveTab,
    leftResizeHandle,
    rightResizeHandle,
    brainstormPreviewResizeHandle,
    visibleEntries,
    selectedEntry,
    selectedRole,
    selectedRoleIsMaleProtagonist,
    selectedRoleLifeStatus,
    persist,
    persistBrainstormRecycle,
    persistOutline,
    addEntry,
    addEntryToTab,
    addSettingTypeByName,
    addSettingType,
    getSettingCreateTypeOptions,
    getValidSettingCreateType,
    getSelectedEntrySettingCreateType,
    addSetting,
    confirmSettingCreate,
    openSettingCreateDialog,
    smartImportSettings,
    isSettingTypeInActiveClearDomain,
    clearSettingCategories,
    clearSettingEntries,
    clearRoleCategories,
    clearRoleEntries,
    getNextBrainstormTitle,
    getNextBrainstormTitles,
    getCurrentBrainstormOutputPreviews,
    saveBrainstormOutputAsNew,
    saveBrainstormOutput,
    openBrainstormPromptEdit,
    openBrainstormPromptCreate,
    closeBrainstormPromptEdit,
    closeBrainstormPromptManager,
    closeBrainstormReader,
    confirmBrainstormReaderSelection,
    openOtherSettingReader,
    closeOtherSettingReader,
    toggleDraftOtherSettingReaderId,
    selectAllCurrentOtherSettingLinkTab,
    toggleVisibleOtherSettingLinkGroupSelection,
    confirmOtherSettingReaderSelection,
    clearActiveLinkedOtherSettings,
    clearActiveLinkedBrainstorm,
    getActiveLinkedBrainstormSnapshot,
    getActiveSettingLinkSource,
  } = scope;
  const getActiveLinkedSettingSnapshot = () => {
    const source = getActiveSettingLinkSource();
    if (source === 'current') {
      if (outlineSettingScope === 'character') {
        const currentRoleId = tabConfigs[ROLE_TAB]?.selectedId ?? null;
        const currentRoleEntry = getRoleEntries().find((entry) => entry.id === currentRoleId) ?? getRoleEntries()[0] ?? null;
        const currentRole = currentRoleEntry ? parseRoleContent(currentRoleEntry.content) : null;
        return buildCurrentSettingLinkedContext({
          entry: currentRoleEntry,
          body: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) : '',
          source: 'role',
          fallbackPath: ['人物设定', currentRole?.type ?? '人物设定', currentRoleEntry?.title ?? '当前人物设定'],
          allEntries: phaseActionsRef.current.otherSettingLinkFlatEntries ?? [],
        });
      }
      const currentEntry = selectedEntry?.tab === SETTING_TAB ? selectedEntry : null;
      const currentSettingType = currentEntry ? parseSettingContent(currentEntry.content).type : '';
      return buildCurrentSettingLinkedContext({
        entry: currentEntry,
        body: getSettingEntryBody(currentEntry),
        source: 'setting',
        fallbackPath: ['作品设定', currentSettingType, currentEntry?.title ?? '当前设定'],
        allEntries: phaseActionsRef.current.otherSettingLinkFlatEntries ?? [],
      });
    }
    if (source === 'brainstorm') {
      const linkedBrainstorm = getActiveLinkedBrainstormSnapshot();
      return {
        source,
        title: linkedBrainstorm.title,
        text: linkedBrainstorm.text,
      };
    }
    if (source === 'other') {
      return buildOtherSettingLinkedContext(phaseActionsRef.current.activeOtherSettingLinkEntries ?? []);
    }
    return {
      source: null,
      title: '',
      text: '',
      items: [],
    };
  };
  useEffect(() => {
    if (activeTab !== SETTING_TAB) return;
    const linkedId = activeTabConfig.loadedBrainstormId;
    if (!linkedId) return;
    const linkedEntry = entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === linkedId);
    if (!linkedEntry) return;
    const latestText = getBrainstormEntryBody(linkedEntry);
    if (
      activeTabConfig.loadedBrainstormTitle === linkedEntry.title &&
      activeTabConfig.loadedBrainstormText === latestText
    ) {
      return;
    }
    updateTabConfig(SETTING_TAB, {
      loadedBrainstormTitle: linkedEntry.title,
      loadedBrainstormText: latestText,
    });
  }, [
    BRAINSTORM_TAB,
    SETTING_TAB,
    activeTab,
    activeTabConfig.loadedBrainstormId,
    activeTabConfig.loadedBrainstormText,
    activeTabConfig.loadedBrainstormTitle,
    entries,
    getBrainstormEntryBody,
    updateTabConfig,
  ]);
  function openBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
    setIsBrainstormPromptManagerOpen(true);
  }
  const handleBrainstormConfirmScroll = () => {
    setIsBrainstormConfirmScrolling(true);
    if (brainstormConfirmScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormConfirmScrollTimerRef.current);
    }
    brainstormConfirmScrollTimerRef.current = window.setTimeout(() => {
      setIsBrainstormConfirmScrolling(false);
      brainstormConfirmScrollTimerRef.current = null;
    }, 700);
  };
  const handleBrainstormOutputTextareaScroll = (index: number) => {
    setActiveBrainstormOutputScrollIndex(index);
    if (brainstormOutputScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormOutputScrollTimerRef.current);
    }
    brainstormOutputScrollTimerRef.current = window.setTimeout(() => {
      setActiveBrainstormOutputScrollIndex(null);
      brainstormOutputScrollTimerRef.current = null;
    }, 700);
  };
  const handleDetailOutlineTextareaScroll = (chapterId: number) => {
    setActiveDetailOutlineScrollId(chapterId);
    if (detailOutlineScrollTimerRef.current !== null) {
      window.clearTimeout(detailOutlineScrollTimerRef.current);
    }
    detailOutlineScrollTimerRef.current = window.setTimeout(() => {
      setActiveDetailOutlineScrollId(null);
      detailOutlineScrollTimerRef.current = null;
    }, 700);
  };
  const handleSettingSidebarScroll = (key: string) => {
    setActiveSettingSidebarScrollKey(key);
    if (settingSidebarScrollTimerRef.current !== null) {
      window.clearTimeout(settingSidebarScrollTimerRef.current);
    }
    settingSidebarScrollTimerRef.current = window.setTimeout(() => {
      setActiveSettingSidebarScrollKey(null);
      settingSidebarScrollTimerRef.current = null;
    }, 700);
  };
  const saveBrainstormPromptEdit = () => {
    const name = brainstormPromptDraft.name.trim();
    if (!name) return;
    const payload = {
      name,
      description: brainstormPromptDraft.description,
      content: brainstormPromptDraft.content,
      category: BRAINSTORM_TAB,
    };
    if (editingBrainstormPrompt) {
      updatePrompt(editingBrainstormPrompt.id, payload);
    } else if (isCreatingBrainstormPrompt) {
      addPrompt({ ...payload, promptType: 'novel' });
    }
    closeBrainstormPromptEdit();
  };
  const deleteBrainstormPrompt = (prompt: PromptItem) => {
    if (prompt.isLocked) return;
    if (!window.confirm(`确定删除提示词「${prompt.name}」吗？删除后会进入提示词回收站。`)) return;
    deletePrompt(prompt.id);
  };
  const buildSettingLibraryRequestText = (promptText: string, userText: string) => {
    const parts = [promptText.trim()].filter(Boolean);
    const linkedSettingContext = buildSettingLinkedContextPayload(getActiveLinkedSettingSnapshot()).aiText;
    if (linkedSettingContext) {
      parts.push(linkedSettingContext);
    }
    const userRequirement = formatSettingUserRequirementForAi(userText);
    if (userRequirement) {
      parts.push(userRequirement);
    }
    return parts.join('\n\n');
  };
  const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {
    const selectedModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const requestPromptCategory =
      activeTab === SETTING_TAB
        ? PROMPT_SETTING_CATEGORY
        : activeTab === DETAIL_OUTLINE_TAB
          ? DETAIL_OUTLINE_PROMPT_CATEGORY
          : activeTab;
    const promptCandidates =
      activeTab === ROLE_TAB
        ? rolePromptOptions
        : prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === requestPromptCategory);
    const isPromptDisabledForRequest =
      activeTab === SETTING_TAB
        ? outlineSettingScope !== 'character' && getActiveSettingLinkSource() === 'current'
        : Boolean(activeTabConfig.promptDisabled);
    const selectedPrompt = isPromptDisabledForRequest
      ? null
      : (promptCandidates.find((prompt) => prompt.id === activeTabConfig.promptId) ?? promptCandidates[0] ?? null);
    const baseModelPrompt = isPromptDisabledForRequest
      ? ''
      : (selectedPrompt?.content ?? `你是${activeTab}生成助手。请根据用户输入生成清晰、可编辑的中文内容。`);
    const modelPrompt =
      activeTab === SETTING_TAB
        ? ''
        : activeTab === BRAINSTORM_TAB
          ? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\n\n')
          : baseModelPrompt;
    const linkedSettingContext = getActiveLinkedSettingSnapshot();
    const linkedSettingPayload = buildSettingLinkedContextPayload(linkedSettingContext);
    const hasLinkedSettingContext = activeTab === SETTING_TAB && linkedSettingPayload.hasContext;
    const hasLinkedBrainstorm = hasLinkedSettingContext && linkedSettingContext.source === 'brainstorm';
    const settingUserRequirementForAi = formatSettingUserRequirementForAi(text);
    const requestText =
      activeTab === SETTING_TAB && overrideText === undefined
        ? buildSettingLibraryRequestText(baseModelPrompt, text)
        : text;
    return {
      selectedModel,
      selectedPrompt,
      modelPrompt,
      requestText,
      log: {
        createdAt: new Date().toLocaleString('zh-CN'),
        tab: activeTab,
        modelName: selectedModel?.name ?? '未配置模型',
        promptName: isPromptDisabledForRequest ? '已禁用提示词' : (selectedPrompt?.name ?? '默认提示词'),
        hasLinkedBrainstorm,
        linkedBrainstormTitle: hasLinkedBrainstorm ? linkedSettingContext.title : '',
        visibleUserText: text,
        systemPrompt: activeTab === SETTING_TAB ? baseModelPrompt : modelPrompt,
        userContent: activeTab === SETTING_TAB ? settingUserRequirementForAi : requestText,
        contextTitle: hasLinkedSettingContext ? linkedSettingContext.title : '',
        contextText: hasLinkedSettingContext ? linkedSettingPayload.displayText : '',
        contextWordCount: hasLinkedSettingContext ? linkedSettingPayload.wordCount : 0,
      } satisfies LibraryAiRequestLog,
    };
  };
  const sendLibraryAiMessage = async (
    overrideText?: string,
    options: { visibleText?: string; previewCount?: number } = {},
  ) => {
    const text = (overrideText ?? aiInput).trim();
    if (isLibraryAiLoading || (!text && activeTab !== SETTING_TAB)) return;
    const { selectedModel, modelPrompt, requestText, log } = buildLibraryAiRequestPayload(text, overrideText);
    if (!selectedModel) {
      setAiOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
      return;
    }
    libraryAiAutoScrollRef.current = true;
    setLastLibraryAiRequestLog(log);
    libraryAiRequestSeqRef.current += 1;
    const targetTab = activeTab;
    const targetBrainstormSessionId = targetTab === BRAINSTORM_TAB ? activeBrainstormAiSessionId : undefined;
    const targetBrainstormPreviewCount =
      targetTab === BRAINSTORM_TAB
        ? (options.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount))
        : undefined;
    setIsLibraryAiLoading(true);
    if (overrideText === undefined) setAiInput('');
    if (targetTab === BRAINSTORM_TAB) {
      setAiResult('');
      updateActiveBrainstormAiSession({
        previewTitles: [],
        previewDrafts: [],
        previewSelectedIndexes: undefined,
        previewCount: targetBrainstormPreviewCount,
      });
    }
    const visibleUserText = (options.visibleText ?? text).trim();
    const pendingAiPrefix = `${aiOutput.trim() ? `${aiOutput.trim()}\n\n` : ''}[[USER]]\n${visibleUserText}\n\n[[AI]]\n`;
    const pendingOutput = `${pendingAiPrefix}${formatAiThinkingResponse('', '', 0, false)}`;
    const replacePendingOutput = (content: string) => `${pendingAiPrefix}${content}`;
    setAiOutput(pendingOutput);
    const shouldStream = targetTab === SETTING_TAB || (targetTab === BRAINSTORM_TAB && brainstormStreamEnabled);
    const shouldGenerateBrainstormSequentially =
      targetTab === BRAINSTORM_TAB &&
      typeof targetBrainstormPreviewCount === 'number' &&
      targetBrainstormPreviewCount > 1;
    const task = startBackgroundAiTask({
      kind: targetTab === BRAINSTORM_TAB ? 'brainstorm' : 'outline',
      title: `${targetTab}生成`,
      input: requestText,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'workbenchLibraryAi',
        storageKey,
        tab: targetTab,
        sessionId: targetBrainstormSessionId ?? null,
      },
      runner: async ({ signal, emit }) => {
        let content = '';
        try {
          if (shouldGenerateBrainstormSequentially) {
            const completedItems: string[] = [];
            for (let index = 1; index <= targetBrainstormPreviewCount; index += 1) {
              if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
              let streamedContent = '';
              const itemRequestText = buildSequentialBrainstormRequestText(
                requestText,
                index,
                targetBrainstormPreviewCount,
                completedItems,
              );
              emit(replacePendingOutput(formatSequentialBrainstormOutput(completedItems, index, '正在生成...')), {
                replace: true,
              });
              const itemContent = await callModelStream({
                model: selectedModel,
                prompt: modelPrompt,
                userContent: itemRequestText,
                recordType: 'generate',
                signal,
                timeoutMs: LIBRARY_AI_TIMEOUT_MS,
                onChunk: (chunk) => {
                  streamedContent += chunk;
                  const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());
                  emit(
                    replacePendingOutput(
                      formatSequentialBrainstormOutput(completedItems, index, brainstormStreamDisplay || '正在生成...'),
                    ),
                    { replace: true },
                  );
                },
              });
              const itemDisplayContent = getBrainstormDisplayContent(itemContent, itemRequestText);
              completedItems.push(stripAiThinkingBlock(itemDisplayContent));
              emit(replacePendingOutput(formatSequentialBrainstormOutput(completedItems)), { replace: true });
            }
            return replacePendingOutput(formatSequentialBrainstormOutput(completedItems));
          }
          if (shouldStream) {
            let streamedContent = '';
            let reasoningContent = '';
            const streamStartedAt = performance.now();
            const getThinkingSeconds = () => Math.max(1, Math.round((performance.now() - streamStartedAt) / 1000));
            content = await callModelStream({
              model: selectedModel,
              prompt: modelPrompt,
              userContent: requestText,
              recordType: 'generate',
              signal,
              timeoutMs: LIBRARY_AI_TIMEOUT_MS,
              onChunk: (chunk) => {
                streamedContent += chunk;
                const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());
                emit(
                  replacePendingOutput(
                    formatAiThinkingResponse(
                      targetTab === BRAINSTORM_TAB
                        ? brainstormStreamDisplay || '正在生成...'
                        : streamedContent || '正在生成...',
                      reasoningContent,
                      getThinkingSeconds(),
                      false,
                    ),
                  ),
                  { replace: true },
                );
              },
              onReasoning: (chunk) => {
                if (streamedContent) return;
                reasoningContent += chunk;
                const temporaryOutput = formatAiThinkingResponse('', reasoningContent, getThinkingSeconds(), false);
                emit(replacePendingOutput(temporaryOutput), { replace: true });
              },
            });
            if (reasoningContent.trim()) {
              content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
            }
          } else {
            content = await callModel({
              model: selectedModel,
              prompt: modelPrompt,
              userContent: requestText,
              recordType: 'generate',
              signal,
              timeoutMs: LIBRARY_AI_TIMEOUT_MS,
            });
          }
          const displayContent =
            targetTab === BRAINSTORM_TAB ? getBrainstormDisplayContent(content, requestText) : content;
          return replacePendingOutput(displayContent);
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(replacePendingOutput(`【错误】${message}`), { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    if (targetTab === BRAINSTORM_TAB && targetBrainstormSessionId) {
      updateBrainstormAiSession(targetBrainstormSessionId, {
        output: pendingOutput,
        result: '',
        backgroundAiTaskId: task.id,
        previewCount: targetBrainstormPreviewCount,
        previewTitles: [],
        previewDrafts: [],
        previewSelectedIndexes: undefined,
      });
    } else {
      updateTabConfig(targetTab, { aiOutput: pendingOutput, libraryAiTaskId: task.id });
    }
  };
  const stopLibraryAiMessage = () => {
    const taskId =
      activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.backgroundAiTaskId : activeTabConfig.libraryAiTaskId;
    if (taskId) stopBackgroundAiTask(taskId);
    setIsLibraryAiLoading(false);
    setAiOutput(aiOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, '[[AI]]\n已暂停'));
  };
  const clearLibraryAiDialog = () => {
    if (activeTab === BRAINSTORM_TAB) {
      libraryAiRequestSeqRef.current += 1;
      if (activeBrainstormAiSession?.backgroundAiTaskId) {
        stopBackgroundAiTask(activeBrainstormAiSession.backgroundAiTaskId);
      }
      setIsLibraryAiLoading(false);
      updateActiveBrainstormAiSession({
        input: '',
        output: '',
        result: '',
        backgroundAiTaskId: undefined,
        previewCount: undefined,
      });
      updateActiveBrainstormAiSession({ previewTitles: [], previewDrafts: [], previewSelectedIndexes: undefined });
      return;
    }
    libraryAiRequestSeqRef.current += 1;
    if (activeTabConfig.libraryAiTaskId) stopBackgroundAiTask(activeTabConfig.libraryAiTaskId);
    setIsLibraryAiLoading(false);
    setTabConfigs((prev) => {
      const currentConfig = prev[activeTab] ?? {};
      const nextConfig: LibraryTabConfig = {
        ...currentConfig,
        aiInput: '',
        aiOutput: '',
        aiResult: '',
        libraryAiTaskId: undefined,
      };
      delete nextConfig.aiSessions;
      delete nextConfig.activeAiSessionId;
      const next = {
        ...prev,
        [activeTab]: nextConfig,
      };
      localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
  };
  const clearBrainstormOutputArea = () => {
    if (activeTab !== BRAINSTORM_TAB) return;
    libraryAiRequestSeqRef.current += 1;
    if (activeBrainstormAiSession?.backgroundAiTaskId) {
      stopBackgroundAiTask(activeBrainstormAiSession.backgroundAiTaskId);
    }
    setIsLibraryAiLoading(false);
    updateActiveBrainstormAiSession({
      output: '',
      result: '',
      backgroundAiTaskId: undefined,
      previewCount: undefined,
      previewTitles: [],
      previewDrafts: [],
      previewSelectedIndexes: undefined,
    });
  };
  const copyBrainstormOutputArea = () => {
    if (activeTab !== BRAINSTORM_TAB) return;
    const outputText = stripAiThinkingBlock(
      activeBrainstormAiSession?.output ?? activeTabConfig.aiOutput ?? activeTabConfig.aiResult ?? '',
    ).trim();
    if (!outputText) return;
    void navigator.clipboard.writeText(outputText);
  };
  const handleLibraryAiInputKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    void sendLibraryAiMessage();
  };
  const confirmBrainstormGenerate = () => {
    if (!brainstormGenerateDraft) return;
    const promptText = buildBrainstormPromptFromQuestions(brainstormGenerateDraft);
    const visibleText = stripBrainstormRequestHeader(promptText);
    const previewCount = getBrainstormOutputCount(brainstormGenerateDraft.brainstormCount);
    setBrainstormGenerateDraft(null);
    void sendLibraryAiMessage(promptText, { visibleText, previewCount });
  };
  const addRoleTypeByName = (name: string) => {
    const type = normalizeWorkbenchRoleType(name);
    if (!type) return;
    setCustomRoleTypes((prev) => {
      if (prev.includes(type) || DEFAULT_ROLE_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    setExpandedRoleTypes((prev) => new Set(prev).add(type));
  };
  const addRoleType = () => {
    addRoleTypeByName(roleTypeDraft);
    setRoleTypeDraft('');
  };
  const getDefaultRoleCreateType = () =>
    DEFAULT_ROLE_TYPES.find((type) =>
      canCreateWorkbenchRoleInType(
        getRoleEntries().map((entry) => parseRoleContent(entry.content).type),
        type,
      ),
    ) ??
    DEFAULT_ROLE_TYPES[0] ??
    UNCATEGORIZED_TYPE;
  const addRole = (type = getDefaultRoleCreateType(), options: { switchToRoleTab?: boolean; title?: string } = {}) => {
    const normalizedType = normalizeWorkbenchRoleType(type);
    if (
      !canCreateWorkbenchRoleInType(
        getRoleEntries().map((entry) => parseRoleContent(entry.content).type),
        normalizedType,
      )
    )
      return;
    const title = options.title?.trim() || roleNameDraft.trim() || '新建角色';
    const entry = createWorkbenchLibraryEntry(ROLE_TAB, title);
    const stateSettings = createEmptyRoleStateSettings();
    const roleEntry = {
      ...entry,
      content: stringifyRoleContent({
        type: normalizedType,
        lifeStatus: '存活',
        baseSetting: '',
        relationship: '',
        stateSettings,
        personality: '',
        background: '',
        status: '',
        history: [],
      }),
    };
    persist([roleEntry, ...entries]);
    if (options.switchToRoleTab !== false) setRememberedActiveTab(ROLE_TAB);
    setSelectedIdForTab(ROLE_TAB, roleEntry.id);
    setExpandedRoleTypes((prev) => new Set(prev).add(normalizedType));
    if (options.title === undefined) setRoleNameDraft('');
  };
  registerWorkbenchLibraryPhaseActions(scope.settingTypeOptionsRef, { addRole, addRoleTypeByName });
  return {
    getActiveLinkedSettingSnapshot,
    openBrainstormPromptManager,
    handleBrainstormConfirmScroll,
    handleBrainstormOutputTextareaScroll,
    handleDetailOutlineTextareaScroll,
    handleSettingSidebarScroll,
    saveBrainstormPromptEdit,
    deleteBrainstormPrompt,
    buildSettingLibraryRequestText,
    buildLibraryAiRequestPayload,
    sendLibraryAiMessage,
    stopLibraryAiMessage,
    clearLibraryAiDialog,
    clearBrainstormOutputArea,
    copyBrainstormOutputArea,
    handleLibraryAiInputKeyDown,
    confirmBrainstormGenerate,
    addRoleTypeByName,
    addRoleType,
    getDefaultRoleCreateType,
    addRole,
  };
}
