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
    expect(container.querySelector('span')).toHaveClass('left-4', 'text-sm', 'font-medium');
    expect(select).toHaveClass('px-4', 'text-base', 'font-medium');
    fireEvent.change(select, { target: { value: '世界观' } });
    expect(onChange).toHaveBeenCalledWith('世界观');
  });
});
