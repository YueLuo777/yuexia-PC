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
});
