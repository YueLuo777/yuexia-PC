import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchFlowGraySelectedStateTestPage', () => {
  it('adds a separate test page for gray selected states on workbench flow navigation', () => {
    const pageSource = readTestPageSource('WorkbenchFlowGraySelectedStateTestPage.tsx');
    const collectionSource = readTestPageSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('WorkbenchFlowGraySelectedStateTestPage');
    expect(collectionSource).toContain("path: '/workbench-flow-gray-selected-state-test'");
    expect(collectionSource).toContain("badge: 'Gray Active'");

    expect(pageSource).toContain('脑洞 / 设定 / 章纲 / 正文导航选中灰色方案');
    expect(pageSource).toContain('只比较选中态灰色，不改正式页面。');
    expect(pageSource).toContain("const activePreviewIds = ['brainstorm', 'setting', 'chapterOutline', 'writing'] as const;");

    for (const label of ['脑洞', '设定', '章纲', '正文']) {
      expect(pageSource).toContain(label);
    }

    for (const option of [
      '01 雾灰轻底',
      '02 银灰卡片',
      '03 蓝灰边框',
      '04 石墨细线',
      '05 暖灰柔底',
      '06 深灰强调',
    ]) {
      expect(pageSource).toContain(option);
    }

    for (const color of ['#F3F4F6', '#ECEFF3', '#EEF2F6', '#E5E7EB', '#F2F0ED', '#374151']) {
      expect(pageSource).toContain(color);
    }
  });
});
