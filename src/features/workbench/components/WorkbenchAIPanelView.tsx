/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- pure extracted view.
import React from 'react';
import { AssociationSegmentedControl } from '@/shared/ui/AssociationSegmentedControl';
import { WorkbenchReplaceBodyButton } from './WorkbenchReplaceBodyButton';
export function renderWorkbenchAIPanelView(scope: Record<string, any>) {
  const {
    AiInlineInput,
    ConfirmDialog,
    MAX_AI_SESSIONS,
    WordCountText,
    WorkbenchAiConfigPanel,
    WorkbenchAiConversationView,
    WorkbenchAiRequestLogModal,
    activeLinkWordCount,
    activeSession,
    activeSessionId,
    addSession,
    canSendMessage,
    canUndoReplace,
    chapterContextLabel,
    chatPrompts,
    copyOutput,
    createPortal,
    deleteSession,
    enabledModels,
    flashStatus,
    hasLinkedChapter,
    hasLinkedContext,
    headerToolPortalTarget,
    input,
    inputTextareaRef,
    isLoading,
    isRequestLogOpen,
    isSessionLimitConfirmOpen,
    loadingText,
    onClose,
    onOpenAgentManage,
    onOpenModelManage,
    onReplaceContent,
    onUndoReplace,
    openLinkedContextLibrary,
    output,
    outputFontSize,
    outputFontSizeTool,
    outputWordCount,
    resetSessions,
    resizeFloatingAiTextarea,
    selectedModel,
    selectedModelId,
    selectedPrompt,
    selectedPromptId,
    sendMessage,
    sessions,
    setActiveSessionId,
    setIsRequestLogOpen,
    setIsSessionLimitConfirmOpen,
    setSelectedModelId,
    setSelectedPromptId,
    shouldShowActiveLinkStats,
    statusText,
    stopMessage,
    toggleChapterContext,
    updateActiveSession,
    visibleRequestLog,
  } = scope;
  return (
    <aside className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-gray-50">
      {headerToolPortalTarget ? createPortal(outputFontSizeTool, headerToolPortalTarget) : null}
      {statusText || onClose ? (
        <div className="flex min-h-10 shrink-0 items-center justify-end gap-3 border-b border-gray-100 px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {statusText && <span className="min-w-0 truncate text-[11px] text-brand">{statusText}</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="收起"
              >
                收起
              </button>
            )}
          </div>
        </div>
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2">
        <WorkbenchAiConfigPanel
          model={selectedModel}
          modelId={selectedModelId}
          prompt={selectedPrompt}
          promptId={selectedPromptId}
          models={enabledModels}
          prompts={chatPrompts}
          onModelChange={setSelectedModelId}
          onPromptChange={setSelectedPromptId}
          onModelManage={() => onOpenModelManage?.()}
          onPromptManage={() => onOpenAgentManage?.()}
        />
        <WorkbenchAiConversationView
          sessions={sessions}
          activeSession={activeSession}
          activeSessionId={activeSessionId}
          isLoading={isLoading}
          loadingText={loadingText}
          outputFontSize={outputFontSize}
          outputWordCount={outputWordCount}
          onAddSession={addSession}
          onSelectSession={setActiveSessionId}
          onDeleteSession={deleteSession}
          onResetSessions={resetSessions}
        />
        <AssociationSegmentedControl
          segments={[
            {
              id: 'chapter',
              label: hasLinkedChapter ? `已关联${chapterContextLabel}` : chapterContextLabel,
              active: hasLinkedChapter,
              onClick: toggleChapterContext,
              minWidthClassName: 'w-24',
            },
            {
              id: 'materials',
              label: hasLinkedContext ? '已关联资料' : '资料',
              active: hasLinkedContext,
              onClick: openLinkedContextLibrary,
              minWidthClassName: 'w-28',
            },
          ]}
          meta={
            shouldShowActiveLinkStats ? (
              <>
                关联 <WordCountText value={activeLinkWordCount} compact />
              </>
            ) : undefined
          }
        />
        <div className="xy-ai-panel-input-row">
          <AiInlineInput
            ref={inputTextareaRef}
            value={input}
            onChange={(event) => {
              updateActiveSession({ input: event.target.value });
              resizeFloatingAiTextarea(event.currentTarget);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            onSend={() => void sendMessage()}
            onStop={stopMessage}
            sendDisabled={isLoading || !canSendMessage}
            stopDisabled={!isLoading}
            placeholder="请输入你的要求..."
          />
          <div className="xy-ai-panel-action-row flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <WorkbenchReplaceBodyButton
              output={output}
              onReplaceContent={onReplaceContent}
              onReplaced={() => flashStatus('已智能排版并替换正文')}
            />
            <button
              onClick={() => {
                onUndoReplace?.();
                flashStatus('已撤回替换');
              }}
              disabled={!canUndoReplace}
              title="撤回上一次替换正文，恢复所选章节替换前的内容"
              className="min-w-0 flex-1 border-l border-gray-200 bg-white px-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              撤回替换
            </button>
            <button
              onClick={copyOutput}
              disabled={!output.trim()}
              className="min-w-0 flex-1 border-l border-gray-200 bg-white px-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              复制内容
            </button>
          </div>
        </div>
      </section>
      <WorkbenchAiRequestLogModal
        isOpen={isRequestLogOpen}
        log={visibleRequestLog}
        chapterContextLabel={chapterContextLabel}
        onClose={() => setIsRequestLogOpen(false)}
      />
      <ConfirmDialog
        isOpen={isSessionLimitConfirmOpen}
        title="会话已达上限"
        description={`最多保留 ${MAX_AI_SESSIONS} 个会话。是否清空当前会话并新开一个空白会话？`}
        cancelText="取消"
        confirmText="清空"
        confirmVariant="warning"
        onClose={() => setIsSessionLimitConfirmOpen(false)}
        onConfirm={() => {
          setIsSessionLimitConfirmOpen(false);
          resetSessions();
        }}
      />
    </aside>
  );
}
