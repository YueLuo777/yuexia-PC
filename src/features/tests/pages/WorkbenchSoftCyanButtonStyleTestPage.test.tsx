import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchSoftCyanButtonStyleTestPage', () => {
  it('adds a test collection preview for the soft cyan workbench button style', () => {
    const pageSource = readTestPageSource('WorkbenchSoftCyanButtonStyleTestPage.tsx');
    const collectionSource = readTestPageSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('WorkbenchSoftCyanButtonStyleTestPage');
    expect(collectionSource).toContain("path: '/workbench-soft-cyan-button-style-test'");
    expect(collectionSource).toContain("badge: 'Soft Cyan'");

    expect(pageSource).toContain('#E7F8FD');
    expect(pageSource).toContain('#08AACE');
    expect(pageSource).toContain('蓝色边框改为 #E7F8FD');

    for (const text of [
      '作品信息',
      '正文',
      '优化',
      '查找',
      '展开已发布',
      '新增卷',
      '倒序',
      '导出章节',
      '关联',
      '已关联资料',
      '1865',
    ]) {
      expect(pageSource).toContain(text);
    }

    expect(pageSource).toContain('方案 A：推荐，浅青选中态 + 白底操作按钮');
    expect(pageSource).toContain('方案 B：浅青边框加深，轮廓更清楚');
    expect(pageSource).toContain('#BDEEF7');
    expect(pageSource).toContain('方案 C：按钮文字统一 #08AACE');
    expect(pageSource).toContain('方案 D：基于 B，选中字体改为黑色');
    expect(pageSource).toContain('只把选中态里原本偏蓝的字体强制改成黑色');
    expect(pageSource).toContain('#1E71EF 主色替换 10 方案');
    expect(pageSource).toContain('只在测试页预览');
    for (const color of ['#08AACE', '#0891B2', '#0F766E', '#256D85', '#4F6F8F', '#475569', '#5B5F97', '#2D8C7C', '#386FA4', '#0E7490']) {
      expect(pageSource).toContain(color);
    }
    for (const label of ['01 浅青蓝', '02 湖蓝', '03 青绿', '04 墨青', '05 蓝灰', '06 石板蓝', '07 蓝紫灰', '08 松石绿', '09 钢蓝', '10 深天青']) {
      expect(pageSource).toContain(label);
    }
    expect(pageSource).toContain("type Variant = 'recommended' | 'quiet' | 'cyanText' | 'quietBlackText';");
    expect(pageSource).toContain("const CYAN_TEXT_FORCE_CLASS = 'xy-soft-cyan-force-text';");
    expect(pageSource).toContain("const BLACK_TEXT_FORCE_CLASS = 'xy-soft-cyan-black-text';");
    expect(pageSource).toContain("return variant === 'quiet' || variant === 'quietBlackText' ? SOFT_CYAN_STRONG_BORDER_CLASS : SOFT_CYAN_BORDER_CLASS;");
    expect(pageSource).toContain("return variant === 'quietBlackText' ? `text-[#111827] ${BLACK_TEXT_FORCE_CLASS}` : 'text-[#08AACE]';");
    expect(pageSource).toContain('color: #08AACE !important;');
    expect(pageSource).toContain('color: #111827 !important;');
    expect(pageSource).toContain("if (variant === 'cyanText') return `${base} ${borderClass} bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`;");
    expect(pageSource).toContain("variant === 'cyanText'");
    expect(pageSource).toContain("variant=\"quietBlackText\"");
  });
});
