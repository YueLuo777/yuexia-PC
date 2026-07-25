/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- extracted from top-level outline controller statements.
export function createOutlineControllerPhase3(scope: Record<string, any>) {
  const {
    DOMException,
    activeOutlinePrompt,
    activeTab,
    activeTabConfig,
    buildOutlineAiRequestLog,
    callModelStream,
    formatAiThinkingResponse,
    formatOutlineUserTextForAi,
    getOutlineAiContext,
    getOutlineDefaultPrompt,
    isDetailOutlineTab,
    isLibraryAiLoading,
    outlineAiInput,
    selectedOutlineModel,
    setIsLibraryAiLoading,
    setLastOutlineAiRequestLog,
    setOutlineAiInput,
    setOutlinePreviewDraft,
    startBackgroundAiTask,
    stopBackgroundAiTask,
    storageKey,
    updateActiveTabConfig,
  } = scope;
  const sendOutlineAiMessage = async () => {
    const userText = outlineAiInput.trim();
    const rawRequestText = userText || (isDetailOutlineTab ? '请根据关联的设定和前文章纲生成本章章纲。' : '');
    const requestText = formatOutlineUserTextForAi(rawRequestText);
    if (!requestText || isLibraryAiLoading) return;
    if (!selectedOutlineModel) {
      setOutlinePreviewDraft('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
      return;
    }
    const contextText = getOutlineAiContext();
    const promptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
    setLastOutlineAiRequestLog(
      buildOutlineAiRequestLog(
        requestText,
        contextText,
        promptText,
        new Date().toLocaleString('zh-CN'),
        rawRequestText,
      ),
    );
    setIsLibraryAiLoading(true);
    setOutlineAiInput('');
    const pendingOutput = formatAiThinkingResponse('', '', 0, false);
    setOutlinePreviewDraft(pendingOutput);
    const task = startBackgroundAiTask({
      kind: isDetailOutlineTab ? 'detailOutline' : 'summary',
      title: isDetailOutlineTab ? '生成章纲' : '生成梗概',
      input: requestText,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'workbenchOutlineAi',
        storageKey,
        tab: activeTab,
      },
      runner: async ({ signal, emit }) => {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          content = await callModelStream({
            model: selectedOutlineModel,
            prompt: promptText,
            userContent: requestText,
            chapterContext: contextText,
            recordType: 'stream',
            signal,
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                replace: true,
              });
            },
            onChunk: (chunk) => {
              content += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), {
                replace: true,
              });
            },
          });
          return reasoningContent.trim()
            ? formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true)
            : content;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
      },
    });
    updateActiveTabConfig({ outlineAiTaskId: task.id });
  };
  const stopOutlineAiMessage = () => {
    if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
    setIsLibraryAiLoading(false);
  };
  const clearOutlinePreviewDraft = () => {
    if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
    updateActiveTabConfig({ outlineAiTaskId: undefined });
    setOutlinePreviewDraft('');
  };
  return {
    clearOutlinePreviewDraft,
    sendOutlineAiMessage,
    stopOutlineAiMessage,
  };
}
