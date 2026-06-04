import { ChevronDown, ChevronRight, Lock, Plus, Send, Settings, Square, Trash2, Unlock, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode, type SetStateAction } from 'react';
import type { CSSProperties } from 'react';
import type { DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { readModelSnapshot } from '@/features/models/hooks/useModels';
import { callModel, callModelStream } from '@/features/models/services/callModel';
import { readPlotLibrarySnapshot } from '@/features/plot-library/hooks/usePlotLibrary';
import type { PlotLibraryItem } from '@/features/plot-library/model/plotLibraryTypes';
import { normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { clearWorkbenchLinkedBrainstorm } from '@/features/workbench/model/workbenchAssociationCleanup';
import { shouldSyncOutlinePreviewDraft } from '@/features/workbench/model/workbenchOutlineSync';
import { getPlotPointDisplayText, getPlotPointScoreColorClass, prepareCollapsedPlotPointCard } from '@/features/workbench/model/workbenchPlotPointCard';
import { buildPlotPointOutputFormatInstruction } from '@/features/workbench/model/workbenchPlotPointPrompt';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  canCreateWorkbenchRoleInType,
  getInitialPlotChainRoleIds,
  getPlotPointProtagonistReplacementRule,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleLifeStatus,
  normalizeWorkbenchRoleType,
  shouldShowRolePinAction,
} from '@/features/workbench/model/workbenchRoleTypes';
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
import { AiRequestLogGroups, type AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
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
  openPlotPointSignal?: number;
  plotPointStandalone?: boolean;
  onOpenDetailOutlineFromPlotChain?: () => void;
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

const DEFAULT_ROLE_TYPES = DEFAULT_WORKBENCH_ROLE_TYPES;
const DEFAULT_SETTING_TYPES = ['核心设定', '主线剧情', '等级体系', '势力设定', '伏笔设定', '其他设定', '未分类'];
const ROLE_TAB = '角色';
const BRAINSTORM_TAB = '脑洞';
const SETTING_TAB = '大纲';
const PROMPT_SETTING_CATEGORY = '设定';
const DETAIL_OUTLINE_TAB = '细纲';
const PLOT_CHAIN_PROMPT_CATEGORY = '剧情链';
const DETAIL_OUTLINE_DISPLAY_LABEL = '章纲';
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
const DETAIL_OUTLINE_PREVIEW_MIN_HEIGHT = 130;
const DETAIL_OUTLINE_PREVIEW_MAX_HEIGHT = 260;
const DETAIL_OUTLINE_PREVIEW_LINE_HEIGHT = 24;
const DETAIL_OUTLINE_PREVIEW_VERTICAL_PADDING = 48;
const MODEL_SELECT_COLUMNS = 'grid-cols-[minmax(0,1fr)]';
const PROMPT_SELECT_COLUMNS = 'grid-cols-[minmax(0,1fr)]';

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
  roleType?: string;
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
  readerContextTitle?: string;
  readerContextText?: string;
  readerContextWordCount?: number;
};

type PlotPointSourceMode = 'library' | 'ai' | 'mixed';
type PlotPointLengthMode = 'short' | 'medium' | 'long';
type PlotPointChainSlot = 1 | 2 | 3;
type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines';

type WorkbenchPlotPointCandidate = {
  id: string;
  title: string;
  source: '剧情库' | 'AI生成';
  originalGenre: string;
  original: string;
  adapted: string;
  variable: string;
  review?: string;
  score?: string | null;
};

const PLOT_POINT_CHAIN_SLOTS: PlotPointChainSlot[] = [1, 2, 3];
const HIDDEN_PLOT_POINT_SOURCE_MODES: PlotPointSourceMode[] = ['library', 'mixed'];
const PLOT_POINT_GENERATE_COUNTS = [5, 10, 20] as const;
const PLOT_POINT_LENGTH_MODES: PlotPointLengthMode[] = ['short', 'medium', 'long'];
const PLOT_POINT_OPENING_ELEMENT_OPTIONS = ['强情绪', '强冲突', '强悬念', '强期待', '强爽点', '强压迫'];
const DEFAULT_PLOT_POINT_OPENING_ELEMENTS = ['强情绪', '强冲突'];

const PLOT_POINT_FALLBACK_CANDIDATES: WorkbenchPlotPointCandidate[] = [
  {
    id: 'fallback-pressure-start',
    title: '开局强压迫',
    source: 'AI生成',
    originalGenre: '通用',
    original: '主角刚进入故事就被推到压力中心，必须立刻做出选择。',
    adapted: '主角在关键场合被当众否定，原本依靠的身份、资源或关系同时失效，只能靠一个微弱线索自救。',
    variable: '压力场景 / 身份失效 / 自救线索',
  },
  {
    id: 'fallback-hidden-cost',
    title: '获得机会但付出代价',
    source: '剧情库',
    originalGenre: '成长流',
    original: '主角得到一次翻身机会，但机会附带隐藏代价。',
    adapted: '主角发现一条能逆转困局的路径，但每推进一步都会暴露更深的风险和敌人的关注。',
    variable: '翻身机会 / 隐藏代价 / 敌人关注',
  },
  {
    id: 'fallback-first-victory',
    title: '第一场小胜',
    source: '剧情库',
    originalGenre: '爽文节奏',
    original: '主角先赢下一场小胜，让读者看到希望，但大危机还没解除。',
    adapted: '主角用一个不起眼的细节赢回第一点主动权，同时引出更大的幕后问题。',
    variable: '小胜 / 主动权 / 幕后问题',
  },
];

function getPlotPointLengthLabel(length: PlotPointLengthMode) {
  if (length === 'short') return '短';
  if (length === 'medium') return '中';
  return '长';
}

function normalizePlotPointSourceMode(value?: string | null): PlotPointSourceMode {
  if (value === 'ai') return 'ai';
  if ((value === 'library' || value === 'mixed') && !HIDDEN_PLOT_POINT_SOURCE_MODES.includes(value)) return value;
  return 'ai';
}

function normalizePlotPointGenerateCount(value?: number | null): typeof PLOT_POINT_GENERATE_COUNTS[number] {
  return PLOT_POINT_GENERATE_COUNTS.includes(value as typeof PLOT_POINT_GENERATE_COUNTS[number])
    ? value as typeof PLOT_POINT_GENERATE_COUNTS[number]
    : 10;
}

function normalizePlotPointLengthMode(value?: string | null): PlotPointLengthMode {
  return PLOT_POINT_LENGTH_MODES.includes(value as PlotPointLengthMode) ? value as PlotPointLengthMode : 'short';
}

function normalizePlotPointOpeningElements(value?: string[] | null) {
  const elements = Array.isArray(value)
    ? value.filter((item) => PLOT_POINT_OPENING_ELEMENT_OPTIONS.includes(item))
    : DEFAULT_PLOT_POINT_OPENING_ELEMENTS;
  return Array.from(new Set(elements));
}

function normalizePlotPointChainSlot(value?: number | null): PlotPointChainSlot {
  return PLOT_POINT_CHAIN_SLOTS.includes(value as PlotPointChainSlot) ? value as PlotPointChainSlot : 1;
}

function normalizePlotPointChainSelections(value?: unknown): Record<PlotPointChainSlot, string[]> {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    1: Array.isArray(source['1']) ? source['1'].filter((item): item is string => typeof item === 'string') : [],
    2: Array.isArray(source['2']) ? source['2'].filter((item): item is string => typeof item === 'string') : [],
    3: Array.isArray(source['3']) ? source['3'].filter((item): item is string => typeof item === 'string') : [],
  };
}

function getWorkbenchPlotPointText(item: WorkbenchPlotPointCandidate, length: PlotPointLengthMode) {
  if (length === 'short') return item.adapted;
  if (length === 'medium') return `${item.adapted} 这个剧情点可以展开成一个完整场景，重点写清冲突、选择和结果。`;
  return `${item.adapted} 这个剧情点可以扩展为多场连续推进：先制造压力，再给主角选择，随后出现代价或反转，最后留下下一步期待。`;
}

function getWorkbenchPlotPointPreviewText(item: WorkbenchPlotPointCandidate) {
  return prepareCollapsedPlotPointCard(item).previewText || item.adapted.replace(/\s+/g, ' ').trim();
}

function getWorkbenchPlotPointDisplayText(item: WorkbenchPlotPointCandidate, previewText: string) {
  const title = prepareCollapsedPlotPointCard(item).title;
  return getPlotPointDisplayText({ title, previewText });
}

function getWorkbenchPlotPointReview(item: WorkbenchPlotPointCandidate, hasChain: boolean) {
  if (item.review?.trim()) return `AI评价：${item.review.replace(/^AI评价[：:]\s*/, '').trim()}`;
  if (hasChain) return 'AI评价：适合作为衔接点，重点要承接上一条剧情的后果，不要重新开一条无关冲突。';
  if (item.source === '剧情库') return 'AI评价：有成熟剧情骨架，适合先做变量替换，再按当前设定调整人物、势力和道具。';
  return 'AI评价：适合自由生成时使用，建议补足明确目标、强冲突和下一步期待。';
}

function getWorkbenchPlotPointNumericScore(value: string | null | undefined) {
  if (!value) return null;
  const match = value.match(/\d{1,3}(?:\.\d+)?/);
  if (!match) return null;
  const score = Number(match[0]);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
}

function getWorkbenchPlotPointDecisionMetrics(
  item: WorkbenchPlotPointCandidate,
  scoreText: string | null | undefined,
  hasChain: boolean,
  index: number,
) {
  const baseScore = getWorkbenchPlotPointNumericScore(scoreText) ?? 82;
  const textLength = item.adapted.length;
  const clarity = Math.max(68, Math.min(96, baseScore + (textLength < 180 ? 4 : 0) - (textLength > 360 ? 5 : 0)));
  const potential = Math.max(70, Math.min(98, baseScore + (item.review ? 3 : 0) + (item.source === 'AI生成' ? 1 : 0)));
  const fit = hasChain
    ? Math.max(70, Math.min(98, baseScore + 4 - Math.min(index, 4)))
    : Math.max(68, Math.min(94, baseScore - 1));
  return { clarity, potential, fit };
}

function getWorkbenchPlotPointFitLabel(fit: number, hasChain: boolean) {
  if (hasChain) {
    if (fit >= 90) return '强衔接';
    if (fit >= 82) return '可衔接';
    return '需调整';
  }
  if (fit >= 90) return '强开端';
  if (fit >= 82) return '开端可用';
  return '需打磨';
}

function getWorkbenchPlotPointFitClass(fit: number) {
  if (fit >= 90) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (fit >= 82) return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function plotLibraryItemToCandidate(item: PlotLibraryItem): WorkbenchPlotPointCandidate {
  return {
    id: `library:${item.id}`,
    title: item.title || '未命名剧情点',
    source: '剧情库',
    originalGenre: item.tags[0] ?? item.chapter ?? '剧情库',
    original: item.content.trim().slice(0, 120) || item.title,
    adapted: item.content.trim().slice(0, 180) || item.title,
    variable: item.tags.length > 0 ? item.tags.join(' / ') : '按当前小说设定替换变量',
    score: item.rating == null ? undefined : String(item.rating),
  };
}

function parseGeneratedPlotPointCandidates(text: string): WorkbenchPlotPointCandidate[] {
  const clean = stripAiThinkingBlock(text).trim();
  if (!clean) return [];
  return clean
    .split(/\n(?=\s*(?:[-*]|\d+[.、）)]|剧情点\s*\d+|【?剧情点[^】\n]*】?[：:])\s*)/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .filter((block) => !/^#+\s*/.test(block))
    .slice(0, 30)
    .map((block, index) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line
          .trim()
          .replace(/^[-*]\s*/, '')
          .replace(/^\d+[.、）)]\s*/, '')
          .replace(/^剧情点\s*\d+[.、）)]?\s*[：:]?\s*/, '')
          .trim())
        .filter(Boolean);
      const isMetaLine = (line: string) => /^(变量替换|变量替换说明|替换说明|修改说明|改写说明|AI评价|评价|原剧情点|原型)[：:]/.test(line);
      const contentLines = lines.filter((line) => !isMetaLine(line));
      const mainLine = contentLines[0] ?? lines[0] ?? '';
      const variableLine = lines.find((line) => /^(变量替换|变量替换说明|替换说明)[：:]/.test(line));
      const reviewLine = lines.find((line) => /^(AI评价|评价)[：:]/.test(line));
      const [rawTitle, ...rest] = mainLine.replace(/^剧情点[：:]\s*/, '').split(/[：:]/);
      const titleFromLine = rawTitle.trim();
      const firstContent = rest.length > 0 && !/^(标题|剧情点)$/.test(titleFromLine)
        ? rest.join('：').trim().replace(new RegExp(`^${titleFromLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[，,、。；;：:\\s]*`), '').trim()
        : rest.length > 0
        ? rest.join('：').trim()
        : mainLine;
      const adapted = [firstContent, ...contentLines.slice(1)].filter(Boolean).join('\n').trim();
      const derivedTitle = firstContent.split(/[，。！？；,.!?;]/)[0]?.trim() || `AI剧情点 ${index + 1}`;
      const title = rawTitle.length <= 22 && rest.length > 0 && !/^(标题|剧情点)$/.test(rawTitle.trim())
        ? rawTitle
        : derivedTitle.slice(0, 22);
      return {
        id: `ai:${index}:${adapted.slice(0, 18)}`,
        title,
        source: 'AI生成' as const,
        originalGenre: 'AI生成',
        original: block,
        adapted,
        variable: variableLine?.replace(/^(变量替换|变量替换说明|替换说明)[：:]\s*/, '').trim() || '由当前设定、用户要求和上下文生成',
        review: reviewLine?.replace(/^(AI评价|评价)[：:]\s*/, '').trim(),
      };
    })
    .filter((item) => item.adapted.length >= 6);
}

type LibraryEntryDragState = {
  entryId: string;
  tab: string;
  type: string;
} | null;

function getEstimatedLineCount(value: string, charactersPerLine = 52) {
  const normalized = value.trimEnd();
  if (!normalized.trim()) return 1;
  return normalized.split(/\r?\n/).reduce((total, line) => (
    total + Math.max(1, Math.ceil(Array.from(line).length / charactersPerLine))
  ), 0);
}

function getDetailOutlinePreviewHeight(value: string) {
  if (!value.trim()) return DETAIL_OUTLINE_PREVIEW_MIN_HEIGHT;
  const contentHeight = DETAIL_OUTLINE_PREVIEW_VERTICAL_PADDING
    + getEstimatedLineCount(value) * DETAIL_OUTLINE_PREVIEW_LINE_HEIGHT;
  return Math.min(
    DETAIL_OUTLINE_PREVIEW_MAX_HEIGHT,
    Math.max(DETAIL_OUTLINE_PREVIEW_MIN_HEIGHT, contentHeight),
  );
}

type WorkbenchFieldSizeKey =
  | 'roleSearch'
  | 'roleCategoryName'
  | 'roleCreateName'
  | 'roleDetailName'
  | 'roleDetailCategory'
  | 'settingName'
  | 'settingModelSelect'
  | 'settingPromptSelect'
  | 'roleModelSelect'
  | 'rolePromptSelect'
  | 'brainstormModelSelect'
  | 'brainstormPromptSelect'
  | 'outlineSummaryModelSelect'
  | 'outlineSummaryPromptSelect'
  | 'detailOutlineModelSelect'
  | 'detailOutlinePromptSelect';
type WorkbenchFieldSizeSpec = { width: number; height: number; fontSize: number };
type WorkbenchFieldSizeProp = keyof WorkbenchFieldSizeSpec;

const WORKBENCH_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';
const WORKBENCH_FIELD_SIZE_DEFAULTS: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> = {
  roleSearch: { width: 260, height: 44, fontSize: 13 },
  roleCategoryName: { width: 260, height: 44, fontSize: 13 },
  roleCreateName: { width: 260, height: 44, fontSize: 13 },
  roleDetailName: { width: 220, height: 44, fontSize: 13 },
  roleDetailCategory: { width: 220, height: 44, fontSize: 13 },
  settingName: { width: 220, height: 56, fontSize: 18 },
  settingModelSelect: { width: 250, height: 44, fontSize: 13 },
  settingPromptSelect: { width: 250, height: 44, fontSize: 13 },
  roleModelSelect: { width: 250, height: 44, fontSize: 13 },
  rolePromptSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormModelSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormPromptSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryModelSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryPromptSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlineModelSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlinePromptSelect: { width: 250, height: 44, fontSize: 13 },
};

const WORKBENCH_FIELD_SIZE_SETTING_KEYS = (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).filter(
  (key) => key !== 'roleCategoryName' && key !== 'roleCreateName',
);

const WORKBENCH_FIELD_SIZE_KEYS_BY_TAB: Record<string, WorkbenchFieldSizeKey[]> = {
  [SETTING_TAB]: ['settingName', 'settingModelSelect', 'settingPromptSelect'],
  [ROLE_TAB]: ['roleSearch', 'roleDetailName', 'roleDetailCategory', 'roleModelSelect', 'rolePromptSelect'],
  [BRAINSTORM_TAB]: ['brainstormModelSelect', 'brainstormPromptSelect'],
  [OUTLINE_LIBRARY_TAB]: ['outlineSummaryModelSelect', 'outlineSummaryPromptSelect'],
  [DETAIL_OUTLINE_TAB]: ['detailOutlineModelSelect', 'detailOutlinePromptSelect'],
};

const WORKBENCH_FIELD_SIZE_LABELS: Partial<Record<WorkbenchFieldSizeKey, string>> = {
  roleSearch: '角色短字段',
  roleCategoryName: '分类名字',
  roleCreateName: '角色名字',
  roleDetailName: '角色名',
  settingName: '设定名',
  settingModelSelect: '设定模型框',
  settingPromptSelect: '设定提示词框',
  roleModelSelect: '角色模型框',
  rolePromptSelect: '角色提示词框',
  brainstormModelSelect: '脑洞模型框',
  brainstormPromptSelect: '脑洞提示词框',
  outlineSummaryModelSelect: '概要模型框',
  outlineSummaryPromptSelect: '概要提示词框',
  detailOutlineModelSelect: '章纲模型框',
  detailOutlinePromptSelect: '章纲提示词框',
};

function getWorkbenchFieldSizeLabel(key: WorkbenchFieldSizeKey) {
  return WORKBENCH_FIELD_SIZE_LABELS[key] ?? (key === 'roleDetailCategory' ? '分类' : key);
}

function getWorkbenchFieldSizeTabLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === OUTLINE_LIBRARY_TAB) return '章节概要';
  if (tab === DETAIL_OUTLINE_TAB) return '生成章纲';
  return tab;
}

function getWorkbenchTabDisplayLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === DETAIL_OUTLINE_TAB) return DETAIL_OUTLINE_DISPLAY_LABEL;
  if (tab === CHAPTER_DETAIL_OUTLINE_TAB) return '章节章纲';
  return tab;
}

const WORKBENCH_FIELD_SIZE_LIMITS: Record<WorkbenchFieldSizeProp, { min: number; max: number }> = {
  width: { min: 120, max: 520 },
  height: { min: 34, max: 90 },
  fontSize: { min: 11, max: 24 },
};

function clampFieldSizeValue(prop: WorkbenchFieldSizeProp, value: number) {
  const limit = WORKBENCH_FIELD_SIZE_LIMITS[prop];
  if (!Number.isFinite(value)) return WORKBENCH_FIELD_SIZE_DEFAULTS.settingName[prop];
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

function normalizeFieldSizeSpec(key: WorkbenchFieldSizeKey, value?: Partial<WorkbenchFieldSizeSpec>): WorkbenchFieldSizeSpec {
  const base = WORKBENCH_FIELD_SIZE_DEFAULTS[key];
  return {
    width: clampFieldSizeValue('width', Number(value?.width ?? base.width)),
    height: clampFieldSizeValue('height', Number(value?.height ?? base.height)),
    fontSize: clampFieldSizeValue('fontSize', Number(value?.fontSize ?? base.fontSize)),
  };
}

function readWorkbenchFieldSizeSpecs(): Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> {
  try {
    const parsed = JSON.parse(localStorage.getItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY) || '{}') as Partial<Record<WorkbenchFieldSizeKey, Partial<WorkbenchFieldSizeSpec>>>;
    return (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).reduce((acc, key) => {
      acc[key] = normalizeFieldSizeSpec(key, parsed[key]);
      return acc;
    }, {} as Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>);
  } catch {
    return { ...WORKBENCH_FIELD_SIZE_DEFAULTS };
  }
}

function writeWorkbenchFieldSizeSpecs(specs: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>) {
  localStorage.setItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY, JSON.stringify(specs));
}

function getWorkbenchFieldSizeStyle(spec: WorkbenchFieldSizeSpec): CSSProperties {
  return {
    width: spec.width,
    maxWidth: '100%',
    '--xy-field-width': `${spec.width}px`,
    '--xy-field-height': `${spec.height}px`,
    '--xy-field-font-size': `${spec.fontSize}px`,
  } as CSSProperties;
}

function FieldSizeNumberInput({
  label,
  prop,
  value,
  onChange,
}: {
  label: string;
  prop: WorkbenchFieldSizeProp;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const commitValue = (nextValue: string) => {
    if (!nextValue.trim()) {
      setDraftValue(String(value));
      return;
    }
    const normalizedValue = clampFieldSizeValue(prop, Number(nextValue));
    setDraftValue(String(normalizedValue));
    onChange(normalizedValue);
  };

  return (
    <label className="block text-xs font-black text-slate-500">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^\d]/g, '');
          setDraftValue(nextValue);
        }}
        onBlur={() => commitValue(draftValue)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitValue(draftValue);
            event.currentTarget.blur();
          }
        }}
        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-800 outline-none focus:border-[#08AACE]"
      />
    </label>
  );
}

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
  detailOutlineReaderSettingIds?: string[];
  detailOutlineReaderRoleIds?: string[];
  detailOutlineReaderOutlineIds?: string[];
  plotPointPromptId?: string;
  detailOutlinePromptId?: string;
  outlineSummaryPromptId?: string;
  selectedOutlineChapterId?: number | null;
  plotPointSourceMode?: PlotPointSourceMode;
  plotPointGenerateCount?: number;
  plotPointLength?: PlotPointLengthMode;
  plotPointOpeningElements?: string[];
  plotPointPreviewDraft?: string;
  plotPointGeneratedCandidateText?: string;
  plotPointPreviewCleared?: boolean;
  plotPointSelectedCandidates?: WorkbenchPlotPointCandidate[];
  plotPointChainSelections?: Partial<Record<PlotPointChainSlot, string[]>>;
  plotPointActiveChainSlot?: PlotPointChainSlot;
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
  const normalizedDefault = normalizeTabName(defaultActiveTab ?? '');
  if (tabs.includes(normalizedDefault)) return normalizedDefault;
  try {
    const stored = normalizeTabName(localStorage.getItem(getActiveTabStorageKey(storageKey)) ?? '');
    if (tabs.includes(stored)) return stored;
  } catch {
    // Ignore localStorage failures and fall back to the supplied default.
  }
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
    return Array.from(new Set(parsed
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => normalizeWorkbenchRoleType(item))));
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
    const type = normalizeWorkbenchRoleType(parsed.type);
    const lifeStatus = normalizeWorkbenchRoleLifeStatus(type, parsed.lifeStatus);
    return {
      type,
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
  const type = normalizeWorkbenchRoleType(value.type);
  return JSON.stringify({
    ...value,
    type,
    lifeStatus: normalizeWorkbenchRoleLifeStatus(type, value.lifeStatus),
  });
}

function buildRoleReaderContent(entry: WorkbenchLibraryEntry, role: RoleContent) {
  return [
    `角色名：${entry.title || '未命名角色'}`,
    `角色分类：${normalizeWorkbenchRoleType(role.type) || '未分类'}`,
    `生存状态：${role.lifeStatus}`,
    role.personality.trim() ? `角色性格：${role.personality.trim()}` : '',
    role.background.trim() ? `角色背景：${compactTextForAi(role.background, 600)}` : '',
    role.status.trim() ? `角色状态：${compactTextForAi(role.status, 600)}` : '',
  ].filter(Boolean).join('\n');
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

function normalizeImportedSettingKey(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeImportedSettingBody(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
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

function compactTextForAi(content: string, maxLength: number) {
  const text = content.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}……`;
}

function getRequestLogMeta(content?: string, unit = '字') {
  return `${countTextWords(content ?? '')} ${unit}`;
}

function buildLibraryLogGroups(log: LibraryAiRequestLog, options?: {
  includeContext?: boolean;
  includeReaderContext?: boolean;
  contextFallback?: string;
  userTitle?: string;
  expandReaderContextContent?: boolean;
  expandAllContent?: boolean;
}): AiRequestLogGroup[] {
  const expandedContentClassName = 'overflow-visible';
  const groups: AiRequestLogGroup[] = [
    {
      id: 'prompt',
      title: '提示词',
      meta: getRequestLogMeta(log.systemPrompt),
      content: log.systemPrompt,
      emptyText: '空内容',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    },
  ];
  if (options?.includeReaderContext) {
    groups.push({
      id: 'reader-context',
      title: '关联设定',
      meta: log.readerContextTitle || getRequestLogMeta(log.readerContextText),
      content: log.readerContextText,
      emptyText: '未关联设定或前文章纲',
      tone: 'cyan',
      contentClassName: options.expandAllContent
        ? expandedContentClassName
        : options.expandReaderContextContent
        ? 'min-h-[360px] overflow-visible'
        : undefined,
    });
  }
  if (options?.includeContext !== false) {
    groups.push({
      id: 'context',
      title: '关联内容',
      meta: log.contextTitle || (log.hasLinkedBrainstorm ? log.linkedBrainstormTitle : getRequestLogMeta(log.contextText)),
      content: log.contextText || (log.hasLinkedBrainstorm ? log.userContent : ''),
      emptyText: options?.contextFallback || '未关联内容',
      tone: 'cyan',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    });
  }
  groups.push(
    {
      id: 'user',
      title: options?.userTitle || '用户要求',
      meta: getRequestLogMeta(log.userContent),
      content: log.userContent,
      emptyText: '空内容',
      tone: 'amber',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    },
  );
  return groups;
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

function isPendingAiThinkingDraft(content: string) {
  const trimmed = content.trim();
  return trimmed === '正在思考...' || /^\[\[THINKING seconds=\d+ status=thinking\]\]/.test(trimmed);
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
  openPlotPointSignal = 0,
  plotPointStandalone = false,
  onOpenDetailOutlineFromPlotChain,
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
  const activeTabConfig = tabConfigs[activeTab] ?? {};
  const [roleSearch, setRoleSearch] = useState('');
  const [customRoleTypes, setCustomRoleTypes] = useState<string[]>(() => readCustomRoleTypes(storageKey));
  const [hiddenRoleTypes, setHiddenRoleTypes] = useState<string[]>(() => readStringList(getHiddenRoleTypesStorageKey(storageKey)));
  const [customSettingTypes, setCustomSettingTypes] = useState<string[]>(() => readCustomSettingTypes(storageKey));
  const [hiddenSettingTypes, setHiddenSettingTypes] = useState<string[]>(() => readStringList(getHiddenSettingTypesStorageKey(storageKey)));
  const [outlineStart, setOutlineStart] = useState('1');
  const [outlineEnd, setOutlineEnd] = useState('50');
  const [selectedOutlineChapterId, setSelectedOutlineChapterId] = useState<number | null>(() => (
    Number.isFinite(activeTabConfig.selectedOutlineChapterId) ? activeTabConfig.selectedOutlineChapterId ?? null : null
  ));
  const [selectedOutlineVolumeId, setSelectedOutlineVolumeId] = useState<number | null>(null);
  const [outlineSelectionType, setOutlineSelectionType] = useState<'chapter' | 'volume'>('chapter');
  const [outlinePreviewDraft, setOutlinePreviewDraftState] = useState(() => (
    plotPointStandalone ? activeTabConfig.plotPointPreviewDraft ?? '' : ''
  ));
  const [, forceOutlineSelectionRefresh] = useState(0);
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() => (
    readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')
  ));
  const [outlineColumns, setOutlineColumns] = useState(loadOutlineColumns);
  const [isOutlineSettingsOpen, setIsOutlineSettingsOpen] = useState(false);
  const [isFieldSizeSettingsOpen, setIsFieldSizeSettingsOpen] = useState(false);
  const [fieldSizeSpecs, setFieldSizeSpecs] = useState<Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>>(() => readWorkbenchFieldSizeSpecs());
  const fieldSizeSettingsDraggable = useDraggableModal('workbench_field_size_settings');
  const visibleFieldSizeKeys = WORKBENCH_FIELD_SIZE_KEYS_BY_TAB[activeTab] ?? WORKBENCH_FIELD_SIZE_SETTING_KEYS;
  const fieldSizeTabLabel = getWorkbenchFieldSizeTabLabel(activeTab);
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
  const [activeDetailOutlineScrollId, setActiveDetailOutlineScrollId] = useState<number | null>(null);
  const [isDetailOutlineReaderOpen, setIsDetailOutlineReaderOpen] = useState(false);
  const [detailOutlineReaderTab, setDetailOutlineReaderTab] = useState<DetailOutlineReaderTab>('settings');
  const [collapsedDetailOutlineReaderGroups, setCollapsedDetailOutlineReaderGroups] = useState<Record<string, boolean>>({});
  const [draftDetailOutlineReaderSettingIds, setDraftDetailOutlineReaderSettingIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderRoleIds, setDraftDetailOutlineReaderRoleIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderOutlineIds, setDraftDetailOutlineReaderOutlineIds] = useState<Set<string>>(() => new Set());
  const [isPlotPointModalOpen, setIsPlotPointModalOpen] = useState(false);
  const [plotPointInput, setPlotPointInput] = useState('');
  const [plotPointOutput, setPlotPointOutput] = useState('');
  const [plotPointGeneratedCandidateText, setPlotPointGeneratedCandidateTextState] = useState(() => (
    activeTabConfig.plotPointGeneratedCandidateText ?? ''
  ));
  const [isPlotPointPreviewCleared, setIsPlotPointPreviewClearedState] = useState(() => (
    activeTabConfig.plotPointPreviewCleared ?? !activeTabConfig.plotPointGeneratedCandidateText
  ));
  const [plotPointSourceMode, setPlotPointSourceModeState] = useState<PlotPointSourceMode>(() => (
    normalizePlotPointSourceMode(activeTabConfig.plotPointSourceMode)
  ));
  const [plotPointGenerateCount, setPlotPointGenerateCountState] = useState<5 | 10 | 20>(() => (
    normalizePlotPointGenerateCount(activeTabConfig.plotPointGenerateCount)
  ));
  const [plotPointLength, setPlotPointLengthState] = useState<PlotPointLengthMode>(() => (
    normalizePlotPointLengthMode(activeTabConfig.plotPointLength)
  ));
  const [plotPointActiveChainSlot, setPlotPointActiveChainSlot] = useState<PlotPointChainSlot>(() => (
    normalizePlotPointChainSlot(activeTabConfig.plotPointActiveChainSlot)
  ));
  const [plotPointChainSelections, setPlotPointChainSelections] = useState<Record<PlotPointChainSlot, string[]>>(() => (
    normalizePlotPointChainSelections(activeTabConfig.plotPointChainSelections)
  ));
  const [plotPointChainRefreshStates, setPlotPointChainRefreshStates] = useState<Record<PlotPointChainSlot, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [plotPointSelectedCandidateMap, setPlotPointSelectedCandidateMap] = useState<Record<string, WorkbenchPlotPointCandidate>>(() => (
    Object.fromEntries((activeTabConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item]))
  ));
  const [expandedPlotPointPreviewIds, setExpandedPlotPointPreviewIds] = useState<string[]>([]);
  const [plotPointOpeningElements, setPlotPointOpeningElementsState] = useState<string[]>(() => (
    normalizePlotPointOpeningElements(activeTabConfig.plotPointOpeningElements)
  ));
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
  const outlinePreviewDraftRef = useRef(outlinePreviewDraft);
  const isLibraryAiLoadingRef = useRef(isLibraryAiLoading);
  const plotPointGenerationModeRef = useRef<'restart' | 'continue'>('restart');
  const brainstormConfirmScrollTimerRef = useRef<number | null>(null);
  const detailOutlineScrollTimerRef = useRef<number | null>(null);
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
    outlinePreviewDraftRef.current = outlinePreviewDraft;
  }, [outlinePreviewDraft]);

  useEffect(() => {
    isLibraryAiLoadingRef.current = isLibraryAiLoading;
  }, [isLibraryAiLoading]);

  useEffect(() => () => {
    if (!plotPointStandalone) return;
    const pendingController = libraryAiAbortRef.current;
    if (pendingController) {
      pendingController.abort();
      libraryAiAbortRef.current = null;
    }
    if (!pendingController && !isLibraryAiLoadingRef.current) return;
    const abortedText = '【已中止】窗口已关闭，本次剧情链生成已停止。';
    if (isPendingAiThinkingDraft(outlinePreviewDraftRef.current)) {
      const currentConfigs = readTabConfigs(storageKey);
      const currentTabConfig = currentConfigs[activeTab] ?? {};
      localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify({
        ...currentConfigs,
        [activeTab]: {
          ...currentTabConfig,
          plotPointPreviewDraft: abortedText,
        },
      }));
    }
  }, [activeTab, plotPointStandalone, storageKey]);

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
  useTopModalEscape(isFieldSizeSettingsOpen, () => setIsFieldSizeSettingsOpen(false));
  useTopModalEscape(isLibraryAiLogOpen, () => setIsLibraryAiLogOpen(false));
  useTopModalEscape(isDetailOutlineReaderOpen, () => setIsDetailOutlineReaderOpen(false));
  useTopModalEscape(isPlotPointModalOpen, () => setIsPlotPointModalOpen(false));
  useTopModalEscape(isBrainstormRecycleOpen && !isClearBrainstormRecycleConfirmOpen, () => setIsBrainstormRecycleOpen(false));
  useTopModalEscape(isBrainstormReaderOpen, closeBrainstormReader);

  useEffect(() => {
    if (openPlotPointSignal <= 0 || activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return;
    setIsPlotPointModalOpen(true);
  }, [activeTab, openPlotPointSignal, plotPointStandalone]);

  useEffect(() => () => {
    if (brainstormConfirmScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormConfirmScrollTimerRef.current);
    }
    if (detailOutlineScrollTimerRef.current !== null) {
      window.clearTimeout(detailOutlineScrollTimerRef.current);
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
  const setOutlinePreviewDraft = (value: SetStateAction<string>) => {
    const nextValue = typeof value === 'function' ? value(outlinePreviewDraft) : value;
    setOutlinePreviewDraftState(nextValue);
    if (plotPointStandalone) updateActiveTabConfig({ plotPointPreviewDraft: nextValue });
  };
  const setPlotPointGeneratedCandidateText = (value: string) => {
    setPlotPointGeneratedCandidateTextState(value);
    updateActiveTabConfig({ plotPointGeneratedCandidateText: value });
  };
  const setIsPlotPointPreviewCleared = (value: boolean) => {
    setIsPlotPointPreviewClearedState(value);
    updateActiveTabConfig({ plotPointPreviewCleared: value });
  };
  const setPlotPointSelectedCandidateCache = (updater: (current: Record<string, WorkbenchPlotPointCandidate>) => Record<string, WorkbenchPlotPointCandidate>) => {
    setPlotPointSelectedCandidateMap((current) => {
      const next = updater(current);
      updateActiveTabConfig({ plotPointSelectedCandidates: Object.values(next) });
      return next;
    });
  };
  const setActivePlotPointChainSlot = (slot: PlotPointChainSlot) => {
    setPlotPointActiveChainSlot(slot);
    updateActiveTabConfig({ plotPointActiveChainSlot: slot });
  };
  const setPlotPointGenerateCount = (value: typeof PLOT_POINT_GENERATE_COUNTS[number]) => {
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
    setIsPlotPointPreviewClearedState(nextConfig.plotPointPreviewCleared ?? !nextConfig.plotPointGeneratedCandidateText);
    setPlotPointSelectedCandidateMap(Object.fromEntries((nextConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item])));
    setPlotPointChainSelections(normalizePlotPointChainSelections(nextConfig.plotPointChainSelections));
    setPlotPointActiveChainSlot(normalizePlotPointChainSlot(nextConfig.plotPointActiveChainSlot));
    setPlotPointSourceModeState(normalizePlotPointSourceMode(nextConfig.plotPointSourceMode));
    setPlotPointGenerateCountState(normalizePlotPointGenerateCount(nextConfig.plotPointGenerateCount));
    setPlotPointLengthState(normalizePlotPointLengthMode(nextConfig.plotPointLength));
    setPlotPointOpeningElementsState(normalizePlotPointOpeningElements(nextConfig.plotPointOpeningElements));
    setSelectedOutlineChapterId(Number.isFinite(nextConfig.selectedOutlineChapterId) ? nextConfig.selectedOutlineChapterId ?? null : null);
  }, [activeTab, plotPointStandalone, tabConfigs]);
  const resetFieldSizeSpecs = () => {
    const defaults = readWorkbenchFieldSizeSpecs();
    visibleFieldSizeKeys.forEach((key) => {
      defaults[key] = { ...WORKBENCH_FIELD_SIZE_DEFAULTS[key] };
    });
    writeWorkbenchFieldSizeSpecs(defaults);
    setFieldSizeSpecs(defaults);
  };
  const getFieldSizeStyle = (key: WorkbenchFieldSizeKey) => getWorkbenchFieldSizeStyle(fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key]);
  const getConfigFieldSizeKey = (tab: string, kind: 'model' | 'prompt'): WorkbenchFieldSizeKey => {
    if (tab === ROLE_TAB) return kind === 'model' ? 'roleModelSelect' : 'rolePromptSelect';
    if (tab === BRAINSTORM_TAB) return kind === 'model' ? 'brainstormModelSelect' : 'brainstormPromptSelect';
    return kind === 'model' ? 'settingModelSelect' : 'settingPromptSelect';
  };
  const getConfigFieldSizeStyle = (tab: string, kind: 'model' | 'prompt'): CSSProperties => getFieldSizeStyle(getConfigFieldSizeKey(tab, kind));

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
  const selectedRoleIsMaleProtagonist = Boolean(selectedRole && isMaleProtagonistRoleType(selectedRole.type));
  const selectedRoleLifeStatus = selectedRoleIsMaleProtagonist ? '存活' : selectedRole?.lifeStatus;

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
    if (!shouldSyncOutlinePreviewDraft({ plotPointStandalone })) return;
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
    const chapterDisplayTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章章纲` : chapterTitle;
    const content = currentOutlineEntries.find((entry) => (
      entry.tab === chapterTab && (entry.title === chapterTitle || entry.title === chapterDisplayTitle)
    ))?.content ?? '';
    setOutlinePreviewDraft(content);
  }, [activeTab, entries, outlineEntries, outlineSelectionType, outlineStorageKey, plotPointStandalone, selectedOutlineChapterId, selectedOutlineVolumeId, tabs, volumes]);

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
    const remainingEntries = [...entries];
    const importedEntries: WorkbenchLibraryEntry[] = [];
    segments.forEach((segment) => {
      const type = resolvedSettingTypes.has(segment.type) ? segment.type : UNCATEGORIZED_TYPE;
      const titleKey = normalizeImportedSettingKey(segment.title);
      const typeKey = normalizeImportedSettingKey(type);
      const body = normalizeImportedSettingBody(segment.body);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== SETTING_TAB) return false;
        const setting = parseSettingContent(entry.content);
        return normalizeImportedSettingKey(entry.title) === titleKey
          && normalizeImportedSettingKey(setting.type) === typeKey;
      });

      if (existingIndex >= 0) {
        const [existingEntry] = remainingEntries.splice(existingIndex, 1);
        const existingSetting = parseSettingContent(existingEntry.content);
        importedEntries.push({
          ...existingEntry,
          content: normalizeImportedSettingBody(existingSetting.body) === body
            ? existingEntry.content
            : stringifySettingContent({ type, body }),
          updatedAt: normalizeImportedSettingBody(existingSetting.body) === body
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
    persist([...importedEntries, ...remainingEntries]);
    updateActiveTabConfig({ smartImportLocked: true });
    setRememberedActiveTab(SETTING_TAB);
    setSelectedIdForTab(SETTING_TAB, importedEntries[0]?.id ?? null);
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      segments.forEach((segment) => next.add(resolvedSettingTypes.has(segment.type) ? segment.type : UNCATEGORIZED_TYPE));
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
        systemPrompt: activeTab === SETTING_TAB ? baseModelPrompt : modelPrompt,
        userContent: activeTab === SETTING_TAB ? (text || '无额外要求') : requestText,
        contextTitle: hasLinkedBrainstorm ? linkedBrainstorm.title : '未关联',
        contextText: hasLinkedBrainstorm ? linkedBrainstorm.text : '',
        contextWordCount: countTextWords(hasLinkedBrainstorm ? linkedBrainstorm.text : ''),
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
    const normalizedType = normalizeWorkbenchRoleType(type);
    if (!canCreateWorkbenchRoleInType(roleEntries.map((entry) => parseRoleContent(entry.content).type), normalizedType)) return;
    const title = roleNameDraft.trim() || '新建角色';
    const entry = createWorkbenchLibraryEntry(ROLE_TAB, title);
    const roleEntry = {
      ...entry,
      content: stringifyRoleContent({ type: normalizedType, lifeStatus: '存活', personality: '', background: '', status: '', history: [] }),
    };
    persist([roleEntry, ...entries]);
    setRememberedActiveTab(ROLE_TAB);
    setSelectedIdForTab(ROLE_TAB, roleEntry.id);
    setExpandedRoleTypes((prev) => new Set(prev).add(normalizedType));
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
    const normalizedUpdates = {
      ...updates,
      ...(updates.type ? { type: normalizeWorkbenchRoleType(updates.type) } : {}),
    };
    const nextType = normalizeWorkbenchRoleType(normalizedUpdates.type ?? selectedRole.type);
    if (isMaleProtagonistRoleType(nextType)) {
      normalizedUpdates.lifeStatus = '存活';
    }
    if (normalizedUpdates.type && !canCreateWorkbenchRoleInType(
      roleEntries
        .filter((entry) => entry.id !== selectedEntry.id)
        .map((entry) => parseRoleContent(entry.content).type),
      normalizedUpdates.type,
    )) return;
    const changed = Object.entries(normalizedUpdates).some(([key, value]) => (
      selectedRole[key as keyof RoleContent] !== value
    ));
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
    let changed = false;
    const nextEntries = entries.map((entry) => {
      if (entry.id !== entryId || entry.tab !== normalizedTargetTab) return entry;

      if (normalizedTargetTab === ROLE_TAB) {
        const role = parseRoleContent(entry.content);
        if (!canCreateWorkbenchRoleInType(
          entries
            .filter((item) => item.id !== entry.id && item.tab === ROLE_TAB)
            .map((item) => parseRoleContent(item.content).type),
          targetType,
        )) return entry;
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
      roleType: entry.tab === ROLE_TAB ? parseRoleContent(entry.content).type : undefined,
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
    if (!shouldShowRolePinAction(entryMenu.roleType)) {
      setEntryMenu(null);
      return;
    }
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
    if (!shouldShowRolePinAction(parseRoleContent(entry.content).type)) return;
    const nextPinnedAt = entry.pinnedAt ? undefined : Date.now();
    persist(entries.map((item) => (
      item.id === entry.id
        ? { ...item, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
        : item
    )));
  };

  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [entries]);
  const roleTypeOptions = useMemo(() => {
    const entryTypes = roleEntries.map((entry) => normalizeWorkbenchRoleType(parseRoleContent(entry.content).type)).filter(Boolean);
    const hidden = new Set(hiddenRoleTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...customRoleTypes.map((type) => normalizeWorkbenchRoleType(type)).filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
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

  const renderFieldSizeButton = () => (
    <button
      type="button"
      onClick={() => setIsFieldSizeSettingsOpen(true)}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]"
      aria-label={`${fieldSizeTabLabel}字段尺寸`}
    >
      <Settings className="h-4 w-4" />
      字段尺寸
    </button>
  );

  const topTabs = isSettingLibraryPanel ? null : (
    <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2">
      {normalizedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setRememberedActiveTab(tab)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === tab ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          {getWorkbenchTabDisplayLabel(tab)}
        </button>
      ))}
    </div>
  );

  const renderTopTabs = () => (
    normalizedTabs.length <= 1 || !topTabs
      ? null
      : (
    tabPortalTarget
      ? createPortal(topTabs, tabPortalTarget)
      : <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">{topTabs}</div>
      )
  );

  const fieldSizeSettingsModal = isFieldSizeSettingsOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/30 p-4"
      onClick={() => setIsFieldSizeSettingsOpen(false)}
    >
      <section
        data-draggable-managed="true"
        onClick={(event) => event.stopPropagation()}
        className="modal-sharp flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        style={fieldSizeSettingsDraggable.style}
      >
        <header
          {...fieldSizeSettingsDraggable.dragHandleProps}
          className="flex shrink-0 cursor-move items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"
          style={fieldSizeSettingsDraggable.dragHandleProps.style}
        >
          <div>
            <h3 className="text-base font-black text-slate-900">{fieldSizeTabLabel}字段尺寸</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">只显示当前页面可调字段，调整后会自动保存。</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFieldSizeSettingsOpen(false)}
            data-no-modal-drag="true"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="关闭字段尺寸"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {visibleFieldSizeKeys.map((key) => {
              const spec = fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key];
              return (
                <article key={key} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[130px_repeat(3,minmax(0,1fr))_220px] lg:items-center">
                  <div className="text-sm font-black text-slate-900">{getWorkbenchFieldSizeLabel(key)}</div>
                  <FieldSizeNumberInput
                    label="宽度"
                    prop="width"
                    value={spec.width}
                    onChange={(value) => updateFieldSizeSpec(key, 'width', value)}
                  />
                  <FieldSizeNumberInput
                    label="高度"
                    prop="height"
                    value={spec.height}
                    onChange={(value) => updateFieldSizeSpec(key, 'height', value)}
                  />
                  <FieldSizeNumberInput
                    label="字号"
                    prop="fontSize"
                    value={spec.fontSize}
                    onChange={(value) => updateFieldSizeSpec(key, 'fontSize', value)}
                  />
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-custom-field-size xy-has-value" style={getWorkbenchFieldSizeStyle(spec)}>
                    <input readOnly value={getWorkbenchFieldSizeLabel(key)} />
                    <label>{getWorkbenchFieldSizeLabel(key)}</label>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <footer className="flex shrink-0 justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={resetFieldSizeSpecs}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={() => setIsFieldSizeSettingsOpen(false)}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  ) : null;

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
      {entryMenu.tab === ROLE_TAB && shouldShowRolePinAction(entryMenu.roleType) && (
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {roleHistoryModal}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        <div
          className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 8px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-4 pb-3 pt-2">
            <div className="flex shrink-0 gap-2">
              <div
                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleSearch.trim() ? 'xy-has-value' : ''}`}
                style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
              >
                <input
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="搜索角色..."
                />
                <label>搜索角色</label>
              </div>
              <button className="h-11 min-w-[64px] shrink-0 whitespace-nowrap rounded-2xl bg-brand px-4 text-sm font-bold text-white">搜索</button>
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
                        {group.entries.map((entry) => {
                          const showPinAction = shouldShowRolePinAction(group.type);
                          return (
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
                              {showPinAction && (
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
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex shrink-0 flex-col gap-2">
              <div className="flex gap-2">
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleTypeDraft.trim() ? 'xy-has-value' : ''}`}
                  style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
                >
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
                  className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  新建分类
                </button>
              </div>
              <div className="flex gap-2">
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleNameDraft.trim() ? 'xy-has-value' : ''}`}
                  style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
                >
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
                <button onClick={() => addRole('未分类')} className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark">
                  新建角色
                </button>
              </div>
            </div>
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col overflow-hidden bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
            {selectedEntry && selectedRole ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                  <div className="flex min-h-full flex-col gap-8">
                    <div className="grid shrink-0 grid-cols-3 items-center gap-2">
                      <div
                        className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${selectedEntry.title.trim() ? 'xy-has-value' : ''}`}
                        style={getFieldSizeStyle('roleDetailName')}
                      >
                        <input
                          value={selectedEntry.title}
                          onChange={(event) => updateSelectedRoleTitle(event.target.value)}
                          placeholder="角色名"
                        />
                        <label>角色名</label>
                      </div>
                      <div className="min-w-0">
                        <CapsuleSelect
                          floatingLabel="分类"
                          className="xy-capsule-custom-field-size xy-capsule-align-with-field"
                          style={getFieldSizeStyle('roleDetailName')}
                          value={selectedRole.type}
                          onChange={(value) => updateRole({ type: value })}
                          options={roleTypeOptions.map((type) => ({
                            value: type,
                            label: type,
                            disabled:
                              selectedRole.type !== '男主' &&
                              normalizeWorkbenchRoleType(type) === '男主' &&
                              !canCreateWorkbenchRoleInType(
                                roleEntries
                                  .filter((entry) => entry.id !== selectedEntry.id)
                                  .map((entry) => parseRoleContent(entry.content).type),
                                type,
                              ),
                          }))}
                          buttonClassName="h-11 rounded-xl px-4 text-sm"
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`inline-flex h-11 w-full rounded-[20px] p-1 ${
                            selectedRoleIsMaleProtagonist ? 'bg-slate-200 opacity-80' : 'bg-slate-100'
                          }`}
                          title={selectedRoleIsMaleProtagonist ? '男主必定是存活状态' : undefined}
                        >
                          {(['存活', '死亡'] as const).map((status) => {
                            const active = selectedRoleLifeStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                disabled={selectedRoleIsMaleProtagonist}
                                onClick={() => {
                                  if (!selectedRoleIsMaleProtagonist) updateRole({ lifeStatus: status });
                                }}
                                className={`flex-1 rounded-2xl text-base font-black transition-colors ${
                                  selectedRoleIsMaleProtagonist
                                    ? active
                                      ? 'cursor-not-allowed bg-slate-300 text-slate-600 shadow-none'
                                      : 'cursor-not-allowed text-slate-400'
                                    : active
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
            <div className="flex items-center justify-between gap-3">
              <h3 className="shrink-0 text-base font-bold text-gray-900">角色生成</h3>
              {renderFieldSizeButton()}
            </div>
            <div className="mt-4 space-y-3">
              <div
                className={`grid ${PROMPT_SELECT_COLUMNS} max-w-full items-start gap-2 text-sm text-gray-500`}
                style={getConfigFieldSizeStyle(ROLE_TAB, 'model')}
              >
                <CapsuleSelect
                  floatingLabel="模型"
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ modelId: value })}
                  options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  className="xy-capsule-custom-field-size xy-capsule-fill min-w-0"
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'models' })}
                />
              </div>
              <div
                className={`grid ${PROMPT_SELECT_COLUMNS} max-w-full items-start gap-2 text-sm text-gray-500`}
                style={getConfigFieldSizeStyle(ROLE_TAB, 'prompt')}
              >
                <CapsuleSelect
                  floatingLabel="提示词"
                  value={activeTabConfig.promptId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ promptId: value })}
                  disabled={Boolean(activeTabConfig.promptDisabled)}
                  disabledLabel="提示词已禁用"
                  className="xy-capsule-custom-field-size xy-capsule-fill min-w-0"
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  options={rolePromptOptions.length === 0 ? [{ value: '', label: '暂无设定提示词', disabled: true }] : rolePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'prompts', category: PROMPT_SETTING_CATEGORY })}
                  disableToggleActive={Boolean(activeTabConfig.promptDisabled)}
                  onDisableToggle={() => updateActiveTabConfig({ promptDisabled: !activeTabConfig.promptDisabled })}
                />
              </div>
            </div>
            <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count mt-5 min-h-0 flex-1 ${aiOutput.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                value={aiOutput}
                onChange={(event) => setAiOutput(event.target.value)}
                placeholder="AI输出框"
                className="editor-scrollbar"
              />
              <label>AI对话框</label>
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
    const rightSelectFieldTab = activeIsBrainstorm ? BRAINSTORM_TAB : (activeTab === ROLE_TAB ? ROLE_TAB : SETTING_TAB);
    const showInlineLibraryAiLogButton = activeTab === SETTING_TAB;
    const showHeaderLibraryAiLogButton = activeIsBrainstorm;
    const showPanelHeader = activeTab !== SETTING_TAB || showHeaderLibraryAiLogButton;
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
              <AiRequestLogGroups groups={buildLibraryLogGroups(visibleAiRequestLog)} />
            </div>
          </div>
      </LibraryAiLogShell>
    ) : null;
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
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
          className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
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

          <div className={`${activeIsBrainstorm ? 'mt-0' : 'mt-2.5'} min-h-0 flex-1 overflow-y-auto space-y-2`}>
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
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-brainstorm-preview-field xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${currentBrainstormBody.trim() ? 'xy-has-value' : ''}`}>
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
              <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                  <div
                    className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size ${currentSelectedEntry.title.trim() ? 'xy-has-value' : ''}`}
                    style={getFieldSizeStyle('settingName')}
                  >
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
              <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                  <div
                    className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size"
                    style={getFieldSizeStyle('settingName')}
                  >
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
            {showPanelHeader && (
            <div className="flex items-center justify-between gap-3">
              {activeTab !== SETTING_TAB ? (
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="shrink-0 text-base font-bold text-gray-900">{panelTitle}</h3>
                </div>
              ) : <div />}
              <div className="flex shrink-0 items-center gap-2">
                {showHeaderLibraryAiLogButton && (
                  <button
                    type="button"
                    onClick={() => setIsLibraryAiLogOpen(true)}
                    className="h-9 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand"
                  >
                    输出日志
                  </button>
                )}
                {renderFieldSizeButton()}
              </div>
            </div>
            )}
            <div className={`${showPanelHeader ? 'mt-4' : ''} space-y-3`}>
              <div className="flex max-w-full items-start gap-2">
              <div className="max-w-full" style={getConfigFieldSizeStyle(rightSelectFieldTab, 'model')}>
                <div className={`grid ${showPromptDisableButton ? PROMPT_SELECT_COLUMNS : rightSelectColumns} items-start gap-2 text-sm text-gray-500`}>
                  <CapsuleSelect
                    floatingLabel="模型"
                    value={activeTabConfig.modelId ?? ''}
                    onChange={(value) => updateActiveTabConfig({ modelId: value })}
                    options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                    className="xy-capsule-custom-field-size xy-capsule-fill min-w-0"
                    buttonClassName="h-11 rounded-xl px-3 text-sm"
                    actionLabel="管理"
                    onActionClick={() => setManagementModal({ type: 'models' })}
                  />
                </div>
              </div>
              {showInlineLibraryAiLogButton && (
                <button
                  type="button"
                  onClick={() => setIsLibraryAiLogOpen(true)}
                  className="mt-2 h-12 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand"
                >
                  输出日志
                </button>
              )}
              </div>
              <div className="max-w-full" style={getConfigFieldSizeStyle(rightSelectFieldTab, 'prompt')}>
                <div className={`grid ${showPromptDisableButton ? PROMPT_SELECT_COLUMNS : rightSelectColumns} items-start gap-2 text-sm text-gray-500`}>
                  <CapsuleSelect
                    floatingLabel="提示词"
                    value={activePromptId ?? ''}
                    onChange={(value) => updateActiveTabConfig({ promptId: value })}
                    disabled={showPromptDisableButton && Boolean(activeTabConfig.promptDisabled)}
                    disabledLabel={showPromptDisableButton ? '提示词已禁用' : undefined}
                    className="xy-capsule-custom-field-size xy-capsule-fill min-w-0"
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
                    disableToggleActive={showPromptDisableButton && Boolean(activeTabConfig.promptDisabled)}
                    onDisableToggle={showPromptDisableButton ? () => updateActiveTabConfig({ promptDisabled: !activeTabConfig.promptDisabled }) : undefined}
                  />
                </div>
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
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full min-h-0 xy-has-value`}>
                <div
                  ref={libraryAiOutputRef}
                  onScroll={handleLibraryAiOutputScroll}
                  className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-gray-700"
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
                <label>AI对话框</label>
                <button
                  type="button"
                  onClick={clearLibraryAiDialog}
                  disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                  className="xy-floating-edge-tool text-sm font-bold text-red-500 hover:text-red-600 disabled:text-red-300"
                >
                  清空
                </button>
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
                      className="h-10 w-1/3 rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
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
    const getChapterSummaryDisplayTitle = (serialNumber: number) => isDetailOutlineTab ? `第${serialNumber}章章纲` : getChapterSummaryTitle(serialNumber);
    const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
    const getChapterSummaryEntry = (serialNumber: number) => (
      chapterEntries.find((entry) => entry.title === getChapterSummaryTitle(serialNumber) || entry.title === getChapterSummaryDisplayTitle(serialNumber))
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
        ? `第${chapter.serialNumber}章章纲（第${getVolumeDisplayIndex(volume.id)}卷）`
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
      updateActiveTabConfig({ selectedOutlineChapterId: chapterId });
      const entry = getChapterSummaryEntry(serialNumber);
      setSelectedId(entry?.id ?? null);
      setOutlinePreviewDraft(entry?.content ?? '');
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
    const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);
    const outlinePreviewTitle = plotPointStandalone ? '剧情点预览' : isDetailOutlineTab ? '章纲预览' : (safeOutlineSelectionType === 'volume' ? '卷概要预览' : '章节概要');
    const outlinePromptCategory = plotPointStandalone ? PLOT_CHAIN_PROMPT_CATEGORY : isDetailOutlineTab ? DETAIL_OUTLINE_TAB : '概要';
    const outlinePromptOptions = prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === outlinePromptCategory);
    const configuredOutlinePromptId = plotPointStandalone
      ? activeTabConfig.plotPointPromptId ?? activeTabConfig.promptId
      : isDetailOutlineTab
      ? activeTabConfig.detailOutlinePromptId ?? activeTabConfig.promptId
      : activeTabConfig.outlineSummaryPromptId ?? activeTabConfig.promptId;
    const activeOutlinePromptId = outlinePromptOptions.some((prompt) => prompt.id === configuredOutlinePromptId) ? configuredOutlinePromptId : '';
    const activeOutlinePrompt = outlinePromptOptions.find((prompt) => prompt.id === activeOutlinePromptId) ?? outlinePromptOptions[0] ?? null;
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
    const outlineModelFieldSizeKey: WorkbenchFieldSizeKey = isDetailOutlineTab ? 'detailOutlineModelSelect' : 'outlineSummaryModelSelect';
    const outlinePromptFieldSizeKey: WorkbenchFieldSizeKey = isDetailOutlineTab ? 'detailOutlinePromptSelect' : 'outlineSummaryPromptSelect';
    const outlineAiInput = activeTabConfig.outlineAiInput ?? '';
    const setOutlineAiInput = (value: string) => updateActiveTabConfig({ outlineAiInput: value });
    const detailOutlineReaderSettingItems = entries
      .filter((entry) => entry.tab === SETTING_TAB)
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
    const detailOutlineReaderRoleItems = entries
      .filter((entry) => entry.tab === ROLE_TAB)
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
    const inheritedDetailOutlineSettingIds = isDetailOutlineTab && activeTabConfig.detailOutlineReaderSettingIds === undefined
      ? detailOutlineReaderSettingItems.map((item) => item.id)
      : activeTabConfig.detailOutlineReaderSettingIds ?? [];
    const selectedDetailOutlineSettingIds = new Set(inheritedDetailOutlineSettingIds);
    const selectedDetailOutlineRoleIds = new Set(getInitialPlotChainRoleIds({
      configuredRoleIds: activeTabConfig.detailOutlineReaderRoleIds,
      plotPointStandalone,
      roles: detailOutlineReaderRoleItems,
    }));
    const detailOutlineReaderOutlineLimitSerial = selectedOutlineChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
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
    const selectedDetailOutlineOutlineIds = new Set(activeTabConfig.detailOutlineReaderOutlineIds ?? []);
    const selectedDetailOutlineSettingItems = detailOutlineReaderSettingItems.filter((item) => selectedDetailOutlineSettingIds.has(item.id));
    const selectedDetailOutlineRoleItems = detailOutlineReaderRoleItems.filter((item) => selectedDetailOutlineRoleIds.has(item.id));
    const selectedDetailOutlineOutlineItems = detailOutlineReaderOutlineItems.filter((item) => selectedDetailOutlineOutlineIds.has(item.id));
    const selectedDetailOutlineReaderItems = [...selectedDetailOutlineSettingItems, ...selectedDetailOutlineRoleItems, ...selectedDetailOutlineOutlineItems];
    const detailOutlineReaderWordCount = selectedDetailOutlineReaderItems.reduce((sum, item) => sum + countTextWords(item.content), 0);
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
      return [
        settingText ? `【关联设定】\n${settingText}` : '',
        roleText ? `【关联角色】\n${roleText}` : '',
        outlineText ? `【关联章纲】\n${outlineText}` : '',
      ].filter(Boolean).join('\n\n');
    };
    const openDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set(selectedDetailOutlineSettingIds));
      setDraftDetailOutlineReaderRoleIds(new Set(selectedDetailOutlineRoleIds));
      setDraftDetailOutlineReaderOutlineIds(new Set(selectedDetailOutlineOutlineIds));
      setDetailOutlineReaderTab('settings');
      setIsDetailOutlineReaderOpen(true);
    };
    const clearDraftDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
    };
    const confirmDetailOutlineReader = () => {
      const validSettingIds = detailOutlineReaderSettingItems.map((item) => item.id);
      const validRoleIds = detailOutlineReaderRoleItems.map((item) => item.id);
      const validOutlineIds = detailOutlineReaderOutlineItems.map((item) => item.id);
      const nextSettingIds = Array.from(draftDetailOutlineReaderSettingIds)
        .filter((id) => validSettingIds.includes(id));
      const nextRoleIds = Array.from(draftDetailOutlineReaderRoleIds)
        .filter((id) => validRoleIds.includes(id));
      const nextOutlineIds = Array.from(draftDetailOutlineReaderOutlineIds)
        .filter((id) => validOutlineIds.includes(id));
      updateActiveTabConfig({
        detailOutlineReaderSettingIds: nextSettingIds,
        detailOutlineReaderRoleIds: nextRoleIds,
        detailOutlineReaderOutlineIds: nextOutlineIds,
      });
      setIsDetailOutlineReaderOpen(false);
    };
    const clearDetailOutlineReaderSelection = () => {
      updateActiveTabConfig({
        detailOutlineReaderSettingIds: [],
        detailOutlineReaderRoleIds: [],
        detailOutlineReaderOutlineIds: [],
      });
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
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
    const outlinePreviewDraftContent = stripAiThinkingBlock(outlinePreviewDraft);
    const plotPointGeneratedCandidates = parseGeneratedPlotPointCandidates(plotPointGeneratedCandidateText);
    const normalizedGeneratedPlotPointCandidates = plotPointGeneratedCandidates.map((item) => ({
      ...item,
      source: plotPointSourceMode === 'library' ? '剧情库' as const : item.source,
    }));
    const plotPointLibraryCandidates = readPlotLibrarySnapshot().items
      .slice(0, 30)
      .map(plotLibraryItemToCandidate);
    const effectivePlotPointLibraryCandidates = plotPointLibraryCandidates.length > 0
      ? plotPointLibraryCandidates
      : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === '剧情库');
    const effectivePlotPointAiCandidates = normalizedGeneratedPlotPointCandidates.length > 0
      ? normalizedGeneratedPlotPointCandidates
      : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === 'AI生成');
    const plotPointCandidatePool = normalizedGeneratedPlotPointCandidates.length > 0
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
      ]
        .map((item) => [item.id, item]),
    );
    const plotPointSelectedItems = plotPointSelectedIds
      .map((id) => plotPointCandidateMap.get(id))
      .filter((item): item is WorkbenchPlotPointCandidate => Boolean(item));
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
        return next;
      });
      setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: false }));
    };
    const togglePlotPointPreviewExpanded = (id: string) => {
      setExpandedPlotPointPreviewIds((current) => (
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
      ));
    };
    const togglePlotPointOpeningElement = (element: string) => {
      setPlotPointOpeningElementsState((current) => {
        const next = current.includes(element)
          ? current.filter((item) => item !== element)
          : [...current, element];
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
        '请根据以下剧情链生成本章章纲，只输出适合写作执行的章纲要求，不要输出正文。',
        `当前目标：${selectedOutlineChapter ? `第${selectedOutlineChapter.chapter.serialNumber}章` : '当前章节'}`,
        `【剧情链】\n${chainText}`,
        selectedReaderContext ? `【关联内容】\n${selectedReaderContext}` : '',
      ].filter(Boolean).join('\n\n');
    };
    const openDetailOutlineFromPlotPoint = () => {
      const nextInput = buildPlotPointOutlineInput();
      if (!nextInput) return;
      updateActiveTabConfig({ outlineAiInput: nextInput });
      onOpenDetailOutlineFromPlotChain?.();
    };
    const getPlotPointGenerationRulesText = () => [
      `长度：${getPlotPointLengthLabel(plotPointLength)}。`,
      plotPointOpeningElements.length > 0 ? `类型：${plotPointOpeningElements.join('、')}。` : '类型：未指定。',
      `剧情点数量：${plotPointGenerateCount}个。`,
    ].join('\n');
    const buildPlotPointRequestText = (userText: string) => {
      const effectivePlotPointChainContext = plotPointGenerationModeRef.current === 'continue' ? plotPointChainContext : '';
      return [
        `【生成规则】\n${getPlotPointGenerationRulesText()}`,
        '【任务要求】\n请生成剧情点，不要直接写成完整正文。',
        plotPointProtagonistReplacementRule,
        '变量替换硬规则：输出里的角色、势力、道具、地点和外挂变量，必须优先替换成当前小说已关联设定/角色里的具体名称。',
        plotPointRoleNameHints ? `已关联角色名：${plotPointRoleNameHints}。例如主角叫“林刻”时，输出必须写“林刻”，不要写“主角”或照抄剧情库原角色名。` : '',
        plotPointSettingNameHints ? `已关联设定名：${plotPointSettingNameHints}。剧情库里的旧世界观、旧势力名、旧道具名只能当结构参考，不能原样照抄。` : '',
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
      ].filter(Boolean).join('\n\n');
    };
    const outlineDraftFrameTitle = plotPointStandalone
      ? selectedOutlineChapter
        ? `第${selectedOutlineChapter.chapter.serialNumber}章剧情点（第${getVolumeDisplayIndex(selectedOutlineChapter.volume.id)}卷）`
        : '剧情点预览'
      : safeOutlineSelectionType === 'volume' && selectedOutlineVolume
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
    const getOutlineFullContextTitle = () => {
      const baseTitle = getOutlineContextTitle();
      if (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0) return baseTitle;
      return `${baseTitle} + 读取${selectedDetailOutlineReaderItems.length}项`;
    };
    const getOutlineAiContext = () => {
      const selectedContext = getSelectedOutlineContext();
      const readerContext = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      if (isDetailOutlineTab) return readerContext;
      return [
        selectedContext ? `【所选章节正文】\n${selectedContext}` : '【所选章节正文】\n当前没有读取到正文内容。',
        readerContext,
      ].filter(Boolean).join('\n\n');
    };
    const getOutlineDefaultPrompt = () => (
      plotPointStandalone
        ? '请根据关联的大纲设定、前文章纲、剧情链和用户要求，生成适合本书下一步展开的剧情点。'
        : isDetailOutlineTab
        ? '请根据关联的设定和前文章纲生成章纲。'
        : '请根据所选章节正文生成章节概要。'
    );
    const buildOutlineAiRequestLog = (
      userText: string,
      contextText: string,
      promptText: string,
      createdAt = '当前预览',
    ): LibraryAiRequestLog => {
      const readerContextText = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      return {
        createdAt,
        tab: plotPointStandalone ? '生成剧情链' : isDetailOutlineTab ? '生成章纲' : '章节概要',
        modelName: selectedOutlineModel?.name ?? '未选择模型',
        promptName: activeOutlinePrompt?.name ?? '默认提示词',
        hasLinkedBrainstorm: false,
        linkedBrainstormTitle: '',
        visibleUserText: userText || '空内容',
        systemPrompt: promptText,
        userContent: userText,
        contextTitle: plotPointStandalone
          ? (selectedDetailOutlineReaderItems.length > 0 ? `已关联 ${selectedDetailOutlineReaderItems.length} 项` : '未关联设定')
          : getOutlineFullContextTitle(),
        contextText,
        contextWordCount: countTextWords(contextText),
        readerContextTitle: selectedDetailOutlineReaderItems.length > 0
          ? `已关联 ${selectedDetailOutlineReaderItems.length} 项`
          : '未关联设定',
        readerContextText,
        readerContextWordCount: countTextWords(readerContextText),
      };
    };
    const previewOutlineContextText = getOutlineAiContext();
    const previewOutlinePromptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
    const shouldShowOutlineBodyContext = !isDetailOutlineTab;
    const visibleOutlineAiRequestLog = (
      isLibraryAiLogOpen
        ? buildOutlineAiRequestLog(
          plotPointStandalone ? buildPlotPointRequestText(outlineAiInput.trim()) : outlineAiInput.trim(),
          previewOutlineContextText,
          previewOutlinePromptText,
        )
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
                {shouldShowOutlineBodyContext && (
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">关联正文</div>
                    <div className="mt-1 font-bold text-brand">{visibleOutlineAiRequestLog.contextTitle}</div>
                    <div className="mt-1 text-xs font-bold text-slate-400">{visibleOutlineAiRequestLog.contextWordCount ?? 0} 字</div>
                  </div>
                )}
                {isDetailOutlineTab && (
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">关联设定</div>
                    <div className={`mt-1 font-bold ${visibleOutlineAiRequestLog.readerContextText ? 'text-brand' : 'text-slate-500'}`}>
                      {visibleOutlineAiRequestLog.readerContextTitle ?? '未关联设定'}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">
                      {visibleOutlineAiRequestLog.readerContextWordCount ?? 0} 字
                    </div>
                  </div>
                )}
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">请输入内容</div>
                  <div className="mt-1 break-words font-bold text-slate-800">{visibleOutlineAiRequestLog.visibleUserText}</div>
                </div>
              </div>
            </aside>
            <div className="min-h-0 overflow-y-auto p-5">
              <AiRequestLogGroups
                groups={buildLibraryLogGroups(visibleOutlineAiRequestLog, {
                  includeContext: shouldShowOutlineBodyContext,
                  includeReaderContext: isDetailOutlineTab,
                  contextFallback: '未读取到正文内容',
                  userTitle: '输入内容',
                  expandReaderContextContent: plotPointStandalone,
                  expandAllContent: plotPointStandalone,
                })}
              />
            </div>
          </div>
      </LibraryAiLogShell>
    ) : null;
    const draftDetailOutlineReaderItems = [
      ...detailOutlineReaderSettingItems.filter((item) => draftDetailOutlineReaderSettingIds.has(item.id)),
      ...detailOutlineReaderRoleItems.filter((item) => draftDetailOutlineReaderRoleIds.has(item.id)),
      ...detailOutlineReaderOutlineItems.filter((item) => draftDetailOutlineReaderOutlineIds.has(item.id)),
    ];
    const draftDetailOutlineReaderWordCount = draftDetailOutlineReaderItems.reduce((sum, item) => sum + countTextWords(item.content), 0);
    const activeDetailOutlineReaderItems = detailOutlineReaderTab === 'settings'
      ? detailOutlineReaderSettingItems
      : detailOutlineReaderTab === 'roles'
      ? detailOutlineReaderRoleItems
      : detailOutlineReaderOutlineItems;
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
    const scrollDetailOutlineReaderItem = (id: string) => {
      document.getElementById(`detail-outline-reader-${detailOutlineReaderTab}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const setDraftDetailOutlineReaderIdsForActiveTab = (ids: Set<string>) => {
      if (detailOutlineReaderTab === 'settings') setDraftDetailOutlineReaderSettingIds(ids);
      else if (detailOutlineReaderTab === 'roles') setDraftDetailOutlineReaderRoleIds(ids);
      else setDraftDetailOutlineReaderOutlineIds(ids);
    };
    const getDraftDetailOutlineReaderIdsForActiveTab = () => (
      detailOutlineReaderTab === 'settings'
        ? draftDetailOutlineReaderSettingIds
        : detailOutlineReaderTab === 'roles'
        ? draftDetailOutlineReaderRoleIds
        : draftDetailOutlineReaderOutlineIds
    );
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
    const detailOutlineReaderModal = isDetailOutlineReaderOpen && isDetailOutlineTab ? createPortal(
      <div
        className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
        onClick={() => setIsDetailOutlineReaderOpen(false)}
      >
        <div
          className="modal-sharp adjustment-crisp flex h-[min(760px,86vh)] w-[min(1040px,92vw)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">关联设定</h3>
              <p className="mt-1 text-xs text-gray-400">选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailOutlineReaderOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-slate-50 px-5 py-3">
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-sm font-black">
              {([
                ['outlines', '章纲'],
                ['settings', '设定'],
                ['roles', '角色'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDetailOutlineReaderTab(tab)}
                  className={`h-10 rounded-xl px-5 transition-colors ${
                    detailOutlineReaderTab === tab
                      ? 'bg-[#08AACE] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={selectAllActiveDetailOutlineReaderItems}
                disabled={activeDetailOutlineReaderItems.length === 0}
                className="h-8 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              >
                关联所有
              </button>
              <div className="text-right text-xs font-bold text-slate-400">
                已选择 {draftDetailOutlineReaderItems.length} 项 · {draftDetailOutlineReaderWordCount} 字
              </div>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] bg-white">
            <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-3">
              <div className="mb-2 px-2 text-[15px] font-black text-slate-400">
                {detailOutlineReaderTab === 'settings' ? '设定导航' : detailOutlineReaderTab === 'roles' ? '角色导航' : '前文章纲'}
              </div>
              <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
                {detailOutlineReaderNavGroups.length === 0 ? (
                  <div className="rounded-xl bg-white px-3 py-4 text-xs font-bold leading-5 text-slate-400">
                    {detailOutlineReaderTab === 'settings'
                      ? '暂无设定分组'
                      : detailOutlineReaderTab === 'roles'
                      ? '暂无角色分组'
                      : '当前章节前面暂无可读章纲'}
                  </div>
                ) : detailOutlineReaderNavGroups.map((group) => {
                  const collapsed = collapsedDetailOutlineReaderGroups[`${detailOutlineReaderTab}:${group.group}`] ?? false;
                  return (
                    <div key={group.group} className="rounded-xl border border-[#cceef6] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => toggleDetailOutlineReaderGroup(group.group)}
                        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#E6F7FB] px-2 text-left text-[15px] font-black text-slate-700 hover:bg-[#d7f1f8]"
                      >
                        <span className="min-w-0 truncate">{group.group}</span>
                        <span className="flex shrink-0 items-center gap-1 text-[13px] text-slate-400">
                          {(detailOutlineReaderTab === 'settings' || detailOutlineReaderTab === 'roles') && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleActiveDetailOutlineReaderGroupSelection(group.items);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                event.stopPropagation();
                                toggleActiveDetailOutlineReaderGroupSelection(group.items);
                              }}
                              className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                            >
                              全选
                            </span>
                          )}
                          {group.items.length}
                          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                      {!collapsed && (
                        <div className="mt-1 space-y-1 bg-white">
                          {group.items.map((item) => {
                            const checked = detailOutlineReaderTab === 'settings'
                              ? draftDetailOutlineReaderSettingIds.has(item.id)
                              : detailOutlineReaderTab === 'roles'
                              ? draftDetailOutlineReaderRoleIds.has(item.id)
                              : draftDetailOutlineReaderOutlineIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  scrollDetailOutlineReaderItem(item.id);
                                  if (detailOutlineReaderTab === 'settings') toggleDraftDetailOutlineReaderSetting(item.id);
                                  else if (detailOutlineReaderTab === 'roles') toggleDraftDetailOutlineReaderRole(item.id);
                                  else toggleDraftDetailOutlineReaderOutline(item.id);
                                }}
                                className={`flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-[15px] font-black ${
                                  checked ? 'bg-[#FFF7ED] text-gray-900' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                              >
                                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                                  checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
                                }`}>
                                  ✓
                                </span>
                                <span className="min-w-0 truncate">{item.title}</span>
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
            <div className="editor-scrollbar min-h-0 overflow-y-auto p-5">
              <div className="grid gap-2">
                {activeDetailOutlineReaderItems.length === 0 && (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                    {detailOutlineReaderTab === 'settings'
                      ? '暂无可关联设定'
                      : detailOutlineReaderTab === 'roles'
                      ? '暂无可关联角色'
                      : '暂无可关联章纲'}
                  </div>
                )}
                {activeDetailOutlineReaderItems.map((item) => {
                  const checked = detailOutlineReaderTab === 'settings'
                    ? draftDetailOutlineReaderSettingIds.has(item.id)
                    : detailOutlineReaderTab === 'roles'
                    ? draftDetailOutlineReaderRoleIds.has(item.id)
                    : draftDetailOutlineReaderOutlineIds.has(item.id);
                  return (
                    <button
                      id={`detail-outline-reader-${detailOutlineReaderTab}-${item.id}`}
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (detailOutlineReaderTab === 'settings') toggleDraftDetailOutlineReaderSetting(item.id);
                        else if (detailOutlineReaderTab === 'roles') toggleDraftDetailOutlineReaderRole(item.id);
                        else toggleDraftDetailOutlineReaderOutline(item.id);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        checked
                          ? 'border-brand bg-[#FFF7ED] text-slate-900'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                      }`}
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-xs font-black ${
                        checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
                      }`}>
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-black">{item.title}</span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{item.group}</span>
                        </span>
                        <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-500">{item.content || '暂无内容'}</span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-slate-400">{countTextWords(item.content)} 字</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
            <div className="min-w-0 truncate text-sm font-bold text-gray-500">
              将读取 {draftDetailOutlineReaderItems.length} 项，共 {draftDetailOutlineReaderWordCount} 字
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearDraftDetailOutlineReader}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50"
              >
                清空
              </button>
              <button
                type="button"
                onClick={() => setIsDetailOutlineReaderOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDetailOutlineReader}
                className="rounded-xl bg-[#08AACE] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0798b8]"
              >
                确认读取
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    ) : null;
    const sendPlotPointAiMessage = async () => {
      const userText = plotPointInput.trim();
      const requestText = [
        '请根据关联的大纲设定、前文章纲和当前章节正文，生成本章剧情点。',
        '输出要求：按条列出关键剧情点，每条尽量包含冲突、行动、变化或伏笔，不要直接写成完整正文。',
        userText ? `补充要求：${userText}` : '',
      ].filter(Boolean).join('\n');
      if (isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setPlotPointOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastLibraryAiRequestLog(buildOutlineAiRequestLog(requestText, contextText, promptText, new Date().toLocaleString('zh-CN')));
      const controller = new AbortController();
      libraryAiAbortRef.current = controller;
      setIsLibraryAiLoading(true);
      setPlotPointOutput('正在思考...');
      setPlotPointGeneratedCandidateText('');
      setIsPlotPointPreviewCleared(true);
      try {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        content = await callModelStream({
          model: selectedOutlineModel,
          prompt: `${promptText}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`,
          userContent: requestText,
          chapterContext: contextText,
          recordType: 'stream',
          signal: controller.signal,
          onReasoning: (chunk) => {
            reasoningContent += chunk;
            setPlotPointOutput(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
          },
          onChunk: (chunk) => {
            content += chunk;
            setPlotPointOutput(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
            const nextCandidateText = stripAiThinkingBlock(content);
            setPlotPointGeneratedCandidateTextState(nextCandidateText);
            setIsPlotPointPreviewClearedState(parseGeneratedPlotPointCandidates(nextCandidateText).length === 0);
          },
        });
        if (reasoningContent.trim()) {
          content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
        }
        setPlotPointOutput(content);
        setPlotPointGeneratedCandidateText(stripAiThinkingBlock(content));
        setIsPlotPointPreviewCleared(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setPlotPointOutput((value) => value.trim() || '【已中止】本次生成已停止。');
        } else {
          const message = error instanceof Error ? error.message : '模型请求失败。';
          setPlotPointOutput(`【错误】${message}`);
        }
      } finally {
        if (libraryAiAbortRef.current === controller) libraryAiAbortRef.current = null;
        setIsLibraryAiLoading(false);
      }
    };
    const plotPointOutputContent = stripAiThinkingBlock(plotPointOutput);
    const plotPointOverlay = (
      <div
        className={plotPointStandalone ? 'flex min-h-0 flex-1 items-stretch justify-center bg-white' : 'modal-sharp fixed inset-0 z-[250] flex items-center justify-center bg-black/35 p-4'}
        onClick={plotPointStandalone ? undefined : () => setIsPlotPointModalOpen(false)}
      >
        <div
          className={plotPointStandalone ? 'flex h-full w-full flex-col overflow-hidden bg-white text-slate-900' : 'modal-sharp flex h-[min(760px,88vh)] w-[min(980px,92vw)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl'}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">生成剧情链</h3>
              <p className="mt-1 text-xs font-bold text-slate-400">关联内容与生成章纲一致，会带上大纲设定、前文章纲和当前章节正文。</p>
            </div>
            {!plotPointStandalone && (
              <button
                type="button"
                onClick={() => setIsPlotPointModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">章节</div>
                  <div className="mt-1 font-black text-slate-800">{getOutlineContextTitle()}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">模型</div>
                  <div className="mt-1 truncate font-black text-slate-800">{selectedOutlineModel?.name ?? '未选择模型'}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">提示词</div>
                  <div className="mt-1 truncate font-black text-slate-800">{activeOutlinePrompt?.name ?? '默认提示词'}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">关联设定</div>
                  <div className={`mt-1 font-black ${selectedDetailOutlineReaderItems.length > 0 ? 'text-[#08AACE]' : 'text-slate-500'}`}>
                    已关联 {selectedDetailOutlineReaderItems.length} 项
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{detailOutlineReaderWordCount} 字</div>
                </div>
                <button
                  type="button"
                  onClick={openDetailOutlineReader}
                  className="h-10 w-full rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                >
                  关联设定
                </button>
              </div>
            </aside>
            <main className="flex min-h-0 flex-col p-5">
              <div className="relative min-h-0 flex-1">
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full ${plotPointOutput.trim() ? 'xy-has-value' : ''}`}>
                  {plotPointOutput.startsWith('[[THINKING') ? (
                    <div className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-slate-600">
                      {renderAiChatContent(plotPointOutput)}
                    </div>
                  ) : (
                    <textarea
                      value={plotPointOutput}
                      onChange={(event) => {
                        setPlotPointOutput(event.target.value);
                        setPlotPointGeneratedCandidateText(event.target.value);
                        setIsPlotPointPreviewCleared(false);
                      }}
                      placeholder="生成后的剧情点会显示在这里，可以手动调整后复制到章纲要求里。"
                      className="editor-scrollbar text-sm leading-6 text-slate-600 outline-none"
                    />
                  )}
                  <label>剧情点预览</label>
                  <span className="xy-floating-count">{countTextWords(plotPointOutputContent)} 字</span>
                </div>
              </div>
              <div className="mt-3">
                <div className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${plotPointInput.trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    rows={1}
                    value={plotPointInput}
                    onChange={(event) => {
                      setPlotPointInput(event.target.value);
                      resizeFloatingAiTextarea(event.currentTarget);
                    }}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                        event.preventDefault();
                        void sendPlotPointAiMessage();
                      }
                    }}
                    className="editor-scrollbar"
                  />
                  <label>请输入剧情点要求</label>
                  <div className="xy-ai-inline-actions">
                    <button
                      type="button"
                      onClick={() => void sendPlotPointAiMessage()}
                      disabled={isLibraryAiLoading}
                      className="xy-ai-inline-send"
                    >
                      <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        libraryAiAbortRef.current?.abort();
                        setIsLibraryAiLoading(false);
                      }}
                      disabled={!isLibraryAiLoading}
                      className="xy-ai-inline-stop"
                    >
                      <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setOutlineAiInput(plotPointOutputContent);
                    setIsPlotPointModalOpen(false);
                  }}
                  disabled={!plotPointOutputContent.trim()}
                  className="min-w-0 flex-1 bg-[#08AACE] px-3 py-2 text-sm font-black text-white hover:bg-[#0798b8] disabled:bg-slate-300"
                >
                  放入章纲要求
                </button>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(plotPointOutputContent)}
                  disabled={!plotPointOutputContent.trim()}
                  className="min-w-0 flex-1 border-l border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                >
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlotPointOutput('');
                    setPlotPointGeneratedCandidateText('');
                    setIsPlotPointPreviewCleared(true);
                  }}
                  className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700"
                >
                  清空
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
    const plotPointModal = isPlotPointModalOpen && isDetailOutlineTab && !plotPointStandalone
      ? createPortal(plotPointOverlay, document.body)
      : null;
    const sendOutlineAiMessage = async () => {
      const userText = outlineAiInput.trim();
      const requestText = plotPointStandalone
        ? buildPlotPointRequestText(userText)
        : userText || (isDetailOutlineTab ? '请根据关联的设定和前文章纲生成本章章纲。' : '');
      if (!requestText || isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setOutlinePreviewDraft('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = plotPointStandalone
        ? `${activeOutlinePrompt?.content ?? getOutlineDefaultPrompt()}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`
        : activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastLibraryAiRequestLog(buildOutlineAiRequestLog(requestText, contextText, promptText, new Date().toLocaleString('zh-CN')));
      const controller = new AbortController();
      libraryAiAbortRef.current = controller;
      setIsLibraryAiLoading(true);
      setOutlineAiInput('');
      setOutlinePreviewDraft('正在思考...');
      if (plotPointStandalone) {
        setPlotPointGeneratedCandidateText('');
        setIsPlotPointPreviewCleared(true);
      }
      try {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        content = await callModelStream({
          model: selectedOutlineModel,
          prompt: promptText,
          userContent: requestText,
          chapterContext: contextText,
          recordType: 'stream',
          signal: controller.signal,
          onReasoning: (chunk) => {
            reasoningContent += chunk;
            setOutlinePreviewDraftState(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
          },
          onChunk: (chunk) => {
            content += chunk;
            setOutlinePreviewDraftState(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false));
            if (plotPointStandalone) {
              const nextCandidateText = stripAiThinkingBlock(content);
              setPlotPointGeneratedCandidateTextState(nextCandidateText);
              setIsPlotPointPreviewClearedState(parseGeneratedPlotPointCandidates(nextCandidateText).length === 0);
            }
          },
        });
        if (reasoningContent.trim()) {
          content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
        }
        setOutlinePreviewDraft(content);
        if (plotPointStandalone) {
          setPlotPointGeneratedCandidateText(stripAiThinkingBlock(content));
          setIsPlotPointPreviewCleared(false);
        }
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
      if (plotPointStandalone) {
        setOutlinePreviewDraft('');
        return;
      }
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

    const plotPointLinkedSettingSummary = selectedDetailOutlineReaderItems.length > 0
      ? selectedDetailOutlineReaderItems.map((item) => item.title).join('、')
      : '未关联大纲设定';
    const plotPointUserRequirementSummary = plotPointOpeningElements.length > 0
      ? plotPointOpeningElements.join('、')
      : '未选择';
    if (plotPointStandalone) {
      return (
        <div className="flex min-h-0 flex-1 flex-col bg-[#f6f8fb]" style={scaleStyle}>
          {fieldSizeSettingsModal}
          {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
          {outlineAiLogModal}
          {detailOutlineReaderModal}
          <main className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_360px] gap-4 overflow-hidden p-4">
            <aside className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
              <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5">
                  {PLOT_POINT_CHAIN_SLOTS.map((slot) => {
                    const active = plotPointActiveChainSlot === slot;
                    const hasContent = plotPointChainSelections[slot].length > 0;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setActivePlotPointChainSlot(slot)}
                        title={`剧情链 ${slot}`}
                        className={`relative grid h-7 w-7 place-items-center rounded-lg text-xs font-black transition-colors ${
                          active
                            ? 'bg-[#08AACE] text-white'
                            : hasContent
                            ? 'border border-[#bdeef7] bg-[#EAF9FD] text-[#08AACE] hover:border-[#08AACE]'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]'
                        }`}
                      >
                        {slot}
                        {hasContent && !active && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#08AACE]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-950">剧情链</h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#08AACE]">{plotPointSelectedItems.length} 点</span>
                    <button
                      type="button"
                      onClick={openDetailOutlineFromPlotPoint}
                      disabled={plotPointSelectedItems.length === 0}
                      className="h-8 rounded-xl bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#0798b8] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      生成章纲
                    </button>
                  </div>
                </div>
              </div>
              <div className="editor-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                {plotPointSelectedItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
                    先在右侧关联设定，再选择剧情点来源和剧情点类型。选中的剧情点会加入当前数字剧情链。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plotPointSelectedItems.map((item, index) => {
                      const collapsedCard = prepareCollapsedPlotPointCard(item);
                      const scoreText = item.score ?? collapsedCard.averageScore;
                      const metrics = getWorkbenchPlotPointDecisionMetrics(item, scoreText, index > 0, index);
                      const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                      const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                      return (
                      <div key={item.id} className="rounded-xl border border-[#bdeef7] bg-[#EAF9FD] p-3">
                        <div className="flex items-start gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#08AACE] text-xs font-black text-white">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="min-w-0 truncate text-sm font-black text-slate-950">剧情点 {index + 1}</span>
                              {scoreText && (
                                <span className={`shrink-0 text-xs font-black ${getPlotPointScoreColorClass(scoreText)}`}>
                                  {scoreText}分
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${getWorkbenchPlotPointFitClass(metrics.fit)}`}>
                                {index === 0 ? '链头' : getWorkbenchPlotPointFitLabel(metrics.fit, true)}
                              </span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-500">潜力 {metrics.potential}</span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{item.source}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => togglePlotPointCandidate(item.id)} className="shrink-0 text-xs font-black text-red-500">移除</button>
                        </div>
                        <p className="mt-2 line-clamp-3 text-xs font-bold leading-5 text-slate-600">{displayText}</p>
                        <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                          {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                <div>
                  <h2 className="text-sm font-black text-slate-950">剧情点预览</h2>
                  <p className="text-xs font-bold text-slate-400">
                    {isPlotPointFollowupStage ? `衔接「${firstPlotPointChainTitle}」` : hasPlotPointChain ? '等待手动刷新衔接剧情' : '生成候选剧情点'} · {plotPointGenerateCount} 个
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
              </div>
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
                    const metrics = getWorkbenchPlotPointDecisionMetrics(item, averageScore, hasPlotPointChain, index);
                    const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                    const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                    const fitLabel = getWorkbenchPlotPointFitLabel(metrics.fit, hasPlotPointChain);
                    const metricItems = [
                      ['内容', metrics.clarity],
                      ['潜力', metrics.potential],
                      [hasPlotPointChain ? '衔接' : '开端', metrics.fit],
                    ] as const;
                    return (
                      <div key={item.id} className={`rounded-xl border p-3 shadow-sm transition-colors ${selected ? 'border-[#08AACE] bg-[#EAF9FD] ring-2 ring-[#bdeef7]' : 'border-slate-200 bg-white hover:border-[#bdeef7]'}`}>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className="min-w-0 max-w-full truncate text-base font-black text-slate-950">剧情点 {index + 1}</span>
                              {averageScore && (
                                <span className={`shrink-0 rounded-full bg-white px-2 py-1 text-xs font-black ${getPlotPointScoreColorClass(averageScore)}`}>
                                  {averageScore}分
                                </span>
                              )}
                              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${getWorkbenchPlotPointFitClass(metrics.fit)}`}>
                                {fitLabel} {metrics.fit}
                              </span>
                              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]">{item.source}</span>
                            </div>
                            <p className={`mt-2 text-[14.4px] font-bold leading-[24px] ${expanded ? '' : 'line-clamp-3'} ${selected ? 'text-slate-800' : 'text-slate-600'}`}>{displayText}</p>
                            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                              {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                            </div>
                          </div>
                          <div className="flex w-[118px] shrink-0 flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedPlotPointPreviewIds((current) => (
                                    current.includes(item.id)
                                      ? current.filter((candidateId) => candidateId !== item.id)
                                      : [...current, item.id]
                                  ));
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
                                <div key={label} className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2 text-[11px] font-black">
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
            </section>

            <aside className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
                <section className="shrink-0 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-black text-slate-950">生成配置</div>
                      {renderFieldSizeButton()}
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_88px] items-start gap-2">
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
                        className="mt-2 h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#08AACE]"
                      >
                        输出日志
                      </button>
                    </div>
                    <CapsuleSelect
                      floatingLabel="提示词"
                      value={activeOutlinePromptId ?? ''}
                      onChange={updateOutlinePromptId}
                      options={outlinePromptOptions.length === 0 ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }] : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                      buttonClassName="h-11 rounded-xl px-3 text-sm"
                      actionLabel="管理"
                      onActionClick={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
                    />
                    <div className="pt-1 text-sm font-black text-slate-950">生成规则</div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {([
                          ['short', '短'],
                          ['medium', '中'],
                          ['long', '长'],
                        ] as const).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPlotPointLength(key)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointLength === key ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
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
                              plotPointOpeningElements.includes(element) ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
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
                              plotPointOpeningElements.includes(element) ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
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
                              plotPointGenerateCount === count ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {count}个
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5">
                  <div className="absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950">AI对话框</div>
                  <button type="button" onClick={clearOutlinePreviewDraft} className="absolute -top-2 right-4 bg-white px-1 text-xs font-black text-red-500">清空</button>
                  <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-600">
                    {outlinePreviewDraft.trim() ? renderAiChatContent(outlinePreviewDraft) : null}
                  </div>
                  {selectedDetailOutlineReaderItems.length > 0 ? (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={openDetailOutlineReader}
                          className="h-10 min-w-[112px] px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
                          title={plotPointLinkedSettingSummary}
                        >
                          已关联
                        </button>
                        <button
                          type="button"
                          onClick={clearDetailOutlineReaderSelection}
                          className="flex h-10 w-12 items-center justify-center bg-red-500 text-white hover:bg-red-600"
                          title="取消关联"
                          aria-label="取消关联"
                        >
                          <X className="h-5 w-5 stroke-[2.4]" />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1 truncate text-sm font-black text-[#08AACE]">
                        已关联：{detailOutlineReaderWordCount}字
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center">
                      <button
                        type="button"
                        onClick={openDetailOutlineReader}
                        className="h-10 min-w-[124px] rounded-xl border border-[#08AACE] bg-white px-5 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                      >
                        关联
                      </button>
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
                          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
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
                          disabled={isLibraryAiLoading}
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
                </section>
              </div>
            </aside>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) && !plotPointStandalone && renderTopTabs()}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {outlineAiLogModal}
        {plotPointModal}
        {detailOutlineReaderModal}
        <div
          className="relative grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{ gridTemplateColumns: `${outlineSidebarWidth}px 8px minmax(0,1fr) 8px ${settingLibraryRightWidth}px` }}
        >
            <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ? '章纲目录' : '章节概要'}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {renderFieldSizeButton()}
                <button
                  onClick={() => setIsOutlineSettingsOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
                  title={isDetailOutlineTab ? '章纲设置' : '概要设置'}
                  aria-label={isDetailOutlineTab ? '章纲设置' : '概要设置'}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
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
          <div className={`editor-scrollbar min-h-0 flex-1 overflow-y-auto ${isDetailOutlineTab ? '-mr-4 pr-4 pt-2.5' : 'pt-5'}`}>
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
                  const detailOutlineHeight = isDetailOutlineTab ? getDetailOutlinePreviewHeight(outlineCardContent) : undefined;
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
                        onScroll={isDetailOutlineTab ? () => handleDetailOutlineTextareaScroll(chapter.id) : undefined}
                        placeholder={isDetailOutlineTab ? '该章章纲会显示在这里，可由 AI 根据章节内容生成。' : '该章概要会显示在这里，可由 AI 根据章节内容生成。'}
                        className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none ${
                          isDetailOutlineTab
                            ? `scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`
                            : 'editor-scrollbar h-36'
                        }`}
                        style={isDetailOutlineTab ? {
                          height: detailOutlineHeight,
                          maxHeight: DETAIL_OUTLINE_PREVIEW_MAX_HEIGHT,
                          overflowY: 'auto',
                        } : undefined}
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
              <div className="max-w-full" style={getFieldSizeStyle(outlineModelFieldSizeKey)}>
                <CapsuleSelect
                  floatingLabel="模型"
                  value={activeTabConfig.modelId ?? ''}
                  onChange={(value) => updateActiveTabConfig({ modelId: value })}
                  options={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'models' })}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryAiLogOpen(true)}
                className="mt-2 h-12 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand"
              >
                输出日志
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_96px] items-start gap-2 text-sm text-gray-500">
              <div className="max-w-full" style={getFieldSizeStyle(outlinePromptFieldSizeKey)}>
                <CapsuleSelect
                  floatingLabel="提示词"
                  value={activeOutlinePromptId ?? ''}
                  onChange={updateOutlinePromptId}
                  options={outlinePromptOptions.length === 0 ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }] : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  buttonClassName="h-11 rounded-xl px-3 text-sm"
                  actionLabel="管理"
                  onActionClick={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
                />
              </div>
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
                  placeholder={plotPointStandalone ? '生成后的剧情点会显示在这里，也可以手动编辑后复制。' : isDetailOutlineTab ? '生成后的章纲会显示在这里，也可以手动编辑后保存。' : '生成后的概要会显示在这里，也可以手动编辑后保存。'}
                  className="editor-scrollbar text-sm leading-6 text-gray-600 outline-none"
                />
                <label>{outlineDraftFrameTitle}</label>
                <span className="xy-floating-count">{countTextWords(outlinePreviewDraftContent)} 字</span>
              </div>
            </div>
          )}
          {isDetailOutlineTab && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={openDetailOutlineReader}
                className={`h-9 shrink-0 rounded-xl px-4 text-sm font-black transition-colors ${
                  selectedDetailOutlineReaderItems.length > 0
                    ? 'bg-[#08AACE] text-white hover:bg-[#0798b8]'
                    : 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'
                }`}
              >
                关联设定
              </button>
              <div className="min-w-0 truncate text-right text-xs font-bold text-slate-400">
                已关联 {selectedDetailOutlineReaderItems.length} 项 · {detailOutlineReaderWordCount} 字
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
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void sendOutlineAiMessage();
                  }
                }}
                className="editor-scrollbar"
              />
              <label>{plotPointStandalone ? '请输入剧情点要求' : '请输入要求'}</label>
              <div className="xy-ai-inline-actions">
                <button
                  type="button"
                  onClick={() => void sendOutlineAiMessage()}
                  disabled={isLibraryAiLoading || (!plotPointStandalone && !outlineAiInput.trim() && (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0))}
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
              onClick={() => {
                if (plotPointStandalone) setOutlineAiInput(stripAiThinkingBlock(outlinePreviewDraft));
                else saveOutlinePreviewDraft();
              }}
              disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
              className="min-w-0 flex-1 bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              {plotPointStandalone ? '放入章纲要求' : '保存'}
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
                <h3 className="text-base font-bold text-slate-900">{isDetailOutlineTab ? '章纲设置' : '概要设置'}</h3>
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
                <p className="mt-4 text-xs leading-5 text-slate-400">可设置为每行 5-10 个章节，左侧{isDetailOutlineTab ? '章纲目录' : '章节概要'}区域宽度会同步调整。</p>
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
