import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getPaperBaselineMetrics } from './EditorPaperBaselineGridTestPage';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/EditorPaperBaselineGridTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('EditorPaperBaselineGridTestPage', () => {
  it('calculates paper row height from font size', () => {
    expect(getPaperBaselineMetrics(18)).toEqual({ rowHeightPx: 38, baselineLineOffsetPx: 37, footGapPx: 1, rowExtraPx: 20 });
    expect(getPaperBaselineMetrics(22)).toEqual({ rowHeightPx: 42, baselineLineOffsetPx: 41, footGapPx: 1, rowExtraPx: 20 });
    expect(getPaperBaselineMetrics(24)).toEqual({ rowHeightPx: 44, baselineLineOffsetPx: 43, footGapPx: 1, rowExtraPx: 20 });
    expect(getPaperBaselineMetrics(22, 8)).toEqual({ rowHeightPx: 42, baselineLineOffsetPx: 34, footGapPx: 8, rowExtraPx: 20 });
    expect(getPaperBaselineMetrics(22, 1, 18)).toEqual({ rowHeightPx: 40, baselineLineOffsetPx: 39, footGapPx: 1, rowExtraPx: 18 });
  });

  it('uses pixel line-height and repeated baseline background', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('lineHeight: `${metrics.rowHeightPx}px`');
    expect(source).toContain('backgroundPosition: `0 ${PAPER_TOP_PADDING_PX}px`');
    expect(source).toContain('backgroundSize: `100% ${metrics.rowHeightPx}px`');
    expect(source).toContain('baselineLineOffsetPx = rowHeightPx - footGapPx');
    expect(source).toContain('paddingTop: PAPER_TOP_PADDING_PX');
    expect(source).toContain('baselinePresets');
    expect(source).toContain('当前偏吊');
    expect(source).toContain('贴脚低线');
    expect(source).toContain('图2方向');
    expect(source).toContain('max={10}');
    expect(source).toContain('max={24}');
    expect(source).toContain('type="range"');
    expect(source).toContain('正文稿纸线基准对齐测试');
  });

  it('adds the paper baseline test page to the test collection', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('EditorPaperBaselineGridTestPage');
    expect(source).toContain('/editor-paper-baseline-grid-test');
    expect(source).toContain('正文稿纸线基准对齐测试');
  });
});
