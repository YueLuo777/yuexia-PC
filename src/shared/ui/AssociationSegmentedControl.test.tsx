import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AssociationSegmentedControl } from './AssociationSegmentedControl';

describe('AssociationSegmentedControl', () => {
  it('keeps outline and body associations on the same visual baseline', () => {
    const onClick = vi.fn();

    render(
      <AssociationSegmentedControl
        segments={[
          {
            id: 'outline',
            label: '已关联大纲',
            active: true,
            onClick,
            minWidthClassName: 'w-28',
          },
        ]}
        meta="关联 315 字"
      />,
    );

    expect(screen.getByText('关联', { selector: 'span' })).toHaveClass('w-12', 'border-[#08AACE]/30');
    expect(screen.getByRole('button', { name: '已关联大纲' })).toHaveClass('w-28', 'bg-[#08AACE]', 'text-white');
    expect(screen.getByText('关联 315 字')).toHaveClass('text-sm', 'text-slate-400');

    fireEvent.click(screen.getByRole('button', { name: '已关联大纲' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports the body-only chapter segment without changing the shared shell', () => {
    render(
      <AssociationSegmentedControl
        segments={[
          { id: 'chapter', label: '本章', active: false, onClick: vi.fn(), minWidthClassName: 'w-24' },
          { id: 'materials', label: '已关联资料', active: true, onClick: vi.fn(), minWidthClassName: 'w-28' },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: '本章' })).toHaveClass('w-24', 'bg-white');
    expect(screen.getByRole('button', { name: '已关联资料' })).toHaveClass('w-28', 'border-l', 'bg-[#08AACE]');
  });
});
