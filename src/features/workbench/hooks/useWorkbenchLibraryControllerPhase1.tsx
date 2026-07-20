/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import { useWorkbenchLibraryControllerPhase1Actions } from './useWorkbenchLibraryControllerPhase1Actions';

export function useWorkbenchLibraryControllerPhase1(scope: Record<string, any>) {
  const {
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
  } = scope;
  const tabsSignature = tabs.map(normalizeTabName).join('\u001f');
  const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\u001f') : []), [tabsSignature]);
  const settingTypeOptionsRef = useRef<string[]>([]);
  const isSettingLibraryPanel = useMemo(
    () => normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)),
    [SETTING_LIBRARY_TABS, normalizedTabs],
  );
  const [entries, setEntries] = useState<WorkbenchLibraryEntry[]>(() =>
    readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs),
  );
  const [brainstormRecycleEntries, setBrainstormRecycleEntries] = useState<WorkbenchLibraryEntry[]>(() =>
    readBrainstormRecycleEntries(storageKey),
  );
  const [outlineEntries, setOutlineEntries] = useState<WorkbenchLibraryEntry[]>(() =>
    outlineStorageKey ? readNormalizedEntries(outlineStorageKey) : [],
  );
  const [activeTab, setActiveTab] = useState(() => readActiveTab(storageKey, normalizedTabs, defaultActiveTab));
  const [outlineSettingScope, setOutlineSettingScope] = useState<'work' | 'character'>('work');
  const [outlineSettingDomain, setOutlineSettingDomain] = useState('work');
  const settingLibraryMode = 'advanced';
  const [tabConfigs, setTabConfigs] = useState<LibraryTabConfigs>(() => readTabConfigs(storageKey));
  const activeTabConfig = tabConfigs[activeTab] ?? {};
  const [roleSearch, setRoleSearch] = useState('');
  const [customRoleTypes, setCustomRoleTypes] = useState<string[]>(() => readCustomRoleTypes(storageKey));
  const [hiddenRoleTypes, setHiddenRoleTypes] = useState<string[]>(() => readHiddenRoleTypes(storageKey));
  const [customSettingTypes, setCustomSettingTypes] = useState<string[]>(() => readCustomSettingTypes(storageKey));
  const [customSettingTypeDomains, setCustomSettingTypeDomains] = useState<Record<string, string>>(() =>
    readCustomSettingTypeDomains(storageKey),
  );
  const [hiddenSettingTypes, setHiddenSettingTypes] = useState<string[]>(() => readHiddenSettingTypes(storageKey));
  const [outlineStart, setOutlineStart] = useState('1');
  const [outlineEnd, setOutlineEnd] = useState('50');
  const [selectedOutlineChapterId, setSelectedOutlineChapterId] = useState<number | null>(() =>
    Number.isFinite(activeTabConfig.selectedOutlineChapterId)
      ? (activeTabConfig.selectedOutlineChapterId ?? null)
      : null,
  );
  const [selectedOutlineVolumeId, setSelectedOutlineVolumeId] = useState<number | null>(null);
  const [outlineSelectionType, setOutlineSelectionType] = useState<'chapter' | 'volume'>('chapter');
  const [outlinePreviewDraft, setOutlinePreviewDraftState] = useState('');
  const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement] = useState<{
    chapterSerialNumber: number;
    content: string;
    draft: string;
  } | null>(null);
  const [, forceOutlineSelectionRefresh] = useState(0);
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() =>
    readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes'),
  );
  const [showDetailOutlinePublished, setShowDetailOutlinePublished] = useState(false);
  const [manualDetailOutlinePublishedChapterIds, setManualDetailOutlinePublishedChapterIds] = useState<Set<number>>(
    () => readManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey),
  );
  const [detailOutlineChapterMenu, setDetailOutlineChapterMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    chapter: Chapter | null;
  }>({ visible: false, x: 0, y: 0, chapter: null });
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const fieldSizeSettingsDraggable = useDraggableModal('workbench_field_size_settings');
  const {
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
  } = useWorkbenchLibraryFieldSizes({ activeTab, fieldSizeOpenSignal, showInlineFieldSizeButton });
  const [settingLibraryLeftWidth, setSettingLibraryLeftWidth] = useState(() =>
    readSettingLibraryLeftWidth(storageKey, activeTab, scale),
  );
  const [settingLibraryRightWidth, setSettingLibraryRightWidth] = useState(() =>
    readSettingLibraryRightWidth(storageKey, activeTab),
  );
  const [brainstormPreviewWidth, setBrainstormPreviewWidth] = useState(() =>
    readBrainstormPreviewWidth(storageKey, activeTab),
  );
  const [expandedRoleTypes, setExpandedRoleTypes] = useState<Set<string>>(() =>
    readExpandedStringSet(storageKey, ROLE_TAB, 'role_types'),
  );
  const [expandedSettingTypes, setExpandedSettingTypes] = useState<Set<string>>(() =>
    readExpandedStringSet(storageKey, activeTab, 'setting_types'),
  );
  const [categoryMenu, setCategoryMenu] = useState<LibraryCategoryMenu>(null);
  const [entryMenu, setEntryMenu] = useState<LibraryEntryMenu>(null);
  const [entryMoveMenuOpen, setEntryMoveMenuOpen] = useState(false);
  const [pendingEntryDelete, setPendingEntryDelete] = useState<PendingEntryDelete>(null);
  const [pendingEntryRename, setPendingEntryRename] = useState<PendingEntryRename>(null);
  const [entryRenameDraft, setEntryRenameDraft] = useState('');
  const [pendingCategoryRename, setPendingCategoryRename] = useState<PendingCategoryRename>(null);
  const [categoryRenameDraft, setCategoryRenameDraft] = useState('');
  const [isClearSettingsConfirmOpen, setIsClearSettingsConfirmOpen] = useState(false);
  const [clearSettingsConfirmTarget, setClearSettingsConfirmTarget] = useState<ClearSettingsTarget>('settingEntries');
  const [clearSettingsConfirmStep, setClearSettingsConfirmStep] = useState<1 | 2>(1);
  const [activeStructuredSettingTab, setActiveStructuredSettingTab] = useState<StructuredSettingTab>('固定设定');
  const [promptDisableMenu, setPromptDisableMenu] = useState<PromptDisableMenu>(null);
  const [managementModal, setManagementModal] = useState<LibraryManagementModalState>(null);
  const [roleHistoryEntryId, setRoleHistoryEntryId] = useState<string | null>(null);
  const [isBrainstormReaderOpen, setIsBrainstormReaderOpen] = useState(false);
  const [selectedBrainstormReaderId, setSelectedBrainstormReaderId] = useState<string | null>(null);
  const [isOtherSettingReaderOpen, setIsOtherSettingReaderOpen] = useState(false);
  const [otherSettingReaderTabId, setOtherSettingReaderTabId] = useState<OtherSettingLinkTabId>('work');
  const [otherSettingReaderPreviewId, setOtherSettingReaderPreviewId] = useState('');
  const [draftOtherSettingReaderIds, setDraftOtherSettingReaderIds] = useState<Set<string>>(() => new Set());
  const [otherSettingReaderQuery, setOtherSettingReaderQuery] = useState('');
  const [isBrainstormRecycleOpen, setIsBrainstormRecycleOpen] = useState(false);
  const [isClearBrainstormRecycleConfirmOpen, setIsClearBrainstormRecycleConfirmOpen] = useState(false);
  const [isBrainstormPromptManagerOpen, setIsBrainstormPromptManagerOpen] = useState(false);
  const [editingBrainstormPrompt, setEditingBrainstormPrompt] = useState<PromptItem | null>(null);
  const [isCreatingBrainstormPrompt, setIsCreatingBrainstormPrompt] = useState(false);
  const [brainstormPromptDraft, setBrainstormPromptDraft] = useState({ name: '', description: '', content: '' });
  const [brainstormQuestionDraft, setBrainstormQuestionDraft] = useState<BrainstormQuestionDraft>(
    EMPTY_BRAINSTORM_QUESTION_DRAFT,
  );
  const [brainstormGenerateDraft, setBrainstormGenerateDraft] = useState<BrainstormQuestionDraft | null>(null);
  const [isBrainstormConfirmScrolling, setIsBrainstormConfirmScrolling] = useState(false);
  const [activeDetailOutlineScrollId, setActiveDetailOutlineScrollId] = useState<number | null>(null);
  const [isDetailOutlineReaderOpen, setIsDetailOutlineReaderOpen] = useState(false);
  const [detailOutlineReaderTab, setDetailOutlineReaderTab] = useState<DetailOutlineReaderTab>('settings');
  const [detailOutlineReaderPreviewId, setDetailOutlineReaderPreviewId] = useState('');
  const [collapsedDetailOutlineReaderGroups, setCollapsedDetailOutlineReaderGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [draftDetailOutlineReaderSettingIds, setDraftDetailOutlineReaderSettingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [draftDetailOutlineReaderRoleIds, setDraftDetailOutlineReaderRoleIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderOutlineIds, setDraftDetailOutlineReaderOutlineIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeBrainstormOutputScrollIndex, setActiveBrainstormOutputScrollIndex] = useState<number | null>(null);
  const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);
  const [settingCreateDialog, setSettingCreateDialog] = useState<'category' | 'setting' | null>(null);
  const [settingCreateContextKind, setSettingCreateContextKind] = useState<'role' | 'setting' | null>(null);
  const [settingCreateDraft, setSettingCreateDraft] = useState('');
  const [settingCreateTypeDraft, setSettingCreateTypeDraft] = useState('');
  const [isLibraryAiLoading, setIsLibraryAiLoading] = useState(false);
  const [isLibraryAiLogOpen, setIsLibraryAiLogOpen] = useState(false);
  const [libraryAiLogScope, setLibraryAiLogScope] = useState<'library' | 'outline'>('library');
  const [libraryAiLogViewTab, setLibraryAiLogViewTab] = useState<LibraryAiLogViewTab>('输出日志');
  const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);
  const [settingImportFormatTabId, setSettingImportFormatTabId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID);
  const [settingImportFormatEntryId, setSettingImportFormatEntryId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID);
  const [settingImportFormatPreviewScope, setSettingImportFormatPreviewScope] =
    useState<SettingImportFormatPreviewScope>('设定条目');
  const [structuredSettingFieldDraft, setStructuredSettingFieldDraft] = useState<StructuredSettingFieldDraft>(null);
  const [lastLibraryAiRequestLog, setLastLibraryAiRequestLog] = useState<LibraryAiRequestLog | null>(null);
  const suppressNextOutlinePreviewSyncRef = useRef(false);
  const [activeLibraryFontTarget, setActiveLibraryFontTarget] = useState<LibraryFontTarget>('brainstormOutput');
  const [lastOutlineAiRequestLog, setLastOutlineAiRequestLog] = useState<LibraryAiRequestLog | null>(null);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [tabPortalTarget, setTabPortalTarget] = useState<HTMLElement | null>(null);
  const [headerToolPortalTarget, setHeaderToolPortalTarget] = useState<HTMLElement | null>(null);
  const outlinePreviewRefs = useRef<Record<number, HTMLElement | null>>({});
  const libraryAiOutputRef = useRef<HTMLDivElement | null>(null);
  const libraryAiAutoScrollRef = useRef(true);
  const libraryAiProgrammaticScrollRef = useRef(false);
  const libraryAiInputRef = useRef<HTMLTextAreaElement | null>(null);
  const libraryAiRequestSeqRef = useRef(0);
  const brainstormConfirmScrollTimerRef = useRef<number | null>(null);
  const brainstormOutputScrollTimerRef = useRef<number | null>(null);
  const detailOutlineScrollTimerRef = useRef<number | null>(null);
  const settingSidebarScrollTimerRef = useRef<number | null>(null);
  const roleExpandedReloadRef = useRef(false);
  const settingExpandedReloadRef = useRef(false);
  const outlineExpandedReloadRef = useRef(false);
  const { models: modelSnapshot } = useModels();
  const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);
  const { prompts, addPrompt, updatePrompt, deletePrompt, togglePin } = usePrompts();
  const brainstormPrompts = useMemo(
    () => prompts.filter((prompt) => prompt.category === BRAINSTORM_TAB),
    [BRAINSTORM_TAB, prompts],
  );
  const rolePromptOptions = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY),
    [PROMPT_SETTING_CATEGORY, normalizePromptCategoryName, prompts],
  );
  const outlinePrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === SUMMARY_PROMPT_CATEGORY),
    [SUMMARY_PROMPT_CATEGORY, normalizePromptCategoryName, prompts],
  );
  const scaleStyle = scale === 1 ? undefined : ({ zoom: scale } as CSSProperties);
  const selectedId = activeTabConfig.selectedId ?? null;
  const roleTypeDraft = activeTabConfig.roleTypeDraft ?? activeTabConfig.typeDraft ?? '';
  const roleNameDraft = activeTabConfig.roleNameDraft ?? activeTabConfig.titleDraft ?? '';
  const settingTypeDraft = activeTabConfig.typeDraft ?? '';
  const settingTitleDraft = activeTabConfig.titleDraft ?? '';
  const brainstormAiSessions = normalizeBrainstormAiSessions(activeTabConfig.aiSessions, activeTabConfig);
  const activeBrainstormAiSessionId = getActiveBrainstormAiSessionId(
    activeTabConfig.activeAiSessionId,
    brainstormAiSessions,
  );
  const activeBrainstormAiSession =
    brainstormAiSessions.find((session) => session.id === activeBrainstormAiSessionId) ?? brainstormAiSessions[0];
  const aiInput =
    activeTab === BRAINSTORM_TAB ? (activeBrainstormAiSession?.input ?? '') : (activeTabConfig.aiInput ?? '');
  const canSendLibraryAiMessage = activeTab === SETTING_TAB || aiInput.trim().length > 0;
  const aiOutput =
    activeTab === BRAINSTORM_TAB ? (activeBrainstormAiSession?.output ?? '') : (activeTabConfig.aiOutput ?? '');
  const aiResult =
    activeTab === BRAINSTORM_TAB ? (activeBrainstormAiSession?.result ?? '') : (activeTabConfig.aiResult ?? '');
  const hasLibraryAiContent = hasLibraryAiDialogContent(aiInput, aiOutput, aiResult);
  const animatedAiOutput = isLibraryAiLoading
    ? aiOutput.replace(/正在生成\.\.\./g, `正在生成${'.'.repeat(loadingDotCount)}`)
    : aiOutput;
  const aiChatTurns = parseAiChatTurns(animatedAiOutput);
  const previousActiveTabRef = useRef(activeTab);
  useEffect(() => {
    resizeFloatingAiTextarea(libraryAiInputRef.current);
  }, [activeTab, aiInput, resizeFloatingAiTextarea]);
  const brainstormStreamEnabled = activeTabConfig.brainstormStreamEnabled !== false;
  const currentOutlineChapterNumber = useMemo(
    () =>
      volumes.flatMap((volume) => volume.chapters).find((chapter) => chapter.id === selectedOutlineChapterId)
        ?.serialNumber ?? null,
    [selectedOutlineChapterId, volumes],
  );
  useTopModalEscape(Boolean(brainstormGenerateDraft), () => setBrainstormGenerateDraft(null));
  useTopModalEscape(Boolean(settingCreateDialog), () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  });
  useTopModalEscape(isFieldSizeSettingsOpen, () => setIsFieldSizeSettingsOpen(false));
  useTopModalEscape(isLibraryAiLogOpen, () => setIsLibraryAiLogOpen(false));
  useTopModalEscape(isDetailOutlineReaderOpen, () => setIsDetailOutlineReaderOpen(false));
  useEffect(
    () => () => {
      if (brainstormConfirmScrollTimerRef.current !== null) {
        window.clearTimeout(brainstormConfirmScrollTimerRef.current);
      }
      if (detailOutlineScrollTimerRef.current !== null) {
        window.clearTimeout(detailOutlineScrollTimerRef.current);
      }
      if (settingSidebarScrollTimerRef.current !== null) {
        window.clearTimeout(settingSidebarScrollTimerRef.current);
      }
    },
    [],
  );
  useEffect(() => {
    return () => {
      clearStoredBrainstormAiSessionPreviews(storageKey);
    };
  }, [clearStoredBrainstormAiSessionPreviews, storageKey]);
  const updateTabConfig = useCallback(
    (tab: string, updates: LibraryTabConfig) => {
      setTabConfigs((prev) => {
        const next = {
          ...prev,
          [tab]: {
            ...prev[tab],
            ...updates,
          },
        };
        localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    },
    [getTabConfigsStorageKey, storageKey],
  );
  const updateActiveTabConfig = useCallback(
    (updates: LibraryTabConfig) => updateTabConfig(activeTab, updates),
    [activeTab, updateTabConfig],
  );
  const {
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
  } = useWorkbenchLibraryFontSizes({ activeTabConfig, updateActiveTabConfig });
  const updateBrainstormAiSession = useCallback(
    (sessionId: string, patch: Partial<Omit<BrainstormAiSession, 'id'>>) => {
      setTabConfigs((prev) => {
        const currentConfig = prev[BRAINSTORM_TAB] ?? {};
        const currentSessions = normalizeBrainstormAiSessions(currentConfig.aiSessions, currentConfig);
        const currentActiveId = getActiveBrainstormAiSessionId(currentConfig.activeAiSessionId, currentSessions);
        const targetId = currentSessions.some((session) => session.id === sessionId) ? sessionId : currentActiveId;
        const nextSessions = currentSessions.map((session) =>
          session.id === targetId ? { ...session, ...patch } : session,
        );
        const activeSession = nextSessions.find((session) => session.id === currentActiveId) ?? nextSessions[0];
        const nextConfig: LibraryTabConfig = {
          ...currentConfig,
          aiSessions: nextSessions,
          activeAiSessionId: currentActiveId,
          aiInput: activeSession?.input ?? '',
          aiOutput: activeSession?.output ?? '',
          aiResult: activeSession?.result ?? '',
        };
        const next = {
          ...prev,
          [BRAINSTORM_TAB]: nextConfig,
        };
        localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    },
    [
      BRAINSTORM_TAB,
      getActiveBrainstormAiSessionId,
      getTabConfigsStorageKey,
      normalizeBrainstormAiSessions,
      storageKey,
    ],
  );
  const updateActiveBrainstormAiSession = (patch: Partial<Omit<BrainstormAiSession, 'id'>>) => {
    updateBrainstormAiSession(activeBrainstormAiSessionId, patch);
  };
  useEffect(() => {
    const previousTab = previousActiveTabRef.current;
    previousActiveTabRef.current = activeTab;
    if (previousTab !== BRAINSTORM_TAB || activeTab === BRAINSTORM_TAB) return;
    updateBrainstormAiSession(activeBrainstormAiSessionId, {
      input: '',
      output: '',
      result: '',
      previewTitles: [],
      previewDrafts: [],
      previewSelectedIndexes: undefined,
    });
  }, [activeTab, activeBrainstormAiSessionId, updateBrainstormAiSession, BRAINSTORM_TAB]);
  const {
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    setAiInput,
    setAiOutput,
    setAiResult,
    setOutlinePreviewDraft,
    setRoleNameDraft,
    setRoleTypeDraft,
    setSelectedId,
    setSelectedIdForTab,
    setSettingTitleDraft,
    setSettingTypeDraft,
  } = useWorkbenchLibraryControllerPhase1Actions({
    activeTab,
    brainstormTab: BRAINSTORM_TAB,
    customSettingTypeDomains,
    defaultSettingTypeDomains: DEFAULT_SETTING_TYPE_DOMAINS,
    outlineSettingDomain,
    roleTab: ROLE_TAB,
    settingWorkspaceDomainGroups: SETTING_WORKSPACE_DOMAIN_GROUPS,
    setOutlinePreviewDraftState,
    updateActiveBrainstormAiSession,
    updateActiveTabConfig,
    updateTabConfig,
  });
  useWorkbenchLibraryBackgroundTasks({
    storageKey,
    activeTab,
    activeBrainstormAiSession,
    tabConfigs,
    setTabConfigs,
    updateActiveTabConfig,
    setOutlinePreviewDraftState,
    setIsLibraryAiLoading,
  });
  return {
    settingTypeOptionsRef,
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
  };
}
