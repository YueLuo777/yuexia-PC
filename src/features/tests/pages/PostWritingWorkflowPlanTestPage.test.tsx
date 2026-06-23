import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/PostWritingWorkflowPlanTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('PostWritingWorkflowPlanTestPage', () => {
  it('documents the post-writing workflow for review, polish, status, and summary', async () => {
    const source = await readTestPageSource();

    expect(source).toContain("type PostProcessId = 'audit' | 'comment' | 'polish' | 'status' | 'summary'");
    expect(source).toContain('正文后处理流程方案');
    expect(source).toContain('审核');
    expect(source).toContain('点评');
    expect(source).toContain('润色');
    expect(source).toContain('状态');
    expect(source).toContain('梗概');
    expect(source).toContain('输入内容');
    expect(source).toContain('AI输出');
    expect(source).toContain('确认方式');
    expect(source).toContain('写回位置');
    expect(source).toContain('写完正文');
    expect(source).toContain('发布章节');
  });

  it('adds the workflow plan page to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('PostWritingWorkflowPlanTestPage');
    expect(source).toContain('/post-writing-workflow-plan-test');
    expect(source).toContain('正文后处理流程方案测试');
    expect(source).toContain('测试审核、点评、润色、状态和梗概合并成一套章节后处理流程后的布局、操作顺序和写回规则。');
  });
});
