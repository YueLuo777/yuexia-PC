import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchSurfaceColorStyleTestPage', () => {
  it('adds a test collection preview for editor input and software titlebar color styles', () => {
    const pageSource = readTestPageSource('WorkbenchSurfaceColorStyleTestPage.tsx');
    const collectionSource = readTestPageSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('WorkbenchSurfaceColorStyleTestPage');
    expect(collectionSource).toContain("path: '/workbench-surface-color-style-test'");
    expect(collectionSource).toContain("badge: 'Surface'");

    for (const text of [
      '作品编辑器输入区与标题栏配色测试',
      '内容输入 #F5F5F7',
      '软件标题栏',
      '方案 A：轻灰输入区 + 原浅灰标题栏',
      '方案 B：轻灰输入区 + 玻璃浅青标题栏',
      '方案 C：轻灰输入区 + 冷蓝灰标题栏',
      '方案 D：暖白输入区 + 奶油标题栏',
      '方案 E：高边界专业版',
      '顶部流程按钮框线方案',
      '黑色线',
      '方案 4：黑色细线',
      '我的小说',
      '默认小说1',
      '请输入要求',
    ]) {
      expect(pageSource).toContain(text);
    }

    for (const color of [
      '#F5F5F7',
      '#E9EEF5',
      '#E7F8FD',
      '#DDE7F2',
      '#FAF7F2',
      '#EEF2F7',
      '#CBD5E1',
      '#94A3B8',
      '#64748B',
      '#111827',
      '#08AACE',
    ]) {
      expect(pageSource).toContain(color);
    }

    expect(pageSource).toContain('surfaceColorPlans');
    expect(pageSource).toContain('flowBorderPlans');
    expect(pageSource).toContain('FlowBorderPlanPreview');
    expect(pageSource).toContain('TitlebarPreview');
    expect(pageSource).toContain('EditorSurfacePreview');
  });
});
