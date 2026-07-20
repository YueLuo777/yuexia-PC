import type { CapsuleSelectOption } from '@/shared/ui/CapsuleSelect';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

import { resizeFloatingAiTextarea } from './chapterEditorLayout';
import { renderAiThinkingContent } from './chapterEditorPresentation';
import { ChapterReviewManagementModal, type ChapterReviewManagementMode } from './ChapterReviewManagementModal';

interface ChapterReviewAiPanelProps {
  showInlineFieldSizeButton: boolean;
  onOpenFieldSize: () => void;
  reviewModelId: string;
  activeReviewPromptId: string;
  modelOptions: CapsuleSelectOption[];
  promptOptions: CapsuleSelectOption[];
  setReviewModelIdWithStorage: (modelId: string) => void;
  handleActiveReviewPromptChange: (promptId: string) => void;
  reviewManagementModal: ChapterReviewManagementMode;
  setReviewManagementModal: (mode: ChapterReviewManagementMode) => void;
  reviewManagementModalSizeClass: string;
  activeReviewModeTitle: string;
  activeReviewPromptCategory: string;
  clearReviewAiOutput: () => void;
  reviewAiOutput: string;
  reviewPreviewAnnotationTitle: string;
  reviewAiInput: string;
  setReviewAiInput: (value: string) => void;
  sendReviewAiMessage: () => Promise<void>;
  stopReviewAiMessage: () => void;
  sendDisabled: boolean;
  isReviewAiLoading: boolean;
}

export function ChapterReviewAiPanel({
  showInlineFieldSizeButton,
  onOpenFieldSize,
  reviewModelId,
  activeReviewPromptId,
  modelOptions,
  promptOptions,
  setReviewModelIdWithStorage,
  handleActiveReviewPromptChange,
  reviewManagementModal,
  setReviewManagementModal,
  reviewManagementModalSizeClass,
  activeReviewModeTitle,
  activeReviewPromptCategory,
  clearReviewAiOutput,
  reviewAiOutput,
  reviewPreviewAnnotationTitle,
  reviewAiInput,
  setReviewAiInput,
  sendReviewAiMessage,
  stopReviewAiMessage,
  sendDisabled,
  isReviewAiLoading,
}: ChapterReviewAiPanelProps) {
  return (
    <aside className="relative flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
      {showInlineFieldSizeButton ? (
        <div className="flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenFieldSize()}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition-colors hover:border-[#08AACE] hover:text-[#078fb0]"
          >
            设置
          </button>
        </div>
      ) : null}
      <div className={`${showInlineFieldSizeButton ? 'mt-3' : ''} flex min-h-0 flex-1 flex-col`}>
        <CombinedAiConfigSelect
          modelValue={reviewModelId}
          promptValue={activeReviewPromptId}
          modelOptions={modelOptions}
          promptOptions={promptOptions}
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
            sendDisabled={sendDisabled}
            stopDisabled={!isReviewAiLoading}
            textareaClassName="editor-scrollbar"
          />
        </div>
      </div>
      <ChapterReviewManagementModal
        mode={reviewManagementModal}
        reviewManagementModalSizeClass={reviewManagementModalSizeClass}
        modeTitle={activeReviewModeTitle}
        promptCategory={activeReviewPromptCategory}
        onClose={() => setReviewManagementModal(null)}
      />
    </aside>
  );
}
