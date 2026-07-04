import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/WorkbenchHeaderFixedFlowPositionTestPage.tsx');

describe('WorkbenchHeaderFixedFlowPositionTestPage registry', () => {
  it('adds the fixed flow position comparison page to the test collection', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('WorkbenchHeaderFixedFlowPositionTestPage');
    expect(source).toContain('/workbench-header-fixed-flow-position-test');
    expect(source).toContain('工作台流程按钮固定位置测试');
  });

  it('shows a 20-character title baseline and stable flow button placement', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('20字书名基准');
    expect(source).toContain('当前跟随书名宽度');
    expect(source).toContain('固定预留书名区');
    expect(source).toContain('TITLE_BASELINE_WIDTH = 360');
    expect(source).toContain('grid-cols-[360px_auto_auto]');
    expect(source).toContain('左侧书名/作品信息组合仍跟随书名改变宽度');
    expect(source).toContain('二十字书名固定基准位置测试样例作品标题一');
    expect(source).toContain('脑洞');
    expect(source).toContain('设定');
    expect(source).toContain('章纲');
    expect(source).toContain('正文');
    expect(source).toContain('审核');
    expect(source).toContain('综合点评');
    expect(source).toContain('润色');
    expect(source).toContain('更新状态');
    expect(source).toContain('生成梗概');
  });
});
