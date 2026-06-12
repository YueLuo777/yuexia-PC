import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchSidebarBoldNavigationTestPage', () => {
  it('adds a test collection preview for bold workbench sidebar navigation', () => {
    const pageSource = readTestPageSource('WorkbenchSidebarBoldNavigationTestPage.tsx');
    const collectionSource = readTestPageSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('WorkbenchSidebarBoldNavigationTestPage');
    expect(collectionSource).toContain("path: '/workbench-sidebar-bold-navigation-test'");
    expect(collectionSource).toContain("badge: 'Bold Nav'");
    expect(collectionSource).toContain('测试正文第一卷、章节，以及脑洞、设定等页面分组和设定条目加粗后的效果。');

    expect(pageSource).toContain('作品编辑器左侧导航加粗测试');
    expect(pageSource).toContain('正文目录：第一卷与章节加粗');
    expect(pageSource).toContain('脑洞 / 设定等页面：分组与设定条目加粗');
    expect(pageSource).toContain('第一卷');
    expect(pageSource).toContain('第1章 初入月下');
    expect(pageSource).toContain('脑洞库');
    expect(pageSource).toContain('世界观设定');
    expect(pageSource).toContain('人物设定');
    expect(pageSource).toContain("bold ? 'font-black text-[#111827]' : 'font-medium'");
    expect(pageSource).toContain("bold ? 'font-black' : 'font-medium'");
    expect(pageSource).toContain('只在测试页预览');
  });
});
