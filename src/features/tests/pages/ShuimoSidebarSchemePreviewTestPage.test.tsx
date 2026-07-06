import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/ShuimoSidebarSchemePreviewTestPage.tsx');
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

describe('ShuimoSidebarSchemePreviewTestPage', () => {
  it('defines layered shuimo palette schemes for the full setting workflow', async () => {
    const source = await readOptionalSource(testPagePath);

    expect(source).toContain('ShuimoSidebarSchemePreviewTestPage');
    expect(source).toContain('shuimoLayeredSchemes');
    ['riceInk', 'pineMist', 'teaSmoke', 'blueGreyInk', 'cinnabarSeal', 'jadePaper', 'reverseCinnabar'].forEach((id) => {
      expect(source).toContain(`id: '${id}'`);
    });
    expect(source).toContain('方案 G / 浅入朱印');
    expect(source).toContain('由浅到深');
    [
      'pageBg',
      'topGroupBg',
      'topGroupActiveBg',
      'sidebarBg',
      'folderBg',
      'settingItemBg',
      'selectedSettingBg',
      'settingNameBg',
      'fieldBg',
      'accent',
      'ink',
      'muted',
      'border',
    ].forEach((token) => {
      expect(source).toContain(`${token}:`);
    });
    expect(source).toContain('水墨层级配色方案预览');
    expect(source).toContain('分组');
    expect(source).toContain('设定名');
    expect(source).toContain('选中设定');
    expect(source).not.toContain('#E7F8FD');
  });

  it('adds the layered palette preview to the UI test collection', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('ShuimoSidebarSchemePreviewTestPage');
    expect(source).toContain('/shuimo-sidebar-scheme-preview-test');
    expect(source).toContain('水墨层级配色方案预览');
    expect(source).toContain('分组、设定名、选中设定、背景和内容卡片');
    expect(source.indexOf('/clean-writer-style-preview-test')).toBeLessThan(
      source.indexOf('/shuimo-sidebar-scheme-preview-test'),
    );
  });
});
