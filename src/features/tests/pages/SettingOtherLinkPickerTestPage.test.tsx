import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingOtherLinkPickerTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingOtherLinkPickerTestPage', () => {
  it('previews the other-setting link picker between current setting and brainstorm', async () => {
    const source = await readTestPageSource();

    expect(source).toContain("const linkButtonLabels = ['当前设定', '其他设定', '脑洞'] as const;");
    expect(source).toContain('关联其他设定');
    expect(source).toContain('作品设定');
    expect(source).toContain('人物设定');
    expect(source).toContain('势力地图');
    expect(source).toContain('道具资源');
    expect(source).toContain('怪物图鉴');
    expect(source).toContain('伏笔线索');
    expect(source).toContain('本次将关联');
    expect(source).toContain('确认关联');
    expect(source).not.toContain("bg-[#FFF7ED]");
  });

  it('adds the other-setting link picker to the test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingOtherLinkPickerTestPage');
    expect(source).toContain('/setting-other-link-picker-test');
    expect(source).toContain('关联其他设定测试');
    expect(source).toContain('弹窗按作品设定、人物设定等标签读取所有设定条目');
  });
});
