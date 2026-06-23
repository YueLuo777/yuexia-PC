import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const editorPath = resolve(process.cwd(), 'src/features/workbench/components/ChapterEditor.tsx');

describe('ChapterEditor review preview annotation sync', () => {
  it('moves the 15th review preview sync behavior into the production review page', async () => {
    const source = await readFile(editorPath, 'utf8');

    expect(source).toContain('const [activeReviewParagraphIndex, setActiveReviewParagraphIndex] = useState(0);');
    expect(source).toContain('const reviewAnnotationRefs = useRef<Array<HTMLDivElement | null>>([]);');
    expect(source).toContain('const selectReviewPreviewParagraph = (index: number) => {');
    expect(source).toContain('setActiveReviewParagraphIndex(index);');
    expect(source).toContain("reviewAnnotationRefs.current[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' });");
    expect(source).toContain('onClick={() => selectReviewPreviewParagraph(index)}');
    expect(source).toContain('activeReviewParagraphIndex === index');
    expect(source).toContain('getReviewAnnotationNoteSpacingClass');
    expect(source).toContain('className="space-y-3"');
    expect(source).not.toContain('className="space-y-8"');
  });
});
