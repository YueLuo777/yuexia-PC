import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const editorPath = resolve(process.cwd(), 'src/features/workbench/components/ChapterEditor.tsx');

describe('ChapterEditor review preview annotation sync', () => {
  it('moves the 15th review preview sync behavior into the production review page', async () => {
    const source = await readFile(editorPath, 'utf8');

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
