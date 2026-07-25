/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- controller phase keeps the original top-level statement order intact.
import { useWorkbenchLibraryEntryActions } from './useWorkbenchLibraryEntryActions';
import { useLayoutEffect, useRef } from 'react';

export function useWorkbenchLibraryControllerPhase2(scope: Record<string, any>) {
  const {
    BRAINSTORM_GENERATE_RULE_TEXT,
    BRAINSTORM_GENERATE_TASK_TEXT,
    BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
    BRAINSTORM_QUESTION_FIELDS,
    BRAINSTORM_TAB,
    CHAPTER_DETAIL_OUTLINE_TAB,
    CHAPTER_SUMMARY_TAB,
    DETAIL_OUTLINE_TAB,
    GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
    LEGACY_VOLUME_SUMMARY_TAB,
    LEGACY_VOLUME_SUMMARY_TAB_OLD,
    OUTLINE_LIBRARY_TAB,
    ROLE_TAB,
    SETTING_LIBRARY_TABS,
    VOLUME_SUMMARY_TAB,
    WORKBENCH_LIBRARY_UPDATED_EVENT,
    WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
    WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
    activeTab,
    animatedAiOutput,
    brainstormPreviewWidth,
    brainstormQuestionDraft,
    categoryMenu,
    defaultActiveTab,
    detailOutlineChapterMenu,
    entries,
    entryMenu,
    expandedOutlineVolumeIds,
    expandedRoleTypes,
    expandedSettingTypes,
    getActiveTabStorageKey,
    getBrainstormRecycleStorageKey,
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    hasStoredExpandedNumberSet,
    isDetailOutlineLikeTab,
    isLibraryAiLoading,
    isMaleProtagonistRoleType,
    libraryAiAutoScrollRef,
    libraryAiOutputRef,
    libraryAiProgrammaticScrollRef,
    manualDetailOutlinePublishedChapterIds,
    normalizeBrainstormCountValue,
    normalizeTabName,
    normalizedTabs,
    customRoleTypes,
    hiddenRoleTypes,
    outlineEntries,
    outlineExpandedReloadRef,
    outlinePreviewRefs,
    outlineSelectionType,
    outlineSettingScope,
    outlineStorageKey,
    parseRoleContent,
    persistExpandedNumberSet,
    persistExpandedStringSet,
    persistManualDetailOutlinePublishedChapterIds,
    promptDisableMenu,
    readActiveTab,
    readBrainstormPreviewWidth,
    readBrainstormRecycleEntries,
    readCustomRoleTypes,
    readCustomSettingTypeDomains,
    readCustomSettingTypes,
    readExpandedNumberSet,
    readExpandedStringSet,
    readHiddenRoleTypes,
    readHiddenSettingTypes,
    readManualDetailOutlinePublishedChapterIds,
    readNormalizedEntries,
    readNormalizedEntriesWithVisibleDefaults,
    readSettingLibraryLeftWidth,
    readSettingLibraryRightWidth,
    readSharedWorkbenchLeftNavWidthEnabled,
    readTabConfigs,
    roleExpandedReloadRef,
    scale,
    selectedId,
    selectedOutlineChapterId,
    selectedOutlineVolumeId,
    setActiveTab,
    setBrainstormGenerateDraft,
    setBrainstormPreviewWidth,
    setBrainstormQuestionDraft,
    setBrainstormRecycleEntries,
    setCategoryMenu,
    setCustomRoleTypes,
    setCustomSettingTypeDomains,
    setCustomSettingTypes,
    setDetailOutlineChapterMenu,
    setEntries,
    setEntryMenu,
    setExpandedOutlineVolumeIds,
    setExpandedRoleTypes,
    setExpandedSettingTypes,
    setHeaderToolPortalTarget,
    setHiddenRoleTypes,
    setHiddenSettingTypes,
    setLoadingDotCount,
    setManualDetailOutlinePublishedChapterIds,
    setOutlineEntries,
    setOutlinePreviewDraft,
    setOutlineSelectionType,
    setPromptDisableMenu,
    setSelectedId,
    setSelectedIdForTab,
    setSelectedOutlineVolumeId,
    setSettingLibraryLeftWidth,
    setSettingLibraryRightWidth,
    setSettingTypeDraft,
    setShowDetailOutlinePublished,
    setTabConfigs,
    setTabPortalTarget,
    settingCreateTypeDraft,
    settingExpandedReloadRef,
    settingLibraryLeftWidth,
    settingLibraryRightWidth,
    settingTitleDraft,
    settingTypeDraft,
    settingTypeOptionsRef,
    storageKey,
    suppressNextOutlinePreviewSyncRef,
    tabConfigs,
    tabs,
    updateTabConfig,
    useCallback,
    useEffect,
    useMemo,
    useWorkbenchLibraryResizeHandles,
    volumes,
  } = scope;
  const initializedStorageKeyRef = useRef(storageKey);
  const setBrainstormQuestionField = (key: BrainstormQuestionKey, value: string) => {
    setBrainstormQuestionDraft((current) => ({
      ...current,
      [key]: key === 'brainstormCount' ? normalizeBrainstormCountValue(value) : value,
    }));
  };
  const hasBrainstormQuestionContent = (draft: BrainstormQuestionDraft) =>
    BRAINSTORM_QUESTION_FIELDS.some((field) => draft[field.key].trim());
  const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {
    const lines = BRAINSTORM_QUESTION_FIELDS.map((field) => {
      const value = draft[field.key].trim();
      if (!value) return null;
      return `${field.label.replace(/^\d+\./, '')}：${value}`;
    })
      .filter((line): line is string => Boolean(line))
      .join('\n');
    if (!lines) return '';
    return [
      BRAINSTORM_GENERATE_TASK_TEXT,
      BRAINSTORM_GENERATE_RULE_TEXT,
      '',
      BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
      lines,
    ].join('\n');
  };
  const openBrainstormGenerateConfirm = () => {
    if (isLibraryAiLoading) return;
    setBrainstormGenerateDraft({ ...brainstormQuestionDraft });
  };
  const scrollLibraryAiOutputToBottom = useCallback(() => {
    const output = libraryAiOutputRef.current;
    if (!output) return;
    libraryAiProgrammaticScrollRef.current = true;
    output.scrollTop = output.scrollHeight;
    window.requestAnimationFrame(() => {
      libraryAiProgrammaticScrollRef.current = false;
    });
  }, [libraryAiOutputRef, libraryAiProgrammaticScrollRef]);
  const handleLibraryAiOutputScroll = () => {
    const output = libraryAiOutputRef.current;
    if (!output || libraryAiProgrammaticScrollRef.current) return;
    const distanceToBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
    libraryAiAutoScrollRef.current = distanceToBottom <= 24;
  };
  useEffect(() => {
    if (!isLibraryAiLoading) {
      setLoadingDotCount(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isLibraryAiLoading, setLoadingDotCount]);
  useEffect(() => {
    if (!isLibraryAiLoading) return;
    if (!libraryAiAutoScrollRef.current) return;
    scrollLibraryAiOutputToBottom();
  }, [animatedAiOutput, isLibraryAiLoading, libraryAiAutoScrollRef, scrollLibraryAiOutputToBottom]);
  const setRememberedActiveTab = useCallback(
    (tab: string) => {
      const normalizedTab = normalizeTabName(tab);
      setActiveTab(normalizedTab);
      try {
        if (normalizedTabs.includes(normalizedTab)) {
          localStorage.setItem(getActiveTabStorageKey(storageKey), normalizedTab);
        }
      } catch {
        // Local tab memory is a convenience; the panel should still work without it.
      }
    },
    [getActiveTabStorageKey, normalizeTabName, normalizedTabs, setActiveTab, storageKey],
  );
  useLayoutEffect(() => {
    const requestedTab = normalizeTabName(defaultActiveTab ?? '');
    if (!requestedTab || requestedTab === activeTab || !normalizedTabs.includes(requestedTab)) return;
    setRememberedActiveTab(requestedTab);
  }, [activeTab, defaultActiveTab, normalizeTabName, normalizedTabs, setRememberedActiveTab]);
  const { leftResizeHandle, rightResizeHandle, brainstormPreviewResizeHandle } = useWorkbenchLibraryResizeHandles({
    activeTab,
    storageKey,
    scale,
    settingLibraryLeftWidth,
    settingLibraryRightWidth,
    brainstormPreviewWidth,
    setSettingLibraryLeftWidth,
    setSettingLibraryRightWidth,
    setBrainstormPreviewWidth,
  });
  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;
  const selectedRoleIsMaleProtagonist = Boolean(selectedRole && isMaleProtagonistRoleType(selectedRole.type));
  const selectedRoleLifeStatus = selectedRoleIsMaleProtagonist ? '存活' : selectedRole?.lifeStatus;
  useLayoutEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
    setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, activeTab));
  }, [
    SETTING_LIBRARY_TABS,
    activeTab,
    readBrainstormPreviewWidth,
    readSettingLibraryLeftWidth,
    readSettingLibraryRightWidth,
    scale,
    setBrainstormPreviewWidth,
    setSettingLibraryLeftWidth,
    setSettingLibraryRightWidth,
    storageKey,
  ]);
  useEffect(() => {
    const syncSharedAiRightWidth = () => {
      if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
      setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    };
    window.addEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT, syncSharedAiRightWidth);
  }, [
    SETTING_LIBRARY_TABS,
    WORKBENCH_SHARED_AI_RIGHT_WIDTH_EVENT,
    activeTab,
    readSettingLibraryRightWidth,
    setSettingLibraryRightWidth,
    storageKey,
  ]);
  useEffect(() => {
    const syncSharedLeftNavWidth = () => {
      if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
      if (!readSharedWorkbenchLeftNavWidthEnabled()) return;
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncSharedLeftNavWidth);
  }, [
    SETTING_LIBRARY_TABS,
    WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
    activeTab,
    readSettingLibraryLeftWidth,
    readSharedWorkbenchLeftNavWidthEnabled,
    scale,
    setSettingLibraryLeftWidth,
    storageKey,
  ]);
  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab) || activeTab === BRAINSTORM_TAB) return;
    const syncVisibleLeftWidth = () => {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    };
    syncVisibleLeftWidth();
    window.addEventListener('resize', syncVisibleLeftWidth);
    return () => window.removeEventListener('resize', syncVisibleLeftWidth);
  }, [
    BRAINSTORM_TAB,
    SETTING_LIBRARY_TABS,
    activeTab,
    readSettingLibraryLeftWidth,
    scale,
    setSettingLibraryLeftWidth,
    storageKey,
  ]);
  useEffect(() => {
    if (initializedStorageKeyRef.current !== storageKey) {
      initializedStorageKeyRef.current = storageKey;
      const nextActiveTab = readActiveTab(storageKey, normalizedTabs, defaultActiveTab);
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
      setTabConfigs(readTabConfigs(storageKey));
      setActiveTab(nextActiveTab);
      if (SETTING_LIBRARY_TABS.has(nextActiveTab)) {
        setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, nextActiveTab, scale));
        setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, nextActiveTab));
        setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, nextActiveTab));
      }
      setCustomRoleTypes(readCustomRoleTypes(storageKey));
      setCustomSettingTypes(readCustomSettingTypes(storageKey));
      setCustomSettingTypeDomains(readCustomSettingTypeDomains(storageKey));
      setHiddenRoleTypes(readHiddenRoleTypes(storageKey));
      setHiddenSettingTypes(readHiddenSettingTypes(storageKey));
    }

    const syncEntries = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.storageKey !== storageKey &&
        event.detail?.storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY
      )
        return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncBrainstormRecycleEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== getBrainstormRecycleStorageKey(storageKey))
        return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey && event.key !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncStorageBrainstormRecycleEntries = (event: StorageEvent) => {
      if (event.key && event.key !== getBrainstormRecycleStorageKey(storageKey)) return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
    window.addEventListener('storage', syncStorageEntries);
    window.addEventListener('storage', syncStorageBrainstormRecycleEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
      window.removeEventListener('storage', syncStorageEntries);
      window.removeEventListener('storage', syncStorageBrainstormRecycleEntries);
    };
  }, [
    GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
    SETTING_LIBRARY_TABS,
    WORKBENCH_LIBRARY_UPDATED_EVENT,
    defaultActiveTab,
    getBrainstormRecycleStorageKey,
    normalizedTabs,
    readActiveTab,
    readBrainstormPreviewWidth,
    readBrainstormRecycleEntries,
    readCustomRoleTypes,
    readCustomSettingTypeDomains,
    readCustomSettingTypes,
    readHiddenRoleTypes,
    readHiddenSettingTypes,
    readNormalizedEntriesWithVisibleDefaults,
    readSettingLibraryLeftWidth,
    readSettingLibraryRightWidth,
    readTabConfigs,
    scale,
    setActiveTab,
    setBrainstormPreviewWidth,
    setBrainstormRecycleEntries,
    setCustomRoleTypes,
    setCustomSettingTypeDomains,
    setCustomSettingTypes,
    setEntries,
    setHiddenRoleTypes,
    setHiddenSettingTypes,
    setSettingLibraryLeftWidth,
    setSettingLibraryRightWidth,
    setTabConfigs,
    storageKey,
  ]);
  useEffect(() => {
    if (!categoryMenu && !entryMenu && !promptDisableMenu) return;
    const closeMenu = (event: globalThis.MouseEvent | PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-library-context-menu="true"]')) return;
      setCategoryMenu(null);
      setEntryMenu(null);
      setPromptDisableMenu(null);
    };
    window.addEventListener('pointerdown', closeMenu, true);
    window.addEventListener('contextmenu', closeMenu, true);
    return () => {
      window.removeEventListener('pointerdown', closeMenu, true);
      window.removeEventListener('contextmenu', closeMenu, true);
    };
  }, [categoryMenu, entryMenu, promptDisableMenu, setCategoryMenu, setEntryMenu, setPromptDisableMenu]);
  useEffect(() => {
    if (!outlineStorageKey) {
      setOutlineEntries([]);
      return;
    }
    setOutlineEntries(readNormalizedEntries(outlineStorageKey));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncStorageEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncStorageEntries);
    };
  }, [WORKBENCH_LIBRARY_UPDATED_EVENT, outlineStorageKey, readNormalizedEntries, setOutlineEntries]);
  useEffect(() => {
    if (normalizedTabs.includes(activeTab)) return;
    setRememberedActiveTab(normalizedTabs[0] ?? '');
  }, [activeTab, normalizedTabs, setRememberedActiveTab]);
  useEffect(() => {
    roleExpandedReloadRef.current = true;
    setExpandedRoleTypes(readExpandedStringSet(storageKey, ROLE_TAB, 'role_types'));
  }, [ROLE_TAB, readExpandedStringSet, roleExpandedReloadRef, setExpandedRoleTypes, storageKey]);
  useLayoutEffect(() => {
    settingExpandedReloadRef.current = true;
    setExpandedSettingTypes(readExpandedStringSet(storageKey, activeTab, 'setting_types'));
  }, [activeTab, readExpandedStringSet, setExpandedSettingTypes, settingExpandedReloadRef, storageKey]);
  useEffect(() => {
    outlineExpandedReloadRef.current = true;
    setExpandedOutlineVolumeIds(readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes'));
  }, [
    activeTab,
    outlineExpandedReloadRef,
    outlineStorageKey,
    readExpandedNumberSet,
    setExpandedOutlineVolumeIds,
    storageKey,
  ]);
  useEffect(() => {
    setManualDetailOutlinePublishedChapterIds(
      readManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey),
    );
    setShowDetailOutlinePublished(false);
  }, [
    outlineStorageKey,
    readManualDetailOutlinePublishedChapterIds,
    setManualDetailOutlinePublishedChapterIds,
    setShowDetailOutlinePublished,
    storageKey,
  ]);
  useEffect(() => {
    if (roleExpandedReloadRef.current) {
      roleExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, ROLE_TAB, 'role_types', expandedRoleTypes);
  }, [ROLE_TAB, expandedRoleTypes, persistExpandedStringSet, roleExpandedReloadRef, storageKey]);
  useEffect(() => {
    if (settingExpandedReloadRef.current) {
      settingExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, activeTab, 'setting_types', expandedSettingTypes);
  }, [activeTab, expandedSettingTypes, persistExpandedStringSet, settingExpandedReloadRef, storageKey]);
  useEffect(() => {
    if (outlineExpandedReloadRef.current) {
      outlineExpandedReloadRef.current = false;
      return;
    }
    persistExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes', expandedOutlineVolumeIds);
  }, [
    activeTab,
    expandedOutlineVolumeIds,
    outlineExpandedReloadRef,
    outlineStorageKey,
    persistExpandedNumberSet,
    storageKey,
  ]);
  useEffect(() => {
    persistManualDetailOutlinePublishedChapterIds(
      outlineStorageKey ?? storageKey,
      manualDetailOutlinePublishedChapterIds,
    );
  }, [
    manualDetailOutlinePublishedChapterIds,
    outlineStorageKey,
    persistManualDetailOutlinePublishedChapterIds,
    storageKey,
  ]);
  useEffect(() => {
    if (!detailOutlineChapterMenu.visible) return;
    const close = () => setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [detailOutlineChapterMenu.visible, setDetailOutlineChapterMenu]);
  useEffect(() => {
    if (
      (!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) &&
      activeTab !== OUTLINE_LIBRARY_TAB &&
      activeTab !== DETAIL_OUTLINE_TAB
    )
      return;
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      if (prev.size > 0 || volumes.length === 0) return prev;
      return new Set(volumes.map((volume) => volume.id));
    });
  }, [
    CHAPTER_SUMMARY_TAB,
    DETAIL_OUTLINE_TAB,
    OUTLINE_LIBRARY_TAB,
    VOLUME_SUMMARY_TAB,
    activeTab,
    hasStoredExpandedNumberSet,
    outlineStorageKey,
    setExpandedOutlineVolumeIds,
    storageKey,
    tabs,
    volumes,
  ]);
  useEffect(() => {
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => next.add(volume.id));
      return next;
    });
  }, [activeTab, hasStoredExpandedNumberSet, outlineStorageKey, setExpandedOutlineVolumeIds, storageKey, volumes]);
  useEffect(() => {
    if (outlineSelectionType !== 'chapter' || selectedOutlineChapterId == null) return;
    const id = window.setTimeout(() => {
      outlinePreviewRefs.current[selectedOutlineChapterId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(id);
  }, [outlinePreviewRefs, outlineSelectionType, selectedOutlineChapterId]);
  useEffect(() => {
    if (activeTab !== DETAIL_OUTLINE_TAB || outlineSelectionType === 'chapter') return;
    setOutlineSelectionType('chapter');
    setSelectedOutlineVolumeId(null);
  }, [DETAIL_OUTLINE_TAB, activeTab, outlineSelectionType, setOutlineSelectionType, setSelectedOutlineVolumeId]);
  useEffect(() => {
    if (suppressNextOutlinePreviewSyncRef.current) {
      suppressNextOutlinePreviewSyncRef.current = false;
      return;
    }
    if (isDetailOutlineLikeTab(activeTab)) return;
    if (
      (!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) &&
      activeTab !== OUTLINE_LIBRARY_TAB
    )
      return;
    const isDetailOutlineTab = false;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    if (!isDetailOutlineTab && outlineSelectionType === 'volume') {
      const volume = volumes.find((item) => item.id === selectedOutlineVolumeId) ?? volumes[0];
      const content =
        currentOutlineEntries.find(
          (entry) =>
            (entry.tab === VOLUME_SUMMARY_TAB ||
              entry.tab === LEGACY_VOLUME_SUMMARY_TAB ||
              entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD) &&
            (entry.title === `${volume?.name ?? ''}梗概` ||
              entry.title === `${volume?.name ?? ''}摘要` ||
              entry.title === `${volume?.name ?? ''}概要`),
        )?.content ?? '';
      setOutlinePreviewDraft(content);
      return;
    }
    const chapters = volumes.flatMap((volume) => volume.chapters);
    const chapter = chapters.find((item) => item.id === selectedOutlineChapterId) ?? chapters[0];
    const chapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const chapterTitle = isDetailOutlineTab
      ? `第${chapter?.serialNumber ?? ''}章细纲`
      : `第${chapter?.serialNumber ?? ''}章梗概`;
    const legacyChapterTitle = `第${chapter?.serialNumber ?? ''}章摘要`;
    const olderLegacyChapterTitle = `第${chapter?.serialNumber ?? ''}章概要`;
    const chapterDisplayTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章 章纲` : chapterTitle;
    const content =
      currentOutlineEntries.find(
        (entry) =>
          entry.tab === chapterTab &&
          (entry.title === chapterTitle ||
            entry.title === legacyChapterTitle ||
            entry.title === olderLegacyChapterTitle ||
            entry.title === chapterDisplayTitle),
      )?.content ?? '';
    setOutlinePreviewDraft(content);
  }, [
    CHAPTER_DETAIL_OUTLINE_TAB,
    CHAPTER_SUMMARY_TAB,
    LEGACY_VOLUME_SUMMARY_TAB,
    LEGACY_VOLUME_SUMMARY_TAB_OLD,
    OUTLINE_LIBRARY_TAB,
    VOLUME_SUMMARY_TAB,
    activeTab,
    entries,
    isDetailOutlineLikeTab,
    outlineEntries,
    outlineSelectionType,
    outlineStorageKey,
    selectedOutlineChapterId,
    selectedOutlineVolumeId,
    setOutlinePreviewDraft,
    suppressNextOutlinePreviewSyncRef,
    tabs,
    volumes,
  ]);
  useEffect(() => {
    const updateTarget = () => {
      setTabPortalTarget(document.getElementById('workbench-modal-header-extra'));
      setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'));
    };
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, [setHeaderToolPortalTarget, setTabPortalTarget]);
  const {
    persist,
    persistBrainstormRecycle,
    persistOutline,
    addEntry,
    addEntryToTab,
    addSettingTypeByName,
    addSettingType,
    getSettingCreateTypeOptions,
    getValidSettingCreateType,
    getSelectedEntrySettingCreateType,
    addSetting,
  } = useWorkbenchLibraryEntryActions({
    activeTab,
    customRoleTypes,
    entries,
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    hiddenRoleTypes,
    outlineSettingScope,
    outlineStorageKey,
    setBrainstormRecycleEntries,
    setCustomSettingTypeDomains,
    setCustomSettingTypes,
    setEntries,
    setExpandedSettingTypes,
    setOutlineEntries,
    setRememberedActiveTab,
    setSelectedId,
    setSelectedIdForTab,
    setSettingTypeDraft,
    settingCreateTypeDraft,
    settingTitleDraft,
    settingTypeDraft,
    settingTypeOptionsRef,
    storageKey,
    tabConfigs,
    updateTabConfig,
  });
  return {
    setBrainstormQuestionField,
    hasBrainstormQuestionContent,
    buildBrainstormPromptFromQuestions,
    openBrainstormGenerateConfirm,
    scrollLibraryAiOutputToBottom,
    handleLibraryAiOutputScroll,
    setRememberedActiveTab,
    leftResizeHandle,
    rightResizeHandle,
    brainstormPreviewResizeHandle,
    visibleEntries,
    selectedEntry,
    selectedRole,
    selectedRoleIsMaleProtagonist,
    selectedRoleLifeStatus,
    persist,
    persistBrainstormRecycle,
    persistOutline,
    addEntry,
    addEntryToTab,
    addSettingTypeByName,
    addSettingType,
    getSettingCreateTypeOptions,
    getValidSettingCreateType,
    getSelectedEntrySettingCreateType,
    addSetting,
  };
}
