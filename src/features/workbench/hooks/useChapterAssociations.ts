import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { CHAPTER_ASSOCIATE_UPDATED_EVENT } from '@/features/workbench/model/workbenchAssociationCleanup';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';

import { readAssociatedChapterCount } from '../components/chapterEditorLayout';

interface UseChapterAssociationsOptions {
  allChapters: Chapter[];
  setIsAssociateOpen: Dispatch<SetStateAction<boolean>>;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
}

export function useChapterAssociations({
  allChapters,
  setIsAssociateOpen,
  setIsHistoryOpen,
}: UseChapterAssociationsOptions) {
  const [associatedCount, setAssociatedCount] = useState(0);
  const associatedSelectionRef = useRef(false);

  useEffect(() => {
    const openAssociate = () => setIsAssociateOpen(true);
    const openHistory = () => setIsHistoryOpen(true);
    window.addEventListener('open_chapter_associate', openAssociate);
    window.addEventListener('open_editor_history', openHistory);
    return () => {
      window.removeEventListener('open_chapter_associate', openAssociate);
      window.removeEventListener('open_editor_history', openHistory);
    };
  }, [setIsAssociateOpen, setIsHistoryOpen]);

  useEffect(() => {
    const syncAssociatedCount = () => {
      const nextCount = readAssociatedChapterCount(allChapters);
      associatedSelectionRef.current = nextCount > 0;
      setAssociatedCount(nextCount);
    };
    syncAssociatedCount();
    window.addEventListener(CHAPTER_ASSOCIATE_UPDATED_EVENT, syncAssociatedCount);
    return () => window.removeEventListener(CHAPTER_ASSOCIATE_UPDATED_EVENT, syncAssociatedCount);
  }, [allChapters]);

  const handleAssociate = (ids: number[]) => {
    associatedSelectionRef.current = ids.length > 0;
    setAssociatedCount(ids.length);
    window.dispatchEvent(new CustomEvent(CHAPTER_ASSOCIATE_UPDATED_EVENT));
  };

  return { associatedCount, handleAssociate };
}
