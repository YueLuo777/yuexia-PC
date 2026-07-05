import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/PaperWorkbenchStylePreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readOptionalSource(path: string) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

describe('PaperWorkbenchStylePreviewTestPage', () => {
  it('defines a paper-and-ink three-pane workbench style preview', async () => {
    const source = await readOptionalSource(testPagePath);

    expect(source).toContain('PaperWorkbenchStylePreviewTestPage');
    expect(source).toContain('paperWorkbenchPreviewColumns');
    expect(source).toContain('纸墨工作台风格预览');
    expect(source).toContain('作品索引');
    expect(source).toContain('正文纸面');
    expect(source).toContain('AI 侧栏');
    expect(source).toContain('#08AACE');
    expect(source).toContain('#F6F1E7');
    expect(source).toContain('xl:grid-cols-[240px_minmax(0,1fr)_300px]');
    expect(source).toContain('shrink-0 whitespace-nowrap');
  });

  it('adds the preview page to the UI test collection navigation', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('PaperWorkbenchStylePreviewTestPage');
    expect(source).toContain('/paper-workbench-style-preview-test');
    expect(source).toContain('纸墨工作台风格预览');
    expect(source).toContain('把浅纸色、墨色正文和三栏工作台组合成一张可对照的视觉样张。');
  });
});
