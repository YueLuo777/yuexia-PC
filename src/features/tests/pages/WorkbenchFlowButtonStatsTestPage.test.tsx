import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchFlowButtonStatsTestPage', () => {
  it('adds a test collection preview for information-rich workbench flow buttons', () => {
    const pageSource = readTestPageSource('WorkbenchFlowButtonStatsTestPage.tsx');
    const collectionSource = readTestPageSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('WorkbenchFlowButtonStatsTestPage');
    expect(collectionSource).toContain("path: '/workbench-flow-button-stats-test'");
    expect(collectionSource).toContain("badge: 'Flow Stats'");

    for (const text of [
      '12个脑洞',
      '28个设定',
      '46章',
      '11章未审',
      '19章未点评',
      '8章未更新',
      '43章',
    ]) {
      expect(pageSource).toContain(text);
    }

    expect(pageSource).toContain('方案 A：推荐，名称加粗 + 数量同排');
    expect(pageSource).toContain('方案 B：紧凑，适合保留当前宽度');
    expect(pageSource).toContain('方案 C：状态更明显，待处理数量用胶囊');
    expect(pageSource).toContain("button.id === 'brainstorm' ? 'tracking-wide' : ''");
    expect(pageSource).toContain("if (active) return 'z-10 border-[#1e71ef] bg-[#eaf2ff] text-[#1e71ef] shadow-[inset_0_0_0_1px_#1e71ef]';");
    expect(pageSource).toContain('relative -ml-px inline-flex shrink-0 items-center justify-center gap-2 border first:ml-0');
    expect(pageSource).not.toContain('border-y border-r first:rounded-l-[8px] first:border-l');
  });
});
