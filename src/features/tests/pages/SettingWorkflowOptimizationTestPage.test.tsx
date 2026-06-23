import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingWorkflowOptimizationTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingWorkflowOptimizationTestPage', () => {
  it('shows the previous setting workflow optimization suggestions as an independent prototype', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('设定流程优化建议测试');
    expect(source).toContain("type ViewTab = '补充分类' | '状态流程' | 'AI确认' | '关联规则'");
    expect(source).toContain('怪物图鉴');
    expect(source).toContain('世界地图');
    expect(source).toContain('危险区域');
    expect(source).toContain('AI 自动更新只写状态设定');
    expect(source).toContain('基础设定需要人工确认才改');
    expect(source).toContain('未确认区永远显示更新前后对照');
    expect(source).toContain('人物关系');
    expect(source).toContain('更新前');
    expect(source).toContain('更新后');
  });

  it('adds the workflow optimization prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingWorkflowOptimizationTestPage');
    expect(source).toContain('/setting-workflow-optimization-test');
    expect(source).toContain('设定流程优化建议测试');
    expect(source).toContain('单独测试整体设定流程优化建议，包括补充分类、状态更新、AI 确认和关联读取规则。');
  });
});
