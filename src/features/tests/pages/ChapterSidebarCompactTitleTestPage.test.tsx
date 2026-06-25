import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/ChapterSidebarCompactTitleTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('ChapterSidebarCompactTitleTestPage', () => {
  it('shows the current and compact chapter title positions side by side', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('正文目录左移测试');
    expect(source).toContain('当前留白版');
    expect(source).toContain('左移优化版');
    expect(source).toContain("px-[24px] py-1");
    expect(source).toContain("py-1 pl-1 pr-1");
    expect(source).toContain('第{chapter.id}章 {chapter.title}');
  });

  it('keeps the compact preview word count pinned to the right edge', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('grid-cols-[minmax(0,1fr)_4ch]');
    expect(source).toContain('justify-self-end');
    expect(source).toContain('tabular-nums');
    expect(source).toContain('pl-1 pr-1');
  });

  it('adds the compact chapter title test page to the test collection', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('ChapterSidebarCompactTitleTestPage');
    expect(source).toContain('/chapter-sidebar-compact-title-test');
    expect(source).toContain('正文目录左移测试');
  });
});
