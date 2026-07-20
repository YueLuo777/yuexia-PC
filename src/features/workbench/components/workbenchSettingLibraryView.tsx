/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- view adapter receives the typed controller scope.
import React from 'react';
import {
  renderSettingLibraryAiConfigHeader,
  renderSettingLibraryWorkspace,
} from './workbenchSettingLibraryWorkspaceView';

export function renderSettingLibraryView(scope: Record<string, any>) {
  const {
    AiInlineInput,
    BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH,
    BRAINSTORM_TAB,
    BrainstormOutputWorkspace,
    BrainstormPreviewEditor,
    BrainstormQuestionPanel,
    CombinedAiConfigSelect,
    DETAIL_OUTLINE_PROMPT_CATEGORY,
    DETAIL_OUTLINE_TAB,
    LibraryManagementModal,
    Lock,
    PROMPT_DISABLE_CONTEXT_MENU_SIZE,
    PROMPT_SETTING_CATEGORY,
    RoleBaseStateEditor,
    SETTING_TAB,
    Unlock,
    WordCountText,
    WorkbenchLibrarySidebar,
    WorkbenchSettingEditor,
    X,
    activeBrainstormOutputScrollIndex,
    activeIsBrainstorm,
    activeIsSettingLike,
    activePromptId,
    activeSettingLinkSource,
    activeSettingSidebarScrollKey,
    activeSettingWorkspaceType,
    activeStructuredSettingTab,
    activeTab,
    activeTabConfig,
    activeTabPrompts,
    addEntryToTab,
    aiChatTurns,
    aiInput,
    beginLibraryEntryPointerDrag,
    brainstormGenerateConfirmModal,
    brainstormLayoutLeftWidth,
    brainstormLayoutPreviewWidth,
    brainstormLayoutRightWidth,
    brainstormOutputFontSize,
    brainstormOutputPreviews,
    brainstormOutputTitles,
    brainstormOutputValue,
    brainstormPreviewFontSize,
    brainstormPreviewResizeHandle,
    brainstormPromptEditModal,
    brainstormPromptManagerModal,
    brainstormQuestionDraft,
    brainstormReaderModal,
    brainstormRecycleEntries,
    brainstormRecycleModal,
    canSendLibraryAiMessage,
    categoryContextMenu,
    categoryRenameModal,
    clampFixedMenuPosition,
    clearActiveLinkedBrainstorm,
    clearActiveLinkedOtherSettings,
    clearBrainstormOutputArea,
    clearBrainstormRecycleConfirmDialog,
    clearLibraryAiDialog,
    clearSettingsConfirmDialog,
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
    deleteConfirmDialog,
    draggingLibraryEntry,
    effectiveLibraryTab,
    effectivePromptDisabled,
    entryContextMenu,
    entryRenameDialog,
    expandedRoleTypes,
    expandedSettingTypes,
    fieldSizeSettingsModal,
    fieldSizeSpecs,
    finishLibraryEntryPointerDrag,
    getConfigFieldSizeStyle,
    getEmbeddedConfigSelectStyle,
    getLibrarySidebarEntryType,
    getLibrarySidebarEntryWordCount,
    getPreviewedLibraryGroupEntries,
    getTemporaryBrainstormTitle,
    getWorkbenchAssociationRuntimeId,
    groupedSettingEntries,
    handleBrainstormOutputTextareaScroll,
    handleLibraryAiInputKeyDown,
    handleLibraryAiOutputScroll,
    handleLibraryCategoryDragLeave,
    handleLibraryCategoryDragOver,
    handleLibraryCategoryDrop,
    handleLibraryEntryDragEnd,
    handleLibraryEntryDragOver,
    handleLibraryEntryDragStart,
    handleLibraryEntryDrop,
    handleSettingSidebarScroll,
    hasLibraryAiContent,
    isLibraryAiLoading,
    isOutlineCharacterScope,
    leftResizeHandle,
    libraryAiInputRef,
    libraryAiLogModal,
    libraryAiOutputRef,
    libraryDropTarget,
    libraryHeaderFontSizePortal,
    libraryPointerSuppressClickRef,
    libraryToolbarPortal,
    libraryToolbarPortalTarget,
    linkedSettingWordCount,
    managementModal,
    models,
    openBrainstormGenerateConfirm,
    openCategoryMenu,
    openEntryMenu,
    openOtherSettingReader,
    openSettingCreateDialog,
    otherSettingReaderModal,
    panelTitle,
    promptCategoryLabel,
    promptDisableContextMenu,
    renderAiChatContent,
    renderFieldSizeButton,
    renderLibraryAiLogButton,
    renderTopTabs,
    resizeFloatingAiTextarea,
    rightResizeHandle,
    rightSelectFieldTab,
    roleEntries,
    roleTextFontSize,
    roleTypeOptions,
    saveBrainstormOutput,
    saveBrainstormOutputAsNew,
    scaleStyle,
    selectedBrainstormOutputCount,
    selectedBrainstormOutputIndexSet,
    sendLibraryAiMessage,
    setActiveLibraryFontTarget,
    setActiveStructuredSettingTab,
    setAiInput,
    setBrainstormOutputPreviewDraft,
    setBrainstormOutputPreviewTitle,
    setBrainstormQuestionField,
    setExpandedRoleTypes,
    setExpandedSettingTypes,
    setIsBrainstormReaderOpen,
    setIsBrainstormRecycleOpen,
    setManagementModal,
    setPromptDisableMenu,
    setSelectedBrainstormReaderId,
    setSelectedIdForTab,
    settingCreateModal,
    settingLibraryLeftWidth,
    settingLibraryMode,
    settingLibraryRightWidth,
    settingPreviewFontSize,
    settingWorkspaceTopTabs,
    showBrainstormOutputSelection,
    showHeaderLibraryAiLogButton,
    showInlineLibraryAiLogButton,
    showPanelHeader,
    showPromptDisableButton,
    smartImportLocked,
    smartImportSettings,
    stopLibraryAiMessage,
    stringifySettingContent,
    toggleBrainstormOutputPreviewSelected,
    updateActiveTabConfig,
    updateEntry,
    updateLibraryEntryPointerPreview,
    updateOutlineCharacterRole,
    updateStructuredSettingField,
  } = scope;
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
      {libraryHeaderFontSizePortal}
      {libraryToolbarPortal}
      {renderTopTabs()}
      {categoryContextMenu}
      {entryContextMenu}
      {deleteConfirmDialog}
      {entryRenameDialog}
      {fieldSizeSettingsModal}
      {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
      {libraryAiLogModal}
      {clearSettingsConfirmDialog}
      {promptDisableContextMenu}
      {otherSettingReaderModal}
      {brainstormReaderModal}
      {brainstormRecycleModal}
      {clearBrainstormRecycleConfirmDialog}
      {brainstormPromptManagerModal}
      {brainstormPromptEditModal}
      {brainstormGenerateConfirmModal}
      {settingCreateModal}
      {categoryRenameModal}
      <div
        className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
        style={{
          gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined,
          gridTemplateColumns: activeIsBrainstorm
            ? `${brainstormLayoutLeftWidth}px 0px ${brainstormLayoutPreviewWidth}px 0px minmax(${BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH}px,1fr) 0px ${brainstormLayoutRightWidth}px`
            : settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 0px minmax(0,1fr)`,
        }}
      >
        {renderSettingLibraryWorkspace(scope)}

        {settingLibraryMode === 'advanced' && (
          <>
            {rightResizeHandle}
            <aside
              className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2"
              style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 5, gridRow: '1 / 3' } : undefined}
            >
              {renderSettingLibraryAiConfigHeader(scope)}
              {activeIsBrainstorm ? (
                <BrainstormQuestionPanel
                  draft={brainstormQuestionDraft}
                  isLoading={isLibraryAiLoading}
                  onFieldChange={setBrainstormQuestionField}
                  onGenerate={openBrainstormGenerateConfirm}
                />
              ) : (
                <>
                  <div className="relative mt-5 min-h-0 flex-1">
                    <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full xy-has-value">
                      <label className="xy-floating-title-count xy-border-embedded-transparent-backplate">
                        生成设定
                      </label>
                      <button
                        type="button"
                        onClick={clearLibraryAiDialog}
                        disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                        className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600 disabled:text-red-300"
                      >
                        清空
                      </button>
                      <div
                        ref={libraryAiOutputRef}
                        onScroll={handleLibraryAiOutputScroll}
                        className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-gray-700"
                      >
                        {aiChatTurns.length === 0 ? (
                          <div />
                        ) : (
                          <div className="space-y-3">
                            {aiChatTurns.map((turn, index) => (
                              <div
                                key={`${turn.role}-${index}`}
                                className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                                    turn.role === 'user'
                                      ? 'max-w-[82%] bg-brand text-white'
                                      : 'max-w-[96%] border border-gray-200 bg-gray-50 text-gray-800'
                                  }`}
                                >
                                  {renderAiChatContent(turn.content)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <>
                    {activeTab === SETTING_TAB && (
                      <div className="mt-3 flex min-w-0 items-center gap-1.5">
                        <div className="flex h-9 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9] bg-white shadow-sm">
                          <div className="flex w-12 items-center justify-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
                            关联
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (activeSettingLinkSource === 'current') {
                                updateActiveTabConfig({
                                  associationSessionId: null,
                                  settingLinkSource: null,
                                  promptDisabled: false,
                                });
                                return;
                              }
                              updateActiveTabConfig({
                                associationSessionId: getWorkbenchAssociationRuntimeId(),
                                settingLinkSource: 'current',
                                loadedBrainstormId: null,
                                loadedBrainstormTitle: '',
                                loadedBrainstormText: '',
                                linkedOtherSettingIds: [],
                                promptDisabled: true,
                              });
                            }}
                            disabled={!currentSelectedEntry}
                            className={`w-[86px] px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 ${
                              activeSettingLinkSource === 'current'
                                ? 'bg-[#08B3D9] text-white'
                                : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
                            }`}
                            title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}
                          >
                            当前设定
                          </button>
                          {activeSettingLinkSource === 'other' ? (
                            <div className="flex border-l border-[#08B3D9]/30">
                              <button
                                type="button"
                                onClick={openOtherSettingReader}
                                className="w-[96px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                title="重新选择关联其他设定"
                              >
                                其他设定
                              </button>
                              <button
                                type="button"
                                onClick={clearActiveLinkedOtherSettings}
                                className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                                title="取消关联其他设定"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={openOtherSettingReader}
                              className="w-[86px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                              title="关联其他设定"
                            >
                              其他设定
                            </button>
                          )}
                          {activeSettingLinkSource === 'brainstorm' ? (
                            <div className="flex border-l border-[#08B3D9]/30">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                  setIsBrainstormReaderOpen(true);
                                }}
                                className="w-[90px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                                title="重新选择关联脑洞"
                              >
                                已关联脑洞
                              </button>
                              <button
                                type="button"
                                onClick={clearActiveLinkedBrainstorm}
                                className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                                title="取消关联脑洞"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                setIsBrainstormReaderOpen(true);
                              }}
                              className="w-[68px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                              title={isOutlineCharacterScope ? '关联脑洞库内容到人物设定' : '关联脑洞库内容'}
                            >
                              脑洞
                            </button>
                          )}
                        </div>
                        {activeSettingLinkSource && (
                          <span className="min-w-0 shrink whitespace-nowrap text-xs font-bold text-slate-400">
                            关联 <WordCountText value={linkedSettingWordCount} compact />
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      {activeTab === SETTING_TAB ? (
                        <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={smartImportSettings}
                            disabled={smartImportLocked}
                            className={`min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold transition-colors ${
                              smartImportLocked
                                ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                                : 'bg-[#08AACE] text-white hover:bg-[#0796B8]'
                            }`}
                          >
                            智能导入设定
                          </button>
                          <button
                            type="button"
                            onClick={() => updateActiveTabConfig({ smartImportLocked: !smartImportLocked })}
                            className={`flex h-full w-10 shrink-0 items-center justify-center border-l transition-colors ${
                              smartImportLocked
                                ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600'
                                : 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#08AACE] hover:bg-[#DDF5FB] hover:text-[#078fb0]'
                            }`}
                            title={smartImportLocked ? '解锁智能导入设定' : '锁定智能导入设定'}
                          >
                            {smartImportLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!currentSelectedEntry) {
                              addEntryToTab(activeTab, `新建${activeTab}`);
                              return;
                            }
                            updateEntry(currentSelectedEntry.id, {
                              title: currentSelectedEntry.title || `新建${activeTab}`,
                            });
                          }}
                          className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                        >
                          保存为新{activeTab}
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <AiInlineInput
                        ref={libraryAiInputRef}
                        value={aiInput}
                        onChange={(event) => {
                          setAiInput(event.target.value);
                          resizeFloatingAiTextarea(event.currentTarget);
                        }}
                        onKeyDown={handleLibraryAiInputKeyDown}
                        onSend={() => void sendLibraryAiMessage()}
                        onStop={stopLibraryAiMessage}
                        sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                        stopDisabled={!isLibraryAiLoading}
                        placeholder="输入对话指令..."
                      />
                    </div>
                  </>
                </>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
