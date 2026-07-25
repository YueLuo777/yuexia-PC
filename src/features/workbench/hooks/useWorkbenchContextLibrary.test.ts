import { describe, expect, it, vi } from 'vitest';

import { buildWorkbenchContextLibrary } from './useWorkbenchContextLibrary';

const outlineItem = {
  id: 'outline-1',
  source: 'outline' as const,
  group: '章纲',
  title: '第一章',
  content: '本章章纲',
};

function buildContext(contextSelectionTouched: boolean) {
  return buildWorkbenchContextLibrary({
    contextChapterRows: [
      {
        volumeId: 1,
        volumeName: '第一卷',
        chapterId: 1,
        title: '第一章',
        chapterItem: { ...outlineItem, id: 'chapter-1', source: 'chapter', content: '' },
        outlineItem,
        summaryItem: null,
        serialNumber: 1,
        isCurrent: true,
      },
    ],
    contextSelectionTouched,
    currentNovelId: 1,
    draftContextIds: new Set(),
    linkedContextItems: [],
    outlineContextItems: [outlineItem],
    roleContextItems: [],
    selectedChapterSerialNumber: 1,
    setContextLibraryTab: vi.fn(),
    setContextSelectionTouched: vi.fn(),
    setDraftContextIds: vi.fn(),
    setIsContextLibraryOpen: vi.fn(),
    setLinkedContextItems: vi.fn(),
    settingContextItems: [],
    statusContextItems: [],
    summaryContextItems: [],
  });
}

describe('buildWorkbenchContextLibrary', () => {
  it('does not recreate the current outline after associations were explicitly cleared', () => {
    const context = buildContext(true);
    expect(context.shouldAttachRequiredContext).toBe(false);
    expect(context.effectiveLinkedContextItems).toEqual([]);
  });

  it('keeps the original automatic outline behavior only before the selection is touched', () => {
    const context = buildContext(false);
    expect(context.shouldAttachRequiredContext).toBe(true);
    expect(context.effectiveLinkedContextItems).toEqual([outlineItem]);
  });

  it('allows selected chapter content to be confirmed when the current chapter has no outline', () => {
    const previousChapterItem = {
      id: 'chapter-1',
      source: 'chapter' as const,
      group: '正文',
      title: '第1章',
      content: '上一章正文内容',
    };
    const emptyCurrentOutline = {
      ...outlineItem,
      id: 'outline-2',
      title: '第2章',
      content: '',
    };
    const setLinkedContextItems = vi.fn();
    const context = buildWorkbenchContextLibrary({
      contextChapterRows: [
        {
          volumeId: 1,
          volumeName: '第一卷',
          chapterId: 1,
          title: '第1章',
          chapterItem: previousChapterItem,
          outlineItem,
          summaryItem: null,
          serialNumber: 1,
          isCurrent: false,
        },
        {
          volumeId: 1,
          volumeName: '第一卷',
          chapterId: 2,
          title: '第2章',
          chapterItem: { ...previousChapterItem, id: 'chapter-2', title: '第2章', content: '' },
          outlineItem: emptyCurrentOutline,
          summaryItem: null,
          serialNumber: 2,
          isCurrent: true,
        },
      ],
      contextSelectionTouched: true,
      currentNovelId: null,
      draftContextIds: new Set([previousChapterItem.id]),
      linkedContextItems: [],
      outlineContextItems: [outlineItem],
      roleContextItems: [],
      selectedChapterSerialNumber: 2,
      setContextLibraryTab: vi.fn(),
      setContextSelectionTouched: vi.fn(),
      setDraftContextIds: vi.fn(),
      setIsContextLibraryOpen: vi.fn(),
      setLinkedContextItems,
      settingContextItems: [],
      statusContextItems: [],
      summaryContextItems: [],
    });

    expect(context.requiredContextItems).toEqual([]);
    expect(context.canConfirmContextLibrary).toBe(true);
    expect(context.contextLibraryConfirmTitle).toBe('确认关联资料');

    context.confirmContextLibrary();
    expect(setLinkedContextItems).toHaveBeenCalledWith([previousChapterItem]);
  });
});
