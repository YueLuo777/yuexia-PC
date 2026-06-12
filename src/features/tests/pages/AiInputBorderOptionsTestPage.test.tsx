import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'AiInputBorderOptionsTestPage.tsx'), 'utf8')
);

const readTestCollectionSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TestCollectionPage.tsx'), 'utf8')
);

describe('AiInputBorderOptionsTestPage', () => {
  it('provides multiple non-bright-blue input border and linked data background options', () => {
    const source = readTestPageSource();

    expect(source).toContain('aiInputBorderVariants');
    expect((source.match(/id: '/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(source).toContain('已关联资料');
    expect(source).toContain('已关联：1865 字');
    expect(source).toContain('请输入要求');
    expect(source).toContain('请输入你的要求');
    expect(source).toContain('#D7DEE8');
    expect(source).toContain('#EAF8FB');
    expect(source).toContain('#ECFDF5');
    expect(source).toContain('#FFF7ED');
    expect(source).toContain('#F5F3FF');
  });

  it('is registered at the end of the AI test collection group', () => {
    const source = readTestCollectionSource();
    const settingColorIndex = source.indexOf("path: '/setting-navigation-color-options-test'");
    const aiInputIndex = source.indexOf("path: '/ai-input-border-options-test'");
    const toolGroupIndex = source.indexOf("title: '工具测试'");

    expect(source).toContain('AiInputBorderOptionsTestPage');
    expect(source).toContain("import('@/features/tests/pages/AiInputBorderOptionsTestPage')");
    expect(source).toContain("case '/ai-input-border-options-test':");
    expect(source).toContain('<AiInputBorderOptionsTestPage />');
    expect(aiInputIndex).toBeGreaterThan(settingColorIndex);
    expect(aiInputIndex).toBeLessThan(toolGroupIndex);
  });
});
