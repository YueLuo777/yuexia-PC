import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Library,
  Link2,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';

import { BrowserWorkspace } from '@/features/script-editor/components/BrowserWorkspace';
import {
  readScriptLinkedNovelId,
  writeScriptLinkedNovelId,
} from '@/features/script-editor/model/scriptLinkedNovelStorage';
import { useMaterials } from '@/features/materials/hooks/useMaterials';
import type { MaterialItem } from '@/features/materials/model/materialTypes';
import { WorkbenchAIPanel } from '@/features/workbench/components/WorkbenchAIPanel';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import type { Chapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { loadNavConfig, normalizeNavConfig, type NavGroupConfig } from '@/shared/navigation/navConfig';

export type EditorMode = 'dual' | 'script' | 'browser';
export type MaterialFilterType = 'novel' | 'script' | 'all';

export const MIN_WIDTH = 150;
export const GROUP_SIZE = 50;
export const FULL_WIDTH = 9999;
export const EDITOR_MODE_KEY = 'xinyuexia_script_editor_mode';
export const WIDTH_STORAGE_KEYS: Record<EditorMode, string> = {
  dual: 'xinyuexia_script_editor_widths_dual',
  script: 'xinyuexia_script_editor_widths_script',
  browser: 'xinyuexia_script_editor_widths_browser',
};
export const AI_COLLAPSED_KEYS: Record<EditorMode, string> = {
  dual: 'xinyuexia_script_editor_ai_collapsed_dual',
  script: 'xinyuexia_script_editor_ai_collapsed_script',
  browser: 'xinyuexia_script_editor_ai_collapsed_browser',
};
export const MODE_LABELS: Record<EditorMode, string> = {
  dual: '小说对照编辑',
  script: '纯剧本编辑',
  browser: '浏览器编辑',
};

export function countText(text: string) {
  return text.replace(/\s/g, '').length;
}

export function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getVolumeChapterLabel(volumeName: string, chapter: Pick<Chapter, 'serialNumber' | 'title'>) {
  if (volumeName === '集纲') {
    return chapter.title || `集纲${chapter.serialNumber}`;
  }
  return `第${chapter.serialNumber}集${chapter.title ? ` ${chapter.title}` : ''}`;
}

export function normalizeEditorContent(text: string) {
  const lines = text.split('\n');
  return lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (index === 0 || lines[index - 1].trim() === '') {
        return line.startsWith('　　') ? line : `　　${trimmed}`;
      }
      return trimmed;
    })
    .join('\n');
}

export function AreaHeader({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div className="script-editor-area-header flex h-10 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3">
      <span className="script-editor-area-title text-sm font-bold text-blue-600">{label}</span>
      {extra}
    </div>
  );
}

export function ResizeHandle({ onMouseDown }: { onMouseDown: (event: ReactMouseEvent) => void }) {
  return (
    <div
      data-no-modal-drag="true"
      onMouseDown={onMouseDown}
      className="group z-10 flex w-[6px] shrink-0 cursor-ew-resize items-center justify-center bg-transparent"
    >
      <div className="h-8 w-px rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
    </div>
  );
}

export function LinkNovelModal({
  isOpen,
  novels,
  onClose,
  onLink,
}: {
  isOpen: boolean;
  novels: WorkbenchNovel[];
  onClose: () => void;
  onLink: (novelId: number) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-[440px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-bold text-gray-900">关联小说</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {novels.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">当前没有可关联的小说作品</p>
          ) : (
            <div className="space-y-1">
              {novels.map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => onLink(novel.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{novel.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{novel.category || '未分类'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScriptEditorQuickNav({
  isOpen,
  navConfig,
  currentPath,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  navConfig: NavGroupConfig[];
  currentPath: string;
  onOpen: () => void;
  onClose: () => void;
}) {
  const visibleGroups = navConfig
    .filter((group) => !group.hidden)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.hidden),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="absolute left-0 top-1/2 z-40 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-brand-light hover:text-brand"
        title="打开导航栏"
        aria-label="打开导航栏"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex bg-black/10" onMouseDown={onClose}>
          <aside
            className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[12px_0_36px_rgba(15,23,42,0.16)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="text-base font-bold text-slate-900">快速导航</div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="收起导航栏"
                aria-label="收起导航栏"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </header>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {visibleGroups.map((group) => (
                <section key={group.title} className="mb-4">
                  <div className="mb-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPath === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          className={`block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                            isActive
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

export function ScriptEditorArea({
  width,
  volumeName,
  chapter,
  content,
  aiCollapsed,
  showAiToggle,
  onToggleAI,
  onChangeContent,
  onRenameChapter,
  onDeleteChapter,
}: {
  width: number;
  volumeName: string | null;
  chapter: Chapter | null;
  content: string;
  aiCollapsed: boolean;
  showAiToggle: boolean;
  onToggleAI: () => void;
  onChangeContent: (content: string) => void;
  onRenameChapter: (title: string) => void;
  onDeleteChapter: () => void;
}) {
  const [fontSize, setFontSize] = useState(() =>
    Number(localStorage.getItem('xinyuexia_script_editor_font_size') ?? 16),
  );
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('xinyuexia_script_editor_font_size', String(fontSize));
  }, [fontSize]);

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
      setIsFindOpen(true);
    };
    window.addEventListener('keydown', handleFindShortcut, true);
    return () => window.removeEventListener('keydown', handleFindShortcut, true);
  }, [chapter]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
  }, [content]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${content.slice(0, start)}\n　　${content.slice(end)}`;
      onChangeContent(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 3;
      });
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const lines = pasted.split('\n');
    const shouldIndentFirstLine = !before.trim() || before.endsWith('\n');
    const nextLines = lines.map((line, index) => (shouldIndentFirstLine && index === 0 ? `　　${line}` : line));
    const next = `${before}${nextLines.join('\n')}${after}`;
    onChangeContent(next);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + nextLines.join('\n').length;
    });
  };

  const findNext = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionEnd : 0;
    let index = content.indexOf(findText, start);
    if (index < 0) index = content.indexOf(findText);
    if (index < 0) return;
    textarea?.focus();
    textarea?.setSelectionRange(index, index + findText.length);
  };

  if (!chapter) {
    return (
      <section className="flex min-w-0 flex-col overflow-hidden bg-white" style={{ width }}>
        <AreaHeader label="剧本编辑区" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-gray-400">
            <PenLine className="mx-auto mb-2 h-10 w-10 text-gray-200" />
            <p className="text-sm">请选择一个剧本章节开始编辑</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-col overflow-hidden bg-white" style={{ width }}>
      <AreaHeader
        label="剧本编辑区"
        extra={
          showAiToggle ? (
            <button
              onClick={onToggleAI}
              className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {aiCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              <span>{aiCollapsed ? '展开 AI' : '收起 AI'}</span>
            </button>
          ) : undefined
        }
      />
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{volumeName || '-'}</span>
        <input
          value={chapter.title}
          onChange={(event) => onRenameChapter(event.target.value)}
          placeholder={volumeName === '集纲' ? `集纲${chapter.serialNumber}` : `第${chapter.serialNumber}集标题`}
          className="min-w-0 flex-1 rounded border border-transparent px-2 py-1 text-sm font-medium text-gray-800 outline-none focus:border-brand focus:bg-brand-light/20"
        />
        <span className="text-xs text-gray-400">{countText(content)} 字</span>
      </div>
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-gray-100 px-3">
        <FontSizeStepper value={fontSize} min={12} max={24} onChange={setFontSize} ariaLabel="剧本编辑器字号" />
        <button
          onClick={() => onChangeContent(normalizeEditorContent(content))}
          className="rounded border border-brand px-2 py-0.5 text-xs text-brand transition-colors hover:bg-brand-light"
        >
          智能排版
        </button>
        <button
          onClick={() => void handleCopy()}
          className="rounded border border-brand px-2 py-0.5 text-xs text-brand transition-colors hover:bg-brand-light"
        >
          一键复制
        </button>
        <button
          onClick={onDeleteChapter}
          className="rounded border border-red-500 px-2 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-50"
        >
          删除
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {isFindOpen && (
          <div className="absolute right-5 top-4 z-30 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <input
              value={findText}
              onChange={(event) => setFindText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') findNext();
              }}
              placeholder="查找"
              className="h-8 w-40 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:border-brand"
            />
            <button onClick={findNext} className="rounded-lg bg-brand px-3 py-1.5 text-xs text-white">
              查找
            </button>
            <button
              onClick={() => setIsFindOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100"
            >
              关闭
            </button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => onChangeContent(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="开始编写剧本..."
          spellCheck={false}
          className="h-full w-full resize-none p-4 outline-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            color: '#1f2937',
          }}
        />
      </div>
      <div className="flex h-9 shrink-0 items-center border-t border-gray-100 bg-white px-3 text-xs text-gray-400">
        字数 <span className="ml-1 font-medium text-brand">{countText(content)}</span>
      </div>
    </section>
  );
}

export function NovelPreviewArea({
  width,
  linkedNovelId,
  linkedNovel,
  linkedVolumes,
  selectedChapterId,
  onSaveContent,
}: {
  width: number;
  linkedNovelId: number | null;
  linkedNovel: WorkbenchNovel | null;
  linkedVolumes: Volume[];
  selectedChapterId: number | null;
  onSaveContent: (novelId: number, chapterId: number, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const selectedChapter = useMemo(() => {
    for (const volume of linkedVolumes) {
      const chapter = volume.chapters.find((item) => item.id === selectedChapterId);
      if (chapter) {
        return { volumeName: volume.name, chapter };
      }
    }
    return null;
  }, [linkedVolumes, selectedChapterId]);

  const previewContent = useMemo(() => {
    if (!linkedNovelId || !selectedChapterId) return '';
    return readChapterContent(linkedNovelId, selectedChapterId);
  }, [linkedNovelId, selectedChapterId]);

  useEffect(() => {
    setDraftContent(previewContent);
    setIsEditing(false);
    setSaveStatus('');
  }, [previewContent, selectedChapterId]);

  const handleSave = () => {
    if (!linkedNovelId || !selectedChapterId) return;
    onSaveContent(linkedNovelId, selectedChapterId, draftContent);
    setIsEditing(false);
    setSaveStatus('已保存');
    window.setTimeout(() => setSaveStatus(''), 1600);
  };

  return (
    <section className="flex shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white" style={{ width }}>
      <AreaHeader
        label="小说预览区"
        extra={
          linkedNovel && selectedChapter ? (
            <div className="flex items-center gap-2">
              {saveStatus && <span className="text-xs font-medium text-brand">{saveStatus}</span>}
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="rounded-md bg-brand px-3 py-1 text-xs font-bold text-white hover:bg-brand-dark"
              >
                {isEditing ? '保存' : '编辑'}
              </button>
            </div>
          ) : undefined
        }
      />
      {!linkedNovel ? (
        <div className="flex-1" />
      ) : (
        <>
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3">
            {selectedChapter ? (
              <>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  第{selectedChapter.chapter.serialNumber}章
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                  {selectedChapter.chapter.title || selectedChapter.volumeName}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">请从右侧小说目录选择章节</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {isEditing ? (
              <textarea
                value={draftContent}
                onChange={(event) => setDraftContent(event.target.value)}
                className="editor-scrollbar h-full min-h-[240px] w-full resize-none rounded-lg border border-brand/40 bg-white p-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
              />
            ) : previewContent ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{previewContent}</p>
            ) : (
              <p className="py-8 text-center text-xs text-gray-300">
                {selectedChapter ? '当前章节暂无正文内容' : '点击右侧章节编号查看正文'}
              </p>
            )}
          </div>
          <div className="flex h-9 shrink-0 items-center border-t border-gray-100 bg-white px-3 text-xs text-gray-400">
            字数{' '}
            <span className="ml-1 font-medium text-brand">{countText(isEditing ? draftContent : previewContent)}</span>
          </div>
        </>
      )}
    </section>
  );
}
