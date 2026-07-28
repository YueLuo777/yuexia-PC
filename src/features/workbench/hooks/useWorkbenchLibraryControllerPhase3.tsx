/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import { getWorkbenchLibraryPhaseActions } from './workbenchLibraryPhaseActionsBridge';
import { filterStandardGenerationDuplicateEntries, takeCanonicalImportedSettingEntry } from '../components/workbenchSmartImport';
export function useWorkbenchLibraryControllerPhase3(scope: Record<string, any>) {
  const phaseActionsRef = { current: getWorkbenchLibraryPhaseActions(scope.settingTypeOptionsRef) };
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
  } = scope;
  const confirmSettingCreate = () => {
    if (!settingCreateDialog) return;
    const createTitle = settingCreateDraft.trim();
    if (!createTitle) return;
    const creatingOutlineCharacter =
      settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
    if (settingCreateDialog === 'category') {
      if (creatingOutlineCharacter) {
        phaseActionsRef.current.addRoleTypeByName?.(createTitle);
        setSettingCreateDraft('');
        setSettingCreateTypeDraft('');
        setSettingCreateDialog(null);
        setSettingCreateContextKind(null);
        return;
      }
      addSettingTypeByName(createTitle);
      setSettingCreateDraft('');
      setSettingCreateTypeDraft('');
      setSettingCreateDialog(null);
      setSettingCreateContextKind(null);
      return;
    }
    const selectedCreateType = getValidSettingCreateType();
    if (creatingOutlineCharacter) {
      phaseActionsRef.current.addRole?.(selectedCreateType, { switchToRoleTab: false, title: createTitle });
      setSettingCreateDraft('');
      setSettingCreateTypeDraft('');
      setSettingCreateDialog(null);
      setSettingCreateContextKind(null);
      return;
    }
    addSetting(activeTab, createTitle, selectedCreateType);
    setSettingCreateDraft('');
    setSettingCreateTypeDraft('');
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  };
  const openSettingCreateDialog = (kind: 'category' | 'setting') => {
    setSettingCreateDraft('');
    setSettingCreateTypeDraft(kind === 'setting' ? getSelectedEntrySettingCreateType() : '');
    setSettingCreateContextKind(null);
    setSettingCreateDialog(kind);
  };
  const smartImportSettings = (options: { force?: boolean; allowedEntryIds?: string[] } = {}) => {
    if (!options.force && activeTabConfig.smartImportLocked !== false) return false;
    const allowedEntryIds = options.allowedEntryIds ? new Set(options.allowedEntryIds) : undefined;
    const sourceText = stripAiThinkingBlock(
      getLatestUsefulAiText(activeTab === SETTING_TAB ? aiOutput : aiResult || aiOutput),
    );
    const taggedSegments = createTaggedSettingSegments(sourceText);
    const markdownSegments = createMarkdownSettingSegments(sourceText);
    const resolvedSettingTypes = new Set(settingTypeOptionsRef.current);
    const hasTaggedSegments = taggedSegments.settingSegments.length > 0 || taggedSegments.roleSegments.length > 0;
    const segments = hasTaggedSegments
      ? taggedSegments.settingSegments
      : markdownSegments.length > 0
        ? markdownSegments
        : createSmartSettingSegments(sourceText);
    const roleSegments = hasTaggedSegments ? taggedSegments.roleSegments : [];
    if (segments.length === 0 && roleSegments.length === 0) return false;
    const remainingEntries = [...entries];
    const importedEntries: WorkbenchLibraryEntry[] = [];
    const importedRoleEntries: WorkbenchLibraryEntry[] = [];
    const importedCustomTypes = new Set<string>();
    const importedSettingTypes = new Set<string>();
    const importedRoleTypes = new Set<string>();
    segments.forEach((segment) => {
      const type = normalizeSettingType(normalizeImportedSettingKey(segment.type));
      const titleKey = normalizeImportedSettingKey(segment.title);
      const typeKey = normalizeImportedSettingKey(type);
      const body = normalizeImportedSettingBody(segment.body, segment.title);
      if (!titleKey || !body) return;
      const existingEntry = takeCanonicalImportedSettingEntry(remainingEntries, titleKey, typeKey, allowedEntryIds);
      if (!existingEntry && allowedEntryIds) return;
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE) importedSettingTypes.add(type);
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !resolvedSettingTypes.has(type)) importedCustomTypes.add(type);
      if (existingEntry) {
        const existingSetting = parseSettingContent(existingEntry.content);
        importedEntries.push({
          ...existingEntry,
          content:
            normalizeImportedSettingBody(existingSetting.body) === body
              ? existingEntry.content
              : stringifySettingContent({ ...existingSetting, type, body }),
          updatedAt:
            normalizeImportedSettingBody(existingSetting.body) === body
              ? existingEntry.updatedAt
              : new Date().toLocaleString('zh-CN'),
        });
        return;
      }
      importedEntries.push({
        ...createWorkbenchLibraryEntry(SETTING_TAB, titleKey),
        content: stringifySettingContent({ type, body }),
      });
    });
    roleSegments.forEach((segment) => {
      const sections = parseSectionedSettingBody(segment.body);
      const importedType = getImportedRoleSection(sections, ['身份定位', '角色定位', '人物定位', '身份', '类型']);
      const shouldMatchMaleProtagonist = isMaleProtagonistRoleType(importedType) || /男主角|主角/.test(segment.title);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== ROLE_TAB || (allowedEntryIds && !allowedEntryIds.has(entry.id))) return false;
        const role = parseRoleContent(entry.content);
        const importedTitle = buildImportedRoleEntryTitle(segment, shouldMatchMaleProtagonist ? entry.title : '');
        return (
          normalizeImportedSettingKey(entry.title) === normalizeImportedSettingKey(importedTitle) ||
          (shouldMatchMaleProtagonist && isMaleProtagonistRoleType(role.type))
        );
      });

      if (existingIndex >= 0) {
        const [existingEntry] = remainingEntries.splice(existingIndex, 1);
        const existingRole = parseRoleContent(existingEntry.content);
        const nextTitle = allowedEntryIds ? existingEntry.title : buildImportedRoleEntryTitle(segment, existingEntry.title);
        const nextRole = createImportedRoleContent(segment, existingRole);
        importedRoleTypes.add(nextRole.type);
        importedRoleEntries.push({
          ...existingEntry,
          title: nextTitle,
          content: stringifyRoleContent(nextRole),
          updatedAt: new Date().toLocaleString('zh-CN'),
        });
        return;
      }

      if (allowedEntryIds) return;
      const nextTitle = buildImportedRoleEntryTitle(segment);
      const nextRole = createImportedRoleContent(segment);
      importedRoleTypes.add(nextRole.type);
      importedRoleEntries.push({
        ...createWorkbenchLibraryEntry(ROLE_TAB, nextTitle),
        content: stringifyRoleContent(nextRole),
      });
    });
    if (importedEntries.length === 0 && importedRoleEntries.length === 0) return false;
    persist([...importedEntries, ...importedRoleEntries, ...filterStandardGenerationDuplicateEntries(remainingEntries, entries, allowedEntryIds)]);
    if (importedCustomTypes.size > 0) {
      setCustomSettingTypes((prev) => {
        const next = Array.from(new Set([...prev, ...importedCustomTypes]));
        localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    }
    if (importedSettingTypes.size > 0) {
      setHiddenSettingTypes((prev) => {
        const next = prev.filter((type) => !importedSettingTypes.has(type));
        if (next.length !== prev.length) {
          localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(next));
        }
        return next;
      });
    }
    updateActiveTabConfig({ smartImportLocked: true });
    if (importedRoleEntries.length > 0) updateTabConfig(ROLE_TAB, { smartImportLocked: true });
    setRememberedActiveTab(importedEntries.length > 0 ? SETTING_TAB : ROLE_TAB);
    if (importedEntries.length > 0) setSelectedIdForTab(SETTING_TAB, importedEntries[0]?.id ?? null);
    if (importedRoleEntries.length > 0) setSelectedIdForTab(ROLE_TAB, importedRoleEntries[0]?.id ?? null);
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      segments.forEach((segment) => next.add(normalizeSettingType(normalizeImportedSettingKey(segment.type))));
      return next;
    });
    if (importedRoleTypes.size > 0) {
      setExpandedRoleTypes((prev) => new Set([...prev, ...importedRoleTypes]));
    }
    return true;
  };
  const isSettingTypeInActiveClearDomain = (type: string) => {
    const domain = getSelectedSettingWorkspaceDomain();
    const typeDomain = getSettingTypeWorkspaceDomain(type);
    return domain ? typeDomain === domain : !typeDomain;
  };
  const clearSettingCategories = () => {
    const domain = getSelectedSettingWorkspaceDomain();
    const shouldClearType = (type: string) =>
      type !== UNCATEGORIZED_TYPE &&
      !DEFAULT_SETTING_TYPES.includes(type) &&
      (domain ? getSettingTypeWorkspaceDomain(type) === domain : !getSettingTypeWorkspaceDomain(type));
    const nextCustomTypes = customSettingTypes.filter((type) => !shouldClearType(type));
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const nextCustomTypeDomains = Object.fromEntries(
      Object.entries(customSettingTypeDomains).filter(([type]) => !shouldClearType(type)),
    );
    setCustomSettingTypeDomains(nextCustomTypeDomains);
    localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    const nextHiddenTypes = hiddenSettingTypes.filter((type) => !isSettingTypeInActiveClearDomain(type));
    setHiddenSettingTypes(nextHiddenTypes);
    localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
    localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
    const nextExpandedTypes = domain
      ? (SETTING_WORKSPACE_DOMAIN_GROUPS[domain as keyof typeof SETTING_WORKSPACE_DOMAIN_GROUPS] ?? [])
      : DEFAULT_WORK_SETTING_TYPES;
    setExpandedSettingTypes(new Set(nextExpandedTypes));
    const nextEntries = entries.filter((entry) => {
      if (entry.tab !== SETTING_TAB) return true;
      if (isLockedDefaultSettingEntry(entry)) return true;
      return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);
    });
    persist(nextEntries);
    if (
      selectedEntry?.tab === SETTING_TAB &&
      !isLockedDefaultSettingEntry(selectedEntry) &&
      isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)
    ) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
    if (
      activeTab === SETTING_TAB &&
      outlineSettingScope !== 'character' &&
      selectedEntry?.tab === SETTING_TAB &&
      !isLockedDefaultSettingEntry(selectedEntry) &&
      isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)
    ) {
      setSelectedId(null);
    }
  };
  const clearSettingEntries = () => {
    const nextEntries = entries.filter((entry) => {
      if (entry.tab !== SETTING_TAB) return true;
      if (isLockedDefaultSettingEntry(entry)) return true;
      return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);
    });
    persist(nextEntries);
    if (
      selectedEntry?.tab === SETTING_TAB &&
      !isLockedDefaultSettingEntry(selectedEntry) &&
      isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)
    ) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
    if (
      activeTab === SETTING_TAB &&
      outlineSettingScope !== 'character' &&
      selectedEntry?.tab === SETTING_TAB &&
      !isLockedDefaultSettingEntry(selectedEntry) &&
      isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)
    ) {
      setSelectedId(null);
    }
  };
  const clearRoleCategories = () => {
    setCustomRoleTypes([]);
    localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify([]));
    setHiddenRoleTypes([]);
    localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify([]));
    localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
    setExpandedRoleTypes(new Set(DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE)));
    persist(
      entries.filter((entry) => {
        if (entry.tab !== ROLE_TAB) return true;
        return isDefaultWorkbenchRoleType(parseRoleContent(entry.content).type);
      }),
    );
    if (selectedEntry?.tab === ROLE_TAB && !isDefaultWorkbenchRoleType(selectedRole?.type))
      setSelectedIdForTab(ROLE_TAB, null);
    if (
      (activeTab === ROLE_TAB || (activeTab === SETTING_TAB && outlineSettingScope === 'character')) &&
      selectedEntry?.tab === ROLE_TAB &&
      !isDefaultWorkbenchRoleType(selectedRole?.type)
    ) {
      setSelectedId(null);
    }
  };
  const clearRoleEntries = () => {
    persist(
      entries.filter(
        (entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type),
      ),
    );
    if (selectedEntry?.tab === ROLE_TAB && !selectedRoleIsMaleProtagonist) setSelectedIdForTab(ROLE_TAB, null);
    if (
      (activeTab === ROLE_TAB || (activeTab === SETTING_TAB && outlineSettingScope === 'character')) &&
      selectedEntry?.tab === ROLE_TAB &&
      !selectedRoleIsMaleProtagonist
    ) {
      setSelectedId(null);
    }
  };
  const getNextBrainstormTitle = () => {
    const maxNumber = entries
      .filter((entry) => entry.tab === BRAINSTORM_TAB)
      .map((entry) => entry.title.match(/^脑洞(\d+)$/)?.[1])
      .filter((value): value is string => Boolean(value))
      .reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    return `脑洞${maxNumber + 1}`;
  };
  const getNextBrainstormTitles = (count: number) => {
    const maxNumber = entries
      .filter((entry) => entry.tab === BRAINSTORM_TAB)
      .map((entry) => entry.title.match(/^脑洞(\d+)$/)?.[1])
      .filter((value): value is string => Boolean(value))
      .reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);
  };
  const getCurrentBrainstormOutputPreviews = (selectedOnly = false) => {
    const count =
      activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount);
    const body = getLatestUsefulAiText(aiResult || aiOutput);
    const splitParts = splitBrainstormGeneratedText(body, count);
    const drafts = activeBrainstormAiSession?.previewDrafts;
    const titles = activeBrainstormAiSession?.previewTitles;
    const previews = Array.from({ length: count }, (_, index) => ({
      title: titles?.[index]?.trim() || getTemporaryBrainstormTitle(index),
      body: drafts?.[index] ?? splitParts[index] ?? '',
      index,
    })).filter((item) => item.body.trim());
    if (!selectedOnly) return previews;
    const selectedIndexes = new Set(
      getSelectedBrainstormPreviewIndexes(
        Array.from({ length: count }, (_, index) => drafts?.[index] ?? splitParts[index] ?? ''),
        activeBrainstormAiSession?.previewSelectedIndexes,
      ),
    );
    return previews.filter((item) => selectedIndexes.has(item.index));
  };
  const saveBrainstormOutputAsNew = () => {
    const previews = getCurrentBrainstormOutputPreviews(true);
    if (previews.length === 0) return;
    const nextTitles = getNextBrainstormTitles(previews.length);
    const nextEntries = previews.map((preview, index) => ({
      ...createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle()),
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body: preview.body }),
    }));
    persist([...nextEntries, ...entries]);
    setRememberedActiveTab(BRAINSTORM_TAB);
    setSelectedIdForTab(BRAINSTORM_TAB, nextEntries[0].id);
    setExpandedSettingTypes((prev) => new Set(prev).add(BRAINSTORM_TYPE));
  };
  const saveBrainstormOutput = (targetId?: string | null) => {
    const selectedPreviews = getCurrentBrainstormOutputPreviews(true);
    if (selectedPreviews.length !== 1) return;
    const body = selectedPreviews[0]?.body.trim() ?? '';
    if (!body || !targetId) return;
    phaseActionsRef.current.updateEntry?.(targetId, {
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body }),
    });
  };
  const openBrainstormPromptEdit = (prompt: PromptItem) => {
    setEditingBrainstormPrompt(prompt);
    setIsCreatingBrainstormPrompt(false);
    setBrainstormPromptDraft({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
    });
  };
  const openBrainstormPromptCreate = () => {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(true);
    setBrainstormPromptDraft({
      name: '',
      description: '',
      content: '',
    });
  };
  function closeBrainstormPromptEdit() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
  }
  function closeBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
    setIsBrainstormPromptManagerOpen(false);
  }
  useTopModalEscape(
    isBrainstormPromptManagerOpen && !editingBrainstormPrompt && !isCreatingBrainstormPrompt,
    closeBrainstormPromptManager,
  );
  useTopModalEscape(Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt), closeBrainstormPromptEdit);
  function closeBrainstormReader() {
    setSelectedBrainstormReaderId(null);
    setIsBrainstormReaderOpen(false);
  }
  useTopModalEscape(isBrainstormReaderOpen, closeBrainstormReader);
  function confirmBrainstormReaderSelection() {
    const selectedEntry = entries.find(
      (entry) => entry.tab === BRAINSTORM_TAB && entry.id === selectedBrainstormReaderId,
    );
    if (!selectedEntry) return;
    const selectedText = getBrainstormEntryBody(selectedEntry);
    updateActiveTabConfig({
      associationSessionId: getWorkbenchAssociationRuntimeId(),
      loadedBrainstormId: selectedEntry.id,
      loadedBrainstormTitle: selectedEntry.title,
      loadedBrainstormText: selectedText,
      linkedOtherSettingIds: [],
      settingLinkSource: 'brainstorm',
      promptDisabled: false,
    });
    closeBrainstormReader();
  }
  function openOtherSettingReader() {
    const linkedIds =
      getActiveSettingLinkSource() === 'other'
        ? normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds)
        : [];
    setDraftOtherSettingReaderIds(new Set(linkedIds));
    setOtherSettingReaderQuery('');
    const preferredTab =
      (phaseActionsRef.current.otherSettingLinkTabs ?? []).find(
        (tab) => tab.id === otherSettingReaderTabId && tab.groups.some((group) => group.entries.length > 0),
      ) ??
      (phaseActionsRef.current.otherSettingLinkTabs ?? []).find((tab) =>
        tab.groups.some((group) => group.entries.length > 0),
      ) ??
      phaseActionsRef.current.otherSettingLinkTabs?.[0];
    if (preferredTab) setOtherSettingReaderTabId(preferredTab.id);
    const firstEntry =
      preferredTab?.groups.flatMap((group) => group.entries)[0] ??
      phaseActionsRef.current.otherSettingLinkFlatEntries?.[0];
    setOtherSettingReaderPreviewId(linkedIds[0] ?? firstEntry?.id ?? '');
    setIsOtherSettingReaderOpen(true);
  }
  function closeOtherSettingReader() {
    setOtherSettingReaderQuery('');
    setIsOtherSettingReaderOpen(false);
  }
  useTopModalEscape(isOtherSettingReaderOpen, closeOtherSettingReader);
  function toggleDraftOtherSettingReaderId(id: string) {
    setDraftOtherSettingReaderIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAllCurrentOtherSettingLinkTab() {
    const ids = (phaseActionsRef.current.selectedOtherSettingLinkTab?.groups ?? [])
      .flatMap((group) => group.entries)
      .map((entry) => entry.id);
    setDraftOtherSettingReaderIds(new Set(ids));
  }
  function toggleVisibleOtherSettingLinkGroupSelection(items: OtherSettingLinkEntry[]) {
    setDraftOtherSettingReaderIds((current) => {
      const next = new Set(current);
      const allSelected = items.every((item) => next.has(item.id));
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }
  function confirmOtherSettingReaderSelection() {
    const selectedIds = Array.from(draftOtherSettingReaderIds).filter((id) =>
      (phaseActionsRef.current.otherSettingLinkFlatEntries ?? []).some((entry) => entry.id === id),
    );
    updateActiveTabConfig({
      associationSessionId: selectedIds.length > 0 ? getWorkbenchAssociationRuntimeId() : null,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
      linkedOtherSettingIds: selectedIds,
      settingLinkSource: selectedIds.length > 0 ? 'other' : null,
      promptDisabled: false,
    });
    closeOtherSettingReader();
  }
  function clearActiveLinkedOtherSettings() {
    updateActiveTabConfig({
      associationSessionId: null,
      linkedOtherSettingIds: [],
      settingLinkSource: null,
      promptDisabled: false,
    });
    setDraftOtherSettingReaderIds(new Set());
  }
  function clearActiveLinkedBrainstorm() {
    updateActiveTabConfig({
      associationSessionId: null,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
      linkedOtherSettingIds: [],
      settingLinkSource: null,
      promptDisabled: false,
    });
    setSelectedBrainstormReaderId(null);
  }
  const getActiveLinkedBrainstormSnapshot = () => {
    if (activeTab !== SETTING_TAB) return { title: '', text: '' };
    const linkedId = activeTabConfig.loadedBrainstormId;
    const linkedEntry = linkedId
      ? entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === linkedId)
      : null;
    if (linkedEntry) {
      return {
        title: linkedEntry.title,
        text: getBrainstormEntryBody(linkedEntry),
      };
    }
    return {
      title: activeTabConfig.loadedBrainstormTitle ?? '',
      text: activeTabConfig.loadedBrainstormText ?? '',
    };
  };
  const getActiveSettingLinkSource = (): SettingLinkSource => {
    if (activeTab !== SETTING_TAB) return null;
    if (!isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)) return null;
    const linkedOtherSettingIds = normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds);
    if (activeTabConfig.settingLinkSource === 'other') {
      return linkedOtherSettingIds.length > 0 ? 'other' : null;
    }
    if (activeTabConfig.settingLinkSource === 'current' || activeTabConfig.settingLinkSource === 'brainstorm') {
      return activeTabConfig.settingLinkSource;
    }
    if (linkedOtherSettingIds.length > 0) return 'other';
    return activeTabConfig.loadedBrainstormId || activeTabConfig.loadedBrainstormText?.trim() ? 'brainstorm' : null;
  };
  return {
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
  };
}
