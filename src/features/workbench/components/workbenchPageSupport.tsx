import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ChapterEditor } from '@/features/workbench/components/ChapterEditor';
import { ChapterExportPanel, type ChapterExportFormat } from '@/features/workbench/components/ChapterExportPanel';
import { ChapterRecycleModal } from '@/features/workbench/components/ChapterRecycleModal';
import { ChapterSidebar } from '@/features/workbench/components/ChapterSidebar';
import { PublishedSidebar } from '@/features/workbench/components/PublishedSidebar';
import { WorkbenchAIPanel, type WorkbenchLinkedContextItem } from '@/features/workbench/components/WorkbenchAIPanel';
import { WorkbenchHeader, type WorkbenchHeaderFlowStats } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchEditorSettingsModal } from '@/features/workbench/components/WorkbenchEditorSettingsModal';
import { WorkbenchFindReplaceModal } from '@/features/workbench/components/WorkbenchFindReplaceModal';
import {
  WorkbenchContextSelectionColumn,
  type WorkbenchContextColumn,
} from '@/features/workbench/components/WorkbenchContextSelectionColumn';
import {
  WorkbenchContextChapterSummaryList,
  type WorkbenchContextChapterPair,
} from '@/features/workbench/components/WorkbenchContextChapterSummaryList';
import { WorkbenchModal } from '@/features/workbench/components/WorkbenchModal';
import {
  WorkbenchManagementModal,
  type WorkbenchManagementModalKey,
} from '@/features/workbench/components/WorkbenchManagementModal';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import { useWorkbenchLibrarySnapshots } from '@/features/workbench/hooks/useWorkbenchLibrarySnapshots';
import {
  WORKBENCH_HEADER_FLOW_ITEMS,
  isWorkbenchCreationFlowPageKey,
  type WorkbenchCreationFlowPageKey,
} from '@/features/workbench/model/workbenchCreationFlow';
import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN,
  readSharedWorkbenchAiRightWidth,
  writeSharedWorkbenchAiRightWidth,
} from '@/features/workbench/model/workbenchSharedAiRightWidth';
import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidth,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidth,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';
import {
  clearWorkbenchLinkedContextItems,
  readWorkbenchLinkedContextItems,
  writeWorkbenchLinkedContextItems,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import { BRAINSTORM_TAB, SETTING_TAB, normalizeTabName } from '@/features/workbench/components/workbenchLibraryTabs';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { WordCountText } from '@/shared/ui/WordCountText';
import type { Volume } from '@/features/workbench/model/workbenchTypes';
import { countUnpolishedChapters } from '@/features/workbench/model/chapterPolishStatus';
import {
  buildChapterExportDoc,
  buildChapterExportText,
  sanitizeExportFileName,
  type ChapterExportItem,
} from '@/features/workbench/model/chapterExport';
import {
  extractContextStatusRecord,
  getContextEntryGroup,
  getContextEntrySerial,
  getContextItemsWordCount,
  getContextWordCount,
  getPreferredChapterNarrativeItem,
  hasContextContent,
  isContextOutlineEntry,
  isContextStatusCandidate,
  isContextSummaryEntry,
  keepExclusiveChapterNarrativeItems,
  mergeContextItems,
  normalizeContextSource,
  orderContextEntriesByType,
  parseContextRoleContent,
  parseContextRoleStatusContent,
  parseContextSettingContent,
} from '@/features/workbench/model/workbenchContextModel';

export type ModalKey = 'workInfo' | 'notes' | 'settingLibrary' | 'detailOutlineLibrary';
export type PendingPublish = { type: 'single'; volumeId: number; chapterId: number; title: string };
export type MemoScope = 'global' | 'work';
export type HeaderLogOpenHandler = () => void;
export type MemoItem = { id: string; title: string; content: string; updatedAt: string };
export type ContextLibraryTab = 'outlineChapter' | 'setting' | 'role' | 'status';

export const LazyWorkbenchLibraryPanel = lazy(() =>
  import('@/features/workbench/components/WorkbenchLibraryPanel').then((module) => ({
    default: module.WorkbenchLibraryPanel,
  })),
);

export function WorkbenchLibraryPanel(props: ComponentProps<typeof LazyWorkbenchLibraryPanel>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[240px] items-center justify-center bg-white text-sm font-bold text-slate-400">
          正在加载资料库…
        </div>
      }
    >
      <LazyWorkbenchLibraryPanel {...props} />
    </Suspense>
  );
}

export function WorkbenchNoNovelState() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50">
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">未选择作品</h1>
        <p className="mt-2 text-sm text-gray-500">请先从作品列表选择一本小说或剧本。</p>
        <Link
          to="/novels"
          className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
        >
          返回我的小说
        </Link>
      </div>
    </div>
  );
}

export function getWorkbenchChapterHeaderStats(
  settingsStorageKey: string,
  volumes: Volume[],
  selectedChapter: { volumeId: number; chapter: { id: number } } | null,
  editorContent: string,
  novelId: number,
) {
  const chapterCount = volumes.reduce((sum, volume) => sum + volume.chapters.length, 0);
  const unpolishedChapterCount = countUnpolishedChapters(settingsStorageKey, volumes, (chapterId) =>
    selectedChapter?.chapter.id === chapterId ? editorContent : readChapterContent(novelId, chapterId),
  );
  const selectedVolumeName = selectedChapter
    ? (volumes.find((volume) => volume.id === selectedChapter.volumeId)?.name ?? '未选择卷')
    : '未选择卷';
  return { chapterCount, unpolishedChapterCount, selectedVolumeName };
}

export const FIELD_SIZE_FLOW_IDS = new Set<WorkbenchCreationFlowPageKey>([
  'brainstorm',
  'outline',
  'chapterOutline',
  'polish',
  'audit',
  'comment',
  'status',
  'summary',
]);

export type ContextColumn = WorkbenchContextColumn;

export type ContextChapterPair = WorkbenchContextChapterPair;

export const AI_PANEL_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;
export const AI_PANEL_DEFAULT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
export const CHAPTER_SIDEBAR_MIN_WIDTH = 200;
export const CHAPTER_SIDEBAR_MAX_WIDTH = 420;
export const CHAPTER_SIDEBAR_DEFAULT_WIDTH = CHAPTER_SIDEBAR_MIN_WIDTH;
export const PUBLISHED_SIDEBAR_MIN_WIDTH = 170;
export const PUBLISHED_SIDEBAR_MAX_WIDTH = 360;
export const PUBLISHED_SIDEBAR_DEFAULT_WIDTH = PUBLISHED_SIDEBAR_MIN_WIDTH;
export const CONTEXT_SETTING_TYPE_ORDER = [
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
export const CONTEXT_ROLE_TYPE_ORDER = [
  '男主角',
  '女主角',
  '重要正派角色',
  '正派配角',
  '重要反派角色',
  '反派配角',
  '龙套角色',
  '未分类',
];

export const PUBLISH_CONFIRM_KEY = 'xinyuexia_workbench_publish_confirm';
export const GLOBAL_NOTES_KEY = 'xinyuexia_workbench_notes';
export const WORK_NOTES_KEY_PREFIX = 'xinyuexia_workbench_notes_';
export const GLOBAL_NOTES_LIST_KEY = 'xinyuexia_workbench_notes_list_v1';
export const WORK_NOTES_LIST_KEY_PREFIX = 'xinyuexia_workbench_notes_list_v1_';
export const APP_SCALE_KEY = 'xinyuexia_app_scale';
export const APP_SCALE_VERSION_KEY = 'xinyuexia_app_scale_version';
export const APP_SCALE_BASE = 1.1;
export const APP_SCALE_STORAGE_VERSION = '2';
export const APP_EFFECTIVE_SCALE_CSS_VAR = '--xinyuexia-effective-scale';

export function ContextSourceWordStatus({ label, value }: { label: string; value: number }) {
  if (value <= 0) return <span className="font-black text-red-500">无{label}</span>;
  return (
    <>
      <span className="shrink-0">{label}</span>
      <WordCountText value={value} compact />
    </>
  );
}

export function getEffectiveAppScale() {
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

export function getAiPanelMaxWidth() {
  if (typeof window === 'undefined') return AI_PANEL_DEFAULT_WIDTH;
  return Math.max(AI_PANEL_MIN_WIDTH, Math.floor(window.innerWidth / (3 * getEffectiveAppScale())));
}

export function normalizeAiPanelWidth(value: number) {
  const maxWidth = getAiPanelMaxWidth();
  const minWidth = Math.min(AI_PANEL_MIN_WIDTH, maxWidth);
  if (!Number.isFinite(value)) return Math.min(AI_PANEL_DEFAULT_WIDTH, maxWidth);
  return Math.max(minWidth, Math.min(maxWidth, value));
}

export function getChapterSidebarMaxWidth() {
  if (typeof window === 'undefined') return CHAPTER_SIDEBAR_DEFAULT_WIDTH;
  return Math.max(CHAPTER_SIDEBAR_MIN_WIDTH, Math.floor(window.innerWidth / (5 * getEffectiveAppScale())));
}

export function normalizeChapterSidebarWidth(value: number) {
  const maxWidth = Math.min(CHAPTER_SIDEBAR_MAX_WIDTH, getChapterSidebarMaxWidth());
  const minWidth = Math.min(CHAPTER_SIDEBAR_MIN_WIDTH, maxWidth);
  if (!Number.isFinite(value)) return Math.min(CHAPTER_SIDEBAR_DEFAULT_WIDTH, maxWidth);
  return Math.max(minWidth, Math.min(maxWidth, value));
}

export function readWorkbenchChapterSidebarWidth() {
  if (readSharedWorkbenchLeftNavWidthEnabled()) {
    return normalizeChapterSidebarWidth(
      readSharedWorkbenchLeftNavWidth(getChapterSidebarMaxWidth(), CHAPTER_SIDEBAR_MIN_WIDTH),
    );
  }
  const saved = Number.parseInt(
    localStorage.getItem('xinyuexia_chapter_sidebar_width') ?? String(CHAPTER_SIDEBAR_DEFAULT_WIDTH),
    10,
  );
  return normalizeChapterSidebarWidth(saved);
}

export function normalizePublishedSidebarWidth(value: number) {
  if (!Number.isFinite(value)) return PUBLISHED_SIDEBAR_DEFAULT_WIDTH;
  return Math.max(PUBLISHED_SIDEBAR_MIN_WIDTH, Math.min(PUBLISHED_SIDEBAR_MAX_WIDTH, value));
}

export function readWorkbenchPublishedSidebarWidth() {
  if (readSharedWorkbenchLeftNavWidthEnabled()) {
    return normalizePublishedSidebarWidth(
      readSharedWorkbenchLeftNavWidth(PUBLISHED_SIDEBAR_MAX_WIDTH, PUBLISHED_SIDEBAR_MIN_WIDTH),
    );
  }
  return normalizePublishedSidebarWidth(
    Number.parseInt(
      localStorage.getItem('xinyuexia_published_sidebar_width') ?? String(PUBLISHED_SIDEBAR_DEFAULT_WIDTH),
      10,
    ),
  );
}

export function formatMemoTime() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function createMemoItem(scope: MemoScope, index: number, content = ''): MemoItem {
  return {
    id: `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${scope === 'global' ? '全局' : '作品'}备忘录 ${index}`,
    content,
    updatedAt: formatMemoTime(),
  };
}

export function readMemoItems(listKey: string, legacyKey: string, scope: MemoScope) {
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
