import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Lock,
  Pin,
  Plus,
  Square,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import type { CSSProperties } from 'react';
import type {
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { useModels } from '@/features/models/hooks/useModels';
import { callModel, callModelStream } from '@/features/models/services/callModel';
import { readPlotLibrarySnapshot } from '@/features/plot-library/hooks/usePlotLibrary';
import { SUMMARY_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { shouldSyncOutlinePreviewDraft } from '@/features/workbench/model/workbenchOutlineSync';
import {
  getPlotPointScoreColorClass,
  prepareCollapsedPlotPointCard,
} from '@/features/workbench/model/workbenchPlotPointCard';
import {
  DEFAULT_PLOT_POINT_OPENING_ELEMENTS,
  PLOT_POINT_CHAIN_SLOTS,
  PLOT_POINT_FALLBACK_CANDIDATES,
  PLOT_POINT_GENERATE_COUNTS,
  PLOT_POINT_OPENING_ELEMENT_OPTIONS,
  getPlotPointLengthLabel,
  getWorkbenchPlotPointDecisionMetrics,
  getWorkbenchPlotPointDisplayText,
  getWorkbenchPlotPointFitClass,
  getWorkbenchPlotPointFitLabel,
  getWorkbenchPlotPointMetricClass,
  getWorkbenchPlotPointPreviewText,
  getWorkbenchPlotPointReview,
  getWorkbenchPlotPointText,
  normalizePlotPointChainNames,
  normalizePlotPointChainSelections,
  normalizePlotPointChainSlot,
  normalizePlotPointGenerateCount,
  normalizePlotPointLengthMode,
  normalizePlotPointOpeningElements,
  normalizePlotPointSourceMode,
  plotLibraryItemToCandidate,
  type PlotPointChainSlot,
  type PlotPointLengthMode,
  type PlotPointSourceMode,
  type WorkbenchPlotPointCandidate,
} from '@/features/workbench/model/workbenchPlotChain';
import { buildPlotPointOutputFormatInstruction } from '@/features/workbench/model/workbenchPlotPointPrompt';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  canCreateWorkbenchRoleInType,
  getInitialPlotChainRoleIds,
  getPlotPointProtagonistReplacementRule,
  isDefaultWorkbenchRoleType,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleLifeStatus,
  normalizeWorkbenchRoleType,
  shouldShowRolePinAction,
} from '@/features/workbench/model/workbenchRoleTypes';
import {
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
} from '@/features/workbench/model/workbenchSettingTaxonomy';
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
  getWorkbenchAssociationRuntimeId,
  isWorkbenchAssociationRuntimeCurrent,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import { WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT } from '@/features/workbench/model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidthEnabled,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { LinkedSourceControl } from '@/shared/ui/LinkedSourceControl';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { WordCountText } from '@/shared/ui/WordCountText';
import {
  WORKBENCH_FIELD_SIZE_DEFAULTS,
  WORKBENCH_FIELD_SIZE_SETTING_KEYS,
  clampFieldSizeValue,
  getWorkbenchFieldSizeStyle,
  readWorkbenchFieldSizeSpecs,
  writeWorkbenchFieldSizeSpecs,
  type WorkbenchFieldSizeKey,
  type WorkbenchFieldSizeProp,
  type WorkbenchFieldSizeSpec,
} from './workbenchFieldSizeSettings';
import { FieldSizeSettingsModal } from './workbenchFieldSizeSettingsModal';
import {
  WorkbenchLibraryAiLogButton,
  WorkbenchLibraryFieldSizeButton,
  WorkbenchLibraryFontSizeTool,
  WorkbenchLibraryHeaderFontSizeTool,
  WorkbenchLibraryTopTabs,
  getWorkbenchLibraryActiveFontConfig,
} from './workbenchLibraryHeaderTools';
import { useWorkbenchLibraryAiLogTriggers } from './workbenchLibraryAiLogTriggers';
import { useWorkbenchLibraryResizeHandles } from './workbenchLibraryResizeHandles';
import {
  BrainstormGenerateConfirmModal,
  BrainstormPromptEditModal,
  BrainstormPromptManagerModal,
  BrainstormReaderModal,
  BrainstormRecycleModal,
} from './workbenchBrainstormModals';
import {
  LibraryCategoryContextMenu,
  LibraryEntryContextMenu,
  type LibraryCategoryMenu,
  type LibraryEntryMenu,
} from './workbenchLibraryContextMenus';
import {
  CategoryRenameDialog,
  EntryRenameDialog,
  PromptDisableContextMenu,
  SettingCreateDialog,
  type PromptDisableMenu,
} from './workbenchLibraryDialogs';
import {
  OtherSettingReaderModal,
  type OtherSettingLinkEntry,
  type OtherSettingLinkTab,
  type OtherSettingLinkTabId,
} from './workbenchOtherSettingReaderModal';
import {
  BRAINSTORM_GENERATE_RULE_TEXT,
  BRAINSTORM_GENERATE_TASK_TEXT,
  BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
  BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
  BRAINSTORM_OUTPUT_ONLY_INSTRUCTION,
  BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
  BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
  BRAINSTORM_QUESTION_FIELDS,
  DETAIL_OUTLINE_MAX_FONT_SIZE,
  DETAIL_OUTLINE_MIN_FONT_SIZE,
  EMPTY_BRAINSTORM_QUESTION_DRAFT,
  LIBRARY_AI_TIMEOUT_MS,
  ROLE_TEXT_MAX_FONT_SIZE,
  ROLE_TEXT_MIN_FONT_SIZE,
  SETTING_PREVIEW_MAX_FONT_SIZE,
  SETTING_PREVIEW_MIN_FONT_SIZE,
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
import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';
import { DetailOutlineReaderModal, type DetailOutlineReaderTab } from './workbenchDetailOutlineReaderModal';
import { LibraryAiLogModal, type LibraryAiLogViewTab } from './workbenchLibraryAiLogModal';
import { LibraryManagementModal, type LibraryManagementModalState } from './workbenchLibraryManagementModal';
import { OutlineAiLogModal } from './workbenchOutlineAiLogModal';
import { PlotPointGenerationModal } from './workbenchPlotPointGenerationModal';
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
import { parseGeneratedPlotPointCandidates } from './workbenchPlotPointCandidates';
import {
  DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
  PROMPT_DISABLE_CONTEXT_MENU_SIZE,
  SETTING_CATEGORY_CONTEXT_MENU_SIZE,
  SETTING_ENTRY_CONTEXT_MENU_SIZE,
  clampFixedMenuPosition,
} from './workbenchLibraryMenuPosition';
import {
  LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS,
  LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE,
  hasLibraryEntryPointerRetargetedTooSoon,
  isLibraryPointerPastGroupEntries,
  rememberLibraryEntryPointerPreviewTarget,
  type LibraryEntryDragState,
  type LibraryEntryDropPreviewState,
  type LibraryEntryPointerDragState,
} from './workbenchLibraryDrag';
import {
  DETAIL_OUTLINE_PUBLISHED_GROUP_NAME,
  DETAIL_OUTLINE_STATE_MARKER,
  getDetailOutlinePreviewHeight,
  mergeDetailOutlineStateExpectation,
  splitDetailOutlineStateExpectation,
} from './workbenchDetailOutlineState';
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
  PLOT_POINT_LAYOUT_CENTER_MIN_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_WIDTH,
  PLOT_POINT_LAYOUT_TREE_WIDTH,
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
  PLOT_CHAIN_PROMPT_CATEGORY,
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
  readPlotPointLayoutLeftWidth,
  readPlotPointLayoutRightWidth,
  readPlotPointLayoutTreeWidth,
  readSettingLibraryLeftWidth,
  readSettingLibraryRightWidth,
} from './workbenchLibraryStorageState';
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
import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';
import { RoleBaseStateEditor } from './workbenchRoleEditor';
import { RoleHistoryModal } from './workbenchRoleHistoryModal';
import { WorkbenchLibrarySidebar } from './workbenchLibrarySidebar';
import { WorkbenchRoleSidebar } from './workbenchRoleSidebar';
import { WorkbenchRoleLibraryView } from './workbenchRoleLibraryView';
import {
  DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID,
  DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID,
  STRUCTURED_SETTING_TABS,
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
  buildImportedRoleEntryTitle,
  createImportedRoleContent,
  createMarkdownSettingSegments,
  createSmartSettingSegments,
  createTaggedSettingSegments,
  getImportedRoleSection,
  normalizeImportedSettingBody,
  normalizeImportedSettingKey,
} from './workbenchSmartImport';

export { parseGeneratedPlotPointCandidates } from './workbenchPlotPointCandidates';

interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
  getChapterContent?: (chapterId: number) => string;
  outlineStorageKey?: string;
  scale?: number;
  defaultActiveTab?: string;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  openPlotPointSignal?: number;
  plotPointStandalone?: boolean;
  onOpenDetailOutlineFromPlotChain?: () => void;
  toolbarPortalId?: string;
}

function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {
  return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);
}

type PendingCategoryRename = {
  kind: 'role' | 'setting';
  type: string;
} | null;

type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';
type ClearSettingsMeta = { label: string; count: number; description: string };

type PendingEntryDelete = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;
type PendingEntryRename = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;

const OTHER_SETTING_LINK_TABS = [
  { id: 'work', title: '作品设定' },
  { id: 'roles', title: '人物设定' },
  { id: 'factions', title: '势力设定' },
  { id: 'items', title: '道具资源' },
  { id: 'monsters', title: '怪物图鉴' },
  { id: 'foreshadow', title: '伏笔线索' },
] as const;
type SettingLinkSource = 'current' | 'other' | 'brainstorm' | null;

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

export function WorkbenchLibraryPanel({
  storageKey,
  tabs,
  emptyText,
  volumes = [],
  getChapterContent,
  outlineStorageKey,
  scale = 1,
  defaultActiveTab,
  fieldSizeOpenSignal = 0,
  showInlineFieldSizeButton = true,
  openLogSignal = 0,
  onRegisterHeaderLog,
  openPlotPointSignal = 0,
  plotPointStandalone = false,
  onOpenDetailOutlineFromPlotChain,
  toolbarPortalId,
}: WorkbenchLibraryPanelProps) {
  const tabsSignature = tabs.map(normalizeTabName).join('\u001f');
  const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\u001f') : []), [tabsSignature]);
  const isSettingLibraryPanel = useMemo(
    () => normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)),
    [normalizedTabs],
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
  const [outlinePreviewDraft, setOutlinePreviewDraftState] = useState(() =>
    plotPointStandalone ? (activeTabConfig.plotPointPreviewDraft ?? '') : '',
  );
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
  const [isFieldSizeSettingsOpen, setIsFieldSizeSettingsOpen] = useState(false);
  const lastFieldSizeOpenSignalRef = useRef(fieldSizeOpenSignal);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const [fieldSizeSpecs, setFieldSizeSpecs] = useState<Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>>(() =>
    readWorkbenchFieldSizeSpecs(),
  );
  const fieldSizeSettingsDraggable = useDraggableModal('workbench_field_size_settings');
  const visibleFieldSizeKeys = WORKBENCH_FIELD_SIZE_KEYS_BY_TAB[activeTab] ?? WORKBENCH_FIELD_SIZE_SETTING_KEYS;
  const fieldSizeTabLabel = getWorkbenchFieldSizeTabLabel(activeTab);
  const [settingLibraryLeftWidth, setSettingLibraryLeftWidth] = useState(() =>
    readSettingLibraryLeftWidth(storageKey, activeTab, scale),
  );
  const [settingLibraryRightWidth, setSettingLibraryRightWidth] = useState(() =>
    readSettingLibraryRightWidth(storageKey, activeTab),
  );
  const [brainstormPreviewWidth, setBrainstormPreviewWidth] = useState(() =>
    readBrainstormPreviewWidth(storageKey, activeTab),
  );
  const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() =>
    readPlotPointLayoutTreeWidth(storageKey),
  );
  const [plotPointLayoutLeftWidth, setPlotPointLayoutLeftWidth] = useState(() =>
    readPlotPointLayoutLeftWidth(storageKey),
  );
  const [plotPointLayoutRightWidth, setPlotPointLayoutRightWidth] = useState(() =>
    readPlotPointLayoutRightWidth(storageKey),
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
  const [draggingLibraryEntry, setDraggingLibraryEntry] = useState<LibraryEntryDragState>(null);
  const [libraryDropTarget, setLibraryDropTarget] = useState<{ tab: string; type: string } | null>(null);
  const [libraryEntryDropPreview, setLibraryEntryDropPreview] = useState<LibraryEntryDropPreviewState>(null);
  const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);
  const libraryDropHandledRef = useRef(false);
  const libraryEntryPointerDragRef = useRef<LibraryEntryPointerDragState>(null);
  const libraryPointerSuppressClickRef = useRef(false);
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
  const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isPlotPointModalOpen, setIsPlotPointModalOpen] = useState(false);
  const [plotPointInput, setPlotPointInput] = useState('');
  const [plotPointOutput, setPlotPointOutput] = useState('');
  const [plotPointGeneratedCandidateText, setPlotPointGeneratedCandidateTextState] = useState(
    () => activeTabConfig.plotPointGeneratedCandidateText ?? '',
  );
  const [isPlotPointPreviewCleared, setIsPlotPointPreviewClearedState] = useState(
    () => activeTabConfig.plotPointPreviewCleared ?? !activeTabConfig.plotPointGeneratedCandidateText,
  );
  const [plotPointSourceMode, setPlotPointSourceModeState] = useState<PlotPointSourceMode>(() =>
    normalizePlotPointSourceMode(activeTabConfig.plotPointSourceMode),
  );
  const [plotPointGenerateCount, setPlotPointGenerateCountState] = useState<5 | 10 | 20>(() =>
    normalizePlotPointGenerateCount(activeTabConfig.plotPointGenerateCount),
  );
  const [plotPointLength, setPlotPointLengthState] = useState<PlotPointLengthMode>(() =>
    normalizePlotPointLengthMode(activeTabConfig.plotPointLength),
  );
  const [plotPointActiveChainSlot, setPlotPointActiveChainSlot] = useState<PlotPointChainSlot>(() =>
    normalizePlotPointChainSlot(activeTabConfig.plotPointActiveChainSlot),
  );
  const [plotPointChainSelections, setPlotPointChainSelections] = useState<Record<PlotPointChainSlot, string[]>>(() =>
    normalizePlotPointChainSelections(activeTabConfig.plotPointChainSelections),
  );
  const [plotPointChainWrittenSelections, setPlotPointChainWrittenSelections] = useState<
    Record<PlotPointChainSlot, string[]>
  >(() => normalizePlotPointChainSelections(activeTabConfig.plotPointChainWrittenSelections));
  const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() =>
    normalizePlotPointChainNames(activeTabConfig.plotPointChainNames),
  );
  const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<
    Record<PlotPointChainSlot, boolean>
  >({
    1: true,
    2: true,
    3: true,
  });
  const [plotPointChainRefreshStates, setPlotPointChainRefreshStates] = useState<Record<PlotPointChainSlot, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [plotPointSelectedCandidateMap, setPlotPointSelectedCandidateMap] = useState<
    Record<string, WorkbenchPlotPointCandidate>
  >(() => Object.fromEntries((activeTabConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item])));
  const [expandedPlotPointPreviewIds, setExpandedPlotPointPreviewIds] = useState<string[]>([]);
  const [plotPointChainMenuSlot, setPlotPointChainMenuSlot] = useState<PlotPointChainSlot | null>(null);
  const [activeBrainstormOutputScrollIndex, setActiveBrainstormOutputScrollIndex] = useState<number | null>(null);
  const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);
  const [plotPointChainRenameDraft, setPlotPointChainRenameDraft] = useState('');
  const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');
  const [activePlotPointChainItemId, setActivePlotPointChainItemId] = useState<string | null>(null);
  const [plotPointOpeningElements, setPlotPointOpeningElementsState] = useState<string[]>(() =>
    normalizePlotPointOpeningElements(activeTabConfig.plotPointOpeningElements),
  );
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
  const plotPointGenerationModeRef = useRef<'restart' | 'continue'>('restart');
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
  const brainstormPrompts = useMemo(() => prompts.filter((prompt) => prompt.category === BRAINSTORM_TAB), [prompts]);
  const rolePromptOptions = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY),
    [prompts],
  );
  const outlinePrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === SUMMARY_PROMPT_CATEGORY),
    [prompts],
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
  }, [activeTab, aiInput]);

  const brainstormPreviewFontSize = Math.min(
    BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
    Math.max(BRAINSTORM_PREVIEW_MIN_FONT_SIZE, activeTabConfig.brainstormPreviewFontSize ?? 14),
  );
  const brainstormOutputFontSize = Math.min(
    BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
    Math.max(BRAINSTORM_OUTPUT_MIN_FONT_SIZE, activeTabConfig.brainstormOutputFontSize ?? 14),
  );
  const brainstormStreamEnabled = activeTabConfig.brainstormStreamEnabled !== false;
  const settingPreviewFontSize = Math.min(
    SETTING_PREVIEW_MAX_FONT_SIZE,
    Math.max(SETTING_PREVIEW_MIN_FONT_SIZE, activeTabConfig.settingPreviewFontSize ?? 14),
  );
  const roleTextFontSize = Math.min(
    ROLE_TEXT_MAX_FONT_SIZE,
    Math.max(ROLE_TEXT_MIN_FONT_SIZE, activeTabConfig.roleTextFontSize ?? 14),
  );
  const currentOutlineChapterNumber = useMemo(
    () =>
      volumes.flatMap((volume) => volume.chapters).find((chapter) => chapter.id === selectedOutlineChapterId)
        ?.serialNumber ?? null,
    [selectedOutlineChapterId, volumes],
  );
  const detailOutlineFontSize = Math.min(
    DETAIL_OUTLINE_MAX_FONT_SIZE,
    Math.max(DETAIL_OUTLINE_MIN_FONT_SIZE, activeTabConfig.detailOutlineFontSize ?? 14),
  );
  useTopModalEscape(
    isBrainstormPromptManagerOpen && !editingBrainstormPrompt && !isCreatingBrainstormPrompt,
    closeBrainstormPromptManager,
  );
  useTopModalEscape(Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt), () => closeBrainstormPromptEdit());
  useTopModalEscape(Boolean(brainstormGenerateDraft), () => setBrainstormGenerateDraft(null));
  useTopModalEscape(Boolean(settingCreateDialog), () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  });
  useTopModalEscape(isFieldSizeSettingsOpen, () => setIsFieldSizeSettingsOpen(false));
  useTopModalEscape(isLibraryAiLogOpen, () => setIsLibraryAiLogOpen(false));
  useTopModalEscape(isDetailOutlineReaderOpen, () => setIsDetailOutlineReaderOpen(false));
  useTopModalEscape(isPlotPointModalOpen, () => setIsPlotPointModalOpen(false));
  useTopModalEscape(isBrainstormRecycleOpen && !isClearBrainstormRecycleConfirmOpen, () =>
    setIsBrainstormRecycleOpen(false),
  );
  useTopModalEscape(isBrainstormReaderOpen, closeBrainstormReader);
  useTopModalEscape(isOtherSettingReaderOpen, closeOtherSettingReader);

  useEffect(() => {
    if (fieldSizeOpenSignal <= 0 || fieldSizeOpenSignal === lastFieldSizeOpenSignalRef.current) return;
    lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
    setIsFieldSizeSettingsOpen(true);
  }, [fieldSizeOpenSignal]);

  useEffect(() => {
    if (openPlotPointSignal <= 0 || activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return;
    setIsPlotPointModalOpen(true);
  }, [activeTab, openPlotPointSignal, plotPointStandalone]);

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
  }, [storageKey]);

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
    [storageKey],
  );
  const updateActiveTabConfig = useCallback(
    (updates: LibraryTabConfig) => updateTabConfig(activeTab, updates),
    [activeTab, updateTabConfig],
  );
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
    [storageKey],
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
  }, [activeTab, activeBrainstormAiSessionId, updateBrainstormAiSession]);
  const setOutlinePreviewDraft = useCallback(
    (value: SetStateAction<string>) => {
      setOutlinePreviewDraftState((current) => {
        const nextValue = typeof value === 'function' ? value(current) : value;
        if (plotPointStandalone) updateActiveTabConfig({ plotPointPreviewDraft: nextValue });
        return nextValue;
      });
    },
    [plotPointStandalone, updateActiveTabConfig],
  );
  const setPlotPointGeneratedCandidateText = (value: string) => {
    setPlotPointGeneratedCandidateTextState(value);
    updateActiveTabConfig({ plotPointGeneratedCandidateText: value });
  };
  const setIsPlotPointPreviewCleared = (value: boolean) => {
    setIsPlotPointPreviewClearedState(value);
    updateActiveTabConfig({ plotPointPreviewCleared: value });
  };
  const setPlotPointSelectedCandidateCache = (
    updater: (current: Record<string, WorkbenchPlotPointCandidate>) => Record<string, WorkbenchPlotPointCandidate>,
  ) => {
    setPlotPointSelectedCandidateMap((current) => {
      const next = updater(current);
      updateActiveTabConfig({ plotPointSelectedCandidates: Object.values(next) });
      return next;
    });
  };
  const setActivePlotPointChainSlot = (slot: PlotPointChainSlot) => {
    setPlotPointActiveChainSlot(slot);
    setPlotPointChainMenuSlot(null);
    setActivePlotPointChainItemId(null);
    updateActiveTabConfig({ plotPointActiveChainSlot: slot });
  };
  const renamePlotPointChain = (slot: PlotPointChainSlot, value: string) => {
    const nextName = value.trim() || `剧情链${slot}`;
    setPlotPointChainNames((current) => {
      const next = { ...current, [slot]: nextName };
      updateActiveTabConfig({ plotPointChainNames: next });
      return next;
    });
    setPlotPointChainRenameDraft(nextName);
    setPlotPointChainMenuSlot(null);
  };
  const setPlotPointGenerateCount = (value: (typeof PLOT_POINT_GENERATE_COUNTS)[number]) => {
    const normalizedValue = normalizePlotPointGenerateCount(value);
    setPlotPointGenerateCountState(normalizedValue);
    updateActiveTabConfig({ plotPointGenerateCount: normalizedValue });
  };
  const setPlotPointLength = (value: PlotPointLengthMode) => {
    const normalizedValue = normalizePlotPointLengthMode(value);
    setPlotPointLengthState(normalizedValue);
    updateActiveTabConfig({ plotPointLength: normalizedValue });
  };
  const setSelectedId = (id: string | null) => updateActiveTabConfig({ selectedId: id });
  const setSelectedIdForTab = (tab: string, id: string | null) => updateTabConfig(tab, { selectedId: id });
  const setRoleTypeDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleTypeDraft: value, typeDraft: value });
  const setRoleNameDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleNameDraft: value, titleDraft: value });
  const setSettingTypeDraft = (value: string) => updateActiveTabConfig({ typeDraft: value });
  const setSettingTitleDraft = (value: string) => updateActiveTabConfig({ titleDraft: value });
  const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState) => {
    libraryEntryDropPreviewRef.current = next;
    setLibraryEntryDropPreview(next);
  };
  const getSelectedSettingWorkspaceDomain = useCallback(() => {
    return Object.prototype.hasOwnProperty.call(SETTING_WORKSPACE_DOMAIN_GROUPS, outlineSettingDomain)
      ? outlineSettingDomain
      : null;
  }, [outlineSettingDomain]);
  const getSelectedSettingWorkspaceType = useCallback(() => {
    const domain = getSelectedSettingWorkspaceDomain();
    return domain ? SETTING_WORKSPACE_DOMAIN_GROUPS[domain as keyof typeof SETTING_WORKSPACE_DOMAIN_GROUPS][0] : null;
  }, [getSelectedSettingWorkspaceDomain]);
  const getSettingTypeWorkspaceDomain = useCallback(
    (type: string) => {
      const customDomain = customSettingTypeDomains[type];
      return (
        DEFAULT_SETTING_TYPE_DOMAINS[type] ??
        (customDomain && Object.prototype.hasOwnProperty.call(SETTING_WORKSPACE_DOMAIN_GROUPS, customDomain)
          ? customDomain
          : null) ??
        null
      );
    },
    [customSettingTypeDomains],
  );
  const setAiInput = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ input: value });
      return;
    }
    updateActiveTabConfig({ aiInput: value });
  };
  const setAiOutput = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ output: value });
      return;
    }
    updateActiveTabConfig({ aiOutput: value });
  };
  const setAiResult = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ result: value });
      return;
    }
    updateActiveTabConfig({ aiResult: value });
  };

  useEffect(() => {
    const syncBackgroundTasks = () => {
      setTabConfigs((prev) => {
        let changed = false;
        const next: LibraryTabConfigs = { ...prev };
        Object.entries(prev).forEach(([tab, config]) => {
          let nextConfig = config;
          if (tab === BRAINSTORM_TAB) {
            const sessions = normalizeBrainstormAiSessions(config.aiSessions, config);
            let sessionsChanged = false;
            const nextSessions = sessions.map((session) => {
              if (!session.backgroundAiTaskId) return session;
              const task = getBackgroundAiTask(session.backgroundAiTaskId);
              if (!task || task.meta?.target !== 'workbenchLibraryAi' || task.meta.storageKey !== storageKey)
                return session;
              const output = getLibraryBackgroundTaskOutput(task);
              const result = getBrainstormBackgroundTaskResult(task);
              if (session.output === output && session.result === result) return session;
              sessionsChanged = true;
              return { ...session, output, result };
            });
            if (sessionsChanged) {
              const activeId = getActiveBrainstormAiSessionId(config.activeAiSessionId, nextSessions);
              const activeSession = nextSessions.find((session) => session.id === activeId) ?? nextSessions[0];
              nextConfig = {
                ...nextConfig,
                aiSessions: nextSessions,
                activeAiSessionId: activeId,
                aiInput: activeSession?.input ?? '',
                aiOutput: activeSession?.output ?? '',
                aiResult: activeSession?.result ?? '',
              };
            }
          } else if (nextConfig.libraryAiTaskId) {
            const task = getBackgroundAiTask(nextConfig.libraryAiTaskId);
            if (task && task.meta?.target === 'workbenchLibraryAi' && task.meta.storageKey === storageKey) {
              const output = getLibraryBackgroundTaskOutput(task);
              if (nextConfig.aiOutput !== output) {
                nextConfig = { ...nextConfig, aiOutput: output };
              }
            }
          }
          if (nextConfig !== config) {
            changed = true;
            next[tab] = nextConfig;
          }
        });
        if (changed) localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
        return changed ? next : prev;
      });

      const activeConfig = tabConfigs[activeTab] ?? {};
      const activeBrainstormTaskId =
        activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.backgroundAiTaskId : undefined;
      const activeLibraryTask = activeBrainstormTaskId
        ? getBackgroundAiTask(activeBrainstormTaskId)
        : activeConfig.libraryAiTaskId
          ? getBackgroundAiTask(activeConfig.libraryAiTaskId)
          : null;
      const activeOutlineTask = activeConfig.outlineAiTaskId ? getBackgroundAiTask(activeConfig.outlineAiTaskId) : null;
      const activePlotPointTask = activeConfig.plotPointAiTaskId
        ? getBackgroundAiTask(activeConfig.plotPointAiTaskId)
        : null;

      if (
        activeOutlineTask &&
        activeOutlineTask.meta?.target === 'workbenchOutlineAi' &&
        activeOutlineTask.meta.storageKey === storageKey
      ) {
        const output = getLibraryBackgroundTaskOutput(activeOutlineTask);
        setOutlinePreviewDraftState(output);
        if (plotPointStandalone && activeConfig.plotPointPreviewDraft !== output) {
          updateActiveTabConfig({ plotPointPreviewDraft: output });
        }
        if (plotPointStandalone) {
          const candidateText = stripAiThinkingBlock(output);
          setPlotPointGeneratedCandidateTextState(candidateText);
          setIsPlotPointPreviewClearedState(
            activeOutlineTask.status === 'running'
              ? parseGeneratedPlotPointCandidates(candidateText).length === 0
              : false,
          );
        }
      }

      if (
        activePlotPointTask &&
        activePlotPointTask.meta?.target === 'workbenchPlotPointAi' &&
        activePlotPointTask.meta.storageKey === storageKey
      ) {
        const output = getLibraryBackgroundTaskOutput(activePlotPointTask);
        setPlotPointOutput(output);
        const candidateText = stripAiThinkingBlock(output);
        setPlotPointGeneratedCandidateTextState(candidateText);
        setIsPlotPointPreviewClearedState(
          activePlotPointTask.status === 'running'
            ? parseGeneratedPlotPointCandidates(candidateText).length === 0
            : false,
        );
      }

      const relevantTask =
        activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB
          ? isPlotPointModalOpen
            ? (activePlotPointTask ?? activeOutlineTask)
            : activeOutlineTask
          : activeLibraryTask;
      setIsLibraryAiLoading(relevantTask?.status === 'running');
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [
    activeBrainstormAiSession?.backgroundAiTaskId,
    activeTab,
    isPlotPointModalOpen,
    plotPointStandalone,
    storageKey,
    tabConfigs,
    updateActiveTabConfig,
  ]);

  const setBrainstormPreviewFontSize = (value: number) => {
    updateActiveTabConfig({
      brainstormPreviewFontSize: Math.min(
        BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
        Math.max(BRAINSTORM_PREVIEW_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setBrainstormOutputFontSize = (value: number) => {
    updateActiveTabConfig({
      brainstormOutputFontSize: Math.min(
        BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
        Math.max(BRAINSTORM_OUTPUT_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setSettingPreviewFontSize = (value: number) => {
    updateActiveTabConfig({
      settingPreviewFontSize: Math.min(SETTING_PREVIEW_MAX_FONT_SIZE, Math.max(SETTING_PREVIEW_MIN_FONT_SIZE, value)),
    });
  };
  const setRoleTextFontSize = (value: number) => {
    updateActiveTabConfig({
      roleTextFontSize: Math.min(ROLE_TEXT_MAX_FONT_SIZE, Math.max(ROLE_TEXT_MIN_FONT_SIZE, value)),
    });
  };
  const setDetailOutlineFontSize = (value: number) => {
    updateActiveTabConfig({
      detailOutlineFontSize: Math.min(DETAIL_OUTLINE_MAX_FONT_SIZE, Math.max(DETAIL_OUTLINE_MIN_FONT_SIZE, value)),
    });
  };
  const setBrainstormQuestionField = (key: BrainstormQuestionKey, value: string) => {
    setBrainstormQuestionDraft((current) => ({
      ...current,
      [key]: key === 'brainstormCount' ? normalizeBrainstormCountValue(value) : value,
    }));
  };
  const updateFieldSizeSpec = (key: WorkbenchFieldSizeKey, prop: WorkbenchFieldSizeProp, value: number) => {
    setFieldSizeSpecs((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          [prop]: clampFieldSizeValue(prop, value),
        },
      };
      writeWorkbenchFieldSizeSpecs(next);
      return next;
    });
  };

  useEffect(() => {
    const nextConfig = tabConfigs[activeTab] ?? {};
    if (plotPointStandalone) setOutlinePreviewDraftState(nextConfig.plotPointPreviewDraft ?? '');
    setPlotPointGeneratedCandidateTextState(nextConfig.plotPointGeneratedCandidateText ?? '');
    setIsPlotPointPreviewClearedState(
      nextConfig.plotPointPreviewCleared ?? !nextConfig.plotPointGeneratedCandidateText,
    );
    setPlotPointSelectedCandidateMap(
      Object.fromEntries((nextConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item])),
    );
    setPlotPointChainSelections(normalizePlotPointChainSelections(nextConfig.plotPointChainSelections));
    setPlotPointChainWrittenSelections(normalizePlotPointChainSelections(nextConfig.plotPointChainWrittenSelections));
    setPlotPointChainNames(normalizePlotPointChainNames(nextConfig.plotPointChainNames));
    setPlotPointActiveChainSlot(normalizePlotPointChainSlot(nextConfig.plotPointActiveChainSlot));
    setPlotPointSourceModeState(normalizePlotPointSourceMode(nextConfig.plotPointSourceMode));
    setPlotPointGenerateCountState(normalizePlotPointGenerateCount(nextConfig.plotPointGenerateCount));
    setPlotPointLengthState(normalizePlotPointLengthMode(nextConfig.plotPointLength));
    setPlotPointOpeningElementsState(normalizePlotPointOpeningElements(nextConfig.plotPointOpeningElements));
    setSelectedOutlineChapterId(
      Number.isFinite(nextConfig.selectedOutlineChapterId) ? (nextConfig.selectedOutlineChapterId ?? null) : null,
    );
  }, [activeTab, plotPointStandalone, tabConfigs]);
  const resetFieldSizeSpecs = () => {
    const defaults = readWorkbenchFieldSizeSpecs();
    visibleFieldSizeKeys.forEach((key) => {
      defaults[key] = { ...WORKBENCH_FIELD_SIZE_DEFAULTS[key] };
    });
    writeWorkbenchFieldSizeSpecs(defaults);
    setFieldSizeSpecs(defaults);
  };
  const getFieldSizeStyle = (key: WorkbenchFieldSizeKey) =>
    getWorkbenchFieldSizeStyle(fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key]);
  const getEmbeddedConfigSelectStyle = (style: CSSProperties): CSSProperties =>
    showInlineFieldSizeButton
      ? style
      : ({
          ...style,
          width: '100%',
          maxWidth: '100%',
          '--xy-field-width': '100%',
        } as CSSProperties);
  const getConfigFieldSizeKey = (tab: string, kind: 'model' | 'prompt'): WorkbenchFieldSizeKey => {
    if (tab === ROLE_TAB) return kind === 'model' ? 'roleModelSelect' : 'rolePromptSelect';
    if (tab === BRAINSTORM_TAB) return kind === 'model' ? 'brainstormModelSelect' : 'brainstormPromptSelect';
    return kind === 'model' ? 'settingModelSelect' : 'settingPromptSelect';
  };
  const getConfigFieldSizeStyle = (tab: string, kind: 'model' | 'prompt'): CSSProperties =>
    getFieldSizeStyle(getConfigFieldSizeKey(tab, kind));
  const hasBrainstormQuestionContent = (draft: BrainstormQuestionDraft) =>
    BRAINSTORM_QUESTION_FIELDS.some((field) => draft[field.key].trim());

  const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {
    const lines = BRAINSTORM_QUESTION_FIELDS.map((field) => {
      const value = draft[field.key].trim();
      if (!value) return null;
      return `${field.label.replace(/^\d+\./, '')}：${value}`;
    })
      .filter((line): line is string => Boolean(line))
      .join('\n');
    if (!lines) return '';
    return [
      BRAINSTORM_GENERATE_TASK_TEXT,
      BRAINSTORM_GENERATE_RULE_TEXT,
      '',
      BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
      lines,
    ].join('\n');
  };

  const openBrainstormGenerateConfirm = () => {
    if (isLibraryAiLoading) return;
    setBrainstormGenerateDraft({ ...brainstormQuestionDraft });
  };

  const scrollLibraryAiOutputToBottom = () => {
    const output = libraryAiOutputRef.current;
    if (!output) return;
    libraryAiProgrammaticScrollRef.current = true;
    output.scrollTop = output.scrollHeight;
    window.requestAnimationFrame(() => {
      libraryAiProgrammaticScrollRef.current = false;
    });
  };

  const handleLibraryAiOutputScroll = () => {
    const output = libraryAiOutputRef.current;
    if (!output || libraryAiProgrammaticScrollRef.current) return;
    const distanceToBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
    libraryAiAutoScrollRef.current = distanceToBottom <= 24;
  };

  useEffect(() => {
    if (!isLibraryAiLoading) {
      setLoadingDotCount(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isLibraryAiLoading]);

  useEffect(() => {
    if (!isLibraryAiLoading) return;
    if (!libraryAiAutoScrollRef.current) return;
    scrollLibraryAiOutputToBottom();
  }, [animatedAiOutput, isLibraryAiLoading]);

  const setRememberedActiveTab = useCallback(
    (tab: string) => {
      const normalizedTab = normalizeTabName(tab);
      setActiveTab(normalizedTab);
      try {
        if (normalizedTabs.includes(normalizedTab)) {
          localStorage.setItem(getActiveTabStorageKey(storageKey), normalizedTab);
        }
      } catch {
        // Local tab memory is a convenience; the panel should still work without it.
      }
    },
    [normalizedTabs, storageKey],
  );

  const {
    leftResizeHandle,
    rightResizeHandle,
    brainstormPreviewResizeHandle,
    plotPointLeftResizeHandle,
    plotPointTreeResizeHandle,
    plotPointRightResizeHandle,
  } = useWorkbenchLibraryResizeHandles({
    activeTab,
    storageKey,
    scale,
    settingLibraryLeftWidth,
    settingLibraryRightWidth,
    brainstormPreviewWidth,
    plotPointLayoutTreeWidth,
    plotPointLayoutLeftWidth,
    plotPointLayoutRightWidth,
    setSettingLibraryLeftWidth,
    setSettingLibraryRightWidth,
    setBrainstormPreviewWidth,
    setPlotPointLayoutTreeWidth,
    setPlotPointLayoutLeftWidth,
    setPlotPointLayoutRightWidth,
  });

  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;
  const selectedRoleIsMaleProtagonist = Boolean(selectedRole && isMaleProtagonistRoleType(selectedRole.type));
  const selectedRoleLifeStatus = selectedRoleIsMaleProtagonist ? '存活' : selectedRole?.lifeStatus;

  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
    setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, activeTab));
  }, [activeTab, scale, storageKey]);

  useEffect(() => {
    const syncSharedAiRightWidth = () => {
      if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
      setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    };
    window.addEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
  }, [activeTab, storageKey]);

  useEffect(() => {
    const syncSharedLeftNavWidth = () => {
      if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
      if (!readSharedWorkbenchLeftNavWidthEnabled()) return;
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
  }, [activeTab, scale, storageKey]);

  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab) || activeTab === BRAINSTORM_TAB) return;
    const syncVisibleLeftWidth = () => {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    };
    syncVisibleLeftWidth();
    window.addEventListener('resize', syncVisibleLeftWidth);
    return () => window.removeEventListener('resize', syncVisibleLeftWidth);
  }, [activeTab, scale, storageKey]);

  useEffect(() => {
    const nextActiveTab = readActiveTab(storageKey, normalizedTabs, defaultActiveTab);
    setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    setTabConfigs(readTabConfigs(storageKey));
    setActiveTab(nextActiveTab);
    if (SETTING_LIBRARY_TABS.has(nextActiveTab)) {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, nextActiveTab, scale));
      setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, nextActiveTab));
      setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, nextActiveTab));
    }
    setCustomRoleTypes(readCustomRoleTypes(storageKey));
    setCustomSettingTypes(readCustomSettingTypes(storageKey));
    setCustomSettingTypeDomains(readCustomSettingTypeDomains(storageKey));
    setHiddenRoleTypes(readHiddenRoleTypes(storageKey));
    setHiddenSettingTypes(readHiddenSettingTypes(storageKey));

    const syncEntries = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.storageKey !== storageKey &&
        event.detail?.storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY
      )
        return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncBrainstormRecycleEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== getBrainstormRecycleStorageKey(storageKey))
        return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey && event.key !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncStorageBrainstormRecycleEntries = (event: StorageEvent) => {
      if (event.key && event.key !== getBrainstormRecycleStorageKey(storageKey)) return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
    window.addEventListener('storage', syncStorageEntries);
    window.addEventListener('storage', syncStorageBrainstormRecycleEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
      window.removeEventListener('storage', syncStorageEntries);
      window.removeEventListener('storage', syncStorageBrainstormRecycleEntries);
    };
  }, [defaultActiveTab, normalizedTabs, scale, storageKey]);

  useEffect(() => {
    if (!categoryMenu && !entryMenu && !promptDisableMenu) return;
    const closeMenu = (event: globalThis.MouseEvent | PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-library-context-menu="true"]')) return;
      setCategoryMenu(null);
      setEntryMenu(null);
      setPromptDisableMenu(null);
    };
    window.addEventListener('pointerdown', closeMenu, true);
    window.addEventListener('contextmenu', closeMenu, true);
    return () => {
      window.removeEventListener('pointerdown', closeMenu, true);
      window.removeEventListener('contextmenu', closeMenu, true);
    };
  }, [categoryMenu, entryMenu, promptDisableMenu]);

  useEffect(() => {
    if (!outlineStorageKey) {
      setOutlineEntries([]);
      return;
    }
    setOutlineEntries(readNormalizedEntries(outlineStorageKey));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncStorageEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncStorageEntries);
    };
  }, [outlineStorageKey]);

  useEffect(() => {
    if (normalizedTabs.includes(activeTab)) return;
    setRememberedActiveTab(normalizedTabs[0] ?? '');
  }, [activeTab, normalizedTabs, setRememberedActiveTab]);

  useEffect(() => {
    roleExpandedReloadRef.current = true;
    setExpandedRoleTypes(readExpandedStringSet(storageKey, ROLE_TAB, 'role_types'));
  }, [storageKey]);

  useEffect(() => {
    settingExpandedReloadRef.current = true;
    setExpandedSettingTypes(readExpandedStringSet(storageKey, activeTab, 'setting_types'));
  }, [activeTab, storageKey]);

  useEffect(() => {
    outlineExpandedReloadRef.current = true;
    setExpandedOutlineVolumeIds(readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes'));
  }, [activeTab, outlineStorageKey, storageKey]);

  useEffect(() => {
    setManualDetailOutlinePublishedChapterIds(
      readManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey),
    );
    setShowDetailOutlinePublished(false);
  }, [outlineStorageKey, storageKey]);

  useEffect(() => {
    if (roleExpandedReloadRef.current) {
      roleExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, ROLE_TAB, 'role_types', expandedRoleTypes);
  }, [expandedRoleTypes, storageKey]);

  useEffect(() => {
    if (settingExpandedReloadRef.current) {
      settingExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, activeTab, 'setting_types', expandedSettingTypes);
  }, [activeTab, expandedSettingTypes, storageKey]);

  useEffect(() => {
    if (outlineExpandedReloadRef.current) {
      outlineExpandedReloadRef.current = false;
      return;
    }
    persistExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes', expandedOutlineVolumeIds);
  }, [activeTab, expandedOutlineVolumeIds, outlineStorageKey, storageKey]);

  useEffect(() => {
    persistManualDetailOutlinePublishedChapterIds(
      outlineStorageKey ?? storageKey,
      manualDetailOutlinePublishedChapterIds,
    );
  }, [manualDetailOutlinePublishedChapterIds, outlineStorageKey, storageKey]);

  useEffect(() => {
    if (!detailOutlineChapterMenu.visible) return;
    const close = () => setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [detailOutlineChapterMenu.visible]);

  useEffect(() => {
    if (
      (!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) &&
      activeTab !== OUTLINE_LIBRARY_TAB &&
      activeTab !== DETAIL_OUTLINE_TAB
    )
      return;
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      if (prev.size > 0 || volumes.length === 0) return prev;
      return new Set(volumes.map((volume) => volume.id));
    });
  }, [activeTab, outlineStorageKey, storageKey, tabs, volumes]);

  useEffect(() => {
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => next.add(volume.id));
      return next;
    });
  }, [activeTab, outlineStorageKey, storageKey, volumes]);

  useEffect(() => {
    if (outlineSelectionType !== 'chapter' || selectedOutlineChapterId == null) return;
    const id = window.setTimeout(() => {
      outlinePreviewRefs.current[selectedOutlineChapterId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(id);
  }, [outlineSelectionType, selectedOutlineChapterId]);

  useEffect(() => {
    if (activeTab !== DETAIL_OUTLINE_TAB || outlineSelectionType === 'chapter') return;
    setOutlineSelectionType('chapter');
    setSelectedOutlineVolumeId(null);
  }, [activeTab, outlineSelectionType]);

  useEffect(() => {
    if (!shouldSyncOutlinePreviewDraft({ plotPointStandalone })) return;
    if (suppressNextOutlinePreviewSyncRef.current) {
      suppressNextOutlinePreviewSyncRef.current = false;
      return;
    }
    if (isDetailOutlineLikeTab(activeTab)) return;
    if (
      (!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) &&
      activeTab !== OUTLINE_LIBRARY_TAB
    )
      return;
    const isDetailOutlineTab = false;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    if (!isDetailOutlineTab && outlineSelectionType === 'volume') {
      const volume = volumes.find((item) => item.id === selectedOutlineVolumeId) ?? volumes[0];
      const content =
        currentOutlineEntries.find(
          (entry) =>
            (entry.tab === VOLUME_SUMMARY_TAB ||
              entry.tab === LEGACY_VOLUME_SUMMARY_TAB ||
              entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD) &&
            (entry.title === `${volume?.name ?? ''}梗概` ||
              entry.title === `${volume?.name ?? ''}摘要` ||
              entry.title === `${volume?.name ?? ''}概要`),
        )?.content ?? '';
      setOutlinePreviewDraft(content);
      return;
    }
    const chapters = volumes.flatMap((volume) => volume.chapters);
    const chapter = chapters.find((item) => item.id === selectedOutlineChapterId) ?? chapters[0];
    const chapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const chapterTitle = isDetailOutlineTab
      ? `第${chapter?.serialNumber ?? ''}章细纲`
      : `第${chapter?.serialNumber ?? ''}章梗概`;
    const legacyChapterTitle = `第${chapter?.serialNumber ?? ''}章摘要`;
    const olderLegacyChapterTitle = `第${chapter?.serialNumber ?? ''}章概要`;
    const chapterDisplayTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章章纲` : chapterTitle;
    const content =
      currentOutlineEntries.find(
        (entry) =>
          entry.tab === chapterTab &&
          (entry.title === chapterTitle ||
            entry.title === legacyChapterTitle ||
            entry.title === olderLegacyChapterTitle ||
            entry.title === chapterDisplayTitle),
      )?.content ?? '';
    setOutlinePreviewDraft(content);
  }, [
    activeTab,
    entries,
    outlineEntries,
    outlineSelectionType,
    outlineStorageKey,
    plotPointStandalone,
    selectedOutlineChapterId,
    selectedOutlineVolumeId,
    setOutlinePreviewDraft,
    tabs,
    volumes,
  ]);

  useEffect(() => {
    const updateTarget = () => {
      setTabPortalTarget(document.getElementById('workbench-modal-header-extra'));
      setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'));
    };
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persist = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next);
    setEntries(normalized);
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, normalized);
  };

  const persistBrainstormRecycle = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next).filter((entry) => entry.tab === BRAINSTORM_TAB);
    setBrainstormRecycleEntries(normalized);
    writeBrainstormRecycleEntries(storageKey, normalized);
  };

  const persistOutline = (next: WorkbenchLibraryEntry[]) => {
    if (!outlineStorageKey) {
      persist(next);
      return;
    }
    const normalized = normalizeEntries(next);
    setOutlineEntries(normalized);
    writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
  };

  const addEntry = () => {
    const entry = createWorkbenchLibraryEntry(activeTab, `新建${activeTab}`);
    persist([entry, ...entries]);
    setSelectedId(entry.id);
  };

  const addEntryToTab = (tab: string, title: string) => {
    const entry = createWorkbenchLibraryEntry(tab, title);
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
  };

  const addSettingTypeByName = (name: string) => {
    const type = name.trim();
    if (!type) return;
    const selectedSettingWorkspaceDomain = getSelectedSettingWorkspaceDomain();
    setCustomSettingTypes((prev) => {
      if (prev.includes(type) || DEFAULT_SETTING_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    if (selectedSettingWorkspaceDomain && getSettingTypeWorkspaceDomain(type) !== selectedSettingWorkspaceDomain) {
      setCustomSettingTypeDomains((prev) => {
        if (prev[type] === selectedSettingWorkspaceDomain) return prev;
        const next = { ...prev, [type]: selectedSettingWorkspaceDomain };
        localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(type));
  };

  const addSettingType = () => {
    addSettingTypeByName(settingTypeDraft);
    setSettingTypeDraft('');
  };

  const getSettingCreateTypeOptions = () => {
    if (activeTab === SETTING_TAB && outlineSettingScope === 'character') return roleTypeOptions;
    if (activeTab === SETTING_TAB) {
      const domain = getSelectedSettingWorkspaceDomain();
      return domain
        ? settingTypeOptions.filter((type) => getSettingTypeWorkspaceDomain(type) === domain)
        : settingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type));
    }
    return settingTypeOptions;
  };

  const getValidSettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    if (settingCreateTypeDraft && options.includes(settingCreateTypeDraft)) return settingCreateTypeDraft;
    return options[0] ?? DEFAULT_SETTING_ENTRY_TYPE;
  };

  const getSelectedEntrySettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    const selectedId = tabConfigs[activeTab]?.selectedId;
    const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) : null;
    if (!selectedEntry || !isSettingLikeTab(selectedEntry.tab)) return getValidSettingCreateType();
    const selectedType = parseSettingContent(selectedEntry.content).type;
    return options.includes(selectedType) ? selectedType : getValidSettingCreateType();
  };

  const addSetting = (tab = SETTING_TAB, titleDraft = settingTitleDraft, typeDraft?: string) => {
    const title = titleDraft.trim() || `新建${tab}`;
    const selectedSettingWorkspaceType = typeDraft ?? getSelectedSettingWorkspaceType();
    const entry = {
      ...createWorkbenchLibraryEntry(tab, title),
      content: stringifySettingContent({
        type:
          tab === SETTING_TAB
            ? (selectedSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE)
            : DEFAULT_SETTING_ENTRY_TYPE,
        body: '',
      }),
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
    updateTabConfig(tab, { titleDraft: '' });
  };

  const confirmSettingCreate = () => {
    if (!settingCreateDialog) return;
    const createTitle = settingCreateDraft.trim();
    if (!createTitle) return;
    const creatingOutlineCharacter =
      settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
    if (settingCreateDialog === 'category') {
      if (creatingOutlineCharacter) {
        addRoleTypeByName(createTitle);
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
      addRole(selectedCreateType, { switchToRoleTab: false, title: createTitle });
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

  const smartImportSettings = () => {
    if (activeTabConfig.smartImportLocked !== false) return;
    const sourceText = stripAiThinkingBlock(
      getLatestUsefulAiText(activeTab === SETTING_TAB ? aiOutput : aiResult || aiOutput),
    );
    const taggedSegments = createTaggedSettingSegments(sourceText);
    const markdownSegments = createMarkdownSettingSegments(sourceText);
    const resolvedSettingTypes = new Set(settingTypeOptions);
    const hasTaggedSegments = taggedSegments.settingSegments.length > 0 || taggedSegments.roleSegments.length > 0;
    const segments = hasTaggedSegments
      ? taggedSegments.settingSegments
      : markdownSegments.length > 0
        ? markdownSegments
        : createSmartSettingSegments(sourceText);
    const roleSegments = hasTaggedSegments ? taggedSegments.roleSegments : [];
    if (segments.length === 0 && roleSegments.length === 0) return;
    const remainingEntries = [...entries];
    const importedEntries: WorkbenchLibraryEntry[] = [];
    const importedRoleEntries: WorkbenchLibraryEntry[] = [];
    const importedCustomTypes = new Set<string>();
    const importedSettingTypes = new Set<string>();
    const importedRoleTypes = new Set<string>();
    segments.forEach((segment) => {
      const type = normalizeSettingType(segment.type);
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE) {
        importedSettingTypes.add(type);
      }
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !resolvedSettingTypes.has(type)) {
        importedCustomTypes.add(type);
      }
      const titleKey = normalizeImportedSettingKey(segment.title);
      const typeKey = normalizeImportedSettingKey(type);
      const body = normalizeImportedSettingBody(segment.body);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== SETTING_TAB) return false;
        const setting = parseSettingContent(entry.content);
        return (
          normalizeImportedSettingKey(entry.title) === titleKey && normalizeImportedSettingKey(setting.type) === typeKey
        );
      });

      if (existingIndex >= 0) {
        const [existingEntry] = remainingEntries.splice(existingIndex, 1);
        const existingSetting = parseSettingContent(existingEntry.content);
        importedEntries.push({
          ...existingEntry,
          content:
            normalizeImportedSettingBody(existingSetting.body) === body
              ? existingEntry.content
              : stringifySettingContent({ type, body }),
          updatedAt:
            normalizeImportedSettingBody(existingSetting.body) === body
              ? existingEntry.updatedAt
              : new Date().toLocaleString('zh-CN'),
        });
        return;
      }

      importedEntries.push({
        ...createWorkbenchLibraryEntry(SETTING_TAB, segment.title),
        content: stringifySettingContent({ type, body }),
      });
    });
    roleSegments.forEach((segment) => {
      const sections = parseSectionedSettingBody(segment.body);
      const importedType = getImportedRoleSection(sections, ['身份定位', '角色定位', '人物定位', '身份', '类型']);
      const shouldMatchMaleProtagonist = isMaleProtagonistRoleType(importedType) || /男主角|主角/.test(segment.title);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== ROLE_TAB) return false;
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
        const nextTitle = buildImportedRoleEntryTitle(segment, existingEntry.title);
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

      const nextTitle = buildImportedRoleEntryTitle(segment);
      const nextRole = createImportedRoleContent(segment);
      importedRoleTypes.add(nextRole.type);
      importedRoleEntries.push({
        ...createWorkbenchLibraryEntry(ROLE_TAB, nextTitle),
        content: stringifyRoleContent(nextRole),
      });
    });
    persist([...importedEntries, ...importedRoleEntries, ...remainingEntries]);
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
      segments.forEach((segment) => next.add(normalizeSettingType(segment.type)));
      return next;
    });
    if (importedRoleTypes.size > 0) {
      setExpandedRoleTypes((prev) => new Set([...prev, ...importedRoleTypes]));
    }
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
    updateEntry(targetId, {
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

  function closeBrainstormReader() {
    setSelectedBrainstormReaderId(null);
    setIsBrainstormReaderOpen(false);
  }

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
      otherSettingLinkTabs.find(
        (tab) => tab.id === otherSettingReaderTabId && tab.groups.some((group) => group.entries.length > 0),
      ) ??
      otherSettingLinkTabs.find((tab) => tab.groups.some((group) => group.entries.length > 0)) ??
      otherSettingLinkTabs[0];
    if (preferredTab) setOtherSettingReaderTabId(preferredTab.id);
    const firstEntry = preferredTab?.groups.flatMap((group) => group.entries)[0] ?? otherSettingLinkFlatEntries[0];
    setOtherSettingReaderPreviewId(linkedIds[0] ?? firstEntry?.id ?? '');
    setIsOtherSettingReaderOpen(true);
  }

  function closeOtherSettingReader() {
    setOtherSettingReaderQuery('');
    setIsOtherSettingReaderOpen(false);
  }

  function toggleDraftOtherSettingReaderId(id: string) {
    setDraftOtherSettingReaderIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllCurrentOtherSettingLinkTab() {
    const ids = (selectedOtherSettingLinkTab?.groups ?? []).flatMap((group) => group.entries).map((entry) => entry.id);
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
      otherSettingLinkFlatEntries.some((entry) => entry.id === id),
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

  const getActiveLinkedSettingSnapshot = (): { source: SettingLinkSource; title: string; text: string } => {
    const source = getActiveSettingLinkSource();
    if (source === 'current') {
      if (outlineSettingScope === 'character') {
        const currentRoleId = tabConfigs[ROLE_TAB]?.selectedId ?? null;
        const currentRoleEntry = roleEntries.find((entry) => entry.id === currentRoleId) ?? roleEntries[0] ?? null;
        const currentRole = currentRoleEntry ? parseRoleContent(currentRoleEntry.content) : null;
        return {
          source,
          title: currentRoleEntry?.title ?? '当前人物设定',
          text: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) : '',
        };
      }
      const currentEntry = selectedEntry?.tab === SETTING_TAB ? selectedEntry : null;
      return {
        source,
        title: currentEntry?.title ?? '当前设定',
        text: getSettingEntryBody(currentEntry),
      };
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
      const linkedEntries = activeOtherSettingLinkEntries;
      return {
        source,
        title: linkedEntries.length > 0 ? `其他设定 ${linkedEntries.length} 项` : '其他设定',
        text: linkedEntries
          .map((entry) =>
            [`【${entry.tabTitle} / ${entry.groupName} / ${entry.title}】`, entry.text].filter(Boolean).join('\n'),
          )
          .join('\n\n'),
      };
    }
    return {
      source: null,
      title: '',
      text: '',
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
    activeTab,
    activeTabConfig.loadedBrainstormId,
    activeTabConfig.loadedBrainstormText,
    activeTabConfig.loadedBrainstormTitle,
    entries,
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
    const linkedSettingContext = formatSettingLinkedContextForAi(getActiveLinkedSettingSnapshot());
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
    const hasLinkedSettingContext = activeTab === SETTING_TAB && Boolean(linkedSettingContext.text.trim());
    const hasLinkedBrainstorm = hasLinkedSettingContext && linkedSettingContext.source === 'brainstorm';
    const linkedSettingContextForAi = formatSettingLinkedContextForAi(linkedSettingContext);
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
        contextText: hasLinkedSettingContext ? linkedSettingContextForAi : '',
        contextWordCount: countTextWords(hasLinkedSettingContext ? linkedSettingContext.text : ''),
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
    const pendingOutput = `${aiOutput.trim() ? `${aiOutput.trim()}\n\n` : ''}[[USER]]\n${visibleUserText}\n\n[[AI]]\n正在生成...`;
    const replacePendingOutput = (content: string) =>
      pendingOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, `[[AI]]\n${content}`);
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
        roleEntries.map((entry) => parseRoleContent(entry.content).type),
        type,
      ),
    ) ??
    DEFAULT_ROLE_TYPES[0] ??
    UNCATEGORIZED_TYPE;

  const addRole = (type = getDefaultRoleCreateType(), options: { switchToRoleTab?: boolean; title?: string } = {}) => {
    const normalizedType = normalizeWorkbenchRoleType(type);
    if (
      !canCreateWorkbenchRoleInType(
        roleEntries.map((entry) => parseRoleContent(entry.content).type),
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

  const createEditableSettingEntry = (updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    const title = updates.title?.trim() || `新建${activeTab}`;
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
        roleEntries
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

  const moveLibraryEntryToType = (entryId: string, targetTab: string, targetType: string) => {
    const normalizedTargetTab = normalizeTabName(targetTab);
    const draggedEntry = entries.find((entry) => entry.id === entryId);
    if (!draggedEntry || draggedEntry.tab !== normalizedTargetTab) return;

    let nextDraggedEntry = draggedEntry;
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(draggedEntry.content);
      if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;
      if (
        !canCreateWorkbenchRoleInType(
          entries
            .filter((item) => item.id !== draggedEntry.id && item.tab === ROLE_TAB)
            .map((item) => parseRoleContent(item.content).type),
          targetType,
        )
      )
        return;
      if (role.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifyRoleContent({
            ...role,
            type: targetType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(draggedEntry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    } else if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(draggedEntry.content);
      if (setting.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    }

    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    const targetTypeLastIndex = nextEntries.reduce((lastIndex, entry, index) => {
      if (entry.tab !== normalizedTargetTab) return lastIndex;
      if (normalizedTargetTab === ROLE_TAB) {
        return parseRoleContent(entry.content).type === targetType ? index : lastIndex;
      }
      if (isSettingLikeTab(normalizedTargetTab)) {
        return parseSettingContent(entry.content).type === targetType ? index : lastIndex;
      }
      return lastIndex;
    }, -1);
    if (targetTypeLastIndex >= 0) {
      nextEntries.splice(targetTypeLastIndex + 1, 0, nextDraggedEntry);
    } else {
      const targetTabLastIndex = nextEntries.reduce(
        (lastIndex, entry, index) => (entry.tab === normalizedTargetTab ? index : lastIndex),
        -1,
      );
      nextEntries.splice(targetTabLastIndex + 1, 0, nextDraggedEntry);
    }
    persist(nextEntries);
    if (normalizedTargetTab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(targetType));
      return;
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(targetType));
  };

  const createLibraryEntryPreviewForType = (entry: WorkbenchLibraryEntry, targetTab: string, targetType: string) => {
    const normalizedTargetTab = normalizeTabName(targetTab);
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(entry.content);
      return {
        ...entry,
        content: stringifyRoleContent({ ...role, type: targetType }),
      };
    }
    if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(entry.content);
      return {
        ...entry,
        content: stringifySettingContent({ ...setting, type: targetType }),
      };
    }
    return entry;
  };

  const getPreviewedLibraryGroupEntries = (groupEntries: WorkbenchLibraryEntry[], tab: string, type: string) => {
    if (!libraryEntryDropPreview || libraryEntryDropPreview.tab !== tab) return groupEntries;
    const draggedEntry = entries.find((entry) => entry.id === libraryEntryDropPreview.entryId);
    if (!draggedEntry || draggedEntry.tab !== tab) return groupEntries;

    const groupWithoutDraggedEntry = groupEntries.filter((entry) => entry.id !== draggedEntry.id);
    if (libraryEntryDropPreview.type !== type) {
      return groupWithoutDraggedEntry.length === groupEntries.length ? groupEntries : groupWithoutDraggedEntry;
    }

    const previewEntry = createLibraryEntryPreviewForType(draggedEntry, tab, type);
    const nextEntries = [...groupWithoutDraggedEntry];
    if (libraryEntryDropPreview.mode === 'target-position' && libraryEntryDropPreview.targetEntryId) {
      const targetIndex = groupEntries.findIndex((entry) => entry.id === libraryEntryDropPreview.targetEntryId);
      const insertIndex = targetIndex >= 0 ? Math.min(targetIndex, nextEntries.length) : nextEntries.length;
      nextEntries.splice(insertIndex, 0, previewEntry);
      return nextEntries;
    }
    nextEntries.push(previewEntry);
    return nextEntries;
  };

  const getLibraryEntriesForType = (tab: string, type: string) => {
    const normalizedTab = normalizeTabName(tab);
    return entries.filter((entry) => {
      if (entry.tab !== normalizedTab) return false;
      if (normalizedTab === ROLE_TAB) return parseRoleContent(entry.content).type === type;
      if (isSettingLikeTab(normalizedTab)) return parseSettingContent(entry.content).type === type;
      return false;
    });
  };

  const getLibraryEntryTargetIdAtPreviewIndex = (targetTab: string, targetType: string, previewIndex: number) => {
    const groupEntries = getLibraryEntriesForType(targetTab, targetType);
    if (!Number.isInteger(previewIndex) || groupEntries.length === 0) return null;
    const targetIndex = Math.max(0, Math.min(previewIndex, groupEntries.length - 1));
    return groupEntries[targetIndex]?.id ?? null;
  };

  const moveLibraryEntryBefore = (entryId: string, targetEntryId: string, targetTab: string, targetType: string) => {
    if (!entryId || entryId === targetEntryId) return;
    const normalizedTargetTab = normalizeTabName(targetTab);
    const draggedEntry = entries.find((entry) => entry.id === entryId);
    const targetEntry = entries.find((entry) => entry.id === targetEntryId);
    if (
      !draggedEntry ||
      !targetEntry ||
      draggedEntry.tab !== normalizedTargetTab ||
      targetEntry.tab !== normalizedTargetTab
    )
      return;

    let nextDraggedEntry = draggedEntry;
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(draggedEntry.content);
      if (role.type !== targetType) {
        if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;
        if (
          !canCreateWorkbenchRoleInType(
            entries
              .filter((entry) => entry.id !== draggedEntry.id && entry.tab === ROLE_TAB)
              .map((entry) => parseRoleContent(entry.content).type),
            targetType,
          )
        )
          return;
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifyRoleContent({
            ...role,
            type: targetType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(draggedEntry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    } else if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(draggedEntry.content);
      if (setting.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    }

    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    const targetIndex = entries.findIndex((entry) => entry.id === targetEntryId);
    if (targetIndex < 0) return;
    nextEntries.splice(Math.min(targetIndex, nextEntries.length), 0, nextDraggedEntry);
    persist(nextEntries);
    if (normalizedTargetTab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(targetType));
      return;
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(targetType));
  };

  const commitLibraryEntryDropPreview = (preview: LibraryEntryDropPreviewState) => {
    if (!preview) return;
    if (preview.mode === 'group-end') {
      moveLibraryEntryToType(preview.entryId, preview.tab, preview.type);
      return;
    }
    if (!preview.targetEntryId) return;
    const targetEntry = entries.find((entry) => entry.id === preview.targetEntryId);
    if (!targetEntry) return;
    moveLibraryEntryBefore(preview.entryId, preview.targetEntryId, targetEntry.tab, preview.type);
  };

  const handleLibraryEntryDragStart = (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    libraryDropHandledRef.current = false;
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry({ entryId: entry.id, tab: entry.tab, type });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', entry.id);
  };

  const beginLibraryEntryPointerDrag = (
    event: ReactPointerEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    const nestedButton = target.closest('button');
    if (nestedButton && nestedButton !== event.currentTarget) return;
    libraryEntryPointerDragRef.current?.cleanup();
    const dragElement = event.currentTarget;
    const pointerId = event.pointerId;
    const activationTimer = window.setTimeout(() => {
      const pointerDrag = libraryEntryPointerDragRef.current;
      if (pointerDrag?.pointerId === pointerId) pointerDrag.armed = true;
    }, LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS);
    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      updateLibraryEntryPointerPreviewAt(moveEvent.clientX, moveEvent.clientY);
      if (libraryEntryPointerDragRef.current?.active) moveEvent.preventDefault();
    };
    const handleWindowPointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      finishLibraryEntryPointerDragById(pointerId);
    };
    window.addEventListener('pointermove', handleWindowPointerMove, { capture: true });
    window.addEventListener('pointerup', handleWindowPointerEnd, { capture: true });
    window.addEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
    libraryEntryPointerDragRef.current = {
      entryId: entry.id,
      tab: entry.tab,
      type,
      pointerId,
      element: dragElement,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      armed: false,
      activationTimer,
      lastPreviewX: event.clientX,
      lastPreviewY: event.clientY,
      lastPreviewTargetKey: null,
      cleanup: () => {
        window.clearTimeout(activationTimer);
        window.removeEventListener('pointermove', handleWindowPointerMove, { capture: true });
        window.removeEventListener('pointerup', handleWindowPointerEnd, { capture: true });
        window.removeEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
      },
    };
    try {
      dragElement.setPointerCapture(pointerId);
    } catch {
      // Pointer capture is a drag nicety; the document fallback below still works.
    }
  };

  const updateLibraryEntryPointerPreviewAt = (clientX: number, clientY: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag) return;
    const distance = Math.hypot(clientX - pointerDrag.startX, clientY - pointerDrag.startY);
    if (!pointerDrag.active && !pointerDrag.armed) return;
    if (!pointerDrag.active && distance < LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE) return;
    if (!pointerDrag.active) {
      pointerDrag.active = true;
      libraryPointerSuppressClickRef.current = true;
      libraryDropHandledRef.current = false;
      setDraggingLibraryEntry({ entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: pointerDrag.type });
    }

    const hoverElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const hoverEntry = hoverElement?.closest('[data-library-entry-id]') as HTMLElement | null;
    if (hoverEntry?.dataset.libraryEntryId && hoverEntry.dataset.libraryEntryTab === pointerDrag.tab) {
      const targetType = hoverEntry.dataset.libraryEntryType || pointerDrag.type;
      const previewIndex = Number(hoverEntry.dataset.libraryEntryPreviewIndex);
      const targetEntryId =
        getLibraryEntryTargetIdAtPreviewIndex(pointerDrag.tab, targetType, previewIndex) ??
        hoverEntry.dataset.libraryEntryId;
      const targetKey = `entry:${targetEntryId}`;
      if (
        targetEntryId === pointerDrag.entryId &&
        (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey)
      )
        return;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId &&
          current.tab === pointerDrag.tab &&
          current.type === targetType &&
          current.mode === 'target-position' &&
          current.targetEntryId === targetEntryId
          ? current
          : {
              entryId: pointerDrag.entryId,
              tab: pointerDrag.tab,
              type: targetType,
              mode: 'target-position',
              targetEntryId,
            },
      );
      return;
    }

    const hoverGroup = hoverElement?.closest('[data-library-group-type]') as HTMLElement | null;
    if (hoverGroup?.dataset.libraryGroupTab === pointerDrag.tab) {
      if (!isLibraryPointerPastGroupEntries(hoverGroup, pointerDrag, clientY)) return;
      const targetType = hoverGroup.dataset.libraryGroupType || pointerDrag.type;
      const targetKey = `group:${targetType}`;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryDropTarget((previous) =>
        previous?.tab === pointerDrag.tab && previous.type === targetType
          ? previous
          : { tab: pointerDrag.tab, type: targetType },
      );
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId &&
          current.tab === pointerDrag.tab &&
          current.type === targetType &&
          current.mode === 'group-end'
          ? current
          : { entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: targetType, mode: 'group-end' },
      );
    }
  };

  const updateLibraryEntryPointerPreview = (event: ReactPointerEvent<HTMLElement>) => {
    updateLibraryEntryPointerPreviewAt(event.clientX, event.clientY);
    if (libraryEntryPointerDragRef.current?.active) event.preventDefault();
  };

  const finishLibraryEntryPointerDragById = (pointerId: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag || pointerDrag.pointerId !== pointerId) return;
    libraryEntryPointerDragRef.current = null;
    pointerDrag.cleanup();
    try {
      pointerDrag.element.releasePointerCapture(pointerId);
    } catch {
      // Ignore release failures when capture was not established.
    }
    if (!pointerDrag?.active) return;
    commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    window.setTimeout(() => {
      libraryPointerSuppressClickRef.current = false;
    }, 0);
  };

  const finishLibraryEntryPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    finishLibraryEntryPointerDragById(event.pointerId);
  };

  const handleLibraryCategoryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
    shouldPreviewGroupEnd = false,
  ) => {
    if (!draggingLibraryEntry || draggingLibraryEntry.tab !== tab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setLibraryDropTarget((current) => (current?.tab === tab && current.type === type ? current : { tab, type }));
    if (!shouldPreviewGroupEnd) return;
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId &&
        current.tab === tab &&
        current.type === type &&
        current.mode === 'group-end'
        ? current
        : { entryId: draggingLibraryEntry.entryId, tab, type, mode: 'group-end' },
    );
  };

  const handleLibraryCategoryDragLeave = (event: ReactDragEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };

  const handleLibraryCategoryDrop = (event: ReactDragEvent<HTMLElement>, tab: string, type: string) => {
    event.preventDefault();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== tab) return;
    moveLibraryEntryToType(entryId, tab, type);
  };

  const handleLibraryEntryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    if (!draggingLibraryEntry) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    if (draggingLibraryEntry.tab !== targetEntry.tab) return;
    const targetEntryId =
      typeof previewIndex === 'number'
        ? (getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id)
        : targetEntry.id;
    if (draggingLibraryEntry.entryId === targetEntryId && !libraryEntryDropPreviewRef.current) return;
    setLibraryDropTarget(null);
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId &&
        current.tab === targetEntry.tab &&
        current.type === targetType &&
        current.mode === 'target-position' &&
        current.targetEntryId === targetEntryId
        ? current
        : {
            entryId: draggingLibraryEntry.entryId,
            tab: targetEntry.tab,
            type: targetType,
            mode: 'target-position',
            targetEntryId,
          },
    );
  };

  const handleLibraryEntryDrop = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    const currentPreview = libraryEntryDropPreviewRef.current;
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== targetEntry.tab) return;
    if (currentPreview?.entryId === entryId) {
      commitLibraryEntryDropPreview(currentPreview);
      return;
    }
    const targetEntryId =
      typeof previewIndex === 'number'
        ? (getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id)
        : targetEntry.id;
    moveLibraryEntryBefore(entryId, targetEntryId, targetEntry.tab, targetType);
  };

  const handleLibraryEntryDragEnd = () => {
    if (!libraryDropHandledRef.current) commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    libraryDropHandledRef.current = false;
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };

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
    const nextEntry = { ...restored, tab: BRAINSTORM_TAB, updatedAt: new Date().toLocaleString('zh-CN') };
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
      if (roleTypeOptions.includes(nextType)) return;
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
    if (settingTypeOptions.includes(nextType)) return;
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
          roleEntries.map((entry) => parseRoleContent(entry.content).type),
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

  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [entries]);
  const roleTypeOptions = useMemo(() => {
    const entryTypes = roleEntries
      .map((entry) => normalizeWorkbenchRoleType(parseRoleContent(entry.content).type))
      .filter(Boolean);
    const hidden = new Set(hiddenRoleTypes);
    const merged = Array.from(
      new Set([
        ...DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
        ...customRoleTypes
          .map((type) => normalizeWorkbenchRoleType(type))
          .filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
        ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ]),
    );
    return merged;
  }, [customRoleTypes, hiddenRoleTypes, roleEntries]);
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
    [roleTypeOptions, searchedRoles],
  );
  const settingEntries = useMemo(() => entries.filter((entry) => entry.tab === SETTING_TAB), [entries]);
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
  }, [customSettingTypes, hiddenSettingTypes, settingEntries]);
  useEffect(() => {
    if (roleTypeOptions.length === 0) return;
    setExpandedRoleTypes((prev) => {
      const next = new Set(prev);
      roleTypeOptions.forEach((type) => next.add(type));
      if (next.size === prev.size) return prev;
      roleExpandedReloadRef.current = true;
      return next;
    });
  }, [roleTypeOptions, storageKey]);
  useEffect(() => {
    if (settingTypeOptions.length === 0) return;
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      settingTypeOptions.forEach((type) => next.add(type));
      if (next.size === prev.size) return prev;
      settingExpandedReloadRef.current = true;
      return next;
    });
  }, [activeTab, settingTypeOptions, storageKey]);
  const settingImportFormatGuideTabs = useMemo(
    () =>
      buildSettingImportFormatTabs({
        visibleSettingTypes: settingTypeOptions,
        settingEntries,
        getSettingTypeWorkspaceDomain,
      }),
    [getSettingTypeWorkspaceDomain, settingEntries, settingTypeOptions],
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
  }, [getSettingTypeWorkspaceDomain, groupedRoles, settingEntries, settingTypeOptions]);
  const otherSettingLinkFlatEntries = useMemo(
    () => otherSettingLinkTabs.flatMap((tab) => tab.groups.flatMap((group) => group.entries)),
    [otherSettingLinkTabs],
  );
  const activeOtherSettingLinkEntries = useMemo(() => {
    if (!isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)) return [];
    const entryMap = new Map(otherSettingLinkFlatEntries.map((entry) => [entry.id, entry]));
    return normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds)
      .map((id) => entryMap.get(id))
      .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
  }, [activeTabConfig.associationSessionId, activeTabConfig.linkedOtherSettingIds, otherSettingLinkFlatEntries]);
  const deletableRoleEntries = useMemo(
    () => roleEntries.filter((entry) => !isMaleProtagonistRoleType(parseRoleContent(entry.content).type)),
    [roleEntries],
  );
  const deletableSettingEntries = useMemo(
    () => settingEntries.filter((entry) => !isLockedDefaultSettingEntry(entry)),
    [settingEntries],
  );
  const selectedSettingClearDomain =
    activeTab === SETTING_TAB && outlineSettingScope !== 'character' ? getSelectedSettingWorkspaceDomain() : null;
  const deletableSettingEntriesForClear = useMemo(
    () =>
      deletableSettingEntries.filter((entry) => {
        const typeDomain = getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type);
        return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
      }),
    [deletableSettingEntries, getSettingTypeWorkspaceDomain, selectedSettingClearDomain],
  );
  const deletableSettingTypes = useMemo(
    () =>
      settingTypeOptions.filter((type) => {
        if (type === UNCATEGORIZED_TYPE || DEFAULT_SETTING_TYPES.includes(type)) return false;
        const typeDomain = getSettingTypeWorkspaceDomain(type);
        return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
      }),
    [getSettingTypeWorkspaceDomain, selectedSettingClearDomain, settingTypeOptions],
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
  const openLibraryAiLog = useCallback((scope: 'library' | 'outline') => {
    setLibraryAiLogScope(scope);
    setIsLibraryAiLogOpen(true);
  }, []);
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
    if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;
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
      plotPointStandalone,
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
  const pendingDeleteLabel = pendingEntryDelete?.tab === ROLE_TAB ? '角色' : pendingEntryDelete?.tab;
  const pendingDeleteDescription =
    pendingEntryDelete?.tab === BRAINSTORM_TAB
      ? `确定要删除脑洞「${pendingEntryDelete?.title ?? ''}」吗？\n删除后会进入脑洞回收站，可以恢复。`
      : `确定要删除${pendingDeleteLabel ?? '内容'}「${pendingEntryDelete?.title ?? ''}」吗？\n删除后无法恢复。`;
  const deleteConfirmDialog = (
    <ConfirmDialog
      isOpen={Boolean(pendingEntryDelete)}
      title="确认删除"
      description={pendingDeleteDescription}
      confirmText="删除"
      cancelText="取消"
      confirmVariant="danger"
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
    <ConfirmDialog
      isOpen={isClearSettingsConfirmOpen}
      title={
        clearSettingsConfirmStep === 1
          ? `确认清空${currentClearSettingsMeta.label}`
          : `再次确认清空${currentClearSettingsMeta.label}`
      }
      description={
        clearSettingsConfirmStep === 1
          ? `${currentClearSettingsMeta.description}\n\n这是第一次确认，点击确认后还需要再确认一次。`
          : `最后确认：即将清空${currentClearSettingsMeta.label}，这个操作会立即生效。请确认不是误点。`
      }
      confirmText={clearSettingsConfirmStep === 1 ? '确认，继续' : `确认清空${currentClearSettingsMeta.label}`}
      cancelText="再看看"
      confirmVariant="danger"
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
  const otherSettingReaderKeyword = otherSettingReaderQuery.trim();
  const visibleOtherSettingGroups = (selectedOtherSettingLinkTab?.groups ?? [])
    .map((group) => ({
      ...group,
      entries: group.entries.filter(
        (entry) =>
          !otherSettingReaderKeyword ||
          `${entry.title} ${entry.type} ${entry.groupName} ${entry.text}`.includes(otherSettingReaderKeyword),
      ),
    }))
    .filter((group) => group.entries.length > 0);
  const selectedOtherSettingLinkEntry =
    otherSettingLinkFlatEntries.find((entry) => entry.id === otherSettingReaderPreviewId) ??
    visibleOtherSettingGroups.flatMap((group) => group.entries)[0] ??
    otherSettingLinkFlatEntries[0] ??
    null;
  const draftOtherSettingLinkEntries = Array.from(draftOtherSettingReaderIds)
    .map((id) => otherSettingLinkFlatEntries.find((entry) => entry.id === id))
    .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
  const draftOtherSettingLinkWordCount = draftOtherSettingLinkEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const previewOtherSettingReaderEntry = (entryId: string) => {
    const entry = otherSettingLinkFlatEntries.find((item) => item.id === entryId);
    if (entry) setOtherSettingReaderTabId(entry.tabId);
    setOtherSettingReaderPreviewId(entryId);
  };
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
  const brainstormEntries = entries.filter((entry) => entry.tab === BRAINSTORM_TAB);
  const closeBrainstormRecycleModal = () => {
    setIsClearBrainstormRecycleConfirmOpen(false);
    setIsBrainstormRecycleOpen(false);
  };
  const brainstormReaderModal = (
    <BrainstormReaderModal
      isOpen={isBrainstormReaderOpen}
      entries={brainstormEntries}
      selectedId={selectedBrainstormReaderId}
      onSelect={setSelectedBrainstormReaderId}
      onClose={closeBrainstormReader}
      onConfirm={confirmBrainstormReaderSelection}
    />
  );
  const brainstormRecycleModal = (
    <BrainstormRecycleModal
      isOpen={isBrainstormRecycleOpen}
      entries={brainstormRecycleEntries}
      isClearConfirmOpen={isClearBrainstormRecycleConfirmOpen}
      onClose={closeBrainstormRecycleModal}
      onRequestClear={() => setIsClearBrainstormRecycleConfirmOpen(true)}
      onCancelClear={() => setIsClearBrainstormRecycleConfirmOpen(false)}
      onConfirmClear={clearBrainstormRecycle}
      onRestore={restoreBrainstormEntry}
      onPermanentDelete={permanentlyDeleteBrainstormEntry}
    />
  );
  const clearBrainstormRecycleConfirmDialog = null;
  const brainstormPromptManagerModal = (
    <BrainstormPromptManagerModal
      isOpen={isBrainstormPromptManagerOpen}
      prompts={brainstormPrompts}
      onClose={closeBrainstormPromptManager}
      onCreate={openBrainstormPromptCreate}
      onEdit={openBrainstormPromptEdit}
      onDelete={deleteBrainstormPrompt}
      onTogglePin={togglePin}
    />
  );
  const brainstormPromptEditModal = (
    <BrainstormPromptEditModal
      isOpen={Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt)}
      isCreating={isCreatingBrainstormPrompt}
      draft={brainstormPromptDraft}
      onDraftChange={(patch) => setBrainstormPromptDraft((prev) => ({ ...prev, ...patch }))}
      onClose={closeBrainstormPromptEdit}
      onSave={saveBrainstormPromptEdit}
    />
  );
  const brainstormGenerateConfirmModal = (
    <BrainstormGenerateConfirmModal
      draft={brainstormGenerateDraft}
      isLoading={isLibraryAiLoading}
      isScrolling={isBrainstormConfirmScrolling}
      onScroll={handleBrainstormConfirmScroll}
      onClose={() => setBrainstormGenerateDraft(null)}
      onConfirm={confirmBrainstormGenerate}
    />
  );
  const settingCreateIsCharacter =
    settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
  const settingCreateItemLabel = settingCreateIsCharacter ? '角色' : '设定';
  const settingCreateTypeOptions = settingCreateDialog === 'setting' ? getSettingCreateTypeOptions() : [];
  const settingCreateTypeValue = settingCreateTypeOptions.includes(settingCreateTypeDraft)
    ? settingCreateTypeDraft
    : (settingCreateTypeOptions[0] ?? '');
  const closeSettingCreateDialog = () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  };
  const settingCreateModal = (
    <SettingCreateDialog
      mode={settingCreateDialog}
      draft={settingCreateDraft}
      itemLabel={settingCreateItemLabel}
      typeOptions={settingCreateTypeOptions}
      typeValue={settingCreateTypeValue}
      onDraftChange={setSettingCreateDraft}
      onTypeChange={setSettingCreateTypeDraft}
      onClose={closeSettingCreateDialog}
      onConfirm={confirmSettingCreate}
    />
  );
  const categoryRenameModal = (
    <CategoryRenameDialog
      isOpen={Boolean(pendingCategoryRename)}
      draft={categoryRenameDraft}
      onDraftChange={setCategoryRenameDraft}
      onClose={closeCategoryRenameDialog}
      onConfirm={confirmCategoryRename}
    />
  );

  if (activeTab === ROLE_TAB) {
    const roleHistoryModal =
      selectedEntry && selectedRole && roleHistoryEntryId === selectedEntry.id ? (
        <RoleHistoryModal
          entryTitle={selectedEntry.title}
          role={selectedRole}
          onClose={() => setRoleHistoryEntryId(null)}
        />
      ) : null;

    return (
      <WorkbenchRoleLibraryView
        scaleStyle={scaleStyle}
        topTabs={renderTopTabs()}
        overlays={
          <>
            {categoryContextMenu}
            {entryContextMenu}
            {roleHistoryModal}
            {deleteConfirmDialog}
            {fieldSizeSettingsModal}
            {settingCreateModal}
            {categoryRenameModal}
            {managementModal && (
              <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />
            )}
          </>
        }
        settingLibraryMode={settingLibraryMode}
        settingLibraryLeftWidth={settingLibraryLeftWidth}
        settingLibraryRightWidth={settingLibraryRightWidth}
        sidebar={
          <WorkbenchRoleSidebar
            roleTab={ROLE_TAB}
            roleSearch={roleSearch}
            roleTypeDraft={roleTypeDraft}
            roleNameDraft={roleNameDraft}
            groupedRoles={groupedRoles}
            expandedRoleTypes={expandedRoleTypes}
            libraryDropTarget={libraryDropTarget}
            draggingLibraryEntry={draggingLibraryEntry}
            selectedEntryId={selectedEntry?.id}
            fieldSizeSpecs={fieldSizeSpecs}
            libraryPointerSuppressClickRef={libraryPointerSuppressClickRef}
            getFieldSizeStyle={getFieldSizeStyle}
            getPreviewedLibraryGroupEntries={getPreviewedLibraryGroupEntries}
            setExpandedRoleTypes={setExpandedRoleTypes}
            setRoleSearch={setRoleSearch}
            setRoleTypeDraft={setRoleTypeDraft}
            setRoleNameDraft={setRoleNameDraft}
            setSelectedId={setSelectedId}
            openCategoryMenu={openCategoryMenu}
            openEntryMenu={openEntryMenu}
            handleLibraryCategoryDragOver={handleLibraryCategoryDragOver}
            handleLibraryCategoryDragLeave={handleLibraryCategoryDragLeave}
            handleLibraryCategoryDrop={handleLibraryCategoryDrop}
            handleLibraryEntryDragStart={handleLibraryEntryDragStart}
            handleLibraryEntryDragOver={handleLibraryEntryDragOver}
            handleLibraryEntryDrop={handleLibraryEntryDrop}
            handleLibraryEntryDragEnd={handleLibraryEntryDragEnd}
            beginLibraryEntryPointerDrag={beginLibraryEntryPointerDrag}
            updateLibraryEntryPointerPreview={updateLibraryEntryPointerPreview}
            finishLibraryEntryPointerDrag={finishLibraryEntryPointerDrag}
            shouldShowRolePinAction={shouldShowRolePinAction}
            toggleRolePinned={toggleRolePinned}
            addRoleType={addRoleType}
            addRole={addRole}
            getDefaultRoleCreateType={getDefaultRoleCreateType}
          />
        }
        leftResizeHandle={leftResizeHandle}
        rightResizeHandle={rightResizeHandle}
        selectedEntry={selectedEntry}
        selectedRole={selectedRole}
        roleEntries={roleEntries}
        roleTypeOptions={roleTypeOptions}
        roleTextFontSize={roleTextFontSize}
        currentOutlineChapterNumber={currentOutlineChapterNumber}
        selectedRoleLifeStatus={selectedRoleLifeStatus}
        onTitleChange={updateSelectedRoleTitle}
        onRoleChange={updateRole}
        fieldSizeButton={renderFieldSizeButton()}
        aiLogButton={renderLibraryAiLogButton('library')}
        configStyle={getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(ROLE_TAB, 'model'))}
        activeTabConfig={activeTabConfig}
        models={models}
        rolePromptOptions={rolePromptOptions}
        onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
        onPromptChange={(value) => updateActiveTabConfig({ promptId: value })}
        onModelManage={() => setManagementModal({ type: 'models' })}
        onPromptManage={() => setManagementModal({ type: 'prompts', category: PROMPT_SETTING_CATEGORY })}
        onPromptContextMenu={(event) => {
          event.preventDefault();
          const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, PROMPT_DISABLE_CONTEXT_MENU_SIZE);
          setPromptDisableMenu({
            tab: ROLE_TAB,
            disabled: Boolean(activeTabConfig.promptDisabled),
            x: left,
            y: top,
          });
        }}
        aiOutput={aiOutput}
        onAiOutputChange={(event) => setAiOutput(event.target.value)}
        onClearAi={clearLibraryAiDialog}
        hasLibraryAiContent={hasLibraryAiContent}
        isLibraryAiLoading={isLibraryAiLoading}
        aiInputRef={libraryAiInputRef}
        aiInput={aiInput}
        onAiInputChange={(event) => {
          setAiInput(event.target.value);
          resizeFloatingAiTextarea(event.currentTarget);
        }}
        onAiInputKeyDown={handleLibraryAiInputKeyDown}
        onSendAi={() => void sendLibraryAiMessage()}
        onStopAi={stopLibraryAiMessage}
        canSendLibraryAiMessage={canSendLibraryAiMessage}
      />
    );
  }

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
    const allCurrentEntries = entries.filter((entry) => entry.tab === effectiveLibraryTab);
    const currentEntries = selectedSettingWorkspaceDomain
      ? allCurrentEntries.filter(
          (entry) =>
            getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type) === selectedSettingWorkspaceDomain,
        )
      : allCurrentEntries;
    const currentSelectedEntry =
      currentEntries.find((entry) => entry.id === effectiveSelectedId) ?? currentEntries[0] ?? null;
    const activeIsSettingLike = isOutlineCharacterScope || isSettingLikeTab(effectiveLibraryTab);
    const activeIsBrainstorm = activeTab === BRAINSTORM_TAB;
    const currentSelectedSetting =
      activeIsSettingLike && currentSelectedEntry ? parseSettingContent(currentSelectedEntry.content) : null;
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
    const currentStructuredTitleFieldLabel = currentStructuredSettingFieldSet?.titleFieldLabel;
    const usesForeshadowHeaderLayout =
      currentStructuredSettingFieldSet?.id === 'foreshadow-main' ||
      currentStructuredSettingFieldSet?.id === 'foreshadow-character';
    const structuredTitleRowClassName = usesForeshadowHeaderLayout
      ? 'grid grid-cols-[4fr_2fr_2fr_2fr] gap-4 overflow-visible pb-1 pt-3'
      : 'flex items-start gap-4 overflow-visible pb-1 pt-3';
    const structuredTitleFieldClassName = usesForeshadowHeaderLayout
      ? 'relative flex h-[48px] min-w-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0'
      : 'relative flex h-[48px] w-[168px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0';
    const currentStructuredTitleFieldGroupTitle =
      currentStructuredSettingFieldSet?.titleFieldGroupTitle ?? currentStructuredSettingFieldSet?.groups?.[0]?.title;
    const currentStructuredActiveGroup =
      currentStructuredSettingFieldSet?.groups?.find((group) => group.title === activeStructuredSettingTab) ??
      currentStructuredSettingFieldSet?.groups?.[0];
    const currentStructuredHeaderFieldKeys = new Set(currentStructuredSettingFieldSet?.headerFieldKeys ?? []);
    const currentStructuredActiveGroupWordCount =
      currentStructuredActiveGroup?.fieldKeys.reduce(
        (total, fieldKey) => total + countTextWords(currentStructuredSettingFields[fieldKey] ?? ''),
        0,
      ) ?? 0;
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
      isOutlineCharacterScope && currentSelectedEntry ? parseRoleContent(currentSelectedEntry.content) : null;
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
            .map((entry) => parseRoleContent(entry.content).type),
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
    const brainstormLayoutLeftWidth = Math.min(settingLibraryLeftWidth, BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH);
    const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);
    const brainstormLayoutRightWidth = Math.max(
      BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
      Math.min(settingLibraryRightWidth, BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH),
    );
    const activeSettingLinkSource = getActiveSettingLinkSource();
    const currentLinkedSettingContext = getActiveLinkedSettingSnapshot();
    const linkedSettingWordCount = countTextWords(currentLinkedSettingContext.text);
    const effectivePromptDisabled =
      activeTab === SETTING_TAB
        ? !isOutlineCharacterScope && activeSettingLinkSource === 'current'
        : Boolean(activeTabConfig.promptDisabled);
    const latestUsefulAiOutput = activeIsBrainstorm ? getLatestUsefulAiText(aiResult || aiOutput) : aiOutput.trim();
    const smartImportLocked = activeTabConfig.smartImportLocked !== false;
    const activeSettingWorkspaceDomain = selectedSettingWorkspaceDomain;
    const activeSettingWorkspaceType = selectedSettingWorkspaceType;
    const visibleSettingTypeOptions = activeSettingWorkspaceDomain
      ? activeSettingTypeOptions.filter((type) => getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain)
      : activeSettingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type));
    const groupedSettingEntries = visibleSettingTypeOptions.map((type) => ({
      type,
      entries: currentEntries.filter((entry) => {
        if (isOutlineCharacterScope) return parseRoleContent(entry.content).type === type;
        const parsed = parseSettingContent(entry.content);
        if (activeIsBrainstorm) return (parsed.type || BRAINSTORM_TYPE) === type || parsed.type === UNCATEGORIZED_TYPE;
        return parsed.type === type;
      }),
    }));
    const getLibrarySidebarEntryType = (entry: WorkbenchLibraryEntry, fallbackType: string) => {
      const parsed = activeIsSettingLike ? parseSettingContent(entry.content) : null;
      const role = isOutlineCharacterScope ? parseRoleContent(entry.content) : null;
      return role?.type ?? parsed?.type ?? fallbackType;
    };
    const getLibrarySidebarEntryWordCount = (entry: WorkbenchLibraryEntry) => {
      const parsed = activeIsSettingLike ? parseSettingContent(entry.content) : null;
      const role = isOutlineCharacterScope ? parseRoleContent(entry.content) : null;
      return countTextWords(role ? getRoleReadableContent(role) : parsed ? parsed.body : entry.content);
    };
    const visibleWorkSettingTypes = new Set(settingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type)));
    const visibleRoleTypes = new Set(roleTypeOptions);
    const visibleWorkSettingCount = settingEntries.filter((entry) =>
      visibleWorkSettingTypes.has(parseSettingContent(entry.content).type),
    ).length;
    const visibleRoleCount = roleEntries.filter((entry) =>
      visibleRoleTypes.has(parseRoleContent(entry.content).type),
    ).length;
    const settingWorkspaceDomainTabs = [
      { id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null },
      { id: 'character', label: '人物设定', count: visibleRoleCount, type: null },
      { id: 'setting:faction', label: '势力设定', type: 'setting:faction' },
      { id: 'setting:item', label: '道具资源', type: 'setting:item' },
      { id: 'setting:monster', label: '怪物图鉴', type: 'setting:monster' },
      { id: 'setting:foreshadow', label: '伏笔线索', type: 'setting:foreshadow' },
    ];
    const getSettingWorkspaceTabCount = (type: string | null, fallback?: number) =>
      type
        ? settingEntries.filter(
            (entry) => getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type) === type,
          ).length
        : (fallback ?? 0);
    const selectSettingWorkspaceDomain = (id: string) => {
      setOutlineSettingDomain(id);
      setOutlineSettingScope(id === 'character' ? 'character' : 'work');
    };
    const settingWorkspaceTopTabs =
      activeTab === SETTING_TAB && !activeIsBrainstorm ? (
        <div
          className="min-w-0 overflow-hidden border-b border-slate-100 bg-white px-4 py-3"
          style={{ gridColumn: '1 / 4', gridRow: 1 }}
        >
          <div className="scrollbar-hidden flex min-w-0 items-center gap-2 overflow-x-auto">
            {settingWorkspaceDomainTabs.map((tab) => {
              const active = outlineSettingDomain === tab.id;
              const count = getSettingWorkspaceTabCount(tab.type, 'count' in tab ? tab.count : undefined);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectSettingWorkspaceDomain(tab.id)}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-black transition-colors ${
                    active
                      ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE] shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/50 hover:text-[#078FAE]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white text-[#078FAE]' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null;
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

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
        {libraryHeaderFontSizePortal}
        {libraryToolbarPortal}
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {deleteConfirmDialog}
        {entryRenameDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {libraryAiLogModal}
        {clearSettingsConfirmDialog}
        {promptDisableContextMenu}
        {otherSettingReaderModal}
        {brainstormReaderModal}
        {brainstormRecycleModal}
        {clearBrainstormRecycleConfirmDialog}
        {brainstormPromptManagerModal}
        {brainstormPromptEditModal}
        {brainstormGenerateConfirmModal}
        {settingCreateModal}
        {categoryRenameModal}
        <div
          className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined,
            gridTemplateColumns: activeIsBrainstorm
              ? `${brainstormLayoutLeftWidth}px 0px ${brainstormLayoutPreviewWidth}px 0px minmax(${BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH}px,1fr) 0px ${brainstormLayoutRightWidth}px`
              : settingLibraryMode === 'advanced'
                ? `${settingLibraryLeftWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
                : `${settingLibraryLeftWidth}px 0px minmax(0,1fr)`,
          }}
        >
          {settingWorkspaceTopTabs}
          <WorkbenchLibrarySidebar
            activeTab={activeTab}
            effectiveLibraryTab={effectiveLibraryTab}
            activeIsSettingLike={activeIsSettingLike}
            activeIsBrainstorm={activeIsBrainstorm}
            isOutlineCharacterScope={isOutlineCharacterScope}
            activeSettingSidebarScrollKey={activeSettingSidebarScrollKey}
            groupedSettingEntries={groupedSettingEntries}
            currentEntries={currentEntries}
            expandedRoleTypes={expandedRoleTypes}
            expandedSettingTypes={expandedSettingTypes}
            libraryDropTarget={libraryDropTarget}
            draggingLibraryEntry={draggingLibraryEntry}
            currentSelectedEntryId={currentSelectedEntry?.id}
            brainstormRecycleCount={brainstormRecycleEntries.length}
            libraryPointerSuppressClickRef={libraryPointerSuppressClickRef}
            style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 1, gridRow: 2 } : undefined}
            getPreviewedLibraryGroupEntries={getPreviewedLibraryGroupEntries}
            getEntryWordCount={getLibrarySidebarEntryWordCount}
            getEntryType={getLibrarySidebarEntryType}
            handleSettingSidebarScroll={handleSettingSidebarScroll}
            setExpandedRoleTypes={setExpandedRoleTypes}
            setExpandedSettingTypes={setExpandedSettingTypes}
            setSelectedIdForTab={setSelectedIdForTab}
            openCategoryMenu={openCategoryMenu}
            openEntryMenu={openEntryMenu}
            handleLibraryCategoryDragOver={handleLibraryCategoryDragOver}
            handleLibraryCategoryDragLeave={handleLibraryCategoryDragLeave}
            handleLibraryCategoryDrop={handleLibraryCategoryDrop}
            handleLibraryEntryDragStart={handleLibraryEntryDragStart}
            handleLibraryEntryDragOver={handleLibraryEntryDragOver}
            handleLibraryEntryDrop={handleLibraryEntryDrop}
            handleLibraryEntryDragEnd={handleLibraryEntryDragEnd}
            beginLibraryEntryPointerDrag={beginLibraryEntryPointerDrag}
            updateLibraryEntryPointerPreview={updateLibraryEntryPointerPreview}
            finishLibraryEntryPointerDrag={finishLibraryEntryPointerDrag}
            openSettingCreateDialog={openSettingCreateDialog}
            setIsBrainstormRecycleOpen={setIsBrainstormRecycleOpen}
          />
          {leftResizeHandle}
          <main
            className={`min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}
            style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 3, gridRow: 2 } : undefined}
          >
            {isOutlineCharacterScope ? (
              currentSelectedEntry && currentSelectedRole ? (
                <RoleBaseStateEditor
                  entry={currentSelectedEntry}
                  role={currentSelectedRole}
                  roleEntries={roleEntries}
                  roleTypeOptions={roleTypeOptions}
                  roleTextFontSize={roleTextFontSize}
                  currentChapterNumber={currentOutlineChapterNumber}
                  roleLifeStatus={currentSelectedRoleLifeStatus}
                  onTitleChange={(title) => updateEntry(currentSelectedEntry.id, { title })}
                  onRoleChange={updateOutlineCharacterRole}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  点击左侧“新建角色”开始创建角色
                </div>
              )
            ) : activeIsBrainstorm ? (
              <div className="flex min-h-0 flex-1 flex-col p-5">
                <div className="relative min-h-0 flex-1">
                  <div
                    className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-brainstorm-preview-field xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${currentBrainstormBody.trim() ? 'xy-has-value' : ''}`}
                  >
                    <textarea
                      value={currentBrainstormBody}
                      onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}
                      onChange={(event) => {
                        if (!currentSelectedEntry || !currentSelectedSetting) return;
                        updateEntry(currentSelectedEntry.id, {
                          content: stringifySettingContent({ ...currentSelectedSetting, body: event.target.value }),
                        });
                      }}
                      placeholder="这里显示选中的脑洞内容，也可以直接编辑。"
                      className="editor-scrollbar text-sm leading-7 text-gray-700"
                      style={{ fontSize: brainstormPreviewFontSize }}
                    />
                    <label aria-hidden="true" className="opacity-0">
                      脑洞预览
                    </label>
                    {currentSelectedEntry && (
                      <div className="xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
                        <input
                          value={currentSelectedEntry.title}
                          onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}
                          onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                          className="xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none"
                          style={getFloatingTitleInputStyle(currentSelectedEntry.title, 3, 9)}
                          aria-label="脑洞名称"
                        />
                        <span>
                          <WordCountText value={currentBrainstormPreviewWordCount} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentSelectedEntry ? (
              <div className={`flex min-h-0 flex-1 flex-col ${currentStructuredTitleFieldLabel ? 'px-5 py-3' : 'p-5'}`}>
                {currentStructuredTitleFieldLabel ? (
                  <header className="shrink-0 pb-3">
                    <div data-testid="structured-title-row" className={structuredTitleRowClassName}>
                      <label data-testid="structured-title-field" className={structuredTitleFieldClassName}>
                        <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 text-base font-medium leading-5 text-slate-950">
                          {currentStructuredTitleFieldLabel}
                        </span>
                        <input
                          data-no-modal-drag="true"
                          aria-label={currentStructuredTitleFieldLabel}
                          value={currentSelectedEntry.title}
                          disabled={currentSelectedSettingIsLockedDefault}
                          onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                          placeholder={currentStructuredTitleFieldLabel}
                          title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
                          className={`h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 ${
                            currentSelectedSettingIsLockedDefault ? 'cursor-not-allowed text-slate-500' : ''
                          }`}
                        />
                      </label>
                      {currentStructuredSettingFieldSet?.headerFieldKeys?.map((fieldKey) => {
                        const field = currentStructuredSettingFieldSet.fields.find((item) => item.key === fieldKey);
                        if (!field) return null;
                        const value = currentStructuredSettingFields[field.key] ?? '';
                        return (
                          <div
                            key={field.key}
                            className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'h-[48px] w-[150px] shrink-0'} ${value.trim() ? 'xy-has-value' : ''}`}
                          >
                            <input
                              data-no-modal-drag="true"
                              aria-label={field.title}
                              value={value}
                              maxLength={field.maxLength}
                              onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                              onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                              placeholder={field.placeholder ?? `填写${field.title}`}
                              className="text-sm leading-7 text-gray-700"
                              style={{ fontSize: settingPreviewFontSize }}
                            />
                            <label className="xy-floating-title-count">
                              {field.title}{' '}
                              <span>
                                <WordCountText value={countTextWords(value)} />
                              </span>
                            </label>
                          </div>
                        );
                      })}
                      {currentStructuredSettingFieldSet?.groups ? (
                        <div aria-hidden="true" className="h-9 w-[112px] shrink-0" />
                      ) : null}
                    </div>
                    {currentStructuredSettingFieldSet?.groups ? (
                      <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
                        <SettingSegmentedTabs
                          tabs={STRUCTURED_SETTING_TABS}
                          activeTab={activeStructuredSettingTab}
                          onChange={setActiveStructuredSettingTab}
                        />
                        {activeStructuredSettingTab !== '确认' && currentStructuredActiveGroup ? (
                          <p className="shrink-0 text-xs font-black text-slate-400">
                            {currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </header>
                ) : (
                  <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                    <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                      <div
                        className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size ${currentSelectedEntry.title.trim() ? 'xy-has-value' : ''}`}
                        style={getFieldSizeStyle('settingName')}
                      >
                        <input
                          data-no-modal-drag="true"
                          value={currentSelectedEntry.title}
                          disabled={currentSelectedSettingIsLockedDefault}
                          onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                          placeholder="设定名"
                          title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
                          className={
                            currentSelectedSettingIsLockedDefault ? 'cursor-not-allowed text-slate-500' : undefined
                          }
                        />
                        <label>设定名</label>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative min-h-0 flex-1">
                  {currentStructuredSettingFieldSet ? (
                    currentStructuredSettingFieldSet.groups ? (
                      (() => {
                        const activeGroup = currentStructuredActiveGroup;
                        return (
                          <div className="flex h-full min-h-0 flex-col gap-3">
                            {!currentStructuredTitleFieldLabel ? (
                              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 pb-3">
                                <SettingSegmentedTabs
                                  tabs={STRUCTURED_SETTING_TABS}
                                  activeTab={activeStructuredSettingTab}
                                  onChange={setActiveStructuredSettingTab}
                                />
                                {activeStructuredSettingTab !== '确认' && activeGroup ? (
                                  <p className="shrink-0 text-xs font-black text-slate-400">
                                    {activeGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                            {activeStructuredSettingTab === '确认' ? (
                              <section className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                                <h3 className="text-sm font-black text-cyan-800">确认更新</h3>
                                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                                  AI 反馈进入确认区后，左侧显示未更新前内容，右侧显示更新后内容，确认后才写入状态设定。
                                </p>
                              </section>
                            ) : activeGroup ? (
                              <section key={activeGroup.title} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                <div
                                  data-testid="structured-setting-fields"
                                  className={`grid min-h-0 flex-1 grid-cols-2 gap-3 px-1 pb-1 pr-2 pt-3 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}
                                >
                                  {activeGroup.fieldKeys
                                    .filter((fieldKey) => !currentStructuredHeaderFieldKeys.has(fieldKey))
                                    .map((fieldKey) => {
                                      const field = currentStructuredSettingFieldSet.fields.find(
                                        (item) => item.key === fieldKey,
                                      );
                                      if (!field) return null;
                                      const value = currentStructuredSettingFields[field.key] ?? '';
                                      const fieldControl = field.control ?? 'textarea';
                                      return (
                                        <div
                                          key={field.key}
                                          className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                                        >
                                          {fieldControl === 'input' ? (
                                            <input
                                              data-no-modal-drag="true"
                                              aria-label={field.title}
                                              value={value}
                                              maxLength={field.maxLength}
                                              onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                              onChange={(event) =>
                                                updateStructuredSettingField(field.key, event.target.value)
                                              }
                                              placeholder={field.placeholder ?? `填写${field.title}`}
                                              className="text-sm leading-7 text-gray-700"
                                              style={{ fontSize: settingPreviewFontSize }}
                                            />
                                          ) : (
                                            <textarea
                                              data-no-modal-drag="true"
                                              aria-label={field.title}
                                              value={value}
                                              onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                              onChange={(event) =>
                                                updateStructuredSettingField(field.key, event.target.value)
                                              }
                                              onScroll={() =>
                                                handleSettingSidebarScroll(
                                                  `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`,
                                                )
                                              }
                                              placeholder={field.placeholder ?? `填写${field.title}`}
                                              className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                                                activeSettingSidebarScrollKey ===
                                                `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`
                                                  ? 'scrollbar-active'
                                                  : ''
                                              }`}
                                              style={{ fontSize: settingPreviewFontSize }}
                                            />
                                          )}
                                          <label className="xy-floating-title-count">
                                            {field.title}{' '}
                                            <span>
                                              <WordCountText value={countTextWords(value)} />
                                            </span>
                                          </label>
                                        </div>
                                      );
                                    })}
                                </div>
                              </section>
                            ) : null}
                          </div>
                        );
                      })()
                    ) : (
                      <div
                        data-testid="structured-setting-fields"
                        className={`grid h-full min-h-0 ${currentStructuredSettingFieldSet.gridColumnsClassName} gap-4 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}
                      >
                        {currentStructuredSettingFieldSet.fields
                          .filter((field) => !currentStructuredHeaderFieldKeys.has(field.key))
                          .map((field) => {
                            const value = currentStructuredSettingFields[field.key] ?? '';
                            const fieldControl = field.control ?? 'textarea';
                            return (
                              <div
                                key={field.key}
                                className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                              >
                                {fieldControl === 'input' ? (
                                  <input
                                    data-no-modal-drag="true"
                                    aria-label={field.title}
                                    value={value}
                                    maxLength={field.maxLength}
                                    onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                    onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                    placeholder={field.placeholder ?? `填写${field.title}`}
                                    className="text-sm leading-7 text-gray-700"
                                    style={{ fontSize: settingPreviewFontSize }}
                                  />
                                ) : (
                                  <textarea
                                    data-no-modal-drag="true"
                                    aria-label={field.title}
                                    value={value}
                                    onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                    onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                    onScroll={() =>
                                      handleSettingSidebarScroll(
                                        `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`,
                                      )
                                    }
                                    placeholder={field.placeholder ?? `填写${field.title}`}
                                    className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                                      activeSettingSidebarScrollKey ===
                                      `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`
                                        ? 'scrollbar-active'
                                        : ''
                                    }`}
                                    style={{ fontSize: settingPreviewFontSize }}
                                  />
                                )}
                                <label className="xy-floating-title-count">
                                  {field.title}{' '}
                                  <span>
                                    <WordCountText value={countTextWords(value)} />
                                  </span>
                                </label>
                              </div>
                            );
                          })}
                      </div>
                    )
                  ) : (
                    <div
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content).trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content}
                        onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                        onChange={(event) =>
                          updateEntry(currentSelectedEntry.id, {
                            content: currentSelectedSetting
                              ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value })
                              : event.target.value,
                          })
                        }
                        onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentSelectedEntry.id}`)}
                        placeholder="这里显示选中的设定内容，也可以直接编辑。"
                        className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                          activeSettingSidebarScrollKey === `setting-textarea:${currentSelectedEntry.id}`
                            ? 'scrollbar-active'
                            : ''
                        }`}
                        style={{ fontSize: settingPreviewFontSize }}
                      />
                      <label className="xy-floating-title-count">
                        设定预览{' '}
                        <span>
                          <WordCountText
                            value={countTextWords(
                              currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content,
                            )}
                          />
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col p-5">
                <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                  <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                    <div
                      className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size"
                      style={getFieldSizeStyle('settingName')}
                    >
                      <input
                        data-no-modal-drag="true"
                        value=""
                        onChange={(event) => {
                          const title = event.target.value;
                          if (!title.trim()) return;
                          createEditableSettingEntry({ title });
                        }}
                        placeholder="输入设定名"
                      />
                      <label>设定名</label>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-0 flex-1">
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
                    <textarea
                      data-no-modal-drag="true"
                      value=""
                      onChange={(event) => {
                        const body = event.target.value;
                        if (!body.trim()) return;
                        createEditableSettingEntry({
                          content: stringifySettingContent({
                            type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE,
                            body,
                          }),
                        });
                      }}
                      onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                      placeholder="这里可以直接输入设定内容，会自动新建设定。"
                      className="editor-scrollbar text-sm leading-7 text-gray-700"
                      style={{ fontSize: settingPreviewFontSize }}
                    />
                    <label className="xy-floating-title-count">
                      设定预览{' '}
                      <span>
                        <WordCountText value={0} />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>

          {activeIsBrainstorm && brainstormPreviewResizeHandle}

          {activeIsBrainstorm && (
            <section className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
              <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2 p-4">
                <div className="editor-scrollbar xy-brainstorm-output-preview-list flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
                  {brainstormOutputPreviews.map((previewValue, index) => {
                    const titleValue = brainstormOutputTitles[index] ?? getTemporaryBrainstormTitle(index);
                    const previewWordCount = countTextWords(previewValue);
                    const outputChecked = selectedBrainstormOutputIndexSet.has(index);
                    return (
                      <div key={index} className="relative min-h-[120px] flex-1">
                        <div
                          className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${previewValue.trim() ? 'xy-has-value' : ''}`}
                        >
                          <textarea
                            value={previewValue}
                            onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}
                            onScroll={() => handleBrainstormOutputTextareaScroll(index)}
                            onChange={(event) => setBrainstormOutputPreviewDraft(index, event.target.value)}
                            placeholder={`这里显示本次 AI 生成的${titleValue}，保存脑洞时只保存这里的内容。`}
                            className={`scrollbar-scroll-only text-sm leading-6 text-gray-700 ${activeBrainstormOutputScrollIndex === index ? 'scrollbar-active' : ''}`}
                            style={{ fontSize: brainstormOutputFontSize }}
                          />
                          <label aria-hidden="true" className="opacity-0">
                            脑洞输出框
                          </label>
                        </div>
                        <div className="xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
                          {showBrainstormOutputSelection && (
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={outputChecked}
                              aria-label={`${titleValue}保存勾选`}
                              onClick={() => toggleBrainstormOutputPreviewSelected(index)}
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] font-black leading-none transition-colors ${
                                outputChecked
                                  ? 'border-[#08AACE] bg-[#08AACE] text-white'
                                  : 'border-slate-300 bg-white text-transparent hover:border-[#08AACE]'
                              }`}
                            >
                              ✓
                            </button>
                          )}
                          <input
                            value={titleValue}
                            onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}
                            onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}
                            className="xy-floating-title-input max-w-[180px] min-w-[72px] text-sm font-black leading-none text-slate-950 outline-none"
                            style={getFloatingTitleInputStyle(titleValue, 4, 12)}
                            aria-label={`脑洞输出名称 ${index + 1}`}
                          />
                          <span>
                            <WordCountText value={previewWordCount} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="min-h-0 space-y-3">
                  <AiInlineInput
                    ref={libraryAiInputRef}
                    value={aiInput}
                    onChange={(event) => {
                      setAiInput(event.target.value);
                      resizeFloatingAiTextarea(event.currentTarget);
                    }}
                    onKeyDown={handleLibraryAiInputKeyDown}
                    onSend={() => void sendLibraryAiMessage()}
                    onStop={stopLibraryAiMessage}
                    sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                    stopDisabled={!isLibraryAiLoading}
                    placeholder="输入对话指令..."
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <div className="xy-capsule-group overflow-hidden">
                        <button
                          onClick={() => saveBrainstormOutput(currentSelectedEntry?.id)}
                          disabled={!currentSelectedEntry || selectedBrainstormOutputCount !== 1}
                          className="xy-capsule-button"
                        >
                          替换当前脑洞
                        </button>
                        <button
                          onClick={saveBrainstormOutputAsNew}
                          disabled={selectedBrainstormOutputCount === 0}
                          className="xy-capsule-button"
                        >
                          保存为新脑洞
                        </button>
                      </div>
                      <div className="xy-capsule-group overflow-hidden">
                        <button
                          type="button"
                          onClick={copyBrainstormOutputArea}
                          disabled={!brainstormOutputValue.trim()}
                          className="xy-capsule-button"
                        >
                          复制脑洞
                        </button>
                        <button
                          type="button"
                          onClick={clearBrainstormOutputArea}
                          disabled={!brainstormOutputValue.trim() && !isLibraryAiLoading}
                          className="xy-capsule-button text-red-500 hover:text-red-600 disabled:text-red-300"
                        >
                          清空脑洞
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {settingLibraryMode === 'advanced' && (
            <>
              {rightResizeHandle}
              <aside
                className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2"
                style={
                  activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 5, gridRow: '1 / 3' } : undefined
                }
              >
                <div className="shrink-0">
                  {showPanelHeader && (
                    <div className="flex items-center justify-between gap-3">
                      {activeTab !== SETTING_TAB ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="shrink-0 text-base font-bold text-gray-900">{panelTitle}</h3>
                        </div>
                      ) : (
                        <div />
                      )}
                      <div className="flex shrink-0 items-center gap-2">
                        {!libraryToolbarPortalTarget && (
                          <>
                            {renderFieldSizeButton()}
                            {showHeaderLibraryAiLogButton && renderLibraryAiLogButton('library')}
                            {showInlineLibraryAiLogButton && renderLibraryAiLogButton('library')}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className={`${showPanelHeader ? 'mt-3' : ''} space-y-3`}>
                    <div className="flex max-w-full items-start gap-2">
                      <CombinedAiConfigSelect
                        style={
                          activeIsBrainstorm
                            ? ({
                                ...getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model')),
                                width: '100%',
                                maxWidth: '100%',
                                '--xy-field-width': '100%',
                              } as CSSProperties)
                            : getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model'))
                        }
                        className={activeIsBrainstorm ? 'w-full' : undefined}
                        modelValue={activeTabConfig.modelId ?? ''}
                        promptValue={activePromptId ?? ''}
                        modelOptions={
                          models.length === 0
                            ? [{ value: '', label: '暂无可用模型', disabled: true }]
                            : models.map((model) => ({ value: model.id, label: model.name }))
                        }
                        promptOptions={
                          activeTabPrompts.length === 0
                            ? [{ value: '', label: `暂无${promptCategoryLabel}提示词`, disabled: true }]
                            : activeTabPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                        }
                        onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                        onPromptChange={(value) => updateActiveTabConfig({ promptId: value })}
                        onModelManage={() => setManagementModal({ type: 'models' })}
                        onPromptManage={() =>
                          setManagementModal({
                            type: 'prompts',
                            category: activeIsBrainstorm
                              ? BRAINSTORM_TAB
                              : activeTab === SETTING_TAB
                                ? PROMPT_SETTING_CATEGORY
                                : activeTab === DETAIL_OUTLINE_TAB
                                  ? DETAIL_OUTLINE_PROMPT_CATEGORY
                                  : activeTab,
                          })
                        }
                        promptDisabled={effectivePromptDisabled}
                        onPromptContextMenu={
                          showPromptDisableButton
                            ? (event) => {
                                event.preventDefault();
                                const { left, top } = clampFixedMenuPosition(
                                  event.clientX,
                                  event.clientY,
                                  PROMPT_DISABLE_CONTEXT_MENU_SIZE,
                                );
                                setPromptDisableMenu({
                                  tab: activeTab,
                                  disabled: effectivePromptDisabled,
                                  x: left,
                                  y: top,
                                });
                              }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
                {activeIsBrainstorm ? (
                  <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2">
                      <div className="flex min-h-full flex-col gap-4 pt-2">
                        {BRAINSTORM_QUESTION_FIELDS.map((field, index) => {
                          const isLastField = index === BRAINSTORM_QUESTION_FIELDS.length - 1;
                          const questionRows = getBrainstormQuestionRows(brainstormQuestionDraft[field.key]);
                          const isCountField = field.key === 'brainstormCount';
                          if (isCountField) return null;
                          if (field.key === 'brainstormBackground') return null;
                          if (field.key === 'brainstormGenre') {
                            const pairedFields = BRAINSTORM_QUESTION_FIELDS.filter(
                              (item) => item.key === 'brainstormGenre' || item.key === 'brainstormBackground',
                            );
                            return (
                              <div
                                key="brainstorm-genre-background-row"
                                className="grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700"
                              >
                                {pairedFields.map((pairedField) => {
                                  const pairedRows = getBrainstormQuestionRows(
                                    brainstormQuestionDraft[pairedField.key],
                                  );
                                  return (
                                    <div
                                      key={pairedField.key}
                                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${brainstormQuestionDraft[pairedField.key].trim() ? 'xy-has-value' : ''}`}
                                    >
                                      <textarea
                                        value={brainstormQuestionDraft[pairedField.key]}
                                        onChange={(event) =>
                                          setBrainstormQuestionField(pairedField.key, event.target.value)
                                        }
                                        placeholder={pairedField.placeholder}
                                        rows={1}
                                        className="font-bold leading-5"
                                        style={{
                                          height: `${Math.max(52, pairedRows * 20 + 32)}px`,
                                          overflowY: 'hidden',
                                        }}
                                      />
                                      <label>{pairedField.label}</label>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return (
                            <div key={field.key} className="block shrink-0 text-sm font-bold text-gray-700">
                              <div
                                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${brainstormQuestionDraft[field.key].trim() ? 'xy-has-value' : ''}`}
                              >
                                <textarea
                                  value={brainstormQuestionDraft[field.key]}
                                  onChange={(event) => setBrainstormQuestionField(field.key, event.target.value)}
                                  placeholder={field.placeholder}
                                  rows={1}
                                  className={`font-bold leading-5 ${isLastField ? 'min-h-0 flex-1' : ''}`}
                                  style={
                                    isLastField
                                      ? {
                                          minHeight: `${Math.max(180, questionRows * 20 + 52)}px`,
                                          height: '100%',
                                          overflowY: 'hidden',
                                        }
                                      : {
                                          height: `${Math.max(52, questionRows * 20 + 32)}px`,
                                          overflowY: 'hidden',
                                        }
                                  }
                                />
                                <label>{field.label}</label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>
                        <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {['3', '5', '10'].map((value) => {
                            const active = brainstormQuestionDraft.brainstormCount === value;
                            return (
                              <button
                                {...{ key: value }}
                                type="button"
                                onClick={() => setBrainstormQuestionField('brainstormCount', active ? '' : value)}
                                className={`min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black leading-none transition-colors last:border-r-0 ${
                                  active
                                    ? 'bg-[#08AACE] text-white'
                                    : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={openBrainstormGenerateConfirm}
                        disabled={isLibraryAiLoading}
                        className="h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {isLibraryAiLoading ? '生成中...' : '逐个生成'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-5 min-h-0 flex-1">
                      <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full xy-has-value">
                        <label className="xy-floating-title-count xy-border-embedded-transparent-backplate">
                          生成设定
                        </label>
                        <button
                          type="button"
                          onClick={clearLibraryAiDialog}
                          disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                          className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600 disabled:text-red-300"
                        >
                          清空
                        </button>
                        <div
                          ref={libraryAiOutputRef}
                          onScroll={handleLibraryAiOutputScroll}
                          className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-gray-700"
                        >
                          {aiChatTurns.length === 0 ? (
                            <div />
                          ) : (
                            <div className="space-y-3">
                              {aiChatTurns.map((turn, index) => (
                                <div
                                  key={`${turn.role}-${index}`}
                                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                                      turn.role === 'user'
                                        ? 'max-w-[82%] bg-brand text-white'
                                        : 'max-w-[96%] border border-gray-200 bg-gray-50 text-gray-800'
                                    }`}
                                  >
                                    {renderAiChatContent(turn.content)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <>
                      {activeTab === SETTING_TAB && (
                        <div className="mt-3 flex min-w-0 items-center gap-1.5">
                          <div className="flex h-9 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9] bg-white shadow-sm">
                            <div className="flex w-12 items-center justify-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
                              关联
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (activeSettingLinkSource === 'current') {
                                  updateActiveTabConfig({
                                    associationSessionId: null,
                                    settingLinkSource: null,
                                    promptDisabled: false,
                                  });
                                  return;
                                }
                                updateActiveTabConfig({
                                  associationSessionId: getWorkbenchAssociationRuntimeId(),
                                  settingLinkSource: 'current',
                                  loadedBrainstormId: null,
                                  loadedBrainstormTitle: '',
                                  loadedBrainstormText: '',
                                  linkedOtherSettingIds: [],
                                  promptDisabled: true,
                                });
                              }}
                              disabled={!currentSelectedEntry}
                              className={`w-[86px] px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 ${
                                activeSettingLinkSource === 'current'
                                  ? 'bg-[#08B3D9] text-white'
                                  : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
                              }`}
                              title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}
                            >
                              当前设定
                            </button>
                            {activeSettingLinkSource === 'other' ? (
                              <div className="flex border-l border-[#08B3D9]/30">
                                <button
                                  type="button"
                                  onClick={openOtherSettingReader}
                                  className="w-[96px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                  title="重新选择关联其他设定"
                                >
                                  其他设定
                                </button>
                                <button
                                  type="button"
                                  onClick={clearActiveLinkedOtherSettings}
                                  className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                                  title="取消关联其他设定"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={openOtherSettingReader}
                                className="w-[86px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                title="关联其他设定"
                              >
                                其他设定
                              </button>
                            )}
                            {activeSettingLinkSource === 'brainstorm' ? (
                              <div className="flex border-l border-[#08B3D9]/30">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                    setIsBrainstormReaderOpen(true);
                                  }}
                                  className="w-[90px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                  title="重新选择关联脑洞"
                                >
                                  已关联脑洞
                                </button>
                                <button
                                  type="button"
                                  onClick={clearActiveLinkedBrainstorm}
                                  className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                                  title="取消关联脑洞"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                  setIsBrainstormReaderOpen(true);
                                }}
                                className="w-[68px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                title={isOutlineCharacterScope ? '关联脑洞库内容到人物设定' : '关联脑洞库内容'}
                              >
                                脑洞
                              </button>
                            )}
                          </div>
                          {activeSettingLinkSource && (
                            <span className="min-w-0 shrink whitespace-nowrap text-xs font-bold text-slate-400">
                              关联 <WordCountText value={linkedSettingWordCount} compact />
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        {activeTab === SETTING_TAB ? (
                          <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <button
                              type="button"
                              onClick={smartImportSettings}
                              disabled={smartImportLocked}
                              className={`min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold transition-colors ${
                                smartImportLocked
                                  ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                                  : 'bg-[#08AACE] text-white hover:bg-[#0796B8]'
                              }`}
                            >
                              智能导入设定
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveTabConfig({ smartImportLocked: !smartImportLocked })}
                              className={`flex h-full w-10 shrink-0 items-center justify-center border-l transition-colors ${
                                smartImportLocked
                                  ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600'
                                  : 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#08AACE] hover:bg-[#DDF5FB] hover:text-[#078fb0]'
                              }`}
                              title={smartImportLocked ? '解锁智能导入设定' : '锁定智能导入设定'}
                            >
                              {smartImportLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!currentSelectedEntry) {
                                addEntryToTab(activeTab, `新建${activeTab}`);
                                return;
                              }
                              updateEntry(currentSelectedEntry.id, {
                                title: currentSelectedEntry.title || `新建${activeTab}`,
                              });
                            }}
                            className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                          >
                            保存为新{activeTab}
                          </button>
                        )}
                      </div>
                      <div className="mt-3">
                        <AiInlineInput
                          ref={libraryAiInputRef}
                          value={aiInput}
                          onChange={(event) => {
                            setAiInput(event.target.value);
                            resizeFloatingAiTextarea(event.currentTarget);
                          }}
                          onKeyDown={handleLibraryAiInputKeyDown}
                          onSend={() => void sendLibraryAiMessage()}
                          onStop={stopLibraryAiMessage}
                          sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                          stopDisabled={!isLibraryAiLoading}
                          placeholder="输入对话指令..."
                        />
                      </div>
                    </>
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      </div>
    );
  }

  if (
    (tabs.includes(CHAPTER_SUMMARY_TAB) && tabs.includes(VOLUME_SUMMARY_TAB)) ||
    activeTab === OUTLINE_LIBRARY_TAB ||
    activeTab === DETAIL_OUTLINE_TAB
  ) {
    const isDetailOutlineTab = activeTab === DETAIL_OUTLINE_TAB;
    const enableVolumeSummary = !isDetailOutlineTab;
    const outlineChapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const safeOutlineSelectionType = isDetailOutlineTab ? 'chapter' : outlineSelectionType;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    const persistCurrentOutline = (next: WorkbenchLibraryEntry[]) => {
      if (activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey) {
        const normalized = normalizeEntries(next);
        setOutlineEntries(normalized);
        writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
        return;
      }
      persist(next);
    };
    const updateOutlineEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
      const next = currentOutlineEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') } : entry,
      );
      persistCurrentOutline(next);
    };
    const chapterEntries = currentOutlineEntries.filter((entry) => entry.tab === outlineChapterTab);
    const volumeEntries = enableVolumeSummary
      ? currentOutlineEntries.filter(
          (entry) =>
            entry.tab === VOLUME_SUMMARY_TAB ||
            entry.tab === LEGACY_VOLUME_SUMMARY_TAB ||
            entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD,
        )
      : [];
    const outlineChapters = volumes.flatMap((volume) =>
      [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber).map((chapter) => ({ volume, chapter })),
    );
    const isDetailOutlineChapterPublished = (chapter: Chapter) =>
      Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);
    const filterDetailOutlineVolumesByPublishState = (published: boolean) =>
      volumes.map((volume) => ({
        ...volume,
        chapters: [...volume.chapters]
          .filter((chapter) => isDetailOutlineChapterPublished(chapter) === published)
          .sort((a, b) => a.serialNumber - b.serialNumber),
      }));
    const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);
    const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);
    const detailOutlineUnpublishedCount = detailOutlineUnpublishedVolumes.reduce(
      (sum, volume) => sum + volume.chapters.length,
      0,
    );
    const detailOutlinePublishedCount = detailOutlinePublishedVolumes.reduce(
      (sum, volume) => sum + volume.chapters.length,
      0,
    );
    const selectedOutlineChapter =
      outlineChapters.find((item) => item.chapter.id === selectedOutlineChapterId) ?? outlineChapters[0] ?? null;
    const selectedOutlineVolume = volumes.find((volume) => volume.id === selectedOutlineVolumeId) ?? volumes[0] ?? null;
    const effectiveSelectedOutlineChapterId =
      safeOutlineSelectionType === 'chapter'
        ? (selectedOutlineChapterId ?? selectedOutlineChapter?.chapter.id ?? null)
        : null;
    const getChapterSummaryTitle = (serialNumber: number) =>
      isDetailOutlineTab ? `第${serialNumber}章细纲` : `第${serialNumber}章梗概`;
    const getLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章摘要`;
    const getOlderLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章概要`;
    const getChapterSummaryDisplayTitle = (serialNumber: number) =>
      isDetailOutlineTab ? `第${serialNumber}章章纲` : getChapterSummaryTitle(serialNumber);
    const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}梗概`;
    const getLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}摘要`;
    const getOlderLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
    const getChapterSummaryEntry = (serialNumber: number) =>
      chapterEntries.find(
        (entry) =>
          entry.title === getChapterSummaryTitle(serialNumber) ||
          entry.title === getLegacyChapterSummaryTitle(serialNumber) ||
          entry.title === getOlderLegacyChapterSummaryTitle(serialNumber) ||
          entry.title === getChapterSummaryDisplayTitle(serialNumber),
      );
    const getVolumeSummaryEntry = (volumeName: string) =>
      volumeEntries.find(
        (entry) =>
          entry.title === getVolumeSummaryTitle(volumeName) ||
          entry.title === getLegacyVolumeSummaryTitle(volumeName) ||
          entry.title === getOlderLegacyVolumeSummaryTitle(volumeName),
      );
    const selectedOutlineEntry = selectedOutlineChapter
      ? getChapterSummaryEntry(selectedOutlineChapter.chapter.serialNumber)
      : null;
    const selectedVolumeEntry = selectedOutlineVolume ? getVolumeSummaryEntry(selectedOutlineVolume.name) : null;
    const getVolumeDisplayIndex = (volumeId: number) => {
      const index = volumes.findIndex((item) => item.id === volumeId);
      return index >= 0 ? index + 1 : 1;
    };
    const getOutlineChapterFrameTitle = (volume: Volume, chapter: Chapter) =>
      isDetailOutlineTab
        ? `第${chapter.serialNumber}章章纲`
        : `第${chapter.serialNumber}章梗概（第${getVolumeDisplayIndex(volume.id)}卷）`;
    const updateChapterSummary = (serialNumber: number, content: string) => {
      const title = getChapterSummaryTitle(serialNumber);
      const existing = getChapterSummaryEntry(serialNumber);
      if (existing) {
        updateOutlineEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry(outlineChapterTab, title),
        content,
      };
      persistCurrentOutline([entry, ...currentOutlineEntries]);
      setSelectedId(entry.id);
    };
    const updateVolumeSummary = (volumeName: string, content: string) => {
      const title = getVolumeSummaryTitle(volumeName);
      const existing = getVolumeSummaryEntry(volumeName);
      if (existing) {
        updateOutlineEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry(VOLUME_SUMMARY_TAB, title),
        content,
      };
      persistCurrentOutline([entry, ...currentOutlineEntries]);
      setSelectedId(entry.id);
    };
    const clearOutlineAiOutputDraft = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      updateActiveTabConfig({ outlineAiTaskId: undefined });
      setOutlinePreviewDraft('');
    };
    const renderDetailOutlineDraftClearButton = () => {
      if (!isDetailOutlineTab || plotPointStandalone || !selectedOutlineChapter) return null;
      return (
        <button
          type="button"
          onClick={clearOutlineAiOutputDraft}
          className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600"
        >
          清空
        </button>
      );
    };
    const saveOutlinePreviewDraft = () => {
      const cleanDraft = stripAiThinkingBlock(outlinePreviewDraft);
      if (isDetailOutlineTab) {
        if (selectedOutlineChapter) {
          setLastDetailOutlineReplacement({
            chapterSerialNumber: selectedOutlineChapter.chapter.serialNumber,
            content: selectedOutlineEntry?.content ?? '',
            draft: outlinePreviewDraft,
          });
          suppressNextOutlinePreviewSyncRef.current = true;
          updateActiveTabConfig({ outlineAiTaskId: undefined });
          updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
          setOutlinePreviewDraft('');
        }
        return;
      }
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        updateVolumeSummary(selectedOutlineVolume.name, cleanDraft);
        setOutlinePreviewDraft(cleanDraft);
        return;
      }
      if (selectedOutlineChapter) {
        updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
        setOutlinePreviewDraft(cleanDraft);
      }
    };
    const undoDetailOutlineReplacement = () => {
      if (!lastDetailOutlineReplacement) return;
      updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);
      setOutlinePreviewDraft(lastDetailOutlineReplacement.draft);
      setLastDetailOutlineReplacement(null);
    };
    const selectOutlineChapter = (chapterId: number, serialNumber: number) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('chapter');
      setSelectedOutlineChapterId(chapterId);
      setSelectedOutlineVolumeId(null);
      updateActiveTabConfig({ selectedOutlineChapterId: chapterId });
      const entry = getChapterSummaryEntry(serialNumber);
      setSelectedId(entry?.id ?? null);
      if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');
    };
    const selectOutlineVolume = (volume: Volume) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('volume');
      setSelectedOutlineVolumeId(volume.id);
      setSelectedOutlineChapterId(null);
      updateActiveTabConfig({ selectedOutlineChapterId: null });
      const entry = getVolumeSummaryEntry(volume.name);
      setSelectedId(entry?.id ?? null);
      setOutlinePreviewDraft(entry?.content ?? '');
    };
    const toggleOutlineVolume = (volumeId: number) => {
      setExpandedOutlineVolumeIds((prev) => {
        const next = new Set(prev);
        if (next.has(volumeId)) next.delete(volumeId);
        else next.add(volumeId);
        return next;
      });
    };
    const moveDetailOutlineChapterToPublished = (chapterId: number) => {
      setManualDetailOutlinePublishedChapterIds((prev) => {
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });
      setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
      setShowDetailOutlinePublished(true);
    };
    const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {
      if (chapter.isPublished) return;
      setManualDetailOutlinePublishedChapterIds((prev) => {
        const next = new Set(prev);
        next.delete(chapter.id);
        return next;
      });
      setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    };
    const outlineSidebarWidth = settingLibraryLeftWidth;
    const outlinePreviewTitle = plotPointStandalone
      ? '剧情点预览'
      : isDetailOutlineTab
        ? 'AI输出章纲'
        : safeOutlineSelectionType === 'volume'
          ? '卷梗概预览'
          : '章节梗概';
    const outlinePromptCategory = plotPointStandalone
      ? PLOT_CHAIN_PROMPT_CATEGORY
      : isDetailOutlineTab
        ? DETAIL_OUTLINE_PROMPT_CATEGORY
        : SUMMARY_PROMPT_CATEGORY;
    const outlinePromptOptions = prompts.filter(
      (prompt) => normalizePromptCategoryName(prompt.category) === outlinePromptCategory,
    );
    const configuredOutlinePromptId = plotPointStandalone
      ? (activeTabConfig.plotPointPromptId ?? activeTabConfig.promptId)
      : isDetailOutlineTab
        ? (activeTabConfig.detailOutlinePromptId ?? activeTabConfig.promptId)
        : (activeTabConfig.outlineSummaryPromptId ?? activeTabConfig.promptId);
    const activeOutlinePromptId = outlinePromptOptions.some((prompt) => prompt.id === configuredOutlinePromptId)
      ? configuredOutlinePromptId
      : '';
    const activeOutlinePrompt =
      outlinePromptOptions.find((prompt) => prompt.id === activeOutlinePromptId) ?? outlinePromptOptions[0] ?? null;
    const updateOutlinePromptId = (value: string) => {
      if (plotPointStandalone) {
        updateActiveTabConfig({ plotPointPromptId: value });
        return;
      }
      if (isDetailOutlineTab) {
        updateActiveTabConfig({ detailOutlinePromptId: value });
        return;
      }
      updateActiveTabConfig({ outlineSummaryPromptId: value });
    };
    const selectedOutlineModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const outlineModelFieldSizeKey: WorkbenchFieldSizeKey = isDetailOutlineTab
      ? 'detailOutlineModelSelect'
      : 'outlineSummaryModelSelect';
    const outlineAiInput = activeTabConfig.outlineAiInput ?? '';
    const setOutlineAiInput = (value: string) => updateActiveTabConfig({ outlineAiInput: value });
    const detailOutlineReaderSettingEntries = settingTypeOptions.flatMap((type) =>
      entries.filter((entry) => entry.tab === SETTING_TAB && parseSettingContent(entry.content).type === type),
    );
    const detailOutlineReaderRoleEntries = roleTypeOptions.flatMap((type) =>
      entries
        .filter((entry) => entry.tab === ROLE_TAB && parseRoleContent(entry.content).type === type)
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
    );
    const detailOutlineReaderSettingItems = detailOutlineReaderSettingEntries
      .map((entry) => {
        const parsed = parseSettingContent(entry.content);
        const content = parsed.body || entry.content || '';
        return {
          id: entry.id,
          title: entry.title || '未命名设定',
          group: parsed.type || '未分类',
          content,
        };
      })
      .filter((item) => item.content.trim());
    const detailOutlineReaderRoleItems = detailOutlineReaderRoleEntries
      .map((entry) => {
        const parsed = parseRoleContent(entry.content);
        return {
          id: entry.id,
          title: entry.title || '未命名角色',
          group: parsed.type || '未分类',
          content: buildRoleReaderContent(entry, parsed),
        };
      })
      .filter((item) => item.content.trim());
    const hasCurrentDetailOutlineReaderSession = isWorkbenchAssociationRuntimeCurrent(
      activeTabConfig.detailOutlineReaderSessionId,
    );
    const inheritedDetailOutlineSettingIds =
      hasCurrentDetailOutlineReaderSession &&
      isDetailOutlineTab &&
      !activeTabConfig.detailOutlineReaderTouched &&
      activeTabConfig.detailOutlineReaderSettingIds === undefined
        ? detailOutlineReaderSettingItems.map((item) => item.id)
        : hasCurrentDetailOutlineReaderSession
          ? (activeTabConfig.detailOutlineReaderSettingIds ?? [])
          : [];
    const selectedDetailOutlineSettingIds = new Set(inheritedDetailOutlineSettingIds);
    const selectedDetailOutlineRoleIds = new Set(
      hasCurrentDetailOutlineReaderSession
        ? activeTabConfig.detailOutlineReaderTouched
          ? (activeTabConfig.detailOutlineReaderRoleIds ?? [])
          : getInitialPlotChainRoleIds({
              configuredRoleIds: activeTabConfig.detailOutlineReaderRoleIds,
              plotPointStandalone,
              roles: detailOutlineReaderRoleItems,
            })
        : [],
    );
    const detailOutlineReaderOutlineLimitSerial =
      selectedOutlineChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
    const detailOutlineReaderOutlineItems = outlineChapters
      .filter(({ chapter }) => chapter.serialNumber < detailOutlineReaderOutlineLimitSerial)
      .map(({ volume, chapter }) => {
        const entry = getChapterSummaryEntry(chapter.serialNumber);
        return {
          id: String(chapter.id),
          title: `第${chapter.serialNumber}章章纲`,
          group: volume.name,
          content: entry?.content ?? '',
        };
      })
      .filter((item) => item.content.trim());
    const detailOutlineReaderPlotPointMap = new Map(
      [...Object.values(plotPointSelectedCandidateMap), ...PLOT_POINT_FALLBACK_CANDIDATES].map((item) => [
        item.id,
        item,
      ]),
    );
    const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])
      .map((id, index) => {
        const item = detailOutlineReaderPlotPointMap.get(id);
        if (!item) return null;
        const content = [getWorkbenchPlotPointText(item, plotPointLength), item.review ? `AI评价：${item.review}` : '']
          .filter(Boolean)
          .join('\n');
        return {
          id: item.id,
          title: `${index + 1}. ${item.title}`,
          group: plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`,
          content,
        };
      })
      .filter((item): item is { id: string; title: string; group: string; content: string } =>
        Boolean(item && item.content.trim()),
      );
    const selectedDetailOutlineOutlineIds = new Set(
      hasCurrentDetailOutlineReaderSession ? (activeTabConfig.detailOutlineReaderOutlineIds ?? []) : [],
    );
    const selectedDetailOutlinePlotChainIds = new Set(
      hasCurrentDetailOutlineReaderSession ? (activeTabConfig.detailOutlineReaderPlotChainIds ?? []) : [],
    );
    const selectedDetailOutlineSettingItems = detailOutlineReaderSettingItems.filter((item) =>
      selectedDetailOutlineSettingIds.has(item.id),
    );
    const selectedDetailOutlineRoleItems = detailOutlineReaderRoleItems.filter((item) =>
      selectedDetailOutlineRoleIds.has(item.id),
    );
    const selectedDetailOutlineOutlineItems = detailOutlineReaderOutlineItems.filter((item) =>
      selectedDetailOutlineOutlineIds.has(item.id),
    );
    const selectedDetailOutlinePlotChainItems = detailOutlineReaderPlotChainItems.filter((item) =>
      selectedDetailOutlinePlotChainIds.has(item.id),
    );
    const selectedDetailOutlineReaderItems = [
      ...selectedDetailOutlineSettingItems,
      ...selectedDetailOutlineRoleItems,
      ...selectedDetailOutlineOutlineItems,
      ...selectedDetailOutlinePlotChainItems,
    ];
    const detailOutlineReaderWordCount = selectedDetailOutlineReaderItems.reduce(
      (sum, item) => sum + countTextWords(item.content),
      0,
    );
    const buildDetailOutlineReaderContext = () => {
      const settingText = selectedDetailOutlineSettingItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const outlineText = selectedDetailOutlineOutlineItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const roleText = selectedDetailOutlineRoleItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const plotChainText = selectedDetailOutlinePlotChainItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const innerContext = joinAiRequestSections([
        wrapAiRequestTag('设定资料', settingText),
        wrapAiRequestTag('角色资料', roleText),
        wrapAiRequestTag('前文章纲', outlineText),
        wrapAiRequestTag('剧情链', plotChainText),
      ]);
      return wrapAiRequestTag('关联资料', innerContext);
    };
    const openDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set(selectedDetailOutlineSettingIds));
      setDraftDetailOutlineReaderRoleIds(new Set(selectedDetailOutlineRoleIds));
      setDraftDetailOutlineReaderOutlineIds(new Set(selectedDetailOutlineOutlineIds));
      setDraftDetailOutlineReaderPlotChainIds(new Set(selectedDetailOutlinePlotChainIds));
      setDetailOutlineReaderTab('outlines');
      setDetailOutlineReaderPreviewId('');
      setIsDetailOutlineReaderOpen(true);
    };
    const clearDraftDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
      setDraftDetailOutlineReaderPlotChainIds(new Set());
    };
    const confirmDetailOutlineReader = () => {
      const validSettingIds = detailOutlineReaderSettingItems.map((item) => item.id);
      const validRoleIds = detailOutlineReaderRoleItems.map((item) => item.id);
      const validOutlineIds = detailOutlineReaderOutlineItems.map((item) => item.id);
      const validPlotChainIds = detailOutlineReaderPlotChainItems.map((item) => item.id);
      const nextSettingIds = Array.from(draftDetailOutlineReaderSettingIds).filter((id) =>
        validSettingIds.includes(id),
      );
      const nextRoleIds = Array.from(draftDetailOutlineReaderRoleIds).filter((id) => validRoleIds.includes(id));
      const nextOutlineIds = Array.from(draftDetailOutlineReaderOutlineIds).filter((id) =>
        validOutlineIds.includes(id),
      );
      const nextPlotChainIds = Array.from(draftDetailOutlineReaderPlotChainIds).filter((id) =>
        validPlotChainIds.includes(id),
      );
      const hasSelectedReaderItems =
        nextSettingIds.length > 0 || nextRoleIds.length > 0 || nextOutlineIds.length > 0 || nextPlotChainIds.length > 0;
      updateActiveTabConfig({
        detailOutlineReaderSessionId: hasSelectedReaderItems ? getWorkbenchAssociationRuntimeId() : null,
        detailOutlineReaderTouched: true,
        detailOutlineReaderSettingIds: nextSettingIds,
        detailOutlineReaderRoleIds: nextRoleIds,
        detailOutlineReaderOutlineIds: nextOutlineIds,
        detailOutlineReaderPlotChainIds: nextPlotChainIds,
      });
      setIsDetailOutlineReaderOpen(false);
    };
    const clearDetailOutlineReaderSelection = () => {
      updateActiveTabConfig({
        detailOutlineReaderSessionId: null,
        detailOutlineReaderTouched: true,
        detailOutlineReaderSettingIds: [],
        detailOutlineReaderRoleIds: [],
        detailOutlineReaderOutlineIds: [],
        detailOutlineReaderPlotChainIds: [],
      });
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
      setDraftDetailOutlineReaderPlotChainIds(new Set());
    };
    const toggleDraftDetailOutlineReaderSetting = (id: string) => {
      setDraftDetailOutlineReaderSettingIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderRole = (id: string) => {
      setDraftDetailOutlineReaderRoleIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderOutline = (id: string) => {
      setDraftDetailOutlineReaderOutlineIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderPlotChain = (id: string) => {
      setDraftDetailOutlineReaderPlotChainIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const outlinePreviewDraftContent = stripAiThinkingBlock(outlinePreviewDraft);
    const plotPointGeneratedCandidates = parseGeneratedPlotPointCandidates(plotPointGeneratedCandidateText);
    const normalizedGeneratedPlotPointCandidates = plotPointGeneratedCandidates.map((item) => ({
      ...item,
      source: plotPointSourceMode === 'library' ? ('剧情库' as const) : item.source,
    }));
    const plotPointLibraryCandidates = readPlotLibrarySnapshot().items.slice(0, 30).map(plotLibraryItemToCandidate);
    const effectivePlotPointLibraryCandidates =
      plotPointLibraryCandidates.length > 0
        ? plotPointLibraryCandidates
        : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === '剧情库');
    const effectivePlotPointAiCandidates =
      normalizedGeneratedPlotPointCandidates.length > 0
        ? normalizedGeneratedPlotPointCandidates
        : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === 'AI生成');
    const plotPointCandidatePool =
      normalizedGeneratedPlotPointCandidates.length > 0
        ? normalizedGeneratedPlotPointCandidates
        : isLibraryAiLoading
          ? []
          : isPlotPointPreviewCleared
            ? []
            : plotPointSourceMode === 'library'
              ? effectivePlotPointLibraryCandidates
              : plotPointSourceMode === 'ai'
                ? effectivePlotPointAiCandidates
                : [...effectivePlotPointLibraryCandidates, ...effectivePlotPointAiCandidates];
    const plotPointVisibleCandidates = plotPointCandidatePool.slice(0, plotPointGenerateCount);
    const plotPointSelectedIds = plotPointChainSelections[plotPointActiveChainSlot] ?? [];
    const hasPlotPointChain = plotPointSelectedIds.length > 0;
    const isPlotPointFollowupStage = hasPlotPointChain && plotPointChainRefreshStates[plotPointActiveChainSlot];
    const plotPointCandidateMap = new Map(
      [
        ...Object.values(plotPointSelectedCandidateMap),
        ...effectivePlotPointLibraryCandidates,
        ...effectivePlotPointAiCandidates,
        ...PLOT_POINT_FALLBACK_CANDIDATES,
      ].map((item) => [item.id, item]),
    );
    const plotPointSelectedItems = plotPointSelectedIds
      .map((id) => plotPointCandidateMap.get(id))
      .filter((item): item is WorkbenchPlotPointCandidate => Boolean(item));
    const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];
    const plotPointWrittenIdSet = new Set(plotPointWrittenIds);
    const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));
    const visiblePlotPointSelectedItems = plotPointSelectedItems.filter((item) => {
      const written = plotPointWrittenIdSet.has(item.id);
      if (plotPointChainFilterMode === 'written') return written;
      if (plotPointChainFilterMode === 'unwritten') return !written;
      return true;
    });
    const firstPlotPointChainTitle = plotPointSelectedItems[0] ? '剧情点 1' : '还没有第1号剧情';
    const firstPlotPointChainContent = plotPointSelectedItems[0]
      ? getWorkbenchPlotPointText(plotPointSelectedItems[0], plotPointLength)
      : '';
    const togglePlotPointCandidate = (id: string) => {
      const candidate = plotPointCandidateMap.get(id);
      setPlotPointChainSelections((current) => {
        const currentChain = current[plotPointActiveChainSlot] ?? [];
        const isSelected = currentChain.includes(id);
        if (!isSelected && candidate) {
          setPlotPointSelectedCandidateCache((cache) => ({ ...cache, [id]: candidate }));
        }
        const next = {
          ...current,
          [plotPointActiveChainSlot]: currentChain.includes(id)
            ? currentChain.filter((itemId) => itemId !== id)
            : [...currentChain, id],
        };
        updateActiveTabConfig({ plotPointChainSelections: next });
        if (isSelected) {
          setPlotPointChainWrittenSelections((writtenCurrent) => {
            const nextWritten = {
              ...writtenCurrent,
              [plotPointActiveChainSlot]: (writtenCurrent[plotPointActiveChainSlot] ?? []).filter(
                (itemId) => itemId !== id,
              ),
            };
            updateActiveTabConfig({ plotPointChainWrittenSelections: nextWritten });
            return nextWritten;
          });
          if (activePlotPointChainItemId === id) setActivePlotPointChainItemId(null);
        }
        return next;
      });
      setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: false }));
    };
    const markPlotPointChainItemWritten = (id: string) => {
      setPlotPointChainWrittenSelections((current) => {
        const currentWritten = current[plotPointActiveChainSlot] ?? [];
        if (currentWritten.includes(id)) return current;
        const next = {
          ...current,
          [plotPointActiveChainSlot]: [...currentWritten, id],
        };
        updateActiveTabConfig({ plotPointChainWrittenSelections: next });
        return next;
      });
    };
    const movePlotPointChainItemToUnwritten = (id: string) => {
      setPlotPointChainWrittenSelections((current) => {
        const currentWritten = current[plotPointActiveChainSlot] ?? [];
        if (!currentWritten.includes(id)) return current;
        const next = {
          ...current,
          [plotPointActiveChainSlot]: currentWritten.filter((itemId) => itemId !== id),
        };
        updateActiveTabConfig({ plotPointChainWrittenSelections: next });
        return next;
      });
    };
    const togglePlotPointPreviewExpanded = (id: string) => {
      setExpandedPlotPointPreviewIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
    };
    const togglePlotPointOpeningElement = (element: string) => {
      setPlotPointOpeningElementsState((current) => {
        const next = current.includes(element) ? current.filter((item) => item !== element) : [...current, element];
        updateActiveTabConfig({ plotPointOpeningElements: next });
        return next;
      });
    };
    const plotPointLibraryContext = (plotPointSourceMode === 'ai' ? [] : plotPointLibraryCandidates)
      .slice(0, plotPointGenerateCount)
      .map((item, index) => `${index + 1}. ${item.title}\n${item.adapted}`)
      .join('\n\n');
    const plotPointChainContext = plotPointSelectedItems
      .map((item, index) => `${index + 1}. ${item.title}：${getWorkbenchPlotPointText(item, plotPointLength)}`)
      .join('\n');
    const plotPointRoleNameHints = selectedDetailOutlineRoleItems
      .map((item) => `${item.group}：${item.title}`)
      .join('；');
    const plotPointSettingNameHints = selectedDetailOutlineSettingItems
      .map((item) => `${item.group}：${item.title}`)
      .join('；');
    const plotPointProtagonistReplacementRule = getPlotPointProtagonistReplacementRule(detailOutlineReaderRoleItems);
    const buildPlotPointOutlineInput = () => {
      if (plotPointSelectedItems.length === 0) return '';
      const chainText = plotPointSelectedItems
        .map((item, index) => `${index + 1}. ${item.title}\n${getWorkbenchPlotPointText(item, plotPointLength)}`)
        .join('\n\n');
      const selectedReaderContext = buildDetailOutlineReaderContext();
      return [
        `请根据以下剧情链生成本章章纲，只输出适合写作执行的章纲要求，不要输出正文。请在末尾输出${DETAIL_OUTLINE_STATE_MARKER}，按人物状态、道具状态、势力状态、关系状态、线索/信息列出本章预计变化。`,
        `当前目标：${selectedOutlineChapter ? `第${selectedOutlineChapter.chapter.serialNumber}章` : '当前章节'}`,
        `【剧情链】\n${chainText}`,
        selectedReaderContext ? `【关联内容】\n${selectedReaderContext}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    };
    const openDetailOutlineFromPlotPoint = () => {
      const nextInput = buildPlotPointOutlineInput();
      if (!nextInput) return;
      updateActiveTabConfig({ outlineAiInput: nextInput });
      onOpenDetailOutlineFromPlotChain?.();
    };
    const getPlotPointGenerationRulesText = () =>
      [
        `长度：${getPlotPointLengthLabel(plotPointLength)}。`,
        plotPointOpeningElements.length > 0 ? `类型：${plotPointOpeningElements.join('、')}。` : '类型：未指定。',
        `剧情点数量：${plotPointGenerateCount}个。`,
      ].join('\n');
    const buildPlotPointRequestText = (userText: string) => {
      const effectivePlotPointChainContext =
        plotPointGenerationModeRef.current === 'continue' ? plotPointChainContext : '';
      return [
        `【生成规则】\n${getPlotPointGenerationRulesText()}`,
        '【任务要求】\n请生成剧情点，不要直接写成完整正文。',
        plotPointProtagonistReplacementRule,
        '变量替换硬规则：输出里的角色、势力、道具、地点和外挂变量，必须优先替换成当前小说已关联设定/角色里的具体名称。',
        plotPointRoleNameHints
          ? `已关联角色名：${plotPointRoleNameHints}。例如主角叫“林刻”时，输出必须写“林刻”，不要写“主角”或照抄剧情库原角色名。`
          : '',
        plotPointSettingNameHints
          ? `已关联设定名：${plotPointSettingNameHints}。剧情库里的旧世界观、旧势力名、旧道具名只能当结构参考，不能原样照抄。`
          : '',
        '如果某个变量在当前设定中找不到明确对应物，可以使用“某势力/某秘宝”等临时占位，但不能保留剧情库原小说的人名和专名。',
        effectivePlotPointChainContext
          ? [
              `当前剧情链：\n${effectivePlotPointChainContext}`,
              '本次任务是“衔接当前剧情链”，不是重新生成开头剧情。',
              '所有候选剧情点都必须直接承接当前剧情链最后一条的后果、目标、冲突或悬念。',
              '本批所有候选都处在同一个下一步进度，都是可衔接当前剧情链的不同备选方案，不是连续章节。',
              '不要输出与当前剧情链无关的通用套路、世界观介绍、人物设定说明或重新开局。',
              '每条候选只写下一步可执行剧情：谁遇到什么新问题、如何推进、留下什么期待。',
            ].join('\n')
          : [
              '当前剧情链为空，请生成同一进度的开端候选。',
              '每个候选都必须能作为小说真正的第一章开场使用：必须直接出现主角首次进入故事的处境、场景、压力、冲突或异变触发。',
              '不要把候选写成已经经过前情推进后的续写内容，不要默认系统已激活、奖励已发放、战斗已开始、学校已爆炸、任务已进行到中段。',
              '不要让第1条、第2条、第3条分别承担不同章节进度；它们都应该是“同一章开头的不同方案”。',
            ].join('\n'),
        plotPointLibraryContext && !effectivePlotPointChainContext ? `可参考剧情库：\n${plotPointLibraryContext}` : '',
        buildPlotPointOutputFormatInstruction({
          count: plotPointGenerateCount,
          hasChain: Boolean(effectivePlotPointChainContext),
        }),
        userText ? `【用户要求】\n${userText}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    };
    const outlineDraftFrameTitle = plotPointStandalone
      ? selectedOutlineChapter
        ? `第${selectedOutlineChapter.chapter.serialNumber}章剧情点（第${getVolumeDisplayIndex(selectedOutlineChapter.volume.id)}卷）`
        : '剧情点预览'
      : safeOutlineSelectionType === 'volume' && selectedOutlineVolume
        ? `${selectedOutlineVolume.name}梗概`
        : selectedOutlineChapter
          ? isDetailOutlineTab
            ? 'AI输出框'
            : `第${selectedOutlineChapter.chapter.serialNumber}章梗概`
          : outlinePreviewTitle;
    const outlineDraftCountLeft = plotPointStandalone
      ? '7.6rem'
      : isDetailOutlineTab
        ? '6.2rem'
        : safeOutlineSelectionType === 'volume'
          ? '8.2rem'
          : selectedOutlineChapter
            ? '11.4rem'
            : '6.2rem';
    const shouldShowOutlineDraftWordCount = plotPointStandalone;
    const getSelectedOutlineContext = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        return selectedOutlineVolume.chapters
          .map((chapter) => {
            const content = getChapterContent?.(chapter.id) ?? '';
            return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
          })
          .join('\n\n');
      }
      if (!selectedOutlineChapter) return '';
      const { chapter } = selectedOutlineChapter;
      const content = getChapterContent?.(chapter.id) ?? '';
      return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
    };
    const getOutlineContextTitle = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        return `${selectedOutlineVolume.name} · ${selectedOutlineVolume.chapters.length}章`;
      }
      if (!selectedOutlineChapter) return '未选择章节';
      return `第${selectedOutlineChapter.chapter.serialNumber}章 ${selectedOutlineChapter.chapter.title}`;
    };
    const getOutlineFullContextTitle = () => {
      const baseTitle = getOutlineContextTitle();
      if (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0) return baseTitle;
      return `${baseTitle} + 读取${selectedDetailOutlineReaderItems.length}项`;
    };
    const getOutlineAiContext = () => {
      const selectedContext = getSelectedOutlineContext();
      const readerContext = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      if (isDetailOutlineTab) return readerContext;
      return joinAiRequestSections([
        wrapAiRequestTag('待梗概正文', selectedContext, { 标题: getOutlineContextTitle() }),
        readerContext,
      ]);
    };
    const formatOutlineUserTextForAi = (userText: string) => {
      if (plotPointStandalone) return userText;
      if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);
      return wrapAiRequestTag('梗概要求', userText);
    };
    const getOutlineDefaultPrompt = () =>
      plotPointStandalone
        ? '请根据关联的大纲设定、前文章纲、剧情链和用户要求，生成适合本书下一步展开的剧情点。'
        : isDetailOutlineTab
          ? `请根据关联的设定、前文章纲和剧情链生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}，按人物状态、道具状态、势力状态、关系状态、线索/信息列出本章预计变化；这里不是正式状态库，只是本章写作计划。`
          : '请根据所选章节正文生成章节梗概。';
    const buildOutlineAiRequestLog = (
      userText: string,
      contextText: string,
      promptText: string,
      createdAt = '当前预览',
      visibleUserText = userText,
    ): LibraryAiRequestLog => {
      const readerContextText = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      return {
        createdAt,
        tab: plotPointStandalone ? '生成剧情链' : isDetailOutlineTab ? '生成章纲' : '章节梗概',
        modelName: selectedOutlineModel?.name ?? '未选择模型',
        promptName: activeOutlinePrompt?.name ?? '默认提示词',
        hasLinkedBrainstorm: false,
        linkedBrainstormTitle: '',
        visibleUserText,
        systemPrompt: promptText,
        userContent: userText,
        contextTitle: contextText
          ? plotPointStandalone
            ? selectedDetailOutlineReaderItems.length > 0
              ? `已关联 ${selectedDetailOutlineReaderItems.length} 项`
              : ''
            : getOutlineFullContextTitle()
          : '',
        contextText,
        contextWordCount: countTextWords(contextText),
        readerContextTitle:
          selectedDetailOutlineReaderItems.length > 0 ? `已关联 ${selectedDetailOutlineReaderItems.length} 项` : '',
        readerContextText,
        readerContextWordCount: countTextWords(readerContextText),
      };
    };
    const previewOutlineContextText = getOutlineAiContext();
    const previewOutlinePromptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
    const shouldShowOutlineBodyContext = !isDetailOutlineTab;
    const visibleOutlineAiRequestLog =
      (isLibraryAiLogOpen && libraryAiLogScope === 'outline'
        ? buildOutlineAiRequestLog(
            plotPointStandalone
              ? buildPlotPointRequestText(outlineAiInput.trim())
              : formatOutlineUserTextForAi(outlineAiInput.trim()),
            previewOutlineContextText,
            previewOutlinePromptText,
            '当前预览',
            plotPointStandalone ? buildPlotPointRequestText(outlineAiInput.trim()) : outlineAiInput.trim(),
          )
        : null) ?? lastOutlineAiRequestLog;
    const outlineUserLogTitle = isDetailOutlineTab && !plotPointStandalone ? '其他要求' : '输入内容';
    const outlineAiLogModal =
      isLibraryAiLogOpen && libraryAiLogScope === 'outline' && visibleOutlineAiRequestLog ? (
        <OutlineAiLogModal
          activeTab={activeTab}
          requestLog={visibleOutlineAiRequestLog}
          isDetailOutlineTab={isDetailOutlineTab}
          plotPointStandalone={plotPointStandalone}
          shouldShowOutlineBodyContext={shouldShowOutlineBodyContext}
          outlineUserLogTitle={outlineUserLogTitle}
          onClose={() => setIsLibraryAiLogOpen(false)}
        />
      ) : null;
    const draftDetailOutlineReaderItems = [
      ...detailOutlineReaderSettingItems.filter((item) => draftDetailOutlineReaderSettingIds.has(item.id)),
      ...detailOutlineReaderRoleItems.filter((item) => draftDetailOutlineReaderRoleIds.has(item.id)),
      ...detailOutlineReaderOutlineItems.filter((item) => draftDetailOutlineReaderOutlineIds.has(item.id)),
      ...detailOutlineReaderPlotChainItems.filter((item) => draftDetailOutlineReaderPlotChainIds.has(item.id)),
    ];
    const draftDetailOutlineReaderWordCount = draftDetailOutlineReaderItems.reduce(
      (sum, item) => sum + countTextWords(item.content),
      0,
    );
    const activeDetailOutlineReaderItems =
      detailOutlineReaderTab === 'settings'
        ? detailOutlineReaderSettingItems
        : detailOutlineReaderTab === 'roles'
          ? detailOutlineReaderRoleItems
          : detailOutlineReaderTab === 'plotChain'
            ? detailOutlineReaderPlotChainItems
            : detailOutlineReaderOutlineItems;
    const activeDetailOutlineReaderPreviewItem =
      activeDetailOutlineReaderItems.find((item) => item.id === detailOutlineReaderPreviewId) ?? null;
    const isActiveDetailOutlineReaderPreviewChecked = activeDetailOutlineReaderPreviewItem
      ? detailOutlineReaderTab === 'settings'
        ? draftDetailOutlineReaderSettingIds.has(activeDetailOutlineReaderPreviewItem.id)
        : detailOutlineReaderTab === 'roles'
          ? draftDetailOutlineReaderRoleIds.has(activeDetailOutlineReaderPreviewItem.id)
          : detailOutlineReaderTab === 'plotChain'
            ? draftDetailOutlineReaderPlotChainIds.has(activeDetailOutlineReaderPreviewItem.id)
            : draftDetailOutlineReaderOutlineIds.has(activeDetailOutlineReaderPreviewItem.id)
      : false;
    const detailOutlineReaderNavGroups = Array.from(
      activeDetailOutlineReaderItems.reduce((map, item) => {
        map.set(item.group, [...(map.get(item.group) ?? []), item]);
        return map;
      }, new Map<string, typeof activeDetailOutlineReaderItems>()),
    ).map(([group, items]) => ({ group, items }));
    const toggleDetailOutlineReaderGroup = (group: string) => {
      const key = `${detailOutlineReaderTab}:${group}`;
      setCollapsedDetailOutlineReaderGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const setDraftDetailOutlineReaderIdsForActiveTab = (ids: Set<string>) => {
      if (detailOutlineReaderTab === 'settings') setDraftDetailOutlineReaderSettingIds(ids);
      else if (detailOutlineReaderTab === 'roles') setDraftDetailOutlineReaderRoleIds(ids);
      else if (detailOutlineReaderTab === 'plotChain') setDraftDetailOutlineReaderPlotChainIds(ids);
      else setDraftDetailOutlineReaderOutlineIds(ids);
    };
    const getDraftDetailOutlineReaderIdsForActiveTab = () =>
      detailOutlineReaderTab === 'settings'
        ? draftDetailOutlineReaderSettingIds
        : detailOutlineReaderTab === 'roles'
          ? draftDetailOutlineReaderRoleIds
          : detailOutlineReaderTab === 'plotChain'
            ? draftDetailOutlineReaderPlotChainIds
            : draftDetailOutlineReaderOutlineIds;
    const selectAllActiveDetailOutlineReaderItems = () => {
      setDraftDetailOutlineReaderIdsForActiveTab(new Set(activeDetailOutlineReaderItems.map((item) => item.id)));
    };
    const toggleActiveDetailOutlineReaderGroupSelection = (items: typeof activeDetailOutlineReaderItems) => {
      const current = getDraftDetailOutlineReaderIdsForActiveTab();
      const next = new Set(current);
      const allSelected = items.every((item) => next.has(item.id));
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      setDraftDetailOutlineReaderIdsForActiveTab(next);
    };
    const detailOutlineReaderModal = (
      <DetailOutlineReaderModal
        isDetailOutlineReaderOpen={isDetailOutlineReaderOpen}
        isDetailOutlineTab={isDetailOutlineTab}
        detailOutlineReaderTab={detailOutlineReaderTab}
        activeDetailOutlineReaderItems={activeDetailOutlineReaderItems}
        detailOutlineReaderNavGroups={detailOutlineReaderNavGroups}
        collapsedDetailOutlineReaderGroups={collapsedDetailOutlineReaderGroups}
        draftDetailOutlineReaderSettingIds={draftDetailOutlineReaderSettingIds}
        draftDetailOutlineReaderRoleIds={draftDetailOutlineReaderRoleIds}
        draftDetailOutlineReaderOutlineIds={draftDetailOutlineReaderOutlineIds}
        draftDetailOutlineReaderPlotChainIds={draftDetailOutlineReaderPlotChainIds}
        activeDetailOutlineReaderPreviewItem={activeDetailOutlineReaderPreviewItem}
        isActiveDetailOutlineReaderPreviewChecked={isActiveDetailOutlineReaderPreviewChecked}
        draftDetailOutlineReaderItems={draftDetailOutlineReaderItems}
        draftDetailOutlineReaderWordCount={draftDetailOutlineReaderWordCount}
        detailOutlineReaderSettingItems={detailOutlineReaderSettingItems}
        detailOutlineReaderRoleItems={detailOutlineReaderRoleItems}
        detailOutlineReaderPlotChainItems={detailOutlineReaderPlotChainItems}
        setIsDetailOutlineReaderOpen={setIsDetailOutlineReaderOpen}
        setDetailOutlineReaderTab={setDetailOutlineReaderTab}
        setDetailOutlineReaderPreviewId={setDetailOutlineReaderPreviewId}
        selectAllActiveDetailOutlineReaderItems={selectAllActiveDetailOutlineReaderItems}
        toggleDetailOutlineReaderGroup={toggleDetailOutlineReaderGroup}
        toggleActiveDetailOutlineReaderGroupSelection={toggleActiveDetailOutlineReaderGroupSelection}
        toggleDraftDetailOutlineReaderSetting={toggleDraftDetailOutlineReaderSetting}
        toggleDraftDetailOutlineReaderRole={toggleDraftDetailOutlineReaderRole}
        toggleDraftDetailOutlineReaderOutline={toggleDraftDetailOutlineReaderOutline}
        toggleDraftDetailOutlineReaderPlotChain={toggleDraftDetailOutlineReaderPlotChain}
        clearDraftDetailOutlineReader={clearDraftDetailOutlineReader}
        confirmDetailOutlineReader={confirmDetailOutlineReader}
      />
    );
    const sendPlotPointAiMessage = async () => {
      const userText = plotPointInput.trim();
      const requestText = [
        '请根据关联的大纲设定、前文章纲和当前章节正文，生成本章剧情点。',
        '输出要求：按条列出关键剧情点，每条尽量包含冲突、行动、变化或伏笔，不要直接写成完整正文。',
        userText ? `补充要求：${userText}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      if (isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setPlotPointOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastOutlineAiRequestLog(
        buildOutlineAiRequestLog(requestText, contextText, promptText, new Date().toLocaleString('zh-CN')),
      );
      setIsLibraryAiLoading(true);
      setPlotPointOutput('正在思考...');
      setPlotPointGeneratedCandidateText('');
      setIsPlotPointPreviewCleared(true);
      const task = startBackgroundAiTask({
        kind: 'detailOutline',
        title: '生成剧情点',
        input: requestText,
        initialOutput: '正在思考...',
        progressLabel: '正在生成',
        meta: {
          target: 'workbenchPlotPointAi',
          storageKey,
          tab: activeTab,
        },
        runner: async ({ signal, emit }) => {
          let content = '';
          let reasoningContent = '';
          const startedAt = Date.now();
          const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
          try {
            content = await callModelStream({
              model: selectedOutlineModel,
              prompt: `${promptText}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`,
              userContent: requestText,
              chapterContext: contextText,
              recordType: 'stream',
              signal,
              onReasoning: (chunk) => {
                reasoningContent += chunk;
                emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                  replace: true,
                });
              },
              onChunk: (chunk) => {
                content += chunk;
                emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                  replace: true,
                });
              },
            });
            return reasoningContent.trim()
              ? formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true)
              : content;
          } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
              const message = error instanceof Error ? error.message : '模型请求失败。';
              emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
            }
            throw error;
          }
        },
      });
      updateActiveTabConfig({ plotPointAiTaskId: task.id });
    };
    const plotPointOutputContent = stripAiThinkingBlock(plotPointOutput);
    const plotPointOverlay = (
      <PlotPointGenerationModal
        plotPointStandalone={plotPointStandalone}
        plotPointOutput={plotPointOutput}
        plotPointOutputContent={plotPointOutputContent}
        plotPointInput={plotPointInput}
        isLibraryAiLoading={isLibraryAiLoading}
        contextTitle={getOutlineContextTitle()}
        modelName={selectedOutlineModel?.name ?? '未选择模型'}
        promptName={activeOutlinePrompt?.name ?? '默认提示词'}
        linkedReaderCount={selectedDetailOutlineReaderItems.length}
        linkedReaderWordCount={detailOutlineReaderWordCount}
        onClose={() => setIsPlotPointModalOpen(false)}
        onOpenReader={openDetailOutlineReader}
        onOutputChange={(value) => {
          setPlotPointOutput(value);
          setPlotPointGeneratedCandidateText(value);
          setIsPlotPointPreviewCleared(false);
        }}
        onInputChange={setPlotPointInput}
        onSend={() => void sendPlotPointAiMessage()}
        onStop={() => {
          if (activeTabConfig.plotPointAiTaskId) stopBackgroundAiTask(activeTabConfig.plotPointAiTaskId);
          setIsLibraryAiLoading(false);
        }}
        onUseAsOutlineInput={() => {
          setOutlineAiInput(plotPointOutputContent);
          setIsPlotPointModalOpen(false);
        }}
        onCopyOutput={() => void navigator.clipboard.writeText(plotPointOutputContent)}
        onClearOutput={() => {
          if (activeTabConfig.plotPointAiTaskId) stopBackgroundAiTask(activeTabConfig.plotPointAiTaskId);
          setPlotPointOutput('');
          setPlotPointGeneratedCandidateText('');
          setIsPlotPointPreviewCleared(true);
          updateActiveTabConfig({ plotPointAiTaskId: undefined });
        }}
      />
    );
    const plotPointModal =
      isPlotPointModalOpen && isDetailOutlineTab && !plotPointStandalone
        ? createPortal(plotPointOverlay, document.body)
        : null;
    const sendOutlineAiMessage = async () => {
      const userText = outlineAiInput.trim();
      const rawRequestText = plotPointStandalone
        ? buildPlotPointRequestText(userText)
        : userText || (isDetailOutlineTab ? '请根据关联的设定和前文章纲生成本章章纲。' : '');
      const requestText = formatOutlineUserTextForAi(rawRequestText);
      if (!requestText || isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setOutlinePreviewDraft('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = plotPointStandalone
        ? `${activeOutlinePrompt?.content ?? getOutlineDefaultPrompt()}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`
        : (activeOutlinePrompt?.content ?? getOutlineDefaultPrompt());
      setLastOutlineAiRequestLog(
        buildOutlineAiRequestLog(
          requestText,
          contextText,
          promptText,
          new Date().toLocaleString('zh-CN'),
          rawRequestText,
        ),
      );
      setIsLibraryAiLoading(true);
      setOutlineAiInput('');
      setOutlinePreviewDraft('正在思考...');
      if (plotPointStandalone) {
        setPlotPointGeneratedCandidateText('');
        setIsPlotPointPreviewCleared(true);
      }
      const task = startBackgroundAiTask({
        kind: plotPointStandalone ? 'detailOutline' : isDetailOutlineTab ? 'detailOutline' : 'summary',
        title: plotPointStandalone ? '生成剧情点' : isDetailOutlineTab ? '生成章纲' : '生成梗概',
        input: requestText,
        initialOutput: '正在思考...',
        progressLabel: '正在生成',
        meta: {
          target: 'workbenchOutlineAi',
          storageKey,
          tab: activeTab,
          plotPointStandalone,
        },
        runner: async ({ signal, emit }) => {
          let content = '';
          let reasoningContent = '';
          const startedAt = Date.now();
          const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
          try {
            content = await callModelStream({
              model: selectedOutlineModel,
              prompt: promptText,
              userContent: requestText,
              chapterContext: contextText,
              recordType: 'stream',
              signal,
              onReasoning: (chunk) => {
                reasoningContent += chunk;
                emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                  replace: true,
                });
              },
              onChunk: (chunk) => {
                content += chunk;
                emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                  replace: true,
                });
              },
            });
            return reasoningContent.trim()
              ? formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true)
              : content;
          } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
              const message = error instanceof Error ? error.message : '模型请求失败。';
              emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
            }
            throw error;
          }
        },
      });
      updateActiveTabConfig({
        outlineAiTaskId: task.id,
        ...(plotPointStandalone ? { plotPointPreviewDraft: '正在思考...' } : {}),
      });
    };
    const stopOutlineAiMessage = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      setIsLibraryAiLoading(false);
    };
    const clearOutlinePreviewDraft = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      updateActiveTabConfig({ outlineAiTaskId: undefined });
      setOutlinePreviewDraft('');
    };

    const plotPointLinkedSettingSummary =
      selectedDetailOutlineReaderItems.length > 0
        ? selectedDetailOutlineReaderItems.map((item) => item.title).join('、')
        : '未关联大纲设定';
    const plotPointUserRequirementSummary =
      plotPointOpeningElements.length > 0 ? plotPointOpeningElements.join('、') : '未选择';
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
                    const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');
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
    if (plotPointStandalone) {
      return (
        <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
          {fieldSizeSettingsModal}
          {managementModal && (
            <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />
          )}
          {outlineAiLogModal}
          {detailOutlineReaderModal}
          <main
            className="grid min-h-0 flex-1 overflow-hidden bg-white"
            style={{
              gridTemplateColumns: `${plotPointLayoutTreeWidth}px 0px ${plotPointLayoutLeftWidth}px 0px minmax(${PLOT_POINT_LAYOUT_CENTER_MIN_WIDTH}px,1fr) 0px ${plotPointLayoutRightWidth}px`,
            }}
          >
            <aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
              <nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">
                <div className="space-y-3">
                  <section
                    className="relative"
                    aria-label="当前主链未写序号导航"
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setPlotPointChainMenuSlot(plotPointActiveChainSlot);
                      setPlotPointChainRenameDraft(
                        plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`,
                      );
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}
                      onClick={() => {
                        setPlotPointChainMenuSlot(null);
                        setExpandedPlotPointChainTreeSlots((current) => ({
                          ...current,
                          [plotPointActiveChainSlot]: !(current[plotPointActiveChainSlot] ?? true),
                        }));
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                        {(expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">主链</span>
                      <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                        {plotPointUnwrittenItems.length}未写
                      </span>
                    </button>
                    {plotPointChainMenuSlot === plotPointActiveChainSlot && (
                      <div
                        role="menu"
                        aria-label="当前主链菜单"
                        className="absolute left-2 top-12 z-10 w-40 rounded-lg border border-[#bdeef7] bg-white p-2 shadow-lg"
                      >
                        <label
                          className="block text-[10px] font-black text-[#078fb0]"
                          htmlFor="plot-point-chain-rename"
                        >
                          重命名
                        </label>
                        <input
                          id="plot-point-chain-rename"
                          value={plotPointChainRenameDraft}
                          onChange={(event) => setPlotPointChainRenameDraft(event.target.value)}
                          className="mt-1 h-8 w-full rounded-md border border-[#bdeef7] px-2 text-xs font-bold text-slate-700 outline-none focus:border-[#08AACE]"
                        />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)}
                          className="mt-2 h-8 w-full rounded-md bg-[#08AACE] px-2 text-[11px] font-black text-white hover:bg-[#0798b8]"
                        >
                          保存
                        </button>
                      </div>
                    )}
                    {(expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true) && (
                      <div
                        className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}
                        aria-label="当前主链未写剧情点序号"
                      >
                        {plotPointUnwrittenItems.length === 0 ? (
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-400">
                            暂无未写剧情点
                          </div>
                        ) : (
                          plotPointUnwrittenItems.map((item) => {
                            const originalIndex = plotPointSelectedItems.findIndex(
                              (selectedItem) => selectedItem.id === item.id,
                            );
                            const activePoint = activePlotPointChainItemId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}
                                onClick={() => {
                                  setPlotPointChainMenuSlot(null);
                                  setPlotPointChainFilterMode('all');
                                  setActivePlotPointChainItemId(item.id);
                                }}
                                title={`未写剧情点${originalIndex + 1} ${item.title}`}
                                className={`relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                  activePoint
                                    ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                }`}
                              >
                                {originalIndex + 1}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </section>
                  <details className="rounded-xl bg-white text-xs font-bold text-slate-500">
                    <summary className="xy-plot-chain-summary flex cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-sm font-bold leading-5 text-white transition-colors hover:brightness-95">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>
                      <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                        {PLOT_POINT_CHAIN_SLOTS.length - 1}条
                      </span>
                    </summary>
                    <div className="mt-1 grid gap-2 px-1.5 py-1.5">
                      {PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setActivePlotPointChainSlot(slot)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                            {plotPointChainNames[slot] ?? `剧情链${slot}`}
                          </span>
                          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                            {(plotPointChainSelections[slot] ?? []).length}点
                          </span>
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </nav>
            </aside>

            {plotPointTreeResizeHandle}

            <aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-white">
              <div className="editor-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    ['all', '全部'],
                    ['unwritten', '只看未写'],
                    ['written', '只看已写'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPlotPointChainFilterMode(mode as typeof plotPointChainFilterMode)}
                      className={`h-10 w-20 whitespace-nowrap rounded-2xl border px-2 text-sm font-black ${
                        plotPointChainFilterMode === mode
                          ? 'border-[#08AACE] bg-[#08AACE] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openDetailOutlineFromPlotPoint}
                    className="h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE] px-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0798b8]"
                  >
                    生成章纲
                  </button>
                </div>
                {plotPointSelectedItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
                    先在右侧关联资料，再选择剧情点来源和剧情点类型。选中的剧情点会加入当前剧情链。
                  </div>
                ) : visiblePlotPointSelectedItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
                    当前过滤条件下没有剧情点，切到“全部”可以查看已写内容。
                  </div>
                ) : (
                  <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-[#9DEBFA]">
                    {visiblePlotPointSelectedItems.map((item) => {
                      const index = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);
                      const written = plotPointWrittenIdSet.has(item.id);
                      const activeChainItem = activePlotPointChainItemId === item.id;
                      const collapsedCard = prepareCollapsedPlotPointCard(item);
                      const scoreText = item.score ?? collapsedCard.averageScore;
                      const metrics = getWorkbenchPlotPointDecisionMetrics(item, scoreText, index > 0, index);
                      const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                      const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                      const reviewExpanded = expandedPlotPointPreviewIds.includes(`chain-review:${item.id}`);
                      const metricItems = [
                        ['内容', metrics.clarity],
                        ['潜力', metrics.potential],
                        ['衔接', metrics.fit],
                      ] as const;
                      return (
                        <div
                          key={item.id}
                          className={`relative rounded-2xl border bg-white p-4 shadow-sm ${activeChainItem ? 'border-[#08AACE] ring-2 ring-[#bdeef7]' : written ? 'border-slate-200' : 'border-[#bdeef7]'}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActivePlotPointChainItemId(item.id)}
                            className={`absolute -left-[26px] top-4 grid h-8 w-8 place-items-center rounded-full text-xs font-black shadow-sm ${
                              activeChainItem
                                ? 'bg-[#08AACE] text-white'
                                : written
                                  ? 'bg-slate-100 text-slate-500 ring-2 ring-slate-200'
                                  : 'bg-white text-[#08AACE] ring-2 ring-[#9DEBFA]'
                            }`}
                            title={`剧情点${index + 1} ${item.title}`}
                          >
                            {index + 1}
                          </button>
                          <div className="editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE] p-4 text-sm font-bold leading-7 text-slate-700">
                            {displayText}
                          </div>
                          <div className="mt-3 min-w-0">
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {metricItems.map(([label, value]) => (
                                <div
                                  key={label}
                                  className={`flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm ${getWorkbenchPlotPointMetricClass(value)}`}
                                >
                                  <span className="text-xs font-black opacity-80">{label}</span>
                                  <span className="text-sm font-black">{value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}
                                className="h-7 rounded-lg border border-[#bdeef7] bg-white px-3 text-xs font-black text-[#08AACE] transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD]"
                              >
                                {reviewExpanded ? '收起AI评价' : 'AI评价'}
                              </button>
                              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    written
                                      ? movePlotPointChainItemToUnwritten(item.id)
                                      : markPlotPointChainItemWritten(item.id)
                                  }
                                  className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-black shadow-sm transition-colors ${
                                    written
                                      ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                                      : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-white hover:text-emerald-800'
                                  }`}
                                >
                                  {written ? '移回未写' : '标为已写'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePlotPointCandidate(item.id)}
                                  className="h-8 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-red-500 shadow-sm transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                            {reviewExpanded && (
                              <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                                {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {plotPointLeftResizeHandle}

            <section className="min-w-0 flex min-h-0 flex-col bg-white">
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                {plotPointVisibleCandidates.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                    暂无剧情点预览
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plotPointVisibleCandidates.map((item, index) => {
                      const selected = plotPointSelectedIds.includes(item.id);
                      const expanded = expandedPlotPointPreviewIds.includes(item.id);
                      const collapsedCard = prepareCollapsedPlotPointCard(item);
                      const averageScore = item.score ?? collapsedCard.averageScore;
                      const metrics = getWorkbenchPlotPointDecisionMetrics(
                        item,
                        averageScore,
                        hasPlotPointChain,
                        index,
                      );
                      const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                      const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                      const fitLabel = getWorkbenchPlotPointFitLabel(metrics.fit, hasPlotPointChain);
                      const metricItems = [
                        ['内容', metrics.clarity],
                        ['潜力', metrics.potential],
                        [hasPlotPointChain ? '衔接' : '开端', metrics.fit],
                      ] as const;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-3 shadow-sm transition-colors ${selected ? 'border-[#08AACE] bg-[#EAF9FD] ring-2 ring-[#bdeef7]' : 'border-slate-200 bg-white hover:border-[#bdeef7]'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="min-w-0 max-w-full truncate text-base font-black text-slate-950">
                                  剧情点 {index + 1}
                                </span>
                                {averageScore && (
                                  <span
                                    className={`shrink-0 rounded-full bg-white px-2 py-1 text-xs font-black ${getPlotPointScoreColorClass(averageScore)}`}
                                  >
                                    {averageScore}分
                                  </span>
                                )}
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${getWorkbenchPlotPointFitClass(metrics.fit)}`}
                                >
                                  {fitLabel} {metrics.fit}
                                </span>
                                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]">
                                  {item.source}
                                </span>
                              </div>
                              <p
                                className={`mt-2 text-[14.4px] font-bold leading-[24px] ${expanded ? '' : 'line-clamp-3'} ${selected ? 'text-slate-800' : 'text-slate-600'}`}
                              >
                                {displayText}
                              </p>
                              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                                {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                              </div>
                            </div>
                            <div className="flex w-[118px] shrink-0 flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedPlotPointPreviewIds((current) =>
                                      current.includes(item.id)
                                        ? current.filter((candidateId) => candidateId !== item.id)
                                        : [...current, item.id],
                                    );
                                  }}
                                  className="h-8 w-12 shrink-0 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]"
                                >
                                  {expanded ? '收起' : '展开'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePlotPointCandidate(item.id)}
                                  className={`h-8 w-14 shrink-0 rounded-lg text-xs font-black ${selected ? 'bg-slate-900 text-white' : 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'}`}
                                >
                                  {selected ? '已选' : '选择'}
                                </button>
                              </div>
                              <div className="space-y-1">
                                {metricItems.map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2 text-[11px] font-black"
                                  >
                                    <span className="text-slate-500">{label}</span>
                                    <span className="text-slate-700">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">
                <button
                  type="button"
                  onClick={() => {
                    setPlotPointGeneratedCandidateText('');
                    setIsPlotPointPreviewCleared(true);
                    setOutlinePreviewDraft('');
                    setExpandedPlotPointPreviewIds([]);
                  }}
                  className="h-9 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-500 hover:bg-red-50"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isLibraryAiLoading) return;
                    plotPointGenerationModeRef.current = 'restart';
                    setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: false }));
                    setIsPlotPointPreviewCleared(false);
                    void sendOutlineAiMessage();
                  }}
                  disabled={isLibraryAiLoading}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-[#08AACE] hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  重新生成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isLibraryAiLoading || !hasPlotPointChain) return;
                    plotPointGenerationModeRef.current = 'continue';
                    setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: true }));
                    setIsPlotPointPreviewCleared(false);
                    void sendOutlineAiMessage();
                  }}
                  disabled={isLibraryAiLoading || !hasPlotPointChain}
                  className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  继续生成
                </button>
              </div>
            </section>

            {plotPointRightResizeHandle}

            <aside className="min-w-0 flex min-h-0 flex-col border-l border-slate-100 bg-gray-50">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 pt-2">
                <section className="shrink-0">
                  <div className="space-y-2">
                    {showInlineFieldSizeButton ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex shrink-0 items-center gap-2">
                          {renderLibraryAiLogButton(
                            'outline',
                            'h-9 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#08AACE]',
                          )}
                          {renderDetailOutlineFontSizeTool()}
                          {renderFieldSizeButton()}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2">
                      <CombinedAiConfigSelect
                        style={getEmbeddedConfigSelectStyle(getFieldSizeStyle(outlineModelFieldSizeKey))}
                        modelValue={activeTabConfig.modelId ?? ''}
                        promptValue={activeOutlinePromptId ?? ''}
                        modelOptions={
                          models.length === 0
                            ? [{ value: '', label: '暂无可用模型', disabled: true }]
                            : models.map((model) => ({ value: model.id, label: model.name }))
                        }
                        promptOptions={
                          outlinePromptOptions.length === 0
                            ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }]
                            : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                        }
                        onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                        onPromptChange={updateOutlinePromptId}
                        onModelManage={() => setManagementModal({ type: 'models' })}
                        onPromptManage={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {(
                          [
                            ['short', '短'],
                            ['medium', '中'],
                            ['long', '长'],
                          ] as const
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPlotPointLength(key)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointLength === key
                                ? 'bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点类型：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {(['强情绪', '强冲突', '强悬念'] as const).map((element) => (
                          <button
                            key={element}
                            type="button"
                            onClick={() => togglePlotPointOpeningElement(element)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointOpeningElements.includes(element)
                                ? 'bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {element}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0" />
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {(['强期待', '强爽点', '强压迫'] as const).map((element) => (
                          <button
                            key={element}
                            type="button"
                            onClick={() => togglePlotPointOpeningElement(element)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointOpeningElements.includes(element)
                                ? 'bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {element}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点数量：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {([5, 10, 20] as const).map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setPlotPointGenerateCount(count)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointGenerateCount === count
                                ? 'bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {count}个
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value">
                    <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto whitespace-pre-wrap text-xs font-bold leading-6 text-slate-600">
                      {outlinePreviewDraft.trim()
                        ? renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })
                        : null}
                    </div>
                    <label>{plotPointStandalone ? '剧情点预览' : '章纲预览'}</label>
                    <span
                      className="xy-floating-count xy-floating-count-top-left"
                      style={{ '--xy-floating-count-left': plotPointStandalone ? '7.6rem' : '6.2rem' } as CSSProperties}
                    >
                      <WordCountText value={countTextWords(outlinePreviewDraftContent)} />
                    </span>
                    <button
                      type="button"
                      onClick={clearOutlinePreviewDraft}
                      className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1 text-xs font-black text-red-500"
                    >
                      清空
                    </button>
                  </div>
                  <LinkedSourceControl
                    linked={selectedDetailOutlineReaderItems.length > 0}
                    label="关联"
                    linkedLabel="已关联"
                    onOpen={openDetailOutlineReader}
                    onClear={clearDetailOutlineReaderSelection}
                    meta={
                      detailOutlineReaderWordCount > 0 ? (
                        <WordCountText value={detailOutlineReaderWordCount} compact />
                      ) : null
                    }
                    title={plotPointLinkedSettingSummary}
                    className="mt-3 flex items-center gap-3"
                    groupClassName="flex h-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                    linkedButtonClassName="h-9 min-w-[78px] px-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                    clearButtonClassName="flex h-9 w-10 items-center justify-center bg-red-500 text-white hover:bg-red-600"
                    buttonClassName="h-9 min-w-[84px] rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                    metaClassName="shrink-0 text-sm font-black text-[#08AACE]"
                  />
                  <div className="mt-3">
                    <AiInlineInput
                      value={outlineAiInput}
                      onChange={(event) => {
                        setOutlineAiInput(event.target.value);
                        resizeFloatingAiTextarea(event.currentTarget);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          void sendOutlineAiMessage();
                        }
                      }}
                      onSend={() => void sendOutlineAiMessage()}
                      onStop={stopOutlineAiMessage}
                      sendDisabled={isLibraryAiLoading}
                      stopDisabled={!isLibraryAiLoading}
                      textareaClassName="editor-scrollbar"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {libraryHeaderFontSizePortal}
        {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) &&
          !plotPointStandalone &&
          renderTopTabs()}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {outlineAiLogModal}
        {plotPointModal}
        {detailOutlineReaderModal}
        {detailOutlineChapterMenu.visible && detailOutlineChapterMenu.chapter && (
          <div
            className="fixed z-[100] w-[136px] rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
            style={{
              left: detailOutlineChapterMenu.x,
              top: detailOutlineChapterMenu.y,
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            {isDetailOutlineChapterPublished(detailOutlineChapterMenu.chapter) ? (
              <button
                type="button"
                disabled={detailOutlineChapterMenu.chapter.isPublished}
                onClick={() => moveDetailOutlineChapterToUnpublished(detailOutlineChapterMenu.chapter!)}
                className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white"
                title={detailOutlineChapterMenu.chapter.isPublished ? '正文已发布，章纲会自动留在已发布' : undefined}
              >
                移回未发布
              </button>
            ) : (
              <button
                type="button"
                onClick={() => moveDetailOutlineChapterToPublished(detailOutlineChapterMenu.chapter!.id)}
                className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
              >
                移动到已发布
              </button>
            )}
          </div>
        )}
        <div
          className="relative grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns:
              isDetailOutlineTab && showDetailOutlinePublished
                ? `${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
                : `${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`,
          }}
        >
          <aside
            className={`min-w-0 flex min-h-0 flex-col border-r border-gray-100 ${isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'}`}
          >
            {isDetailOutlineTab && (
              <div
                className={
                  isDetailOutlineTab
                    ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS
                    : 'mb-3 flex h-9 shrink-0 items-center justify-between gap-2'
                }
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>未发布</span>
                  <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>{detailOutlineUnpublishedCount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailOutlinePublished((prev) => !prev)}
                  className={
                    isDetailOutlineTab
                      ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS
                      : 'shrink-0 rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-[#0798b8]'
                  }
                >
                  {showDetailOutlinePublished ? '收回已发布' : '展开已发布'}
                </button>
              </div>
            )}
            <section className={`flex min-h-0 flex-1 flex-col ${isDetailOutlineTab ? 'px-1 py-2' : ''}`}>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {(isDetailOutlineTab ? detailOutlineUnpublishedCount === 0 : volumes.length === 0) ? (
                  <p className="pt-10 text-center text-xs text-gray-400">暂无章节</p>
                ) : (
                  <div className={isDetailOutlineTab ? 'space-y-2' : 'space-y-3'}>
                    {(isDetailOutlineTab
                      ? detailOutlineUnpublishedVolumes.filter((volume) => volume.chapters.length > 0)
                      : volumes
                    ).map((volume) => {
                      const expanded = expandedOutlineVolumeIds.has(volume.id);
                      const VolumeFolderIcon = expanded ? FolderOpen : Folder;
                      const volumeIsSelected =
                        safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;

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
                            className={
                              isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS
                            }
                            aria-expanded={expanded}
                          >
                            <VolumeFolderIcon
                              className={
                                isDetailOutlineTab
                                  ? DETAIL_OUTLINE_VOLUME_ICON_CLASS
                                  : WORKBENCH_FOLDER_GROUP_ICON_CLASS
                              }
                            />
                            <span
                              className={
                                isDetailOutlineTab
                                  ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS
                                  : 'min-w-0 flex-1 truncate leading-none'
                              }
                            >
                              {volume.name}
                            </span>
                            <span
                              className={
                                isDetailOutlineTab
                                  ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS
                                  : WORKBENCH_FOLDER_GROUP_COUNT_CLASS
                              }
                            >
                              {volume.chapters.length}章
                            </span>
                            {enableVolumeSummary && (
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
                              {[...volume.chapters]
                                .sort((a, b) => a.serialNumber - b.serialNumber)
                                .map((chapter) => {
                                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                                  const selected = effectiveSelectedOutlineChapterId === chapter.id;
                                  const outlineWordCount = countTextWords(entry?.content ?? '');
                                  const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');
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
                                        title="移动到已发布"
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
                                      title={isDetailOutlineTab ? '移动到已发布' : undefined}
                                    >
                                      {isDetailOutlineTab ? chapter.serialNumber : chapter.serialNumber}
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </aside>
          {leftResizeHandle}
          {isDetailOutlineTab && showDetailOutlinePublished && (
            <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50">
              <div className={DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>已发布</span>
                  <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>{detailOutlinePublishedCount}</span>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
                {volumes.length === 0 ? (
                  <p className="pt-10 text-center text-xs text-gray-400">暂无已发布章纲</p>
                ) : (
                  renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)
                )}
              </div>
            </aside>
          )}

          <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white p-5">
            <div
              className={`editor-scrollbar min-h-0 flex-1 overflow-y-auto ${isDetailOutlineTab ? '-mr-4 pr-4 pt-2.5' : '-mr-4 pr-4 pt-5'}`}
            >
              {outlineChapters.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                  暂无章节可预览
                </div>
              ) : safeOutlineSelectionType === 'volume' && selectedOutlineVolume ? (
                <section className="xy-selected-content-bg rounded-xl border border-[#08AACE] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">
                      {selectedOutlineVolume.name}梗概
                    </h4>
                    <span className="shrink-0 text-lg font-bold text-gray-900">
                      {selectedOutlineVolume.chapters.length}章
                    </span>
                  </div>
                  <textarea
                    data-no-modal-drag="true"
                    value={selectedVolumeEntry?.content ?? ''}
                    onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
                    placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"
                    className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                  />
                  <div className="mt-2 text-right text-xs font-bold text-gray-400">
                    <WordCountText value={countTextWords(selectedVolumeEntry?.content ?? '')} />
                  </div>
                </section>
              ) : isDetailOutlineTab && selectedOutlineChapter ? (
                (() => {
                  const { volume, chapter } = selectedOutlineChapter;
                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                  const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                  const outlineCardContent = entry?.content ?? '';
                  const detailOutlineParts = splitDetailOutlineStateExpectation(outlineCardContent);
                  const updateDetailOutlinePart = (part: 'outline' | 'stateExpectation', value: string) => {
                    updateChapterSummary(
                      chapter.serialNumber,
                      mergeDetailOutlineStateExpectation(
                        part === 'outline' ? value : detailOutlineParts.outline,
                        part === 'stateExpectation' ? value : detailOutlineParts.stateExpectation,
                      ),
                    );
                  };
                  return (
                    <div
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className="flex h-full min-h-0 flex-col gap-4"
                    >
                      <section
                        className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-[0_0_62%] ${detailOutlineParts.outline.trim() ? 'xy-has-value' : ''}`}
                      >
                        <textarea
                          data-no-modal-drag="true"
                          value={detailOutlineParts.outline}
                          onChange={(event) => updateDetailOutlinePart('outline', event.target.value)}
                          onFocus={() => {
                            setActiveLibraryFontTarget('detailOutline');
                            selectOutlineChapter(chapter.id, chapter.serialNumber);
                          }}
                          onScroll={() => handleDetailOutlineTextareaScroll(chapter.id)}
                          placeholder="该章章纲会显示在这里，可由 AI 根据章节内容生成。"
                          className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`}
                          style={{
                            height: '100%',
                            overflowY: 'auto',
                            fontSize: detailOutlineFontSize,
                          }}
                        />
                        <label className="xy-floating-title-count xy-detail-outline-title-count">
                          <span className="xy-floating-title-text xy-detail-outline-heading-title">
                            {outlineCardTitle}
                          </span>
                        </label>
                        <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
                          {`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`}
                        </span>
                        <span className="xy-floating-count">
                          <WordCountText value={countTextWords(detailOutlineParts.outline)} />
                        </span>
                      </section>
                      <section
                        className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${detailOutlineParts.stateExpectation.trim() ? 'xy-has-value' : ''}`}
                      >
                        <textarea
                          data-no-modal-drag="true"
                          value={detailOutlineParts.stateExpectation}
                          onChange={(event) => updateDetailOutlinePart('stateExpectation', event.target.value)}
                          onFocus={() => {
                            setActiveLibraryFontTarget('detailOutline');
                            selectOutlineChapter(chapter.id, chapter.serialNumber);
                          }}
                          placeholder="按人物状态、道具状态、势力状态、关系状态、线索/信息记录本章预计变化。"
                          className="w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only"
                          style={{
                            height: '100%',
                            overflowY: 'auto',
                            fontSize: detailOutlineFontSize,
                          }}
                        />
                        <label className="xy-floating-title-count xy-detail-outline-title-count">
                          <span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>
                        </label>
                        <span className="xy-floating-count">
                          <WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />
                        </span>
                      </section>
                    </div>
                  );
                })()
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {outlineChapters.map(({ volume, chapter }) => {
                    const entry = getChapterSummaryEntry(chapter.serialNumber);
                    const selected = effectiveSelectedOutlineChapterId === chapter.id;
                    const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                    const outlineCardContent = entry?.content ?? '';
                    const detailOutlineHeight = isDetailOutlineTab ? getDetailOutlinePreviewHeight() : undefined;
                    return (
                      <section
                        key={chapter.id}
                        ref={(element) => {
                          outlinePreviewRefs.current[chapter.id] = element;
                        }}
                        className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count ${selected ? 'xy-outline-selected xy-has-value' : outlineCardContent.trim() ? 'xy-has-value' : ''}`}
                      >
                        <textarea
                          data-no-modal-drag="true"
                          value={outlineCardContent}
                          onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                          onFocus={() => {
                            if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                            selectOutlineChapter(chapter.id, chapter.serialNumber);
                          }}
                          onScroll={
                            isDetailOutlineTab ? () => handleDetailOutlineTextareaScroll(chapter.id) : undefined
                          }
                          placeholder={
                            isDetailOutlineTab
                              ? '该章章纲会显示在这里，可由 AI 根据章节内容生成。'
                              : '该章梗概会显示在这里，可由 AI 根据章节内容生成。'
                          }
                          className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none ${
                            isDetailOutlineTab
                              ? `scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`
                              : 'editor-scrollbar h-36'
                          }`}
                          style={
                            isDetailOutlineTab
                              ? {
                                  height: detailOutlineHeight,
                                  overflowY: 'auto',
                                  fontSize: detailOutlineFontSize,
                                }
                              : undefined
                          }
                        />
                        <label
                          className={
                            isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined
                          }
                        >
                          <span
                            className={
                              isDetailOutlineTab ? 'xy-floating-title-text xy-detail-outline-heading-title' : undefined
                            }
                          >
                            {outlineCardTitle}
                          </span>
                        </label>
                        <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
                          {isDetailOutlineTab ? (
                            `第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`
                          ) : (
                            <>
                              第{chapter.serialNumber}章 {chapter.title.trim() || '未命名章节'}{' '}
                              <WordCountText value={chapter.wordCount} compact />
                            </>
                          )}
                        </span>
                        {isDetailOutlineTab && (
                          <span className="xy-floating-count">
                            <WordCountText value={countTextWords(outlineCardContent)} />
                          </span>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          {rightResizeHandle}
          <aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
            <div className="shrink-0 space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2 text-sm text-gray-500">
                <CombinedAiConfigSelect
                  style={getEmbeddedConfigSelectStyle(getFieldSizeStyle(outlineModelFieldSizeKey))}
                  modelValue={activeTabConfig.modelId ?? ''}
                  promptValue={activeOutlinePromptId ?? ''}
                  modelOptions={
                    models.length === 0
                      ? [{ value: '', label: '暂无可用模型', disabled: true }]
                      : models.map((model) => ({ value: model.id, label: model.name }))
                  }
                  promptOptions={
                    outlinePromptOptions.length === 0
                      ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }]
                      : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                  }
                  onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                  onPromptChange={updateOutlinePromptId}
                  onModelManage={() => setManagementModal({ type: 'models' })}
                  onPromptManage={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
                />
              </div>
            </div>
            <div className="relative mt-5 min-h-[170px] flex-1">
              {outlinePreviewDraft.startsWith('[[THINKING') ? (
                <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-with-bottom-count h-full xy-has-value">
                  <div
                    className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-gray-600"
                    onMouseDown={() => {
                      if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                    }}
                    style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
                  >
                    {renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })}
                  </div>
                  <label>{outlineDraftFrameTitle}</label>
                  {shouldShowOutlineDraftWordCount && (
                    <span
                      className="xy-floating-count xy-floating-count-top-left"
                      style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}
                    >
                      <WordCountText value={countTextWords(outlinePreviewDraftContent)} />
                    </span>
                  )}
                  {renderDetailOutlineDraftClearButton()}
                </div>
              ) : (
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full ${outlinePreviewDraft.trim() ? 'xy-has-value' : ''}`}
                >
                  <textarea
                    data-no-modal-drag="true"
                    value={outlinePreviewDraft}
                    onFocus={() => setActiveLibraryFontTarget(isDetailOutlineTab ? 'detailOutline' : 'settingPreview')}
                    onChange={(event) => setOutlinePreviewDraft(event.target.value)}
                    placeholder={
                      plotPointStandalone
                        ? '生成后的剧情点会显示在这里，也可以手动编辑后复制。'
                        : isDetailOutlineTab
                          ? '生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。'
                          : '生成后的梗概会显示在这里，也可以手动编辑后保存。'
                    }
                    className="editor-scrollbar text-sm leading-6 text-gray-700 outline-none placeholder:text-slate-500 placeholder:font-semibold"
                    style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
                  />
                  <label>{outlineDraftFrameTitle}</label>
                  {shouldShowOutlineDraftWordCount && (
                    <span
                      className="xy-floating-count xy-floating-count-top-left"
                      style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}
                    >
                      <WordCountText value={countTextWords(outlinePreviewDraftContent)} />
                    </span>
                  )}
                  {renderDetailOutlineDraftClearButton()}
                </div>
              )}
            </div>
            {isDetailOutlineTab && (
              <LinkedSourceControl
                linked={selectedDetailOutlineReaderItems.length > 0}
                label="关联大纲"
                linkedLabel="已关联大纲"
                onOpen={openDetailOutlineReader}
                onClear={clearDetailOutlineReaderSelection}
                clearOnLinkedClick
                meta={
                  <>
                    关联 <WordCountText value={detailOutlineReaderWordCount} compact />
                  </>
                }
                className="mt-3 flex items-center gap-2"
                groupClassName="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                buttonClassName="h-10 w-[132px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-black text-white bg-red-500 hover:bg-red-600"
              />
            )}
            <div className="mt-3">
              <AiInlineInput
                value={outlineAiInput}
                onChange={(event) => {
                  setOutlineAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void sendOutlineAiMessage();
                  }
                }}
                onSend={() => void sendOutlineAiMessage()}
                onStop={stopOutlineAiMessage}
                sendDisabled={
                  isLibraryAiLoading ||
                  (!plotPointStandalone &&
                    !outlineAiInput.trim() &&
                    (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0))
                }
                stopDisabled={!isLibraryAiLoading}
                label={plotPointStandalone ? '请输入剧情点要求' : '请输入要求'}
                textareaClassName="editor-scrollbar"
              />
            </div>
            <div className="mt-3 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => {
                  if (plotPointStandalone) setOutlineAiInput(stripAiThinkingBlock(outlinePreviewDraft));
                  else saveOutlinePreviewDraft();
                }}
                disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
                className="min-w-[92px] flex-1 whitespace-nowrap bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
              >
                {plotPointStandalone ? '放入章纲要求' : isDetailOutlineTab ? '替换章纲' : '保存梗概'}
              </button>
              {isDetailOutlineTab && !plotPointStandalone && (
                <button
                  onClick={undoDetailOutlineReplacement}
                  disabled={!lastDetailOutlineReplacement}
                  className="min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:text-gray-300"
                >
                  撤销替换
                </button>
              )}
              <button
                onClick={() => void navigator.clipboard.writeText(stripAiThinkingBlock(outlinePreviewDraft))}
                disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
                className="min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
              >
                {isDetailOutlineTab ? '复制章纲' : '复制梗概'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {renderTopTabs()}
      {fieldSizeSettingsModal}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] overflow-hidden bg-white">
        <aside className="flex min-h-0 flex-col border-r border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-bold text-gray-700">{activeTab}</span>
            <button onClick={addEntry} className="rounded-md p-1 text-brand hover:bg-brand-light" title="新增">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {visibleEntries.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs leading-5 text-gray-400">{emptyText}</p>
            ) : (
              <div className="space-y-1">
                {visibleEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`group w-full rounded-lg border px-2 py-2 text-left font-black transition-colors ${
                      selectedEntry?.id === entry.id
                        ? 'border-transparent xy-selected-mint-bg'
                        : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="truncate text-xs font-black text-gray-800">{entry.title}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{entry.updatedAt}</span>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col p-4">
          {selectedEntry ? (
            <>
              <input
                value={selectedEntry.title}
                onChange={(event) => updateEntry(selectedEntry.id, { title: event.target.value })}
                className="mb-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
              />
              <textarea
                value={selectedEntry.content}
                onChange={(event) => updateEntry(selectedEntry.id, { content: event.target.value })}
                placeholder={`填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              点击左侧加号新增内容
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
