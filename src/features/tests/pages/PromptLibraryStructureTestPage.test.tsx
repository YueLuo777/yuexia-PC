import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/PromptLibraryStructureTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('PromptLibraryStructureTestPage', () => {
  it('organizes the old prompt folder into libraries, templates, and workflow links', async () => {
    const source = await readTestPageSource();

    expect(source).toContainSource('const promptLibraries');
    expect(source).toContainSource('const promptWorkflows');
    expect(source).toContainSource('所有提示词');
    expect(source).toContainSource('00_核心设定');
    expect(source).toContainSource('01_人物列表库');
    expect(source).toContainSource('02_势力设定库');
    expect(source).toContainSource('03_地图库');
    expect(source).toContainSource('05_重要物品库');
    expect(source).toContainSource('07_伏笔库');
    expect(source).toContainSource('09_剧情摘要库');
    expect(source).toContainSource('创意白皮书.md');
    expect(source).toContainSource('写作风格指南.md');
    expect(source).toContainSource('整书大纲.md');
    expect(source).toContainSource('时间线发展记录.md');
    expect(source).toContainSource('审核规则.md');
    expect(source).toContainSource('人物档案');
    expect(source).toContainSource('状态更新记录');
    expect(source).toContainSource('伏笔总表.md');
    expect(source).toContainSource('一键生成细纲');
    expect(source).toContainSource('一键AI续写章节');
    expect(source).toContainSource('一键章节发布');
    expect(source).toContainSource('库里怎么写');
    expect(source).toContainSource('会被谁读取');
    expect(source).toContainSource('会被谁更新');
  });

  it('adds the prompt library structure prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContainSource('PromptLibraryStructureTestPage');
    expect(source).toContainSource('/prompt-library-structure-test');
    expect(source).toContainSource('所有提示词');
    expect(source).toContainSource('整理旧提示词会创建的资料库、模板字段、读取链路和章节发布更新方式。');
  });
});
