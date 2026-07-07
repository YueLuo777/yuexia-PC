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

    expect(app).toContain('GenreIterationPage');
    expect(app).toContain('path="/genre-iteration"');
    expect(nav).toContain("to: '/genre-iteration'");
    expect(nav).toContain("label: '题材迭代'");
    expect(page).toContain('GenreIterationWorkbench');
    expect(workbench).toContain('CombinedAiConfigSelect');
    expect(workbench).toContain('GENRE_ITERATION_PROMPT_CATEGORY');
    expect(workbench).toContain("type CenterTab = 'detail' | 'reader'");
    expect(workbench).toContain('ChapterNumberButton');
    expect(workbench).toContain('CHAPTER_NUMBER_GRID_STYLE');
    expect(workbench).toContain('搜索关键词、链接或书籍编号');
    expect(workbench).toContain('详情页');
    expect(workbench).toContain('在线阅读');
    expect(workbench).toContain('第一卷');
    expect(workbench).toContain('function bookMatchesQuery');
    expect(workbench).toContain('<BookCover book={book} compact />');
    expect(workbench).toContain('break-all text-lg');
    expect(workbench).toContain('开始下载');
    expect(workbench).toContain('生成迭代');
  });
});
