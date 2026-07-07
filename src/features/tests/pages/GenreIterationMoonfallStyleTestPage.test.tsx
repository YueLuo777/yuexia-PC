import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('genre iteration moonfall style test page', () => {
  it('adds the moonfall-style genre iteration preview after the old tomato prototype', () => {
    const collection = readSource('src/features/tests/pages/TestCollectionPage.tsx');

    expect(collection).toContain('GenreIterationMoonfallStyleTestPage');
    expect(collection).toContain('/genre-iteration-moonfall-style-test');
    expect(collection).toContain('题材迭代月下风格预览');
    expect(collection.indexOf('/tomato-genre-iteration-test')).toBeLessThan(
      collection.indexOf('/genre-iteration-moonfall-style-test'),
    );
  });

  it('uses the project ticai folder, moonfall workspace styling, and the full feature flow', () => {
    const page = readSource('src/features/tests/pages/GenreIterationMoonfallStyleTestPage.tsx');
    const defaults = readSource('src/features/genre-iteration/model/genreIterationDefaults.ts');

    expect(defaults).toContain("GENRE_ITERATION_SAVE_DIRECTORY = 'E:\\\\0yuexia\\\\0,月下PC\\\\ticai'");
    expect(page).toContain('GENRE_ITERATION_SAVE_DIRECTORY');
    expect(page).toContain('writer-assistant-theme');
    expect(page).toContain('grid-cols-[300px_minmax(420px,1fr)_380px]');
    expect(page).toContain('bg-[#f5f5f7]');
    expect(page).toContain('xy-wa-primary');
    expect(page).toContain('功能保持和正式题材迭代一致，只调整为月下软件布局');
    expect(page).toContain("type PanelKey = 'search' | 'shelf' | 'history' | 'settings'");
    expect(page).toContain('开始下载');
    expect(page).toContain('加入书架');
    expect(page).toContain('生成迭代');
    expect(page).toContain('复制 ID');
    expect(page).toContain('清除缓存');
    expect(page).toContain('保存设置');
  });
});
