import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChapterReviewOriginalBody } from './ChapterReviewOriginalBody';

describe('ChapterReviewOriginalBody', () => {
  it('uses body-like typography and a subtle dot instead of paragraph cards', () => {
    const onSelectParagraph = vi.fn();
    const paragraphRefs = { current: [] as Array<HTMLButtonElement | null> };
    const { container } = render(
      <ChapterReviewOriginalBody
        paragraphs={['　　第一段正文。', '第二段正文。']}
        revisedParagraphs={[]}
        activeParagraphIndex={0}
        fontSize={18}
        showTextAuditDiff={false}
        paragraphRefs={paragraphRefs}
        onSelectParagraph={onSelectParagraph}
      />,
    );

    expect(screen.getByTestId('chapter-review-original-body')).toHaveClass('px-8', 'py-5', 'text-[#374151]');
    expect(screen.getByRole('button', { name: '第一段正文。' })).toHaveStyle({
      fontSize: '18px',
      lineHeight: '1.9',
      textIndent: '2em',
    });
    expect(screen.getByRole('button', { name: '第一段正文。' }).querySelector('span[aria-hidden="true"]')).not.toBeNull();
    expect(container.innerHTML).not.toContain('bg-[#EAF9FD]');
    fireEvent.click(screen.getByRole('button', { name: '第二段正文。' }));
    expect(onSelectParagraph).toHaveBeenCalledWith(1);
  });
});
