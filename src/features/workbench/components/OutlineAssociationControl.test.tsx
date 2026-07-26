import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OutlineAssociationControl } from './OutlineAssociationControl';

describe('OutlineAssociationControl', () => {
  it('opens while unlinked and clears through the same wider button while linked', () => {
    const onOpen = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(
      <OutlineAssociationControl linked={false} wordCount={0} onOpen={onOpen} onClear={onClear} />,
    );

    fireEvent.click(screen.getByRole('button', { name: '大纲' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/关联 0 字/)).not.toBeInTheDocument();

    rerender(<OutlineAssociationControl linked wordCount={315} onOpen={onOpen} onClear={onClear} />);
    const linkedButton = screen.getByRole('button', { name: '已关联大纲' });
    expect(linkedButton).toHaveClass('w-28', 'bg-[#08AACE]');

    fireEvent.click(linkedButton);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByText('315')).toBeInTheDocument();
  });
});
