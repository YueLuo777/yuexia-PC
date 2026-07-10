import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('genre iteration page integration', () => {
  it('registers the genre iteration page in app routes and default navigation', () => {
    const app = readSource('src/app/App.tsx');
    const nav = readSource('src/shared/navigation/navConfig.ts');
    const page = readSource('src/features/genre-iteration/pages/GenreIterationPage.tsx');
    const workbench = readSource('src/features/genre-iteration/components/GenreIterationWorkbench.tsx');

    expect(app).toContainSource('GenreIterationPage');
    expect(app).toContainSource('path="/genre-iteration"');
    expect(nav).toContainSource("to: '/genre-iteration'");
    expect(nav).toContainSource("label: '题材迭代'");
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
