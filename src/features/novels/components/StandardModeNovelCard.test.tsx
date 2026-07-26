import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StandardModeNovelCard } from './StandardModeNovelCard';

describe('StandardModeNovelCard', () => {
  it('shows cover information and opens the shared workbench from the explicit button', () => {
    const onOpenWorkbench = vi.fn();
    render(
      <StandardModeNovelCard
        novel={{
          id: 9,
          title: '九重天劫',
          type: 'novel',
          category: '玄幻',
          wordCount: 12860,
          createdAt: '2026/07/01',
          lastModifiedAt: '2026/07/26',
          cover: 'cover.png',
        }}
        settings={{ cardWidth: 'medium', coverHeight: 'medium' }}
        stats={{ outlineCount: 4, chapterCount: 18, wordCount: 12860 }}
        onOpenWorkbench={onOpenWorkbench}
      />,
    );

    expect(screen.getByRole('img', { name: '九重天劫封面' })).toBeInTheDocument();
    expect(screen.getByTestId('standard-mode-novel-card')).toBeInTheDocument();
    expect(screen.getByText('章纲数')).toBeInTheDocument();
    expect(screen.getByText('章节数')).toBeInTheDocument();
    expect(screen.getByText('总字数')).toBeInTheDocument();
    expect(screen.getByText('1.29万')).toBeInTheDocument();
    expect(screen.queryByText(/下一步/)).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '进入工作台' }));
    expect(onOpenWorkbench).toHaveBeenCalledWith(9);
  });
});
