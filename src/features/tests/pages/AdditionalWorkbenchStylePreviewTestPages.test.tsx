import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const cleanPagePath = resolve(process.cwd(), 'src/features/tests/pages/CleanWriterStylePreviewTestPage.tsx');
const darkPagePath = resolve(process.cwd(), 'src/features/tests/pages/DarkConsoleStylePreviewTestPage.tsx');
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

describe('additional workbench style previews', () => {
  it('defines a bright clean writing-room style preview', async () => {
    const source = await readOptionalSource(cleanPagePath);

    expect(source).toContain('CleanWriterStylePreviewTestPage');
    expect(source).toContain('cleanWriterPanels');
    expect(source).toContain('清爽编辑器风格预览');
    expect(source).toContain('写作间');
    expect(source).toContain('章节纸稿');
    expect(source).toContain('修订台');
    expect(source).toContain('#0F766E');
    expect(source).toContain('#F97316');
  });

  it('defines a dark command-center style preview', async () => {
    const source = await readOptionalSource(darkPagePath);

    expect(source).toContain('DarkConsoleStylePreviewTestPage');
    expect(source).toContain('darkConsoleSignals');
    expect(source).toContain('深色控制台风格预览');
    expect(source).toContain('项目雷达');
    expect(source).toContain('章节指挥台');
    expect(source).toContain('AI 监控');
    expect(source).toContain('#22D3EE');
    expect(source).toContain('#F59E0B');
  });

  it('adds both style previews to the UI test collection navigation', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('CleanWriterStylePreviewTestPage');
    expect(source).toContain('/clean-writer-style-preview-test');
    expect(source).toContain('清爽编辑器风格预览');
    expect(source).toContain('用明亮留白、轻边框和低干扰编辑区做一张可对照的写作样张。');
    expect(source).toContain('DarkConsoleStylePreviewTestPage');
    expect(source).toContain('/dark-console-style-preview-test');
    expect(source).toContain('深色控制台风格预览');
    expect(source).toContain('用深色底、状态信号和控制台密度做一张可对照的专业样张。');
  });
});
