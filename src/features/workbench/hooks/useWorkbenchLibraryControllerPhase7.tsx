import type { ComponentProps, Dispatch, SetStateAction } from 'react';

import {
  BrainstormGenerateConfirmModal,
  BrainstormPromptEditModal,
  BrainstormPromptManagerModal,
  BrainstormReaderModal,
  BrainstormRecycleModal,
} from '../components/workbenchBrainstormModals';
import { CategoryRenameDialog, SettingCreateDialog } from '../components/workbenchLibraryDialogs';
import { BRAINSTORM_TAB, SETTING_TAB } from '../components/workbenchLibraryTabs';

type GenerateProps = ComponentProps<typeof BrainstormGenerateConfirmModal>;
type PromptEditProps = ComponentProps<typeof BrainstormPromptEditModal>;
type PromptManagerProps = ComponentProps<typeof BrainstormPromptManagerModal>;
type ReaderProps = ComponentProps<typeof BrainstormReaderModal>;
type RecycleProps = ComponentProps<typeof BrainstormRecycleModal>;
type CategoryRenameProps = ComponentProps<typeof CategoryRenameDialog>;
type SettingCreateProps = ComponentProps<typeof SettingCreateDialog>;

type Phase7Input = {
  activeTab: string;
  brainstormGenerateDraft: GenerateProps['draft'];
  brainstormPromptDraft: PromptEditProps['draft'];
  brainstormPrompts: PromptManagerProps['prompts'];
  brainstormRecycleEntries: RecycleProps['entries'];
  categoryRenameDraft: CategoryRenameProps['draft'];
  clearBrainstormRecycle: RecycleProps['onConfirmClear'];
  closeBrainstormPromptEdit: PromptEditProps['onClose'];
  closeBrainstormPromptManager: PromptManagerProps['onClose'];
  closeBrainstormReader: ReaderProps['onClose'];
  closeCategoryRenameDialog: CategoryRenameProps['onClose'];
  confirmBrainstormGenerate: GenerateProps['onConfirm'];
  confirmBrainstormReaderSelection: ReaderProps['onConfirm'];
  confirmCategoryRename: CategoryRenameProps['onConfirm'];
  confirmSettingCreate: SettingCreateProps['onConfirm'];
  deleteBrainstormPrompt: PromptManagerProps['onDelete'];
  editingBrainstormPrompt: unknown;
  entries: ReaderProps['entries'];
  getSettingCreateTypeOptions: () => string[];
  handleBrainstormConfirmScroll: GenerateProps['onScroll'];
  isBrainstormConfirmScrolling: boolean;
  isBrainstormPromptManagerOpen: boolean;
  isBrainstormReaderOpen: boolean;
  isBrainstormRecycleOpen: boolean;
  isClearBrainstormRecycleConfirmOpen: boolean;
  isCreatingBrainstormPrompt: boolean;
  isLibraryAiLoading: boolean;
  openBrainstormPromptCreate: PromptManagerProps['onCreate'];
  openBrainstormPromptEdit: PromptManagerProps['onEdit'];
  outlineSettingScope: string;
  pendingCategoryRename: unknown;
  permanentlyDeleteBrainstormEntry: RecycleProps['onPermanentDelete'];
  restoreBrainstormEntry: RecycleProps['onRestore'];
  saveBrainstormPromptEdit: PromptEditProps['onSave'];
  selectedBrainstormReaderId: ReaderProps['selectedId'];
  setBrainstormGenerateDraft: Dispatch<SetStateAction<GenerateProps['draft']>>;
  setBrainstormPromptDraft: Dispatch<SetStateAction<PromptEditProps['draft']>>;
  setCategoryRenameDraft: CategoryRenameProps['onDraftChange'];
  setIsBrainstormRecycleOpen: Dispatch<SetStateAction<boolean>>;
  setIsClearBrainstormRecycleConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedBrainstormReaderId: ReaderProps['onSelect'];
  setSettingCreateContextKind: Dispatch<SetStateAction<string | null>>;
  setSettingCreateDialog: Dispatch<SetStateAction<SettingCreateProps['mode']>>;
  setSettingCreateDraft: SettingCreateProps['onDraftChange'];
  setSettingCreateTypeDraft: SettingCreateProps['onTypeChange'];
  settingCreateContextKind: string | null;
  settingCreateDialog: SettingCreateProps['mode'];
  settingCreateDraft: SettingCreateProps['draft'];
  settingCreateTypeDraft: SettingCreateProps['typeValue'];
  togglePin: PromptManagerProps['onTogglePin'];
};

export function useWorkbenchLibraryControllerPhase7({
  activeTab,
  brainstormGenerateDraft,
  brainstormPromptDraft,
  brainstormPrompts,
  brainstormRecycleEntries,
  categoryRenameDraft,
  clearBrainstormRecycle,
  closeBrainstormPromptEdit,
  closeBrainstormPromptManager,
  closeBrainstormReader,
  closeCategoryRenameDialog,
  confirmBrainstormGenerate,
  confirmBrainstormReaderSelection,
  confirmCategoryRename,
  confirmSettingCreate,
  deleteBrainstormPrompt,
  editingBrainstormPrompt,
  entries,
  getSettingCreateTypeOptions,
  handleBrainstormConfirmScroll,
  isBrainstormConfirmScrolling,
  isBrainstormPromptManagerOpen,
  isBrainstormReaderOpen,
  isBrainstormRecycleOpen,
  isClearBrainstormRecycleConfirmOpen,
  isCreatingBrainstormPrompt,
  isLibraryAiLoading,
  openBrainstormPromptCreate,
  openBrainstormPromptEdit,
  outlineSettingScope,
  pendingCategoryRename,
  permanentlyDeleteBrainstormEntry,
  restoreBrainstormEntry,
  saveBrainstormPromptEdit,
  selectedBrainstormReaderId,
  setBrainstormGenerateDraft,
  setBrainstormPromptDraft,
  setCategoryRenameDraft,
  setIsBrainstormRecycleOpen,
  setIsClearBrainstormRecycleConfirmOpen,
  setSelectedBrainstormReaderId,
  setSettingCreateContextKind,
  setSettingCreateDialog,
  setSettingCreateDraft,
  setSettingCreateTypeDraft,
  settingCreateContextKind,
  settingCreateDialog,
  settingCreateDraft,
  settingCreateTypeDraft,
  togglePin,
}: Phase7Input) {
  const brainstormEntries = entries.filter((entry) => entry.tab === BRAINSTORM_TAB);
  const closeBrainstormRecycleModal = () => {
    setIsClearBrainstormRecycleConfirmOpen(false);
    setIsBrainstormRecycleOpen(false);
  };
  const brainstormReaderModal = (
    <BrainstormReaderModal
      isOpen={isBrainstormReaderOpen}
      entries={brainstormEntries}
      selectedId={selectedBrainstormReaderId}
      onSelect={setSelectedBrainstormReaderId}
      onClose={closeBrainstormReader}
      onConfirm={confirmBrainstormReaderSelection}
    />
  );
  const brainstormRecycleModal = (
    <BrainstormRecycleModal
      isOpen={isBrainstormRecycleOpen}
      entries={brainstormRecycleEntries}
      isClearConfirmOpen={isClearBrainstormRecycleConfirmOpen}
      onClose={closeBrainstormRecycleModal}
      onRequestClear={() => setIsClearBrainstormRecycleConfirmOpen(true)}
      onCancelClear={() => setIsClearBrainstormRecycleConfirmOpen(false)}
      onConfirmClear={clearBrainstormRecycle}
      onRestore={restoreBrainstormEntry}
      onPermanentDelete={permanentlyDeleteBrainstormEntry}
    />
  );
  const clearBrainstormRecycleConfirmDialog = null;
  const brainstormPromptManagerModal = (
    <BrainstormPromptManagerModal
      isOpen={isBrainstormPromptManagerOpen}
      prompts={brainstormPrompts}
      onClose={closeBrainstormPromptManager}
      onCreate={openBrainstormPromptCreate}
      onEdit={openBrainstormPromptEdit}
      onDelete={deleteBrainstormPrompt}
      onTogglePin={togglePin}
    />
  );
  const brainstormPromptEditModal = (
    <BrainstormPromptEditModal
      isOpen={Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt)}
      isCreating={isCreatingBrainstormPrompt}
      draft={brainstormPromptDraft}
      onDraftChange={(patch) => setBrainstormPromptDraft((prev) => ({ ...prev, ...patch }))}
      onClose={closeBrainstormPromptEdit}
      onSave={saveBrainstormPromptEdit}
    />
  );
  const brainstormGenerateConfirmModal = (
    <BrainstormGenerateConfirmModal
      draft={brainstormGenerateDraft}
      isLoading={isLibraryAiLoading}
      isScrolling={isBrainstormConfirmScrolling}
      onScroll={handleBrainstormConfirmScroll}
      onClose={() => setBrainstormGenerateDraft(null)}
      onConfirm={confirmBrainstormGenerate}
    />
  );
  const settingCreateIsCharacter =
    settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
  const settingCreateItemLabel = settingCreateIsCharacter ? '角色' : '设定';
  const settingCreateTypeOptions = settingCreateDialog === 'setting' ? getSettingCreateTypeOptions() : [];
  const settingCreateTypeValue = settingCreateTypeOptions.includes(settingCreateTypeDraft)
    ? settingCreateTypeDraft
    : (settingCreateTypeOptions[0] ?? '');
  const closeSettingCreateDialog = () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  };
  const settingCreateModal = (
    <SettingCreateDialog
      mode={settingCreateDialog}
      draft={settingCreateDraft}
      itemLabel={settingCreateItemLabel}
      typeOptions={settingCreateTypeOptions}
      typeValue={settingCreateTypeValue}
      onDraftChange={setSettingCreateDraft}
      onTypeChange={setSettingCreateTypeDraft}
      onClose={closeSettingCreateDialog}
      onConfirm={confirmSettingCreate}
    />
  );
  const categoryRenameModal = (
    <CategoryRenameDialog
      isOpen={Boolean(pendingCategoryRename)}
      draft={categoryRenameDraft}
      onDraftChange={setCategoryRenameDraft}
      onClose={closeCategoryRenameDialog}
      onConfirm={confirmCategoryRename}
    />
  );
  return {
    brainstormEntries,
    closeBrainstormRecycleModal,
    brainstormReaderModal,
    brainstormRecycleModal,
    clearBrainstormRecycleConfirmDialog,
    brainstormPromptManagerModal,
    brainstormPromptEditModal,
    brainstormGenerateConfirmModal,
    settingCreateIsCharacter,
    settingCreateItemLabel,
    settingCreateTypeOptions,
    settingCreateTypeValue,
    closeSettingCreateDialog,
    settingCreateModal,
    categoryRenameModal,
  };
}
