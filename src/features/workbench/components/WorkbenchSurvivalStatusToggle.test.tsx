import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchSurvivalStatusToggle } from './WorkbenchSurvivalStatusToggle';

describe('WorkbenchSurvivalStatusToggle', () => {
  it('uses the approved black segmented frame and cyan selected state', () => {
    const onChange = vi.fn();
    render(<WorkbenchSurvivalStatusToggle value="存活" onChange={onChange} />);

    const group = screen.getByRole('group', { name: '生存状态' });
    const aliveButton = screen.getByRole('button', { name: '存活' });
    const deadButton = screen.getByRole('button', { name: '死亡' });

    expect(group).toHaveClass('h-[48px]', 'w-[124px]', 'rounded-xl', 'border-2', 'border-slate-950');
    expect(aliveButton).toHaveClass('bg-[#ECFEFF]', 'text-slate-950');
    expect(aliveButton.className).not.toMatch(/emerald|green/);
    expect(deadButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(deadButton);
    expect(onChange).toHaveBeenCalledWith('死亡');
  });
});
