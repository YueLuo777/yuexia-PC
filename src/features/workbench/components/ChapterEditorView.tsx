/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- pure extracted view.
import React from 'react';
export function renderChapterEditorView(scope: Record<string, any>) {
  const {
    ChapterEditorModalHost,
    ChapterReviewPanel,
    ChapterStatusManagementModal,
    ChapterStatusPanel,
    ChapterWritingSurface,
    standardMode,
    activeReviewChapter,
    activeReviewContent,
    activeReviewDetailOutlineText,
    activeReviewModeTitle,
    activeReviewModel,
    activeReviewParagraphIndex,
    activeReviewPreviewScrollPane,
    activeReviewPromptCategory,
    activeReviewPromptId,
    activeReviewPromptOptions,
    activeReviewWordCount,
    applyTextAuditContent,
    activeStatusChapter,
    activeStatusPromptId,
    allChapters,
    associatedCount,
    auditOutputPassed,
    auditParagraphCountMatches,
    auditRevisedParagraphs,
    auditRevisedText,
    auditTextStage,
    canRunTextAudit,
    canRenderReviewPanel,
    canShowReviewOutline,
    chapter,
    chapterDirectoryGroups,
    cancelAuditTextReviewCountdown,
    clearReviewAiOutput,
    commitContent,
    content,
    copyText,
    copyToast,
    editorSettingsModal,
    editorGridLineStyle,
    editorScrollTop,
    editorTextLineHeight,
    editorTextPaddingLeft,
    editorTextPaddingRight,
    effectiveShowReviewOutline,
    embeddedMode,
    expandedAuditStructureItems,
    expandedReviewVolumeIds,
    expandedStatusVolumeIds,
    findNext,
    findText,
    fontSettings,
    formatSettings,
    getChapterContent,
    handleActiveReviewPromptChange,
    handleAssociate,
    handleContentChange,
    handleKeyDown,
    handlePaste,
    handleReviewPreviewScroll,
    handleSmartFormatNow,
    handleSymbolAutoEnabled,
    handleSymbolReplaceNow,
    isAssociateOpen,
    isAuditStructureReview,
    isAuditTextReview,
    isEmbeddedReviewMode,
    isFindOpen,
    isFontSettingsOpen,
    isHighFreqOpen,
    isHistoryOpen,
    isReviewAiLoading,
    isSmartFormatOpen,
    isSymbolReplaceOpen,
    isTitleOptimizeOpen,
    saveStatus,
    lastSavedAt,
    onDeleteChapter,
    onOpenFind,
    onRenameChapter,
    onRetrySave,
    onUpdateSerialNumber,
    polishPreviewParagraphs,
    polishPreviewText,
    replaceAll,
    replaceText,
    runAuditTextReviewManually,
    reviewAiInput,
    reviewAiOutput,
    reviewAnnotationPreviewPaneRef,
    reviewAnnotationRefs,
    reviewAnnotations,
    reviewAnnotationsByParagraph,
    reviewLeftResizeHandle,
    reviewLogModal,
    reviewManagementModal,
    reviewManagementModalSizeClass,
    reviewModalDraggable,
    reviewMode,
    reviewModelId,
    reviewModels,
    reviewOriginalParagraphRefs,
    reviewOriginalParagraphs,
    reviewOriginalPreviewPaneRef,
    reviewPageLeftWidth,
    reviewPageRightWidth,
    reviewPortalTarget,
    reviewPreviewAnnotationTitle,
    reviewPreviewFontSize,
    reviewPreviewGridRef,
    reviewPreviewGridTemplateColumns,
    reviewPreviewOriginalTitle,
    reviewPreviewOutlineResizeHandle,
    reviewPreviewTextColumnSeparator,
    reviewPreviewWidthMode,
    reviewRightResizeHandle,
    safeVolumeName,
    saveStatusUpdate,
    selectReviewChapter,
    selectReviewPreviewParagraph,
    selectStatusChapter,
    selectedStatusTargets,
    sendReviewAiMessage,
    startAuditTextReviewNow,
    serialValue,
    setCopyToast,
    setEditorScrollTop,
    setEmbeddedPortalElement,
    setFindText,
    setFontSettings,
    setFormatSettings,
    setIsAssociateOpen,
    setIsEditorSettingsOpen,
    setIsFindOpen,
    setIsFontSettingsOpen,
    setIsHighFreqOpen,
    setIsHistoryOpen,
    setIsReviewOpen,
    setIsSmartFormatOpen,
    setIsStatusUpdateOpen,
    setIsSymbolReplaceOpen,
    setIsTitleOptimizeOpen,
    setReplaceText,
    setReviewAiInput,
    setReviewManagementModal,
    setReviewModelIdWithStorage,
    setReviewOutlineVisibilityWithBalancedColumns,
    setReviewPreviewFontSizeWithStorage,
    setReviewPreviewWidthModeWithStorage,
    setShowDeleteConfirm,
    setStatusDraft,
    setStatusPromptId,
    settingsStorageKey,
    showDeleteConfirm,
    showInlineFieldSizeButton,
    showReviewOutline,
    showStatusUpdatePanel,
    statusDraft,
    statusLeftResizeHandle,
    statusModalDraggable,
    statusPageLeftWidth,
    statusPageRightWidth,
    statusPreviewChapters,
    statusPreviewText,
    statusPreviewWordCount,
    statusPrompts,
    statusRightResizeHandle,
    statusTargetEntries,
    statusTargetIds,
    statusUpdatedChapterIds,
    stopReviewAiMessage,
    textareaRef,
    titleCount,
    toggleAuditStructureItem,
    toggleReviewDirectoryVolume,
    toggleStatusDirectoryVolume,
    toggleStatusTarget,
    wordCount,
  } = scope;
  return (
    <section className="xy-wa-editor-root flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {editorSettingsModal}
      {reviewLogModal}
      {isEmbeddedReviewMode && (
        <div ref={setEmbeddedPortalElement} className="min-h-0 flex-1 overflow-hidden bg-white" />
      )}
      {!embeddedMode && (
        <ChapterWritingSurface
          standardMode={standardMode}
          chapter={chapter}
          safeVolumeName={safeVolumeName}
          serialValue={serialValue}
          titleCount={titleCount}
          content={content}
          wordCount={wordCount}
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
          associatedCount={associatedCount}
          isFindOpen={isFindOpen}
          findText={findText}
          replaceText={replaceText}
          fontSettings={fontSettings}
          editorScrollTop={editorScrollTop}
          editorGridLineStyle={editorGridLineStyle}
          editorTextLineHeight={editorTextLineHeight}
          editorTextPaddingLeft={editorTextPaddingLeft}
          editorTextPaddingRight={editorTextPaddingRight}
          textareaRef={textareaRef}
          setFindText={setFindText}
          setReplaceText={setReplaceText}
          setIsFindOpen={setIsFindOpen}
          setEditorScrollTop={setEditorScrollTop}
          onUpdateSerialNumber={onUpdateSerialNumber}
          onRenameChapter={onRenameChapter}
          copyText={copyText}
          openTitleOptimize={() => setIsTitleOptimizeOpen(true)}
          openFontSettings={() => setIsFontSettingsOpen(true)}
          handleSmartFormatNow={handleSmartFormatNow}
          openSmartFormatSettings={() => setIsSmartFormatOpen(true)}
          openHighFreqSettings={() => setIsHighFreqOpen(true)}
          handleSymbolReplaceNow={handleSymbolReplaceNow}
          handleSymbolAutoEnabled={handleSymbolAutoEnabled}
          openSymbolReplaceSettings={() => setIsSymbolReplaceOpen(true)}
          openHistory={() => setIsHistoryOpen(true)}
          onOpenFind={onOpenFind}
          openDeleteConfirm={() => setShowDeleteConfirm(true)}
          findNext={findNext}
          replaceAll={replaceAll}
          handleContentChange={handleContentChange}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          onRetrySave={onRetrySave}
        />
      )}

      <ChapterEditorModalHost
        chapter={chapter}
        allChapters={allChapters}
        content={content}
        serialValue={serialValue}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onDeleteChapter={onDeleteChapter}
        isFontSettingsOpen={isFontSettingsOpen}
        setIsFontSettingsOpen={setIsFontSettingsOpen}
        fontSettings={fontSettings}
        setFontSettings={setFontSettings}
        isSmartFormatOpen={isSmartFormatOpen}
        setIsSmartFormatOpen={setIsSmartFormatOpen}
        formatSettings={formatSettings}
        setFormatSettings={setFormatSettings}
        commitContent={commitContent}
        isHighFreqOpen={isHighFreqOpen}
        setIsHighFreqOpen={setIsHighFreqOpen}
        isSymbolReplaceOpen={isSymbolReplaceOpen}
        setIsSymbolReplaceOpen={setIsSymbolReplaceOpen}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        isTitleOptimizeOpen={isTitleOptimizeOpen}
        setIsTitleOptimizeOpen={setIsTitleOptimizeOpen}
        onRenameChapter={onRenameChapter}
        isAssociateOpen={isAssociateOpen}
        setIsAssociateOpen={setIsAssociateOpen}
        onAssociate={handleAssociate}
      />
      {showStatusUpdatePanel && (
        <ChapterStatusPanel
          embedded={embeddedMode === 'status'}
          onClose={() => setIsStatusUpdateOpen(false)}
          statusPageLeftWidth={statusPageLeftWidth}
          statusPageRightWidth={statusPageRightWidth}
          statusLeftResizeHandle={statusLeftResizeHandle}
          statusModalDraggable={statusModalDraggable}
          statusRightResizeHandle={statusRightResizeHandle}
          chapterDirectoryGroups={chapterDirectoryGroups}
          expandedStatusVolumeIds={expandedStatusVolumeIds}
          toggleStatusDirectoryVolume={toggleStatusDirectoryVolume}
          activeStatusChapter={activeStatusChapter}
          statusUpdatedChapterIds={statusUpdatedChapterIds}
          selectStatusChapter={selectStatusChapter}
          statusPreviewChapters={statusPreviewChapters}
          statusPreviewWordCount={statusPreviewWordCount}
          statusPreviewText={statusPreviewText}
          reviewModelId={reviewModelId}
          activeStatusPromptId={activeStatusPromptId}
          reviewModels={reviewModels}
          statusPrompts={statusPrompts}
          setReviewModelIdWithStorage={setReviewModelIdWithStorage}
          setStatusPromptId={setStatusPromptId}
          onManageModels={() => setReviewManagementModal('models')}
          onManagePrompts={() => setReviewManagementModal('prompts')}
          selectedStatusTargets={selectedStatusTargets}
          statusTargetEntries={statusTargetEntries}
          statusTargetIds={statusTargetIds}
          toggleStatusTarget={toggleStatusTarget}
          statusDraft={statusDraft}
          setStatusDraft={setStatusDraft}
          saveStatusUpdate={saveStatusUpdate}
        />
      )}
      {showStatusUpdatePanel && (
        <ChapterStatusManagementModal mode={reviewManagementModal} onClose={() => setReviewManagementModal(null)} />
      )}
      {canRenderReviewPanel && (
        <ChapterReviewPanel
          embeddedMode={embeddedMode}
          isEmbeddedReviewMode={isEmbeddedReviewMode}
          portalTarget={reviewPortalTarget!}
          activeReviewModeTitle={activeReviewModeTitle}
          onClose={() => setIsReviewOpen(false)}
          reviewModalDraggable={reviewModalDraggable}
          reviewPageLeftWidth={reviewPageLeftWidth}
          reviewPageRightWidth={reviewPageRightWidth}
          reviewLeftResizeHandle={reviewLeftResizeHandle}
          reviewRightResizeHandle={reviewRightResizeHandle}
          directoryProps={{
            chapterDirectoryGroups,
            expandedReviewVolumeIds,
            toggleReviewDirectoryVolume,
            activeReviewChapter,
            reviewMode,
            settingsStorageKey,
            getChapterContent,
            selectReviewChapter,
          }}
          previewProps={{
            activeReviewChapter,
            activeReviewWordCount,
            canShowReviewOutline,
            showReviewOutline,
            setReviewOutlineVisibilityWithBalancedColumns,
            reviewPreviewWidthMode,
            setReviewPreviewWidthModeWithStorage,
            reviewPreviewFontSize,
            setReviewPreviewFontSizeWithStorage,
            reviewPreviewGridRef,
            reviewPreviewGridTemplateColumns,
            effectiveShowReviewOutline,
            activeReviewPreviewScrollPane,
            handleReviewPreviewScroll,
            activeReviewDetailOutlineText,
            reviewPreviewOutlineResizeHandle,
            reviewPreviewOriginalTitle,
            reviewOriginalPreviewPaneRef,
            reviewOriginalParagraphs,
            activeReviewContent,
            activeReviewParagraphIndex,
            isAuditTextReview,
            auditRevisedText,
            reviewOriginalParagraphRefs,
            selectReviewPreviewParagraph,
            auditRevisedParagraphs,
            reviewPreviewTextColumnSeparator,
            reviewPreviewAnnotationTitle,
            reviewMode,
            polishPreviewText,
            reviewAnnotations,
            reviewAnnotationPreviewPaneRef,
            activeReviewModeTitle,
            reviewAiOutput,
            isAuditStructureReview,
            polishPreviewParagraphs,
            auditParagraphCountMatches,
            auditOutputPassed,
            auditTextStage,
            canRunTextAudit,
            isReviewAiLoading,
            onStartAuditTextReviewNow: startAuditTextReviewNow,
            onCancelAuditTextReviewCountdown: cancelAuditTextReviewCountdown,
            onRunAuditTextReviewManually: runAuditTextReviewManually,
            expandedAuditStructureItems,
            toggleAuditStructureItem,
            reviewAnnotationsByParagraph,
            reviewAnnotationRefs,
            onApplyTextAuditContent: applyTextAuditContent,
          }}
          aiPanelProps={{
            showInlineFieldSizeButton,
            onOpenFieldSize: () => setIsEditorSettingsOpen(true),
            reviewModelId,
            activeReviewPromptId,
            modelOptions:
              reviewModels.length === 0
                ? [{ value: '', label: '暂无可用模型', disabled: true }]
                : reviewModels.map((model) => ({ value: model.id, label: model.name })),
            promptOptions:
              activeReviewPromptOptions.length === 0
                ? [{ value: '', label: '无', disabled: true }]
                : activeReviewPromptOptions,
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
            sendDisabled: isReviewAiLoading || !activeReviewChapter || !activeReviewModel,
            isReviewAiLoading,
          }}
        />
      )}
      {copyToast && (
        <button
          onClick={() => setCopyToast('')}
          className="fixed bottom-6 right-6 z-[260] rounded-lg bg-gray-800 px-4 py-3 text-sm text-white shadow-lg"
        >
          {copyToast}
        </button>
      )}
    </section>
  );
}
