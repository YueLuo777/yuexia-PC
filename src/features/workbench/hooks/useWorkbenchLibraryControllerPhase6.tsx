/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import { buildWorkbenchRoleTypeOptions } from '../components/workbenchRoleTypeOptions';
import { registerWorkbenchLibraryPhaseActions } from './workbenchLibraryPhaseActionsBridge';

export function useWorkbenchLibraryControllerPhase6(scope: Record<string, any>) {
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
    formatSettingLinkedContextForAi,
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
    updateEntry,
    createEditableSettingEntry,
    updateRole,
    updateSelectedRoleTitle,
    expandLibraryTargetType,
    moveLibraryEntryToType,
    moveLibraryEntryBefore,
    getLibraryEntryTargetIdAtPreviewIndex,
    draggingLibraryEntry,
    libraryDropTarget,
    libraryEntryDropPreview,
    libraryPointerSuppressClickRef,
    handleLibraryEntryDragStart,
    beginLibraryEntryPointerDrag,
    updateLibraryEntryPointerPreview,
    finishLibraryEntryPointerDrag,
    handleLibraryCategoryDragOver,
    handleLibraryCategoryDragLeave,
    handleLibraryCategoryDrop,
    handleLibraryEntryDragOver,
    handleLibraryEntryDrop,
    handleLibraryEntryDragEnd,
    getPreviewedLibraryGroupEntries,
    deleteEntry,
    restoreBrainstormEntry,
    permanentlyDeleteBrainstormEntry,
    clearBrainstormRecycle,
    confirmDeleteEntry,
    handleConfirmDeleteEntry,
    openCategoryMenu,
    openEntryMenu,
    deleteRoleType,
    deleteSettingType,
    deleteCategoryFromMenu,
    openClearSettingsConfirmFromMenu,
    createEntryFromCategoryMenu,
    openSiblingCategoryCreateFromMenu,
    openCategoryRenameFromMenu,
    closeCategoryRenameDialog,
    confirmCategoryRename,
    deleteEntryFromMenu,
    renameEntryFromMenu,
    createEntryFromEntryMenu,
    copyEntryFromMenu,
    moveEntryFromMenuToType,
    closeEntryRenameDialog,
    confirmEntryRename,
    toggleEntryPinnedFromMenu,
  } = scope;
  const toggleRolePinned = (entry: WorkbenchLibraryEntry) => {
    if (entry.tab !== ROLE_TAB) return;
    if (!shouldShowRolePinAction(parseRoleContent(entry.content).type)) return;
    const nextPinnedAt = entry.pinnedAt ? undefined : Date.now();
    persist(
      entries.map((item) =>
        item.id === entry.id
          ? { ...item, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
          : item,
      ),
    );
  };
  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [ROLE_TAB, entries]);
  const roleTypeOptions = useMemo(
    () => buildWorkbenchRoleTypeOptions({ entries, customRoleTypes, hiddenRoleTypes }),
    [customRoleTypes, entries, hiddenRoleTypes],
  );
  const searchedRoles = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase();
    if (!keyword) return roleEntries;
    return roleEntries.filter((entry) => entry.title.toLowerCase().includes(keyword));
  }, [roleEntries, roleSearch]);
  const groupedRoles = useMemo(
    () =>
      roleTypeOptions.map((type) => {
        const entriesInType = searchedRoles.filter((entry) => parseRoleContent(entry.content).type === type);
        return {
          type,
          entries: entriesInType
            .map((entry, index) => ({ entry, index }))
            .sort((left, right) => {
              const leftPinned = typeof left.entry.pinnedAt === 'number';
              const rightPinned = typeof right.entry.pinnedAt === 'number';
              if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
              if (leftPinned) return -1;
              if (rightPinned) return 1;
              return left.index - right.index;
            })
            .map(({ entry }) => entry),
        };
      }),
    [parseRoleContent, roleTypeOptions, searchedRoles],
  );
  const settingEntries = useMemo(() => entries.filter((entry) => entry.tab === SETTING_TAB), [SETTING_TAB, entries]);
  const settingTypeOptions = useMemo(() => {
    const entryTypes = settingEntries.map((entry) => parseSettingContent(entry.content).type).filter(Boolean);
    const hidden = new Set(hiddenSettingTypes);
    const merged = Array.from(
      new Set([
        ...DEFAULT_SETTING_TYPES.filter(
          (type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type),
        ),
        ...customSettingTypes.filter(
          (type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type),
        ),
        ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
      ]),
    );
    return merged;
  }, [
    BRAINSTORM_TYPE,
    DEFAULT_SETTING_TYPES,
    UNCATEGORIZED_TYPE,
    customSettingTypes,
    hiddenSettingTypes,
    parseSettingContent,
    settingEntries,
  ]);
  settingTypeOptionsRef.current = settingTypeOptions;
  useEffect(() => {
    if (roleTypeOptions.length === 0) return;
    setExpandedRoleTypes((prev) => {
      const next = new Set(prev);
      roleTypeOptions.forEach((type) => next.add(type));
      if (next.size === prev.size) return prev;
      roleExpandedReloadRef.current = true;
      return next;
    });
  }, [roleExpandedReloadRef, roleTypeOptions, setExpandedRoleTypes, storageKey]);
  useEffect(() => {
    if (settingTypeOptions.length === 0) return;
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      settingTypeOptions.forEach((type) => next.add(type));
      if (next.size === prev.size) return prev;
      settingExpandedReloadRef.current = true;
      return next;
    });
  }, [activeTab, setExpandedSettingTypes, settingExpandedReloadRef, settingTypeOptions, storageKey]);
  const settingImportFormatGuideTabs = useMemo(
    () =>
      buildSettingImportFormatTabs({
        visibleSettingTypes: settingTypeOptions,
        settingEntries,
        getSettingTypeWorkspaceDomain,
      }),
    [buildSettingImportFormatTabs, getSettingTypeWorkspaceDomain, settingEntries, settingTypeOptions],
  );
  const otherSettingLinkTabs = useMemo<OtherSettingLinkTab[]>(() => {
    const createSettingEntry = (
      entry: WorkbenchLibraryEntry,
      tabId: OtherSettingLinkTabId,
      tabTitle: string,
    ): OtherSettingLinkEntry => {
      const setting = parseSettingContent(entry.content);
      const text = getSettingEntryBody(entry);
      return {
        id: `setting:${entry.id}`,
        entryId: entry.id,
        source: 'setting',
        tabId,
        tabTitle,
        groupName: setting.type || UNCATEGORIZED_TYPE,
        title: entry.title,
        type: setting.type || UNCATEGORIZED_TYPE,
        text,
        wordCount: countTextWords(text),
      };
    };
    const createSettingGroups = (tabId: OtherSettingLinkTabId, tabTitle: string, domain: string | null) =>
      settingTypeOptions
        .filter((type) =>
          domain ? getSettingTypeWorkspaceDomain(type) === domain : !getSettingTypeWorkspaceDomain(type),
        )
        .map((type) => ({
          name: type,
          entries: settingEntries
            .filter((entry) => parseSettingContent(entry.content).type === type)
            .map((entry) => createSettingEntry(entry, tabId, tabTitle)),
        }))
        .filter((group) => group.entries.length > 0);
    return OTHER_SETTING_LINK_TABS.map((tab): OtherSettingLinkTab => {
      if (tab.id === 'roles') {
        return {
          ...tab,
          groups: groupedRoles
            .map((group) => ({
              name: group.type,
              entries: group.entries.map((entry): OtherSettingLinkEntry => {
                const role = parseRoleContent(entry.content);
                const text = buildRoleReaderContent(entry, role);
                return {
                  id: `role:${entry.id}`,
                  entryId: entry.id,
                  source: 'role',
                  tabId: tab.id,
                  tabTitle: tab.title,
                  groupName: group.type,
                  title: entry.title,
                  type: role.type,
                  text,
                  wordCount: countTextWords(text),
                };
              }),
            }))
            .filter((group) => group.entries.length > 0),
        };
      }
      const domainByTabId: Partial<Record<OtherSettingLinkTabId, string | null>> = {
        work: null,
        factions: 'setting:faction',
        items: 'setting:item',
        monsters: 'setting:monster',
        foreshadow: 'setting:foreshadow',
      };
      return {
        ...tab,
        groups: createSettingGroups(tab.id, tab.title, domainByTabId[tab.id] ?? null),
      };
    });
  }, [
    OTHER_SETTING_LINK_TABS,
    UNCATEGORIZED_TYPE,
    buildRoleReaderContent,
    countTextWords,
    getSettingEntryBody,
    getSettingTypeWorkspaceDomain,
    groupedRoles,
    parseRoleContent,
    parseSettingContent,
    settingEntries,
    settingTypeOptions,
  ]);
  const otherSettingLinkFlatEntries = useMemo(
    () => flattenOtherSettingLinkEntries(otherSettingLinkTabs),
    [flattenOtherSettingLinkEntries, otherSettingLinkTabs],
  );
  const activeOtherSettingLinkEntries = useMemo(() => {
    if (!isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)) return [];
    const entryMap = new Map(otherSettingLinkFlatEntries.map((entry) => [entry.id, entry]));
    return normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds)
      .map((id) => entryMap.get(id))
      .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
  }, [
    activeTabConfig.associationSessionId,
    activeTabConfig.linkedOtherSettingIds,
    isWorkbenchAssociationRuntimeCurrent,
    normalizeLinkedOtherSettingIds,
    otherSettingLinkFlatEntries,
  ]);
  const deletableRoleEntries = useMemo(
    () => roleEntries.filter((entry) => !isMaleProtagonistRoleType(parseRoleContent(entry.content).type)),
    [isMaleProtagonistRoleType, parseRoleContent, roleEntries],
  );
  const deletableSettingEntries = useMemo(
    () => settingEntries.filter((entry) => !isLockedDefaultSettingEntry(entry)),
    [isLockedDefaultSettingEntry, settingEntries],
  );
  const selectedSettingClearDomain =
    activeTab === SETTING_TAB && outlineSettingScope !== 'character' ? getSelectedSettingWorkspaceDomain() : null;
  const deletableSettingEntriesForClear = useMemo(
    () =>
      deletableSettingEntries.filter((entry) => {
        const typeDomain = getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type);
        return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
      }),
    [deletableSettingEntries, getSettingTypeWorkspaceDomain, parseSettingContent, selectedSettingClearDomain],
  );
  const deletableSettingTypes = useMemo(
    () =>
      settingTypeOptions.filter((type) => {
        if (type === UNCATEGORIZED_TYPE || DEFAULT_SETTING_TYPES.includes(type)) return false;
        const typeDomain = getSettingTypeWorkspaceDomain(type);
        return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
      }),
    [
      DEFAULT_SETTING_TYPES,
      UNCATEGORIZED_TYPE,
      getSettingTypeWorkspaceDomain,
      selectedSettingClearDomain,
      settingTypeOptions,
    ],
  );
  const clearSettingsTargetMeta: Record<ClearSettingsTarget, ClearSettingsMeta> = {
    settingCategories: {
      label: '设定分组',
      count: deletableSettingTypes.length,
      description: '确定要清空全部自建设定分组吗？默认分组和默认设定条目会保留。',
    },
    settingEntries: {
      label: '设定',
      count: deletableSettingEntriesForClear.length,
      description: `确定要清空全部自建设定吗？当前共有 ${deletableSettingEntriesForClear.length} 条可删除设定会被删除，默认设定条目会保留。`,
    },
    roleCategories: {
      label: '角色分组',
      count: roleTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE && !isDefaultWorkbenchRoleType(type)).length,
      description: `确定要清空全部自建人物分组吗？女主角、重要正派角色、正派配角、重要反派角色、反派配角、龙套角色等默认分组会保留。`,
    },
    roleEntries: {
      label: '角色',
      count: deletableRoleEntries.length,
      description: `确定要清空全部角色吗？当前共有 ${deletableRoleEntries.length} 个可删除角色会被删除，男主角会保留。`,
    },
  };
  const closeClearSettingsConfirm = () => {
    setIsClearSettingsConfirmOpen(false);
    setClearSettingsConfirmStep(1);
  };
  const openClearSettingsConfirm = (target: ClearSettingsTarget) => {
    if (clearSettingsTargetMeta[target].count === 0) return;
    setClearSettingsConfirmTarget(target);
    setClearSettingsConfirmStep(1);
    setIsClearSettingsConfirmOpen(true);
  };
  const confirmClearSettings = () => {
    if (clearSettingsConfirmStep === 1) {
      setClearSettingsConfirmStep(2);
      return;
    }
    if (clearSettingsConfirmTarget === 'settingCategories') clearSettingCategories();
    if (clearSettingsConfirmTarget === 'settingEntries') clearSettingEntries();
    if (clearSettingsConfirmTarget === 'roleCategories') clearRoleCategories();
    if (clearSettingsConfirmTarget === 'roleEntries') clearRoleEntries();
    closeClearSettingsConfirm();
  };
  const renderFieldSizeButton = () => (
    <WorkbenchLibraryFieldSizeButton
      visible={showInlineFieldSizeButton}
      tabLabel={fieldSizeTabLabel}
      onClick={() => setIsFieldSizeSettingsOpen(true)}
    />
  );
  const openLibraryAiLog = useCallback(
    (scope: 'library' | 'outline') => {
      setLibraryAiLogScope(scope);
      setIsLibraryAiLogOpen(true);
    },
    [setIsLibraryAiLogOpen, setLibraryAiLogScope],
  );
  useWorkbenchLibraryAiLogTriggers({
    activeTab,
    openLogSignal,
    lastOpenLogSignalRef,
    onRegisterHeaderLog,
    openLibraryAiLog,
  });
  const renderLibraryAiLogButton = (
    scope: 'library' | 'outline',
    className = 'h-9 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand',
  ) => (
    <WorkbenchLibraryAiLogButton
      visible={showInlineFieldSizeButton}
      scope={scope}
      className={className}
      onOpen={openLibraryAiLog}
    />
  );
  const renderDetailOutlineFontSizeTool = () => {
    if (activeTab !== DETAIL_OUTLINE_TAB) return null;
    return (
      <WorkbenchLibraryFontSizeTool
        config={{
          value: detailOutlineFontSize,
          min: DETAIL_OUTLINE_MIN_FONT_SIZE,
          max: DETAIL_OUTLINE_MAX_FONT_SIZE,
          onChange: setDetailOutlineFontSize,
          ariaLabel: '章纲字号',
        }}
      />
    );
  };
  const getActiveLibraryFontConfig = () =>
    getWorkbenchLibraryActiveFontConfig({
      activeTab,
      activeLibraryFontTarget,
      outlineSettingScope,
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
    });
  const renderActiveLibraryFontSizeTool = () => {
    const config = getActiveLibraryFontConfig();
    return <WorkbenchLibraryFontSizeTool config={config} />;
  };
  const renderLibraryHeaderFontSizeTool = () => {
    const fontSizeTool = renderActiveLibraryFontSizeTool();
    return (
      <WorkbenchLibraryHeaderFontSizeTool
        activeTab={activeTab}
        brainstormStreamEnabled={brainstormStreamEnabled}
        fontSizeTool={fontSizeTool}
        onBrainstormStreamEnabledChange={(enabled) => updateActiveTabConfig({ brainstormStreamEnabled: enabled })}
      />
    );
  };
  const topTabs = isSettingLibraryPanel ? null : (
    <WorkbenchLibraryTopTabs
      isSettingLibraryPanel={isSettingLibraryPanel}
      normalizedTabs={normalizedTabs}
      activeTab={activeTab}
      onTabChange={setRememberedActiveTab}
    />
  );
  const renderTopTabs = () =>
    normalizedTabs.length <= 1 || !topTabs ? null : tabPortalTarget ? (
      createPortal(topTabs, tabPortalTarget)
    ) : (
      <div
        data-no-modal-drag="true"
        className="flex shrink-0 cursor-default items-center gap-2 border-b border-gray-100 bg-white px-4 py-3"
      >
        {topTabs}
      </div>
    );
  const libraryHeaderFontSizePortal =
    headerToolPortalTarget && !showInlineFieldSizeButton
      ? createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)
      : null;
  const fieldSizeSettingsModal = isFieldSizeSettingsOpen
    ? createPortal(
        <FieldSizeSettingsModal
          tabLabel={fieldSizeTabLabel}
          visibleKeys={visibleFieldSizeKeys}
          specs={fieldSizeSpecs}
          draggable={fieldSizeSettingsDraggable}
          onClose={() => setIsFieldSizeSettingsOpen(false)}
          onReset={resetFieldSizeSpecs}
          onChange={updateFieldSizeSpec}
        />,
        document.body,
      )
    : null;
  const categoryMenuClearCategoryTarget: ClearSettingsTarget =
    categoryMenu?.kind === 'role' ? 'roleCategories' : 'settingCategories';
  const categoryMenuClearEntryTarget: ClearSettingsTarget =
    categoryMenu?.kind === 'role' ? 'roleEntries' : 'settingEntries';
  const canDeleteCategoryFromMenu = categoryMenu
    ? categoryMenu.kind === 'role'
      ? !isDefaultWorkbenchRoleType(categoryMenu.type)
      : !DEFAULT_SETTING_TYPES.includes(categoryMenu.type)
    : false;
  const canRenameCategoryFromMenu = canDeleteCategoryFromMenu;
  const categoryContextMenu = (
    <LibraryCategoryContextMenu
      menu={categoryMenu}
      canDelete={canDeleteCategoryFromMenu}
      canRename={canRenameCategoryFromMenu}
      clearEntryLabel={clearSettingsTargetMeta[categoryMenuClearEntryTarget].label}
      clearEntryDisabled={clearSettingsTargetMeta[categoryMenuClearEntryTarget].count === 0}
      clearCategoryLabel={clearSettingsTargetMeta[categoryMenuClearCategoryTarget].label}
      clearCategoryDisabled={clearSettingsTargetMeta[categoryMenuClearCategoryTarget].count === 0}
      onCreateEntry={createEntryFromCategoryMenu}
      onCreateGroup={openSiblingCategoryCreateFromMenu}
      onRenameGroup={openCategoryRenameFromMenu}
      onClearEntries={() => openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)}
      onClearCategories={() => openClearSettingsConfirmFromMenu(categoryMenuClearCategoryTarget)}
      onDeleteGroup={deleteCategoryFromMenu}
    />
  );
  const entryMenuTarget = entryMenu ? entries.find((entry) => entry.id === entryMenu.entryId) : null;
  const entryMenuIsLockedDefaultSetting = Boolean(entryMenuTarget && isLockedDefaultSettingEntry(entryMenuTarget));
  const entryMenuIsMaleProtagonist = Boolean(
    entryMenu?.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? ''),
  );
  const entryMenuRoleType = entryMenuTarget?.tab === ROLE_TAB ? parseRoleContent(entryMenuTarget.content).type : '';
  const entryMenuCopyDisabled = Boolean(
    entryMenuTarget?.tab === ROLE_TAB &&
    !canCreateWorkbenchRoleInType(
      roleEntries.map((entry) => parseRoleContent(entry.content).type),
      entryMenuRoleType,
    ),
  );
  const entryMenuCreateDisabled = entryMenuCopyDisabled;
  const entryMenuRenameDisabled = entryMenuIsLockedDefaultSetting;
  const entryMenuDeleteDisabled = entryMenuIsLockedDefaultSetting || entryMenuIsMaleProtagonist;
  const entryMenuMoveDisabled = entryMenuIsLockedDefaultSetting || entryMenuIsMaleProtagonist;
  const entryMenuMoveOptions =
    entryMenuTarget?.tab === ROLE_TAB
      ? roleTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE)
      : entryMenuTarget && isSettingLikeTab(entryMenuTarget.tab)
        ? settingTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE && isSettingTypeInActiveClearDomain(type))
        : [];
  const entryContextMenu = (
    <LibraryEntryContextMenu
      menu={entryMenu}
      showPinAction={Boolean(entryMenu?.tab === ROLE_TAB && shouldShowRolePinAction(entryMenu.roleType))}
      createDisabled={entryMenuCreateDisabled}
      copyDisabled={entryMenuCopyDisabled}
      renameDisabled={entryMenuRenameDisabled}
      deleteDisabled={entryMenuDeleteDisabled}
      moveDisabled={entryMenuMoveDisabled}
      moveOpen={entryMoveMenuOpen}
      moveOptions={entryMenuMoveOptions}
      entryKindLabel={entryMenu?.tab === ROLE_TAB ? '角色' : '设定'}
      onTogglePin={toggleEntryPinnedFromMenu}
      onCreate={createEntryFromEntryMenu}
      onCopy={copyEntryFromMenu}
      onRename={renameEntryFromMenu}
      onDelete={deleteEntryFromMenu}
      onToggleMoveOpen={() => setEntryMoveMenuOpen((open) => !open)}
      onMoveToType={moveEntryFromMenuToType}
    />
  );
  const deleteConfirmDialog = (
    <EntryDeleteConfirmDialog
      pendingEntry={pendingEntryDelete}
      roleTab={ROLE_TAB}
      brainstormTab={BRAINSTORM_TAB}
      onClose={() => setPendingEntryDelete(null)}
      onConfirm={handleConfirmDeleteEntry}
    />
  );
  const entryRenameDialog = (
    <EntryRenameDialog
      isOpen={Boolean(pendingEntryRename)}
      draft={entryRenameDraft}
      onDraftChange={setEntryRenameDraft}
      onClose={closeEntryRenameDialog}
      onConfirm={confirmEntryRename}
    />
  );
  const currentClearSettingsMeta = clearSettingsTargetMeta[clearSettingsConfirmTarget];
  const clearSettingsConfirmDialog = (
    <ClearSettingsConfirmDialog
      isOpen={isClearSettingsConfirmOpen}
      step={clearSettingsConfirmStep}
      meta={currentClearSettingsMeta}
      onClose={closeClearSettingsConfirm}
      onConfirm={confirmClearSettings}
    />
  );
  const promptDisableContextMenu = (
    <PromptDisableContextMenu
      menu={promptDisableMenu}
      onToggle={(tab, disabled) => updateTabConfig(tab, { promptDisabled: !disabled })}
      onClose={() => setPromptDisableMenu(null)}
    />
  );
  const selectedOtherSettingLinkTab =
    otherSettingLinkTabs.find((tab) => tab.id === otherSettingReaderTabId) ?? otherSettingLinkTabs[0];
  const visibleOtherSettingGroups = filterOtherSettingLinkGroups(selectedOtherSettingLinkTab, otherSettingReaderQuery);
  const selectedOtherSettingLinkEntry = resolveOtherSettingLinkEntry(
    otherSettingLinkFlatEntries,
    visibleOtherSettingGroups,
    otherSettingReaderPreviewId,
  );
  const draftOtherSettingLinkEntries = resolveOtherSettingLinkDraftEntries(
    otherSettingLinkFlatEntries,
    draftOtherSettingReaderIds,
  );
  const draftOtherSettingLinkWordCount = draftOtherSettingLinkEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const previewOtherSettingReaderEntry = (entryId: string) => {
    const entry = otherSettingLinkFlatEntries.find((item) => item.id === entryId);
    if (entry) setOtherSettingReaderTabId(entry.tabId);
    setOtherSettingReaderPreviewId(entryId);
  };
  registerWorkbenchLibraryPhaseActions(settingTypeOptionsRef, {
    activeOtherSettingLinkEntries,
    openClearSettingsConfirm,
    otherSettingLinkFlatEntries,
    otherSettingLinkTabs,
    roleEntries,
    roleTypeOptions,
    selectedOtherSettingLinkTab,
  });
  const otherSettingReaderModal = (
    <OtherSettingReaderModal
      isOpen={isOtherSettingReaderOpen}
      tabs={otherSettingLinkTabs}
      selectedTab={selectedOtherSettingLinkTab}
      visibleGroups={visibleOtherSettingGroups}
      selectedEntry={selectedOtherSettingLinkEntry}
      draftIds={draftOtherSettingReaderIds}
      draftEntries={draftOtherSettingLinkEntries}
      draftWordCount={draftOtherSettingLinkWordCount}
      query={otherSettingReaderQuery}
      onClose={closeOtherSettingReader}
      onSelectTab={(tab) => {
        setOtherSettingReaderTabId(tab.id);
        const firstEntry = tab.groups.flatMap((group) => group.entries)[0];
        if (firstEntry) setOtherSettingReaderPreviewId(firstEntry.id);
      }}
      onSelectAllCurrentTab={selectAllCurrentOtherSettingLinkTab}
      onQueryChange={setOtherSettingReaderQuery}
      onToggleGroupSelection={toggleVisibleOtherSettingLinkGroupSelection}
      onToggleEntry={toggleDraftOtherSettingReaderId}
      onPreviewEntry={previewOtherSettingReaderEntry}
      onClearDraft={() => setDraftOtherSettingReaderIds(new Set())}
      onConfirm={confirmOtherSettingReaderSelection}
    />
  );
  return {
    toggleRolePinned,
    roleEntries,
    roleTypeOptions,
    searchedRoles,
    groupedRoles,
    settingEntries,
    settingTypeOptions,
    settingImportFormatGuideTabs,
    otherSettingLinkTabs,
    otherSettingLinkFlatEntries,
    activeOtherSettingLinkEntries,
    deletableRoleEntries,
    deletableSettingEntries,
    selectedSettingClearDomain,
    deletableSettingEntriesForClear,
    deletableSettingTypes,
    clearSettingsTargetMeta,
    closeClearSettingsConfirm,
    openClearSettingsConfirm,
    confirmClearSettings,
    renderFieldSizeButton,
    openLibraryAiLog,
    renderLibraryAiLogButton,
    renderDetailOutlineFontSizeTool,
    getActiveLibraryFontConfig,
    renderActiveLibraryFontSizeTool,
    renderLibraryHeaderFontSizeTool,
    topTabs,
    renderTopTabs,
    libraryHeaderFontSizePortal,
    fieldSizeSettingsModal,
    categoryMenuClearCategoryTarget,
    categoryMenuClearEntryTarget,
    canDeleteCategoryFromMenu,
    canRenameCategoryFromMenu,
    categoryContextMenu,
    entryMenuTarget,
    entryMenuIsLockedDefaultSetting,
    entryMenuIsMaleProtagonist,
    entryMenuRoleType,
    entryMenuCopyDisabled,
    entryMenuCreateDisabled,
    entryMenuRenameDisabled,
    entryMenuDeleteDisabled,
    entryMenuMoveDisabled,
    entryMenuMoveOptions,
    entryContextMenu,
    deleteConfirmDialog,
    entryRenameDialog,
    currentClearSettingsMeta,
    clearSettingsConfirmDialog,
    promptDisableContextMenu,
    selectedOtherSettingLinkTab,
    visibleOtherSettingGroups,
    selectedOtherSettingLinkEntry,
    draftOtherSettingLinkEntries,
    draftOtherSettingLinkWordCount,
    previewOtherSettingReaderEntry,
    otherSettingReaderModal,
  };
}
