import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('tomato genre iteration test page', () => {
  it('adds the tomato genre iteration prototype to the test collection tools group', () => {
    const collection = readSource('src/features/tests/pages/TestCollectionPage.tsx');

    expect(collection).toContain('TomatoGenreIterationTestPage');
    expect(collection).toContain('/tomato-genre-iteration-test');
    expect(collection).toContain('番茄题材迭代原型');
    expect(collection.indexOf('/test-browser')).toBeLessThan(collection.indexOf('/tomato-genre-iteration-test'));
  });

  it('lays out a three-column browser-driven topic iteration workflow without crawling full text', () => {
    const page = readSource('src/features/tests/pages/TomatoGenreIterationTestPage.tsx');

    expect(page).toContain("grid-cols-[220px_minmax(560px,1fr)_420px]");
    expect(page).toContain('题材迭代');
    expect(page).toContain('番茄排行榜');
    expect(page).toContain('TOMATO_DEFAULT_URL = \'https://fanqienovel.com/rank\'');
    expect(page).toContain('React.createElement(\'webview\'');
    expect(page).toContain('CombinedAiConfigSelect');
    expect(page).toContain('captureBrowserToInput');
    expect(page).toContain('view.capturePage()');
    expect(page).toContain('截图到输入框');
    expect(page).toContain('当前小说信息');
    expect(page).toContain('题材迁移');
    expect(page).toContain('题材迭代结果会显示在这里。');
    expect(page).toContain('这个原型只读取当前页面可见信息，不自动抓全文');
  });
});
