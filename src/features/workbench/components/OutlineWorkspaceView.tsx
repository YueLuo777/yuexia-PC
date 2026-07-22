/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- pure outline view adapter.
import { DetailOutlineBorderFontTool, DetailOutlineTitleWordCount, normalizeDetailOutlineFontSize } from './DetailOutlineBorderFontTool';
export function renderOutlineWorkspaceView(scope: Record<string, any>) {
  const {
    AiInlineInput,
    ChapterNumberButton,
    CombinedAiConfigSelect,
    DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
    DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS,
    DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS,
    DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS,
    DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS,
    DETAIL_OUTLINE_TAB,
    DETAIL_OUTLINE_VOLUME_COUNT_CLASS,
    DETAIL_OUTLINE_VOLUME_ICON_CLASS,
    DETAIL_OUTLINE_VOLUME_ROW_CLASS,
    DETAIL_OUTLINE_VOLUME_TITLE_CLASS,
    Folder,
    FolderOpen,
    LibraryManagementModal,
    LinkedSourceControl,
    OUTLINE_LIBRARY_TAB,
    WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
    WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
    WORKBENCH_FOLDER_GROUP_ICON_CLASS,
    WordCountText,
    activeDetailOutlineScrollId,
    activeOutlinePromptId,
    activeTab,
    activeTabConfig,
    clampFixedMenuPosition,
    clearDetailOutlineReaderSelection,
    countTextWords,
    deleteConfirmDialog,
    detailOutlineChapterMenu,
    detailOutlineFontSize,
    detailOutlinePublishedCount,
    detailOutlinePublishedVolumes,
    detailOutlineReaderModal,
    detailOutlineReaderWordCount,
    detailOutlineUnpublishedCount,
    detailOutlineUnpublishedVolumes,
    effectiveSelectedOutlineChapterId,
    enableVolumeSummary,
    expandedOutlineVolumeIds,
    fieldSizeSettingsModal,
    getChapterContent,
    getChapterSummaryEntry,
    getDetailOutlinePreviewHeight,
    getEmbeddedConfigSelectStyle,
    getFieldSizeStyle,
    getOutlineChapterFrameTitle,
    getVolumeDisplayIndex,
    handleDetailOutlineTextareaScroll,
    isDetailOutlineChapterPublished,
    isDetailOutlineTab,
    isLibraryAiLoading,
    lastDetailOutlineReplacement,
    leftResizeHandle,
    libraryHeaderFontSizePortal,
    managementModal,
    mergeDetailOutlineStateExpectation,
    models,
    moveDetailOutlineChapterToPublished,
    moveDetailOutlineChapterToUnpublished,
    openDetailOutlineReader,
    outlineAiInput,
    outlineAiLogModal,
    outlineChapters,
    outlineDraftCountLeft,
    outlineDraftFrameTitle,
    outlineModelFieldSizeKey,
    outlinePreviewDraft,
    outlinePreviewDraftContent,
    outlinePreviewRefs,
    outlinePromptCategory,
    outlinePromptOptions,
    outlineSidebarWidth,
    renderAiChatContent,
    renderDetailOutlineDraftClearButton,
    renderDetailOutlineVolumeTree,
    renderTopTabs,
    resizeFloatingAiTextarea,
    rightResizeHandle,
    safeOutlineSelectionType,
    saveOutlinePreviewDraft,
    scaleStyle,
    selectOutlineChapter,
    selectOutlineVolume,
    selectedDetailOutlineReaderItems,
    selectedOutlineChapter,
    selectedOutlineVolume,
    selectedVolumeEntry,
    sendOutlineAiMessage,
    setActiveLibraryFontTarget,
    setDetailOutlineChapterMenu,
    setManagementModal,
    setOutlineAiInput,
    setOutlinePreviewDraft,
    setShowDetailOutlinePublished,
    settingLibraryRightWidth,
    shouldShowOutlineDraftWordCount,
    showDetailOutlinePublished,
    splitDetailOutlineStateExpectation,
    stopOutlineAiMessage,
    stripAiThinkingBlock,
    toggleOutlineVolume,
    undoDetailOutlineReplacement,
    updateActiveTabConfig,
    updateChapterSummary,
    updateOutlinePromptId,
    updateVolumeSummary,
    volumes,
  } = scope;
  const detailOutlineStateFontSize = normalizeDetailOutlineFontSize(
    activeTabConfig.detailOutlineStateFontSize,
    detailOutlineFontSize,
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {!isDetailOutlineTab && libraryHeaderFontSizePortal}
      {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) &&
        renderTopTabs()}
      {deleteConfirmDialog}
      {fieldSizeSettingsModal}
      {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
      {outlineAiLogModal}
      {detailOutlineReaderModal}
      {detailOutlineChapterMenu.visible && detailOutlineChapterMenu.chapter && (
        <div
          className="fixed z-[100] w-[136px] rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          style={{
            left: detailOutlineChapterMenu.x,
            top: detailOutlineChapterMenu.y,
          }}
          onContextMenu={(event) => event.preventDefault()}
        >
          {isDetailOutlineChapterPublished(detailOutlineChapterMenu.chapter) ? (
            <button
              type="button"
              disabled={detailOutlineChapterMenu.chapter.isPublished}
              onClick={() => moveDetailOutlineChapterToUnpublished(detailOutlineChapterMenu.chapter!)}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white"
              title={detailOutlineChapterMenu.chapter.isPublished ? '正文已发布，章纲会自动留在已发布' : undefined}
            >
              移回未发布
            </button>
          ) : (
            <button
              type="button"
              onClick={() => moveDetailOutlineChapterToPublished(detailOutlineChapterMenu.chapter!.id)}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              移动到已发布
            </button>
          )}
        </div>
      )}
      <div
        className="relative grid min-h-0 flex-1 overflow-hidden bg-white"
        style={{
          gridTemplateColumns:
            isDetailOutlineTab && showDetailOutlinePublished
              ? `${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
              : `${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`,
        }}
      >
        <aside
          className={`min-w-0 flex min-h-0 flex-col border-r border-gray-100 ${isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'}`}
        >
          {isDetailOutlineTab && (
            <div
              className={
                isDetailOutlineTab
                  ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS
                  : 'mb-3 flex h-9 shrink-0 items-center justify-between gap-2'
              }
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>未发布</span>
                <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>{detailOutlineUnpublishedCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailOutlinePublished((prev) => !prev)}
                className={
                  isDetailOutlineTab
                    ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS
                    : 'shrink-0 rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-[#0798b8]'
                }
              >
                {showDetailOutlinePublished ? '收回已发布' : '展开已发布'}
              </button>
            </div>
          )}
          <section className={`flex min-h-0 flex-1 flex-col ${isDetailOutlineTab ? 'px-1 py-2' : ''}`}>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {(isDetailOutlineTab ? detailOutlineUnpublishedCount === 0 : volumes.length === 0) ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无章节</p>
              ) : (
                <div className={isDetailOutlineTab ? 'space-y-2' : 'space-y-3'}>
                  {(isDetailOutlineTab
                    ? detailOutlineUnpublishedVolumes.filter((volume) => volume.chapters.length > 0)
                    : volumes
                  ).map((volume) => {
                    const expanded = expandedOutlineVolumeIds.has(volume.id);
                    const VolumeFolderIcon = expanded ? FolderOpen : Folder;
                    const volumeIsSelected =
                      safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;

                    return (
                      <div key={volume.id} className="mb-1">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleOutlineVolume(volume.id)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            event.preventDefault();
                            toggleOutlineVolume(volume.id);
                          }}
                          className={
                            isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS
                          }
                          aria-expanded={expanded}
                        >
                          <VolumeFolderIcon
                            className={
                              isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ICON_CLASS : WORKBENCH_FOLDER_GROUP_ICON_CLASS
                            }
                          />
                          <span
                            className={
                              isDetailOutlineTab
                                ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS
                                : 'min-w-0 flex-1 truncate leading-none'
                            }
                          >
                            {volume.name}
                          </span>
                          <span
                            className={
                              isDetailOutlineTab
                                ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS
                                : WORKBENCH_FOLDER_GROUP_COUNT_CLASS
                            }
                          >
                            {volume.chapters.length}章
                          </span>
                          {enableVolumeSummary && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                selectOutlineVolume(volume);
                              }}
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold transition-colors ${
                                volumeIsSelected
                                  ? 'border-brand bg-brand text-white'
                                  : 'border-brand/40 bg-white/70 text-brand-dark hover:bg-white'
                              }`}
                            >
                              卷梗概
                            </button>
                          )}
                        </div>
                        {expanded && (
                          <div
                            className="mt-1 grid justify-start gap-1.5 px-1.5 py-1.5"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}
                          >
                            {[...volume.chapters]
                              .sort((a, b) => a.serialNumber - b.serialNumber)
                              .map((chapter) => {
                                const entry = getChapterSummaryEntry(chapter.serialNumber);
                                const selected = effectiveSelectedOutlineChapterId === chapter.id;
                                const outlineWordCount = countTextWords(entry?.content ?? '');
                                const chapterContentWordCount = chapter.wordCount;
                                const hasSummary = outlineWordCount > 0;
                                const outlineButtonState =
                                  chapterContentWordCount > 0 ? 'used' : hasSummary ? 'hasOutline' : 'empty';
                                const outlineButtonClass = `relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                  selected
                                    ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                                    : hasSummary
                                      ? 'border-[#08B3D9] bg-[#E1F3F7] text-[#08AACE] hover:border-[#067B96] hover:bg-[#D3EEF5]'
                                      : 'border-slate-200 bg-white text-slate-900 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                }`;
                                if (isDetailOutlineTab) {
                                  return (
                                    <ChapterNumberButton
                                      key={chapter.id}
                                      onMouseDown={(event) => {
                                        if (event.button !== 0) return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        selectOutlineChapter(chapter.id, chapter.serialNumber);
                                      }}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                      }}
                                      onContextMenu={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        const { left, top } = clampFixedMenuPosition(
                                          event.clientX,
                                          event.clientY,
                                          DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
                                        );
                                        setDetailOutlineChapterMenu({
                                          visible: true,
                                          x: left,
                                          y: top,
                                          chapter,
                                        });
                                      }}
                                      selected={selected}
                                      state={outlineButtonState}
                                      title="移动到已发布"
                                    >
                                      {chapter.serialNumber}
                                    </ChapterNumberButton>
                                  );
                                }
                                return (
                                  <button
                                    key={chapter.id}
                                    onMouseDown={(event) => {
                                      if (event.button !== 0) return;
                                      event.preventDefault();
                                      event.stopPropagation();
                                      selectOutlineChapter(chapter.id, chapter.serialNumber);
                                    }}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                    }}
                                    onContextMenu={(event) => {
                                      if (!isDetailOutlineTab) return;
                                      event.preventDefault();
                                      event.stopPropagation();
                                      const { left, top } = clampFixedMenuPosition(
                                        event.clientX,
                                        event.clientY,
                                        DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE,
                                      );
                                      setDetailOutlineChapterMenu({
                                        visible: true,
                                        x: left,
                                        y: top,
                                        chapter,
                                      });
                                    }}
                                    className={outlineButtonClass}
                                    title={isDetailOutlineTab ? '移动到已发布' : undefined}
                                  >
                                    {isDetailOutlineTab ? chapter.serialNumber : chapter.serialNumber}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </aside>
        {leftResizeHandle}
        {isDetailOutlineTab && showDetailOutlinePublished && (
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50">
            <div className={DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>已发布</span>
                <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>{detailOutlinePublishedCount}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
              {volumes.length === 0 ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无已发布章纲</p>
              ) : (
                renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)
              )}
            </div>
          </aside>
        )}

        <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white p-5">
          <div
            className={`editor-scrollbar min-h-0 flex-1 overflow-y-auto ${isDetailOutlineTab ? '-mr-4 pr-4 pt-2.5' : '-mr-4 pr-4 pt-5'}`}
          >
            {outlineChapters.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                暂无章节可预览
              </div>
            ) : safeOutlineSelectionType === 'volume' && selectedOutlineVolume ? (
              <section className="xy-selected-content-bg rounded-xl border border-[#08AACE] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{selectedOutlineVolume.name}梗概</h4>
                  <span className="shrink-0 text-lg font-bold text-gray-900">
                    {selectedOutlineVolume.chapters.length}章
                  </span>
                </div>
                <textarea
                  data-no-modal-drag="true"
                  value={selectedVolumeEntry?.content ?? ''}
                  onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
                  placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"
                  className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                />
                <div className="mt-2 text-right text-xs font-bold text-gray-400">
                  <WordCountText value={countTextWords(selectedVolumeEntry?.content ?? '')} />
                </div>
              </section>
            ) : isDetailOutlineTab && selectedOutlineChapter ? (
              (() => {
                const { volume, chapter } = selectedOutlineChapter;
                const entry = getChapterSummaryEntry(chapter.serialNumber);
                const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                const outlineCardContent = entry?.content ?? '';
                const detailOutlineParts = splitDetailOutlineStateExpectation(outlineCardContent);
                const updateDetailOutlinePart = (part: 'outline' | 'stateExpectation', value: string) => {
                  updateChapterSummary(
                    chapter.serialNumber,
                    mergeDetailOutlineStateExpectation(
                      part === 'outline' ? value : detailOutlineParts.outline,
                      part === 'stateExpectation' ? value : detailOutlineParts.stateExpectation,
                    ),
                  );
                };
                return (
                  <div
                    key={chapter.id}
                    ref={(element) => {
                      outlinePreviewRefs.current[chapter.id] = element;
                    }}
                    className="flex h-full min-h-0 flex-col gap-6"
                  >
                    <section
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill min-h-0 flex-[0_0_62%] ${detailOutlineParts.outline.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={detailOutlineParts.outline}
                        onChange={(event) => updateDetailOutlinePart('outline', event.target.value)}
                        onFocus={() => {
                          setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onScroll={() => handleDetailOutlineTextareaScroll(chapter.id)}
                        placeholder="该章章纲会显示在这里，可由 AI 根据章节内容生成。"
                        className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`}
                        style={{
                          height: '100%',
                          overflowY: 'auto',
                          fontSize: detailOutlineFontSize,
                        }}
                      />
                      <label className="xy-floating-title-count xy-detail-outline-title-count">
                        <span className="xy-floating-title-text xy-detail-outline-heading-title">
                          {outlineCardTitle}<DetailOutlineTitleWordCount value={countTextWords(detailOutlineParts.outline)} spacingClassName="ml-[2ch]" />
                        </span>
                      </label>
                      <DetailOutlineBorderFontTool
                        value={detailOutlineFontSize}
                        onChange={(value) => updateActiveTabConfig({ detailOutlineFontSize: value })}
                        ariaLabel="章纲字号"
                      />
                    </section>
                    <section
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill min-h-0 flex-1 ${detailOutlineParts.stateExpectation.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={detailOutlineParts.stateExpectation}
                        onChange={(event) => updateDetailOutlinePart('stateExpectation', event.target.value)}
                        onFocus={() => {
                          setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        placeholder="按人物状态、道具状态、势力状态、关系状态、线索/信息记录本章预计变化。"
                        className="w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only"
                        style={{
                          height: '100%',
                          overflowY: 'auto',
                          fontSize: detailOutlineStateFontSize,
                        }}
                      />
                      <label className="xy-floating-title-count xy-detail-outline-title-count">
                        <span className="xy-floating-title-text xy-detail-outline-heading-title">
                          状态变化<DetailOutlineTitleWordCount value={countTextWords(detailOutlineParts.stateExpectation)} />
                        </span>
                      </label>
                      <DetailOutlineBorderFontTool
                        value={detailOutlineStateFontSize}
                        onChange={(value) => updateActiveTabConfig({ detailOutlineStateFontSize: value })}
                        ariaLabel="状态变化字号"
                      />
                    </section>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {outlineChapters.map(({ volume, chapter }) => {
                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                  const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                  const outlineCardContent = entry?.content ?? '';
                  const detailOutlineHeight = isDetailOutlineTab ? getDetailOutlinePreviewHeight() : undefined;
                  return (
                    <section
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count ${outlineCardContent.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={outlineCardContent}
                        onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                        onFocus={() => {
                          if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onScroll={isDetailOutlineTab ? () => handleDetailOutlineTextareaScroll(chapter.id) : undefined}
                        placeholder={
                          isDetailOutlineTab
                            ? '该章章纲会显示在这里，可由 AI 根据章节内容生成。'
                            : '该章梗概会显示在这里，可由 AI 根据章节内容生成。'
                        }
                        className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none ${
                          isDetailOutlineTab
                            ? `scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`
                            : 'editor-scrollbar h-36'
                        }`}
                        style={
                          isDetailOutlineTab
                            ? {
                                height: detailOutlineHeight,
                                overflowY: 'auto',
                                fontSize: detailOutlineFontSize,
                              }
                            : undefined
                        }
                      />
                      <label
                        className={
                          isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined
                        }
                      >
                        <span
                          className={
                            isDetailOutlineTab ? 'xy-floating-title-text xy-detail-outline-heading-title' : undefined
                          }
                        >
                          {outlineCardTitle}
                          {isDetailOutlineTab && <DetailOutlineTitleWordCount value={countTextWords(outlineCardContent)} spacingClassName="ml-[2ch]" />}
                        </span>
                      </label>
                      {!isDetailOutlineTab && (
                        <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
                          <>
                            第{chapter.serialNumber}章 {chapter.title.trim() || '未命名章节'}{' '}
                            <WordCountText value={chapter.wordCount} compact />
                          </>
                        </span>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {rightResizeHandle}
        <aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
          <div className="shrink-0 space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2 text-sm text-gray-500">
              <CombinedAiConfigSelect
                style={getEmbeddedConfigSelectStyle(getFieldSizeStyle(outlineModelFieldSizeKey))}
                modelValue={activeTabConfig.modelId ?? ''}
                promptValue={activeOutlinePromptId ?? ''}
                modelOptions={
                  models.length === 0
                    ? [{ value: '', label: '暂无可用模型', disabled: true }]
                    : models.map((model) => ({ value: model.id, label: model.name }))
                }
                promptOptions={
                  outlinePromptOptions.length === 0
                    ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }]
                    : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                }
                onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                onPromptChange={updateOutlinePromptId}
                onModelManage={() => setManagementModal({ type: 'models' })}
                onPromptManage={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
              />
            </div>
          </div>
          <div className="xy-ai-panel-output-slot relative">
            {outlinePreviewDraft.startsWith('[[THINKING') ? (
              <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-with-bottom-count h-full xy-has-value">
                <div
                  className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-gray-600"
                  onMouseDown={() => {
                    if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                  }}
                  style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
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
                {renderDetailOutlineDraftClearButton()}
              </div>
            ) : (
              <div
                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full ${outlinePreviewDraft.trim() ? 'xy-has-value' : ''}`}
              >
                <textarea
                  data-no-modal-drag="true"
                  value={outlinePreviewDraft}
                  onFocus={() => setActiveLibraryFontTarget(isDetailOutlineTab ? 'detailOutline' : 'settingPreview')}
                  onChange={(event) => setOutlinePreviewDraft(event.target.value)}
                  placeholder={
                isDetailOutlineTab
                        ? '生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。'
                        : '生成后的梗概会显示在这里，也可以手动编辑后保存。'
                  }
                  className="editor-scrollbar text-sm leading-6 text-gray-700 outline-none placeholder:text-slate-500 placeholder:font-semibold"
                  style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
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
                {renderDetailOutlineDraftClearButton()}
              </div>
            )}
          </div>
          {isDetailOutlineTab && (
            <LinkedSourceControl
              linked={selectedDetailOutlineReaderItems.length > 0}
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
                isLibraryAiLoading ||
                (!outlineAiInput.trim() && (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0))
              }
              stopDisabled={!isLibraryAiLoading}
              label="请输入要求"
              textareaClassName="editor-scrollbar"
            />
          </div>
          <div className="xy-ai-panel-action-row flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button
              onClick={saveOutlinePreviewDraft}
              disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
              className="min-w-[92px] flex-1 whitespace-nowrap bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
            >
              {isDetailOutlineTab ? '替换章纲' : '保存梗概'}
            </button>
            {isDetailOutlineTab && (
              <button
                onClick={undoDetailOutlineReplacement}
                disabled={!lastDetailOutlineReplacement}
                className="min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:text-gray-300"
              >
                撤销替换
              </button>
            )}
            <button
              onClick={() => void navigator.clipboard.writeText(stripAiThinkingBlock(outlinePreviewDraft))}
              disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
              className="min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
            >
              {isDetailOutlineTab ? '复制章纲' : '复制梗概'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
