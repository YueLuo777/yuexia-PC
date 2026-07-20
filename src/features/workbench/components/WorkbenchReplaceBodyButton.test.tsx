import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REPLACE_BODY_WARNING_THRESHOLD_KEY } from '@/features/workbench/model/workbenchReplaceBodyWarning';

import { WorkbenchReplaceBodyButton } from './WorkbenchReplaceBodyButton';
import { WorkbenchReplaceBodyWarningSetting } from './WorkbenchReplaceBodyWarningSetting';

describe('WorkbenchReplaceBodyButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('asks for confirmation when the replacement body has fewer than 2000 words', () => {
    const onReplaceContent = vi.fn();
    render(
      <WorkbenchReplaceBodyButton
        output={'字'.repeat(1999)}
        onReplaceContent={onReplaceContent}
        onReplaced={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '替换正文' }));

    expect(screen.getByRole('heading', { name: '正文不足字数' })).toBeInTheDocument();
    expect(screen.getByText(/只有 1999 字，少于设置的 2000 字/)).toBeInTheDocument();
    expect(onReplaceContent).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '继续替换' }));
    expect(onReplaceContent).toHaveBeenCalledTimes(1);
  });

  it('replaces immediately when the replacement body reaches the configured threshold', () => {
    const onReplaceContent = vi.fn();
    render(
      <WorkbenchReplaceBodyButton
        output={'字'.repeat(2000)}
        onReplaceContent={onReplaceContent}
        onReplaced={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '替换正文' }));

    expect(screen.queryByRole('heading', { name: '正文不足字数' })).not.toBeInTheDocument();
    expect(onReplaceContent).toHaveBeenCalledTimes(1);
  });

  it('persists the threshold edited in the body settings control', () => {
    render(<WorkbenchReplaceBodyWarningSetting />);
    const input = screen.getByRole('spinbutton', { name: '替换正文提醒字数' });

    expect(input).toHaveValue(2000);
    fireEvent.change(input, { target: { value: '1500' } });
    fireEvent.blur(input);

    expect(localStorage.getItem(REPLACE_BODY_WARNING_THRESHOLD_KEY)).toBe('1500');
    expect(input).toHaveValue(1500);
  });
});
