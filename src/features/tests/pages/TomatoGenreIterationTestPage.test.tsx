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

  it('lays out a browser-driven topic iteration workflow without crawling full text', () => {
    const page = readSource('src/features/tests/pages/TomatoGenreIterationTestPage.tsx');

    expect(page).toContain('题材迭代 · 番茄榜单原型');
    expect(page).toContain('TOMATO_DEFAULT_URL = \'https://fanqienovel.com/rank\'');
    expect(page).toContain('React.createElement(\'webview\'');
    expect(page).toContain('读取当前小说');
    expect(page).toContain('开始题材迭代');
    expect(page).toContain('只读取当前详情页可见信息，不自动抓全文');
    expect(page).toContain('目标题材');
    expect(page).toContain('AI 题材迭代结果');
    expect(page).toContain('规避相似桥段');
  });
});
