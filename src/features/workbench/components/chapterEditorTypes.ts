import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { WorkbenchSaveStatus } from '@/features/workbench/model/workbenchSaveStatus';
import type { ChapterEditorEmbeddedMode } from './chapterEditorReviewConfig';

export interface ChapterEditorProps {
  embeddedMode?: ChapterEditorEmbeddedMode;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  chapter: Chapter | null;
  volumeName: string | null;
  content: string;
  saveStatus?: WorkbenchSaveStatus;
  lastSavedAt: string | null;
  allChapters: Chapter[];
  volumes?: Volume[];
  settingsStorageKey: string;
  outlineStorageKey?: string;
  reviewLibraryEntries?: WorkbenchLibraryEntry[];
  getChapterContent: (chapterId: number) => string;
  onUpdateChapterContent: (chapterId: number, content: string) => void;
  onRenameChapter: (chapterId: number, title: string) => void;
  onChangeContent: (content: string) => void;
  onFlushSave?: () => boolean;
  onRetrySave?: () => void;
  onUpdateSerialNumber: (chapterId: number, serialNumber: number) => void;
  onDeleteChapter: (chapterId: number) => void;
  onOpenFind: () => void;
  onOpenSummaryLibrary: () => void;
}
