import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/ReviewPreviewWidthModeTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('ReviewPreviewWidthModeTestPage', () => {
  it('registers an interactive review preview width mode test page', () => {
    const pageSource = readFileSync(pagePath, 'utf8');
    const collectionSource = readFileSync(collectionPath, 'utf8');

    expect(pageSource).toContain('审核润色预览宽度模式测试');
    expect(pageSource).toContain("type WidthMode = 'locked' | 'free';");
    expect(pageSource).toContain("const [widthMode, setWidthMode] = useState<WidthMode>('locked');");
    expect(pageSource).toContain("['locked', '等宽锁定'] as const");
    expect(pageSource).toContain("['free', '自由调节'] as const");
    expect(pageSource).toContain('const [usesCustomTextWidth, setUsesCustomTextWidth] = useState(false);');
    expect(pageSource).toContain("const useFreeCustomWidth = widthMode === 'free' && usesCustomTextWidth;");
    expect(pageSource).toContain('if (!useFreeCustomWidth) {');
    expect(pageSource).toContain('minmax(0, 1fr) ${separatorWidth}px minmax(0, 1fr)');
    expect(pageSource).toContain('minmax(${freeTextColumnMinWidth}, ${freeTextWidth}px)');
    expect(pageSource).toContain("if (mode === 'free') setUsesCustomTextWidth(false);");
    expect(pageSource).toContain('setUsesCustomTextWidth(true);');
    expect(pageSource).toContain("widthMode === 'free' ? 'cursor-ew-resize' : 'cursor-default'");
    expect(pageSource).toContain('data-width-mode={widthMode}');
    expect(pageSource).toContain('data-outline-visible={showOutline}');
    expect(pageSource).toContain('自由调节原文宽度');

    expect(collectionSource).toContain('ReviewPreviewWidthModeTestPage');
    expect(collectionSource).toContain('/review-preview-width-mode-test');
    expect(collectionSource).toContain('审核润色预览宽度模式测试');
    expect(collectionSource).toContain('return <ReviewPreviewWidthModeTestPage />;');
  });
});
