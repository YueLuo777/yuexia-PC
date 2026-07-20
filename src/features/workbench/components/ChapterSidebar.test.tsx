import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Volume } from '@/features/workbench/model/workbenchTypes';

import { ChapterSidebar } from './ChapterSidebar';
import { readChapterEditorSource } from './chapterEditorSource.testUtils';

const volumes: Volume[] = [
  {
    id: 1,
    name: '第一卷',
    isExpanded: true,
    chapters: [
      {
        id: 101,
        title: '开端',
        serialNumber: 1,
        wordCount: 1200,
        isSelected: false,
      },
    ],
  },
];

const renderSidebar = () =>
  render(
    <ChapterSidebar
      volumes={volumes}
      sortAsc
      recycledCount={0}
      workType="novel"
      showPublished={false}
      onTogglePublished={vi.fn()}
      onToggleVolume={vi.fn()}
      onToggleSort={vi.fn()}
      onSelectChapter={vi.fn()}
      onAddChapter={vi.fn()}
      onAddVolume={vi.fn()}
      onDeleteVolume={vi.fn()}
      onDeleteChapter={vi.fn()}
      onPublishChapter={vi.fn()}
      onOpenRecycle={vi.fn()}
      onExportChapters={vi.fn()}
      getChapterWordCount={() => 1200}
    />,
  );

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('ChapterSidebar', () => {
  it('shows an in-app prompt instead of a native alert when deleting a non-empty volume', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    renderSidebar();

    fireEvent.contextMenu(screen.getByText('第一卷'));
    fireEvent.click(screen.getByRole('button', { name: '删除卷' }));

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: '无法删除卷' })).toBeInTheDocument();
    expect(screen.getByText('该卷下还有章节，请先删除章节后再删除卷。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '取消' })).not.toBeInTheDocument();

    alertSpy.mockRestore();
  });

  it('keeps volume and chapter labels visually aligned near the left edge', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const publishedSidebarSource = readSource('PublishedSidebar.tsx');

    expect(chapterSidebarSource).toContainSource('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 200;');
    expect(chapterSidebarSource).toContainSource('width = CHAPTER_SIDEBAR_DEFAULT_WIDTH');
    expect(publishedSidebarSource).toContainSource('width = 170');
    expect(chapterSidebarSource).not.toContainSource('const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 300;');
    expect(publishedSidebarSource).not.toContainSource('width = 190,');

    expect(chapterSidebarSource).toContainSource(
      'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-1 text-left text-[14px]',
    );
    expect(chapterSidebarSource).toContainSource(
      "const WORKBENCH_FOLDER_GROUP_DEFAULT_TONE_CLASS = 'border-[#BDEEF7] xy-flow-group-bg';",
    );

    for (const source of [publishedSidebarSource]) {
      expect(source).toContainSource(
        'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-1 text-left text-[14px]',
      );
      expect(source).toContainSource(
        "const WORKBENCH_FOLDER_GROUP_DEFAULT_TONE_CLASS = 'border-[#BDEEF7] xy-flow-group-bg';",
      );
      expect(source).toContainSource('overflow-y-auto px-1 py-2');
      expect(source).toContainSource('className="mt-0.5 space-y-0.5"');
      expect(source).not.toContainSource('className="ml-1 mt-0.5 space-y-0.5"');
    }
    expect(chapterSidebarSource).toContainSource('overflow-y-auto px-1 py-2');
    expect(chapterSidebarSource).toContainSource('className="mt-0.5 space-y-0.5"');
    expect(chapterSidebarSource).not.toContainSource('className="ml-1 mt-0.5 space-y-0.5"');
    expect(chapterSidebarSource).toContainSource('rounded-[8px] border px-1 py-1');
    expect(publishedSidebarSource).toContainSource('border-l-[3px] px-1 py-1');
    expect(chapterSidebarSource).toContainSource(
      'className="ml-auto shrink-0 text-[11px] font-black text-gray-400 transition-opacity group-hover:opacity-0"',
    );
    expect(publishedSidebarSource).toContainSource(
      'className="ml-auto shrink-0 text-[11px] font-black text-gray-400 transition-opacity group-hover:opacity-0"',
    );
    expect(chapterSidebarSource).not.toContainSource('rounded-[8px] border px-[24px] py-1');
    expect(publishedSidebarSource).not.toContainSource('border-l-[3px] px-[26px] py-1');
    expect(chapterSidebarSource).not.toContainSource('rounded-[8px] border px-[24px] py-2');
    expect(publishedSidebarSource).not.toContainSource('border-l-[3px] px-[26px] py-2');
  });

  it('aligns the unpublished header height with the body editor chapter toolbar', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const chapterEditorSource = readChapterEditorSource();

    expect(chapterSidebarSource).toContainSource(
      'className="flex h-12 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3"',
    );
    expect(chapterEditorSource).toContainSource(
      'className="flex h-12 shrink-0 items-center gap-2 border-b border-[#e6e8ec] bg-white px-4"',
    );
    expect(chapterSidebarSource).toContainSource(
      'className="flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 text-sm text-white transition-colors hover:bg-[#0798b8]"',
    );
    expect(chapterSidebarSource).not.toContainSource(
      'className="flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5"',
    );
    expect(chapterEditorSource).not.toContainSource(
      'className="flex items-center gap-2 border-b border-[#e6e8ec] bg-white px-4 py-2"',
    );
  });

  it('uses the brainstorm library gray background for the body left navigation area', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');

    expect(chapterSidebarSource).toContainSource(
      'className="flex shrink-0 flex-col border-r border-[#e1e5eb] bg-gray-50"',
    );
    expect(chapterSidebarSource).not.toContainSource(
      'className="flex shrink-0 flex-col border-r border-[#e1e5eb] bg-white"',
    );
  });

  it('only changes the selected chapter background in the body chapter list', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const sharedStylesSource = Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        join(
          dirname(fileURLToPath(import.meta.url)),
          '../../../shared/styles/parts',
          `part-${String(index + 1).padStart(2, '0')}.css`,
        ),
        'utf8',
      ),
    ).join('\n');

    expect(chapterSidebarSource).toContainSource("? 'border-transparent xy-selected-mint-bg'");
    expect(chapterSidebarSource).toContainSource('xy-chapter-sidebar-row');
    expect(sharedStylesSource).toContainSource('.theme-shuimo .xy-chapter-sidebar-row.xy-selected-mint-bg::before');
    expect(sharedStylesSource).toContainSource('content: none;');
    expect(chapterSidebarSource).toContainSource(
      'className="flex-1 truncate whitespace-nowrap text-sm font-black text-gray-700"',
    );
    expect(chapterSidebarSource).toContainSource(
      'className="ml-auto shrink-0 text-[11px] font-black text-gray-400 transition-opacity group-hover:opacity-0"',
    );
    expect(chapterSidebarSource).not.toContainSource("? 'border-[#FDBA74] bg-[#FFF7ED]'");
    expect(chapterSidebarSource).not.toContainSource("? 'text-[#F97316]' : 'text-gray-700'");
    expect(chapterSidebarSource).not.toContainSource("? 'text-[#2563EB]' : 'text-gray-400'");
    expect(chapterSidebarSource).not.toContainSource("? 'border-[#BDEEF7] bg-[#E7F8FD]'");
  });

  it('shows chapter titles in the published chapter list after publishing', () => {
    const publishedSidebarSource = readSource('PublishedSidebar.tsx');

    expect(publishedSidebarSource).toContainSource(
      "第{chapter.serialNumber}章{chapter.title ? ` ${chapter.title}` : ''}",
    );
    expect(publishedSidebarSource).not.toContainSource(
      '<span className="hidden">{chapter.title ? ` ${chapter.title}` : \'\'}',
    );
  });

  it('uses the same cyan action color for publish and retract buttons', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const publishedSidebarSource = readSource('PublishedSidebar.tsx');
    const actionTone = 'bg-[#08AACE] px-2 py-1 text-xs leading-none text-white';

    expect(chapterSidebarSource).toContainSource(actionTone);
    expect(publishedSidebarSource).toContainSource(actionTone);
    expect(publishedSidebarSource).toContainSource('hover:bg-[#0798b8]');
    expect(publishedSidebarSource).not.toContainSource('bg-gray-400 px-2 py-1 text-xs');
  });

  it('keeps volume rows in the default folder color while selected chapters use mint green', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const publishedSidebarSource = readSource('PublishedSidebar.tsx');
    const sharedStylesSource = Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        join(
          dirname(fileURLToPath(import.meta.url)),
          '../../../shared/styles/parts',
          `part-${String(index + 1).padStart(2, '0')}.css`,
        ),
        'utf8',
      ),
    ).join('\n');

    expect(chapterSidebarSource).toContainSource(
      'className={`${WORKBENCH_FOLDER_GROUP_BUTTON_BASE_CLASS} ${WORKBENCH_FOLDER_GROUP_DEFAULT_TONE_CLASS}`',
    );
    expect(publishedSidebarSource).toContainSource(
      'className={`${WORKBENCH_FOLDER_GROUP_BUTTON_BASE_CLASS} ${WORKBENCH_FOLDER_GROUP_DEFAULT_TONE_CLASS}`',
    );
    expect(chapterSidebarSource).toContainSource('font-black text-[#1f2933]');
    expect(sharedStylesSource).toContainSource('.xy-selected-mint-bg,');
    expect(sharedStylesSource).toContainSource('background-color: var(--xy-custom-content-selected-bg) !important;');
    expect(chapterSidebarSource).not.toContainSource('volumeHasSelectedChapter');
    expect(publishedSidebarSource).not.toContainSource('volumeHasSelectedChapter');
    expect(chapterSidebarSource).not.toContainSource('WORKBENCH_FOLDER_GROUP_SELECTED_TONE_CLASS');
    expect(publishedSidebarSource).not.toContainSource('WORKBENCH_FOLDER_GROUP_SELECTED_TONE_CLASS');
  });

  it('uses the reference popup style for chapter context menus with a placeholder group submenu', () => {
    const chapterSidebarSource = readSource('ChapterSidebar.tsx');
    const publishedSidebarSource = readSource('PublishedSidebar.tsx');

    for (const source of [chapterSidebarSource, publishedSidebarSource]) {
      expect(source).toContainSource(
        'w-[136px] overflow-visible rounded-[8px] border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)]',
      );
      expect(source).toContainSource('left-[calc(100%+4px)] top-0 hidden w-[176px]');
      expect(source).toContainSource('重命名');
      expect(source).toContainSource('修改章节');
      expect(source).toContainSource('移入分组');
      expect(source).toContainSource('暂留选项');
      expect(source).toContainSource('删除章节');
      expect(source).toContainSource('text-[#ff3b30]');
    }

    expect(chapterSidebarSource).toContainSource('发布章节');
    expect(publishedSidebarSource).toContainSource('撤回章节');
  });
});
