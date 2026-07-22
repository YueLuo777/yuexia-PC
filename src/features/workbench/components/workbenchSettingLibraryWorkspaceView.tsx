import React from 'react';

type ViewScope = Record<string, unknown>;

export function renderSettingLibraryWorkspace(rawScope: ViewScope) {
  const scope = rawScope as any;
  const {
    BRAINSTORM_TAB,
    BrainstormOutputWorkspace,
    BrainstormPreviewEditor,
    RoleBaseStateEditor,
    SETTING_TAB,
    WorkbenchLibrarySidebar,
    WorkbenchSettingEditor,
    activeBrainstormOutputScrollIndex,
    activeIsBrainstorm,
    activeIsSettingLike,
    activeSettingSidebarScrollKey,
    activeSettingWorkspaceType,
    activeStructuredSettingTab,
    activeTab,
    aiInput,
    beginLibraryEntryPointerDrag,
    brainstormOutputFontSize,
    brainstormOutputPreviews,
    brainstormOutputTitles,
    brainstormOutputValue,
    brainstormPreviewFontSize,
    brainstormPreviewResizeHandle,
    brainstormRecycleEntries,
    canSendLibraryAiMessage,
    clearBrainstormOutputArea,
    copyBrainstormOutputArea,
    countTextWords,
    createEditableSettingEntry,
    currentBrainstormBody,
    currentBrainstormPreviewWordCount,
    currentEntries,
    currentOutlineChapterNumber,
    currentSelectedEntry,
    currentSelectedRole,
    currentSelectedRoleLifeStatus,
    currentSelectedSetting,
    currentSelectedSettingIsLockedDefault,
    currentStructuredSettingFieldSet,
    currentStructuredSettingFields,
    draggingLibraryEntry,
    effectiveLibraryTab,
    expandedRoleTypes,
    expandedSettingTypes,
    fieldSizeSpecs,
    finishLibraryEntryPointerDrag,
    getLibrarySidebarEntryType,
    getLibrarySidebarEntryWordCount,
    getPreviewedLibraryGroupEntries,
    getTemporaryBrainstormTitle,
    groupedSettingEntries,
    handleBrainstormOutputTextareaScroll,
    handleLibraryAiInputKeyDown,
    handleLibraryCategoryDragLeave,
    handleLibraryCategoryDragOver,
    handleLibraryCategoryDrop,
    handleLibraryEntryDragEnd,
    handleLibraryEntryDragOver,
    handleLibraryEntryDragStart,
    handleLibraryEntryDrop,
    handleSettingSidebarScroll,
    isLibraryAiLoading,
    isOutlineCharacterScope,
    leftResizeHandle,
    libraryAiInputRef,
    libraryDropTarget,
    libraryPointerSuppressClickRef,
    openCategoryMenu,
    openEntryMenu,
    openSettingCreateDialog,
    roleEntries,
    roleTextFontSize,
    roleTypeOptions,
    saveBrainstormOutput,
    saveBrainstormOutputAsNew,
    selectedBrainstormOutputCount,
    selectedBrainstormOutputIndexSet,
    sendLibraryAiMessage,
    setActiveLibraryFontTarget,
    setActiveStructuredSettingTab,
    setAiInput,
    setBrainstormOutputPreviewDraft,
    setBrainstormOutputPreviewTitle,
    setExpandedRoleTypes,
    setExpandedSettingTypes,
    setIsBrainstormRecycleOpen,
    setSelectedIdForTab,
    settingLibraryMode,
    settingGroupOptions,
    settingPreviewFontSize,
    settingWorkspaceTopTabs,
    showBrainstormOutputSelection,
    stopLibraryAiMessage,
    stringifySettingContent,
    toggleBrainstormOutputPreviewSelected,
    updateEntry,
    updateActiveTabConfig,
    updateLibraryEntryPointerPreview,
    updateOutlineCharacterRole,
    updateStructuredSettingField,
  } = scope;

  const onSettingGroupChange = (type: string) => {
    if (!settingGroupOptions.includes(type)) return;
    if (currentSelectedEntry && currentSelectedSetting) {
      updateEntry(currentSelectedEntry.id, {
        content: stringifySettingContent({ ...currentSelectedSetting, type }),
      });
      setExpandedSettingTypes((current: Set<string>) => new Set(current).add(type));
      return;
    }
    updateActiveTabConfig({ typeDraft: type });
  };

  return (
    <>
      {settingWorkspaceTopTabs}
      <WorkbenchLibrarySidebar
        activeTab={activeTab}
        effectiveLibraryTab={effectiveLibraryTab}
        activeIsSettingLike={activeIsSettingLike}
        activeIsBrainstorm={activeIsBrainstorm}
        isOutlineCharacterScope={isOutlineCharacterScope}
        activeSettingSidebarScrollKey={activeSettingSidebarScrollKey}
        groupedSettingEntries={groupedSettingEntries}
        currentEntries={currentEntries}
        expandedRoleTypes={expandedRoleTypes}
        expandedSettingTypes={expandedSettingTypes}
        libraryDropTarget={libraryDropTarget}
        draggingLibraryEntry={draggingLibraryEntry}
        currentSelectedEntryId={currentSelectedEntry?.id}
        brainstormRecycleCount={brainstormRecycleEntries.length}
        libraryPointerSuppressClickRef={libraryPointerSuppressClickRef}
        style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 1, gridRow: 2 } : undefined}
        getPreviewedLibraryGroupEntries={getPreviewedLibraryGroupEntries}
        getEntryWordCount={getLibrarySidebarEntryWordCount}
        getEntryType={getLibrarySidebarEntryType}
        handleSettingSidebarScroll={handleSettingSidebarScroll}
        setExpandedRoleTypes={setExpandedRoleTypes}
        setExpandedSettingTypes={setExpandedSettingTypes}
        setSelectedIdForTab={setSelectedIdForTab}
        openCategoryMenu={openCategoryMenu}
        openEntryMenu={openEntryMenu}
        handleLibraryCategoryDragOver={handleLibraryCategoryDragOver}
        handleLibraryCategoryDragLeave={handleLibraryCategoryDragLeave}
        handleLibraryCategoryDrop={handleLibraryCategoryDrop}
        handleLibraryEntryDragStart={handleLibraryEntryDragStart}
        handleLibraryEntryDragOver={handleLibraryEntryDragOver}
        handleLibraryEntryDrop={handleLibraryEntryDrop}
        handleLibraryEntryDragEnd={handleLibraryEntryDragEnd}
        beginLibraryEntryPointerDrag={beginLibraryEntryPointerDrag}
        updateLibraryEntryPointerPreview={updateLibraryEntryPointerPreview}
        finishLibraryEntryPointerDrag={finishLibraryEntryPointerDrag}
        openSettingCreateDialog={openSettingCreateDialog}
        setIsBrainstormRecycleOpen={setIsBrainstormRecycleOpen}
      />
      {leftResizeHandle}
      <main
        className={`min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}
        style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 3, gridRow: 2 } : undefined}
      >
        {isOutlineCharacterScope ? (
          currentSelectedEntry && currentSelectedRole ? (
            <RoleBaseStateEditor
              entry={currentSelectedEntry}
              role={currentSelectedRole}
              roleEntries={roleEntries}
              roleTypeOptions={roleTypeOptions}
              roleTextFontSize={roleTextFontSize}
              currentChapterNumber={currentOutlineChapterNumber}
              roleLifeStatus={currentSelectedRoleLifeStatus}
              onTitleChange={(title: string) => updateEntry(currentSelectedEntry.id, { title })}
              onRoleChange={updateOutlineCharacterRole}
              onOpenStatus={() => updateActiveTabConfig({ settingPanelMode: 'status' })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              点击左侧“新建角色”开始创建角色
            </div>
          )
        ) : activeIsBrainstorm ? (
          <BrainstormPreviewEditor
            title={currentSelectedEntry?.title}
            body={currentBrainstormBody}
            wordCount={currentBrainstormPreviewWordCount}
            fontSize={brainstormPreviewFontSize}
            onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}
            onTitleChange={(title: string) => currentSelectedEntry && updateEntry(currentSelectedEntry.id, { title })}
            onBodyChange={(body: string) => {
              if (!currentSelectedEntry || !currentSelectedSetting) return;
              updateEntry(currentSelectedEntry.id, {
                content: stringifySettingContent({ ...currentSelectedSetting, body }),
              });
            }}
          />
        ) : (
          <WorkbenchSettingEditor
            currentSelectedEntry={currentSelectedEntry}
            currentSelectedSetting={currentSelectedSetting}
            currentSelectedSettingIsLockedDefault={currentSelectedSettingIsLockedDefault}
            currentStructuredSettingFieldSet={currentStructuredSettingFieldSet}
            currentStructuredSettingFields={currentStructuredSettingFields}
            activeStructuredSettingTab={activeStructuredSettingTab}
            setActiveStructuredSettingTab={setActiveStructuredSettingTab}
            activeSettingSidebarScrollKey={activeSettingSidebarScrollKey}
            activeSettingWorkspaceType={activeSettingWorkspaceType}
            settingGroupOptions={settingGroupOptions}
            settingPreviewFontSize={settingPreviewFontSize}
            settingNameFieldSpec={fieldSizeSpecs.settingName}
            setActiveLibraryFontTarget={setActiveLibraryFontTarget}
            updateEntry={updateEntry}
            updateStructuredSettingField={updateStructuredSettingField}
            handleSettingSidebarScroll={handleSettingSidebarScroll}
            createEditableSettingEntry={createEditableSettingEntry}
            onSettingGroupChange={onSettingGroupChange}
            onOpenStatus={() => updateActiveTabConfig({ settingPanelMode: 'status' })}
          />
        )}
      </main>
      {activeIsBrainstorm && brainstormPreviewResizeHandle}
      {activeIsBrainstorm && (
        <BrainstormOutputWorkspace
          previews={brainstormOutputPreviews}
          titles={brainstormOutputTitles}
          selectedIndexes={selectedBrainstormOutputIndexSet}
          showSelection={showBrainstormOutputSelection}
          activeScrollIndex={activeBrainstormOutputScrollIndex}
          fontSize={brainstormOutputFontSize}
          aiInputRef={libraryAiInputRef}
          aiInput={aiInput}
          isLoading={isLibraryAiLoading}
          canSend={canSendLibraryAiMessage}
          selectedCount={selectedBrainstormOutputCount}
          currentEntryId={currentSelectedEntry?.id}
          outputValue={brainstormOutputValue}
          onFocusOutput={() => setActiveLibraryFontTarget('brainstormOutput')}
          onScrollOutput={handleBrainstormOutputTextareaScroll}
          onPreviewChange={setBrainstormOutputPreviewDraft}
          onTitleChange={setBrainstormOutputPreviewTitle}
          onToggleSelected={toggleBrainstormOutputPreviewSelected}
          onAiInputChange={setAiInput}
          onAiInputKeyDown={handleLibraryAiInputKeyDown}
          onSend={() => void sendLibraryAiMessage()}
          onStop={stopLibraryAiMessage}
          onReplaceCurrent={saveBrainstormOutput}
          onSaveAsNew={saveBrainstormOutputAsNew}
          onCopy={copyBrainstormOutputArea}
          onClear={clearBrainstormOutputArea}
          getTitle={getTemporaryBrainstormTitle}
          countWords={countTextWords}
        />
      )}
    </>
  );
}

export function renderSettingLibraryAiConfigHeader(rawScope: ViewScope) {
  const scope = rawScope as any;
  const {
    BRAINSTORM_TAB,
    CombinedAiConfigSelect,
    DETAIL_OUTLINE_PROMPT_CATEGORY,
    DETAIL_OUTLINE_TAB,
    PROMPT_DISABLE_CONTEXT_MENU_SIZE,
    PROMPT_SETTING_CATEGORY,
    SETTING_TAB,
    activeIsBrainstorm,
    activePromptId,
    activeTab,
    activeTabConfig,
    activeTabPrompts,
    clampFixedMenuPosition,
    effectivePromptDisabled,
    getConfigFieldSizeStyle,
    getEmbeddedConfigSelectStyle,
    libraryToolbarPortalTarget,
    models,
    panelTitle,
    promptCategoryLabel,
    renderFieldSizeButton,
    renderLibraryAiLogButton,
    rightSelectFieldTab,
    setManagementModal,
    setPromptDisableMenu,
    showHeaderLibraryAiLogButton,
    showInlineLibraryAiLogButton,
    showPanelHeader,
    showPromptDisableButton,
    updateActiveTabConfig,
  } = scope;

  return (
    <div className="shrink-0">
      {showPanelHeader && (
        <div className="flex items-center justify-between gap-3">
          {activeTab !== SETTING_TAB ? (
            <h3 className="shrink-0 text-base font-bold text-gray-900">{panelTitle}</h3>
          ) : (
            <div />
          )}
          <div className="flex shrink-0 items-center gap-2">
            {!libraryToolbarPortalTarget && (
              <>
                {renderFieldSizeButton()}
                {showHeaderLibraryAiLogButton && renderLibraryAiLogButton('library')}
                {showInlineLibraryAiLogButton && renderLibraryAiLogButton('library')}
              </>
            )}
          </div>
        </div>
      )}
      <div className={`${showPanelHeader ? 'mt-3' : ''} space-y-3`}>
        <div className="flex max-w-full items-start gap-2">
          <CombinedAiConfigSelect
            style={
              activeIsBrainstorm
                ? ({
                    ...getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model')),
                    width: '100%',
                    maxWidth: '100%',
                    '--xy-field-width': '100%',
                  } as React.CSSProperties)
                : getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model'))
            }
            className={activeIsBrainstorm ? 'w-full' : undefined}
            modelValue={activeTabConfig.modelId ?? ''}
            promptValue={activePromptId ?? ''}
            modelOptions={
              models.length === 0
                ? [{ value: '', label: '暂无可用模型', disabled: true }]
                : models.map((model: { id: string; name: string }) => ({ value: model.id, label: model.name }))
            }
            promptOptions={
              activeTabPrompts.length === 0
                ? [{ value: '', label: `暂无${promptCategoryLabel}提示词`, disabled: true }]
                : activeTabPrompts.map((prompt: { id: string; name: string }) => ({
                    value: prompt.id,
                    label: prompt.name,
                  }))
            }
            onModelChange={(value: string) => updateActiveTabConfig({ modelId: value })}
            onPromptChange={(value: string) => updateActiveTabConfig({ promptId: value })}
            onModelManage={() => setManagementModal({ type: 'models' })}
            onPromptManage={() =>
              setManagementModal({
                type: 'prompts',
                category: activeIsBrainstorm
                  ? BRAINSTORM_TAB
                  : activeTab === SETTING_TAB
                    ? PROMPT_SETTING_CATEGORY
                    : activeTab === DETAIL_OUTLINE_TAB
                      ? DETAIL_OUTLINE_PROMPT_CATEGORY
                      : activeTab,
              })
            }
            promptDisabled={effectivePromptDisabled}
            onPromptContextMenu={
              showPromptDisableButton
                ? (event: React.MouseEvent) => {
                    event.preventDefault();
                    const { left, top } = clampFixedMenuPosition(
                      event.clientX,
                      event.clientY,
                      PROMPT_DISABLE_CONTEXT_MENU_SIZE,
                    );
                    setPromptDisableMenu({ tab: activeTab, disabled: effectivePromptDisabled, x: left, y: top });
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
