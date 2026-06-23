import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingStateStructurePlanTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingStateStructurePlanTestPage', () => {
  it('shows state structure plans for goldfinger, faction groups, world maps, danger zones, items, foreshadowing, and rules', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('设定状态结构方案测试');
    expect(source).toContain("id: 'compact'");
    expect(source).toContain("id: 'balanced'");
    expect(source).toContain("id: 'stateful'");
    expect(source).toContain('轻量合并版');
    expect(source).toContain('固定 + 状态版');
    expect(source).toContain('强追踪版');
    expect(source).toContain('主角金手指/优势');
    expect(source).toContain('金手指基础设定');
    expect(source).toContain('金手指当前状态');
    expect(source).toContain('势力分组');
    expect(source).toContain('只适用于正派势力、反派势力、中立势力、其他势力');
    expect(source).toContain('势力基础档案');
    expect(source).toContain('势力当前状态');
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
    expect(source).toContain('重要道具当前状态');
    expect(source).toContain('伏笔回收状态');
    expect(source).toContain('本卷临时规则');
    expect(source).toContain('固定档案');
    expect(source).toContain('状态设定');
    expect(source).toContain('什么时候更新');
  });

  it('adds the state structure prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingStateStructurePlanTestPage');
    expect(source).toContain('/setting-state-structure-plan-test');
    expect(source).toContain('设定状态结构方案测试');
    expect(source).toContain('测试主角金手指、势力分组、世界地图、危险区域、道具资源、伏笔线索的固定档案和状态设定拆分方案。');
  });

  it('uses a long-text-first layout for protagonist cheat advantage fields instead of five equal columns', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('goldfinger-advantage-layout');
    expect(source).toContain('goldfinger-advantage-primary-fields');
    expect(source).toContain('goldfinger-advantage-secondary-fields');
    expect(source).toContain('lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]');
    expect(source).not.toContain('goldfinger-advantage-five-columns');
  });
});
