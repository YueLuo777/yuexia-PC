import type { Dispatch, SetStateAction } from 'react';

import {
  ChapterAssociateModal,
  FontSettingsModal,
  HighFreqModal,
  HistoryModal,
  SmartFormatModal,
  SymbolReplaceModal,
  TitleOptimizeModal,
  type FontSettings,
  type FormatOptions,
} from '@/features/workbench/components/EditorToolModals';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface ChapterEditorModalHostProps {
  chapter: Chapter;
  allChapters: Chapter[];
  content: string;
  serialValue: number;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
  onDeleteChapter: (chapterId: number) => void;
  isFontSettingsOpen: boolean;
  setIsFontSettingsOpen: Dispatch<SetStateAction<boolean>>;
  fontSettings: FontSettings;
  setFontSettings: Dispatch<SetStateAction<FontSettings>>;
  isSmartFormatOpen: boolean;
  setIsSmartFormatOpen: Dispatch<SetStateAction<boolean>>;
  formatSettings: FormatOptions;
  setFormatSettings: Dispatch<SetStateAction<FormatOptions>>;
  commitContent: (content: string) => void;
  isHighFreqOpen: boolean;
  setIsHighFreqOpen: Dispatch<SetStateAction<boolean>>;
  isSymbolReplaceOpen: boolean;
  setIsSymbolReplaceOpen: Dispatch<SetStateAction<boolean>>;
  isHistoryOpen: boolean;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
  isTitleOptimizeOpen: boolean;
  setIsTitleOptimizeOpen: Dispatch<SetStateAction<boolean>>;
  onRenameChapter: (chapterId: number, title: string) => void;
  isAssociateOpen: boolean;
  setIsAssociateOpen: Dispatch<SetStateAction<boolean>>;
  onAssociate: (ids: number[]) => void;
}

export function ChapterEditorModalHost({
  chapter,
  allChapters,
  content,
  serialValue,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onDeleteChapter,
  isFontSettingsOpen,
  setIsFontSettingsOpen,
  fontSettings,
  setFontSettings,
  isSmartFormatOpen,
  setIsSmartFormatOpen,
  formatSettings,
  setFormatSettings,
  commitContent,
  isHighFreqOpen,
  setIsHighFreqOpen,
  isSymbolReplaceOpen,
  setIsSymbolReplaceOpen,
  isHistoryOpen,
  setIsHistoryOpen,
  isTitleOptimizeOpen,
  setIsTitleOptimizeOpen,
  onRenameChapter,
  isAssociateOpen,
  setIsAssociateOpen,
  onAssociate,
}: ChapterEditorModalHostProps) {
  return (
    <>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="确认删除"
        description="是否将该章节删除到回收站？删除后可在回收站中恢复。"
        confirmText="确认删除"
        confirmVariant="danger"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteChapter(chapter.id);
        }}
      />
      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        onClose={() => setIsFontSettingsOpen(false)}
        settings={fontSettings}
        onChange={setFontSettings}
      />
      <SmartFormatModal
        isOpen={isSmartFormatOpen}
        onClose={() => setIsSmartFormatOpen(false)}
        currentText={content}
        settings={formatSettings}
        onSettingsChange={setFormatSettings}
        onApply={(next, settings) => {
          setFormatSettings(settings);
          commitContent(next);
        }}
      />
      <HighFreqModal isOpen={isHighFreqOpen} onClose={() => setIsHighFreqOpen(false)} />
      <SymbolReplaceModal isOpen={isSymbolReplaceOpen} onClose={() => setIsSymbolReplaceOpen(false)} />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        chapterId={chapter.id}
        onRestore={commitContent}
      />
      <TitleOptimizeModal
        isOpen={isTitleOptimizeOpen}
        onClose={() => setIsTitleOptimizeOpen(false)}
        currentChapterSerial={serialValue}
        currentContent={content}
        onApply={(title) => onRenameChapter(chapter.id, title.slice(0, 20))}
      />
      <ChapterAssociateModal
        isOpen={isAssociateOpen}
        onClose={() => setIsAssociateOpen(false)}
        chapters={allChapters.map((item) => ({
          id: item.id,
          serialNumber: item.serialNumber,
          wordCount: item.wordCount,
        }))}
        onAssociate={onAssociate}
      />
    </>
  );
}
