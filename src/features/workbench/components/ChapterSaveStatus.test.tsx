import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChapterSaveStatus } from './ChapterSaveStatus';

describe('ChapterSaveStatus', () => {
  it.each([
    ['idle', null, '自动保存'],
    ['saving', null, '正在保存...'],
    ['saved', '10:20:30', '已保存 10:20:30'],
  ] as const)('renders the %s state', (status, lastSavedAt, label) => {
    render(<ChapterSaveStatus status={status} lastSavedAt={lastSavedAt} onRetry={vi.fn()} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('allows a failed save to be retried', () => {
    const onRetry = vi.fn();
    render(<ChapterSaveStatus status="error" lastSavedAt={null} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: '保存失败，点击重试' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
