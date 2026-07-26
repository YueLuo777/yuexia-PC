import { useEffect, useRef } from 'react';

import { StandardModeBrainstormGenerator } from '@/features/workbench/components/StandardModeBrainstormGenerator';
import { StandardModeBrainstormPreview } from '@/features/workbench/components/StandardModeBrainstormPreview';
import { StandardModeBrainstormSidebar } from '@/features/workbench/components/StandardModeBrainstormSidebar';
import { useStandardModeBrainstorm } from '@/features/workbench/hooks/useStandardModeBrainstorm';

interface StandardModeBrainstormPageProps {
  focusGeneration?: boolean;
}

export function StandardModeBrainstormPage({ focusGeneration = false }: StandardModeBrainstormPageProps) {
  const generationInputRef = useRef<HTMLInputElement>(null);
  const brainstorm = useStandardModeBrainstorm();

  useEffect(() => {
    if (!focusGeneration) return;
    generationInputRef.current?.focus({ preventScroll: true });
  }, [focusGeneration]);

  return (
    <div
      data-standard-mode-brainstorm-page="true"
      className="grid h-full min-h-0 min-w-[1180px] grid-cols-[250px_minmax(520px,1fr)_360px] overflow-hidden bg-white"
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
      />
      <StandardModeBrainstormGenerator
        ref={generationInputRef}
        draft={brainstorm.generationDraft}
        isGenerating={brainstorm.isGenerating}
        progress={brainstorm.generationProgress}
        onFieldChange={brainstorm.updateGenerationField}
        onGenerate={brainstorm.generateBrainstorm}
        onStop={brainstorm.stopRequest}
      />
    </div>
  );
}
