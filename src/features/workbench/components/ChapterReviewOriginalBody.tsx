import type { RefObject } from 'react';

import { renderTextAuditOriginalDiff } from './chapterEditorPresentation';
import {
  REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_GUTTER_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_ROW_CLASS,
  REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS,
} from './chapterEditorLayout';

interface ChapterReviewOriginalBodyProps {
  paragraphs: string[];
  revisedParagraphs: string[];
  activeParagraphIndex: number;
  fontSize: number;
  showTextAuditDiff: boolean;
  paragraphRefs: RefObject<Array<HTMLButtonElement | null>>;
  onSelectParagraph: (index: number) => void;
}

const stripLeadingIndent = (value: string) => value.replace(/^[\t \u3000]*/, '');

export function ChapterReviewOriginalBody({
  paragraphs,
  revisedParagraphs,
  activeParagraphIndex,
  fontSize,
  showTextAuditDiff,
  paragraphRefs,
  onSelectParagraph,
}: ChapterReviewOriginalBodyProps) {
  return (
    <div
      data-testid="chapter-review-original-body"
      className={`min-h-full px-5 py-5 text-[#374151] ${REVIEW_PREVIEW_PARAGRAPH_LIST_CLASS}`}
      style={{ fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif' }}
    >
      {paragraphs.map((paragraph, index) => {
        const selected = activeParagraphIndex === index;
        const displayParagraph = stripLeadingIndent(paragraph);
        const displayRevised = stripLeadingIndent(revisedParagraphs[index] ?? '');
        return (
          <button
            ref={(node) => {
              paragraphRefs.current[index] = node;
            }}
            key={`${index}-${paragraph.slice(0, 18)}`}
            type="button"
            onClick={() => onSelectParagraph(index)}
            aria-current={selected ? 'true' : undefined}
            className={`${REVIEW_PREVIEW_PARAGRAPH_ROW_CLASS} outline-none`}
          >
            <span aria-hidden="true" className={REVIEW_PREVIEW_PARAGRAPH_GUTTER_CLASS}>
              <span className={selected ? 'text-[#078fb0]' : 'text-slate-300'}>{index + 1}</span>
            </span>
            <span
              data-review-paragraph-card="true"
              className={`${REVIEW_PREVIEW_PARAGRAPH_BASE_CLASS} block min-h-[1.9em] w-full ${
                selected ? REVIEW_PREVIEW_PARAGRAPH_SELECTED_CLASS : REVIEW_PREVIEW_PARAGRAPH_EMPTY_CLASS
              }`}
              style={{ fontSize, lineHeight: 1.9 }}
            >
              <span className="whitespace-pre-wrap break-words">
                {showTextAuditDiff
                  ? renderTextAuditOriginalDiff(displayParagraph, displayRevised)
                  : displayParagraph}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
