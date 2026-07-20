/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- extracted from top-level outline controller statements.
export function createOutlineControllerPhase2(scope: Record<string, any>) {
  const {
    DETAIL_OUTLINE_STATE_MARKER,
    DetailOutlineReaderModal,
    OutlineAiLogModal,
    activeOutlinePrompt,
    activeTab,
    buildDetailOutlineReaderContext,
    clearDraftDetailOutlineReader,
    collapsedDetailOutlineReaderGroups,
    confirmDetailOutlineReader,
    countTextWords,
    detailOutlineReaderOutlineItems,
    detailOutlineReaderPreviewId,
    detailOutlineReaderRoleItems,
    detailOutlineReaderSettingItems,
    detailOutlineReaderTab,
    draftDetailOutlineReaderOutlineIds,
    draftDetailOutlineReaderRoleIds,
    draftDetailOutlineReaderSettingIds,
    getChapterContent,
    getVolumeDisplayIndex,
    isDetailOutlineReaderOpen,
    isDetailOutlineTab,
    isLibraryAiLoading,
    isLibraryAiLogOpen,
    joinAiRequestSections,
    lastOutlineAiRequestLog,
    libraryAiLogScope,
    outlineAiInput,
    outlinePreviewDraft,
    outlinePreviewTitle,
    safeOutlineSelectionType,
    selectedDetailOutlineReaderItems,
    selectedDetailOutlineRoleItems,
    selectedDetailOutlineSettingItems,
    selectedOutlineChapter,
    selectedOutlineModel,
    selectedOutlineVolume,
    setCollapsedDetailOutlineReaderGroups,
    setDetailOutlineReaderPreviewId,
    setDetailOutlineReaderTab,
    setDraftDetailOutlineReaderOutlineIds,
    setDraftDetailOutlineReaderRoleIds,
    setDraftDetailOutlineReaderSettingIds,
    setIsDetailOutlineReaderOpen,
    setIsLibraryAiLogOpen,
    stripAiThinkingBlock,
    toggleDraftDetailOutlineReaderOutline,
    toggleDraftDetailOutlineReaderRole,
    toggleDraftDetailOutlineReaderSetting,
    updateActiveTabConfig,
    wrapAiRequestTag,
  } = scope;
  const outlinePreviewDraftContent = stripAiThinkingBlock(outlinePreviewDraft);
  const outlineDraftFrameTitle =
    safeOutlineSelectionType === 'volume' && selectedOutlineVolume
      ? `${selectedOutlineVolume.name}梗概`
      : selectedOutlineChapter
        ? isDetailOutlineTab
          ? 'AI输出框'
          : `第${selectedOutlineChapter.chapter.serialNumber}章梗概`
        : outlinePreviewTitle;
  const outlineDraftCountLeft = isDetailOutlineTab
    ? '6.2rem'
    : safeOutlineSelectionType === 'volume'
      ? '8.2rem'
      : selectedOutlineChapter
        ? '11.4rem'
        : '6.2rem';
  const shouldShowOutlineDraftWordCount = false;
  const getSelectedOutlineContext = () => {
    if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
      return selectedOutlineVolume.chapters
        .map((chapter) => {
          const content = getChapterContent?.(chapter.id) ?? '';
          return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
        })
        .join('\n\n');
    }
    if (!selectedOutlineChapter) return '';
    const { chapter } = selectedOutlineChapter;
    const content = getChapterContent?.(chapter.id) ?? '';
    return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
  };
  const getOutlineContextTitle = () => {
    if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
      return `${selectedOutlineVolume.name} · ${selectedOutlineVolume.chapters.length}章`;
    }
    if (!selectedOutlineChapter) return '未选择章节';
    return `第${selectedOutlineChapter.chapter.serialNumber}章 ${selectedOutlineChapter.chapter.title}`;
  };
  const getOutlineFullContextTitle = () => {
    const baseTitle = getOutlineContextTitle();
    if (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0) return baseTitle;
    return `${baseTitle} + 读取${selectedDetailOutlineReaderItems.length}项`;
  };
  const getOutlineAiContext = () => {
    const selectedContext = getSelectedOutlineContext();
    const readerContext = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
    if (isDetailOutlineTab) return readerContext;
    return joinAiRequestSections([
      wrapAiRequestTag('待梗概正文', selectedContext, { 标题: getOutlineContextTitle() }),
      readerContext,
    ]);
  };
  const formatOutlineUserTextForAi = (userText: string) => {
    if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);
    return wrapAiRequestTag('梗概要求', userText);
  };
  const getOutlineDefaultPrompt = () =>
    isDetailOutlineTab
      ? `请根据关联的设定和前文章纲生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}，按人物状态、道具状态、势力状态、关系状态、线索/信息列出本章预计变化；这里不是正式状态库，只是本章写作计划。`
      : '请根据所选章节正文生成章节梗概。';
  const buildOutlineAiRequestLog = (
    userText: string,
    contextText: string,
    promptText: string,
    createdAt = '当前预览',
    visibleUserText = userText,
  ): LibraryAiRequestLog => {
    const readerContextText = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
    return {
      createdAt,
      tab: isDetailOutlineTab ? '生成章纲' : '章节梗概',
      modelName: selectedOutlineModel?.name ?? '未选择模型',
      promptName: activeOutlinePrompt?.name ?? '默认提示词',
      hasLinkedBrainstorm: false,
      linkedBrainstormTitle: '',
      visibleUserText,
      systemPrompt: promptText,
      userContent: userText,
      contextTitle: contextText ? getOutlineFullContextTitle() : '',
      contextText,
      contextWordCount: countTextWords(contextText),
      readerContextTitle:
        selectedDetailOutlineReaderItems.length > 0 ? `已关联 ${selectedDetailOutlineReaderItems.length} 项` : '',
      readerContextText,
      readerContextWordCount: countTextWords(readerContextText),
    };
  };
  const previewOutlineContextText = getOutlineAiContext();
  const previewOutlinePromptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
  const shouldShowOutlineBodyContext = !isDetailOutlineTab;
  const visibleOutlineAiRequestLog =
    (isLibraryAiLogOpen && libraryAiLogScope === 'outline'
      ? buildOutlineAiRequestLog(
          formatOutlineUserTextForAi(outlineAiInput.trim()),
          previewOutlineContextText,
          previewOutlinePromptText,
          '当前预览',
          outlineAiInput.trim(),
        )
      : null) ?? lastOutlineAiRequestLog;
  const outlineUserLogTitle = isDetailOutlineTab ? '其他要求' : '输入内容';
  const outlineAiLogModal =
    isLibraryAiLogOpen && libraryAiLogScope === 'outline' && visibleOutlineAiRequestLog ? (
      <OutlineAiLogModal
        activeTab={activeTab}
        requestLog={visibleOutlineAiRequestLog}
        isDetailOutlineTab={isDetailOutlineTab}
        shouldShowOutlineBodyContext={shouldShowOutlineBodyContext}
        outlineUserLogTitle={outlineUserLogTitle}
        onClose={() => setIsLibraryAiLogOpen(false)}
      />
    ) : null;
  const draftDetailOutlineReaderItems = [
    ...detailOutlineReaderSettingItems.filter((item) => draftDetailOutlineReaderSettingIds.has(item.id)),
    ...detailOutlineReaderRoleItems.filter((item) => draftDetailOutlineReaderRoleIds.has(item.id)),
    ...detailOutlineReaderOutlineItems.filter((item) => draftDetailOutlineReaderOutlineIds.has(item.id)),
  ];
  const draftDetailOutlineReaderWordCount = draftDetailOutlineReaderItems.reduce(
    (sum, item) => sum + countTextWords(item.content),
    0,
  );
  const activeDetailOutlineReaderItems =
    detailOutlineReaderTab === 'settings'
      ? detailOutlineReaderSettingItems
      : detailOutlineReaderTab === 'roles'
        ? detailOutlineReaderRoleItems
        : detailOutlineReaderOutlineItems;
  const activeDetailOutlineReaderPreviewItem =
    activeDetailOutlineReaderItems.find((item) => item.id === detailOutlineReaderPreviewId) ?? null;
  const isActiveDetailOutlineReaderPreviewChecked = activeDetailOutlineReaderPreviewItem
    ? detailOutlineReaderTab === 'settings'
      ? draftDetailOutlineReaderSettingIds.has(activeDetailOutlineReaderPreviewItem.id)
      : detailOutlineReaderTab === 'roles'
        ? draftDetailOutlineReaderRoleIds.has(activeDetailOutlineReaderPreviewItem.id)
        : draftDetailOutlineReaderOutlineIds.has(activeDetailOutlineReaderPreviewItem.id)
    : false;
  const detailOutlineReaderNavGroups = Array.from(
    activeDetailOutlineReaderItems.reduce((map, item) => {
      map.set(item.group, [...(map.get(item.group) ?? []), item]);
      return map;
    }, new Map<string, typeof activeDetailOutlineReaderItems>()),
  ).map(([group, items]) => ({ group, items }));
  const toggleDetailOutlineReaderGroup = (group: string) => {
    const key = `${detailOutlineReaderTab}:${group}`;
    setCollapsedDetailOutlineReaderGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const setDraftDetailOutlineReaderIdsForActiveTab = (ids: Set<string>) => {
    if (detailOutlineReaderTab === 'settings') setDraftDetailOutlineReaderSettingIds(ids);
    else if (detailOutlineReaderTab === 'roles') setDraftDetailOutlineReaderRoleIds(ids);
    else setDraftDetailOutlineReaderOutlineIds(ids);
  };
  const getDraftDetailOutlineReaderIdsForActiveTab = () =>
    detailOutlineReaderTab === 'settings'
      ? draftDetailOutlineReaderSettingIds
      : detailOutlineReaderTab === 'roles'
        ? draftDetailOutlineReaderRoleIds
      : draftDetailOutlineReaderOutlineIds;
  const selectAllActiveDetailOutlineReaderItems = () => {
    setDraftDetailOutlineReaderIdsForActiveTab(new Set(activeDetailOutlineReaderItems.map((item) => item.id)));
  };
  const toggleActiveDetailOutlineReaderGroupSelection = (items: typeof activeDetailOutlineReaderItems) => {
    const current = getDraftDetailOutlineReaderIdsForActiveTab();
    const next = new Set(current);
    const allSelected = items.every((item) => next.has(item.id));
    for (const item of items) {
      if (allSelected) next.delete(item.id);
      else next.add(item.id);
    }
    setDraftDetailOutlineReaderIdsForActiveTab(next);
  };
  const detailOutlineReaderModal = (
    <DetailOutlineReaderModal
      isDetailOutlineReaderOpen={isDetailOutlineReaderOpen}
      isDetailOutlineTab={isDetailOutlineTab}
      detailOutlineReaderTab={detailOutlineReaderTab}
      activeDetailOutlineReaderItems={activeDetailOutlineReaderItems}
      detailOutlineReaderNavGroups={detailOutlineReaderNavGroups}
      collapsedDetailOutlineReaderGroups={collapsedDetailOutlineReaderGroups}
      draftDetailOutlineReaderSettingIds={draftDetailOutlineReaderSettingIds}
      draftDetailOutlineReaderRoleIds={draftDetailOutlineReaderRoleIds}
      draftDetailOutlineReaderOutlineIds={draftDetailOutlineReaderOutlineIds}
      activeDetailOutlineReaderPreviewItem={activeDetailOutlineReaderPreviewItem}
      isActiveDetailOutlineReaderPreviewChecked={isActiveDetailOutlineReaderPreviewChecked}
      draftDetailOutlineReaderItems={draftDetailOutlineReaderItems}
      draftDetailOutlineReaderWordCount={draftDetailOutlineReaderWordCount}
      detailOutlineReaderSettingItems={detailOutlineReaderSettingItems}
      detailOutlineReaderRoleItems={detailOutlineReaderRoleItems}
      setIsDetailOutlineReaderOpen={setIsDetailOutlineReaderOpen}
      setDetailOutlineReaderTab={setDetailOutlineReaderTab}
      setDetailOutlineReaderPreviewId={setDetailOutlineReaderPreviewId}
      selectAllActiveDetailOutlineReaderItems={selectAllActiveDetailOutlineReaderItems}
      toggleDetailOutlineReaderGroup={toggleDetailOutlineReaderGroup}
      toggleActiveDetailOutlineReaderGroupSelection={toggleActiveDetailOutlineReaderGroupSelection}
      toggleDraftDetailOutlineReaderSetting={toggleDraftDetailOutlineReaderSetting}
      toggleDraftDetailOutlineReaderRole={toggleDraftDetailOutlineReaderRole}
      toggleDraftDetailOutlineReaderOutline={toggleDraftDetailOutlineReaderOutline}
      clearDraftDetailOutlineReader={clearDraftDetailOutlineReader}
      confirmDetailOutlineReader={confirmDetailOutlineReader}
    />
  );
  return {
    activeDetailOutlineReaderItems,
    activeDetailOutlineReaderPreviewItem,
    buildOutlineAiRequestLog,
    detailOutlineReaderModal,
    detailOutlineReaderNavGroups,
    draftDetailOutlineReaderItems,
    draftDetailOutlineReaderWordCount,
    formatOutlineUserTextForAi,
    getDraftDetailOutlineReaderIdsForActiveTab,
    getOutlineAiContext,
    getOutlineContextTitle,
    getOutlineDefaultPrompt,
    getOutlineFullContextTitle,
    getSelectedOutlineContext,
    isActiveDetailOutlineReaderPreviewChecked,
    outlineAiLogModal,
    outlineDraftCountLeft,
    outlineDraftFrameTitle,
    outlinePreviewDraftContent,
    outlineUserLogTitle,
    previewOutlineContextText,
    previewOutlinePromptText,
    selectAllActiveDetailOutlineReaderItems,
    setDraftDetailOutlineReaderIdsForActiveTab,
    shouldShowOutlineBodyContext,
    shouldShowOutlineDraftWordCount,
    toggleActiveDetailOutlineReaderGroupSelection,
    toggleDetailOutlineReaderGroup,
    visibleOutlineAiRequestLog,
  };
}
