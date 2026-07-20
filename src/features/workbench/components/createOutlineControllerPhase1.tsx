/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- extracted from top-level outline controller statements.
export function createOutlineControllerPhase1(scope: Record<string, any>) {
  const {
    CHAPTER_DETAIL_OUTLINE_TAB,
    CHAPTER_SUMMARY_TAB,
    DETAIL_OUTLINE_PROMPT_CATEGORY,
    DETAIL_OUTLINE_TAB,
    LEGACY_VOLUME_SUMMARY_TAB,
    LEGACY_VOLUME_SUMMARY_TAB_OLD,
    OUTLINE_LIBRARY_TAB,
    ROLE_TAB,
    SETTING_TAB,
    SUMMARY_PROMPT_CATEGORY,
    VOLUME_SUMMARY_TAB,
    activeTab,
    activeTabConfig,
    buildRoleReaderContent,
    countTextWords,
    createWorkbenchLibraryEntry,
    draftDetailOutlineReaderOutlineIds,
    draftDetailOutlineReaderRoleIds,
    draftDetailOutlineReaderSettingIds,
    entries,
    forceOutlineSelectionRefresh,
    getWorkbenchAssociationRuntimeId,
    group,
    isDetailOutlineLikeTab,
    isWorkbenchAssociationRuntimeCurrent,
    joinAiRequestSections,
    lastDetailOutlineReplacement,
    manualDetailOutlinePublishedChapterIds,
    models,
    normalizeEntries,
    normalizePromptCategoryName,
    outlineEntries,
    outlinePreviewDraft,
    outlineSelectionType,
    outlineStorageKey,
    parseRoleContent,
    parseSettingContent,
    persist,
    prompts,
    roleTypeOptions,
    selectedOutlineChapterId,
    selectedOutlineVolumeId,
    setDetailOutlineChapterMenu,
    setDetailOutlineReaderPreviewId,
    setDetailOutlineReaderTab,
    setDraftDetailOutlineReaderOutlineIds,
    setDraftDetailOutlineReaderRoleIds,
    setDraftDetailOutlineReaderSettingIds,
    setExpandedOutlineVolumeIds,
    setIsDetailOutlineReaderOpen,
    setLastDetailOutlineReplacement,
    setManualDetailOutlinePublishedChapterIds,
    setOutlineEntries,
    setOutlinePreviewDraft,
    setOutlineSelectionType,
    setSelectedId,
    setSelectedOutlineChapterId,
    setSelectedOutlineVolumeId,
    setShowDetailOutlinePublished,
    settingLibraryLeftWidth,
    settingTypeOptions,
    stopBackgroundAiTask,
    stripAiThinkingBlock,
    suppressNextOutlinePreviewSyncRef,
    updateActiveTabConfig,
    volumes,
    wrapAiRequestTag,
    writeWorkbenchLibraryEntries,
  } = scope;
  const isDetailOutlineTab = activeTab === DETAIL_OUTLINE_TAB;
  const enableVolumeSummary = !isDetailOutlineTab;
  const outlineChapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
  const safeOutlineSelectionType = isDetailOutlineTab ? 'chapter' : outlineSelectionType;
  const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
  const persistCurrentOutline = (next: WorkbenchLibraryEntry[]) => {
    if (activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey) {
      const normalized = normalizeEntries(next);
      setOutlineEntries(normalized);
      writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
      return;
    }
    persist(next);
  };
  const updateOutlineEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    const next = currentOutlineEntries.map((entry) =>
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') } : entry,
    );
    persistCurrentOutline(next);
  };
  const chapterEntries = currentOutlineEntries.filter((entry) => entry.tab === outlineChapterTab);
  const volumeEntries = enableVolumeSummary
    ? currentOutlineEntries.filter(
        (entry) =>
          entry.tab === VOLUME_SUMMARY_TAB ||
          entry.tab === LEGACY_VOLUME_SUMMARY_TAB ||
          entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD,
      )
    : [];
  const outlineChapters = volumes.flatMap((volume) =>
    [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber).map((chapter) => ({ volume, chapter })),
  );
  const isDetailOutlineChapterPublished = (chapter: Chapter) =>
    Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);
  const filterDetailOutlineVolumesByPublishState = (published: boolean) =>
    volumes.map((volume) => ({
      ...volume,
      chapters: [...volume.chapters]
        .filter((chapter) => isDetailOutlineChapterPublished(chapter) === published)
        .sort((a, b) => a.serialNumber - b.serialNumber),
    }));
  const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);
  const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);
  const detailOutlineUnpublishedCount = detailOutlineUnpublishedVolumes.reduce(
    (sum, volume) => sum + volume.chapters.length,
    0,
  );
  const detailOutlinePublishedCount = detailOutlinePublishedVolumes.reduce(
    (sum, volume) => sum + volume.chapters.length,
    0,
  );
  const selectedOutlineChapter =
    outlineChapters.find((item) => item.chapter.id === selectedOutlineChapterId) ?? outlineChapters[0] ?? null;
  const selectedOutlineVolume = volumes.find((volume) => volume.id === selectedOutlineVolumeId) ?? volumes[0] ?? null;
  const effectiveSelectedOutlineChapterId =
    safeOutlineSelectionType === 'chapter'
      ? (selectedOutlineChapterId ?? selectedOutlineChapter?.chapter.id ?? null)
      : null;
  const getChapterSummaryTitle = (serialNumber: number) =>
    isDetailOutlineTab ? `第${serialNumber}章细纲` : `第${serialNumber}章梗概`;
  const getLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章摘要`;
  const getOlderLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章概要`;
  const getChapterSummaryDisplayTitle = (serialNumber: number) =>
    isDetailOutlineTab ? `第${serialNumber}章章纲` : getChapterSummaryTitle(serialNumber);
  const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}梗概`;
  const getLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}摘要`;
  const getOlderLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
  const getChapterSummaryEntry = (serialNumber: number) =>
    chapterEntries.find(
      (entry) =>
        entry.title === getChapterSummaryTitle(serialNumber) ||
        entry.title === getLegacyChapterSummaryTitle(serialNumber) ||
        entry.title === getOlderLegacyChapterSummaryTitle(serialNumber) ||
        entry.title === getChapterSummaryDisplayTitle(serialNumber),
    );
  const getVolumeSummaryEntry = (volumeName: string) =>
    volumeEntries.find(
      (entry) =>
        entry.title === getVolumeSummaryTitle(volumeName) ||
        entry.title === getLegacyVolumeSummaryTitle(volumeName) ||
        entry.title === getOlderLegacyVolumeSummaryTitle(volumeName),
    );
  const selectedOutlineEntry = selectedOutlineChapter
    ? getChapterSummaryEntry(selectedOutlineChapter.chapter.serialNumber)
    : null;
  const selectedVolumeEntry = selectedOutlineVolume ? getVolumeSummaryEntry(selectedOutlineVolume.name) : null;
  const getVolumeDisplayIndex = (volumeId: number) => {
    const index = volumes.findIndex((item) => item.id === volumeId);
    return index >= 0 ? index + 1 : 1;
  };
  const getOutlineChapterFrameTitle = (volume: Volume, chapter: Chapter) =>
    isDetailOutlineTab
      ? `第${chapter.serialNumber}章章纲`
      : `第${chapter.serialNumber}章梗概（第${getVolumeDisplayIndex(volume.id)}卷）`;
  const updateChapterSummary = (serialNumber: number, content: string) => {
    const title = getChapterSummaryTitle(serialNumber);
    const existing = getChapterSummaryEntry(serialNumber);
    if (existing) {
      updateOutlineEntry(existing.id, { content });
      return;
    }
    const entry = {
      ...createWorkbenchLibraryEntry(outlineChapterTab, title),
      content,
    };
    persistCurrentOutline([entry, ...currentOutlineEntries]);
    setSelectedId(entry.id);
  };
  const updateVolumeSummary = (volumeName: string, content: string) => {
    const title = getVolumeSummaryTitle(volumeName);
    const existing = getVolumeSummaryEntry(volumeName);
    if (existing) {
      updateOutlineEntry(existing.id, { content });
      return;
    }
    const entry = {
      ...createWorkbenchLibraryEntry(VOLUME_SUMMARY_TAB, title),
      content,
    };
    persistCurrentOutline([entry, ...currentOutlineEntries]);
    setSelectedId(entry.id);
  };
  const clearOutlineAiOutputDraft = () => {
    if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
    updateActiveTabConfig({ outlineAiTaskId: undefined });
    setOutlinePreviewDraft('');
  };
  const renderDetailOutlineDraftClearButton = () => {
    if (!isDetailOutlineTab || !selectedOutlineChapter) return null;
    return (
      <button
        type="button"
        onClick={clearOutlineAiOutputDraft}
        className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600"
      >
        清空
      </button>
    );
  };
  const saveOutlinePreviewDraft = () => {
    const cleanDraft = stripAiThinkingBlock(outlinePreviewDraft);
    if (isDetailOutlineTab) {
      if (selectedOutlineChapter) {
        setLastDetailOutlineReplacement({
          chapterSerialNumber: selectedOutlineChapter.chapter.serialNumber,
          content: selectedOutlineEntry?.content ?? '',
          draft: outlinePreviewDraft,
        });
        suppressNextOutlinePreviewSyncRef.current = true;
        updateActiveTabConfig({ outlineAiTaskId: undefined });
        updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
        setOutlinePreviewDraft('');
      }
      return;
    }
    if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
      updateVolumeSummary(selectedOutlineVolume.name, cleanDraft);
      setOutlinePreviewDraft(cleanDraft);
      return;
    }
    if (selectedOutlineChapter) {
      updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
      setOutlinePreviewDraft(cleanDraft);
    }
  };
  const undoDetailOutlineReplacement = () => {
    if (!lastDetailOutlineReplacement) return;
    updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);
    setOutlinePreviewDraft(lastDetailOutlineReplacement.draft);
    setLastDetailOutlineReplacement(null);
  };
  const selectOutlineChapter = (chapterId: number, serialNumber: number) => {
    forceOutlineSelectionRefresh((value) => value + 1);
    setOutlineSelectionType('chapter');
    setSelectedOutlineChapterId(chapterId);
    setSelectedOutlineVolumeId(null);
    updateActiveTabConfig({ selectedOutlineChapterId: chapterId });
    const entry = getChapterSummaryEntry(serialNumber);
    setSelectedId(entry?.id ?? null);
    if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');
  };
  const selectOutlineVolume = (volume: Volume) => {
    forceOutlineSelectionRefresh((value) => value + 1);
    setOutlineSelectionType('volume');
    setSelectedOutlineVolumeId(volume.id);
    setSelectedOutlineChapterId(null);
    updateActiveTabConfig({ selectedOutlineChapterId: null });
    const entry = getVolumeSummaryEntry(volume.name);
    setSelectedId(entry?.id ?? null);
    setOutlinePreviewDraft(entry?.content ?? '');
  };
  const toggleOutlineVolume = (volumeId: number) => {
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      if (next.has(volumeId)) next.delete(volumeId);
      else next.add(volumeId);
      return next;
    });
  };
  const moveDetailOutlineChapterToPublished = (chapterId: number) => {
    setManualDetailOutlinePublishedChapterIds((prev) => {
      const next = new Set(prev);
      next.add(chapterId);
      return next;
    });
    setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    setShowDetailOutlinePublished(true);
  };
  const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {
    if (chapter.isPublished) return;
    setManualDetailOutlinePublishedChapterIds((prev) => {
      const next = new Set(prev);
      next.delete(chapter.id);
      return next;
    });
    setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
  };
  const outlineSidebarWidth = settingLibraryLeftWidth;
  const outlinePreviewTitle = isDetailOutlineTab
    ? 'AI输出章纲'
    : safeOutlineSelectionType === 'volume'
      ? '卷梗概预览'
      : '章节梗概';
  const outlinePromptCategory = isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : SUMMARY_PROMPT_CATEGORY;
  const outlinePromptOptions = prompts.filter(
    (prompt) => normalizePromptCategoryName(prompt.category) === outlinePromptCategory,
  );
  const configuredOutlinePromptId = isDetailOutlineTab
    ? (activeTabConfig.detailOutlinePromptId ?? activeTabConfig.promptId)
    : (activeTabConfig.outlineSummaryPromptId ?? activeTabConfig.promptId);
  const activeOutlinePromptId = outlinePromptOptions.some((prompt) => prompt.id === configuredOutlinePromptId)
    ? configuredOutlinePromptId
    : '';
  const activeOutlinePrompt =
    outlinePromptOptions.find((prompt) => prompt.id === activeOutlinePromptId) ?? outlinePromptOptions[0] ?? null;
  const updateOutlinePromptId = (value: string) => {
    if (isDetailOutlineTab) {
      updateActiveTabConfig({ detailOutlinePromptId: value });
      return;
    }
    updateActiveTabConfig({ outlineSummaryPromptId: value });
  };
  const selectedOutlineModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
  const outlineModelFieldSizeKey: WorkbenchFieldSizeKey = isDetailOutlineTab
    ? 'detailOutlineModelSelect'
    : 'outlineSummaryModelSelect';
  const outlineAiInput = activeTabConfig.outlineAiInput ?? '';
  const setOutlineAiInput = (value: string) => updateActiveTabConfig({ outlineAiInput: value });
  const detailOutlineReaderSettingEntries = settingTypeOptions.flatMap((type) =>
    entries.filter((entry) => entry.tab === SETTING_TAB && parseSettingContent(entry.content).type === type),
  );
  const detailOutlineReaderRoleEntries = roleTypeOptions.flatMap((type) =>
    entries
      .filter((entry) => entry.tab === ROLE_TAB && parseRoleContent(entry.content).type === type)
      .map((entry, index) => ({ entry, index }))
      .sort((left, right) => {
        const leftPinned = typeof left.entry.pinnedAt === 'number';
        const rightPinned = typeof right.entry.pinnedAt === 'number';
        if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
        if (leftPinned) return -1;
        if (rightPinned) return 1;
        return left.index - right.index;
      })
      .map(({ entry }) => entry),
  );
  const detailOutlineReaderSettingItems = detailOutlineReaderSettingEntries
    .map((entry) => {
      const parsed = parseSettingContent(entry.content);
      const content = parsed.body || entry.content || '';
      return {
        id: entry.id,
        title: entry.title || '未命名设定',
        group: parsed.type || '未分类',
        content,
      };
    })
    .filter((item) => item.content.trim());
  const detailOutlineReaderRoleItems = detailOutlineReaderRoleEntries
    .map((entry) => {
      const parsed = parseRoleContent(entry.content);
      return {
        id: entry.id,
        title: entry.title || '未命名角色',
        group: parsed.type || '未分类',
        content: buildRoleReaderContent(entry, parsed),
      };
    })
    .filter((item) => item.content.trim());
  const hasCurrentDetailOutlineReaderSession = isWorkbenchAssociationRuntimeCurrent(
    activeTabConfig.detailOutlineReaderSessionId,
  );
  const inheritedDetailOutlineSettingIds =
    hasCurrentDetailOutlineReaderSession &&
    isDetailOutlineTab &&
    !activeTabConfig.detailOutlineReaderTouched &&
    activeTabConfig.detailOutlineReaderSettingIds === undefined
      ? detailOutlineReaderSettingItems.map((item) => item.id)
      : hasCurrentDetailOutlineReaderSession
        ? (activeTabConfig.detailOutlineReaderSettingIds ?? [])
        : [];
  const selectedDetailOutlineSettingIds = new Set(inheritedDetailOutlineSettingIds);
  const selectedDetailOutlineRoleIds = new Set(
    hasCurrentDetailOutlineReaderSession ? (activeTabConfig.detailOutlineReaderRoleIds ?? []) : [],
  );
  const detailOutlineReaderOutlineLimitSerial =
    selectedOutlineChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
  const detailOutlineReaderOutlineItems = outlineChapters
    .filter(({ chapter }) => chapter.serialNumber < detailOutlineReaderOutlineLimitSerial)
    .map(({ volume, chapter }) => {
      const entry = getChapterSummaryEntry(chapter.serialNumber);
      return {
        id: String(chapter.id),
        title: `第${chapter.serialNumber}章章纲`,
        group: volume.name,
        content: entry?.content ?? '',
      };
    })
    .filter((item) => item.content.trim());
  const selectedDetailOutlineOutlineIds = new Set(
    hasCurrentDetailOutlineReaderSession ? (activeTabConfig.detailOutlineReaderOutlineIds ?? []) : [],
  );
  const selectedDetailOutlineSettingItems = detailOutlineReaderSettingItems.filter((item) =>
    selectedDetailOutlineSettingIds.has(item.id),
  );
  const selectedDetailOutlineRoleItems = detailOutlineReaderRoleItems.filter((item) =>
    selectedDetailOutlineRoleIds.has(item.id),
  );
  const selectedDetailOutlineOutlineItems = detailOutlineReaderOutlineItems.filter((item) =>
    selectedDetailOutlineOutlineIds.has(item.id),
  );
  const selectedDetailOutlineReaderItems = [
    ...selectedDetailOutlineSettingItems,
    ...selectedDetailOutlineRoleItems,
    ...selectedDetailOutlineOutlineItems,
  ];
  const detailOutlineReaderWordCount = selectedDetailOutlineReaderItems.reduce(
    (sum, item) => sum + countTextWords(item.content),
    0,
  );
  const buildDetailOutlineReaderContext = () => {
    const settingText = selectedDetailOutlineSettingItems
      .filter((item) => item.content.trim())
      .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
      .join('\n\n');
    const outlineText = selectedDetailOutlineOutlineItems
      .filter((item) => item.content.trim())
      .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
      .join('\n\n');
    const roleText = selectedDetailOutlineRoleItems
      .filter((item) => item.content.trim())
      .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
      .join('\n\n');
    const innerContext = joinAiRequestSections([
      wrapAiRequestTag('设定资料', settingText),
      wrapAiRequestTag('角色资料', roleText),
      wrapAiRequestTag('前文章纲', outlineText),
    ]);
    return wrapAiRequestTag('关联资料', innerContext);
  };
  const openDetailOutlineReader = () => {
    setDraftDetailOutlineReaderSettingIds(new Set(selectedDetailOutlineSettingIds));
    setDraftDetailOutlineReaderRoleIds(new Set(selectedDetailOutlineRoleIds));
    setDraftDetailOutlineReaderOutlineIds(new Set(selectedDetailOutlineOutlineIds));
    setDetailOutlineReaderTab('outlines');
    setDetailOutlineReaderPreviewId('');
    setIsDetailOutlineReaderOpen(true);
  };
  const clearDraftDetailOutlineReader = () => {
    setDraftDetailOutlineReaderSettingIds(new Set());
    setDraftDetailOutlineReaderRoleIds(new Set());
    setDraftDetailOutlineReaderOutlineIds(new Set());
  };
  const confirmDetailOutlineReader = () => {
    const validSettingIds = detailOutlineReaderSettingItems.map((item) => item.id);
    const validRoleIds = detailOutlineReaderRoleItems.map((item) => item.id);
    const validOutlineIds = detailOutlineReaderOutlineItems.map((item) => item.id);
    const nextSettingIds = Array.from(draftDetailOutlineReaderSettingIds).filter((id) => validSettingIds.includes(id));
    const nextRoleIds = Array.from(draftDetailOutlineReaderRoleIds).filter((id) => validRoleIds.includes(id));
    const nextOutlineIds = Array.from(draftDetailOutlineReaderOutlineIds).filter((id) => validOutlineIds.includes(id));
    const hasSelectedReaderItems = nextSettingIds.length > 0 || nextRoleIds.length > 0 || nextOutlineIds.length > 0;
    updateActiveTabConfig({
      detailOutlineReaderSessionId: hasSelectedReaderItems ? getWorkbenchAssociationRuntimeId() : null,
      detailOutlineReaderTouched: true,
      detailOutlineReaderSettingIds: nextSettingIds,
      detailOutlineReaderRoleIds: nextRoleIds,
      detailOutlineReaderOutlineIds: nextOutlineIds,
    });
    setIsDetailOutlineReaderOpen(false);
  };
  const clearDetailOutlineReaderSelection = () => {
    updateActiveTabConfig({
      detailOutlineReaderSessionId: null,
      detailOutlineReaderTouched: true,
      detailOutlineReaderSettingIds: [],
      detailOutlineReaderRoleIds: [],
      detailOutlineReaderOutlineIds: [],
    });
    setDraftDetailOutlineReaderSettingIds(new Set());
    setDraftDetailOutlineReaderRoleIds(new Set());
    setDraftDetailOutlineReaderOutlineIds(new Set());
  };
  const toggleDraftDetailOutlineReaderSetting = (id: string) => {
    setDraftDetailOutlineReaderSettingIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDraftDetailOutlineReaderRole = (id: string) => {
    setDraftDetailOutlineReaderRoleIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDraftDetailOutlineReaderOutline = (id: string) => {
    setDraftDetailOutlineReaderOutlineIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return {
    activeOutlinePrompt,
    activeOutlinePromptId,
    buildDetailOutlineReaderContext,
    chapterEntries,
    clearDetailOutlineReaderSelection,
    clearDraftDetailOutlineReader,
    clearOutlineAiOutputDraft,
    configuredOutlinePromptId,
    confirmDetailOutlineReader,
    currentOutlineEntries,
    detailOutlinePublishedCount,
    detailOutlinePublishedVolumes,
    detailOutlineReaderOutlineItems,
    detailOutlineReaderOutlineLimitSerial,
    detailOutlineReaderRoleEntries,
    detailOutlineReaderRoleItems,
    detailOutlineReaderSettingEntries,
    detailOutlineReaderSettingItems,
    detailOutlineReaderWordCount,
    detailOutlineUnpublishedCount,
    detailOutlineUnpublishedVolumes,
    effectiveSelectedOutlineChapterId,
    enableVolumeSummary,
    filterDetailOutlineVolumesByPublishState,
    getChapterSummaryDisplayTitle,
    getChapterSummaryEntry,
    getChapterSummaryTitle,
    getLegacyChapterSummaryTitle,
    getLegacyVolumeSummaryTitle,
    getOlderLegacyChapterSummaryTitle,
    getOlderLegacyVolumeSummaryTitle,
    getOutlineChapterFrameTitle,
    getVolumeDisplayIndex,
    getVolumeSummaryEntry,
    getVolumeSummaryTitle,
    hasCurrentDetailOutlineReaderSession,
    inheritedDetailOutlineSettingIds,
    isDetailOutlineChapterPublished,
    isDetailOutlineTab,
    moveDetailOutlineChapterToPublished,
    moveDetailOutlineChapterToUnpublished,
    openDetailOutlineReader,
    outlineAiInput,
    outlineChapterTab,
    outlineChapters,
    outlineModelFieldSizeKey,
    outlinePreviewTitle,
    outlinePromptCategory,
    outlinePromptOptions,
    outlineSidebarWidth,
    persistCurrentOutline,
    renderDetailOutlineDraftClearButton,
    safeOutlineSelectionType,
    saveOutlinePreviewDraft,
    selectOutlineChapter,
    selectOutlineVolume,
    selectedDetailOutlineOutlineIds,
    selectedDetailOutlineOutlineItems,
    selectedDetailOutlineReaderItems,
    selectedDetailOutlineRoleIds,
    selectedDetailOutlineRoleItems,
    selectedDetailOutlineSettingIds,
    selectedDetailOutlineSettingItems,
    selectedOutlineChapter,
    selectedOutlineEntry,
    selectedOutlineModel,
    selectedOutlineVolume,
    selectedVolumeEntry,
    setOutlineAiInput,
    toggleDraftDetailOutlineReaderOutline,
    toggleDraftDetailOutlineReaderRole,
    toggleDraftDetailOutlineReaderSetting,
    toggleOutlineVolume,
    undoDetailOutlineReplacement,
    updateChapterSummary,
    updateOutlineEntry,
    updateOutlinePromptId,
    updateVolumeSummary,
    volumeEntries,
  };
}
