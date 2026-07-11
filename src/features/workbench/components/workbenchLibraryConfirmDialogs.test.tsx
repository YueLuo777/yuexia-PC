import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ClearSettingsConfirmDialog, EntryDeleteConfirmDialog } from './workbenchLibraryConfirmDialogs';

describe('workbenchLibraryConfirmDialogs', () => {
  it('explains that brainstorm deletion can be restored', () => {
    render(
      <EntryDeleteConfirmDialog
        pendingEntry={{ id: '1', title: '新脑洞', tab: '脑洞' }}
        roleTab="人物"
        brainstormTab="脑洞"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/删除后会进入脑洞回收站，可以恢复/)).toBeInTheDocument();
  });

  it('keeps irreversible deletion and two-step clearing explicit', () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <EntryDeleteConfirmDialog
        pendingEntry={{ id: '1', title: '林刻', tab: '人物' }}
        roleTab="人物"
        brainstormTab="脑洞"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/删除后无法恢复/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <ClearSettingsConfirmDialog
        isOpen
        step={2}
        meta={{ label: '人物设定', count: 2, description: '会删除全部人物设定。' }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText('再次确认清空人物设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认清空人物设定' })).toBeInTheDocument();
  });
});
