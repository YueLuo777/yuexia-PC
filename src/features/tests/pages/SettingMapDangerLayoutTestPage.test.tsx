import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingMapDangerLayoutTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingMapDangerLayoutTestPage', () => {
  it('shows a production-like layout prototype for world maps and danger zones', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('世界地图与危险区域布局测试');
    expect(source).toContain("type LayoutTab = '固定设定' | '状态设定' | '确认'");
    expect(source).toContain('地图名');
    expect(source).toContain('区域名');
    expect(source).toContain('世界地图');
    expect(source).toContain('地图概况');
    expect(source).toContain('区域划分');
    expect(source).toContain('交通路线');
    expect(source).toContain('势力分布');
    expect(source).toContain('资源分布');
    expect(source).toContain('当前局势');
    expect(source).toContain('危险区域');
    expect(source).toContain('区域概况');
    expect(source).toContain('危险来源');
    expect(source).toContain('进入条件');
    expect(source).toContain('资源收益');
    expect(source).toContain('历史背景');
    expect(source).toContain('当前状态');
    expect(source).toContain('AI 只更新状态设定');
    expect(source).toContain('更新前');
    expect(source).toContain('更新后');
  });

  it('adds the map and danger layout prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingMapDangerLayoutTestPage');
    expect(source).toContain('/setting-map-danger-layout-test');
    expect(source).toContain('世界地图与危险区域布局测试');
    expect(source).toContain('测试世界地图和危险区域按人物设定、势力地图格局拆成固定设定、状态设定和确认更新的具体排版。');
  });
});
