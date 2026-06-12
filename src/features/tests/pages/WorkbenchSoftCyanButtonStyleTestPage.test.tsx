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
    expect(pageSource).toContain('方案 B：更轻，边框存在感继续降低');
    expect(pageSource).toContain('方案 C：按钮文字统一 #08AACE');
    expect(pageSource).toContain("type Variant = 'recommended' | 'quiet' | 'cyanText';");
    expect(pageSource).toContain("const CYAN_TEXT_FORCE_CLASS = 'xy-soft-cyan-force-text';");
    expect(pageSource).toContain('color: #08AACE !important;');
    expect(pageSource).toContain("if (variant === 'cyanText') return `${base} border-[#E7F8FD] bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`;");
    expect(pageSource).toContain("variant === 'cyanText'");
  });
});
