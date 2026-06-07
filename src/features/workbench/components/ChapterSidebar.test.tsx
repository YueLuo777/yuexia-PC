import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Volume } from '@/features/workbench/model/workbenchTypes';

import { ChapterSidebar } from './ChapterSidebar';

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

const renderSidebar = () => render(
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
});
