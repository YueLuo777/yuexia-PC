import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
} from 'react';

import {
  applyFormat,
  applyParagraphIndentToText,
  applySymbolReplace,
  getStoredFormatSettings,
  getStoredSymbolReplaceSettings,
  isSymbolReplaceEnabled,
  saveSnapshot,
  stripLineIndents,
  type FormatOptions,
} from '@/features/workbench/components/EditorToolModals';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';

interface UseChapterEditorInputOptions {
  chapter: Chapter | null;
  content: string;
  formatSettings: FormatOptions;
  findText: string;
  replaceText: string;
  onChangeContent: (content: string) => void;
  onOpenFind: () => void;
  onToast: (text: string) => void;
  setIsSymbolReplaceOpen: Dispatch<SetStateAction<boolean>>;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
}

export function useChapterEditorInput({
  chapter,
  content,
  formatSettings,
  findText,
  replaceText,
  onChangeContent,
  onOpenFind,
  onToast,
  setIsSymbolReplaceOpen,
  setShowDeleteConfirm,
}: UseChapterEditorInputOptions) {
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevContentRef = useRef('');
  const pendingCursorRef = useRef<{ text: string; cursorPos: number; scrollTop: number } | null>(null);
  const activeChapterId = chapter?.id ?? null;

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
    prevContentRef.current = content;
  }, [activeChapterId, content]);

  useEffect(() => {
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (!chapter) return;
      if (action.detail?.id === 'delete_chapter') {
        setShowDeleteConfirm(true);
      } else if (action.detail?.id === 'smart_format') {
        commitContent(applyFormat(content, getStoredFormatSettings()));
        onToast('已自动排版');
      } else if (action.detail?.id === 'save_chapter') {
        onChangeContent(content);
        onToast('已保存');
      }
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
  }, [chapter, commitContent, content, onChangeContent, onToast, setShowDeleteConfirm]);

  useEffect(() => {
    const handleFindShortcut = (event: globalThis.KeyboardEvent) => {
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

  const normalizeEditorText = (value: string) => applyParagraphIndentToText(value, formatSettings.paragraphIndent);
  const getNormalizedCursor = (value: string, cursorPos: number) =>
    Math.max(0, Math.min(normalizeEditorText(value.slice(0, cursorPos)).length, normalizeEditorText(value).length));
  const getActiveSymbolReplaceSettings = () =>
    getStoredSymbolReplaceSettings().filter((rule) => rule.from && rule.from !== rule.to);

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
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

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
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
      onToast(message);
    } catch {
      onToast('复制失败');
    }
  };

  const findNext = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionEnd : 0;
    let index = content.indexOf(findText, start);
    if (index < 0) index = content.indexOf(findText);
    if (index < 0) {
      onToast('未找到匹配内容');
      return;
    }
    textarea?.focus();
    textarea?.setSelectionRange(index, index + findText.length);
  };

  const replaceAll = () => {
    if (!findText) return;
    if (!content.includes(findText)) {
      onToast('未找到匹配内容');
      return;
    }
    commitContent(content.split(findText).join(replaceText));
    onToast('已替换全文');
  };

  const handleSmartFormatNow = () => {
    commitContent(applyFormat(content, getStoredFormatSettings()));
    onToast('已自动排版');
  };

  const handleSymbolReplaceNow = () => {
    const settings = getActiveSymbolReplaceSettings();
    if (settings.length === 0) {
      onToast('请先设置文字替换规则');
      setIsSymbolReplaceOpen(true);
      return;
    }
    const next = applySymbolReplace(content, settings);
    if (next === content) {
      onToast('当前章节没有可替换内容');
      return;
    }
    const cursor = textareaRef.current?.selectionStart ?? 0;
    const nextCursor = applySymbolReplace(content.slice(0, cursor), settings).length;
    commitContentWithCursor(next, nextCursor);
    onToast('已替换当前章节');
  };

  const handleSymbolAutoEnabled = () => {
    const settings = getActiveSymbolReplaceSettings();
    if (settings.length === 0) {
      onToast('已开启自动文字替换，请先添加规则');
      return;
    }
    const next = applySymbolReplace(content, settings);
    if (next !== content) {
      const cursor = textareaRef.current?.selectionStart ?? 0;
      const nextCursor = applySymbolReplace(content.slice(0, cursor), settings).length;
      commitContentWithCursor(next, nextCursor);
      onToast('已按规则替换当前章节');
      return;
    }
    onToast('已开启自动文字替换');
  };

  return {
    textareaRef,
    editorScrollTop,
    setEditorScrollTop,
    commitContent,
    handleContentChange,
    handlePaste,
    handleKeyDown,
    copyText,
    findNext,
    replaceAll,
    handleSmartFormatNow,
    handleSymbolReplaceNow,
    handleSymbolAutoEnabled,
  };
}
