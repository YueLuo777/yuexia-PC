import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/PromptWorkflowPreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('PromptWorkflowPreviewTestPage', () => {
  it('loads every prompt-folder file into a left directory and right preview test page', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('const promptDirectory');
    expect(source).toContain('左侧提示词目录');
    expect(source).toContain('右侧提示词预览');
    expect(source).toContain('新书流程');
    expect(source).toContain('已有小说导入流程');
    expect(source).toContain('可选补丁');
    expect(source).toContain('辅助模板');
    expect(source).toContain('辅助脚本');
    expect(source).toContain('SKILL.md');
    expect(source).toContain('创意白皮书模板.md');
    expect(source).toContain('白皮书示例.md');
    expect(source).toContain('全局创作规范.md');
    expect(source).toContain('防卡死补丁_文件写入规范v1.0.md');
    expect(source).toContain('升级补丁_自动审核系统v2.0.md');
    expect(source).toContain('多模型防漏修复补丁v3.0.md');
    expect(source).toContain('一键初始化摘要系统.md');
    expect(source).toContain('一键导入已有小说.md');
    expect(source).toContain('一键生成细纲.md');
    expect(source).toContain('一键AI续写章节_v4.0.md');
    expect(source).toContain('一键毒点检测修改.md');
    expect(source).toContain('一键去AI化.md');
    expect(source).toContain('humanize-text.md');
    expect(source).toContain('一键字数统计.md');
    expect(source).toContain('一键章节发布.md');
    expect(source).toContain('人物档案模板.md');
    expect(source).toContain('势力档案模板.md');
    expect(source).toContain('地点档案模板.md');
    expect(source).toContain('物品档案模板.md');
    expect(source).toContain('伏笔库模板.md');
    expect(source).toContain('摘要系统模板.md');
    expect(source).toContain('整书大纲模板.md');
    expect(source).toContain('写作风格指南模板.md');
    expect(source).toContain('clean_punctuation.py');
    expect(source).toContain('fix_workflow.py');
  });

  it('adds the prompt workflow preview to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('PromptWorkflowPreviewTestPage');
    expect(source).toContain('/prompt-workflow-preview-test');
    expect(source).toContain('提示词目录预览测试');
    expect(source).toContain('左侧按流程列出提示词文件，右侧预览选中的提示词原文。');
  });
});
