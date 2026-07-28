import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchSurvivalStatusToggle } from './WorkbenchSurvivalStatusToggle';

describe('WorkbenchSurvivalStatusToggle', () => {
  it('reuses the identity-position field frame with the survival-status label', () => {
    const onChange = vi.fn();
    render(<WorkbenchSurvivalStatusToggle value="存活" onChange={onChange} />);

    const select = screen.getByRole('combobox', { name: '生存状态' });
    const frame = select.parentElement;

    expect(frame).toHaveClass('h-[48px]', 'rounded-xl', 'border-2', 'border-slate-950', 'bg-white');
    expect(frame).toHaveStyle({ width: '140px', minWidth: '140px', maxWidth: '140px' });
    expect(frame).toHaveAttribute('data-workbench-header-control', 'true');
    expect(frame).toHaveTextContent('生存状态');
    expect(select).toHaveValue('存活');
    expect(screen.getByRole('option', { name: '存活' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '死亡' })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: '死亡' } });
    expect(onChange).toHaveBeenCalledWith('死亡');
  });

  it('locks a disabled protagonist field to alive even when stale data says dead', () => {
    const onChange = vi.fn();
    render(<WorkbenchSurvivalStatusToggle value="死亡" disabled onChange={onChange} />);

    const select = screen.getByRole('combobox', { name: '生存状态' });
    expect(select).toBeDisabled();
    expect(select).toHaveValue('存活');
    expect(select).toHaveAttribute('title', '男主角固定为存活状态');
    expect(screen.queryByRole('option', { name: '死亡' })).not.toBeInTheDocument();
  });
});
