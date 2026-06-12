import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('EditorGridLineTestPage', () => {
  it('previews editor grid lines that scale with font size', () => {
    const source = readSource('EditorGridLineTestPage.tsx');

    expect(source).toContain("type GridLineMode = 'none' | 'solid' | 'dashed'");
    expect(source).toContain("const [fontSize, setFontSize] = useState(28)");
    expect(source).toContain('const lineHeightPx = Math.round(fontSize * 1.72)');
    expect(source).toContain('const underlineGapPx = Math.max(8, Math.round(fontSize * 0.22))');
    expect(source).toContain('const lineOffsetPx = Math.min(lineHeightPx - 2, Math.round((lineHeightPx + fontSize) / 2 + underlineGapPx))');
    expect(source).toContain("height='${lineHeightPx}' viewBox='0 0 1200 ${lineHeightPx}'");
    expect(source).toContain("y1='${lineOffsetPx}.5'");
    expect(source).toContain("backgroundPosition: '0 0'");
    expect(source).not.toContain('backgroundPosition: `0 ${lineHeightPx - 1}px`');
    expect(source).toContain('backgroundSize: `100% ${lineHeightPx}px`');
    expect(source).toContain('stroke-dasharray');
    expect(source).toContain('无');
    expect(source).toContain('实线');
    expect(source).toContain('虚线');
    expect(source).toContain('第1章');
    expect(source).toContain('【首尾呼应】');
  });

  it('is available from the test collection UI group', () => {
    const collectionSource = readSource('TestCollectionPage.tsx');

    expect(collectionSource).toContain('EditorGridLineTestPage');
    expect(collectionSource).toContain('/editor-grid-line-test');
    expect(collectionSource).toContain('编辑器网格虚线测试');
    expect(collectionSource).toContain('测试正文背景网格线随字号同步变化');
  });
});
