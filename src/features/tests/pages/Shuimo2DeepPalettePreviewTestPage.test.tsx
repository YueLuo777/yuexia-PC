import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readTestCollectionSource } from './testCollectionSource.testUtils';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/Shuimo2DeepPalettePreviewTestPage.tsx');

describe('Shuimo2DeepPalettePreviewTestPage', () => {
  it('defines deeper shuimo2 palette proposals for the screenshot problem areas', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContainSource('Shuimo2DeepPalettePreviewTestPage');
    expect(source).toContainSource('shuimo2DeepPaletteSchemes');
    expect(source).toContainSource("id: 'agedScroll'");
    expect(source).toContainSource("id: 'inkStone'");
    expect(source).toContainSource("id: 'teaPaper'");
    expect(source).toContainSource("id: 'cinnabarWarm'");
    expect(source).toContainSource('titlebar');
    expect(source).toContainSource('activeTab');
    expect(source).toContainSource('groupBg');
    expect(source).toContainSource('selectionBg');
    expect(source).toContainSource('sendIcon');
    expect(source).toContainSource('lockButton');
    expect(source).toContainSource('stepper');
    expect(source).toContainSource('dashboardSidebar');
    expect(source).toContainSource('#E4E9EF');
    expect(source).toContainSource('#E7F8FD');
    expect(source).toContainSource('正文页');
    expect(source).toContainSource('首页侧栏');
    expect(source).toContainSource('AI输入区');
  });

  it('keeps the deep shuimo2 palette preview in the UI test collection', async () => {
    const source = readTestCollectionSource();

    expect(source).toContainSource('Shuimo2DeepPalettePreviewTestPage');
    expect(source).toContainSource('/shuimo2-deep-palette-preview-test');
    expect(source).toContainSource('水墨2 深度配色预览');
  });
});
