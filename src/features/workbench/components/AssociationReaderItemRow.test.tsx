import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AssociationReaderItemRow } from './AssociationReaderItemRow';
import { BrainstormReaderModal } from './BrainstormReaderModal';

describe('AssociationReaderItemRow', () => {
  it('previews from the content area and selects only from the final square control', () => {
    const onPreview = vi.fn();
    const onToggle = vi.fn();
    const { container } = render(
      <AssociationReaderItemRow
        title="废土求生"
        selected={false}
        checked={false}
        meta="120字"
        onPreview={onPreview}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByText('废土求生').closest('button')!);
    expect(onPreview).toHaveBeenCalledOnce();
    expect(onToggle).not.toHaveBeenCalled();

    const selectionBox = screen.getByRole('button', { name: '选择废土求生' });
    expect(selectionBox).toHaveClass('rounded-[3px]');
    expect(selectionBox).not.toHaveClass('rounded-full', 'rounded-md');
    expect(container.firstElementChild?.lastElementChild).toBe(selectionBox);

    fireEvent.click(selectionBox);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('keeps brainstorm preview and single selection as separate actions', () => {
    const onSelect = vi.fn();
    render(
      <BrainstormReaderModal
        isOpen
        entries={[
          { id: 'idea-1', tab: '脑洞', title: '废土求生', content: '第一份内容', updatedAt: '2026-07-22' },
          { id: 'idea-2', tab: '脑洞', title: '仙侠经营', content: '第二份内容', updatedAt: '2026-07-22' },
        ]}
        selectedId={null}
        onSelect={onSelect}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('仙侠经营').closest('button')!);
    expect(screen.getByText('第二份内容')).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '选择仙侠经营' }));
    expect(onSelect).toHaveBeenCalledWith('idea-2');
  });
});
