import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/ShuimoSelectionStatePreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('ShuimoSelectionStatePreviewTestPage', () => {
  it('defines multiple shuimo selected-entry states for comparison', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('ShuimoSelectionStatePreviewTestPage');
    expect(source).toContain('shuimoSelectionStateSchemes');
    expect(source).toContain("id: 'inkLine'");
    expect(source).toContain("id: 'cyanOutline'");
    expect(source).toContain("id: 'paperLift'");
    expect(source).toContain("id: 'dotMarker'");
    expect(source).toContain('主角金手指/优势');
    expect(source).toContain('水墨设定条目选中态预览');
  });

  it('adds the selected-entry preview to the UI test collection after the sidebar palette preview', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('ShuimoSelectionStatePreviewTestPage');
    expect(source).toContain('/shuimo-selection-state-preview-test');
    expect(source).toContain('水墨设定条目选中态预览');
    expect(source.indexOf('/shuimo-sidebar-scheme-preview-test')).toBeLessThan(
      source.indexOf('/shuimo-selection-state-preview-test'),
    );
  });
});
