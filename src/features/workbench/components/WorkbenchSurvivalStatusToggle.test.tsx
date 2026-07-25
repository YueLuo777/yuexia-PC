import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchSurvivalStatusToggle } from './WorkbenchSurvivalStatusToggle';

describe('WorkbenchSurvivalStatusToggle', () => {
  it('uses the approved common software reference frame without the status label select', () => {
    const onChange = vi.fn();
    render(<WorkbenchSurvivalStatusToggle value="存活" onChange={onChange} />);

    const group = screen.getByRole('group', { name: '生存状态' });
    const aliveButton = screen.getByRole('button', { name: '存活' });
    const deadButton = screen.getByRole('button', { name: '死亡' });

    expect(group).toHaveClass('h-[48px]', 'w-[142px]', 'rounded-xl', 'border', 'border-slate-200', 'bg-slate-100/80');
    expect(group).toHaveAttribute('data-workbench-header-control', 'true');
    expect(group).not.toHaveTextContent('生存状态');
    expect(screen.queryByText('状态标签')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '状态标签' })).not.toBeInTheDocument();
    expect(aliveButton).toHaveClass('bg-white', 'text-emerald-700', 'shadow-sm', 'text-sm');
    expect(aliveButton.querySelector('.rounded-full')).toHaveClass('h-2.5', 'w-2.5');
    expect(aliveButton.className).not.toContain('bg-[#ECFEFF]');
    expect(deadButton).toHaveAttribute('aria-pressed', 'false');
    expect(deadButton).toHaveClass('text-sm');
    expect(deadButton.querySelector('.rounded-full')).toHaveClass('h-2.5', 'w-2.5');

    fireEvent.click(deadButton);
    expect(onChange).toHaveBeenCalledWith('死亡');
  });
});
