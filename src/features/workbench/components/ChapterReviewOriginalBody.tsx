import type { RefObject } from 'react';

import { renderTextAuditOriginalDiff } from './chapterEditorPresentation';

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
      className="min-h-full px-8 py-5 text-[#374151]"
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
            className={`relative block min-h-[1.9em] w-full text-left outline-none ${selected ? 'text-slate-950' : 'text-[#374151]'}`}
            style={{ fontSize, lineHeight: 1.9, textIndent: '2em' }}
          >
            {selected ? (
              <span aria-hidden="true" className="absolute -left-4 top-[0.7em] h-2 w-2 rounded-full bg-[#08AACE]" />
            ) : null}
            <span className="whitespace-pre-wrap break-words">
              {showTextAuditDiff
                ? renderTextAuditOriginalDiff(displayParagraph, displayRevised)
                : displayParagraph}
            </span>
          </button>
        );
      })}
    </div>
  );
}
