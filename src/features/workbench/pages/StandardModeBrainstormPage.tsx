import { useEffect, useRef } from 'react';

import { StandardModeBrainstormGenerator } from '@/features/workbench/components/StandardModeBrainstormGenerator';
import { StandardModeBrainstormActions } from '@/features/workbench/components/StandardModeBrainstormActions';
import { StandardModeBrainstormPreview } from '@/features/workbench/components/StandardModeBrainstormPreview';
import { StandardModeBrainstormSidebar } from '@/features/workbench/components/StandardModeBrainstormSidebar';
import { BrainstormRecycleModal } from '@/features/workbench/components/BrainstormRecycleModal';
import { useStandardModeBrainstorm } from '@/features/workbench/hooks/useStandardModeBrainstorm';
import { writeStandardModeBrainstormLink } from '@/features/workbench/model/standardModeBrainstormLink';

interface StandardModeBrainstormPageProps {
  focusGeneration?: boolean;
  novelId?: string;
  onCreateSettings?: () => void;
  onOpenLibrary?: () => void;
}

export function StandardModeBrainstormPage({
  focusGeneration = false,
  novelId = '',
  onCreateSettings = () => undefined,
  onOpenLibrary = () => undefined,
}: StandardModeBrainstormPageProps) {
  const generationInputRef = useRef<HTMLInputElement>(null);
  const brainstorm = useStandardModeBrainstorm();
  const { prepareGeneration, prepareLibrary } = brainstorm;

  useEffect(() => {
    if (focusGeneration) {
      prepareGeneration();
      generationInputRef.current?.focus({ preventScroll: true });
      return;
    }
    prepareLibrary();
  }, [focusGeneration, prepareGeneration, prepareLibrary]);

  return (
    <>
      <div
        data-standard-mode-brainstorm-page="true"
        className="grid h-full min-h-0 min-w-[1240px] grid-cols-[280px_minmax(560px,1fr)_390px] overflow-hidden bg-white"
      >
      <StandardModeBrainstormSidebar
        entries={brainstorm.entries}
        categories={brainstorm.categories}
        selectedEntryId={brainstorm.selectedEntryId}
        recycleCount={brainstorm.recycleEntries.length}
        onSelect={(entry) => {
          brainstorm.selectEntry(entry);
          if (focusGeneration) onOpenLibrary();
        }}
        onAddCategory={brainstorm.addCategory}
        onRenameCategory={brainstorm.renameCategory}
        onToggleCategory={brainstorm.toggleCategory}
        onDeleteCategory={brainstorm.deleteCategory}
        onMoveEntry={brainstorm.moveEntryToCategory}
        onDeleteSelected={brainstorm.deleteActiveVersion}
        onOpenRecycle={brainstorm.openRecycle}
      />
      <StandardModeBrainstormPreview
        activeVersion={brainstorm.activeVersion}
        revisionInput={brainstorm.revisionInput}
        revisionSourceContent={brainstorm.revisionSourceContent}
        revisionDraft={brainstorm.revisionDraft}
        notice={brainstorm.notice}
        isRevising={brainstorm.isRevising}
        busy={brainstorm.busy}
        previewFontSize={brainstorm.previewFontSize}
        onTitleChange={brainstorm.updateActiveVersionTitle}
        onTitleBlur={brainstorm.normalizeActiveVersionTitle}
        onContentChange={brainstorm.updateActiveVersionContent}
        onRevisionInputChange={brainstorm.setRevisionInput}
        onRevisionDraftChange={brainstorm.setRevisionDraft}
        onRevise={brainstorm.reviseActiveVersion}
        onApplyRevision={brainstorm.applyRevision}
        onDiscardRevision={brainstorm.discardRevision}
        onStop={brainstorm.stopRequest}
        onCopy={brainstorm.copyActiveVersion}
        onSave={brainstorm.saveActiveVersion}
        onPreviewFontSizeChange={brainstorm.updatePreviewFontSize}
        generationMode={focusGeneration}
      />
      {focusGeneration ? (
        <StandardModeBrainstormGenerator
          ref={generationInputRef}
          draft={brainstorm.generationDraft}
          isGenerating={brainstorm.isGenerating}
          progress={brainstorm.generationProgress}
          onFieldChange={brainstorm.updateGenerationField}
          onGenerate={brainstorm.generateBrainstorm}
          onStop={brainstorm.stopRequest}
        />
      ) : (
        <StandardModeBrainstormActions
          entry={brainstorm.selectedEntry}
          onCreateSettings={() => {
            if (brainstorm.activeVersion) {
              writeStandardModeBrainstormLink(novelId, brainstorm.activeVersion);
            }
            onCreateSettings();
          }}
          onCopy={brainstorm.copyActiveVersion}
          onDuplicate={brainstorm.duplicateActiveVersion}
        />
      )}
      </div>
      <BrainstormRecycleModal
        isOpen={brainstorm.isRecycleOpen}
        entries={brainstorm.recycleEntries}
        isClearConfirmOpen={brainstorm.isClearRecycleConfirmOpen}
        onClose={brainstorm.closeRecycle}
        onRequestClear={brainstorm.requestClearRecycle}
        onCancelClear={brainstorm.cancelClearRecycle}
        onConfirmClear={brainstorm.clearRecycle}
        onRestore={brainstorm.restoreRecycleEntry}
        onPermanentDelete={brainstorm.permanentlyDeleteRecycleEntry}
      />
    </>
  );
}
