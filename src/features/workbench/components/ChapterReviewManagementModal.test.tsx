import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChapterReviewManagementModal } from './ChapterReviewManagementModal';

describe('ChapterReviewManagementModal prompt layout', () => {
  beforeEach(() => localStorage.clear());

  it('uses four-card width and keeps the toolbar outside the card-only scroll region', () => {
    render(
      <MemoryRouter>
        <ChapterReviewManagementModal
          mode="prompts"
          modeTitle="剧情审核"
          promptCategory="审核"
          reviewManagementModalSizeClass="h-[80vh] w-[80vw]"
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    const modal = document.querySelector('[data-app-modal-panel="true"]');
    const cardScrollRegion = screen.getByTestId('prompt-card-scroll-region');
    const importButton = screen.getByRole('button', { name: '导入提示词' });

    expect(modal).toHaveClass('!w-[1128px]', '!max-w-[calc(100vw-48px)]');
    expect(cardScrollRegion).toHaveClass('overflow-y-auto', '[scrollbar-gutter:stable]');
    expect(cardScrollRegion).not.toContainElement(importButton);
  });
});
