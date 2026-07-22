import type { CSSProperties, ReactNode } from 'react';

import type { ModelItem } from '@/features/models/model/modelTypes';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { LinkedSourceControl } from '@/shared/ui/LinkedSourceControl';
import { WordCountText } from '@/shared/ui/WordCountText';

import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';
import { renderAiChatContent } from './workbenchLibraryRequestLog';
import { stripAiThinkingBlock } from './workbenchLibraryAiText';

interface WorkbenchOutlineAiPanelProps {
  configStyle: CSSProperties;
  modelId: string;
  promptId: string;
  models: ModelItem[];
  prompts: PromptItem[];
  promptCategory: string;
  onModelChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onManageModels: () => void;
  onManagePrompts: () => void;
  outlinePreviewDraft: string;
  onOutlinePreviewDraftChange: (value: string) => void;
  outlineDraftFrameTitle: string;
  outlineDraftCountLeft: string;
  outlinePreviewDraftContent: string;
  shouldShowOutlineDraftWordCount: boolean;
  detailOutlineFontSize: number;
  isDetailOutlineTab: boolean;
  onActivateFont: () => void;
  clearButton: ReactNode;
  selectedDetailOutlineReaderCount: number;
  detailOutlineReaderWordCount: number;
  openDetailOutlineReader: () => void;
  clearDetailOutlineReaderSelection: () => void;
  outlineAiInput: string;
  setOutlineAiInput: (value: string) => void;
  sendOutlineAiMessage: () => void | Promise<void>;
  stopOutlineAiMessage: () => void;
  isLoading: boolean;
  saveOutlinePreviewDraft: () => void;
  undoDetailOutlineReplacement: () => void;
  canUndoDetailOutlineReplacement: boolean;
}

export function WorkbenchOutlineAiPanel({
  configStyle,
  modelId,
  promptId,
  models,
  prompts,
  promptCategory,
  onModelChange,
  onPromptChange,
  onManageModels,
  onManagePrompts,
  outlinePreviewDraft,
  onOutlinePreviewDraftChange,
  outlineDraftFrameTitle,
  outlineDraftCountLeft,
  outlinePreviewDraftContent,
  shouldShowOutlineDraftWordCount,
  detailOutlineFontSize,
  isDetailOutlineTab,
  onActivateFont,
  clearButton,
  selectedDetailOutlineReaderCount,
  detailOutlineReaderWordCount,
  openDetailOutlineReader,
  clearDetailOutlineReaderSelection,
  outlineAiInput,
  setOutlineAiInput,
  sendOutlineAiMessage,
  stopOutlineAiMessage,
  isLoading,
  saveOutlinePreviewDraft,
  undoDetailOutlineReplacement,
  canUndoDetailOutlineReplacement,
}: WorkbenchOutlineAiPanelProps) {
  const cleanDraft = stripAiThinkingBlock(outlinePreviewDraft);
  const fontStyle = isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined;
  return (
    <aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
      <div className="shrink-0 space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2 text-sm text-gray-500">
          <CombinedAiConfigSelect
            style={configStyle}
            modelValue={modelId}
            promptValue={promptId}
            modelOptions={
              models.length === 0
                ? [{ value: '', label: '暂无可用模型', disabled: true }]
                : models.map((model) => ({ value: model.id, label: model.name }))
            }
            promptOptions={
              prompts.length === 0
                ? [{ value: '', label: `暂无${promptCategory}提示词`, disabled: true }]
                : prompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
            }
            onModelChange={onModelChange}
            onPromptChange={onPromptChange}
            onModelManage={onManageModels}
            onPromptManage={onManagePrompts}
          />
        </div>
      </div>
      <div className="xy-ai-panel-output-slot relative">
        {outlinePreviewDraft.startsWith('[[THINKING') ? (
          <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-with-bottom-count h-full xy-has-value">
            <div
              className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-gray-600"
              onMouseDown={() => {
                if (isDetailOutlineTab) onActivateFont();
              }}
              style={fontStyle}
            >
              {renderAiChatContent(outlinePreviewDraft)}
            </div>
            <label>{outlineDraftFrameTitle}</label>
            {shouldShowOutlineDraftWordCount && (
              <span
                className="xy-floating-count xy-floating-count-top-left"
                style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}
              >
                <WordCountText value={countTextWords(outlinePreviewDraftContent)} />
              </span>
            )}
            {clearButton}
          </div>
        ) : (
          <div
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full ${outlinePreviewDraft.trim() ? 'xy-has-value' : ''}`}
          >
            <textarea
              data-no-modal-drag="true"
              value={outlinePreviewDraft}
              onFocus={() => onActivateFont()}
              onChange={(event) => onOutlinePreviewDraftChange(event.target.value)}
              placeholder={
                isDetailOutlineTab
                    ? '生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。'
                    : '生成后的梗概会显示在这里，也可以手动编辑后保存。'
              }
              className="editor-scrollbar text-sm leading-6 text-gray-700 outline-none placeholder:text-slate-500 placeholder:font-semibold"
              style={fontStyle}
            />
            <label>{outlineDraftFrameTitle}</label>
            {shouldShowOutlineDraftWordCount && (
              <span
                className="xy-floating-count xy-floating-count-top-left"
                style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}
              >
                <WordCountText value={countTextWords(outlinePreviewDraftContent)} />
              </span>
            )}
            {clearButton}
          </div>
        )}
      </div>
      {isDetailOutlineTab && (
        <LinkedSourceControl
          linked={selectedDetailOutlineReaderCount > 0}
          label="大纲"
          linkedLabel="已关联大纲"
          prefixLabel="关联"
          onOpen={openDetailOutlineReader}
          onClear={clearDetailOutlineReaderSelection}
          clearOnLinkedClick
          meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}
          className="xy-ai-panel-link-row flex items-center gap-2"
          groupClassName="flex h-10 w-[134px] shrink-0 overflow-hidden rounded-xl border border-[#08AACE] bg-white shadow-sm"
          prefixClassName="grid w-12 shrink-0 place-items-center border-r border-[#08AACE]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]"
          buttonClassName="min-w-0 flex-1 whitespace-nowrap bg-white px-3 text-sm font-bold text-slate-600 hover:bg-[#E9FAFD]"
          linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap bg-[#08AACE] px-3 text-sm font-black text-white hover:bg-[#0796B8]"
        />
      )}
      <div className="xy-ai-panel-input-row">
        <AiInlineInput
          value={outlineAiInput}
          onChange={(event) => {
            setOutlineAiInput(event.target.value);
            resizeFloatingAiTextarea(event.currentTarget);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void sendOutlineAiMessage();
            }
          }}
          onSend={() => void sendOutlineAiMessage()}
          onStop={stopOutlineAiMessage}
          sendDisabled={
                isLoading ||
                (!outlineAiInput.trim() && (!isDetailOutlineTab || selectedDetailOutlineReaderCount === 0))
              }
          stopDisabled={!isLoading}
          label="请输入要求"
          textareaClassName="editor-scrollbar"
        />
      </div>
      <div className="xy-ai-panel-action-row flex overflow-hidden rounded-xl border border-gray-200 bg-white">
        <button
          onClick={saveOutlinePreviewDraft}
          disabled={!cleanDraft.trim()}
          className="min-w-[92px] flex-1 whitespace-nowrap bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
        >
          {isDetailOutlineTab ? '替换章纲' : '保存梗概'}
        </button>
        {isDetailOutlineTab && (
          <button
            onClick={undoDetailOutlineReplacement}
            disabled={!canUndoDetailOutlineReplacement}
            className="min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:text-gray-300"
          >
            撤销替换
          </button>
        )}
        <button
          onClick={() => void navigator.clipboard.writeText(cleanDraft)}
          disabled={!cleanDraft.trim()}
          className="min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
        >
          {isDetailOutlineTab ? '复制章纲' : '复制梗概'}
        </button>
      </div>
    </aside>
  );
}
