import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readTestPageSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterGroupColorOptionsTestPage.tsx'), 'utf8')
);

const readTestCollectionSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TestCollectionPage.tsx'), 'utf8')
);

describe('ChapterGroupColorOptionsTestPage', () => {
  it('provides multiple visually separated chapter group row options', () => {
    const source = readTestPageSource();

    expect(source).toContain('const options = [');
    expect((source.match(/id: '/g) ?? []).length).toBe(6);
    expect(source).toContain("id: 'soft-blue'");
    expect(source).toContain("id: 'quiet-slate'");
    expect(source).toContain("id: 'cyan-left'");
    expect(source).toContain("id: 'ink-band'");
    expect(source).toContain("id: 'green-paper'");
    expect(source).toContain("id: 'warm-outline'");
    expect(source).toContain('bg-[#eaf2ff]');
    expect(source).toContain('bg-[#eef3f8]');
    expect(source).toContain('bg-[#2f3c4f]');
    expect(source).toContain('第一卷');
    expect(source).toContain('第1章');
    expect(source).toContain('第2章');
  });

  it('is registered after the AI input options test entry', () => {
    const source = readTestCollectionSource();
    const aiInputIndex = source.indexOf("path: '/ai-input-border-options-test'");
    const chapterGroupIndex = source.indexOf("path: '/chapter-group-color-options-test'");
    const toolGroupIndex = source.indexOf("title: '工具测试'");

    expect(source).toContain('ChapterGroupColorOptionsTestPage');
    expect(source).toContain("import('@/features/tests/pages/ChapterGroupColorOptionsTestPage')");
    expect(source).toContain("case '/chapter-group-color-options-test':");
    expect(source).toContain('<ChapterGroupColorOptionsTestPage />');
    expect(chapterGroupIndex).toBeGreaterThan(aiInputIndex);
    expect(chapterGroupIndex).toBeLessThan(toolGroupIndex);
  });
});
