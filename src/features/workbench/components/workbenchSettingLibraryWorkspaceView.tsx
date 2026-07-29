import React from 'react';
import { EmptyState } from '@/shared/ui/EmptyState';

import { StandardModeSettingSidebarActions } from './StandardModeSettingSidebarActions';
import { WorkbenchSettingPanelTabs } from './WorkbenchSettingStatusPanel';

type ViewScope = Record<string, unknown>;

export function renderSettingLibraryWorkspace(rawScope: ViewScope) {
  const scope = rawScope as any;
  const {
    BRAINSTORM_TAB,
    BrainstormOutputWorkspace,
    BrainstormPreviewEditor,
    Lock,
    RoleBaseStateEditor,
    SETTING_TAB,
    WorkbenchLibrarySidebar,
    WorkbenchSettingTreeSidebar,
    WorkbenchSettingEditor,
    activeBrainstormOutputScrollIndex,
    activeIsBrainstorm,
    activeIsSettingLike,
    activeSettingSidebarScrollKey,
    activeSettingWorkspaceType,
    activeStructuredSettingTab,
    activeTab,
    activeTabConfig,
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
    getSettingTypeWorkspaceDomain,
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
    outlineSettingDomain,
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
    settingEntries,
    settingTreeDomains,
    settingTypeOptions,
    settingPreviewFontSize,
    selectSettingWorkspaceDomain,
    showBrainstormOutputSelection,
    standardMode,
    storageKey,
    stopLibraryAiMessage,
    stringifySettingContent,
    toggleBrainstormOutputPreviewSelected,
    updateEntry,
    updateActiveTabConfig,
    updateLibraryEntryPointerPreview,
    updateOutlineCharacterRole,
    updateStructuredSettingField,
  } = scope;

  const showFormalSettingTree = activeTab === SETTING_TAB && !activeIsBrainstorm;
  const settingWorkspaceLocked = showFormalSettingTree && standardMode && isLibraryAiLoading;
  const settingPanelMode = !standardMode && activeTabConfig.settingPanelMode === 'status' ? 'status' : 'setting';
  const settingPendingStatusCount =
    currentSelectedRole?.pendingStatusUpdates?.length ?? currentSelectedSetting?.pendingStatusUpdates?.length ?? 0;

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
      {showFormalSettingTree ? (
        <WorkbenchSettingTreeSidebar
          domains={settingTreeDomains}
          activeDomainId={outlineSettingDomain}
          settingEntries={settingEntries}
          roleEntries={roleEntries}
          settingTypeOptions={settingTypeOptions}
          roleTypeOptions={roleTypeOptions}
          selectedEntryId={currentSelectedEntry?.id}
          expandedSettingTypes={expandedSettingTypes}
          expandedRoleTypes={expandedRoleTypes}
          setExpandedSettingTypes={setExpandedSettingTypes}
          setExpandedRoleTypes={setExpandedRoleTypes}
          getSettingTypeWorkspaceDomain={getSettingTypeWorkspaceDomain}
          onSelectDomain={selectSettingWorkspaceDomain}
          onSelectEntry={setSelectedIdForTab}
          onOpenCategoryMenu={openCategoryMenu}
          onOpenEntryMenu={openEntryMenu}
          onOpenCreateDialog={openSettingCreateDialog}
          onScroll={() => handleSettingSidebarScroll('setting-sidebar')}
          scrollActive={activeSettingSidebarScrollKey === 'setting-sidebar'}
          libraryDropTarget={libraryDropTarget}
          draggingLibraryEntry={draggingLibraryEntry}
          libraryPointerSuppressClickRef={libraryPointerSuppressClickRef}
          getPreviewedGroupEntries={getPreviewedLibraryGroupEntries}
          onCategoryDragOver={handleLibraryCategoryDragOver}
          onCategoryDragLeave={handleLibraryCategoryDragLeave}
          onCategoryDrop={handleLibraryCategoryDrop}
          onEntryDragStart={handleLibraryEntryDragStart}
          onEntryDragOver={handleLibraryEntryDragOver}
          onEntryDrop={handleLibraryEntryDrop}
          onEntryDragEnd={handleLibraryEntryDragEnd}
          onEntryPointerDown={beginLibraryEntryPointerDrag}
          onEntryPointerMove={updateLibraryEntryPointerPreview}
          onEntryPointerUp={finishLibraryEntryPointerDrag}
          footerActions={standardMode ? <StandardModeSettingSidebarActions storageKey={storageKey} /> : null}
        />
      ) : <WorkbenchLibrarySidebar
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
        style={undefined}
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
      />}
      {leftResizeHandle}
      <main
        inert={settingWorkspaceLocked ? true : undefined}
        aria-busy={settingWorkspaceLocked || undefined}
        data-setting-generation-locked={settingWorkspaceLocked ? 'true' : undefined}
        className={`relative min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''} ${settingWorkspaceLocked ? 'pointer-events-none' : ''}`}
        style={showFormalSettingTree ? { gridColumn: 3, gridRow: 1 } : undefined}
      >
        {settingWorkspaceLocked ? (
          <div
            className="pointer-events-none absolute right-4 top-3 z-30 flex h-8 items-center gap-2 rounded-md border border-[#8FD8E7] bg-[#EAF9FD]/95 px-3 text-xs font-bold text-[#078FAB] shadow-sm"
            data-setting-generation-lock-indicator="true"
            role="status"
            aria-live="polite"
          >
            <Lock className="h-3.5 w-3.5" />
            AI正在生成，设定编辑区已锁定
          </div>
        ) : null}
        {showFormalSettingTree && !standardMode ? (
          <div className="flex h-12 shrink-0 items-center justify-end border-b border-slate-100 px-4">
            <WorkbenchSettingPanelTabs
              mode={settingPanelMode}
              pendingCount={settingPendingStatusCount}
              onChange={(mode) => updateActiveTabConfig({ settingPanelMode: mode })}
            />
          </div>
        ) : null}
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
            />
          ) : (
            <EmptyState title="暂无角色" description="点击左侧“新建角色”开始创建角色" />
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
