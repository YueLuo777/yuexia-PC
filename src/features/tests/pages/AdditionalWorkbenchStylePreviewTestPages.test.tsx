import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const cleanPagePath = resolve(process.cwd(), 'src/features/tests/pages/CleanWriterStylePreviewTestPage.tsx');
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
    expect(source).toContain('#0F766E');
    expect(source).toContain('#F97316');
  });

  it('keeps only the remaining style preview in the UI test collection navigation', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('CleanWriterStylePreviewTestPage');
    expect(source).toContain('/clean-writer-style-preview-test');
    expect(source).not.toContain('DarkConsoleStylePreviewTestPage');
    expect(source).not.toContain('/dark-console-style-preview-test');
  });
});
