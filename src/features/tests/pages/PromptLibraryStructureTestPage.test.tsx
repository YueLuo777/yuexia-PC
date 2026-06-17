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

    expect(source).toContain('const promptLibraries');
    expect(source).toContain('const promptWorkflows');
    expect(source).toContain('提示词资料库结构测试');
    expect(source).toContain('00_核心设定');
    expect(source).toContain('01_人物列表库');
    expect(source).toContain('02_势力设定库');
    expect(source).toContain('03_地图库');
    expect(source).toContain('05_重要物品库');
    expect(source).toContain('07_伏笔库');
    expect(source).toContain('09_剧情摘要库');
    expect(source).toContain('创意白皮书.md');
    expect(source).toContain('写作风格指南.md');
    expect(source).toContain('整书大纲.md');
    expect(source).toContain('时间线发展记录.md');
    expect(source).toContain('审核规则.md');
    expect(source).toContain('人物档案');
    expect(source).toContain('状态更新记录');
    expect(source).toContain('伏笔总表.md');
    expect(source).toContain('一键生成细纲');
    expect(source).toContain('一键AI续写章节');
    expect(source).toContain('一键章节发布');
    expect(source).toContain('库里怎么写');
    expect(source).toContain('会被谁读取');
    expect(source).toContain('会被谁更新');
  });

  it('adds the prompt library structure prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('PromptLibraryStructureTestPage');
    expect(source).toContain('/prompt-library-structure-test');
    expect(source).toContain('提示词资料库结构测试');
    expect(source).toContain('整理旧提示词会创建的资料库、模板字段、读取链路和章节发布更新方式。');
  });
});
