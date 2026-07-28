import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PROJECT_PROGRESS_GROUPS } from './standardModeProjectProgressModel';
import { StandardModeProjectProgressTestPage } from './StandardModeProjectProgressTestPage';

describe('StandardModeProjectProgressTestPage', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('shows completed, partial and missing work with recommendation stars', () => {
    render(<StandardModeProjectProgressTestPage />);

    expect(screen.getByText('标准模式项目进度与功能取舍')).toBeInTheDocument();
    expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
    expect(screen.getAllByText('部分完成').length).toBeGreaterThan(0);
    expect(screen.getAllByText('未完成').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/推荐程度：5星，强烈推荐/).length).toBeGreaterThan(0);
    PROJECT_PROGRESS_GROUPS.forEach((group) => expect(screen.getByRole('heading', { name: group.title })).toBeInTheDocument());
  });

  it('persists decisions and copies the explicitly selected work', async () => {
    render(<StandardModeProjectProgressTestPage />);
    const itemTitle = '生成章纲前智能关联';

    fireEvent.click(screen.getByRole('button', { name: `勾选功能：${itemTitle}` }));
    const itemRow = screen.getByRole('heading', { name: itemTitle }).closest('article') as HTMLElement;
    fireEvent.click(within(itemRow).getByRole('button', { name: '要做' }));
    fireEvent.click(screen.getByRole('button', { name: '复制已勾选（1）' }));

    expect(localStorage.getItem('xinyuexia_standard_mode_project_progress_decisions_v1')).toContain('outline-smart-association');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining(itemTitle));
  });

  it('filters the board without removing saved decisions', () => {
    render(<StandardModeProjectProgressTestPage />);
    fireEvent.click(screen.getByRole('button', { name: /未完成/ }));

    expect(screen.getByRole('heading', { name: '生成章纲前智能关联' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '生成脑洞' })).not.toBeInTheDocument();
  });

  it('falls back to the document copy command when Electron denies clipboard permission', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) },
    });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
    render(<StandardModeProjectProgressTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '勾选功能：生成章纲前智能关联' }));
    fireEvent.click(screen.getByRole('button', { name: '复制已勾选（1）' }));

    expect(await screen.findByText('已复制')).toBeInTheDocument();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });
});
