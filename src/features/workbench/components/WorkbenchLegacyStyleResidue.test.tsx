import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../../..');

const readSource = (relativePath: string) => readFileSync(resolve(ROOT, relativePath), 'utf8');

describe('workbench legacy selected style residue', () => {
  it('keeps production workbench surfaces free of legacy orange selected styles', () => {
    const sources = [
      'src/features/workbench/components/ChapterEditor.tsx',
      'src/features/workbench/components/WorkbenchLibraryPanel.tsx',
      'src/features/workbench/pages/WorkbenchPage.tsx',
      'src/shared/styles/index.css',
      'src/features/theme/model/customThemeColors.ts',
    ].map((path) => ({ path, source: readSource(path) }));

    for (const { path, source } of sources) {
      expect(source, path).not.toContain('xy-selected-orange-bg');
      expect(source, path).not.toContain('bg-[#FFF7ED]');
      expect(source, path).not.toContain("defaultColor: '#FFF7ED'");
      expect(source, path).not.toContain('--xy-detail-outline-number-used: #FFF7ED');
    }

    const styles = readSource('src/shared/styles/index.css');
    const usedNumberRule = styles.slice(
      styles.indexOf('.xy-detail-outline-number-used {'),
      styles.indexOf('.xy-detail-outline-number-has-outline {'),
    );

    expect(usedNumberRule).not.toContain('#f97316');
    expect(usedNumberRule).not.toContain('249, 115, 22');
  });
});
