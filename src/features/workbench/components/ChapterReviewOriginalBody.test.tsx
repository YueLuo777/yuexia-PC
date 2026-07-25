import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChapterReviewOriginalBody } from './ChapterReviewOriginalBody';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('ChapterReviewOriginalBody', () => {
  it('uses the BD paragraph card selection style on the clickable original text', () => {
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

    expect(screen.getByTestId('chapter-review-original-body')).toHaveClass('px-5', 'py-5', 'space-y-0');
    const selectedParagraph = screen.getByRole('button', { name: '第一段正文。' });
    const unselectedParagraph = screen.getByRole('button', { name: '第二段正文。' });
    expect(selectedParagraph).toHaveClass('relative', 'block', 'w-full');
    expect(selectedParagraph).toHaveAttribute('aria-current', 'true');
    const selectedCard = selectedParagraph.querySelector('[data-review-paragraph-card="true"]');
    const unselectedCard = unselectedParagraph.querySelector('[data-review-paragraph-card="true"]');
    expect(selectedCard).toHaveStyle({ fontSize: '18px', lineHeight: '1.9' });
    expect(selectedCard).toHaveClass('border-[#08AACE]', 'bg-[#DDF5FA]', 'text-slate-950', 'py-0');
    expect(unselectedCard).toHaveClass('border-transparent', 'bg-white', 'text-slate-300', 'opacity-80');
    const selectedParagraphLabel = screen.getByText('1');
    expect(selectedParagraphLabel).toHaveClass('text-[#078fb0]');
    expect(selectedParagraphLabel.parentElement).toHaveClass(
      'absolute',
      'right-full',
      'top-1/2',
      'mr-1.5',
      '-translate-y-1/2',
      'text-[13px]',
    );
    expect(selectedCard).not.toContainElement(selectedParagraphLabel);
    expect(screen.queryByText('第1段')).not.toBeInTheDocument();
    expect(selectedParagraph.querySelector('.rounded-full')).toBeNull();
    expect(screen.queryByText('当前选中')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('shadow-[');
    expect(container.innerHTML).not.toContain('ring-1');
    fireEvent.click(unselectedParagraph);
    expect(onSelectParagraph).toHaveBeenCalledWith(1);
  });

  it('uses the same outside gutter for AI annotated paragraphs', () => {
    const previewSource = readSource('ChapterReviewPreview.tsx');

    expect(previewSource).toContainSource('className={REVIEW_PREVIEW_PARAGRAPH_ROW_CLASS}');
    expect(previewSource).toContainSource('className={REVIEW_PREVIEW_PARAGRAPH_GUTTER_CLASS}');
    expect(previewSource).toContainSource('data-review-paragraph-card="true"');
    expect(previewSource).not.toContainSource('mr-2 inline-flex items-center gap-1 text-[11px] font-black');
  });
});
