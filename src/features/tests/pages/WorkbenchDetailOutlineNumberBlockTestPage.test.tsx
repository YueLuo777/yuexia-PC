import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('WorkbenchDetailOutlineNumberBlockTestPage', () => {
  it('documents the final chapter outline directory proposal', () => {
    const source = readSource('WorkbenchDetailOutlineNumberBlockTestPage.tsx');

    expect(source).toContain('36px 小数字块');
    expect(source).toContain('三状态颜色');
    expect(source).toContain('已用筛选');
    expect(source).toContain('outlineFilter ===');
    expect(source).toContain('showUsedOnly');
    expect(source).toContain('w-[36px]');
    expect(source).toContain('h-[36px]');
    expect(source).toContain('hasOutline');
    expect(source).toContain('used');
    expect(source).toContain('selected');
  });

  it('is available from the test collection as the last AI/workbench test', () => {
    const source = readSource('TestCollectionPage.tsx');

    expect(source).toContain('WorkbenchDetailOutlineNumberBlockTestPage');
    expect(source).toContain('/workbench-detail-outline-number-block-test');
    expect(source).toContain('36px 小数字块 + 三状态颜色 + 已用筛选');
    expect(source).toContain("case '/workbench-detail-outline-number-block-test':");

    const groupStart = source.indexOf("title: 'AI 链路测试'");
    const newItemIndex = source.indexOf("path: '/workbench-detail-outline-number-block-test'");
    const toolGroupIndex = source.indexOf("title: '工具测试'");

    expect(groupStart).toBeGreaterThan(-1);
    expect(newItemIndex).toBeGreaterThan(groupStart);
    expect(newItemIndex).toBeLessThan(toolGroupIndex);
  });
});
