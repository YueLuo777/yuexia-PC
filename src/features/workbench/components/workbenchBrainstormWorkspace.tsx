import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';

import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { WordCountText } from '@/shared/ui/WordCountText';

import { getFloatingTitleInputStyle } from './workbenchBrainstormState';
import {
  BRAINSTORM_QUESTION_FIELDS,
  type BrainstormQuestionDraft,
  type BrainstormQuestionKey,
} from './workbenchBrainstormState';
import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';
import { getBrainstormQuestionRows } from './workbenchLibraryRequestLog';

type BrainstormPreviewEditorProps = {
  title?: string;
  body: string;
  wordCount: number;
  fontSize: number;
  onFocus: () => void;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
};

export function BrainstormPreviewEditor({
  title,
  body,
  wordCount,
  fontSize,
  onFocus,
  onTitleChange,
  onBodyChange,
}: BrainstormPreviewEditorProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <div className="relative min-h-0 flex-1">
        <div
          className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-brainstorm-preview-field xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${body.trim() ? 'xy-has-value' : ''}`}
        >
          <textarea
            value={body}
            onFocus={onFocus}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="这里显示选中的脑洞内容，也可以直接编辑。"
            className="editor-scrollbar text-sm leading-7 text-gray-700"
            style={{ fontSize }}
          />
          <label aria-hidden="true" className="opacity-0">
            脑洞预览
          </label>
          {title !== undefined && (
            <div className="xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
              <input
                value={title}
                onFocus={onFocus}
                onChange={(event) => onTitleChange(event.target.value)}
                className="xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none"
                style={getFloatingTitleInputStyle(title, 3, 9)}
                aria-label="脑洞名称"
              />
              <span>
                <WordCountText value={wordCount} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type BrainstormOutputWorkspaceProps = {
  previews: string[];
  titles: string[];
  selectedIndexes: Set<number>;
  showSelection: boolean;
  activeScrollIndex: number | null;
  fontSize: number;
  aiInputRef: RefObject<HTMLTextAreaElement | null>;
  aiInput: string;
  isLoading: boolean;
  canSend: boolean;
  selectedCount: number;
  currentEntryId?: string;
  outputValue: string;
  onFocusOutput: () => void;
  onScrollOutput: (index: number) => void;
  onPreviewChange: (index: number, value: string) => void;
  onTitleChange: (index: number, value: string) => void;
  onToggleSelected: (index: number) => void;
  onAiInputChange: (value: string) => void;
  onAiInputKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStop: () => void;
  onReplaceCurrent: (entryId?: string) => void;
  onSaveAsNew: () => void;
  onCopy: () => void;
  onClear: () => void;
  getTitle: (index: number) => string;
  countWords: (value: string) => number;
};

export function BrainstormOutputWorkspace({
  previews,
  titles,
  selectedIndexes,
  showSelection,
  activeScrollIndex,
  fontSize,
  aiInputRef,
  aiInput,
  isLoading,
  canSend,
  selectedCount,
  currentEntryId,
  outputValue,
  onFocusOutput,
  onScrollOutput,
  onPreviewChange,
  onTitleChange,
  onToggleSelected,
  onAiInputChange,
  onAiInputKeyDown,
  onSend,
  onStop,
  onReplaceCurrent,
  onSaveAsNew,
  onCopy,
  onClear,
  getTitle,
  countWords,
}: BrainstormOutputWorkspaceProps) {
  const handleAiInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onAiInputChange(event.target.value);
    resizeFloatingAiTextarea(event.currentTarget);
  };

  return (
    <section className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2 p-4">
        <div className="editor-scrollbar xy-brainstorm-output-preview-list flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {previews.map((previewValue, index) => {
            const titleValue = titles[index] ?? getTitle(index);
            const previewWordCount = countWords(previewValue);
            const outputChecked = selectedIndexes.has(index);
            return (
              <div key={index} className="relative min-h-[120px] flex-1">
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${previewValue.trim() ? 'xy-has-value' : ''}`}
                >
                  <textarea
                    value={previewValue}
                    onFocus={onFocusOutput}
                    onScroll={() => onScrollOutput(index)}
                    onChange={(event) => onPreviewChange(index, event.target.value)}
                    placeholder={`这里显示本次 AI 生成的${titleValue}，保存脑洞时只保存这里的内容。`}
                    className={`scrollbar-scroll-only text-sm leading-6 text-gray-700 ${activeScrollIndex === index ? 'scrollbar-active' : ''}`}
                    style={{ fontSize }}
                  />
                  <label aria-hidden="true" className="opacity-0">
                    AI输出框
                  </label>
                </div>
                <div className="xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
                  {showSelection && (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={outputChecked}
                      aria-label={`${titleValue}保存勾选`}
                      onClick={() => onToggleSelected(index)}
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] font-black leading-none transition-colors ${
                        outputChecked
                          ? 'border-[#08AACE] bg-[#08AACE] text-white'
                          : 'border-slate-300 bg-white text-transparent hover:border-[#08AACE]'
                      }`}
                    >
                      ✓
                    </button>
                  )}
                  <input
                    value={titleValue}
                    onFocus={onFocusOutput}
                    onChange={(event) => onTitleChange(index, event.target.value)}
                    className="xy-floating-title-input max-w-[180px] min-w-[72px] text-sm font-black leading-none text-slate-950 outline-none"
                    style={getFloatingTitleInputStyle(titleValue, 4, 12)}
                    aria-label={`AI输出名称 ${index + 1}`}
                  />
                  <span>
                    <WordCountText value={previewWordCount} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="min-h-0 space-y-3">
          <AiInlineInput
            ref={aiInputRef}
            value={aiInput}
            onChange={handleAiInputChange}
            onKeyDown={onAiInputKeyDown}
            onSend={onSend}
            onStop={onStop}
            sendDisabled={isLoading || !canSend}
            stopDisabled={!isLoading}
            placeholder="输入对话指令..."
            className="xy-brainstorm-ai-input"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="xy-capsule-group overflow-hidden">
                <button
                  onClick={() => onReplaceCurrent(currentEntryId)}
                  disabled={!currentEntryId || selectedCount !== 1}
                  className="xy-capsule-button"
                >
                  替换当前脑洞
                </button>
                <button onClick={onSaveAsNew} disabled={selectedCount === 0} className="xy-capsule-button">
                  保存为新脑洞
                </button>
              </div>
              <div className="xy-capsule-group overflow-hidden">
                <button type="button" onClick={onCopy} disabled={!outputValue.trim()} className="xy-capsule-button">
                  复制脑洞
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  disabled={!outputValue.trim() && !isLoading}
                  className="xy-capsule-button text-red-500 hover:text-red-600 disabled:text-red-300"
                >
                  清空脑洞
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type BrainstormQuestionPanelProps = {
  draft: BrainstormQuestionDraft;
  isLoading: boolean;
  onFieldChange: (key: BrainstormQuestionKey, value: string) => void;
  onGenerate: () => void;
};

export function BrainstormQuestionPanel({ draft, isLoading, onFieldChange, onGenerate }: BrainstormQuestionPanelProps) {
  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2">
        <div className="flex min-h-full flex-col gap-4 pt-2">
          {BRAINSTORM_QUESTION_FIELDS.map((field, index) => {
            const isLastField = index === BRAINSTORM_QUESTION_FIELDS.length - 1;
            const questionRows = getBrainstormQuestionRows(draft[field.key]);
            if (field.key === 'brainstormCount' || field.key === 'brainstormBackground') return null;
            if (field.key === 'brainstormGenre') {
              const pairedFields = BRAINSTORM_QUESTION_FIELDS.filter(
                (item) => item.key === 'brainstormGenre' || item.key === 'brainstormBackground',
              );
              return (
                <div
                  key="brainstorm-genre-background-row"
                  className="grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700"
                >
                  {pairedFields.map((pairedField) => {
                    const pairedRows = getBrainstormQuestionRows(draft[pairedField.key]);
                    return (
                      <div
                        key={pairedField.key}
                        className={`xy-floating-field xy-brainstorm-question-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${draft[pairedField.key].trim() ? 'xy-has-value' : ''}`}
                      >
                        <textarea
                          value={draft[pairedField.key]}
                          onChange={(event) => onFieldChange(pairedField.key, event.target.value)}
                          placeholder={pairedField.placeholder}
                          rows={1}
                          className="font-medium leading-5"
                          style={{ height: `${Math.max(52, pairedRows * 20 + 32)}px`, overflowY: 'hidden' }}
                        />
                        <label>{pairedField.label}</label>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return (
              <div key={field.key} className="block shrink-0 text-sm font-bold text-gray-700">
                <div
                  className={`xy-floating-field xy-brainstorm-question-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${draft[field.key].trim() ? 'xy-has-value' : ''}`}
                >
                  <textarea
                    value={draft[field.key]}
                    onChange={(event) => onFieldChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={1}
                    className={`font-medium leading-5 ${isLastField ? 'min-h-0 flex-1' : ''}`}
                    style={
                      isLastField
                        ? {
                            minHeight: `${Math.max(180, questionRows * 20 + 52)}px`,
                            height: '100%',
                            overflowY: 'hidden',
                          }
                        : { height: `${Math.max(52, questionRows * 20 + 32)}px`, overflowY: 'hidden' }
                    }
                  />
                  <label>{field.label}</label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>
          <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {['3', '5', '10'].map((value) => {
              const active = draft.brainstormCount === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFieldChange('brainstormCount', active ? '' : value)}
                  className={`min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black leading-none transition-colors last:border-r-0 ${
                    active
                      ? 'bg-[#08AACE] text-white'
                      : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? '生成中...' : '逐个生成'}
        </button>
      </div>
    </div>
  );
}
