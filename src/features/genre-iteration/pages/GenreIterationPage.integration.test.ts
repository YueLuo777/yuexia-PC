import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('genre iteration page integration', () => {
  it('registers the genre iteration page inside the test collection instead of formal navigation', () => {
    const app = readSource('src/app/App.tsx');
    const nav = readSource('src/shared/navigation/navConfig.ts');
    const testCollection = readSource('src/features/tests/pages/TestCollectionPage.tsx');
    const page = readSource('src/features/genre-iteration/pages/GenreIterationPage.tsx');
    const workbench = [
      readSource('src/features/genre-iteration/components/GenreIterationWorkbench.tsx'),
      readSource('src/features/genre-iteration/components/genreIterationParts.tsx'),
    ].join('\n');

    expect(app).not.toContainSource('GenreIterationPage');
    expect(app).not.toContainSource('path="/genre-iteration"');
    expect(nav).not.toContainSource("to: '/genre-iteration'");
    expect(testCollection).toContainSource('GenreIterationPage');
    expect(testCollection).toContainSource("path: '/genre-iteration-test'");
    expect(testCollection).toContainSource("title: '题材迭代'");
    expect(testCollection).toContainSource("case '/genre-iteration-test':");
    expect(page).toContainSource('GenreIterationWorkbench');
    expect(workbench).toContainSource('CombinedAiConfigSelect');
    expect(workbench).toContainSource('GENRE_ITERATION_PROMPT_CATEGORY');
    expect(workbench).toContainSource("type CenterTab = 'detail' | 'reader'");
    expect(workbench).toContainSource('ChapterNumberButton');
    expect(workbench).toContainSource('CHAPTER_NUMBER_GRID_STYLE');
    expect(workbench).toContainSource('搜索关键词、链接或书籍编号');
    expect(workbench).toContainSource('详情页');
    expect(workbench).toContainSource('在线阅读');
    expect(workbench).toContainSource('第一卷');
    expect(workbench).toContainSource('function bookMatchesQuery');
    expect(workbench).toContainSource('<BookCover book={book} compact />');
    expect(workbench).toContainSource('break-all text-lg');
    expect(workbench).toContainSource('开始下载');
    expect(workbench).toContainSource('生成迭代');
  });
});
