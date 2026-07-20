import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChapterTextAuditContinuousReview } from './ChapterTextAuditContinuousReview';

const originals = [
  '第一段保持。',
  '第二段非常安静，安静得不真实。',
  '第三段保持。',
  '第四段慢慢地拿出来。',
  '第五段保持。',
];
const revisions = ['第一段保持。', '第二段静得异样。', '第三段保持。', '第四段取出。', '第五段保持。'];
const aiOutput = `【修改后全文】
${revisions.join('\n')}
【修改说明】
第2段：删除重复表达。
第4段：压缩冗长动作。`;

function renderReview(onApply = vi.fn()) {
  render(
    <ChapterTextAuditContinuousReview
      chapterKey={1}
      originalParagraphs={originals}
      revisedParagraphs={revisions}
      reviewAiOutput={aiOutput}
      fontSize={14}
      onApply={onApply}
    />,
  );
  return onApply;
}

describe('ChapterTextAuditContinuousReview', () => {
  it('shows middle changed context, compact reasons, and formal action labels', () => {
    renderReview();

    expect(screen.getByTestId('formal-text-audit-continuous-review')).toBeInTheDocument();
    expect(screen.getByText('第 4 段')).toBeInTheDocument();
    expect(screen.getByText('句式精简')).toBeInTheDocument();
    expect(screen.getByText('压缩冗长动作。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '接受修改' })).toBeInTheDocument();
    expect(screen.queryByText('当前改动')).not.toBeInTheDocument();
  });

  it('accepts one paragraph, reopens it, and applies only confirmed changes', () => {
    const onApply = renderReview();

    fireEvent.click(screen.getByRole('button', { name: '接受修改' }));
    const accepted = document.querySelector('[data-resolution-state="accepted"]');
    expect(accepted).not.toBeNull();
    expect(within(accepted as HTMLElement).getByText('已接受')).toBeInTheDocument();
    expect(within(accepted as HTMLElement).getByRole('button', { name: '重新修改' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '应用已接受修改（1）' }));
    expect(onApply).toHaveBeenCalledWith(
      ['第一段保持。', '第二段非常安静，安静得不真实。', '第三段保持。', '第四段取出。', '第五段保持。'].join('\n'),
    );

    fireEvent.click(within(accepted as HTMLElement).getByRole('button', { name: '重新修改' }));
    expect(document.querySelector('[data-resolution-state="accepted"]')).toBeNull();
    expect(screen.getByRole('button', { name: '修改后采用' })).toBeInTheDocument();
  });

  it('keeps the original or adopts a manual revision with undo available', () => {
    renderReview();
    fireEvent.click(screen.getByRole('button', { name: '保留原文' }));
    const rejected = document.querySelector('[data-resolution-state="rejected"]');
    expect(rejected).not.toBeNull();
    expect(within(rejected as HTMLElement).getByText('第四段慢慢地拿出来。')).toBeInTheDocument();
    fireEvent.click(within(rejected as HTMLElement).getByRole('button', { name: '重新修改' }));

    fireEvent.click(screen.getByRole('button', { name: '修改后采用' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '第四段伸手取出。' } });
    fireEvent.click(screen.getByRole('button', { name: '确认采用' }));
    const edited = document.querySelector('[data-resolution-state="edited"]');
    expect(edited).not.toBeNull();
    expect(within(edited as HTMLElement).getByText('第四段伸手取出。')).toBeInTheDocument();
    expect(within(edited as HTMLElement).getByRole('button', { name: '重新修改' })).toBeInTheDocument();
  });
});
