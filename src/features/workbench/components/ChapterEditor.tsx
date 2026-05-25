import {
  ChevronDown,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import {
  ChapterAssociateModal,
  FontSettingsModal,
  HighFreqModal,
  HighFreqToggle,
  HighlightOverlay,
  HistoryModal,
  PARAGRAPH_INDENT,
  SmartFormatModal,
  SymbolReplaceModal,
  SymbolReplaceToggle,
  TitleOptimizeModal,
  applyFormat,
  applySymbolReplace,
  getStoredFormatSettings,
  getStoredFontSettings,
  getStoredSymbolReplaceSettings,
  isSymbolReplaceEnabled,
  normalizeParagraphIndents,
  saveSnapshot,
  stripLineIndents,
  type FormatOptions,
  type FontSettings,
} from '@/features/workbench/components/EditorToolModals';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface ChapterEditorProps {
  chapter: Chapter | null;
  volumeName: string | null;
  content: string;
  lastSavedAt: string | null;
  allChapters: Chapter[];
  onRenameChapter: (chapterId: number, title: string) => void;
  onChangeContent: (content: string) => void;
  onUpdateSerialNumber: (chapterId: number, serialNumber: number) => void;
  onDeleteChapter: (chapterId: number) => void;
  onOpenFind: () => void;
}

function getParagraphIndentInfo(text: string, cursorPos: number) {
  const safePos = Math.max(0, Math.min(cursorPos, text.length));
  const lineStart = text.lastIndexOf('\n', Math.max(0, safePos - 1)) + 1;
  const nextLineBreak = text.indexOf('\n', lineStart);
  const lineEnd = nextLineBreak >= 0 ? nextLineBreak : text.length;
  const lineIndentEnd = lineStart + PARAGRAPH_INDENT.length;
  const hasIndent = text.slice(lineStart, lineIndentEnd) === PARAGRAPH_INDENT;
  const lineBody = hasIndent ? text.slice(lineIndentEnd, lineEnd) : text.slice(lineStart, lineEnd);
  return {
    lineStart,
    lineEnd,
    lineIndentEnd,
    hasIndent,
    isBlankAfterIndent: hasIndent && !lineBody.trim(),
  };
}

function clampEditableCursor(cursorPos: number, text: string, paragraphIndent: boolean) {
  if (!paragraphIndent) return Math.max(0, Math.min(cursorPos, text.length));
  const safePos = Math.max(0, Math.min(cursorPos, text.length));
  const { lineStart, lineIndentEnd, hasIndent } = getParagraphIndentInfo(text, safePos);
  if (!hasIndent) return safePos;
  if (safePos >= lineStart && safePos < lineIndentEnd) return Math.min(lineIndentEnd, text.length);
  return safePos;
}

export function ChapterEditor({
  chapter,
  volumeName,
  content,
  lastSavedAt,
  allChapters,
  onRenameChapter,
  onChangeContent,
  onUpdateSerialNumber,
  onDeleteChapter,
  onOpenFind,
}: ChapterEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isSmartFormatOpen, setIsSmartFormatOpen] = useState(false);
  const [isHighFreqOpen, setIsHighFreqOpen] = useState(false);
  const [isSymbolReplaceOpen, setIsSymbolReplaceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTitleOptimizeOpen, setIsTitleOptimizeOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [fontSettings, setFontSettings] = useState<FontSettings>(getStoredFontSettings);
  const [formatSettings, setFormatSettings] = useState<FormatOptions>(getStoredFormatSettings);
  const [copyToast, setCopyToast] = useState('');
  const [associatedCount, setAssociatedCount] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem('xinyuexia_associated_chapters') ?? '[]') as number[]).length;
    } catch {
      return 0;
    }
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevContentRef = useRef('');
  const pendingCursorRef = useRef<{ text: string; cursorPos: number; scrollTop: number } | null>(null);

  const titleCount = chapter?.title.length ?? 0;
  const serialValue = chapter?.serialNumber ?? 1;
  const safeVolumeName = volumeName ?? '第一卷';
  const wordCount = useMemo(() => content.replace(/\s/g, '').length, [content]);
  const visualIndentEnabled = formatSettings.indent && !formatSettings.paragraphIndent;

  const showToast = (text: string) => setCopyToast(text);
  const restoreTextareaScroll = (textarea: HTMLTextAreaElement, scrollTop: number) => {
    textarea.scrollTop = scrollTop;
    setEditorScrollTop(textarea.scrollTop);
    requestAnimationFrame(() => {
      if (textareaRef.current !== textarea) return;
      textarea.scrollTop = scrollTop;
      setEditorScrollTop(textarea.scrollTop);
    });
  };

  const commitContent = (next: string) => {
    if (chapter && content !== next) saveSnapshot(chapter.id, content);
    prevContentRef.current = content;
    onChangeContent(next);
  };

  const commitContentWithCursor = (next: string, cursorPos: number) => {
    const scrollTop = textareaRef.current?.scrollTop ?? editorScrollTop;
    pendingCursorRef.current = { text: next, cursorPos, scrollTop };
    if (next !== content) commitContent(next);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (textarea.value !== next && next !== content) return;
      const safeCursor = clampEditableCursor(
        Math.min(cursorPos, textarea.value.length),
        textarea.value,
        formatSettings.paragraphIndent,
      );
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
      const safeCursor = clampEditableCursor(
        Math.min(pending.cursorPos, textarea.value.length),
        textarea.value,
        formatSettings.paragraphIndent,
      );
      textarea.setSelectionRange(safeCursor, safeCursor);
      restoreTextareaScroll(textarea, pending.scrollTop);
      pendingCursorRef.current = null;
    };

    if (textarea.value === pending.text) {
      applyCursor();
      return;
    }
    requestAnimationFrame(applyCursor);
  }, [content, formatSettings.paragraphIndent]);

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
    prevContentRef.current = content;
  }, [chapter?.id]);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(''), 1600);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  useEffect(() => {
    if (!visualIndentEnabled) return;
    const cleaned = stripLineIndents(content);
    if (cleaned !== content) onChangeContent(cleaned);
  }, [content, onChangeContent, visualIndentEnabled]);

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
  }, [chapter, content, onChangeContent]);

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

  const normalizeEditorText = (value: string) => (
    formatSettings.paragraphIndent ? normalizeParagraphIndents(value) : stripLineIndents(value)
  );

  const getParagraphIndentRange = (text: string, cursorPos: number) => {
    return getParagraphIndentInfo(text, cursorPos);
  };

  const clampCursorToEditableText = (cursorPos: number, text = content) => {
    return clampEditableCursor(cursorPos, text, formatSettings.paragraphIndent);
  };

  const getNormalizedCursor = (value: string, cursorPos: number) => (
    clampCursorToEditableText(normalizeEditorText(value.slice(0, cursorPos)).length, normalizeEditorText(value))
  );

  const getActiveSymbolReplaceSettings = () => (
    getStoredSymbolReplaceSettings().filter((rule) => rule.from && rule.from !== rule.to)
  );

  const keepCursorOutOfParagraphIndent = () => {
    if (!formatSettings.paragraphIndent) return;
    const textarea = textareaRef.current;
    if (!textarea || textarea.selectionStart !== textarea.selectionEnd) return;
    const safeCursor = clampCursorToEditableText(textarea.selectionStart);
    if (safeCursor === textarea.selectionStart) return;
    requestAnimationFrame(() => {
      textarea.setSelectionRange(safeCursor, safeCursor);
    });
  };

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
    const start = clampCursorToEditableText(target.selectionStart);
    const end = clampCursorToEditableText(target.selectionEnd);
    const cleanedPaste = formatSettings.paragraphIndent ? normalizeParagraphIndents(pasted) : stripLineIndents(pasted);
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
      if (formatSettings.paragraphIndent) {
        const { lineStart, lineIndentEnd, hasIndent } = getParagraphIndentRange(currentText, start);
        if (event.key === 'Backspace' && hasIndent && start === lineIndentEnd && lineStart > 0) {
          event.preventDefault();
          const next = currentText.slice(0, lineStart - 1) + currentText.slice(lineIndentEnd);
          commitContentWithCursor(next, lineStart - 1);
          return;
        }

        if (event.key === 'Delete' && currentText[start] === '\n') {
          const nextLine = getParagraphIndentRange(currentText, start + 1);
          if (nextLine.hasIndent && nextLine.lineStart === start + 1) {
            event.preventDefault();
            const next = currentText.slice(0, start) + currentText.slice(nextLine.lineIndentEnd);
            commitContentWithCursor(next, start);
            return;
          }
        }

        const shouldProtectBackspace = event.key === 'Backspace' && hasIndent && start > lineStart && start < lineIndentEnd;
        const shouldProtectDelete = event.key === 'Delete' && hasIndent && start >= lineStart && start < lineIndentEnd;
        if (shouldProtectBackspace || shouldProtectDelete) {
          event.preventDefault();
          const safeCursor = Math.min(lineIndentEnd, currentText.length);
          textareaRef.current?.setSelectionRange(safeCursor, safeCursor);
          return;
        }
      }
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const lineBreak = formatSettings.paragraphIndent ? `\n${PARAGRAPH_INDENT}` : '\n';
    const next = content.slice(0, start) + lineBreak + content.slice(end);
    commitContentWithCursor(next, start + lineBreak.length);
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

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gray-50">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm">
          <span className="font-medium text-gray-700">{safeVolumeName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <span className="text-gray-300">·</span>
        <div className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm">
          <span className="font-medium text-gray-700">第</span>
          <input
            type="text"
            inputMode="numeric"
            value={serialValue}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              if (Number.isFinite(next) && next > 0) onUpdateSerialNumber(chapter.id, next);
            }}
            className="w-8 bg-transparent p-0 text-center font-medium text-gray-700 outline-none"
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
          className="w-[320px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-brand"
        />
        <span className="text-xs text-gray-400">{titleCount}/20</span>
        <button
          onClick={() => void copyText(chapter.title, '已复制标题')}
          className="rounded-md border border-brand px-3 py-1.5 text-sm text-brand transition-colors hover:bg-brand-light"
        >
          复制标题
        </button>
        <button
          onClick={() => setIsTitleOptimizeOpen(true)}
          className="rounded-md bg-brand px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark"
        >
          标题优化
        </button>
        {['正文续写', '审核点评', '更新状态'].map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-md bg-brand px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
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
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center overflow-hidden rounded-md border border-brand">
          <button onClick={() => setIsHighFreqOpen(true)} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
            高频词
          </button>
          <div className="h-4 w-px bg-brand/30" />
          <HighFreqToggle />
        </div>
        <div className="flex items-center overflow-hidden rounded-md border border-brand">
          <button onClick={handleSymbolReplaceNow} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">
            一键替换
          </button>
          <div className="h-4 w-px bg-brand/30" />
          <button
            onClick={() => setIsSymbolReplaceOpen(true)}
            className="flex h-[31px] w-9 items-center justify-center text-brand hover:bg-brand-light"
            title="一键替换设置"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-brand/30" />
          <SymbolReplaceToggle onEnable={handleSymbolAutoEnabled} />
        </div>
        <div className="mx-1 h-5 w-px bg-gray-200" />
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
      </div>

      <div className="relative flex-1 bg-white">
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
        <HighlightOverlay content={content} fontSettings={fontSettings} scrollTop={editorScrollTop} />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onKeyUp={keepCursorOutOfParagraphIndent}
          onMouseUp={keepCursorOutOfParagraphIndent}
          onPaste={handlePaste}
          onSelect={keepCursorOutOfParagraphIndent}
          onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}
          className="editor-scrollbar relative z-10 h-full w-full resize-none border-0 bg-transparent px-6 pb-6 pt-2 outline-none"
          placeholder="从这里开始写..."
          style={{
            fontFamily: fontSettings.fontFamily,
            color: fontSettings.fontColor,
            caretColor: fontSettings.fontColor,
            fontSize: `${fontSettings.fontSize}px`,
            lineHeight: fontSettings.lineHeight,
            textIndent: visualIndentEnabled ? '2em' : undefined,
          }}
        />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="absolute bottom-4 right-4 z-20 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-50"
        >
          删除
        </button>
      </div>

      <div className="flex min-h-[39px] items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-sm text-gray-400">
        <span>字数 <span className="font-medium text-brand">{wordCount || chapter.wordCount}</span> · {lastSavedAt ? `已保存 ${lastSavedAt}` : '自动保存'}</span>
        {associatedCount > 0 && <span>已关联 <span className="font-medium text-brand">{associatedCount}</span> 章</span>}
      </div>

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
          setAssociatedCount(ids.length);
          window.dispatchEvent(new CustomEvent('chapter_associate_updated'));
        }}
      />
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
