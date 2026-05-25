import { ChevronDown, ChevronRight, Lock, Plus, Settings, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import { usePrompts } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import {
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Volume } from '@/features/workbench/model/workbenchTypes';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
  outlineStorageKey?: string;
  scale?: number;
  defaultActiveTab?: string;
}

interface RoleContent {
  type: string;
  lifeStatus: '存活' | '死亡';
  personality: string;
  background: string;
  status: string;
  history?: RoleHistoryVersion[];
}

interface RoleHistoryVersion {
  title: string;
  type: string;
  lifeStatus: '存活' | '死亡';
  personality: string;
  background: string;
  status: string;
  savedAt: string;
}

interface SettingContent {
  type: string;
  body: string;
}

const DEFAULT_ROLE_TYPES = ['男女主', '正派配角', '重要反派', '反派配角', '龙套', '未分类'];
const DEFAULT_SETTING_TYPES = ['核心设定', '主线剧情', '等级体系', '势力设定', '其他设定', '伏笔设定', '未分类'];
const ROLE_TAB = '角色';
const BRAINSTORM_TAB = '脑洞';
const SETTING_TAB = '大纲';
const DETAIL_OUTLINE_TAB = '细纲';
const OUTLINE_LIBRARY_TAB = '概要';
const BRAINSTORM_TYPE = '脑洞库';
const CHAPTER_SUMMARY_TAB = '章节概要';
const VOLUME_SUMMARY_TAB = '卷概要';
const CHAPTER_DETAIL_OUTLINE_TAB = '章节细纲';
const SETTING_LIBRARY_TABS = new Set([ROLE_TAB, BRAINSTORM_TAB, SETTING_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB]);
const OUTLINE_COLUMNS_KEY = 'xinyuexia_outline_library_columns';
const OUTLINE_COLUMN_OPTIONS = [5, 6, 7, 8, 9, 10] as const;
const UNCATEGORIZED_TYPE = '未分类';
const SETTING_LIBRARY_LEFT_WIDTH = 430;
const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;
const SETTING_LIBRARY_LEFT_MAX_WIDTH = 640;
const SETTING_LIBRARY_RIGHT_WIDTH = 350;
const SETTING_LIBRARY_RIGHT_MIN_WIDTH = 280;
const SETTING_LIBRARY_RIGHT_MAX_WIDTH = 620;
const ROLE_HISTORY_LIMIT = 20;

type LibraryCategoryMenu = {
  kind: 'role' | 'setting';
  type: string;
  x: number;
  y: number;
} | null;

type LibraryEntryMenu = {
  entryId: string;
  title: string;
  tab: string;
  pinnedAt?: number;
  x: number;
  y: number;
} | null;

type PendingEntryDelete = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;

type LibraryTabConfig = {
  selectedId?: string | null;
  typeDraft?: string;
  titleDraft?: string;
  createKind?: 'category' | 'setting';
  roleTypeDraft?: string;
  roleNameDraft?: string;
  aiInput?: string;
  aiOutput?: string;
  aiResult?: string;
  modelId?: string;
  promptId?: string;
};

type LibraryTabConfigs = Record<string, LibraryTabConfig>;

function getTabConfigsStorageKey(storageKey: string) {
  return `${storageKey}_tab_configs_v1`;
}

function getActiveTabStorageKey(storageKey: string) {
  return `${storageKey}_active_tab`;
}

function readActiveTab(storageKey: string, tabs: string[], defaultActiveTab?: string) {
  try {
    const stored = normalizeTabName(localStorage.getItem(getActiveTabStorageKey(storageKey)) ?? '');
    if (tabs.includes(stored)) return stored;
  } catch {
    // Ignore localStorage failures and fall back to the supplied default.
  }
  const normalizedDefault = normalizeTabName(defaultActiveTab ?? '');
  if (tabs.includes(normalizedDefault)) return normalizedDefault;
  return tabs[0] ?? '';
}

function getLeftWidthStorageKey(storageKey: string) {
  return `${storageKey}_left_width`;
}

function getRightWidthStorageKey(storageKey: string) {
  return `${storageKey}_right_width`;
}

function readSettingLibraryLeftWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getLeftWidthStorageKey(storageKey)) ?? SETTING_LIBRARY_LEFT_WIDTH);
    if (!Number.isFinite(value)) return SETTING_LIBRARY_LEFT_WIDTH;
    return Math.min(SETTING_LIBRARY_LEFT_MAX_WIDTH, Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, value));
  } catch {
    return SETTING_LIBRARY_LEFT_WIDTH;
  }
}

function readSettingLibraryRightWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getRightWidthStorageKey(storageKey)) ?? SETTING_LIBRARY_RIGHT_WIDTH);
    if (!Number.isFinite(value)) return SETTING_LIBRARY_RIGHT_WIDTH;
    return Math.min(SETTING_LIBRARY_RIGHT_MAX_WIDTH, Math.max(SETTING_LIBRARY_RIGHT_MIN_WIDTH, value));
  } catch {
    return SETTING_LIBRARY_RIGHT_WIDTH;
  }
}

function readTabConfigs(storageKey: string): LibraryTabConfigs {
  try {
    const raw = localStorage.getItem(getTabConfigsStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as LibraryTabConfigs : {};
    if (parsed && typeof parsed === 'object' && !parsed[SETTING_TAB] && parsed['设定']) {
      parsed[SETTING_TAB] = parsed['设定'];
    }
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_role_types`;
}

function readCustomRoleTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getRoleTypesStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

function getHiddenRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_role_types`;
}

function getSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_setting_types`;
}

function readCustomSettingTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getSettingTypesStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

function getHiddenSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_setting_types`;
}

function readStringList(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

function loadOutlineColumns() {
  try {
    const value = Number(localStorage.getItem(OUTLINE_COLUMNS_KEY) ?? 10);
    return OUTLINE_COLUMN_OPTIONS.includes(value as (typeof OUTLINE_COLUMN_OPTIONS)[number]) ? value : 10;
  } catch {
    return 10;
  }
}

function normalizeTabName(tab: string) {
  if (tab === '角色库') return ROLE_TAB;
  if (tab === '设定') return SETTING_TAB;
  if (tab === '设定库') return SETTING_TAB;
  if (tab === '概要库') return OUTLINE_LIBRARY_TAB;
  return tab;
}

function isSettingLikeTab(tab: string) {
  return tab === BRAINSTORM_TAB || tab === SETTING_TAB;
}

function normalizeEntries(entries: WorkbenchLibraryEntry[]) {
  return entries.map((entry) => ({ ...entry, tab: normalizeTabName(entry.tab) }));
}

function readNormalizedEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(storageKey));
}

function parseRoleContent(content: string): RoleContent {
  try {
    const parsed = JSON.parse(content) as Partial<RoleContent>;
    const lifeStatus = parsed.lifeStatus === '死亡' ? '死亡' : '存活';
    return {
      type: parsed.type || '未分类',
      lifeStatus,
      personality: parsed.personality || '',
      background: parsed.background || '',
      status: parsed.status || '',
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, ROLE_HISTORY_LIMIT) : [],
    };
  } catch {
    return {
      type: '未分类',
      lifeStatus: '存活',
      personality: '',
      background: content || '',
      status: '',
      history: [],
    };
  }
}

function stringifyRoleContent(value: RoleContent) {
  return JSON.stringify(value);
}

function createRoleHistoryVersion(entry: WorkbenchLibraryEntry, role: RoleContent): RoleHistoryVersion {
  return {
    title: entry.title,
    type: role.type,
    lifeStatus: role.lifeStatus,
    personality: role.personality,
    background: role.background,
    status: role.status,
    savedAt: new Date().toLocaleString('zh-CN'),
  };
}

function isSameRoleVersion(left: RoleHistoryVersion, right: RoleHistoryVersion) {
  return left.title === right.title &&
    left.type === right.type &&
    left.lifeStatus === right.lifeStatus &&
    left.personality === right.personality &&
    left.background === right.background &&
    left.status === right.status;
}

function appendRoleHistory(history: RoleHistoryVersion[] | undefined, version: RoleHistoryVersion) {
  const current = history ?? [];
  if (current[0] && isSameRoleVersion(current[0], version)) return current.slice(0, ROLE_HISTORY_LIMIT);
  return [version, ...current].slice(0, ROLE_HISTORY_LIMIT);
}

function parseSettingContent(content: string): SettingContent {
  try {
    const parsed = JSON.parse(content) as Partial<SettingContent>;
    return {
      type: parsed.type === '境界体系' ? '等级体系' : parsed.type || '未分类',
      body: parsed.body || '',
    };
  } catch {
    return {
      type: '未分类',
      body: content || '',
    };
  }
}

function stringifySettingContent(value: SettingContent) {
  return JSON.stringify(value);
}

function classifySettingText(text: string) {
  const source = text.toLowerCase();
  if (/(境界|等级|阶位|修炼|突破|修为|练气|筑基|金丹|元婴|化神|职业等级|异能等级|机甲等级|基因等级)/.test(source)) return '等级体系';
  if (/(宗门|家族|王朝|帮派|军队|学院|公司|财团|组织|势力|联盟|官方|邪教)/.test(source)) return '势力设定';
  if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '主线剧情';
  if (/(伏笔|线索|暗示|秘密|谜团|隐藏|后续|埋下|回收)/.test(source)) return '伏笔设定';
  if (/(世界观|规则|背景|核心|设定|体系|灾变|时代|能量|天道|科技规则)/.test(source)) return '核心设定';
  return '其他设定';
}

function createSmartSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const rawBlocks = normalized
    .split(/\n{2,}|(?=\n\s*(?:第[一二三四五六七八九十百千万\d]+[章节卷]|[一二三四五六七八九十]+[、.．]|[0-9]+[、.．]|[-*]\s+))/)
    .map((item) => item.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
  const blocks = rawBlocks.length > 0 ? rawBlocks : [normalized];
  return blocks.map((body, index) => {
    const firstLine = body.split('\n').find((line) => line.trim())?.trim() ?? '';
    const title = firstLine
      .replace(/^#+\s*/, '')
      .replace(/^[一二三四五六七八九十]+[、.．]\s*/, '')
      .replace(/^[0-9]+[、.．]\s*/, '')
      .slice(0, 24) || `智能设定${index + 1}`;
    return {
      title,
      type: classifySettingText(body),
      body,
    };
  });
}

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

function parseAiChatTurns(content: string) {
  const turns: Array<{ role: 'user' | 'ai'; content: string }> = [];
  const markerPattern = /\[\[(USER|AI)\]\]\n/g;
  const matches = [...content.matchAll(markerPattern)];
  if (matches.length === 0) {
    if (content.trim()) turns.push({ role: 'ai', content: content.trim() });
    return turns;
  }
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? content.length : content.length;
    const text = content.slice(start, end).trim();
    if (!text) return;
    turns.push({
      role: match[1] === 'USER' ? 'user' : 'ai',
      content: text,
    });
  });
  return turns;
}

function renderAiChatContent(content: string) {
  const loadingMatch = content.match(/^正在生成(\.{1,3})$/);
  if (!loadingMatch) return content;
  return (
    <span className="inline-flex min-w-[88px] items-center">
      <span>正在生成</span>
      <span className="inline-block w-[24px]">{loadingMatch[1]}</span>
    </span>
  );
}

function getLatestUsefulAiText(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns]
    .reverse()
    .find((turn) => turn.role === 'ai' && turn.content.trim() && !/^正在生成\.{1,3}$/.test(turn.content.trim()));
  if (latestAi) return latestAi.content.trim();

  const legacyAiMatches = [...content.matchAll(/(?:^|\n)AI[：:]\s*([\s\S]*?)(?=\n\s*用户[：:]|\n\s*\[\[USER\]\]|$)/g)]
    .map((match) => match[1]?.trim() ?? '')
    .filter((value) => value && !/^正在生成\.{1,3}$/.test(value));
  if (legacyAiMatches.length > 0) return legacyAiMatches[legacyAiMatches.length - 1];

  return content
    .replace(/\[\[(?:USER|AI)\]\]\n?/g, '')
    .replace(/^\s*(?:用户|AI)[：:].*$/gm, '')
    .replace(/^正在生成\.{1,3}\s*$/gm, '')
    .trim();
}

function getRoleCategoryButtonTone(type: string) {
  return {
    className: 'border-[#08AACE] bg-[#08AACE] text-white hover:brightness-95',
    badgeClassName: 'bg-white/20 text-white',
    iconClassName: 'text-white',
  };
}

export function WorkbenchLibraryPanel({
  storageKey,
  tabs,
  emptyText,
  volumes = [],
  outlineStorageKey,
  scale = 1,
  defaultActiveTab,
}: WorkbenchLibraryPanelProps) {
  const navigate = useNavigate();
  const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);
  const isSettingLibraryPanel = useMemo(
    () => normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)),
    [normalizedTabs],
  );
  const [entries, setEntries] = useState<WorkbenchLibraryEntry[]>(() => readNormalizedEntries(storageKey));
  const [outlineEntries, setOutlineEntries] = useState<WorkbenchLibraryEntry[]>(() => (
    outlineStorageKey ? readNormalizedEntries(outlineStorageKey) : []
  ));
  const [activeTab, setActiveTab] = useState(() => readActiveTab(storageKey, normalizedTabs, defaultActiveTab));
  const settingLibraryMode = 'advanced';
  const [tabConfigs, setTabConfigs] = useState<LibraryTabConfigs>(() => readTabConfigs(storageKey));
  const [roleSearch, setRoleSearch] = useState('');
  const [customRoleTypes, setCustomRoleTypes] = useState<string[]>(() => readCustomRoleTypes(storageKey));
  const [hiddenRoleTypes, setHiddenRoleTypes] = useState<string[]>(() => readStringList(getHiddenRoleTypesStorageKey(storageKey)));
  const [customSettingTypes, setCustomSettingTypes] = useState<string[]>(() => readCustomSettingTypes(storageKey));
  const [hiddenSettingTypes, setHiddenSettingTypes] = useState<string[]>(() => readStringList(getHiddenSettingTypesStorageKey(storageKey)));
  const [outlineStart, setOutlineStart] = useState('1');
  const [outlineEnd, setOutlineEnd] = useState('50');
  const [selectedOutlineChapterId, setSelectedOutlineChapterId] = useState<number | null>(null);
  const [selectedOutlineVolumeId, setSelectedOutlineVolumeId] = useState<number | null>(null);
  const [outlineSelectionType, setOutlineSelectionType] = useState<'chapter' | 'volume'>('chapter');
  const [outlinePreviewDraft, setOutlinePreviewDraft] = useState('');
  const [, forceOutlineSelectionRefresh] = useState(0);
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() => new Set());
  const [outlineColumns, setOutlineColumns] = useState(loadOutlineColumns);
  const [isOutlineSettingsOpen, setIsOutlineSettingsOpen] = useState(false);
  const [settingLibraryLeftWidth, setSettingLibraryLeftWidth] = useState(() => readSettingLibraryLeftWidth(storageKey));
  const [settingLibraryRightWidth, setSettingLibraryRightWidth] = useState(() => readSettingLibraryRightWidth(storageKey));
  const [expandedRoleTypes, setExpandedRoleTypes] = useState<Set<string>>(() => new Set(['未分类']));
  const [expandedSettingTypes, setExpandedSettingTypes] = useState<Set<string>>(() => new Set(['未分类']));
  const [categoryMenu, setCategoryMenu] = useState<LibraryCategoryMenu>(null);
  const [entryMenu, setEntryMenu] = useState<LibraryEntryMenu>(null);
  const [pendingEntryDelete, setPendingEntryDelete] = useState<PendingEntryDelete>(null);
  const [roleHistoryEntryId, setRoleHistoryEntryId] = useState<string | null>(null);
  const [isBrainstormReaderOpen, setIsBrainstormReaderOpen] = useState(false);
  const [isBrainstormPromptManagerOpen, setIsBrainstormPromptManagerOpen] = useState(false);
  const [editingBrainstormPrompt, setEditingBrainstormPrompt] = useState<PromptItem | null>(null);
  const [brainstormPromptDraft, setBrainstormPromptDraft] = useState({ name: '', description: '', content: '' });
  const [isLibraryAiLoading, setIsLibraryAiLoading] = useState(false);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [tabPortalTarget, setTabPortalTarget] = useState<HTMLElement | null>(null);
  const outlinePreviewRefs = useRef<Record<number, HTMLElement | null>>({});
  const libraryAiAbortRef = useRef<AbortController | null>(null);
  const libraryAiRequestSeqRef = useRef(0);
  const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);
  const { prompts, updatePrompt, deletePrompt, togglePin } = usePrompts();
  const brainstormPrompts = useMemo(() => prompts.filter((prompt) => prompt.category === BRAINSTORM_TAB), [prompts]);
  const outlinePrompts = useMemo(() => prompts.filter((prompt) => prompt.category === '概要'), [prompts]);
  const scaleStyle = scale === 1 ? undefined : ({ zoom: scale } as CSSProperties);
  const activeTabConfig = tabConfigs[activeTab] ?? {};
  const selectedId = activeTabConfig.selectedId ?? null;
  const roleTypeDraft = activeTabConfig.roleTypeDraft ?? activeTabConfig.typeDraft ?? '';
  const roleNameDraft = activeTabConfig.roleNameDraft ?? activeTabConfig.titleDraft ?? '';
  const settingTypeDraft = activeTabConfig.typeDraft ?? '';
  const settingTitleDraft = activeTabConfig.titleDraft ?? '';
  const settingCreateKind = activeTabConfig.createKind ?? 'category';
  const aiInput = activeTabConfig.aiInput ?? '';
  const aiOutput = activeTabConfig.aiOutput ?? '';
  const aiResult = activeTabConfig.aiResult ?? '';
  const animatedAiOutput = isLibraryAiLoading
    ? aiOutput.replace(/正在生成\.\.\./g, `正在生成${'.'.repeat(loadingDotCount)}`)
    : aiOutput;
  const aiChatTurns = parseAiChatTurns(animatedAiOutput);
  const aiInputHeight = Math.min(180, Math.max(48, aiInput.split('\n').length * 26 + 24));

  useTopModalEscape(isBrainstormPromptManagerOpen && !editingBrainstormPrompt, closeBrainstormPromptManager);
  useTopModalEscape(Boolean(editingBrainstormPrompt), () => setEditingBrainstormPrompt(null));

  const updateTabConfig = (tab: string, updates: LibraryTabConfig) => {
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
  };
  const updateActiveTabConfig = (updates: LibraryTabConfig) => updateTabConfig(activeTab, updates);
  const setSelectedId = (id: string | null) => updateActiveTabConfig({ selectedId: id });
  const setSelectedIdForTab = (tab: string, id: string | null) => updateTabConfig(tab, { selectedId: id });
  const setRoleTypeDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleTypeDraft: value, typeDraft: value });
  const setRoleNameDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleNameDraft: value, titleDraft: value });
  const setSettingTypeDraft = (value: string) => updateActiveTabConfig({ typeDraft: value });
  const setSettingTitleDraft = (value: string) => updateActiveTabConfig({ titleDraft: value });
  const setSettingCreateKind = (value: 'category' | 'setting') => updateActiveTabConfig({ createKind: value });
  const setAiInput = (value: string) => updateActiveTabConfig({ aiInput: value });
  const setAiOutput = (value: string) => updateActiveTabConfig({ aiOutput: value });
  const setAiResult = (value: string) => updateActiveTabConfig({ aiResult: value });

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

  const setRememberedActiveTab = (tab: string) => {
    const normalizedTab = normalizeTabName(tab);
    setActiveTab(normalizedTab);
    try {
      if (normalizedTabs.includes(normalizedTab)) {
        localStorage.setItem(getActiveTabStorageKey(storageKey), normalizedTab);
      }
    } catch {
      // Local tab memory is a convenience; the panel should still work without it.
    }
  };

  const startLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = settingLibraryLeftWidth;

    const handleMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(
        SETTING_LIBRARY_LEFT_MAX_WIDTH,
        Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, startWidth + moveEvent.clientX - startX),
      );
      setSettingLibraryLeftWidth(nextWidth);
      localStorage.setItem(getLeftWidthStorageKey(storageKey), String(nextWidth));
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startRightWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = settingLibraryRightWidth;

    const handleMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(
        SETTING_LIBRARY_RIGHT_MAX_WIDTH,
        Math.max(SETTING_LIBRARY_RIGHT_MIN_WIDTH, startWidth + startX - moveEvent.clientX),
      );
      setSettingLibraryRightWidth(nextWidth);
      localStorage.setItem(getRightWidthStorageKey(storageKey), String(nextWidth));
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const leftResizeHandle = (
    <div
      onPointerDown={startLeftWidthResize}
      className="group flex cursor-col-resize items-stretch justify-center bg-white transition-colors hover:bg-brand-light"
      title="拖拽调整左侧宽度"
    >
      <div className="my-3 w-1 rounded-full bg-gray-200 transition-colors group-hover:bg-brand" />
    </div>
  );

  const rightResizeHandle = (
    <div
      onPointerDown={startRightWidthResize}
      className="group flex cursor-col-resize items-stretch justify-center bg-white transition-colors hover:bg-brand-light"
      title="拖拽调整右侧宽度"
    >
      <div className="my-3 w-1 rounded-full bg-gray-200 transition-colors group-hover:bg-brand" />
    </div>
  );

  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;

  useEffect(() => {
    setEntries(readNormalizedEntries(storageKey));
    setTabConfigs(readTabConfigs(storageKey));
    setActiveTab(readActiveTab(storageKey, normalizedTabs, defaultActiveTab));
    setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey));
    setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey));
    setCustomRoleTypes(readCustomRoleTypes(storageKey));
    setCustomSettingTypes(readCustomSettingTypes(storageKey));
    setHiddenRoleTypes(readStringList(getHiddenRoleTypesStorageKey(storageKey)));
    setHiddenSettingTypes(readStringList(getHiddenSettingTypesStorageKey(storageKey)));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncStorageEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncStorageEntries);
    };
  }, [defaultActiveTab, normalizedTabs, storageKey]);

  useEffect(() => {
    if (!categoryMenu && !entryMenu) return;
    const closeMenu = (event: globalThis.MouseEvent | PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-library-context-menu="true"]')) return;
      setCategoryMenu(null);
      setEntryMenu(null);
    };
    window.addEventListener('pointerdown', closeMenu, true);
    window.addEventListener('contextmenu', closeMenu, true);
    return () => {
      window.removeEventListener('pointerdown', closeMenu, true);
      window.removeEventListener('contextmenu', closeMenu, true);
    };
  }, [categoryMenu, entryMenu]);

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
  }, [activeTab, normalizedTabs]);

  useEffect(() => {
    if ((!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) return;
    setExpandedOutlineVolumeIds((prev) => {
      if (prev.size > 0 || volumes.length === 0) return prev;
      return new Set(volumes.map((volume) => volume.id));
    });
  }, [tabs, volumes]);

  useEffect(() => {
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => next.add(volume.id));
      return next;
    });
  }, [volumes]);

  useEffect(() => {
    localStorage.setItem(OUTLINE_COLUMNS_KEY, String(outlineColumns));
  }, [outlineColumns]);

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
    if ((!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) return;
    const isDetailOutlineTab = activeTab === DETAIL_OUTLINE_TAB;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    if (!isDetailOutlineTab && outlineSelectionType === 'volume') {
      const volume = volumes.find((item) => item.id === selectedOutlineVolumeId) ?? volumes[0];
      const content = currentOutlineEntries.find((entry) => entry.tab === VOLUME_SUMMARY_TAB && entry.title === `${volume?.name ?? ''}概要`)?.content ?? '';
      setOutlinePreviewDraft(content);
      return;
    }
    const chapters = volumes.flatMap((volume) => volume.chapters);
    const chapter = chapters.find((item) => item.id === selectedOutlineChapterId) ?? chapters[0];
    const chapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const chapterTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章细纲` : `第${chapter?.serialNumber ?? ''}章概要`;
    const content = currentOutlineEntries.find((entry) => entry.tab === chapterTab && entry.title === chapterTitle)?.content ?? '';
    setOutlinePreviewDraft(content);
  }, [activeTab, entries, outlineEntries, outlineSelectionType, outlineStorageKey, selectedOutlineChapterId, selectedOutlineVolumeId, tabs, volumes]);

  useEffect(() => {
    const updateTarget = () => setTabPortalTarget(document.getElementById('workbench-modal-header-extra'));
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persist = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next);
    setEntries(normalized);
    writeWorkbenchLibraryEntries(storageKey, normalized);
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
    setCustomSettingTypes((prev) => {
      if (prev.includes(type) || DEFAULT_SETTING_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    setExpandedSettingTypes((prev) => new Set(prev).add(type));
  };

  const addSettingType = () => {
    addSettingTypeByName(settingTypeDraft);
    setSettingTypeDraft('');
  };

  const addSetting = (tab = SETTING_TAB) => {
    const title = settingTitleDraft.trim() || `新建${tab}`;
    const entry = {
      ...createWorkbenchLibraryEntry(tab, title),
      content: stringifySettingContent({ type: '未分类', body: '' }),
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
    updateTabConfig(tab, { titleDraft: '' });
  };

  const confirmSettingCreate = () => {
    if (settingCreateKind === 'category') {
      addSettingTypeByName(settingTitleDraft);
      setSettingTitleDraft('');
      return;
    }
    addSetting(activeTab);
  };

  const smartImportSettings = () => {
    const segments = createSmartSettingSegments(aiInput);
    if (segments.length === 0) return;
    const importedEntries = segments.map((segment) => ({
      ...createWorkbenchLibraryEntry(SETTING_TAB, segment.title),
      content: stringifySettingContent({ type: segment.type, body: segment.body }),
    }));
    persist([...importedEntries, ...entries]);
    setRememberedActiveTab(SETTING_TAB);
    setSelectedIdForTab(SETTING_TAB, importedEntries[0]?.id ?? null);
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      segments.forEach((segment) => next.add(segment.type));
      return next;
    });
  };

  const getNextBrainstormTitle = () => {
    const maxNumber = entries
      .filter((entry) => entry.tab === BRAINSTORM_TAB)
      .map((entry) => entry.title.match(/^脑洞(\d+)$/)?.[1])
      .filter((value): value is string => Boolean(value))
      .reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    return `脑洞${maxNumber + 1}`;
  };

  const saveBrainstormOutputAsNew = () => {
    const body = getLatestUsefulAiText(aiResult || aiOutput);
    if (!body) return;
    const entry = {
      ...createWorkbenchLibraryEntry(BRAINSTORM_TAB, getNextBrainstormTitle()),
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body }),
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(BRAINSTORM_TAB);
    setSelectedIdForTab(BRAINSTORM_TAB, entry.id);
    setExpandedSettingTypes((prev) => new Set(prev).add(BRAINSTORM_TYPE));
  };

  const saveBrainstormOutput = (targetId?: string | null) => {
    const body = getLatestUsefulAiText(aiResult || aiOutput);
    if (!body || !targetId) return;
    updateEntry(targetId, {
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body }),
    });
  };

  const openBrainstormPromptEdit = (prompt: PromptItem) => {
    setEditingBrainstormPrompt(prompt);
    setBrainstormPromptDraft({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
    });
  };

  function closeBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsBrainstormPromptManagerOpen(false);
  }

  function openBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsBrainstormPromptManagerOpen(true);
  }

  const saveBrainstormPromptEdit = () => {
    if (!editingBrainstormPrompt) return;
    const name = brainstormPromptDraft.name.trim();
    if (!name) return;
    updatePrompt(editingBrainstormPrompt.id, {
      name,
      description: brainstormPromptDraft.description,
      content: brainstormPromptDraft.content,
      category: BRAINSTORM_TAB,
    });
    setEditingBrainstormPrompt(null);
  };

  const deleteBrainstormPrompt = (prompt: PromptItem) => {
    if (prompt.isLocked) return;
    if (!window.confirm(`确定删除提示词「${prompt.name}」吗？删除后会进入提示词回收站。`)) return;
    deletePrompt(prompt.id);
  };

  const sendLibraryAiMessage = async () => {
    const text = aiInput.trim();
    if (!text || isLibraryAiLoading) return;
    const selectedModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    if (!selectedModel) {
      setAiOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
      return;
    }
    const promptCandidates = activeTab === ROLE_TAB
      ? prompts
      : prompts.filter((prompt) => prompt.category === activeTab);
    const selectedPrompt = promptCandidates.find((prompt) => prompt.id === activeTabConfig.promptId) ?? null;
    const controller = new AbortController();
    const requestSeq = libraryAiRequestSeqRef.current + 1;
    libraryAiRequestSeqRef.current = requestSeq;
    libraryAiAbortRef.current = controller;
    setIsLibraryAiLoading(true);
    setAiInput('');
    const pendingOutput = `${aiOutput.trim() ? `${aiOutput.trim()}\n\n` : ''}[[USER]]\n${text}\n\n[[AI]]\n正在生成...`;
    const replacePendingOutput = (content: string) => (
      pendingOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, `[[AI]]\n${content}`)
    );
    setAiOutput(pendingOutput);
    const timeoutId = window.setTimeout(() => {
      controller.abort();
      if (libraryAiRequestSeqRef.current === requestSeq) {
        setAiOutput(replacePendingOutput('【错误】请求超时，请检查模型地址和网络。'));
      }
    }, 60000);
    try {
      const content = await callModel({
        model: selectedModel,
        prompt: selectedPrompt?.content ?? `你是${activeTab}生成助手。请根据用户输入生成清晰、可编辑的中文内容。`,
        userContent: text,
        recordType: 'generate',
        signal: controller.signal,
      });
      if (libraryAiRequestSeqRef.current !== requestSeq) return;
      if (activeTab === BRAINSTORM_TAB) setAiResult(content.trim());
      setAiOutput(replacePendingOutput(content));
    } catch (error) {
      if (libraryAiRequestSeqRef.current !== requestSeq) return;
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (activeTab === BRAINSTORM_TAB) setAiResult('');
        setAiOutput(replacePendingOutput('【已中止】本次生成已停止。'));
        return;
      }
      const message = error instanceof Error ? error.message : '模型请求失败。';
      if (activeTab === BRAINSTORM_TAB) setAiResult('');
      setAiOutput(replacePendingOutput(`【错误】${message}`));
    } finally {
      window.clearTimeout(timeoutId);
      if (libraryAiAbortRef.current === controller) libraryAiAbortRef.current = null;
      if (libraryAiRequestSeqRef.current === requestSeq) setIsLibraryAiLoading(false);
    }
  };

  const stopLibraryAiMessage = () => {
    libraryAiAbortRef.current?.abort();
    libraryAiAbortRef.current = null;
    setIsLibraryAiLoading(false);
    setAiOutput(aiOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, '[[AI]]\n已暂停'));
  };

  const clearLibraryAiDialog = () => {
    libraryAiAbortRef.current?.abort();
    libraryAiAbortRef.current = null;
    setIsLibraryAiLoading(false);
    updateActiveTabConfig({ aiInput: '', aiOutput: '', aiResult: '' });
  };

  const handleLibraryAiInputKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    void sendLibraryAiMessage();
  };

  const addRoleType = () => {
    const type = roleTypeDraft.trim();
    if (!type) return;
    setCustomRoleTypes((prev) => {
      if (prev.includes(type) || DEFAULT_ROLE_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    setExpandedRoleTypes((prev) => new Set(prev).add(type));
    setRoleTypeDraft('');
  };

  const addRole = (type = '未分类') => {
    const title = roleNameDraft.trim() || '新建角色';
    const entry = createWorkbenchLibraryEntry(ROLE_TAB, title);
    const roleEntry = {
      ...entry,
      content: stringifyRoleContent({ type, lifeStatus: '存活', personality: '', background: '', status: '', history: [] }),
    };
    persist([roleEntry, ...entries]);
    setRememberedActiveTab(ROLE_TAB);
    setSelectedIdForTab(ROLE_TAB, roleEntry.id);
    setExpandedRoleTypes((prev) => new Set(prev).add(type));
    setRoleNameDraft('');
  };

  const updateEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    persist(entries.map((entry) => (
      entry.id === id
        ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') }
        : entry
    )));
  };

  const updateRole = (updates: Partial<RoleContent>) => {
    if (!selectedEntry || !selectedRole) return;
    const changed = Object.entries(updates).some(([key, value]) => (
      selectedRole[key as keyof RoleContent] !== value
    ));
    if (!changed) return;
    const history = appendRoleHistory(selectedRole.history, createRoleHistoryVersion(selectedEntry, selectedRole));
    updateEntry(selectedEntry.id, {
      content: stringifyRoleContent({ ...selectedRole, ...updates, history }),
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

  const deleteEntry = (id: string) => {
    persist(entries.filter((entry) => entry.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const confirmDeleteRole = (entry: WorkbenchLibraryEntry) => {
    setPendingEntryDelete({ id: entry.id, title: entry.title, tab: entry.tab });
  };

  const confirmDeleteEntry = (entry: Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'>) => {
    setEntryMenu(null);
    setPendingEntryDelete(entry);
  };

  const handleConfirmDeleteEntry = () => {
    if (!pendingEntryDelete) return;
    deleteEntry(pendingEntryDelete.id);
    if (roleHistoryEntryId === pendingEntryDelete.id) setRoleHistoryEntryId(null);
    setPendingEntryDelete(null);
  };

  const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>, kind: 'role' | 'setting', type: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (type === UNCATEGORIZED_TYPE) return;
    if (kind === 'role' && DEFAULT_ROLE_TYPES.includes(type)) return;
    setEntryMenu(null);
    setCategoryMenu({ kind, type, x: event.clientX, y: event.clientY });
  };

  const openEntryMenu = (event: MouseEvent<HTMLButtonElement>, entry: WorkbenchLibraryEntry) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryMenu(null);
    setEntryMenu({
      entryId: entry.id,
      title: entry.title,
      tab: entry.tab,
      pinnedAt: entry.pinnedAt,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const deleteRoleType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE) return;
    const nextCustomTypes = customRoleTypes.filter((item) => item !== type);
    setCustomRoleTypes(nextCustomTypes);
    localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    if (DEFAULT_ROLE_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenRoleTypes, type]));
      setHiddenRoleTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
    }
    setExpandedRoleTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(UNCATEGORIZED_TYPE);
      return next;
    });
    setExpandedSettingTypes((prev) => new Set(prev).add(UNCATEGORIZED_TYPE));
    persist(entries.map((entry) => {
      if (entry.tab !== ROLE_TAB) return entry;
      const role = parseRoleContent(entry.content);
      if (role.type !== type) return entry;
      return {
        ...entry,
        content: stringifyRoleContent({ ...role, type: UNCATEGORIZED_TYPE }),
        updatedAt: new Date().toLocaleString('zh-CN'),
      };
    }));
  };

  const deleteSettingType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE) return;
    const nextCustomTypes = customSettingTypes.filter((item) => item !== type);
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    if (DEFAULT_SETTING_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenSettingTypes, type]));
      setHiddenSettingTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
    }
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(UNCATEGORIZED_TYPE);
      return next;
    });
    persist(entries.map((entry) => {
      if (!isSettingLikeTab(entry.tab)) return entry;
      const setting = parseSettingContent(entry.content);
      if (setting.type !== type) return entry;
      return {
        ...entry,
        content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE }),
        updatedAt: new Date().toLocaleString('zh-CN'),
      };
    }));
  };

  const deleteCategoryFromMenu = () => {
    if (!categoryMenu) return;
    if (categoryMenu.kind === 'role') deleteRoleType(categoryMenu.type);
    else deleteSettingType(categoryMenu.type);
    setCategoryMenu(null);
  };

  const deleteEntryFromMenu = () => {
    if (!entryMenu) return;
    const target = { id: entryMenu.entryId, title: entryMenu.title, tab: entryMenu.tab };
    setEntryMenu(null);
    confirmDeleteEntry(target);
  };

  const toggleEntryPinnedFromMenu = () => {
    if (!entryMenu || entryMenu.tab !== ROLE_TAB) return;
    const nextPinnedAt = entryMenu.pinnedAt ? undefined : Date.now();
    persist(entries.map((entry) => (
      entry.id === entryMenu.entryId
        ? { ...entry, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
        : entry
    )));
    setEntryMenu(null);
  };

  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [entries]);
  const roleTypeOptions = useMemo(() => {
    const entryTypes = roleEntries.map((entry) => parseRoleContent(entry.content).type).filter(Boolean);
    const hidden = new Set(hiddenRoleTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...customRoleTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
    ]));
    return [...merged, UNCATEGORIZED_TYPE];
  }, [customRoleTypes, hiddenRoleTypes, roleEntries]);
  const searchedRoles = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase();
    if (!keyword) return roleEntries;
    return roleEntries.filter((entry) => entry.title.toLowerCase().includes(keyword));
  }, [roleEntries, roleSearch]);

  const groupedRoles = useMemo(() => roleTypeOptions.map((type) => {
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
  }), [roleTypeOptions, searchedRoles]);
  const settingEntries = useMemo(() => entries.filter((entry) => isSettingLikeTab(entry.tab)), [entries]);
  const settingTypeOptions = useMemo(() => {
    const entryTypes = settingEntries.map((entry) => parseSettingContent(entry.content).type).filter(Boolean);
    const hidden = new Set(hiddenSettingTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_SETTING_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...customSettingTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
    ]));
    return [...merged, UNCATEGORIZED_TYPE];
  }, [customSettingTypes, hiddenSettingTypes, settingEntries]);

  const topTabs = isSettingLibraryPanel ? (
    <div data-no-modal-drag="true" className="inline-flex w-fit shrink-0 cursor-default rounded-[18px] bg-slate-100 p-1.5">
      {normalizedTabs.map((tab) => {
        const active = activeTab === tab;
        const tabLabel = tab === SETTING_TAB ? '设定' : tab;
        return (
          <button
            key={tab}
            onClick={() => setRememberedActiveTab(tab)}
            className={`h-10 min-w-[78px] rounded-[15px] px-5 text-[18.5px] font-bold transition-all ${
              active
                ? 'bg-white text-sky-500 shadow-sm'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
            }`}
          >
            {tabLabel}
          </button>
        );
      })}
    </div>
  ) : (
    <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2">
      {normalizedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setRememberedActiveTab(tab)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === tab ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderTopTabs = () => (
    normalizedTabs.length <= 1
      ? null
      : (
    tabPortalTarget
      ? createPortal(topTabs, tabPortalTarget)
      : <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">{topTabs}</div>
      )
  );

  const categoryContextMenu = categoryMenu ? createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] min-w-[132px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: categoryMenu.x, top: categoryMenu.y }}
    >
      <button
        onClick={deleteCategoryFromMenu}
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
      >
        删除分类
      </button>
    </div>,
    document.body,
  ) : null;

  const entryContextMenu = entryMenu ? createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] min-w-[132px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: entryMenu.x, top: entryMenu.y }}
    >
      {entryMenu.tab === ROLE_TAB && (
        <button
          onClick={toggleEntryPinnedFromMenu}
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-brand hover:bg-brand-light"
        >
          {entryMenu.pinnedAt ? '取消置顶' : '置顶'}
        </button>
      )}
      <button
        onClick={deleteEntryFromMenu}
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
      >
        删除
      </button>
    </div>,
    document.body,
  ) : null;
  const pendingDeleteLabel = pendingEntryDelete?.tab === ROLE_TAB ? '角色' : pendingEntryDelete?.tab;
  const deleteConfirmDialog = (
    <ConfirmDialog
      isOpen={Boolean(pendingEntryDelete)}
      title="确认删除"
      description={`确定要删除${pendingDeleteLabel ?? '内容'}「${pendingEntryDelete?.title ?? ''}」吗？\n删除后无法恢复。`}
      confirmText="删除"
      cancelText="取消"
      confirmVariant="danger"
      onClose={() => setPendingEntryDelete(null)}
      onConfirm={handleConfirmDeleteEntry}
    />
  );
  const brainstormEntries = entries.filter((entry) => entry.tab === BRAINSTORM_TAB);
  const brainstormReaderModal = isBrainstormReaderOpen ? createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={() => setIsBrainstormReaderOpen(false)}
    >
      <div
        className="flex h-[72vh] w-[min(920px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">读取脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">这里显示脑洞标签页下的内容，仅供查看参考。</p>
          </div>
          <button
            onClick={() => setIsBrainstormReaderOpen(false)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          {brainstormEntries.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-gray-400">
              暂无脑洞内容
            </div>
          ) : (
            <div className="space-y-3">
              {brainstormEntries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const contentText = parsed.body || entry.content || '';
                return (
                  <article key={entry.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="min-w-0 truncate text-base font-bold text-gray-900">{entry.title}</h4>
                      <span className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{parsed.type || '未分类'}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                      {contentText || '暂无内容'}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>字数：{countTextWords(contentText)} 字 · 评分：暂未评分</span>
                      <span>{entry.updatedAt}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormPromptManagerModal = isBrainstormPromptManagerOpen ? createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormPromptManager}
    >
      <div
        className="flex h-[70vh] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">提示词管理</h3>
            <p className="mt-1 text-xs text-gray-400">仅显示“脑洞”分类下的提示词。</p>
          </div>
          <button
            onClick={closeBrainstormPromptManager}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
            <div className="flex flex-wrap gap-4">
              {brainstormPrompts.length === 0 && (
                <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                  暂无提示词
                </div>
              )}
              {brainstormPrompts.map((prompt) => (
                <article key={prompt.id} className="flex h-[247px] w-[255px] flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h4>
                        <span className="rounded-xl border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-500">脑洞</span>
                      </div>
                    </div>
                    <Lock className={`h-4 w-4 shrink-0 ${prompt.isLocked ? 'text-orange-400' : 'text-slate-300'}`} />
                  </div>
                  <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-50 p-3">
                    <div className="editor-scrollbar h-full overflow-y-auto whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-800">
                      {prompt.description || '暂无说明'}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>说明 {(prompt.description || '').length} 字</span>
                    <span>{prompt.updatedAt}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <button
                      onClick={() => togglePin(prompt.id)}
                      className={`rounded-[14px] px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                        prompt.isFavorite ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand hover:bg-brand-dark'
                      }`}
                    >
                      {prompt.isFavorite ? '已置顶' : '置顶'}
                    </button>
                    <button
                      onClick={() => openBrainstormPromptEdit(prompt)}
                      disabled={prompt.isLocked}
                      className="rounded-[14px] bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteBrainstormPrompt(prompt)}
                      disabled={prompt.isLocked}
                      className="rounded-[14px] bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
              <button
                onClick={() => navigate('/prompts')}
                className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-300 bg-white text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50/40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-300 bg-sky-50/60 text-4xl leading-none">
                  +
                </span>
                <span className="mt-6 text-base font-medium">创建提示词</span>
              </button>
            </div>
        </div>
        {editingBrainstormPrompt && (
          <div
            className="modal-sharp fixed inset-0 z-[270] flex items-center justify-center bg-black/35"
            onClick={() => setEditingBrainstormPrompt(null)}
          >
            <div
              className="modal-sharp flex h-[min(744px,90vh)] w-[min(792px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">编辑提示词</h3>
                  <p className="mt-1 text-xs text-gray-400">只会保存到“脑洞”分类下。</p>
                </div>
                <button
                  onClick={() => setEditingBrainstormPrompt(null)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  title="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <label className="block text-sm font-bold text-gray-700">
                  名称
                  <input
                    value={brainstormPromptDraft.name}
                    onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-800 outline-none focus:border-brand"
                  />
                </label>
                <label className="block text-sm font-bold text-gray-700">
                  说明
                  <textarea
                    value={brainstormPromptDraft.description}
                    onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, description: event.target.value }))}
                    className="editor-scrollbar mt-2 h-24 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm leading-6 text-gray-800 outline-none focus:border-brand"
                    placeholder="这里填写给用户看的提示词说明。"
                  />
                </label>
                <label className="flex min-h-[220px] flex-1 flex-col text-sm font-bold text-gray-700">
                  提示词内容
                  <textarea
                    value={brainstormPromptDraft.content}
                    onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, content: event.target.value }))}
                    className="editor-scrollbar mt-2 min-h-[210px] flex-1 resize-none rounded-xl border border-gray-200 p-3 text-sm leading-6 text-gray-800 outline-none focus:border-brand"
                    placeholder="这里填写实际发送给 AI 的提示词内容。"
                  />
                </label>
              </div>
              <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
                <button
                  onClick={() => setEditingBrainstormPrompt(null)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={saveBrainstormPromptEdit}
                  disabled={!brainstormPromptDraft.name.trim()}
                  className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  ) : null;

  if (activeTab === ROLE_TAB) {
    const roleHistoryModal = selectedEntry && selectedRole && roleHistoryEntryId === selectedEntry.id ? createPortal(
      <div
        className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/30"
        onClick={() => setRoleHistoryEntryId(null)}
      >
        <div
          className="flex h-[72vh] w-[860px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">历史版本</h3>
              <p className="mt-1 text-xs text-gray-400">{selectedEntry.title} · {selectedRole.history?.length ?? 0} / {ROLE_HISTORY_LIMIT}</p>
            </div>
            <button
              onClick={() => setRoleHistoryEntryId(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            {!selectedRole.history || selectedRole.history.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                暂无历史版本，修改角色后会自动记录。
              </div>
            ) : (
              <div className="space-y-3">
                {selectedRole.history.map((version, index) => (
                  <article key={`${version.savedAt}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate text-sm font-bold text-gray-900">
                        版本 {selectedRole.history!.length - index}：{version.title}
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{version.savedAt}</span>
                    </div>
                    <div className="mb-3 text-xs font-bold text-gray-500">分类：{version.type}</div>
                    <div className="grid grid-cols-2 gap-3 text-xs leading-5 text-gray-500">
                      <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 font-bold text-gray-700">角色背景</div>
                        <p className="whitespace-pre-wrap">{version.background || '暂无内容'}</p>
                      </div>
                      <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 font-bold text-gray-700">角色状态</div>
                        <p className="whitespace-pre-wrap">{version.status || '暂无内容'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    ) : null;

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {roleHistoryModal}
        {deleteConfirmDialog}
        <div
          className="grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 8px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-[1fr_84px] gap-2">
                <input
                  value={roleTypeDraft}
                  onChange={(event) => setRoleTypeDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addRoleType();
                }}
                placeholder="分类名字"
                className="h-11 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand"
              />
              <button
                onClick={addRoleType}
                className="h-11 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
              >
                新建分类
              </button>
                <input
                  value={roleNameDraft}
                  onChange={(event) => setRoleNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addRole('未分类');
                }}
                placeholder="角色名字"
                className="h-11 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand"
              />
              <button onClick={() => addRole('未分类')} className="h-11 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark">
                新建角色
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
              {groupedRoles.map((group) => {
                const expanded = expandedRoleTypes.has(group.type);
                const tone = getRoleCategoryButtonTone(group.type);
                return (
                  <div key={group.type}>
                    <button
                      onContextMenu={(event) => openCategoryMenu(event, 'role', group.type)}
                      onClick={() => {
                        setExpandedRoleTypes((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.type)) next.delete(group.type);
                          else next.add(group.type);
                          return next;
                        });
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left font-bold transition-colors ${tone.className}`}
                    >
                      <span className="flex-1">{group.type}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${tone.badgeClassName}`}>{group.entries.length}</span>
                      {expanded ? <ChevronDown className={`h-3.5 w-3.5 ${tone.iconClassName}`} /> : <ChevronRight className={`h-3.5 w-3.5 ${tone.iconClassName}`} />}
                    </button>
                    {expanded && (
                      <div className="editor-scrollbar mt-1 max-h-[464px] space-y-1 overflow-y-auto pr-1">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            onContextMenu={(event) => openEntryMenu(event, entry)}
                            onClick={() => setSelectedId(entry.id)}
                            className={`w-full rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                              selectedEntry?.id === entry.id
                                ? 'border-brand bg-[#FFF7ED] text-gray-900'
                                : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate">{entry.title}</span>
                              {entry.pinnedAt && (
                                <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand">
                                  置顶
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={roleSearch}
                onChange={(event) => setRoleSearch(event.target.value)}
                placeholder="搜索角色..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">搜索</button>
            </div>
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col overflow-hidden bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
            {selectedEntry && selectedRole ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                  <div className="flex min-h-full flex-col gap-5">
                    <div className="grid grid-cols-3 items-center gap-3">
                      <label className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">角色名</span>
                        <input
                          value={selectedEntry.title}
                          onChange={(event) => updateSelectedRoleTitle(event.target.value)}
                          className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                        />
                      </label>
                      <label className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">分类</span>
                        <select
                          value={selectedRole.type}
                          onChange={(event) => updateRole({ type: event.target.value })}
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                        >
                          {roleTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </label>
                      <label className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">存活状态</span>
                        <select
                          value={selectedRole.lifeStatus}
                          onChange={(event) => updateRole({ lifeStatus: event.target.value as RoleContent['lifeStatus'] })}
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                        >
                          <option value="存活">存活</option>
                          <option value="死亡">死亡</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">角色背景</span>
                        <span className="text-xs text-gray-400">{selectedRole.background.length} 字</span>
                      </div>
                      <textarea
                        value={selectedRole.background}
                        onChange={(event) => updateRole({ background: event.target.value })}
                        className="editor-scrollbar h-[260px] w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                      />
                    </label>

                    <label className="mt-auto block pt-2">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">角色状态</span>
                        <span className="text-xs text-gray-400">{selectedRole.status.length} 字</span>
                      </div>
                      <textarea
                        value={selectedRole.status}
                        onChange={(event) => updateRole({ status: event.target.value })}
                        placeholder="用于记录当前阶段的角色状态、心境、立场与关系变化"
                        className="editor-scrollbar h-[220px] w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                      />
                    </label>

                  </div>
                </div>
                <div className="shrink-0 border-t border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setRoleHistoryEntryId((current) => (current === selectedEntry.id ? null : selectedEntry.id))}
                      className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white"
                    >
                      历史版本
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">最近保存 {selectedEntry.updatedAt}</span>
                      <button className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white">一键更新状态</button>
                      <button onClick={() => confirmDeleteRole(selectedEntry)} className="rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-5 flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                点击左侧“新建角色”开始创建角色
              </div>
            )}
          </main>

          {settingLibraryMode === 'advanced' && (
          <>
          {rightResizeHandle}
          <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 p-4">
            <h3 className="text-base font-bold text-gray-900">角色生成</h3>
            <div className="mt-4 space-y-3">
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>模型</span>
                <select
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(event) => updateActiveTabConfig({ modelId: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand"
                >
                  {models.length === 0 ? <option value="">暂无可用模型</option> : models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </label>
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>提示词</span>
                <select
                  value={activeTabConfig.promptId ?? ''}
                  onChange={(event) => updateActiveTabConfig({ promptId: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand"
                >
                  {prompts.length === 0 ? <option value="">暂无提示词</option> : prompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.name}</option>)}
                </select>
              </label>
            </div>
            <textarea
              value={aiOutput}
              onChange={(event) => setAiOutput(event.target.value)}
              placeholder="AI 输出会显示在这里，也可以手动编辑。"
              className="editor-scrollbar mt-5 min-h-0 flex-1 resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
            />
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                onKeyDown={handleLibraryAiInputKeyDown}
                placeholder="输入对话指令..."
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-[11px] text-sm leading-6 outline-none focus:border-brand"
                style={{ height: aiInputHeight }}
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => void sendLibraryAiMessage()}
                  disabled={isLibraryAiLoading || !aiInput.trim()}
                  className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:bg-gray-300"
                >
                  {isLibraryAiLoading ? '生成中...' : '发送'}
                </button>
                <button
                  onClick={stopLibraryAiMessage}
                  disabled={!isLibraryAiLoading}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                >
                  暂停
                </button>
                <button
                  onClick={clearLibraryAiDialog}
                  disabled={!aiInput.trim() && !aiOutput.trim() && !isLibraryAiLoading}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                >
                  清空
                </button>
              </div>
            </div>
          </aside>
          </>
          )}
        </div>
      </div>
    );
  }

  if (isSettingLibraryPanel && SETTING_LIBRARY_TABS.has(activeTab) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) {
    const currentEntries = entries.filter((entry) => entry.tab === activeTab);
    const currentSelectedEntry = currentEntries.find((entry) => entry.id === selectedId) ?? currentEntries[0] ?? null;
    const activeIsSettingLike = isSettingLikeTab(activeTab);
    const activeIsBrainstorm = activeTab === BRAINSTORM_TAB;
    const currentSelectedSetting = activeIsSettingLike && currentSelectedEntry ? parseSettingContent(currentSelectedEntry.content) : null;
    const activeSettingTypeOptions = activeIsBrainstorm ? [BRAINSTORM_TYPE] : settingTypeOptions;
    const currentBrainstormBody = activeIsBrainstorm ? getLatestUsefulAiText(currentSelectedSetting?.body ?? '') : '';
    const currentBrainstormWordCount = activeIsBrainstorm ? countTextWords(currentBrainstormBody) : 0;
    const latestUsefulAiOutput = activeIsBrainstorm ? getLatestUsefulAiText(aiResult || aiOutput) : aiOutput.trim();
    const groupedSettingEntries = activeSettingTypeOptions.map((type) => ({
      type,
      entries: currentEntries.filter((entry) => {
        const parsed = parseSettingContent(entry.content);
        if (activeIsBrainstorm) return (parsed.type || BRAINSTORM_TYPE) === type || parsed.type === UNCATEGORIZED_TYPE;
        return parsed.type === type;
      }),
    }));
    const panelTitle = activeIsSettingLike ? `${activeTab}生成` : `${activeTab}生成`;
    const promptCategory = activeTab;
    const activeTabPrompts = prompts.filter((prompt) => prompt.category === promptCategory);
    const activePromptId = activeTabPrompts.some((prompt) => prompt.id === activeTabConfig.promptId)
      ? activeTabConfig.promptId
      : '';

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {deleteConfirmDialog}
        {brainstormReaderModal}
        {brainstormPromptManagerModal}
        <div
          className="grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: activeIsBrainstorm
              ? `${settingLibraryLeftWidth}px 8px minmax(240px,0.95fr) minmax(280px,1.05fr) 8px ${settingLibraryRightWidth}px`
              : settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 8px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          {!activeIsBrainstorm && (
            <div className="grid grid-cols-[40px_minmax(96px,1fr)_104px_52px] items-center gap-1.5">
              <span className="text-sm font-bold text-gray-700">新建</span>
              <input
                value={settingTitleDraft}
                onChange={(event) => setSettingTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') confirmSettingCreate();
                }}
                placeholder="输入名字"
                className="h-10 min-w-[96px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand"
              />
              <div className="flex h-10 items-center rounded-full border border-gray-200 bg-white p-1">
                {([
                  ['category', '分类'],
                  ['setting', '设定'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSettingCreateKind(value)}
                    className={`h-8 rounded-full px-2.5 text-xs font-bold transition-colors ${
                      settingCreateKind === value
                        ? 'bg-brand text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={confirmSettingCreate}
                className="h-10 rounded-lg bg-brand px-2.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                确定
              </button>
            </div>
          )}

          <div className={`${activeIsBrainstorm ? 'mt-0' : 'mt-5'} min-h-0 flex-1 overflow-y-auto space-y-2`}>
            {(activeIsSettingLike ? groupedSettingEntries : [{ type: UNCATEGORIZED_TYPE, entries: currentEntries }]).map((group) => {
              const expanded = expandedSettingTypes.has(group.type);
              return (
                <div key={group.type}>
                  <button
                    onContextMenu={(event) => {
                      if (activeIsSettingLike && !activeIsBrainstorm) openCategoryMenu(event, 'setting', group.type);
                    }}
                    onClick={() => {
                      setExpandedSettingTypes((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.type)) next.delete(group.type);
                        else next.add(group.type);
                        return next;
                      });
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#08AACE] bg-[#08AACE] px-3 py-2.5 text-left font-bold text-white transition-colors hover:brightness-95"
                  >
                    <span className="min-w-0 flex-1 truncate">{group.type}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{group.entries.length}</span>
                    {expanded ? <ChevronDown className="h-3.5 w-3.5 text-white" /> : <ChevronRight className="h-3.5 w-3.5 text-white" />}
                  </button>
                  {expanded && (
                    <div className="editor-scrollbar mt-1 max-h-[760px] space-y-1 overflow-y-auto pr-1">
                      {group.entries.length === 0 ? (
                        <p className="px-3 py-4 text-xs text-gray-400">该分类下暂无{activeTab}</p>
                      ) : group.entries.map((entry) => {
                        const parsed = activeIsSettingLike ? parseSettingContent(entry.content) : null;
                        return (
                          <button
                            key={entry.id}
                            onContextMenu={(event) => openEntryMenu(event, entry)}
                            onClick={() => setSelectedId(entry.id)}
                            className={`group w-full rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                              currentSelectedEntry?.id === entry.id
                                ? 'border-brand bg-[#FFF7ED] text-gray-900'
                                : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-bold">{entry.title}</span>
                              <span
                                onClick={(event) => {
                                  event.stopPropagation();
                                  confirmDeleteEntry(entry);
                                }}
                                className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                              {parsed ? parsed.body || '暂无设定内容' : entry.content || `暂无${activeTab}内容`}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
          {activeIsBrainstorm ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <h3 className="mb-3 shrink-0 text-base font-bold text-gray-900">脑洞预览</h3>
              <textarea
                value={currentBrainstormBody}
                onChange={(event) => {
                  if (!currentSelectedEntry || !currentSelectedSetting) return;
                  updateEntry(currentSelectedEntry.id, {
                    content: stringifySettingContent({ ...currentSelectedSetting, body: event.target.value }),
                  });
                }}
                placeholder="这里显示选中的脑洞内容，也可以直接编辑。"
                className="editor-scrollbar min-h-0 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50/40 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand focus:bg-white"
              />
            </div>
          ) : currentSelectedEntry ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className={`mb-3 grid gap-3 ${activeIsSettingLike ? 'grid-cols-[minmax(0,1fr)_220px]' : 'grid-cols-1'}`}>
                <input
                  value={currentSelectedEntry.title}
                  onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                />
                {currentSelectedSetting && (
                  <select
                    value={currentSelectedSetting.type}
                    onChange={(event) => updateEntry(currentSelectedEntry.id, {
                      content: stringifySettingContent({ ...currentSelectedSetting, type: event.target.value }),
                    })}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                  >
                    {activeSettingTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                )}
              </div>
              <textarea
                value={currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content}
                onChange={(event) => updateEntry(currentSelectedEntry.id, {
                  content: currentSelectedSetting
                    ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value })
                    : event.target.value,
                })}
                placeholder={activeIsBrainstorm ? '这里显示选中的脑洞内容...' : `填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50/40 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand focus:bg-white"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">请选择左侧记录</div>
          )}
          </main>

          {activeIsBrainstorm && (
            <section className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-base font-bold text-gray-900">脑洞设定输出</h3>
              </div>
              <div className="min-h-0 flex-1 p-4">
                <textarea
                  value={aiResult || latestUsefulAiOutput}
                  onChange={(event) => setAiResult(event.target.value)}
                  placeholder="这里显示本次 AI 生成的脑洞设定正文，保存脑洞时只保存这里的内容。"
                  className="editor-scrollbar h-full w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                />
              </div>
            </section>
          )}

          {settingLibraryMode === 'advanced' && (
          <>
          {rightResizeHandle}
          <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900">{panelTitle}</h3>
              {activeIsBrainstorm && (
                <button
                  onClick={openBrainstormPromptManager}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
                >
                  提示词管理
                </button>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>模型</span>
                <select
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(event) => updateActiveTabConfig({ modelId: event.target.value })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand"
                >
                  {models.length === 0 ? <option value="">暂无可用模型</option> : models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </label>
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>提示词</span>
                <select
                  value={activePromptId}
                  onChange={(event) => updateActiveTabConfig({ promptId: event.target.value })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand"
                >
                  {activeTabPrompts.length === 0 ? <option value="">暂无{promptCategory}提示词</option> : activeTabPrompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          {activeIsBrainstorm ? (
            <div className="min-h-0 flex-1 p-4">
              <div className="editor-scrollbar h-full w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                {aiChatTurns.length === 0 ? (
                  <div className="text-gray-400">这里显示脑洞生成过程。</div>
                ) : (
                  <div className="space-y-3">
                    {aiChatTurns.map((turn, index) => (
                      <div key={`${turn.role}-${index}`} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                            turn.role === 'user'
                              ? 'bg-brand text-white'
                              : 'border border-gray-200 bg-gray-50 text-gray-800'
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
          ) : (
            <div className="min-h-0 flex-1 p-4">
              <div className="editor-scrollbar h-full w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                {aiChatTurns.length === 0 ? (
                  <div className="text-gray-400">{`可以在这里生成${activeTab}，并继续通过对话细化。`}</div>
                ) : (
                  <div className="space-y-3">
                    {aiChatTurns.map((turn, index) => (
                      <div key={`${turn.role}-${index}`} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                            turn.role === 'user'
                              ? 'bg-brand text-white'
                              : 'border border-gray-200 bg-gray-50 text-gray-800'
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
          )}
          <div className="border-t border-gray-100 p-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {activeTab === SETTING_TAB && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsBrainstormReaderOpen(true)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                >
                  读取脑洞
                </button>
                <div />
                </div>
              )}
              {activeIsBrainstorm ? (
                <div className="mb-3 grid grid-cols-[minmax(0,1fr)_92px_124px] items-center gap-2">
                  <div className="min-w-0 truncate rounded-lg bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700">
                    当前脑洞：{currentBrainstormWordCount}字
                  </div>
                  <button
                    onClick={() => saveBrainstormOutput(currentSelectedEntry?.id)}
                    disabled={!currentSelectedEntry || !latestUsefulAiOutput}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    保存脑洞
                  </button>
                  <button
                    onClick={saveBrainstormOutputAsNew}
                    disabled={!latestUsefulAiOutput}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    保存为新脑洞
                  </button>
                </div>
              ) : (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (activeTab === SETTING_TAB) {
                        smartImportSettings();
                        return;
                      }
                      if (!currentSelectedEntry) {
                        addEntryToTab(activeTab, `新建${activeTab}`);
                        return;
                      }
                      updateEntry(currentSelectedEntry.id, { title: currentSelectedEntry.title || `新建${activeTab}` });
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                  >
                    {activeTab === SETTING_TAB ? '智能导入设定' : `保存为新${activeTab}`}
                  </button>
                  <div />
                </div>
              )}
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                onKeyDown={handleLibraryAiInputKeyDown}
                placeholder="输入对话指令..."
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-[11px] text-sm leading-6 outline-none focus:border-brand"
                style={{ height: aiInputHeight }}
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => void sendLibraryAiMessage()}
                  disabled={isLibraryAiLoading || !aiInput.trim()}
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white disabled:bg-gray-300"
                >
                  {isLibraryAiLoading ? '生成中...' : '发送'}
                </button>
                <button
                  onClick={stopLibraryAiMessage}
                  disabled={!isLibraryAiLoading}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                >
                  暂停
                </button>
                <button
                  onClick={clearLibraryAiDialog}
                  disabled={!aiInput.trim() && !aiOutput.trim() && !isLibraryAiLoading}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                >
                  清空
                </button>
              </div>
            </div>
          </div>
          </aside>
          </>
          )}
        </div>
      </div>
    );
  }

  if ((tabs.includes(CHAPTER_SUMMARY_TAB) && tabs.includes(VOLUME_SUMMARY_TAB)) || activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) {
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
      const next = currentOutlineEntries.map((entry) => (
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') }
          : entry
      ));
      persistCurrentOutline(next);
    };
    const chapterEntries = currentOutlineEntries.filter((entry) => entry.tab === outlineChapterTab);
    const volumeEntries = enableVolumeSummary ? currentOutlineEntries.filter((entry) => entry.tab === VOLUME_SUMMARY_TAB) : [];
    const outlineChapters = volumes.flatMap((volume) => (
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .map((chapter) => ({ volume, chapter }))
    ));
    const selectedOutlineChapter = outlineChapters.find((item) => item.chapter.id === selectedOutlineChapterId) ?? outlineChapters[0] ?? null;
    const selectedOutlineVolume = volumes.find((volume) => volume.id === selectedOutlineVolumeId) ?? volumes[0] ?? null;
    const effectiveSelectedOutlineChapterId = safeOutlineSelectionType === 'chapter'
      ? selectedOutlineChapterId ?? selectedOutlineChapter?.chapter.id ?? null
      : null;
    const getChapterSummaryTitle = (serialNumber: number) => isDetailOutlineTab ? `第${serialNumber}章细纲` : `第${serialNumber}章概要`;
    const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
    const getChapterSummaryEntry = (serialNumber: number) => (
      chapterEntries.find((entry) => entry.title === getChapterSummaryTitle(serialNumber))
    );
    const getVolumeSummaryEntry = (volumeName: string) => (
      volumeEntries.find((entry) => entry.title === getVolumeSummaryTitle(volumeName))
    );
    const selectedOutlineEntry = selectedOutlineChapter
      ? getChapterSummaryEntry(selectedOutlineChapter.chapter.serialNumber)
      : null;
    const selectedVolumeEntry = selectedOutlineVolume
      ? getVolumeSummaryEntry(selectedOutlineVolume.name)
      : null;
    const selectedSummaryContent = safeOutlineSelectionType === 'volume'
      ? selectedVolumeEntry?.content ?? ''
      : selectedOutlineEntry?.content ?? '';
    const selectedChapterTitle = selectedOutlineChapter?.chapter.title.trim() || '未命名章节';
    const selectedVolumeWordCount = selectedOutlineVolume
      ? selectedOutlineVolume.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
      : 0;
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
    const saveOutlinePreviewDraft = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        updateVolumeSummary(selectedOutlineVolume.name, outlinePreviewDraft);
        return;
      }
      if (selectedOutlineChapter) {
        updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, outlinePreviewDraft);
      }
    };
    const selectOutlineChapter = (chapterId: number, serialNumber: number) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('chapter');
      setSelectedOutlineChapterId(chapterId);
      setSelectedOutlineVolumeId(null);
      const entry = getChapterSummaryEntry(serialNumber);
      setSelectedId(entry?.id ?? null);
      setOutlinePreviewDraft(entry?.content ?? '');
    };
    const selectOutlineVolume = (volume: Volume) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('volume');
      setSelectedOutlineVolumeId(volume.id);
      setSelectedOutlineChapterId(null);
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
    const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);
    const outlinePreviewTitle = isDetailOutlineTab ? '细纲预览' : (safeOutlineSelectionType === 'volume' ? '卷概要预览' : '章节概要');
    const outlinePromptOptions = isDetailOutlineTab ? prompts.filter((prompt) => prompt.category === DETAIL_OUTLINE_TAB) : outlinePrompts;
    const activeOutlinePromptId = outlinePromptOptions.some((prompt) => prompt.id === activeTabConfig.promptId) ? activeTabConfig.promptId : '';

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) && renderTopTabs()}
        {deleteConfirmDialog}
        <div
          className="relative grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{ gridTemplateColumns: `${outlineSidebarWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px` }}
        >
        <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ? '细纲目录' : '章节概要'}</h3>
              <button
                onClick={() => setIsOutlineSettingsOpen(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
                title={isDetailOutlineTab ? '细纲设置' : '概要设置'}
                aria-label={isDetailOutlineTab ? '细纲设置' : '概要设置'}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              {volumes.length === 0 ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无章节</p>
              ) : (
                <div className="space-y-3">
                  {volumes.map((volume) => (
                    <div key={volume.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleOutlineVolume(volume.id)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          toggleOutlineVolume(volume.id);
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-white transition-colors hover:brightness-95"
                        style={{ backgroundColor: '#08B3D9' }}
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-white"
                          title={expandedOutlineVolumeIds.has(volume.id) ? '收起' : '展开'}
                        >
                          {expandedOutlineVolumeIds.has(volume.id) ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{volume.name}</span>
                        {enableVolumeSummary && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              selectOutlineVolume(volume);
                            }}
                            className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                              safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id
                                ? 'border-white bg-white text-[#08B3D9]'
                                : 'border-white/70 bg-white/15 text-white hover:bg-white hover:text-[#08B3D9]'
                            }`}
                          >
                            卷概要
                          </button>
                        )}
                      </div>
                      {expandedOutlineVolumeIds.has(volume.id) && (
                        <div
                          className="mt-1 grid gap-2 px-1.5 py-1.5"
                          style={{ gridTemplateColumns: `repeat(${outlineColumns}, minmax(0, 1fr))` }}
                        >
                          {[...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber).map((chapter) => {
                            const selected = effectiveSelectedOutlineChapterId === chapter.id;
                            const hasSummary = Boolean(getChapterSummaryEntry(chapter.serialNumber)?.content.trim());
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
                                className={`relative h-9 rounded-lg border text-sm font-bold transition-colors ${
                                  hasSummary
                                    ? 'border-[#08B3D9] bg-[#08B3D9] text-white hover:border-[#067B96] hover:bg-[#067B96]'
                                    : 'border-slate-200 text-slate-500 hover:border-[#08B3D9]'
                                } ${selected ? 'ring-2 ring-[#08B3D9] ring-offset-2' : ''}`}
                                style={hasSummary ? undefined : {
                                  backgroundImage: 'repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 5px, #e2e8f0 5px, #e2e8f0 6px)',
                                }}
                              >
                                {chapter.serialNumber}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
        {leftResizeHandle}

        <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white p-5">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">{outlinePreviewTitle}</h3>
            </div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto">
            {outlineChapters.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">暂无章节可预览</div>
            ) : safeOutlineSelectionType === 'volume' && selectedOutlineVolume ? (
              <section className="rounded-xl border border-brand bg-[#FFF7ED] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{selectedOutlineVolume.name}概要</h4>
                  <span className="shrink-0 text-lg font-bold text-gray-900">{selectedOutlineVolume.chapters.length}章</span>
                </div>
                <textarea
                  value={selectedVolumeEntry?.content ?? ''}
                  onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
                  placeholder="这一卷的概要会显示在这里，内容是该卷下所有章节内容的总结。"
                  className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                />
                <div className="mt-2 text-right text-xs font-bold text-gray-400">
                  {countTextWords(selectedVolumeEntry?.content ?? '')} 字
                </div>
              </section>
            ) : (
              <div className={`grid gap-3 ${isDetailOutlineTab ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {outlineChapters.map(({ volume, chapter }) => {
                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                  const selected = effectiveSelectedOutlineChapterId === chapter.id;
                  return (
                    <section
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className={`rounded-xl border bg-gray-50/40 p-4 transition-colors ${
                        selected
                          ? 'border-2 border-[#08AACE] bg-white shadow-sm'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">第{chapter.serialNumber}章{isDetailOutlineTab ? '细纲' : '概要'}</h4>
                        <span className="shrink-0 truncate text-xs text-gray-400">{volume.name}</span>
                      </div>
                      <textarea
                        value={entry?.content ?? ''}
                        onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                        onFocus={() => selectOutlineChapter(chapter.id, chapter.serialNumber)}
                        placeholder={isDetailOutlineTab ? '该章细纲会显示在这里，可由 AI 根据章节内容生成。' : '该章概要会显示在这里，可由 AI 根据章节内容生成。'}
                        className="editor-scrollbar h-36 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                      />
                      <div className="mt-2 text-right text-xs font-bold text-gray-400">
                        {countTextWords(entry?.content ?? '')} 字
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {rightResizeHandle}
        <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50 p-4">
          <h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ? '细纲提示词' : '概要提示词'}</h3>
          <div className="mt-4 space-y-3">
            <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
              <span>模型</span>
              <select
                value={activeTabConfig.modelId ?? ''}
                onChange={(event) => updateActiveTabConfig({ modelId: event.target.value })}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand"
              >
                {models.length === 0 ? <option value="">暂无可用模型</option> : models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </label>
            <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
              <span>提示词</span>
              <select
                value={activeOutlinePromptId}
                onChange={(event) => updateActiveTabConfig({ promptId: event.target.value })}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand"
              >
                {outlinePromptOptions.length === 0 ? <option value="">{isDetailOutlineTab ? '暂无细纲提示词' : '暂无概要提示词'}</option> : outlinePromptOptions.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm leading-6 text-gray-600">
              {safeOutlineSelectionType === 'volume' && selectedOutlineVolume ? (
                <>
                  <div><span className="font-bold text-gray-800">当前卷：</span>{selectedOutlineVolume.name}</div>
                  <div><span className="font-bold text-gray-800">章节数量：</span>{selectedOutlineVolume.chapters.length} 章</div>
                  <div><span className="font-bold text-gray-800">章节字数：</span>{selectedVolumeWordCount} 字</div>
                </>
              ) : selectedOutlineChapter ? (
                <>
                  <div className="font-bold text-gray-800">第{selectedOutlineChapter.chapter.serialNumber}章 {selectedChapterTitle}</div>
                  <div className="mt-1 text-gray-700">正文：{selectedOutlineChapter.chapter.wordCount}字</div>
                </>
              ) : (
                <span className="text-gray-400">请选择左侧章节。</span>
              )}
            </div>
          </div>
          <h4 className="mt-4 text-sm font-bold text-gray-900">{isDetailOutlineTab ? '细纲预览' : '概要预览'}</h4>
          <textarea
            value={outlinePreviewDraft}
            onChange={(event) => setOutlinePreviewDraft(event.target.value)}
            placeholder={isDetailOutlineTab ? '生成后的细纲会显示在这里，也可以手动编辑后保存。' : '生成后的概要会显示在这里，也可以手动编辑后保存。'}
            className="editor-scrollbar mt-3 flex-1 resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600 outline-none focus:border-brand"
          />
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 grid grid-cols-2 gap-2">
              <button
                className="rounded bg-brand px-2 py-1.5 text-base font-bold text-white hover:bg-brand-dark"
              >
                生成
              </button>
              <button
                onClick={saveOutlinePreviewDraft}
                className="rounded bg-brand px-2 py-1.5 text-base font-bold text-white hover:bg-brand-dark"
              >
                保存
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => void navigator.clipboard.writeText(outlinePreviewDraft)}
                className="rounded bg-brand px-2 py-1.5 text-base font-bold text-white hover:bg-brand-dark"
              >
                复制
              </button>
              <button
                onClick={() => {
                  if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
                    updateVolumeSummary(selectedOutlineVolume.name, '');
                    setOutlinePreviewDraft('');
                    return;
                  }
                  if (selectedOutlineChapter) {
                    updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, '');
                    setOutlinePreviewDraft('');
                  }
                }}
                className="rounded bg-brand px-2 py-1.5 text-base font-bold text-white hover:bg-brand-dark"
              >
                清空
              </button>
            </div>
          </div>
          </aside>
        {isOutlineSettingsOpen && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/30" onClick={() => setIsOutlineSettingsOpen(false)}>
            <div
              className="w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900">{isDetailOutlineTab ? '细纲设置' : '概要设置'}</h3>
                <button
                  onClick={() => setIsOutlineSettingsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="关闭"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="mb-3 text-sm font-bold text-slate-700">每行显示</div>
                <div className="grid grid-cols-6 gap-2">
                  {OUTLINE_COLUMN_OPTIONS.map((value) => (
                    <button
                      key={value}
                      onClick={() => setOutlineColumns(value)}
                      className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                        outlineColumns === value
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-400">可设置为每行 5-10 个章节，左侧{isDetailOutlineTab ? '细纲目录' : '章节概要'}区域宽度会同步调整。</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }
  return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {renderTopTabs()}
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
                    className={`group w-full rounded-lg border px-2 py-2 text-left transition-colors ${
                      selectedEntry?.id === entry.id ? 'border-brand bg-[#FFF7ED]' : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="truncate text-xs font-medium text-gray-800">{entry.title}</div>
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
