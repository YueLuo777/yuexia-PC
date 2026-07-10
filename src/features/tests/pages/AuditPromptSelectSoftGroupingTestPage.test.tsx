import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/AuditPromptSelectSoftGroupingTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('AuditPromptSelectSoftGroupingTestPage', () => {
  it('provides softer prompt grouping alternatives without the old tree-only prototype', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('方案 A：提示词后加小标签');
    expect(source).toContain('方案 B：轻分隔标题');
    expect(source).toContain('方案 C：顶部小筛选');
    expect(source).toContain('方案 D：双列分类');
    expect(source).toContain('降低“剧情审核 / 文本审核”的切换感');
    expect(source).toContain('上一版树形方案把分类层级表达得太强');
    expect(source).toContain('recommended: true');
  });

  it('replaces the previous audit prompt grouping test in the software test collection', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('AuditPromptSelectSoftGroupingTestPage');
    expect(source).toContain('/audit-prompt-select-soft-grouping-test');
    expect(source).toContain('审核提示词轻量下拉方案');
    expect(source).toContain('对比标签、轻分隔、顶部筛选和双列分类，降低审核提示词下拉的切换感。');
    expect(source).not.toContain('AuditPromptSelectGroupingTestPage');
    expect(source).not.toContain('/audit-prompt-select-grouping-test');
    expect(source).not.toContain('审核提示词分组下拉原型');
  });
});
