import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChapterEditorSettingsModal } from './ChapterEditorSettingsModal';

describe('ChapterEditor audit settings modal', () => {
  beforeEach(() => localStorage.clear());

  it('shows and persists the configurable three-second text-audit countdown', () => {
    const { unmount } = render(
      <ChapterEditorSettingsModal isOpen isAuditMode onClose={vi.fn()} />,
    );
    expect(screen.getByText('剧情审核设置')).toBeInTheDocument();
    expect(screen.getByText('导航宽度统一')).toBeInTheDocument();
    const input = screen.getByLabelText('文本审核倒计时');
    expect(input).toHaveValue(3);
    fireEvent.change(input, { target: { value: '7' } });
    expect(input).toHaveValue(7);
    unmount();

    render(<ChapterEditorSettingsModal isOpen isAuditMode onClose={vi.fn()} />);
    expect(screen.getByLabelText('文本审核倒计时')).toHaveValue(7);
  });
});
