import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingItemResourceStatusLayoutTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingItemResourceStatusLayoutTestPage', () => {
  it('shows a production-like status layout prototype for item resources', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('道具资源状态结构测试');
    expect(source).toContain("type ItemLayoutTab = '固定设定' | '状态设定' | '确认'");
    expect(source).toContain('功法能力');
    expect(source).toContain('物品装备');
    expect(source).toContain('资源货币');
    expect(source).toContain('特殊资源');
    expect(source).toContain('需要状态设定');
    expect(source).toContain("const hasStateTabs = activePlan.id !== 'currency'");
    expect(source).toContain('资源货币属于世界规则，不做状态更新');
    expect(source).toContain('建议默认保留状态设定');
    expect(source).toContain('掌握进度');
    expect(source).toContain('当前持有');
    expect(source).toContain('价值等级');
    expect(source).toContain('获取渠道');
    expect(source).toContain('消耗用途');
    expect(source).toContain('流通限制');
    expect(source).not.toContain('按需要启用');
    expect(source).not.toContain('流通环境');
    expect(source).not.toContain('兑换管制');
    expect(source).not.toContain('区域差价');
    expect(source).not.toContain('市场风险');
    expect(source).not.toContain('主角当前库存');
    expect(source).not.toContain('林刻身上剩三枚下品灵石');
    expect(source).not.toContain('债务关系');
    expect(source).toContain('当前归属');
    expect(source).toContain('剩余次数');
    expect(source).toContain('激活进度');
    expect(source).toContain('未确认更新');
    expect(source).toContain('AI 只写入状态设定');
    expect(source).toContain('状态设定范围');
    expect(source).not.toContain('哪些需要状态设定');
    expect(source).toContain('grid gap-5 xl:grid-cols-2');
  });

  it('adds the item resource status prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingItemResourceStatusLayoutTestPage');
    expect(source).toContain('/setting-item-resource-status-layout-test');
    expect(source).toContain('道具资源状态结构测试');
    expect(source).toContain('测试道具资源按固定设定、状态设定、确认更新拆分后的布局，并标明功法能力、物品装备、资源货币、特殊资源哪些需要状态设定。');
  });
});
