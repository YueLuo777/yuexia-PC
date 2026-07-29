/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- view adapter receives the typed controller scope.
import React from 'react';
import { isAiThinkingContent } from '@/features/workbench/model/workbenchAiThinkingProtocol';
import {
  renderSettingLibraryAiConfigHeader,
  renderSettingLibraryWorkspace,
} from './workbenchSettingLibraryWorkspaceView';
import { WorkbenchSettingStatusPanel } from './WorkbenchSettingStatusPanel';
import { StandardModeSettingGenerationPanel } from './StandardModeSettingGenerationPanel';
import { readDefaultStandardSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';

function getLibraryAiTurnFrameClass(role: 'user' | 'ai', content: string) {
  if (role === 'user') return 'max-w-[82%] rounded-2xl bg-brand px-4 py-3 text-white';
  if (isAiThinkingContent(content)) return 'max-w-[96%]';
  return 'max-w-[96%] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800';
}

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
    ROLE_TAB,
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
    entries,
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
    getDefaultWorkbenchLibraryEntryTitle,
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
    latestUsefulAiOutput,
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
    selectSettingWorkspaceDomain,
    settingCreateModal,
    settingLibraryLeftWidth,
    settingLibraryMode,
    settingLibraryRightWidth,
    settingPreviewFontSize,
    showBrainstormOutputSelection,
    showHeaderLibraryAiLogButton,
    showInlineLibraryAiLogButton,
    showPanelHeader,
    showPromptDisableButton,
    smartImportLocked,
    smartImportSettings,
    standardMode,
    storageKey,
    stopLibraryAiMessage,
    stringifySettingContent,
    toggleBrainstormOutputPreviewSelected,
    updateActiveTabConfig,
    updateEntry,
    updateLibraryEntryPointerPreview,
    updateOutlineCharacterRole,
    updateStructuredSettingField,
  } = scope;
  const showSettingStatusTabs = !standardMode && activeTab === SETTING_TAB && !activeIsBrainstorm;
  const settingPanelMode = showSettingStatusTabs && activeTabConfig.settingPanelMode === 'status' ? 'status' : 'setting';
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
        className={`grid h-full min-h-0 flex-1 overflow-hidden bg-white ${activeTab === SETTING_TAB && !activeIsBrainstorm ? 'xy-setting-workspace-typography' : ''}`}
        style={{
          gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'minmax(0,1fr)' : undefined,
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
              style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 5, gridRow: 1 } : undefined}
            >
              {standardMode && activeTab === SETTING_TAB ? (
                <StandardModeSettingGenerationPanel
                  settingsStorageKey={storageKey}
                  entries={entries}
                  latestOutput={latestUsefulAiOutput}
                  isGenerating={isLibraryAiLoading}
                  onGenerate={(request, visibleText) => void sendLibraryAiMessage(request, {
                    visibleText,
                    silentDuringRun: true,
                  })}
                  onStop={stopLibraryAiMessage}
                  onImport={(allowedEntryIds, standardGenerationStepId) => smartImportSettings({
                    force: true,
                    allowedEntryIds,
                    standardGenerationStepId,
                  })}
                  onJumpToEmptyField={(result) => {
                    const descriptor = readDefaultStandardSettingEntries(storageKey)
                      .find((entry) => entry.id === result.entryId);
                    if (!descriptor) return;
                    selectSettingWorkspaceDomain(descriptor.domainId);
                    setSelectedIdForTab(descriptor.sourceKind === 'role' ? ROLE_TAB : SETTING_TAB, result.entryId);
                    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
                      const target = Array.from(document.querySelectorAll<HTMLElement>('[data-setting-field-key], [data-role-field-key]'))
                        .find((element) =>
                          element.dataset.settingFieldKey === result.fieldKey
                          || element.dataset.roleFieldKey === result.fieldKey,
                        );
                      if (!target) return;
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      target.querySelector<HTMLElement>('input, textarea')?.focus();
                    }));
                  }}
                />
              ) : (
                <>
                  {settingPanelMode !== 'status' || !showSettingStatusTabs
                    ? renderSettingLibraryAiConfigHeader(scope)
                    : null}
                  {settingPanelMode === 'status' && showSettingStatusTabs ? (
                <WorkbenchSettingStatusPanel
                  entry={currentSelectedEntry ?? null}
                  role={currentSelectedRole ?? null}
                  setting={currentSelectedRole ? null : (currentSelectedSetting ?? null)}
                  structuredFieldSet={currentStructuredSettingFieldSet ?? null}
                  onRoleChange={updateOutlineCharacterRole}
                  onSettingChange={(nextSetting) => {
                    if (!currentSelectedEntry) return;
                    updateEntry(currentSelectedEntry.id, { content: stringifySettingContent(nextSetting) });
                  }}
                />
                  ) : activeIsBrainstorm ? (
                <BrainstormQuestionPanel
                  draft={brainstormQuestionDraft}
                  isLoading={isLibraryAiLoading}
                  onFieldChange={setBrainstormQuestionField}
                  onGenerate={openBrainstormGenerateConfirm}
                />
                  ) : (
                <>
                  <div className="xy-ai-panel-output-slot relative">
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
                                  className={`whitespace-pre-wrap break-words ${getLibraryAiTurnFrameClass(turn.role, turn.content)}`}
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
                      <div className="xy-ai-panel-link-row flex min-w-0 items-center gap-1.5">
                        <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-[#08AACE] bg-white shadow-sm">
                          <div className="flex w-12 items-center justify-center border-r border-[#08AACE]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
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
                                ? 'bg-[#08AACE] text-white'
                                : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08AACE]'
                            }`}
                            title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}
                          >
                            当前设定
                          </button>
                          {activeSettingLinkSource === 'other' ? (
                            <div className="flex border-l border-[#08AACE]/30">
                              <button
                                type="button"
                                onClick={openOtherSettingReader}
                                className="w-[96px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08AACE]"
                                title="重新选择关联其他设定"
                              >
                                其他设定
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={openOtherSettingReader}
                              className="w-[86px] border-l border-[#08AACE]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08AACE]"
                              title="关联其他设定"
                            >
                              其他设定
                            </button>
                          )}
                          {activeSettingLinkSource === 'brainstorm' ? (
                            <div className="flex border-l border-[#08AACE]/30">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                  setIsBrainstormReaderOpen(true);
                                }}
                                className="w-[90px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08AACE]"
                                title="重新选择关联脑洞"
                              >
                                已关联脑洞
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                                setIsBrainstormReaderOpen(true);
                              }}
                              className="w-[68px] border-l border-[#08AACE]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08AACE]"
                              title={isOutlineCharacterScope ? '关联脑洞库内容到人物设定' : '关联脑洞库内容'}
                            >
                              脑洞
                            </button>
                          )}
                          {(activeSettingLinkSource === 'other' || activeSettingLinkSource === 'brainstorm') && (
                            <button
                              type="button"
                              onClick={
                                activeSettingLinkSource === 'other'
                                  ? clearActiveLinkedOtherSettings
                                  : clearActiveLinkedBrainstorm
                              }
                              className="grid w-9 shrink-0 place-items-center border-l border-[#08AACE]/30 bg-red-500 text-white transition-colors hover:bg-red-600"
                              title={activeSettingLinkSource === 'other' ? '取消关联其他设定' : '取消关联脑洞'}
                            >
                              <X className="h-4 w-4" />
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
                    {activeTab !== SETTING_TAB && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!currentSelectedEntry) {
                              addEntryToTab(activeTab, getDefaultWorkbenchLibraryEntryTitle(activeTab));
                              return;
                            }
                            updateEntry(currentSelectedEntry.id, {
                              title: currentSelectedEntry.title || getDefaultWorkbenchLibraryEntryTitle(activeTab),
                            });
                          }}
                          className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                        >
                          保存为新{activeTab}
                        </button>
                      </div>
                    )}
                    <div className="xy-ai-panel-input-row">
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
                    {activeTab === SETTING_TAB && (
                      <div className="xy-ai-panel-action-row flex items-center gap-2">
                        <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() => smartImportSettings()}
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
                      </div>
                    )}
                  </>
                </>
                  )}
                </>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
