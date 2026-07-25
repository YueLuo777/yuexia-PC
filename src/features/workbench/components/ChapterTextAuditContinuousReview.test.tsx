import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  const view = render(
    <ChapterTextAuditContinuousReview
      chapterKey={1}
      originalParagraphs={originals}
      revisedParagraphs={revisions}
      reviewAiOutput={aiOutput}
      fontSize={14}
      onApply={onApply}
    />,
  );
  return { onApply, ...view };
}

describe('ChapterTextAuditContinuousReview', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows middle changed context, compact reasons, and formal action labels', () => {
    renderReview();

    expect(screen.getByTestId('formal-text-audit-continuous-review')).toBeInTheDocument();
    expect(screen.getByText('第4段')).toBeInTheDocument();
    expect(screen.getByText('句式精简')).toBeInTheDocument();
    expect(screen.getByText('压缩冗长动作。')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '接受修改' })).toHaveLength(2);
    expect(screen.queryByText('当前改动')).not.toBeInTheDocument();
    const paragraphMeta = document.querySelector('[data-paragraph-meta="4"]');
    expect(paragraphMeta).toHaveAttribute('data-review-column', 'paragraph');
    expect(document.querySelector('[data-review-column="original"] [data-paragraph-meta]')).toBeNull();
    expect(paragraphMeta).toHaveTextContent('第4段');
    expect(paragraphMeta?.parentElement).toHaveClass('grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)]');
    expect(paragraphMeta?.querySelector('.rounded-full')).toHaveClass(
      'border-[#8FE4F2]',
      'bg-[#DDF8FC]',
      'text-[#057C99]',
    );
  });

  it('defaults to the full chapter, remembers context range, and places range controls on the left', () => {
    const { unmount } = renderReview();
    const fullChapterButton = screen.getByRole('button', { name: '完整章节' });
    const changesOnlyButton = screen.getByRole('button', { name: '只显示修改' });
    const oneParagraphButton = screen.getByRole('button', { name: '前后1段' });
    const twoParagraphButton = screen.getByRole('button', { name: '前后2段' });
    const previousButton = screen.getByRole('button', { name: '上一处' });
    const header = screen.getByText('原文').closest('.shrink-0');
    const toolbar = fullChapterButton.closest('.shrink-0');
    expect(fullChapterButton).toHaveClass('bg-[#EAF9FD]');
    expect(fullChapterButton.compareDocumentPosition(changesOnlyButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(changesOnlyButton.compareDocumentPosition(oneParagraphButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(oneParagraphButton.compareDocumentPosition(twoParagraphButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(header?.compareDocumentPosition(toolbar as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      fullChapterButton.closest('div')?.compareDocumentPosition(previousButton.closest('div') as Node) ?? 0,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    fireEvent.click(screen.getByRole('button', { name: '前后1段' }));
    expect(localStorage.getItem('xinyuexia_text_audit_context_range_v1')).toBe('1');
    unmount();
    renderReview();

    expect(screen.getByRole('button', { name: '前后1段' })).toHaveClass('bg-[#EAF9FD]');
  });

  it('shows every changed paragraph on one page without previous or next navigation', () => {
    renderReview();
    fireEvent.click(screen.getByRole('button', { name: '只显示修改' }));

    expect(screen.getByText('第2段')).toBeInTheDocument();
    expect(screen.getByText('第4段')).toBeInTheDocument();
    expect(screen.queryByText('第1段')).not.toBeInTheDocument();
    expect(screen.queryByText('第3段')).not.toBeInTheDocument();
    expect(screen.queryByText('第5段')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '接受修改' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: '上一处' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下一处' })).not.toBeInTheDocument();
    expect(localStorage.getItem('xinyuexia_text_audit_context_range_v1')).toBe('"changes"');
  });

  it('accepts one paragraph, reopens it, and applies only confirmed changes', () => {
    const { onApply } = renderReview();
    fireEvent.click(screen.getByRole('button', { name: '前后1段' }));

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
    fireEvent.click(screen.getByRole('button', { name: '前后1段' }));
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
