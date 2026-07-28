import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('can make the safe action primary while keeping the destructive action secondary', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="更换设定模板？"
        description="继续操作会清空设定。"
        cancelText="保留现有设定"
        confirmText="继续选择模板"
        cancelVariant="primary"
        destructiveActionSecondary
        initialFocus="cancel"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    const retainButton = screen.getByRole('button', { name: '保留现有设定' });
    expect(retainButton).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(retainButton).toHaveFocus();
    expect(screen.getByRole('button', { name: '继续选择模板' }))
      .toHaveClass('border-red-300', 'bg-white', 'text-red-600');
    expect(screen.getByRole('button', { name: '关闭' })).toHaveAttribute('title', '关闭');

    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('can render the confirm action before the cancel action without changing safe-action focus', () => {
    render(
      <ConfirmDialog
        isOpen
        title="更换设定模板？"
        description="继续操作会清空设定。"
        confirmText="继续更换模板"
        cancelText="取消"
        cancelVariant="primary"
        destructiveActionSecondary
        confirmFirst
        initialFocus="cancel"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: '取消' });
    const footerButtons = within(cancelButton.closest('footer') as HTMLElement).getAllByRole('button');
    expect(footerButtons.map((button) => button.textContent)).toEqual(['继续更换模板', '取消']);
    expect(cancelButton).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(cancelButton).toHaveFocus();
  });
});
