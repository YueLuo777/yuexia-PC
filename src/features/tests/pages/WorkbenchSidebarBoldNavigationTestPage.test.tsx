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
    expect(pageSource).toContain("type SelectedTone = 'default' | 'orange' | 'softBlue' | 'coolGray' | 'mint' | 'outline' | 'lavender';");
    expect(pageSource).toContain("'border-transparent xy-selected-orange-bg'");
    expect(pageSource).toContain("'border-[#BDEEF7] bg-[#E7F8FD] shadow-[0_0_0_1px_rgba(8,170,206,0.10)]'");
    expect(pageSource).toContain("'border-[#CBD5E1] bg-[#EEF2F7] shadow-[0_1px_2px_rgba(15,23,42,0.06)]'");
    expect(pageSource).toContain("'border-[#A7F3D0] bg-[#ECFDF5] shadow-[0_0_0_1px_rgba(16,185,129,0.10)]'");
    expect(pageSource).toContain("'border-[#08AACE] bg-white shadow-[inset_0_0_0_1px_rgba(8,170,206,0.24)]'");
    expect(pageSource).toContain("'border-[#DDD6FE] bg-[#F5F3FF] shadow-[0_1px_2px_rgba(139,92,246,0.08)]'");
    expect(pageSource).toContain("'border-[#BDEEF7] bg-[#F1FBFE]'");
    expect(pageSource).toContain('selectedTone="orange"');
    expect(pageSource).toContain('正文目录：选中背景方案对比');
    expect(pageSource).toContain('方案 1：浅青蓝');
    expect(pageSource).toContain('方案 2：冷灰');
    expect(pageSource).toContain('方案 3：薄荷绿');
    expect(pageSource).toContain('方案 4：蓝色描边');
    expect(pageSource).toContain('方案 5：淡紫灰');
    expect(pageSource).toContain('lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]');
    expect(pageSource).toContain("bold ? 'font-black text-[#111827]' : 'font-medium'");
    expect(pageSource).toContain("bold ? 'font-black' : 'font-medium'");
    expect(pageSource).toContain('只在测试页预览');
  });
});
