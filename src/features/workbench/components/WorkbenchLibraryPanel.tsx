import { ChevronDown, ChevronRight, Lock, Plus, Send, Settings, Square, Trash2, Unlock, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CSSProperties } from 'react';
import type { DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { readModelSnapshot } from '@/features/models/hooks/useModels';
import { callModel, callModelStream } from '@/features/models/services/callModel';
import { normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { clearWorkbenchLinkedBrainstorm } from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { isRememberAssociationsEnabled } from '@/shared/settings/associationMemory';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 162;

function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.min(
    FLOATING_AI_TEXTAREA_MAX_HEIGHT,
    Math.max(FLOATING_AI_TEXTAREA_MIN_HEIGHT, textarea.scrollHeight),
  );
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > FLOATING_AI_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
}

interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
  getChapterContent?: (chapterId: number) => string;
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
const DEFAULT_SETTING_TYPES = ['核心设定', '主线剧情', '等级体系', '势力设定', '伏笔设定', '其他设定', '未分类'];
const ROLE_TAB = '角色';
const BRAINSTORM_TAB = '脑洞';
const SETTING_TAB = '大纲';
const PROMPT_SETTING_CATEGORY = '设定';
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
const BRAINSTORM_PREVIEW_WIDTH = 520;
const BRAINSTORM_PREVIEW_MIN_WIDTH = 320;
const BRAINSTORM_PREVIEW_MAX_WIDTH = 760;
const BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH = 280;
const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 420;
const BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH = 340;
const BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH = 760;
const BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH = 320;
const ROLE_HISTORY_LIMIT = 20;
const MODEL_SELECT_COLUMNS = 'grid-cols-[minmax(0,1fr)]';
const PROMPT_SELECT_COLUMNS = 'grid-cols-[minmax(0,1fr)_52px]';

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
type LibraryManagementModalState =
  | { type: 'models' }
  | { type: 'prompts'; category: string }
  | null;
type LibraryAiRequestLog = {
  createdAt: string;
  tab: string;
  modelName: string;
  promptName: string;
  hasLinkedBrainstorm: boolean;
  linkedBrainstormTitle: string;
  visibleUserText: string;
  systemPrompt: string;
  userContent: string;
  contextTitle?: string;
  contextText?: string;
  contextWordCount?: number;
};

type LibraryEntryDragState = {
  entryId: string;
  tab: string;
  type: string;
} | null;

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
  aiSessions?: unknown[];
  activeAiSessionId?: string;
  outlineAiInput?: string;
  modelId?: string;
  promptId?: string;
  promptDisabled?: boolean;
  brainstormGenre?: string;
  brainstormBackground?: string;
  brainstormIdea?: string;
  brainstormCheat?: string;
  brainstormRequirement?: string;
  brainstormPreviewFontSize?: number;
  brainstormOutputFontSize?: number;
  brainstormStreamEnabled?: boolean;
  loadedBrainstormId?: string | null;
  loadedBrainstormTitle?: string;
  loadedBrainstormText?: string;
  smartImportLocked?: boolean;
  settingPreviewFontSize?: number;
  roleTextFontSize?: number;
};

function PromptDisableButton({ disabled, onToggle }: { disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={disabled}
      onClick={onToggle}
      className={`mt-2 h-12 w-[52px] rounded-[18px] border px-2 text-xs font-black transition-colors ${
        disabled
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100'
      }`}
    >
      {disabled ? '启用' : '禁用'}
    </button>
  );
}

type BrainstormQuestionKey =
  | 'brainstormGenre'
  | 'brainstormBackground'
  | 'brainstormIdea'
  | 'brainstormCheat'
  | 'brainstormRequirement';

type BrainstormQuestionDraft = Record<BrainstormQuestionKey, string>;

const BRAINSTORM_QUESTION_FIELDS: Array<{
  key: BrainstormQuestionKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'brainstormGenre', label: '题材', placeholder: '如都市高武、玄幻、仙侠、科幻' },
  { key: 'brainstormBackground', label: '故事主题', placeholder: '如系统流、凡人流' },
  { key: 'brainstormIdea', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
  { key: 'brainstormCheat', label: '你的构思', placeholder: '任何灵感都可以' },
  { key: 'brainstormRequirement', label: '补充内容', placeholder: '主角名字、性格、女主设定等' },
];

const BRAINSTORM_PREVIEW_MIN_FONT_SIZE = 12;
const BRAINSTORM_PREVIEW_MAX_FONT_SIZE = 28;
const BRAINSTORM_OUTPUT_MIN_FONT_SIZE = 12;
const BRAINSTORM_OUTPUT_MAX_FONT_SIZE = 28;
const SETTING_PREVIEW_MIN_FONT_SIZE = 12;
const SETTING_PREVIEW_MAX_FONT_SIZE = 28;
const ROLE_TEXT_MIN_FONT_SIZE = 12;
const ROLE_TEXT_MAX_FONT_SIZE = 28;
const LIBRARY_AI_TIMEOUT_MS = 180000;

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

function getSettingLibraryWidthStorageKey(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview') {
  return `${storageKey}_${normalizeTabName(tab)}_${side}_width`;
}

function getExpandedStringSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

function readExpandedStringSet(storageKey: string, tab: string, name: string, fallback: string[] = [UNCATEGORIZED_TYPE]) {
  try {
    const raw = localStorage.getItem(getExpandedStringSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as string[] : fallback;
    const values = parsed.filter((item) => typeof item === 'string' && item.trim());
    return new Set(values.length > 0 ? values : fallback);
  } catch {
    return new Set(fallback);
  }
}

function persistExpandedStringSet(storageKey: string, tab: string, name: string, values: Set<string>) {
  localStorage.setItem(getExpandedStringSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

function getExpandedNumberSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

function readExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    const raw = localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as number[] : [];
    return new Set(parsed.filter((item) => Number.isFinite(item)));
  } catch {
    return new Set<number>();
  }
}

function hasStoredExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    return localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name)) !== null;
  } catch {
    return false;
  }
}

function persistExpandedNumberSet(storageKey: string, tab: string, name: string, values: Set<number>) {
  localStorage.setItem(getExpandedNumberSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

function readSettingLibraryLeftWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'left')) ?? SETTING_LIBRARY_LEFT_WIDTH);
    if (!Number.isFinite(value)) return SETTING_LIBRARY_LEFT_WIDTH;
    return Math.min(SETTING_LIBRARY_LEFT_MAX_WIDTH, Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, value));
  } catch {
    return SETTING_LIBRARY_LEFT_WIDTH;
  }
}

function readSettingLibraryRightWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'right')) ?? SETTING_LIBRARY_RIGHT_WIDTH);
    if (!Number.isFinite(value)) return SETTING_LIBRARY_RIGHT_WIDTH;
    return Math.min(SETTING_LIBRARY_RIGHT_MAX_WIDTH, Math.max(SETTING_LIBRARY_RIGHT_MIN_WIDTH, value));
  } catch {
    return SETTING_LIBRARY_RIGHT_WIDTH;
  }
}

function readBrainstormPreviewWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'brainstormPreview')) ?? BRAINSTORM_PREVIEW_WIDTH);
    if (!Number.isFinite(value)) return BRAINSTORM_PREVIEW_WIDTH;
    return Math.min(BRAINSTORM_PREVIEW_MAX_WIDTH, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, value));
  } catch {
    return BRAINSTORM_PREVIEW_WIDTH;
  }
}

function persistSettingLibraryWidth(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview', value: number) {
  localStorage.setItem(getSettingLibraryWidthStorageKey(storageKey, tab, side), String(value));
}

function stripTransientLinkConfig(configs: LibraryTabConfigs): LibraryTabConfigs {
  return Object.fromEntries(
    Object.entries(configs).map(([tab, config]) => [tab, {
      ...config,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
    }]),
  );
}

function readTabConfigs(storageKey: string): LibraryTabConfigs {
  try {
    const raw = localStorage.getItem(getTabConfigsStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as LibraryTabConfigs : {};
    if (parsed && typeof parsed === 'object' && !parsed[SETTING_TAB] && parsed['设定']) {
      parsed[SETTING_TAB] = parsed['设定'];
    }
    if (!parsed || typeof parsed !== 'object') return {};
    return isRememberAssociationsEnabled() ? parsed : stripTransientLinkConfig(parsed);
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

function hasLibraryAiDialogContent(aiInput = '', aiOutput = '', aiResult = '') {
  return Boolean(aiInput.trim() || aiOutput.trim() || aiResult.trim());
}

function readNormalizedEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(storageKey));
}

function getBrainstormRecycleStorageKey(storageKey: string) {
  return `${storageKey}_brainstorm_recycle_v1`;
}

function readBrainstormRecycleEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey)))
    .filter((entry) => entry.tab === BRAINSTORM_TAB);
}

function writeBrainstormRecycleEntries(storageKey: string, entries: WorkbenchLibraryEntry[]) {
  writeWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey), entries);
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

function createTaggedSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const segments: Array<{ title: string; type: string; body: string }> = [];
  const sectionPattern = /<([^<>/]+)>\s*([\s\S]*?)\s*<\/\1>/g;

  for (const sectionMatch of normalized.matchAll(sectionPattern)) {
    const type = (sectionMatch[1] ?? '').trim();
    const sectionBody = (sectionMatch[2] ?? '').trim();
    if (!type || !sectionBody) continue;

    const itemPattern = /^\s*(?:\*([^*\n]+)\*|#([^#\n]+)#)\s*[：:]\s*/gm;
    const itemMatches = [...sectionBody.matchAll(itemPattern)];
    itemMatches.forEach((itemMatch, index) => {
      const title = (itemMatch[1] ?? itemMatch[2] ?? '').trim();
      if (!title) return;
      const bodyStart = (itemMatch.index ?? 0) + itemMatch[0].length;
      const bodyEnd = index + 1 < itemMatches.length
        ? itemMatches[index + 1].index ?? sectionBody.length
        : sectionBody.length;
      const body = sectionBody.slice(bodyStart, bodyEnd).trim();
      if (!body) return;
      segments.push({ title, type, body });
    });
  }

  return segments;
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

function cleanMarkdownHeadingTitle(text: string) {
  return text
    .replace(/^#+\s*/, '')
    .replace(/\s*#+\s*$/, '')
    .trim();
}

function createMarkdownSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const segments: Array<{ title: string; type: string; body: string }> = [];
  let currentType = '';
  let currentTitle = '';
  let bodyLines: string[] = [];

  const flush = () => {
    const title = currentTitle.trim();
    if (!title) {
      bodyLines = [];
      return;
    }
    const body = bodyLines
      .join('\n')
      .replace(/^#{1,6}\s*/gm, '')
      .trim();
    segments.push({
      title,
      type: currentType.trim() || classifySettingText(`${title}\n${body}`),
      body,
    });
    bodyLines = [];
  };

  normalized.split('\n').forEach((line) => {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) {
      if (currentTitle) bodyLines.push(line);
      return;
    }

    const level = heading[1].length;
    const title = cleanMarkdownHeadingTitle(heading[2] ?? '');
    if (!title) return;

    if (level === 1) {
      flush();
      currentType = title;
      currentTitle = '';
      return;
    }

    if (level === 2) {
      flush();
      currentTitle = title;
      return;
    }

    if (currentTitle) bodyLines.push(title);
  });

  flush();
  return segments;
}

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

function getBrainstormQuestionRows(value: string) {
  const rows = value
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / 26)), 0);
  return Math.min(4, Math.max(1, rows));
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

function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body ? `\n${body}` : '',
  ].join('\n').trimEnd();
}

function stripAiThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

function renderAiChatContent(content: string) {
  const thinkingMatch = content.match(/^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/);
  if (thinkingMatch) {
    const seconds = thinkingMatch[1] ?? '0';
    const done = thinkingMatch[2] === 'done';
    const reasoning = thinkingMatch[3]?.trim() ?? '';
    const answer = thinkingMatch[4]?.trimStart() ?? '';
    return (
      <div className="space-y-3">
        <details open={!done} className="group rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-gray-600">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-gray-600">
            {done ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronRight className="h-4 w-4 text-brand" />}
            <span>{done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`}</span>
          </summary>
          {reasoning && (
            <div className="mt-2 border-l-2 border-gray-200 pl-3 text-sm leading-7 text-gray-500">
              {reasoning}
            </div>
          )}
        </details>
        {answer && <div>{answer}</div>}
      </div>
    );
  }
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
  if (latestAi) return stripAiThinkingBlock(latestAi.content);

  const legacyAiMatches = [...content.matchAll(/(?:^|\n)AI[：:]\s*([\s\S]*?)(?=\n\s*用户[：:]|\n\s*\[\[USER\]\]|$)/g)]
    .map((match) => match[1]?.trim() ?? '')
    .filter((value) => value && !/^正在生成\.{1,3}$/.test(value));
  if (legacyAiMatches.length > 0) return legacyAiMatches[legacyAiMatches.length - 1];

  return content
    .replace(/\[\[(?:USER|AI)\]\]\n?/g, '')
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .replace(/^\s*(?:用户|AI)[：:].*$/gm, '')
    .replace(/^正在生成\.{1,3}\s*$/gm, '')
    .trim();
}

function getBrainstormEntryBody(entry: WorkbenchLibraryEntry | null | undefined) {
  if (!entry) return '';
  const parsed = parseSettingContent(entry.content);
  return getLatestUsefulAiText(parsed.body || entry.content);
}

function getRoleCategoryButtonTone(type: string) {
  return {
    className: 'border-[#08AACE] bg-[#08AACE] text-white hover:brightness-95',
    badgeClassName: 'bg-white/20 text-white',
    iconClassName: 'text-white',
  };
}

function LibraryManagementModal({
  modal,
  onClose,
}: {
  modal: Exclude<LibraryManagementModalState, null>;
  onClose: () => void;
}) {
  const draggable = useDraggableModal(`workbench_library_${modal.type}_${modal.type === 'prompts' ? modal.category : 'models'}`);
  useTopModalEscape(true, onClose);
  const title = modal.type === 'models' ? '模型管理' : `${modal.category}提示词管理`;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35 px-8 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-11 shrink-0 cursor-move items-center justify-between border-b border-slate-200 bg-white px-4"
        >
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="关闭"
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          {modal.type === 'models' ? <ModelManagePage /> : <PromptsPage initialCategory={modal.category} />}
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>,
    document.body,
  );
}

function LibraryAiLogShell({
  id,
  subtitle,
  onClose,
  children,
}: {
  id: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const draggable = useDraggableModal(id);
  useTopModalEscape(true, onClose);

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[285] flex items-center justify-center bg-black/35 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        style={draggable.style}
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1120px,94vw)] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-14 shrink-0 cursor-move items-center justify-between border-b border-slate-100 px-5"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">输出日志</h2>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          </div>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            关闭
          </button>
        </header>
        {children}
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('top')} className="absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('bottom')} className="absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('left')} className="absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('right')} className="absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.resizeHandleProps} className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize">
          <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
        </div>
      </section>
    </div>,
    document.body,
  );
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
}: WorkbenchLibraryPanelProps) {
  const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);
  const isSettingLibraryPanel = useMemo(
    () => normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)),
    [normalizedTabs],
  );
  const [entries, setEntries] = useState<WorkbenchLibraryEntry[]>(() => readNormalizedEntries(storageKey));
  const [brainstormRecycleEntries, setBrainstormRecycleEntries] = useState<WorkbenchLibraryEntry[]>(() => (
    readBrainstormRecycleEntries(storageKey)
  ));
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
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() => (
    readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')
  ));
  const [outlineColumns, setOutlineColumns] = useState(loadOutlineColumns);
  const [isOutlineSettingsOpen, setIsOutlineSettingsOpen] = useState(false);
  const [settingLibraryLeftWidth, setSettingLibraryLeftWidth] = useState(() => readSettingLibraryLeftWidth(storageKey, activeTab));
  const [settingLibraryRightWidth, setSettingLibraryRightWidth] = useState(() => readSettingLibraryRightWidth(storageKey, activeTab));
  const [brainstormPreviewWidth, setBrainstormPreviewWidth] = useState(() => readBrainstormPreviewWidth(storageKey, activeTab));
  const [expandedRoleTypes, setExpandedRoleTypes] = useState<Set<string>>(() => (
    readExpandedStringSet(storageKey, ROLE_TAB, 'role_types')
  ));
  const [expandedSettingTypes, setExpandedSettingTypes] = useState<Set<string>>(() => (
    readExpandedStringSet(storageKey, activeTab, 'setting_types')
  ));
  const [categoryMenu, setCategoryMenu] = useState<LibraryCategoryMenu>(null);
  const [entryMenu, setEntryMenu] = useState<LibraryEntryMenu>(null);
  const [pendingEntryDelete, setPendingEntryDelete] = useState<PendingEntryDelete>(null);
  const [isClearSettingsConfirmOpen, setIsClearSettingsConfirmOpen] = useState(false);
  const [managementModal, setManagementModal] = useState<LibraryManagementModalState>(null);
  const [draggingLibraryEntry, setDraggingLibraryEntry] = useState<LibraryEntryDragState>(null);
  const [libraryDropTarget, setLibraryDropTarget] = useState<{ tab: string; type: string } | null>(null);
  const [roleHistoryEntryId, setRoleHistoryEntryId] = useState<string | null>(null);
  const [isBrainstormReaderOpen, setIsBrainstormReaderOpen] = useState(false);
  const [selectedBrainstormReaderId, setSelectedBrainstormReaderId] = useState<string | null>(null);
  const [isBrainstormRecycleOpen, setIsBrainstormRecycleOpen] = useState(false);
  const [isClearBrainstormRecycleConfirmOpen, setIsClearBrainstormRecycleConfirmOpen] = useState(false);
  const [isBrainstormPromptManagerOpen, setIsBrainstormPromptManagerOpen] = useState(false);
  const [editingBrainstormPrompt, setEditingBrainstormPrompt] = useState<PromptItem | null>(null);
  const [isCreatingBrainstormPrompt, setIsCreatingBrainstormPrompt] = useState(false);
  const [brainstormPromptDraft, setBrainstormPromptDraft] = useState({ name: '', description: '', content: '' });
  const [brainstormGenerateDraft, setBrainstormGenerateDraft] = useState<BrainstormQuestionDraft | null>(null);
  const [isBrainstormConfirmScrolling, setIsBrainstormConfirmScrolling] = useState(false);
  const [settingCreateDialog, setSettingCreateDialog] = useState<'category' | 'setting' | null>(null);
  const [isLibraryAiLoading, setIsLibraryAiLoading] = useState(false);
  const [isLibraryAiLogOpen, setIsLibraryAiLogOpen] = useState(false);
  const [lastLibraryAiRequestLog, setLastLibraryAiRequestLog] = useState<LibraryAiRequestLog | null>(null);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [tabPortalTarget, setTabPortalTarget] = useState<HTMLElement | null>(null);
  const outlinePreviewRefs = useRef<Record<number, HTMLElement | null>>({});
  const libraryAiOutputRef = useRef<HTMLDivElement | null>(null);
  const libraryAiAutoScrollRef = useRef(true);
  const libraryAiProgrammaticScrollRef = useRef(false);
  const libraryAiAbortRef = useRef<AbortController | null>(null);
  const libraryAiInputRef = useRef<HTMLTextAreaElement | null>(null);
  const libraryAiRequestSeqRef = useRef(0);
  const brainstormConfirmScrollTimerRef = useRef<number | null>(null);
  const roleExpandedReloadRef = useRef(false);
  const settingExpandedReloadRef = useRef(false);
  const outlineExpandedReloadRef = useRef(false);
  const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);
  const { prompts, addPrompt, updatePrompt, deletePrompt, togglePin } = usePrompts();
  const brainstormPrompts = useMemo(() => prompts.filter((prompt) => prompt.category === BRAINSTORM_TAB), [prompts]);
  const rolePromptOptions = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY),
    [prompts],
  );
  const outlinePrompts = useMemo(() => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === '概要'), [prompts]);
  const scaleStyle = scale === 1 ? undefined : ({ zoom: scale } as CSSProperties);
  const activeTabConfig = tabConfigs[activeTab] ?? {};
  const selectedId = activeTabConfig.selectedId ?? null;
  const roleTypeDraft = activeTabConfig.roleTypeDraft ?? activeTabConfig.typeDraft ?? '';
  const roleNameDraft = activeTabConfig.roleNameDraft ?? activeTabConfig.titleDraft ?? '';
  const settingTypeDraft = activeTabConfig.typeDraft ?? '';
  const settingTitleDraft = activeTabConfig.titleDraft ?? '';
  const aiInput = activeTabConfig.aiInput ?? '';
  const canSendLibraryAiMessage = activeTab === SETTING_TAB || aiInput.trim().length > 0;
  const aiOutput = activeTabConfig.aiOutput ?? '';
  const aiResult = activeTabConfig.aiResult ?? '';
  const hasLibraryAiContent = hasLibraryAiDialogContent(aiInput, aiOutput, aiResult);
  const animatedAiOutput = isLibraryAiLoading
    ? aiOutput.replace(/正在生成\.\.\./g, `正在生成${'.'.repeat(loadingDotCount)}`)
    : aiOutput;
  const aiChatTurns = parseAiChatTurns(animatedAiOutput);
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
  const brainstormQuestionDraft: BrainstormQuestionDraft = {
    brainstormGenre: activeTabConfig.brainstormGenre ?? '',
    brainstormBackground: activeTabConfig.brainstormBackground ?? '',
    brainstormIdea: activeTabConfig.brainstormIdea ?? '',
    brainstormCheat: activeTabConfig.brainstormCheat ?? '',
    brainstormRequirement: activeTabConfig.brainstormRequirement ?? '',
  };

  useTopModalEscape(isBrainstormPromptManagerOpen && !editingBrainstormPrompt && !isCreatingBrainstormPrompt, closeBrainstormPromptManager);
  useTopModalEscape(Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt), () => closeBrainstormPromptEdit());
  useTopModalEscape(Boolean(brainstormGenerateDraft), () => setBrainstormGenerateDraft(null));
  useTopModalEscape(Boolean(settingCreateDialog), () => setSettingCreateDialog(null));
  useTopModalEscape(isLibraryAiLogOpen, () => setIsLibraryAiLogOpen(false));
  useTopModalEscape(isBrainstormRecycleOpen && !isClearBrainstormRecycleConfirmOpen, () => setIsBrainstormRecycleOpen(false));
  useTopModalEscape(isBrainstormReaderOpen, closeBrainstormReader);

  useEffect(() => () => {
    if (brainstormConfirmScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormConfirmScrollTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (!isRememberAssociationsEnabled()) clearWorkbenchLinkedBrainstorm(storageKey);
    };
  }, [storageKey]);

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
  const setAiInput = (value: string) => updateActiveTabConfig({ aiInput: value });
  const setAiOutput = (value: string) => updateActiveTabConfig({ aiOutput: value });
  const setAiResult = (value: string) => updateActiveTabConfig({ aiResult: value });
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
      settingPreviewFontSize: Math.min(
        SETTING_PREVIEW_MAX_FONT_SIZE,
        Math.max(SETTING_PREVIEW_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setRoleTextFontSize = (value: number) => {
    updateActiveTabConfig({
      roleTextFontSize: Math.min(
        ROLE_TEXT_MAX_FONT_SIZE,
        Math.max(ROLE_TEXT_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setBrainstormQuestionField = (key: BrainstormQuestionKey, value: string) => {
    updateActiveTabConfig({ [key]: value } as LibraryTabConfig);
  };

  const hasBrainstormQuestionContent = (draft: BrainstormQuestionDraft) => (
    BRAINSTORM_QUESTION_FIELDS.some((field) => draft[field.key].trim())
  );

  const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {
    const lines = BRAINSTORM_QUESTION_FIELDS
      .map((field) => `${field.label.replace(/^\d+\./, '')}：${draft[field.key].trim() || '未填写'}`)
      .join('\n');
    return [
      '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。',
      '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。',
      '',
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

  const getResizeEventScale = (element: HTMLElement) => {
    const rectWidth = element.getBoundingClientRect().width;
    const layoutWidth = element.offsetWidth;
    if (!rectWidth || !layoutWidth) return scale || 1;
    return rectWidth / layoutWidth || scale || 1;
  };

  const startLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const minWidth = SETTING_LIBRARY_LEFT_MIN_WIDTH;
    const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : SETTING_LIBRARY_LEFT_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryLeftWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
      setSettingLibraryLeftWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'left', nextWidth);
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
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const minWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH : SETTING_LIBRARY_RIGHT_MIN_WIDTH;
    const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH : SETTING_LIBRARY_RIGHT_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryRightWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (startX - moveEvent.clientX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
      setSettingLibraryRightWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'right', nextWidth);
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

  const startBrainstormPreviewWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const maxWidth = activeTab === BRAINSTORM_TAB ? BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH : BRAINSTORM_PREVIEW_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, brainstormPreviewWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX),
      );
      setBrainstormPreviewWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'brainstormPreview', nextWidth);
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
      data-no-modal-drag="true"
      onPointerDown={startLeftWidthResize}
      className="group relative z-30 -mx-1 flex w-4 shrink-0 cursor-col-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整左侧宽度"
    >
      <div className="my-3 w-px rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
    </div>
  );

  const rightResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startRightWidthResize}
      className="group relative z-30 -mx-1 flex w-4 shrink-0 cursor-col-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整右侧宽度"
    >
      <div className="my-3 w-px rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
    </div>
  );

  const brainstormPreviewResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startBrainstormPreviewWidthResize}
      className="group relative z-30 -mx-1 flex w-4 shrink-0 cursor-col-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整脑洞预览宽度"
    >
      <div className="my-3 w-px rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
    </div>
  );

  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;

  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
    setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab));
    setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, activeTab));
  }, [activeTab, storageKey]);

  useEffect(() => {
    const nextActiveTab = readActiveTab(storageKey, normalizedTabs, defaultActiveTab);
    setEntries(readNormalizedEntries(storageKey));
    setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    setTabConfigs(readTabConfigs(storageKey));
    setActiveTab(nextActiveTab);
    if (SETTING_LIBRARY_TABS.has(nextActiveTab)) {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, nextActiveTab));
      setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, nextActiveTab));
      setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, nextActiveTab));
    }
    setCustomRoleTypes(readCustomRoleTypes(storageKey));
    setCustomSettingTypes(readCustomSettingTypes(storageKey));
    setHiddenRoleTypes(readStringList(getHiddenRoleTypesStorageKey(storageKey)));
    setHiddenSettingTypes(readStringList(getHiddenSettingTypesStorageKey(storageKey)));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
    };
    const syncBrainstormRecycleEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== getBrainstormRecycleStorageKey(storageKey)) return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
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
    if ((!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) return;
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
    if (!settingCreateDialog) return;
    if (settingCreateDialog === 'category') {
      addSettingTypeByName(settingTitleDraft);
      setSettingTitleDraft('');
      setSettingCreateDialog(null);
      return;
    }
    addSetting(activeTab);
    setSettingCreateDialog(null);
  };

  const openSettingCreateDialog = (kind: 'category' | 'setting') => {
    setSettingTitleDraft('');
    setSettingCreateDialog(kind);
  };

  const smartImportSettings = () => {
    const sourceText = stripAiThinkingBlock(getLatestUsefulAiText(activeTab === SETTING_TAB ? aiOutput : (aiResult || aiOutput)));
    const taggedSegments = createTaggedSettingSegments(sourceText);
    const markdownSegments = createMarkdownSettingSegments(sourceText);
    const resolvedSettingTypes = new Set(settingTypeOptions);
    const segments = taggedSegments.length > 0
      ? taggedSegments.filter((segment) => resolvedSettingTypes.has(segment.type))
      : markdownSegments.length > 0
        ? markdownSegments
        : createSmartSettingSegments(sourceText);
    if (segments.length === 0) return;
    const importedEntries = segments.map((segment) => ({
      ...createWorkbenchLibraryEntry(SETTING_TAB, segment.title),
      content: stringifySettingContent({
        type: resolvedSettingTypes.has(segment.type) ? segment.type : UNCATEGORIZED_TYPE,
        body: segment.body,
      }),
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

  const clearAllSettings = () => {
    persist(entries.filter((entry) => entry.tab !== SETTING_TAB));
    if (activeTab === SETTING_TAB) setSelectedId(null);
    setIsClearSettingsConfirmOpen(false);
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
    const selectedEntry = entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === selectedBrainstormReaderId);
    if (!selectedEntry) return;
    const selectedText = getBrainstormEntryBody(selectedEntry);
    updateActiveTabConfig({
      loadedBrainstormId: selectedEntry.id,
      loadedBrainstormTitle: selectedEntry.title,
      loadedBrainstormText: selectedText,
    });
    closeBrainstormReader();
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

  useEffect(() => {
    if (activeTab !== SETTING_TAB) return;
    const linkedId = activeTabConfig.loadedBrainstormId;
    if (!linkedId) return;
    const linkedEntry = entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === linkedId);
    if (!linkedEntry) return;
    const latestText = getBrainstormEntryBody(linkedEntry);
    if (
      activeTabConfig.loadedBrainstormTitle === linkedEntry.title
      && activeTabConfig.loadedBrainstormText === latestText
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
    const linkedBrainstormText = getActiveLinkedBrainstormSnapshot().text.trim();
    if (linkedBrainstormText) {
      parts.push(linkedBrainstormText);
    }
    parts.push([
      '【用户要求】',
      userText.trim() || '（无额外要求）',
    ].join('\n'));
    return parts.join('\n\n');
  };

  const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {
    const selectedModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const promptCandidates = activeTab === ROLE_TAB
      ? rolePromptOptions
      : prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === (activeTab === SETTING_TAB ? PROMPT_SETTING_CATEGORY : activeTab));
    const isPromptDisabledForRequest = activeTab !== SETTING_TAB && Boolean(activeTabConfig.promptDisabled);
    const selectedPrompt = isPromptDisabledForRequest
      ? null
      : promptCandidates.find((prompt) => prompt.id === activeTabConfig.promptId) ?? promptCandidates[0] ?? null;
    const baseModelPrompt = isPromptDisabledForRequest
      ? ''
      : selectedPrompt?.content ?? `你是${activeTab}生成助手。请根据用户输入生成清晰、可编辑的中文内容。`;
    const modelPrompt = activeTab === SETTING_TAB
      ? ''
      : baseModelPrompt;
    const linkedBrainstorm = getActiveLinkedBrainstormSnapshot();
    const hasLinkedBrainstorm = activeTab === SETTING_TAB && Boolean(activeTabConfig.loadedBrainstormId || linkedBrainstorm.text.trim());
    const requestText = activeTab === SETTING_TAB && overrideText === undefined
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
        promptName: isPromptDisabledForRequest ? '已禁用提示词' : selectedPrompt?.name ?? '默认提示词',
        hasLinkedBrainstorm,
        linkedBrainstormTitle: linkedBrainstorm.title || '未关联脑洞',
        visibleUserText: text || '（无额外要求）',
        systemPrompt: modelPrompt,
        userContent: requestText,
      } satisfies LibraryAiRequestLog,
    };
  };

  const sendLibraryAiMessage = async (overrideText?: string) => {
    const text = (overrideText ?? aiInput).trim();
    if (isLibraryAiLoading || (!text && activeTab !== SETTING_TAB)) return;
    const { selectedModel, modelPrompt, requestText, log } = buildLibraryAiRequestPayload(text, overrideText);
    if (!selectedModel) {
      setAiOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
      return;
    }
    libraryAiAutoScrollRef.current = true;
    setLastLibraryAiRequestLog(log);
    const controller = new AbortController();
    const requestSeq = libraryAiRequestSeqRef.current + 1;
    libraryAiRequestSeqRef.current = requestSeq;
    libraryAiAbortRef.current = controller;
    setIsLibraryAiLoading(true);
    if (overrideText === undefined) setAiInput('');
    if (activeTab === BRAINSTORM_TAB) setAiResult('');
    const visibleUserText = text || '（无额外要求）';
    const pendingOutput = `${aiOutput.trim() ? `${aiOutput.trim()}\n\n` : ''}[[USER]]\n${visibleUserText}\n\n[[AI]]\n正在生成...`;
    const replacePendingOutput = (content: string) => (
      pendingOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, `[[AI]]\n${content}`)
    );
    setAiOutput(pendingOutput);
    const timeoutId = window.setTimeout(() => {
      controller.abort();
      if (libraryAiRequestSeqRef.current === requestSeq) {
        setAiOutput(replacePendingOutput('【错误】请求超时，请检查模型地址、网络，或换响应更快的模型后重试。'));
      }
    }, LIBRARY_AI_TIMEOUT_MS);
    try {
      const shouldStream = activeTab === SETTING_TAB || (activeTab === BRAINSTORM_TAB && brainstormStreamEnabled);
      let content = '';
      if (shouldStream) {
        let streamedContent = '';
        let reasoningContent = '';
        const streamStartedAt = performance.now();
        const getThinkingSeconds = () => Math.max(1, Math.round((performance.now() - streamStartedAt) / 1000));
        setAiResult('正在思考...');
        setAiOutput(replacePendingOutput('正在思考...'));
        content = await callModelStream({
          model: selectedModel,
          prompt: modelPrompt,
          userContent: requestText,
          recordType: 'generate',
          signal: controller.signal,
          timeoutMs: LIBRARY_AI_TIMEOUT_MS,
          onChunk: (chunk) => {
            if (libraryAiRequestSeqRef.current !== requestSeq) return;
            streamedContent += chunk;
            if (activeTab === BRAINSTORM_TAB) setAiResult(streamedContent.trimStart());
            setAiOutput(replacePendingOutput(formatAiThinkingResponse(
              streamedContent || '正在生成...',
              reasoningContent,
              getThinkingSeconds(),
              false,
            )));
          },
          onReasoning: (chunk) => {
            if (libraryAiRequestSeqRef.current !== requestSeq || streamedContent) return;
            reasoningContent += chunk;
            const temporaryOutput = formatAiThinkingResponse('', reasoningContent, getThinkingSeconds(), false);
            if (activeTab === BRAINSTORM_TAB) setAiResult(temporaryOutput);
            setAiOutput(replacePendingOutput(temporaryOutput));
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
          signal: controller.signal,
          timeoutMs: LIBRARY_AI_TIMEOUT_MS,
        });
      }
      if (libraryAiRequestSeqRef.current !== requestSeq) return;
      if (activeTab === BRAINSTORM_TAB) setAiResult(stripAiThinkingBlock(content));
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
    libraryAiRequestSeqRef.current += 1;
    libraryAiAbortRef.current?.abort();
    libraryAiAbortRef.current = null;
    setIsLibraryAiLoading(false);
    setTabConfigs((prev) => {
      const currentConfig = prev[activeTab] ?? {};
      const nextConfig: LibraryTabConfig = {
        ...currentConfig,
        aiInput: '',
        aiOutput: '',
        aiResult: '',
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

  const handleLibraryAiInputKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    void sendLibraryAiMessage();
  };

  const confirmBrainstormGenerate = () => {
    if (!brainstormGenerateDraft) return;
    const promptText = buildBrainstormPromptFromQuestions(brainstormGenerateDraft);
    setBrainstormGenerateDraft(null);
    void sendLibraryAiMessage(promptText);
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

  const moveLibraryEntryToType = (entryId: string, targetTab: string, targetType: string) => {
    const normalizedTargetTab = normalizeTabName(targetTab);
    let changed = false;
    const nextEntries = entries.map((entry) => {
      if (entry.id !== entryId || entry.tab !== normalizedTargetTab) return entry;

      if (normalizedTargetTab === ROLE_TAB) {
        const role = parseRoleContent(entry.content);
        if (role.type === targetType) return entry;
        changed = true;
        return {
          ...entry,
          content: stringifyRoleContent({
            ...role,
            type: targetType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(entry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }

      if (isSettingLikeTab(normalizedTargetTab)) {
        const setting = parseSettingContent(entry.content);
        if (setting.type === targetType) return entry;
        changed = true;
        return {
          ...entry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }

      return entry;
    });
    if (!changed) return;
    persist(nextEntries);
    if (normalizedTargetTab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(targetType));
      return;
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(targetType));
  };

  const handleLibraryEntryDragStart = (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    setDraggingLibraryEntry({ entryId: entry.id, tab: entry.tab, type });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', entry.id);
  };

  const handleLibraryCategoryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
  ) => {
    if (!draggingLibraryEntry || draggingLibraryEntry.tab !== tab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setLibraryDropTarget((current) => (
      current?.tab === tab && current.type === type ? current : { tab, type }
    ));
  };

  const handleLibraryCategoryDragLeave = (event: ReactDragEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return;
    setLibraryDropTarget(null);
  };

  const handleLibraryCategoryDrop = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
  ) => {
    event.preventDefault();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    setLibraryDropTarget(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== tab) return;
    moveLibraryEntryToType(entryId, tab, type);
  };

  const handleLibraryEntryDragEnd = () => {
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
  };

  const deleteEntry = (id: string) => {
    const target = entries.find((entry) => entry.id === id);
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

  const openEntryMenu = (event: MouseEvent<HTMLElement>, entry: WorkbenchLibraryEntry) => {
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

  const toggleRolePinned = (entry: WorkbenchLibraryEntry) => {
    if (entry.tab !== ROLE_TAB) return;
    const nextPinnedAt = entry.pinnedAt ? undefined : Date.now();
    persist(entries.map((item) => (
      item.id === entry.id
        ? { ...item, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
        : item
    )));
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
  const settingEntries = useMemo(() => entries.filter((entry) => entry.tab === SETTING_TAB), [entries]);
  const settingTypeOptions = useMemo(() => {
    const entryTypes = settingEntries.map((entry) => parseSettingContent(entry.content).type).filter(Boolean);
    const hidden = new Set(hiddenSettingTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_SETTING_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
      ...customSettingTypes.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
      ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
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
  const pendingDeleteDescription = pendingEntryDelete?.tab === BRAINSTORM_TAB
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
  const clearSettingsConfirmDialog = (
    <ConfirmDialog
      isOpen={isClearSettingsConfirmOpen}
      title="清空设定"
      description={`确定要清空全部设定吗？当前共有 ${settingEntries.length} 条设定会被删除，分类树会保留。`}
      confirmText="清空设定"
      cancelText="再看看"
      confirmVariant="danger"
      onClose={() => setIsClearSettingsConfirmOpen(false)}
      onConfirm={clearAllSettings}
    />
  );
  const brainstormEntries = entries.filter((entry) => entry.tab === BRAINSTORM_TAB);
  const selectedBrainstormReaderEntry = brainstormEntries.find((entry) => entry.id === selectedBrainstormReaderId) ?? null;
  const selectedBrainstormReaderContent = selectedBrainstormReaderEntry
    ? parseSettingContent(selectedBrainstormReaderEntry.content)
    : null;
  const selectedBrainstormReaderText = getBrainstormEntryBody(selectedBrainstormReaderEntry);
  const brainstormReaderModal = isBrainstormReaderOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormReader}
    >
      <div
        className="modal-sharp flex h-[72vh] w-[min(980px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">关联脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">左侧选择脑洞，右侧查看预览内容；关联内容会隐藏发送给 AI。</p>
          </div>
          <button
            onClick={closeBrainstormReader}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] bg-gray-50">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">脑洞目录</h4>
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">{brainstormEntries.length}</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {brainstormEntries.length === 0 && (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  暂无脑洞
                </div>
              )}
              {brainstormEntries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const contentText = parsed.body || entry.content || '';
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedBrainstormReaderId(entry.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      selectedBrainstormReaderId === entry.id
                        ? 'border-brand bg-[#FFF7ED] text-gray-900'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="truncate text-sm font-bold">{entry.title}</div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-400">
                      <span className="truncate">{parsed.type || BRAINSTORM_TYPE}</span>
                      <span className="shrink-0">{countTextWords(contentText)} 字</span>
                    </div>
                  </button>
                );
              })}
            </div>
</aside>
          <main className="flex min-h-0 flex-col p-5">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-base font-bold text-gray-900">
                  {selectedBrainstormReaderEntry?.title || '脑洞预览'}
                </h4>
                <p className="mt-1 text-xs text-gray-400">
                  {selectedBrainstormReaderEntry
                    ? `字数：${countTextWords(selectedBrainstormReaderText)} 字 · 评分：暂未评分 · ${selectedBrainstormReaderEntry.updatedAt}`
                    : '请选择左侧脑洞后查看内容'}
                </p>
              </div>
              {selectedBrainstormReaderContent && (
                <span className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                  {selectedBrainstormReaderContent.type || BRAINSTORM_TYPE}
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={selectedBrainstormReaderText}
              placeholder="这里会显示选中脑洞的预览内容。"
              className="editor-scrollbar min-h-0 flex-1 resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-700 outline-none"
            />
          </main>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            {selectedBrainstormReaderEntry
              ? `已关联：${selectedBrainstormReaderEntry.title} · ${countTextWords(selectedBrainstormReaderText)} 字`
              : '请选择一个脑洞后关联'}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={closeBrainstormReader}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmBrainstormReaderSelection}
              disabled={!selectedBrainstormReaderEntry}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              关联脑洞
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormRecycleModal = isBrainstormRecycleOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={() => {
        setIsClearBrainstormRecycleConfirmOpen(false);
        setIsBrainstormRecycleOpen(false);
      }}
    >
      <div
        className="modal-sharp flex h-[min(720px,86vh)] w-[min(760px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900">脑洞回收站</h3>
            <p className="mt-1 text-xs font-medium text-gray-400">{brainstormRecycleEntries.length} 个已删除脑洞，可以恢复或永久删除。</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClearBrainstormRecycleConfirmOpen(true)}
              disabled={brainstormRecycleEntries.length === 0}
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
            >
              清空回收站
            </button>
            <button
              type="button"
              onClick={() => {
                setIsClearBrainstormRecycleConfirmOpen(false);
                setIsBrainstormRecycleOpen(false);
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          {brainstormRecycleEntries.length === 0 ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm font-bold text-gray-400">
              暂无删除的脑洞
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {brainstormRecycleEntries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const body = parsed.body || entry.content;
                const entryWordCount = countTextWords(body);
                return (
                  <article key={entry.id} className="flex min-h-[170px] flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-bold text-gray-900">{entry.title}</h4>
                        <div className="mt-1 text-xs font-bold text-[#08AACE]">{entryWordCount}字</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-400">
                        {parsed.type || BRAINSTORM_TYPE}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap text-xs leading-5 text-gray-500">{body || '暂无内容'}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => restoreBrainstormEntry(entry.id)}
                        className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={() => permanentlyDeleteBrainstormEntry(entry.id)}
                        className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                      >
                        永久删除
                      </button>
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
  const clearBrainstormRecycleConfirmDialog = (
    <ConfirmDialog
      isOpen={isClearBrainstormRecycleConfirmOpen}
      title="清空脑洞回收站"
      description={`确定要清空 ${brainstormRecycleEntries.length} 个已删除脑洞吗？\n清空后无法恢复。`}
      confirmText="清空回收站"
      cancelText="再看看"
      confirmVariant="danger"
      onClose={() => setIsClearBrainstormRecycleConfirmOpen(false)}
      onConfirm={clearBrainstormRecycle}
    />
  );
  const brainstormPromptManagerModal = isBrainstormPromptManagerOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormPromptManager}
    >
      <div
        className="modal-sharp flex h-[70vh] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
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
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
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
                onClick={openBrainstormPromptCreate}
                className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-300 bg-white text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50/40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-300 bg-sky-50/60 text-4xl leading-none">
                  +
                </span>
                <span className="mt-6 text-base font-medium">创建提示词</span>
              </button>
            </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormPromptEditModal = (editingBrainstormPrompt || isCreatingBrainstormPrompt) ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormPromptEdit}
    >
      <div
        className="modal-sharp flex h-[min(820px,92vh)] w-[min(960px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isCreatingBrainstormPrompt ? '创建提示词' : '编辑提示词'}</h3>
            <p className="mt-1 text-xs text-gray-400">只会保存到“脑洞”分类下。</p>
          </div>
          <button
            onClick={closeBrainstormPromptEdit}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className={`xy-floating-field xy-floating-compact ${brainstormPromptDraft.name.trim() ? 'xy-has-value' : ''}`}>
            <input
              value={brainstormPromptDraft.name}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="名称"
            />
            <label>名称</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact ${brainstormPromptDraft.description.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={brainstormPromptDraft.description}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="editor-scrollbar h-24"
              placeholder="说明"
            />
            <label>说明</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact xy-floating-fill flex min-h-[260px] flex-1 flex-col ${brainstormPromptDraft.content.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={brainstormPromptDraft.content}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, content: event.target.value }))}
              className="editor-scrollbar min-h-[260px] flex-1"
              placeholder="提示词内容"
            />
            <label>提示词内容</label>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={closeBrainstormPromptEdit}
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
    </div>,
    document.body,
  ) : null;
  const brainstormGenerateConfirmModal = brainstormGenerateDraft ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={() => setBrainstormGenerateDraft(null)}
    >
      <div
        className="modal-sharp flex h-[min(680px,86vh)] w-[min(720px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">确认生成脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">确认后会把这些内容发送给当前模型，并在左侧输出区显示结果。</p>
          </div>
          <button
            onClick={() => setBrainstormGenerateDraft(null)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          onScroll={handleBrainstormConfirmScroll}
          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5 ${
            isBrainstormConfirmScrolling ? 'scrollbar-active' : ''
          }`}
        >
          <div className="space-y-3">
            {BRAINSTORM_QUESTION_FIELDS.map((field) => (
              <section key={field.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-900">{field.label}</div>
                <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                  {brainstormGenerateDraft[field.key].trim() || '未填写'}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setBrainstormGenerateDraft(null)}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirmBrainstormGenerate}
            disabled={isLibraryAiLoading}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认生成
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const settingCreateModal = settingCreateDialog ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={() => setSettingCreateDialog(null)}
    >
      <div
        className="modal-sharp flex w-[min(460px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {settingCreateDialog === 'category' ? '新建分类' : '新建设定'}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {settingCreateDialog === 'category' ? '输入分类名称，确认后会显示在左侧分类里。' : '输入设定名称，确认后会创建到未分类。'}
            </p>
          </div>
          <button
            onClick={() => setSettingCreateDialog(null)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className={`xy-floating-field xy-floating-outline-fixed ${settingTitleDraft.trim() ? 'xy-has-value' : ''}`}>
            <input
              autoFocus
              value={settingTitleDraft}
              onChange={(event) => setSettingTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') confirmSettingCreate();
              }}
              placeholder={settingCreateDialog === 'category' ? '输入分类名字' : '输入设定名字'}
            />
            <label>{settingCreateDialog === 'category' ? '分类名字' : '设定名字'}</label>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setSettingCreateDialog(null)}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirmSettingCreate}
            disabled={!settingTitleDraft.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  if (activeTab === ROLE_TAB) {
    const roleHistoryModal = selectedEntry && selectedRole && roleHistoryEntryId === selectedEntry.id ? createPortal(
      <div
        className="modal-sharp fixed inset-0 z-[10020] flex items-center justify-center bg-black/30"
        onClick={() => setRoleHistoryEntryId(null)}
      >
        <div
          className="modal-sharp flex h-[72vh] w-[860px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
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
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        <div
          className="grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 8px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
            <div className="flex shrink-0 gap-2">
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact min-w-0 flex-1 ${roleSearch.trim() ? 'xy-has-value' : ''}`}>
                <input
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="搜索角色..."
                />
                <label>搜索角色</label>
              </div>
              <button className="h-11 rounded-2xl bg-brand px-4 text-sm font-bold text-white">搜索</button>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
              {groupedRoles.map((group) => {
                const expanded = expandedRoleTypes.has(group.type);
                const tone = getRoleCategoryButtonTone(group.type);
                const isDropTarget = libraryDropTarget?.tab === ROLE_TAB && libraryDropTarget.type === group.type;
                return (
                  <div
                    key={group.type}
                    onDragOver={(event) => handleLibraryCategoryDragOver(event, ROLE_TAB, group.type)}
                    onDragLeave={handleLibraryCategoryDragLeave}
                    onDrop={(event) => handleLibraryCategoryDrop(event, ROLE_TAB, group.type)}
                    className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
                  >
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
                          <div
                            key={entry.id}
                            draggable
                            onDragStart={(event) => handleLibraryEntryDragStart(event, entry, group.type)}
                            onDragEnd={handleLibraryEntryDragEnd}
                            onContextMenu={(event) => openEntryMenu(event, entry)}
                            onClick={() => setSelectedId(entry.id)}
                            className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                              selectedEntry?.id === entry.id
                                ? 'border-brand bg-[#FFF7ED] text-gray-900'
                                : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                            } ${draggingLibraryEntry?.entryId === entry.id ? 'opacity-60' : ''}`}
                          >
                            <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                            <button
                              type="button"
                              draggable={false}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleRolePinned(entry);
                              }}
                              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                entry.pinnedAt
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-gray-100 text-gray-500 hover:bg-brand-light hover:text-brand'
                              }`}
                              title={entry.pinnedAt ? '取消置顶' : '置顶'}
                            >
                              {entry.pinnedAt ? '取消' : '置顶'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid shrink-0 grid-cols-[1fr_84px] gap-2">
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact min-w-0 ${roleTypeDraft.trim() ? 'xy-has-value' : ''}`}>
                <input
                  value={roleTypeDraft}
                  onChange={(event) => setRoleTypeDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addRoleType();
                  }}
                  placeholder="分类名字"
                />
                <label>分类名字</label>
              </div>
              <button
                onClick={addRoleType}
                className="h-11 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
              >
                新建分类
              </button>
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact min-w-0 ${roleNameDraft.trim() ? 'xy-has-value' : ''}`}>
                <input
                  value={roleNameDraft}
                  onChange={(event) => setRoleNameDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addRole('未分类');
                  }}
                  placeholder="角色名字"
                />
                <label>角色名字</label>
              </div>
              <button onClick={() => addRole('未分类')} className="h-11 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark">
                新建角色
              </button>
            </div>
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col overflow-hidden bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
            {selectedEntry && selectedRole ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                  <div className="flex min-h-full flex-col gap-8">
                    <div className="grid shrink-0 grid-cols-3 items-center gap-2">
                      <div className={`xy-floating-field xy-floating-outline-fixed min-w-0 ${selectedEntry.title.trim() ? 'xy-has-value' : ''}`}>
                        <input
                          value={selectedEntry.title}
                          onChange={(event) => updateSelectedRoleTitle(event.target.value)}
                          placeholder="角色名"
                        />
                        <label>角色名</label>
                      </div>
                      <label className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-1">
                        <span className="text-sm font-bold text-gray-700">分类</span>
                        <CapsuleSelect
                          value={selectedRole.type}
                          onChange={(value) => updateRole({ type: value })}
                          options={roleTypeOptions.map((type) => ({ value: type, label: type }))}
                          buttonClassName="h-11 rounded-xl px-4 text-sm"
                        />
                      </label>
                      <div className="min-w-0">
                        <div className="inline-flex h-11 w-full rounded-[20px] bg-slate-100 p-1">
                          {(['存活', '死亡'] as const).map((status) => {
                            const active = selectedRole.lifeStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateRole({ lifeStatus: status })}
                                className={`flex-1 rounded-2xl text-base font-black transition-colors ${
                                  active
                                    ? 'bg-white text-[#08AACE] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-with-bottom-count block ${selectedRole.background.trim() ? 'xy-has-value' : ''}`}>
                        <textarea
                          value={selectedRole.background}
                          onChange={(event) => updateRole({ background: event.target.value })}
                          className="editor-scrollbar h-[260px] text-sm leading-7 text-gray-700"
                          style={{ fontSize: roleTextFontSize }}
                        />
                        <label>角色背景</label>
                        <span className="xy-floating-count">{selectedRole.background.length} 字</span>
                      </div>
                      <div className="xy-floating-edge-tool">
                        <FontSizeStepper
                          value={roleTextFontSize}
                          min={ROLE_TEXT_MIN_FONT_SIZE}
                          max={ROLE_TEXT_MAX_FONT_SIZE}
                          onChange={setRoleTextFontSize}
                          ariaLabel="角色背景字号"
                        />
                      </div>
                    </div>

                    <div className="relative flex min-h-0 flex-1 flex-col">
                      <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count flex min-h-0 flex-1 flex-col ${selectedRole.status.trim() ? 'xy-has-value' : ''}`}>
                        <textarea
                          value={selectedRole.status}
                          onChange={(event) => updateRole({ status: event.target.value })}
                          placeholder="用于记录当前阶段的角色状态、心境、立场与关系变化"
                          className="editor-scrollbar min-h-[180px] flex-1 text-sm leading-7 text-gray-700"
                          style={{ fontSize: roleTextFontSize }}
                        />
                        <label>角色状态</label>
                        <span className="xy-floating-count">{selectedRole.status.length} 字</span>
                      </div>
                      <div className="xy-floating-edge-tool">
                        <FontSizeStepper
                          value={roleTextFontSize}
                          min={ROLE_TEXT_MIN_FONT_SIZE}
                          max={ROLE_TEXT_MAX_FONT_SIZE}
                          onChange={setRoleTextFontSize}
                          ariaLabel="角色状态字号"
                        />
                      </div>
                    </div>

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
            <div className="flex items-center gap-3">
              <h3 className="shrink-0 text-base font-bold text-gray-900">角色生成</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className={`grid ${PROMPT_SELECT_COLUMNS} items-start gap-2 text-sm text-gray-500`}>
                <CapsuleSelect
                  floatingLabel="模型"
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ modelId: value })}
                  options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'models' })}
                />
                <div aria-hidden="true" className="mt-2 h-12 w-[52px]" />
              </div>
              <div className={`grid ${PROMPT_SELECT_COLUMNS} items-start gap-2 text-sm text-gray-500`}>
                <CapsuleSelect
                  floatingLabel="提示词"
                  value={activeTabConfig.promptId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ promptId: value })}
                  disabled={Boolean(activeTabConfig.promptDisabled)}
                  disabledLabel="提示词已禁用"
                  className="min-w-0"
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  options={rolePromptOptions.length === 0 ? [{ value: '', label: '暂无设定提示词', disabled: true }] : rolePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'prompts', category: PROMPT_SETTING_CATEGORY })}
                />
                <PromptDisableButton
                  disabled={Boolean(activeTabConfig.promptDisabled)}
                  onToggle={() => updateActiveTabConfig({ promptDisabled: !activeTabConfig.promptDisabled })}
                />
              </div>
            </div>
            <div className={`xy-floating-field xy-floating-label-fixed xy-floating-fill xy-floating-with-bottom-count mt-5 min-h-0 flex-1 ${aiOutput.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                value={aiOutput}
                onChange={(event) => setAiOutput(event.target.value)}
                placeholder="AI输出框"
                className="editor-scrollbar"
              />
              <label>AI输出框</label>
              <span className="xy-floating-count">{countTextWords(aiOutput)} 字</span>
            </div>
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <div className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${aiInput.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                ref={libraryAiInputRef}
                rows={1}
                value={aiInput}
                onChange={(event) => {
                  setAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={handleLibraryAiInputKeyDown}
                placeholder="输入对话指令..."
                className="scrollbar-hidden"
              />
              <label>请输入要求</label>
              <div className="xy-ai-inline-actions">
                <button
                  type="button"
                  onClick={() => void sendLibraryAiMessage()}
                  disabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                  className="xy-ai-inline-send"
                >
                  <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                </button>
                <button
                  type="button"
                  onClick={stopLibraryAiMessage}
                  disabled={!isLibraryAiLoading}
                  className="xy-ai-inline-stop"
                >
                  <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                </button>
              </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  onClick={clearLibraryAiDialog}
                  disabled={!hasLibraryAiContent && !isLibraryAiLoading}
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
    const currentBrainstormBody = activeIsBrainstorm ? currentSelectedSetting?.body ?? '' : '';
    const currentBrainstormPreviewWordCount = activeIsBrainstorm ? countTextWords(currentBrainstormBody) : 0;
    const brainstormLayoutLeftWidth = Math.min(settingLibraryLeftWidth, BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH);
    const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);
    const brainstormLayoutRightWidth = Math.max(
      BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
      Math.min(settingLibraryRightWidth, BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH),
    );
    const currentLinkedBrainstorm = getActiveLinkedBrainstormSnapshot();
    const hasLinkedBrainstorm = Boolean(activeTabConfig.loadedBrainstormId || currentLinkedBrainstorm.text.trim());
    const loadedBrainstormWordCount = countTextWords(currentLinkedBrainstorm.text);
    const latestUsefulAiOutput = activeIsBrainstorm ? getLatestUsefulAiText(aiResult || aiOutput) : aiOutput.trim();
    const smartImportLocked = Boolean(activeTabConfig.smartImportLocked);
    const groupedSettingEntries = activeSettingTypeOptions.map((type) => ({
      type,
      entries: currentEntries.filter((entry) => {
        const parsed = parseSettingContent(entry.content);
        if (activeIsBrainstorm) return (parsed.type || BRAINSTORM_TYPE) === type || parsed.type === UNCATEGORIZED_TYPE;
        return parsed.type === type;
      }),
    }));
    const panelTitle = activeIsSettingLike ? `${activeTab}生成` : `${activeTab}生成`;
    const promptCategory = activeTab === SETTING_TAB ? PROMPT_SETTING_CATEGORY : activeTab;
    const activeTabPrompts = prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === promptCategory);
    const activePromptId = activeTabPrompts.some((prompt) => prompt.id === activeTabConfig.promptId)
      ? activeTabConfig.promptId
      : activeTabPrompts[0]?.id ?? '';
    const showPromptDisableButton = activeTab !== SETTING_TAB;
    const rightSelectColumns = MODEL_SELECT_COLUMNS;
    const brainstormOutputValue = activeIsBrainstorm && isLibraryAiLoading && !aiResult
      ? `正在生成${'.'.repeat(loadingDotCount)}`
      : aiResult || latestUsefulAiOutput;
    const brainstormOutputWordCount = activeIsBrainstorm ? countTextWords(brainstormOutputValue) : 0;
    const previewAiRequestText = activeIsBrainstorm
      ? buildBrainstormPromptFromQuestions(brainstormQuestionDraft)
      : aiInput.trim();
    const previewAiRequestLog = activeTab === SETTING_TAB || activeIsBrainstorm
      ? buildLibraryAiRequestPayload(previewAiRequestText, activeIsBrainstorm ? previewAiRequestText : undefined).log
      : null;
    const visibleAiRequestLog = previewAiRequestLog ?? lastLibraryAiRequestLog;
    const libraryAiLogModal = isLibraryAiLogOpen && visibleAiRequestLog ? (
      <LibraryAiLogShell
        id={`workbench_library_ai_log_${activeTab}`}
        subtitle="当前预览：点击发送后会按这里的内容发给 AI"
        onClose={() => setIsLibraryAiLogOpen(false)}
      >
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">链路</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.tab}生成</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">模型</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.modelName}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">提示词</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.promptName}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">脑洞关联</div>
                  <div className={`mt-1 font-bold ${visibleAiRequestLog.hasLinkedBrainstorm ? 'text-brand' : 'text-slate-500'}`}>
                    {visibleAiRequestLog.hasLinkedBrainstorm ? visibleAiRequestLog.linkedBrainstormTitle : '未关联'}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">用户可见输入</div>
                  <div className="mt-1 break-words font-bold text-slate-800">{visibleAiRequestLog.visibleUserText}</div>
                </div>
              </div>
            </aside>
            <div className="min-h-0 overflow-y-auto p-5">
              <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                这里展示的是实际发给 AI 的完整内容。关联脑洞时，脑洞正文会隐藏拼进用户内容；未关联时不会出现脑洞段落。
              </div>
              {visibleAiRequestLog.systemPrompt && (
                <section className="mb-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-900">System Prompt</h3>
                  <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                    {visibleAiRequestLog.systemPrompt}
                  </div>
                </section>
              )}
              <section>
                <h3 className="mb-2 text-sm font-bold text-slate-900">User Content</h3>
                <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                  {visibleAiRequestLog.userContent || '空内容'}
                </div>
              </section>
              {lastLibraryAiRequestLog && (
                <section className="mt-5">
                  <h3 className="mb-2 text-sm font-bold text-slate-900">最近一次实际发送</h3>
                  <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                    {[
                      `时间：${lastLibraryAiRequestLog.createdAt}`,
                      `模型：${lastLibraryAiRequestLog.modelName}`,
                      `提示词：${lastLibraryAiRequestLog.promptName}`,
                      `脑洞：${lastLibraryAiRequestLog.hasLinkedBrainstorm ? lastLibraryAiRequestLog.linkedBrainstormTitle : '未关联'}`,
                      '',
                      ...(lastLibraryAiRequestLog.systemPrompt
                        ? ['【System Prompt】', lastLibraryAiRequestLog.systemPrompt, '']
                        : []),
                      '【User Content】',
                      lastLibraryAiRequestLog.userContent || '空内容',
                    ].join('\n')}
                  </div>
                </section>
              )}
            </div>
          </div>
      </LibraryAiLogShell>
    ) : null;
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {deleteConfirmDialog}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {libraryAiLogModal}
        {clearSettingsConfirmDialog}
        {brainstormReaderModal}
        {brainstormRecycleModal}
        {clearBrainstormRecycleConfirmDialog}
        {brainstormPromptManagerModal}
        {brainstormPromptEditModal}
        {brainstormGenerateConfirmModal}
        {settingCreateModal}
        <div
          className="grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: activeIsBrainstorm
              ? `${brainstormLayoutLeftWidth}px 8px ${brainstormLayoutPreviewWidth}px 8px minmax(${BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH}px,1fr) 8px ${brainstormLayoutRightWidth}px`
              : settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 8px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          {!activeIsBrainstorm && (
            <div className="flex h-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => openSettingCreateDialog('category')}
                className="min-w-0 flex-1 bg-brand px-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
              >
                新建分类
              </button>
              <button
                type="button"
                onClick={() => openSettingCreateDialog('setting')}
                className="min-w-0 flex-1 border-l border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
              >
                新建设定
              </button>
            </div>
          )}

          <div className={`${activeIsBrainstorm ? 'mt-0' : 'mt-5'} min-h-0 flex-1 overflow-y-auto space-y-2`}>
            {(activeIsSettingLike ? groupedSettingEntries : [{ type: UNCATEGORIZED_TYPE, entries: currentEntries }]).map((group) => {
              const expanded = expandedSettingTypes.has(group.type);
              const isDropTarget = libraryDropTarget?.tab === activeTab && libraryDropTarget.type === group.type;
              return (
                <div
                  key={group.type}
                  onDragOver={(event) => handleLibraryCategoryDragOver(event, activeTab, group.type)}
                  onDragLeave={handleLibraryCategoryDragLeave}
                  onDrop={(event) => handleLibraryCategoryDrop(event, activeTab, group.type)}
                  className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
                >
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
                        <p className="px-3 py-4 text-xs text-gray-400">{activeTab === SETTING_TAB ? '暂无设定' : `该分类下暂无${activeTab}`}</p>
                      ) : group.entries.map((entry) => {
                        const parsed = activeIsSettingLike ? parseSettingContent(entry.content) : null;
                        const entryWordCount = countTextWords(parsed ? parsed.body : entry.content);
                        return (
                          <button
                            key={entry.id}
                            draggable
                            onDragStart={(event) => handleLibraryEntryDragStart(event, entry, parsed?.type ?? group.type)}
                            onDragEnd={handleLibraryEntryDragEnd}
                            onContextMenu={(event) => openEntryMenu(event, entry)}
                            onClick={() => setSelectedId(entry.id)}
                            className={`group w-full rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                              currentSelectedEntry?.id === entry.id
                                ? 'border-brand bg-[#FFF7ED] text-gray-900'
                                : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                            } ${draggingLibraryEntry?.entryId === entry.id ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-bold">{entry.title}</span>
                              <span className="flex shrink-0 items-center gap-2">
                                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-[#08AACE]">
                                  {entryWordCount}字
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
          {activeTab === SETTING_TAB && (
            <div className="shrink-0 border-t border-gray-100 bg-gray-50 pt-3">
              <button
                type="button"
                onClick={() => setIsClearSettingsConfirmOpen(true)}
                disabled={settingEntries.length === 0}
                className="flex h-11 w-full items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
              >
                清空设定
              </button>
            </div>
          )}
          {activeIsBrainstorm && (
            <div className="shrink-0 border-t border-gray-100 bg-gray-50 pt-3">
              <button
                type="button"
                onClick={() => setIsBrainstormRecycleOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#7BDDF0] bg-[#EAFBFF] px-4 py-3 text-left shadow-sm transition-colors hover:border-brand/50 hover:bg-brand-light"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-gray-800">脑洞回收站</div>
                  <div className="mt-0.5 text-[11px] font-medium text-gray-400">
                    {brainstormRecycleEntries.length} 个已删除脑洞
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#08AACE]">
                  打开
                </span>
              </button>
            </div>
          )}
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
          {activeIsBrainstorm ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="relative min-h-0 flex-1">
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${currentBrainstormBody.trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    value={currentBrainstormBody}
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
                  <label>脑洞预览</label>
                  <span className="xy-floating-count">{currentBrainstormPreviewWordCount} 字</span>
                </div>
                <div className="xy-floating-edge-tool">
                  <FontSizeStepper
                    value={brainstormPreviewFontSize}
                    min={BRAINSTORM_PREVIEW_MIN_FONT_SIZE}
                    max={BRAINSTORM_PREVIEW_MAX_FONT_SIZE}
                    onChange={setBrainstormPreviewFontSize}
                    ariaLabel="脑洞预览字号"
                  />
                </div>
              </div>
            </div>
          ) : currentSelectedEntry ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
                <div className="w-[220px] max-w-full">
                  <div className={`xy-floating-field xy-floating-outline-fixed ${currentSelectedEntry.title.trim() ? 'xy-has-value' : ''}`}>
                    <input
                      value={currentSelectedEntry.title}
                      onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                      placeholder="设定名"
                    />
                    <label>设定名</label>
                  </div>
                </div>
              </div>
              <div className="relative min-h-0 flex-1">
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content).trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    value={currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content}
                    onChange={(event) => updateEntry(currentSelectedEntry.id, {
                      content: currentSelectedSetting
                        ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value })
                        : event.target.value,
                    })}
                    placeholder="这里显示选中的设定内容，也可以直接编辑。"
                    className="editor-scrollbar text-sm leading-7 text-gray-700"
                    style={{ fontSize: settingPreviewFontSize }}
                  />
                  <label>设定预览</label>
                  <span className="xy-floating-count">{countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} 字</span>
                </div>
                <div className="xy-floating-edge-tool">
                  <FontSizeStepper
                    value={settingPreviewFontSize}
                    min={SETTING_PREVIEW_MIN_FONT_SIZE}
                    max={SETTING_PREVIEW_MAX_FONT_SIZE}
                    onChange={setSettingPreviewFontSize}
                    ariaLabel="设定预览字号"
                  />
                </div>
              </div>
              <div className="mt-6 flex shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => confirmDeleteEntry(currentSelectedEntry)}
                  className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
                <div className="w-[220px] max-w-full">
                  <div className="xy-floating-field xy-floating-outline-fixed">
                    <input
                      readOnly
                      value=""
                      placeholder="未选择设定"
                    />
                    <label>设定名</label>
                  </div>
                </div>
              </div>
              <div className="relative min-h-0 flex-1">
                <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
                  <textarea
                    readOnly
                    value=""
                    placeholder="这里会显示选中的设定内容。"
                    className="editor-scrollbar text-sm leading-7 text-gray-700"
                    style={{ fontSize: settingPreviewFontSize }}
                  />
                  <label>设定预览</label>
                  <span className="xy-floating-count">0 字</span>
                </div>
                <div className="xy-floating-edge-tool">
                  <FontSizeStepper
                    value={settingPreviewFontSize}
                    min={SETTING_PREVIEW_MIN_FONT_SIZE}
                    max={SETTING_PREVIEW_MAX_FONT_SIZE}
                    onChange={setSettingPreviewFontSize}
                    ariaLabel="设定预览字号"
                  />
                </div>
              </div>
            </div>
          )}
          </main>

          {activeIsBrainstorm && brainstormPreviewResizeHandle}

          {activeIsBrainstorm && (
            <section className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
              <div className="flex h-[56px] shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <h3 className="text-base font-bold text-gray-900">脑洞输出框</h3>
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
                <div className="relative min-h-0 flex-1">
                  <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${brainstormOutputValue.trim() ? 'xy-has-value' : ''}`}>
                    <textarea
                      value={brainstormOutputValue}
                      onChange={(event) => setAiResult(event.target.value)}
                      placeholder="这里显示本次 AI 生成的脑洞设定正文，保存脑洞时只保存这里的内容。"
                      className="editor-scrollbar text-sm leading-6 text-gray-700"
                      style={{ fontSize: brainstormOutputFontSize }}
                    />
                    <label>脑洞输出框</label>
                    <span className="xy-floating-count">{brainstormOutputWordCount} 字</span>
                  </div>
                  <div className="xy-floating-edge-tool">
                    <FontSizeStepper
                      value={brainstormOutputFontSize}
                      min={BRAINSTORM_OUTPUT_MIN_FONT_SIZE}
                      max={BRAINSTORM_OUTPUT_MAX_FONT_SIZE}
                      onChange={setBrainstormOutputFontSize}
                      ariaLabel="脑洞输出字号"
                    />
                  </div>
                </div>
                <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-3">
                  <div className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${aiInput.trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    ref={libraryAiInputRef}
                    rows={1}
                    value={aiInput}
                    onChange={(event) => {
                      setAiInput(event.target.value);
                      resizeFloatingAiTextarea(event.currentTarget);
                    }}
                    onKeyDown={handleLibraryAiInputKeyDown}
                    placeholder="输入对话指令..."
                    className="scrollbar-hidden"
                  />
                  <label>请输入要求</label>
                  <div className="xy-ai-inline-actions">
                    <button
                      type="button"
                      onClick={() => void sendLibraryAiMessage()}
                      disabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                      className="xy-ai-inline-send"
                    >
                      <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                    </button>
                    <button
                      type="button"
                      onClick={stopLibraryAiMessage}
                      disabled={!isLibraryAiLoading}
                      className="xy-ai-inline-stop"
                    >
                      <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                    </button>
                  </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="xy-capsule-group">
                      <button
                        onClick={() => saveBrainstormOutput(currentSelectedEntry?.id)}
                        disabled={!currentSelectedEntry || !latestUsefulAiOutput}
                        className="xy-capsule-button"
                      >
                        替换脑洞
                      </button>
                      <button
                        onClick={saveBrainstormOutputAsNew}
                        disabled={!latestUsefulAiOutput}
                        className="xy-capsule-button"
                      >
                        保存为新脑洞
                      </button>
                      </div>
                      <button
                        onClick={clearLibraryAiDialog}
                        className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-500 shadow-sm hover:border-red-300 hover:bg-red-50"
                      >
                        清空
                      </button>
                      <label className="xy-animated-checkbox shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <input
                          type="checkbox"
                          checked={brainstormStreamEnabled}
                          onChange={(event) => updateActiveTabConfig({ brainstormStreamEnabled: event.target.checked })}
                        />
                        <span className="xy-animated-checkbox-box">
                          <svg viewBox="0 0 12 10" height="10px" width="12px" aria-hidden="true">
                            <polyline points="1.5 6 4.5 9 10.5 1" />
                          </svg>
                        </span>
                        <span>流式输出</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {settingLibraryMode === 'advanced' && (
          <>
          {rightResizeHandle}
          <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="shrink-0 text-base font-bold text-gray-900">{panelTitle}</h3>
              </div>
              {(activeTab === SETTING_TAB || activeIsBrainstorm) && (
                <button
                  type="button"
                  onClick={() => setIsLibraryAiLogOpen(true)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand"
                >
                  输出日志
                </button>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div className={`grid ${showPromptDisableButton ? PROMPT_SELECT_COLUMNS : rightSelectColumns} items-start gap-2 text-sm text-gray-500`}>
                <CapsuleSelect
                  floatingLabel="模型"
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ modelId: value })}
                  options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'models' })}
                />
                {showPromptDisableButton && <div aria-hidden="true" className="mt-2 h-12 w-[52px]" />}
              </div>
              <div className={`grid ${showPromptDisableButton ? PROMPT_SELECT_COLUMNS : rightSelectColumns} items-start gap-2 text-sm text-gray-500`}>
                <CapsuleSelect
                  floatingLabel="提示词"
                  value={activePromptId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ promptId: value })}
                  disabled={showPromptDisableButton && Boolean(activeTabConfig.promptDisabled)}
                  disabledLabel={showPromptDisableButton ? '提示词已禁用' : undefined}
                  className="min-w-0"
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  options={activeTabPrompts.length === 0 ? [{ value: '', label: `暂无${promptCategory}提示词`, disabled: true }] : activeTabPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({
                    type: 'prompts',
                    category: activeIsBrainstorm
                      ? BRAINSTORM_TAB
                      : activeTab === SETTING_TAB
                        ? PROMPT_SETTING_CATEGORY
                      : activeTab,
                  })}
                />
                {showPromptDisableButton && (
                  <PromptDisableButton
                    disabled={Boolean(activeTabConfig.promptDisabled)}
                    onToggle={() => updateActiveTabConfig({ promptDisabled: !activeTabConfig.promptDisabled })}
                  />
                )}
              </div>
            </div>
          </div>
          {activeIsBrainstorm ? (
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex min-h-full flex-col gap-3">
                  {BRAINSTORM_QUESTION_FIELDS.map((field, index) => {
                    const isLastField = index === BRAINSTORM_QUESTION_FIELDS.length - 1;
                    const questionRows = getBrainstormQuestionRows(brainstormQuestionDraft[field.key]);
                    return (
                    <div key={field.key} className={`${isLastField ? 'flex min-h-[132px] flex-1 flex-col' : 'block'} text-sm font-bold text-gray-700`}>
                      <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${isLastField ? 'flex flex-1 flex-col' : ''} ${brainstormQuestionDraft[field.key].trim() ? 'xy-has-value' : ''}`}>
                      <textarea
                        value={brainstormQuestionDraft[field.key]}
                        onChange={(event) => setBrainstormQuestionField(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        rows={1}
                        className={`${isLastField ? 'min-h-0 flex-1' : ''} font-bold leading-5`}
                        style={{
                          height: isLastField ? undefined : `${Math.max(52, questionRows * 20 + 32)}px`,
                          overflowY: isLastField || questionRows >= 4 ? 'auto' : 'hidden',
                        }}
                      />
                      <label>{field.label}</label>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={openBrainstormGenerateConfirm}
                  disabled={isLibraryAiLoading}
                  className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLibraryAiLoading ? '生成中...' : '生成'}
                </button>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 p-4">
              <div
                ref={libraryAiOutputRef}
                onScroll={handleLibraryAiOutputScroll}
                className="editor-scrollbar h-full w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700"
              >
                {aiChatTurns.length === 0 ? (
                  <div className="text-gray-400">{`可以在这里生成${activeTab}，并继续通过对话细化。`}</div>
                ) : (
                  <div className="space-y-3">
                    {aiChatTurns.map((turn, index) => (
                      <div key={`${turn.role}-${index}`} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
          )}
          {!activeIsBrainstorm && (
          <div className="border-t border-gray-100 p-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {activeTab === SETTING_TAB && (
                <div className="mb-3 flex items-center gap-2">
                  {hasLinkedBrainstorm ? (
                    <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                          setIsBrainstormReaderOpen(true);
                        }}
                        className="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                      >
                        已关联脑洞
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateActiveTabConfig({
                            loadedBrainstormId: null,
                            loadedBrainstormTitle: '',
                            loadedBrainstormText: '',
                          });
                          setSelectedBrainstormReaderId(null);
                        }}
                        className="flex h-full w-10 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600"
                        title="取消关联"
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
                      className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                    >
                      关联脑洞
                    </button>
                  )}
                  {hasLinkedBrainstorm && (
                    <div className="text-xs font-black leading-5 text-[#08AACE]">
                      已关联：{loadedBrainstormWordCount}字
                    </div>
                  )}
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                {activeTab === SETTING_TAB ? (
                  <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={smartImportSettings}
                      disabled={smartImportLocked}
                      className="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
                    >
                      智能导入设定
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveTabConfig({ smartImportLocked: !smartImportLocked })}
                      className={`flex h-full w-10 shrink-0 items-center justify-center border-l border-gray-200 transition-colors ${
                        smartImportLocked
                          ? 'bg-white text-amber-500 hover:bg-amber-50'
                          : 'bg-white text-amber-500 hover:bg-amber-50'
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
                      updateEntry(currentSelectedEntry.id, { title: currentSelectedEntry.title || `新建${activeTab}` });
                    }}
                    className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                  >
                    保存为新{activeTab}
                  </button>
                )}
                <button
                  onClick={clearLibraryAiDialog}
                  disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                  className="h-10 w-1/3 rounded-lg border border-red-500 bg-red-500 px-3 text-sm font-bold text-white hover:bg-red-600 disabled:border-red-200 disabled:bg-red-100 disabled:text-red-300"
                >
                  清空
                </button>
              </div>
              <div className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${aiInput.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                ref={libraryAiInputRef}
                rows={1}
                value={aiInput}
                onChange={(event) => {
                  setAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={handleLibraryAiInputKeyDown}
                placeholder="输入对话指令..."
                className="scrollbar-hidden"
              />
              <label>请输入要求</label>
              <div className="xy-ai-inline-actions">
                <button
                  type="button"
                  onClick={() => void sendLibraryAiMessage()}
                  disabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                  className="xy-ai-inline-send"
                >
                  <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                </button>
                <button
                  type="button"
                  onClick={stopLibraryAiMessage}
                  disabled={!isLibraryAiLoading}
                  className="xy-ai-inline-stop"
                >
                  <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                </button>
              </div>
              </div>
            </div>
          </div>
          )}
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
    const getVolumeDisplayIndex = (volumeId: number) => {
      const index = volumes.findIndex((item) => item.id === volumeId);
      return index >= 0 ? index + 1 : 1;
    };
    const getOutlineChapterFrameTitle = (volume: Volume, chapter: Chapter) => (
      isDetailOutlineTab
        ? `第${chapter.serialNumber}章细纲（第${getVolumeDisplayIndex(volume.id)}卷）`
        : `第${chapter.serialNumber}章概要（第${getVolumeDisplayIndex(volume.id)}卷）`
    );
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
      const cleanDraft = stripAiThinkingBlock(outlinePreviewDraft);
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
    const activeOutlinePrompt = outlinePromptOptions.find((prompt) => prompt.id === activeOutlinePromptId) ?? outlinePromptOptions[0] ?? null;
    const selectedOutlineModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const outlineAiInput = activeTabConfig.outlineAiInput ?? '';
    const setOutlineAiInput = (value: string) => updateActiveTabConfig({ outlineAiInput: value });
    const outlinePreviewDraftContent = stripAiThinkingBlock(outlinePreviewDraft);
    const outlineDraftFrameTitle = safeOutlineSelectionType === 'volume' && selectedOutlineVolume
      ? `${selectedOutlineVolume.name}概要`
      : selectedOutlineChapter
        ? getOutlineChapterFrameTitle(selectedOutlineChapter.volume, selectedOutlineChapter.chapter)
        : outlinePreviewTitle;
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
    const getOutlineDefaultPrompt = () => (
      isDetailOutlineTab
        ? '请根据所选章节正文生成细纲。'
        : '请根据所选章节正文生成章节概要。'
    );
    const buildOutlineAiRequestLog = (
      userText: string,
      contextText: string,
      promptText: string,
      createdAt = '当前预览',
    ): LibraryAiRequestLog => ({
      createdAt,
      tab: isDetailOutlineTab ? '生成细纲' : '章节概要',
      modelName: selectedOutlineModel?.name ?? '未选择模型',
      promptName: activeOutlinePrompt?.name ?? '默认提示词',
      hasLinkedBrainstorm: false,
      linkedBrainstormTitle: '',
      visibleUserText: userText || '空内容',
      systemPrompt: promptText,
      userContent: userText,
      contextTitle: getOutlineContextTitle(),
      contextText,
      contextWordCount: countTextWords(contextText),
    });
    const previewOutlineContextText = getSelectedOutlineContext();
    const previewOutlinePromptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
    const visibleOutlineAiRequestLog = (
      isLibraryAiLogOpen
        ? buildOutlineAiRequestLog(outlineAiInput.trim(), previewOutlineContextText, previewOutlinePromptText)
        : null
    ) ?? lastLibraryAiRequestLog;
    const outlineAiLogModal = isLibraryAiLogOpen && visibleOutlineAiRequestLog ? (
      <LibraryAiLogShell
        id={`workbench_library_ai_log_${activeTab}`}
        subtitle="当前预览：点击发送后会按这里的内容发给 AI"
        onClose={() => setIsLibraryAiLogOpen(false)}
      >
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">链路</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.tab}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">模型</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.modelName}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">提示词</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.promptName}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">关联正文</div>
                  <div className="mt-1 font-bold text-brand">{visibleOutlineAiRequestLog.contextTitle}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{visibleOutlineAiRequestLog.contextWordCount ?? 0} 字</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">请输入内容</div>
                  <div className="mt-1 break-words font-bold text-slate-800">{visibleOutlineAiRequestLog.visibleUserText}</div>
                </div>
              </div>
            </aside>
            <div className="min-h-0 overflow-y-auto p-5">
              <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                这里展示实际发送给 AI 的提示词、所选章节正文和输入内容。
              </div>
              <section className="mb-4">
                <h3 className="mb-2 text-sm font-bold text-slate-900">System Prompt</h3>
                <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                  {visibleOutlineAiRequestLog.systemPrompt || '空内容'}
                </div>
              </section>
              <section className="mb-4">
                <h3 className="mb-2 text-sm font-bold text-slate-900">Context</h3>
                <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                  {visibleOutlineAiRequestLog.contextText || '未读取到正文内容'}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-bold text-slate-900">请输入内容</h3>
                <div className="ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4">
                  {visibleOutlineAiRequestLog.userContent || '空内容'}
                </div>
              </section>
            </div>
          </div>
      </LibraryAiLogShell>
    ) : null;
    const sendOutlineAiMessage = async () => {
      const userText = outlineAiInput.trim();
      if (!userText || isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setOutlinePreviewDraft('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getSelectedOutlineContext();
      const promptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastLibraryAiRequestLog(buildOutlineAiRequestLog(userText, contextText, promptText, new Date().toLocaleString('zh-CN')));
      const controller = new AbortController();
      libraryAiAbortRef.current = controller;
      setIsLibraryAiLoading(true);
      setOutlinePreviewDraft('正在思考...');
      try {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        content = await callModelStream({
          model: selectedOutlineModel,
          prompt: promptText,
          userContent: userText,
          chapterContext: [
            contextText ? `【所选章节正文】\n${contextText}` : '【所选章节正文】\n当前没有读取到正文内容。',
          ].join('\n\n'),
          recordType: 'stream',
          signal: controller.signal,
          onReasoning: (chunk) => {
            reasoningContent += chunk;
            setOutlinePreviewDraft(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
          },
          onChunk: (chunk) => {
            content += chunk;
            setOutlinePreviewDraft(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
          },
        });
        if (reasoningContent.trim()) {
          content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
        }
        setOutlinePreviewDraft(content);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setOutlinePreviewDraft((value) => value.trim() || '【已中止】本次生成已停止。');
        } else {
          const message = error instanceof Error ? error.message : '模型请求失败。';
          setOutlinePreviewDraft(`【错误】${message}`);
        }
      } finally {
        if (libraryAiAbortRef.current === controller) libraryAiAbortRef.current = null;
        setIsLibraryAiLoading(false);
      }
    };
    const stopOutlineAiMessage = () => {
      libraryAiAbortRef.current?.abort();
      setIsLibraryAiLoading(false);
    };
    const clearOutlinePreviewDraft = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        updateVolumeSummary(selectedOutlineVolume.name, '');
        setOutlinePreviewDraft('');
        return;
      }
      if (selectedOutlineChapter) {
        updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, '');
        setOutlinePreviewDraft('');
      }
    };

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) && renderTopTabs()}
        {deleteConfirmDialog}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {outlineAiLogModal}
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
          {!isDetailOutlineTab && (
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{outlinePreviewTitle}</h3>
              </div>
            </div>
          )}
          <div className={`editor-scrollbar min-h-0 flex-1 overflow-y-auto ${isDetailOutlineTab ? 'pt-4' : ''}`}>
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
                  const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                  const outlineCardContent = entry?.content ?? '';
                  return (
                    <section
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count ${selected ? 'xy-outline-selected xy-has-value' : outlineCardContent.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        value={outlineCardContent}
                        onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                        onFocus={() => selectOutlineChapter(chapter.id, chapter.serialNumber)}
                        placeholder={isDetailOutlineTab ? '该章细纲会显示在这里，可由 AI 根据章节内容生成。' : '该章概要会显示在这里，可由 AI 根据章节内容生成。'}
                        className={`editor-scrollbar w-full resize-none text-sm leading-6 text-gray-700 outline-none ${isDetailOutlineTab ? 'h-[260px]' : 'h-36'}`}
                      />
                      <label>{outlineCardTitle}</label>
                      <span className="xy-floating-count">{countTextWords(outlineCardContent)} 字</span>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {rightResizeHandle}
        <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50 p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_96px] items-start gap-2 text-sm text-gray-500">
              <CapsuleSelect
                floatingLabel="模型"
                value={activeTabConfig.modelId ?? ''}
                onChange={(value) => updateActiveTabConfig({ modelId: value })}
                options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                buttonClassName="h-11 rounded-xl px-3 text-sm"
                actionLabel="管理"
                onActionClick={() => setManagementModal({ type: 'models' })}
              />
              <button
                type="button"
                onClick={() => setIsLibraryAiLogOpen(true)}
                className="mt-2 h-12 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand"
              >
                输出日志
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_96px] items-start gap-2 text-sm text-gray-500">
              <CapsuleSelect
                floatingLabel="提示词"
                value={activeOutlinePromptId ?? ''}
                onChange={(value) => updateActiveTabConfig({ promptId: value })}
                options={outlinePromptOptions.length === 0 ? [{ value: '', label: isDetailOutlineTab ? '暂无细纲提示词' : '暂无概要提示词', disabled: true }] : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                buttonClassName="h-11 rounded-xl px-3 text-sm"
                actionLabel="管理"
                onActionClick={() => setManagementModal({ type: 'prompts', category: isDetailOutlineTab ? DETAIL_OUTLINE_TAB : '概要' })}
              />
              <div aria-hidden="true" className="mt-2 h-12 w-24" />
            </div>
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
          {outlinePreviewDraft.startsWith('[[THINKING') ? (
            <div className="relative mt-6 min-h-[180px] flex-1">
              <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count h-full xy-has-value">
                <div className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-gray-600">
                  {renderAiChatContent(outlinePreviewDraft)}
                </div>
                <label>{outlineDraftFrameTitle}</label>
                <span className="xy-floating-count">{countTextWords(outlinePreviewDraftContent)} 字</span>
              </div>
            </div>
          ) : (
            <div className="relative mt-6 min-h-[180px] flex-1">
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count ${outlinePreviewDraft.trim() ? 'xy-has-value' : ''}`}>
                <textarea
                  value={outlinePreviewDraft}
                  onChange={(event) => setOutlinePreviewDraft(event.target.value)}
                  placeholder={isDetailOutlineTab ? '生成后的细纲会显示在这里，也可以手动编辑后保存。' : '生成后的概要会显示在这里，也可以手动编辑后保存。'}
                  className="editor-scrollbar text-sm leading-6 text-gray-600 outline-none"
                />
                <label>{outlineDraftFrameTitle}</label>
                <span className="xy-floating-count">{countTextWords(outlinePreviewDraftContent)} 字</span>
              </div>
            </div>
          )}
          <div className="mt-3">
            <div className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${outlineAiInput.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                rows={1}
                value={outlineAiInput}
                onChange={(event) => {
                  setOutlineAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault();
                    void sendOutlineAiMessage();
                  }
                }}
                className="editor-scrollbar"
              />
              <label>请输入要求</label>
              <div className="xy-ai-inline-actions">
                <button
                  type="button"
                  onClick={() => void sendOutlineAiMessage()}
                  disabled={isLibraryAiLoading || !outlineAiInput.trim()}
                  className="xy-ai-inline-send"
                >
                  <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                </button>
                <button
                  type="button"
                  onClick={stopOutlineAiMessage}
                  disabled={!isLibraryAiLoading}
                  className="xy-ai-inline-stop"
                >
                  <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button
              onClick={saveOutlinePreviewDraft}
              disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
              className="min-w-0 flex-1 bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              保存
            </button>
            <button
              onClick={() => void navigator.clipboard.writeText(stripAiThinkingBlock(outlinePreviewDraft))}
              disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
              className="min-w-0 flex-1 border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              复制
            </button>
            <button
              onClick={clearOutlinePreviewDraft}
              className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              清空
            </button>
          </div>
          </aside>
        {isOutlineSettingsOpen && (
          <div className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/30" onClick={() => setIsOutlineSettingsOpen(false)}>
            <div
              className="modal-sharp w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
