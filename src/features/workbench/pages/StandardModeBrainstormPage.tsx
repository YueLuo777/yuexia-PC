import { useEffect, useRef } from 'react';

import { StandardModeBrainstormGenerator } from '@/features/workbench/components/StandardModeBrainstormGenerator';
import { StandardModeBrainstormActions } from '@/features/workbench/components/StandardModeBrainstormActions';
import { StandardModeBrainstormPreview } from '@/features/workbench/components/StandardModeBrainstormPreview';
import { StandardModeBrainstormSidebar } from '@/features/workbench/components/StandardModeBrainstormSidebar';
import { useStandardModeBrainstorm } from '@/features/workbench/hooks/useStandardModeBrainstorm';

interface StandardModeBrainstormPageProps {
  focusGeneration?: boolean;
  novelId?: string;
  onCreateSettings?: () => void;
}

export function StandardModeBrainstormPage({ focusGeneration = false, novelId = '', onCreateSettings = () => undefined }: StandardModeBrainstormPageProps) {
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
    <div
      data-standard-mode-brainstorm-page="true"
      className="grid h-full min-h-0 min-w-[1240px] grid-cols-[280px_minmax(560px,1fr)_390px] overflow-hidden bg-white"
    >
      <StandardModeBrainstormSidebar
        entries={brainstorm.entries}
        selectedEntryId={brainstorm.selectedEntryId}
        onSelect={brainstorm.selectEntry}
      />
      <StandardModeBrainstormPreview
        activeVersion={brainstorm.activeVersion}
        revisionInput={brainstorm.revisionInput}
        notice={brainstorm.notice}
        isRevising={brainstorm.isRevising}
        busy={brainstorm.busy}
        onTitleChange={brainstorm.updateActiveVersionTitle}
        onTitleBlur={brainstorm.normalizeActiveVersionTitle}
        onContentChange={brainstorm.updateActiveVersionContent}
        onRevisionInputChange={brainstorm.setRevisionInput}
        onRevise={brainstorm.reviseActiveVersion}
        onStop={brainstorm.stopRequest}
        onDelete={brainstorm.deleteActiveVersion}
        onCopy={brainstorm.copyActiveVersion}
        onSave={brainstorm.saveActiveVersion}
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
              localStorage.setItem(`xinyuexia_standard_brainstorm_link_${novelId}`, JSON.stringify(brainstorm.activeVersion));
            }
            onCreateSettings();
          }}
          onDuplicate={brainstorm.duplicateActiveVersion}
          onAssociate={() => {
            if (!brainstorm.activeVersion) return;
            localStorage.setItem(`xinyuexia_standard_brainstorm_link_${novelId}`, JSON.stringify(brainstorm.activeVersion));
            brainstorm.showNotice('当前脑洞已关联到这本作品。');
          }}
        />
      )}
    </div>
  );
}
