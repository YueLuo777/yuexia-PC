import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchHeaderSelect } from './WorkbenchHeaderSelect';

describe('WorkbenchHeaderSelect', () => {
  it('aligns its label and value inside the approved rounded black dropdown', () => {
    const onChange = vi.fn();
    const { container } = render(
      <WorkbenchHeaderSelect
        label="所属分组"
        value="作品设定"
        options={['作品设定', '世界观']}
        width={180}
        onChange={onChange}
      />,
    );

    const select = screen.getByRole('combobox', { name: '所属分组' });
    expect(select.parentElement).toHaveClass('h-[48px]', 'rounded-xl', 'border-2', 'border-slate-950');
    expect(select.parentElement).toHaveAttribute('data-workbench-header-control', 'true');
    expect(container.querySelector('span')).toHaveClass('left-6', 'text-base', 'font-black', 'leading-6');
    expect(container.querySelector('span')).not.toHaveClass('text-sm', 'font-medium', 'leading-5');
    expect(select).toHaveClass('absolute', 'bottom-0', 'h-9', 'px-6', 'pr-12', 'text-base', 'font-medium', 'leading-[34px]');
    expect(select).toHaveClass('disabled:text-slate-950', 'disabled:opacity-100');
    expect(container.querySelector('svg')).toHaveClass('right-6');
    fireEvent.change(select, { target: { value: '世界观' } });
    expect(onChange).toHaveBeenCalledWith('世界观');
  });

  it('keeps disabled selected values readable instead of placeholder gray', () => {
    render(
      <WorkbenchHeaderSelect
        label="所属分组"
        value="核心设定"
        options={['核心设定']}
        width={180}
        disabled
        onChange={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox', { name: '所属分组' });
    expect(select).toBeDisabled();
    expect(select).toHaveClass('text-slate-950', 'disabled:text-slate-950', 'disabled:opacity-100');
  });

  it('passes hover help to the disabled wrapper and select', () => {
    render(
      <WorkbenchHeaderSelect
        label="所属分组"
        value="核心设定"
        options={['核心设定']}
        width={180}
        disabled
        title="内置设定，无法删除"
        onChange={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox', { name: '所属分组' });
    expect(select).toHaveAttribute('title', '内置设定，无法删除');
    expect(select.parentElement).toHaveAttribute('title', '内置设定，无法删除');
  });
});
