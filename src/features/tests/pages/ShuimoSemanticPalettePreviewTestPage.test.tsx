import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/ShuimoSemanticPalettePreviewTestPage.tsx');
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

describe('ShuimoSemanticPalettePreviewTestPage', () => {
  it('defines comprehensive shuimo semantic palette proposals', async () => {
    const source = await readOptionalSource(testPagePath);

    expect(source).toContain('ShuimoSemanticPalettePreviewTestPage');
    expect(source).toContain('shuimoSemanticPalettes');
    ['inkSeal', 'bambooMist', 'warmScroll'].forEach((id) => {
      expect(source).toContain(`id: '${id}'`);
    });
    [
      'primaryAction',
      'primaryActionHover',
      'softPanel',
      'activePanel',
      'danger',
      'dangerSoft',
      'success',
      'warning',
      'focusRing',
      'reviewSelection',
      'aiThought',
      'topTabActive',
      'sidebarGroup',
      'chapterSelected',
      'inputBorder',
    ].forEach((token) => {
      expect(source).toContain(`${token}:`);
    });
    expect(source).toContain('水墨语义配色预览');
    expect(source).toContain('替换 #08AACE');
    expect(source).toContain('替换 #F4FBFC');
    expect(source).toContain('替换 #DC2626');
    expect(source).toContain('顶部标签');
    expect(source).toContain('AI 输出框');
    expect(source).toContain('危险操作');
  });

  it('adds the semantic palette preview to the UI test collection after shuimo previews', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('ShuimoSemanticPalettePreviewTestPage');
    expect(source).toContain('/shuimo-semantic-palette-preview-test');
    expect(source).toContain('水墨语义配色预览');
    expect(source.indexOf('/shuimo-selection-state-preview-test')).toBeLessThan(
      source.indexOf('/shuimo-semantic-palette-preview-test'),
    );
  });
});
