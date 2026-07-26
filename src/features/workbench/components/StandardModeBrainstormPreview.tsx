import { type FocusEvent, type KeyboardEvent } from 'react';

import { WorkbenchNameField } from '@/features/workbench/components/WorkbenchNameField';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import {
  getBrainstormTitleFieldCharacterWidth,
  type StandardBrainstormVersion,
} from '@/features/workbench/model/standardModeBrainstormModel';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';

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
    <section className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-2.5 border-r border-[#dce1e8] bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <WorkbenchNameField
          label="脑洞名"
          value={activeVersion?.title ?? ''}
          placeholder="请输入脑洞名称"
          width={titleFieldWidth}
          disabled={!activeVersion || busy}
          onValueChange={onTitleChange}
          onBlur={handleTitleBlur}
        />
        <button
          type="button"
          onClick={onDelete}
          disabled={!activeVersion || busy}
          className="h-9 shrink-0 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
        >
          删除该脑洞
        </button>
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCopy}
          disabled={!content.trim()}
          className="h-9 rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-semibold text-[#657180] hover:border-[#8fd8e7] hover:text-[#078FAB] disabled:cursor-not-allowed disabled:text-[#b8c0ca]"
        >
          复制脑洞
        </button>
      </div>

      <div className="space-y-2.5">
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
          className="xy-brainstorm-ai-input"
        />

        {notice && (
          <div className="text-xs font-medium text-[#7b8794]" role="status">
            {notice}
          </div>
        )}
      </div>
    </section>
  );
}
