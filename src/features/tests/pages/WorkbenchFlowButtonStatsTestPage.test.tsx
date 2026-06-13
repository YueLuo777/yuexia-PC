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
    expect(pageSource).toContain('方案 C-工具栏形态：按截图结构检查剩余空间');
    expect(pageSource).toContain('ToolbarCPreview');
    expect(pageSource).toContain('方案 D：推荐，小号上下排');
    expect(pageSource).toContain('方案 D-工具栏形态：小号上下排，检查是否更省空间');
    expect(pageSource).toContain('ToolbarMicroPreview');
    expect(pageSource).toContain("variant: 'balanced' | 'compact' | 'status' | 'microStack'");
    expect(pageSource).toContain("if (variant === 'microStack') return 'h-[38px] min-w-[82px] px-2';");
    expect(pageSource).toContain("variant=\"microStack\"");
    expect(pageSource).toContain('relative -ml-px inline-flex h-[38px] min-w-[76px] shrink-0 flex-col');
    expect(pageSource).toContain('目标：保留数量信息，但减少横向占位');
    expect(pageSource).toContain('默认小说1');
    expect(pageSource).toContain('作品信息');
    expect(pageSource).toContain('观察中间空白即可判断剩余空间');
    expect(pageSource).toContain('十套组合按钮设计方向');
    for (const text of [
      '01 经典分段',
      '02 双行紧凑',
      '03 状态胶囊',
      '04 步骤编号',
      '05 底部进度条',
      '06 标签页浮层',
      '07 分组标题栏',
      '08 时间线节点',
      '09 小仪表盘',
      '10 极简下划线',
      'FlowCombinationDesignMatrix',
      'flowCombinationDesigns',
    ]) {
      expect(pageSource).toContain(text);
    }
    expect(pageSource).toContain("button.id === 'brainstorm' ? 'tracking-wide' : ''");
    expect(pageSource).toContain("if (active) return 'z-10 border-[#BDEEF7] bg-[#E7F8FD] text-[#08AACE] shadow-[inset_0_0_0_1px_#BDEEF7]';");
    expect(pageSource).toContain("relative -ml-px inline-flex shrink-0 ${stackMeta ? 'flex-col gap-0.5' : 'items-center gap-2'} justify-center border first:ml-0");
    expect(pageSource).not.toContain('border-y border-r first:rounded-l-[8px] first:border-l');
  });
});
