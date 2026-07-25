import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../../..');

const readSource = (relativePath: string) => readFileSync(resolve(ROOT, relativePath), 'utf8');

describe('workbench legacy selected style residue', () => {
  it('keeps production workbench surfaces free of legacy orange selected styles', () => {
    const sources = [
      'src/features/workbench/components/ChapterEditor.tsx',
      'src/features/workbench/components/chapterEditorLayout.tsx',
      'src/features/workbench/components/chapterEditorReviewConfig.ts',
      'src/features/workbench/components/chapterEditorPresentation.tsx',
      'src/features/workbench/components/ChapterStatusPanel.tsx',
      'src/features/workbench/components/ChapterReviewDirectory.tsx',
      'src/features/workbench/components/ChapterReviewPreview.tsx',
      'src/features/workbench/components/ChapterReviewAiPanel.tsx',
      'src/features/workbench/components/ChapterReviewManagementModal.tsx',
      'src/features/workbench/components/WorkbenchLibraryPanel.tsx',
      'src/features/workbench/components/workbenchSettingEditor.tsx',
      'src/features/workbench/pages/WorkbenchPage.tsx',
      'src/shared/styles/index.css',
      'src/features/theme/model/customThemeColors.ts',
    ].map((path) => ({ path, source: readSource(path) }));

    for (const { path, source } of sources) {
      expect(source, path).not.toContainSource('xy-selected-orange-bg');
      expect(source, path).not.toContainSource('bg-[#FFF7ED]');
      expect(source, path).not.toContainSource("defaultColor: '#FFF7ED'");
      expect(source, path).not.toContainSource('--xy-detail-outline-number-used: #FFF7ED');
    }

    const styles = readSource('src/shared/styles/index.css');
    const usedNumberRule = styles.slice(
      styles.indexOf('.xy-detail-outline-number-used {'),
      styles.indexOf('.xy-detail-outline-number-has-outline {'),
    );

    expect(usedNumberRule).not.toContainSource('#f97316');
    expect(usedNumberRule).not.toContainSource('249, 115, 22');
  });

  it('keeps retired setting and role field selectors out of production styles', () => {
    const styles = Array.from({ length: 12 }, (_, index) =>
      readSource(`src/shared/styles/parts/part-${String(index + 1).padStart(2, '0')}.css`),
    ).join('\n');
    const retiredSelectors = [
      'xy-floating-label-fixed',
      'xy-structured-title-field',
      'xy-role-identity-select',
      'xy-role-life-toggle',
      'xy-floating-outline-setting-name',
      'xy-role-name-compact-field',
      'xy-capsule-custom-field-size',
      'xy-floating-outline-role-compact',
    ];

    for (const selector of retiredSelectors) {
      expect(styles, selector).not.toContainSource(selector);
    }
    expect(styles).not.toMatch(/\.xy-floating-field\.xy-floating-outline-compact(?:[\s:{.,]|$)/);
  });
});
