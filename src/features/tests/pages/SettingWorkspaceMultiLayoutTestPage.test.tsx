import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingWorkspaceMultiLayoutTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingWorkspaceMultiLayoutTestPage', () => {
  it('shows multiple setting workspace layout options with the approved setting domains', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('const layoutOptions');
    expect(source).toContain("id: 'wide-tabs'");
    expect(source).toContain("id: 'compressed-center'");
    expect(source).toContain("id: 'status-ledger'");
    expect(source).toContain('作品设定');
    expect(source).toContain('人物设定');
    expect(source).toContain('势力组织');
    expect(source).toContain('道具资源');
    expect(source).toContain('地点场景');
    expect(source).toContain('伏笔线索');
    expect(source).toContain('规则禁区');
    expect(source).toContain('推荐方案');
    expect(source).toContain('基础/状态分割线');
    expect(source).toContain('拖拽调整基础设定和状态设定的宽度');
    expect(source).toContain('cursor-ew-resize');
  });

  it('keeps the prototype in the test collection as a standalone test page', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingWorkspaceMultiLayoutTestPage');
    expect(source).toContain('/setting-workspace-multi-layout-test');
    expect(source).toContain('设定工作台多标签布局测试');
    expect(source).toContain('测试作品设定、人物设定、势力组织、道具资源等一级标签的多种布局方案。');
  });
});
