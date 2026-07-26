import { Settings } from 'lucide-react';
import { useState } from 'react';
import type {
  ChangeEvent,
  ClipboardEvent,
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from 'react';

import {
  HighFreqToggle,
  HighlightOverlay,
  SymbolReplaceToggle,
  stripLineIndents,
  type FontSettings,
} from '@/features/workbench/components/EditorToolModals';
import type { WorkbenchSaveStatus } from '@/features/workbench/model/workbenchSaveStatus';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';

import { ChapterSaveStatus } from './ChapterSaveStatus';
import { SPLIT_BUTTON_OUTLINE_ACTION_CLASS, SPLIT_BUTTON_OUTLINE_GROUP_CLASS } from './chapterEditorLayout';

interface ChapterWritingSurfaceProps {
  standardMode?: boolean;
  chapter: Chapter;
  safeVolumeName: string;
  serialValue: number;
  titleCount: number;
  content: string;
  wordCount: number;
  saveStatus: WorkbenchSaveStatus;
  lastSavedAt: string | null;
  associatedCount: number;
  isFindOpen: boolean;
  findText: string;
  replaceText: string;
  fontSettings: FontSettings;
  editorScrollTop: number;
  editorGridLineStyle: CSSProperties;
  editorTextLineHeight: string | number;
  editorTextPaddingLeft: string;
  editorTextPaddingRight: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setFindText: Dispatch<SetStateAction<string>>;
  setReplaceText: Dispatch<SetStateAction<string>>;
  setIsFindOpen: Dispatch<SetStateAction<boolean>>;
  setEditorScrollTop: Dispatch<SetStateAction<number>>;
  onUpdateSerialNumber: (chapterId: number, serialNumber: number) => void;
  onRenameChapter: (chapterId: number, title: string) => void;
  copyText: (text: string, message: string) => Promise<void>;
  openTitleOptimize: () => void;
  openFontSettings: () => void;
  handleSmartFormatNow: () => void;
  openSmartFormatSettings: () => void;
  openHighFreqSettings: () => void;
  handleSymbolReplaceNow: () => void;
  handleSymbolAutoEnabled: () => void;
  openSymbolReplaceSettings: () => void;
  openHistory: () => void;
  onOpenFind: () => void;
  openDeleteConfirm: () => void;
  findNext: () => void;
  replaceAll: () => void;
  handleContentChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  handlePaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRetrySave: () => void;
}

export function ChapterWritingSurface({
  standardMode = false,
  chapter,
  safeVolumeName,
  serialValue,
  titleCount,
  content,
  wordCount,
  saveStatus,
  lastSavedAt,
  associatedCount,
  isFindOpen,
  findText,
  replaceText,
  fontSettings,
  editorScrollTop,
  editorGridLineStyle,
  editorTextLineHeight,
  editorTextPaddingLeft,
  editorTextPaddingRight,
  textareaRef,
  setFindText,
  setReplaceText,
  setIsFindOpen,
  setEditorScrollTop,
  onUpdateSerialNumber,
  onRenameChapter,
  copyText,
  openTitleOptimize,
  openFontSettings,
  handleSmartFormatNow,
  openSmartFormatSettings,
  openHighFreqSettings,
  handleSymbolReplaceNow,
  handleSymbolAutoEnabled,
  openSymbolReplaceSettings,
  onRetrySave,
  openHistory,
  onOpenFind,
  openDeleteConfirm,
  findNext,
  replaceAll,
  handleContentChange,
  handleKeyDown,
  handlePaste,
}: ChapterWritingSurfaceProps) {
  const [advancedToolsOpen, setAdvancedToolsOpen] = useState(false);
  const runAdvancedAction = (action: () => void) => {
    setAdvancedToolsOpen(false);
    action();
  };
  return (
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
            onClick={openTitleOptimize}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap bg-brand px-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            优化
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#e1e5eb] bg-white px-4 py-2">
        {standardMode ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAdvancedToolsOpen((open) => !open)}
              aria-expanded={advancedToolsOpen}
              className="rounded-md border border-brand px-4 py-1.5 text-sm font-semibold text-brand hover:bg-brand-light"
            >
              更多
            </button>
            {advancedToolsOpen ? (
              <div className="absolute left-0 top-[calc(100%+6px)] z-40 grid w-32 overflow-hidden rounded-md border border-[#dce1e8] bg-white p-1 shadow-lg">
                <button type="button" onClick={() => runAdvancedAction(openFontSettings)} className="h-8 rounded px-2 text-left text-sm text-[#657180] hover:bg-[#f3f6f8]">字体设置</button>
                <button type="button" onClick={() => runAdvancedAction(handleSmartFormatNow)} className="h-8 rounded px-2 text-left text-sm text-[#657180] hover:bg-[#f3f6f8]">智能排版</button>
                <button type="button" onClick={() => runAdvancedAction(openHighFreqSettings)} className="h-8 rounded px-2 text-left text-sm text-[#657180] hover:bg-[#f3f6f8]">词语高亮</button>
                <button type="button" onClick={() => runAdvancedAction(handleSymbolReplaceNow)} className="h-8 rounded px-2 text-left text-sm text-[#657180] hover:bg-[#f3f6f8]">文字替换</button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button onClick={openFontSettings} className="xy-chapter-editor-deep-outline rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light">字体设置</button>
            <div className="xy-chapter-editor-deep-outline flex items-center overflow-hidden rounded-md border border-brand">
              <button onClick={handleSmartFormatNow} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">智能排版</button>
              <div className="xy-chapter-editor-deep-divider xy-chapter-editor-deep-divider-line h-4 w-px bg-brand/30" />
              <button onClick={openSmartFormatSettings} className="px-2 py-1.5 text-brand hover:bg-brand-light" title="智能排版设置"><Settings className="h-4 w-4 text-brand" /></button>
            </div>
            <div className="xy-chapter-editor-deep-outline flex items-center overflow-hidden rounded-md border border-brand">
              <button onClick={openHighFreqSettings} className="px-3 py-1.5 text-sm text-brand hover:bg-brand-light">词语高亮</button>
              <div className="xy-chapter-editor-deep-divider xy-chapter-editor-deep-divider-line h-4 w-px bg-brand/30" />
              <HighFreqToggle />
            </div>
            <div className={SPLIT_BUTTON_OUTLINE_GROUP_CLASS}>
              <button onClick={handleSymbolReplaceNow} className={SPLIT_BUTTON_OUTLINE_ACTION_CLASS}>文字替换</button>
              <div className="xy-chapter-editor-deep-divider inline-flex items-center border-l border-brand/30"><SymbolReplaceToggle onEnable={handleSymbolAutoEnabled} /></div>
              <button type="button" onClick={openSymbolReplaceSettings} className="xy-chapter-editor-deep-divider inline-flex w-9 items-center justify-center border-l border-brand/30 text-brand transition-colors hover:bg-brand-light" title="词语替换设置" aria-label="词语替换设置"><Settings className="h-4 w-4" /></button>
            </div>
          </>
        )}
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => void copyText(stripLineIndents(content), '已复制正文')}
            className="xy-chapter-editor-deep-outline rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
          >
            复制正文
          </button>
          <button
            onClick={openHistory}
            className="xy-chapter-editor-deep-outline rounded-md border border-brand px-3 py-1.5 text-sm text-brand hover:bg-brand-light"
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
            onClick={openDeleteConfirm}
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
          <ChapterSaveStatus status={saveStatus} lastSavedAt={lastSavedAt} onRetry={onRetrySave} />
        </span>
      </div>
    </>
  );
}
