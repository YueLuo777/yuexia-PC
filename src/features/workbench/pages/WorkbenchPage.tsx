import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

import { ChapterEditor } from '@/features/workbench/components/ChapterEditor';
import { ChapterRecycleModal } from '@/features/workbench/components/ChapterRecycleModal';
import { ChapterSidebar } from '@/features/workbench/components/ChapterSidebar';
import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PublishedSidebar } from '@/features/workbench/components/PublishedSidebar';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import { WorkbenchAIPanel, type WorkbenchLinkedContextItem, type WorkbenchLinkedContextSource } from '@/features/workbench/components/WorkbenchAIPanel';
import { WorkbenchHeader, type WorkbenchHeaderFlowStats } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchLibraryPanel } from '@/features/workbench/components/WorkbenchLibraryPanel';
import { WorkbenchModal } from '@/features/workbench/components/WorkbenchModal';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import {
  WORKBENCH_HEADER_FLOW_ITEMS,
  isWorkbenchCreationFlowPageKey,
  type WorkbenchCreationFlowPageKey,
} from '@/features/workbench/model/workbenchCreationFlow';
import {
  clearWorkbenchLinkedContextItems,
  readWorkbenchLinkedContextItems,
  writeWorkbenchLinkedContextItems,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { WordCountText } from '@/shared/ui/WordCountText';
import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

type ModalKey = 'workInfo' | 'notes' | 'settingLibrary' | 'detailOutlineLibrary';
type ManagementModalKey = 'models' | 'agents';
type FindScope = 'chapter' | 'book';
type ChapterExportFormat = 'txt' | 'doc';
type PendingPublish = { type: 'single'; volumeId: number; chapterId: number; title: string };
type MemoScope = 'global' | 'work';
type MemoItem = { id: string; title: string; content: string; updatedAt: string };
type ContextLibraryTab = 'outlineChapter' | 'setting' | 'role' | 'status';

const FIELD_SIZE_FLOW_IDS = new Set<WorkbenchCreationFlowPageKey>([
  'brainstorm',
  'outline',
  'chapterOutline',
  'polish',
  'audit',
  'comment',
  'status',
  'summary',
]);

interface ContextColumn {
  source: WorkbenchLinkedContextSource;
  title: string;
  subtitle: string;
  items: WorkbenchLinkedContextItem[];
}

interface ContextChapterPair {
  volumeId: number;
  volumeName: string;
  chapterId: number;
  serialNumber: number;
  title: string;
  isCurrent: boolean;
  chapterItem: WorkbenchLinkedContextItem;
  outlineItem: WorkbenchLinkedContextItem;
  summaryItem: WorkbenchLinkedContextItem | null;
}
interface ChapterExportItem {
  volumeId: number;
  volumeName: string;
  chapterId: number;
  serialNumber: number;
  title: string;
  content: string;
}
const AI_PANEL_MIN_WIDTH = 430;
const AI_PANEL_DEFAULT_WIDTH = 430;
const CHAPTER_SIDEBAR_MIN_WIDTH = 200;
const CHAPTER_SIDEBAR_MAX_WIDTH = 420;
const CHAPTER_SIDEBAR_DEFAULT_WIDTH = CHAPTER_SIDEBAR_MIN_WIDTH;
const PUBLISHED_SIDEBAR_MIN_WIDTH = 170;
const PUBLISHED_SIDEBAR_MAX_WIDTH = 360;
const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = PUBLISHED_SIDEBAR_MIN_WIDTH;
const FIND_REPLACE_DEFAULT_GEOMETRY = {
  x: 0,
  y: 0,
  width: 592,
};
const FIND_REPLACE_MODAL_STORAGE_ID = 'workbench_find_replace_centered_v2';
const CONTEXT_SETTING_TYPE_ORDER = [
  '核心设定',
  '剧情规划',
  '世界地图',
  '资源体系',
  '书写规则',
  '正派势力',
  '反派势力',
  '中立势力',
  '其他势力',
  '功法能力',
  '物品装备',
  '特殊资源',
  '主线伏笔',
  '人物伏笔',
  '已回收伏笔',
  '其他设定',
  '未分类',
];
const CONTEXT_ROLE_TYPE_ORDER = ['男主角', '女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色', '未分类'];

const PUBLISH_CONFIRM_KEY = 'xinyuexia_workbench_publish_confirm';
const GLOBAL_NOTES_KEY = 'xinyuexia_workbench_notes';
const WORK_NOTES_KEY_PREFIX = 'xinyuexia_workbench_notes_';
const GLOBAL_NOTES_LIST_KEY = 'xinyuexia_workbench_notes_list_v1';
const WORK_NOTES_LIST_KEY_PREFIX = 'xinyuexia_workbench_notes_list_v1_';
const APP_SCALE_KEY = 'xinyuexia_app_scale';
const APP_SCALE_VERSION_KEY = 'xinyuexia_app_scale_version';
const APP_SCALE_BASE = 1.1;
const APP_SCALE_STORAGE_VERSION = '2';
const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';

function getEffectiveAppScale() {
  if (typeof window === 'undefined') return APP_SCALE_BASE;
  const cssScale = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue(APP_EFFECTIVE_SCALE_CSS_VAR),
  );
  if (Number.isFinite(cssScale) && cssScale > 0) return cssScale;

  const savedScale = Number.parseFloat(localStorage.getItem(APP_SCALE_KEY) ?? '1');
  if (!Number.isFinite(savedScale)) return APP_SCALE_BASE;
  const isCurrentVersion = localStorage.getItem(APP_SCALE_VERSION_KEY) === APP_SCALE_STORAGE_VERSION;
  const effectiveScale = isCurrentVersion ? savedScale : savedScale * APP_SCALE_BASE;
  return Math.max(APP_SCALE_BASE, Math.min(APP_SCALE_BASE * 2, effectiveScale));
}

function getAiPanelMaxWidth() {
  if (typeof window === 'undefined') return AI_PANEL_DEFAULT_WIDTH;
  return Math.max(AI_PANEL_MIN_WIDTH, Math.floor(window.innerWidth / (3 * getEffectiveAppScale())));
}

function normalizeAiPanelWidth(value: number) {
  const maxWidth = getAiPanelMaxWidth();
  const minWidth = Math.min(AI_PANEL_MIN_WIDTH, maxWidth);
  if (!Number.isFinite(value)) return Math.min(AI_PANEL_DEFAULT_WIDTH, maxWidth);
  return Math.max(minWidth, Math.min(maxWidth, value));
}

function getChapterSidebarMaxWidth() {
  if (typeof window === 'undefined') return CHAPTER_SIDEBAR_DEFAULT_WIDTH;
  return Math.max(CHAPTER_SIDEBAR_MIN_WIDTH, Math.floor(window.innerWidth / (5 * getEffectiveAppScale())));
}

function normalizeChapterSidebarWidth(value: number) {
  const maxWidth = Math.min(CHAPTER_SIDEBAR_MAX_WIDTH, getChapterSidebarMaxWidth());
  const minWidth = Math.min(CHAPTER_SIDEBAR_MIN_WIDTH, maxWidth);
  if (!Number.isFinite(value)) return Math.min(CHAPTER_SIDEBAR_DEFAULT_WIDTH, maxWidth);
  return Math.max(minWidth, Math.min(maxWidth, value));
}

function normalizePublishedSidebarWidth(value: number) {
  if (!Number.isFinite(value)) return PUBLISHED_SIDEBAR_DEFAULT_WIDTH;
  return Math.max(PUBLISHED_SIDEBAR_MIN_WIDTH, Math.min(PUBLISHED_SIDEBAR_MAX_WIDTH, value));
}

function replaceAt(text: string, index: number, search: string, replacement: string) {
  return `${text.slice(0, index)}${replacement}${text.slice(index + search.length)}`;
}

function findOccurrences(text: string, search: string) {
  if (!search) return [];
  const result: number[] = [];
  let index = text.indexOf(search);
  while (index >= 0) {
    result.push(index);
    index = text.indexOf(search, index + Math.max(search.length, 1));
  }
  return result;
}

function getChapterExportTitle(item: Pick<ChapterExportItem, 'serialNumber' | 'title'>, workType: WorkbenchNovel['type']) {
  const chapterUnit = workType === 'script' ? '集' : '章';
  return `第${item.serialNumber}${chapterUnit}${item.title ? ` ${item.title}` : ''}`;
}

function sanitizeExportFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').trim() || '导出章节';
}

function escapeDocHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildChapterExportText(novelTitle: string, workType: WorkbenchNovel['type'], items: ChapterExportItem[]) {
  const lines: string[] = [`《${novelTitle}》`, ''];
  let currentVolumeId: number | null = null;

  items.forEach((item) => {
    if (currentVolumeId !== item.volumeId) {
      currentVolumeId = item.volumeId;
      lines.push(item.volumeName, '');
    }
    lines.push(getChapterExportTitle(item, workType));
    if (item.content.trim()) lines.push(item.content.trim());
    lines.push('');
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function buildChapterExportDoc(novelTitle: string, workType: WorkbenchNovel['type'], items: ChapterExportItem[]) {
  let currentVolumeId: number | null = null;
  const body: string[] = [`<h1>《${escapeDocHtml(novelTitle)}》</h1>`];

  items.forEach((item) => {
    if (currentVolumeId !== item.volumeId) {
      currentVolumeId = item.volumeId;
      body.push(`<h2>${escapeDocHtml(item.volumeName)}</h2>`);
    }
    body.push(`<h3>${escapeDocHtml(getChapterExportTitle(item, workType))}</h3>`);
    const paragraphs = item.content
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) {
      body.push('<p></p>');
      return;
    }
    paragraphs.forEach((paragraph) => {
      body.push(`<p>${escapeDocHtml(paragraph)}</p>`);
    });
  });

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: "Microsoft YaHei", SimSun, serif; font-size: 14pt; line-height: 1.85; color: #111827; }
    h1 { text-align: center; font-size: 22pt; margin: 0 0 28pt; }
    h2 { font-size: 17pt; margin: 24pt 0 12pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 6pt; }
    h3 { font-size: 15pt; margin: 18pt 0 10pt; }
    p { margin: 0 0 8pt; text-indent: 2em; }
  </style>
</head>
<body>
${body.join('\n')}
</body>
</html>`;
}

function formatMemoTime() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createMemoItem(scope: MemoScope, index: number, content = ''): MemoItem {
  return {
    id: `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${scope === 'global' ? '全局' : '作品'}备忘录 ${index}`,
    content,
    updatedAt: formatMemoTime(),
  };
}

function normalizeContextSource(tab: string): WorkbenchLinkedContextSource | null {
  const value = tab.trim();
  if (!value) return null;
  if (/角色|角色库|瑙掕壊/.test(value)) return 'role';
  if (/章纲|细纲|章节细纲|章节章纲|绔犵翰|缁嗙翰/.test(value)) return 'outline';
  if (/梗概|摘要|概要|章节梗概|章节摘要|章节概要|卷梗概|卷摘要|卷概要|姒傝|鍗锋/.test(value)) return 'summary';
  if (/设定|设定库|大纲|澶х翰|璁惧畾/.test(value)) return 'setting';
  return null;
}

function isContextOutlineEntry(entry: WorkbenchLibraryEntry) {
  return normalizeContextSource(`${entry.tab} ${entry.title} ${entry.type ?? ''}`) === 'outline';
}

function isContextSummaryEntry(entry: WorkbenchLibraryEntry) {
  return normalizeContextSource(`${entry.tab} ${entry.title} ${entry.type ?? ''}`) === 'summary';
}

function getContextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

function hasContextContent(item: WorkbenchLinkedContextItem | null | undefined) {
  return Boolean(item && getContextWordCount(item.content) > 0);
}

function getContextItemsWordCount(items: WorkbenchLinkedContextItem[], source?: WorkbenchLinkedContextSource) {
  return items
    .filter((item) => !source || item.source === source)
    .reduce((sum, item) => sum + getContextWordCount(item.content), 0);
}

function getPreferredChapterNarrativeItem(row: ContextChapterPair) {
  if (hasContextContent(row.chapterItem)) return row.chapterItem;
  if (hasContextContent(row.summaryItem)) return row.summaryItem;
  return null;
}

function keepExclusiveChapterNarrativeItems(
  rows: ContextChapterPair[],
  items: WorkbenchLinkedContextItem[],
) {
  const ids = new Set(items.map((item) => item.id));
  rows.forEach((row) => {
    if (!row.summaryItem) return;
    if (!ids.has(row.chapterItem.id) || !ids.has(row.summaryItem.id)) return;
    const preferred = getPreferredChapterNarrativeItem(row);
    if (preferred?.id === row.summaryItem.id) ids.delete(row.chapterItem.id);
    else ids.delete(row.summaryItem.id);
  });
  return items.filter((item) => ids.has(item.id));
}

function ContextSourceWordStatus({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  if (value <= 0) {
    return <span className="font-black text-red-500">无{label}</span>;
  }
  return (
    <>
      <span className="shrink-0">{label}</span>
      <WordCountText value={value} compact />
    </>
  );
}

function ContextSourceRowWordStatus({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  if (value <= 0) {
    return <span className="shrink-0 text-xs font-black text-red-500">无{label}</span>;
  }
  return (
    <>
      <span className="shrink-0">{label}</span>
      <span className={['w-[6ch] shrink-0 text-right text-xs font-black tabular-nums', muted ? 'text-slate-300' : 'text-brand'].join(' ')}>
        {value}
      </span>
      <span className={['shrink-0 text-xs font-black', muted ? 'text-slate-300' : 'text-slate-500'].join(' ')}>
        字
      </span>
    </>
  );
}

function ContextSelectionDot({
  checked,
  disabled = false,
  locked = false,
}: {
  checked: boolean;
  disabled?: boolean;
  locked?: boolean;
}) {
  return (
    <span
      className={['grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 bg-white', locked ? 'border-slate-300' : checked ? 'border-[#3B82F6]' : disabled ? 'border-slate-200' : 'border-slate-300'].join(' ')}
    >
      {checked && <span className={['h-2 w-2 rounded-full', locked ? 'bg-slate-400' : 'bg-[#3B82F6]'].join(' ')} />}
    </span>
  );
}

function mergeContextItems(items: WorkbenchLinkedContextItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getContextEntryGroup(tab: string, type?: string) {
  return type?.trim() || tab.trim() || '未分类';
}

function parseContextSettingContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{ type: string; body: string }>;
    const parsedType = parsed.type === '境界体系' || parsed.type === '等级体系'
      ? '成长体系'
      : parsed.type === '主线剧情'
        ? '剧情规划'
        : parsed.type;
    return {
      type: parsedType || '未分类',
      body: parsed.body || '',
    };
  } catch {
    return {
      type: '未分类',
      body: content || '',
    };
  }
}

const CONTEXT_ROLE_STATE_FIELDS = [
  ['currentSituation', '当前处境'],
  ['currentGoal', '当前目标'],
  ['identityState', '身份状态'],
  ['abilityState', '能力状态'],
  ['resourceState', '资源状态'],
  ['relationshipState', '关系状态'],
  ['informationState', '信息状态'],
  ['plotMarkers', '剧情标记'],
  ['hardConstraints', '硬性约束'],
] as const;

function formatContextRoleStateSettings(value: unknown, legacyStatus = '') {
  if (!value || typeof value !== 'object') return legacyStatus.trim();
  const record = value as Partial<Record<(typeof CONTEXT_ROLE_STATE_FIELDS)[number][0], unknown>>;
  const text = CONTEXT_ROLE_STATE_FIELDS
    .map(([key, label]) => {
      const fieldValue = record[key];
      return typeof fieldValue === 'string' && fieldValue.trim()
        ? `${label}：${fieldValue.trim()}`
        : '';
    })
    .filter(Boolean)
    .join('\n\n');
  return text || legacyStatus.trim();
}

function parseContextRoleStatusContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{ type: string; lifeStatus: string; status: string; stateSettings: unknown }>;
    const stateText = formatContextRoleStateSettings(parsed.stateSettings, parsed.status);
    const body = [
      parsed.lifeStatus ? `生存状态：${parsed.lifeStatus}` : '',
      stateText ? `状态设定：${stateText}` : '',
    ].filter(Boolean).join('\n');
    return {
      type: parsed.type || '角色状态',
      body,
    };
  } catch {
    return {
      type: '角色状态',
      body: extractContextStatusRecord(content),
    };
  }
}

function parseContextRoleContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{
      type: string;
      lifeStatus: string;
      baseSetting: string;
      stateSettings: unknown;
      personality: string;
      background: string;
      status: string;
    }>;
    const legacyBaseSetting = [
      parsed.personality?.trim() ? `人物设定：${parsed.personality.trim()}` : '',
      parsed.background?.trim() ? parsed.background.trim() : '',
    ].filter(Boolean).join('\n\n');
    const baseSetting = parsed.baseSetting?.trim() || legacyBaseSetting;
    const stateText = formatContextRoleStateSettings(parsed.stateSettings, parsed.status);
    const body = [
      parsed.lifeStatus ? `生存状态：${parsed.lifeStatus}` : '',
      baseSetting ? `基础设定：${baseSetting}` : '',
      stateText ? `状态设定：${stateText}` : '',
    ].filter(Boolean).join('\n\n');
    return {
      type: parsed.type || '人物设定',
      body: body || content,
    };
  } catch {
    return {
      type: '人物设定',
      body: content || '',
    };
  }
}

function orderContextEntriesByType(
  entries: WorkbenchLibraryEntry[],
  typeOrder: string[],
  getType: (entry: WorkbenchLibraryEntry) => string,
  options?: { pinnedFirst?: boolean },
) {
  const normalizedOrder = [...typeOrder, ...entries.map(getType)]
    .map((type) => type.trim() || '未分类')
    .filter((type, index, source) => source.indexOf(type) === index);
  return normalizedOrder.flatMap((type) => (
    entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => (getType(entry).trim() || '未分类') === type)
      .sort((left, right) => {
        if (options?.pinnedFirst) {
          const leftPinned = typeof left.entry.pinnedAt === 'number';
          const rightPinned = typeof right.entry.pinnedAt === 'number';
          if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
          if (leftPinned) return -1;
          if (rightPinned) return 1;
        }
        return left.index - right.index;
      })
      .map(({ entry }) => entry)
  ));
}

function extractContextStatusRecord(content: string) {
  const marker = '【状态记录】';
  const markerIndex = content.indexOf(marker);
  if (markerIndex >= 0) return content.slice(markerIndex).trim();
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => /状态|变化|当前|进度|持有|关系|立场/.test(block))
    .join('\n\n')
    .trim() || content;
}

function isContextStatusCandidate(tab: string, type?: string, title?: string, content?: string) {
  const value = `${tab} ${type ?? ''} ${title ?? ''} ${content ?? ''}`;
  return /状态|状态记录|人物状态|角色状态|道具状态|势力状态|关系变化|进度/.test(value);
}

function getContextEntrySerial(title: string) {
  const chapterMatch = title.match(/第\s*(\d+)\s*章/);
  if (chapterMatch?.[1]) return Number.parseInt(chapterMatch[1], 10);
  const numberMatch = title.match(/\d+/);
  return numberMatch?.[0] ? Number.parseInt(numberMatch[0], 10) : null;
}

function ContextChapterSummaryList({
  rows,
  selectedIds,
  lockedIds,
  searchText,
  onSearchChange,
  onToggleChapter,
  onPickItem,
  onSelectRecent,
  onClear,
}: {
  rows: ContextChapterPair[];
  selectedIds: Set<string>;
  lockedIds: Set<string>;
  searchText: string;
  onSearchChange: (value: string) => void;
  onToggleChapter: (row: ContextChapterPair) => void;
  onPickItem: (row: ContextChapterPair, item: WorkbenchLinkedContextItem) => void;
  onSelectRecent: (count: number) => void;
  onClear: () => void;
}) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter((row) => (
      `${row.serialNumber} ${row.title} ${row.volumeName} ${row.chapterItem.content} ${row.summaryItem?.content ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    ))
    : rows;
  const [collapsedVolumeIds, setCollapsedVolumeIds] = useState<Set<number>>(() => new Set());
  const volumeGroups = Array.from(
    filteredRows.reduce((groups, row) => {
      const current = groups.get(row.volumeId) ?? {
        volumeId: row.volumeId,
        volumeName: row.volumeName,
        rows: [] as ContextChapterPair[],
      };
      current.rows.push(row);
      groups.set(row.volumeId, current);
      return groups;
    }, new Map<number, { volumeId: number; volumeName: string; rows: ContextChapterPair[] }>()),
  ).map(([, group]) => group);
  const toggleVolumeCollapsed = (volumeId: number) => {
    setCollapsedVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 gap-2">
        <input
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="搜索章节标题..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#08AACE]"
        />
        <button type="button" onClick={onClear} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
          清空
        </button>
      </div>
      <div className="mt-4 flex shrink-0 flex-wrap gap-2">
        {[3, 5, 10].map((count) => (
          <button key={count} type="button" onClick={() => onSelectRecent(count)} className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]">
            最近 {count} 章
          </button>
        ))}
        <button type="button" onClick={() => onSelectRecent(10)} className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]">
          增选 10 章
        </button>
      </div>
      <div className="editor-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
        {filteredRows.length === 0 ? (
          <div className="flex h-full min-h-[260px] items-center justify-center text-sm font-bold text-slate-300">
            没有匹配到章节
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {volumeGroups.map((group) => {
              const collapsed = collapsedVolumeIds.has(group.volumeId);
      const selectedCount = group.rows.filter((row) => (
                selectedIds.has(row.chapterItem.id)
                || selectedIds.has(row.outlineItem.id)
                || Boolean(row.summaryItem && selectedIds.has(row.summaryItem.id))
              )).length;
              const totalChapterWords = group.rows.reduce((sum, row) => sum + getContextWordCount(row.chapterItem.content), 0);
              const totalOutlineWords = group.rows.reduce((sum, row) => sum + getContextWordCount(row.outlineItem.content), 0);
              const totalSummaryWords = group.rows.reduce((sum, row) => sum + (row.summaryItem ? getContextWordCount(row.summaryItem.content) : 0), 0);
              return (
                <section key={group.volumeId} className="bg-white">
                  <button
                    type="button"
                    onClick={() => toggleVolumeCollapsed(group.volumeId)}
                    className="flex h-11 w-full items-center justify-between gap-3 bg-[#E6F7FB] px-4 pr-10 text-left transition-colors hover:bg-[#d7f1f8]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {collapsed ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-900" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-900" />}
                      <span className="truncate text-sm font-black text-slate-800">{group.volumeName}</span>
                      {selectedCount > 0 && (
                        <span className="rounded-full bg-[#EAF9FD] px-2 py-0.5 text-[11px] font-black text-[#078fb0]">
                          已选 {selectedCount}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-900">
                      <span>{group.rows.length} 章</span>
                      <span>·</span>
                      <ContextSourceWordStatus label="正文" value={totalChapterWords} />
                      <span>·</span>
                      <ContextSourceWordStatus label="梗概" value={totalSummaryWords} />
                      <span>·</span>
                      <ContextSourceWordStatus label="章纲" value={totalOutlineWords} />
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="divide-y divide-slate-50">
                      {group.rows.map((row) => {
                        const selectedChapter = selectedIds.has(row.chapterItem.id);
                        const selectedOutline = selectedIds.has(row.outlineItem.id);
                        const selectedSummary = row.summaryItem ? selectedIds.has(row.summaryItem.id) : false;
                        const checked = selectedChapter || selectedOutline || selectedSummary;
                        const chapterWordCount = getContextWordCount(row.chapterItem.content);
                        const outlineWordCount = getContextWordCount(row.outlineItem.content);
                        const summaryWordCount = row.summaryItem ? getContextWordCount(row.summaryItem.content) : 0;
                        const rowSelectable = !row.isCurrent;
                        const canPickChapter = rowSelectable && chapterWordCount > 0;
                        const canPickSummary = Boolean(row.summaryItem) && !row.isCurrent && summaryWordCount > 0;
                        const outlineLocked = lockedIds.has(row.outlineItem.id);
                        return (
                          <div
                            key={row.chapterId}
                            role="button"
                            tabIndex={0}
                            onClick={() => onToggleChapter(row)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onToggleChapter(row);
                              }
                            }}
                            className={['grid cursor-pointer grid-cols-[36px_minmax(0,1fr)_96px_auto] items-center gap-3 py-3 pl-4 pr-10 text-sm transition-colors hover:bg-sky-50/60', checked ? 'bg-sky-50/45' : 'bg-white'].join(' ')}
                          >
                            <button
                              type="button"
                              disabled={!rowSelectable}
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleChapter(row);
                              }}
                              className="grid h-5 w-5 place-items-center disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={checked ? '取消关联章节资料' : '关联章节资料'}
                            >
                              <ContextSelectionDot checked={checked} disabled={!rowSelectable} />
                            </button>
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2 text-base font-black text-slate-900">
                                第{row.serialNumber}章 {row.title || '未命名章节'}
                                {row.isCurrent && (
                                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
                                    当前
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="truncate text-center text-xs font-bold text-slate-400">
                              {row.volumeName}
                            </div>
                            <div
                              className="flex items-center justify-end whitespace-nowrap text-sm font-bold"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <label className={['inline-flex h-8 shrink-0 items-center gap-1.5', canPickChapter ? 'cursor-pointer text-slate-700' : 'cursor-not-allowed text-slate-300'].join(' ')}>
                                <input
                                  type="radio"
                                  disabled={!canPickChapter}
                                  checked={selectedChapter}
                                  onChange={() => onPickItem(row, row.chapterItem)}
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedChapter} disabled={!canPickChapter} />
                                <ContextSourceRowWordStatus label="正文" value={chapterWordCount} muted={!canPickChapter} />
                              </label>
                              <label
                                className={['ml-3 inline-flex h-8 shrink-0 items-center gap-1.5 border-l border-slate-200 pl-3', canPickSummary ? 'cursor-pointer text-slate-700' : 'cursor-not-allowed text-slate-300'].join(' ')}
                              >
                                <input
                                  type="radio"
                                  disabled={!canPickSummary}
                                  checked={selectedSummary}
                                  onChange={() => row.summaryItem && onPickItem(row, row.summaryItem)}
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedSummary} disabled={!canPickSummary} />
                                <ContextSourceRowWordStatus label="梗概" value={summaryWordCount} muted={!canPickSummary} />
                              </label>
                              <label className="ml-3 inline-flex h-8 shrink-0 cursor-not-allowed items-center gap-1.5 border-l border-slate-200 pl-3 text-slate-300">
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={selectedOutline}
                                  onChange={() => onPickItem(row, row.outlineItem)}
                                  className="sr-only"
                                />
                                <ContextSelectionDot checked={selectedOutline} disabled locked={outlineLocked} />
                                <ContextSourceRowWordStatus label={`第${row.serialNumber}章章纲`} value={outlineWordCount} muted={!outlineLocked} />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

        )}
      </div>
    </div>
  );
}

function ContextSelectionColumn({
  column,
  selectedIds,
  onToggle,
}: {
  column: ContextColumn;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [previewItemId, setPreviewItemId] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const groupedItems = new Map<string, WorkbenchLinkedContextItem[]>();
  column.items.forEach((item) => {
    const group = item.group || '未分类';
    groupedItems.set(group, [...(groupedItems.get(group) ?? []), item]);
  });
  const previewItem = column.items.find((item) => item.id === previewItemId) ?? null;
  const navGroups = Array.from(groupedItems.entries()).map(([group, items]) => ({ group, items }));

  const toggleGroupCollapsed = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleItemsSelection = (items: WorkbenchLinkedContextItem[]) => {
    const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
    items.forEach((item) => {
      if (allSelected || !selectedIds.has(item.id)) onToggle(item.id);
    });
  };

  useEffect(() => {
    if (column.items.length === 0) {
      if (previewItemId) setPreviewItemId('');
      return;
    }
    if (previewItemId && !column.items.some((item) => item.id === previewItemId)) {
      setPreviewItemId('');
    }
  }, [column.items, previewItemId]);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden bg-white">
      <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <div className="min-w-0 truncate text-[15px] font-black text-slate-400">
            {column.title}
          </div>
          <button
            type="button"
            onClick={() => toggleItemsSelection(column.items)}
            disabled={column.items.length === 0}
            className="h-8 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            关联所有
          </button>
        </div>
        <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
          {column.items.length === 0 ? (
            <div className="rounded-xl bg-white px-3 py-4 text-xs font-bold leading-5 text-slate-400">
              暂无可关联内容
            </div>
          ) : (
            navGroups.map(({ group, items }) => {
              const collapsed = collapsedGroups[group] ?? false;
              return (
                <div key={`${column.source}:${group}`} className="rounded-xl border border-[#cceef6] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapsed(group)}
                    className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#E6F7FB] px-2 text-left text-[15px] font-black text-slate-700 hover:bg-[#d7f1f8]"
                  >
                    <span className="min-w-0 truncate">{group}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] text-slate-400">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleItemsSelection(items);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          event.stopPropagation();
                          toggleItemsSelection(items);
                        }}
                        className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                      >
                        全选
                      </span>
                      {items.length}
                      {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="mt-1 space-y-1 bg-white">
                      {items.map((item) => {
                        const checked = selectedIds.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPreviewItemId(item.id)}
                            className={
                              'flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-[15px] font-black ' +
                              (checked ? 'xy-selected-content-bg text-gray-900' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800')
                            }
                          >
                            <span
                              role="checkbox"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewItemId(item.id);
                                onToggle(item.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                event.stopPropagation();
                                setPreviewItemId(item.id);
                                onToggle(item.id);
                              }}
                              className={
                                'grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ' +
                                (checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent')
                              }
                            >
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
            })
          )}
        </div>
      </aside>
      <div className="min-h-0 p-3">
        {previewItem ? (
          <article
            className={
              'flex h-full min-h-0 flex-col rounded-2xl border px-5 py-4 ' +
              (selectedIds.has(previewItem.id) ? 'border-[#08AACE] xy-selected-content-bg text-slate-900' : 'border-gray-100 bg-gray-50 text-gray-600')
            }
          >
            <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(previewItem.id)}
                    className={
                      'grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-black ' +
                      (selectedIds.has(previewItem.id) ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent')
                    }
                  >
                    ✓
                  </button>
                  <h4 className="truncate text-lg font-black text-slate-900">{previewItem.title}</h4>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#08AACE]">{previewItem.group}</span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-black text-[#08AACE]"><WordCountText value={getContextWordCount(previewItem.content)} /></span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words pr-2 text-sm font-semibold leading-7 text-slate-600">
              {previewItem.content || '暂无内容'}
            </div>
          </article>
        ) : (
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gray-50 text-sm font-bold text-slate-300">
            暂无预览内容
          </div>
        )}
      </div>
    </section>
  );
}

function readMemoItems(listKey: string, legacyKey: string, scope: MemoScope) {
  try {
    const parsed = JSON.parse(localStorage.getItem(listKey) ?? '[]') as Partial<MemoItem>[];
    const valid = parsed
      .filter((item): item is MemoItem => Boolean(item.id && item.title))
      .map((item) => ({
        id: String(item.id),
        title: String(item.title),
        content: String(item.content ?? ''),
        updatedAt: String(item.updatedAt ?? ''),
      }));
    if (valid.length > 0) return valid;
  } catch {
    // Fall back to the legacy single-text memo below.
  }

  const legacyContent = localStorage.getItem(legacyKey) ?? '';
  return legacyContent.trim() ? [createMemoItem(scope, 1, legacyContent)] : [];
}

function WorkbenchFindReplaceModal({
  novelId,
  volumes,
  selectedChapter,
  editorContent,
  onClose,
  onSelectChapter,
  onUpdateChapterContents,
}: {
  novelId: number;
  volumes: ReturnType<typeof useWorkbenchData>['volumes'];
  selectedChapter: ReturnType<typeof useWorkbenchData>['selectedChapter'];
  editorContent: string;
  onClose: () => void;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onUpdateChapterContents: (updates: Record<number, string>) => void;
}) {
  const draggable = useDraggableModal(FIND_REPLACE_MODAL_STORAGE_ID, FIND_REPLACE_DEFAULT_GEOMETRY);
  useTopModalEscape(true, onClose);
  const [scope, setScope] = useState<FindScope>('chapter');
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('');

  const chapters = volumes.flatMap((volume) => (
    volume.chapters.map((chapter) => ({
      volumeId: volume.id,
      chapterId: chapter.id,
      label: `第${chapter.serialNumber}${chapter.title ? `章 ${chapter.title}` : '章'}`,
      content: selectedChapter?.chapter.id === chapter.id ? editorContent : readChapterContent(novelId, chapter.id),
    }))
  ));
  const scopedChapters = scope === 'chapter' && selectedChapter
    ? chapters.filter((chapter) => chapter.chapterId === selectedChapter.chapter.id)
    : chapters;
  const matches = scopedChapters.flatMap((chapter) => (
    findOccurrences(chapter.content, searchText).map((index) => ({ ...chapter, index }))
  ));
  const total = matches.length;
  const safeActiveIndex = total === 0 ? 0 : Math.min(activeIndex, total - 1);

  useEffect(() => {
    setActiveIndex(0);
    setStatus('');
  }, [scope, searchText]);

  const goMatch = (direction: -1 | 1) => {
    if (total === 0) return;
    const next = (safeActiveIndex + direction + total) % total;
    setActiveIndex(next);
    const match = matches[next];
    if (scope === 'book') onSelectChapter(match.volumeId, match.chapterId);
  };

  const replaceCurrent = () => {
    const match = matches[safeActiveIndex];
    if (!match) {
      setStatus('未找到匹配内容');
      return;
    }
    onUpdateChapterContents({
      [match.chapterId]: replaceAt(match.content, match.index, searchText, replaceText),
    });
    setStatus('已替换当前匹配');
  };

  const replaceInScope = (targetScope: FindScope) => {
    if (!searchText) return;
    const targets = targetScope === 'chapter' && selectedChapter
      ? chapters.filter((chapter) => chapter.chapterId === selectedChapter.chapter.id)
      : chapters;
    const updates: Record<number, string> = {};
    let count = 0;
    targets.forEach((chapter) => {
      const occurrences = findOccurrences(chapter.content, searchText);
      if (occurrences.length === 0) return;
      updates[chapter.chapterId] = chapter.content.split(searchText).join(replaceText);
      count += occurrences.length;
    });
    if (count === 0) {
      setStatus('未找到匹配内容');
      return;
    }
    onUpdateChapterContents(updates);
    setStatus(targetScope === 'chapter' ? `本章已替换 ${count} 处` : `全书已替换 ${count} 处`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/30 px-6 py-6"
      style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        className="relative w-[592px] max-w-[94vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={{ ...draggable.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-11 cursor-move items-center justify-between border-b border-gray-100 px-4"
          style={{ ...draggable.dragHandleProps.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        >
          <h2 className="text-base font-bold text-gray-900">查找替换</h2>
          <button data-no-modal-drag="true" onClick={onClose} className="rounded-lg px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            关闭
          </button>
        </header>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
            <label className="text-sm font-medium text-gray-700">查找</label>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 focus-within:border-brand">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-sm text-gray-800 outline-none"
              />
              <button
                onClick={() => setScope((prev) => (prev === 'book' ? 'chapter' : 'book'))}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                {scope === 'book' ? '搜索本章' : '搜索本书'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
            <label className="text-sm font-medium text-gray-700">替换</label>
            <input
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              placeholder="输入替换词"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => goMatch(-1)} disabled={total === 0} className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40">
              上一个
            </button>
            <div className="w-14 text-center text-lg font-bold text-brand">{total === 0 ? '0/0' : `${safeActiveIndex + 1}/${total}`}</div>
            <button onClick={() => goMatch(1)} disabled={total === 0} className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-brand disabled:opacity-40">
              下一个
            </button>
            <button onClick={replaceCurrent} disabled={total === 0} className="ml-auto rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300">替换</button>
            <button onClick={() => replaceInScope('chapter')} disabled={!searchText} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300">本章替换</button>
            <button onClick={() => replaceInScope('book')} disabled={!searchText} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300">全书替换</button>
          </div>

          <div className="h-4 text-xs text-gray-400">
            {status || (scope === 'book' && total > 0 ? matches[safeActiveIndex]?.label : '')}
          </div>
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>,
    document.body,
  );
}

function ManagementModal({
  type,
  onClose,
}: {
  type: ManagementModalKey;
  onClose: () => void;
}) {
  const draggable = useDraggableModal(`workbench_${type}_management`);
  useTopModalEscape(true, onClose);
  const title = type === 'models' ? '模型管理' : '提示词管理';

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-8 py-8" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        data-draggable-managed="true"
        className="relative flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
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
          {type === 'models' ? <ModelManagePage /> : <PromptsPage />}
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>
  );
}

function EditorSettingsModal({
  publishConfirm,
  onChangePublishConfirm,
  onClose,
}: {
  publishConfirm: boolean;
  onChangePublishConfirm: (checked: boolean) => void;
  onClose: () => void;
}) {
  const draggable = useDraggableModal('workbench_editor_settings');
  useTopModalEscape(true, onClose);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-6 py-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        data-draggable-managed="true"
        className="relative w-[520px] max-w-[94vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-12 cursor-move items-center justify-between border-b border-gray-100 px-5"
        >
          <h2 className="text-base font-bold text-gray-900">作品编辑器设定</h2>
          <button data-no-modal-drag="true" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            关闭
          </button>
        </header>

        <div className="p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand/60">
            <input
              type="checkbox"
              checked={publishConfirm}
              onChange={(event) => onChangePublishConfirm(event.target.checked)}
              className="mt-1 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-base font-bold text-gray-900">发布确认</span>
              <span className="mt-1 block text-sm leading-6 text-gray-500">勾选后，点击发布章节时，会先弹出确认窗口，避免误点发布。</span>
            </span>
          </label>
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>
  );
}

function ChapterExportPanel({
  volumes,
  workType,
  getChapterWordCount,
  onClose,
  onExport,
}: {
  volumes: Volume[];
  workType: WorkbenchNovel['type'];
  getChapterWordCount: (chapterId: number) => number;
  onClose: () => void;
  onExport: (format: ChapterExportFormat, chapterIds: number[]) => void;
}) {
  const [format, setFormat] = useState<ChapterExportFormat>('txt');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const chapterGroups = useMemo(() => volumes.map((volume) => ({
    volume,
    chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber),
  })), [volumes]);
  const allChapterIds = useMemo(
    () => chapterGroups.flatMap((group) => group.chapters.map((chapter) => chapter.id)),
    [chapterGroups],
  );
  const chapterSignature = chapterGroups
    .map((group) => `${group.volume.id}:${group.chapters.map((chapter) => chapter.id).join(',')}`)
    .join('|');
  const selectedSet = new Set(selectedIds);
  const selectedWordCount = chapterGroups.reduce((sum, group) => (
    sum + group.chapters.reduce((innerSum, chapter) => (
      selectedSet.has(chapter.id) ? innerSum + getChapterWordCount(chapter.id) : innerSum
    ), 0)
  ), 0);
  const chapterUnit = workType === 'script' ? '集' : '章';

  useEffect(() => {
    setSelectedIds(allChapterIds);
    setNotice('');
  }, [allChapterIds, chapterSignature]);

  const normalizeSelectedIds = (ids: Set<number>) => allChapterIds.filter((chapterId) => ids.has(chapterId));

  const toggleAll = () => {
    setNotice('');
    setSelectedIds(selectedIds.length === allChapterIds.length ? [] : allChapterIds);
  };

  const toggleVolume = (chapterIds: number[]) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isFullSelected = chapterIds.every((chapterId) => next.has(chapterId));
      chapterIds.forEach((chapterId) => {
        if (isFullSelected) next.delete(chapterId);
        else next.add(chapterId);
      });
      return normalizeSelectedIds(next);
    });
  };

  const toggleChapter = (chapterId: number) => {
    setNotice('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return normalizeSelectedIds(next);
    });
  };

  const submitExport = () => {
    if (selectedIds.length === 0) {
      setNotice('请至少选择一个章节。');
      return;
    }
    onExport(format, selectedIds);
    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-gray-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">选择要导出的章节</div>
            <div className="mt-1 text-xs text-gray-400">
              已选择 {selectedIds.length} 个{chapterUnit}，约 <WordCountText value={selectedWordCount} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['txt', 'doc'] as ChapterExportFormat[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormat(item)}
                className={`h-9 rounded-lg px-4 text-sm font-bold transition-colors ${
                  format === item
                    ? 'bg-brand text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-brand/50 hover:text-brand'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {allChapterIds.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
            当前作品还没有可导出的章节
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.length === allChapterIds.length}
                onChange={toggleAll}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm font-bold text-gray-800">全选 / 取消全选</span>
            </label>

            {chapterGroups.map(({ volume, chapters }) => {
              const volumeChapterIds = chapters.map((chapter) => chapter.id);
              const selectedCount = volumeChapterIds.filter((chapterId) => selectedSet.has(chapterId)).length;

              return (
                <section key={volume.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-brand-light/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCount === volumeChapterIds.length && volumeChapterIds.length > 0}
                      onChange={() => toggleVolume(volumeChapterIds)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-brand-dark">{volume.name}</span>
                    <span className="text-xs font-bold text-gray-500">{selectedCount}/{chapters.length}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 p-3">
                    {chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          selectedSet.has(chapter.id)
                            ? 'border-brand/40 bg-orange-50'
                            : 'border-gray-100 bg-white hover:border-brand/30 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet.has(chapter.id)}
                          onChange={() => toggleChapter(chapter.id)}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                          {getChapterExportTitle(chapter, workType)}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400"><WordCountText value={getChapterWordCount(chapter.id)} /></span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-4">
        <div className="text-sm text-red-500">{notice}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-600 hover:bg-gray-50">
            取消
          </button>
          <button type="button" onClick={submitExport} className="h-10 rounded-lg bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark">
            开始导出
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkbenchPage() {
  const navigate = useNavigate();
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isEditorSettingsOpen, setIsEditorSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [activeCreationFlow, setActiveCreationFlow] = useState<WorkbenchCreationFlowPageKey>('writing');
  const [managementModal, setManagementModal] = useState<ManagementModalKey | null>(null);
  const [fieldSizeOpenSignal, setFieldSizeOpenSignal] = useState(0);
  const [aiLogOpenSignal, setAiLogOpenSignal] = useState(0);
  const [settingLibraryInitialTab, setSettingLibraryInitialTab] = useState<'脑洞' | '大纲'>('大纲');
  const [isContextLibraryOpen, setIsContextLibraryOpen] = useState(false);
  const [contextLibraryTab, setContextLibraryTab] = useState<ContextLibraryTab>('outlineChapter');
  const [contextSearchText, setContextSearchText] = useState('');
  const [draftContextIds, setDraftContextIds] = useState<Set<string>>(() => new Set());
  const [linkedContextItems, setLinkedContextItems] = useState<WorkbenchLinkedContextItem[]>([]);
  const [contextSelectionTouched, setContextSelectionTouched] = useState(false);
  const [publishConfirm, setPublishConfirm] = useState(() => localStorage.getItem(PUBLISH_CONFIRM_KEY) === 'true');
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(null);
  const [globalNotes, setGlobalNotes] = useState<MemoItem[]>(() => readMemoItems(GLOBAL_NOTES_LIST_KEY, GLOBAL_NOTES_KEY, 'global'));
  const [workNotes, setWorkNotes] = useState<MemoItem[]>([]);
  const [workNotesNovelId, setWorkNotesNovelId] = useState<number | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<{ scope: MemoScope; id: string } | null>(null);
  const [collapsedMemoSections, setCollapsedMemoSections] = useState<Record<MemoScope, boolean>>({ global: false, work: false });
  const [showPublished, setShowPublished] = useState(false);
  const [replaceUndoSnapshot, setReplaceUndoSnapshot] = useState<{ chapterId: number; content: string } | null>(null);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_ai_panel_width') ?? String(AI_PANEL_DEFAULT_WIDTH), 10);
    return normalizeAiPanelWidth(saved);
  });
  const [chapterSidebarWidth, setChapterSidebarWidth] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_chapter_sidebar_width') ?? String(CHAPTER_SIDEBAR_DEFAULT_WIDTH), 10);
    return normalizeChapterSidebarWidth(saved);
  });
  const [publishedSidebarWidth, setPublishedSidebarWidth] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_published_sidebar_width') ?? String(PUBLISHED_SIDEBAR_DEFAULT_WIDTH), 10);
    return normalizePublishedSidebarWidth(saved);
  });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isDraggingChapterSidebar, setIsDraggingChapterSidebar] = useState(false);
  const [isDraggingPublishedSidebar, setIsDraggingPublishedSidebar] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(290);
  const { tabs, activeTabId } = useWorkspaceTabs();

  const {
    currentNovel,
    currentNovelId,
    volumes,
    recycledChapters,
    selectedChapter,
    editorContent,
    sortAsc,
    lastSavedAt,
    selectChapter,
    toggleVolume,
    toggleSort,
    addVolume,
    deleteVolume,
    addChapter,
    renameChapter,
    updateChapterSerialNumber,
    setChapterPublished,
    deleteChapter,
    restoreChapter,
    permanentDeleteChapter,
    saveContent,
    updateChapterContents,
    updateNovelChapterContent,
    getChapterWordCount,
    setCurrentNovel,
  } = useWorkbenchData();

  const currentNovelType = currentNovel?.type ?? null;

  useEffect(() => {
    if (!currentNovelType) return;
    setActiveCreationFlow('writing');
    if (currentNovelType === 'script') {
      setShowPublished(false);
      return;
    }
    const key = `workbench_show_published_${currentNovelType}`;
    setShowPublished(localStorage.getItem(key) === 'true');
  }, [currentNovelId, currentNovelType]);

  useEffect(() => {
    if (!currentNovelId) return;
    const storedItems = readWorkbenchLinkedContextItems(currentNovelId);
    setLinkedContextItems(storedItems);
    setContextSelectionTouched(storedItems.length > 0);
    setDraftContextIds(new Set());
    setIsContextLibraryOpen(false);
  }, [currentNovelId]);

  useEffect(() => {
    setContextSelectionTouched(false);
    setDraftContextIds(new Set());
    setIsContextLibraryOpen(false);
  }, [selectedChapter?.chapter.id]);

  useEffect(() => {
    if (!currentNovel) return;
    if (currentNovel.type === 'script') return;
    localStorage.setItem(`workbench_show_published_${currentNovel.type}`, String(showPublished));
  }, [currentNovel, showPublished]);

  useEffect(() => {
    localStorage.setItem('xinyuexia_ai_panel_width', String(aiPanelWidth));
  }, [aiPanelWidth]);

  useEffect(() => {
    localStorage.setItem('xinyuexia_chapter_sidebar_width', String(chapterSidebarWidth));
  }, [chapterSidebarWidth]);

  useEffect(() => {
    localStorage.setItem('xinyuexia_published_sidebar_width', String(publishedSidebarWidth));
  }, [publishedSidebarWidth]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId) return;
    if (currentNovelId === activeTab.workId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  useEffect(() => {
    const handleResize = () => {
      setAiPanelWidth((prev) => normalizeAiPanelWidth(prev));
      setChapterSidebarWidth((prev) => normalizeChapterSidebarWidth(prev));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(GLOBAL_NOTES_LIST_KEY, JSON.stringify(globalNotes));
  }, [globalNotes]);

  useEffect(() => {
    if (!currentNovelId) return;
    setWorkNotes(readMemoItems(`${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`, `${WORK_NOTES_KEY_PREFIX}${currentNovelId}`, 'work'));
    setWorkNotesNovelId(currentNovelId);
  }, [currentNovelId]);

  useEffect(() => {
    if (!currentNovelId || workNotesNovelId !== currentNovelId) return;
    localStorage.setItem(`${WORK_NOTES_LIST_KEY_PREFIX}${currentNovelId}`, JSON.stringify(workNotes));
  }, [currentNovelId, workNotes, workNotesNovelId]);

  useEffect(() => {
    const currentExists = selectedMemo?.scope === 'global'
      ? globalNotes.some((note) => note.id === selectedMemo.id)
      : workNotes.some((note) => note.id === selectedMemo?.id);
    if (currentExists) return;
    const fallback = globalNotes[0] ? { scope: 'global' as const, id: globalNotes[0].id } : workNotes[0] ? { scope: 'work' as const, id: workNotes[0].id } : null;
    setSelectedMemo(fallback);
  }, [globalNotes, selectedMemo, workNotes]);

  useEffect(() => {
    localStorage.setItem(PUBLISH_CONFIRM_KEY, String(publishConfirm));
  }, [publishConfirm]);

  useEffect(() => {
    setReplaceUndoSnapshot(null);
  }, [selectedChapter?.chapter.id]);

  useEffect(() => {
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id !== 'close_floating') return;
      if (isRecycleOpen) {
        setIsRecycleOpen(false);
        return;
      }
      if (isExportOpen) {
        setIsExportOpen(false);
        return;
      }
      if (isFindOpen) {
        setIsFindOpen(false);
        return;
      }
      if (isEditorSettingsOpen) {
        setIsEditorSettingsOpen(false);
        return;
      }
      if (activeModal) {
        setActiveModal(null);
        return;
      }
      if (managementModal) {
        setManagementModal(null);
        return;
      }
      if (isContextLibraryOpen) {
        setIsContextLibraryOpen(false);
        return;
      }
      if (pendingPublish) {
        setPendingPublish(null);
        return;
      }
      navigate('/novels');
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
  }, [
    activeModal,
    isContextLibraryOpen,
    isEditorSettingsOpen,
    isExportOpen,
    isFindOpen,
    isRecycleOpen,
    managementModal,
    navigate,
    pendingPublish,
  ]);

  const handlePanelDragStart = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragStartX.current = event.clientX;
    dragStartWidth.current = aiPanelWidth;
    setIsDraggingPanel(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleChapterSidebarDragStart = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragStartX.current = event.clientX;
    dragStartWidth.current = chapterSidebarWidth;
    setIsDraggingChapterSidebar(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePublishedSidebarDragStart = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragStartX.current = event.clientX;
    dragStartWidth.current = publishedSidebarWidth;
    setIsDraggingPublishedSidebar(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDraggingPanel) return;

    const handleMove = (event: MouseEvent) => {
      const deltaX = dragStartX.current - event.clientX;
      setAiPanelWidth(normalizeAiPanelWidth(dragStartWidth.current + deltaX));
    };

    const handleUp = () => {
      setIsDraggingPanel(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingPanel, aiPanelWidth]);

  useEffect(() => {
    if (!isDraggingChapterSidebar) return;

    const handleMove = (event: MouseEvent) => {
      const deltaX = event.clientX - dragStartX.current;
      setChapterSidebarWidth(normalizeChapterSidebarWidth(dragStartWidth.current + deltaX));
    };

    const handleUp = () => {
      setIsDraggingChapterSidebar(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingChapterSidebar]);

  useEffect(() => {
    if (!isDraggingPublishedSidebar) return;

    const handleMove = (event: MouseEvent) => {
      const deltaX = event.clientX - dragStartX.current;
      setPublishedSidebarWidth(normalizePublishedSidebarWidth(dragStartWidth.current + deltaX));
    };

    const handleUp = () => {
      setIsDraggingPublishedSidebar(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingPublishedSidebar]);

  if (!currentNovel) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">未选择作品</h1>
          <p className="mt-2 text-sm text-gray-500">请先从作品列表选择一本小说或剧本。</p>
          <Link to="/novels" className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark">
            返回我的小说
          </Link>
        </div>
      </div>
    );
  }

  const chapterCount = volumes.reduce((sum, volume) => sum + volume.chapters.length, 0);
  const selectedVolumeName = selectedChapter
    ? volumes.find((volume) => volume.id === selectedChapter.volumeId)?.name ?? '未选择卷'
    : '未选择卷';

  const canUndoReplace = Boolean(
    selectedChapter && replaceUndoSnapshot?.chapterId === selectedChapter.chapter.id,
  );
  const activeMemo = selectedMemo?.scope === 'global'
    ? globalNotes.find((note) => note.id === selectedMemo.id) ?? null
    : workNotes.find((note) => note.id === selectedMemo?.id) ?? null;
  const settingsStorageKey = `xinyuexia_workbench_settings_${currentNovel.id}`;
  const outlineStorageKey = `xinyuexia_workbench_outline_${currentNovel.id}`;
  const settingsEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey);
  const outlineEntries = readWorkbenchLibraryEntries(outlineStorageKey);
  const settingContextEntries = orderContextEntriesByType(
    settingsEntries.filter((entry) => entry.tab === '大纲'),
    CONTEXT_SETTING_TYPE_ORDER,
    (entry) => parseContextSettingContent(entry.content).type,
  );
  const roleContextEntries = orderContextEntriesByType(
    settingsEntries.filter((entry) => normalizeContextSource(entry.tab) === 'role'),
    CONTEXT_ROLE_TYPE_ORDER,
    (entry) => parseContextRoleContent(entry.content).type,
    { pinnedFirst: true },
  );
  const settingContextItems: WorkbenchLinkedContextItem[] = settingContextEntries
    .map((entry) => {
      const parsed = parseContextSettingContent(entry.content);
      return {
        id: `setting:${entry.id}`,
        source: 'setting' as const,
        group: parsed.type || '未分类',
        title: entry.title || '未命名设定',
        content: parsed.body || entry.content || '',
      };
    })
    .filter((item) => item.content.trim());
  const roleContextItems: WorkbenchLinkedContextItem[] = roleContextEntries
    .map((entry) => {
      const parsed = parseContextRoleContent(entry.content);
      return {
        id: `role:${entry.id}`,
        source: 'role' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名角色',
        content: parsed.body || entry.content || '',
      };
    })
    .filter((item) => item.content.trim());
  const roleStatusContextItems: WorkbenchLinkedContextItem[] = roleContextEntries
    .map((entry) => {
      const parsed = parseContextRoleStatusContent(entry.content);
      return {
        id: `status:role:${entry.id}`,
        source: 'role' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名角色',
        content: parsed.body,
      };
    })
    .filter((item) => item.content.trim());
  const settingStatusContextItems: WorkbenchLinkedContextItem[] = settingContextEntries
    .filter((entry) => isContextStatusCandidate(entry.tab, entry.type, entry.title, entry.content))
    .map((entry) => {
      const parsed = parseContextSettingContent(entry.content);
      return {
        id: `status:setting:${entry.id}`,
        source: 'setting' as const,
        group: parsed.type || getContextEntryGroup(entry.tab, entry.type),
        title: entry.title || '未命名设定',
        content: extractContextStatusRecord(parsed.body || entry.content),
      };
    })
    .filter((item) => item.content.trim());
  const statusContextItems = [...roleStatusContextItems, ...settingStatusContextItems];
  const libraryContextEntries = [...settingsEntries, ...outlineEntries];
  const outlineContextItems: WorkbenchLinkedContextItem[] = libraryContextEntries
    .filter(isContextOutlineEntry)
    .map((entry) => ({
      id: `outline:${entry.id}`,
      source: 'outline',
      group: getContextEntryGroup(entry.tab, entry.type),
      title: entry.title || '未命名章纲',
      content: entry.content || '',
    }));
  const summaryContextItems: WorkbenchLinkedContextItem[] = libraryContextEntries
    .filter(isContextSummaryEntry)
    .map((entry) => ({
      id: `summary:${entry.id}`,
      source: 'summary',
      group: getContextEntryGroup(entry.tab, entry.type),
      title: entry.title || '未命名梗概',
      content: entry.content || '',
    }));
  const summaryChapterSerials = new Set(summaryContextItems.map((item) => getContextEntrySerial(item.title)).filter(Boolean));
  const summaryChapterCount = summaryChapterSerials.size > 0 ? summaryChapterSerials.size : summaryContextItems.length;
  const flowStats: WorkbenchHeaderFlowStats = {
    brainstorm: { meta: `${settingsEntries.filter((entry) => entry.tab === '脑洞').length}个脑洞` },
    outline: { meta: `${settingsEntries.filter((entry) => entry.tab === '大纲').length}个设定` },
    chapterOutline: { meta: `${outlineContextItems.length}章` },
    writing: { meta: `${chapterCount}章` },
    audit: { meta: `${chapterCount}章未审`, tone: 'warning' },
    comment: { meta: `${chapterCount}章未点评`, tone: 'warning' },
    status: { meta: `${chapterCount}章未更新`, tone: 'warning' },
    summary: { meta: `${summaryChapterCount}章`, tone: summaryChapterCount < chapterCount ? 'warning' : 'normal' },
  };
  const selectedChapterSerialNumber = selectedChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
  const chapterContextItems: WorkbenchLinkedContextItem[] = volumes.flatMap((volume) => (
    volume.chapters
      .filter((chapter) => chapter.serialNumber <= selectedChapterSerialNumber)
      .map((chapter) => ({
        id: `chapter:${chapter.id}`,
        source: 'chapter' as const,
        group: volume.name,
        title: chapter.title || `第${chapter.serialNumber}章`,
        content: readChapterContent(currentNovel.id, chapter.id),
      }))
  ));
  const outlineItemBySerial = new Map<number, WorkbenchLinkedContextItem>();
  outlineContextItems.forEach((item) => {
    const serial = getContextEntrySerial(item.title);
    if (serial && !outlineItemBySerial.has(serial)) outlineItemBySerial.set(serial, item);
  });
  const summaryItemBySerial = new Map<number, WorkbenchLinkedContextItem>();
  summaryContextItems.forEach((item) => {
    const serial = getContextEntrySerial(item.title);
    if (serial && !summaryItemBySerial.has(serial)) summaryItemBySerial.set(serial, item);
  });
  const contextChapterRows: ContextChapterPair[] = volumes.flatMap((volume) => (
    [...volume.chapters]
      .filter((chapter) => chapter.serialNumber <= selectedChapterSerialNumber)
      .sort((a, b) => b.serialNumber - a.serialNumber)
      .map((chapter) => {
        const chapterItem = chapterContextItems.find((item) => item.id === `chapter:${chapter.id}`) ?? {
          id: `chapter:${chapter.id}`,
          source: 'chapter' as const,
          group: volume.name,
          title: chapter.title || `第${chapter.serialNumber}章`,
          content: readChapterContent(currentNovel.id, chapter.id),
        };
        const outlineItem = outlineItemBySerial.get(chapter.serialNumber) ?? {
          id: `outline:chapter:${chapter.id}`,
          source: 'outline' as const,
          group: volume.name,
          title: `第${chapter.serialNumber}章章纲`,
          content: '',
        };
        return {
          volumeId: volume.id,
          volumeName: volume.name,
          chapterId: chapter.id,
          serialNumber: chapter.serialNumber,
          title: chapter.title,
          isCurrent: chapter.id === selectedChapter?.chapter.id,
          chapterItem,
          outlineItem,
          summaryItem: summaryItemBySerial.get(chapter.serialNumber) ?? null,
        };
      })
  )).sort((a, b) => b.serialNumber - a.serialNumber);
  const otherContextColumns: ContextColumn[] = [
    { source: 'setting', title: '大纲设定', subtitle: '读取大纲里的设定分类和卡片', items: settingContextItems },
  ];
  const roleContextColumns: ContextColumn[] = [
    { source: 'role', title: '人物设定', subtitle: '读取大纲里的人物设定，并保持分类和卡片顺序', items: roleContextItems },
  ];
  const statusContextColumns: ContextColumn[] = [
    { source: 'role', title: '状态', subtitle: '读取角色、道具、势力等卡片里的最新状态记录', items: statusContextItems },
  ];
  const activeContextColumns = contextLibraryTab === 'status'
    ? statusContextColumns
    : contextLibraryTab === 'role'
    ? roleContextColumns
    : otherContextColumns;
  const chapterRowContextItems = contextChapterRows.flatMap((row) => [
    row.chapterItem,
    row.outlineItem,
    row.summaryItem,
  ].filter((item): item is WorkbenchLinkedContextItem => Boolean(item)));
  const allContextItems = [...chapterRowContextItems, ...outlineContextItems, ...summaryContextItems, ...settingContextItems, ...roleContextItems, ...statusContextItems];
  const contextItemById = new Map(allContextItems.map((item) => [item.id, item]));
  const requiredContextItems = contextChapterRows
    .filter((row) => row.isCurrent)
    .map((row) => row.outlineItem);
  const requiredContextIds = new Set(requiredContextItems.map((item) => item.id));
  const previousContextRow = contextChapterRows.find((row) => !row.isCurrent && row.serialNumber < selectedChapterSerialNumber) ?? null;
  const defaultOptionalContextItems = [
    previousContextRow ? getPreferredChapterNarrativeItem(previousContextRow) : null,
  ].filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
  const rawOptionalLinkedContextItems = contextSelectionTouched
    ? linkedContextItems.filter((item) => !requiredContextIds.has(item.id))
    : defaultOptionalContextItems;
  const optionalLinkedContextItems = keepExclusiveChapterNarrativeItems(contextChapterRows, rawOptionalLinkedContextItems);
  const shouldAttachRequiredContext = !contextSelectionTouched || linkedContextItems.length > 0;
  const effectiveRequiredContextItems = shouldAttachRequiredContext ? requiredContextItems : [];
  const effectiveLinkedContextItems = mergeContextItems([...effectiveRequiredContextItems, ...optionalLinkedContextItems]);
  const selectedDraftContextItems = Array.from(draftContextIds)
    .map((id) => contextItemById.get(id))
    .filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
  const draftContextWordCount = selectedDraftContextItems.reduce((sum, item) => sum + getContextWordCount(item.content), 0);
  const draftChapterWordCount = getContextItemsWordCount(selectedDraftContextItems, 'chapter');
  const draftOutlineWordCount = getContextItemsWordCount(selectedDraftContextItems, 'outline');
  const draftSummaryWordCount = getContextItemsWordCount(selectedDraftContextItems, 'summary');
  const canConfirmContextLibrary = requiredContextItems.length > 0
    && requiredContextItems.every(hasContextContent)
    && draftContextWordCount > 0
    && selectedDraftContextItems.every(hasContextContent);
  const contextLibraryConfirmTitle = canConfirmContextLibrary ? '确认关联资料'
    : requiredContextItems.length === 0 || !requiredContextItems.every(hasContextContent)
      ? '当前章节没有章纲，无法确认关联'
      : '请选择至少一项有内容的资料';
  const updateLinkedContextItems = (items: WorkbenchLinkedContextItem[]) => {
    setLinkedContextItems(items);
    if (!currentNovelId) return;
    if (items.length > 0) {
      writeWorkbenchLinkedContextItems(currentNovelId, items);
    } else {
      clearWorkbenchLinkedContextItems(currentNovelId);
    }
  };

  const openContextLibrary = () => {
    setDraftContextIds(new Set(effectiveLinkedContextItems.map((item) => item.id)));
    setContextLibraryTab('outlineChapter');
    setIsContextLibraryOpen(true);
  };

  const toggleDraftContext = (id: string) => {
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickDraftContextItem = (item: WorkbenchLinkedContextItem, siblingId?: string | null) => {
    if (requiredContextIds.has(item.id)) return;
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (siblingId) next.delete(siblingId);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const toggleChapterContextRow = (row: ContextChapterPair) => {
    setDraftContextIds((current) => {
      const next = new Set(current);
      if (row.isCurrent) {
        if (hasContextContent(row.outlineItem)) next.add(row.outlineItem.id);
        return next;
      }
      const rowIds = [
        row.chapterItem.id,
        row.summaryItem?.id,
      ].filter((id): id is string => Boolean(id && !requiredContextIds.has(id)));
      const selected = rowIds.length > 0 && rowIds.some((id) => next.has(id));
      rowIds.forEach((id) => {
        if (selected) next.delete(id);
      });
      if (!selected) {
        const preferred = getPreferredChapterNarrativeItem(row);
        if (preferred) next.add(preferred.id);
      }
      return next;
    });
  };

  const pickChapterContextItem = (row: ContextChapterPair, item: WorkbenchLinkedContextItem) => {
    if (!hasContextContent(item)) return;
    if (row.isCurrent && item.id !== row.outlineItem.id) return;
    if (item.id === row.outlineItem.id) return;
    if (item.id === row.chapterItem.id || item.id === row.summaryItem?.id) {
      setDraftContextIds((current) => {
        const next = new Set(current);
        next.delete(row.chapterItem.id);
        if (row.summaryItem) next.delete(row.summaryItem.id);
        next.add(item.id);
        return next;
      });
      return;
    }
    pickDraftContextItem(item);
  };

  const selectRecentChapterContexts = (count: number) => {
    const rows = contextChapterRows.filter((row) => !row.isCurrent).slice(0, count);
    setDraftContextIds((current) => {
      const next = new Set(current);
      rows.forEach((row) => {
        next.delete(row.chapterItem.id);
        if (row.summaryItem) next.delete(row.summaryItem.id);
        const preferred = getPreferredChapterNarrativeItem(row);
        if (preferred) next.add(preferred.id);
      });
      return next;
    });
  };

  const confirmContextLibrary = () => {
    if (!canConfirmContextLibrary) return;
    const selectedItems = Array.from(draftContextIds)
      .map((id) => contextItemById.get(id))
      .filter((item): item is WorkbenchLinkedContextItem => Boolean(item));
    const optionalSelectedItems = keepExclusiveChapterNarrativeItems(
      contextChapterRows,
      selectedItems.filter((item) => !requiredContextIds.has(item.id)),
    );
    const confirmedSelectedItems = mergeContextItems([...requiredContextItems, ...optionalSelectedItems]);
    setContextSelectionTouched(true);
    updateLinkedContextItems(confirmedSelectedItems);
    setDraftContextIds(new Set(confirmedSelectedItems.map((item) => item.id)));
    setIsContextLibraryOpen(false);
  };

  const selectMemo = (scope: MemoScope, id: string) => setSelectedMemo({ scope, id });

  const addMemo = (scope: MemoScope) => {
    const list = scope === 'global' ? globalNotes : workNotes;
    const next = createMemoItem(scope, list.length + 1);
    if (scope === 'global') setGlobalNotes((prev) => [next, ...prev]);
    else setWorkNotes((prev) => [next, ...prev]);
    setSelectedMemo({ scope, id: next.id });
    setCollapsedMemoSections((prev) => ({ ...prev, [scope]: false }));
  };

  const updateMemo = (updates: Partial<Pick<MemoItem, 'title' | 'content'>>) => {
    if (!selectedMemo) return;
    const patch = { ...updates, updatedAt: formatMemoTime() };
    const updater = (items: MemoItem[]) => items.map((item) => (item.id === selectedMemo.id ? { ...item, ...patch } : item));
    if (selectedMemo.scope === 'global') setGlobalNotes(updater);
    else setWorkNotes(updater);
  };

  const toggleMemoSection = (scope: MemoScope) => {
    setCollapsedMemoSections((prev) => ({ ...prev, [scope]: !prev[scope] }));
  };

  const replaceEditorContent = (content: string) => {
    if (selectedChapter) {
      setReplaceUndoSnapshot({
        chapterId: selectedChapter.chapter.id,
        content: editorContent,
      });
    }
    saveContent(content);
  };

  const undoReplaceEditorContent = () => {
    if (!selectedChapter || replaceUndoSnapshot?.chapterId !== selectedChapter.chapter.id) return;
    saveContent(replaceUndoSnapshot.content);
    setReplaceUndoSnapshot(null);
  };

  const downloadTextFile = (fileName: string, content: string, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const collectExportChapters = (chapterIds: number[]): ChapterExportItem[] => {
    const targetIds = new Set(chapterIds);
    return volumes.flatMap((volume) => (
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .filter((chapter) => targetIds.has(chapter.id))
        .map((chapter) => ({
          volumeId: volume.id,
          volumeName: volume.name,
          chapterId: chapter.id,
          serialNumber: chapter.serialNumber,
          title: chapter.title,
          content: selectedChapter?.chapter.id === chapter.id
            ? editorContent
            : readChapterContent(currentNovel.id, chapter.id),
        }))
    ));
  };

  const handleExportSelectedChapters = (format: ChapterExportFormat, chapterIds: number[]) => {
    const items = collectExportChapters(chapterIds);
    if (items.length === 0) return;

    const fileBaseName = sanitizeExportFileName(`${currentNovel.title}_章节`);
    if (format === 'doc') {
      downloadTextFile(
        `${fileBaseName}.doc`,
        buildChapterExportDoc(currentNovel.title, currentNovel.type, items),
        'application/msword;charset=utf-8',
      );
      return;
    }

    downloadTextFile(
      `${fileBaseName}.txt`,
      buildChapterExportText(currentNovel.title, currentNovel.type, items),
    );
  };

  const handleExportChapters = () => {
    setIsExportOpen(true);
  };

  const publishChapterNow = (chapterId: number) => {
    setChapterPublished(chapterId, true);
  };

  const handlePublishChapter = (volumeId: number, chapterId: number) => {
    const volume = volumes.find((item) => item.id === volumeId);
    const chapter = volume?.chapters.find((item) => item.id === chapterId);
    if (!volume || !chapter) return;
    const duplicate = volume.chapters.find((item) => (
      item.id !== chapterId && item.isPublished && item.serialNumber === chapter.serialNumber
    ));
    if (duplicate) {
      window.alert(`已有第${chapter.serialNumber}${currentNovel.type === 'script' ? '集' : '章'}，请检查序号`);
      return;
    }
    if (publishConfirm) {
      const unit = currentNovel.type === 'script' ? '集' : '章';
      setPendingPublish({
        type: 'single',
        volumeId,
        chapterId,
        title: chapter.title || `第${chapter.serialNumber}${unit}`,
      });
      return;
    }
    publishChapterNow(chapterId);
  };

  const handleExportBackup = () => {
    const keys: Record<string, string | null> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('xinyuexia_')) keys[key] = localStorage.getItem(key);
    }
    downloadTextFile(
      `新月下写作备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`,
      JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), keys }, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = typeof reader.result === 'string' ? reader.result : '';
          const data = JSON.parse(raw) as { keys?: Record<string, unknown>; data?: Record<string, unknown> };
          const keys = data.keys ?? data.data;
          if (!keys || typeof keys !== 'object') throw new Error('Invalid backup');

          Object.entries(keys).forEach(([key, value]) => {
            if (!key.startsWith('xinyuexia_')) return;
            if (value === null || value === undefined) {
              localStorage.removeItem(key);
              return;
            }
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });

          window.alert('数据导入成功，请刷新页面查看');
          window.location.reload();
        } catch {
          window.alert('导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const switchCreationFlow = (flow: WorkbenchCreationFlowPageKey) => {
    setActiveCreationFlow(flow);
  };

  const showFieldSizeButton = FIELD_SIZE_FLOW_IDS.has(activeCreationFlow);
  const showHeaderLogButton = true;

  const renderCreationFlowContent = () => {
    if (activeCreationFlow === 'brainstorm' || activeCreationFlow === 'outline') {
      return (
        <WorkbenchLibraryPanel
          key={activeCreationFlow}
          storageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['大纲', '角色', '脑洞']}
          emptyText="暂无内容"
          volumes={volumes}
          scale={1}
          defaultActiveTab={activeCreationFlow === 'brainstorm' ? '脑洞' : '大纲'}
          fieldSizeOpenSignal={fieldSizeOpenSignal}
          openLogSignal={aiLogOpenSignal}
          showInlineFieldSizeButton={false}
        />
      );
    }

    if (activeCreationFlow === 'chapterOutline') {
      return (
        <WorkbenchLibraryPanel
          key="chapterOutline"
          fieldSizeOpenSignal={fieldSizeOpenSignal}
          openLogSignal={aiLogOpenSignal}
          showInlineFieldSizeButton={false}
          storageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['细纲']}
          emptyText="暂无章纲内容"
          volumes={volumes}
          getChapterContent={(chapterId) => (
            selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(currentNovel.id, chapterId)
          )}
          scale={1}
        />
      );
    }

    if (activeCreationFlow === 'summary') {
      return (
        <WorkbenchLibraryPanel
          key="summary"
          fieldSizeOpenSignal={fieldSizeOpenSignal}
          openLogSignal={aiLogOpenSignal}
          showInlineFieldSizeButton={false}
          storageKey={outlineStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['梗概']}
          emptyText="暂无梗概内容"
          volumes={volumes}
          getChapterContent={(chapterId) => (
            selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(currentNovel.id, chapterId)
          )}
          scale={1}
        />
      );
    }

    if (activeCreationFlow === 'audit' || activeCreationFlow === 'comment' || activeCreationFlow === 'polish' || activeCreationFlow === 'status') {
      return (
        <ChapterEditor
          embeddedMode={activeCreationFlow}
          fieldSizeOpenSignal={fieldSizeOpenSignal}
          openLogSignal={aiLogOpenSignal}
          showInlineFieldSizeButton={false}
          chapter={selectedChapter?.chapter ?? null}
          volumeName={selectedVolumeName}
          content={editorContent}
          lastSavedAt={lastSavedAt}
          allChapters={volumes.flatMap((volume) => volume.chapters)}
          volumes={volumes}
          settingsStorageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          getChapterContent={(chapterId) => (
            selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(currentNovel.id, chapterId)
          )}
          onUpdateChapterContent={(chapterId, nextContent) => updateNovelChapterContent(currentNovel.id, chapterId, nextContent)}
          onRenameChapter={renameChapter}
          onChangeContent={saveContent}
          onUpdateSerialNumber={updateChapterSerialNumber}
          onDeleteChapter={(chapterId) => {
            if (!selectedChapter) return;
            deleteChapter(selectedChapter.volumeId, chapterId);
          }}
          onOpenFind={() => setIsFindOpen(true)}
          onOpenSummaryLibrary={() => switchCreationFlow('summary')}
        />
      );
    }

    return (
      <ChapterEditor
        chapter={selectedChapter?.chapter ?? null}
        volumeName={selectedVolumeName}
        content={editorContent}
        lastSavedAt={lastSavedAt}
        allChapters={volumes.flatMap((volume) => volume.chapters)}
        volumes={volumes}
        settingsStorageKey={settingsStorageKey}
        outlineStorageKey={outlineStorageKey}
        getChapterContent={(chapterId) => (
          selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(currentNovel.id, chapterId)
        )}
        onUpdateChapterContent={(chapterId, nextContent) => updateNovelChapterContent(currentNovel.id, chapterId, nextContent)}
        onRenameChapter={renameChapter}
        onChangeContent={saveContent}
        onUpdateSerialNumber={updateChapterSerialNumber}
        onDeleteChapter={(chapterId) => {
          if (!selectedChapter) return;
          deleteChapter(selectedChapter.volumeId, chapterId);
        }}
        onOpenFind={() => setIsFindOpen(true)}
        onOpenSummaryLibrary={() => switchCreationFlow('summary')}
      />
    );
  };

  return (
    <div className="relative flex h-full flex-col bg-[#f5f5f7]">
      <WorkbenchHeader
        workTitle={currentNovel.title}
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow={activeCreationFlow}
        flowStats={flowStats}
        fieldSizeVisible={showFieldSizeButton}
        logVisible={showHeaderLogButton}
        extraTools={<div id="workbench-header-extra-tools" className="inline-flex items-center gap-2" />}
        onOpenFieldSize={() => setFieldSizeOpenSignal((value) => value + 1)}
        onOpenLog={() => setAiLogOpenSignal((value) => value + 1)}
        onSelectFlow={switchCreationFlow}
        onOpenWorkInfo={() => setActiveModal('workInfo')}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeCreationFlow === 'writing' ? (
          <>
            <ChapterSidebar
              volumes={volumes}
              width={chapterSidebarWidth}
              sortAsc={sortAsc}
              recycledCount={recycledChapters.length}
              workType={currentNovel.type}
              showPublished={showPublished}
              onTogglePublished={() => setShowPublished((prev) => !prev)}
              onToggleVolume={toggleVolume}
              onToggleSort={toggleSort}
              onSelectChapter={selectChapter}
              onEditChapter={selectChapter}
              onAddChapter={addChapter}
              onAddVolume={addVolume}
              onDeleteVolume={deleteVolume}
              onDeleteChapter={deleteChapter}
              onPublishChapter={handlePublishChapter}
              onOpenRecycle={() => setIsRecycleOpen(true)}
              onExportChapters={handleExportChapters}
              getChapterWordCount={getChapterWordCount}
            />

            {showPublished && (
              <>
                <div
                  data-no-modal-drag="true"
                  className="group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize items-stretch justify-center bg-transparent"
                  onMouseDown={handleChapterSidebarDragStart}
                  title="拖拽调整未发布栏宽度"
                >
                  <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <PublishedSidebar
                  volumes={volumes}
                  width={publishedSidebarWidth}
                  onSelectChapter={selectChapter}
                  onEditChapter={selectChapter}
                  onUnpublishChapter={(chapterId) => setChapterPublished(chapterId, false)}
                  onDeleteChapter={deleteChapter}
                  getChapterWordCount={getChapterWordCount}
                />
              </>
            )}

            <div
              data-no-modal-drag="true"
              className="group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize items-stretch justify-center bg-transparent"
              onMouseDown={showPublished ? handlePublishedSidebarDragStart : handleChapterSidebarDragStart}
              title="拖拽调整章节栏宽度"
            >
              <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7]">
              <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
                {renderCreationFlowContent()}
              </div>
            </section>

            <div
              data-no-modal-drag="true"
              className="group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize items-stretch justify-center bg-transparent"
              onMouseDown={handlePanelDragStart}
              title="拖拽调整宽度"
            >
              <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <aside
              className="relative shrink-0 border-l border-[#e1e5eb] bg-white"
              style={{
                width: aiPanelWidth,
                maxWidth: `calc(33.333vw / var(${APP_EFFECTIVE_SCALE_CSS_VAR}, 1))`,
              }}
            >
              <WorkbenchAIPanel
                activeTool="ai"
                workId={currentNovel.id}
                selectedChapterContent={editorContent}
                linkedContextItems={effectiveLinkedContextItems}
                onReplaceContent={replaceEditorContent}
                onUndoReplace={undoReplaceEditorContent}
                canUndoReplace={canUndoReplace}
                onOpenModelManage={() => setManagementModal('models')}
                onOpenAgentManage={() => setManagementModal('agents')}
                onOpenContextLibrary={openContextLibrary}
                onClearLinkedContext={() => {
                  setContextSelectionTouched(true);
                  updateLinkedContextItems([]);
                }}
                openLogSignal={aiLogOpenSignal}
              />
            </aside>
          </>
        ) : (
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7]">
            <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
              {renderCreationFlowContent()}
            </div>
          </section>
        )}
      </div>

      <WorkbenchModal
        title="导出章节"
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        storageId="workbench_export_chapters"
        widthClass="w-[820px]"
        heightClass="h-[78vh] max-h-[88vh]"
      >
        <ChapterExportPanel
          volumes={volumes}
          workType={currentNovel.type}
          getChapterWordCount={getChapterWordCount}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExportSelectedChapters}
        />
      </WorkbenchModal>

      <ChapterRecycleModal
        isOpen={isRecycleOpen}
        chapters={recycledChapters}
        onClose={() => setIsRecycleOpen(false)}
        onRestore={(chapterId) => {
          restoreChapter(chapterId);
          setIsRecycleOpen(false);
        }}
        onPermanentDelete={permanentDeleteChapter}
      />

      {managementModal && (
        <ManagementModal
          type={managementModal}
          onClose={() => setManagementModal(null)}
        />
      )}

      {isContextLibraryOpen && (
        <WorkbenchModal
          title="关联资料"
          isOpen={isContextLibraryOpen}
          onClose={() => setIsContextLibraryOpen(false)}
          storageId="workbench_context_library"
          widthClass="w-[min(1296px,94vw)]"
          heightClass="h-[min(820px,88vh)] min-h-[520px]"
          headerExtra={(
            <div data-no-modal-drag="true" className="inline-flex shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-sm font-black">
              <button
                type="button"
                onClick={() => setContextLibraryTab('outlineChapter')}
                className={`h-10 rounded-xl px-5 transition-colors ${
                  contextLibraryTab === 'outlineChapter'
                    ? 'bg-[#08AACE] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                正文/梗概/章纲
              </button>
              <button
                type="button"
                onClick={() => setContextLibraryTab('setting')}
                className={`h-10 rounded-xl px-5 transition-colors ${
                  contextLibraryTab === 'setting'
                    ? 'bg-[#08AACE] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                大纲设定
              </button>
              <button
                type="button"
                onClick={() => setContextLibraryTab('role')}
                className={`h-10 rounded-xl px-5 transition-colors ${
                  contextLibraryTab === 'role'
                    ? 'bg-[#08AACE] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                人物设定
              </button>
              <button
                type="button"
                onClick={() => setContextLibraryTab('status')}
                className={`h-10 rounded-xl px-5 transition-colors ${
                  contextLibraryTab === 'status'
                    ? 'bg-[#08AACE] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                状态
              </button>
            </div>
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col bg-white p-5">
            {contextLibraryTab === 'outlineChapter' ? (
              <ContextChapterSummaryList
                rows={contextChapterRows}
                selectedIds={draftContextIds}
                lockedIds={requiredContextIds}
                searchText={contextSearchText}
                onSearchChange={setContextSearchText}
                onToggleChapter={toggleChapterContextRow}
                onPickItem={pickChapterContextItem}
                onSelectRecent={selectRecentChapterContexts}
                onClear={() => setDraftContextIds(new Set(requiredContextIds))}
              />
            ) : (
              <main className="grid min-h-0 flex-1 grid-cols-1 gap-3">
                {activeContextColumns.map((column) => (
                  <ContextSelectionColumn
                    key={contextLibraryTab + ':' + column.source}
                    column={column}
                    selectedIds={draftContextIds}
                    onToggle={toggleDraftContext}
                  />
                ))}
              </main>
            )}

            <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-4">
              <div className="min-w-0 space-y-1 text-sm font-bold text-gray-500">
                <div>将读取 {selectedDraftContextItems.length} 项</div>
                <div>正文：<ContextSourceWordStatus label="正文" value={draftChapterWordCount} /></div>
                <div>梗概：<ContextSourceWordStatus label="梗概" value={draftSummaryWordCount} /></div>
                <div>章纲：<ContextSourceWordStatus label="章纲" value={draftOutlineWordCount} /></div>
                <div>共多少字：<WordCountText value={draftContextWordCount} /></div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraftContextIds(new Set(requiredContextIds))}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-500 hover:bg-slate-50"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => setIsContextLibraryOpen(false)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!canConfirmContextLibrary}
                  onClick={confirmContextLibrary}
                  className={['h-10 rounded-xl px-6 text-sm font-black text-white shadow-sm', canConfirmContextLibrary ? 'bg-[#08AACE] hover:bg-[#0798b8]' : 'cursor-not-allowed bg-slate-300 shadow-none'].join(' ')}
                  title={contextLibraryConfirmTitle}
                >
                  确认关联
                </button>
              </div>
            </div>
          </div>
        </WorkbenchModal>
      )}

      {isFindOpen && currentNovelId && (
        <WorkbenchFindReplaceModal
          novelId={currentNovelId}
          volumes={volumes}
          selectedChapter={selectedChapter}
          editorContent={editorContent}
          onClose={() => setIsFindOpen(false)}
          onSelectChapter={selectChapter}
          onUpdateChapterContents={updateChapterContents}
        />
      )}

      {isEditorSettingsOpen && (
        <EditorSettingsModal
          publishConfirm={publishConfirm}
          onChangePublishConfirm={setPublishConfirm}
          onClose={() => setIsEditorSettingsOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!pendingPublish}
        title="确认发布"
        description={pendingPublish
          ? `确定要发布「${pendingPublish.title}」吗？发布后章节会移动到已发布。`
          : ''}
        confirmText="确认发布"
        onClose={() => setPendingPublish(null)}
        onConfirm={() => {
          if (pendingPublish) publishChapterNow(pendingPublish.chapterId);
          setPendingPublish(null);
        }}
      />

      <WorkbenchModal
        title="作品信息"
        isOpen={activeModal === 'workInfo'}
        onClose={() => setActiveModal(null)}
        storageId="workbench_work_info"
        widthClass="w-[864px]"
        heightClass="h-[86vh] max-h-[92vh]"
      >
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <div className="space-y-5">
            <section className="rounded-xl border border-gray-200 p-5">
              <h3 className="mb-4 text-lg font-bold text-gray-900">作品概览</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">作品名</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.title}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">类型</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.type === 'script' ? '剧本' : '小说'}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">分类</p><p className="mt-1.5 text-base font-bold text-gray-900">{currentNovel.category ?? '未分类'}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">卷数</p><p className="mt-1.5 text-base font-bold text-gray-900">{volumes.length}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">章节数</p><p className="mt-1.5 text-base font-bold text-gray-900">{chapterCount}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-400">总字数</p><p className="mt-1.5 text-base font-bold text-brand">{currentNovel.wordCount ?? 0}</p></div>
              </div>
            </section>
            <section className="rounded-xl border border-gray-200 p-5">
              <h3 className="mb-4 text-lg font-bold text-gray-900">作品简介</h3>
              <div className="min-h-[180px] whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-base leading-8 text-gray-700">
                {currentNovel.synopsis?.trim() || '暂无简介'}
              </div>
            </section>
          </div>
        </div>
      </WorkbenchModal>

      <WorkbenchModal title={settingLibraryInitialTab === '脑洞' ? '生成脑洞' : '生成大纲'} isOpen={activeModal === 'settingLibrary'} onClose={() => setActiveModal(null)} storageId="workbench_setting_library" widthClass="w-[1452px]" heightClass="h-[86vh] max-h-[95vh]" titleClassName="text-3xl" closeOnBackdrop={false}>
        <WorkbenchLibraryPanel storageKey={settingsStorageKey} outlineStorageKey={outlineStorageKey} tabs={['大纲', '角色', '脑洞']} emptyText="暂无内容" volumes={volumes} scale={1.1} defaultActiveTab={settingLibraryInitialTab} />
      </WorkbenchModal>

      <WorkbenchModal title="章纲" isOpen={activeModal === 'detailOutlineLibrary'} onClose={() => setActiveModal(null)} storageId="workbench_detail_outline_library" widthClass="w-[1452px]" heightClass="h-[86vh] max-h-[95vh]" titleClassName="text-3xl" closeOnBackdrop={false}>
        <WorkbenchLibraryPanel
          storageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['细纲']}
          emptyText="暂无章纲内容"
          volumes={volumes}
          getChapterContent={(chapterId) => readChapterContent(currentNovel.id, chapterId)}
          scale={1.1}
        />
      </WorkbenchModal>

      <WorkbenchModal title="备忘录" isOpen={activeModal === 'notes'} onClose={() => setActiveModal(null)} storageId="workbench_notes" widthClass="w-[min(1180px,96vw)]">
        <div className="grid min-h-0 flex-1 grid-cols-[330px_minmax(0,1fr)] bg-white">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
            {([
              { scope: 'global' as const, title: '全局备忘录', items: globalNotes },
              { scope: 'work' as const, title: '作品备忘录', items: workNotes },
            ]).map(({ scope, title, items }) => (
              <section key={scope} className="mb-4 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white">
                <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-100 px-3">
                  <button
                    onClick={() => toggleMemoSection(scope)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand"
                    title={collapsedMemoSections[scope] ? '展开' : '折叠'}
                  >
                    {collapsedMemoSections[scope] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => toggleMemoSection(scope)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-bold text-gray-900"
                  >
                    {title}
                  </button>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">{items.length}</span>
                  <button
                    onClick={() => addMemo(scope)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-white text-brand hover:bg-brand-light"
                    title="新建备忘录"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {!collapsedMemoSections[scope] && (
                  <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
                    {items.length === 0 ? (
                      <p className="px-3 py-8 text-center text-xs leading-5 text-gray-400">暂无备忘录</p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => {
                          const selected = selectedMemo?.scope === scope && selectedMemo.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => selectMemo(scope, item.id)}
                              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                selected ? 'border-brand bg-brand-light/70' : 'border-gray-100 bg-gray-50 hover:border-brand/40 hover:bg-white'
                              }`}
                            >
                              <div className="truncate text-sm font-bold text-gray-800">{item.title}</div>
                              <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{item.content || '暂无内容'}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}
          </aside>

          <main className="flex min-h-0 flex-col p-5">
            {activeMemo ? (
              <>
                <div className="mb-4 flex shrink-0 items-center gap-3">
                  <input
                    value={activeMemo.title}
                    onChange={(event) => updateMemo({ title: event.target.value })}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-900 outline-none focus:border-brand"
                  />
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                    {selectedMemo?.scope === 'global' ? '全局' : '作品'}
                  </span>
                </div>
                <textarea
                  value={activeMemo.content}
                  onChange={(event) => updateMemo({ content: event.target.value })}
                  placeholder={selectedMemo?.scope === 'global'
                    ? '全局备忘录会在整个软件中共通...'
                    : '作品备忘录只属于当前作品...'}
                  className="editor-scrollbar flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                />
                <div className="mt-3 text-right text-xs text-gray-400">更新于 {activeMemo.updatedAt || '-'}</div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                请在左侧新建或选择备忘录
              </div>
            )}
          </main>
        </div>
      </WorkbenchModal>
    </div>
  );
}

