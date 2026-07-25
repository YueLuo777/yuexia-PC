/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import {
  getWorkbenchLibraryPhaseActions,
  registerWorkbenchLibraryPhaseActions,
} from './workbenchLibraryPhaseActionsBridge';
export function useWorkbenchLibraryControllerPhase5(scope: Record<string, any>) {
  const phaseActionsRef = { current: getWorkbenchLibraryPhaseActions(scope.settingTypeOptionsRef) };
  const getRoleEntries = () => phaseActionsRef.current.roleEntries ?? [];
  const getRoleTypeOptions = () => phaseActionsRef.current.roleTypeOptions ?? [];
  const openClearSettingsConfirm = (...args: unknown[]) => phaseActionsRef.current.openClearSettingsConfirm?.(...args);
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
    getDefaultWorkbenchLibraryEntryTitle,
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
  } = scope;
  const updateEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    persist(
      entries.map((entry) =>
        entry.id === id
          ? (() => {
              const nextUpdates = { ...updates };
              if (nextUpdates.title !== undefined && isLockedDefaultSettingEntry(entry)) {
                delete nextUpdates.title;
              }
              if (nextUpdates.title !== undefined && nextUpdates.content === undefined && isSettingLikeTab(entry.tab)) {
                const setting = parseSettingContent(entry.content);
                const fieldSet = getStructuredSettingFieldSet(entry, setting);
                if (fieldSet && setting.structuredFieldSetId !== fieldSet.id) {
                  nextUpdates.content = stringifySettingContent({ ...setting, structuredFieldSetId: fieldSet.id });
                }
              }
              if (nextUpdates.content !== undefined && isLockedDefaultSettingEntry(entry)) {
                const currentSetting = parseSettingContent(entry.content);
                const nextSetting = parseSettingContent(nextUpdates.content);
                nextUpdates.content = stringifySettingContent({
                  ...nextSetting,
                  type: currentSetting.type,
                  lockedDefaultEntryId:
                    currentSetting.lockedDefaultEntryId ??
                    getDefaultWorkSettingEntryId(currentSetting.type, entry.title),
                });
              }
              return { ...entry, ...nextUpdates, updatedAt: new Date().toLocaleString('zh-CN') };
            })()
          : entry,
      ),
    );
  };
  registerWorkbenchLibraryPhaseActions(scope.settingTypeOptionsRef, { updateEntry });
  const createEditableSettingEntry = (updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    const title = updates.title?.trim() || getDefaultWorkbenchLibraryEntryTitle(activeTab);
    const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();
    const defaultType =
      activeTab === SETTING_TAB ? (selectedSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE) : UNCATEGORIZED_TYPE;
    const content = updates.content ?? stringifySettingContent({ type: defaultType, body: '' });
    const entry = {
      ...createWorkbenchLibraryEntry(activeTab, title, content),
      content,
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(activeTab);
    setSelectedIdForTab(activeTab, entry.id);
    if (isSettingLikeTab(activeTab)) {
      setExpandedSettingTypes((prev) => new Set(prev).add(parseSettingContent(content).type || UNCATEGORIZED_TYPE));
    }
    return entry;
  };
  const updateRole = (updates: Partial<RoleContent>) => {
    if (!selectedEntry || !selectedRole) return;
    const normalizedUpdates = {
      ...updates,
      ...(updates.type ? { type: normalizeWorkbenchRoleType(updates.type) } : {}),
    };
    if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(selectedRole.type, normalizedUpdates.type))
      return;
    const nextType = normalizeWorkbenchRoleType(normalizedUpdates.type ?? selectedRole.type);
    if (isMaleProtagonistRoleType(nextType)) {
      normalizedUpdates.lifeStatus = '存活';
    }
    if (
      normalizedUpdates.type &&
      !canCreateWorkbenchRoleInType(
        getRoleEntries()
          .filter((entry) => entry.id !== selectedEntry.id)
          .map((entry) => parseRoleContent(entry.content).type),
        normalizedUpdates.type,
      )
    )
      return;
    const changed = Object.entries(normalizedUpdates).some(
      ([key, value]) => selectedRole[key as keyof RoleContent] !== value,
    );
    if (!changed) return;
    const history = appendRoleHistory(selectedRole.history, createRoleHistoryVersion(selectedEntry, selectedRole));
    updateEntry(selectedEntry.id, {
      content: stringifyRoleContent({ ...selectedRole, ...normalizedUpdates, history }),
    });
  };
  const updateSelectedRoleTitle = (title: string) => {
    if (!selectedEntry || !selectedRole || selectedEntry.title === title) return;
    const history = appendRoleHistory(selectedRole.history, createRoleHistoryVersion(selectedEntry, selectedRole));
    updateEntry(selectedEntry.id, {
      title,
      content: stringifyRoleContent({ ...selectedRole, history }),
    });
  };
  const expandLibraryTargetType = (tab: string, type: string) => {
    if (tab === ROLE_TAB) setExpandedRoleTypes((prev) => new Set(prev).add(type));
    else setExpandedSettingTypes((prev) => new Set(prev).add(type));
  };
  const moveLibraryEntryToType = (entryId: string, targetTab: string, targetType: string) => {
    const result = moveLibraryEntryToTypeInList(entries, entryId, targetTab, targetType);
    if (!result) return;
    persist(result.entries);
    expandLibraryTargetType(result.normalizedTargetTab, targetType);
  };
  const moveLibraryEntryBefore = (entryId: string, targetEntryId: string, targetTab: string, targetType: string) => {
    const result = moveLibraryEntryBeforeInList(entries, entryId, targetEntryId, targetTab, targetType);
    if (!result) return;
    persist(result.entries);
    expandLibraryTargetType(result.normalizedTargetTab, targetType);
  };
  const getLibraryEntryTargetIdAtPreviewIndex = (targetTab: string, targetType: string, previewIndex: number) =>
    getLibraryEntryTargetIdAtPreviewIndexFromList(entries, targetTab, targetType, previewIndex);
  const {
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
  } = useWorkbenchLibraryDrag({
    entries,
    moveLibraryEntryToType,
    moveLibraryEntryBefore,
    getLibraryEntryTargetIdAtPreviewIndex,
  });
  const getPreviewedLibraryGroupEntries = (groupEntries: WorkbenchLibraryEntry[], tab: string, type: string) =>
    getPreviewedLibraryGroupEntriesFromList(entries, groupEntries, tab, type, libraryEntryDropPreview);
  const deleteEntry = (id: string) => {
    const target = entries.find((entry) => entry.id === id);
    if (target && isLockedDefaultSettingEntry(target)) return;
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) return;
    if (target?.tab === BRAINSTORM_TAB) {
      persist(entries.filter((entry) => entry.id !== id));
      persistBrainstormRecycle([
        { ...target, deletedAt: new Date().toISOString(), updatedAt: new Date().toLocaleString('zh-CN') },
        ...brainstormRecycleEntries.filter((entry) => entry.id !== id),
      ]);
      if (selectedId === id) setSelectedId(null);
      return;
    }
    persist(entries.filter((entry) => entry.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const restoreBrainstormEntry = (id: string) => {
    const target = brainstormRecycleEntries.find((entry) => entry.id === id);
    if (!target) return;
    const { deletedAt: _deletedAt, ...restored } = target;
    const brainstormSerialNumberIsUsed = entries.some(
      (entry) => entry.tab === BRAINSTORM_TAB && entry.brainstormSerialNumber === restored.brainstormSerialNumber,
    );
    const nextBrainstormSerialNumber =
      entries
        .filter((entry) => entry.tab === BRAINSTORM_TAB)
        .reduce((max, entry) => Math.max(max, entry.brainstormSerialNumber ?? 0), 0) + 1;
    const nextEntry = {
      ...restored,
      tab: BRAINSTORM_TAB,
      brainstormSerialNumber: brainstormSerialNumberIsUsed
        ? nextBrainstormSerialNumber
        : restored.brainstormSerialNumber,
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    persistBrainstormRecycle(brainstormRecycleEntries.filter((entry) => entry.id !== id));
    persist([nextEntry, ...entries.filter((entry) => entry.id !== id)]);
    setRememberedActiveTab(BRAINSTORM_TAB);
    setSelectedIdForTab(BRAINSTORM_TAB, nextEntry.id);
    setExpandedSettingTypes((prev) => new Set(prev).add(BRAINSTORM_TYPE));
  };
  const permanentlyDeleteBrainstormEntry = (id: string) => {
    const target = brainstormRecycleEntries.find((entry) => entry.id === id);
    if (!target) return;
    persistBrainstormRecycle(brainstormRecycleEntries.filter((entry) => entry.id !== id));
  };
  const clearBrainstormRecycle = () => {
    if (brainstormRecycleEntries.length === 0) return;
    persistBrainstormRecycle([]);
    setIsClearBrainstormRecycleConfirmOpen(false);
  };
  const confirmDeleteEntry = (entry: Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'>) => {
    const target = entries.find((item) => item.id === entry.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      setEntryMenu(null);
      return;
    }
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) {
      setEntryMenu(null);
      return;
    }
    setEntryMenu(null);
    setPendingEntryDelete(entry);
  };
  const handleConfirmDeleteEntry = () => {
    if (!pendingEntryDelete) return;
    const target = entries.find((entry) => entry.id === pendingEntryDelete.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      setPendingEntryDelete(null);
      return;
    }
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) {
      setPendingEntryDelete(null);
      return;
    }
    deleteEntry(pendingEntryDelete.id);
    if (roleHistoryEntryId === pendingEntryDelete.id) setRoleHistoryEntryId(null);
    setPendingEntryDelete(null);
  };
  const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>, kind: 'role' | 'setting', type: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (type === UNCATEGORIZED_TYPE) return;
    setEntryMenu(null);
    setEntryMoveMenuOpen(false);
    const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_CATEGORY_CONTEXT_MENU_SIZE);
    setCategoryMenu({ kind, type, x: left, y: top });
  };
  const openEntryMenu = (event: MouseEvent<HTMLElement>, entry: WorkbenchLibraryEntry) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryMenu(null);
    setEntryMoveMenuOpen(false);
    const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_ENTRY_CONTEXT_MENU_SIZE);
    setEntryMenu({
      entryId: entry.id,
      title: entry.title,
      tab: entry.tab,
      roleType: entry.tab === ROLE_TAB ? parseRoleContent(entry.content).type : undefined,
      pinnedAt: entry.pinnedAt,
      x: left,
      y: top,
    });
  };
  const deleteRoleType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE || isDefaultWorkbenchRoleType(type)) return;
    const nextCustomTypes = customRoleTypes.filter((item) => item !== type);
    setCustomRoleTypes(nextCustomTypes);
    localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    if (DEFAULT_ROLE_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenRoleTypes, type]));
      setHiddenRoleTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
      localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
    }
    setExpandedRoleTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE);
      return next;
    });
    setExpandedSettingTypes((prev) => new Set(prev).add(DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE));
    persist(
      entries.filter((entry) => {
        if (entry.tab !== ROLE_TAB) return true;
        const role = parseRoleContent(entry.content);
        return role.type !== type;
      }),
    );
    if (selectedEntry?.tab === ROLE_TAB && selectedRole?.type === type) setSelectedIdForTab(ROLE_TAB, null);
  };
  const deleteSettingType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE) return;
    if (DEFAULT_SETTING_TYPES.includes(type)) return;
    const nextCustomTypes = customSettingTypes.filter((item) => item !== type);
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const { [type]: _deletedSettingTypeDomain, ...nextCustomTypeDomains } = customSettingTypeDomains;
    setCustomSettingTypeDomains(nextCustomTypeDomains);
    localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    if (DEFAULT_SETTING_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenSettingTypes, type]));
      setHiddenSettingTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
      localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
    }
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(UNCATEGORIZED_TYPE);
      return next;
    });
    persist(
      entries.filter((entry) => {
        if (!isSettingLikeTab(entry.tab)) return true;
        const setting = parseSettingContent(entry.content);
        return setting.type !== type;
      }),
    );
    if (selectedEntry?.tab === SETTING_TAB && parseSettingContent(selectedEntry.content).type === type) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
  };
  const deleteCategoryFromMenu = () => {
    if (!categoryMenu) return;
    if (categoryMenu.kind === 'role') deleteRoleType(categoryMenu.type);
    else deleteSettingType(categoryMenu.type);
    setCategoryMenu(null);
  };
  const openClearSettingsConfirmFromMenu = (target: ClearSettingsTarget) => {
    setCategoryMenu(null);
    openClearSettingsConfirm(target);
  };
  const createEntryFromCategoryMenu = () => {
    if (!categoryMenu) return;
    if (categoryMenu.kind === 'role') {
      addRole(categoryMenu.type);
    } else {
      addSetting(SETTING_TAB, '', categoryMenu.type);
    }
    setCategoryMenu(null);
  };
  const openSiblingCategoryCreateFromMenu = () => {
    if (!categoryMenu) return;
    setSettingCreateDraft('');
    setSettingCreateTypeDraft('');
    setSettingCreateContextKind(categoryMenu.kind);
    setSettingCreateDialog('category');
    setCategoryMenu(null);
  };
  const openCategoryRenameFromMenu = () => {
    if (!categoryMenu) return;
    setPendingCategoryRename({ kind: categoryMenu.kind, type: categoryMenu.type });
    setCategoryRenameDraft(categoryMenu.type);
    setCategoryMenu(null);
  };
  const closeCategoryRenameDialog = () => {
    setPendingCategoryRename(null);
    setCategoryRenameDraft('');
  };
  const confirmCategoryRename = () => {
    if (!pendingCategoryRename) return;
    const currentType = pendingCategoryRename.type;
    const nextType =
      pendingCategoryRename.kind === 'role'
        ? normalizeWorkbenchRoleType(categoryRenameDraft)
        : categoryRenameDraft.trim();
    if (!nextType || nextType === currentType || nextType === UNCATEGORIZED_TYPE) {
      closeCategoryRenameDialog();
      return;
    }
    if (pendingCategoryRename.kind === 'role') {
      if (isDefaultWorkbenchRoleType(currentType)) {
        closeCategoryRenameDialog();
        return;
      }
      if (getRoleTypeOptions().includes(nextType)) return;
      const nextCustomTypes = customRoleTypes.map((type) => (type === currentType ? nextType : type));
      setCustomRoleTypes(nextCustomTypes);
      localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
      setExpandedRoleTypes((prev) => {
        const next = new Set(prev);
        if (next.delete(currentType)) next.add(nextType);
        return next;
      });
      persist(
        entries.map((entry) => {
          if (entry.tab !== ROLE_TAB) return entry;
          const role = parseRoleContent(entry.content);
          if (role.type !== currentType) return entry;
          return {
            ...entry,
            content: stringifyRoleContent({
              ...role,
              type: nextType,
              history: appendRoleHistory(role.history, createRoleHistoryVersion(entry, role)),
            }),
            updatedAt: new Date().toLocaleString('zh-CN'),
          };
        }),
      );
      closeCategoryRenameDialog();
      return;
    }
    if (DEFAULT_SETTING_TYPES.includes(currentType)) {
      closeCategoryRenameDialog();
      return;
    }
    if (settingTypeOptionsRef.current.includes(nextType)) return;
    const nextCustomTypes = customSettingTypes.map((type) => (type === currentType ? nextType : type));
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const nextCustomTypeDomains = { ...customSettingTypeDomains };
    if (nextCustomTypeDomains[currentType]) {
      nextCustomTypeDomains[nextType] = nextCustomTypeDomains[currentType];
      delete nextCustomTypeDomains[currentType];
      setCustomSettingTypeDomains(nextCustomTypeDomains);
      localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    }
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      if (next.delete(currentType)) next.add(nextType);
      return next;
    });
    persist(
      entries.map((entry) => {
        if (!isSettingLikeTab(entry.tab)) return entry;
        const setting = parseSettingContent(entry.content);
        if (setting.type !== currentType) return entry;
        return {
          ...entry,
          content: stringifySettingContent({ ...setting, type: nextType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }),
    );
    closeCategoryRenameDialog();
  };
  const deleteEntryFromMenu = () => {
    if (!entryMenu) return;
    const targetEntry = entries.find((entry) => entry.id === entryMenu.entryId);
    if (targetEntry && isLockedDefaultSettingEntry(targetEntry)) return;
    if (entryMenu.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? '')) return;
    const target = { id: entryMenu.entryId, title: entryMenu.title, tab: entryMenu.tab };
    setEntryMenu(null);
    confirmDeleteEntry(target);
  };
  const renameEntryFromMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (target && isLockedDefaultSettingEntry(target)) {
      setEntryMenu(null);
      return;
    }
    setPendingEntryRename({ id: entryMenu.entryId, title: entryMenu.title, tab: entryMenu.tab });
    setEntryRenameDraft(entryMenu.title);
    setEntryMenu(null);
  };
  const createEntryFromEntryMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (!target) {
      setEntryMenu(null);
      return;
    }
    if (target.tab === ROLE_TAB) {
      const role = parseRoleContent(target.content);
      addRole(role.type);
    } else if (isSettingLikeTab(target.tab)) {
      const setting = parseSettingContent(target.content);
      addSetting(SETTING_TAB, '', setting.type);
    } else {
      addEntryToTab(target.tab, `新建${target.tab}`);
    }
    setEntryMenu(null);
  };
  const copyEntryFromMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (!target) return;
    if (target.tab === ROLE_TAB) {
      const role = parseRoleContent(target.content);
      if (
        !canCreateWorkbenchRoleInType(
          getRoleEntries().map((entry) => parseRoleContent(entry.content).type),
          role.type,
        )
      )
        return;
    }
    const copy = createWorkbenchLibraryEntry(target.tab, `${target.title} 副本`, target.content);
    persist([copy, ...entries]);
    setRememberedActiveTab(target.tab);
    setSelectedIdForTab(target.tab, copy.id);
    if (target.tab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(parseRoleContent(target.content).type));
    } else if (isSettingLikeTab(target.tab)) {
      setExpandedSettingTypes((prev) => new Set(prev).add(parseSettingContent(target.content).type));
    }
    setEntryMenu(null);
  };
  const moveEntryFromMenuToType = (targetType: string) => {
    if (!entryMenu) return;
    moveLibraryEntryToType(entryMenu.entryId, entryMenu.tab, targetType);
    setEntryMenu(null);
    setEntryMoveMenuOpen(false);
  };
  const closeEntryRenameDialog = () => {
    setPendingEntryRename(null);
    setEntryRenameDraft('');
  };
  const confirmEntryRename = () => {
    if (!pendingEntryRename) return;
    const target = entries.find((entry) => entry.id === pendingEntryRename.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      closeEntryRenameDialog();
      return;
    }
    const nextTitle = entryRenameDraft.trim();
    if (!nextTitle) return;
    persist(
      entries.map((entry) =>
        entry.id === pendingEntryRename.id
          ? { ...entry, title: nextTitle, updatedAt: new Date().toLocaleString('zh-CN') }
          : entry,
      ),
    );
    closeEntryRenameDialog();
  };
  const toggleEntryPinnedFromMenu = () => {
    if (!entryMenu || entryMenu.tab !== ROLE_TAB) return;
    if (!shouldShowRolePinAction(entryMenu.roleType)) {
      setEntryMenu(null);
      return;
    }
    const nextPinnedAt = entryMenu.pinnedAt ? undefined : Date.now();
    persist(
      entries.map((entry) =>
        entry.id === entryMenu.entryId
          ? { ...entry, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
          : entry,
      ),
    );
    setEntryMenu(null);
  };
  return {
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
  };
}
