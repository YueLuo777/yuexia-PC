import { Folder, FolderOpen, Settings } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { useModels } from '@/features/models/hooks/useModels';
import { callModelStream } from '@/features/models/services/callModel';
import { normalizePromptCategoryName, readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import {
  ASSOCIATED_CHAPTERS_KEY,
  CHAPTER_ASSOCIATE_UPDATED_EVENT,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import {
  ChapterAssociateModal,
  FontSettingsModal,
  HighFreqModal,
  HighFreqToggle,
  HighlightOverlay,
  HistoryModal,
  SmartFormatModal,
  SymbolReplaceModal,
  SymbolReplaceToggle,
  TitleOptimizeModal,
  EDITOR_GRID_LINE_LEFT_OFFSET_PX,
  EDITOR_GRID_LINE_RIGHT_OFFSET_PX,
  applyFormat,
  applySymbolReplace,
  getStoredFormatSettings,
  getStoredFontSettings,
  getEditorGridLineStyle,
  getStoredSymbolReplaceSettings,
  isSymbolReplaceEnabled,
  saveSnapshot,
  stripLineIndents,
  type FormatOptions,
  type FontSettings,
} from '@/features/workbench/components/EditorToolModals';
import { isRememberAssociationsEnabled } from '@/shared/settings/associationMemory';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { AiRequestLogGroups } from '@/shared/ui/AiRequestLogGroups';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { WordCountText } from '@/shared/ui/WordCountText';

const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 150;
const SPLIT_BUTTON_OUTLINE_GROUP_CLASS = 'flex h-8 items-stretch overflow-hidden rounded-md border border-brand bg-white shadow-none';
const SPLIT_BUTTON_OUTLINE_ACTION_CLASS = 'inline-flex flex-1 items-center justify-center whitespace-nowrap px-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light';
const REVIEW_PAGE_LEFT_WIDTH = 220;
const REVIEW_PAGE_RIGHT_WIDTH = 300;
const STATUS_PAGE_LEFT_WIDTH = 230;
const STATUS_PAGE_RIGHT_WIDTH = 360;
const REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_left_width';
const REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_right_width';
const STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_left_width';
const STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_right_width';
const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] xy-flow-group-bg px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm transition-colors';
const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';
const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';
const REVIEW_PAGE_LEFT_WIDTH_LIMIT = { min: 180, max: 360 };
const REVIEW_PAGE_RIGHT_WIDTH_LIMIT = { min: 260, max: 520 };
const STATUS_PAGE_LEFT_WIDTH_LIMIT = { min: 190, max: 360 };
const STATUS_PAGE_RIGHT_WIDTH_LIMIT = { min: 300, max: 560 };
const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS = 'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';
const STATUS_PROMPT_CATEGORY = '状态';
const POLISH_PROMPT_CATEGORY = '润色';
type EditorFieldSizeKey = 'reviewActionGroup' | 'reviewModelSelect' | 'reviewAuditPromptSelect' | 'reviewCommentPromptSelect';
type EditorFieldSizeSpec = { width: number; height: number; fontSize: number };
type EditorFieldSizeProp = keyof EditorFieldSizeSpec;

const EDITOR_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';
const EDITOR_FIELD_SIZE_DEFAULTS: Record<EditorFieldSizeKey, EditorFieldSizeSpec> = {
  reviewActionGroup: { width: 168, height: 32, fontSize: 14 },
  reviewModelSelect: { width: 250, height: 44, fontSize: 13 },
  reviewAuditPromptSelect: { width: 250, height: 44, fontSize: 13 },
  reviewCommentPromptSelect: { width: 250, height: 44, fontSize: 13 },
};
const EDITOR_FIELD_SIZE_LABELS: Record<EditorFieldSizeKey, string> = {
  reviewActionGroup: '审核点评润色状态按钮',
  reviewModelSelect: '审核点评润色模型框',
  reviewAuditPromptSelect: '审核提示词框',
  reviewCommentPromptSelect: '点评提示词框',
};
const EDITOR_FIELD_SIZE_LIMITS: Record<EditorFieldSizeProp, { min: number; max: number }> = {
  width: { min: 120, max: 520 },
  height: { min: 28, max: 120 },
  fontSize: { min: 11, max: 24 },
};

function clampEditorFieldSizeValue(prop: EditorFieldSizeProp, value: number) {
  const limit = EDITOR_FIELD_SIZE_LIMITS[prop];
  if (!Number.isFinite(value)) return EDITOR_FIELD_SIZE_DEFAULTS.reviewModelSelect[prop];
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

function normalizeEditorFieldSizeSpec(key: EditorFieldSizeKey, value?: Partial<EditorFieldSizeSpec>): EditorFieldSizeSpec {
  const base = EDITOR_FIELD_SIZE_DEFAULTS[key];
  return {
    width: clampEditorFieldSizeValue('width', value?.width ?? base.width),
    height: clampEditorFieldSizeValue('height', value?.height ?? base.height),
    fontSize: clampEditorFieldSizeValue('fontSize', value?.fontSize ?? base.fontSize),
  };
}

function readEditorFieldSizeSpecs(): Record<EditorFieldSizeKey, EditorFieldSizeSpec> {
  try {
    const parsed = JSON.parse(localStorage.getItem(EDITOR_FIELD_SIZE_STORAGE_KEY) || '{}') as Partial<Record<EditorFieldSizeKey, Partial<EditorFieldSizeSpec>>>;
    return (Object.keys(EDITOR_FIELD_SIZE_DEFAULTS) as EditorFieldSizeKey[]).reduce((acc, key) => {
      acc[key] = normalizeEditorFieldSizeSpec(key, parsed[key]);
      return acc;
    }, {} as Record<EditorFieldSizeKey, EditorFieldSizeSpec>);
  } catch {
    return { ...EDITOR_FIELD_SIZE_DEFAULTS };
  }
}

function writeEditorFieldSizeSpecs(specs: Record<EditorFieldSizeKey, EditorFieldSizeSpec>) {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(localStorage.getItem(EDITOR_FIELD_SIZE_STORAGE_KEY) || '{}') as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  localStorage.setItem(EDITOR_FIELD_SIZE_STORAGE_KEY, JSON.stringify({ ...parsed, ...specs }));
}

function clampPanelWidth(value: number, limit: { min: number; max: number }) {
  if (!Number.isFinite(value)) return limit.min;
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

function readStoredPanelWidth(storageKey: string, fallback: number, limit: { min: number; max: number }) {
  try {
    const stored = Number(localStorage.getItem(storageKey));
    return clampPanelWidth(Number.isFinite(stored) && stored > 0 ? stored : fallback, limit);
  } catch {
    return clampPanelWidth(fallback, limit);
  }
}

function getEditorFieldSizeStyle(spec: EditorFieldSizeSpec): CSSProperties {
  return {
    width: spec.width,
    minWidth: EDITOR_FIELD_SIZE_LIMITS.width.min,
    maxWidth: '100%',
    '--xy-field-width': `${spec.width}px`,
    '--xy-field-height': `${spec.height}px`,
    '--xy-field-font-size': `${spec.fontSize}px`,
  } as CSSProperties;
}

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

function EditorFieldSizeNumberInput({
  label,
  prop,
  value,
  onChange,
}: {
  label: string;
  prop: EditorFieldSizeProp;
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
    const normalizedValue = clampEditorFieldSizeValue(prop, Number(nextValue));
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
        onChange={(event) => setDraftValue(event.target.value.replace(/[^\d]/g, ''))}
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

function readAssociatedChapterCount(chapters: Pick<Chapter, 'id'>[]) {
  try {
    const parsed = JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return 0;
    const validIds = new Set(chapters.map((chapter) => chapter.id));
    return parsed.filter((id) => Number.isFinite(id) && validIds.has(Number(id))).length;
  } catch {
    return 0;
  }
}

type ChapterEditorEmbeddedMode = 'audit' | 'comment' | 'polish' | 'status';
type ReviewMode = 'audit' | 'comment' | 'polish';
type ReviewModeState = {
  input: string;
  output: string;
  revisedDraft: string;
  compareView: 'preview' | 'paragraph' | 'full';
  appliedParagraphs: Set<number>;
  requestLog: string;
  backgroundTaskId?: string;
};

const REVIEW_MODE_TITLES: Record<ReviewMode, string> = {
  audit: '审核',
  comment: '点评',
  polish: POLISH_PROMPT_CATEGORY,
};

const REVIEW_MODE_DEFAULT_INSTRUCTIONS: Record<ReviewMode, string> = {
  audit: '请对文章内容进行审核：检查错别字、语病、逻辑问题，以及是否按照章纲来写。输出需要列出问题位置、问题说明和修改建议。',
  comment: '请对文章内容进行点评：判断内容是否吸引人，重点点评开篇钩子、节奏、冲突、情绪张力和读者继续阅读欲望，并给出可执行的优化建议。',
  polish: '请对文章内容进行润色：只优化语言表达、节奏、句子顺滑度、画面感和情绪力度，不改变剧情事件、人物行动、设定信息和章节结果。输出需要提供可替换的完整润色稿。',
};

function createReviewModeState(): ReviewModeState {
  return {
    input: '',
    output: '',
    revisedDraft: '',
    compareView: 'preview',
    appliedParagraphs: new Set(),
    requestLog: '',
  };
}

function getReviewBackgroundTaskStorageKey(settingsStorageKey: string) {
  return `${settingsStorageKey}_review_background_tasks_v1`;
}

function readReviewBackgroundTaskIds(settingsStorageKey: string): Partial<Record<ReviewMode, string>> {
  try {
    const parsed = JSON.parse(localStorage.getItem(getReviewBackgroundTaskStorageKey(settingsStorageKey)) ?? '{}') as Record<string, unknown>;
    return {
      audit: typeof parsed.audit === 'string' ? parsed.audit : undefined,
      comment: typeof parsed.comment === 'string' ? parsed.comment : undefined,
      polish: typeof parsed.polish === 'string' ? parsed.polish : undefined,
    };
  } catch {
    return {};
  }
}

function writeReviewBackgroundTaskId(settingsStorageKey: string, mode: ReviewMode, taskId?: string) {
  const current = readReviewBackgroundTaskIds(settingsStorageKey);
  const next = { ...current, [mode]: taskId };
  if (!taskId) delete next[mode];
  localStorage.setItem(getReviewBackgroundTaskStorageKey(settingsStorageKey), JSON.stringify(next));
}

interface ChapterEditorProps {
  embeddedMode?: ChapterEditorEmbeddedMode;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  chapter: Chapter | null;
  volumeName: string | null;
  content: string;
  lastSavedAt: string | null;
  allChapters: Chapter[];
  volumes?: Volume[];
  settingsStorageKey: string;
  outlineStorageKey?: string;
  getChapterContent: (chapterId: number) => string;
  onUpdateChapterContent: (chapterId: number, content: string) => void;
  onRenameChapter: (chapterId: number, title: string) => void;
  onChangeContent: (content: string) => void;
  onUpdateSerialNumber: (chapterId: number, serialNumber: number) => void;
  onDeleteChapter: (chapterId: number) => void;
  onOpenFind: () => void;
  onOpenSummaryLibrary: () => void;
}

function getStatusTargetLabel(entry: WorkbenchLibraryEntry) {
  return `${entry.tab}${entry.type ? ` / ${entry.type}` : ''}`;
}

function isStatusTargetEntry(entry: WorkbenchLibraryEntry) {
  const source = `${entry.tab} ${entry.type ?? ''} ${entry.title} ${entry.content}`;
  if (/脑洞|草稿|概要|梗概|细纲/.test(entry.tab)) return false;
  return /角色|人物|主角|配角|反派|宝物|法宝|道具|装备|势力|组织|宗门|家族|王朝|学院/.test(source);
}

function getExistingStatusForChapter(content: string, chapterSerial: number) {
  const pattern = new RegExp(`^- 更新到第${chapterSerial}章[^\\n]*：(.+)$`, 'm');
  return content.match(pattern)?.[1]?.trim() ?? '';
}

function upsertEntryStatus(content: string, chapter: Chapter, status: string) {
  const cleanStatus = status.trim();
  const titlePart = chapter.title ? `《${chapter.title}》` : '';
  const nextLine = `- 更新到第${chapter.serialNumber}章${titlePart}：${cleanStatus}`;
  const linePattern = new RegExp(`^- 更新到第${chapter.serialNumber}章[^\\n]*$`, 'm');
  if (linePattern.test(content)) return content.replace(linePattern, nextLine);
  const marker = '【状态记录】';
  if (content.includes(marker)) return `${content.trimEnd()}\n${nextLine}`;
  return `${content.trimEnd()}\n\n${marker}\n${nextLine}`.trimStart();
}

function countCompactWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function getReviewLogSection(log: string, title: string) {
  const marker = `【${title}】`;
  const start = log.indexOf(marker);
  if (start >= 0) {
    const bodyStart = start + marker.length;
    const next = log.slice(bodyStart).search(/\n【[^】]+】/);
    return (next < 0 ? log.slice(bodyStart) : log.slice(bodyStart, bodyStart + next)).trim();
  }

  const legacyMatches = [...log.matchAll(/\n([^\n]*(?:【|銆)[^\n]*)\n/g)];
  const fallbackIndex = title === '系统提示词' ? 0 : title === '用户要求' ? 1 : title === '发送上下文' ? 2 : -1;
  const fallback = fallbackIndex >= 0 ? legacyMatches[fallbackIndex] : null;
  if (!fallback) return '';
  const bodyStart = (fallback.index ?? 0) + fallback[0].length;
  const next = log.slice(bodyStart).search(/\n[^\n]*(?:【|銆)[^\n]*\n/);
  return (next < 0 ? log.slice(bodyStart) : log.slice(bodyStart, bodyStart + next)).trim();
}

function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body,
  ].join('\n').trimEnd();
}

function renderAiThinkingContent(content: string) {
  const thinkingMatch = content.match(/^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/);
  if (!thinkingMatch) return <div className="whitespace-pre-wrap break-words">{content}</div>;
  const seconds = thinkingMatch[1] ?? '0';
  const done = thinkingMatch[2] === 'done';
  const reasoning = thinkingMatch[3]?.trim() ?? '';
  const answer = thinkingMatch[4]?.trimStart() ?? '';
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] p-3 text-xs leading-6 text-slate-600">
        <div className="mb-1 font-black text-[#078fb0]">
          {done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`}
        </div>
        {reasoning && <div className="max-h-36 overflow-y-auto whitespace-pre-wrap break-words">{reasoning}</div>}
      </div>
      {answer && <div className="whitespace-pre-wrap break-words">{answer}</div>}
    </div>
  );
}

function isReviewDetailOutlineEntry(entry: WorkbenchLibraryEntry) {
  return /章节细纲|细纲|绔犺妭缁嗙翰|缁嗙翰/.test(`${entry.tab} ${entry.title} ${entry.type ?? ''}`);
}

function findReviewDetailOutline(entries: WorkbenchLibraryEntry[], chapter: Chapter | null) {
  if (!chapter) return null;
  const serialPatterns = [
    new RegExp(`第\\s*${chapter.serialNumber}\\s*章`),
    new RegExp(`绗\\s*${chapter.serialNumber}\\s*绔`),
    new RegExp(`\\b${chapter.serialNumber}\\b`),
  ];
  return entries.find((entry) => (
    isReviewDetailOutlineEntry(entry)
    && serialPatterns.some((pattern) => pattern.test(`${entry.title} ${entry.type ?? ''}`))
  )) ?? null;
}

function stripReviewThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

function getReviewBackgroundTaskOutput(task: BackgroundAiTask, mode: ReviewMode) {
  if (task.status === 'aborted' && !stripReviewThinkingBlock(task.output).trim()) {
    return `【已停止】本次${REVIEW_MODE_TITLES[mode]}已停止。`;
  }
  if (task.status === 'failed' && task.error && !stripReviewThinkingBlock(task.output).trim()) {
    return `【错误】${task.error}`;
  }
  return task.output;
}

function extractReviewRevisedText(output: string) {
  const clean = stripReviewThinkingBlock(output);
  const marked = clean.match(/【修改后全文】\s*([\s\S]*?)(?=\n?【(?:审核|点评|修改说明|问题|建议|原文|说明)[^】]*】|$)/);
  if (marked?.[1]?.trim()) return marked[1].trim();
  const fenced = clean.match(/```(?:text|txt|markdown|md)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();
  return '';
}

function splitReviewParagraphs(text: string) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function buildReviewParagraphDiffs(originalText: string, revisedText: string) {
  const original = splitReviewParagraphs(originalText);
  const revised = splitReviewParagraphs(revisedText);
  const maxLength = Math.max(original.length, revised.length);
  return Array.from({ length: maxLength }, (_, index) => {
    const before = original[index] ?? '';
    const after = revised[index] ?? '';
    return {
      index,
      before,
      after,
      changed: before !== after,
    };
  });
}

function renderInlineTextDiff(before: string, after: string, mode: 'before' | 'after') {
  if (before === after) return before || <span className="text-slate-300">空段落</span>;
  let prefixLength = 0;
  while (
    prefixLength < before.length
    && prefixLength < after.length
    && before[prefixLength] === after[prefixLength]
  ) {
    prefixLength += 1;
  }
  let suffixLength = 0;
  while (
    suffixLength < before.length - prefixLength
    && suffixLength < after.length - prefixLength
    && before[before.length - 1 - suffixLength] === after[after.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }
  const source = mode === 'before' ? before : after;
  const changed = source.slice(prefixLength, source.length - suffixLength);
  const suffix = suffixLength > 0 ? source.slice(source.length - suffixLength) : '';
  return (
    <>
      {source.slice(0, prefixLength)}
      {changed && (
        <mark className={mode === 'before' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
          {changed}
        </mark>
      )}
      {suffix}
    </>
  );
}

export function ChapterEditor({
  embeddedMode,
  fieldSizeOpenSignal = 0,
  showInlineFieldSizeButton = true,
  openLogSignal = 0,
  chapter,
  volumeName,
  content,
  lastSavedAt,
  allChapters,
  volumes = [],
  settingsStorageKey,
  outlineStorageKey,
  getChapterContent,
  onUpdateChapterContent,
  onRenameChapter,
  onChangeContent,
  onUpdateSerialNumber,
  onDeleteChapter,
  onOpenFind,
  onOpenSummaryLibrary,
}: ChapterEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isSmartFormatOpen, setIsSmartFormatOpen] = useState(false);
  const [isHighFreqOpen, setIsHighFreqOpen] = useState(false);
  const [isSymbolReplaceOpen, setIsSymbolReplaceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTitleOptimizeOpen, setIsTitleOptimizeOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(() => embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish');
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(() => embeddedMode === 'status');
  const [isEditorFieldSizeOpen, setIsEditorFieldSizeOpen] = useState(false);
  const lastFieldSizeOpenSignalRef = useRef(fieldSizeOpenSignal);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const [editorFieldSizeSpecs, setEditorFieldSizeSpecs] = useState<Record<EditorFieldSizeKey, EditorFieldSizeSpec>>(() => readEditorFieldSizeSpecs());
  const [reviewPageLeftWidth, setReviewPageLeftWidth] = useState(() => readStoredPanelWidth(REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY, REVIEW_PAGE_LEFT_WIDTH, REVIEW_PAGE_LEFT_WIDTH_LIMIT));
  const [reviewPageRightWidth, setReviewPageRightWidth] = useState(() => readStoredPanelWidth(REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY, REVIEW_PAGE_RIGHT_WIDTH, REVIEW_PAGE_RIGHT_WIDTH_LIMIT));
  const [statusPageLeftWidth, setStatusPageLeftWidth] = useState(() => readStoredPanelWidth(STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY, STATUS_PAGE_LEFT_WIDTH, STATUS_PAGE_LEFT_WIDTH_LIMIT));
  const [statusPageRightWidth, setStatusPageRightWidth] = useState(() => readStoredPanelWidth(STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY, STATUS_PAGE_RIGHT_WIDTH, STATUS_PAGE_RIGHT_WIDTH_LIMIT));
  const [reviewChapterId, setReviewChapterId] = useState<number | null>(() => chapter?.id ?? null);
  const [statusChapterId, setStatusChapterId] = useState<number | null>(() => chapter?.id ?? null);
  const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());
  const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());
  const [statusEntries, setStatusEntries] = useState<WorkbenchLibraryEntry[]>([]);
  const [statusTargetIds, setStatusTargetIds] = useState<Set<string>>(() => new Set());
  const [statusDraft, setStatusDraft] = useState('');
  const [reviewModelId, setReviewModelId] = useState('');
  const [reviewMode, setReviewMode] = useState<ReviewMode>(() => (
    embeddedMode === 'comment' || embeddedMode === 'polish' ? embeddedMode : 'audit'
  ));
  const [reviewAuditPromptId, setReviewAuditPromptId] = useState('');
  const [reviewCommentPromptId, setReviewCommentPromptId] = useState('');
  const [reviewPolishPromptId, setReviewPolishPromptId] = useState('');
  const [statusPromptId, setStatusPromptId] = useState('');
  const [reviewModeStates, setReviewModeStates] = useState<Record<ReviewMode, ReviewModeState>>(() => ({
    audit: createReviewModeState(),
    comment: createReviewModeState(),
    polish: createReviewModeState(),
  }));
  const [isReviewAiLoading, setIsReviewAiLoading] = useState(false);
  const [isReviewLogOpen, setIsReviewLogOpen] = useState(false);
  const [reviewManagementModal, setReviewManagementModal] = useState<'models' | 'prompts' | null>(null);
  const [embeddedPortalElement, setEmbeddedPortalElement] = useState<HTMLDivElement | null>(null);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [fontSettings, setFontSettings] = useState<FontSettings>(getStoredFontSettings);
  const [formatSettings, setFormatSettings] = useState<FormatOptions>(getStoredFormatSettings);
  const editorGridLineStyle = useMemo(() => getEditorGridLineStyle(fontSettings, editorScrollTop), [editorScrollTop, fontSettings]);
  const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;
  const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;
  const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;
  const [copyToast, setCopyToast] = useState('');
  const [associatedCount, setAssociatedCount] = useState(0);
  const reviewModalDraggable = useDraggableModal('chapter_review_panel');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const associatedSelectionRef = useRef(false);
  const prevContentRef = useRef('');
  const pendingCursorRef = useRef<{ text: string; cursorPos: number; scrollTop: number } | null>(null);
  const activeReviewState = reviewModeStates[reviewMode];
  const activeChapterId = chapter?.id ?? null;
  const updateReviewModeState = (mode: ReviewMode, updater: (state: ReviewModeState) => ReviewModeState) => {
    setReviewModeStates((prev) => ({
      ...prev,
      [mode]: updater(prev[mode]),
    }));
  };
  const updateActiveReviewState = (updater: (state: ReviewModeState) => ReviewModeState) => {
    updateReviewModeState(reviewMode, updater);
  };
  const reviewAiInput = activeReviewState.input;
  const reviewAiOutput = activeReviewState.output;
  const reviewRevisedDraft = activeReviewState.revisedDraft;
  const reviewCompareView = activeReviewState.compareView;
  const reviewAppliedParagraphs = activeReviewState.appliedParagraphs;
  const reviewRequestLog = activeReviewState.requestLog;
  const setReviewAiInput = (value: string | ((current: string) => string)) => {
    updateActiveReviewState((state) => ({
      ...state,
      input: typeof value === 'function' ? value(state.input) : value,
    }));
  };
  const setReviewAiOutput = (value: string | ((current: string) => string)) => {
    updateActiveReviewState((state) => ({
      ...state,
      output: typeof value === 'function' ? value(state.output) : value,
    }));
  };
  const setReviewRevisedDraft = (value: string | ((current: string) => string)) => {
    updateActiveReviewState((state) => ({
      ...state,
      revisedDraft: typeof value === 'function' ? value(state.revisedDraft) : value,
    }));
  };
  const setReviewCompareView = (value: ReviewModeState['compareView'] | ((current: ReviewModeState['compareView']) => ReviewModeState['compareView'])) => {
    updateActiveReviewState((state) => ({
      ...state,
      compareView: typeof value === 'function' ? value(state.compareView) : value,
    }));
  };
  const setReviewAppliedParagraphs = (value: Set<number> | ((current: Set<number>) => Set<number>)) => {
    updateActiveReviewState((state) => ({
      ...state,
      appliedParagraphs: typeof value === 'function' ? value(state.appliedParagraphs) : value,
    }));
  };
  useTopModalEscape(isReviewLogOpen, () => setIsReviewLogOpen(false));
  useTopModalEscape(Boolean(reviewManagementModal), () => setReviewManagementModal(null));
  useTopModalEscape(isEditorFieldSizeOpen, () => setIsEditorFieldSizeOpen(false));
  useTopModalEscape(!embeddedMode && isReviewOpen && !isReviewLogOpen && !reviewManagementModal, () => setIsReviewOpen(false));
  useTopModalEscape(!embeddedMode && isStatusUpdateOpen, () => setIsStatusUpdateOpen(false));
  useTopModalEscape(isFindOpen, () => setIsFindOpen(false));

  useEffect(() => {
    if (fieldSizeOpenSignal <= 0 || fieldSizeOpenSignal === lastFieldSizeOpenSignalRef.current) return;
    lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
    setIsEditorFieldSizeOpen(true);
  }, [fieldSizeOpenSignal]);

  useEffect(() => {
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    lastOpenLogSignalRef.current = openLogSignal;
    setIsReviewLogOpen(true);
  }, [openLogSignal]);

  const titleCount = chapter?.title.length ?? 0;
  const serialValue = chapter?.serialNumber ?? 1;
  const safeVolumeName = volumeName ?? '第一卷';
  const wordCount = useMemo(() => content.replace(/\s/g, '').length, [content]);
  const getEditorFieldStyle = (key: EditorFieldSizeKey) => getEditorFieldSizeStyle(editorFieldSizeSpecs[key] ?? EDITOR_FIELD_SIZE_DEFAULTS[key]);
  const getEmbeddedEditorFieldStyle = (key: EditorFieldSizeKey): CSSProperties => (
    showInlineFieldSizeButton
      ? getEditorFieldStyle(key)
      : {
        ...getEditorFieldStyle(key),
        width: '100%',
        maxWidth: '100%',
        '--xy-field-width': '100%',
      } as CSSProperties
  );
  const updateEditorFieldSizeSpec = (key: EditorFieldSizeKey, prop: EditorFieldSizeProp, value: number) => {
    setEditorFieldSizeSpecs((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          [prop]: clampEditorFieldSizeValue(prop, value),
        },
      };
      writeEditorFieldSizeSpecs(next);
      return next;
    });
  };
  const resetEditorFieldSizeSpecs = () => {
    const next = {
      ...editorFieldSizeSpecs,
      reviewActionGroup: { ...EDITOR_FIELD_SIZE_DEFAULTS.reviewActionGroup },
      reviewModelSelect: { ...EDITOR_FIELD_SIZE_DEFAULTS.reviewModelSelect },
      reviewAuditPromptSelect: { ...EDITOR_FIELD_SIZE_DEFAULTS.reviewAuditPromptSelect },
      reviewCommentPromptSelect: { ...EDITOR_FIELD_SIZE_DEFAULTS.reviewCommentPromptSelect },
    };
    writeEditorFieldSizeSpecs(next);
    setEditorFieldSizeSpecs(next);
  };
  const startPanelWidthResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    options: {
      initialWidth: number;
      storageKey: string;
      limit: { min: number; max: number };
      direction: 1 | -1;
      onChange: (value: number) => void;
    },
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const startX = event.clientX;
    const { initialWidth, storageKey, limit, direction, onChange } = options;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const nextWidth = clampPanelWidth(initialWidth + (moveEvent.clientX - startX) * direction, limit);
      onChange(nextWidth);
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      const finalWidth = clampPanelWidth(initialWidth + (upEvent.clientX - startX) * direction, limit);
      onChange(finalWidth);
      localStorage.setItem(storageKey, String(finalWidth));
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const renderPanelResizeHandle = (
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void,
  ) => (
    <div
      data-no-modal-drag="true"
      onPointerDown={onPointerDown}
      className={CHAPTER_EDITOR_RESIZE_HANDLE_CLASS}
      title="拖拽调整宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
  const statusLeftResizeHandle = renderPanelResizeHandle((event) => startPanelWidthResize(event, {
    initialWidth: statusPageLeftWidth,
    storageKey: STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
    limit: STATUS_PAGE_LEFT_WIDTH_LIMIT,
    direction: 1,
    onChange: setStatusPageLeftWidth,
  }));
  const statusRightResizeHandle = renderPanelResizeHandle((event) => startPanelWidthResize(event, {
    initialWidth: statusPageRightWidth,
    storageKey: STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY,
    limit: STATUS_PAGE_RIGHT_WIDTH_LIMIT,
    direction: -1,
    onChange: setStatusPageRightWidth,
  }));
  const reviewLeftResizeHandle = renderPanelResizeHandle((event) => startPanelWidthResize(event, {
    initialWidth: reviewPageLeftWidth,
    storageKey: REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
    limit: REVIEW_PAGE_LEFT_WIDTH_LIMIT,
    direction: 1,
    onChange: setReviewPageLeftWidth,
  }));
  const reviewRightResizeHandle = renderPanelResizeHandle((event) => startPanelWidthResize(event, {
    initialWidth: reviewPageRightWidth,
    storageKey: REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY,
    limit: REVIEW_PAGE_RIGHT_WIDTH_LIMIT,
    direction: -1,
    onChange: setReviewPageRightWidth,
  }));
  const { models: modelSnapshot } = useModels();
  const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);
  const reviewPrompts = useMemo(() => readPromptSnapshot().prompts, []);
  const reviewAuditPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === '审核');
  }, [reviewPrompts]);
  const reviewCommentPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === '点评');
  }, [reviewPrompts]);
  const reviewPolishPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === POLISH_PROMPT_CATEGORY);
  }, [reviewPrompts]);
  const statusPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === STATUS_PROMPT_CATEGORY);
  }, [reviewPrompts]);
  const sortedReviewChapters = useMemo(() => [...allChapters].sort((a, b) => a.serialNumber - b.serialNumber), [allChapters]);
  const chapterDirectoryGroups = useMemo(() => {
    if (volumes.length > 0) {
      return volumes.map((volume) => ({
        id: volume.id,
        name: volume.name,
        chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber),
      }));
    }
    return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];
  }, [sortedReviewChapters, volumes]);
  useEffect(() => {
    setExpandedReviewVolumeIds((current) => {
      const next = new Set(current);
      chapterDirectoryGroups.forEach((group) => next.add(group.id));
      return next;
    });
    setExpandedStatusVolumeIds((current) => {
      const next = new Set(current);
      chapterDirectoryGroups.forEach((group) => next.add(group.id));
      return next;
    });
  }, [chapterDirectoryGroups]);
  const toggleReviewDirectoryVolume = (volumeId: number) => {
    setExpandedReviewVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };
  const toggleStatusDirectoryVolume = (volumeId: number) => {
    setExpandedStatusVolumeIds((current) => {
      const next = new Set(current);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };
  const activeReviewChapter = sortedReviewChapters.find((item) => item.id === reviewChapterId) ?? chapter ?? sortedReviewChapters[0] ?? null;
  const activeReviewContent = activeReviewChapter
    ? activeReviewChapter.id === chapter?.id
      ? content
      : getChapterContent(activeReviewChapter.id)
    : '';
  const activeReviewWordCount = activeReviewContent.replace(/\s/g, '').length;
  const reviewDetailOutlineEntries = useMemo(() => {
    const entries = readWorkbenchLibraryEntries(settingsStorageKey);
    const outlineEntries = outlineStorageKey ? readWorkbenchLibraryEntries(outlineStorageKey) : [];
    return [...entries, ...outlineEntries].filter(isReviewDetailOutlineEntry);
  }, [outlineStorageKey, settingsStorageKey]);
  const activeReviewDetailOutline = useMemo(
    () => findReviewDetailOutline(reviewDetailOutlineEntries, activeReviewChapter),
    [activeReviewChapter, reviewDetailOutlineEntries],
  );
  const activeReviewModel = reviewModels.find((model) => model.id === reviewModelId) ?? reviewModels[0] ?? null;
  const activeAuditPrompt = reviewAuditPrompts.find((prompt) => prompt.id === reviewAuditPromptId) ?? reviewAuditPrompts[0] ?? null;
  const activeCommentPrompt = reviewCommentPrompts.find((prompt) => prompt.id === reviewCommentPromptId) ?? reviewCommentPrompts[0] ?? null;
  const activePolishPrompt = reviewPolishPrompts.find((prompt) => prompt.id === reviewPolishPromptId) ?? reviewPolishPrompts[0] ?? null;
  const activeReviewPrompt = reviewMode === 'audit' ? activeAuditPrompt : reviewMode === 'comment' ? activeCommentPrompt : activePolishPrompt;
  const activeReviewPromptOptions = reviewMode === 'audit' ? reviewAuditPrompts : reviewMode === 'comment' ? reviewCommentPrompts : reviewPolishPrompts;
  const activeReviewPromptId = reviewMode === 'audit' ? reviewAuditPromptId : reviewMode === 'comment' ? reviewCommentPromptId : reviewPolishPromptId;
  const setActiveReviewPromptId = reviewMode === 'audit' ? setReviewAuditPromptId : reviewMode === 'comment' ? setReviewCommentPromptId : setReviewPolishPromptId;
  const activeReviewPromptCategory = REVIEW_MODE_TITLES[reviewMode];
  const activeStatusPromptId = statusPrompts.some((prompt) => prompt.id === statusPromptId) ? statusPromptId : statusPrompts[0]?.id ?? '';
  const reviewParagraphDiffs = useMemo(
    () => buildReviewParagraphDiffs(activeReviewContent, reviewRevisedDraft),
    [activeReviewContent, reviewRevisedDraft],
  );
  const reviewChangedParagraphs = reviewParagraphDiffs.filter((item) => item.changed);
  const sortedStatusChapters = sortedReviewChapters;
  const activeStatusChapter = sortedStatusChapters.find((item) => item.id === statusChapterId) ?? chapter ?? sortedStatusChapters[0] ?? null;
  const statusPreviewChapters = activeStatusChapter
    ? sortedStatusChapters.filter((item) => item.serialNumber <= activeStatusChapter.serialNumber)
    : [];
  const statusPreviewText = statusPreviewChapters
    .map((item) => {
      const body = item.id === chapter?.id ? content : getChapterContent(item.id);
      return `第${item.serialNumber}章 ${item.title || '未命名章节'}\n${body || '暂无正文'}`;
    })
    .join('\n\n');
  const statusPreviewWordCount = statusPreviewText.replace(/\s/g, '').length;
  const statusTargetEntries = useMemo(() => statusEntries.filter(isStatusTargetEntry), [statusEntries]);
  const selectedStatusTargets = statusTargetEntries.filter((entry) => statusTargetIds.has(entry.id));
  const statusUpdateSourceEntries = selectedStatusTargets.length > 0 ? selectedStatusTargets : statusTargetEntries;
  const statusUpdatedChapterIds = useMemo(() => new Set(
    sortedStatusChapters
      .filter((item) => statusUpdateSourceEntries.some((entry) => getExistingStatusForChapter(entry.content, item.serialNumber)))
      .map((item) => item.id),
  ), [sortedStatusChapters, statusUpdateSourceEntries]);
  useEffect(() => {
    if (activeChapterId !== null) {
      setReviewChapterId(activeChapterId);
      setReviewModeStates((prev) => ({
        audit: {
          ...prev.audit,
          output: '',
          revisedDraft: '',
          appliedParagraphs: new Set(),
          compareView: 'preview',
          requestLog: '',
        },
        comment: {
          ...prev.comment,
          output: '',
          revisedDraft: '',
          appliedParagraphs: new Set(),
          compareView: 'preview',
          requestLog: '',
        },
        polish: {
          ...prev.polish,
          output: '',
          revisedDraft: '',
          appliedParagraphs: new Set(),
          compareView: 'preview',
          requestLog: '',
        },
      }));
    }
  }, [activeChapterId]);

  useEffect(() => {
    if (activeChapterId !== null) setStatusChapterId(activeChapterId);
  }, [activeChapterId]);

  useEffect(() => {
    if (!reviewModelId && reviewModels[0]) setReviewModelId(reviewModels[0].id);
  }, [reviewModelId, reviewModels]);

  useEffect(() => {
    if (!reviewAuditPromptId && reviewAuditPrompts[0]) setReviewAuditPromptId(reviewAuditPrompts[0].id);
  }, [reviewAuditPromptId, reviewAuditPrompts]);

  useEffect(() => {
    if (!reviewCommentPromptId && reviewCommentPrompts[0]) setReviewCommentPromptId(reviewCommentPrompts[0].id);
  }, [reviewCommentPromptId, reviewCommentPrompts]);

  useEffect(() => {
    if (!reviewPolishPromptId && reviewPolishPrompts[0]) setReviewPolishPromptId(reviewPolishPrompts[0].id);
  }, [reviewPolishPromptId, reviewPolishPrompts]);

  useEffect(() => {
    if (!statusPromptId && statusPrompts[0]) setStatusPromptId(statusPrompts[0].id);
  }, [statusPromptId, statusPrompts]);

  useEffect(() => {
    const storedTaskIds = readReviewBackgroundTaskIds(settingsStorageKey);
    setReviewModeStates((prev) => ({
      audit: { ...prev.audit, backgroundTaskId: storedTaskIds.audit ?? prev.audit.backgroundTaskId },
      comment: { ...prev.comment, backgroundTaskId: storedTaskIds.comment ?? prev.comment.backgroundTaskId },
      polish: { ...prev.polish, backgroundTaskId: storedTaskIds.polish ?? prev.polish.backgroundTaskId },
    }));
  }, [settingsStorageKey]);

  useEffect(() => {
    const syncBackgroundTasks = () => {
      const storedTaskIds = readReviewBackgroundTaskIds(settingsStorageKey);
      setReviewModeStates((prev) => {
        let changed = false;
        const next = { ...prev };
        (Object.keys(REVIEW_MODE_TITLES) as ReviewMode[]).forEach((mode) => {
          const taskId = prev[mode].backgroundTaskId ?? storedTaskIds[mode];
          if (!taskId) return;
          const task = getBackgroundAiTask(taskId);
          if (!task || task.meta?.target !== 'chapterReview' || task.meta.settingsStorageKey !== settingsStorageKey) return;
          const nextOutput = getReviewBackgroundTaskOutput(task, mode);
          const nextRequestLog = typeof task.meta?.requestLog === 'string' ? task.meta.requestLog : prev[mode].requestLog;
          const nextState: ReviewModeState = {
            ...prev[mode],
            output: nextOutput,
            requestLog: nextRequestLog,
            backgroundTaskId: task.id,
          };
          if (task.status === 'success') {
            const revised = extractReviewRevisedText(nextOutput);
            if (revised && revised !== prev[mode].revisedDraft) {
              nextState.revisedDraft = revised;
              nextState.appliedParagraphs = new Set();
              nextState.compareView = 'paragraph';
            }
          }
          const stateChanged = nextState.output !== prev[mode].output
            || nextState.requestLog !== prev[mode].requestLog
            || nextState.backgroundTaskId !== prev[mode].backgroundTaskId
            || nextState.revisedDraft !== prev[mode].revisedDraft
            || nextState.compareView !== prev[mode].compareView;
          if (!stateChanged) return;
          changed = true;
          next[mode] = nextState;
        });
        return changed ? next : prev;
      });

      const activeTaskId = reviewModeStates[reviewMode]?.backgroundTaskId ?? readReviewBackgroundTaskIds(settingsStorageKey)[reviewMode];
      const activeTask = activeTaskId ? getBackgroundAiTask(activeTaskId) : null;
      setIsReviewAiLoading(activeTask?.status === 'running');
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [reviewMode, reviewModeStates, settingsStorageKey]);

  const openReviewPanel = (mode: ReviewMode) => {
    setReviewMode(mode);
    setIsReviewLogOpen(false);
    setReviewManagementModal(null);
    setIsReviewOpen(true);
  };

  const selectReviewChapter = (nextChapterId: number) => {
    setReviewChapterId(nextChapterId);
    setIsReviewLogOpen(false);
    updateActiveReviewState((state) => ({
      ...state,
      output: '',
      revisedDraft: '',
      appliedParagraphs: new Set(),
      compareView: 'preview',
      requestLog: '',
    }));
  };

  const openStatusUpdate = useCallback(() => {
    const entries = readWorkbenchLibraryEntries(settingsStorageKey);
    const targets = entries.filter(isStatusTargetEntry);
    const firstTarget = targets[0] ?? null;
    const nextChapter = chapter ?? sortedStatusChapters[0] ?? null;
    setStatusEntries(entries);
    setStatusTargetIds(firstTarget ? new Set([firstTarget.id]) : new Set());
    setStatusDraft(firstTarget && nextChapter ? getExistingStatusForChapter(firstTarget.content, nextChapter.serialNumber) : '');
    setStatusChapterId(nextChapter?.id ?? null);
    setIsStatusUpdateOpen(true);
  }, [chapter, settingsStorageKey, sortedStatusChapters]);

  useEffect(() => {
    if (embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish') {
      openReviewPanel(embeddedMode);
      return;
    }
    if (embeddedMode === 'status') {
      openStatusUpdate();
    }
  }, [embeddedMode, activeChapterId, openStatusUpdate]);

  const toggleStatusTarget = (entry: WorkbenchLibraryEntry) => {
    setStatusTargetIds((current) => {
      const next = new Set(current);
      if (next.has(entry.id)) next.delete(entry.id);
      else next.add(entry.id);
      if (next.size === 1) {
        const selectedId = Array.from(next)[0];
        const selected = statusTargetEntries.find((item) => item.id === selectedId);
        if (selected && activeStatusChapter) {
          setStatusDraft(getExistingStatusForChapter(selected.content, activeStatusChapter.serialNumber));
        }
      }
      return next;
    });
  };

  const selectStatusChapter = (nextChapterId: number) => {
    const nextChapter = sortedStatusChapters.find((item) => item.id === nextChapterId) ?? null;
    setStatusChapterId(nextChapterId);
    if (statusTargetIds.size === 1 && nextChapter) {
      const selected = statusTargetEntries.find((item) => statusTargetIds.has(item.id));
      setStatusDraft(selected ? getExistingStatusForChapter(selected.content, nextChapter.serialNumber) : '');
    }
  };

  const saveStatusUpdate = () => {
    if (!activeStatusChapter || statusTargetIds.size === 0 || !statusDraft.trim()) return;
    const nextEntries = statusEntries.map((entry) => (
      statusTargetIds.has(entry.id)
        ? {
            ...entry,
            content: upsertEntryStatus(entry.content, activeStatusChapter, statusDraft),
            updatedAt: new Date().toLocaleString('zh-CN'),
          }
        : entry
    ));
    setStatusEntries(nextEntries);
    writeWorkbenchLibraryEntries(settingsStorageKey, nextEntries);
    if (!embeddedMode) setIsStatusUpdateOpen(false);
    showToast(`已更新 ${statusTargetIds.size} 个状态到第${activeStatusChapter.serialNumber}章`);
  };

  const showToast = (text: string) => setCopyToast(text);

  const buildReviewPayload = () => {
    const modeTitle = REVIEW_MODE_TITLES[reviewMode];
    const modeInstruction = REVIEW_MODE_DEFAULT_INSTRUCTIONS[reviewMode];
    const promptText = activeReviewPrompt?.content?.trim() || modeInstruction;
    const bodyTag = reviewMode === 'audit'
      ? '待审核正文'
      : reviewMode === 'comment'
      ? '待点评正文'
      : '待润色正文';
    const requirementTag = reviewMode === 'audit'
      ? '审核要求'
      : reviewMode === 'comment'
      ? '点评要求'
      : '润色要求';
    const compareInstruction = [
      '如果你需要修改正文，请务必额外输出一个独立区块：',
      '【修改后全文】',
      '这里放完整修改后的正文，只放正文，不要夹杂点评说明。',
      '【修改说明】',
      '这里再说明具体修改原因。',
      reviewMode === 'polish' ? '润色只能优化表达，不要改变剧情事件、人物行动、设定信息和章节结果。' : '',
      '这样用户可以在软件中按段落对比并逐段确认替换。',
    ].filter(Boolean).join('\n');
    const rawUserText = [reviewAiInput.trim() || modeInstruction, compareInstruction].join('\n\n');
    const userText = wrapAiRequestTag(requirementTag, rawUserText);
    const chapterTitle = activeReviewChapter
      ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
      : '未选择章节';
    const detailOutlineText = activeReviewDetailOutline?.content?.trim() || '';
    const chapterContext = joinAiRequestSections([
      detailOutlineText ? wrapAiRequestTag('关联章纲', detailOutlineText, { 标题: activeReviewDetailOutline?.title || '未命名章纲' }) : '',
      wrapAiRequestTag(bodyTag, activeReviewContent, { 标题: chapterTitle, 模式: modeTitle }),
    ]);
    const requestLogMeta = [
      `模式：${modeTitle}`,
      `模型：${activeReviewModel?.name ?? '未选择模型'}`,
      `提示词：${activeReviewPrompt?.name ?? '未选择提示词，使用内置默认提示词'}`,
      `章节：${chapterTitle}`,
      `正文：${activeReviewWordCount} 字`,
      detailOutlineText ? `关联章纲：${activeReviewDetailOutline?.title ?? '未命名章纲'}（${countCompactWords(detailOutlineText)} 字）` : '',
    ].filter(Boolean);
    const requestLog = [
      ...requestLogMeta,
      '',
      '【系统提示词】',
      promptText,
      '',
      '【用户要求】',
      userText,
      '',
      '【发送上下文】',
      chapterContext,
    ].join('\n');
    return { promptText, userText, chapterContext, requestLog };
  };

  const sendReviewAiMessage = async () => {
    if (isReviewAiLoading) return;
    const requestMode = reviewMode;
    const updateRequestReviewState = (updater: (state: ReviewModeState) => ReviewModeState) => {
      updateReviewModeState(requestMode, updater);
    };
    const setRequestReviewOutput = (value: string | ((current: string) => string)) => {
      updateRequestReviewState((state) => ({
        ...state,
        output: typeof value === 'function' ? value(state.output) : value,
      }));
    };
    if (!activeReviewChapter) {
      setRequestReviewOutput(`【错误】请先选择需要${REVIEW_MODE_TITLES[requestMode]}的章节。`);
      return;
    }
    if (!activeReviewModel) {
      setRequestReviewOutput('【错误】尚未配置可用模型，请先到模型管理中新增并启用模型。');
      return;
    }
    const { promptText, userText, chapterContext, requestLog } = buildReviewPayload();
    const task = startBackgroundAiTask({
      kind: requestMode === 'polish' ? 'polish' : 'review',
      title: `${REVIEW_MODE_TITLES[requestMode]}：${activeReviewChapter.title || `第${activeReviewChapter.serialNumber}章`}`,
      input: userText,
      initialOutput: '正在思考...',
      progressLabel: '正在生成',
      meta: {
        target: 'chapterReview',
        settingsStorageKey,
        mode: requestMode,
        chapterId: activeReviewChapter.id,
        requestLog,
      },
      runner: async ({ signal, emit }) => {
        let answer = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          answer = await callModelStream({
            model: activeReviewModel,
            prompt: promptText,
            userContent: userText,
            chapterContext,
            recordType: 'stream',
            signal,
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
            onChunk: (chunk) => {
              answer += chunk;
              emit(formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
          });
          return reasoningContent.trim()
            ? formatAiThinkingResponse(answer, reasoningContent, getThinkingSeconds(), true)
            : answer;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    writeReviewBackgroundTaskId(settingsStorageKey, requestMode, task.id);
    setIsReviewAiLoading(true);
    updateRequestReviewState((state) => ({
      ...state,
      requestLog,
      output: '正在思考...',
      backgroundTaskId: task.id,
    }));
  };

  const stopReviewAiMessage = () => {
    if (activeReviewState.backgroundTaskId) stopBackgroundAiTask(activeReviewState.backgroundTaskId);
    setIsReviewAiLoading(false);
  };

  const syncReviewDraftFromOutput = (output = reviewAiOutput) => {
    const extracted = extractReviewRevisedText(output) || stripReviewThinkingBlock(output);
    setReviewRevisedDraft(extracted);
    setReviewAppliedParagraphs(new Set());
    setReviewCompareView('paragraph');
  };

  const applyReviewParagraph = (paragraphIndex: number) => {
    if (!activeReviewChapter) return;
    const nextParagraphs = splitReviewParagraphs(activeReviewContent);
    const replacement = splitReviewParagraphs(reviewRevisedDraft)[paragraphIndex] ?? '';
    nextParagraphs[paragraphIndex] = replacement;
    const nextContent = nextParagraphs.join('\n');
    if (activeReviewChapter.id === chapter?.id) {
      commitContent(nextContent);
    } else {
      onUpdateChapterContent(activeReviewChapter.id, nextContent);
    }
    setReviewAppliedParagraphs((current) => new Set([...current, paragraphIndex]));
    showToast(`已替换第 ${paragraphIndex + 1} 段`);
  };

  const applyAllReviewParagraphs = () => {
    if (!activeReviewChapter || !reviewRevisedDraft.trim()) return;
    if (activeReviewChapter.id === chapter?.id) {
      commitContent(reviewRevisedDraft);
    } else {
      onUpdateChapterContent(activeReviewChapter.id, reviewRevisedDraft);
    }
    setReviewAppliedParagraphs(new Set(reviewParagraphDiffs.filter((item) => item.changed).map((item) => item.index)));
    showToast('已替换全部修改段落');
  };

  const restoreTextareaScroll = (textarea: HTMLTextAreaElement, scrollTop: number) => {
    textarea.scrollTop = scrollTop;
    setEditorScrollTop(textarea.scrollTop);
    requestAnimationFrame(() => {
      if (textareaRef.current !== textarea) return;
      textarea.scrollTop = scrollTop;
      setEditorScrollTop(textarea.scrollTop);
    });
  };

  const commitContent = useCallback((next: string) => {
    if (chapter && content !== next) saveSnapshot(chapter.id, content);
    prevContentRef.current = content;
    onChangeContent(next);
  }, [chapter, content, onChangeContent]);

  const commitContentWithCursor = (next: string, cursorPos: number) => {
    const scrollTop = textareaRef.current?.scrollTop ?? editorScrollTop;
    pendingCursorRef.current = { text: next, cursorPos, scrollTop };
    if (next !== content) commitContent(next);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (textarea.value !== next && next !== content) return;
      const safeCursor = Math.max(0, Math.min(cursorPos, textarea.value.length));
      textarea.setSelectionRange(safeCursor, safeCursor);
      restoreTextareaScroll(textarea, scrollTop);
      if (textarea.value === next) pendingCursorRef.current = null;
    });
  };

  useLayoutEffect(() => {
    const pending = pendingCursorRef.current;
    if (!pending) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const applyCursor = () => {
      const safeCursor = Math.max(0, Math.min(pending.cursorPos, textarea.value.length));
      textarea.setSelectionRange(safeCursor, safeCursor);
      restoreTextareaScroll(textarea, pending.scrollTop);
      pendingCursorRef.current = null;
    };

    if (textarea.value === pending.text) {
      applyCursor();
      return;
    }
    requestAnimationFrame(applyCursor);
  }, [content]);

  useEffect(() => {
    const openAssociate = () => setIsAssociateOpen(true);
    const openHistory = () => setIsHistoryOpen(true);
    window.addEventListener('open_chapter_associate', openAssociate);
    window.addEventListener('open_editor_history', openHistory);
    return () => {
      window.removeEventListener('open_chapter_associate', openAssociate);
      window.removeEventListener('open_editor_history', openHistory);
    };
  }, []);

  useEffect(() => {
    const syncAssociatedCount = () => {
      const nextCount = readAssociatedChapterCount(allChapters);
      associatedSelectionRef.current = nextCount > 0;
      setAssociatedCount(nextCount);
    };
    if (isRememberAssociationsEnabled() || associatedSelectionRef.current) {
      syncAssociatedCount();
    } else {
      setAssociatedCount(0);
    }
    window.addEventListener(CHAPTER_ASSOCIATE_UPDATED_EVENT, syncAssociatedCount);
    return () => window.removeEventListener(CHAPTER_ASSOCIATE_UPDATED_EVENT, syncAssociatedCount);
  }, [allChapters]);

  useEffect(() => {
    prevContentRef.current = content;
  }, [activeChapterId, content]);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(''), 1600);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  useEffect(() => {
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (!chapter) return;
      if (action.detail?.id === 'delete_chapter') {
        setShowDeleteConfirm(true);
      } else if (action.detail?.id === 'smart_format') {
        commitContent(applyFormat(content, getStoredFormatSettings()));
        showToast('已自动排版');
      } else if (action.detail?.id === 'save_chapter') {
        onChangeContent(content);
        showToast('已保存');
      }
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
  }, [chapter, commitContent, content, onChangeContent]);

  useEffect(() => {
    const handleFindShortcut = (event: KeyboardEvent) => {
      if (!chapter || event.key.toLowerCase() !== 'f' || !event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      onOpenFind();
    };
    window.addEventListener('keydown', handleFindShortcut, true);
    return () => window.removeEventListener('keydown', handleFindShortcut, true);
  }, [chapter, onOpenFind]);

  if (!chapter) {
    return (
      <section className="flex flex-1 items-center justify-center bg-white">
        <p className="text-sm text-gray-400">请选择章节</p>
      </section>
    );
  }

  const normalizeEditorText = (value: string) => stripLineIndents(value);

  const getNormalizedCursor = (value: string, cursorPos: number) => (
    Math.max(0, Math.min(normalizeEditorText(value.slice(0, cursorPos)).length, normalizeEditorText(value).length))
  );

  const getActiveSymbolReplaceSettings = () => (
    getStoredSymbolReplaceSettings().filter((rule) => rule.from && rule.from !== rule.to)
  );

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = event.target.value;
    const rawCursor = event.target.selectionStart;
    const cleaned = normalizeEditorText(rawText);
    const normalizedCursor = getNormalizedCursor(rawText, rawCursor);
    if (!isSymbolReplaceEnabled()) {
      commitContentWithCursor(cleaned, normalizedCursor);
      return;
    }
    const settings = getActiveSymbolReplaceSettings();
    if (settings.length === 0) {
      commitContentWithCursor(cleaned, normalizedCursor);
      return;
    }
    const next = applySymbolReplace(cleaned, settings);
    const cursorPos = next === cleaned
      ? normalizedCursor
      : applySymbolReplace(cleaned.slice(0, normalizedCursor), settings).length;
    commitContentWithCursor(next, cursorPos);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const cleanedPaste = stripLineIndents(pasted);
    const settings = isSymbolReplaceEnabled() ? getActiveSymbolReplaceSettings() : [];
    const pastedWithIndent = settings.length > 0 ? applySymbolReplace(cleanedPaste, settings) : cleanedPaste;
    const next = content.slice(0, start) + pastedWithIndent + content.slice(end);
    commitContentWithCursor(next, start + pastedWithIndent.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentText = target.value;
    if ((event.key === 'Backspace' || event.key === 'Delete') && start === end) {
      if (start === 0 && event.key === 'Backspace') {
        event.preventDefault();
        textareaRef.current?.setSelectionRange(0, 0);
        return;
      }
      if (start === 0 && event.key === 'Delete' && isSymbolReplaceEnabled()) {
        event.preventDefault();
        const cleaned = normalizeEditorText(currentText.slice(1));
        const settings = getActiveSymbolReplaceSettings();
        const next = settings.length > 0 ? applySymbolReplace(cleaned, settings) : cleaned;
        commitContentWithCursor(next, 0);
        return;
      }
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const next = content.slice(0, start) + '\n' + content.slice(end);
    commitContentWithCursor(next, start + 1);
  };

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast('复制失败');
    }
  };

  const findNext = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionEnd : 0;
    let index = content.indexOf(findText, start);
    if (index < 0) index = content.indexOf(findText);
    if (index < 0) {
      showToast('未找到匹配内容');
      return;
    }
    textarea?.focus();
    textarea?.setSelectionRange(index, index + findText.length);
  };

  const replaceAll = () => {
    if (!findText) return;
    if (!content.includes(findText)) {
      showToast('未找到匹配内容');
      return;
    }
    commitContent(content.split(findText).join(replaceText));
    showToast('已替换全部');
  };

  const handleSmartFormatNow = () => {
    commitContent(applyFormat(content, getStoredFormatSettings()));
    showToast('已自动排版');
  };

  const handleSymbolReplaceNow = () => {
    const settings = getActiveSymbolReplaceSettings();
    if (settings.length === 0) {
      showToast('请先设置一键替换规则');
      setIsSymbolReplaceOpen(true);
      return;
    }
    const next = applySymbolReplace(content, settings);
    if (next === content) {
      showToast('当前章节没有可替换内容');
      return;
    }
    const cursor = textareaRef.current?.selectionStart ?? 0;
    const nextCursor = applySymbolReplace(content.slice(0, cursor), settings).length;
    commitContentWithCursor(next, nextCursor);
    showToast('已替换当前章节');
  };

  const handleSymbolAutoEnabled = () => {
    const settings = getActiveSymbolReplaceSettings();
    if (settings.length === 0) {
      showToast('已开启自动替换，请先添加规则');
      return;
    }
    const next = applySymbolReplace(content, settings);
    if (next !== content) {
      const cursor = textareaRef.current?.selectionStart ?? 0;
      const nextCursor = applySymbolReplace(content.slice(0, cursor), settings).length;
      commitContentWithCursor(next, nextCursor);
      showToast('已按规则替换当前章节');
      return;
    }
    showToast('已开启自动替换');
  };

  const editorFieldSizeModal = isEditorFieldSizeOpen ? createPortal(
    <div
      className="fixed inset-0 z-[340] flex items-center justify-center bg-black/35 p-4"
      onClick={() => setIsEditorFieldSizeOpen(false)}
    >
      <section
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-black text-slate-900">作品编辑器设置</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">调整审核、点评和状态相关按钮及选择框尺寸。</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditorFieldSizeOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="关闭设置"
          >
            ×
          </button>
        </header>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {(Object.keys(EDITOR_FIELD_SIZE_DEFAULTS) as EditorFieldSizeKey[]).map((key) => {
              const spec = editorFieldSizeSpecs[key] ?? EDITOR_FIELD_SIZE_DEFAULTS[key];
              return (
                <article key={key} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[150px_repeat(3,minmax(0,1fr))_220px] lg:items-center">
                  <div className="text-sm font-black text-slate-900">{EDITOR_FIELD_SIZE_LABELS[key]}</div>
                  <EditorFieldSizeNumberInput
                    label="宽度"
                    prop="width"
                    value={spec.width}
                    onChange={(value) => updateEditorFieldSizeSpec(key, 'width', value)}
                  />
                  <EditorFieldSizeNumberInput
                    label="高度"
                    prop="height"
                    value={spec.height}
                    onChange={(value) => updateEditorFieldSizeSpec(key, 'height', value)}
                  />
                  <EditorFieldSizeNumberInput
                    label="字号"
                    prop="fontSize"
                    value={spec.fontSize}
                    onChange={(value) => updateEditorFieldSizeSpec(key, 'fontSize', value)}
                  />
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-custom-field-size xy-has-value" style={getEditorFieldSizeStyle(spec)}>
                    <input readOnly value={EDITOR_FIELD_SIZE_LABELS[key]} />
                    <label>{EDITOR_FIELD_SIZE_LABELS[key]}</label>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <footer className="flex shrink-0 justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={resetEditorFieldSizeSpecs}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={() => setIsEditorFieldSizeOpen(false)}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  ) : null;

  const isEmbeddedReviewMode = embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish';
  const activeReviewModeTitle = REVIEW_MODE_TITLES[reviewMode];
  const showStatusUpdatePanel = embeddedMode ? embeddedMode === 'status' : isStatusUpdateOpen;
  const showReviewPanel = embeddedMode ? isEmbeddedReviewMode : isReviewOpen;
  const reviewPortalTarget = isEmbeddedReviewMode ? embeddedPortalElement : document.body;
  const canRenderReviewPanel = showReviewPanel && Boolean(reviewPortalTarget);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7]">
      {editorFieldSizeModal}
      {isEmbeddedReviewMode && (
        <div ref={setEmbeddedPortalElement} className="min-h-0 flex-1 overflow-hidden bg-white" />
      )}
      {!embeddedMode && (
        <>
      <div className="flex items-center gap-2 border-b border-[#e6e8ec] bg-white px-4 py-2">
        <div className="flex items-center rounded-md border border-[#dce1e8] bg-[#f5f6f8] px-2 py-1 text-sm">
          <span className="font-medium text-gray-700">{safeVolumeName}</span>
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-[#dce1e8] bg-[#f5f6f8] px-2 py-1 text-sm">
          <span className="font-medium text-gray-700">第</span>
          <input
            type="text"
            inputMode="numeric"
            value={serialValue}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              if (Number.isFinite(next) && next > 0) onUpdateSerialNumber(chapter.id, next);
            }}
            className="bg-transparent p-0 text-center font-medium text-gray-700 outline-none"
            style={{ width: `${Math.max(1, String(serialValue).length)}ch` }}
          />
          <span className="font-medium text-gray-700">章</span>
        </div>
        <span className="text-gray-300">·</span>
        <input
          type="text"
          value={chapter.title}
          onChange={(event) => onRenameChapter(chapter.id, event.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="请输入章节标题"
          className="w-[320px] rounded-md border border-[#dce1e8] bg-white px-3 py-1 text-sm outline-none focus:border-brand"
        />
        <span className="text-xs text-gray-400">{titleCount}/20</span>
        <div className={`${SPLIT_BUTTON_OUTLINE_GROUP_CLASS} w-[104px]`}>
          <button
            type="button"
            onClick={() => void copyText(chapter.title, '已复制标题')}
            className={SPLIT_BUTTON_OUTLINE_ACTION_CLASS}
          >
            复制
          </button>
          <button
            type="button"
            onClick={() => setIsTitleOptimizeOpen(true)}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap border-l border-brand bg-brand px-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            优化
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2">
        <button onClick={() => setIsFontSettingsOpen(true)} className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
          字体设置
        </button>
        <div className="flex items-center overflow-hidden rounded-md border border-brand">
          <button
            onClick={handleSmartFormatNow}
            className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
          >
            智能排版
          </button>
          <div className="h-4 w-px bg-brand/30" />
          <button
            onClick={() => setIsSmartFormatOpen(true)}
            className="px-2 py-1.5 text-brand hover:bg-brand-light"
            title="智能排版设置"
          >
            <Settings className="h-4 w-4 text-brand" />
          </button>
        </div>
        <div className="flex items-center overflow-hidden rounded-md border border-brand">
          <button onClick={() => setIsHighFreqOpen(true)} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
            高频词
          </button>
          <div className="h-4 w-px bg-brand/30" />
          <HighFreqToggle />
        </div>
        <div className={SPLIT_BUTTON_OUTLINE_GROUP_CLASS}>
          <button onClick={handleSymbolReplaceNow} className={SPLIT_BUTTON_OUTLINE_ACTION_CLASS}>
            一键替换
          </button>
          <div className="inline-flex items-center border-l border-brand/30">
            <SymbolReplaceToggle onEnable={handleSymbolAutoEnabled} />
          </div>
          <button
            onClick={() => setIsSymbolReplaceOpen(true)}
            className="inline-flex w-9 items-center justify-center border-l border-brand/30 text-brand transition-colors hover:bg-brand-light"
            title="一键替换设置"
          >
            <Settings className="h-4 w-4 text-brand" />
          </button>
        </div>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => void copyText(stripLineIndents(content), '已复制正文')}
            className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
          >
            复制正文
          </button>
          <button onClick={() => setIsHistoryOpen(true)} className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
            历史
          </button>
          <button
            onClick={onOpenFind}
            className="rounded-full bg-brand px-4 py-1.5 text-base font-medium text-white transition-colors hover:bg-brand-dark"
            title="查找替换"
          >
            查找
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-[37px] w-[67px] rounded-md border border-red-200 bg-white text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>

      <div className="xy-wa-editor-surface relative min-h-0 flex-1 overflow-hidden">
        {isFindOpen && (
          <div className="absolute right-5 top-4 z-30 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <input
              value={findText}
              onChange={(event) => setFindText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') findNext();
              }}
              placeholder="查找"
              className="h-8 w-32 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:border-brand"
            />
            <input
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              placeholder="替换为"
              className="h-8 w-32 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:border-brand"
            />
            <button onClick={findNext} className="rounded-lg bg-brand px-3 py-1.5 text-xs text-white">查找</button>
            <button onClick={replaceAll} className="rounded-lg border border-brand px-3 py-1.5 text-xs text-brand">替换全部</button>
            <button onClick={() => setIsFindOpen(false)} className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100">关闭</button>
          </div>
        )}
        <HighlightOverlay
          content={content}
          fontSettings={fontSettings}
          scrollTop={editorScrollTop}
          paragraphIndent={formatSettings.paragraphIndent}
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}
          className="xy-wa-editor-text-layer editor-scrollbar relative z-10 h-full min-h-0 w-full resize-none border-0 bg-transparent pb-6 pt-3 outline-none"
          placeholder=""
          style={{
            ...editorGridLineStyle,
            fontFamily: fontSettings.fontFamily,
            color: fontSettings.fontColor,
            caretColor: fontSettings.fontColor,
            fontSize: `${fontSettings.fontSize}px`,
            lineHeight: fontSettings.lineHeight,
            backgroundColor: 'transparent',
            paddingLeft: editorTextPaddingLeft,
            paddingRight: editorTextPaddingRight,
            textIndent: editorTextIndent,
          }}
        />
      </div>

      <div className="flex min-h-[34px] items-center justify-between border-t border-[#e1e5eb] bg-[#fbfbfc] px-5 py-2 text-sm text-gray-400">
        {associatedCount > 0 && <span>已关联 <span className="font-medium text-brand">{associatedCount}</span> 章</span>}
        <span className="ml-auto">字数 <span className="font-medium text-brand">{wordCount || chapter.wordCount}</span> · {lastSavedAt ? `已保存 ${lastSavedAt}` : '自动保存'}</span>
      </div>

        </>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="确认删除"
        description="是否将该章节删除到回收站？删除后可在回收站中恢复。"
        confirmText="确认删除"
        confirmVariant="danger"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteChapter(chapter.id);
        }}
      />

      <FontSettingsModal isOpen={isFontSettingsOpen} onClose={() => setIsFontSettingsOpen(false)} settings={fontSettings} onChange={setFontSettings} />
      <SmartFormatModal
        isOpen={isSmartFormatOpen}
        onClose={() => setIsSmartFormatOpen(false)}
        currentText={content}
        settings={formatSettings}
        onApply={(next, settings) => {
          setFormatSettings(settings);
          commitContent(next);
        }}
      />
      <HighFreqModal isOpen={isHighFreqOpen} onClose={() => setIsHighFreqOpen(false)} />
      <SymbolReplaceModal
        isOpen={isSymbolReplaceOpen}
        onClose={() => setIsSymbolReplaceOpen(false)}
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} chapterId={chapter.id} onRestore={commitContent} />
      <TitleOptimizeModal
        isOpen={isTitleOptimizeOpen}
        onClose={() => setIsTitleOptimizeOpen(false)}
        currentChapterSerial={serialValue}
        currentContent={content}
        onApply={(title) => onRenameChapter(chapter.id, title.slice(0, 20))}
      />
      <ChapterAssociateModal
        isOpen={isAssociateOpen}
        onClose={() => setIsAssociateOpen(false)}
        chapters={allChapters.map((item) => ({ id: item.id, serialNumber: item.serialNumber, wordCount: item.wordCount }))}
        onAssociate={(ids) => {
          associatedSelectionRef.current = ids.length > 0;
          setAssociatedCount(ids.length);
          window.dispatchEvent(new CustomEvent(CHAPTER_ASSOCIATE_UPDATED_EVENT));
        }}
      />
      {showStatusUpdatePanel && (
        <div
          className={embeddedMode === 'status' ? 'flex h-full min-h-0 bg-white' : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'}
          onClick={() => {
            if (!embeddedMode) setIsStatusUpdateOpen(false);
          }}
        >
          <section
            className={embeddedMode === 'status'
              ? 'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
              : 'flex h-[78vh] max-h-[820px] w-[min(1280px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={`${embeddedMode ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5`}>
              <div>
                <h2 className="text-lg font-black text-slate-900">更新状态</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">阅读前文后，把角色、宝物、势力的最新状态写入设定卡片，并记录更新到第几章。</p>
              </div>
              {!embeddedMode && (
                <button
                  type="button"
                  onClick={() => setIsStatusUpdateOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  关闭
                </button>
              )}
            </header>
            <div
              className="grid min-h-0 flex-1 bg-slate-50"
              style={{ gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px` }}
            >
              <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-3">
                <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {chapterDirectoryGroups.map((group) => {
                    const expanded = expandedStatusVolumeIds.has(group.id);
                    const GroupFolderIcon = expanded ? FolderOpen : Folder;
                    return (
                      <div key={group.id}>
                        <button
                          type="button"
                          onClick={() => toggleStatusDirectoryVolume(group.id)}
                          className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                          aria-expanded={expanded}
                        >
                          <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                          <span className="min-w-0 flex-1 truncate leading-none">{group.name}</span>
                          <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>
                        </button>
                        {expanded && (
                          <div
                            className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}
                          >
                            {group.chapters.map((item) => {
                              const selected = activeStatusChapter?.id === item.id;
                              const updated = statusUpdatedChapterIds.has(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => selectStatusChapter(item.id)}
                                  title={`${updated ? '已更新状态到' : '未更新状态到'}第${item.serialNumber}章 ${item.title || ''}`}
                                  className={`relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                    selected
                                      ? 'border-transparent xy-selected-orange-bg text-slate-900'
                                      : updated
                                      ? 'border-[#08B3D9] bg-[#08B3D9] text-white hover:border-[#067B96] hover:bg-[#067B96]'
                                      : 'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                  }`}
                                >
                                  {item.serialNumber}
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
              {statusLeftResizeHandle}
              <main className="min-h-0 p-4">
                <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
                  <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-slate-900">
                        {activeStatusChapter ? `截至第${activeStatusChapter.serialNumber}章：${activeStatusChapter.title || '未命名章节'}` : '暂无章节'}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">前文预览 · {statusPreviewChapters.length}章 · <WordCountText value={statusPreviewWordCount} compact /></p>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={statusPreviewText}
                    placeholder="这里会显示从第一章到所选章节的正文，方便判断状态变化。"
                    className="editor-scrollbar min-h-0 flex-1 resize-none border-0 bg-white p-5 text-sm leading-7 text-slate-700 outline-none"
                  />
                </div>
              </main>
              {statusRightResizeHandle}
              <aside className="flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
                <div className="shrink-0">
                  <CombinedAiConfigSelect
                    style={getEmbeddedEditorFieldStyle('reviewModelSelect')}
                    modelValue={reviewModelId}
                    promptValue={activeStatusPromptId}
                    modelOptions={reviewModels.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : reviewModels.map((model) => ({ value: model.id, label: model.name }))}
                    promptOptions={statusPrompts.length === 0 ? [{ value: '', label: `暂无${STATUS_PROMPT_CATEGORY}提示词`, disabled: true }] : statusPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                    onModelChange={setReviewModelId}
                    onPromptChange={setStatusPromptId}
                    onModelManage={() => setReviewManagementModal('models')}
                    onPromptManage={() => setReviewManagementModal('prompts')}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-slate-900">状态目标</h3>
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-black text-[#08AACE]">已选 {selectedStatusTargets.length}</span>
                </div>
                <div className="editor-scrollbar mt-3 max-h-[210px] shrink-0 space-y-2 overflow-y-auto pr-1">
                  {statusTargetEntries.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-300">
                      暂无角色、宝物或势力卡片
                    </div>
                  ) : (
                    statusTargetEntries.map((entry) => {
                      const selected = statusTargetIds.has(entry.id);
                      return (
                        <label
                          key={entry.id}
                          className={`block cursor-pointer rounded-xl border p-3 transition-colors ${
                            selected ? 'border-[#08AACE] bg-sky-50/70' : 'border-slate-100 bg-slate-50 hover:border-sky-100 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleStatusTarget(entry)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-slate-900">{entry.title}</div>
                              <div className="mt-1 truncate text-[11px] font-bold text-slate-400">{getStatusTargetLabel(entry)}</div>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1 ${statusDraft.trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    placeholder="例如：主角已从高中生变为大学生，当前就读玄都大学，心态更成熟，但仍隐藏真实实力。"
                    className="editor-scrollbar text-sm leading-6 text-slate-700 outline-none"
                  />
                  <label>新的状态</label>
                  <span className="xy-floating-count"><WordCountText value={countCompactWords(statusDraft)} /></span>
                </div>
                <div className="mt-3 text-xs font-bold leading-5 text-slate-500">
                  保存规则：同一卡片同一章节只保留一条“更新到第 X 章”的状态记录；重复保存会覆盖旧状态，不会追加重复内容。
                </div>
                <button
                  type="button"
                  onClick={saveStatusUpdate}
                  disabled={!activeStatusChapter || selectedStatusTargets.length === 0 || !statusDraft.trim()}
                  className="mt-3 h-11 rounded-xl bg-[#08AACE] text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0695B5] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  保存状态到第{activeStatusChapter?.serialNumber ?? '-'}章
                </button>
              </aside>
            </div>
          </section>
        </div>
      )}
      {showStatusUpdatePanel && reviewManagementModal && (
        <div
          className="fixed inset-0 z-[320] flex items-center justify-center bg-black/35 px-6 py-6"
          onClick={() => setReviewManagementModal(null)}
        >
          <section
            className="flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
              <h2 className="text-sm font-bold text-slate-900">
                {reviewManagementModal === 'models' ? '模型管理' : `${STATUS_PROMPT_CATEGORY}提示词管理`}
              </h2>
              <button
                type="button"
                onClick={() => setReviewManagementModal(null)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                关闭
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-hidden">
              {reviewManagementModal === 'models'
                ? <ModelManagePage />
                : <PromptsPage initialCategory={STATUS_PROMPT_CATEGORY} />}
            </div>
          </section>
        </div>
      )}
      {canRenderReviewPanel && createPortal(
        <div
          className={isEmbeddedReviewMode
            ? 'flex h-full min-h-0 bg-white'
            : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'}
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          onClick={() => {
            if (!embeddedMode) setIsReviewOpen(false);
          }}
        >
          <section
            data-draggable-managed="true"
            data-global-modal-static="true"
            style={{
              ...(embeddedMode ? {} : reviewModalDraggable.style),
              WebkitAppRegion: 'no-drag',
            } as CSSProperties}
            className={isEmbeddedReviewMode
              ? 'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
              : 'relative flex h-[min(720px,82vh)] w-[min(1180px,92vw)] max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'}
            onClick={(event) => event.stopPropagation()}
          >
            <header
              className={`${embeddedMode ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5 ${embeddedMode ? '' : 'cursor-move'}`}
              {...(embeddedMode ? {} : reviewModalDraggable.dragHandleProps)}
              style={{
                touchAction: embeddedMode ? undefined : 'none',
                WebkitAppRegion: 'no-drag',
              } as CSSProperties}
            >
              <div>
                <h2 className="text-lg font-black text-slate-900">{activeReviewModeTitle}</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">左侧选择章节，中间预览正文，右侧配置 AI {activeReviewModeTitle}参数。</p>
              </div>
              <button
                type="button"
                data-no-modal-drag="true"
                onClick={() => setIsReviewOpen(false)}
                className={`${embeddedMode ? 'hidden' : ''} rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700`}
              >
                关闭
              </button>
            </header>
            <div
              className="grid min-h-0 flex-1 bg-slate-50"
              style={{ gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px` }}
            >
              <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-3">
                <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {chapterDirectoryGroups.map((group) => {
                    const expanded = expandedReviewVolumeIds.has(group.id);
                    const GroupFolderIcon = expanded ? FolderOpen : Folder;
                    return (
                      <div key={group.id}>
                        <button
                          type="button"
                          onClick={() => toggleReviewDirectoryVolume(group.id)}
                          className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                          aria-expanded={expanded}
                        >
                          <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                          <span className="min-w-0 flex-1 truncate leading-none">{group.name}</span>
                          <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>
                        </button>
                        {expanded && (
                          <div
                            className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}
                          >
                            {group.chapters.map((item) => {
                              const selected = activeReviewChapter?.id === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => selectReviewChapter(item.id)}
                                  title={`第${item.serialNumber}章 ${item.title || '未命名章节'} · ${item.wordCount}字`}
                                  className={`relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                    selected
                                      ? 'border-transparent xy-selected-orange-bg text-slate-900'
                                      : 'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                  }`}
                                >
                                  {item.serialNumber}
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
              {reviewLeftResizeHandle}
              <main className="min-h-0 p-5">
                <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
                  <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-slate-900">
                        {activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}` : '暂无章节'}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">
                        {reviewCompareView === 'preview' ? '正文预览' : reviewCompareView === 'paragraph' ? '段落对比' : '全文对比'}
                        {' · '}<WordCountText value={activeReviewWordCount} compact />
                        {reviewRevisedDraft.trim() ? ` · ${reviewChangedParagraphs.length} 处修改` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-black">
                      {([
                        ['preview', '原文'] as const,
                        ['paragraph', '段落'] as const,
                        ['full', '全文'] as const,
                      ]).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setReviewCompareView(key)}
                          className={`h-8 rounded-lg px-3 transition-colors ${reviewCompareView === key ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {reviewCompareView === 'preview' ? (
                    <textarea
                      readOnly
                      value={activeReviewContent}
                      placeholder="这里会显示所选章节正文。"
                      className="editor-scrollbar min-h-0 flex-1 resize-none border-0 bg-white p-5 text-sm leading-7 text-slate-700 outline-none"
                    />
                  ) : !reviewRevisedDraft.trim() ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                      <div className="text-sm font-bold text-slate-400">还没有可对比的修改稿。</div>
                      <button
                        type="button"
                        onClick={() => syncReviewDraftFromOutput()}
                        disabled={!stripReviewThinkingBlock(reviewAiOutput).trim()}
                        className="h-10 rounded-xl bg-[#08AACE] px-4 text-sm font-black text-white hover:bg-[#0695B5] disabled:bg-slate-300"
                      >
                        将 AI 输出设为修改稿
                      </button>
                    </div>
                  ) : reviewCompareView === 'paragraph' ? (
                    <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-xs font-black text-slate-500">
                          原文 / 修改后 · 共 {reviewChangedParagraphs.length} 处差异
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => syncReviewDraftFromOutput()}
                            disabled={!stripReviewThinkingBlock(reviewAiOutput).trim()}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:text-slate-300"
                          >
                            重新读取AI输出
                          </button>
                          <button
                            type="button"
                            onClick={applyAllReviewParagraphs}
                            disabled={reviewChangedParagraphs.length === 0}
                            className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#0695B5] disabled:bg-slate-300"
                          >
                            确认全部
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {reviewParagraphDiffs.map((item) => {
                          const applied = reviewAppliedParagraphs.has(item.index);
                          if (!item.changed && !item.before.trim() && !item.after.trim()) return null;
                          return (
                            <section
                              key={item.index}
                              className={`overflow-hidden rounded-xl border bg-white ${item.changed ? 'border-slate-200' : 'border-slate-100 opacity-75'}`}
                            >
                              <div className="flex h-9 items-center justify-between border-b border-slate-100 bg-slate-50 px-3">
                                <span className="text-xs font-black text-slate-500">第 {item.index + 1} 段</span>
                                <button
                                  type="button"
                                  onClick={() => applyReviewParagraph(item.index)}
                                  disabled={!item.changed || applied}
                                  className="h-7 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#0695B5] disabled:bg-slate-300"
                                >
                                  {applied ? '已确认' : '确认替换'}
                                </button>
                              </div>
                              <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="min-w-0 bg-red-50/35 p-3">
                                  <div className="mb-2 text-[11px] font-black text-red-500">原文</div>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                    {renderInlineTextDiff(item.before, item.after, 'before')}
                                  </p>
                                </div>
                                <div className="min-w-0 bg-emerald-50/45 p-3">
                                  <div className="mb-2 text-[11px] font-black text-emerald-600">修改后</div>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                    {renderInlineTextDiff(item.before, item.after, 'after')}
                                  </p>
                                </div>
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-100">
                      <label className="flex min-h-0 flex-col">
                        <span className="shrink-0 border-b border-slate-100 bg-red-50/60 px-4 py-2 text-xs font-black text-red-500">原文全文</span>
                        <textarea
                          readOnly
                          value={activeReviewContent}
                          className="editor-scrollbar min-h-0 flex-1 resize-none border-0 bg-white p-4 text-sm leading-7 text-slate-700 outline-none"
                        />
                      </label>
                      <label className="flex min-h-0 flex-col">
                        <span className="shrink-0 border-b border-slate-100 bg-emerald-50/70 px-4 py-2 text-xs font-black text-emerald-600">修改后全文（可编辑）</span>
                        <textarea
                          value={reviewRevisedDraft}
                          onChange={(event) => {
                            setReviewRevisedDraft(event.target.value);
                            setReviewAppliedParagraphs(new Set());
                          }}
                          className="editor-scrollbar min-h-0 flex-1 resize-none border-0 bg-white p-4 text-sm leading-7 text-slate-700 outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </main>
              {reviewRightResizeHandle}
              <aside className="relative flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
                {showInlineFieldSizeButton ? (
                <div className="flex shrink-0 items-center justify-end gap-2">
                    {showInlineFieldSizeButton ? (
                      <button
                        type="button"
                        onClick={() => setIsEditorFieldSizeOpen(true)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition-colors hover:border-[#08AACE] hover:text-[#078fb0]"
                      >
                        设置
                      </button>
                    ) : null}
                    {showInlineFieldSizeButton ? (
                      <button
                        type="button"
                        onClick={() => setIsReviewLogOpen(true)}
                        className="h-8 rounded-lg border border-[#08AACE]/30 bg-white px-3 text-xs font-black text-[#078fb0] transition-colors hover:bg-[#EAF9FD]"
                      >
                        日志
                      </button>
                    ) : null}
                </div>
                ) : null}
                <div className={`${showInlineFieldSizeButton ? 'mt-3' : ''} flex min-h-0 flex-1 flex-col`}>
                  <CombinedAiConfigSelect
                    style={getEmbeddedEditorFieldStyle('reviewModelSelect')}
                    modelValue={reviewModelId}
                    promptValue={activeReviewPromptId}
                    modelOptions={reviewModels.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : reviewModels.map((model) => ({ value: model.id, label: model.name }))}
                    promptOptions={activeReviewPromptOptions.length === 0 ? [{ value: '', label: `暂无${activeReviewPromptCategory}提示词`, disabled: true }] : activeReviewPromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                    onModelChange={setReviewModelId}
                    onPromptChange={setActiveReviewPromptId}
                    onModelManage={() => setReviewManagementModal('models')}
                    onPromptManage={() => setReviewManagementModal('prompts')}
                  />
                  <div className="mt-3 text-xs font-bold leading-5 text-slate-500">
                    <div><span className="font-black text-slate-800">当前章节：</span>{activeReviewChapter ? `第${activeReviewChapter.serialNumber}章` : '无'}</div>
                    <div><span className="font-black text-slate-800">正文字数：</span><WordCountText value={activeReviewWordCount} /></div>
                    <div><span className="font-black text-slate-800">关联章纲：</span>{activeReviewDetailOutline ? (<> {activeReviewDetailOutline.title}（<WordCountText value={countCompactWords(activeReviewDetailOutline.content)} />）</>) : '未读取到'}</div>
                  </div>
                  <div className="relative mt-5 min-h-0 flex-1">
                    <div className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 z-10 flex items-center gap-2 px-1">
                        <button
                          type="button"
                          onClick={() => syncReviewDraftFromOutput()}
                          disabled={!stripReviewThinkingBlock(reviewAiOutput).trim()}
                          className="text-xs font-black text-[#078fb0] hover:text-[#0695B5] disabled:text-slate-300"
                        >
                          生成对比
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewAiOutput('')}
                          className="text-xs font-black text-red-500 hover:text-red-600"
                        >
                          清空
                        </button>
                    </div>
                    <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value">
                      <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-slate-700">
                        {reviewAiOutput.trim() ? renderAiThinkingContent(reviewAiOutput) : (
                          <span className="text-slate-400">{activeReviewModeTitle}结果会显示在这里。</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 shrink-0">
                    <AiInlineInput
                      value={reviewAiInput}
                      onChange={(event) => {
                        setReviewAiInput(event.target.value);
                        resizeFloatingAiTextarea(event.currentTarget);
                      }}
                      onKeyDown={(event) => {
                        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                          event.preventDefault();
                          void sendReviewAiMessage();
                        }
                      }}
                      onSend={() => void sendReviewAiMessage()}
                      onStop={stopReviewAiMessage}
                      sendDisabled={isReviewAiLoading || !activeReviewChapter || !activeReviewModel}
                      stopDisabled={!isReviewAiLoading}
                      textareaClassName="editor-scrollbar"
                    />
                  </div>
                </div>
                {isReviewLogOpen && (
                  <div className="absolute inset-4 z-10 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                      <h3 className="text-base font-black text-slate-900">输出日志</h3>
                      <button
                        type="button"
                        onClick={() => setIsReviewLogOpen(false)}
                        className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
                      >
                        关闭
                      </button>
                    </div>
                    <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                      {reviewRequestLog ? (
                        <AiRequestLogGroups
                          groups={[
                            { id: 'prompt', title: '提示词', meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '系统提示词'))} 字`, content: getReviewLogSection(reviewRequestLog, '系统提示词') },
                            { id: 'context', title: '关联内容', meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '发送上下文'))} 字`, content: getReviewLogSection(reviewRequestLog, '发送上下文'), tone: 'cyan' },
                            { id: 'user', title: '用户要求', meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '用户要求'))} 字`, content: getReviewLogSection(reviewRequestLog, '用户要求'), tone: 'amber' },
                          ]}
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                          还没有发送{activeReviewModeTitle}请求。
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {reviewManagementModal && (
                  <div
                    className="fixed inset-0 z-[320] flex items-center justify-center bg-black/35 px-6 py-6"
                    onClick={() => setReviewManagementModal(null)}
                  >
                    <section
                      className="flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
                        <h2 className="text-sm font-bold text-slate-900">
                          {reviewManagementModal === 'models' ? '模型管理' : `${activeReviewPromptCategory}提示词管理`}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setReviewManagementModal(null)}
                          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          关闭
                        </button>
                      </header>
                      <div className="min-h-0 flex-1 overflow-hidden">
                        {reviewManagementModal === 'models'
                          ? <ModelManagePage />
                          : <PromptsPage initialCategory={activeReviewPromptCategory} />}
                      </div>
                    </section>
                  </div>
                )}
              </aside>
            </div>
            <div data-no-modal-drag="true" {...reviewModalDraggable.getResizeHandleProps('top')} className={`${embeddedMode ? 'hidden' : ''} absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize`} />
            <div data-no-modal-drag="true" {...reviewModalDraggable.getResizeHandleProps('bottom')} className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize`} />
            <div data-no-modal-drag="true" {...reviewModalDraggable.getResizeHandleProps('left')} className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize`} />
            <div data-no-modal-drag="true" {...reviewModalDraggable.getResizeHandleProps('right')} className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize`} />
            <div data-no-modal-drag="true" {...reviewModalDraggable.resizeHandleProps} className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize`}>
              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
            </div>
          </section>
        </div>,
        reviewPortalTarget!,
      )}
      {copyToast && (
        <button
          onClick={() => setCopyToast('')}
          className="fixed bottom-6 right-6 z-[260] rounded-lg bg-gray-800 px-4 py-3 text-sm text-white shadow-lg"
        >
          {copyToast}
        </button>
      )}
    </section>
  );
}
