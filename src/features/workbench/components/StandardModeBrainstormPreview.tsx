import type { FocusEvent, KeyboardEvent } from 'react';

import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import {
  BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
  BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
} from '@/features/workbench/components/workbenchBrainstormState';
import {
  getBrainstormTitleFieldCharacterWidth,
  type StandardBrainstormVersion,
} from '@/features/workbench/model/standardModeBrainstormModel';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

interface StandardModeBrainstormPreviewProps {
  activeVersion: StandardBrainstormVersion | null;
  revisionInput: string;
  revisionSourceContent: string | null;
  revisionDraft: string;
  notice: string;
  isRevising: boolean;
  busy: boolean;
  previewFontSize: number;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onContentChange: (content: string) => void;
  onRevisionInputChange: (value: string) => void;
  onRevisionDraftChange: (value: string) => void;
  onRevise: () => void;
  onApplyRevision: () => void;
  onDiscardRevision: () => void;
  onStop: () => void;
  onCopy: () => void;
  onSave: () => void;
  onPreviewFontSizeChange: (value: number) => void;
  generationMode: boolean;
}

export function StandardModeBrainstormPreview({
  activeVersion,
  revisionInput,
  revisionSourceContent,
  revisionDraft,
  notice,
  isRevising,
  busy,
  previewFontSize,
  onTitleChange,
  onTitleBlur,
  onContentChange,
  onRevisionInputChange,
  onRevisionDraftChange,
  onRevise,
  onApplyRevision,
  onDiscardRevision,
  onStop,
  onCopy,
  onSave,
  onPreviewFontSizeChange,
  generationMode,
}: StandardModeBrainstormPreviewProps) {
  const content = activeVersion?.content ?? '';
  const handleRevisionKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onRevise();
    }
  };
  const handleTitleBlur = (_event?: FocusEvent<HTMLInputElement>) => onTitleBlur();
  const titleFieldWidth = getBrainstormTitleFieldCharacterWidth(activeVersion?.title ?? '') * 16 + 52;

  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-3 border-r border-[#dce1e8] bg-white p-4" data-standard-brainstorm-preview="true">
      <div className="flex min-w-0 shrink-0 items-end gap-3">
        <label
          className="block"
          style={{ flexBasis: titleFieldWidth, width: titleFieldWidth, minWidth: titleFieldWidth, maxWidth: titleFieldWidth }}
          data-brainstorm-title-field="true"
        >
          <span className="mb-2 block text-sm font-bold text-[#657180]">脑洞名</span>
          <input
            aria-label="脑洞名"
            value={activeVersion?.title ?? ''}
            placeholder="请输入脑洞名称"
            disabled={!activeVersion || busy}
            onChange={(event) => onTitleChange(event.target.value)}
            onBlur={handleTitleBlur}
            className="h-9 w-full rounded-md border border-[#BFC8D2] bg-white px-3 text-sm font-semibold text-[#1f2933] outline-none placeholder:text-[#9aa3af] focus:border-[#0799B8] disabled:text-[#657180]"
          />
        </label>
      </div>

      <div className="flex h-8 shrink-0 items-center justify-between" data-brainstorm-preview-toolbar="true">
        <span className="text-sm font-bold text-[#657180]">脑洞预览</span>
        <FontSizeStepper
          value={previewFontSize}
          min={BRAINSTORM_PREVIEW_MIN_FONT_SIZE}
          max={BRAINSTORM_PREVIEW_MAX_FONT_SIZE}
          onChange={onPreviewFontSizeChange}
          ariaLabel="脑洞预览字号"
          className="shrink-0"
        />
      </div>

      {revisionSourceContent !== null ? (
        <section className="flex min-h-[300px] flex-1 flex-col" data-brainstorm-revision-comparison="true">
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
            <label className="flex min-h-0 min-w-0 flex-col">
              <span className="mb-2 text-xs font-bold text-[#657180]">原脑洞</span>
              <span className="relative min-h-0 flex-1">
                <textarea
                  value={revisionSourceContent}
                  readOnly
                  aria-label="修改前脑洞"
                  style={{ fontSize: previewFontSize }}
                  className="editor-scrollbar h-full w-full resize-none rounded-md border border-[#BFC8D2] bg-[#F7F8FA] px-3 py-2.5 pb-8 text-[15px] font-medium leading-7 text-[#334155] outline-none"
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-semibold text-[#7b8794]">
                  {countTextWords(revisionSourceContent)}字
                </span>
              </span>
            </label>
            <label className="flex min-h-0 min-w-0 flex-col">
              <span className="mb-2 text-xs font-bold text-[#078FAB]">AI修改后</span>
              <span className="relative min-h-0 flex-1">
                <textarea
                  value={revisionDraft}
                  onChange={(event) => onRevisionDraftChange(event.target.value)}
                  placeholder={isRevising ? 'AI正在输出修改后的脑洞' : '等待AI输出修改结果'}
                  aria-label="AI修改后脑洞"
                  style={{ fontSize: previewFontSize }}
                  className="editor-scrollbar h-full w-full resize-none rounded-md border border-[#63C6D9] bg-white px-3 py-2.5 pb-8 text-[15px] font-medium leading-7 text-[#334155] outline-none placeholder:text-sm placeholder:text-[#9aa3af] focus:border-[#0799B8]"
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-semibold text-[#08AACE]">
                  {countTextWords(revisionDraft)}字
                </span>
              </span>
            </label>
          </div>
          <div className="mt-3 flex shrink-0 justify-end gap-2">
            <button
              type="button"
              onClick={onDiscardRevision}
              disabled={isRevising}
              className="h-9 rounded-md border border-[#BFC8D2] bg-white px-4 text-sm font-semibold text-[#657180] hover:border-[#63C6D9] disabled:cursor-not-allowed disabled:text-[#b8c0ca]"
            >
              保留原脑洞
            </button>
            <button
              type="button"
              onClick={onApplyRevision}
              disabled={isRevising || !revisionDraft.trim()}
              className="h-9 rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white hover:bg-[#0797b8] disabled:cursor-not-allowed disabled:bg-[#b9dce4]"
            >
              应用修改
            </button>
          </div>
        </section>
      ) : (
        <label className="flex min-h-[300px] flex-1 flex-col" data-brainstorm-preview-field="true">
          <div className="relative min-h-0 flex-1">
            <textarea
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              placeholder="选择左侧脑洞查看内容，或在右侧生成新的脑洞"
              className="editor-scrollbar h-full w-full resize-none rounded-md border border-[#BFC8D2] bg-white px-3 py-2.5 pb-8 text-[15px] font-medium leading-7 text-[#334155] outline-none placeholder:text-sm placeholder:text-[#9aa3af] focus:border-[#0799B8]"
              aria-label="脑洞预览内容"
              style={{ fontSize: previewFontSize }}
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-semibold text-[#08AACE]">
              {countTextWords(content)}字
            </span>
          </div>
        </label>
      )}

      <div className="shrink-0" data-brainstorm-revision-field="professional-inline-input">
        <AiInlineInput
          value={revisionInput}
          onChange={(event) => onRevisionInputChange(event.target.value)}
          onKeyDown={handleRevisionKeyDown}
          onSend={onRevise}
          onStop={onStop}
          sendDisabled={busy || !content.trim() || !revisionInput.trim()}
          stopDisabled={!isRevising}
          sendLabel="发送修改要求"
          stopLabel="停止修改"
          label="请输入要求"
          placeholder="请输入要求"
          aria-label="脑洞修改要求"
          className="xy-brainstorm-ai-input"
        />
        {generationMode ? (
          <div
            className="mt-2 flex justify-end gap-2"
            data-brainstorm-generation-actions="inline-under-revision-input"
          >
            <button
              type="button"
              onClick={onCopy}
              disabled={!content.trim()}
              className="h-9 rounded-md border border-[#BFC8D2] bg-white px-4 text-sm font-semibold text-[#657180] disabled:text-[#b8c0ca]"
            >
              复制脑洞
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!content.trim() || busy}
              className="h-9 rounded-md border border-[#0799B8] bg-[#08AACE] px-5 text-sm font-bold text-white disabled:border-[#A8D3DD] disabled:bg-[#b9dce4]"
            >
              保存脑洞
            </button>
          </div>
        ) : null}
        {notice ? <p className="mt-2 truncate text-xs font-medium text-[#7b8794]" role="status">{notice}</p> : null}
      </div>
    </section>
  );
}
