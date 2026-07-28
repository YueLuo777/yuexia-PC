import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NewNovelModal } from './NewNovelModal';

describe('NewNovelModal', () => {
  it('switches the available genres with the selected novel channel', () => {
    render(
      <NewNovelModal
        isOpen
        type="novel"
        categories={['未分类', '玄幻', '都市']}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: '玄幻' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '古代言情' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '女频' }));

    expect(screen.getByRole('option', { name: '古代言情' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '现代言情' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '总裁' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '玄幻' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('作品题材')).toHaveValue('总裁');
  });
});
