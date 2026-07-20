import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from './chapterEditorSource.testUtils';

describe('ChapterEditor review preview annotation sync', () => {
  it('moves the 15th review preview sync behavior into the production review page', () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource('const [activeReviewParagraphIndex, setActiveReviewParagraphIndex] = useState(0);');
    expect(source).toContainSource('const reviewAnnotationRefs = useRef<Array<HTMLDivElement | null>>([]);');
    expect(source).toContainSource('const selectReviewPreviewParagraph = (index: number) => {');
    expect(source).toContainSource('setActiveReviewParagraphIndex(index);');
    expect(source).toContainSource(
      'scrollReviewComparisonTargetIntoCenter(reviewOriginalPreviewPaneRef.current, reviewOriginalParagraphRefs.current[index]);',
    );
    expect(source).toContainSource(
      'scrollReviewComparisonTargetIntoCenter(reviewAnnotationPreviewPaneRef.current, reviewAnnotationRefs.current[index]);',
    );
    expect(source).not.toContainSource("scrollIntoView({ block: 'center', behavior: 'smooth' })");
    expect(source).toContainSource('onClick={() => selectReviewPreviewParagraph(index)}');
    expect(source).toContainSource('activeReviewParagraphIndex === index');
    expect(source).toContainSource('getReviewAnnotationNoteSpacingClass');
    expect(source).toContainSource('className="space-y-3"');
    expect(source).not.toContainSource('className="space-y-8"');
  });
});
