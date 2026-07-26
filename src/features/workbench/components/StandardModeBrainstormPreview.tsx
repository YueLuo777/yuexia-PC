import { useState, type FocusEvent, type KeyboardEvent } from 'react';

import { WorkbenchNameField } from '@/features/workbench/components/WorkbenchNameField';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import {
  getBrainstormTitleFieldCharacterWidth,
  type StandardBrainstormVersion,
} from '@/features/workbench/model/standardModeBrainstormModel';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface StandardModeBrainstormPreviewProps {
  activeVersion: StandardBrainstormVersion | null;
  revisionInput: string;
  notice: string;
  isRevising: boolean;
  busy: boolean;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onContentChange: (content: string) => void;
  onRevisionInputChange: (value: string) => void;
  onRevise: () => void;
  onStop: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onSave: () => void;
  generationMode: boolean;
}

export function StandardModeBrainstormPreview({
  activeVersion,
  revisionInput,
  notice,
  isRevising,
  busy,
  onTitleChange,
  onTitleBlur,
  onContentChange,
  onRevisionInputChange,
  onRevise,
  onStop,
  onDelete,
  onCopy,
  onSave,
  generationMode,
}: StandardModeBrainstormPreviewProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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
    <section className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(260px,1fr)_150px_auto] gap-2.5 border-r border-[#dce1e8] bg-white p-4">
      <div className="flex min-w-0 items-start gap-3">
        <WorkbenchNameField
          label="脑洞名"
          value={activeVersion?.title ?? ''}
          placeholder="请输入脑洞名称"
          width={titleFieldWidth}
          disabled={!activeVersion || busy}
          onValueChange={onTitleChange}
          onBlur={handleTitleBlur}
        />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!generationMode ? (
            <button
              type="button"
              onClick={onCopy}
              disabled={!content.trim()}
              className="h-9 rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-semibold text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB] disabled:cursor-not-allowed disabled:text-[#b8c0ca]"
            >
              复制脑洞
            </button>
          ) : null}
          {!generationMode ? (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={!activeVersion || busy}
              className="h-9 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
            >
              删除该脑洞
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-0">
        <div
          className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count h-full min-h-0 ${
            content.trim() ? 'xy-has-value' : ''
          }`}
        >
          <textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="点击左侧脑洞查看内容，或在右侧生成新的脑洞"
            className="editor-scrollbar text-[15px] font-medium leading-7 text-[#334155]"
            aria-label="脑洞预览内容"
          />
          <label className="xy-border-embedded-transparent-backplate">脑洞预览</label>
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-semibold text-[#08AACE]">
            {countTextWords(content)}字
          </span>
        </div>
      </div>

      <div className="min-h-0 space-y-2.5">
        <AiInlineInput
          value={revisionInput}
          onChange={(event) => onRevisionInputChange(event.target.value)}
          onKeyDown={handleRevisionKeyDown}
          onSend={onRevise}
          onStop={onStop}
          sendDisabled={busy || !content.trim() || !revisionInput.trim()}
          stopDisabled={!isRevising}
          label="修改要求"
          placeholder="输入你希望这个脑洞怎样修改"
          aria-label="脑洞修改要求"
          className="xy-brainstorm-ai-input min-h-[140px]"
          textareaClassName="editor-scrollbar min-h-[120px] resize-none text-sm font-medium leading-6"
          rows={5}
        />

        {notice && (
          <div className="text-xs font-medium text-[#7b8794]" role="status">
            {notice}
          </div>
        )}
      </div>

      {generationMode ? (
        <div className="flex justify-end gap-2 border-t border-[#edf0f3] pt-2.5">
          <button
            type="button"
            onClick={onCopy}
            disabled={!content.trim()}
            className="h-9 rounded-md border border-[#dce1e8] bg-white px-4 text-sm font-semibold text-[#657180] disabled:text-[#b8c0ca]"
          >
            复制脑洞
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!content.trim() || busy}
            className="h-9 rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white disabled:bg-[#b9dce4]"
          >
            保存脑洞
          </button>
        </div>
      ) : <div />}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="删除这个脑洞？"
        description="删除后会移入脑洞回收站，并自动显示下一个脑洞。"
        confirmText="确认删除"
        cancelText="取消"
        confirmVariant="danger"
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          onDelete();
        }}
      />
    </section>
  );
}
