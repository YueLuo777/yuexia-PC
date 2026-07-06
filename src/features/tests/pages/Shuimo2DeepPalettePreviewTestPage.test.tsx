import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/Shuimo2DeepPalettePreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('Shuimo2DeepPalettePreviewTestPage', () => {
  it('defines deeper shuimo2 palette proposals for the screenshot problem areas', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('Shuimo2DeepPalettePreviewTestPage');
    expect(source).toContain('shuimo2DeepPaletteSchemes');
    expect(source).toContain("id: 'agedScroll'");
    expect(source).toContain("id: 'inkStone'");
    expect(source).toContain("id: 'teaPaper'");
    expect(source).toContain("id: 'cinnabarWarm'");
    expect(source).toContain('titlebar');
    expect(source).toContain('activeTab');
    expect(source).toContain('groupBg');
    expect(source).toContain('selectionBg');
    expect(source).toContain('sendIcon');
    expect(source).toContain('lockButton');
    expect(source).toContain('stepper');
    expect(source).toContain('dashboardSidebar');
    expect(source).toContain('#E4E9EF');
    expect(source).toContain('#E7F8FD');
    expect(source).toContain('正文页');
    expect(source).toContain('首页侧栏');
    expect(source).toContain('AI输入区');
  });

  it('adds the deep shuimo2 palette preview to the UI test collection after the shuimo palette page', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('Shuimo2DeepPalettePreviewTestPage');
    expect(source).toContain('/shuimo2-deep-palette-preview-test');
    expect(source).toContain('水墨2 深度配色预览');
    expect(source.indexOf('/shuimo-semantic-palette-preview-test')).toBeLessThan(
      source.indexOf('/shuimo2-deep-palette-preview-test'),
    );
  });
});
