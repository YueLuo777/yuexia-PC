import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChapterAuditTextStageCard } from './ChapterAuditTextStageCard';

describe('ChapterAuditTextStageCard', () => {
  it('shows the countdown with immediate and cancel actions', () => {
    const onStartNow = vi.fn();
    const onCancel = vi.fn();
    render(
      <ChapterAuditTextStageCard
        stage={{ status: 'countdown', seconds: 3 }}
        canRunTextAudit
        disabled={false}
        reviewAiOutput=""
        onStartNow={onStartNow}
        onCancel={onCancel}
        onRunManually={vi.fn()}
      />,
    );
    expect(screen.getByText('3秒后开始文本审核')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '立即审核' }));
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onStartNow).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('offers manual text auditing after a failed plot audit', () => {
    const onRunManually = vi.fn();
    render(
      <ChapterAuditTextStageCard
        stage={{ status: 'blocked', seconds: 0 }}
        canRunTextAudit
        disabled={false}
        reviewAiOutput=""
        onStartNow={vi.fn()}
        onCancel={vi.fn()}
        onRunManually={onRunManually}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '仍然进行文本审核' }));
    expect(onRunManually).toHaveBeenCalledOnce();
  });

  it('keeps the completed text-audit result in the same cyan palette as its running state', () => {
    render(
      <ChapterAuditTextStageCard
        stage={{ status: 'complete', seconds: 0 }}
        canRunTextAudit
        disabled={false}
        reviewAiOutput={'【文本审核结果】\n【结果】通过\n【说明】未发现需要修改的明确文本问题。'}
        onStartNow={vi.fn()}
        onCancel={vi.fn()}
        onRunManually={vi.fn()}
      />,
    );
    const title = screen.getByText('文本审核 通过');
    expect(title).toHaveClass('font-black');
    expect(title.parentElement).toHaveClass('border-cyan-200', 'bg-cyan-50', 'text-[#078fb0]');
    expect(screen.getByText('未发现需要修改的明确文本问题。')).toBeInTheDocument();
  });
});
