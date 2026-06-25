import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingTabPlacementOptionsTestPage.tsx');

describe('SettingTabPlacementOptionsTestPage registry', () => {
  it('adds the setting tab layout comparison page to the test collection', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('SettingTabPlacementOptionsTestPage');
    expect(source).toContain('/setting-tab-placement-options-test');
    expect(source).toContain('设定标签布局方案测试');
  });

  it('shows the requested two-row compact option and other comparable schemes', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('方案A：两行紧凑标签区');
    expect(source).toContain('作品设定');
    expect(source).toContain('人物设定');
    expect(source).toContain('势力地图');
    expect(source).toContain('道具资源');
    expect(source).toContain('怪物图鉴');
    expect(source).toContain('伏笔线索');
    expect(source).toContain('方案B：一行横向滚动');
    expect(source).toContain('方案C：左侧三行两列');
    expect(source).toContain('方案D：底部贴边标签');
  });
});
