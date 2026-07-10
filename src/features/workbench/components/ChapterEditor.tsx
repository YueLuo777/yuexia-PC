import { ChevronDown, Folder, FolderOpen, Settings } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { useModels } from '@/features/models/hooks/useModels';
import { callModelStream } from '@/features/models/services/callModel';
import {
  AUDIT_PROMPT_CATEGORY,
  AUDIT_PROMPT_SUBCATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  COMMENT_PROMPT_CATEGORY,
  STATUS_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  normalizePromptSubcategory,
  usePrompts,
} from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import { isChapterContentPolished } from '@/features/workbench/model/chapterPolishStatus';
import {
  AUDIT_OUTLINE_FIT_ITEM,
  AUDIT_STRUCTURE_CHECK_ITEMS,
  getAuditOutlineFitPercent,
  getAuditStructureItemDetail,
  getAuditStructureItemStatus,
  isAuditOutputPassed,
} from '@/features/workbench/model/chapterAuditResult';
import {
  buildReviewTextDiff,
  extractReviewAnnotations,
  extractReviewRevisedText,
  getReviewAnnotationParagraphIndex,
  splitReviewParagraphs,
  stripReviewThinkingBlock,
  type ReviewAnnotation,
} from '@/features/workbench/model/chapterReviewText';
import {
  createReviewLogSection,
  formatAiThinkingResponse,
  getReviewLogFillGroupWeights,
  getReviewLogSection,
} from '@/features/workbench/model/chapterReviewLog';
import {
  REVIEW_MODE_TITLES,
  clearAllReviewModeResults,
  createReviewModeState,
  isReviewBackgroundTaskForChapter,
  readRestorableReviewBackgroundTaskIds,
  writeReviewBackgroundTaskId,
  type ReviewMode,
  type ReviewModeState,
} from '@/features/workbench/model/chapterReviewTaskState';
import {
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT,
  WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY,
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
  applyParagraphIndentToText,
  applySymbolReplace,
  getStoredFormatSettings,
  getStoredFontSettings,
  getEditorGridLineStyle,
  getEditorTextLineHeight,
  getStoredSymbolReplaceSettings,
  isSymbolReplaceEnabled,
  saveSnapshot,
  stripLineIndents,
  type FormatOptions,
  type FontSettings,
} from '@/features/workbench/components/EditorToolModals';
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
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import {
  ChapterNumberButton,
  CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE,
} from '@/shared/ui/ChapterNumberButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';

import { WorkbenchModal } from './WorkbenchModal';
import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';

const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;
const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 150;
const SPLIT_BUTTON_OUTLINE_GROUP_CLASS =
  'flex h-8 items-stretch overflow-hidden rounded-md border border-brand bg-white shadow-none';
const SPLIT_BUTTON_OUTLINE_ACTION_CLASS =
  'inline-flex flex-1 items-center justify-center whitespace-nowrap px-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light';
const REVIEW_PAGE_LEFT_WIDTH = 180;
const REVIEW_PAGE_RIGHT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
const REVIEW_PREVIEW_OUTLINE_WIDTH = 360;
const REVIEW_PREVIEW_TEXT_WIDTH = 420;
const STATUS_PAGE_LEFT_WIDTH = 190;
const STATUS_PAGE_RIGHT_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_DEFAULT;
const REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_left_width';
const REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY = WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY;
const REVIEW_MODEL_ID_STORAGE_KEY = 'xinyuexia_chapter_editor_review_model_id';
const REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_width';
const REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_text_width';
const REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_width_mode';
const REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_visible';
const REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_font_size';
const REVIEW_PREVIEW_SEPARATOR_WIDTH = 7;
const STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_status_left_width';
const STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY = WORKBENCH_SHARED_AI_RIGHT_WIDTH_STORAGE_KEY;
const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS =
  'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] xy-flow-group-bg px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm transition-colors';
const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';
const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';
const REVIEW_PAGE_LEFT_WIDTH_LIMIT = { min: 180, max: 360 };
const REVIEW_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;
const REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT = { min: 240, max: 560 };
const REVIEW_PREVIEW_TEXT_WIDTH_LIMIT = { min: 240, max: 760 };
const STATUS_PAGE_LEFT_WIDTH_LIMIT = { min: 190, max: 360 };
const STATUS_PAGE_RIGHT_WIDTH_LIMIT = WORKBENCH_SHARED_AI_RIGHT_WIDTH_LIMIT;
const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS =
  'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';
const REVIEW_MANAGEMENT_MODAL_SIZE_CLASS =
  'h-[calc(80vh/var(--xinyuexia-effective-scale,1))] w-[calc(80vw/var(--xinyuexia-effective-scale,1))]';
const REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS = 'h-[80vh] w-[80vw]';
const REVIEW_PREVIEW_MIN_FONT_SIZE = 12;
const REVIEW_PREVIEW_MAX_FONT_SIZE = 28;
const REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS = 'space-y-3';
const REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS = 'border-l-2 px-3 py-1.5 leading-7 transition-colors';
const REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-slate-900';
const REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS = 'border-transparent bg-white text-slate-700 hover:bg-slate-50';
type EditorFieldSizeKey =
  | 'reviewActionGroup'
  | 'reviewModelSelect'
  | 'reviewAuditPromptSelect'
  | 'reviewCommentPromptSelect';
type EditorFieldSizeSpec = { width: number; height: number; fontSize: number };
type EditorFieldSizeProp = keyof EditorFieldSizeSpec;
type ReviewPreviewWidthMode = 'locked' | 'free';
type CenteredReviewComparisonScrollMetrics = {
  containerClientHeight: number;
  containerScrollHeight: number;
  targetOffsetTop: number;
  targetClientHeight: number;
};

export function getCenteredReviewComparisonScrollTop({
  containerClientHeight,
  containerScrollHeight,
  targetOffsetTop,
  targetClientHeight,
}: CenteredReviewComparisonScrollMetrics) {
  const maxScrollTop = Math.max(0, containerScrollHeight - containerClientHeight);
  const centeredTop = targetOffsetTop - (containerClientHeight - targetClientHeight) / 2;
  return Math.min(maxScrollTop, Math.max(0, Math.round(centeredTop)));
}

function scrollReviewComparisonTargetIntoCenter(container: HTMLElement | null, target: HTMLElement | null) {
  if (!container || !target) return;
  container.scrollTo({
    top: getCenteredReviewComparisonScrollTop({
      containerClientHeight: container.clientHeight,
      containerScrollHeight: container.scrollHeight,
      targetOffsetTop: target.offsetTop,
      targetClientHeight: target.clientHeight,
    }),
    behavior: 'smooth',
  });
}

const EDITOR_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';
const EDITOR_FIELD_SIZE_DEFAULTS: Record<EditorFieldSizeKey, EditorFieldSizeSpec> = {
  reviewActionGroup: { width: 168, height: 32, fontSize: 14 },
  reviewModelSelect: { width: 250, height: 44, fontSize: 13 },
  reviewAuditPromptSelect: { width: 250, height: 44, fontSize: 13 },
  reviewCommentPromptSelect: { width: 250, height: 44, fontSize: 13 },
};
const EDITOR_FIELD_SIZE_LABELS: Record<EditorFieldSizeKey, string> = {
  reviewActionGroup: '剧情审核综合点评文笔润色更新状态按钮',
  reviewModelSelect: '剧情审核综合点评文笔润色模型框',
  reviewAuditPromptSelect: '审核提示词框',
  reviewCommentPromptSelect: '综合点评提示词框',
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

function normalizeEditorFieldSizeSpec(
  key: EditorFieldSizeKey,
  value?: Partial<EditorFieldSizeSpec>,
): EditorFieldSizeSpec {
  const base = EDITOR_FIELD_SIZE_DEFAULTS[key];
  return {
    width: clampEditorFieldSizeValue('width', value?.width ?? base.width),
    height: clampEditorFieldSizeValue('height', value?.height ?? base.height),
    fontSize: clampEditorFieldSizeValue('fontSize', value?.fontSize ?? base.fontSize),
  };
}

function readEditorFieldSizeSpecs(): Record<EditorFieldSizeKey, EditorFieldSizeSpec> {
  try {
    const parsed = JSON.parse(localStorage.getItem(EDITOR_FIELD_SIZE_STORAGE_KEY) || '{}') as Partial<
      Record<EditorFieldSizeKey, Partial<EditorFieldSizeSpec>>
    >;
    return (Object.keys(EDITOR_FIELD_SIZE_DEFAULTS) as EditorFieldSizeKey[]).reduce(
      (acc, key) => {
        acc[key] = normalizeEditorFieldSizeSpec(key, parsed[key]);
        return acc;
      },
      {} as Record<EditorFieldSizeKey, EditorFieldSizeSpec>,
    );
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

function readWorkbenchLeftPanelWidth(storageKey: string, fallback: number, limit: { min: number; max: number }) {
  if (readSharedWorkbenchLeftNavWidthEnabled()) {
    return clampPanelWidth(readSharedWorkbenchLeftNavWidth(limit.max, limit.min), limit);
  }
  return readStoredPanelWidth(storageKey, fallback, limit);
}

function readReviewPreviewWidthMode(): ReviewPreviewWidthMode {
  try {
    return localStorage.getItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY) === 'free' ? 'free' : 'locked';
  } catch {
    return 'locked';
  }
}

function readReviewModelId() {
  try {
    return localStorage.getItem(REVIEW_MODEL_ID_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function readReviewPreviewOutlineVisible() {
  try {
    return localStorage.getItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function clampReviewPreviewFontSize(value: number) {
  if (!Number.isFinite(value)) return 14;
  return Math.min(REVIEW_PREVIEW_MAX_FONT_SIZE, Math.max(REVIEW_PREVIEW_MIN_FONT_SIZE, Math.round(value)));
}

function readReviewPreviewFontSize() {
  try {
    const stored = localStorage.getItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY);
    return stored === null ? 14 : clampReviewPreviewFontSize(Number(stored));
  } catch {
    return 14;
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

const POLISH_PROMPT_CATEGORY = '润色';
const REVIEW_MODE_PROMPT_CATEGORIES: Record<ReviewMode, string> = {
  audit: '审核',
  comment: COMMENT_PROMPT_CATEGORY,
  polish: POLISH_PROMPT_CATEGORY,
};
const AUDIT_STRUCTURE_PROMPT_FORMAT = `请按软件可识别的固定格式输出。每一项只能选择：通过 / 不通过。不要输出“部分通过”“基本通过”等第三种状态。

【剧情审核结果】

【审核项】章纲贴合度
【贴合度】0%-100%
【结果】通过 / 不通过
【说明】正文主要内容与章纲的关键事件、人物目标、因果走向和章节落点是否贴合。85%-100% 表示基本贴合；65%-84% 表示有偏差，建议复核；0%-64% 表示明显偏离。
【建议】

【审核项】主要事件是否完整
【结果】通过 / 不通过
【说明】本章核心事件是否完整呈现，读者能不能看明白这一章主要发生了什么。
【建议】

【审核项】人物行为是否合理
【结果】通过 / 不通过
【说明】人物行动是否有清楚原因，读者能不能理解角色为什么这样做。
【建议】

【审核项】前后逻辑是否清楚
【结果】通过 / 不通过
【说明】前一件事和后一件事之间是否接得上，角色行动、结果和转折是否有清楚原因。
【建议】

【审核项】剧情推进是否顺畅
【结果】通过 / 不通过
【说明】剧情推进是否顺畅。通过表示铺垫、冲突、转折和收束衔接自然；不通过表示突然跳转、关键过程缺失、推进过快或主线拖慢。
【建议】

【审核项】伏笔/设定是否矛盾
【结果】通过 / 不通过
【说明】本章伏笔、线索、能力、世界观、人物关系等设定是否前后一致。通过表示没有矛盾；不通过表示存在冲突或遗漏。
【建议】

【总体判断】
【剧情审核结论】通过 / 不通过
【最需要改的问题】
【优先修改建议】`;

const REVIEW_MODE_DEFAULT_INSTRUCTIONS: Record<ReviewMode, string> = {
  audit:
    '请对文章内容进行剧情审核：检查章纲贴合度、剧情逻辑、人物行为、前后逻辑、剧情推进。输出需要列出问题位置、问题说明和修改建议。',
  comment:
    '请对文章内容进行点评：判断内容是否吸引人，重点点评开篇钩子、节奏、冲突、情绪张力和读者继续阅读欲望，并给出可执行的优化建议。',
  polish:
    '请对文章内容进行文笔润色：先检查错别字、语病、标点和重复表达，再优化语言表达、节奏、句子顺滑度、画面感和情绪力度，不改变剧情事件、人物行动、设定信息和章节结果。输出需要提供可替换的完整润色稿。',
};

interface ChapterEditorProps {
  embeddedMode?: ChapterEditorEmbeddedMode;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  chapter: Chapter | null;
  volumeName: string | null;
  content: string;
  lastSavedAt: string | null;
  allChapters: Chapter[];
  volumes?: Volume[];
  settingsStorageKey: string;
  outlineStorageKey?: string;
  reviewLibraryEntries?: WorkbenchLibraryEntry[];
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

function renderAiThinkingContent(content: string) {
  const thinkingMatch = content.match(
    /^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/,
  );
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
  return (
    entries.find(
      (entry) =>
        isReviewDetailOutlineEntry(entry) &&
        serialPatterns.some((pattern) => pattern.test(`${entry.title} ${entry.type ?? ''}`)),
    ) ?? null
  );
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

function getAuditPromptSubcategory(prompt?: { category: string; subCategory?: string } | null) {
  return (
    normalizePromptSubcategory(prompt?.category ?? AUDIT_PROMPT_CATEGORY, prompt?.subCategory) ??
    DEFAULT_AUDIT_PROMPT_SUBCATEGORY
  );
}

function isTextAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {
  return getAuditPromptSubcategory(prompt) === '文本审核';
}

function isStructureAuditPrompt(prompt?: { category: string; subCategory?: string } | null) {
  return getAuditPromptSubcategory(prompt) === '剧情审核';
}

function buildAuditPromptSelectOptions(
  prompts: Array<{ id: string; name: string; category: string; subCategory?: string }>,
) {
  return AUDIT_PROMPT_SUBCATEGORIES.flatMap((subCategory) => {
    const items = prompts.filter((prompt) => getAuditPromptSubcategory(prompt) === subCategory);
    const metaLabel = subCategory === '文本审核' ? '文本' : '剧情';
    return items.map((prompt) => ({ value: prompt.id, label: prompt.name, metaLabel }));
  });
}

function getReviewSeverityClass(severity: string) {
  if (/严重|高|红|不通过/.test(severity)) return 'border-red-200 bg-red-50 text-red-700';
  if (/中|黄|警告/.test(severity)) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-cyan-200 bg-cyan-50 text-[#078fb0]';
}

function getReviewAnnotationNoteSpacingClass(text: string) {
  return text.length > 80 ? 'mt-3' : 'mt-2';
}

function renderAnnotatedReviewParagraph(paragraph: string, annotations: ReviewAnnotation[]) {
  if (!paragraph) return <span className="text-slate-300">空段落</span>;
  const matchedAnnotations = annotations.filter((annotation) => paragraph.includes(annotation.originalText));
  if (matchedAnnotations.length === 0) return paragraph;

  const parts: Array<{ text: string; annotation?: ReviewAnnotation }> = [];
  let cursor = 0;
  matchedAnnotations
    .map((annotation) => ({ annotation, index: paragraph.indexOf(annotation.originalText, cursor) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .forEach(({ annotation, index }) => {
      if (index < cursor) return;
      if (index > cursor) parts.push({ text: paragraph.slice(cursor, index) });
      parts.push({ text: paragraph.slice(index, index + annotation.originalText.length), annotation });
      cursor = index + annotation.originalText.length;
    });
  if (cursor < paragraph.length) parts.push({ text: paragraph.slice(cursor) });

  return (
    <>
      {parts.map((part, index) =>
        part.annotation ? (
          <mark
            key={`${part.annotation.id}-${index}`}
            className="rounded bg-amber-100 px-0.5 text-amber-900 ring-1 ring-amber-300"
            title={`${part.annotation.type}：${part.annotation.problem || part.annotation.suggestion}`}
          >
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

function renderTextAuditOriginalDiff(originalText: string, revisedText?: string) {
  if (!originalText) return <span className="text-slate-300">空段落</span>;
  if (revisedText === undefined) {
    return <span className="rounded bg-red-50 px-0.5 text-red-500 line-through">{originalText}</span>;
  }
  const diff = buildReviewTextDiff(originalText, revisedText);
  if (!diff.hasChanges) return originalText;
  return (
    <>
      {diff.original.map((segment, index) =>
        segment.changed ? (
          <span key={`${index}-${segment.text}`} className="rounded bg-red-50 px-0.5 text-red-400 line-through">
            {segment.text}
          </span>
        ) : (
          <span key={`${index}-${segment.text}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function renderTextAuditRevisedDiff(originalText: string | undefined, revisedText: string | undefined) {
  if (revisedText === undefined) {
    return (
      <span className="inline-flex rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-black text-red-500">
        审核后缺少本段，请让 AI 保留段落位置。
      </span>
    );
  }
  if (!revisedText) {
    return originalText ? (
      <span className="inline-flex rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-black text-red-500">
        整段已删除
      </span>
    ) : (
      <span className="text-slate-300">空段落</span>
    );
  }
  if (originalText === undefined) {
    return <span className="font-black text-red-500">{revisedText}</span>;
  }
  const diff = buildReviewTextDiff(originalText, revisedText);
  if (!diff.hasChanges) return revisedText;
  return (
    <>
      {diff.revised.map((segment, index) =>
        segment.changed ? (
          <span key={`${index}-${segment.text}`} className="font-black text-red-500">
            {segment.text}
          </span>
        ) : (
          <span key={`${index}-${segment.text}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function ChapterEditor({
  embeddedMode,
  fieldSizeOpenSignal = 0,
  showInlineFieldSizeButton = true,
  openLogSignal = 0,
  onRegisterHeaderLog,
  chapter,
  volumeName,
  content,
  lastSavedAt,
  allChapters,
  volumes = [],
  settingsStorageKey,
  outlineStorageKey,
  reviewLibraryEntries,
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
  const [isReviewOpen, setIsReviewOpen] = useState(
    () => embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish',
  );
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(() => embeddedMode === 'status');
  const [isEditorFieldSizeOpen, setIsEditorFieldSizeOpen] = useState(false);
  const lastFieldSizeOpenSignalRef = useRef(fieldSizeOpenSignal);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const [editorFieldSizeSpecs, setEditorFieldSizeSpecs] = useState<Record<EditorFieldSizeKey, EditorFieldSizeSpec>>(
    () => readEditorFieldSizeSpecs(),
  );
  const [reviewPageLeftWidth, setReviewPageLeftWidth] = useState(() =>
    readWorkbenchLeftPanelWidth(
      REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
      REVIEW_PAGE_LEFT_WIDTH,
      REVIEW_PAGE_LEFT_WIDTH_LIMIT,
    ),
  );
  const [reviewPageRightWidth, setReviewPageRightWidth] = useState(() =>
    readSharedWorkbenchAiRightWidth(REVIEW_PAGE_RIGHT_WIDTH_LIMIT.max),
  );
  const [reviewPreviewOutlineWidth, setReviewPreviewOutlineWidth] = useState(() =>
    readStoredPanelWidth(
      REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY,
      REVIEW_PREVIEW_OUTLINE_WIDTH,
      REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT,
    ),
  );
  const [reviewPreviewTextWidth, setReviewPreviewTextWidth] = useState(() =>
    readStoredPanelWidth(
      REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,
      REVIEW_PREVIEW_TEXT_WIDTH,
      REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
    ),
  );
  const [reviewPreviewWidthMode, setReviewPreviewWidthMode] = useState<ReviewPreviewWidthMode>(() =>
    readReviewPreviewWidthMode(),
  );
  const [reviewPreviewUsesCustomTextWidth, setReviewPreviewUsesCustomTextWidth] = useState(false);
  const [statusPageLeftWidth, setStatusPageLeftWidth] = useState(() =>
    readWorkbenchLeftPanelWidth(
      STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
      STATUS_PAGE_LEFT_WIDTH,
      STATUS_PAGE_LEFT_WIDTH_LIMIT,
    ),
  );
  const [statusPageRightWidth, setStatusPageRightWidth] = useState(() =>
    readSharedWorkbenchAiRightWidth(STATUS_PAGE_RIGHT_WIDTH_LIMIT.max),
  );
  const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(() => readReviewPreviewFontSize());
  const [showReviewOutline, setShowReviewOutline] = useState(() => readReviewPreviewOutlineVisible());
  const [activeReviewPreviewScrollPane, setActiveReviewPreviewScrollPane] = useState<
    'outline' | 'original' | 'annotation' | null
  >(null);
  const [activeReviewParagraphIndex, setActiveReviewParagraphIndex] = useState(0);
  const reviewOriginalPreviewPaneRef = useRef<HTMLDivElement | null>(null);
  const reviewAnnotationPreviewPaneRef = useRef<HTMLDivElement | null>(null);
  const reviewOriginalParagraphRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reviewAnnotationRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reviewPreviewGridRef = useRef<HTMLDivElement | null>(null);
  const reviewPreviewScrollTimerRef = useRef<number | null>(null);
  const [reviewChapterId, setReviewChapterId] = useState<number | null>(() => chapter?.id ?? null);
  const [statusChapterId, setStatusChapterId] = useState<number | null>(() => chapter?.id ?? null);
  const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());
  const [expandedAuditStructureItems, setExpandedAuditStructureItems] = useState<Set<string>>(() => new Set());
  const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());
  const [statusEntries, setStatusEntries] = useState<WorkbenchLibraryEntry[]>([]);
  const [statusTargetIds, setStatusTargetIds] = useState<Set<string>>(() => new Set());
  const [statusDraft, setStatusDraft] = useState('');
  const [reviewModelId, setReviewModelId] = useState(() => readReviewModelId());
  const [reviewMode, setReviewMode] = useState<ReviewMode>(() =>
    embeddedMode === 'comment' || embeddedMode === 'polish' ? embeddedMode : 'audit',
  );
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
  const editorGridLineStyle = useMemo(
    () => getEditorGridLineStyle(fontSettings, editorScrollTop),
    [editorScrollTop, fontSettings],
  );
  const editorTextLineHeight = useMemo(() => getEditorTextLineHeight(fontSettings), [fontSettings]);
  const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;
  const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;
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
  const clearReviewAiOutput = () => {
    const taskId = reviewModeStates[reviewMode]?.backgroundTaskId;
    if (taskId) stopBackgroundAiTask(taskId);
    writeReviewBackgroundTaskId(settingsStorageKey, reviewChapterId ?? activeChapterId, reviewMode, undefined);
    updateActiveReviewState((state) => ({
      ...state,
      output: '',
      revisedDraft: '',
      requestLog: '',
      backgroundTaskId: undefined,
    }));
    setIsReviewAiLoading(false);
  };
  useTopModalEscape(isReviewLogOpen, () => setIsReviewLogOpen(false));
  useTopModalEscape(Boolean(reviewManagementModal), () => setReviewManagementModal(null));
  useTopModalEscape(isEditorFieldSizeOpen, () => setIsEditorFieldSizeOpen(false));
  useTopModalEscape(!embeddedMode && isReviewOpen && !isReviewLogOpen && !reviewManagementModal, () =>
    setIsReviewOpen(false),
  );
  useTopModalEscape(!embeddedMode && isStatusUpdateOpen, () => setIsStatusUpdateOpen(false));
  useTopModalEscape(isFindOpen, () => setIsFindOpen(false));

  useEffect(() => {
    const syncSharedAiRightWidth = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const nextReviewWidth = readSharedWorkbenchAiRightWidth(REVIEW_PAGE_RIGHT_WIDTH_LIMIT.max);
      const nextStatusWidth = readSharedWorkbenchAiRightWidth(STATUS_PAGE_RIGHT_WIDTH_LIMIT.max);
      setReviewPageRightWidth(nextReviewWidth);
      setStatusPageRightWidth(nextStatusWidth);
    };
    window.addEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
  }, []);

  useEffect(() => {
    const syncSharedLeftNavWidth = () => {
      if (!readSharedWorkbenchLeftNavWidthEnabled()) return;
      setReviewPageLeftWidth(
        readWorkbenchLeftPanelWidth(
          REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
          REVIEW_PAGE_LEFT_WIDTH,
          REVIEW_PAGE_LEFT_WIDTH_LIMIT,
        ),
      );
      setStatusPageLeftWidth(
        readWorkbenchLeftPanelWidth(
          STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
          STATUS_PAGE_LEFT_WIDTH,
          STATUS_PAGE_LEFT_WIDTH_LIMIT,
        ),
      );
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
  }, []);

  useEffect(() => {
    if (fieldSizeOpenSignal <= 0 || fieldSizeOpenSignal === lastFieldSizeOpenSignalRef.current) return;
    lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
    setIsEditorFieldSizeOpen(true);
  }, [fieldSizeOpenSignal]);

  useEffect(() => {
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;
    lastOpenLogSignalRef.current = openLogSignal;
    setIsReviewLogOpen(true);
  }, [embeddedMode, openLogSignal]);

  useEffect(() => {
    if (!onRegisterHeaderLog) return;
    if (embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish') {
      onRegisterHeaderLog(() => setIsReviewLogOpen(true));
      return () => onRegisterHeaderLog(null);
    }
    onRegisterHeaderLog(null);
  }, [embeddedMode, onRegisterHeaderLog]);

  useEffect(
    () => () => {
      if (reviewPreviewScrollTimerRef.current !== null) {
        window.clearTimeout(reviewPreviewScrollTimerRef.current);
      }
    },
    [],
  );

  const titleCount = chapter?.title.length ?? 0;
  const serialValue = chapter?.serialNumber ?? 1;
  const safeVolumeName = volumeName ?? '第一卷';
  const wordCount = useMemo(() => content.replace(/\s/g, '').length, [content]);
  const getEditorFieldStyle = (key: EditorFieldSizeKey) =>
    getEditorFieldSizeStyle(editorFieldSizeSpecs[key] ?? EDITOR_FIELD_SIZE_DEFAULTS[key]);
  const getEmbeddedEditorFieldStyle = (key: EditorFieldSizeKey): CSSProperties =>
    showInlineFieldSizeButton
      ? getEditorFieldStyle(key)
      : ({
          ...getEditorFieldStyle(key),
          width: '100%',
          maxWidth: '100%',
          '--xy-field-width': '100%',
        } as CSSProperties);
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
  const handleReviewPreviewScroll = (pane: 'outline' | 'original' | 'annotation') => {
    setActiveReviewPreviewScrollPane(pane);
    if (reviewPreviewScrollTimerRef.current !== null) {
      window.clearTimeout(reviewPreviewScrollTimerRef.current);
    }
    reviewPreviewScrollTimerRef.current = window.setTimeout(() => {
      setActiveReviewPreviewScrollPane(null);
      reviewPreviewScrollTimerRef.current = null;
    }, 650);
  };
  const getBalancedReviewPreviewTextWidth = (
    nextOutlineWidth = reviewPreviewOutlineWidth,
    nextShowOutline = effectiveShowReviewOutline,
  ) => {
    const gridWidth = reviewPreviewGridRef.current?.clientWidth ?? 0;
    const fixedWidth = nextShowOutline
      ? nextOutlineWidth + REVIEW_PREVIEW_SEPARATOR_WIDTH * 2
      : REVIEW_PREVIEW_SEPARATOR_WIDTH;
    const dynamicTextWidthLimit = {
      ...REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
      max: Math.max(REVIEW_PREVIEW_TEXT_WIDTH_LIMIT.max, (gridWidth - fixedWidth) / 2),
    };
    return gridWidth > fixedWidth
      ? clampPanelWidth((gridWidth - fixedWidth) / 2, dynamicTextWidthLimit)
      : REVIEW_PREVIEW_TEXT_WIDTH;
  };
  const syncReviewPreviewTextColumnsWidth = (
    nextOutlineWidth = reviewPreviewOutlineWidth,
    nextShowOutline = effectiveShowReviewOutline,
  ) => {
    const sharedTextWidth = getBalancedReviewPreviewTextWidth(nextOutlineWidth, nextShowOutline);
    setReviewPreviewTextWidth(sharedTextWidth);
    localStorage.setItem(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, String(sharedTextWidth));
    return sharedTextWidth;
  };
  const setReviewPreviewWidthModeWithStorage = (nextMode: ReviewPreviewWidthMode) => {
    if (nextMode === 'free') {
      syncReviewPreviewTextColumnsWidth();
      setReviewPreviewUsesCustomTextWidth(false);
    }
    setReviewPreviewWidthMode(nextMode);
    localStorage.setItem(REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY, nextMode);
  };
  const setReviewOutlineVisibilityWithBalancedColumns = (nextShowReviewOutline: boolean) => {
    const gridWidth = reviewPreviewGridRef.current?.clientWidth ?? 0;
    setShowReviewOutline(nextShowReviewOutline);
    localStorage.setItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY, String(nextShowReviewOutline));
    setReviewPreviewUsesCustomTextWidth(false);
    let nextOutlineWidth = reviewPreviewOutlineWidth;
    if (nextShowReviewOutline) {
      const availableWidth = Math.max(0, gridWidth - REVIEW_PREVIEW_SEPARATOR_WIDTH * 2);
      const outlineWidth =
        availableWidth > 0
          ? clampPanelWidth(availableWidth * 0.26, REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT)
          : REVIEW_PREVIEW_OUTLINE_WIDTH;
      setReviewPreviewOutlineWidth(outlineWidth);
      localStorage.setItem(REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY, String(outlineWidth));
      nextOutlineWidth = outlineWidth;
    }
    if (reviewPreviewWidthMode === 'free')
      syncReviewPreviewTextColumnsWidth(nextOutlineWidth, canShowReviewOutline && nextShowReviewOutline);
  };
  const setReviewPreviewFontSizeWithStorage = (nextFontSize: number) => {
    const fontSize = clampReviewPreviewFontSize(nextFontSize);
    setReviewPreviewFontSize(fontSize);
    localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, String(fontSize));
  };
  const setReviewModelIdWithStorage = (nextModelId: string) => {
    setReviewModelId(nextModelId);
    localStorage.setItem(REVIEW_MODEL_ID_STORAGE_KEY, nextModelId);
  };
  const startPanelWidthResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    options: {
      initialWidth: number;
      storageKey: string;
      limit: { min: number; max: number };
      direction: 1 | -1;
      onChange: (value: number) => void;
      onCommit?: (value: number) => void;
      onStart?: () => void;
    },
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const startX = event.clientX;
    const { initialWidth, storageKey, limit, direction, onChange, onCommit, onStart } = options;
    onStart?.();
    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const nextWidth = clampPanelWidth(initialWidth + (moveEvent.clientX - startX) * direction, limit);
      onChange(nextWidth);
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      const finalWidth = clampPanelWidth(initialWidth + (upEvent.clientX - startX) * direction, limit);
      onChange(finalWidth);
      onCommit?.(finalWidth);
      if (!onCommit) {
        localStorage.setItem(storageKey, String(finalWidth));
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const renderPanelResizeHandle = (onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void) => (
    <div
      data-no-modal-drag="true"
      onPointerDown={onPointerDown}
      className={CHAPTER_EDITOR_RESIZE_HANDLE_CLASS}
      title="拖拽调整宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
  const renderReviewPreviewColumnSeparator = (
    options: {
      onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
      title?: string;
    } = {},
  ) => (
    <div
      data-no-modal-drag="true"
      onPointerDown={options.onPointerDown}
      className={`group flex h-full w-full items-stretch justify-center bg-white ${options.onPointerDown ? 'cursor-ew-resize' : 'cursor-default'}`}
      title={options.title}
    >
      <div
        className={`h-full w-px bg-slate-300 ${options.onPointerDown ? 'transition-colors group-hover:bg-[#08AACE]' : ''}`}
      />
    </div>
  );
  const statusLeftResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: statusPageLeftWidth,
      storageKey: STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY,
      limit: STATUS_PAGE_LEFT_WIDTH_LIMIT,
      direction: 1,
      onChange: setStatusPageLeftWidth,
      onCommit: (value) => {
        if (readSharedWorkbenchLeftNavWidthEnabled())
          writeSharedWorkbenchLeftNavWidth(value, STATUS_PAGE_LEFT_WIDTH_LIMIT.max, STATUS_PAGE_LEFT_WIDTH_LIMIT.min);
        else localStorage.setItem(STATUS_PAGE_LEFT_WIDTH_STORAGE_KEY, String(value));
      },
    }),
  );
  const statusRightResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: statusPageRightWidth,
      storageKey: STATUS_PAGE_RIGHT_WIDTH_STORAGE_KEY,
      limit: STATUS_PAGE_RIGHT_WIDTH_LIMIT,
      direction: -1,
      onChange: setStatusPageRightWidth,
      onCommit: (value) => writeSharedWorkbenchAiRightWidth(value),
    }),
  );
  const reviewLeftResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: reviewPageLeftWidth,
      storageKey: REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY,
      limit: REVIEW_PAGE_LEFT_WIDTH_LIMIT,
      direction: 1,
      onChange: setReviewPageLeftWidth,
      onCommit: (value) => {
        if (readSharedWorkbenchLeftNavWidthEnabled())
          writeSharedWorkbenchLeftNavWidth(value, REVIEW_PAGE_LEFT_WIDTH_LIMIT.max, REVIEW_PAGE_LEFT_WIDTH_LIMIT.min);
        else localStorage.setItem(REVIEW_PAGE_LEFT_WIDTH_STORAGE_KEY, String(value));
      },
    }),
  );
  const reviewRightResizeHandle = renderPanelResizeHandle((event) =>
    startPanelWidthResize(event, {
      initialWidth: reviewPageRightWidth,
      storageKey: REVIEW_PAGE_RIGHT_WIDTH_STORAGE_KEY,
      limit: REVIEW_PAGE_RIGHT_WIDTH_LIMIT,
      direction: -1,
      onChange: setReviewPageRightWidth,
      onCommit: (value) => writeSharedWorkbenchAiRightWidth(value),
    }),
  );
  const reviewPreviewOutlineResizeHandle = renderReviewPreviewColumnSeparator({
    title: '拖拽调整章纲宽度',
    onPointerDown: (event) =>
      startPanelWidthResize(event, {
        initialWidth: reviewPreviewOutlineWidth,
        storageKey: REVIEW_PREVIEW_OUTLINE_WIDTH_STORAGE_KEY,
        limit: REVIEW_PREVIEW_OUTLINE_WIDTH_LIMIT,
        direction: 1,
        onChange: setReviewPreviewOutlineWidth,
      }),
  });
  const reviewPreviewTextResizeHandle = renderReviewPreviewColumnSeparator({
    title: '拖拽调整原文宽度',
    onPointerDown: (event) =>
      startPanelWidthResize(event, {
        initialWidth: reviewPreviewTextWidth,
        storageKey: REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY,
        limit: REVIEW_PREVIEW_TEXT_WIDTH_LIMIT,
        direction: 1,
        onChange: setReviewPreviewTextWidth,
        onStart: () => setReviewPreviewUsesCustomTextWidth(true),
      }),
  });
  const reviewPreviewTextColumnSeparator =
    reviewPreviewWidthMode === 'locked' ? renderReviewPreviewColumnSeparator() : reviewPreviewTextResizeHandle;
  const { models: modelSnapshot } = useModels();
  const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);
  const { prompts: reviewPrompts } = usePrompts();
  const reviewAuditPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === '审核');
  }, [reviewPrompts]);
  const reviewCommentPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === COMMENT_PROMPT_CATEGORY);
  }, [reviewPrompts]);
  const reviewPolishPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === POLISH_PROMPT_CATEGORY);
  }, [reviewPrompts]);
  const statusPrompts = useMemo(() => {
    return reviewPrompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === STATUS_PROMPT_CATEGORY);
  }, [reviewPrompts]);
  const sortedReviewChapters = useMemo(
    () => [...allChapters].sort((a, b) => a.serialNumber - b.serialNumber),
    [allChapters],
  );
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
  const toggleAuditStructureItem = (item: string) => {
    setExpandedAuditStructureItems((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };
  const activeReviewChapter =
    sortedReviewChapters.find((item) => item.id === reviewChapterId) ?? chapter ?? sortedReviewChapters[0] ?? null;
  const activeReviewContent = activeReviewChapter
    ? activeReviewChapter.id === chapter?.id
      ? content
      : getChapterContent(activeReviewChapter.id)
    : '';
  const activeReviewWordCount = activeReviewContent.replace(/\s/g, '').length;
  const reviewDetailOutlineEntries = useMemo(() => {
    const entries = reviewLibraryEntries ?? [
      ...readWorkbenchLibraryEntries(settingsStorageKey),
      ...(outlineStorageKey ? readWorkbenchLibraryEntries(outlineStorageKey) : []),
    ];
    return entries.filter(isReviewDetailOutlineEntry);
  }, [outlineStorageKey, reviewLibraryEntries, settingsStorageKey]);
  const activeReviewDetailOutline = useMemo(
    () => findReviewDetailOutline(reviewDetailOutlineEntries, activeReviewChapter),
    [activeReviewChapter, reviewDetailOutlineEntries],
  );
  const activeReviewDetailOutlineText = activeReviewDetailOutline?.content.trim() ?? '';
  const canShowReviewOutline = reviewMode !== 'polish';
  const effectiveShowReviewOutline = canShowReviewOutline && showReviewOutline;
  const polishPreviewText = reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput);
  const polishPreviewParagraphs = useMemo(() => splitReviewParagraphs(polishPreviewText), [polishPreviewText]);
  const reviewPreviewHiddenTextColumnMinWidth = `calc((100% - ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px) / 3)`;
  const reviewPreviewFreeTextColumnMinWidth = effectiveShowReviewOutline
    ? `calc((100% - ${reviewPreviewOutlineWidth}px - ${REVIEW_PREVIEW_SEPARATOR_WIDTH * 2}px) / 3)`
    : reviewPreviewHiddenTextColumnMinWidth;
  const reviewPreviewUseFreeCustomWidth = reviewPreviewWidthMode === 'free' && reviewPreviewUsesCustomTextWidth;
  const reviewPreviewGridTemplateColumns = !reviewPreviewUseFreeCustomWidth
    ? effectiveShowReviewOutline
      ? `${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr)`
      : `minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`
    : effectiveShowReviewOutline
      ? `${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, 1fr)`
      : `minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`;
  const activeReviewModel = reviewModels.find((model) => model.id === reviewModelId) ?? reviewModels[0] ?? null;
  const activeAuditPrompt =
    reviewAuditPrompts.find((prompt) => prompt.id === reviewAuditPromptId) ?? reviewAuditPrompts[0] ?? null;
  const activeCommentPrompt =
    reviewCommentPrompts.find((prompt) => prompt.id === reviewCommentPromptId) ?? reviewCommentPrompts[0] ?? null;
  const activePolishPrompt =
    reviewPolishPrompts.find((prompt) => prompt.id === reviewPolishPromptId) ?? reviewPolishPrompts[0] ?? null;
  const activeReviewPrompt =
    reviewMode === 'audit' ? activeAuditPrompt : reviewMode === 'comment' ? activeCommentPrompt : activePolishPrompt;
  const activeReviewPromptOptions =
    reviewMode === 'audit'
      ? buildAuditPromptSelectOptions(reviewAuditPrompts)
      : reviewMode === 'comment'
        ? reviewCommentPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
        : reviewPolishPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }));
  const activeReviewPromptId =
    reviewMode === 'audit'
      ? reviewAuditPromptId
      : reviewMode === 'comment'
        ? reviewCommentPromptId
        : reviewPolishPromptId;
  const setActiveReviewPromptId =
    reviewMode === 'audit'
      ? setReviewAuditPromptId
      : reviewMode === 'comment'
        ? setReviewCommentPromptId
        : setReviewPolishPromptId;
  const activeReviewPromptCategory = REVIEW_MODE_PROMPT_CATEGORIES[reviewMode];
  const isAuditTextReview = reviewMode === 'audit' && isTextAuditPrompt(activeReviewPrompt);
  const isAuditStructureReview = reviewMode === 'audit' && isStructureAuditPrompt(activeReviewPrompt);
  const reviewPreviewOriginalTitle = activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 原文` : '原文';
  const reviewPreviewAnnotationLabel =
    reviewMode === 'polish'
      ? '润色后'
      : reviewMode === 'audit'
        ? isAuditTextReview
          ? '文本审核'
          : '剧情审核'
        : 'AI标注';
  const reviewPreviewAnnotationTitle = activeReviewChapter
    ? `第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`
    : reviewPreviewAnnotationLabel;
  const auditOutputPassed = isAuditOutputPassed(reviewAiOutput);
  const activeStatusPromptId = statusPrompts.some((prompt) => prompt.id === statusPromptId)
    ? statusPromptId
    : (statusPrompts[0]?.id ?? '');
  const reviewOriginalParagraphs = useMemo(() => splitReviewParagraphs(activeReviewContent), [activeReviewContent]);
  const auditRevisedText = useMemo(
    () => (isAuditTextReview ? reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput) : ''),
    [isAuditTextReview, reviewAiOutput, reviewRevisedDraft],
  );
  const auditRevisedParagraphs = useMemo(() => splitReviewParagraphs(auditRevisedText), [auditRevisedText]);
  const auditParagraphCountMatches = reviewOriginalParagraphs.length === auditRevisedParagraphs.length;
  const reviewAnnotations = useMemo(() => extractReviewAnnotations(reviewAiOutput), [reviewAiOutput]);
  const reviewAnnotationsByParagraph = useMemo(() => {
    const result = new Map<number, ReviewAnnotation[]>();
    reviewAnnotations.forEach((annotation) => {
      const index = getReviewAnnotationParagraphIndex(annotation, reviewOriginalParagraphs.length);
      if (index < 0) return;
      const current = result.get(index) ?? [];
      current.push(annotation);
      result.set(index, current);
    });
    return result;
  }, [reviewAnnotations, reviewOriginalParagraphs.length]);
  useEffect(() => {
    setActiveReviewParagraphIndex((current) => {
      if (reviewOriginalParagraphs.length === 0) return 0;
      return Math.min(current, reviewOriginalParagraphs.length - 1);
    });
  }, [reviewOriginalParagraphs.length]);
  const selectReviewPreviewParagraph = (index: number) => {
    setActiveReviewParagraphIndex(index);
    window.requestAnimationFrame(() => {
      scrollReviewComparisonTargetIntoCenter(
        reviewOriginalPreviewPaneRef.current,
        reviewOriginalParagraphRefs.current[index],
      );
      scrollReviewComparisonTargetIntoCenter(
        reviewAnnotationPreviewPaneRef.current,
        reviewAnnotationRefs.current[index],
      );
    });
  };
  const handleActiveReviewPromptChange = (nextPromptId: string) => {
    const previousAuditType = reviewMode === 'audit' ? getAuditPromptSubcategory(activeReviewPrompt) : undefined;
    const nextPrompt = reviewMode === 'audit' ? reviewAuditPrompts.find((prompt) => prompt.id === nextPromptId) : null;
    setActiveReviewPromptId(nextPromptId);
    if (reviewMode === 'audit' && nextPrompt && getAuditPromptSubcategory(nextPrompt) !== previousAuditType) {
      clearReviewAiOutput();
    }
  };
  const sortedStatusChapters = sortedReviewChapters;
  const activeStatusChapter =
    sortedStatusChapters.find((item) => item.id === statusChapterId) ?? chapter ?? sortedStatusChapters[0] ?? null;
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
  const statusUpdatedChapterIds = useMemo(
    () =>
      new Set(
        sortedStatusChapters
          .filter((item) =>
            statusUpdateSourceEntries.some((entry) => getExistingStatusForChapter(entry.content, item.serialNumber)),
          )
          .map((item) => item.id),
      ),
    [sortedStatusChapters, statusUpdateSourceEntries],
  );
  useEffect(() => {
    if (activeChapterId !== null) {
      setReviewChapterId(activeChapterId);
      setReviewModeStates(clearAllReviewModeResults);
    }
  }, [activeChapterId]);

  useEffect(() => {
    if (activeChapterId !== null) setStatusChapterId(activeChapterId);
  }, [activeChapterId]);

  useEffect(() => {
    if (reviewModels.length === 0) {
      if (reviewModelId) setReviewModelIdWithStorage('');
      return;
    }
    if (!reviewModels.some((model) => model.id === reviewModelId)) {
      setReviewModelIdWithStorage(reviewModels[0].id);
    }
  }, [reviewModelId, reviewModels]);

  useEffect(() => {
    if (reviewAuditPrompts.length === 0) {
      if (reviewAuditPromptId) setReviewAuditPromptId('');
      return;
    }
    if (!reviewAuditPrompts.some((prompt) => prompt.id === reviewAuditPromptId)) {
      setReviewAuditPromptId(reviewAuditPrompts[0].id);
    }
  }, [reviewAuditPromptId, reviewAuditPrompts]);

  useEffect(() => {
    if (reviewCommentPrompts.length === 0) {
      if (reviewCommentPromptId) setReviewCommentPromptId('');
      return;
    }
    if (!reviewCommentPrompts.some((prompt) => prompt.id === reviewCommentPromptId)) {
      setReviewCommentPromptId(reviewCommentPrompts[0].id);
    }
  }, [reviewCommentPromptId, reviewCommentPrompts]);

  useEffect(() => {
    if (reviewPolishPrompts.length === 0) {
      if (reviewPolishPromptId) setReviewPolishPromptId('');
      return;
    }
    if (!reviewPolishPrompts.some((prompt) => prompt.id === reviewPolishPromptId)) {
      setReviewPolishPromptId(reviewPolishPrompts[0].id);
    }
  }, [reviewPolishPromptId, reviewPolishPrompts]);

  useEffect(() => {
    if (!statusPromptId && statusPrompts[0]) setStatusPromptId(statusPrompts[0].id);
  }, [statusPromptId, statusPrompts]);

  useEffect(() => {
    const activeReviewChapterId = activeReviewChapter?.id ?? null;
    const storedTaskIds = readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId);
    setReviewModeStates((prev) => ({
      audit: { ...prev.audit, backgroundTaskId: storedTaskIds.audit },
      comment: { ...prev.comment, backgroundTaskId: storedTaskIds.comment },
      polish: { ...prev.polish, backgroundTaskId: storedTaskIds.polish },
    }));
  }, [activeReviewChapter?.id, settingsStorageKey]);

  useEffect(() => {
    const activeReviewChapterId = activeReviewChapter?.id ?? null;
    const syncBackgroundTasks = () => {
      const storedTaskIds = readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId);
      setReviewModeStates((prev) => {
        let changed = false;
        const next = { ...prev };
        (Object.keys(REVIEW_MODE_TITLES) as ReviewMode[]).forEach((mode) => {
          const taskId = prev[mode].backgroundTaskId ?? storedTaskIds[mode];
          if (!taskId) return;
          const task = getBackgroundAiTask(taskId);
          if (!isReviewBackgroundTaskForChapter(task, settingsStorageKey, activeReviewChapterId, mode)) return;
          const nextOutput = getReviewBackgroundTaskOutput(task, mode);
          const nextRequestLog =
            typeof task.meta?.requestLog === 'string' ? task.meta.requestLog : prev[mode].requestLog;
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
            }
          }
          const stateChanged =
            nextState.output !== prev[mode].output ||
            nextState.requestLog !== prev[mode].requestLog ||
            nextState.backgroundTaskId !== prev[mode].backgroundTaskId ||
            nextState.revisedDraft !== prev[mode].revisedDraft;
          if (!stateChanged) return;
          changed = true;
          next[mode] = nextState;
        });
        return changed ? next : prev;
      });

      const activeTaskId =
        reviewModeStates[reviewMode]?.backgroundTaskId ??
        readRestorableReviewBackgroundTaskIds(settingsStorageKey, activeReviewChapterId)[reviewMode];
      const activeTask = activeTaskId ? getBackgroundAiTask(activeTaskId) : null;
      setIsReviewAiLoading(
        isReviewBackgroundTaskForChapter(activeTask, settingsStorageKey, activeReviewChapterId, reviewMode) &&
          activeTask?.status === 'running',
      );
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [activeReviewChapter?.id, reviewMode, reviewModeStates, settingsStorageKey]);

  const openReviewPanel = (mode: ReviewMode) => {
    setReviewMode(mode);
    setIsReviewLogOpen(false);
    setReviewManagementModal(null);
    setIsReviewOpen(true);
  };

  const selectReviewChapter = (nextChapterId: number) => {
    setReviewChapterId(nextChapterId);
    setIsReviewLogOpen(false);
    setReviewModeStates(clearAllReviewModeResults);
  };

  const openStatusUpdate = useCallback(() => {
    const entries = readWorkbenchLibraryEntries(settingsStorageKey);
    const targets = entries.filter(isStatusTargetEntry);
    const firstTarget = targets[0] ?? null;
    const nextChapter = chapter ?? sortedStatusChapters[0] ?? null;
    setStatusEntries(entries);
    setStatusTargetIds(firstTarget ? new Set([firstTarget.id]) : new Set());
    setStatusDraft(
      firstTarget && nextChapter ? getExistingStatusForChapter(firstTarget.content, nextChapter.serialNumber) : '',
    );
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
    const nextEntries = statusEntries.map((entry) =>
      statusTargetIds.has(entry.id)
        ? {
            ...entry,
            content: upsertEntryStatus(entry.content, activeStatusChapter, statusDraft),
            updatedAt: new Date().toLocaleString('zh-CN'),
          }
        : entry,
    );
    setStatusEntries(nextEntries);
    writeWorkbenchLibraryEntries(settingsStorageKey, nextEntries);
    if (!embeddedMode) setIsStatusUpdateOpen(false);
    showToast(`已更新 ${statusTargetIds.size} 个状态到第${activeStatusChapter.serialNumber}章`);
  };

  const showToast = (text: string) => setCopyToast(text);

  const buildReviewPayload = () => {
    const modeTitle = REVIEW_MODE_TITLES[reviewMode];
    const modeInstruction = REVIEW_MODE_DEFAULT_INSTRUCTIONS[reviewMode];
    const basePromptText = activeReviewPrompt?.content?.trim() || modeInstruction;
    const auditSubcategory = getAuditPromptSubcategory(activeReviewPrompt);
    const isTextAudit = reviewMode === 'audit' && auditSubcategory === '文本审核';
    const isStructureAudit = reviewMode === 'audit' && auditSubcategory === '剧情审核';
    const bodyTag =
      reviewMode === 'audit' ? '待剧情审核正文' : reviewMode === 'comment' ? '待点评正文' : '待文笔润色正文';
    const requirementTag =
      reviewMode === 'audit' ? '剧情审核要求' : reviewMode === 'comment' ? '点评要求' : '文笔润色要求';
    const compareInstruction = isStructureAudit
      ? [
          '这是剧情审核，不要输出修改后全文，不要润色文字，不要改写正文。',
          '必须严格使用下面的软件固定格式；不要新增、删除、改名审核项。',
          AUDIT_STRUCTURE_PROMPT_FORMAT,
        ].join('\n')
      : [
          '如果你需要修改正文，请务必额外输出一个独立区块：',
          '【修改后全文】',
          '这里放完整修改后的正文，只放正文，不要夹杂点评说明。',
          isTextAudit
            ? [
                '文本审核必须保持和原文相同的段落数量；每一段只能对应修改原文同序号段落，不要合并段落，不要拆分段落。',
                '如果认为某一整段应删除，请保留该段位置为空段，不要让后续段落前移；软件会在左右对照中显示“整段已删除”。',
                '软件会自动把审核后新增或改写的字句标成红色，请不要自行添加 HTML、Markdown 标记或颜色说明。',
              ].join('\n')
            : '',
          '【修改说明】',
          '这里再说明具体修改原因。',
          reviewMode === 'polish' ? '文笔润色只能优化表达，不要改变剧情事件、人物行动、设定信息和章节结果。' : '',
          '这样用户可以在软件中按段落对比并逐段确认替换。',
        ]
          .filter(Boolean)
          .join('\n');
    const promptText = [basePromptText, compareInstruction].filter(Boolean).join('\n\n');
    const userRequirementText = reviewAiInput.trim();
    const userText = userRequirementText ? wrapAiRequestTag(requirementTag, userRequirementText) : '';
    const chapterTitle = activeReviewChapter
      ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
      : '未选择章节';
    const detailOutlineText = activeReviewDetailOutline?.content?.trim() || '';
    const originalText = activeReviewContent.trim();
    const chapterContext = joinAiRequestSections([
      detailOutlineText
        ? wrapAiRequestTag('关联章纲', detailOutlineText, { 标题: activeReviewDetailOutline?.title || '未命名章节' })
        : '',
      wrapAiRequestTag(bodyTag, originalText, { 标题: chapterTitle, 模式: modeTitle }),
    ]);
    const requestLogMeta = [
      `模式：${modeTitle}`,
      reviewMode === 'audit' ? `审核类型：${auditSubcategory}` : '',
      `模型：${activeReviewModel?.name ?? '未选择模型'}`,
      `提示词：${activeReviewPrompt?.name ?? '未选择提示词，使用内置默认提示词'}`,
      `章节：${chapterTitle}`,
      `正文：${activeReviewWordCount} 字`,
      detailOutlineText
        ? `关联章纲：${activeReviewDetailOutline?.title ?? '未命名章节'}（${countCompactWords(detailOutlineText)} 字）`
        : '',
    ].filter(Boolean);
    const requestLog = [
      ...requestLogMeta,
      '',
      createReviewLogSection('系统提示词', promptText),
      createReviewLogSection('关联章纲', detailOutlineText || '未读取到关联章纲'),
      createReviewLogSection('原文', originalText || '暂无正文'),
      ...(userText ? [createReviewLogSection('其他要求', userText)] : []),
      createReviewLogSection('发送上下文', chapterContext),
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
    writeReviewBackgroundTaskId(settingsStorageKey, activeReviewChapter.id, requestMode, task.id);
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

  const restoreTextareaScroll = (textarea: HTMLTextAreaElement, scrollTop: number) => {
    textarea.scrollTop = scrollTop;
    setEditorScrollTop(textarea.scrollTop);
    requestAnimationFrame(() => {
      if (textareaRef.current !== textarea) return;
      textarea.scrollTop = scrollTop;
      setEditorScrollTop(textarea.scrollTop);
    });
  };

  const commitContent = useCallback(
    (next: string) => {
      if (chapter && content !== next) saveSnapshot(chapter.id, content);
      prevContentRef.current = content;
      onChangeContent(next);
    },
    [chapter, content, onChangeContent],
  );

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
    syncAssociatedCount();
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
      if (
        !chapter ||
        event.key.toLowerCase() !== 'f' ||
        !event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey
      )
        return;
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

  const normalizeEditorText = (value: string) => applyParagraphIndentToText(value, formatSettings.paragraphIndent);

  const getNormalizedCursor = (value: string, cursorPos: number) =>
    Math.max(0, Math.min(normalizeEditorText(value.slice(0, cursorPos)).length, normalizeEditorText(value).length));

  const getActiveSymbolReplaceSettings = () =>
    getStoredSymbolReplaceSettings().filter((rule) => rule.from && rule.from !== rule.to);

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
    const cursorPos =
      next === cleaned ? normalizedCursor : applySymbolReplace(cleaned.slice(0, normalizedCursor), settings).length;
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
    const rawNext = content.slice(0, start) + pastedWithIndent + content.slice(end);
    const next = normalizeEditorText(rawNext);
    const cursorPos = getNormalizedCursor(rawNext, start + pastedWithIndent.length);
    commitContentWithCursor(next, cursorPos);
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
    const insertText = formatSettings.paragraphIndent ? '\n\u3000\u3000' : '\n';
    const next = content.slice(0, start) + insertText + content.slice(end);
    commitContentWithCursor(next, start + insertText.length);
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
    showToast('已替换全文');
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

  const editorFieldSizeModal = isEditorFieldSizeOpen
    ? createPortal(
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
                <p className="mt-1 text-xs font-bold text-slate-400">
                  调整剧情审核、综合点评和更新状态相关按钮及选择框尺寸。
                </p>
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
              <div className="mb-3">
                <WorkbenchNavigationWidthToggle />
              </div>
              <div className="grid gap-3">
                {(Object.keys(EDITOR_FIELD_SIZE_DEFAULTS) as EditorFieldSizeKey[]).map((key) => {
                  const spec = editorFieldSizeSpecs[key] ?? EDITOR_FIELD_SIZE_DEFAULTS[key];
                  return (
                    <article
                      key={key}
                      className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[150px_repeat(3,minmax(0,1fr))_220px] lg:items-center"
                    >
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
                      <div
                        className="xy-floating-field xy-floating-outline-fixed xy-floating-custom-field-size xy-has-value"
                        style={getEditorFieldSizeStyle(spec)}
                      >
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
      )
    : null;

  const isEmbeddedReviewMode = embeddedMode === 'audit' || embeddedMode === 'comment' || embeddedMode === 'polish';
  const activeReviewModeTitle = REVIEW_MODE_TITLES[reviewMode];
  const showStatusUpdatePanel = embeddedMode ? embeddedMode === 'status' : isStatusUpdateOpen;
  const showReviewPanel = embeddedMode ? isEmbeddedReviewMode : isReviewOpen;
  const reviewPortalTarget = isEmbeddedReviewMode ? embeddedPortalElement : document.body;
  const canRenderReviewPanel = showReviewPanel && Boolean(reviewPortalTarget);
  const reviewManagementModalSizeClass = isEmbeddedReviewMode
    ? REVIEW_MANAGEMENT_MODAL_SIZE_CLASS
    : REVIEW_MANAGEMENT_PORTAL_MODAL_SIZE_CLASS;
  const reviewLogOutlineText = reviewRequestLog ? getReviewLogSection(reviewRequestLog, '关联章纲') : '';
  const reviewLogUserText = reviewRequestLog ? getReviewLogSection(reviewRequestLog, '其他要求') : '';
  const reviewLogFillGroupWeights = getReviewLogFillGroupWeights({
    hasOutline: Boolean(reviewLogOutlineText.trim()),
    hasUser: Boolean(reviewLogUserText.trim()),
  });
  const reviewLogModal = isReviewLogOpen ? (
    <WorkbenchModal
      title="输出日志"
      isOpen={isReviewLogOpen}
      onClose={() => setIsReviewLogOpen(false)}
      storageId="chapter_editor_review_request_log"
      widthClass="w-[min(1120px,94vw)]"
      heightClass="h-[min(820px,88vh)]"
      closeOnBackdrop={false}
    >
      <AiRequestLogModalLayout
        metaItems={[
          { id: 'chain', label: '链路', value: `作品编辑器 ${activeReviewModeTitle}` },
          { id: 'model', label: '模型', value: activeReviewModel?.name ?? '未选择模型' },
          { id: 'prompt', label: '提示词', value: activeReviewPrompt?.name ?? '默认提示词' },
          {
            id: 'chapter',
            label: '当前章节',
            value: activeReviewChapter ? `第${activeReviewChapter.serialNumber}章` : '未选择章节',
            hidden: !activeReviewChapter,
          },
          {
            id: 'outline',
            label: '关联章纲',
            value: reviewRequestLog ? `${countCompactWords(getReviewLogSection(reviewRequestLog, '关联章纲'))} 字` : '',
            valueClassName: 'text-brand',
            hidden: !reviewRequestLog || !getReviewLogSection(reviewRequestLog, '关联章纲').trim(),
          },
          {
            id: 'user',
            label: '其他要求',
            value: reviewRequestLog ? getReviewLogSection(reviewRequestLog, '其他要求') : '',
            hidden: !reviewRequestLog || !getReviewLogSection(reviewRequestLog, '其他要求').trim(),
          },
        ]}
        groups={
          reviewRequestLog
            ? [
                {
                  id: 'prompt',
                  title: '提示词',
                  meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '系统提示词'))} 字`,
                  content: getReviewLogSection(reviewRequestLog, '系统提示词'),
                },
                {
                  id: 'outline',
                  title: '关联章纲',
                  meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '关联章纲'))} 字`,
                  content: getReviewLogSection(reviewRequestLog, '关联章纲'),
                  tone: 'cyan',
                },
                {
                  id: 'original',
                  title: '原文',
                  meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '原文'))} 字`,
                  content: getReviewLogSection(reviewRequestLog, '原文'),
                  tone: 'cyan',
                },
                ...(getReviewLogSection(reviewRequestLog, '其他要求').trim()
                  ? [
                      {
                        id: 'user',
                        title: '其他要求',
                        meta: `${countCompactWords(getReviewLogSection(reviewRequestLog, '其他要求'))} 字`,
                        content: getReviewLogSection(reviewRequestLog, '其他要求'),
                        tone: 'amber' as const,
                      },
                    ]
                  : []),
              ]
            : []
        }
        fillSingleGroup
        fillGroupWeights={reviewLogFillGroupWeights}
        storageKey="chapter_editor_review_request_log_groups"
        emptyText={`还没有发送${activeReviewModeTitle}请求。`}
      />
    </WorkbenchModal>
  ) : null;

  return (
    <section className="xy-wa-editor-root flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {editorFieldSizeModal}
      {reviewLogModal}
      {isEmbeddedReviewMode && (
        <div ref={setEmbeddedPortalElement} className="min-h-0 flex-1 overflow-hidden bg-white" />
      )}
      {!embeddedMode && (
        <>
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[#e6e8ec] bg-white px-4">
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

          <div className="flex items-center gap-2 border-b border-[#e1e5eb] bg-white px-4 py-2">
            <button
              onClick={() => setIsFontSettingsOpen(true)}
              className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
            >
              字体设置
            </button>
            <div className="flex items-center overflow-hidden rounded-md border border-brand">
              <button onClick={handleSmartFormatNow} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
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
              <button
                onClick={() => setIsHighFreqOpen(true)}
                className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
              >
                自动替换
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
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
              >
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
                <button onClick={findNext} className="rounded-lg bg-brand px-3 py-1.5 text-xs text-white">
                  查找
                </button>
                <button onClick={replaceAll} className="rounded-lg border border-brand px-3 py-1.5 text-xs text-brand">
                  替换全部
                </button>
                <button
                  onClick={() => setIsFindOpen(false)}
                  className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100"
                >
                  关闭
                </button>
              </div>
            )}
            <HighlightOverlay content={content} fontSettings={fontSettings} scrollTop={editorScrollTop} />
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
                lineHeight: editorTextLineHeight,
                backgroundColor: 'transparent',
                paddingLeft: editorTextPaddingLeft,
                paddingRight: editorTextPaddingRight,
              }}
            />
          </div>

          <div className="flex min-h-[34px] items-center justify-between border-t border-[#e1e5eb] bg-[#fbfbfc] px-5 py-2 text-sm text-gray-400">
            {associatedCount > 0 && (
              <span>
                已关联 <span className="font-medium text-brand">{associatedCount}</span> 项
              </span>
            )}
            <span className="ml-auto">
              字数 <span className="font-medium text-brand">{wordCount || chapter.wordCount}</span> ·{' '}
              {lastSavedAt ? `已保存 ${lastSavedAt}` : '自动保存'}
            </span>
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

      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        onClose={() => setIsFontSettingsOpen(false)}
        settings={fontSettings}
        onChange={setFontSettings}
      />
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
      <SymbolReplaceModal isOpen={isSymbolReplaceOpen} onClose={() => setIsSymbolReplaceOpen(false)} />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        chapterId={chapter.id}
        onRestore={commitContent}
      />
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
        chapters={allChapters.map((item) => ({
          id: item.id,
          serialNumber: item.serialNumber,
          wordCount: item.wordCount,
        }))}
        onAssociate={(ids) => {
          associatedSelectionRef.current = ids.length > 0;
          setAssociatedCount(ids.length);
          window.dispatchEvent(new CustomEvent(CHAPTER_ASSOCIATE_UPDATED_EVENT));
        }}
      />
      {showStatusUpdatePanel && (
        <div
          className={
            embeddedMode === 'status'
              ? 'flex h-full min-h-0 bg-white'
              : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'
          }
          onClick={() => {
            if (!embeddedMode) setIsStatusUpdateOpen(false);
          }}
        >
          <section
            className={
              embeddedMode === 'status'
                ? 'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
                : 'flex h-[78vh] max-h-[820px] w-[min(1280px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
            }
            onClick={(event) => event.stopPropagation()}
          >
            <header
              className={`${embeddedMode ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5`}
            >
              <div>
                <h2 className="text-lg font-black text-slate-900">更新状态</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">
                  阅读前文后，把角色、宝物、势力的最新状态写入设定卡片，并记录更新到第几章。
                </p>
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
              style={{
                gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px`,
              }}
            >
              <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
                <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
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
                            style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}
                          >
                            {group.chapters.map((item) => {
                              const selected = activeStatusChapter?.id === item.id;
                              const updated = statusUpdatedChapterIds.has(item.id);
                              return (
                                <ChapterNumberButton
                                  key={item.id}
                                  onClick={() => selectStatusChapter(item.id)}
                                  title={`${updated ? '已更新状态到' : '未更新状态到'}第${item.serialNumber}章 ${item.title || ''}`}
                                  selected={selected}
                                  state={updated ? 'used' : 'empty'}
                                >
                                  {item.serialNumber}
                                </ChapterNumberButton>
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
                        {activeStatusChapter
                          ? `截至第${activeStatusChapter.serialNumber}章：${activeStatusChapter.title || '未命名章节'}`
                          : '暂无章节'}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">
                        前文预览 · {statusPreviewChapters.length}章 ·{' '}
                        <WordCountText value={statusPreviewWordCount} compact />
                      </p>
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
                    modelOptions={
                      reviewModels.length === 0
                        ? [{ value: '', label: '暂无可用模型', disabled: true }]
                        : reviewModels.map((model) => ({ value: model.id, label: model.name }))
                    }
                    promptOptions={
                      statusPrompts.length === 0
                        ? [{ value: '', label: `暂无${STATUS_PROMPT_CATEGORY}提示词`, disabled: true }]
                        : statusPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                    }
                    onModelChange={setReviewModelIdWithStorage}
                    onPromptChange={setStatusPromptId}
                    onModelManage={() => setReviewManagementModal('models')}
                    onPromptManage={() => setReviewManagementModal('prompts')}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-slate-900">状态目标</h3>
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-black text-[#08AACE]">
                    已选 {selectedStatusTargets.length}
                  </span>
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
                            selected
                              ? 'border-[#08AACE] bg-sky-50/70'
                              : 'border-slate-100 bg-slate-50 hover:border-sky-100 hover:bg-white'
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
                              <div className="mt-1 truncate text-[11px] font-bold text-slate-400">
                                {getStatusTargetLabel(entry)}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1 ${statusDraft.trim() ? 'xy-has-value' : ''}`}
                >
                  <textarea
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    placeholder="例如：主角已从高中生变为大学生，当前就读玄都大学，心态更成熟，但仍隐藏真实实力。"
                    className="editor-scrollbar text-sm leading-6 text-slate-700 outline-none"
                  />
                  <label>新的状态</label>
                  <span className="xy-floating-count">
                    <WordCountText value={countCompactWords(statusDraft)} />
                  </span>
                </div>
                <div className="mt-3 text-xs font-bold leading-5 text-slate-500">
                  保存规则：同一卡片同一章节只保留一条“更新到第 X
                  章”的状态记录；重复保存会覆盖旧状态，不会追加重复内容。
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
            data-global-modal-static="true"
            className={`flex ${REVIEW_MANAGEMENT_MODAL_SIZE_CLASS} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
            onClick={(event) => event.stopPropagation()}
          >
            {reviewManagementModal === 'prompts' ? (
              <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
                <h2 className="text-sm font-bold text-slate-900">{`${STATUS_PROMPT_CATEGORY}提示词管理`}</h2>
                <button
                  type="button"
                  onClick={() => setReviewManagementModal(null)}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  关闭
                </button>
              </header>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden">
              {reviewManagementModal === 'models' ? (
                <ModelManagePage embedded onClose={() => setReviewManagementModal(null)} />
              ) : (
                <PromptsPage initialCategory={STATUS_PROMPT_CATEGORY} />
              )}
            </div>
          </section>
        </div>
      )}
      {canRenderReviewPanel &&
        createPortal(
          <div
            className={
              isEmbeddedReviewMode
                ? 'flex h-full min-h-0 bg-white'
                : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'
            }
            style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
            onClick={() => {
              if (!embeddedMode) setIsReviewOpen(false);
            }}
          >
            <section
              data-draggable-managed="true"
              data-global-modal-static="true"
              style={
                {
                  ...(embeddedMode ? {} : reviewModalDraggable.style),
                  WebkitAppRegion: 'no-drag',
                } as CSSProperties
              }
              className={
                isEmbeddedReviewMode
                  ? 'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
                  : 'relative flex h-[min(720px,82vh)] w-[min(1180px,92vw)] max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
              }
              onClick={(event) => event.stopPropagation()}
            >
              <header
                className={`${embeddedMode ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5 ${embeddedMode ? '' : 'cursor-move'}`}
                {...(embeddedMode ? {} : reviewModalDraggable.dragHandleProps)}
                style={
                  {
                    touchAction: embeddedMode ? undefined : 'none',
                    WebkitAppRegion: 'no-drag',
                  } as CSSProperties
                }
              >
                <div>
                  <h2 className="text-lg font-black text-slate-900">{activeReviewModeTitle}</h2>
                  <p className="mt-0.5 text-xs font-bold text-slate-400">
                    左侧选择章节，中间预览正文，右侧配置 AI {activeReviewModeTitle}参数。
                  </p>
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
                style={{
                  gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px`,
                }}
              >
                <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
                  <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
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
                              style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}
                            >
                              {group.chapters.map((item) => {
                                const selected = activeReviewChapter?.id === item.id;
                                const polished =
                                  reviewMode === 'polish'
                                    ? isChapterContentPolished(settingsStorageKey, item.id, getChapterContent(item.id))
                                    : false;
                                return (
                                  <ChapterNumberButton
                                    key={item.id}
                                    onClick={() => selectReviewChapter(item.id)}
                                    title={`第${item.serialNumber}章 ${item.title || '未命名章节'} · ${item.wordCount}字${reviewMode === 'polish' ? ` · ${polished ? '已润色' : '未润色'}` : ''}`}
                                    selected={selected}
                                    state="empty"
                                    showAlertDot={reviewMode === 'polish' && !polished}
                                  >
                                    {item.serialNumber}
                                  </ChapterNumberButton>
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
                <main className="min-h-0 bg-white">
                  <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
                    <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-slate-900">
                          {activeReviewChapter
                            ? `第${activeReviewChapter.serialNumber}章 ${activeReviewChapter.title || '未命名章节'}`
                            : '暂无章节'}
                        </h3>
                        <p className="mt-0.5 text-xs font-bold text-slate-400">
                          正文预览
                          {' · '}
                          <WordCountText value={activeReviewWordCount} compact />
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {canShowReviewOutline ? (
                          <button
                            type="button"
                            onClick={() => setReviewOutlineVisibilityWithBalancedColumns(!showReviewOutline)}
                            className={`h-8 rounded-lg border px-3 text-xs font-black transition-colors ${
                              showReviewOutline
                                ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#078fb0]'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-[#9BEFFC] hover:text-[#078fb0]'
                            }`}
                          >
                            {showReviewOutline ? '隐藏章纲' : '显示章纲'}
                          </button>
                        ) : null}
                        <div className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-[#9BEFFC] bg-white text-xs font-black">
                          {[['locked', '等宽锁定'] as const, ['free', '自由调节'] as const].map(([mode, label]) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setReviewPreviewWidthModeWithStorage(mode)}
                              className={`px-3 transition-colors ${
                                reviewPreviewWidthMode === mode
                                  ? 'bg-[#EAF9FD] text-[#078fb0]'
                                  : 'text-slate-500 hover:bg-[#F5FCFE] hover:text-[#078fb0]'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <FontSizeStepper
                          value={reviewPreviewFontSize}
                          min={REVIEW_PREVIEW_MIN_FONT_SIZE}
                          max={REVIEW_PREVIEW_MAX_FONT_SIZE}
                          ariaLabel="审核原文字号"
                          onChange={setReviewPreviewFontSizeWithStorage}
                          className="shrink-0"
                        />
                      </div>
                    </div>
                    <div
                      ref={reviewPreviewGridRef}
                      className="grid min-h-0 flex-1"
                      style={{ gridTemplateColumns: reviewPreviewGridTemplateColumns }}
                    >
                      {effectiveShowReviewOutline ? (
                        <section className="flex min-h-0 flex-col bg-white">
                          <span className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
                            {activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 章纲` : '章纲'}
                          </span>
                          <div
                            className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'outline' ? 'scrollbar-active' : ''}`}
                            onScroll={() => handleReviewPreviewScroll('outline')}
                            style={{ fontSize: reviewPreviewFontSize }}
                          >
                            {activeReviewDetailOutlineText ? (
                              <pre className="whitespace-pre-wrap break-words font-sans">
                                {activeReviewDetailOutlineText}
                              </pre>
                            ) : (
                              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                                {activeReviewChapter
                                  ? `未找到第${activeReviewChapter.serialNumber}章章纲。`
                                  : '未选择章节，无法读取章纲。'}
                              </div>
                            )}
                          </div>
                        </section>
                      ) : null}
                      {effectiveShowReviewOutline ? reviewPreviewOutlineResizeHandle : null}
                      <section className="flex min-h-0 flex-col bg-white">
                        <span className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
                          {reviewPreviewOriginalTitle}
                        </span>
                        <div
                          ref={reviewOriginalPreviewPaneRef}
                          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'original' ? 'scrollbar-active' : ''}`}
                          onScroll={() => handleReviewPreviewScroll('original')}
                          style={{ fontSize: reviewPreviewFontSize }}
                        >
                          {reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">
                              这里会显示所选章节正文。
                            </div>
                          ) : (
                            <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                              {reviewOriginalParagraphs.map((paragraph, index) => {
                                const selected = activeReviewParagraphIndex === index;
                                const shouldShowTextAuditDiff = isAuditTextReview && Boolean(auditRevisedText.trim());
                                return (
                                  <button
                                    ref={(node) => {
                                      reviewOriginalParagraphRefs.current[index] = node;
                                    }}
                                    key={`${index}-${paragraph.slice(0, 18)}`}
                                    type="button"
                                    onClick={() => selectReviewPreviewParagraph(index)}
                                    className={`relative block w-full text-left outline-none ${
                                      REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS
                                    } ${
                                      selected
                                        ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS
                                        : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS
                                    }`}
                                    style={{ fontSize: reviewPreviewFontSize }}
                                  >
                                    <span className="block whitespace-pre-wrap break-words">
                                      {shouldShowTextAuditDiff
                                        ? renderTextAuditOriginalDiff(paragraph, auditRevisedParagraphs[index])
                                        : paragraph}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </section>
                      {reviewPreviewTextColumnSeparator}
                      <section className="flex min-h-0 flex-col bg-white">
                        <div className="flex h-[33px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-[#EAF9FD] px-4">
                          <span className="text-xs font-black text-[#078fb0]">{reviewPreviewAnnotationTitle}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">
                            {reviewMode === 'polish'
                              ? `${polishPreviewText.trim() ? countCompactWords(polishPreviewText) : 0} 字`
                              : isAuditTextReview
                                ? `${auditRevisedText.trim() ? countCompactWords(auditRevisedText) : 0} 字`
                                : `${reviewAnnotations.length} 条`}
                          </span>
                        </div>
                        <div
                          ref={reviewAnnotationPreviewPaneRef}
                          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-700 ${activeReviewPreviewScrollPane === 'annotation' ? 'scrollbar-active' : ''}`}
                          onScroll={() => handleReviewPreviewScroll('annotation')}
                          style={{ fontSize: reviewPreviewFontSize }}
                        >
                          {reviewMode === 'polish' ? (
                            !polishPreviewText.trim() ? (
                              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                                文笔润色后内容会显示在这里。
                              </div>
                            ) : (
                              <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                                {polishPreviewParagraphs.map((paragraph, index) => (
                                  <p
                                    key={`${index}-${paragraph.slice(0, 18)}`}
                                    className={`whitespace-pre-wrap break-words ${
                                      REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS
                                    } ${REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS}`}
                                    style={{ fontSize: reviewPreviewFontSize }}
                                  >
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            )
                          ) : !reviewAiOutput.trim() && !isAuditStructureReview ? (
                            <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                              {activeReviewModeTitle}后内容会显示在这里。
                            </div>
                          ) : isAuditTextReview ? (
                            !auditRevisedText.trim() ? (
                              <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold leading-6 text-slate-300">
                                未识别到【修改后全文】，请让 AI 按文本审核格式输出修改后正文。
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div
                                  className={`sticky top-0 z-10 rounded-lg border px-3 py-2 text-xs font-black ${
                                    auditParagraphCountMatches
                                      ? 'border-cyan-200 bg-[#EAF9FD] text-[#078fb0]'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  原文 {reviewOriginalParagraphs.length} 段 / 审核后 {auditRevisedParagraphs.length} 段
                                  / {auditParagraphCountMatches ? '段落一致' : '段落不一致，请让 AI 按原文段落重写'}
                                </div>
                                <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                                  {Array.from({
                                    length: Math.max(reviewOriginalParagraphs.length, auditRevisedParagraphs.length),
                                  }).map((_, index) => {
                                    const originalParagraph = reviewOriginalParagraphs[index];
                                    const revisedParagraph = auditRevisedParagraphs[index];
                                    return (
                                      <div
                                        key={`${index}-${(revisedParagraph ?? originalParagraph ?? '').slice(0, 18)}`}
                                        className={`grid grid-cols-[2rem_minmax(0,1fr)] gap-2 ${
                                          REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS
                                        } ${
                                          originalParagraph !== undefined
                                            ? REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS
                                            : 'border-amber-300 bg-amber-50/40 text-amber-800'
                                        }`}
                                        style={{ fontSize: reviewPreviewFontSize }}
                                      >
                                        <span
                                          className="pt-0.5 text-right text-[11px] font-black leading-7 text-slate-400"
                                          aria-label={`第 ${index + 1} 段`}
                                        >
                                          {index + 1}
                                        </span>
                                        <div className="min-w-0 whitespace-pre-wrap break-words">
                                          {renderTextAuditRevisedDiff(originalParagraph, revisedParagraph)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          ) : isAuditStructureReview ? (
                            <div className="space-y-3">
                              <div
                                className={`rounded-xl border px-4 py-3 ${
                                  auditOutputPassed
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                }`}
                              >
                                <div className="text-sm font-black">
                                  {auditOutputPassed ? '通过' : '待确认 / 需处理'}
                                </div>
                                <div className="mt-1 text-xs font-bold">
                                  {auditOutputPassed ? 'AI 剧情审核结论为通过。' : '请查看下方审核元素和 AI 说明。'}
                                </div>
                              </div>
                              <div className="grid gap-2">
                                {AUDIT_STRUCTURE_CHECK_ITEMS.map((item) => {
                                  const itemStatus = getAuditStructureItemStatus(reviewAiOutput, item);
                                  const outlineFitPercent =
                                    item === AUDIT_OUTLINE_FIT_ITEM ? getAuditOutlineFitPercent(reviewAiOutput) : null;
                                  const itemStatusLabel =
                                    outlineFitPercent !== null
                                      ? `${outlineFitPercent}%`
                                      : itemStatus === 'passed'
                                        ? '通过'
                                        : itemStatus === 'failed'
                                          ? '不通过'
                                          : '待核对';
                                  const expanded = expandedAuditStructureItems.has(item);
                                  const itemDetail = getAuditStructureItemDetail(reviewAiOutput, item);
                                  return (
                                    <div
                                      key={item}
                                      className={`overflow-hidden rounded-lg border text-sm font-bold ${
                                        itemStatus === 'passed'
                                          ? 'border-emerald-100 bg-white text-emerald-700'
                                          : itemStatus === 'failed'
                                            ? 'border-red-100 bg-red-50 text-red-700'
                                            : 'border-slate-200 bg-white text-slate-600'
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => toggleAuditStructureItem(item)}
                                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                                        aria-expanded={expanded}
                                      >
                                        <span className="flex min-w-0 items-center gap-2">
                                          <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : '-rotate-90'}`}
                                          />
                                          <span className="min-w-0 truncate">{item}</span>
                                        </span>
                                        <span
                                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${
                                            itemStatus === 'passed'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : itemStatus === 'failed'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-slate-100 text-slate-500'
                                          }`}
                                        >
                                          {itemStatusLabel}
                                        </span>
                                      </button>
                                      {expanded ? (
                                        <div className="space-y-2 border-t border-current/10 px-4 pb-3 pt-2 text-xs font-bold leading-6 text-slate-600">
                                          <div>
                                            <div className="mb-0.5 text-[11px] font-black text-slate-400">说明</div>
                                            <div className="whitespace-pre-wrap break-words">
                                              {itemDetail.description || '暂无说明。'}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="mb-0.5 text-[11px] font-black text-slate-400">建议</div>
                                            <div className="whitespace-pre-wrap break-words">
                                              {itemDetail.suggestion || '暂无建议。'}
                                            </div>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : reviewOriginalParagraphs.length === 0 || !activeReviewContent.trim() ? (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">
                              这里会显示带 AI 标注的正文。
                            </div>
                          ) : (
                            <div className={REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}>
                              {reviewOriginalParagraphs.map((paragraph, index) => {
                                const paragraphAnnotations = reviewAnnotationsByParagraph.get(index) ?? [];
                                const selected = activeReviewParagraphIndex === index;
                                return (
                                  <div
                                    ref={(node) => {
                                      reviewAnnotationRefs.current[index] = node;
                                    }}
                                    key={`${index}-${paragraph.slice(0, 18)}`}
                                    className={`${REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS} ${
                                      selected
                                        ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS
                                        : paragraphAnnotations.length > 0
                                          ? 'border-amber-300 bg-amber-50/30'
                                          : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS
                                    }`}
                                  >
                                    <p
                                      className="whitespace-pre-wrap break-words"
                                      style={{ fontSize: reviewPreviewFontSize }}
                                    >
                                      {renderAnnotatedReviewParagraph(paragraph, paragraphAnnotations)}
                                    </p>
                                    {paragraphAnnotations.length > 0 ? (
                                      <div className={`${getReviewAnnotationNoteSpacingClass(paragraph)} space-y-2`}>
                                        {paragraphAnnotations.map((annotation) => (
                                          <div
                                            key={annotation.id}
                                            className={`rounded-lg border px-3 py-2 text-xs font-bold leading-5 ${getReviewSeverityClass(annotation.severity)}`}
                                          >
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="font-black">{annotation.id}</span>
                                              <span>{annotation.severity}</span>
                                              <span>{annotation.type}</span>
                                              <span>{annotation.action}</span>
                                            </div>
                                            {annotation.problem ? (
                                              <div className="mt-1">问题：{annotation.problem}</div>
                                            ) : null}
                                            {annotation.suggestion ? (
                                              <div className="mt-1">建议：{annotation.suggestion}</div>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </main>
                {reviewRightResizeHandle}
                <aside className="relative flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
                  {showInlineFieldSizeButton ? (
                    <div className="flex shrink-0 items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditorFieldSizeOpen(true)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition-colors hover:border-[#08AACE] hover:text-[#078fb0]"
                      >
                        设置
                      </button>
                    </div>
                  ) : null}
                  <div className={`${showInlineFieldSizeButton ? 'mt-3' : ''} flex min-h-0 flex-1 flex-col`}>
                    <CombinedAiConfigSelect
                      style={getEmbeddedEditorFieldStyle('reviewModelSelect')}
                      modelValue={reviewModelId}
                      promptValue={activeReviewPromptId}
                      modelOptions={
                        reviewModels.length === 0
                          ? [{ value: '', label: '暂无可用模型', disabled: true }]
                          : reviewModels.map((model) => ({ value: model.id, label: model.name }))
                      }
                      promptOptions={
                        activeReviewPromptOptions.length === 0
                          ? [{ value: '', label: '无', disabled: true }]
                          : activeReviewPromptOptions
                      }
                      onModelChange={setReviewModelIdWithStorage}
                      onPromptChange={handleActiveReviewPromptChange}
                      onModelManage={() => setReviewManagementModal('models')}
                      onPromptManage={() => setReviewManagementModal('prompts')}
                    />
                    <div className="relative mt-3 min-h-0 flex-1">
                      <div className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 z-40 flex items-center gap-2 px-1">
                        <button
                          type="button"
                          onClick={clearReviewAiOutput}
                          className="text-xs font-black text-red-500 hover:text-red-600"
                        >
                          清空
                        </button>
                      </div>
                      <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value">
                        <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-slate-700">
                          {reviewAiOutput.trim() ? (
                            renderAiThinkingContent(reviewAiOutput)
                          ) : (
                            <span className="flex h-full items-center justify-center px-5 text-center font-bold text-slate-400">
                              发送后，AI 思考过程和文字输出会显示在这里；中间“{reviewPreviewAnnotationTitle}
                              ”框同步显示审核结果。
                            </span>
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
                  {reviewManagementModal && (
                    <div
                      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/35 px-6 py-6"
                      onClick={() => setReviewManagementModal(null)}
                    >
                      <section
                        data-global-modal-static="true"
                        className={`flex ${reviewManagementModalSizeClass} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {reviewManagementModal === 'prompts' ? (
                          <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
                            <h2 className="text-sm font-bold text-slate-900">{`${activeReviewModeTitle}提示词管理`}</h2>
                            <button
                              type="button"
                              onClick={() => setReviewManagementModal(null)}
                              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                              关闭
                            </button>
                          </header>
                        ) : null}
                        <div className="min-h-0 flex-1 overflow-hidden">
                          {reviewManagementModal === 'models' ? (
                            <ModelManagePage embedded onClose={() => setReviewManagementModal(null)} />
                          ) : (
                            <PromptsPage initialCategory={activeReviewPromptCategory} />
                          )}
                        </div>
                      </section>
                    </div>
                  )}
                </aside>
              </div>
              <div
                data-no-modal-drag="true"
                {...reviewModalDraggable.getResizeHandleProps('top')}
                className={`${embeddedMode ? 'hidden' : ''} absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize`}
              />
              <div
                data-no-modal-drag="true"
                {...reviewModalDraggable.getResizeHandleProps('bottom')}
                className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize`}
              />
              <div
                data-no-modal-drag="true"
                {...reviewModalDraggable.getResizeHandleProps('left')}
                className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize`}
              />
              <div
                data-no-modal-drag="true"
                {...reviewModalDraggable.getResizeHandleProps('right')}
                className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize`}
              />
              <div
                data-no-modal-drag="true"
                {...reviewModalDraggable.resizeHandleProps}
                className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize`}
              >
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
