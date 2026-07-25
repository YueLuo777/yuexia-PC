import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('workbench outline label consistency', () => {
  it('keeps a space between the chapter number and the outline label in every reader', () => {
    const sources = [
      'src/features/workbench/pages/WorkbenchPage.tsx',
      'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase2.tsx',
      'src/features/workbench/components/createOutlineControllerPhase1.tsx',
      'src/features/workbench/components/WorkbenchContextChapterSummaryList.tsx',
      'src/features/workbench/components/ChapterReviewPreview.tsx',
    ].map(read);

    sources.forEach((source) => expect(source).not.toMatch(/第\$\{[^}]+\}章章纲/));
    expect(sources.join('\n')).toContain('章 章纲');
  });

  it('uses the output frame title typography for inline AI requirement labels', () => {
    const styles = read('src/shared/styles/parts/part-12.css');
    const labelRule = styles.slice(
      styles.indexOf('.xy-floating-field.xy-floating-ai > label'),
      styles.indexOf(
        '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral',
        styles.indexOf('.xy-floating-field.xy-floating-ai > label'),
      ),
    );

    expect(labelRule).toMatch(/font-family: ['"]Microsoft YaHei UI['"], ['"]Microsoft YaHei['"], sans-serif;/);
    expect(labelRule).toContain('font-size: 1rem !important;');
    expect(labelRule).toContain('font-weight: 900 !important;');
  });
});
